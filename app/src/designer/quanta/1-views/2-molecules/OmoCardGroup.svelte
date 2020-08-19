<script>
  export let quant = {
    model: {
      name: "",
      image: "",
      author: "",
      type: "",
      group: "",
      tags: ""
    },
    design: {},
    data: {
      id: "",
      follower: "10",
      name: "Group Name",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    }
  };
</script>

<div class="flex flex-wrap ">
  <div class="w-full m-auto md:w-1/2 lg:w-1/2">
    <a href="/">
      <div
        class="bg-white relative shadow p-2 rounded-lg text-gray-800
        hover:shadow-lg">
        <div
          class="right-0 mt-4 rounded-l-full absolute text-center font-bold
          text-xs text-white px-2 py-1 bg-orange-500">
          {quant.data.follower} members
        </div>
        <img
          src={quant.data.image}
          class="h-40 rounded-lg w-full object-cover object-center" />
        <div class="flex justify-center">
          <img
            src={quant.data.user}
            class="rounded-full -mt-16 border-8 object-center object-cover
            border-white mr-2 h-32 w-32" />
        </div>
        <div class="py-2 px-2">
          <div class="font-bold font-title text-xl text-center">
            {quant.data.name}
          </div>
          <div class="text-sm font-light text-center my-2">
            {quant.data.description}
          </div>
        </div>
      </div>
    </a>
  </div>
</div>
