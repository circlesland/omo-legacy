<script>
  export let name;
  export let job;
  export let image;
  export let description;
</script>

<style>
  .placeholder {
    background-color: yellowgreen;
  }
</style>

<div class="max-w-md w-full lg:flex">
  <div
    class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none
    lg:rounded-l text-center overflow-hidden"
    style="background-image: url('{image}')"
    title={name} />
  <div
    class="w-full border-r border-b border-l border-grey-light lg:border-l-0
    lg:border-t lg:border-grey-light bg-white rounded-b lg:rounded-b-none
    lg:rounded-r p-4 flex flex-col justify-between leading-normal">
    <div class="mb-8">
      <p class="text-sm text-grey-dark flex items-center">{job}</p>
      <div class="text-black font-bold text-2xl mb-2">{name}</div>
      <p class="text-grey-darker text-base">{description}</p>
    </div>
  </div>
</div>
