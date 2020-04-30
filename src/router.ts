import OmoSideBarLayout from "./quanta/4-layouts/OmoSideBarLayout.svelte";
import OmoBooksTable from "./quanta/2-molecules/OmoBooksTable.svelte";
import OmoAuthorsTable from "./quanta/2-molecules/OmoAuthorsTable.svelte";
import OmoLibrariesTable from "./quanta/2-molecules/OmoLibrariesTable.svelte";
import OmoHome from "./quanta/5-pages/OmoHome.svelte";
import OmoTest from "./quanta/5-pages/OmoTest.svelte";
import { writable } from "svelte/store";

const router = [
  { route: "?route=home", quant: OmoHome, name: null },
  { route: "?route=test", quant: OmoTest, name: "test" },
  {
    route: "?route=books",
    quant: OmoSideBarLayout,
    subQuant: OmoHome,
    name: "books",
    icon: "fa-book",
  },
  {
    route: "?route=authors",
    quant: OmoSideBarLayout,
    subQuant: OmoHome,
    name: "authors",
    icon: "fa-user-graduate",
  },
  {
    route: "?route=libraries",
    quant: OmoSideBarLayout,
    subQuant: OmoHome,
    name: "libraries",
    icon: "fa-book-reader",
  },
];

export default router;
export var curRoute = writable("?route=home");
export const curId = writable(0);
