import { useAppAuth0 } from "@core/hooks/useAppAuth0";
import { apiClient } from "./api-client";

/**
 * Hook to initialize API client with Auth0 token getter
 * Should be called once at the app root level
 */
export const useApiAuth = () => {
  const { getToken, isAuthenticated } = useAppAuth0();

  if (isAuthenticated) {
    // Set the token getter function in the API client synchronously during render
    // to ensure it's available before any child components mount and attempt requests
    apiClient.setTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error("Failed to get token from Auth0:", error);
        return null;
      }
    });
  }

  return { isReady: isAuthenticated };
};
