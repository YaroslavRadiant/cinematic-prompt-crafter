import { useEffect, useState, createContext, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

function getOutseta() {
  if (window["Outseta"]) {
    return window["Outseta"];
  } else {
    throw new Error("Outseta is missing, have you added the script to head?");
  }
}

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState("init");
  const [user, setUser] = useState();

  const outsetaRef = useRef(getOutseta());

  useEffect(() => {
    handleOutsetaUserEvents(updateUser);

    const accessToken = searchParams.get("access_token");

    if (accessToken) {
      outsetaRef.current.setAccessToken(accessToken);
      setSearchParams({});
    }

    if (outsetaRef.current.getAccessToken()) {
      updateUser();
    } else {
      setStatus("ready");
    }

    return () => {
      // Clean up user related event subscriptions
      handleOutsetaUserEvents(() => {});
    };
  }, [searchParams, setSearchParams]);

  const updateUser = async () => {
    const outsetaUser = await outsetaRef.current.getUser();
    setUser(outsetaUser);
    setStatus("ready");
    if (!user) {
      navigate("/?tab=home");
    }
  };

  const handleOutsetaUserEvents = (onEvent) => {
    // Subscribe to user related events
    // with onEvent function
    const outseta = outsetaRef.current;
    outseta.on("subscription.update", onEvent);
    outseta.on("profile.update", onEvent);
    outseta.on("account.update", onEvent);
  };

  const logout = () => {
    // Unset access token
    outsetaRef.current.setAccessToken("");
    // and remove user state
    setUser(null);
  };

  const openLogin = (options) => {
    outsetaRef.current.auth.open({
      widgetMode: "login|register",
      authenticationCallbackUrl: window.location.href,
      ...options,
    });
  };

  const openSignup = (options) => {
    outsetaRef.current.auth.open({
      widgetMode: "register",
      authenticationCallbackUrl: window.location.href,
      ...options,
    });
  };

  const openProfile = (options) => {
    outsetaRef.current.profile.open({ tab: "profile", ...options });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status !== "ready",
        logout,
        openLogin,
        openSignup,
        openProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
