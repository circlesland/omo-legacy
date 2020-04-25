<script>
  import { getNotificationsContext } from "svelte-notifications";
  const { addNotification } = getNotificationsContext();
  export let quant = {
    id: "",
    model: {
      id: "",
      name: "",
      image: "",
      author: "",
      type: ""
    },
    data: {
      id: "",
      title: "",
      subline: "",
      description: "",
      illustration: "",
      button: ""
    },
    design: {
      layout: ""
    }
  };
</script>

<button
  on:click={() => addNotification({
      text: 'Notification',
      position: 'top-right'
    })}
  class="bg-blue-800 text-white py-2 px-4">
  Add Notification
</button>
