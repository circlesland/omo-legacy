<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";

  export let item = {
    id: "0",
    name: "name"
  };
  const button = {
    text: "favorite",
    link: "#"
  };
</script>

<li class="bg-white omo-border p-4">
  {item.name}
  <OmoButton {...button} />
</li>
