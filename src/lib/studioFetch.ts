import { auth } from "./firebaseClient";

/**
 * Authed fetch helper. Retrieves the current logged-in Firebase user's ID Token,
 * appends it as an Authorization Bearer header, and performs the request.
 */
export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = "";
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken(true);
    } catch (err) {
      console.error("Failed to retrieve Firebase ID Token:", err);
    }
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Set JSON content-type automatically unless body is FormData (e.g. file upload callbacks)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
