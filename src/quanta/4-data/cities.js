import {
    writable
} from "svelte/store"

const cities = writable(
    [{
            id: 1,
            name: "Berlin",
            image: "https://source.unsplash.com/TK5I5L5JGxY"
        },
        {
            id: 2,
            name: "München",
            image: "https://source.unsplash.com/8QJSi37vhms "
        },
        {
            id: 3,
            name: "Heidelberg",
            image: "https://source.unsplash.com/Yfo3qWK2pjY"
        },
    ]);

export default cities;