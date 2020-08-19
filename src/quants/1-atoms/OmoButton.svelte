<script lang="ts">
  export let data = {
    text: "button",
    design: "o-btn-primary",
    link: "/"
  };
</script>

<style>
  .o-btn-primary {
    @apply bg-primary text-white font-bold py-2 px-4;
  }

  .o-btn-secondary {
    @apply bg-secondary text-white font-bold py-2 px-4;
  }

  .o-btn-tertiary {
    @apply bg-tertiary text-white font-bold h-full py-2 px-4;
  }

  .o-btn-xl {
    @apply text-xl;
  }

  .o-btn-2xl {
    @apply text-lg py-4;
  }

  .o-btn-sm {
    @apply py-1 px-3;
  }

  .o-btn-primary:hover {
    @apply bg-secondary;
  }

  .o-btn-secondary:hover {
    @apply bg-primary;
  }
</style>

<a class="{data.design} text-center w-full" href={data.link}>{data.text}</a>
