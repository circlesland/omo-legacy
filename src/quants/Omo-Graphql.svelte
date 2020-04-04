<script>
  import ApolloClient from "apollo-boost";
  import { setClient } from "svelte-apollo";
  import OmoQuery from "./Omo-Query.svelte";

  const client = new ApolloClient({
    uri: "http://localhost:4000/",

    onError: ({ networkError, graphQLErrors }) => {
      console.log("graphQLErrors", graphQLErrors);
      console.log("networkError", networkError);
    }
  });
  setClient(client);
</script>

<div class="flex w-full h-full">
  <div class="w-1/2">
    <div class="w-full h-full">
      <OmoQuery />
    </div>
  </div>
  <iframe src="http://localhost:4000" class="h-full w-1/2" title="graphql ui" />
</div>
