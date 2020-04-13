import {
    writable
} from "svelte/store"
import OmoCardArticle from "./../1-views/2-molecules/OmoCardArticle.svelte";
// import OmoPricing from "./../1-views/2-molecules/OmoPricing.svelte";
import OmoVideo from "./../1-views/2-molecules/OmoVideo.svelte";
import OmoHero from "./../1-views/2-molecules/OmoHero.svelte";
import OmoHeader from "./../1-views/2-molecules/OmoHeader.svelte";

const OmoQuanta = writable([{
    model: {
        name: "Omo Header",
        image: "/images/samuel.jpg",
        author: "Samuel Andert",
        type: "omo/views/molecules",
        component: OmoHeader
    },
    data: {
        id: "1",
        title: "title",
        subline: "subline"
    },
    design: {}
}, {
    model: {
        name: "Omo Card Article",
        image: "/images/samuel.jpg",
        author: "Samuel Andert",
        type: "omo/views/molecules",
        component: OmoCardArticle,
    },
    data: {
        id: "2",
        tag: "#tag",
        excerpt: "Build Your New Idea with Laravel Framework.",
        image: "https://randomuser.me/api/portraits/women/21.jpg",
        author: "John Doe",
        date: "Mar 10, 2018"
    },
    design: {}
}, {
    model: {

        name: "Omo Video",
        image: "/images/samuel.jpg",
        author: "Samuel Andert",
        type: "omo/views/molecules",
        component: OmoVideo
    },
    data: {
        id: "3",
        title: "title set from store",
        link: "https://player.vimeo.com/video/349650067"
    },
    design: {}
}, {
    model: {
        name: "Omo Hero",
        image: "/images/samuel.jpg",
        author: "Samuel Andert",
        type: "omo/views/molecules",
        component: OmoHero
    },
    data: {
        id: "4",
        title: "hero set by store ",
        subline: "hero subtitle message",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
        illustration: "/images/progressive_app.svg",
        button: "Call to Action"
    },
    design: {}
}]);

export default OmoQuanta;