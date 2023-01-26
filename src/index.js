import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";

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

// Instantiate ApolloClient
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Render app wrapped in ApolloProvider component, which gets passed the client as a prop
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
