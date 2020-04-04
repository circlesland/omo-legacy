<script>
  export let db;
  export let currentId;
  export let wish;
  if (!wish) wish = db.wishes.find(d => d.id == currentId);
</script>

<div class="w-1/3 p-2">
  <div
    class="flex flex-col bg-white px-8 py-6 max-w-sm mx-auto rounded-lg
    shadow-lg">
    <div class="flex justify-center items-center">
      <a
        class="p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full"
        href="#">
        {wish.title}
      </a>
    </div>
    <div class="mt-4 text-center">
      <a class="text-lg text-gray-700 font-medium " href="#">{wish.content}</a>
    </div>
  </div>
</div>
