<script>
  import cartstore from "./../../2-stores/cartstore.js";
  import CartItem from "./../2-molecules/CartItem.svelte";

  let items;

  cartstore.subscribe(its => {
    items = its;
  });
</script>

<style>
  section {
    width: 30rem;
    max-width: 90%;
    margin: 2rem auto;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>

<section>
  <h1>Cart</h1>
  <ul>
    {#each items as item (item.id)}
      <CartItem id={item.id} title={item.title} price={item.price} />
    {:else}
      <p>No items in cart yet!</p>
    {/each}
  </ul>
</section>
