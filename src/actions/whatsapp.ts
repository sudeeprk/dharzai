"use server";

const waApiBaseUrl = "https://api.thinkroman.com/v1/templates";

const token = process.env.WA_KEY;

export async function sendAccountCreationNotification(
  userPhoNumber: string,
  userName: string,
  email: string
) {
  const url = `${waApiBaseUrl}/whatsapp.dharz_ai_account_created_notification`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    to: userPhoNumber,
    lang: "en_US",
    userName,
    email,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (response.ok) {
      console.log("Request sent successfully:", await response.json());
    } else {
      console.error("Failed to send request:", response);
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
}
