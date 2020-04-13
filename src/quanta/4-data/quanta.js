import {
    writable
} from "svelte/store"
import OmoCardArticle from "./../1-views/2-molecules/OmoCardArticle.svelte";
// import OmoPricing from "./../1-views/2-molecules/OmoPricing.svelte";
import OmoVideo from "./../1-views/2-molecules/OmoVideo.svelte";
import OmoHero from "./../1-views/2-molecules/OmoHero.svelte";
import OmoHeader from "./../1-views/2-molecules/OmoHeader.svelte";
import OmoCities from "./../1-views/3-organisms/OmoCities.svelte";

const quanta = writable(
    [{
            id: "q1",
            component: OmoHeader,
            model: {
                id: "m1",
                name: "Omo Header",
                image: "/images/samuel.jpg",
                author: "Samuel Andert",
                type: "view",
                group: "omo",
                tags: "molecule"
            },
            design: {
                layout: "py-20 bg-white",
                title: "text-blue-900 font-bold font-title",
                subline: "text-gray-500 italic font-light font-sans tracking-wide",
                illustration: "w-1/2"
            },
            data: {
                id: "d1",
                title: "title from store",
                subline: "subline from store",
                illustration: "/images/through_the_park.svg",
            }
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
                tags: "molecule"
            },
            design: {},
            data: {
                id: "d2",
                title: "title set from store",
                link: "https://player.vimeo.com/video/349650067"
            }
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
                tags: "molecule"
            },
            design: {
                layout: "bg-gray-100 p-16"
            },
            data: {
                id: "d3",
                title: "hero set by store ",
                subline: "hero subtitle message",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
                illustration: "/images/progressive_app.svg",
                button: "Call to Action"
            }
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
                tags: "molecule"
            },
            design: {
                layout: "bg-gray-100 border border-gray-100 rounded-lg shadow-sm my-16"
            },
            data: {
                id: "d4",
                tag: "#tag",
                excerpt: "Build Your New Idea with Laravel Framework.",
                image: "https://randomuser.me/api/portraits/women/21.jpg",
                author: "John Doe",
                date: "Mar 10, 2018"
            }
        }, {
            id: "q5",
            component: OmoCities,
            model: {
                id: "m5",
                name: "Omo Cities",
                image: "/images/samuel.jpg",
                author: "Samuel Andert",
                type: "view",
                group: "omo",
                tags: "molecule"
            },
            design: {
                grid: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            },
            data: []
        }
    ]);

export default quanta;