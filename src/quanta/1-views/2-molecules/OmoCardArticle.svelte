<script>
  export let omocardarticle = {
    tag: "#tag",
    excerpt: " Build Your New Idea with Laravel Freamwork.",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
    author: "John Doe",
    date: "Mar 10, 2018"
  };
</script>

<div
  class="flex flex-col bg-white px-8 py-6 max-w-sm mx-auto rounded-lg shadow-lg">
  <div class="flex justify-center items-center">
    <a class="px-2 py-1 bg-gray-600 text-sm text-green-100 rounded" href="#">
      {omocardarticle.tag}
    </a>
  </div>
  <div class="mt-4">
    <a class="text-lg text-gray-700 font-medium" href="#">
      {omocardarticle.excerpt}
    </a>
  </div>
  <div class="flex justify-between items-center mt-4">
    <div class="flex items-center">
      <img
        src={omocardarticle.image}
        class="w-8 h-8 object-cover rounded-full"
        alt="avatar" />
      <a class="text-gray-700 text-sm mx-3" href="#">{omocardarticle.author}</a>
    </div>
    <span class="font-light text-sm text-gray-600">{omocardarticle.date}</span>
  </div>
</div>
