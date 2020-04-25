<script>
  import ElementQueries from "css-element-queries/src/ElementQueries";

  ElementQueries.listen();
</script>

<style>
  .widget-name h2 {
    font-size: 12px;
    background-color: blue;
  }

  .widget-name[min-width~="200px"] h2 {
    font-size: 18px;
    background-color: green;
  }

  .widget-name[min-width~="300px"] h2 {
    padding: 55px;
    text-align: center;
    font-size: 24px;
    background-color: yellow;
  }

  .widget-name[min-width~="500px"] h2 {
    font-size: 34px;
    color: red;
    background-color: black;
  }
</style>

<div class="widget-name w-full">
  <h2>Element responsiveness FTW!</h2>
</div>
