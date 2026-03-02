import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_MAGENTO_URL || '/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
});

// Dynamic Admin Token Management
let currentAdminToken = null;
let tokenExpirationTime = 0;

export const fetchAdminToken = async () => {
  // Check if we have a valid cached token
  if (currentAdminToken && Date.now() < tokenExpirationTime) {
    return currentAdminToken;
  }

  const username = import.meta.env.VITE_MAGENTO_ADMIN_USER;
  const password = import.meta.env.VITE_MAGENTO_ADMIN_PASS;

  if (!username || !password) {
    console.error("[TokenFetcher] Missing admin credentials in .env");
    return null;
  }

  try {
    console.log("[TokenFetcher] Requesting new Admin Session Token...");
    const response = await fetch('/magento-api/rest/V1/integration/admin/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      console.error(`[TokenFetcher] Failed to fetch token. Status: ${response.status}`);
      return null;
    }

    const token = await response.json();

    // Magento tokens usually expire in 4 hours. We'll cache for 3.5 hours to be safe.
    currentAdminToken = token;
    tokenExpirationTime = Date.now() + (3.5 * 60 * 60 * 1000);

    console.log("[TokenFetcher] New token successfully retrieved and cached.");
    return token;

  } catch (error) {
    console.error("[TokenFetcher] Network error fetching token:", error);
    return null;
  }
};

export const getAdminHeaders = async () => {
  const token = await fetchAdminToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export default client;
