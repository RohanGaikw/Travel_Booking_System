import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "https://travel-booking-system-puce.vercel.app/graphql",
  cache: new InMemoryCache(),
});

export default client;
