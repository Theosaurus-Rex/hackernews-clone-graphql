import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { setContext } from "@apollo/client/link/context";
import { AUTH_TOKEN } from "./constants";
import { split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Import deps needed to wire up apollo client
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

// Connects ApolloClient instance with the GraphQL API
const httpLink = createHttpLink({
  uri: "http://localhost:4000",
});

// Middleware that allows us to modify requests before they are sent to the server
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    },
  },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authLink.concat(httpLink)
);

// Instantiate ApolloClient
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// Render app wrapped in ApolloProvider component, which gets passed the client as a prop
ReactDOM.render(
  // Wrap everything in the router to allow navigation
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
