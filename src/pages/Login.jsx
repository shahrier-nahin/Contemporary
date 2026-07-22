import { useState } from "react";
import { login } from "../services/api";

export default function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(e) {

    e.preventDefault();

    setError("");

    try {

      setLoading(true);

      const data = await login(
        email,
        password
      );

      // Save login status
      localStorage.setItem("loggedIn", "true");

      // Optional: save user email
      localStorage.setItem("userEmail", data.email);

      onLogin(data);

    }

    catch (err) {

      setError(err.message);

    }

    finally {

      setLoading(false);

    }

  }

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5"
      }}
    >

      <form
        onSubmit={handleLogin}
        style={{
          width: 380,
          background: "#fff",
          padding: 35,
          borderRadius: 14,
          boxShadow: "0 15px 40px rgba(0,0,0,.12)"
        }}
      >

        <h1
          style={{
            marginBottom: 8,
            textAlign: "center"
          }}
        >
          Contemporary Temp
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: 30
          }}
        >
          Login to continue
        </p>

        <label>Email</label>

        <input

          type="email"

          value={email}

          onChange={(e) =>
            setEmail(e.target.value)
          }

          required

          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 18,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}

        />

        <label>Password</label>

        <input

          type="password"

          value={password}

          onChange={(e) =>
            setPassword(e.target.value)
          }

          required

          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 18,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}

        />

        {

          error && (

            <div
              style={{
                color: "red",
                marginBottom: 15,
                textAlign: "center"
              }}
            >

              {error}

            </div>

          )

        }

        <button

          disabled={loading}

          style={{
            width: "100%",
            padding: 13,
            border: "none",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer"
          }}

        >

          {

            loading

              ? "Logging in..."

              : "Login"

          }

        </button>

      </form>

    </div>

  );

}