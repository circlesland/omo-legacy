import {
  writable
} from "svelte/store";
import OmoCardArticle from "./../1-views/2-molecules/OmoCardArticle.svelte";
import OmoNavbar from "./../1-views/2-molecules/OmoNavbar.svelte";
import OmoBanner from "./../1-views/2-molecules/OmoBanner.svelte";
import OmoVideo from "./../1-views/2-molecules/OmoVideo.svelte";
import OmoHero from "./../1-views/2-molecules/OmoHero.svelte";
import OmoHeader from "./../1-views/2-molecules/OmoHeader.svelte";
import OmoCities from "./../1-views/3-organisms/OmoCities.svelte";
import OmoPricing from "./../1-views/2-molecules/OmoPricing.svelte";
import OmoSubscribe from "./../1-views/2-molecules/OmoSubscribe.svelte";
import OmoTable from "./../1-views/2-molecules/OmoTable.svelte";
import OmoAccordion from "./../1-views/2-molecules/OmoAccordion.svelte";
import OmoMenuVertical from "./../1-views/2-molecules/OmoMenuVertical.svelte";
import OmoMenuHorizontal from "./../1-views/2-molecules/OmoMenuHorizontal.svelte";
import OmoCardGroup from "./../1-views/2-molecules/OmoCardGroup.svelte";
import OmoCardProduct from "./../1-views/2-molecules/OmoCardProduct.svelte";
import OmoCardUser from "./../1-views/2-molecules/OmoCardUser.svelte";
import OmoSteps from "./../1-views/2-molecules/OmoSteps.svelte";
import OmoNotifications from "./../1-views/2-molecules/OmoNotifications.svelte";
import OmoResponsive from "./../1-views/2-molecules/OmoResponsive.svelte";

const quanta = writable([{
  id: "q0",
  component: OmoNavbar,
  model: {
    id: "m0",
    name: "Omo Navbar",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    id: "d0",
  },
},
{
  id: "q1",
  component: OmoHeader,
  model: {
    id: "m1",
    name: "Omo Header",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {
    layout: "py-20 bg-white",
    title: "text-blue-900 font-bold font-title",
    subline: "text-gray-500 italic font-light font-sans tracking-wide",
    illustration: "w-1/2",
  },
  data: {
    id: "d1",
    title: "title from store",
    subline: "subline from store",
    illustration: "/images/through_the_park.svg",
  },
},
{
  id: "q2",
  component: OmoVideo,
  model: {
    id: "m2",
    name: "Omo Video",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    id: "d2",
    title: "title set from store",
    link: "https://player.vimeo.com/video/349650067",
  },
},
{
  id: "q3",
  component: OmoHero,
  model: {
    id: "m3",
    name: "Omo Hero",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {
    layout: "bg-white p-20",
  },
  data: {
    id: "d3",
    title: "hero set by store ",
    subline: "hero subtitle message",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
    illustration: "/images/progressive_app.svg",
    button: "Call to Action",
  },
},
{
  id: "q55",
  component: OmoSteps,
  model: {
    id: "m55",
    name: "Omo Steps",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    id: "d3",
    steps: [{
      title: "Step 1",
      description: "description 1",
      image: "/images/progressive_app.svg",
    },
    {
      title: "Step 2",
      description: "description 2",
      image: "/images/online_messaging.svg",
    },
    {
      title: "Step 3",
      description: "description 3",
      image: "images/shopping_app.svg",
    },
    ],
  },
},
{
  id: "q44",
  component: OmoBanner,
  model: {
    id: "m44",
    name: "Omo Banner",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    uptitle: "Uptitle",
    title: "Title",
    subtitle: "subtitle",
    image: "https://source.unsplash.com/random",
    button: "call to action",
  },
},
{
  id: "q5",
  component: OmoCities,
  model: {
    id: "m5",
    name: "Omo Cities",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "organism",
  },
  design: {
    grid: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },
  data: [],
},
{
  id: "q8",
  component: OmoPricing,
  model: {
    id: "m8",
    name: "Omo Pricing",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: [],
},
{
  id: "q10",
  component: OmoSubscribe,
  model: {
    id: "m10",
    name: "Omo Subscribe",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {
    layout: "",
  },
  data: {
    id: "d10",
    title: "Get Our Updates",
    subline: "Find out about events and other news",
    email: "john@mail.com",
    image: "https://source.unsplash.com/random",
    button: "Subscribe",
  },
},
{
  id: "q11",
  component: OmoTable,
  model: {
    id: "m11",
    name: "Omo Table",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: [],
},
{
  id: "q11",
  component: OmoAccordion,
  model: {
    id: "m11",
    name: "Omo Pricing",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: [],
},
{
  id: "q4",
  component: OmoCardArticle,
  model: {
    id: "m4",
    name: "Omo Card Article",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {
    layout: "bg-gray-100 border border-gray-100 rounded-lg shadow-sm py-16",
  },
  data: {
    id: "d4",
    tag: "#tag",
    excerpt: "Build Your New Idea with Laravel Framework.",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
    author: "John Doe",
    date: "Mar 10, 2018",
  },
},
{
  id: "q6",
  component: OmoMenuVertical,
  model: {
    id: "m6",
    name: "Omo Menu Vertical",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: [],
},
{
  id: "q7",
  component: OmoMenuHorizontal,
  model: {
    id: "m7",
    name: "Omo Menu Horizontal",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: [],
},
{
  id: "q20",
  component: OmoCardGroup,
  model: {
    name: "Omo Card Group",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    id: "",
    follower: "10",
    name: "Group Name",
    description: "group description",
    image: "https://source.unsplash.com/random",
    user: "https://randomuser.me/api/portraits/women/21.jpg",
  },
},
{
  id: "q33",
  component: OmoCardProduct,
  model: {
    id: "m33",
    name: "Omo Card Product",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {
    id: "d33    ",
    name: "PRODUCT NAME",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
    image: "https://source.unsplash.com/random",
    price: "129€",
    button: "Add to Card",
  },
},
{
  id: "q88",
  component: OmoCardUser,
  model: {
    id: "m88",
    name: "Omo Card User",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {},
},
{
  id: "q111",
  component: OmoNotifications,
  model: {
    id: "m111",
    name: "Omo Notifications",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {},
},
{
  id: "q1111",
  component: OmoResponsive,
  model: {
    id: "m1111",
    name: "Omo Responsive",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "view",
    group: "omo",
    tags: "molecule",
  },
  design: {},
  data: {},
},
]);

export default quanta;