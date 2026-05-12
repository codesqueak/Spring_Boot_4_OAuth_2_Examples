import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth";

function parseJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

interface ExchangeResult {
  username: string;
  tokens: Record<string, unknown>;
}

async function exchangeCode(): Promise<ExchangeResult> {
  console.log("[callback] href:", window.location.href);
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const oauthError = params.get("error");
  const oauthErrorDesc = params.get("error_description");
  if (oauthError) throw new Error(`OAuth error: ${oauthError} — ${oauthErrorDesc ?? ""}`);
  console.log("[callback] code:", code, "state:", state);

  const storedState = sessionStorage.getItem("oauth_state");
  const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_code_verifier");

  if (!code) throw new Error("Missing authorization code.");
  if (!state || state !== storedState) throw new Error("State mismatch — possible CSRF attack.");
  if (!codeVerifier) throw new Error("Missing code verifier.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${window.location.origin}/callback`,
    client_id: "pan-client",
    code_verifier: codeVerifier,
  });

  const response = await fetch("http://localhost:9095/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa("pan-client:secret")}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }

  const tokens = await response.json() as Record<string, unknown>;
  const payload = parseJwtPayload(tokens.access_token as string);
  const username = typeof payload.sub === "string" ? payload.sub : "";
  return { username, tokens };
}

const centeredStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Callback() {
  const [error, setError] = useState<string | null>(null);
  const { setUsername, setSsoResponse } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    exchangeCode()
      .then(({ username, tokens }) => {
        setUsername(username);
        setSsoResponse(tokens);
        navigate("/landing", { replace: true });
      })
      .catch((err) => setError(String(err)));
  }, []);

  if (error) {
    return (
      <div style={centeredStyle}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return <div style={centeredStyle} />;
}
