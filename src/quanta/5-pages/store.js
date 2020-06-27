import {
    writable
} from 'svelte/store';

function getStore() {
    const columns = localStorage.getItem('columns');
    return columns ? JSON.parse(columns) : [{
            id: 0,
            name: 'Research',
            cards: [{
                    id: 0,
                    content: 'Go shopping'
                },
                {
                    id: 1,
                    content: 'Do the laundry'
                }
            ]
        },
        {
            id: 1,
            name: 'Todo',
            cards: [{
                id: 2,
                content: 'Program a kanban app'
            }]
        },
        {
            id: 2,
            name: 'Done',
            cards: []
        },
        {
            id: 3,
            name: 'Store Components to IPFS',
            cards: []
        }
    ];
}

export let columns = writable(getStore());

columns.subscribe(val => localStorage.setItem('columns', JSON.stringify(val)));