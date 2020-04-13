<script>
  export let model = {
    name: "Omo Header",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "omo/views/molecules"
  };
  export let data = {
    id: "",
    title: "",
    subline: ""
  };
  export const design = {
    bg: "bg-gray-400",
    p: "py-20"
  };
</script>

<div
  class="{design.bg}
  {design.p} m-auto flex flex-col justify-center text-center">
  <h2 class="flex-wrap text-5xl text-gray-800 font-bold font-title uppercase">
    {data.title}
  </h2>
  <br />
  {#if data.subline}
    <div
      class="flex-wrap text-3xl text-gray-500 italic font-light font-sans
      tracking-wide mb-6">
      {data.subline}
    </div>
  {/if}
</div>
