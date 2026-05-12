import { useEffect, version as reactVersion } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAuth } from "../context/auth";
import NavBar from "../components/NavBar";

function parseJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

function TokenBlock({ label, content }: { label: string; content: string }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{label}</Typography>
      <Box
        component="pre"
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: "action.hover",
          fontFamily: "monospace",
          fontSize: "0.75rem",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {content}
      </Box>
    </Box>
  );
}

export default function Landing() {
  const { username, ssoResponse, loginToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  let loginPayload: Record<string, unknown> | null = null;
  try {
    loginPayload = loginToken ? parseJwtPayload(loginToken) : null;
  } catch {
    // stored token is malformed — ignore
  }

  let ssoAccessTokenPayload: Record<string, unknown> | null = null;
  try {
    const accessToken = ssoResponse?.access_token;
    ssoAccessTokenPayload = typeof accessToken === "string" ? parseJwtPayload(accessToken) : null;
  } catch {
    // access token is malformed — ignore
  }

  return (
    <Box sx={{ display: "flex" }}>
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="body1" sx={{ mb: 4, fontSize: "2rem" }}>Welcome</Typography>
        <Typography variant="body2">Username: {username}</Typography>
        <Typography variant="body2">Locale: {navigator.language}</Typography>
        <Typography variant="body2">React version: {reactVersion}</Typography>
        {loginToken && (
          <TokenBlock
            label="Login Token Response (raw):"
            content={loginToken}
          />
        )}
        {loginPayload && (
          <TokenBlock
            label="Login Token Response (decoded):"
            content={JSON.stringify(loginPayload, null, 2)}
          />
        )}
        {ssoResponse && (
          <TokenBlock
            label="SSO Token Response:"
            content={JSON.stringify(ssoResponse, null, 2)}
          />
        )}
        {ssoAccessTokenPayload && (
          <TokenBlock
            label="SSO Access Token (decoded):"
            content={JSON.stringify(ssoAccessTokenPayload, null, 2)}
          />
        )}
      </Box>
    </Box>
  );
}
