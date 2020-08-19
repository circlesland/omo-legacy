<script>
  import OmoImageGrid from "./../2-molecules/OmoImageGrid";
  import OmoHero from "./../2-molecules/OmoHero";

  // let omo = {};

  // o.store.odentity.currentOmo().then(o => {
  //   omo = o;
  // });

  // $: hero = {
  //   uptitle: "My Omo Dapps",
  //   title: `Welcome, ${omo.name != null ? omo.name : omo._id}`
  // };

  export let logos = [
    {
      id: "1",
      name: "Odentity",
      image: "/logos/identity.svg",
      link: "javascript:navigate('odentity')",
      locked: false
    },
    {
      id: "5",
      name: "Omo Wallet",
      image: "/logos/pay.svg",
      link: "javascript:navigate('omosafe')",
      locked: false
    },
    {
      id: "5",
      name: "Omo Orgas",
      image: "/logos/dream.svg",
      link: "javascript:navigate('omoorgas')",
      locked: false
    },
    {
      id: "4",
      name: "Omo Dreams",
      image: "/logos/dream.svg",
      link: "javascript:navigate('omodreams')",
      locked: false
    },

    {
      id: "3",
      name: "Omo Funding",
      image: "/logos/funding.svg",
      link: "javascript:navigate('omofunding')",
      locked: false
    },
    {
      id: "2",
      name: "Omo Chat",
      image: "/logos/chat.svg",
      link: "javascript:navigate('omochat')",
      locked: false
    },
    {
      id: "6",
      name: "Handbook",
      image: "/logos/learn.svg",
      link: "javascript:navigate('docs')",
      locked: false
    }
  ];
</script>

<style>
  .wrap {
    @apply p-6;
  }
</style>

<!-- <OmoHero data={hero} /> -->

<div class="wrap">
  <OmoImageGrid {logos}/>
</div>
