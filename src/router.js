import Home from './quanta/1-views/5-pages/Home.svelte';
import User from './quanta/1-views/5-pages/User.svelte';
import City from './quanta/1-views/5-pages/City.svelte';
import Quanta from './quanta/1-views/5-pages/Quanta.svelte';
import Quant from './quanta/1-views/5-pages/Quant.svelte';
import Editor from './quanta/1-views/5-pages/Editor.svelte';

import {
    writable
} from 'svelte/store';
const router = {
    '/': Home,
    '/home': Home,
    '/user': User,
    '/city': City,
    '/quant': Quant,
    '/quanta': Quanta,
    '/editor': Editor,
}
export default router;
export const curRoute = writable('/home');
export const curId = writable(0);