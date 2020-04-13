import Home from './quanta/1-views/5-pages/Home.svelte';
import User from './quanta/1-views/5-pages/user.svelte';
import City from './quanta/1-views/5-pages/City.svelte';

import {
    writable
} from 'svelte/store';
const router = {
    '/': Home,
    '/home': Home,
    '/user': User,
    '/city': City,
}
export default router;
export const curRoute = writable('/home');
export const curId = writable(0);