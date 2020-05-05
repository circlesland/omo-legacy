<script>
  import { styled } from "svelte-styled-system";
  import theme from "./theme.js";

  export let as = "div";
</script>

{#if !as || as === 'div'}
  <div use:styled={[$$props, $theme]}>
    <slot />
  </div>
{:else if as === 'nav'}
  <nav use:styled={[$$props, $theme]}>
    <slot />
  </nav>
{/if}
