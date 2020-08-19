<script context="module" lang="ts">
  import ApolloClient, { gql } from "apollo-boost";
  import { query } from "svelte-apollo";

  const client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/circlesubi/circles",
  });

  export async function getSafeAddressAsync(safeOwner) {
    let safeOwnerAddress = safeOwner.address.toLowerCase();
    let queryResult = query(client, {
      query: querySafeAddressFromSafeOwner(safeOwnerAddress),
    });
    let safeAddress = (await queryResult.result()).data.users[0].safes[0].id;
    return await safeAddress;
  }

  export async function loadingSafeDataAsync(safeAddress) {
    let queryReturn = await query(client, {
      query: queryLoggedInSafe(safeAddress),
    });
    let r = await queryReturn.result();
    return r;
  }

  export async function loadingTransferDataAsync(safeAddress) {
    let queryReturn = query(client, {
      query: queryTransfers(safeAddress),
    });
    let r = await queryReturn.result();
    return r;
  }

  function queryLoggedInSafe(safeAddress) {
    return gql`
  {
    safes(where: {id: "${safeAddress}"})
    {
      id
      incoming(orderBy: limit, orderDirection: desc) {
        limit
        limitPercentage
        user {
          id
        }
      }
      outgoing(orderBy: limit, orderDirection: desc) {
        limit
        limitPercentage
        canSendTo {
          id
        }
      }
      balances(orderBy: amount, orderDirection: desc) {
        id
        amount
        token {
          id
          owner {
            id
          }
        }
      }
    }
  }
  `;
  }

  function querySafeAddressFromSafeOwner(safeOwnerAddress) {
    return gql`
      {
        users(where: { id: "${safeOwnerAddress}" }) {
          id
          safes {
            id
          }
        }
      }
    `;
  }

  function queryTransfers(safeAddress) {
    return gql`
      {
        notifications(
          orderBy: time
          orderDirection: desc
          where: {
            safe: "${safeAddress}"
            type: TRANSFER
          }
        ) {
          time
          transfer {
            from
            to
            amount
          }
        }
      }
    `;
  }

  // TODO:
  function subscribeTo() {
    throw new Error("Not implemented.");
  }
</script>
