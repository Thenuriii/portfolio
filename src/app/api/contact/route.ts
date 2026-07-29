import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { name, email, subject, message, captchaToken } = await request.json();

    let secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
    if (secretKey.startsWith('"') && secretKey.endsWith('"')) {
      secretKey = secretKey.slice(1, -1);
    }
    secretKey = secretKey.trim();

    // 1. Basic validation
    if (!name || !email || !message || (secretKey && !captchaToken)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Verify reCAPTCHA token if secret key is present
    if (secretKey) {
      const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
      const verificationResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: captchaToken,
        }).toString(),
      });

      if (!verificationResponse.ok) {
        return NextResponse.json(
          { error: "Failed to communicate with reCAPTCHA verification service" },
          { status: 502 }
        );
      }

      const verificationResult = await verificationResponse.json();

      if (!verificationResult.success) {
        console.error("reCAPTCHA verification failed. Result from Google:", verificationResult);
        return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 }
        );
      }
    } else {
      console.warn("RECAPTCHA_SECRET_KEY is missing. Bypassing server-side reCAPTCHA check.");
    }

    // 5. Save submission to database
    const subjectVal = subject || "General Inquiry";
    await sql`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES (${name}, ${email}, ${subjectVal}, ${message}, NOW())
    `;

    // 6. Successful verification and save
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in contact form submission:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
