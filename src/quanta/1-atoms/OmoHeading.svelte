<script>
  import { styled } from "svelte-styled-system";
  import theme from "./theme.js";
</script>

<h1 use:styled={[$$props, $theme]}>
  <slot />
</h1>
