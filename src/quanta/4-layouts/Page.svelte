<script>
  import OmoNavbar from "./../2-molecules/OmoNavbar.svelte";
  import OmoEditor from "./OmoEditor.svelte";
</script>

<div class="flex flex-col h-full">
  <header
    class="bg-gray-200 text-sm font-semibold py-2 px-3 text-blue-900 uppercase
    border-b border-gray-300">
    Context Title
  </header>
  <main class="flex-1">
    <OmoEditor />
  </main>
  <footer>
    <OmoNavbar />
  </footer>
</div>

<!-- 
<OmoNavbar />
<div class="h-full">
  <OmoEditor />
</div> -->
