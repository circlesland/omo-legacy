<script>
  import OmoCard from "./OmoCard.svelte";
  const partners = [
    {
      id: "1",
      name: "tailwind",
      image: "/logos/tailwind.png",
      link: "https://tailwindcss.com"
    },
    {
      id: "2",
      name: "svelte",
      image: "/logos/svelte.png",
      link: "https://svelte.dev"
    },
    {
      id: "3",
      name: "graphql",
      image: "/logos/graphql.png",
      link: "https://graphql.org"
    },
    {
      id: "4",
      name: "textile",
      image: "/logos/textile.png",
      link: "https://textile.io"
    },
    {
      id: "5",
      name: "ipfs",
      image: "/logos/ipfs.png",
      link: "https://ipfs.io"
    },
    {
      id: "6",
      name: "typescript",
      image: "/logos/typescript.png",
      link: "https://www.typescriptlang.org"
    }
  ];
</script>

<div class="py-4 grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-6">
  {#each partners as quant, i (quant.id)}
    <OmoCard {quant} />
  {/each}
</div>
