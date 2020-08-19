<script>
  export let data = {title: "title"};
  export let design = {textsize: ""};
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap");

  .omo-font-title {
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
    @apply text-primary;
  }
</style>

<h1 class="omo-font-title {design.textsize}">{data.title}</h1>
