
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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

    /* src/quanta/1-views/2-molecules/OmoHero.svelte generated by Svelte v3.20.1 */

    const file = "src/quanta/1-views/2-molecules/OmoHero.svelte";

    function create_fragment(ctx) {
    	let div4;
    	let div3;
    	let main;
    	let div1;
    	let h1;
    	let t0_value = /*omohero*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*omohero*/ ctx[0].subline + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*omohero*/ ctx[0].description + "";
    	let t4;
    	let t5;
    	let a;
    	let t6_value = /*omohero*/ ctx[0].button + "";
    	let t6;
    	let t7;
    	let div2;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			main = element("main");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			t6 = text(t6_value);
    			t7 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "uppercase text-5xl text-blue-900 font-bold font-title\n          leading-none tracking-tight mb-2");
    			add_location(h1, file, 18, 8, 677);
    			attr_dev(div0, "class", "text-3xl text-gray-600 font-subtitle italic font-light\n          tracking-wide mb-6");
    			add_location(div0, file, 23, 8, 845);
    			attr_dev(p, "class", "text-gray-500 leading-relaxed mb-12");
    			add_location(p, file, 28, 8, 1004);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "bg-green-400 hover:bg-blue-800 py-2 px-4 text-lg font-bold\n          text-white rounded");
    			add_location(a, file, 29, 8, 1085);
    			attr_dev(div1, "class", "sm:w-3/5 flex flex-col items-center sm:items-start text-center\n        sm:text-left");
    			add_location(div1, file, 15, 6, 563);
    			attr_dev(img, "class", "");
    			if (img.src !== (img_src_value = /*omohero*/ ctx[0].illustration)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*omohero*/ ctx[0].title);
    			add_location(img, file, 37, 8, 1310);
    			attr_dev(div2, "class", "lg:px-20 w-2/5");
    			add_location(div2, file, 36, 6, 1273);
    			attr_dev(main, "class", "flex flex-col-reverse sm:flex-row jusitfy-between items-center ");
    			add_location(main, file, 13, 4, 472);
    			attr_dev(div3, "class", "container mx-auto py-16");
    			add_location(div3, file, 12, 2, 430);
    			attr_dev(div4, "class", "bg-white flex flex-col font-sans");
    			add_location(div4, file, 11, 0, 381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, main);
    			append_dev(main, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);
    			append_dev(div1, a);
    			append_dev(a, t6);
    			append_dev(main, t7);
    			append_dev(main, div2);
    			append_dev(div2, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*omohero*/ 1 && t0_value !== (t0_value = /*omohero*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*omohero*/ 1 && t2_value !== (t2_value = /*omohero*/ ctx[0].subline + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*omohero*/ 1 && t4_value !== (t4_value = /*omohero*/ ctx[0].description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*omohero*/ 1 && t6_value !== (t6_value = /*omohero*/ ctx[0].button + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*omohero*/ 1 && img.src !== (img_src_value = /*omohero*/ ctx[0].illustration)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*omohero*/ 1 && img_alt_value !== (img_alt_value = /*omohero*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	let { omohero = {
    		title: "hero title",
    		subline: "hero subtitle a",
    		description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
    		illustration: "/images/progressive_app.svg",
    		button: "Call to Action"
    	} } = $$props;

    	const writable_props = ["omohero"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoHero> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoHero", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omohero" in $$props) $$invalidate(0, omohero = $$props.omohero);
    	};

    	$$self.$capture_state = () => ({ omohero });

    	$$self.$inject_state = $$props => {
    		if ("omohero" in $$props) $$invalidate(0, omohero = $$props.omohero);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omohero];
    }

    class OmoHero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { omohero: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHero",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get omohero() {
    		throw new Error("<OmoHero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omohero(value) {
    		throw new Error("<OmoHero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoHeader.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/quanta/1-views/2-molecules/OmoHeader.svelte";

    // (14:4) {#if omoheader.subline}
    function create_if_block(ctx) {
    	let div;
    	let t_value = /*omoheader*/ ctx[0].subline + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "text-3xl text-gray-500 italic font-light font-sans tracking-wide\n        mb-6");
    			add_location(div, file$1, 14, 6, 328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*omoheader*/ 1 && t_value !== (t_value = /*omoheader*/ ctx[0].subline + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(14:4) {#if omoheader.subline}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let h2;
    	let t0_value = /*omoheader*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let if_block = /*omoheader*/ ctx[0].subline && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "text-5xl text-green-400 font-bold font-title uppercase");
    			add_location(h2, file$1, 10, 4, 192);
    			attr_dev(div0, "class", "w-5/6 xl:w-4/6 text-center");
    			add_location(div0, file$1, 9, 2, 147);
    			attr_dev(div1, "class", "flex justify-center my-20");
    			add_location(div1, file$1, 8, 0, 105);
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
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*omoheader*/ 1 && t0_value !== (t0_value = /*omoheader*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (/*omoheader*/ ctx[0].subline) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
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
    	let { omoheader = { title: "", subline: "", illustration: "" } } = $$props;
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHeader",
    			options,
    			id: create_fragment$1.name
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

    const file$2 = "src/quanta/1-views/2-molecules/OmoVideo.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(iframe, file$2, 12, 6, 260);
    			attr_dev(div0, "class", "embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border\n      ");
    			add_location(div0, file$2, 9, 4, 159);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$2, 8, 2, 126);
    			attr_dev(div2, "class", "flex justify-center pb-20");
    			add_location(div2, file$2, 7, 0, 84);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { omovideo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoVideo",
    			options,
    			id: create_fragment$2.name
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
    const file$3 = "src/quanta/1-views/3-organisms/OmoSteps.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (30:6) {#each omosteps as step, i}
    function create_each_block(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*i*/ ctx[4] + 1 + "";
    	let t1;
    	let t2;
    	let t3_value = /*step*/ ctx[2].title + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5_value = /*step*/ ctx[2].description + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text(". ");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			if (img.src !== (img_src_value = /*step*/ ctx[2].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "object-center px-10");
    			set_style(img, "height", "20rem");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$3, 31, 10, 740);
    			attr_dev(div0, "class", "text-2xl text-center text-blue-800 mb-2 flex flex-wrap\n            justify-center content-center font-title uppercase font-bold");
    			add_location(div0, file$3, 36, 10, 885);
    			attr_dev(div1, "class", "text-gray-600");
    			add_location(div1, file$3, 41, 10, 1100);
    			attr_dev(div2, "class", "w-1/3 px-6 content-center text-center");
    			add_location(div2, file$3, 30, 8, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*omosteps*/ 2 && img.src !== (img_src_value = /*step*/ ctx[2].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*omosteps*/ 2 && t3_value !== (t3_value = /*step*/ ctx[2].title + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*omosteps*/ 2 && t5_value !== (t5_value = /*step*/ ctx[2].description + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:6) {#each omosteps as step, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    			add_location(div0, file$3, 28, 4, 593);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$3, 26, 2, 530);
    			attr_dev(div2, "class", "bg-white flex justify-center pt-20 pb-40");
    			add_location(div2, file$3, 25, 0, 473);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { omoheader = {
    		title: "So gehts",
    		subline: "ganz einfach in 3 Schritten"
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { omoheader: 0, omosteps: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSteps",
    			options,
    			id: create_fragment$3.name
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

    /* src/quanta/1-views/2-molecules/OmoCard.svelte generated by Svelte v3.20.1 */

    const file$4 = "src/quanta/1-views/2-molecules/OmoCard.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(img, file$4, 7, 6, 164);
    			attr_dev(a0, "href", a0_href_value = "city?id=" + /*city*/ ctx[0].id);
    			attr_dev(a0, "class", "text-xl font-bold font-title uppercase");
    			add_location(a0, file$4, 14, 8, 413);
    			attr_dev(div0, "class", "w-full px-4 pb-2 pt-3 text-center hover:bg-green-400 bg-blue-800\n        text-white");
    			add_location(div0, file$4, 11, 6, 299);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$4, 6, 4, 98);
    			attr_dev(a1, "href", a1_href_value = "city?id=" + /*city*/ ctx[0].id);
    			add_location(a1, file$4, 5, 2, 65);
    			attr_dev(div2, "class", "w-1/4 p-2");
    			add_location(div2, file$4, 4, 0, 39);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { city } = $$props;
    	const writable_props = ["city"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCard", $$slots, []);

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

    class OmoCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*city*/ ctx[0] === undefined && !("city" in props)) {
    			console.warn("<OmoCard> was created without expected prop 'city'");
    		}
    	}

    	get city() {
    		throw new Error("<OmoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set city(value) {
    		throw new Error("<OmoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/3-organisms/OmoCards.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/quanta/1-views/3-organisms/OmoCards.svelte";

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

    	const omocard = new OmoCard({
    			props: { city: /*city*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omocard.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omocard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omocard, detaching);
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

    function create_fragment$5(ctx) {
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
    			add_location(div0, file$5, 14, 4, 392);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$5, 12, 2, 329);
    			attr_dev(div2, "class", "primary flex justify-center pt-10 pb-40");
    			add_location(div2, file$5, 11, 0, 273);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let cities = db.cities;

    	let { omoheader = {
    		title: "cities",
    		subline: "about the city campaign"
    	} } = $$props;

    	const writable_props = ["db", "omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCards", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({
    		OmoCard,
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

    class OmoCards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { db: 2, omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCards",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[2] === undefined && !("db" in props)) {
    			console.warn("<OmoCards> was created without expected prop 'db'");
    		}
    	}

    	get db() {
    		throw new Error("<OmoCards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<OmoCards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omoheader() {
    		throw new Error("<OmoCards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<OmoCards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoUser.svelte generated by Svelte v3.20.1 */

    const file$6 = "src/quanta/1-views/2-molecules/OmoUser.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(img, file$6, 15, 6, 356);
    			attr_dev(div0, "class", "text-xl text-center p-4 text-gray-200 bg-blue-800 flex flex-wrap\n        justify-center content-center h-48");
    			add_location(div0, file$6, 19, 6, 491);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$6, 14, 4, 290);
    			attr_dev(a, "href", a_href_value = "user?id=" + /*user*/ ctx[0].id);
    			add_location(a, file$6, 13, 2, 257);
    			attr_dev(div2, "class", "w-1/3 p-2");
    			add_location(div2, file$6, 12, 0, 231);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { db: 1, currentId: 2, user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoUser",
    			options,
    			id: create_fragment$6.name
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
    const file$7 = "src/quanta/1-views/3-organisms/OmoUsers.svelte";

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

    function create_fragment$7(ctx) {
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
    			add_location(div0, file$7, 15, 4, 401);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$7, 13, 2, 338);
    			attr_dev(div2, "class", "flex justify-center pt-20 pb-40");
    			add_location(div2, file$7, 12, 0, 290);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { users } = $$props;

    	let { omoheader = {
    		title: "Unsere Omo's",
    		subline: "subtitle"
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { db: 1, users: 0, omoheader: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoUsers",
    			options,
    			id: create_fragment$7.name
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

    /* src/quanta/1-views/2-molecules/OmoSubscribe.svelte generated by Svelte v3.20.1 */

    const file$8 = "src/quanta/1-views/2-molecules/OmoSubscribe.svelte";

    function create_fragment$8(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0_value = /*omosubscribe*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*omosubscribe*/ ctx[0].subline + "";
    	let t2;
    	let t3;
    	let div2;
    	let input;
    	let input_placeholder_value;
    	let t4;
    	let button;
    	let t5_value = /*omosubscribe*/ ctx[0].button + "";
    	let t5;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			t5 = text(t5_value);
    			attr_dev(div0, "class", "m-0 p-0 text-5xl font-title uppercase text-white antialiased\n      text-center");
    			add_location(div0, file$8, 14, 4, 455);
    			attr_dev(div1, "class", " m-0 p-0 text-2xl text-white italic font-light font-sans\n      antialiased text-center");
    			add_location(div1, file$8, 19, 4, 596);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "text-lg text-gray-600 w-2/3 px-6 rounded-l-lg");
    			attr_dev(input, "placeholder", input_placeholder_value = /*omosubscribe*/ ctx[0].email);
    			add_location(input, file$8, 25, 6, 797);
    			attr_dev(button, "class", "py-3 px-4 w-1/3 bg-green-400 font-bold text-lg rounded-r-lg\n        text-white hover:bg-blue-800");
    			attr_dev(button, "type", "button");
    			add_location(button, file$8, 29, 6, 936);
    			attr_dev(div2, "class", " mt-3 flex flex-row flex-wrap");
    			add_location(div2, file$8, 24, 4, 747);
    			attr_dev(div3, "class", "p-10 py-20 flex flex-col flex-wrap justify-center content-center");
    			add_location(div3, file$8, 13, 2, 372);
    			attr_dev(div4, "class", "bg-cover bg-center h-auto text-white py-40 px-16 object-fill");
    			set_style(div4, "background-image", "url(" + /*omosubscribe*/ ctx[0].image + ")");
    			add_location(div4, file$8, 10, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			append_dev(div2, t4);
    			append_dev(div2, button);
    			append_dev(button, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*omosubscribe*/ 1 && t0_value !== (t0_value = /*omosubscribe*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*omosubscribe*/ 1 && t2_value !== (t2_value = /*omosubscribe*/ ctx[0].subline + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*omosubscribe*/ 1 && input_placeholder_value !== (input_placeholder_value = /*omosubscribe*/ ctx[0].email)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*omosubscribe*/ 1 && t5_value !== (t5_value = /*omosubscribe*/ ctx[0].button + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*omosubscribe*/ 1) {
    				set_style(div4, "background-image", "url(" + /*omosubscribe*/ ctx[0].image + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	let { omosubscribe = {
    		title: "Get Our Updates",
    		subline: "Find out about events and other news",
    		email: "john@mail.com",
    		image: "https://source.unsplash.com/random",
    		button: "Subscribe"
    	} } = $$props;

    	const writable_props = ["omosubscribe"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoSubscribe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoSubscribe", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omosubscribe" in $$props) $$invalidate(0, omosubscribe = $$props.omosubscribe);
    	};

    	$$self.$capture_state = () => ({ omosubscribe });

    	$$self.$inject_state = $$props => {
    		if ("omosubscribe" in $$props) $$invalidate(0, omosubscribe = $$props.omosubscribe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omosubscribe];
    }

    class OmoSubscribe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { omosubscribe: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSubscribe",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get omosubscribe() {
    		throw new Error("<OmoSubscribe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omosubscribe(value) {
    		throw new Error("<OmoSubscribe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/Home.svelte generated by Svelte v3.20.1 */

    function create_fragment$9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;
    	const omohero = new OmoHero({ $$inline: true });

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[2] },
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

    	const omocards = new OmoCards({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omousers = new OmoUsers({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omosubscribe = new OmoSubscribe({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omohero.$$.fragment);
    			t0 = space();
    			create_component(omoheader_1.$$.fragment);
    			t1 = space();
    			create_component(omovideo_1.$$.fragment);
    			t2 = space();
    			create_component(omosteps_1.$$.fragment);
    			t3 = space();
    			create_component(omocards.$$.fragment);
    			t4 = space();
    			create_component(omousers.$$.fragment);
    			t5 = space();
    			create_component(omosubscribe.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omohero, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(omoheader_1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(omovideo_1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(omosteps_1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omocards, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(omousers, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(omosubscribe, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 4) omoheader_1_changes.omoheader = /*omoheader*/ ctx[2];
    			omoheader_1.$set(omoheader_1_changes);
    			const omovideo_1_changes = {};
    			if (dirty & /*omovideo*/ 8) omovideo_1_changes.omovideo = /*omovideo*/ ctx[3];
    			omovideo_1.$set(omovideo_1_changes);
    			const omosteps_1_changes = {};
    			if (dirty & /*omosteps*/ 16) omosteps_1_changes.omosteps = /*omosteps*/ ctx[4];
    			omosteps_1.$set(omosteps_1_changes);
    			const omocards_changes = {};
    			if (dirty & /*db*/ 1) omocards_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omocards_changes.currentId = /*currentId*/ ctx[1];
    			omocards.$set(omocards_changes);
    			const omousers_changes = {};
    			if (dirty & /*db*/ 1) omousers_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omousers_changes.currentId = /*currentId*/ ctx[1];
    			omousers.$set(omousers_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omohero.$$.fragment, local);
    			transition_in(omoheader_1.$$.fragment, local);
    			transition_in(omovideo_1.$$.fragment, local);
    			transition_in(omosteps_1.$$.fragment, local);
    			transition_in(omocards.$$.fragment, local);
    			transition_in(omousers.$$.fragment, local);
    			transition_in(omosubscribe.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omohero.$$.fragment, local);
    			transition_out(omoheader_1.$$.fragment, local);
    			transition_out(omovideo_1.$$.fragment, local);
    			transition_out(omosteps_1.$$.fragment, local);
    			transition_out(omocards.$$.fragment, local);
    			transition_out(omousers.$$.fragment, local);
    			transition_out(omosubscribe.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omohero, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(omoheader_1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(omovideo_1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omosteps_1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omocards, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(omousers, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(omosubscribe, detaching);
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

    	let { omoheader = {
    		title: "STELL DIR VOR",
    		subline: "vision subline text"
    	} } = $$props;

    	let { omovideo = {
    		link: "https://player.vimeo.com/video/349650067"
    	} } = $$props;

    	let { omosteps = [
    		{
    			title: "Stadt wünschen",
    			description: "Wünsch dir deine Stadt um die Flatrate in deiner Heimat freizuschalten",
    			image: "images/city_girl.svg"
    		},
    		{
    			title: "Votes sammeln",
    			description: "Mit jedem Vote kommt deine Stadt ein Schritt näher an die Flatrate",
    			image: "images/city_driver.svg"
    		},
    		{
    			title: "Durchstarten",
    			description: "Bei genügend Votes wird deine Stadt und dein Fahrer für alle freigeschalten",
    			image: "images/order_a_car.svg"
    		}
    	] } = $$props;

    	const writable_props = ["db", "currentId", "omoheader", "omovideo", "omosteps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("omoheader" in $$props) $$invalidate(2, omoheader = $$props.omoheader);
    		if ("omovideo" in $$props) $$invalidate(3, omovideo = $$props.omovideo);
    		if ("omosteps" in $$props) $$invalidate(4, omosteps = $$props.omosteps);
    	};

    	$$self.$capture_state = () => ({
    		db,
    		currentId,
    		OmoHero,
    		OmoHeader,
    		OmoVideo,
    		OmoSteps,
    		OmoCards,
    		OmoUsers,
    		OmoSubscribe,
    		omoheader,
    		omovideo,
    		omosteps
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("omoheader" in $$props) $$invalidate(2, omoheader = $$props.omoheader);
    		if ("omovideo" in $$props) $$invalidate(3, omovideo = $$props.omovideo);
    		if ("omosteps" in $$props) $$invalidate(4, omosteps = $$props.omosteps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, currentId, omoheader, omovideo, omosteps];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			db: 0,
    			currentId: 1,
    			omoheader: 2,
    			omovideo: 3,
    			omosteps: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
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

    	get omoheader() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
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
    const file$9 = "src/quanta/1-views/5-pages/user.svelte";

    function create_fragment$a(ctx) {
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

    	const omocard = new OmoCard({
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
    			create_component(omocard.$$.fragment);
    			attr_dev(div0, "class", "text-4xl text-gray-700 w-full flex content-center flex-wrap bg-cover\n  bg-center justify-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*user*/ ctx[0].image + "')");
    			set_style(div0, "padding", "30rem");
    			attr_dev(div0, "title", "user");
    			add_location(div0, file$9, 9, 0, 249);
    			set_style(p, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(p, file$9, 17, 2, 581);
    			attr_dev(div1, "class", "text-5xl text-center px-4 py-16 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$9, 14, 0, 458);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$9, 23, 4, 766);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$9, 22, 2, 733);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$9, 21, 0, 691);
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
    			mount_component(omocard, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*user*/ 1) {
    				set_style(div0, "background-image", "url('" + /*user*/ ctx[0].image + "')");
    			}

    			if ((!current || dirty & /*user*/ 1) && t2_value !== (t2_value = /*user*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*user*/ 1) && t4_value !== (t4_value = /*user*/ ctx[0].dream + "")) set_data_dev(t4, t4_value);
    			const omocard_changes = {};
    			if (dirty & /*db*/ 2) omocard_changes.db = /*db*/ ctx[1];
    			omocard.$set(omocard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			destroy_component(omocard);
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

    	$$self.$capture_state = () => ({ OmoCard, db, user, currentId, city });

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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { db: 1, user: 0, currentId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$a.name
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
    const file$a = "src/quanta/1-views/5-pages/City.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let t0_value = /*city*/ ctx[1].name + "";
    	let t0;
    	let div_title_value;
    	let t1;
    	let current;

    	const omousers = new OmoUsers({
    			props: {
    				users: /*users*/ ctx[2],
    				db: /*db*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(omousers.$$.fragment);
    			attr_dev(div, "class", "py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center\n  justify-center overflow-hidden uppercase font-bolt text-white");
    			set_style(div, "background-image", "url('" + /*city*/ ctx[1].image + "')");
    			set_style(div, "font-family", "'Permanent Marker',\n  cursive", 1);
    			attr_dev(div, "title", div_title_value = /*city*/ ctx[1].name);
    			add_location(div, file$a, 9, 0, 260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(omousers, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omousers_changes = {};
    			if (dirty & /*db*/ 1) omousers_changes.db = /*db*/ ctx[0];
    			omousers.$set(omousers_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omousers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omousers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(omousers, detaching);
    		}
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

    function instance$b($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let city = db.cities.find(item => item.id == currentId);
    	let users = db.users;
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoCard,
    		OmoUsers,
    		db,
    		currentId,
    		city,
    		users
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(1, city = $$props.city);
    		if ("users" in $$props) $$invalidate(2, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, city, users, currentId];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { db: 0, currentId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<City> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[3] === undefined && !("currentId" in props)) {
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

    /* src/quanta/1-views/5-pages/Cities.svelte generated by Svelte v3.20.1 */
    const file$b = "src/quanta/1-views/5-pages/Cities.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (17:6) {#each cities as city}
    function create_each_block$3(ctx) {
    	let current;

    	const omocard = new OmoCard({
    			props: { city: /*city*/ ctx[3], db: /*db*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(omocard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(omocard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omocard_changes = {};
    			if (dirty & /*db*/ 1) omocard_changes.db = /*db*/ ctx[0];
    			omocard.$set(omocard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omocard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:6) {#each cities as city}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t;
    	let div2;
    	let div1;
    	let div0;
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[1] },
    			$$inline: true
    		});

    	let each_value = /*cities*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$b, 15, 4, 399);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$b, 14, 2, 366);
    			attr_dev(div2, "class", "flex justify-center my-10 pb-20");
    			add_location(div2, file$b, 13, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoheader_1, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 2) omoheader_1_changes.omoheader = /*omoheader*/ ctx[1];
    			omoheader_1.$set(omoheader_1_changes);

    			if (dirty & /*cities, db*/ 5) {
    				each_value = /*cities*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

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
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoheader_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
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

    function instance$c($$self, $$props, $$invalidate) {
    	let { db } = $$props;
    	let cities = db.cities;

    	let { omoheader = {
    		title: "Die Städte Kampagne",
    		subline: "so funktiniert sie im detail"
    	} } = $$props;

    	const writable_props = ["db", "omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cities", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("omoheader" in $$props) $$invalidate(1, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({
    		OmoCard,
    		OmoHeader,
    		db,
    		cities,
    		omoheader
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("cities" in $$props) $$invalidate(2, cities = $$props.cities);
    		if ("omoheader" in $$props) $$invalidate(1, omoheader = $$props.omoheader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, omoheader, cities];
    }

    class Cities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { db: 0, omoheader: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cities",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<Cities> was created without expected prop 'db'");
    		}
    	}

    	get db() {
    		throw new Error("<Cities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Cities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omoheader() {
    		throw new Error("<Cities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<Cities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoPricing.svelte generated by Svelte v3.20.1 */

    const file$c = "src/quanta/1-views/2-molecules/OmoPricing.svelte";

    function create_fragment$d(ctx) {
    	let div26;
    	let div25;
    	let div24;
    	let div7;
    	let div6;
    	let div0;
    	let h10;
    	let t1;
    	let h20;
    	let t3;
    	let t4;
    	let div4;
    	let ul0;
    	let li0;
    	let div1;
    	let svg0;
    	let path0;
    	let polyline0;
    	let t5;
    	let span0;
    	let t7;
    	let li1;
    	let div2;
    	let svg1;
    	let path1;
    	let polyline1;
    	let t8;
    	let span1;
    	let t10;
    	let li2;
    	let div3;
    	let svg2;
    	let path2;
    	let polyline2;
    	let t11;
    	let span2;
    	let t13;
    	let div5;
    	let button0;
    	let t15;
    	let div15;
    	let div8;
    	let t17;
    	let div9;
    	let h11;
    	let t19;
    	let h21;
    	let span3;
    	let t21;
    	let t22;
    	let div13;
    	let ul1;
    	let li3;
    	let div10;
    	let svg3;
    	let path3;
    	let polyline3;
    	let t23;
    	let span4;
    	let t25;
    	let li4;
    	let div11;
    	let svg4;
    	let path4;
    	let polyline4;
    	let t26;
    	let span5;
    	let t28;
    	let li5;
    	let div12;
    	let svg5;
    	let path5;
    	let polyline5;
    	let t29;
    	let span6;
    	let t31;
    	let div14;
    	let button1;
    	let t33;
    	let div23;
    	let div22;
    	let div16;
    	let h12;
    	let t35;
    	let h22;
    	let t37;
    	let t38;
    	let div20;
    	let ul2;
    	let li6;
    	let div17;
    	let svg6;
    	let path6;
    	let polyline6;
    	let t39;
    	let span7;
    	let t41;
    	let li7;
    	let div18;
    	let svg7;
    	let path7;
    	let polyline7;
    	let t42;
    	let span8;
    	let t44;
    	let li8;
    	let div19;
    	let svg8;
    	let path8;
    	let polyline8;
    	let t45;
    	let span9;
    	let t47;
    	let div21;
    	let button2;

    	const block = {
    		c: function create() {
    			div26 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Community";
    			t1 = space();
    			h20 = element("h2");
    			h20.textContent = "0%";
    			t3 = text("\n            Stripe offers everything needed to run an online business at scale.\n            Get in touch for details.");
    			t4 = space();
    			div4 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			polyline0 = svg_element("polyline");
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "No setup";
    			t7 = space();
    			li1 = element("li");
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			polyline1 = svg_element("polyline");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "No setups";
    			t10 = space();
    			li2 = element("li");
    			div3 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			polyline2 = svg_element("polyline");
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "Speed";
    			t13 = space();
    			div5 = element("div");
    			button0 = element("button");
    			button0.textContent = "Select";
    			t15 = space();
    			div15 = element("div");
    			div8 = element("div");
    			div8.textContent = "Most Popular";
    			t17 = space();
    			div9 = element("div");
    			h11 = element("h1");
    			h11.textContent = "HOSTED";
    			t19 = space();
    			h21 = element("h2");
    			span3 = element("span");
    			span3.textContent = "3%";
    			t21 = text("\n          Stripe offers everything needed to run an online business at scale.\n          Get in touch for details.");
    			t22 = space();
    			div13 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			div10 = element("div");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			polyline3 = svg_element("polyline");
    			t23 = space();
    			span4 = element("span");
    			span4.textContent = "No setup";
    			t25 = space();
    			li4 = element("li");
    			div11 = element("div");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			polyline4 = svg_element("polyline");
    			t26 = space();
    			span5 = element("span");
    			span5.textContent = "Hidden fees";
    			t28 = space();
    			li5 = element("li");
    			div12 = element("div");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			polyline5 = svg_element("polyline");
    			t29 = space();
    			span6 = element("span");
    			span6.textContent = "Original";
    			t31 = space();
    			div14 = element("div");
    			button1 = element("button");
    			button1.textContent = "Select";
    			t33 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div16 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Enterprise";
    			t35 = space();
    			h22 = element("h2");
    			h22.textContent = "10%";
    			t37 = text("\n            Stripe offers everything needed to run an online business at scale.\n            Get in touch for details.");
    			t38 = space();
    			div20 = element("div");
    			ul2 = element("ul");
    			li6 = element("li");
    			div17 = element("div");
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			polyline6 = svg_element("polyline");
    			t39 = space();
    			span7 = element("span");
    			span7.textContent = "Electric";
    			t41 = space();
    			li7 = element("li");
    			div18 = element("div");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			polyline7 = svg_element("polyline");
    			t42 = space();
    			span8 = element("span");
    			span8.textContent = "Monthly";
    			t44 = space();
    			li8 = element("li");
    			div19 = element("div");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			polyline8 = svg_element("polyline");
    			t45 = space();
    			span9 = element("span");
    			span9.textContent = "No setup";
    			t47 = space();
    			div21 = element("div");
    			button2 = element("button");
    			button2.textContent = "Select";
    			attr_dev(h10, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n              tracking-wide");
    			add_location(h10, file$c, 12, 12, 567);
    			attr_dev(h20, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h20, file$c, 17, 12, 727);
    			attr_dev(div0, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n            text-black px-8 lg:px-6");
    			add_location(div0, file$c, 9, 10, 436);
    			attr_dev(path0, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path0, file$c, 36, 20, 1503);
    			attr_dev(polyline0, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline0, file$c, 37, 20, 1571);
    			attr_dev(svg0, "class", "w-6 h-6 align-middle");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			add_location(svg0, file$c, 26, 18, 1127);
    			attr_dev(div1, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div1, file$c, 25, 16, 1049);
    			attr_dev(span0, "class", "text-gray-700 text-lg ml-3");
    			add_location(span0, file$c, 40, 16, 1679);
    			attr_dev(li0, "class", "flex items-center");
    			add_location(li0, file$c, 24, 14, 1002);
    			attr_dev(path1, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path1, file$c, 54, 20, 2271);
    			attr_dev(polyline1, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline1, file$c, 55, 20, 2339);
    			attr_dev(svg1, "class", "w-6 h-6 align-middle");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			add_location(svg1, file$c, 44, 18, 1895);
    			attr_dev(div2, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div2, file$c, 43, 16, 1817);
    			attr_dev(span1, "class", "text-gray-700 text-lg ml-3");
    			add_location(span1, file$c, 58, 16, 2447);
    			attr_dev(li1, "class", "flex items-center");
    			add_location(li1, file$c, 42, 14, 1770);
    			attr_dev(path2, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path2, file$c, 72, 20, 3040);
    			attr_dev(polyline2, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline2, file$c, 73, 20, 3108);
    			attr_dev(svg2, "class", "w-6 h-6 align-middle");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			add_location(svg2, file$c, 62, 18, 2664);
    			attr_dev(div3, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div3, file$c, 61, 16, 2586);
    			attr_dev(span2, "class", "text-gray-700 text-lg ml-3");
    			add_location(span2, file$c, 76, 16, 3216);
    			attr_dev(li2, "class", "flex items-center");
    			add_location(li2, file$c, 60, 14, 2539);
    			add_location(ul0, file$c, 23, 12, 983);
    			attr_dev(div4, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div4, file$c, 22, 10, 932);
    			attr_dev(button0, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n              text-green-400 rounded px-4 py-2 block shadow-xl\n              hover:border-blue-800 hover:bg-blue-800 hover:text-white");
    			add_location(button0, file$c, 81, 12, 3389);
    			attr_dev(div5, "class", "block flex items-center p-8");
    			add_location(div5, file$c, 80, 10, 3335);
    			attr_dev(div6, "class", "bg-white text-black rounded-lg shadow-inner shadow-lg\n          overflow-hidden");
    			add_location(div6, file$c, 6, 8, 322);
    			attr_dev(div7, "class", "w-11/12 max-w-sm sm:w-3/5 lg:w-1/3 sm:my-5 my-8 relative z-0\n        rounded-lg shadow-lg md:-mr-4");
    			add_location(div7, file$c, 3, 6, 193);
    			attr_dev(div8, "class", "text-sm leading-none rounded-t-lg bg-blue-800 text-white\n          font-semibold uppercase py-2 text-center tracking-wide");
    			add_location(div8, file$c, 93, 8, 3837);
    			attr_dev(h11, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n            tracking-wide");
    			add_location(h11, file$c, 101, 10, 4154);
    			attr_dev(span3, "class", "text-3xl");
    			add_location(span3, file$c, 107, 12, 4365);
    			attr_dev(h21, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h21, file$c, 106, 10, 4301);
    			attr_dev(div9, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n          text-black px-8 lg:px-6");
    			add_location(div9, file$c, 98, 8, 4029);
    			attr_dev(path3, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path3, file$c, 127, 18, 5116);
    			attr_dev(polyline3, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline3, file$c, 128, 18, 5182);
    			attr_dev(svg3, "class", "w-6 h-6 align-middle");
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "24");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			add_location(svg3, file$c, 117, 16, 4760);
    			attr_dev(div10, "class", "rounded-full p-2 fill-current text-green-700");
    			add_location(div10, file$c, 116, 14, 4685);
    			attr_dev(span4, "class", "text-gray-700 text-lg ml-3");
    			add_location(span4, file$c, 131, 14, 5284);
    			attr_dev(li3, "class", "flex items-center");
    			add_location(li3, file$c, 115, 12, 4640);
    			attr_dev(path4, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path4, file$c, 145, 18, 5848);
    			attr_dev(polyline4, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline4, file$c, 146, 18, 5914);
    			attr_dev(svg4, "class", "w-6 h-6 align-middle");
    			attr_dev(svg4, "width", "24");
    			attr_dev(svg4, "height", "24");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-width", "2");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			add_location(svg4, file$c, 135, 16, 5492);
    			attr_dev(div11, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div11, file$c, 134, 14, 5416);
    			attr_dev(span5, "class", "text-gray-700 text-lg ml-3");
    			add_location(span5, file$c, 149, 14, 6016);
    			attr_dev(li4, "class", "flex items-center");
    			add_location(li4, file$c, 133, 12, 5371);
    			attr_dev(path5, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path5, file$c, 163, 18, 6583);
    			attr_dev(polyline5, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline5, file$c, 164, 18, 6649);
    			attr_dev(svg5, "class", "w-6 h-6 align-middle");
    			attr_dev(svg5, "width", "24");
    			attr_dev(svg5, "height", "24");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "stroke-width", "2");
    			attr_dev(svg5, "stroke-linecap", "round");
    			attr_dev(svg5, "stroke-linejoin", "round");
    			add_location(svg5, file$c, 153, 16, 6227);
    			attr_dev(div12, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div12, file$c, 152, 14, 6151);
    			attr_dev(span6, "class", "text-gray-700 text-lg ml-3");
    			add_location(span6, file$c, 167, 14, 6751);
    			attr_dev(li5, "class", "flex items-center");
    			add_location(li5, file$c, 151, 12, 6106);
    			add_location(ul1, file$c, 114, 10, 4623);
    			attr_dev(div13, "class", "flex pl-12 justify-start sm:justify-start mt-3");
    			add_location(div13, file$c, 113, 8, 4552);
    			attr_dev(button1, "class", "mt-3 text-lg font-semibold bg-green-400 w-full text-white\n            rounded px-6 py-3 block shadow-xl hover:bg-blue-800");
    			add_location(button1, file$c, 173, 10, 6918);
    			attr_dev(div14, "class", "block flex items-center p-8");
    			add_location(div14, file$c, 172, 8, 6866);
    			attr_dev(div15, "class", "w-full max-w-md sm:w-2/3 lg:w-1/3 sm:my-5 my-8 relative z-10\n        bg-white rounded-lg shadow-lg");
    			add_location(div15, file$c, 90, 6, 3708);
    			attr_dev(h12, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n              tracking-wide");
    			add_location(h12, file$c, 189, 12, 7516);
    			attr_dev(h22, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h22, file$c, 194, 12, 7677);
    			attr_dev(div16, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n            text-black px-8 lg:px-6");
    			add_location(div16, file$c, 186, 10, 7385);
    			attr_dev(path6, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path6, file$c, 212, 20, 8453);
    			attr_dev(polyline6, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline6, file$c, 213, 20, 8521);
    			attr_dev(svg6, "class", "w-6 h-6 align-middle");
    			attr_dev(svg6, "width", "24");
    			attr_dev(svg6, "height", "24");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "stroke-width", "2");
    			attr_dev(svg6, "stroke-linecap", "round");
    			attr_dev(svg6, "stroke-linejoin", "round");
    			add_location(svg6, file$c, 202, 18, 8077);
    			attr_dev(div17, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div17, file$c, 201, 16, 7999);
    			attr_dev(span7, "class", "text-gray-700 text-lg ml-3");
    			add_location(span7, file$c, 216, 16, 8629);
    			attr_dev(li6, "class", "flex items-center");
    			add_location(li6, file$c, 200, 14, 7952);
    			attr_dev(path7, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path7, file$c, 230, 20, 9221);
    			attr_dev(polyline7, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline7, file$c, 231, 20, 9289);
    			attr_dev(svg7, "class", "w-6 h-6 align-middle");
    			attr_dev(svg7, "width", "24");
    			attr_dev(svg7, "height", "24");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "stroke-width", "2");
    			attr_dev(svg7, "stroke-linecap", "round");
    			attr_dev(svg7, "stroke-linejoin", "round");
    			add_location(svg7, file$c, 220, 18, 8845);
    			attr_dev(div18, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div18, file$c, 219, 16, 8767);
    			attr_dev(span8, "class", "text-gray-700 text-lg ml-3");
    			add_location(span8, file$c, 234, 16, 9397);
    			attr_dev(li7, "class", "flex items-center");
    			add_location(li7, file$c, 218, 14, 8720);
    			attr_dev(path8, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path8, file$c, 248, 20, 9988);
    			attr_dev(polyline8, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline8, file$c, 249, 20, 10056);
    			attr_dev(svg8, "class", "w-6 h-6 align-middle");
    			attr_dev(svg8, "width", "24");
    			attr_dev(svg8, "height", "24");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "stroke-width", "2");
    			attr_dev(svg8, "stroke-linecap", "round");
    			attr_dev(svg8, "stroke-linejoin", "round");
    			add_location(svg8, file$c, 238, 18, 9612);
    			attr_dev(div19, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div19, file$c, 237, 16, 9534);
    			attr_dev(span9, "class", "text-gray-700 text-lg ml-3");
    			add_location(span9, file$c, 252, 16, 10164);
    			attr_dev(li8, "class", "flex items-center");
    			add_location(li8, file$c, 236, 14, 9487);
    			add_location(ul2, file$c, 199, 12, 7933);
    			attr_dev(div20, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div20, file$c, 198, 10, 7882);
    			attr_dev(button2, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n              text-green-400 rounded px-4 py-2 block shadow-xl\n              hover:border-blue-800 hover:bg-blue-800 hover:text-white");
    			add_location(button2, file$c, 258, 12, 10341);
    			attr_dev(div21, "class", "block flex items-center p-8");
    			add_location(div21, file$c, 257, 10, 10287);
    			attr_dev(div22, "class", "bg-white text-black rounded-lg shadow-inner shadow-lg\n          overflow-hidden");
    			add_location(div22, file$c, 183, 8, 7271);
    			attr_dev(div23, "class", "w-11/12 max-w-sm sm:w-3/5 lg:w-1/3 sm:my-5 my-8 relative z-0\n        rounded-lg shadow-lg md:-ml-4");
    			add_location(div23, file$c, 180, 6, 7142);
    			attr_dev(div24, "class", "relative block flex flex-col md:flex-row items-center");
    			add_location(div24, file$c, 2, 4, 119);
    			attr_dev(div25, "class", "max-w-full md:max-w-6xl mx-auto my-3 md:px-8");
    			add_location(div25, file$c, 1, 2, 56);
    			attr_dev(div26, "class", "container max-w-full mx-auto py-24 px-6");
    			add_location(div26, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div26, anchor);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, h20);
    			append_dev(div0, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div4);
    			append_dev(div4, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, polyline0);
    			append_dev(li0, t5);
    			append_dev(li0, span0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);
    			append_dev(svg1, polyline1);
    			append_dev(li1, t8);
    			append_dev(li1, span1);
    			append_dev(ul0, t10);
    			append_dev(ul0, li2);
    			append_dev(li2, div3);
    			append_dev(div3, svg2);
    			append_dev(svg2, path2);
    			append_dev(svg2, polyline2);
    			append_dev(li2, t11);
    			append_dev(li2, span2);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			append_dev(div24, t15);
    			append_dev(div24, div15);
    			append_dev(div15, div8);
    			append_dev(div15, t17);
    			append_dev(div15, div9);
    			append_dev(div9, h11);
    			append_dev(div9, t19);
    			append_dev(div9, h21);
    			append_dev(h21, span3);
    			append_dev(div9, t21);
    			append_dev(div15, t22);
    			append_dev(div15, div13);
    			append_dev(div13, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, div10);
    			append_dev(div10, svg3);
    			append_dev(svg3, path3);
    			append_dev(svg3, polyline3);
    			append_dev(li3, t23);
    			append_dev(li3, span4);
    			append_dev(ul1, t25);
    			append_dev(ul1, li4);
    			append_dev(li4, div11);
    			append_dev(div11, svg4);
    			append_dev(svg4, path4);
    			append_dev(svg4, polyline4);
    			append_dev(li4, t26);
    			append_dev(li4, span5);
    			append_dev(ul1, t28);
    			append_dev(ul1, li5);
    			append_dev(li5, div12);
    			append_dev(div12, svg5);
    			append_dev(svg5, path5);
    			append_dev(svg5, polyline5);
    			append_dev(li5, t29);
    			append_dev(li5, span6);
    			append_dev(div15, t31);
    			append_dev(div15, div14);
    			append_dev(div14, button1);
    			append_dev(div24, t33);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div16);
    			append_dev(div16, h12);
    			append_dev(div16, t35);
    			append_dev(div16, h22);
    			append_dev(div16, t37);
    			append_dev(div22, t38);
    			append_dev(div22, div20);
    			append_dev(div20, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, div17);
    			append_dev(div17, svg6);
    			append_dev(svg6, path6);
    			append_dev(svg6, polyline6);
    			append_dev(li6, t39);
    			append_dev(li6, span7);
    			append_dev(ul2, t41);
    			append_dev(ul2, li7);
    			append_dev(li7, div18);
    			append_dev(div18, svg7);
    			append_dev(svg7, path7);
    			append_dev(svg7, polyline7);
    			append_dev(li7, t42);
    			append_dev(li7, span8);
    			append_dev(ul2, t44);
    			append_dev(ul2, li8);
    			append_dev(li8, div19);
    			append_dev(div19, svg8);
    			append_dev(svg8, path8);
    			append_dev(svg8, polyline8);
    			append_dev(li8, t45);
    			append_dev(li8, span9);
    			append_dev(div22, t47);
    			append_dev(div22, div21);
    			append_dev(div21, button2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div26);
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

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoPricing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoPricing", $$slots, []);
    	return [];
    }

    class OmoPricing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoPricing",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/quanta/1-views/5-pages/Pricing.svelte generated by Svelte v3.20.1 */

    function create_fragment$e(ctx) {
    	let current;
    	const omopricing = new OmoPricing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omopricing.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omopricing, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omopricing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omopricing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omopricing, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pricing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pricing", $$slots, []);
    	$$self.$capture_state = () => ({ OmoPricing });
    	return [];
    }

    class Pricing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pricing",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoFAQ.svelte generated by Svelte v3.20.1 */

    const file$d = "src/quanta/1-views/2-molecules/OmoFAQ.svelte";

    function create_fragment$f(ctx) {
    	let div7;
    	let div2;
    	let div0;
    	let t0;
    	let span0;
    	let svg0;
    	let path0;
    	let t1;
    	let div1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let div4;
    	let div3;
    	let t6;
    	let span1;
    	let svg1;
    	let path1;
    	let t7;
    	let div6;
    	let div5;
    	let t8;
    	let span2;
    	let svg2;
    	let path2;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Lorem ipsum dolor sit amet?\n      ");
    			span0 = element("span");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque\n        sed nulla porttitor, porttitor arcu ut, dictum augue. Vestibulum\n        consequat in urna in bibendum. Praesent sed magna risus. Nunc elementum\n        in mauris ac pharetra. Ut blandit ut lorem sit amet rutrum. Vivamus ut\n        purus fringilla, euismod nibh ut, blandit.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Nunc ac efficitur sapien. Mauris eu lectus odio. Mauris ac erat tortor.\n        Nulla consectetur commodo justo. Pellentesque eget ornare quam.\n        Pellentesque sodales metus non semper luctus. Praesent non ornare\n        tellus, eget vulputate tellus. Donec luctus non sapien sed semper.";
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t6 = text("Lorem ipsum dolor sit amet?\n      ");
    			span1 = element("span");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t8 = text("Lorem ipsum dolor sit amet?\n      ");
    			span2 = element("span");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "m437.332031.167969h-405.332031c-17.664062 0-32 14.335937-32\n            32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0\n            32-14.335938 32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0");
    			add_location(path0, file$d, 11, 10, 478);
    			attr_dev(svg0, "class", "w-3 h-3 fill-current");
    			attr_dev(svg0, "viewBox", "0 -192 469.33333 469");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$d, 7, 8, 337);
    			attr_dev(span0, "class", "h-6 w-6 flex items-center justify-center text-teal-500");
    			add_location(span0, file$d, 6, 6, 259);
    			attr_dev(div0, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div0, file$d, 2, 4, 60);
    			attr_dev(p0, "class", "text-gray-600 mb-3");
    			add_location(p0, file$d, 19, 6, 788);
    			attr_dev(p1, "class", "text-gray-600");
    			add_location(p1, file$d, 26, 6, 1197);
    			attr_dev(div1, "class", "p-3");
    			add_location(div1, file$d, 18, 4, 764);
    			attr_dev(div2, "class", "mb-4");
    			add_location(div2, file$d, 1, 2, 37);
    			attr_dev(path1, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path1, file$d, 44, 10, 2001);
    			attr_dev(svg1, "class", "w-3 h-3 fill-current");
    			attr_dev(svg1, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$d, 40, 8, 1857);
    			attr_dev(span1, "class", "h-6 w-6 flex items-center justify-center text-teal-500");
    			add_location(span1, file$d, 39, 6, 1779);
    			attr_dev(div3, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div3, file$d, 35, 4, 1580);
    			attr_dev(div4, "class", "mb-4");
    			add_location(div4, file$d, 34, 2, 1557);
    			attr_dev(path2, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path2, file$d, 66, 10, 2942);
    			attr_dev(svg2, "class", "w-3 h-3 fill-current");
    			attr_dev(svg2, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$d, 62, 8, 2798);
    			attr_dev(span2, "class", "h-6 w-6 flex items-center justify-center text-teal-500");
    			add_location(span2, file$d, 61, 6, 2720);
    			attr_dev(div5, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div5, file$d, 57, 4, 2521);
    			attr_dev(div6, "class", "mb-4");
    			add_location(div6, file$d, 56, 2, 2498);
    			attr_dev(div7, "class", "bg-white mx-auto p-6");
    			add_location(div7, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(div7, t5);
    			append_dev(div7, div4);
    			append_dev(div4, div3);
    			append_dev(div3, t6);
    			append_dev(div3, span1);
    			append_dev(span1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, t8);
    			append_dev(div5, span2);
    			append_dev(span2, svg2);
    			append_dev(svg2, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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

    function instance$f($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoFAQ> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoFAQ", $$slots, []);
    	return [];
    }

    class OmoFAQ extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoFAQ",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/quanta/1-views/5-pages/FAQ.svelte generated by Svelte v3.20.1 */

    function create_fragment$g(ctx) {
    	let t;
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[0] },
    			$$inline: true
    		});

    	const omofaq = new OmoFAQ({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			create_component(omofaq.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoheader_1, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(omofaq, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 1) omoheader_1_changes.omoheader = /*omoheader*/ ctx[0];
    			omoheader_1.$set(omoheader_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader_1.$$.fragment, local);
    			transition_in(omofaq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader_1.$$.fragment, local);
    			transition_out(omofaq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoheader_1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(omofaq, detaching);
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

    function instance$g($$self, $$props, $$invalidate) {
    	let { omoheader = { title: "FAQ", subtitle: "subttile" } } = $$props;
    	const writable_props = ["omoheader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FAQ> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FAQ", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	$$self.$capture_state = () => ({ OmoHeader, OmoFAQ, omoheader });

    	$$self.$inject_state = $$props => {
    		if ("omoheader" in $$props) $$invalidate(0, omoheader = $$props.omoheader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omoheader];
    }

    class FAQ extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FAQ",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get omoheader() {
    		throw new Error("<FAQ>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<FAQ>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/Team.svelte generated by Svelte v3.20.1 */
    const file$e = "src/quanta/1-views/5-pages/Team.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (20:6) {#each users as user, i (user.id)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let current;

    	const omouser = new OmoUser({
    			props: { user: /*user*/ ctx[3], db: /*db*/ ctx[2] },
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
    			if (dirty & /*db*/ 4) omouser_changes.db = /*db*/ ctx[2];
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(20:6) {#each users as user, i (user.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let t;
    	let div2;
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	const omoheader_1 = new OmoHeader({
    			props: { omoheader: /*omoheader*/ ctx[1] },
    			$$inline: true
    		});

    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			create_component(omoheader_1.$$.fragment);
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$e, 18, 4, 400);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$e, 17, 2, 367);
    			attr_dev(div2, "class", "flex justify-center pb-40");
    			add_location(div2, file$e, 16, 0, 325);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoheader_1, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_1_changes = {};
    			if (dirty & /*omoheader*/ 2) omoheader_1_changes.omoheader = /*omoheader*/ ctx[1];
    			omoheader_1.$set(omoheader_1_changes);

    			if (dirty & /*users, db*/ 5) {
    				const each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
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
    			destroy_component(omoheader_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { omoheader = {
    		title: "Über uns",
    		subline: "und das ganze Team"
    	} } = $$props;

    	let { db } = $$props;
    	let { users } = $$props;
    	if (!users) users = db.users;
    	const writable_props = ["omoheader", "db", "users"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Team", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omoheader" in $$props) $$invalidate(1, omoheader = $$props.omoheader);
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	$$self.$capture_state = () => ({ OmoHeader, OmoUser, omoheader, db, users });

    	$$self.$inject_state = $$props => {
    		if ("omoheader" in $$props) $$invalidate(1, omoheader = $$props.omoheader);
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [users, omoheader, db];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { omoheader: 1, db: 2, users: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[2] === undefined && !("db" in props)) {
    			console.warn("<Team> was created without expected prop 'db'");
    		}

    		if (/*users*/ ctx[0] === undefined && !("users" in props)) {
    			console.warn("<Team> was created without expected prop 'users'");
    		}
    	}

    	get omoheader() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omoheader(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get db() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get users() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
        '/cities': Cities,
        '/pricing': Pricing,
        "/faq": FAQ,
        "/team": Team,
    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quanta/1-views/0-themes/OmoDesignBase.svelte generated by Svelte v3.20.1 */

    function create_fragment$i(ctx) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignBase",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoDesignUtilities.svelte generated by Svelte v3.20.1 */

    function create_fragment$j(ctx) {
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignUtilities",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoThemeLight.svelte generated by Svelte v3.20.1 */

    function create_fragment$k(ctx) {
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoThemeLight",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoButton.svelte generated by Svelte v3.20.1 */

    const file$f = "src/quanta/1-views/1-atoms/OmoButton.svelte";

    function create_fragment$l(ctx) {
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
    			attr_dev(button_1, "class", button_1_class_value = "" + (/*button*/ ctx[0].theme + " hover:bg-blue-800 bg-green-500 text-sm text-white px-3\n    py-1 rounded font-bolt"));
    			add_location(button_1, file$f, 9, 2, 122);
    			attr_dev(a, "href", a_href_value = /*button*/ ctx[0].link);
    			add_location(a, file$f, 8, 0, 97);
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

    			if (dirty & /*button*/ 1 && button_1_class_value !== (button_1_class_value = "" + (/*button*/ ctx[0].theme + " hover:bg-blue-800 bg-green-500 text-sm text-white px-3\n    py-1 rounded font-bolt"))) {
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoButton",
    			options,
    			id: create_fragment$l.name
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
    const file$g = "src/quanta/1-views/2-molecules/OmoNavbar.svelte";

    function create_fragment$m(ctx) {
    	let header;
    	let nav;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div1;
    	let a1;
    	let t2;
    	let a2;
    	let t4;
    	let a3;
    	let t6;
    	let a4;
    	let t8;
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
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a1 = element("a");
    			a1.textContent = "Preise";
    			t2 = space();
    			a2 = element("a");
    			a2.textContent = "Städte";
    			t4 = space();
    			a3 = element("a");
    			a3.textContent = "Team";
    			t6 = space();
    			a4 = element("a");
    			a4.textContent = "FAQ";
    			t8 = space();
    			create_component(omobutton.$$.fragment);
    			if (img.src !== (img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image");
    			attr_dev(img, "class", "w-auto h-8");
    			add_location(img, file$g, 11, 8, 277);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "mr-4");
    			add_location(a0, file$g, 10, 6, 243);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$g, 9, 4, 218);
    			attr_dev(a1, "href", "pricing");
    			attr_dev(a1, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a1, file$g, 16, 8, 431);
    			attr_dev(a2, "href", "cities");
    			attr_dev(a2, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a2, file$g, 21, 8, 579);
    			attr_dev(a3, "href", "team");
    			attr_dev(a3, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a3, file$g, 26, 8, 726);
    			attr_dev(a4, "href", "faq");
    			attr_dev(a4, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4\n          mr-8");
    			add_location(a4, file$g, 31, 8, 869);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$g, 15, 6, 404);
    			attr_dev(div2, "class", "content-center flex");
    			add_location(div2, file$g, 14, 4, 364);
    			attr_dev(nav, "class", "flex justify-between w-full px-3 py-3");
    			add_location(nav, file$g, 8, 2, 162);
    			attr_dev(header, "class", "bg-gray-900");
    			add_location(header, file$g, 7, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(nav, t0);
    			append_dev(nav, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(div1, t2);
    			append_dev(div1, a2);
    			append_dev(div1, t4);
    			append_dev(div1, a3);
    			append_dev(div1, t6);
    			append_dev(div1, a4);
    			append_dev(div1, t8);
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { chat = { text: "Call to Action" } } = $$props;
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { chat: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNavbar",
    			options,
    			id: create_fragment$m.name
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
          name: "Berlin",
          image: "https://source.unsplash.com/TK5I5L5JGxY"
        },
        {
          id: 2,
          name: "München",
          image: "https://source.unsplash.com/8QJSi37vhms "
        }, {
          id: 3,
          name: "Heidelberg",
          image: "https://source.unsplash.com/Yfo3qWK2pjY"
        },
        {
          id: 4,
          name: "Neue Stadt",
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
    const file$h = "src/App.svelte";

    function create_fragment$n(ctx) {
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
    			add_location(div0, file$h, 37, 2, 1112);
    			attr_dev(div1, "id", "pageContent");
    			attr_dev(div1, "class", "app flex flex-col overflow-y-scroll");
    			add_location(div1, file$h, 36, 0, 1043);
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$n($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
