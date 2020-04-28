<script>
  export let world;
  import Test from "./quanta/Test.svelte";
</script>

<style>
  div {
    font-size: 25px;
    font-weight: 400;
    height: 100vh;
    text-align: center;
    margin: 100px;
  }
  span {
    color: #1f9fa8;
  }
</style>

<div>
  👋Hello
  <span class="bg-blue-800">{world}</span>
  !
  <Test />
</div>
