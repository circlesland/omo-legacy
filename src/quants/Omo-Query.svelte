<script>
  import { getClient, query, mutate } from "svelte-apollo";
  import { gql } from "apollo-boost";

  const getFeed = gql`
    {
      feed {
        id
        title
        content
        published
        author {
          id
          name
          email
        }
      }
    }
  `;
  const client = getClient();
  const feedOp = query(client, { query: getFeed });
</script>

<div style="text-align:center">
  {#await $feedOp}

    <p>.. loading</p>

  {:then result}
    {#each result.data['feed'] as feed (feed.id)}
      <div class="primary omo-border overflow-hidden omo-shadow">
        <p>{feed.title}</p>
        <p>{feed.content}</p>
        <p>published: {feed.published}</p>
        <p>author name: {feed.author.name}</p>
        <p>author mail: {feed.author.email}</p>
      </div>
    {/each}
  {:catch e}
    {e}
  {/await}
</div>
