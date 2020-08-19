export let welcome = {
  name: "Welcome",
  type: "organism",
  layout: {areas: "'top' 'bottom'", columns: "1fr", rows: "1fr 3rem"},
  blocks: [
    {
      type: "molecule",
      slot: "top",
      quant: "OmoIntro",
      data: {
        step: 0,
        title: "I am omo intro data",
        button: "intro",
      },
    },
    {
      type: "molecule",
      slot: "bottom",
      quant: "OmoNext",
      data: {
        step: 0,
        title: "I am omo next data",
        button: "next",
      },
    },
  ],
};
