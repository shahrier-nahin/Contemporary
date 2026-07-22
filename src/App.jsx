import { useEffect, useState } from "react";
import { getRemaining } from "./services/api";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Login from "./pages/Login";

import "./index.css";

export default function App() {

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  const [state, setState] = useState({

    // Template
    template: "contemporary",

    // Article
    articleUrl: "",

    // AI Content
    headline: "আপনার শিরোনাম এখানে আসবে",
    summary: "",
    hashtags: "",

    // Highlight
    highlightWord: "",
    highlightColor: "#E63946",

    // Card Info
    subcategory: "ফিফা বিশ্বকাপ",
    source: "The Contemporary",

    date: new Date().toLocaleDateString("bn-BD"),

    remaining: 14,

    // Background Images
    background: null,
    articleBackground: null,

    // Background Controls
    backgroundOpacity: 0.95,
    backgroundBrightness: 1.15,
    backgroundBlur: 0,
    backgroundPosition: "center",

    // Daily Limit
    dailyLimit: 14,
    

  });

  useEffect(() => {

  async function loadRemaining() {

    try {

      const data = await getRemaining();

      setState(prev => ({

        ...prev,

        remaining: data.remaining

      }));

    }

    catch (err) {

      console.error(
        "Failed to load remaining:",
        err
      );

    }

  }

  if (loggedIn) {

    loadRemaining();

  }

}, [loggedIn]);

function handleLogin(loginData) {

  setState(prev => ({
    ...prev,
    remaining: loginData.remaining
  }));

  setLoggedIn(true);

}

function handleLogout() {

  localStorage.clear();

  setLoggedIn(false);

}

  if (!loggedIn) {

    return (

      <Login
        onLogin={handleLogin}
      />

    );

  }

  return (

    <div className="app-container">

      <Editor
        state={state}
        setState={setState}
        onLogout={handleLogout}
      />

      <Preview
        state={state}
      />

    </div>

  );

}