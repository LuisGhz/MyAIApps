import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export const useAppAuth0 = () => {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const getToken = useCallback(async () => {
    return await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  }, [getAccessTokenSilently]);

  const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  return {
    isLoading,
    isAuthenticated,
    error,
    login,
    user,
    getToken,
    logout,
  };
};
