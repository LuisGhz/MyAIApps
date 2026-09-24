export const environment = {
  apiUrl: 'http://localhost:3000/api',
  auth0: {
    domain: import.meta.env['NG_APP_AUTH0_DOMAIN'] as string,
    clientId: import.meta.env['NG_APP_AUTH0_CLIENT_ID'] as string,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env['NG_APP_AUTH0_AUDIENCE'] as string,
    },
  },
};
