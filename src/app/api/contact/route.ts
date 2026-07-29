import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { name, email, message, captchaToken } = await request.json();

    // 1. Basic validation
    if (!name || !email || !message || !captchaToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Fetch reCAPTCHA secret key from environment
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is missing from environment variables");
      return NextResponse.json(
        { error: "reCAPTCHA server configuration error" },
        { status: 500 }
      );
    }

    // 3. Verify the token with Google reCAPTCHA API
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

    // 4. Handle verification failure
    if (!verificationResult.success) {
      console.error("reCAPTCHA verification failed. Result from Google:", verificationResult);
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }

    // 5. Successful verification
    // Note: EmailJS is not yet integrated in the project backend. Returning { ok: true } as per specification.
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error verifying reCAPTCHA:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
