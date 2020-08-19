<script>
  export const data = {
    image: "",
  };
  import OmoModal from "./OmoModal.svelte";

  let isOpen = false;

  let triggerRef;
</script>

<style>
  section {
    height: 30rem;
  }

  video {
    object-fit: cover;
  }
</style>

<OmoModal {triggerRef} bind:isOpen>
  <video controls>
    <source
      src="https://ipfs.io/ipfs/bafybeiftyawil7ddly7x46nqxoex6o5h624at3g37toyzkyy5tunnrdykq"
      type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</OmoModal>

<section
  class="font-sans h-full w-full bg-cover text-center flex flex-col items-center
  justify-center"
  style="background:url(https://source.unsplash.com/featured/?city) no-repeat
  center;">

  <div
    class="h-full w-full bg-cover text-center flex flex-col items-center
    justify-center bg-primary opacity-50"
    bind:this={triggerRef}
    on:click={() => (isOpen = !isOpen)}>
    <div
      class="bg-white text-black hover:bg-secondary rounded-full h-16 w-16 flex
      items-center justify-center mb-8">
      <i class="fas fa-play ml-1 " />
    </div>
    <label
      for=""
      class="text-white uppercase tracking-extrawide text-xs font-hairline">
      Watch Video
    </label>
    <h3
      class="text-white mx-auto max-w-lg mt-4 font-normal text-2xl
      leading-normal">
      Our dream is to empower the emerging universal basic income economy of
      tomorrow
    </h3>
  </div>
</section>
