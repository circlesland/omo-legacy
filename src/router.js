import Home from './quanta/1-views/5-pages/Home.svelte';
import User from './quanta/1-views/5-pages/User.svelte';
import City from './quanta/1-views/5-pages/City.svelte';
import Quanta from './quanta/1-views/5-pages/Quanta.svelte';

import {
    writable
} from 'svelte/store';
const router = {
    '/': Home,
    '/home': Home,
    '/user': User,
    '/city': City,
    '/quanta': Quanta,
}
export default router;
export const curRoute = writable('/home');
export const curId = writable(0);