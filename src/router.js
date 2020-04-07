import Home from './quanta/1-views/5-pages/Home.svelte';
import Dream from './quanta/1-views/5-pages/Dream.svelte';
import City from './quanta/1-views/5-pages/City.svelte';
import Enkel from './quanta/1-views/5-pages/Enkel.svelte';
import Chat from './quanta/1-views/5-pages/Chat.svelte';
import Leidenschaft from './quanta/1-views/5-pages/Leidenschaft.svelte';
import {
    writable
} from 'svelte/store';
const router = {
    '/': Home,
    '/home': Home,
    '/dream': Dream,
    '/city': City,
    '/enkel': Enkel,
    '/chat': Chat,
    '/leidenschaft': Leidenschaft
}
export default router;
export const curRoute = writable('/home');
export const curId = writable(0);