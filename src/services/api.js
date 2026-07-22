const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : import.meta.env.VITE_API_URL;

    console.log("MODE:", import.meta.env.MODE);
console.log("BASE_URL:", BASE_URL);

export async function getCardHistory() {

const response = await fetch(
  `${BASE_URL}/card-history`
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

export async function generateCard(articleUrl, panel) {
  const response = await fetch(`${BASE_URL}/generate-card`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      articleUrl,
      panel,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Backend error");
  }

  return data;
}

export async function getRemaining() {

const response = await fetch(
  `${BASE_URL}/remaining`
);

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