<div class="flex flex-col h-full">

  <main class="p-4 flex-1">
    <h1 class="text-5xl">Main</h1>
    <p>This demo uses Tailwind and Flexbox to make a sticky footer.</p>
    <p />
    <p>
      Make sure to set
      <code>&lt;html&gt;</code>
      as
      <code>height: 100%</code>
      as well as every other element that wraps around the main content or this
      won't work (as we need the height to be the same as the viewport.)
    </p>
    <p>
      You could also give the wrapper element a class of
      <code>h-full</code>
      to give it a height of
      <code>100vh</code>
      , but this can cause the footer to be slightly out of the viewport on
      Mobile Safari.
    </p>
  </main>
  <hr class="border-b m-0" />
</div>
