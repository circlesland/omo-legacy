<script>
  import { watchResize } from "svelte-watch-resize";

  export let quant = {
    follower: "10",
    name: "Group Name",
    description: "group description",
    image: "https://source.unsplash.com/random",
    user: "https://randomuser.me/api/portraits/women/21.jpg"
  };

  let width;

  let size = {
    r1: true,
    r2: false,
    r3: false,
    r4: false,
    r5: false,
    r6: false
  };

  function responsive(node) {
    width = node.clientWidth;
    if (width < 480) {
      size.r1 = true;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 480 && width < 768) {
      size.r1 = false;
      size.r2 = true;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 768 && width < 992) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = true;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 992 && width < 1280) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = true;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 1280) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = true;
      size.r6 = false;
    }
    if (width >= 1600) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = true;
    }
  }
</script>

<a href="/" use:watchResize={responsive}>
  <div
    class="bg-white relative shadow rounded-lg text-gray-800 hover:shadow-lg">
    <div
      class="right-0 mt-4 rounded-l-full absolute text-center font-bold text-xs
      text-white px-2 py-1 bg-orange-500">
      {quant.follower} members
    </div>
    <img
      src={quant.image}
      class="h-40 rounded-lg w-full object-cover object-center" />
    <div class="flex justify-center">
      <img
        src={quant.user}
        class="rounded-full -mt-12 border-8 object-center object-cover
        border-white mr-2 h-24 w-24" />
    </div>
    <div class="py-2 px-2">
      <div class="font-bold font-title text-xl text-center">{quant.name}</div>
      <div class="text-sm font-light text-center my-2">{quant.description}</div>
    </div>
  </div>
</a>
