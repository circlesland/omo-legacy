<script>
  import { styled } from "svelte-styled-system";
  import theme from "./theme.js";
</script>

<button use:styled={[$$props, $theme]} on:click>
  <slot />
</button>
