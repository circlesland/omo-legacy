<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  html,
  body {
    height: 100vh;
    width: 100vw;
    padding: 0;
    margin: 0;
  }

  h1 {
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
  }

  font-title {
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
  }

  h2 {
    @apply text-2xl pb-4;
  }

  h3 {
    @apply text-xl pb-4 pt-4;
  }

  p {
    @apply pb-2;
  }

  a {
    @apply text-green-400;
  }

  *:focus {
    outline: none;
  }
</style>
