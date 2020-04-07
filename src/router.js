import Home from './quanta/1-views/5-pages/Home.svelte';
import User from './quanta/1-views/5-pages/user.svelte';
import City from './quanta/1-views/5-pages/City.svelte';
import Cities from './quanta/1-views/5-pages/Cities.svelte';
import Drivers from './quanta/1-views/5-pages/Drivers.svelte';
import Pricing from './quanta/1-views/5-pages/Pricing.svelte';
import FAQ from './quanta/1-views/5-pages/FAQ.svelte';
import Team from './quanta/1-views/5-pages/Team.svelte';

import {
    writable
} from 'svelte/store';
const router = {
    '/': Home,
    '/home': Home,
    '/user': User,
    '/city': City,
    '/cities': Cities,
    '/drivers': Drivers,
    '/pricing': Pricing,
    "/faq": FAQ,
    "/team": Team,
}
export default router;
export const curRoute = writable('/home');
export const curId = writable(0);