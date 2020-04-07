
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/quanta/1-views/2-molecules/OmoHeader.svelte generated by Svelte v3.20.1 */

    const file = "src/quanta/1-views/2-molecules/OmoHeader.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let h2;
    	let t0_value = /*omoheader*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2_value = /*omoheader*/ ctx[0].subtitle + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			attr_dev(h2, "class", "text-6xl text-green-400 mb-6");
    			set_style(h2, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(h2, file, 10, 4, 186);
    			attr_dev(h3, "class", "text-xl text-gray-700 font-mono");
    			add_location(h3, file, 15, 4, 339);
    			attr_dev(div0, "class", "w-5/6 xl:w-4/6 text-center");
    			add_location(div0, file, 9, 2, 141);
    			attr_dev(div1, "class", "flex justify-center my-20");
    			add_location(div1, file, 8, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h3);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*omoheader*/ 1 && t0_value !== (t0_value = /*omoheader*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*omoheader*/ 1 && t2_value !== (t2_value = /*omoheader*/ ctx[0].subtitle + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { omoheader = { title: "", subtitle: "", video: "" } } = $$props;
    	const writable_props = ["omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoHeader> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoHeader", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({ omoheader });

    	$$self.$inject_state = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omoheader];
    }

    class OmoHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHeader",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get omoheader() {
    		throw new Error("<OmoHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<OmoHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoVideo.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/quanta/1-views/2-molecules/OmoVideo.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let iframe_title_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "embed-responsive-item");
    			if (iframe.src !== (iframe_src_value = /*omovideo*/ ctx[0].link)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", iframe_title_value = /*omovideo*/ ctx[0].title);
    			add_location(iframe, file$1, 12, 6, 260);
    			attr_dev(div0, "class", "embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border\n      ");
    			add_location(div0, file$1, 9, 4, 159);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$1, 8, 2, 126);
    			attr_dev(div2, "class", "flex justify-center pb-20");
    			add_location(div2, file$1, 7, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, iframe);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*omovideo*/ 1 && iframe.src !== (iframe_src_value = /*omovideo*/ ctx[0].link)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}

    			if (dirty & /*omovideo*/ 1 && iframe_title_value !== (iframe_title_value = /*omovideo*/ ctx[0].title)) {
    				attr_dev(iframe, "title", iframe_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { omovideo = { title: "video", link: "" } } = $$props;
    	const writable_props = ["omovideo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoVideo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoVideo", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omovideo" in $$props) $$invalidate(0, omovideo = $$props.omovideo);
    	};

    	$$self.$capture_state = () => ({ omovideo });

    	$$self.$inject_state = $$props => {
    		if ("omovideo" in $$props) $$invalidate(0, omovideo = $$props.omovideo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omovideo];
    }

    class OmoVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { omovideo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoVideo",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get omovideo() {
    		throw new Error("<OmoVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omovideo(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/3-organisms/OmoSteps.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/quanta/1-views/3-organisms/OmoSteps.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (30:6) {#each omosteps as step}
    function create_each_block(ctx) {
    	let div3;
    	let a;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*step*/ ctx[2].title + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*step*/ ctx[2].description + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			a = element("a");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = /*step*/ ctx[2].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "px-16 py-8 object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$2, 33, 14, 795);
    			attr_dev(div0, "class", "text-4xl text-center text-blue-800 mb-2 flex flex-wrap\n                justify-center content-center");
    			set_style(div0, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(div0, file$2, 37, 14, 940);
    			attr_dev(div1, "class", "text-gray-600");
    			add_location(div1, file$2, 43, 14, 1212);
    			attr_dev(div2, "class", "text-center overflow-hidden ");
    			add_location(div2, file$2, 32, 12, 738);
    			attr_dev(a, "href", "chat");
    			add_location(a, file$2, 31, 10, 710);
    			attr_dev(div3, "class", "w-1/3 p-2");
    			add_location(div3, file$2, 30, 8, 676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, a);
    			append_dev(a, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*omosteps*/ 2 && img.src !== (img_src_value = /*step*/ ctx[2].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*omosteps*/ 2 && t1_value !== (t1_value = /*step*/ ctx[2].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*omosteps*/ 2 && t3_value !== (t3_value = /*step*/ ctx[2].description + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:6) {#each omosteps as step}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[0] },
    			$$inline: true
    		});

    	let each_value = /*omosteps*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$2, 28, 4, 594);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$2, 26, 2, 531);
    			attr_dev(div2, "class", "bg-white flex justify-center pt-20 pb-40");
    			add_location(div2, file$2, 25, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(omoheader_1, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 1) omoheader_1_changes.omoheader = /*omoheader*/ ctx[0];
    			omoheader_1.$set(omoheader_1_changes);

    			if (dirty & /*omosteps*/ 2) {
    				each_value = /*omosteps*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(omoheader_1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { omoheader = {
    		title: "So gehts",
    		subtitle: "ganz einfach in 3 Schritten"
    	} } = $$props;

    	let { omosteps = [
    		{
    			title: "Step 1",
    			description: "description 1",
    			image: ""
    		},
    		{
    			title: "Step 2",
    			description: "description 2",
    			image: ""
    		},
    		{
    			title: "Step 3",
    			description: "description 3",
    			image: ""
    		}
    	] } = $$props;

    	const writable_props = ["omoheader", "omosteps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoSteps> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoSteps", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    		if ("omosteps" in $$props) $$invalidate(1, omosteps = $$props.omosteps);
    	};

    	$$self.$capture_state = () => ({ OmoHeader, omoheader, omosteps });

    	$$self.$inject_state = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    		if ("omosteps" in $$props) $$invalidate(1, omosteps = $$props.omosteps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omoheader, omosteps];
    }

    class OmoSteps extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { omoheader: 0, omosteps: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSteps",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get omoheader() {
    		throw new Error("<OmoSteps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<OmoSteps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omosteps() {
    		throw new Error("<OmoSteps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omosteps(value) {
    		throw new Error("<OmoSteps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCity.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/quanta/1-views/2-molecules/OmoCity.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let a1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let a0;
    	let t1_value = /*city*/ ctx[0].name + "";
    	let t1;
    	let a0_href_value;
    	let a1_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a1 = element("a");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			a0 = element("a");
    			t1 = text(t1_value);
    			if (img.src !== (img_src_value = /*city*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$3, 7, 6, 164);
    			attr_dev(a0, "href", a0_href_value = "city?id=" + /*city*/ ctx[0].id);
    			attr_dev(a0, "class", "text-2xl font-semibold");
    			set_style(a0, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(a0, file$3, 14, 8, 408);
    			attr_dev(div0, "class", "w-full px-4 py-2 text-center hover:bg-green-400 bg-blue-800\n        text-white");
    			add_location(div0, file$3, 11, 6, 299);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$3, 6, 4, 98);
    			attr_dev(a1, "href", a1_href_value = "city?id=" + /*city*/ ctx[0].id);
    			add_location(a1, file$3, 5, 2, 65);
    			attr_dev(div2, "class", "w-1/4 p-2");
    			add_location(div2, file$3, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a1);
    			append_dev(a1, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*city*/ 1 && img.src !== (img_src_value = /*city*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*city*/ 1 && t1_value !== (t1_value = /*city*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*city*/ 1 && a0_href_value !== (a0_href_value = "city?id=" + /*city*/ ctx[0].id)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*city*/ 1 && a1_href_value !== (a1_href_value = "city?id=" + /*city*/ ctx[0].id)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { city } = $$props;
    	const writable_props = ["city"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCity> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCity", $$slots, []);

    	$$self.$set = $$props => {
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    	};

    	$$self.$capture_state = () => ({ city });

    	$$self.$inject_state = $$props => {
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [city];
    }

    class OmoCity extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCity",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*city*/ ctx[0] === undefined && !("city" in props)) {
    			console.warn("<OmoCity> was created without expected prop 'city'");
    		}
    	}

    	get city() {
    		throw new Error("<OmoCity>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set city(value) {
    		throw new Error("<OmoCity>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/3-organisms/OmoCities.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/quanta/1-views/3-organisms/OmoCities.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (16:6) {#each cities as city, i (city.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let current;

    	const omocity = new OmoCity({
    			props: { city: /*city*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omocity.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omocity, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omocity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(16:6) {#each cities as city, i (city.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[0] },
    			$$inline: true
    		});

    	let each_value = /*cities*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*city*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$4, 14, 4, 393);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$4, 12, 2, 330);
    			attr_dev(div2, "class", "primary flex justify-center pt-20 pb-40");
    			add_location(div2, file$4, 11, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(omoheader_1, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 1) omoheader_1_changes.omoheader = /*omoheader*/ ctx[0];
    			omoheader_1.$set(omoheader_1_changes);

    			if (dirty & /*cities*/ 2) {
    				const each_value = /*cities*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader_1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader_1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(omoheader_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let cities = db.cities;

    	let { omoheader = {
    		title: "cities",
    		subtitle: "about the city campaign"
    	} } = $$props;

    	const writable_props = ["db", "omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCities", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({
    		OmoCity,
    		OmoHeader,
    		db,
    		cities,
    		omoheader
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("cities" in $$props) $$invalidate(1, cities = $$props.cities);
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omoheader, cities, db];
    }

    class OmoCities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { db: 2, omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCities",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[2] === undefined && !("db" in props)) {
    			console.warn("<OmoCities> was created without expected prop 'db'");
    		}
    	}

    	get db() {
    		throw new Error("<OmoCities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<OmoCities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omoheader() {
    		throw new Error("<OmoCities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<OmoCities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoUser.svelte generated by Svelte v3.20.1 */

    const file$5 = "src/quanta/1-views/2-molecules/OmoUser.svelte";

    function create_fragment$5(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let t2_value = /*user*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4_value = /*user*/ ctx[0].dream + "";
    	let t4;
    	let t5;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("\"");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = text("\"");
    			if (img.src !== (img_src_value = /*user*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$5, 15, 6, 356);
    			attr_dev(div0, "class", "text-2xl text-center p-4 text-gray-200 bg-blue-800 flex flex-wrap\n        justify-center content-center h-48");
    			set_style(div0, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(div0, file$5, 19, 6, 491);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$5, 14, 4, 290);
    			attr_dev(a, "href", a_href_value = "user?id=" + /*user*/ ctx[0].id);
    			add_location(a, file$5, 13, 2, 257);
    			attr_dev(div2, "class", "w-1/3 p-2");
    			add_location(div2, file$5, 12, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && img.src !== (img_src_value = /*user*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*user*/ 1 && t2_value !== (t2_value = /*user*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*user*/ 1 && t4_value !== (t4_value = /*user*/ ctx[0].dream + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*user*/ 1 && a_href_value !== (a_href_value = "user?id=" + /*user*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let { user } = $$props;
    	if (!user) users = db.uers.find(d => d.id == currentId);
    	const writable_props = ["db", "currentId", "user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoUser> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoUser", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({ db, currentId, user });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, db, currentId];
    }

    class OmoUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { db: 1, currentId: 2, user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoUser",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<OmoUser> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<OmoUser> was created without expected prop 'currentId'");
    		}

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<OmoUser> was created without expected prop 'user'");
    		}
    	}

    	get db() {
    		throw new Error("<OmoUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<OmoUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<OmoUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<OmoUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get user() {
    		throw new Error("<OmoUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<OmoUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/3-organisms/OmoUsers.svelte generated by Svelte v3.20.1 */
    const file$6 = "src/quanta/1-views/3-organisms/OmoUsers.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (17:6) {#each users as user, i (user.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const omouser = new OmoUser({
    			props: { user: /*user*/ ctx[3], db: /*db*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omouser.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omouser, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omouser_changes = {};
    			if (dirty & /*users*/ 1) omouser_changes.user = /*user*/ ctx[3];
    			if (dirty & /*db*/ 2) omouser_changes.db = /*db*/ ctx[1];
    			omouser.$set(omouser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omouser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omouser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omouser, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:6) {#each users as user, i (user.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[2] },
    			$$inline: true
    		});

    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$6, 15, 4, 409);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$6, 13, 2, 346);
    			attr_dev(div2, "class", "flex justify-center my-10 pt-20 pb-40");
    			add_location(div2, file$6, 12, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(omoheader_1, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 4) omoheader_1_changes.omoheader = /*omoheader*/ ctx[2];
    			omoheader_1.$set(omoheader_1_changes);

    			if (dirty & /*users, db*/ 3) {
    				const each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader_1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader_1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(omoheader_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { users } = $$props;

    	let { omoheader = {
    		title: "Unsere Fahrer",
    		subtitle: "subtitle"
    	} } = $$props;

    	if (!users) users = db.users;
    	const writable_props = ["db", "users", "omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoUsers> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoUsers", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    		if ("omoheader" in $$props) $$invalidate(2, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({ OmoHeader, OmoUser, db, users, omoheader });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    		if ("omoheader" in $$props) $$invalidate(2, omoheader = $$props.omoheader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [users, db, omoheader];
    }

    class OmoUsers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { db: 1, users: 0, omoheader: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoUsers",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<OmoUsers> was created without expected prop 'db'");
    		}

    		if (/*users*/ ctx[0] === undefined && !("users" in props)) {
    			console.warn("<OmoUsers> was created without expected prop 'users'");
    		}
    	}

    	get db() {
    		throw new Error("<OmoUsers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<OmoUsers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get users() {
    		throw new Error("<OmoUsers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<OmoUsers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omoheader() {
    		throw new Error("<OmoUsers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<OmoUsers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/Home.svelte generated by Svelte v3.20.1 */

    function create_fragment$7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const omoheader = new OmoHeader({
    			props: { omoheader: /*dreamheader*/ ctx[2] },
    			$$inline: true
    		});

    	const omovideo_1 = new OmoVideo({
    			props: { omovideo: /*omovideo*/ ctx[3] },
    			$$inline: true
    		});

    	const omosteps_1 = new OmoSteps({
    			props: { omosteps: /*omosteps*/ ctx[4] },
    			$$inline: true
    		});

    	const omousers = new OmoUsers({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omocities = new OmoCities({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(omoheader.$$.fragment);
    			t0 = space();
    			create_component(omovideo_1.$$.fragment);
    			t1 = space();
    			create_component(omosteps_1.$$.fragment);
    			t2 = space();
    			create_component(omousers.$$.fragment);
    			t3 = space();
    			create_component(omocities.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(omovideo_1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(omosteps_1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(omousers, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omocities, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_changes = {};
    			if (dirty & /*dreamheader*/ 4) omoheader_changes.omoheader = /*dreamheader*/ ctx[2];
    			omoheader.$set(omoheader_changes);
    			const omovideo_1_changes = {};
    			if (dirty & /*omovideo*/ 8) omovideo_1_changes.omovideo = /*omovideo*/ ctx[3];
    			omovideo_1.$set(omovideo_1_changes);
    			const omosteps_1_changes = {};
    			if (dirty & /*omosteps*/ 16) omosteps_1_changes.omosteps = /*omosteps*/ ctx[4];
    			omosteps_1.$set(omosteps_1_changes);
    			const omousers_changes = {};
    			if (dirty & /*db*/ 1) omousers_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omousers_changes.currentId = /*currentId*/ ctx[1];
    			omousers.$set(omousers_changes);
    			const omocities_changes = {};
    			if (dirty & /*db*/ 1) omocities_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omocities_changes.currentId = /*currentId*/ ctx[1];
    			omocities.$set(omocities_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader.$$.fragment, local);
    			transition_in(omovideo_1.$$.fragment, local);
    			transition_in(omosteps_1.$$.fragment, local);
    			transition_in(omousers.$$.fragment, local);
    			transition_in(omocities.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader.$$.fragment, local);
    			transition_out(omovideo_1.$$.fragment, local);
    			transition_out(omosteps_1.$$.fragment, local);
    			transition_out(omousers.$$.fragment, local);
    			transition_out(omocities.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(omovideo_1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(omosteps_1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omousers, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omocities, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { currentId } = $$props;

    	let { dreamheader = {
    		title: "Wir haben einen Traum...",
    		subtitle: "...stell dir vor du stehts auf und alles läuft"
    	} } = $$props;

    	let { omovideo = {
    		link: "https://www.youtube.com/embed/HfzZQvoJATA"
    	} } = $$props;

    	let { omosteps = [
    		{
    			title: "Step 1",
    			description: "description 1",
    			image: "images/through_the_park.svg"
    		},
    		{
    			title: "Step 2",
    			description: "description 2",
    			image: "images/through_the_park.svg"
    		},
    		{
    			title: "Step 3",
    			description: "description 3",
    			image: "images/through_the_park.svg"
    		}
    	] } = $$props;

    	const writable_props = ["db", "currentId", "dreamheader", "omovideo", "omosteps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("dreamheader" in $$props) $$invalidate(2, dreamheader = $$props.dreamheader);
    		if ("omovideo" in $$props) $$invalidate(3, omovideo = $$props.omovideo);
    		if ("omosteps" in $$props) $$invalidate(4, omosteps = $$props.omosteps);
    	};

    	$$self.$capture_state = () => ({
    		db,
    		currentId,
    		OmoHeader,
    		OmoVideo,
    		OmoSteps,
    		OmoCities,
    		OmoUsers,
    		dreamheader,
    		omovideo,
    		omosteps
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("dreamheader" in $$props) $$invalidate(2, dreamheader = $$props.dreamheader);
    		if ("omovideo" in $$props) $$invalidate(3, omovideo = $$props.omovideo);
    		if ("omosteps" in $$props) $$invalidate(4, omosteps = $$props.omosteps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, currentId, dreamheader, omovideo, omosteps];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			db: 0,
    			currentId: 1,
    			dreamheader: 2,
    			omovideo: 3,
    			omosteps: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<Home> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[1] === undefined && !("currentId" in props)) {
    			console.warn("<Home> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dreamheader() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dreamheader(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omovideo() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omovideo(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omosteps() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omosteps(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/user.svelte generated by Svelte v3.20.1 */
    const file$7 = "src/quanta/1-views/5-pages/user.svelte";

    function create_fragment$8(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let p;
    	let t1;
    	let t2_value = /*user*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4_value = /*user*/ ctx[0].dream + "";
    	let t4;
    	let t5;
    	let t6;
    	let div4;
    	let div3;
    	let div2;
    	let current;

    	const omocity = new OmoCity({
    			props: { city: /*city*/ ctx[2], db: /*db*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text("\"");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = text("\"");
    			t6 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			create_component(omocity.$$.fragment);
    			attr_dev(div0, "class", "py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap\n  bg-cover bg-center justify-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*user*/ ctx[0].image + "')");
    			attr_dev(div0, "title", "user");
    			add_location(div0, file$7, 9, 0, 249);
    			set_style(p, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(p, file$7, 17, 2, 571);
    			attr_dev(div1, "class", "text-5xl text-center px-4 py-16 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$7, 14, 0, 448);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$7, 23, 4, 756);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$7, 22, 2, 723);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$7, 21, 0, 681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(omocity, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*user*/ 1) {
    				set_style(div0, "background-image", "url('" + /*user*/ ctx[0].image + "')");
    			}

    			if ((!current || dirty & /*user*/ 1) && t2_value !== (t2_value = /*user*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*user*/ 1) && t4_value !== (t4_value = /*user*/ ctx[0].dream + "")) set_data_dev(t4, t4_value);
    			const omocity_changes = {};
    			if (dirty & /*db*/ 2) omocity_changes.db = /*db*/ ctx[1];
    			omocity.$set(omocity_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			destroy_component(omocity);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { user } = $$props;
    	let { currentId } = $$props;
    	if (!user) user = db.users.find(x => x.id == currentId);
    	let city = db.cities.find(x => x.id == user.city);
    	const writable_props = ["db", "user", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<User> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("User", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ OmoCity, db, user, currentId, city });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(2, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, db, city, currentId];
    }

    class User extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { db: 1, user: 0, currentId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<User> was created without expected prop 'db'");
    		}

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<User> was created without expected prop 'user'");
    		}

    		if (/*currentId*/ ctx[3] === undefined && !("currentId" in props)) {
    			console.warn("<User> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get user() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/City.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/quanta/1-views/5-pages/City.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let t_value = /*city*/ ctx[0].name + "";
    	let t;
    	let div_title_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center\n  justify-center overflow-hidden uppercase font-bolt text-white");
    			set_style(div, "background-image", "url('" + /*city*/ ctx[0].image + "')");
    			set_style(div, "font-family", "'Permanent Marker',\n  cursive", 1);
    			attr_dev(div, "title", div_title_value = /*city*/ ctx[0].name);
    			add_location(div, file$8, 9, 0, 303);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let city = db.cities.find(item => item.id == currentId);
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ OmoCity, db, currentId, city });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [city, db, currentId];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { db: 1, currentId: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<City> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<City> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<City>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<City>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<City>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<City>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // start of file - elizadata.js
    // data for elizabot.js
    // entries prestructured as layed out in Weizenbaum's description
    // [cf: Communications of the ACM, Vol. 9, #1 (January 1966): p 36-45.]

    var elizaInitials = [
    	"How do you do.  Please tell me your problem.",
    // additions (not original)
    	"Please tell me what's been bothering you.",
    	"Is something troubling you ?"
    ];

    var elizaFinals = [
    	"Goodbye.  It was nice talking to you.",
    // additions (not original)
    	"Goodbye.  This was really a nice talk.",
    	"Goodbye.  I'm looking forward to our next session.",
    	"This was a good session, wasn't it -- but time is over now.   Goodbye.",
    	"Maybe we could discuss this moreover in our next session ?   Goodbye."
    ];

    var elizaQuits = [
    	"bye",
    	"goodbye",
    	"done",
    	"exit",
    	"quit"
    ];

    var elizaPres = [
    	"dont", "don't",
    	"cant", "can't",
    	"wont", "won't",
    	"recollect", "remember",
    	"recall", "remember",
    	"dreamt", "dreamed",
    	"dreams", "dream",
    	"maybe", "perhaps",
    	"certainly", "yes",
    	"machine", "computer",
    	"machines", "computer",
    	"computers", "computer",
    	"were", "was",
    	"you're", "you are",
    	"i'm", "i am",
    	"same", "alike",
    	"identical", "alike",
    	"equivalent", "alike"
    ];

    var elizaPosts = [
    	"am", "are",
    	"your", "my",
    	"me", "you",
    	"myself", "yourself",
    	"yourself", "myself",
    	"i", "you",
    	"you", "I",
    	"my", "your",
    	"i'm", "you are"
    ];

    var elizaSynons = {
    	"be": ["am", "is", "are", "was"],
    	"belief": ["feel", "think", "believe", "wish"],
    	"cannot": ["can't"],
    	"desire": ["want", "need"],
    	"everyone": ["everybody", "nobody", "noone"],
    	"family": ["mother", "mom", "father", "dad", "sister", "brother", "wife", "children", "child"],
    	"happy": ["elated", "glad", "better"],
    	"sad": ["unhappy", "depressed", "sick"]
    };

    var elizaKeywords = [

    	/*
    	 Array of
    	 ["<key>", <rank>, [
    	 ["<decomp>", [
    	 "<reasmb>",
    	 "<reasmb>",
    	 "<reasmb>"
    	 ]],
    	 ["<decomp>", [
    	 "<reasmb>",
    	 "<reasmb>",
    	 "<reasmb>"
    	 ]]
    	 ]]
    	 */

    	["xnone", 0, [
    		["*", [
    			"I'm not sure I understand you fully.",
    			"Please go on.",
    			"What does that suggest to you ?",
    			"Do you feel strongly about discussing such things ?",
    			"That is interesting.  Please continue.",
    			"Tell me more about that.",
    			"Does talking about this bother you ?"
    		]]
    	]],
    	["sorry", 0, [
    		["*", [
    			"Please don't apologise.",
    			"Apologies are not necessary.",
    			"I've told you that apologies are not required.",
    			"It did not bother me.  Please continue."
    		]]
    	]],
    	["apologise", 0, [
    		["*", [
    			"goto sorry"
    		]]
    	]],
    	["remember", 5, [
    		["* i remember *", [
    			"Do you often think of (2) ?",
    			"Does thinking of (2) bring anything else to mind ?",
    			"What else do you recollect ?",
    			"Why do you remember (2) just now ?",
    			"What in the present situation reminds you of (2) ?",
    			"What is the connection between me and (2) ?",
    			"What else does (2) remind you of ?"
    		]],
    		["* do you remember *", [
    			"Did you think I would forget (2) ?",
    			"Why do you think I should recall (2) now ?",
    			"What about (2) ?",
    			"goto what",
    			"You mentioned (2) ?"
    		]],
    		["* you remember *", [
    			"How could I forget (2) ?",
    			"What about (2) should I remember ?",
    			"goto you"
    		]]
    	]],
    	["forget", 5, [
    		["* i forget *", [
    			"Can you think of why you might forget (2) ?",
    			"Why can't you remember (2) ?",
    			"How often do you think of (2) ?",
    			"Does it bother you to forget that ?",
    			"Could it be a mental block ?",
    			"Are you generally forgetful ?",
    			"Do you think you are suppressing (2) ?"
    		]],
    		["* did you forget *", [
    			"Why do you ask ?",
    			"Are you sure you told me ?",
    			"Would it bother you if I forgot (2) ?",
    			"Why should I recall (2) just now ?",
    			"goto what",
    			"Tell me more about (2)."
    		]]
    	]],
    	["if", 3, [
    		["* if *", [
    			"Do you think it's likely that (2) ?",
    			"Do you wish that (2) ?",
    			"What do you know about (2) ?",
    			"Really, if (2) ?",
    			"What would you do if (2) ?",
    			"But what are the chances that (2) ?",
    			"What does this speculation lead to ?"
    		]]
    	]],
    	["dreamed", 4, [
    		["* i dreamed *", [
    			"Really, (2) ?",
    			"Have you ever fantasized (2) while you were awake ?",
    			"Have you ever dreamed (2) before ?",
    			"goto dream"
    		]]
    	]],
    	["dream", 3, [
    		["*", [
    			"What does that dream suggest to you ?",
    			"Do you dream often ?",
    			"What persons appear in your dreams ?",
    			"Do you believe that dreams have something to do with your problem ?"
    		]]
    	]],
    	["perhaps", 0, [
    		["*", [
    			"You don't seem quite certain.",
    			"Why the uncertain tone ?",
    			"Can't you be more positive ?",
    			"You aren't sure ?",
    			"Don't you know ?",
    			"How likely, would you estimate ?"
    		]]
    	]],
    	["name", 15, [
    		["*", [
    			"I am not interested in names.",
    			"I've told you before, I don't care about names -- please continue."
    		]]
    	]],
    	["deutsch", 0, [
    		["*", [
    			"goto xforeign",
    			"I told you before, I don't understand German."
    		]]
    	]],
    	["francais", 0, [
    		["*", [
    			"goto xforeign",
    			"I told you before, I don't understand French."
    		]]
    	]],
    	["italiano", 0, [
    		["*", [
    			"goto xforeign",
    			"I told you before, I don't understand Italian."
    		]]
    	]],
    	["espanol", 0, [
    		["*", [
    			"goto xforeign",
    			"I told you before, I don't understand Spanish."
    		]]
    	]],
    	["xforeign", 0, [
    		["*", [
    			"I speak only English."
    		]]
    	]],
    	["hello", 0, [
    		["*", [
    			"How do you do.  Please state your problem.",
    			"Hi.  What seems to be your problem ?"
    		]]
    	]],
    	["computer", 50, [
    		["*", [
    			"Do computers worry you ?",
    			"Why do you mention computers ?",
    			"What do you think machines have to do with your problem ?",
    			"Don't you think computers can help people ?",
    			"What about machines worries you ?",
    			"What do you think about machines ?",
    			"You don't think I am a computer program, do you ?"
    		]]
    	]],
    	["am", 0, [
    		["* am i *", [
    			"Do you believe you are (2) ?",
    			"Would you want to be (2) ?",
    			"Do you wish I would tell you you are (2) ?",
    			"What would it mean if you were (2) ?",
    			"goto what"
    		]],
    		["* i am *", [
    			"goto i"
    		]],
    		["*", [
    			"Why do you say 'am' ?",
    			"I don't understand that."
    		]]
    	]],
    	["are", 0, [
    		["* are you *", [
    			"Why are you interested in whether I am (2) or not ?",
    			"Would you prefer if I weren't (2) ?",
    			"Perhaps I am (2) in your fantasies.",
    			"Do you sometimes think I am (2) ?",
    			"goto what",
    			"Would it matter to you ?",
    			"What if I were (2) ?"
    		]],
    		["* you are *", [
    			"goto you"
    		]],
    		["* are *", [
    			"Did you think they might not be (2) ?",
    			"Would you like it if they were not (2) ?",
    			"What if they were not (2) ?",
    			"Are they always (2) ?",
    			"Possibly they are (2).",
    			"Are you positive they are (2) ?"
    		]]
    	]],
    	["your", 0, [
    		["* your *", [
    			"Why are you concerned over my (2) ?",
    			"What about your own (2) ?",
    			"Are you worried about someone else's (2) ?",
    			"Really, my (2) ?",
    			"What makes you think of my (2) ?",
    			"Do you want my (2) ?"
    		]]
    	]],
    	["was", 2, [
    		["* was i *", [
    			"What if you were (2) ?",
    			"Do you think you were (2) ?",
    			"Were you (2) ?",
    			"What would it mean if you were (2) ?",
    			"What does ' (2) ' suggest to you ?",
    			"goto what"
    		]],
    		["* i was *", [
    			"Were you really ?",
    			"Why do you tell me you were (2) now ?",
    			"Perhaps I already know you were (2)."
    		]],
    		["* was you *", [
    			"Would you like to believe I was (2) ?",
    			"What suggests that I was (2) ?",
    			"What do you think ?",
    			"Perhaps I was (2).",
    			"What if I had been (2) ?"
    		]]
    	]],
    	["i", 0, [
    		["* i @desire *", [
    			"What would it mean to you if you got (3) ?",
    			"Why do you want (3) ?",
    			"Suppose you got (3) soon.",
    			"What if you never got (3) ?",
    			"What would getting (3) mean to you ?",
    			"What does wanting (3) have to do with this discussion ?"
    		]],
    		["* i am* @sad *", [
    			"I am sorry to hear that you are (3).",
    			"Do you think coming here will help you not to be (3) ?",
    			"I'm sure it's not pleasant to be (3).",
    			"Can you explain what made you (3) ?"
    		]],
    		["* i am* @happy *", [
    			"How have I helped you to be (3) ?",
    			"Has your treatment made you (3) ?",
    			"What makes you (3) just now ?",
    			"Can you explain why you are suddenly (3) ?"
    		]],
    		["* i was *", [
    			"goto was"
    		]],
    		["* i @belief i *", [
    			"Do you really think so ?",
    			"But you are not sure you (3).",
    			"Do you really doubt you (3) ?"
    		]],
    		["* i* @belief *you *", [
    			"goto you"
    		]],
    		["* i am *", [
    			"Is it because you are (2) that you came to me ?",
    			"How long have you been (2) ?",
    			"Do you believe it is normal to be (2) ?",
    			"Do you enjoy being (2) ?",
    			"Do you know anyone else who is (2) ?"
    		]],
    		["* i @cannot *", [
    			"How do you know that you can't (3) ?",
    			"Have you tried ?",
    			"Perhaps you could (3) now.",
    			"Do you really want to be able to (3) ?",
    			"What if you could (3) ?"
    		]],
    		["* i don't *", [
    			"Don't you really (2) ?",
    			"Why don't you (2) ?",
    			"Do you wish to be able to (2) ?",
    			"Does that trouble you ?"
    		]],
    		["* i feel *", [
    			"Tell me more about such feelings.",
    			"Do you often feel (2) ?",
    			"Do you enjoy feeling (2) ?",
    			"Of what does feeling (2) remind you ?"
    		]],
    		["* i * you *", [
    			"Perhaps in your fantasies we (2) each other.",
    			"Do you wish to (2) me ?",
    			"You seem to need to (2) me.",
    			"Do you (2) anyone else ?"
    		]],
    		["*", [
    			"You say (1) ?",
    			"Can you elaborate on that ?",
    			"Do you say (1) for some special reason ?",
    			"That's quite interesting."
    		]]
    	]],
    	["you", 0, [
    		["* you remind me of *", [
    			"goto alike"
    		]],
    		["* you are *", [
    			"What makes you think I am (2) ?",
    			"Does it please you to believe I am (2) ?",
    			"Do you sometimes wish you were (2) ?",
    			"Perhaps you would like to be (2)."
    		]],
    		["* you* me *", [
    			"Why do you think I (2) you ?",
    			"You like to think I (2) you -- don't you ?",
    			"What makes you think I (2) you ?",
    			"Really, I (2) you ?",
    			"Do you wish to believe I (2) you ?",
    			"Suppose I did (2) you -- what would that mean ?",
    			"Does someone else believe I (2) you ?"
    		]],
    		["* you *", [
    			"We were discussing you -- not me.",
    			"Oh, I (2) ?",
    			"You're not really talking about me -- are you ?",
    			"What are your feelings now ?"
    		]]
    	]],
    	["yes", 0, [
    		["*", [
    			"You seem to be quite positive.",
    			"You are sure.",
    			"I see.",
    			"I understand."
    		]]
    	]],
    	["no", 0, [
    		["* no one *", [
    			"Are you sure, no one (2) ?",
    			"Surely someone (2) .",
    			"Can you think of anyone at all ?",
    			"Are you thinking of a very special person ?",
    			"Who, may I ask ?",
    			"You have a particular person in mind, don't you ?",
    			"Who do you think you are talking about ?"
    		]],
    		["*", [
    			"Are you saying no just to be negative?",
    			"You are being a bit negative.",
    			"Why not ?",
    			"Why 'no' ?"
    		]]
    	]],
    	["my", 2, [
    		["$ * my *", [
    			"Does that have anything to do with the fact that your (2) ?",
    			"Lets discuss further why your (2).",
    			"Earlier you said your (2).",
    			"But your (2)."
    		]],
    		["* my* @family *", [
    			"Tell me more about your family.",
    			"Who else in your family (4) ?",
    			"Your (3) ?",
    			"What else comes to your mind when you think of your (3) ?"
    		]],
    		["* my *", [
    			"Your (2) ?",
    			"Why do you say your (2) ?",
    			"Does that suggest anything else which belongs to you ?",
    			"Is it important to you that your (2) ?"
    		]]
    	]],
    	["can", 0, [
    		["* can you *", [
    			"You believe I can (2) don't you ?",
    			"goto what",
    			"You want me to be able to (2).",
    			"Perhaps you would like to be able to (2) yourself."
    		]],
    		["* can i *", [
    			"Whether or not you can (2) depends on you more than on me.",
    			"Do you want to be able to (2) ?",
    			"Perhaps you don't want to (2).",
    			"goto what"
    		]]
    	]],
    	["what", 0, [
    		["*", [
    			"Why do you ask ?",
    			"Does that question interest you ?",
    			"What is it you really want to know ?",
    			"Are such questions much on your mind ?",
    			"What answer would please you most ?",
    			"What do you think ?",
    			"What comes to mind when you ask that ?",
    			"Have you asked such questions before ?",
    			"Have you asked anyone else ?"
    		]]
    	]],
    	["who", 0, [
    		["who *", [
    			"goto what"
    		]]
    	]],
    	["when", 0, [
    		["when *", [
    			"goto what"
    		]]
    	]],
    	["where", 0, [
    		["where *", [
    			"goto what"
    		]]
    	]],
    	["how", 0, [
    		["how *", [
    			"goto what"
    		]]
    	]],
    	["because", 0, [
    		["*", [
    			"Is that the real reason ?",
    			"Don't any other reasons come to mind ?",
    			"Does that reason seem to explain anything else ?",
    			"What other reasons might there be ?"
    		]]
    	]],
    	["why", 0, [
    		["* why don't you *", [
    			"Do you believe I don't (2) ?",
    			"Perhaps I will (2) in good time.",
    			"Should you (2) yourself ?",
    			"You want me to (2) ?",
    			"goto what"
    		]],
    		["* why can't i *", [
    			"Do you think you should be able to (2) ?",
    			"Do you want to be able to (2) ?",
    			"Do you believe this will help you to (2) ?",
    			"Have you any idea why you can't (2) ?",
    			"goto what"
    		]],
    		["*", [
    			"goto what"
    		]]
    	]],
    	["everyone", 2, [
    		["* @everyone *", [
    			"Really, (2) ?",
    			"Surely not (2).",
    			"Can you think of anyone in particular ?",
    			"Who, for example?",
    			"Are you thinking of a very special person ?",
    			"Who, may I ask ?",
    			"Someone special perhaps ?",
    			"You have a particular person in mind, don't you ?",
    			"Who do you think you're talking about ?"
    		]]
    	]],
    	["everybody", 2, [
    		["*", [
    			"goto everyone"
    		]]
    	]],
    	["nobody", 2, [
    		["*", [
    			"goto everyone"
    		]]
    	]],
    	["noone", 2, [
    		["*", [
    			"goto everyone"
    		]]
    	]],
    	["always", 1, [
    		["*", [
    			"Can you think of a specific example ?",
    			"When ?",
    			"What incident are you thinking of ?",
    			"Really, always ?"
    		]]
    	]],
    	["alike", 10, [
    		["*", [
    			"In what way ?",
    			"What resemblence do you see ?",
    			"What does that similarity suggest to you ?",
    			"What other connections do you see ?",
    			"What do you suppose that resemblence means ?",
    			"What is the connection, do you suppose ?",
    			"Could there really be some connection ?",
    			"How ?"
    		]]
    	]],
    	["like", 10, [
    		["* @be *like *", [
    			"goto alike"
    		]]
    	]],
    	["different", 0, [
    		["*", [
    			"How is it different ?",
    			"What differences do you see ?",
    			"What does that difference suggest to you ?",
    			"What other distinctions do you see ?",
    			"What do you suppose that disparity means ?",
    			"Could there be some connection, do you suppose ?",
    			"How ?"
    		]]
    	]]

    ];

    // regexp/replacement pairs to be performed as final cleanings
    // here: cleanings for multiple bots talking to each other
    var elizaPostTransforms = [
    	/ old old/g, " old",
    	/\bthey were( not)? me\b/g, "it was$1 me",
    	/\bthey are( not)? me\b/g, "it is$1 me",
    	/Are they( always)? me\b/, "it is$1 me",
    	/\bthat your( own)? (\w+)( now)? \?/, "that you have your$1 $2 ?",
    	/\bI to have (\w+)/, "I have $1",
    	/Earlier you said your( own)? (\w+)( now)?\./, "Earlier you talked about your $2."
    ];

    // eof

    var elizadata = {
    	elizaInitials: elizaInitials,
    	elizaFinals: elizaFinals,
    	elizaQuits: elizaQuits,
    	elizaPres: elizaPres,
    	elizaPosts: elizaPosts,
    	elizaSynons: elizaSynons,
    	elizaKeywords: elizaKeywords,
    	elizaPostTransforms: elizaPostTransforms
    };

    /*
      elizabot.js v.1.1 - ELIZA JS library (N.Landsteiner 2005)
      Eliza is a mock Rogerian psychotherapist.
      Original program by Joseph Weizenbaum in MAD-SLIP for "Project MAC" at MIT.
      cf: Weizenbaum, Joseph "ELIZA - A Computer Program For the Study of Natural Language
          Communication Between Man and Machine"
          in: Communications of the ACM; Volume 9 , Issue 1 (January 1966): p 36-45.
      JavaScript implementation by Norbert Landsteiner 2005; <http://www.masserk.at>

      synopsis:

             new ElizaBot( <random-choice-disable-flag> )
             ElizaBot.prototype.transform( <inputstring> )
             ElizaBot.prototype.getInitial()
             ElizaBot.prototype.getFinal()
             ElizaBot.prototype.reset()

      usage: var eliza = new ElizaBot();
             var initial = eliza.getInitial();
             var reply = eliza.transform(inputstring);
             if (eliza.quit) {
                 // last user input was a quit phrase
             }

             // method `transform()' returns a final phrase in case of a quit phrase
             // but you can also get a final phrase with:
             var final = eliza.getFinal();

             // other methods: reset memory and internal state
             eliza.reset();

             // to set the internal memory size override property `memSize':
             eliza.memSize = 100; // (default: 20)

             // to reproduce the example conversation given by J. Weizenbaum
             // initialize with the optional random-choice-disable flag
             var originalEliza = new ElizaBot(true);

      `ElizaBot' is also a general chatbot engine that can be supplied with any rule set.
      (for required data structures cf. "elizadata.js" and/or see the documentation.)
      data is parsed and transformed for internal use at the creation time of the
      first instance of the `ElizaBot' constructor.

      vers 1.1: lambda functions in RegExps are currently a problem with too many browsers.
                changed code to work around.
    */



    function ElizaBot(noRandomFlag) {
    	this.noRandom= (noRandomFlag)? true:false;
    	this.capitalizeFirstLetter=true;
    	this.debug=false;
    	this.memSize=20;
    	this.version="1.1 (original)";
    	if (!this._dataParsed) this._init();
    	this.reset();
    }

    ElizaBot.prototype.reset = function() {
    	this.quit=false;
    	this.mem=[];
    	this.lastchoice=[];
    	for (var k=0; k<elizadata.elizaKeywords.length; k++) {
    		this.lastchoice[k]=[];
    		var rules=elizadata.elizaKeywords[k][2];
    		for (var i=0; i<rules.length; i++) this.lastchoice[k][i]=-1;
    	}
    };

    ElizaBot.prototype._dataParsed = false;

    ElizaBot.prototype._init = function() {
    	// parse data and convert it from canonical form to internal use
    	// produce synonym list
    	var synPatterns={};
    	if ((elizadata.elizaSynons) && (typeof elizadata.elizaSynons == 'object')) {
    		for (var i in elizadata.elizaSynons) synPatterns[i]='('+i+'|'+elizadata.elizaSynons[i].join('|')+')';
    	}
    	// check for keywords or install empty structure to prevent any errors
    	if ((!elizadata.elizaKeywords) || (typeof elizadata.elizaKeywords.length == 'undefined')) {
    		elizadata.elizaKeywords=[['###',0,[['###',[]]]]];
    	}
    	// 1st convert rules to regexps
    	// expand synonyms and insert asterisk expressions for backtracking
    	var sre=/@(\S+)/;
    	var are=/(\S)\s*\*\s*(\S)/;
    	var are1=/^\s*\*\s*(\S)/;
    	var are2=/(\S)\s*\*\s*$/;
    	var are3=/^\s*\*\s*$/;
    	var wsre=/\s+/g;
    	for (var k=0; k<elizadata.elizaKeywords.length; k++) {
    		var rules=elizadata.elizaKeywords[k][2];
    		elizadata.elizaKeywords[k][3]=k; // save original index for sorting
    		for (var i=0; i<rules.length; i++) {
    			var r=rules[i];
    			// check mem flag and store it as decomp's element 2
    			if (r[0].charAt(0)=='$') {
    				var ofs=1;
    				while (r[0].charAt[ofs]==' ') ofs++;
    				r[0]=r[0].substring(ofs);
    				r[2]=true;
    			}
    			else {
    				r[2]=false;
    			}
    			// expand synonyms (v.1.1: work around lambda function)
    			var m=sre.exec(r[0]);
    			while (m) {
    				var sp=(synPatterns[m[1]])? synPatterns[m[1]]:m[1];
    				r[0]=r[0].substring(0,m.index)+sp+r[0].substring(m.index+m[0].length);
    				m=sre.exec(r[0]);
    			}
    			// expand asterisk expressions (v.1.1: work around lambda function)
    			if (are3.test(r[0])) {
    				r[0]='\\s*(.*)\\s*';
    			}
    			else {
    				m=are.exec(r[0]);
    				if (m) {
    					var lp='';
    					var rp=r[0];
    					while (m) {
    						lp+=rp.substring(0,m.index+1);
    						if (m[1]!=')') lp+='\\b';
    						lp+='\\s*(.*)\\s*';
    						if ((m[2]!='(') && (m[2]!='\\')) lp+='\\b';
    						lp+=m[2];
    						rp=rp.substring(m.index+m[0].length);
    						m=are.exec(rp);
    					}
    					r[0]=lp+rp;
    				}
    				m=are1.exec(r[0]);
    				if (m) {
    					var lp='\\s*(.*)\\s*';
    					if ((m[1]!=')') && (m[1]!='\\')) lp+='\\b';
    					r[0]=lp+r[0].substring(m.index-1+m[0].length);
    				}
    				m=are2.exec(r[0]);
    				if (m) {
    					var lp=r[0].substring(0,m.index+1);
    					if (m[1]!='(') lp+='\\b';
    					r[0]=lp+'\\s*(.*)\\s*';
    				}
    			}
    			// expand white space
    			r[0]=r[0].replace(wsre, '\\s+');
    			wsre.lastIndex=0;
    		}
    	}
    	// now sort keywords by rank (highest first)
    	elizadata.elizaKeywords.sort(this._sortKeywords);
    	// and compose regexps and refs for pres and posts
    	ElizaBot.prototype.pres={};
    	ElizaBot.prototype.posts={};
    	if ((elizadata.elizaPres) && (elizadata.elizaPres.length)) {
    		var a=new Array();
    		for (var i=0; i<elizadata.elizaPres.length; i+=2) {
    			a.push(elizadata.elizaPres[i]);
    			ElizaBot.prototype.pres[elizadata.elizaPres[i]]=elizadata.elizaPres[i+1];
    		}
    		ElizaBot.prototype.preExp = new RegExp('\\b('+a.join('|')+')\\b');
    	}
    	else {
    		// default (should not match)
    		ElizaBot.prototype.preExp = /####/;
    		ElizaBot.prototype.pres['####']='####';
    	}
    	if ((elizadata.elizaPosts) && (elizadata.elizaPosts.length)) {
    		var a=new Array();
    		for (var i=0; i<elizadata.elizaPosts.length; i+=2) {
    			a.push(elizadata.elizaPosts[i]);
    			ElizaBot.prototype.posts[elizadata.elizaPosts[i]]=elizadata.elizaPosts[i+1];
    		}
    		ElizaBot.prototype.postExp = new RegExp('\\b('+a.join('|')+')\\b');
    	}
    	else {
    		// default (should not match)
    		ElizaBot.prototype.postExp = /####/;
    		ElizaBot.prototype.posts['####']='####';
    	}
    	// check for elizaQuits and install default if missing
    	if ((!elizadata.elizaQuits) || (typeof elizadata.elizaQuits.length == 'undefined')) {
    		elizadata.elizaQuits=[];
    	}
    	// done
    	ElizaBot.prototype._dataParsed=true;
    };

    ElizaBot.prototype._sortKeywords = function(a,b) {
    	// sort by rank
    	if (a[1]>b[1]) return -1
    	else if (a[1]<b[1]) return 1
    	// or original index
    	else if (a[3]>b[3]) return 1
    	else if (a[3]<b[3]) return -1
    	else return 0;
    };

    ElizaBot.prototype.transform = function(text) {
    	var rpl='';
    	this.quit=false;
    	// unify text string
    	text=text.toLowerCase();
    	text=text.replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ');
    	text=text.replace(/\s+-+\s+/g, '.');
    	text=text.replace(/\s*[,\.\?!;]+\s*/g, '.');
    	text=text.replace(/\s*\bbut\b\s*/g, '.');
    	text=text.replace(/\s{2,}/g, ' ');
    	// split text in part sentences and loop through them
    	var parts=text.split('.');
    	for (var i=0; i<parts.length; i++) {
    		var part=parts[i];
    		if (part!='') {
    			// check for quit expression
    			for (var q=0; q<elizadata.elizaQuits.length; q++) {
    				if (elizadata.elizaQuits[q]==part) {
    					this.quit=true;
    					return this.getFinal();
    				}
    			}
    			// preprocess (v.1.1: work around lambda function)
    			var m=this.preExp.exec(part);
    			if (m) {
    				var lp='';
    				var rp=part;
    				while (m) {
    					lp+=rp.substring(0,m.index)+this.pres[m[1]];
    					rp=rp.substring(m.index+m[0].length);
    					m=this.preExp.exec(rp);
    				}
    				part=lp+rp;
    			}
    			this.sentence=part;
    			// loop trough keywords
    			for (var k=0; k<elizadata.elizaKeywords.length; k++) {
    				if (part.search(new RegExp('\\b'+elizadata.elizaKeywords[k][0]+'\\b', 'i'))>=0) {
    					rpl = this._execRule(k);
    				}
    				if (rpl!='') return rpl;
    			}
    		}
    	}
    	// nothing matched try mem
    	rpl=this._memGet();
    	// if nothing in mem, so try xnone
    	if (rpl=='') {
    		this.sentence=' ';
    		var k=this._getRuleIndexByKey('xnone');
    		if (k>=0) rpl=this._execRule(k);
    	}
    	// return reply or default string
    	return (rpl!='')? rpl : 'I am at a loss for words.';
    };

    ElizaBot.prototype._execRule = function(k) {
    	var rule=elizadata.elizaKeywords[k];
    	var decomps=rule[2];
    	var paramre=/\(([0-9]+)\)/;
    	for (var i=0; i<decomps.length; i++) {
    		var m=this.sentence.match(decomps[i][0]);
    		if (m!=null) {
    			var reasmbs=decomps[i][1];
    			var memflag=decomps[i][2];
    			var ri= (this.noRandom)? 0 : Math.floor(Math.random()*reasmbs.length);
    			if (((this.noRandom) && (this.lastchoice[k][i]>ri)) || (this.lastchoice[k][i]==ri)) {
    				ri= ++this.lastchoice[k][i];
    				if (ri>=reasmbs.length) {
    					ri=0;
    					this.lastchoice[k][i]=-1;
    				}
    			}
    			else {
    				this.lastchoice[k][i]=ri;
    			}
    			var rpl=reasmbs[ri];
    			if (this.debug) alert('match:\nkey: '+elizadata.elizaKeywords[k][0]+
    				'\nrank: '+elizadata.elizaKeywords[k][1]+
    				'\ndecomp: '+decomps[i][0]+
    				'\nreasmb: '+rpl+
    				'\nmemflag: '+memflag);
    			if (rpl.search('^goto ', 'i')==0) {
    				ki=this._getRuleIndexByKey(rpl.substring(5));
    				if (ki>=0) return this._execRule(ki);
    			}
    			// substitute positional params (v.1.1: work around lambda function)
    			var m1=paramre.exec(rpl);
    			if (m1) {
    				var lp='';
    				var rp=rpl;
    				while (m1) {
    					var param = m[parseInt(m1[1])];
    					// postprocess param
    					var m2=this.postExp.exec(param);
    					if (m2) {
    						var lp2='';
    						var rp2=param;
    						while (m2) {
    							lp2+=rp2.substring(0,m2.index)+this.posts[m2[1]];
    							rp2=rp2.substring(m2.index+m2[0].length);
    							m2=this.postExp.exec(rp2);
    						}
    						param=lp2+rp2;
    					}
    					lp+=rp.substring(0,m1.index)+param;
    					rp=rp.substring(m1.index+m1[0].length);
    					m1=paramre.exec(rp);
    				}
    				rpl=lp+rp;
    			}
    			rpl=this._postTransform(rpl);
    			if (memflag) this._memSave(rpl);
    			else return rpl;
    		}
    	}
    	return '';
    };

    ElizaBot.prototype._postTransform = function(s) {
    	// final cleanings
    	s=s.replace(/\s{2,}/g, ' ');
    	s=s.replace(/\s+\./g, '.');
    	if ((elizadata.elizaPostTransforms) && (elizadata.elizaPostTransforms.length)) {
    		for (var i=0; i<elizadata.elizaPostTransforms.length; i+=2) {
    			s=s.replace(elizadata.elizaPostTransforms[i], elizadata.elizaPostTransforms[i+1]);
    			elizadata.elizaPostTransforms[i].lastIndex=0;
    		}
    	}
    	// capitalize first char (v.1.1: work around lambda function)
    	if (this.capitalizeFirstLetter) {
    		var re=/^([a-z])/;
    		var m=re.exec(s);
    		if (m) s=m[0].toUpperCase()+s.substring(1);
    	}
    	return s;
    };

    ElizaBot.prototype._getRuleIndexByKey = function(key) {
    	for (var k=0; k<elizadata.elizaKeywords.length; k++) {
    		if (elizadata.elizaKeywords[k][0]==key) return k;
    	}
    	return -1;
    };

    ElizaBot.prototype._memSave = function(t) {
    	this.mem.push(t);
    	if (this.mem.length>this.memSize) this.mem.shift();
    };

    ElizaBot.prototype._memGet = function() {
    	if (this.mem.length) {
    		if (this.noRandom) return this.mem.shift();
    		else {
    			var n=Math.floor(Math.random()*this.mem.length);
    			var rpl=this.mem[n];
    			for (var i=n+1; i<this.mem.length; i++) this.mem[i-1]=this.mem[i];
    			this.mem.length--;
    			return rpl;
    		}
    	}
    	else return '';
    };

    ElizaBot.prototype.getFinal = function() {
    	if (!elizadata.elizaFinals) return '';
    	return elizadata.elizaFinals[Math.floor(Math.random()*elizadata.elizaFinals.length)];
    };

    ElizaBot.prototype.getInitial = function() {
    	if (!elizadata.elizaInitials) return '';
    	return elizadata.elizaInitials[Math.floor(Math.random()*elizadata.elizaInitials.length)];
    };


    // fix array.prototype methods (push, shift) if not implemented (MSIE fix)
    if (typeof Array.prototype.push == 'undefined') {
    	Array.prototype.push=function(v) { return this[this.length]=v; };
    }
    if (typeof Array.prototype.shift == 'undefined') {
    	Array.prototype.shift=function() {
    		if (this.length==0) return null;
    		var e0=this[0];
    		for (var i=1; i<this.length; i++) this[i-1]=this[i];
    		this.length--;
    		return e0;
    	};
    }

    var elizabot = ElizaBot;

    /* src/quanta/1-views/5-pages/Chat.svelte generated by Svelte v3.20.1 */
    const file$9 = "src/quanta/1-views/5-pages/Chat.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (83:6) {#each comments as comment}
    function create_each_block$3(ctx) {
    	let article;
    	let span;
    	let t0_value = /*comment*/ ctx[8].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			article = element("article");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "text-ci text-xl p-2 text-lg rounded");
    			set_style(span, "font-family", "'Indie Flower'", 1);
    			toggle_class(span, "text-ci-2", /*comment*/ ctx[8].author === "eliza");
    			add_location(span, file$9, 84, 10, 3868);
    			attr_dev(article, "class", "m-1  svelte-14e6lzm");
    			toggle_class(article, "left", /*comment*/ ctx[8].author != "");
    			add_location(article, file$9, 83, 8, 3801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, span);
    			append_dev(span, t0);
    			append_dev(article, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comments*/ 2 && t0_value !== (t0_value = /*comment*/ ctx[8].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*comments*/ 2) {
    				toggle_class(span, "text-ci-2", /*comment*/ ctx[8].author === "eliza");
    			}

    			if (dirty & /*comments*/ 2) {
    				toggle_class(article, "left", /*comment*/ ctx[8].author != "");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(83:6) {#each comments as comment}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let footer;
    	let div4;
    	let div3;
    	let input;
    	let dispose;
    	let each_value = /*comments*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			footer = element("footer");
    			div4 = element("div");
    			div3 = element("div");
    			input = element("input");
    			attr_dev(div0, "class", "scrollable");
    			set_style(div0, "display", "flex");
    			set_style(div0, "flex-direction", "column");
    			set_style(div0, "align-items", "flex-end");
    			add_location(div0, file$9, 78, 4, 3635);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$9, 77, 2, 3602);
    			attr_dev(div2, "class", "flex flex-1 justify-center ");
    			set_style(div2, "height", "calc('100%-100px')");
    			add_location(div2, file$9, 76, 0, 3524);
    			attr_dev(input, "class", "block w-full text-gray-700 border border-gray-500 rounded py-2\n        px-4 leading-tight focus:outline-none focus:bg-white\n        focus:border-gray-500");
    			attr_dev(input, "id", "chat-text");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Gebe hier deine Antwort ein");
    			set_style(input, "font-family", "'Indie Flower'", 1);
    			add_location(input, file$9, 100, 6, 4340);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6 px-3");
    			add_location(div3, file$9, 99, 4, 4300);
    			attr_dev(div4, "class", "flex flex-wrap -mx-3 justify-center");
    			add_location(div4, file$9, 98, 2, 4246);
    			attr_dev(footer, "class", "w-full text-center border-t border-grey bg-gray-300 p-4 sticky bottom-0");
    			add_location(footer, file$9, 96, 0, 4153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[7](div0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div4);
    			append_dev(div4, div3);
    			append_dev(div3, input);
    			if (remount) dispose();
    			dispose = listen_dev(input, "keydown", /*handleKeydown*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*comments*/ 2) {
    				each_value = /*comments*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			/*div0_binding*/ ctx[7](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(footer);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let chat = [
    		"Hi schön das du an diesem tollen Projekt interessiert bist, ich heiße James und wie heißt du?",
    		"Cool, woher kommst du denn?",
    		"Möchtest du einen Opa kennenlernen, oder möchtest du dich oder einen deiner Bewohner registrieren?",
    		"Das ist ja Klasse, wir werden bestimmt den richtigen Enkel für dich finden. Bitte sage mir zuerst in welcher Kategorie du dich registrieren möchtest. Ich hätte folgende zur Auswahl: " + "1-Persönliches treffen 2-Reden (Telefon/Internet) 3-Schreiben (Briefe, Emails, etc.) 4-Unternehmungen",
    		"Cool, du möchtest also etwas unternehmen. Bist du denn sonst auch so aktiv?",
    		"Das ist ja interessant, ich merke schon dein 'Enkel' wird sicher viel Spaß mit dir haben. An was für Unterehmungen hast du Spaß? Eher sportlich oder eher ruhig?",
    		"Klasse. Was hast du denn sonst für Interessen und Hobbies?",
    		"Gibt es auch Dinge mit denen du Schwierigkeiten hast?",
    		"Das klingt ja garnicht so schlimm. Woher kommst du denn?",
    		"Cool, in Memmingen haben wir eine große Gemeinschaft und einen aktiven Blog, da findest du bestimmt schnell jemanden. Was sind den deine 3 größten Wünsche die du noch hast, oder bist du wunschlos glücklick?",
    		"Danke Peter, jetzt haben wir schon fast alles, ich würde dich gerne registrieren. Wie möchtest du dich in Zukunft anmelden? 1-Ich kann dir eine Email senden 2-Über ein soziales Netzwerk 3-klassisch mit Passwort 4-Per SMS oder InstantMessenger",
    		"Klasse! Damit ich dir eine Email senden kann brauche ich noch deine Email Adresse",
    		"Vielen Dank Peter, danke das du dich registriert hast. Um sicher zu stellen das du eine echte Person bist, wird sich Mitarbeiter diesen Chatverlauf ansehen und dich ggf. Noch einmal anschreiben. Bis dein Konto verifiziert ist kannst du dich gerne hier umsehen und",
    		"zum Beispiel den Blog deiner Stadt lesen. Vielen Dank für das tolle Gespräch!"
    	];

    	let div;
    	let autoscroll;

    	beforeUpdate(() => {
    		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
    	});

    	afterUpdate(() => {
    		if (autoscroll) div.scrollTo(0, div.scrollHeight);
    	});

    	const eliza = new elizabot();
    	let i = 0;
    	let comments = [{ author: "eliza", text: chat[i++] }];

    	function handleKeydown(event) {
    		if (event.which === 13) {
    			const text = event.target.value;
    			if (!text) return;
    			$$invalidate(1, comments = comments.concat({ author: "user", text }));
    			event.target.value = "";

    			// const reply = eliza.transform(text);
    			const reply = chat[i++];

    			setTimeout(
    				() => {
    					$$invalidate(1, comments = comments.concat({
    						author: "eliza",
    						text: "...",
    						placeholder: true
    					}));

    					setTimeout(
    						() => {
    							$$invalidate(1, comments = comments.filter(comment => !comment.placeholder).concat({ author: "eliza", text: reply }));
    						},
    						500 + Math.random() * 500
    					);
    				},
    				200 + Math.random() * 200
    			);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chat> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Chat", $$slots, []);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, div = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Eliza: elizabot,
    		beforeUpdate,
    		afterUpdate,
    		chat,
    		div,
    		autoscroll,
    		eliza,
    		i,
    		comments,
    		handleKeydown
    	});

    	$$self.$inject_state = $$props => {
    		if ("chat" in $$props) chat = $$props.chat;
    		if ("div" in $$props) $$invalidate(0, div = $$props.div);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    		if ("i" in $$props) i = $$props.i;
    		if ("comments" in $$props) $$invalidate(1, comments = $$props.comments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [div, comments, handleKeydown, autoscroll, i, chat, eliza, div0_binding];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const router = {
        '/': Home,
        '/home': Home,
        '/user': User,
        '/city': City,
        '/chat': Chat,
    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quanta/1-views/0-themes/OmoDesignBase.svelte generated by Svelte v3.20.1 */

    function create_fragment$b(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoDesignBase> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoDesignBase", $$slots, []);
    	return [];
    }

    class OmoDesignBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignBase",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoDesignUtilities.svelte generated by Svelte v3.20.1 */

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoDesignUtilities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoDesignUtilities", $$slots, []);
    	return [];
    }

    class OmoDesignUtilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignUtilities",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoThemeLight.svelte generated by Svelte v3.20.1 */

    function create_fragment$d(ctx) {
    	let t;
    	let current;
    	const omodesignbase = new OmoDesignBase({ $$inline: true });
    	const omodesignutilities = new OmoDesignUtilities({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omodesignbase.$$.fragment);
    			t = space();
    			create_component(omodesignutilities.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omodesignbase, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(omodesignutilities, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omodesignbase.$$.fragment, local);
    			transition_in(omodesignutilities.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omodesignbase.$$.fragment, local);
    			transition_out(omodesignutilities.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omodesignbase, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(omodesignutilities, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoThemeLight> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoThemeLight", $$slots, []);
    	$$self.$capture_state = () => ({ OmoDesignBase, OmoDesignUtilities });
    	return [];
    }

    class OmoThemeLight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoThemeLight",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoButton.svelte generated by Svelte v3.20.1 */

    const file$a = "src/quanta/1-views/1-atoms/OmoButton.svelte";

    function create_fragment$e(ctx) {
    	let a;
    	let button_1;
    	let t_value = /*button*/ ctx[0].text + "";
    	let t;
    	let button_1_class_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			button_1 = element("button");
    			t = text(t_value);
    			attr_dev(button_1, "class", button_1_class_value = "" + (/*button*/ ctx[0].theme + " bg-blue-800 hover:bg-green-500 text-white px-3 py-1\n    rounded-full font-bolt"));
    			set_style(button_1, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(button_1, file$a, 9, 2, 122);
    			attr_dev(a, "href", a_href_value = /*button*/ ctx[0].link);
    			add_location(a, file$a, 8, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button_1);
    			append_dev(button_1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*button*/ 1 && t_value !== (t_value = /*button*/ ctx[0].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*button*/ 1 && button_1_class_value !== (button_1_class_value = "" + (/*button*/ ctx[0].theme + " bg-blue-800 hover:bg-green-500 text-white px-3 py-1\n    rounded-full font-bolt"))) {
    				attr_dev(button_1, "class", button_1_class_value);
    			}

    			if (dirty & /*button*/ 1 && a_href_value !== (a_href_value = /*button*/ ctx[0].link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { button = { text: "button", link: "", theme: "" } } = $$props;
    	const writable_props = ["button"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoButton", $$slots, []);

    	$$self.$set = $$props => {
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	$$self.$capture_state = () => ({ button });

    	$$self.$inject_state = $$props => {
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [button];
    }

    class OmoButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoButton",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get button() {
    		throw new Error("<OmoButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<OmoButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoNavbar.svelte generated by Svelte v3.20.1 */
    const file$b = "src/quanta/1-views/2-molecules/OmoNavbar.svelte";

    function create_fragment$f(ctx) {
    	let header;
    	let nav;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t;
    	let div2;
    	let div1;
    	let current;

    	const omobutton = new OmoButton({
    			props: { button: /*chat*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(omobutton.$$.fragment);
    			if (img.src !== (img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image");
    			attr_dev(img, "class", "w-auto h-8");
    			add_location(img, file$b, 12, 8, 292);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "mr-4");
    			add_location(a, file$b, 11, 6, 258);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$b, 10, 4, 233);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$b, 16, 6, 430);
    			attr_dev(div2, "class", "md:items-center md:w-auto flex");
    			add_location(div2, file$b, 15, 4, 379);
    			attr_dev(nav, "class", "flex justify-between w-full px-3 py-3");
    			add_location(nav, file$b, 9, 2, 177);
    			attr_dev(header, "class", "bg-gray-900");
    			add_location(header, file$b, 8, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(nav, t);
    			append_dev(nav, div2);
    			append_dev(div2, div1);
    			mount_component(omobutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omobutton_changes = {};
    			if (dirty & /*chat*/ 1) omobutton_changes.button = /*chat*/ ctx[0];
    			omobutton.$set(omobutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(omobutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { chat = { text: "CALL TO ACTION", link: "/" } } = $$props;
    	const writable_props = ["chat"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoNavbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoNavbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("chat" in $$props) $$invalidate(0, chat = $$props.chat);
    	};

    	$$self.$capture_state = () => ({ OmoButton, chat });

    	$$self.$inject_state = $$props => {
    		if ("chat" in $$props) $$invalidate(0, chat = $$props.chat);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chat];
    }

    class OmoNavbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { chat: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNavbar",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get chat() {
    		throw new Error("<OmoNavbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chat(value) {
    		throw new Error("<OmoNavbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const db = {
      cities: [{
          id: 1,
          name: "Heidelberg",
          image: "https://source.unsplash.com/Yfo3qWK2pjY"
        },
        {
          id: 2,
          name: "Berlin",
          image: "https://source.unsplash.com/TK5I5L5JGxY"
        },
        {
          id: 3,
          name: "München",
          image: "https://source.unsplash.com/8QJSi37vhms "
        },
        {
          id: 4,
          name: "Neue Stadt gründen",
          image: "/images/addcity.jpg"
        }
      ],
      users: [{
          id: 1,
          name: "Julian",
          dream: "liebt das Fahren und den Dialog mit seinen Mitfahrern",
          image: "https://source.unsplash.com/7YVZYZeITc8",
          city: 1
        },
        {
          id: 2,
          name: "Adele",
          dream: "liebt es Nachts durch die Stadt von München zu düsen",
          city: 2,
          image: "https://source.unsplash.com/xe68QiMaDrQ"
        },
        {
          id: 3,
          name: "Lisa",
          dream: "liebt es mit der Rikscha den Berg hochzustrampeln",
          city: 3,
          image: "https://source.unsplash.com/rDEOVtE7vOs"
        }
      ],
      blog: [{
          id: 1,
          title: "Alf und Emmy,",
          subtitle: "eine wundersame Begegnung",
          excerpt: "Letzte Woche haben sich zum ersten mal zwicshen Alf und Emmy ein Generationen Tandem gebildet. Sie waren gemeinam auf dem Weg zum Schachspielen als es geschah...",
          image: "https://source.unsplash.com/random?sig=123/800x800/",
          cities: [1, 3]
        },
        {
          id: 2,
          title: "Wie alles began,",
          subtitle: "die ersten Tage von Opa Franz",
          excerpt: "Peter, Philipp und Samuel hatten eines Tages den Geistesblitz Opa Franz für Memmingen zu entwickeln. Innerhalb von 24 Stunden bauten sie gemeinsam den ersten...",
          image: "https://source.unsplash.com/random?sig=321/800x800/",
          cities: [2]
        }
      ]
    };

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$c = "src/App.svelte";

    function create_fragment$g(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let dispose;
    	const omonavbar = new OmoNavbar({ $$inline: true });
    	var switch_value = router[/*$curRoute*/ ctx[1]];

    	function switch_props(ctx) {
    		return {
    			props: { db, currentId: /*currentId*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(omonavbar.$$.fragment);
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "sticky top-0");
    			set_style(div0, "z-index", "100000");
    			add_location(div0, file$c, 37, 2, 1112);
    			attr_dev(div1, "id", "pageContent");
    			attr_dev(div1, "class", "app flex flex-col overflow-y-scroll");
    			add_location(div1, file$c, 36, 0, 1043);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(omonavbar, div0, null);
    			append_dev(div1, t);

    			if (switch_instance) {
    				mount_component(switch_instance, div1, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window_1, "popstate", handlerBackNavigation, false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*currentId*/ 1) switch_instance_changes.currentId = /*currentId*/ ctx[0];

    			if (switch_value !== (switch_value = router[/*$curRoute*/ ctx[1]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div1, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omonavbar.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omonavbar.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(omonavbar);
    			if (switch_instance) destroy_component(switch_instance);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $curRoute;
    	validate_store(curRoute, "curRoute");
    	component_subscribe($$self, curRoute, $$value => $$invalidate(1, $curRoute = $$value));
    	let currentId;

    	onMount(() => {
    		curRoute.set(window.location.pathname);
    		var urlParams = new URLSearchParams(window.location.search);

    		if (urlParams.has("id")) {
    			curId.set(urlParams.get("id"));
    			$$invalidate(0, currentId = urlParams.get("id"));
    		}

    		if (!history.state) {
    			window.history.replaceState({ path: window.location.pathname }, "", window.location.href);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		router,
    		curRoute,
    		curId,
    		OmoThemeLight,
    		OmoNavbar,
    		onMount,
    		db,
    		currentId,
    		handlerBackNavigation,
    		$curRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) $$invalidate(0, currentId = $$props.currentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentId, $curRoute];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
