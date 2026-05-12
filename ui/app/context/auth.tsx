import { createContext, useContext, useState } from "react";

interface AuthContextValue {
  username: string;
  setUsername: (username: string) => void;
  ssoResponse: Record<string, unknown> | null;
  setSsoResponse: (response: Record<string, unknown> | null) => void;
  loginToken: string | null;
  setLoginToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("username") ?? "") : ""
  );

  const [ssoResponse, setSsoResponseState] = useState<Record<string, unknown> | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("sso_response");
    return stored ? (JSON.parse(stored) as Record<string, unknown>) : null;
  });

  const [loginToken, setLoginTokenState] = useState<string | null>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("login_token") ?? null) : null
  );

  function persistUsername(value: string) {
    if (value) {
      localStorage.setItem("username", value);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("sso_response");
      localStorage.removeItem("login_token");
      setSsoResponseState(null);
      setLoginTokenState(null);
    }
    setUsername(value);
  }

  function persistSsoResponse(response: Record<string, unknown> | null) {
    if (response) {
      localStorage.setItem("sso_response", JSON.stringify(response));
    } else {
      localStorage.removeItem("sso_response");
    }
    setSsoResponseState(response);
  }

  function persistLoginToken(token: string | null) {
    if (token) {
      localStorage.setItem("login_token", token);
    } else {
      localStorage.removeItem("login_token");
    }
    setLoginTokenState(token);
  }

  return (
    <AuthContext.Provider value={{
      username, setUsername: persistUsername,
      ssoResponse, setSsoResponse: persistSsoResponse,
      loginToken, setLoginToken: persistLoginToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
