<script>
  // imports
  import {afterUpdate} from "svelte";
  import {fade, scale, fly} from "svelte/transition";

  // public props
  export let triggerRef = undefined;
  export let isOpen = false;
  export let role = "dialog";

  // local props
  let buttonRef;

  // functions
  const handleClose = () => (isOpen = false);
  const handleEsc = e => e.key === "Escape" && handleClose();

  // lifecycle
  afterUpdate(() => {
    if (isOpen) {
      buttonRef.focus();
    } else {
      triggerRef && triggerRef.focus();
    }
  });
</script>

<style>
  * {
    box-sizing: border-box;
  }

  aside {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 4rem;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow-y: hidden;
  }

  aside .box {
    background: #fff;
    position: relative;
    box-sizing: 0 0 20px 0px rgba(0, 0, 0, 0.3);
  }

  aside .box header button {
    background: none;
    border: none;
    padding: 0;
    font-size: 20px;
    position: absolute;
    right: 20px;
    color: #ccc;
    font-weight: lighter;
    cursor: pointer;
  }
</style>

{#if isOpen}
  <aside
          on:keydown={handleEsc}
          aria-labelledby="modal-heading"
          aria-modal="true"
          tabIndex={-1}
          {role}
          in:fade
          out:fade
          on:click|self={handleClose}
          class="overlay ">

    <div class="box w-full rounded-t-lg lg:w-4/5 bg-gray-100">
      <header class="rounded-t-lg ">
        <div class="relative rounded-t-lg">
          <div class="overflow-hidden rounded-t-lg h-6 text-xs flex bg-dark">
            <!-- <div
              style="width: 33%"
              class="shadow-none rounded-tl-lg flex flex-col text-center
              whitespace-nowrap text-white justify-center bg-tertiary" /> -->
          </div>
        </div>
        <button
                aria-label="Close modal"
                bind:this={buttonRef}
                on:click={handleClose}/>
      </header>
      <main>
        <slot>No content provided</slot>
      </main>
    </div>

  </aside>
{/if}
