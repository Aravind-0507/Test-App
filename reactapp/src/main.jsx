import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="74157164421-1rmo5489gh8dii74j11q5jec1jtdbtl1.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);