<script>
  export let type = "";
  export let text = "button";
  export let link = "";
  export let theme = "";
</script>

<a href={link}>
  <button
    {type}
    class="{theme} bg-blue-800 hover:bg-pink-800 text-white px-3 py-1
    rounded-full font-bolt"
    style="font-family: 'Indie Flower'!important;">
    {text}
  </button>
</a>
