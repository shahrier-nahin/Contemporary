const DEFAULT_API_URL = "http://localhost:3000";

// Both apps use the same backend after the service merge.
export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(
  /\/$/,
  ""
);
