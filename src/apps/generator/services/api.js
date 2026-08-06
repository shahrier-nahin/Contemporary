import { API_URL as BASE_URL } from "../../../services/apiConfig";

export async function getCardHistory() {

const response = await fetch(
  `${BASE_URL}/card-history?appType=generator`
);

  const data = await response.json();

  if (!response.ok) {

    throw new Error("Failed to load history");

  }

  return data;

}


export async function login(email, password) {

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function generateCard(articleUrl) {
  const response = await fetch(`${BASE_URL}/generate-card`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      articleUrl
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Backend error");
  }

  return data;
}

export async function saveCardHistory(payload) {
  const response = await fetch(`${BASE_URL}/save-card-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, appType: "generator" }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save card");
  }

  return data;
}

export async function getRemaining() {

const response = await fetch(`${BASE_URL}/remaining?appType=generator`);

  const data = await response.json();

  if (!response.ok) {

    throw new Error("Failed to load remaining count");

  }

  return data;

}

export async function postToFacebook(formData) {

  console.log(formData);
  console.log(formData instanceof FormData);

  const response = await fetch(`${BASE_URL}/post-facebook`, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();

  console.log(text);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text);
  }
}
