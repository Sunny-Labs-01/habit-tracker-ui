"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Keycloak from "keycloak-js";

// Keycloak Configuration
const KEYCLOAK_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://kc.lab.ishtiaquezafar.com";
const KEYCLOAK_REALM = "habit-tracker";
const KEYCLOAK_CLIENT_ID = "habit-tracker-ui";

type KeycloakContextType = {
  keycloak: Keycloak | null;
  authenticated: boolean;
  token: string | undefined;
  loading: boolean;
  error: string | undefined;
  login: () => void;
  logout: () => void;
  register: () => void;
  userInfo: UserInfo | null;
};

type UserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
};

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  authenticated: false,
  token: undefined,
  loading: true,
  error: undefined,
  login: () => {},
  logout: () => {},
  register: () => {},
  userInfo: null,
});

// Token refresh interval (refresh 60 seconds before expiry)
const TOKEN_MIN_VALIDITY_SECONDS = 60;
const TOKEN_REFRESH_INTERVAL_MS = 30000; // Check every 30 seconds

export function KeycloakProvider({ children }: PropsWithChildren) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Refresh token function
  const refreshToken = useCallback(async (kc: Keycloak) => {
    try {
      const refreshed = await kc.updateToken(TOKEN_MIN_VALIDITY_SECONDS);
      if (refreshed) {
        setToken(kc.token);
        console.log("Token refreshed successfully");
      }
    } catch (err) {
      console.error("Failed to refresh token:", err);
      // Token refresh failed, user needs to re-authenticate
      setAuthenticated(false);
      setToken(undefined);
      setUserInfo(null);
      kc.login();
    }
  }, []);

  // Initialize Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const kc = new Keycloak({
          url: KEYCLOAK_URL,
          realm: KEYCLOAK_REALM,
          clientId: KEYCLOAK_CLIENT_ID,
        });

        // Initialize with PKCE (S256) flow
        const auth = await kc.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
          checkLoginIframe: false,
          silentCheckSsoRedirectUri:
            typeof window !== "undefined"
              ? `${window.location.origin}/silent-check-sso.html`
              : undefined,
        });

        setKeycloak(kc);
        setAuthenticated(auth);

        if (auth && kc.token) {
          setToken(kc.token);
          // Load user info
          try {
            const info = await kc.loadUserInfo();
            setUserInfo(info as UserInfo);
          } catch (infoErr) {
            console.error("Failed to load user info:", infoErr);
          }
        }

        // Set up token refresh interval
        const refreshInterval = setInterval(() => {
          if (kc.authenticated) {
            refreshToken(kc);
          }
        }, TOKEN_REFRESH_INTERVAL_MS);

        // Set up token expiry handler
        kc.onTokenExpired = () => {
          console.log("Token expired, refreshing...");
          refreshToken(kc);
        };

        // Set up auth state handlers
        kc.onAuthSuccess = () => {
          setAuthenticated(true);
          setToken(kc.token);
        };

        kc.onAuthError = () => {
          setAuthenticated(false);
          setToken(undefined);
          setError("Authentication failed");
        };

        kc.onAuthLogout = () => {
          setAuthenticated(false);
          setToken(undefined);
          setUserInfo(null);
        };

        setLoading(false);

        // Cleanup on unmount
        return () => {
          clearInterval(refreshInterval);
        };
      } catch (err) {
        console.error("Keycloak initialization failed:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize Keycloak"
        );
        setLoading(false);
      }
    };

    initKeycloak();
  }, [refreshToken]);

  // Login function
  const login = useCallback(() => {
    if (keycloak) {
      keycloak.login();
    }
  }, [keycloak]);

  // Logout function
  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: typeof window !== "undefined" ? window.location.origin : undefined,
      });
    }
  }, [keycloak]);

  // Register function (for self-registration)
  const register = useCallback(() => {
    if (keycloak) {
      keycloak.register();
    }
  }, [keycloak]);

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        authenticated,
        token,
        loading,
        error,
        login,
        logout,
        register,
        userInfo,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  return useContext(KeycloakContext);
}
