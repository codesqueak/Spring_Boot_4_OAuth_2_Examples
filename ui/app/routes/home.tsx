import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import type { Route } from "./+types/home";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ModeToggle from "../components/ModeToggle";
import { useColorScheme } from "@mui/material/styles";

const PANUSER_API_URL = import.meta.env.VITE_PANUSER_API_URL ?? "http://localhost:9095";
const PANUSER_CLIENT_ID = import.meta.env.VITE_PANUSER_CLIENT_ID ?? "pan-client";

function parseJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}


function base64urlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function buildSsoUrl(): Promise<string> {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const codeVerifier = base64urlEncode(verifierBytes);

  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);
  const state = base64urlEncode(stateBytes);

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  const codeChallenge = base64urlEncode(new Uint8Array(digest));

  sessionStorage.setItem("oauth_code_verifier", codeVerifier);
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: "pan-client",
    redirect_uri: `${window.location.origin}/callback`,
    scope: "openid",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `http://localhost:9095/oauth2/authorize?${params}`;
}


const MIN_LENGTH = 5;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername, setLoginToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, password: false });

  const { mode } = useColorScheme();
  const [loginError, setLoginError] = useState<string | null>(null);

  const usernameError = touched.username && username.length < MIN_LENGTH;
  const passwordError = touched.password && password.length < MIN_LENGTH;
  const helperText = `Must be at least ${MIN_LENGTH} characters`;

  async function handleSsoLogin() {
    window.location.href = await buildSsoUrl();
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (username.length < MIN_LENGTH || password.length < MIN_LENGTH) return;

    setLoginError(null);
    try {
      const response = await fetch(`${PANUSER_API_URL}/user/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": crypto.randomUUID(),
        },
        body: JSON.stringify({ username, password, client_id: PANUSER_CLIENT_ID }),
      });

      if (response.status === 401) {
        setLoginError("Invalid username or password.");
        return;
      }
      if (!response.ok) {
        setLoginError(`Login failed: ${response.status} ${response.statusText}`);
        return;
      }

      const token = (await response.text()).trim();
      const payload = parseJwtPayload(token);
      const sub = typeof payload.sub === "string" ? payload.sub : username;
      setGlobalUsername(sub);
      setLoginToken(token);
      navigate("/landing");
    } catch {
      setLoginError("Unable to reach the login service. Please try again.");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          borderRadius: 4,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={500}>
            Sign In
          </Typography>
          <ModeToggle />
        </Box>

        {loginError && <Alert severity="error">{loginError}</Alert>}

        <Box component="form" display="flex" flexDirection="column" gap={2.5} onSubmit={handleSubmit}>
          <TextField
            id="username"
            name="username"
            label="Username"
            type="text"
            autoComplete="username"
            required
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            error={usernameError}
            helperText={usernameError ? helperText : " "}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordError}
            helperText={passwordError ? helperText : " "}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 1, borderRadius: 3 }}
          >
            Sign In
          </Button>
        </Box>

        <Divider>
          <Typography variant="caption" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          sx={{ borderRadius: 3 }}
          onClick={handleSsoLogin}
        >
          Sign in with SSO
        </Button>
      </Paper>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 3, textAlign: "center", fontStyle: "italic" }}
      >
        {mode === "light" ? "Things remembered in immortal minds ..." : "You think you have private lives, think nothing of the kind..."}
      </Typography>
    </Box>
  );
}