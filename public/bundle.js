
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

    /* src/quanta/1-views/2-molecules/OmoCardArticle.svelte generated by Svelte v3.20.1 */

    const file = "src/quanta/1-views/2-molecules/OmoCardArticle.svelte";

    function create_fragment(ctx) {
    	let div4;
    	let div0;
    	let a0;
    	let t0_value = /*quant*/ ctx[0].data.tag + "";
    	let t0;
    	let t1;
    	let div1;
    	let a1;
    	let t2_value = /*quant*/ ctx[0].data.excerpt + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t4;
    	let a2;
    	let t5_value = /*quant*/ ctx[0].data.author + "";
    	let t5;
    	let t6;
    	let span;
    	let t7_value = /*quant*/ ctx[0].data.date + "";
    	let t7;
    	let div4_class_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t4 = space();
    			a2 = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			span = element("span");
    			t7 = text(t7_value);
    			attr_dev(a0, "class", "px-2 py-1 bg-gray-600 text-sm text-green-100 rounded");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 24, 4, 418);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file, 23, 2, 367);
    			attr_dev(a1, "class", "text-lg text-gray-700 font-medium");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 29, 4, 558);
    			attr_dev(div1, "class", "mt-4");
    			add_location(div1, file, 28, 2, 535);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "w-8 h-8 object-cover rounded");
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file, 35, 6, 755);
    			attr_dev(a2, "class", "text-gray-700 text-sm mx-3");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file, 39, 6, 866);
    			attr_dev(div2, "class", "flex items-center");
    			add_location(div2, file, 34, 4, 717);
    			attr_dev(span, "class", "font-light text-sm text-gray-600");
    			add_location(span, file, 41, 4, 952);
    			attr_dev(div3, "class", "flex justify-between items-center mt-4");
    			add_location(div3, file, 33, 2, 660);
    			attr_dev(div4, "class", div4_class_value = "flex flex-col px-8 py-6 max-w-md mx-auto " + /*quant*/ ctx[0].design.layout);
    			add_location(div4, file, 22, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, a1);
    			append_dev(a1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t4);
    			append_dev(div2, a2);
    			append_dev(a2, t5);
    			append_dev(div3, t6);
    			append_dev(div3, span);
    			append_dev(span, t7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.tag + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*quant*/ 1 && t2_value !== (t2_value = /*quant*/ ctx[0].data.excerpt + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*quant*/ 1 && img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quant*/ 1 && t5_value !== (t5_value = /*quant*/ ctx[0].data.author + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*quant*/ 1 && t7_value !== (t7_value = /*quant*/ ctx[0].data.date + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*quant*/ 1 && div4_class_value !== (div4_class_value = "flex flex-col px-8 py-6 max-w-md mx-auto " + /*quant*/ ctx[0].design.layout)) {
    				attr_dev(div4, "class", div4_class_value);
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
    	let { quant = {
    		model: {
    			name: "",
    			image: "",
    			author: "",
    			type: ""
    		},
    		design: { layout: "" },
    		data: {
    			id: "",
    			tag: "",
    			excerpt: "",
    			image: "",
    			author: "",
    			date: ""
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCardArticle> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCardArticle", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoCardArticle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardArticle",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoCardArticle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoCardArticle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoButton.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/quanta/1-views/1-atoms/OmoButton.svelte";

    function create_fragment$1(ctx) {
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
    			add_location(button_1, file$1, 9, 2, 122);
    			attr_dev(a, "href", a_href_value = /*button*/ ctx[0].link);
    			add_location(a, file$1, 8, 0, 97);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoButton",
    			options,
    			id: create_fragment$1.name
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
    const file$2 = "src/quanta/1-views/2-molecules/OmoNavbar.svelte";

    function create_fragment$2(ctx) {
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
    	let current;

    	const omobutton = new OmoButton({
    			props: { button: /*button*/ ctx[0] },
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
    			a1.textContent = "Link 1";
    			t2 = space();
    			a2 = element("a");
    			a2.textContent = "Link 2";
    			t4 = space();
    			a3 = element("a");
    			a3.textContent = "Link 3";
    			t6 = space();
    			create_component(omobutton.$$.fragment);
    			if (img.src !== (img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image");
    			attr_dev(img, "class", "w-auto h-8");
    			add_location(img, file$2, 11, 8, 279);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "mr-4");
    			add_location(a0, file$2, 10, 6, 245);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$2, 9, 4, 220);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a1, file$2, 16, 8, 433);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a2, file$2, 21, 8, 575);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a3, file$2, 26, 8, 717);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$2, 15, 6, 406);
    			attr_dev(div2, "class", "content-center flex");
    			add_location(div2, file$2, 14, 4, 366);
    			attr_dev(nav, "class", "flex justify-between w-full px-3 py-3");
    			add_location(nav, file$2, 8, 2, 164);
    			attr_dev(header, "class", "bg-gray-800");
    			add_location(header, file$2, 7, 0, 133);
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
    			mount_component(omobutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omobutton_changes = {};
    			if (dirty & /*button*/ 1) omobutton_changes.button = /*button*/ ctx[0];
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { button = { text: "Call to Action" } } = $$props;
    	const writable_props = ["button"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoNavbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoNavbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	$$self.$capture_state = () => ({ OmoButton, button });

    	$$self.$inject_state = $$props => {
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [button];
    }

    class OmoNavbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNavbar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get button() {
    		throw new Error("<OmoNavbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<OmoNavbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoBanner.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/quanta/1-views/2-molecules/OmoBanner.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t0_value = /*quant*/ ctx[0].data.uptitle + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*quant*/ ctx[0].data.title + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*quant*/ ctx[0].data.subtitle + "";
    	let t4;
    	let t5;
    	let a;
    	let t6_value = /*quant*/ ctx[0].data.button + "";
    	let t6;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			t6 = text(t6_value);
    			attr_dev(p0, "class", "font-bold text-sm uppercase");
    			add_location(p0, file$3, 16, 4, 390);
    			attr_dev(p1, "class", "text-3xl font-bold");
    			add_location(p1, file$3, 17, 4, 458);
    			attr_dev(p2, "class", "text-2xl mb-10 leading-none");
    			add_location(p2, file$3, 18, 4, 515);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "bg-green-400 py-3 px-6 text-white font-bold uppercase text-xs\n      rounded hover:bg-blue-800 hover:text-white");
    			add_location(a, file$3, 19, 4, 584);
    			attr_dev(div0, "class", "md:w-1/2");
    			add_location(div0, file$3, 15, 2, 363);
    			attr_dev(div1, "class", "bg-cover bg-center rounded h-auto text-white py-24 px-16 object-fill");
    			set_style(div1, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
    			add_location(div1, file$3, 12, 0, 224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p2);
    			append_dev(p2, t4);
    			append_dev(div0, t5);
    			append_dev(div0, a);
    			append_dev(a, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.uptitle + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*quant*/ 1 && t2_value !== (t2_value = /*quant*/ ctx[0].data.title + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*quant*/ 1 && t4_value !== (t4_value = /*quant*/ ctx[0].data.subtitle + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*quant*/ 1 && t6_value !== (t6_value = /*quant*/ ctx[0].data.button + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*quant*/ 1) {
    				set_style(div1, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let { quant = {
    		data: {
    			uptitle: "Uptitle",
    			title: "Title",
    			subtitle: "subtitle",
    			image: "https://source.unsplash.com/random",
    			button: "call to action"
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoBanner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoBanner", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoBanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoBanner",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoBanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoBanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoVideo.svelte generated by Svelte v3.20.1 */

    const file$4 = "src/quanta/1-views/2-molecules/OmoVideo.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(iframe, "class", "embed-responsive-item ");
    			if (iframe.src !== (iframe_src_value = /*data*/ ctx[0].link)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", iframe_title_value = /*data*/ ctx[0].title);
    			add_location(iframe, file$4, 19, 6, 493);
    			attr_dev(div0, "class", "embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border");
    			add_location(div0, file$4, 17, 4, 399);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file$4, 16, 2, 374);
    			attr_dev(div2, "class", "bg-blue-800 w-full flex justify-center rounded-lg");
    			add_location(div2, file$4, 15, 0, 308);
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
    		p: noop,
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
    	const model = {
    		name: "Omo Video",
    		author: "Samuel Andert",
    		image: "/image/samuel.jpg",
    		type: "omo/views/molecules"
    	};

    	const design = {};

    	const data = {
    		id: "",
    		title: "video",
    		link: "https://player.vimeo.com/video/349650067"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoVideo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoVideo", $$slots, []);
    	$$self.$capture_state = () => ({ model, design, data });
    	return [data, model, design];
    }

    class OmoVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { model: 1, design: 2, data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoVideo",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get model() {
    		return this.$$.ctx[1];
    	}

    	set model(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get design() {
    		return this.$$.ctx[2];
    	}

    	set design(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		return this.$$.ctx[0];
    	}

    	set data(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoHero.svelte generated by Svelte v3.20.1 */

    const file$5 = "src/quanta/1-views/2-molecules/OmoHero.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let h1;
    	let t0_value = /*quant*/ ctx[0].data.title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*quant*/ ctx[0].data.subline + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*quant*/ ctx[0].data.description + "";
    	let t4;
    	let t5;
    	let a;
    	let t6_value = /*quant*/ ctx[0].data.button + "";
    	let t6;
    	let t7;
    	let div2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let div4_class_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
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
    			attr_dev(h1, "class", "uppercase text-5xl text-blue-900 font-bold font-title\n        leading-none tracking-tight mb-2");
    			add_location(h1, file$5, 29, 6, 579);
    			attr_dev(div0, "class", "text-3xl text-gray-600 font-sans italic font-light tracking-wide\n        mb-6");
    			add_location(div0, file$5, 34, 6, 740);
    			attr_dev(p, "class", "text-gray-500 leading-relaxed mb-12");
    			add_location(p, file$5, 39, 6, 888);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "bg-green-400 hover:bg-blue-800 py-2 px-4 text-lg font-bold\n        text-white rounded");
    			add_location(a, file$5, 42, 6, 986);
    			attr_dev(div1, "class", "sm:w-3/5 flex flex-col items-center sm:items-start text-center\n      sm:text-left");
    			add_location(div1, file$5, 26, 4, 471);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.illustration)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*quant*/ ctx[0].data.title);
    			add_location(img, file$5, 50, 6, 1198);
    			attr_dev(div2, "class", "lg:px-20 w-2/5");
    			add_location(div2, file$5, 49, 4, 1163);
    			attr_dev(div3, "class", "flex flex-col-reverse sm:flex-row jusitfy-between items-center");
    			add_location(div3, file$5, 25, 2, 390);
    			attr_dev(div4, "class", div4_class_value = "flex flex-col mx-auto " + /*quant*/ ctx[0].design.layout);
    			add_location(div4, file$5, 24, 0, 330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
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
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*quant*/ 1 && t2_value !== (t2_value = /*quant*/ ctx[0].data.subline + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*quant*/ 1 && t4_value !== (t4_value = /*quant*/ ctx[0].data.description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*quant*/ 1 && t6_value !== (t6_value = /*quant*/ ctx[0].data.button + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*quant*/ 1 && img.src !== (img_src_value = /*quant*/ ctx[0].data.illustration)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quant*/ 1 && img_alt_value !== (img_alt_value = /*quant*/ ctx[0].data.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*quant*/ 1 && div4_class_value !== (div4_class_value = "flex flex-col mx-auto " + /*quant*/ ctx[0].design.layout)) {
    				attr_dev(div4, "class", div4_class_value);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { quant = {
    		id: "",
    		model: {
    			id: "",
    			name: "",
    			image: "",
    			author: "",
    			type: ""
    		},
    		data: {
    			id: "",
    			title: "",
    			subline: "",
    			description: "",
    			illustration: "",
    			button: ""
    		},
    		design: { layout: "" }
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoHero> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoHero", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoHero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHero",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoHero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoHero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoHeader.svelte generated by Svelte v3.20.1 */

    const file$6 = "src/quanta/1-views/2-molecules/OmoHeader.svelte";

    // (31:2) {#if quant.data.subline}
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*quant*/ ctx[0].data.subline + "";
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "flex-wrap text-2xl " + /*quant*/ ctx[0].design.subline);
    			add_location(div, file$6, 31, 4, 673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quant*/ 1 && t_value !== (t_value = /*quant*/ ctx[0].data.subline + "")) set_data_dev(t, t_value);

    			if (dirty & /*quant*/ 1 && div_class_value !== (div_class_value = "flex-wrap text-2xl " + /*quant*/ ctx[0].design.subline)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(31:2) {#if quant.data.subline}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if quant.data.illustration}
    function create_if_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.illustration)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*quant*/ ctx[0].data.title);
    			add_location(img, file$6, 37, 6, 878);
    			attr_dev(div, "class", div_class_value = "mt-16 mb-10 m-auto " + /*quant*/ ctx[0].design.illustration);
    			add_location(div, file$6, 36, 4, 811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quant*/ 1 && img.src !== (img_src_value = /*quant*/ ctx[0].data.illustration)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quant*/ 1 && img_alt_value !== (img_alt_value = /*quant*/ ctx[0].data.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*quant*/ 1 && div_class_value !== (div_class_value = "mt-16 mb-10 m-auto " + /*quant*/ ctx[0].design.illustration)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:2) {#if quant.data.illustration}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*quant*/ ctx[0].data.title + "";
    	let t0;
    	let h2_class_value;
    	let t1;
    	let t2;
    	let div_class_value;
    	let if_block0 = /*quant*/ ctx[0].data.subline && create_if_block_1(ctx);
    	let if_block1 = /*quant*/ ctx[0].data.illustration && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h2, "class", h2_class_value = "flex-wrap uppercase text-4xl " + /*quant*/ ctx[0].design.title);
    			add_location(h2, file$6, 27, 2, 548);
    			attr_dev(div, "class", div_class_value = "m-auto flex flex-col justify-center text-center " + /*quant*/ ctx[0].design.layout);
    			add_location(div, file$6, 25, 0, 460);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*quant*/ 1 && h2_class_value !== (h2_class_value = "flex-wrap uppercase text-4xl " + /*quant*/ ctx[0].design.title)) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			if (/*quant*/ ctx[0].data.subline) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*quant*/ ctx[0].data.illustration) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*quant*/ 1 && div_class_value !== (div_class_value = "m-auto flex flex-col justify-center text-center " + /*quant*/ ctx[0].design.layout)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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
    	let { quant = {
    		id: "",
    		model: {
    			id: "",
    			name: "",
    			image: "",
    			author: "",
    			type: ""
    		},
    		data: {
    			id: "",
    			title: "",
    			subline: "",
    			illustration: ""
    		},
    		design: {
    			layout: "py-20 bg-gray-100",
    			title: "text-gray-800 font-bold font-title",
    			subline: "text-gray-500 italic font-light font-sans tracking-wide",
    			illustration: "w-1/2"
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoHeader> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoHeader", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHeader",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCard.svelte generated by Svelte v3.20.1 */

    const file$7 = "src/quanta/1-views/2-molecules/OmoCard.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(img, file$7, 7, 6, 164);
    			attr_dev(a0, "href", a0_href_value = "city?id=" + /*city*/ ctx[0].id);
    			attr_dev(a0, "class", "text-xl font-bold font-title uppercase");
    			add_location(a0, file$7, 14, 8, 413);
    			attr_dev(div0, "class", "w-full px-4 pb-2 pt-3 text-center hover:bg-green-400 bg-blue-800\n        text-white");
    			add_location(div0, file$7, 11, 6, 299);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$7, 6, 4, 98);
    			attr_dev(a1, "href", a1_href_value = "city?id=" + /*city*/ ctx[0].id);
    			add_location(a1, file$7, 5, 2, 65);
    			attr_dev(div2, "class", "min-w-100");
    			add_location(div2, file$7, 4, 0, 39);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCard",
    			options,
    			id: create_fragment$7.name
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

    const cities = writable(
        [{
                id: 1,
                name: "Berlin",
                image: "https://source.unsplash.com/TK5I5L5JGxY"
            },
            {
                id: 2,
                name: "Munich",
                image: "https://source.unsplash.com/8QJSi37vhms "
            },
            {
                id: 3,
                name: "Heidelberg",
                image: "https://source.unsplash.com/Yfo3qWK2pjY"
            },
        ]);

    /* src/quanta/1-views/3-organisms/OmoCities.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/quanta/1-views/3-organisms/OmoCities.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (10:2) {#each $cities as city, i (city.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let current;

    	const omocard = new OmoCard({
    			props: {
    				city: /*city*/ ctx[2],
    				currentId: /*currentId*/ ctx[0]
    			},
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
    		p: function update(ctx, dirty) {
    			const omocard_changes = {};
    			if (dirty & /*$cities*/ 2) omocard_changes.city = /*city*/ ctx[2];
    			if (dirty & /*currentId*/ 1) omocard_changes.currentId = /*currentId*/ ctx[0];
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
    			if (detaching) detach_dev(first);
    			destroy_component(omocard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:2) {#each $cities as city, i (city.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$cities*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*city*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4\n  gap-6");
    			add_location(div, file$8, 6, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cities, currentId*/ 3) {
    				const each_value = /*$cities*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let $cities;
    	validate_store(cities, "cities");
    	component_subscribe($$self, cities, $$value => $$invalidate(1, $cities = $$value));
    	let { currentId } = $$props;
    	const writable_props = ["currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCities", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentId" in $$props) $$invalidate(0, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ OmoCard, cities, currentId, $cities });

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) $$invalidate(0, currentId = $$props.currentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentId, $cities];
    }

    class OmoCities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { currentId: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCities",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentId*/ ctx[0] === undefined && !("currentId" in props)) {
    			console.warn("<OmoCities> was created without expected prop 'currentId'");
    		}
    	}

    	get currentId() {
    		throw new Error("<OmoCities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<OmoCities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoPricing.svelte generated by Svelte v3.20.1 */

    const file$9 = "src/quanta/1-views/2-molecules/OmoPricing.svelte";

    function create_fragment$9(ctx) {
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
    			div24 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Community";
    			t1 = space();
    			h20 = element("h2");
    			h20.textContent = "FREE";
    			t3 = text("\n        Omo Earth offers everything needed to run your opensource project at\n        scale. Get in touch for details.");
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
    			span0.textContent = "0% Provisions";
    			t7 = space();
    			li1 = element("li");
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			polyline1 = svg_element("polyline");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Self Hosted";
    			t10 = space();
    			li2 = element("li");
    			div3 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			polyline2 = svg_element("polyline");
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "Data Under Control";
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
    			h11.textContent = "MINI OMO";
    			t19 = space();
    			h21 = element("h2");
    			span3 = element("span");
    			span3.textContent = "3,33€ / Week";
    			t21 = text("\n      Omo Earth offers everything needed to run your opensource project at\n      scale. Get in touch for details.");
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
    			span4.textContent = "0% Provision";
    			t25 = space();
    			li4 = element("li");
    			div11 = element("div");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			polyline4 = svg_element("polyline");
    			t26 = space();
    			span5 = element("span");
    			span5.textContent = "Decentralized Backup";
    			t28 = space();
    			li5 = element("li");
    			div12 = element("div");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			polyline5 = svg_element("polyline");
    			t29 = space();
    			span6 = element("span");
    			span6.textContent = "Data Under Control";
    			t31 = space();
    			div14 = element("div");
    			button1 = element("button");
    			button1.textContent = "Select";
    			t33 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div16 = element("div");
    			h12 = element("h1");
    			h12.textContent = "OMO SAPIENS";
    			t35 = space();
    			h22 = element("h2");
    			h22.textContent = "11,11€ / Week";
    			t37 = text("\n        Omo Earth offers everything needed to run your opensource project at\n        scale. Get in touch for details.");
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
    			span7.textContent = "0% Provision";
    			t41 = space();
    			li7 = element("li");
    			div18 = element("div");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			polyline7 = svg_element("polyline");
    			t42 = space();
    			span8 = element("span");
    			span8.textContent = "Decentralized Backup";
    			t44 = space();
    			li8 = element("li");
    			div19 = element("div");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			polyline8 = svg_element("polyline");
    			t45 = space();
    			span9 = element("span");
    			span9.textContent = "Data Under Control";
    			t47 = space();
    			div21 = element("div");
    			button2 = element("button");
    			button2.textContent = "Select";
    			attr_dev(h10, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n          tracking-wide");
    			add_location(h10, file$9, 25, 8, 671);
    			attr_dev(h20, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h20, file$9, 30, 8, 811);
    			attr_dev(div0, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n        text-black px-8 lg:px-6");
    			add_location(div0, file$9, 22, 6, 552);
    			attr_dev(path0, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path0, file$9, 49, 16, 1525);
    			attr_dev(polyline0, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline0, file$9, 50, 16, 1589);
    			attr_dev(svg0, "class", "w-6 h-6 align-middle");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			add_location(svg0, file$9, 39, 14, 1189);
    			attr_dev(div1, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div1, file$9, 38, 12, 1115);
    			attr_dev(span0, "class", "text-gray-700 text-lg ml-3");
    			add_location(span0, file$9, 53, 12, 1685);
    			attr_dev(li0, "class", "flex items-center");
    			add_location(li0, file$9, 37, 10, 1072);
    			attr_dev(path1, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path1, file$9, 67, 16, 2226);
    			attr_dev(polyline1, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline1, file$9, 68, 16, 2290);
    			attr_dev(svg1, "class", "w-6 h-6 align-middle");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			add_location(svg1, file$9, 57, 14, 1890);
    			attr_dev(div2, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div2, file$9, 56, 12, 1816);
    			attr_dev(span1, "class", "text-gray-700 text-lg ml-3");
    			add_location(span1, file$9, 71, 12, 2386);
    			attr_dev(li1, "class", "flex items-center");
    			add_location(li1, file$9, 55, 10, 1773);
    			attr_dev(path2, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path2, file$9, 85, 16, 2925);
    			attr_dev(polyline2, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline2, file$9, 86, 16, 2989);
    			attr_dev(svg2, "class", "w-6 h-6 align-middle");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			add_location(svg2, file$9, 75, 14, 2589);
    			attr_dev(div3, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div3, file$9, 74, 12, 2515);
    			attr_dev(span2, "class", "text-gray-700 text-lg ml-3");
    			add_location(span2, file$9, 89, 12, 3085);
    			attr_dev(li2, "class", "flex items-center");
    			add_location(li2, file$9, 73, 10, 2472);
    			add_location(ul0, file$9, 36, 8, 1057);
    			attr_dev(div4, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div4, file$9, 35, 6, 1010);
    			attr_dev(button0, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n          text-green-400 rounded px-4 py-2 block shadow-xl hover:border-blue-800\n          hover:bg-blue-800 hover:text-white");
    			add_location(button0, file$9, 94, 8, 3251);
    			attr_dev(div5, "class", "block flex items-center p-8");
    			add_location(div5, file$9, 93, 6, 3201);
    			attr_dev(div6, "class", "bg-white text-black rounded shadow-inner shadow-lg overflow-hidden");
    			add_location(div6, file$9, 20, 4, 459);
    			attr_dev(div7, "class", "max-w-sm sm:w-4/5 lg:w-1/3 sm:my-5 my-8 z-0 rounded shadow-lg");
    			add_location(div7, file$9, 19, 2, 379);
    			attr_dev(div8, "class", "text-sm leading-none rounded-t-lg bg-blue-800 text-white\n      font-semibold uppercase py-2 text-center tracking-wide");
    			add_location(div8, file$9, 106, 4, 3651);
    			attr_dev(h11, "class", "text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide");
    			add_location(h11, file$9, 114, 6, 3936);
    			attr_dev(span3, "class", "text-3xl");
    			add_location(span3, file$9, 119, 8, 4117);
    			attr_dev(h21, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h21, file$9, 118, 6, 4057);
    			attr_dev(div9, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black\n      px-8 lg:px-6");
    			add_location(div9, file$9, 111, 4, 3823);
    			attr_dev(path3, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path3, file$9, 139, 14, 4810);
    			attr_dev(polyline3, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline3, file$9, 140, 14, 4872);
    			attr_dev(svg3, "class", "w-6 h-6 align-middle");
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "24");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			add_location(svg3, file$9, 129, 12, 4494);
    			attr_dev(div10, "class", "rounded-full p-2 fill-current text-green-700");
    			add_location(div10, file$9, 128, 10, 4423);
    			attr_dev(span4, "class", "text-gray-700 text-lg ml-3");
    			add_location(span4, file$9, 143, 10, 4962);
    			attr_dev(li3, "class", "flex items-center");
    			add_location(li3, file$9, 127, 8, 4382);
    			attr_dev(path4, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path4, file$9, 157, 14, 5474);
    			attr_dev(polyline4, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline4, file$9, 158, 14, 5536);
    			attr_dev(svg4, "class", "w-6 h-6 align-middle");
    			attr_dev(svg4, "width", "24");
    			attr_dev(svg4, "height", "24");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-width", "2");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			add_location(svg4, file$9, 147, 12, 5158);
    			attr_dev(div11, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div11, file$9, 146, 10, 5086);
    			attr_dev(span5, "class", "text-gray-700 text-lg ml-3");
    			add_location(span5, file$9, 161, 10, 5626);
    			attr_dev(li4, "class", "flex items-center");
    			add_location(li4, file$9, 145, 8, 5045);
    			attr_dev(path5, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path5, file$9, 175, 14, 6146);
    			attr_dev(polyline5, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline5, file$9, 176, 14, 6208);
    			attr_dev(svg5, "class", "w-6 h-6 align-middle");
    			attr_dev(svg5, "width", "24");
    			attr_dev(svg5, "height", "24");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "stroke-width", "2");
    			attr_dev(svg5, "stroke-linecap", "round");
    			attr_dev(svg5, "stroke-linejoin", "round");
    			add_location(svg5, file$9, 165, 12, 5830);
    			attr_dev(div12, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div12, file$9, 164, 10, 5758);
    			attr_dev(span6, "class", "text-gray-700 text-lg ml-3");
    			add_location(span6, file$9, 179, 10, 6298);
    			attr_dev(li5, "class", "flex items-center");
    			add_location(li5, file$9, 163, 8, 5717);
    			add_location(ul1, file$9, 126, 6, 4369);
    			attr_dev(div13, "class", "flex pl-12 justify-start sm:justify-start mt-3");
    			add_location(div13, file$9, 125, 4, 4302);
    			attr_dev(button1, "class", "mt-3 text-lg font-semibold bg-green-400 w-full text-white rounded\n        px-6 py-3 block shadow-xl hover:bg-blue-800");
    			add_location(button1, file$9, 185, 6, 6455);
    			attr_dev(div14, "class", "block flex items-center p-8");
    			add_location(div14, file$9, 184, 4, 6407);
    			attr_dev(div15, "class", "w-full max-w-md sm:w-2/3 lg:w-1/3 sm:my-5 my-8 relative z-10 bg-white\n    rounded-lg shadow-lg");
    			add_location(div15, file$9, 103, 2, 3534);
    			attr_dev(h12, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n          tracking-wide");
    			add_location(h12, file$9, 200, 8, 6963);
    			attr_dev(h22, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h22, file$9, 205, 8, 7105);
    			attr_dev(div16, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n        text-black px-8 lg:px-6");
    			add_location(div16, file$9, 197, 6, 6844);
    			attr_dev(path6, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path6, file$9, 223, 16, 7827);
    			attr_dev(polyline6, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline6, file$9, 224, 16, 7891);
    			attr_dev(svg6, "class", "w-6 h-6 align-middle");
    			attr_dev(svg6, "width", "24");
    			attr_dev(svg6, "height", "24");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "stroke-width", "2");
    			attr_dev(svg6, "stroke-linecap", "round");
    			attr_dev(svg6, "stroke-linejoin", "round");
    			add_location(svg6, file$9, 213, 14, 7491);
    			attr_dev(div17, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div17, file$9, 212, 12, 7417);
    			attr_dev(span7, "class", "text-gray-700 text-lg ml-3");
    			add_location(span7, file$9, 227, 12, 7987);
    			attr_dev(li6, "class", "flex items-center");
    			add_location(li6, file$9, 211, 10, 7374);
    			attr_dev(path7, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path7, file$9, 241, 16, 8526);
    			attr_dev(polyline7, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline7, file$9, 242, 16, 8590);
    			attr_dev(svg7, "class", "w-6 h-6 align-middle");
    			attr_dev(svg7, "width", "24");
    			attr_dev(svg7, "height", "24");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "stroke-width", "2");
    			attr_dev(svg7, "stroke-linecap", "round");
    			attr_dev(svg7, "stroke-linejoin", "round");
    			add_location(svg7, file$9, 231, 14, 8190);
    			attr_dev(div18, "class", "rounded-full p-2 fill-current text-green-700");
    			add_location(div18, file$9, 230, 12, 8117);
    			attr_dev(span8, "class", "text-gray-700 text-lg ml-3");
    			add_location(span8, file$9, 245, 12, 8686);
    			attr_dev(li7, "class", "flex items-center");
    			add_location(li7, file$9, 229, 10, 8074);
    			attr_dev(path8, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path8, file$9, 259, 16, 9234);
    			attr_dev(polyline8, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline8, file$9, 260, 16, 9298);
    			attr_dev(svg8, "class", "w-6 h-6 align-middle");
    			attr_dev(svg8, "width", "24");
    			attr_dev(svg8, "height", "24");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "stroke-width", "2");
    			attr_dev(svg8, "stroke-linecap", "round");
    			attr_dev(svg8, "stroke-linejoin", "round");
    			add_location(svg8, file$9, 249, 14, 8898);
    			attr_dev(div19, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div19, file$9, 248, 12, 8824);
    			attr_dev(span9, "class", "text-gray-700 text-lg ml-3");
    			add_location(span9, file$9, 263, 12, 9394);
    			attr_dev(li8, "class", "flex items-center");
    			add_location(li8, file$9, 247, 10, 8781);
    			add_location(ul2, file$9, 210, 8, 7359);
    			attr_dev(div20, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div20, file$9, 209, 6, 7312);
    			attr_dev(button2, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n          text-green-400 rounded px-4 py-2 block shadow-xl hover:border-blue-800\n          hover:bg-blue-800 hover:text-white");
    			add_location(button2, file$9, 269, 8, 9561);
    			attr_dev(div21, "class", "block flex items-center p-8");
    			add_location(div21, file$9, 268, 6, 9511);
    			attr_dev(div22, "class", "bg-white text-black rounded-lg shadow-inner shadow-lg\n      overflow-hidden");
    			add_location(div22, file$9, 194, 4, 6742);
    			attr_dev(div23, "class", "w-full max-w-sm sm:w-4/5 lg:w-1/3 sm:my-5 my-8 z-0 rounded shadow-lg");
    			add_location(div23, file$9, 192, 2, 6651);
    			attr_dev(div24, "class", "w-full m-auto flex flex-col md:flex-row items-center");
    			add_location(div24, file$9, 18, 0, 310);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
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
    			if (detaching) detach_dev(div24);
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
    	let { quant = {
    		id: "q8",
    		component: OmoPricing,
    		model: {
    			id: "m8",
    			name: "Omo Pricing",
    			image: "/images/samuel.jpg",
    			author: "Samuel Andert",
    			type: "view",
    			group: "omo",
    			tags: "molecule"
    		},
    		design: {},
    		data: []
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoPricing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoPricing", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoPricing_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoPricing_1",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoPricing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoPricing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoSubscribe.svelte generated by Svelte v3.20.1 */

    const file$a = "src/quanta/1-views/2-molecules/OmoSubscribe.svelte";

    function create_fragment$a(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0_value = /*quant*/ ctx[0].data.title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*quant*/ ctx[0].data.subline + "";
    	let t2;
    	let t3;
    	let div2;
    	let input;
    	let input_placeholder_value;
    	let t4;
    	let button;
    	let t5_value = /*quant*/ ctx[0].data.button + "";
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
    			attr_dev(div0, "class", "m-0 p-0 text-5xl font-title font-bold uppercase text-white\n      antialiased text-center");
    			add_location(div0, file$a, 26, 4, 612);
    			attr_dev(div1, "class", " m-0 p-0 text-2xl text-white italic font-light font-sans\n      antialiased text-center");
    			add_location(div1, file$a, 31, 4, 761);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "text-lg text-gray-600 w-2/3 px-6 rounded");
    			attr_dev(input, "placeholder", input_placeholder_value = /*quant*/ ctx[0].data.email);
    			add_location(input, file$a, 37, 6, 960);
    			attr_dev(button, "class", "py-3 px-4 w-1/3 bg-green-400 font-bold text-lg rounded text-white\n        hover:bg-blue-800");
    			attr_dev(button, "type", "button");
    			add_location(button, file$a, 41, 6, 1092);
    			attr_dev(div2, "class", " mt-3 flex flex-row flex-wrap");
    			add_location(div2, file$a, 36, 4, 910);
    			attr_dev(div3, "class", "p-10 py-20 flex flex-col flex-wrap justify-center content-center");
    			add_location(div3, file$a, 25, 2, 529);
    			attr_dev(div4, "class", "bg-cover bg-center h-auto text-white py-24 px-16 object-fill");
    			set_style(div4, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
    			add_location(div4, file$a, 22, 0, 398);
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
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*quant*/ 1 && t2_value !== (t2_value = /*quant*/ ctx[0].data.subline + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*quant*/ 1 && input_placeholder_value !== (input_placeholder_value = /*quant*/ ctx[0].data.email)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*quant*/ 1 && t5_value !== (t5_value = /*quant*/ ctx[0].data.button + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*quant*/ 1) {
    				set_style(div4, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { quant = {
    		model: {
    			name: "",
    			image: "",
    			author: "",
    			type: ""
    		},
    		design: { layout: "" },
    		data: {
    			id: "",
    			title: "Get Our Updates",
    			subline: "Find out about events and other news",
    			email: "john@mail.com",
    			image: "https://source.unsplash.com/random",
    			button: "Subscribe"
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoSubscribe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoSubscribe", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoSubscribe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSubscribe",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoSubscribe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoSubscribe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoToggle.svelte generated by Svelte v3.20.1 */

    const file$b = "src/quanta/1-views/1-atoms/OmoToggle.svelte";

    // (7:0) {#if omotoggle.status}
    function create_if_block_1$1(ctx) {
    	let label;
    	let span2;
    	let span0;
    	let t;
    	let span1;
    	let input;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span2 = element("span");
    			span0 = element("span");
    			t = space();
    			span1 = element("span");
    			input = element("input");
    			attr_dev(span0, "class", "block w-10 h-6 bg-green-400 rounded-full shadow-inner");
    			add_location(span0, file$b, 9, 6, 204);
    			attr_dev(input, "id", "checked");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "absolute opacity-0 w-0 h-0");
    			add_location(input, file$b, 14, 8, 511);
    			attr_dev(span1, "class", "absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0\n        left-0 focus-within:shadow-outline transition-transform duration-300\n        ease-in-out bg-gray-100 transform translate-x-full");
    			add_location(span1, file$b, 10, 6, 281);
    			attr_dev(span2, "class", "relative");
    			add_location(span2, file$b, 8, 4, 174);
    			attr_dev(label, "for", "checked");
    			attr_dev(label, "class", "mt-3 inline-flex items-center cursor-pointer");
    			add_location(label, file$b, 7, 2, 95);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span2);
    			append_dev(span2, span0);
    			append_dev(span2, t);
    			append_dev(span2, span1);
    			append_dev(span1, input);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(7:0) {#if omotoggle.status}",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if !omotoggle.status}
    function create_if_block$1(ctx) {
    	let label;
    	let span2;
    	let span0;
    	let t;
    	let span1;
    	let input;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span2 = element("span");
    			span0 = element("span");
    			t = space();
    			span1 = element("span");
    			input = element("input");
    			attr_dev(span0, "class", "block w-10 h-6 bg-gray-400 rounded-full shadow-inner");
    			add_location(span0, file$b, 26, 6, 796);
    			attr_dev(input, "id", "unchecked");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "absolute opacity-0 w-0 h-0");
    			add_location(input, file$b, 31, 8, 1072);
    			attr_dev(span1, "class", "absolute block w-4 h-4 mt-1 ml-1 bg-white rounded-full shadow\n        inset-y-0 left-0 focus-within:shadow-outline transition-transform\n        duration-300 ease-in-out");
    			add_location(span1, file$b, 27, 6, 872);
    			attr_dev(span2, "class", "relative");
    			add_location(span2, file$b, 25, 4, 766);
    			attr_dev(label, "for", "unchecked");
    			attr_dev(label, "class", "mt-3 inline-flex items-center cursor-pointer");
    			add_location(label, file$b, 24, 2, 685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span2);
    			append_dev(span2, span0);
    			append_dev(span2, t);
    			append_dev(span2, span1);
    			append_dev(span1, input);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(24:0) {#if !omotoggle.status}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*omotoggle*/ ctx[0].status && create_if_block_1$1(ctx);
    	let if_block1 = !/*omotoggle*/ ctx[0].status && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*omotoggle*/ ctx[0].status) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*omotoggle*/ ctx[0].status) {
    				if (!if_block1) {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let { omotoggle = { status: false } } = $$props;
    	const writable_props = ["omotoggle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoToggle> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoToggle", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omotoggle" in $$props) $$invalidate(0, omotoggle = $$props.omotoggle);
    	};

    	$$self.$capture_state = () => ({ omotoggle });

    	$$self.$inject_state = $$props => {
    		if ("omotoggle" in $$props) $$invalidate(0, omotoggle = $$props.omotoggle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omotoggle];
    }

    class OmoToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { omotoggle: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoToggle",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get omotoggle() {
    		throw new Error("<OmoToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omotoggle(value) {
    		throw new Error("<OmoToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoTable.svelte generated by Svelte v3.20.1 */
    const file$c = "src/quanta/1-views/2-molecules/OmoTable.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let tr1;
    	let td0;
    	let t8;
    	let td1;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t9;
    	let span1;
    	let p0;
    	let t11;
    	let p1;
    	let t13;
    	let p2;
    	let t15;
    	let td2;
    	let p3;
    	let t17;
    	let p4;
    	let t19;
    	let td3;
    	let p5;
    	let t21;
    	let tr2;
    	let td4;
    	let t22;
    	let td5;
    	let span2;
    	let img1;
    	let img1_src_value;
    	let t23;
    	let span3;
    	let p6;
    	let t25;
    	let p7;
    	let t27;
    	let p8;
    	let t29;
    	let td6;
    	let p9;
    	let t31;
    	let p10;
    	let t33;
    	let td7;
    	let p11;
    	let current;

    	const omotoggle0 = new OmoToggle({
    			props: { omotoggle: /*omotoggle*/ ctx[0] },
    			$$inline: true
    		});

    	const omotoggle1 = new OmoToggle({
    			props: { omotoggle2: /*omotoggle2*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Status";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Mobile";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Email";
    			t7 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			create_component(omotoggle0.$$.fragment);
    			t8 = space();
    			td1 = element("td");
    			span0 = element("span");
    			img0 = element("img");
    			t9 = space();
    			span1 = element("span");
    			p0 = element("p");
    			p0.textContent = "Loki Owiredu";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "244224317";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Manager";
    			t15 = space();
    			td2 = element("td");
    			p3 = element("p");
    			p3.textContent = "244224317";
    			t17 = space();
    			p4 = element("p");
    			p4.textContent = "loki @gmail.com";
    			t19 = space();
    			td3 = element("td");
    			p5 = element("p");
    			p5.textContent = "loki@gmail.com";
    			t21 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			create_component(omotoggle1.$$.fragment);
    			t22 = space();
    			td5 = element("td");
    			span2 = element("span");
    			img1 = element("img");
    			t23 = space();
    			span3 = element("span");
    			p6 = element("p");
    			p6.textContent = "Loki Owiredu";
    			t25 = space();
    			p7 = element("p");
    			p7.textContent = "244224317";
    			t27 = space();
    			p8 = element("p");
    			p8.textContent = "Manager";
    			t29 = space();
    			td6 = element("td");
    			p9 = element("p");
    			p9.textContent = "244224317";
    			t31 = space();
    			p10 = element("p");
    			p10.textContent = "loki@gmail.com";
    			t33 = space();
    			td7 = element("td");
    			p11 = element("p");
    			p11.textContent = "loki@gmail.com";
    			attr_dev(th0, "class", "px-2 py-1 text-sm");
    			add_location(th0, file$c, 17, 12, 426);
    			attr_dev(th1, "class", "text-sm");
    			add_location(th1, file$c, 18, 12, 480);
    			attr_dev(th2, "class", "hidden md:table-cell text-sm");
    			add_location(th2, file$c, 19, 12, 522);
    			attr_dev(th3, "class", "hidden md:table-cell text-sm ");
    			add_location(th3, file$c, 20, 12, 587);
    			attr_dev(tr0, "class", " text-gray-600 text-left bg-gray-300 uppercase");
    			add_location(tr0, file$c, 16, 10, 354);
    			attr_dev(thead, "class", "");
    			add_location(thead, file$c, 15, 8, 327);
    			attr_dev(td0, "class", "pl-6 py-4");
    			add_location(td0, file$c, 25, 12, 796);
    			attr_dev(img0, "class", "hidden mr-1 md:mr-2 md:inline-block h-8 w-8 rounded\n                  object-cover");
    			if (img0.src !== (img0_src_value = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$c, 30, 16, 969);
    			add_location(span0, file$c, 29, 14, 946);
    			attr_dev(p0, "class", "text-gray-800 text-sm");
    			add_location(p0, file$c, 37, 16, 1366);
    			attr_dev(p1, "class", "md:hidden text-xs text-gray-600 font-medium");
    			add_location(p1, file$c, 38, 16, 1432);
    			attr_dev(p2, "class", "hidden md:table-cell text-xs text-gray-500 font-medium");
    			add_location(p2, file$c, 41, 16, 1553);
    			attr_dev(span1, "class", "py-4 w-40");
    			add_location(span1, file$c, 36, 14, 1325);
    			attr_dev(td1, "class", "flex inline-flex items-center");
    			add_location(td1, file$c, 28, 12, 889);
    			attr_dev(p3, "class", "text-sm text-gray-800 font-medium");
    			add_location(p3, file$c, 48, 14, 1785);
    			attr_dev(p4, "class", "text-xs text-gray-500 font-medium");
    			add_location(p4, file$c, 49, 14, 1858);
    			attr_dev(td2, "class", "hidden md:table-cell");
    			add_location(td2, file$c, 47, 12, 1737);
    			attr_dev(p5, "class", "text-sm text-gray-700 font-medium");
    			add_location(p5, file$c, 52, 14, 2001);
    			attr_dev(td3, "class", "hidden md:table-cell");
    			add_location(td3, file$c, 51, 12, 1953);
    			attr_dev(tr1, "class", "accordion border-b border-grey-light hover:bg-gray-100");
    			add_location(tr1, file$c, 24, 10, 716);
    			attr_dev(td4, "class", "pl-6 py-4");
    			add_location(td4, file$c, 57, 12, 2190);
    			attr_dev(img1, "class", "hidden mr-1 md:mr-2 md:inline-block h-8 w-8 rounded\n                  object-cover");
    			if (img1.src !== (img1_src_value = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$c, 62, 16, 2364);
    			add_location(span2, file$c, 61, 14, 2341);
    			attr_dev(p6, "class", "text-gray-800 text-sm");
    			add_location(p6, file$c, 69, 16, 2761);
    			attr_dev(p7, "class", "md:hidden text-xs text-gray-600 font-medium");
    			add_location(p7, file$c, 70, 16, 2827);
    			attr_dev(p8, "class", "hidden md:table-cell text-xs text-gray-500 font-medium");
    			add_location(p8, file$c, 73, 16, 2948);
    			attr_dev(span3, "class", "py-3 w-40");
    			add_location(span3, file$c, 68, 14, 2720);
    			attr_dev(td5, "class", "flex inline-flex items-center");
    			add_location(td5, file$c, 60, 12, 2284);
    			attr_dev(p9, "class", "text-sm text-gray-800 font-medium");
    			add_location(p9, file$c, 80, 14, 3180);
    			attr_dev(p10, "class", "text-xs text-gray-500 font-medium");
    			add_location(p10, file$c, 81, 14, 3253);
    			attr_dev(td6, "class", "hidden md:table-cell");
    			add_location(td6, file$c, 79, 12, 3132);
    			attr_dev(p11, "class", "text-sm text-gray-700 font-medium");
    			add_location(p11, file$c, 84, 14, 3395);
    			attr_dev(td7, "class", "hidden md:table-cell");
    			add_location(td7, file$c, 83, 12, 3347);
    			attr_dev(tr2, "class", "accordion border-b border-grey-light hover:bg-gray-100");
    			add_location(tr2, file$c, 56, 10, 2110);
    			attr_dev(tbody, "class", "bg-white");
    			add_location(tbody, file$c, 23, 8, 681);
    			attr_dev(table, "class", "w-full shadow-lg rounded ");
    			add_location(table, file$c, 14, 6, 277);
    			set_style(div0, "overflow-x", "auto");
    			add_location(div0, file$c, 13, 4, 240);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$c, 12, 2, 212);
    			attr_dev(div2, "class", "container mx-auto");
    			add_location(div2, file$c, 11, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			mount_component(omotoggle0, td0, null);
    			append_dev(tr1, t8);
    			append_dev(tr1, td1);
    			append_dev(td1, span0);
    			append_dev(span0, img0);
    			append_dev(td1, t9);
    			append_dev(td1, span1);
    			append_dev(span1, p0);
    			append_dev(span1, t11);
    			append_dev(span1, p1);
    			append_dev(span1, t13);
    			append_dev(span1, p2);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, p3);
    			append_dev(td2, t17);
    			append_dev(td2, p4);
    			append_dev(tr1, t19);
    			append_dev(tr1, td3);
    			append_dev(td3, p5);
    			append_dev(tbody, t21);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td4);
    			mount_component(omotoggle1, td4, null);
    			append_dev(tr2, t22);
    			append_dev(tr2, td5);
    			append_dev(td5, span2);
    			append_dev(span2, img1);
    			append_dev(td5, t23);
    			append_dev(td5, span3);
    			append_dev(span3, p6);
    			append_dev(span3, t25);
    			append_dev(span3, p7);
    			append_dev(span3, t27);
    			append_dev(span3, p8);
    			append_dev(tr2, t29);
    			append_dev(tr2, td6);
    			append_dev(td6, p9);
    			append_dev(td6, t31);
    			append_dev(td6, p10);
    			append_dev(tr2, t33);
    			append_dev(tr2, td7);
    			append_dev(td7, p11);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omotoggle0_changes = {};
    			if (dirty & /*omotoggle*/ 1) omotoggle0_changes.omotoggle = /*omotoggle*/ ctx[0];
    			omotoggle0.$set(omotoggle0_changes);
    			const omotoggle1_changes = {};
    			if (dirty & /*omotoggle2*/ 2) omotoggle1_changes.omotoggle2 = /*omotoggle2*/ ctx[1];
    			omotoggle1.$set(omotoggle1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omotoggle0.$$.fragment, local);
    			transition_in(omotoggle1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omotoggle0.$$.fragment, local);
    			transition_out(omotoggle1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(omotoggle0);
    			destroy_component(omotoggle1);
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
    	let { omotoggle = { status: true } } = $$props;
    	let { omotoggle2 = { status: false } } = $$props;
    	const writable_props = ["omotoggle", "omotoggle2"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoTable", $$slots, []);

    	$$self.$set = $$props => {
    		if ("omotoggle" in $$props) $$invalidate(0, omotoggle = $$props.omotoggle);
    		if ("omotoggle2" in $$props) $$invalidate(1, omotoggle2 = $$props.omotoggle2);
    	};

    	$$self.$capture_state = () => ({ OmoToggle, omotoggle, omotoggle2 });

    	$$self.$inject_state = $$props => {
    		if ("omotoggle" in $$props) $$invalidate(0, omotoggle = $$props.omotoggle);
    		if ("omotoggle2" in $$props) $$invalidate(1, omotoggle2 = $$props.omotoggle2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [omotoggle, omotoggle2];
    }

    class OmoTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { omotoggle: 0, omotoggle2: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoTable",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get omotoggle() {
    		throw new Error("<OmoTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omotoggle(value) {
    		throw new Error("<OmoTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get omotoggle2() {
    		throw new Error("<OmoTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set omotoggle2(value) {
    		throw new Error("<OmoTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoAccordion.svelte generated by Svelte v3.20.1 */

    const file$d = "src/quanta/1-views/2-molecules/OmoAccordion.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(path0, file$d, 11, 10, 482);
    			attr_dev(svg0, "class", "w-3 h-3 fill-current");
    			attr_dev(svg0, "viewBox", "0 -192 469.33333 469");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$d, 7, 8, 341);
    			attr_dev(span0, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span0, file$d, 6, 6, 262);
    			attr_dev(div0, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div0, file$d, 2, 4, 63);
    			attr_dev(p0, "class", "text-gray-600 mb-3");
    			add_location(p0, file$d, 19, 6, 792);
    			attr_dev(p1, "class", "text-gray-600");
    			add_location(p1, file$d, 26, 6, 1201);
    			attr_dev(div1, "class", "p-3");
    			add_location(div1, file$d, 18, 4, 768);
    			attr_dev(div2, "class", "mb-4");
    			add_location(div2, file$d, 1, 2, 40);
    			attr_dev(path1, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path1, file$d, 44, 10, 2006);
    			attr_dev(svg1, "class", "w-3 h-3 fill-current");
    			attr_dev(svg1, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$d, 40, 8, 1862);
    			attr_dev(span1, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span1, file$d, 39, 6, 1783);
    			attr_dev(div3, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div3, file$d, 35, 4, 1584);
    			attr_dev(div4, "class", "mb-4");
    			add_location(div4, file$d, 34, 2, 1561);
    			attr_dev(path2, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path2, file$d, 66, 10, 2948);
    			attr_dev(svg2, "class", "w-3 h-3 fill-current");
    			attr_dev(svg2, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$d, 62, 8, 2804);
    			attr_dev(span2, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span2, file$d, 61, 6, 2725);
    			attr_dev(div5, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div5, file$d, 57, 4, 2526);
    			attr_dev(div6, "class", "mb-4");
    			add_location(div6, file$d, 56, 2, 2503);
    			attr_dev(div7, "class", "bg-white mx-auto w-full");
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoAccordion> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoAccordion", $$slots, []);
    	return [];
    }

    class OmoAccordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoAccordion",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoIconsFA.svelte generated by Svelte v3.20.1 */

    const file$e = "src/quanta/1-views/1-atoms/OmoIconsFA.svelte";

    function create_fragment$e(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
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

    function instance$e($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoIconsFA> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoIconsFA", $$slots, []);
    	return [];
    }

    class OmoIconsFA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoIconsFA",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoMenuVertical.svelte generated by Svelte v3.20.1 */
    const file$f = "src/quanta/1-views/2-molecules/OmoMenuVertical.svelte";

    function create_fragment$f(ctx) {
    	let t0;
    	let div;
    	let span0;
    	let i0;
    	let t1;
    	let span1;
    	let i1;
    	let current;
    	const omoiconsfa = new OmoIconsFA({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omoiconsfa.$$.fragment);
    			t0 = space();
    			div = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t1 = space();
    			span1 = element("span");
    			i1 = element("i");
    			attr_dev(i0, "class", "fas fa-dna p-2 bg-gray-300 rounded");
    			add_location(i0, file$f, 23, 4, 522);
    			attr_dev(span0, "class", "cursor-pointer hover:text-gray-500 px-1 block mb-2");
    			add_location(span0, file$f, 22, 2, 452);
    			attr_dev(i1, "class", "fas fa-search p-2 bg-gray-300 rounded");
    			add_location(i1, file$f, 26, 4, 648);
    			attr_dev(span1, "class", "cursor-pointer hover:text-gray-500 px-1 block");
    			add_location(span1, file$f, 25, 2, 583);
    			attr_dev(div, "class", "w-16 h-full pt-4 pb-4 bg-gray-200 text-blue-900 text-center shadow-lg");
    			add_location(div, file$f, 20, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoiconsfa, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, i0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, i1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoiconsfa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoiconsfa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoiconsfa, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
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
    	let { quant = {
    		id: "q6",
    		model: {
    			id: "m6",
    			name: "Omo Menu Vertical",
    			image: "/images/samuel.jpg",
    			author: "Samuel Andert",
    			type: "view",
    			group: "omo",
    			tags: "molecule"
    		},
    		design: {},
    		data: []
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoMenuVertical> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoMenuVertical", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ OmoIconsFA, quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoMenuVertical extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoMenuVertical",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoMenuVertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoMenuVertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoMenuHorizontal.svelte generated by Svelte v3.20.1 */
    const file$g = "src/quanta/1-views/2-molecules/OmoMenuHorizontal.svelte";

    function create_fragment$g(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let a0;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let a1;
    	let span2;
    	let i;
    	let t2;
    	let span1;
    	let t4;
    	let span3;
    	let img1;
    	let img1_src_value;
    	let current;
    	const omoiconsfa = new OmoIconsFA({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omoiconsfa.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			img0 = element("img");
    			t1 = space();
    			a1 = element("a");
    			span2 = element("span");
    			i = element("i");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Quanta";
    			t4 = space();
    			span3 = element("span");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "/images/logo_single.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "alt placeholder");
    			attr_dev(img0, "class", "h-8 -my-1 inline mx-auto");
    			add_location(img0, file$g, 10, 8, 290);
    			attr_dev(span0, "class", "pl-1 pr-3 mr-2 border-r border-gray-800");
    			add_location(span0, file$g, 9, 6, 227);
    			attr_dev(a0, "href", "/home");
    			add_location(a0, file$g, 8, 4, 204);
    			attr_dev(i, "class", "fas fa-th p-2 bg-gray-800 rounded");
    			add_location(i, file$g, 27, 8, 819);
    			attr_dev(span1, "class", "mx-1");
    			add_location(span1, file$g, 28, 8, 875);
    			attr_dev(span2, "class", "px-1 hover:text-white cursor-pointer");
    			add_location(span2, file$g, 26, 6, 759);
    			attr_dev(a1, "href", "/quanta");
    			add_location(a1, file$g, 25, 4, 734);
    			if (img1.src !== (img1_src_value = "/images/samuel.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "alt placeholder");
    			attr_dev(img1, "class", "h-8 inline mx-auto rounded border border-gray-600");
    			add_location(img1, file$g, 47, 6, 1565);
    			attr_dev(span3, "class", "cursor-pointer relative float-right");
    			add_location(span3, file$g, 46, 4, 1508);
    			attr_dev(div0, "class", "p-2 w-full text-gray-600 bg-gray-900 shadow-lg ");
    			add_location(div0, file$g, 7, 2, 138);
    			attr_dev(div1, "class", "pb-0 w-full flex flex-wrap");
    			add_location(div1, file$g, 6, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoiconsfa, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, span0);
    			append_dev(span0, img0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(a1, span2);
    			append_dev(span2, i);
    			append_dev(span2, t2);
    			append_dev(span2, span1);
    			append_dev(div0, t4);
    			append_dev(div0, span3);
    			append_dev(span3, img1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoiconsfa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoiconsfa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoiconsfa, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoMenuHorizontal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoMenuHorizontal", $$slots, []);
    	$$self.$capture_state = () => ({ OmoIconsFA });
    	return [];
    }

    class OmoMenuHorizontal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoMenuHorizontal",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCardGroup.svelte generated by Svelte v3.20.1 */

    const file$h = "src/quanta/1-views/2-molecules/OmoCardGroup.svelte";

    function create_fragment$h(ctx) {
    	let div7;
    	let div6;
    	let a;
    	let div5;
    	let div0;
    	let t0_value = /*quant*/ ctx[0].data.follower + "";
    	let t0;
    	let t1;
    	let t2;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let div4;
    	let div2;
    	let t5_value = /*quant*/ ctx[0].data.name + "";
    	let t5;
    	let t6;
    	let div3;
    	let t7_value = /*quant*/ ctx[0].data.description + "";
    	let t7;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			a = element("a");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(" members");
    			t2 = space();
    			img0 = element("img");
    			t3 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t4 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			t7 = text(t7_value);
    			attr_dev(div0, "class", "right-0 mt-4 rounded-l-full absolute text-center font-bold\n          text-xs text-white px-2 py-1 bg-orange-500");
    			add_location(div0, file$h, 28, 8, 626);
    			if (img0.src !== (img0_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "h-40 rounded-lg w-full object-cover object-center");
    			add_location(img0, file$h, 33, 8, 825);
    			if (img1.src !== (img1_src_value = /*quant*/ ctx[0].data.user)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "rounded-full -mt-16 border-8 object-center object-cover\n            border-white mr-2 h-32 w-32");
    			add_location(img1, file$h, 37, 10, 986);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$h, 36, 8, 942);
    			attr_dev(div2, "class", "font-bold font-title text-xl text-center");
    			add_location(div2, file$h, 43, 10, 1201);
    			attr_dev(div3, "class", "text-sm font-light text-center my-2");
    			add_location(div3, file$h, 46, 10, 1313);
    			attr_dev(div4, "class", "py-2 px-2");
    			add_location(div4, file$h, 42, 8, 1167);
    			attr_dev(div5, "class", "bg-white relative shadow p-2 rounded-lg text-gray-800\n        hover:shadow-lg");
    			add_location(div5, file$h, 25, 6, 518);
    			attr_dev(a, "href", "/");
    			add_location(a, file$h, 24, 4, 499);
    			attr_dev(div6, "class", "w-full m-auto md:w-1/2 lg:w-1/2");
    			add_location(div6, file$h, 23, 2, 449);
    			attr_dev(div7, "class", "flex flex-wrap ");
    			add_location(div7, file$h, 22, 0, 417);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, a);
    			append_dev(a, div5);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div5, t2);
    			append_dev(div5, img0);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			append_dev(div1, img1);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, t7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.follower + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*quant*/ 1 && img0.src !== (img0_src_value = /*quant*/ ctx[0].data.image)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*quant*/ 1 && img1.src !== (img1_src_value = /*quant*/ ctx[0].data.user)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*quant*/ 1 && t5_value !== (t5_value = /*quant*/ ctx[0].data.name + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*quant*/ 1 && t7_value !== (t7_value = /*quant*/ ctx[0].data.description + "")) set_data_dev(t7, t7_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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
    	let { quant = {
    		model: {
    			name: "",
    			image: "",
    			author: "",
    			type: "",
    			group: "",
    			tags: ""
    		},
    		design: {},
    		data: {
    			id: "",
    			follower: "10",
    			name: "Group Name",
    			description: "group description",
    			image: "https://source.unsplash.com/random",
    			user: "https://randomuser.me/api/portraits/women/21.jpg"
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCardGroup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCardGroup", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoCardGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardGroup",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoCardGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoCardGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCardProduct.svelte generated by Svelte v3.20.1 */

    const file$i = "src/quanta/1-views/2-molecules/OmoCardProduct.svelte";

    function create_fragment$i(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let h10;
    	let t0_value = /*quant*/ ctx[0].data.name + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*quant*/ ctx[0].data.description + "";
    	let t2;
    	let t3;
    	let div0;
    	let t5;
    	let img;
    	let img_src_value;
    	let t6;
    	let div2;
    	let h11;
    	let t7_value = /*quant*/ ctx[0].data.price + "";
    	let t7;
    	let t8;
    	let button;
    	let t9_value = /*quant*/ ctx[0].data.button + "";
    	let t9;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			div0.textContent = "more";
    			t5 = space();
    			img = element("img");
    			t6 = space();
    			div2 = element("div");
    			h11 = element("h1");
    			t7 = text(t7_value);
    			t8 = space();
    			button = element("button");
    			t9 = text(t9_value);
    			attr_dev(h10, "class", "text-blue-900 font-title font-bold text-2xl uppercase");
    			add_location(h10, file$i, 26, 6, 639);
    			attr_dev(p, "class", "text-gray-600 text-sm mt-1");
    			add_location(p, file$i, 29, 6, 750);
    			attr_dev(div0, "class", "text-xs text-blue-600 font-bold ");
    			add_location(div0, file$i, 30, 6, 823);
    			attr_dev(div1, "class", "px-4 py-2");
    			add_location(div1, file$i, 25, 4, 609);
    			attr_dev(img, "class", "h-56 w-full object-cover mt-2");
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "NIKE AIR");
    			add_location(img, file$i, 32, 4, 895);
    			attr_dev(h11, "class", "text-gray-200 font-bold text-xl");
    			add_location(h11, file$i, 38, 6, 1093);
    			attr_dev(button, "class", "px-3 py-1 bg-green-400 text-sm text-white hover:bg-blue-800\n        font-semibold rounded");
    			add_location(button, file$i, 39, 6, 1167);
    			attr_dev(div2, "class", "flex items-center justify-between px-4 py-2 bg-gray-900 rounded-b");
    			add_location(div2, file$i, 36, 4, 1001);
    			attr_dev(div3, "class", "bg-white shadow-lg rounded");
    			add_location(div3, file$i, 24, 2, 564);
    			attr_dev(div4, "class", "flex flex-col bg-white max-w-sm mx-auto rounded shadow-lg");
    			add_location(div4, file$i, 23, 0, 490);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h10);
    			append_dev(h10, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div3, t5);
    			append_dev(div3, img);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, h11);
    			append_dev(h11, t7);
    			append_dev(div2, t8);
    			append_dev(div2, button);
    			append_dev(button, t9);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[0].data.name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*quant*/ 1 && t2_value !== (t2_value = /*quant*/ ctx[0].data.description + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*quant*/ 1 && img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quant*/ 1 && t7_value !== (t7_value = /*quant*/ ctx[0].data.price + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*quant*/ 1 && t9_value !== (t9_value = /*quant*/ ctx[0].data.button + "")) set_data_dev(t9, t9_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
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

    function instance$i($$self, $$props, $$invalidate) {
    	let { quant = {
    		model: {
    			name: "",
    			image: "",
    			author: "",
    			type: "",
    			group: "",
    			tags: ""
    		},
    		design: {},
    		data: {
    			id: "",
    			name: "PRODUCT NAME",
    			description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
    			image: "https://source.unsplash.com/random",
    			price: "129€",
    			button: "Add to Card"
    		}
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCardProduct> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCardProduct", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoCardProduct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardProduct",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoCardProduct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoCardProduct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCardUser.svelte generated by Svelte v3.20.1 */

    const file$j = "src/quanta/1-views/2-molecules/OmoCardUser.svelte";

    function create_fragment$j(ctx) {
    	let div5;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let svg0;
    	let path0;
    	let t1;
    	let h10;
    	let t3;
    	let div4;
    	let h11;
    	let t5;
    	let p;
    	let t7;
    	let div1;
    	let svg1;
    	let path1;
    	let g;
    	let path2;
    	let t8;
    	let h12;
    	let t10;
    	let div2;
    	let svg2;
    	let path3;
    	let t11;
    	let h13;
    	let t13;
    	let div3;
    	let svg3;
    	let path4;
    	let t14;
    	let h14;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			h10 = element("h1");
    			h10.textContent = "Focusing";
    			t3 = space();
    			div4 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Laura Johnson";
    			t5 = space();
    			p = element("p");
    			p.textContent = "Full Stack Maker & UI / UX Designer, love hip hop music and Author of\n      Building UI.";
    			t7 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			g = svg_element("g");
    			path2 = svg_element("path");
    			t8 = space();
    			h12 = element("h1");
    			h12.textContent = "MerakiTeam";
    			t10 = space();
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path3 = svg_element("path");
    			t11 = space();
    			h13 = element("h1");
    			h13.textContent = "California";
    			t13 = space();
    			div3 = element("div");
    			svg3 = svg_element("svg");
    			path4 = svg_element("path");
    			t14 = space();
    			h14 = element("h1");
    			h14.textContent = "patterson@example.com";
    			attr_dev(img, "class", "rounded-t w-full h-56 object-cover object-center");
    			if (img.src !== (img_src_value = "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$j, 18, 2, 276);
    			attr_dev(path0, "d", "M256 48C150 48 64 136.2 64 245.1v153.3c0 36.3 28.6 65.7 64\n        65.7h64V288h-85.3v-42.9c0-84.7 66.8-153.3 149.3-153.3s149.3 68.5 149.3\n        153.3V288H320v176h64c35.4 0 64-29.3 64-65.7V245.1C448 136.2 362 48 256\n        48z");
    			add_location(path0, file$j, 24, 6, 640);
    			attr_dev(svg0, "class", "h-6 w-6 text-white fill-current");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			add_location(svg0, file$j, 23, 4, 566);
    			attr_dev(h10, "class", "mx-3 text-white font-semibold text-lg");
    			add_location(h10, file$j, 30, 4, 905);
    			attr_dev(div0, "class", "flex items-center px-6 py-3 bg-gray-900");
    			add_location(div0, file$j, 22, 2, 508);
    			attr_dev(h11, "class", "text-xl font-title uppercase text-blue-900 font-bold");
    			add_location(h11, file$j, 33, 4, 1008);
    			attr_dev(p, "class", "py-2 text-md text-gray-700");
    			add_location(p, file$j, 36, 4, 1108);
    			attr_dev(path1, "d", "M239.208 343.937c-17.78 10.103-38.342 15.876-60.255 15.876-21.909\n          0-42.467-5.771-60.246-15.87C71.544 358.331 42.643 406 32\n          448h293.912c-10.639-42-39.537-89.683-86.704-104.063zM178.953\n          120.035c-58.479 0-105.886 47.394-105.886 105.858 0 58.464 47.407\n          105.857 105.886 105.857s105.886-47.394\n          105.886-105.857c0-58.464-47.408-105.858-105.886-105.858zm0\n          186.488c-33.671 0-62.445-22.513-73.997-50.523H252.95c-11.554\n          28.011-40.326 50.523-73.997 50.523z");
    			add_location(path1, file$j, 42, 8, 1377);
    			attr_dev(path2, "d", "M322.602 384H480c-10.638-42-39.537-81.691-86.703-96.072-17.781\n            10.104-38.343 15.873-60.256 15.873-14.823\n            0-29.024-2.654-42.168-7.49-7.445 12.47-16.927 25.592-27.974\n            34.906C289.245 341.354 309.146 364 322.602 384zM306.545\n            200h100.493c-11.554 28-40.327 50.293-73.997 50.293-8.875\n            0-17.404-1.692-25.375-4.51a128.411 128.411 0 0 1-6.52 25.118c10.066\n            3.174 20.779 4.862 31.895 4.862 58.479 0 105.886-47.41\n            105.886-105.872 0-58.465-47.407-105.866-105.886-105.866-37.49\n            0-70.427 19.703-89.243 49.09C275.607 131.383 298.961 163 306.545\n            200z");
    			add_location(path2, file$j, 52, 10, 1936);
    			add_location(g, file$j, 51, 8, 1922);
    			attr_dev(svg1, "class", "h-6 w-6 fill-current");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			add_location(svg1, file$j, 41, 6, 1312);
    			attr_dev(h12, "class", "px-2 text-sm");
    			add_location(h12, file$j, 65, 6, 2634);
    			attr_dev(div1, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div1, file$j, 40, 4, 1255);
    			attr_dev(path3, "d", "M256 32c-88.004 0-160 70.557-160 156.801C96 306.4 256 480 256\n          480s160-173.6 160-291.199C416 102.557 344.004 32 256 32zm0\n          212.801c-31.996 0-57.144-24.645-57.144-56 0-31.357 25.147-56\n          57.144-56s57.144 24.643 57.144 56c0 31.355-25.148 56-57.144 56z");
    			add_location(path3, file$j, 69, 8, 2812);
    			attr_dev(svg2, "class", "h-6 w-6 fill-current");
    			attr_dev(svg2, "viewBox", "0 0 512 512");
    			add_location(svg2, file$j, 68, 6, 2747);
    			attr_dev(h13, "class", "px-2 text-sm");
    			add_location(h13, file$j, 75, 6, 3130);
    			attr_dev(div2, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div2, file$j, 67, 4, 2690);
    			attr_dev(path4, "d", "M437.332 80H74.668C51.199 80 32 99.198 32 122.667v266.666C32\n          412.802 51.199 432 74.668 432h362.664C460.801 432 480 412.802 480\n          389.333V122.667C480 99.198 460.801 80 437.332 80zM432 170.667L256 288\n          80 170.667V128l176 117.333L432 128v42.667z");
    			add_location(path4, file$j, 79, 8, 3308);
    			attr_dev(svg3, "class", "h-6 w-6 fill-current");
    			attr_dev(svg3, "viewBox", "0 0 512 512");
    			add_location(svg3, file$j, 78, 6, 3243);
    			attr_dev(h14, "class", "px-2 text-sm");
    			add_location(h14, file$j, 85, 6, 3620);
    			attr_dev(div3, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div3, file$j, 77, 4, 3186);
    			attr_dev(div4, "class", "py-4 px-6");
    			add_location(div4, file$j, 32, 2, 980);
    			attr_dev(div5, "class", "m-auto max-w-sm bg-white shadow-lg rounded-lg");
    			add_location(div5, file$j, 17, 0, 214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img);
    			append_dev(div5, t0);
    			append_dev(div5, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t1);
    			append_dev(div0, h10);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, h11);
    			append_dev(div4, t5);
    			append_dev(div4, p);
    			append_dev(div4, t7);
    			append_dev(div4, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(svg1, g);
    			append_dev(g, path2);
    			append_dev(div1, t8);
    			append_dev(div1, h12);
    			append_dev(div4, t10);
    			append_dev(div4, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path3);
    			append_dev(div2, t11);
    			append_dev(div2, h13);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			append_dev(div3, svg3);
    			append_dev(svg3, path4);
    			append_dev(div3, t14);
    			append_dev(div3, h14);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
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

    function instance$j($$self, $$props, $$invalidate) {
    	let { quant = {
    		model: {
    			name: "",
    			image: "",
    			author: "",
    			type: "",
    			group: "",
    			tags: ""
    		},
    		design: {},
    		data: { id: "" }
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCardUser> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCardUser", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoCardUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardUser",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoCardUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoCardUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoSteps.svelte generated by Svelte v3.20.1 */

    const file$k = "src/quanta/1-views/2-molecules/OmoSteps.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (23:4) {#each quant.data.steps as step, i}
    function create_each_block$1(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*step*/ ctx[1].title + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*step*/ ctx[1].description + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = /*step*/ ctx[1].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "object-center px-10");
    			set_style(img, "height", "20rem");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$k, 24, 8, 521);
    			attr_dev(div0, "class", "text-2xl text-center text-blue-800 mb-2 flex flex-wrap\n          justify-center content-center font-title uppercase font-bold");
    			add_location(div0, file$k, 29, 8, 656);
    			attr_dev(div1, "class", "text-gray-600");
    			add_location(div1, file$k, 34, 8, 852);
    			attr_dev(div2, "class", "w-1/3 px-6 content-center text-center");
    			add_location(div2, file$k, 23, 6, 461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quant*/ 1 && img.src !== (img_src_value = /*step*/ ctx[1].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quant*/ 1 && t1_value !== (t1_value = /*step*/ ctx[1].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*quant*/ 1 && t3_value !== (t3_value = /*step*/ ctx[1].description + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(23:4) {#each quant.data.steps as step, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*quant*/ ctx[0].data.steps;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$k, 21, 2, 372);
    			attr_dev(div1, "class", "bg-white flex justify-center0");
    			add_location(div1, file$k, 20, 0, 326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quant*/ 1) {
    				each_value = /*quant*/ ctx[0].data.steps;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
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
    	let { quant = {
    		id: "q3",
    		component: OmoSteps,
    		model: {
    			id: "m3",
    			name: "Omo Steps",
    			image: "/images/samuel.jpg",
    			author: "Samuel Andert",
    			type: "view",
    			group: "omo",
    			tags: "molecule"
    		},
    		design: {},
    		data: { id: "d3" }
    	} } = $$props;

    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoSteps> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoSteps", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoSteps_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSteps_1",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoSteps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoSteps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const quanta = writable(
        [{
                id: "q0",
                component: OmoNavbar,
                model: {
                    id: "m0",
                    name: "Omo Navbar",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {

                },
                data: {
                    id: "d0",
                }
            }, {
                id: "q1",
                component: OmoHeader,
                model: {
                    id: "m1",
                    name: "Omo Header",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {
                    layout: "py-20 bg-white",
                    title: "text-blue-900 font-bold font-title",
                    subline: "text-gray-500 italic font-light font-sans tracking-wide",
                    illustration: "w-1/2"
                },
                data: {
                    id: "d1",
                    title: "title from store",
                    subline: "subline from store",
                    illustration: "/images/through_the_park.svg",
                }
            }, {
                id: "q2",
                component: OmoVideo,
                model: {
                    id: "m2",
                    name: "Omo Video",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {
                    id: "d2",
                    title: "title set from store",
                    link: "https://player.vimeo.com/video/349650067"
                }
            }, {
                id: "q3",
                component: OmoHero,
                model: {
                    id: "m3",
                    name: "Omo Hero",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {
                    layout: "bg-white p-20"
                },
                data: {
                    id: "d3",
                    title: "hero set by store ",
                    subline: "hero subtitle message",
                    description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
                    illustration: "/images/progressive_app.svg",
                    button: "Call to Action"
                }
            }, {
                id: "q55",
                component: OmoSteps_1,
                model: {
                    id: "m55",
                    name: "Omo Steps",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {
                    id: "d3",
                    steps: [{
                            title: "Step 1",
                            description: "description 1",
                            image: "/images/progressive_app.svg"
                        },
                        {
                            title: "Step 2",
                            description: "description 2",
                            image: "/images/online_messaging.svg"
                        },
                        {
                            title: "Step 3",
                            description: "description 3",
                            image: "images/shopping_app.svg"
                        }
                    ]
                }
            }, {
                id: "q44",
                component: OmoBanner,
                model: {
                    id: "m44",
                    name: "Omo Banner",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {
                    uptitle: "Uptitle",
                    title: "Title",
                    subtitle: "subtitle",
                    image: "https://source.unsplash.com/random",
                    button: "call to action"
                }
            }, {
                id: "q5",
                component: OmoCities,
                model: {
                    id: "m5",
                    name: "Omo Cities",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "organism"
                },
                design: {
                    grid: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                },
                data: []
            }, {
                id: "q8",
                component: OmoPricing_1,
                model: {
                    id: "m8",
                    name: "Omo Pricing",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: []
            }, {
                id: "q10",
                component: OmoSubscribe,
                model: {
                    id: "m10",
                    name: "Omo Subscribe",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {
                    layout: ""
                },
                data: {
                    id: "d10",
                    title: "Get Our Updates",
                    subline: "Find out about events and other news",
                    email: "john@mail.com",
                    image: "https://source.unsplash.com/random",
                    button: "Subscribe"
                }
            }, {
                id: "q11",
                component: OmoTable,
                model: {
                    id: "m11",
                    name: "Omo Table",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: []
            }, {
                id: "q11",
                component: OmoAccordion,
                model: {
                    id: "m11",
                    name: "Omo Pricing",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: []
            }, {
                id: "q4",
                component: OmoCardArticle,
                model: {
                    id: "m4",
                    name: "Omo Card Article",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {
                    layout: "bg-gray-100 border border-gray-100 rounded-lg shadow-sm py-16"
                },
                data: {
                    id: "d4",
                    tag: "#tag",
                    excerpt: "Build Your New Idea with Laravel Framework.",
                    image: "https://randomuser.me/api/portraits/women/21.jpg",
                    author: "John Doe",
                    date: "Mar 10, 2018"
                }
            }, {
                id: "q6",
                component: OmoMenuVertical,
                model: {
                    id: "m6",
                    name: "Omo Menu Vertical",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: []
            }, {
                id: "q7",
                component: OmoMenuHorizontal,
                model: {
                    id: "m7",
                    name: "Omo Menu Horizontal",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: []
            }, {
                id: "q20",
                component: OmoCardGroup,
                model: {
                    name: "Omo Card Group",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {
                    id: "",
                    follower: "10",
                    name: "Group Name",
                    description: "group description",
                    image: "https://source.unsplash.com/random",
                    user: "https://randomuser.me/api/portraits/women/21.jpg"
                }
            },
            {
                id: "q33",
                component: OmoCardProduct,
                model: {
                    id: "m33",
                    name: "Omo Card Product",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {
                    id: "d33    ",
                    name: "PRODUCT NAME",
                    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
                    image: "https://source.unsplash.com/random",
                    price: "129€",
                    button: "Add to Card"
                }
            }, {
                id: "q88",
                component: OmoCardUser,
                model: {
                    id: "m88",
                    name: "Omo Card User",
                    image: "/images/samuel.jpg",
                    author: "Samuel Andert",
                    type: "view",
                    group: "omo",
                    tags: "molecule"
                },
                design: {},
                data: {}
            }
        ]);

    /* src/quanta/1-views/5-pages/Home.svelte generated by Svelte v3.20.1 */
    const file$l = "src/quanta/1-views/5-pages/Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (15:2) {#each $quanta as quant}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let current;
    	var switch_value = /*quant*/ ctx[2].component;

    	function switch_props(ctx) {
    		return {
    			props: { quant: /*quant*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "pb-10");
    			add_location(div, file$l, 15, 4, 774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*$quanta*/ 1) switch_instance_changes.quant = /*quant*/ ctx[2];

    			if (switch_value !== (switch_value = /*quant*/ ctx[2].component)) {
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
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:2) {#each $quanta as quant}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let current;
    	let each_value = /*$quanta*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "bg-image p-10 svelte-2nh93m");
    			add_location(div, file$l, 13, 0, 715);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$quanta*/ 1) {
    				each_value = /*$quanta*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
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

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	let $quanta;
    	validate_store(quanta, "quanta");
    	component_subscribe($$self, quanta, $$value => $$invalidate(0, $quanta = $$value));
    	let { currentId } = $$props;
    	const writable_props = ["currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ quanta, currentId, $quanta });

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$quanta, currentId];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentId*/ ctx[1] === undefined && !("currentId" in props)) {
    			console.warn("<Home> was created without expected prop 'currentId'");
    		}
    	}

    	get currentId() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/User.svelte generated by Svelte v3.20.1 */
    const file$m = "src/quanta/1-views/5-pages/User.svelte";

    function create_fragment$m(ctx) {
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
    			add_location(div0, file$m, 9, 0, 249);
    			set_style(p, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(p, file$m, 17, 2, 581);
    			attr_dev(div1, "class", "text-5xl text-center px-4 py-16 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$m, 14, 0, 458);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$m, 23, 4, 766);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$m, 22, 2, 733);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$m, 21, 0, 691);
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { db: 1, user: 0, currentId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$m.name
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
    const file$n = "src/quanta/1-views/5-pages/City.svelte";

    function create_fragment$n(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let p;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = `${/*city*/ ctx[0].name}`;
    			if (img.src !== (img_src_value = /*city*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*city*/ ctx[0].name);
    			attr_dev(img, "class", "w-full object-cover object-center");
    			set_style(img, "height", "30rem");
    			add_location(img, file$n, 9, 2, 225);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$n, 8, 0, 208);
    			attr_dev(p, "class", "font-title uppercase font-bold");
    			add_location(p, file$n, 19, 2, 477);
    			attr_dev(div1, "class", "text-4xl text-center px-4 py-12 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$n, 16, 0, 354);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
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

    function instance$n($$self, $$props, $$invalidate) {
    	let $cities;
    	validate_store(cities, "cities");
    	component_subscribe($$self, cities, $$value => $$invalidate(2, $cities = $$value));
    	let { currentId } = $$props;
    	let city = $cities.find(item => item.id == currentId);
    	const writable_props = ["currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoCard,
    		cities,
    		currentId,
    		city,
    		$cities
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [city, currentId];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentId*/ ctx[1] === undefined && !("currentId" in props)) {
    			console.warn("<City> was created without expected prop 'currentId'");
    		}
    	}

    	get currentId() {
    		throw new Error("<City>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<City>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoQuantPreview.svelte generated by Svelte v3.20.1 */

    const file$o = "src/quanta/1-views/2-molecules/OmoQuantPreview.svelte";

    function create_fragment$o(ctx) {
    	let div1;
    	let div0;
    	let current;
    	var switch_value = /*quant*/ ctx[0].component;

    	function switch_props(ctx) {
    		return {
    			props: { quant: /*quant*/ ctx[0] },
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "preview svelte-nu1sos");
    			add_location(div0, file$o, 26, 2, 1371);
    			attr_dev(div1, "class", "w-100 bg-green-200 overflow-hidden h-48 overflow-y-scroll object-center\n  object-cover border border-gray-300 bg-image svelte-nu1sos");
    			add_location(div1, file$o, 23, 0, 1234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*quant*/ 1) switch_instance_changes.quant = /*quant*/ ctx[0];

    			if (switch_value !== (switch_value = /*quant*/ ctx[0].component)) {
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
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { quant } = $$props;
    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoQuantPreview> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoQuantPreview", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoQuantPreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantPreview",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*quant*/ ctx[0] === undefined && !("quant" in props)) {
    			console.warn("<OmoQuantPreview> was created without expected prop 'quant'");
    		}
    	}

    	get quant() {
    		throw new Error("<OmoQuantPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoQuantPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoQuantaItem.svelte generated by Svelte v3.20.1 */
    const file$p = "src/quanta/1-views/2-molecules/OmoQuantaItem.svelte";

    function create_fragment$p(ctx) {
    	let div3;
    	let t0;
    	let div0;
    	let a0;
    	let t1_value = /*quant*/ ctx[0].model.name + "";
    	let t1;
    	let a0_href_value;
    	let t2;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t3;
    	let a1;
    	let t4_value = /*quant*/ ctx[0].model.author + "";
    	let t4;
    	let t5;
    	let br;
    	let t6;
    	let span;
    	let t7_value = /*quant*/ ctx[0].model.group + "";
    	let t7;
    	let t8;
    	let t9_value = /*quant*/ ctx[0].model.type + "";
    	let t9;
    	let t10;
    	let t11_value = /*quant*/ ctx[0].model.tags + "";
    	let t11;
    	let t12;
    	let a1_href_value;
    	let current;

    	const omoquantpreview = new OmoQuantPreview({
    			props: { quant: /*quant*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			create_component(omoquantpreview.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			a0 = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			a1 = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			span = element("span");
    			t7 = text(t7_value);
    			t8 = text("-");
    			t9 = text(t9_value);
    			t10 = text("s-");
    			t11 = text(t11_value);
    			t12 = text("s");
    			attr_dev(a0, "class", "text-md font-semibold text-gray-700 font-medium ");
    			attr_dev(a0, "href", a0_href_value = "/quant?id=" + /*quant*/ ctx[0].id);
    			add_location(a0, file$p, 8, 4, 227);
    			attr_dev(div0, "class", "py-2 px-3 bg-gray-100");
    			add_location(div0, file$p, 7, 2, 187);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].model.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "w-10 h-10 object-cover rounded");
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$p, 16, 6, 478);
    			add_location(br, file$p, 22, 8, 696);
    			attr_dev(span, "class", "font-light text-xs text-gray-500");
    			add_location(span, file$p, 23, 8, 711);
    			attr_dev(a1, "class", "text-gray-700 text-sm mx-3");
    			attr_dev(a1, "href", a1_href_value = "/quant?id=" + /*quant*/ ctx[0].id);
    			add_location(a1, file$p, 20, 6, 592);
    			attr_dev(div1, "class", "flex items-center");
    			add_location(div1, file$p, 15, 4, 440);
    			attr_dev(div2, "class", "pb-2 px-3 flex justify-between items-center mt-2");
    			add_location(div2, file$p, 14, 2, 373);
    			attr_dev(div3, "class", "bg-white max-w-sm rounded shadow-md border");
    			add_location(div3, file$p, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			mount_component(omoquantpreview, div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(a1, t4);
    			append_dev(a1, t5);
    			append_dev(a1, br);
    			append_dev(a1, t6);
    			append_dev(a1, span);
    			append_dev(span, t7);
    			append_dev(span, t8);
    			append_dev(span, t9);
    			append_dev(span, t10);
    			append_dev(span, t11);
    			append_dev(span, t12);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoquantpreview_changes = {};
    			if (dirty & /*quant*/ 1) omoquantpreview_changes.quant = /*quant*/ ctx[0];
    			omoquantpreview.$set(omoquantpreview_changes);
    			if ((!current || dirty & /*quant*/ 1) && t1_value !== (t1_value = /*quant*/ ctx[0].model.name + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*quant*/ 1 && a0_href_value !== (a0_href_value = "/quant?id=" + /*quant*/ ctx[0].id)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*quant*/ 1 && img.src !== (img_src_value = /*quant*/ ctx[0].model.image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*quant*/ 1) && t4_value !== (t4_value = /*quant*/ ctx[0].model.author + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*quant*/ 1) && t7_value !== (t7_value = /*quant*/ ctx[0].model.group + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*quant*/ 1) && t9_value !== (t9_value = /*quant*/ ctx[0].model.type + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*quant*/ 1) && t11_value !== (t11_value = /*quant*/ ctx[0].model.tags + "")) set_data_dev(t11, t11_value);

    			if (!current || dirty & /*quant*/ 1 && a1_href_value !== (a1_href_value = "/quant?id=" + /*quant*/ ctx[0].id)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoquantpreview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoquantpreview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(omoquantpreview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { quant } = $$props;
    	const writable_props = ["quant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoQuantaItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoQuantaItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({ OmoQuantPreview, quant });

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant];
    }

    class OmoQuantaItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantaItem",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*quant*/ ctx[0] === undefined && !("quant" in props)) {
    			console.warn("<OmoQuantaItem> was created without expected prop 'quant'");
    		}
    	}

    	get quant() {
    		throw new Error("<OmoQuantaItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoQuantaItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/5-pages/Quanta.svelte generated by Svelte v3.20.1 */
    const file$q = "src/quanta/1-views/5-pages/Quanta.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:2) {#each $quanta as item}
    function create_each_block$3(ctx) {
    	let current;

    	const omoquantaitem = new OmoQuantaItem({
    			props: { quant: /*item*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(omoquantaitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoquantaitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omoquantaitem_changes = {};
    			if (dirty & /*$quanta*/ 1) omoquantaitem_changes.quant = /*item*/ ctx[1];
    			omoquantaitem.$set(omoquantaitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoquantaitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoquantaitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoquantaitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(9:2) {#each $quanta as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div;
    	let current;
    	let each_value = /*$quanta*/ ctx[0];
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
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4\n  p-10");
    			add_location(div, file$q, 5, 0, 138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$quanta*/ 1) {
    				each_value = /*$quanta*/ ctx[0];
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
    						each_blocks[i].m(div, null);
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

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $quanta;
    	validate_store(quanta, "quanta");
    	component_subscribe($$self, quanta, $$value => $$invalidate(0, $quanta = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Quanta> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Quanta", $$slots, []);
    	$$self.$capture_state = () => ({ OmoQuantaItem, quanta, $quanta });
    	return [$quanta];
    }

    class Quanta extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quanta",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/quanta/1-views/5-pages/Quant.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$r = "src/quanta/1-views/5-pages/Quant.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (32:10) {#if key === 'image'}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*value*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "rounded mb-1 order-first");
    			add_location(img, file$r, 32, 12, 1486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(32:10) {#if key === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (35:10) {#if key != 'id' && key != 'image'}
    function create_if_block_2(ctx) {
    	let label;
    	let t0_value = /*key*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let input;
    	let input_value_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "class", "text-gray-500 text-xs");
    			add_location(label, file$r, 35, 12, 1613);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$r, 36, 12, 1676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(35:10) {#if key != 'id' && key != 'image'}",
    		ctx
    	});

    	return block;
    }

    // (31:8) {#each Object.entries(quant.model) as [key, value]}
    function create_each_block_2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*key*/ ctx[4] === "image" && create_if_block_3(ctx);
    	let if_block1 = /*key*/ ctx[4] != "id" && /*key*/ ctx[4] != "image" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[4] === "image") if_block0.p(ctx, dirty);
    			if (/*key*/ ctx[4] != "id" && /*key*/ ctx[4] != "image") if_block1.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(31:8) {#each Object.entries(quant.model) as [key, value]}",
    		ctx
    	});

    	return block;
    }

    // (51:8) {#if key != 'id'}
    function create_if_block_1$2(ctx) {
    	let div;
    	let label;
    	let t0_value = /*key*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let input;
    	let input_value_value;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			attr_dev(label, "class", "text-gray-500 text-xs");
    			add_location(label, file$r, 52, 12, 2135);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$r, 53, 12, 2198);
    			add_location(div, file$r, 51, 10, 2117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			append_dev(div, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(51:8) {#if key != 'id'}",
    		ctx
    	});

    	return block;
    }

    // (50:6) {#each Object.entries(quant.design) as [key, value]}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[4] != "id" && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[4] != "id") if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(50:6) {#each Object.entries(quant.design) as [key, value]}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if key != 'id'}
    function create_if_block$2(ctx) {
    	let div;
    	let label;
    	let t0_value = /*key*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let input;
    	let input_value_value;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			attr_dev(label, "class", "text-gray-500 text-xs");
    			add_location(label, file$r, 69, 12, 2653);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$r, 70, 12, 2716);
    			add_location(div, file$r, 68, 10, 2635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			append_dev(div, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(68:8) {#if key != 'id'}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#each Object.entries(quant.data) as [key, value]}
    function create_each_block$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[4] != "id" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[4] != "id") if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(67:6) {#each Object.entries(quant.data) as [key, value]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let div9;
    	let div0;
    	let t0;
    	let div8;
    	let div3;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div5;
    	let div4;
    	let t5;
    	let t6;
    	let div7;
    	let div6;
    	let t8;
    	let t9;
    	let current;
    	var switch_value = /*quant*/ ctx[0].component;

    	function switch_props(ctx) {
    		return {
    			props: { quant: /*quant*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	let each_value_2 = Object.entries(/*quant*/ ctx[0].model);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = Object.entries(/*quant*/ ctx[0].design);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Object.entries(/*quant*/ ctx[0].data);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const omomenuvertical = new OmoMenuVertical({ $$inline: true });

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t0 = space();
    			div8 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "Context Properties";
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Quant Design";
    			t5 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Quant Data";
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			create_component(omomenuvertical.$$.fragment);
    			attr_dev(div0, "class", "bg-image w-full p-10 overflow-hidden overflow-y-scroll svelte-es1rzs");
    			add_location(div0, file$r, 18, 2, 946);
    			attr_dev(div1, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div1, file$r, 26, 6, 1240);
    			attr_dev(div2, "class", "flex flex-wrap");
    			add_location(div2, file$r, 29, 6, 1353);
    			attr_dev(div3, "class", "mb-4");
    			add_location(div3, file$r, 25, 4, 1215);
    			attr_dev(div4, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div4, file$r, 46, 6, 1921);
    			attr_dev(div5, "class", "mb-4");
    			add_location(div5, file$r, 45, 4, 1896);
    			attr_dev(div6, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div6, file$r, 63, 6, 2443);
    			attr_dev(div7, "class", "mb-4");
    			add_location(div7, file$r, 62, 4, 2418);
    			attr_dev(div8, "class", "p-6 h-full overflow-hidden overflow-y-scroll bg-gray-100 border-l\n    border-gray-300");
    			set_style(div8, "width", "300px");
    			add_location(div8, file$r, 21, 2, 1082);
    			attr_dev(div9, "class", "h-full w-full flex");
    			add_location(div9, file$r, 17, 0, 911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			append_dev(div9, t0);
    			append_dev(div9, div8);
    			append_dev(div8, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div2, null);
    			}

    			append_dev(div8, t3);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div5, null);
    			}

    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			append_dev(div9, t9);
    			mount_component(omomenuvertical, div9, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*quant*/ ctx[0].component)) {
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
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (dirty & /*Object, quant*/ 1) {
    				each_value_2 = Object.entries(/*quant*/ ctx[0].model);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*Object, quant*/ 1) {
    				each_value_1 = Object.entries(/*quant*/ ctx[0].design);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*Object, quant*/ 1) {
    				each_value = Object.entries(/*quant*/ ctx[0].data);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, null);
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
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(omomenuvertical.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(omomenuvertical.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (switch_instance) destroy_component(switch_instance);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(omomenuvertical);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $quanta;
    	validate_store(quanta, "quanta");
    	component_subscribe($$self, quanta, $$value => $$invalidate(2, $quanta = $$value));
    	let { currentId } = $$props;
    	let quant = $quanta.find(item => item.id == currentId);
    	let thing = { name: "foo", type: "bar", test: "testme" };
    	const writable_props = ["currentId"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Quant> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Quant", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		quanta,
    		OmoMenuVertical,
    		currentId,
    		quant,
    		thing,
    		$quanta
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    		if ("quant" in $$props) $$invalidate(0, quant = $$props.quant);
    		if ("thing" in $$props) thing = $$props.thing;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quant, currentId];
    }

    class Quant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quant",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentId*/ ctx[1] === undefined && !("currentId" in props)) {
    			console.warn("<Quant> was created without expected prop 'currentId'");
    		}
    	}

    	get currentId() {
    		throw new Error("<Quant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Quant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const router = {
        '/': Home,
        '/home': Home,
        '/user': User,
        '/city': City,
        '/quant': Quant,
        '/quanta': Quanta,
    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quanta/1-views/0-themes/OmoDesignBase.svelte generated by Svelte v3.20.1 */

    function create_fragment$s(ctx) {
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props) {
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
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignBase",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoDesignUtilities.svelte generated by Svelte v3.20.1 */

    function create_fragment$t(ctx) {
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
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props) {
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
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignUtilities",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoThemeLight.svelte generated by Svelte v3.20.1 */

    function create_fragment$u(ctx) {
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
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoThemeLight",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoQuantaList.svelte generated by Svelte v3.20.1 */
    const file$s = "src/quanta/1-views/2-molecules/OmoQuantaList.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (10:2) {#each $quanta as quant}
    function create_each_block$5(ctx) {
    	let a;
    	let div;
    	let t0_value = /*quant*/ ctx[1].model.name + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let span;
    	let t3_value = /*quant*/ ctx[1].model.group + "";
    	let t3;
    	let t4;
    	let t5_value = /*quant*/ ctx[1].model.type + "";
    	let t5;
    	let t6;
    	let t7_value = /*quant*/ ctx[1].model.tags + "";
    	let t7;
    	let t8;
    	let t9;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = text("-");
    			t5 = text(t5_value);
    			t6 = text("s-");
    			t7 = text(t7_value);
    			t8 = text("s");
    			t9 = space();
    			add_location(br, file$s, 15, 8, 502);
    			attr_dev(span, "class", "text-gray-500 text-xs");
    			add_location(span, file$s, 16, 8, 517);
    			attr_dev(div, "class", "mb-2 text-sm text-blue-900 rounded border-gray-200 border\n        bg-white px-4 py-2");
    			add_location(div, file$s, 11, 6, 360);
    			attr_dev(a, "href", a_href_value = "quant?id=" + /*quant*/ ctx[1].id);
    			attr_dev(a, "class", "cursor-pointer");
    			add_location(a, file$s, 10, 4, 300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, br);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(span, t6);
    			append_dev(span, t7);
    			append_dev(span, t8);
    			append_dev(a, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$quanta*/ 1 && t0_value !== (t0_value = /*quant*/ ctx[1].model.name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$quanta*/ 1 && t3_value !== (t3_value = /*quant*/ ctx[1].model.group + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$quanta*/ 1 && t5_value !== (t5_value = /*quant*/ ctx[1].model.type + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$quanta*/ 1 && t7_value !== (t7_value = /*quant*/ ctx[1].model.tags + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*$quanta*/ 1 && a_href_value !== (a_href_value = "quant?id=" + /*quant*/ ctx[1].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(10:2) {#each $quanta as quant}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let each_value = /*$quanta*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Context Relations";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div0, file$s, 6, 2, 171);
    			attr_dev(div1, "class", "ml-4 grid grid-cols-1 mr-4 mt-4");
    			add_location(div1, file$s, 5, 0, 123);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$quanta*/ 1) {
    				each_value = /*$quanta*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let $quanta;
    	validate_store(quanta, "quanta");
    	component_subscribe($$self, quanta, $$value => $$invalidate(0, $quanta = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoQuantaList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoQuantaList", $$slots, []);
    	$$self.$capture_state = () => ({ OmoQuantaItem, quanta, $quanta });
    	return [$quanta];
    }

    class OmoQuantaList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantaList",
    			options,
    			id: create_fragment$v.name
    		});
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
         },
         {
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
       ]
     };

    /* src/quanta/1-views/4-layouts/OmoLayoutEditor.svelte generated by Svelte v3.20.1 */
    const file$t = "src/quanta/1-views/4-layouts/OmoLayoutEditor.svelte";

    function create_fragment$w(ctx) {
    	let div6;
    	let header;
    	let div0;
    	let t1;
    	let div5;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div4;
    	let div3;
    	let t4;
    	let footer;
    	let current;
    	const omomenuvertical = new OmoMenuVertical({ $$inline: true });
    	const omoquantalist = new OmoQuantaList({ $$inline: true });
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

    	const omomenuhorizontal = new OmoMenuHorizontal({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			header = element("header");
    			div0 = element("div");
    			div0.textContent = "context: (title of page, group, user, city, view, data or quant etc)";
    			t1 = space();
    			div5 = element("div");
    			div1 = element("div");
    			create_component(omomenuvertical.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(omoquantalist.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t4 = space();
    			footer = element("footer");
    			create_component(omomenuhorizontal.$$.fragment);
    			attr_dev(div0, "class", "bg-gray-200 text-sm font-semibold py-1 px-3 text-blue-900");
    			add_location(div0, file$t, 33, 4, 942);
    			add_location(header, file$t, 32, 2, 929);
    			attr_dev(div1, "class", "border-r border-gray-200");
    			add_location(div1, file$t, 38, 4, 1160);
    			attr_dev(div2, "class", "overflow-y-scroll bg-gray-100 border-t border-r border-gray-200");
    			set_style(div2, "width", "220px");
    			add_location(div2, file$t, 41, 4, 1240);
    			attr_dev(div3, "class", "h-full w-full");
    			add_location(div3, file$t, 47, 6, 1442);
    			attr_dev(div4, "class", "h-full flex-1 overflow-y-scroll");
    			add_location(div4, file$t, 46, 4, 1390);
    			attr_dev(div5, "class", "h-full flex overflow-hidden");
    			add_location(div5, file$t, 37, 2, 1114);
    			add_location(footer, file$t, 52, 2, 1576);
    			attr_dev(div6, "class", "h-full flex flex-col");
    			add_location(div6, file$t, 31, 0, 892);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, header);
    			append_dev(header, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			mount_component(omomenuvertical, div1, null);
    			append_dev(div5, t2);
    			append_dev(div5, div2);
    			mount_component(omoquantalist, div2, null);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			if (switch_instance) {
    				mount_component(switch_instance, div3, null);
    			}

    			append_dev(div6, t4);
    			append_dev(div6, footer);
    			mount_component(omomenuhorizontal, footer, null);
    			current = true;
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
    					mount_component(switch_instance, div3, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omomenuvertical.$$.fragment, local);
    			transition_in(omoquantalist.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(omomenuhorizontal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omomenuvertical.$$.fragment, local);
    			transition_out(omoquantalist.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(omomenuhorizontal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(omomenuvertical);
    			destroy_component(omoquantalist);
    			if (switch_instance) destroy_component(switch_instance);
    			destroy_component(omomenuhorizontal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$w($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoLayoutEditor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoLayoutEditor", $$slots, []);

    	$$self.$capture_state = () => ({
    		OmoMenuHorizontal,
    		OmoMenuVertical,
    		OmoQuantaList,
    		router,
    		curRoute,
    		curId,
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

    class OmoLayoutEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoLayoutEditor",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$u = "src/App.svelte";

    function create_fragment$x(ctx) {
    	let div;
    	let current;
    	let dispose;
    	const omolayouteditor = new OmoLayoutEditor({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(omolayouteditor.$$.fragment);
    			attr_dev(div, "class", "h-screen w-screen");
    			add_location(div, file$u, 31, 0, 839);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(omolayouteditor, div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window_1, "popstate", handlerBackNavigation$1, false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omolayouteditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omolayouteditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(omolayouteditor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation$1(event) {
    	curRoute.set(event.state.path);
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let currentId;

    	onMount(() => {
    		curRoute.set(window.location.pathname);
    		var urlParams = new URLSearchParams(window.location.search);

    		if (urlParams.has("id")) {
    			curId.set(urlParams.get("id"));
    			currentId = urlParams.get("id");
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
    		OmoLayoutEditor,
    		onMount,
    		currentId,
    		handlerBackNavigation: handlerBackNavigation$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentId" in $$props) currentId = $$props.currentId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
