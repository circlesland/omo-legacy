<script>
  import OmoTitle from "./../1-atoms/OmoTitle";

  export let data = {
    uptitle: "uptitle",
    title: "title",
    subline: "subline",
    text: ""
  };
</script>

<style>
  section {
    @apply w-full rounded flex flex-col text-center mx-auto py-12;
  }

  .inside {
    @apply mx-auto text-center;
  }

  .uptitle {
    @apply text-secondary uppercase pt-4 font-bold;
  }

  .subline {
    @apply text-lg text-gray-600 italic font-light tracking-wide mb-6 py-4;
  }

  .text {
    @apply text-gray-700 font-light mb-6 py-4;
  }
</style>

<section class="bg-red-300;">
  <div class="inside">
    {#if data.uptitle}
      <p class="uptitle">{data.uptitle}</p>
    {/if}
    <h1
            class="bg-blue-300 py-1 px-4 text-primary text-2xl md:text-3xl lg:text-4xl">
      {data.title}
    </h1>
    {#if data.subline}
      <div class="subline">{data.subline}</div>
    {/if}
    {#if data.text}
      <div class="text">{data.text}</div>
    {/if}
  </div>
</section>
