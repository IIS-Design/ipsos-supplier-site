export async function saveContactsRequest<T>(
  url: string,
  body: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Unable to connect to the service. Your changes have not been saved. Please try again.",
    );
  }
  let payload: { message?: string };
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      "The service returned an unexpected response. Your changes are still available; please try again.",
    );
  }
  if (!response.ok)
    throw new Error(
      payload.message ?? "Contacts could not be saved. Please try again.",
    );
  return payload as T;
}
