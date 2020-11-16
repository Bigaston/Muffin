import React from "react";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://feeds.podcloud.fr/graphql",
  cache: new InMemoryCache(),
});

const PodcloudProvider = ({ guid, children }) => {
  console.log("Rendering provider");
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default PodcloudProvider;
