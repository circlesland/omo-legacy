<script>
  import OmoCard from "./../3-organisms/OmoCard.svelte";

  let name = "Samuel";
  let job = "Founder";
  let image = "/images/profile.jpg";
  let description = "";
  let formState = "empty";
  let contacts = [];

  function addContact() {
    if (
      name.trim().length == 0 ||
      job.trim().length == 0 ||
      image.trim().length == 0 ||
      description.trim().length == 0
    ) {
      formState = "invalid";
      return;
    }
    formState = "done";
    contacts = [
      ...contacts,
      {
        id: Math.random(),
        name: name,
        job: job,
        image: image,
        description: description
      }
    ];
  }
  function deleteFirst() {
    contacts = contacts.slice(1);
  }
  function deleteLast() {
    contacts = contacts.slice(0, -1);
  }
</script>

<div class="py-24 px-16 flex">
  <form class="w-2/3 pr-8">
    <div class="flex flex-wrap -mx-3 mb-6">
      <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
          for="grid-first-name">
          Name
        </label>
        <input
          class="block w-full text-gray-700 border bg-white rounded py-3 px-4
          mb-3 leading-tight outline-none focus:bg-white"
          id="grid-first-name"
          bind:value={name}
          type="text"
          placeholder={name} />

      </div>
      <div class="w-full md:w-1/2 px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
          for="grid-last-name">
          Job Title
        </label>
        <input
          class="block w-full text-gray-700 border bg-white rounded py-3 px-4
          leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="grid-last-name"
          type="text"
          bind:value={job}
          placeholder={job} />
      </div>
      <div class="w-full px-3 mb-6 md:mb-0">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
          for="grid-first-name">
          Image
        </label>
        <input
          class="block w-full text-gray-700 border bg-white rounded py-3 px-4
          leading-tight outline-none focus:bg-white"
          id="grid-first-name"
          bind:value={image}
          type="text"
          placeholder={image} />
      </div>
      <div class="w-full px-3 mb-6 md:mb-0">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
          for="grid-first-name">
          Description
        </label>
        <textarea
          class="block w-full text-gray-700 border bg-white rounded py-3 px-4
          leading-tight outline-none focus:bg-white"
          id="grid-first-name"
          bind:value={description}
          type="text"
          placeholder={description} />
      </div>
    </div>
    <div
      on:click|preventDefault={addContact}
      type="submit"
      class="block text-white border bg-ci rounded py-3 px-4 leading-tight
      outline-none hover:bg-yellow-300 hover:text-gray-800">
      Save
    </div>
    <div
      on:click={deleteFirst}
      class="block text-white border bg-gray-500 rounded py-3 px-4 leading-tight
      outline-none hover:bg-yellow-300 hover:text-gray-800">
      Delete First
    </div>
    <div
      on:click={deleteLast}
      class="block text-white border bg-gray-500 rounded py-3 px-4 leading-tight
      outline-none hover:bg-yellow-300 hover:text-gray-800">
      Delete Last
    </div>
    {#if formState === 'done'}
      <p>success</p>
    {:else}
      <p>Invalid Input</p>
    {/if}
  </form>
  <div class="flex flex-wrap w-1/3">
    {#each contacts as c, i (c.id)}
      <div class="mb-5 w-full">
        #{i + 1}
        <OmoCard
          class="w-full"
          name={c.name}
          job={c.job}
          image={c.image}
          description={c.description} />
      </div>
    {:else}no contacts yet{/each}
  </div>
</div>
