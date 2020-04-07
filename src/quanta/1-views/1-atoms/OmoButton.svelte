<script>
  export let button = {
    text: "button",
    link: "",
    theme: ""
  };
</script>

<a href={button.link}>
  <button
    class="{button.theme} bg-blue-800 hover:bg-green-500 text-white px-3 py-1
    rounded-full font-bolt">
    {button.text}
  </button>
</a>
