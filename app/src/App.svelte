<script lang="ts">
    import OmoTheme from "./OmoTheme.svelte";
    import Compositor from "./blocks/Compositor.svelte";
    import OmoList from "./blocks/molecules/OmoList.svelte";

    export let name: string;
    name = "omo earth starter";

    const left = {
        area: "left",
        component: "OmoBanner",
        data: {
            title: "follow your dreams",
            image: "/images/inspire.jpg",
            action: "javascript:navigate('omoauth')",
            button: "Start dreaming",
        }
    };
    const right = {
        area: "right",
        component: "OmoBanner",
        data: {
            title: "follow your dreams",
            image: "/images/inspire.jpg",
            action: "javascript:navigate('omoauth')",
            button: "Start dreaming",
        }
    };
    const preFooter = {
        layout: {
            areas: "'left right'",
            columns: "1fr 1fr",
            rows: "1fr",
        },
        area: "pre-footer",
        component: "Compositor",
        children: [
            left,
            right
        ]
    };
    const footer = {
        area: "footer",
        component: "OmoNav",
    };
    const banner = {
        area: "main",
        component: "OmoBanner",
        data: {
            title: "follow your dreams",
            image: "/images/inspire.jpg",
            action: "javascript:navigate('omoauth')",
            button: "Start dreaming",
        },
    };

    let App = {
        layout: {
            areas: "'main' 'pre-footer' 'footer'",
            columns: "1fr",
            rows: "1fr 15rem 4rem",
        },
        component: "Compositor",
        children: [
            banner,
            preFooter,
            footer,
        ],
    };
</script>

<style>
    h1 {
        color: purple;
    }

    .btn-red {
        @apply bg-red-500 text-white font-bold py-2 px-4 rounded;
    }

    .btn-red:hover {
        @apply bg-red-700;
    }
</style>

<OmoTheme/>
<Compositor composition={App}/>
