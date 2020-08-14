<script>
  export let name;
  name = "omo earth starter";
</script>

<style>
  h1 {
    color: purple;
  }

  .btn-red {
    @apply bg-red-500 text-white font-bold py-2 px-4 rounded;
  }

  .btn-red:hover {
    @apply bg-red-700;
  }
</style>

<h1>Hello {name}!</h1>
<a class="btn-blue" href="/">Button blue</a>
<a class="btn-red" href="/">Button red</a>
