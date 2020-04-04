
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
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

    /* src/design/Omo-Design-Base.svelte generated by Svelte v3.20.1 */

    function create_fragment(ctx) {
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Design_Base> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Design_Base", $$slots, []);
    	return [];
    }

    class Omo_Design_Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Design_Base",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/design/Omo-Design-Utilities.svelte generated by Svelte v3.20.1 */

    function create_fragment$1(ctx) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Design_Utilities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Design_Utilities", $$slots, []);
    	return [];
    }

    class Omo_Design_Utilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Design_Utilities",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/design/Omo-Theme-Light.svelte generated by Svelte v3.20.1 */

    function create_fragment$2(ctx) {
    	let t;
    	let current;
    	const omodesignbase = new Omo_Design_Base({ $$inline: true });
    	const omodesignutilities = new Omo_Design_Utilities({ $$inline: true });

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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Theme_Light> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Theme_Light", $$slots, []);
    	$$self.$capture_state = () => ({ OmoDesignBase: Omo_Design_Base, OmoDesignUtilities: Omo_Design_Utilities });
    	return [];
    }

    class Omo_Theme_Light extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Theme_Light",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/quants/Omo-Blog.svelte generated by Svelte v3.20.1 */

    const file = "src/quants/Omo-Blog.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (21:6) {#each blog as article, i (article.id)}
    function create_each_block(key_1, ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*article*/ ctx[2].title + "";
    	let t1;
    	let t2;
    	let span;
    	let t3_value = /*article*/ ctx[2].subtitle + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*article*/ ctx[2].excerpt + "";
    	let t5;
    	let t6;
    	let div0;
    	let a;
    	let t8;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Weiterlesen";
    			t8 = space();
    			if (img.src !== (img_src_value = /*article*/ ctx[2].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file, 23, 12, 787);
    			attr_dev(span, "class", "text-ci-2");
    			add_location(span, file, 32, 16, 1154);
    			attr_dev(h1, "class", "text-xl font-black leading-tight");
    			set_style(h1, "font-family", "'Indie Flower'", 1);
    			add_location(h1, file, 28, 14, 981);
    			attr_dev(p, "class", "mt-2 text-gray-600");
    			add_location(p, file, 34, 14, 1238);
    			attr_dev(a, "href", "#linktoblog");
    			attr_dev(a, "class", "inline-block hover:bg-orange-300 hover:text-gray-800\n                  bg-ci text-gray-100 rounded-full px-3 py-1 text-lg\n                  font-semibold mb-4");
    			set_style(a, "font-family", "'Indie Flower'", 1);
    			add_location(a, file, 36, 16, 1339);
    			attr_dev(div0, "class", "mt-4");
    			add_location(div0, file, 35, 14, 1304);
    			attr_dev(div1, "class", "p-8");
    			add_location(div1, file, 27, 12, 949);
    			attr_dev(div2, "class", "primary omo-shadow omo-border");
    			add_location(div2, file, 22, 10, 731);
    			attr_dev(div3, "class", "w-1/2 p-2");
    			add_location(div3, file, 21, 8, 697);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, span);
    			append_dev(span, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(div3, t8);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:6) {#each blog as article, i (article.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p;
    	let t4;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*blog*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*article*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Unser Blog";
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "\"Lass dich inspireren von offenen Begegnungen, ehrlichen Geschichten und\n        echten Freundschaften\"";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file, 7, 4, 134);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file, 8, 4, 207);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file, 14, 6, 411);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file, 13, 4, 350);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file, 19, 4, 600);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file, 6, 2, 101);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file, 5, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*blog*/ 1) {
    				const each_value = /*blog*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { db } = $$props;
    	let blog = db.blog;
    	const writable_props = ["db"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Blog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Blog", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    	};

    	$$self.$capture_state = () => ({ db, blog });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("blog" in $$props) $$invalidate(0, blog = $$props.blog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [blog, db];
    }

    class Omo_Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { db: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Blog",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Blog> was created without expected prop 'db'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Blog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Blog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-City.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/quants/Omo-City.svelte";

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
    			add_location(img, file$1, 7, 6, 164);
    			attr_dev(a0, "href", "#city");
    			attr_dev(a0, "class", "text-lg font-semibold");
    			set_style(a0, "font-family", "'Indie Flower'", 1);
    			add_location(a0, file$1, 14, 8, 431);
    			attr_dev(div0, "class", "w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300\n        hover:text-gray-800 bg-ci text-gray-100");
    			add_location(div0, file$1, 11, 6, 299);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$1, 6, 4, 98);
    			attr_dev(a1, "href", a1_href_value = "city?id=" + /*city*/ ctx[0].id);
    			add_location(a1, file$1, 5, 2, 65);
    			attr_dev(div2, "class", "w-1/4 p-2");
    			add_location(div2, file$1, 4, 0, 39);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_City", $$slots, []);

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

    class Omo_City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_City",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*city*/ ctx[0] === undefined && !("city" in props)) {
    			console.warn("<Omo_City> was created without expected prop 'city'");
    		}
    	}

    	get city() {
    		throw new Error("<Omo_City>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set city(value) {
    		throw new Error("<Omo_City>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Cities.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/quants/Omo-Cities.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (22:6) {#each cities as city, i (city.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let current;

    	const omocity = new Omo_City({
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
    		source: "(22:6) {#each cities as city, i (city.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p;
    	let t4;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*cities*/ ctx[0];
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
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Unsere Städte";
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "\"erforsche in jeder Stadt die Lebensträume in deiner direkten Umgebung\"";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$2, 9, 4, 205);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$2, 10, 4, 278);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$2, 16, 6, 485);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$2, 15, 4, 424);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$2, 20, 4, 642);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$2, 8, 2, 172);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file$2, 7, 0, 130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cities*/ 1) {
    				const each_value = /*cities*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
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
    			if (detaching) detach_dev(div3);

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
    	let { currentId } = $$props;
    	let cities = db.cities;
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Cities> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Cities", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ OmoCity: Omo_City, db, currentId, cities });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("cities" in $$props) $$invalidate(0, cities = $$props.cities);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cities, db, currentId];
    }

    class Omo_Cities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { db: 1, currentId: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Cities",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Cities> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<Omo_Cities> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Cities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Cities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Omo_Cities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Omo_Cities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-HowTo.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/quants/Omo-HowTo.svelte";

    function create_fragment$6(ctx) {
    	let div12;
    	let div11;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p0;
    	let t4;
    	let div10;
    	let div3;
    	let a0;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div1;
    	let p1;
    	let t7;
    	let div6;
    	let a1;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div4;
    	let p2;
    	let t10;
    	let div9;
    	let a2;
    	let div8;
    	let img3;
    	let img3_src_value;
    	let t11;
    	let div7;
    	let p3;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div11 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "#KEINSAMKEIT";
    			t2 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "\"In 3 Schritten zu mehr Zweisamkeit\"";
    			t4 = space();
    			div10 = element("div");
    			div3 = element("div");
    			a0 = element("a");
    			div2 = element("div");
    			img1 = element("img");
    			t5 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "1. Chatte mit unserem Verkuppler Robin";
    			t7 = space();
    			div6 = element("div");
    			a1 = element("a");
    			div5 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div4 = element("div");
    			p2 = element("p");
    			p2.textContent = "2. Robin hilft dir bei deinem Tandem Match";
    			t10 = space();
    			div9 = element("div");
    			a2 = element("a");
    			div8 = element("div");
    			img3 = element("img");
    			t11 = space();
    			div7 = element("div");
    			p3 = element("p");
    			p3.textContent = "3. Genießt die gemeinsame Zeit";
    			if (img0.src !== (img0_src_value = "/images/divider-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "divider");
    			attr_dev(img0, "class", "px-48 mt-8");
    			add_location(img0, file$3, 2, 4, 75);
    			attr_dev(h2, "class", "text-center text-6xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$3, 3, 4, 148);
    			add_location(p0, file$3, 11, 6, 413);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			set_style(div0, "font-family", "'Indie Flower'", 1);
    			add_location(div0, file$3, 8, 4, 293);
    			if (img1.src !== (img1_src_value = "https://images.unsplash.com/photo-1519337718347-749509f114a8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img1, "alt", "image");
    			add_location(img1, file$3, 18, 12, 652);
    			set_style(p1, "font-family", "'Indie Flower'", 1);
    			add_location(p1, file$3, 25, 14, 1081);
    			attr_dev(div1, "class", "text-2xl text-center p-6 text-ci-2 mb-2 flex flex-wrap\n              justify-center content-center h-48");
    			add_location(div1, file$3, 22, 12, 935);
    			attr_dev(div2, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div2, file$3, 17, 10, 580);
    			attr_dev(a0, "href", "chat");
    			add_location(a0, file$3, 16, 8, 554);
    			attr_dev(div3, "class", "w-1/3 p-2");
    			add_location(div3, file$3, 15, 6, 522);
    			if (img2.src !== (img2_src_value = "https://images.unsplash.com/photo-1582578598774-a377d4b32223?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img2, "alt", "image");
    			add_location(img2, file$3, 36, 12, 1405);
    			set_style(p2, "font-family", "'Indie Flower'", 1);
    			add_location(p2, file$3, 43, 14, 1834);
    			attr_dev(div4, "class", "text-2xl text-center p-6 text-ci-2 mb-2 flex flex-wrap\n              justify-center content-center h-48");
    			add_location(div4, file$3, 40, 12, 1688);
    			attr_dev(div5, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div5, file$3, 35, 10, 1333);
    			attr_dev(a1, "href", "chat");
    			add_location(a1, file$3, 34, 8, 1307);
    			attr_dev(div6, "class", "w-1/3 p-2");
    			add_location(div6, file$3, 33, 6, 1275);
    			if (img3.src !== (img3_src_value = "https://images.unsplash.com/photo-1489367874814-f5d040621dd8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1329&q=80")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img3, "alt", "image");
    			add_location(img3, file$3, 53, 12, 2161);
    			set_style(p3, "font-family", "'Indie Flower'", 1);
    			add_location(p3, file$3, 60, 14, 2590);
    			attr_dev(div7, "class", "text-2xl text-center p-6 text-ci-2 mb-2 flex flex-wrap\n              justify-center content-center h-48");
    			add_location(div7, file$3, 57, 12, 2444);
    			attr_dev(div8, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div8, file$3, 52, 10, 2089);
    			attr_dev(a2, "href", "chat");
    			add_location(a2, file$3, 51, 8, 2063);
    			attr_dev(div9, "class", "w-1/3 p-2");
    			add_location(div9, file$3, 50, 6, 2031);
    			attr_dev(div10, "class", "flex content-start flex-wrap");
    			add_location(div10, file$3, 14, 4, 473);
    			attr_dev(div11, "class", "w-5/6 xl:w-4/6");
    			add_location(div11, file$3, 1, 2, 42);
    			attr_dev(div12, "class", "flex justify-center my-12");
    			add_location(div12, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, img0);
    			append_dev(div11, t0);
    			append_dev(div11, h2);
    			append_dev(div11, t2);
    			append_dev(div11, div0);
    			append_dev(div0, p0);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div3);
    			append_dev(div3, a0);
    			append_dev(a0, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div10, t7);
    			append_dev(div10, div6);
    			append_dev(div6, a1);
    			append_dev(a1, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, p2);
    			append_dev(div10, t10);
    			append_dev(div10, div9);
    			append_dev(div9, a2);
    			append_dev(a2, div8);
    			append_dev(div8, img3);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
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

    function instance$6($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_HowTo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_HowTo", $$slots, []);
    	return [];
    }

    class Omo_HowTo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_HowTo",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/quants/Omo-Header.svelte generated by Svelte v3.20.1 */

    const file$4 = "src/quants/Omo-Header.svelte";

    function create_fragment$7(ctx) {
    	let div4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let p;
    	let t2;
    	let div0;
    	let t3;
    	let div2;
    	let div1;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			p = element("p");
    			p.textContent = "weil Träume uns am Leben erhalten";
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			iframe = element("iframe");
    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$4, 6, 4, 106);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$4, 8, 6, 248);
    			attr_dev(h2, "class", "text-center text-4xl text-ci mt-10 mb-6 uppercase");
    			add_location(h2, file$4, 7, 4, 179);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$4, 12, 4, 366);
    			attr_dev(iframe, "class", "embed-responsive-item");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/HfzZQvoJATA")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "opa franz intro video");
    			add_location(iframe, file$4, 17, 8, 559);
    			attr_dev(div1, "class", "embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow\n        omo-border ");
    			add_location(div1, file$4, 14, 6, 452);
    			attr_dev(div2, "class", "m-12");
    			add_location(div2, file$4, 13, 4, 427);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$4, 5, 2, 73);
    			attr_dev(div4, "class", "flex justify-center");
    			add_location(div4, file$4, 4, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div3, t0);
    			append_dev(div3, h2);
    			append_dev(h2, p);
    			append_dev(div3, t2);
    			append_dev(div3, div0);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, iframe);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	const writable_props = ["db"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Header", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    	};

    	$$self.$capture_state = () => ({ db });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db];
    }

    class Omo_Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { db: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Header",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<Omo_Header> was created without expected prop 'db'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Dream.svelte generated by Svelte v3.20.1 */

    const file$5 = "src/quants/Omo-Dream.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (27:8) {#each leidenschaften as leidenschaft}
    function create_each_block$2(ctx) {
    	let a;
    	let t0;
    	let t1_value = /*leidenschaft*/ ctx[4].tag + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(a, "href", a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[4].id);
    			attr_dev(a, "class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm\n            font-semibold text-gray-700 mr-2 mb-2");
    			add_location(a, file$5, 27, 10, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(27:8) {#each leidenschaften as leidenschaft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let a1;
    	let div3;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p0;
    	let t1;
    	let t2_value = /*dream*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4_value = /*dream*/ ctx[0].dream + "";
    	let t4;
    	let t5;
    	let t6;
    	let div1;
    	let p1;
    	let t8;
    	let t9;
    	let div2;
    	let a0;
    	let t10;
    	let a0_href_value;
    	let a1_href_value;
    	let each_value = /*leidenschaften*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			a1 = element("a");
    			div3 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t1 = text("\"");
    			t2 = text(t2_value);
    			t3 = text("'s großer Lebenstraum ist ");
    			t4 = text(t4_value);
    			t5 = text("\"");
    			t6 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Meine Leidenschaften";
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			a0 = element("a");
    			t10 = text("näher kennenlernen");
    			if (img.src !== (img_src_value = /*dream*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$5, 13, 6, 377);
    			set_style(p0, "font-family", "'Indie Flower'", 1);
    			add_location(p0, file$5, 20, 8, 652);
    			attr_dev(div0, "class", "text-xl text-center p-4 text-gray-200 mb-2 bg-ci-2 flex flex-wrap\n        justify-center content-center h-48");
    			add_location(div0, file$5, 17, 6, 513);
    			attr_dev(p1, "class", "text-xs text-gray-500 mb-1 uppercase");
    			add_location(p1, file$5, 25, 8, 831);
    			attr_dev(div1, "class", "px-6 pt-2");
    			add_location(div1, file$5, 24, 6, 799);
    			attr_dev(a0, "href", a0_href_value = "dream?id=" + /*dream*/ ctx[0].id);
    			attr_dev(a0, "class", "text-lg font-semibold");
    			set_style(a0, "font-family", "'Indie Flower'", 1);
    			add_location(a0, file$5, 38, 8, 1363);
    			attr_dev(div2, "class", "mt-4 w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300\n        hover:text-gray-800 bg-ci text-gray-100");
    			add_location(div2, file$5, 35, 6, 1226);
    			attr_dev(div3, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div3, file$5, 12, 4, 311);
    			attr_dev(a1, "href", a1_href_value = "dream?id=" + /*dream*/ ctx[0].id);
    			add_location(a1, file$5, 11, 2, 276);
    			attr_dev(div4, "class", "w-1/3 p-2");
    			add_location(div4, file$5, 10, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, a1);
    			append_dev(a1, div3);
    			append_dev(div3, img);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(a0, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dream*/ 1 && img.src !== (img_src_value = /*dream*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*dream*/ 1 && t2_value !== (t2_value = /*dream*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*dream*/ 1 && t4_value !== (t4_value = /*dream*/ ctx[0].dream + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*leidenschaften*/ 2) {
    				each_value = /*leidenschaften*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*dream*/ 1 && a0_href_value !== (a0_href_value = "dream?id=" + /*dream*/ ctx[0].id)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*dream*/ 1 && a1_href_value !== (a1_href_value = "dream?id=" + /*dream*/ ctx[0].id)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
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
    	let { currentId } = $$props;
    	let { dream } = $$props;
    	if (!dream) dreams = db.dreams.find(d => d.id == currentId);
    	let leidenschaften = db.leidenschaften.filter(ls => dream.leidenschaften.some(x => x == ls.id));
    	const writable_props = ["db", "currentId", "dream"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Dream> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Dream", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    		if ("dream" in $$props) $$invalidate(0, dream = $$props.dream);
    	};

    	$$self.$capture_state = () => ({ db, currentId, dream, leidenschaften });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(3, currentId = $$props.currentId);
    		if ("dream" in $$props) $$invalidate(0, dream = $$props.dream);
    		if ("leidenschaften" in $$props) $$invalidate(1, leidenschaften = $$props.leidenschaften);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dream, leidenschaften, db, currentId];
    }

    class Omo_Dream extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { db: 2, currentId: 3, dream: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Dream",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[2] === undefined && !("db" in props)) {
    			console.warn("<Omo_Dream> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[3] === undefined && !("currentId" in props)) {
    			console.warn("<Omo_Dream> was created without expected prop 'currentId'");
    		}

    		if (/*dream*/ ctx[0] === undefined && !("dream" in props)) {
    			console.warn("<Omo_Dream> was created without expected prop 'dream'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Omo_Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Omo_Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dream() {
    		throw new Error("<Omo_Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dream(value) {
    		throw new Error("<Omo_Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Dreams.svelte generated by Svelte v3.20.1 */
    const file$6 = "src/quants/Omo-Dreams.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (22:6) {#each dreams as dream, i (dream.id)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let current;

    	const omodream = new Omo_Dream({
    			props: {
    				dream: /*dream*/ ctx[2],
    				db: /*db*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omodream.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omodream, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omodream_changes = {};
    			if (dirty & /*dreams*/ 1) omodream_changes.dream = /*dream*/ ctx[2];
    			if (dirty & /*db*/ 2) omodream_changes.db = /*db*/ ctx[1];
    			omodream.$set(omodream_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omodream.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omodream.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omodream, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(22:6) {#each dreams as dream, i (dream.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p;
    	let t4;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*dreams*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dream*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Unsere Träume";
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "\"nur wenn wir große Träume haben können wir ein bisschen was erreichen\"";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$6, 9, 4, 213);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$6, 10, 4, 286);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$6, 16, 6, 493);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$6, 15, 4, 432);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$6, 20, 4, 650);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$6, 8, 2, 180);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file$6, 7, 0, 138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dreams, db*/ 3) {
    				const each_value = /*dreams*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
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
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { dreams } = $$props;
    	if (!dreams) dreams = db.dreams;
    	const writable_props = ["db", "dreams"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Dreams> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Dreams", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("dreams" in $$props) $$invalidate(0, dreams = $$props.dreams);
    	};

    	$$self.$capture_state = () => ({ OmoDream: Omo_Dream, db, dreams });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("dreams" in $$props) $$invalidate(0, dreams = $$props.dreams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dreams, db];
    }

    class Omo_Dreams extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { db: 1, dreams: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Dreams",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Dreams> was created without expected prop 'db'");
    		}

    		if (/*dreams*/ ctx[0] === undefined && !("dreams" in props)) {
    			console.warn("<Omo_Dreams> was created without expected prop 'dreams'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Dreams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Dreams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dreams() {
    		throw new Error("<Omo_Dreams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dreams(value) {
    		throw new Error("<Omo_Dreams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-CallToAction.svelte generated by Svelte v3.20.1 */

    const file$7 = "src/quants/Omo-CallToAction.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let a;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Jetzt Lebensträume erfüllen";
    			attr_dev(a, "href", "dreams");
    			attr_dev(a, "class", "hover:bg-orange-300 hover:text-gray-800 bg-ci text-gray-100\n        font-semibold rounded-full px-6 py-3 text-3xl");
    			set_style(a, "font-family", "'Indie Flower'", 1);
    			add_location(a, file$7, 3, 6, 106);
    			attr_dev(div0, "class", "flex justify-center");
    			add_location(div0, file$7, 2, 4, 66);
    			attr_dev(div1, "class", "w-5/6");
    			add_location(div1, file$7, 1, 2, 42);
    			attr_dev(div2, "class", "flex justify-center my-20");
    			add_location(div2, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_CallToAction> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_CallToAction", $$slots, []);
    	return [];
    }

    class Omo_CallToAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_CallToAction",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/quants/Omo-Chat.svelte generated by Svelte v3.20.1 */

    const file$8 = "src/quants/Omo-Chat.svelte";

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "w-5/6");
    			add_location(div0, file$8, 95, 2, 3106);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$8, 94, 0, 3070);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$b($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Chat> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Chat", $$slots, []);
    	return [];
    }

    class Omo_Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Chat",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/quants/Omo-Enkel.svelte generated by Svelte v3.20.1 */

    const file$9 = "src/quants/Omo-Enkel.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h3;
    	let p0;
    	let t1_value = /*enkel*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4_value = /*enkel*/ ctx[0].story + "";
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
    			h3 = element("h3");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("\"");
    			t4 = text(t4_value);
    			t5 = text("\"");
    			attr_dev(img, "class", "w-64 flex-shrink-0");
    			if (img.src !== (img_src_value = "" + (/*enkel*/ ctx[0].image + "/500x500"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "enkel image");
    			add_location(img, file$9, 8, 6, 191);
    			set_style(p0, "font-family", "'Indie Flower'", 1);
    			add_location(p0, file$9, 14, 10, 411);
    			attr_dev(h3, "class", "text-2xl text-center font-semibold text-gray-800 mb-2");
    			add_location(h3, file$9, 13, 8, 334);
    			attr_dev(p1, "class", "text-gray-600 text-center ");
    			add_location(p1, file$9, 16, 8, 500);
    			attr_dev(div0, "class", "px-6 py-4");
    			add_location(div0, file$9, 12, 6, 302);
    			attr_dev(div1, "class", "flex items-center rounded-lg bg-white shadow-lg overflow-hidden");
    			add_location(div1, file$9, 6, 4, 101);
    			attr_dev(a, "href", a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id);
    			add_location(a, file$9, 5, 2, 66);
    			attr_dev(div2, "class", "w-1/2 p-2");
    			add_location(div2, file$9, 4, 0, 40);
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
    			append_dev(div0, h3);
    			append_dev(h3, p0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enkel*/ 1 && img.src !== (img_src_value = "" + (/*enkel*/ ctx[0].image + "/500x500"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*enkel*/ 1 && t1_value !== (t1_value = /*enkel*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*enkel*/ 1 && t4_value !== (t4_value = /*enkel*/ ctx[0].story + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*enkel*/ 1 && a_href_value !== (a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id)) {
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { enkel } = $$props;
    	const writable_props = ["enkel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Enkel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Enkel", $$slots, []);

    	$$self.$set = $$props => {
    		if ("enkel" in $$props) $$invalidate(0, enkel = $$props.enkel);
    	};

    	$$self.$capture_state = () => ({ enkel });

    	$$self.$inject_state = $$props => {
    		if ("enkel" in $$props) $$invalidate(0, enkel = $$props.enkel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [enkel];
    }

    class Omo_Enkel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { enkel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkel",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*enkel*/ ctx[0] === undefined && !("enkel" in props)) {
    			console.warn("<Omo_Enkel> was created without expected prop 'enkel'");
    		}
    	}

    	get enkel() {
    		throw new Error("<Omo_Enkel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enkel(value) {
    		throw new Error("<Omo_Enkel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Enkels.svelte generated by Svelte v3.20.1 */
    const file$a = "src/quants/Omo-Enkels.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (22:6) {#each enkels as enkel, i (enkel.id)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let current;

    	const omoenkel = new Omo_Enkel({
    			props: { enkel: /*enkel*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omoenkel.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omoenkel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omoenkel_changes = {};
    			if (dirty & /*enkels*/ 1) omoenkel_changes.enkel = /*enkel*/ ctx[2];
    			omoenkel.$set(omoenkel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoenkel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoenkel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omoenkel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(22:6) {#each enkels as enkel, i (enkel.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p;
    	let t4;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*enkels*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*enkel*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Unsere Enkel";
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "\"und deren authentische Erfahrungen und Erlebnisse\"";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$a, 9, 4, 213);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$a, 10, 4, 286);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$a, 16, 6, 492);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$a, 15, 4, 431);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$a, 20, 4, 629);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$a, 8, 2, 180);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file$a, 7, 0, 138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enkels*/ 1) {
    				const each_value = /*enkels*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
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
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { db } = $$props;
    	let { enkels } = $$props;
    	if (!enkels) enkels = db.enkels;
    	const writable_props = ["db", "enkels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Enkels> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Enkels", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("enkels" in $$props) $$invalidate(0, enkels = $$props.enkels);
    	};

    	$$self.$capture_state = () => ({ OmoEnkel: Omo_Enkel, db, enkels });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("enkels" in $$props) $$invalidate(0, enkels = $$props.enkels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [enkels, db];
    }

    class Omo_Enkels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { db: 1, enkels: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkels",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Enkels> was created without expected prop 'db'");
    		}

    		if (/*enkels*/ ctx[0] === undefined && !("enkels" in props)) {
    			console.warn("<Omo_Enkels> was created without expected prop 'enkels'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Enkels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Enkels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enkels() {
    		throw new Error("<Omo_Enkels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enkels(value) {
    		throw new Error("<Omo_Enkels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.20.1 */

    function create_fragment$e(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const omoheader = new Omo_Header({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omohowto = new Omo_HowTo({ $$inline: true });

    	const omodreams = new Omo_Dreams({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omoenkels = new Omo_Enkels({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omocities = new Omo_Cities({
    			props: {
    				db: /*db*/ ctx[0],
    				currentId: /*currentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omoblog = new Omo_Blog({
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
    			create_component(omohowto.$$.fragment);
    			t1 = space();
    			create_component(omodreams.$$.fragment);
    			t2 = space();
    			create_component(omoenkels.$$.fragment);
    			t3 = space();
    			create_component(omocities.$$.fragment);
    			t4 = space();
    			create_component(omoblog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omoheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(omohowto, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(omodreams, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(omoenkels, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omocities, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(omoblog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omoheader_changes = {};
    			if (dirty & /*db*/ 1) omoheader_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omoheader_changes.currentId = /*currentId*/ ctx[1];
    			omoheader.$set(omoheader_changes);
    			const omodreams_changes = {};
    			if (dirty & /*db*/ 1) omodreams_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omodreams_changes.currentId = /*currentId*/ ctx[1];
    			omodreams.$set(omodreams_changes);
    			const omoenkels_changes = {};
    			if (dirty & /*db*/ 1) omoenkels_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omoenkels_changes.currentId = /*currentId*/ ctx[1];
    			omoenkels.$set(omoenkels_changes);
    			const omocities_changes = {};
    			if (dirty & /*db*/ 1) omocities_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omocities_changes.currentId = /*currentId*/ ctx[1];
    			omocities.$set(omocities_changes);
    			const omoblog_changes = {};
    			if (dirty & /*db*/ 1) omoblog_changes.db = /*db*/ ctx[0];
    			if (dirty & /*currentId*/ 2) omoblog_changes.currentId = /*currentId*/ ctx[1];
    			omoblog.$set(omoblog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader.$$.fragment, local);
    			transition_in(omohowto.$$.fragment, local);
    			transition_in(omodreams.$$.fragment, local);
    			transition_in(omoenkels.$$.fragment, local);
    			transition_in(omocities.$$.fragment, local);
    			transition_in(omoblog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader.$$.fragment, local);
    			transition_out(omohowto.$$.fragment, local);
    			transition_out(omodreams.$$.fragment, local);
    			transition_out(omoenkels.$$.fragment, local);
    			transition_out(omocities.$$.fragment, local);
    			transition_out(omoblog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omoheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(omohowto, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(omodreams, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omoenkels, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omocities, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(omoblog, detaching);
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
    	let { db } = $$props;
    	let { currentId } = $$props;
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		db,
    		currentId,
    		OmoThemeLight: Omo_Theme_Light,
    		OmoBlog: Omo_Blog,
    		OmoCities: Omo_Cities,
    		OmoHowTo: Omo_HowTo,
    		OmoHeader: Omo_Header,
    		OmoDreams: Omo_Dreams,
    		OmoCallToAction: Omo_CallToAction,
    		OmoChat: Omo_Chat,
    		OmoEnkels: Omo_Enkels
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(1, currentId = $$props.currentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, currentId];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { db: 0, currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$e.name
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
    }

    /* src/quants/Omo-Wish.svelte generated by Svelte v3.20.1 */

    const file$b = "src/quants/Omo-Wish.svelte";

    function create_fragment$f(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let a0;
    	let t0_value = /*wish*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let a1;
    	let t2_value = /*wish*/ ctx[0].content + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			t2 = text(t2_value);
    			attr_dev(a0, "class", "p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$b, 12, 6, 316);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$b, 11, 4, 263);
    			attr_dev(a1, "class", "text-lg text-gray-700 font-medium ");
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$b, 19, 6, 494);
    			attr_dev(div1, "class", "mt-4 text-center");
    			add_location(div1, file$b, 18, 4, 457);
    			attr_dev(div2, "class", "flex flex-col bg-white px-8 py-6 max-w-sm mx-auto rounded-lg\n    shadow-lg");
    			add_location(div2, file$b, 8, 2, 166);
    			attr_dev(div3, "class", "w-1/3 p-2");
    			add_location(div3, file$b, 7, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*wish*/ 1 && t0_value !== (t0_value = /*wish*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*wish*/ 1 && t2_value !== (t2_value = /*wish*/ ctx[0].content + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let { wish } = $$props;
    	if (!wish) wish = db.wishes.find(d => d.id == currentId);
    	const writable_props = ["db", "currentId", "wish"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Wish> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Wish", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("wish" in $$props) $$invalidate(0, wish = $$props.wish);
    	};

    	$$self.$capture_state = () => ({ db, currentId, wish });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("wish" in $$props) $$invalidate(0, wish = $$props.wish);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wish, db, currentId];
    }

    class Omo_Wish extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { db: 1, currentId: 2, wish: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Wish",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Wish> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<Omo_Wish> was created without expected prop 'currentId'");
    		}

    		if (/*wish*/ ctx[0] === undefined && !("wish" in props)) {
    			console.warn("<Omo_Wish> was created without expected prop 'wish'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Wish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Wish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Omo_Wish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Omo_Wish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wish() {
    		throw new Error("<Omo_Wish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wish(value) {
    		throw new Error("<Omo_Wish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Wishes.svelte generated by Svelte v3.20.1 */
    const file$c = "src/quants/Omo-Wishes.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (15:4) {#each wishes as wish, i (wishes.id)}
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let current;

    	const omowish = new Omo_Wish({
    			props: { wish: /*wish*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omowish.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omowish, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omowish_changes = {};
    			if (dirty & /*wishes*/ 1) omowish_changes.wish = /*wish*/ ctx[3];
    			omowish.$set(omowish_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omowish.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omowish.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omowish, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(15:4) {#each wishes as wish, i (wishes.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*wishes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*wishes*/ ctx[0].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Meine kleinen Freuden des Tages";
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$c, 9, 2, 168);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mt-6 mb-8");
    			add_location(div0, file$c, 10, 2, 239);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$c, 13, 2, 345);
    			add_location(div2, file$c, 8, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*wishes*/ 1) {
    				const each_value = /*wishes*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
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
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let { wishes } = $$props;
    	if (!wishes) wishes = db.wishes;
    	const writable_props = ["db", "currentId", "wishes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Wishes> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Wishes", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("wishes" in $$props) $$invalidate(0, wishes = $$props.wishes);
    	};

    	$$self.$capture_state = () => ({ OmoWish: Omo_Wish, db, currentId, wishes });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    		if ("wishes" in $$props) $$invalidate(0, wishes = $$props.wishes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wishes, db, currentId];
    }

    class Omo_Wishes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { db: 1, currentId: 2, wishes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Wishes",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Wishes> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<Omo_Wishes> was created without expected prop 'currentId'");
    		}

    		if (/*wishes*/ ctx[0] === undefined && !("wishes" in props)) {
    			console.warn("<Omo_Wishes> was created without expected prop 'wishes'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Wishes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Wishes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Omo_Wishes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Omo_Wishes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wishes() {
    		throw new Error("<Omo_Wishes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wishes(value) {
    		throw new Error("<Omo_Wishes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/OmoLeidenschaften.svelte generated by Svelte v3.20.1 */
    const file$d = "src/quants/OmoLeidenschaften.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (20:8) {#each leidenschaften as leidenschaft, i (leidenschaft.id)}
    function create_each_block$6(key_1, ctx) {
    	let a;
    	let t0;
    	let t1_value = /*leidenschaft*/ ctx[3].tag + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(a, "href", a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[3].id);
    			attr_dev(a, "class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm\n            font-semibold text-gray-700 mr-2 mb-2");
    			add_location(a, file$d, 20, 10, 651);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leidenschaften*/ 1 && t1_value !== (t1_value = /*leidenschaft*/ ctx[3].tag + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*leidenschaften*/ 1 && a_href_value !== (a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[3].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(20:8) {#each leidenschaften as leidenschaft, i (leidenschaft.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let a;
    	let t1;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*leidenschaften*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*leidenschaft*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Was mir Freude bereitet";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "class", "p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full");
    			attr_dev(a, "href", "#");
    			add_location(a, file$d, 11, 6, 355);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$d, 10, 4, 302);
    			attr_dev(div1, "class", "px-6 pt-2 pb-2");
    			add_location(div1, file$d, 18, 6, 544);
    			attr_dev(div2, "class", "mt-4 text-center");
    			add_location(div2, file$d, 17, 4, 507);
    			attr_dev(div3, "class", "flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg");
    			add_location(div3, file$d, 9, 2, 230);
    			attr_dev(div4, "class", "w-1/2 p-2");
    			add_location(div4, file$d, 8, 0, 204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*leidenschaften*/ 1) {
    				const each_value = /*leidenschaften*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block$6, null, get_each_context$6);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);

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
    	let { db } = $$props;
    	let { leidenschaften } = $$props;
    	let { currentId } = $$props;
    	if (!leidenschaften) leidenschaften = db.leidenschaften;
    	const writable_props = ["db", "leidenschaften", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoLeidenschaften> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoLeidenschaften", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("leidenschaften" in $$props) $$invalidate(0, leidenschaften = $$props.leidenschaften);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({ OmoWishes: Omo_Wishes, db, leidenschaften, currentId });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("leidenschaften" in $$props) $$invalidate(0, leidenschaften = $$props.leidenschaften);
    		if ("currentId" in $$props) $$invalidate(2, currentId = $$props.currentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leidenschaften, db, currentId];
    }

    class OmoLeidenschaften extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { db: 1, leidenschaften: 0, currentId: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoLeidenschaften",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<OmoLeidenschaften> was created without expected prop 'db'");
    		}

    		if (/*leidenschaften*/ ctx[0] === undefined && !("leidenschaften" in props)) {
    			console.warn("<OmoLeidenschaften> was created without expected prop 'leidenschaften'");
    		}

    		if (/*currentId*/ ctx[2] === undefined && !("currentId" in props)) {
    			console.warn("<OmoLeidenschaften> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<OmoLeidenschaften>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<OmoLeidenschaften>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get leidenschaften() {
    		throw new Error("<OmoLeidenschaften>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leidenschaften(value) {
    		throw new Error("<OmoLeidenschaften>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<OmoLeidenschaften>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<OmoLeidenschaften>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Dream.svelte generated by Svelte v3.20.1 */
    const file$e = "src/routes/Dream.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (61:14) {#each schwierigkeiten as schwierigkeit}
    function create_each_block$7(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*schwierigkeit*/ ctx[7].tag + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(span, "class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm\n                  font-semibold text-gray-700 mr-2 mb-2");
    			add_location(span, file$e, 61, 16, 2197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(61:14) {#each schwierigkeiten as schwierigkeit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let p;
    	let t1;
    	let t2_value = /*dream*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4_value = /*dream*/ ctx[0].dream + "";
    	let t4;
    	let t5;
    	let t6;
    	let div4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t7;
    	let h2;
    	let t9;
    	let div2;
    	let t10;
    	let div12;
    	let div11;
    	let t11;
    	let div10;
    	let t12;
    	let div9;
    	let div8;
    	let div5;
    	let a0;
    	let t14;
    	let div7;
    	let div6;
    	let t15;
    	let div15;
    	let div14;
    	let div13;
    	let a1;
    	let t16;
    	let t17_value = /*dream*/ ctx[0].name + "";
    	let t17;
    	let t18;
    	let current;

    	const omocity = new Omo_City({
    			props: { city: /*city*/ ctx[5], db: /*db*/ ctx[1] },
    			$$inline: true
    		});

    	const omowishes = new Omo_Wishes({
    			props: { wishes: /*wishes*/ ctx[2] },
    			$$inline: true
    		});

    	const omoleidenschaften = new OmoLeidenschaften({
    			props: {
    				leidenschaften: /*leidenschaften*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let each_value = /*schwierigkeiten*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text("\"");
    			t2 = text(t2_value);
    			t3 = text("'s großer Lebenstraum ist es ");
    			t4 = text(t4_value);
    			t5 = text("\"");
    			t6 = space();
    			div4 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t7 = space();
    			h2 = element("h2");
    			h2.textContent = "Meine schöne Heimatstadt";
    			t9 = space();
    			div2 = element("div");
    			create_component(omocity.$$.fragment);
    			t10 = space();
    			div12 = element("div");
    			div11 = element("div");
    			create_component(omowishes.$$.fragment);
    			t11 = space();
    			div10 = element("div");
    			create_component(omoleidenschaften.$$.fragment);
    			t12 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			a0 = element("a");
    			a0.textContent = "Womit ich mir schwer tue";
    			t14 = space();
    			div7 = element("div");
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			a1 = element("a");
    			t16 = text("Jetzt die Lebensträume von ");
    			t17 = text(t17_value);
    			t18 = text(" erfüllen");
    			attr_dev(div0, "class", "py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap\n  bg-cover bg-center justify-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*dream*/ ctx[0].image + "')");
    			attr_dev(div0, "title", "dream");
    			add_location(div0, file$e, 18, 0, 657);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$e, 26, 2, 977);
    			attr_dev(div1, "class", "text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap\n  justify-center content-center");
    			add_location(div1, file$e, 23, 0, 858);
    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$e, 32, 4, 1178);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$e, 33, 4, 1251);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$e, 38, 4, 1408);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$e, 31, 2, 1145);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$e, 30, 0, 1103);
    			attr_dev(a0, "class", "p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$e, 52, 12, 1865);
    			attr_dev(div5, "class", "flex justify-center items-center");
    			add_location(div5, file$e, 51, 10, 1806);
    			attr_dev(div6, "class", "px-6 pt-2 pb-2");
    			add_location(div6, file$e, 59, 12, 2097);
    			attr_dev(div7, "class", "mt-4 text-center");
    			add_location(div7, file$e, 58, 10, 2054);
    			attr_dev(div8, "class", "flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg");
    			add_location(div8, file$e, 50, 8, 1728);
    			attr_dev(div9, "class", "w-1/2 p-2");
    			add_location(div9, file$e, 49, 6, 1696);
    			attr_dev(div10, "class", "flex content-start flex-wrap");
    			add_location(div10, file$e, 47, 4, 1602);
    			attr_dev(div11, "class", "w-5/6 xl:w-4/6");
    			add_location(div11, file$e, 44, 2, 1541);
    			attr_dev(div12, "class", "flex justify-center my-10");
    			add_location(div12, file$e, 43, 0, 1499);
    			attr_dev(a1, "href", "chat");
    			attr_dev(a1, "class", "hover:bg-orange-300 hover:text-gray-800 bg-ci text-gray-100\n        font-semibold rounded-full px-6 py-3 text-3xl");
    			set_style(a1, "font-family", "'Indie Flower'", 1);
    			add_location(a1, file$e, 80, 6, 2627);
    			attr_dev(div13, "class", "flex justify-center");
    			add_location(div13, file$e, 79, 4, 2587);
    			attr_dev(div14, "class", "w-5/6");
    			add_location(div14, file$e, 78, 2, 2563);
    			attr_dev(div15, "class", "flex justify-center my-20");
    			add_location(div15, file$e, 77, 0, 2521);
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
    			append_dev(div3, img);
    			append_dev(div3, t7);
    			append_dev(div3, h2);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			mount_component(omocity, div2, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			mount_component(omowishes, div11, null);
    			append_dev(div11, t11);
    			append_dev(div11, div10);
    			mount_component(omoleidenschaften, div10, null);
    			append_dev(div10, t12);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, a0);
    			append_dev(div8, t14);
    			append_dev(div8, div7);
    			append_dev(div7, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			insert_dev(target, t15, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, a1);
    			append_dev(a1, t16);
    			append_dev(a1, t17);
    			append_dev(a1, t18);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*dream*/ 1) {
    				set_style(div0, "background-image", "url('" + /*dream*/ ctx[0].image + "')");
    			}

    			if ((!current || dirty & /*dream*/ 1) && t2_value !== (t2_value = /*dream*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*dream*/ 1) && t4_value !== (t4_value = /*dream*/ ctx[0].dream + "")) set_data_dev(t4, t4_value);
    			const omocity_changes = {};
    			if (dirty & /*db*/ 2) omocity_changes.db = /*db*/ ctx[1];
    			omocity.$set(omocity_changes);

    			if (dirty & /*schwierigkeiten*/ 16) {
    				each_value = /*schwierigkeiten*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*dream*/ 1) && t17_value !== (t17_value = /*dream*/ ctx[0].name + "")) set_data_dev(t17, t17_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocity.$$.fragment, local);
    			transition_in(omowishes.$$.fragment, local);
    			transition_in(omoleidenschaften.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocity.$$.fragment, local);
    			transition_out(omowishes.$$.fragment, local);
    			transition_out(omoleidenschaften.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			destroy_component(omocity);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div12);
    			destroy_component(omowishes);
    			destroy_component(omoleidenschaften);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div15);
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
    	let { db } = $$props;
    	let { dream } = $$props;
    	let { currentId } = $$props;
    	if (!dream) dream = db.dreams.find(x => x.id == currentId);
    	let wishes = db.wishes.filter(w => dream.wishes.some(dw => w.id));
    	let leidenschaften = db.leidenschaften.filter(ls => dream.leidenschaften.some(x => x == ls.id));
    	let schwierigkeiten = db.schwierigkeiten.filter(ls => dream.schwierigkeiten.some(x => x == ls.id));
    	let city = db.cities.find(x => x.id == dream.city);
    	const writable_props = ["db", "dream", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dream> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dream", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("dream" in $$props) $$invalidate(0, dream = $$props.dream);
    		if ("currentId" in $$props) $$invalidate(6, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoWishes: Omo_Wishes,
    		OmoCity: Omo_City,
    		OmoLeidenschaften,
    		db,
    		dream,
    		currentId,
    		wishes,
    		leidenschaften,
    		schwierigkeiten,
    		city
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("dream" in $$props) $$invalidate(0, dream = $$props.dream);
    		if ("currentId" in $$props) $$invalidate(6, currentId = $$props.currentId);
    		if ("wishes" in $$props) $$invalidate(2, wishes = $$props.wishes);
    		if ("leidenschaften" in $$props) $$invalidate(3, leidenschaften = $$props.leidenschaften);
    		if ("schwierigkeiten" in $$props) $$invalidate(4, schwierigkeiten = $$props.schwierigkeiten);
    		if ("city" in $$props) $$invalidate(5, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dream, db, wishes, leidenschaften, schwierigkeiten, city, currentId];
    }

    class Dream extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { db: 1, dream: 0, currentId: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dream",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Dream> was created without expected prop 'db'");
    		}

    		if (/*dream*/ ctx[0] === undefined && !("dream" in props)) {
    			console.warn("<Dream> was created without expected prop 'dream'");
    		}

    		if (/*currentId*/ ctx[6] === undefined && !("currentId" in props)) {
    			console.warn("<Dream> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dream() {
    		throw new Error("<Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dream(value) {
    		throw new Error("<Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Dream>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Dream>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/City.svelte generated by Svelte v3.20.1 */
    const file$f = "src/routes/City.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let t0_value = /*city*/ ctx[1].name + "";
    	let t0;
    	let div_title_value;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const omodreams = new Omo_Dreams({
    			props: {
    				dreams: /*dreams*/ ctx[3],
    				db: /*db*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const omoenkels = new Omo_Enkels({
    			props: {
    				enkels: /*enkels*/ ctx[2],
    				db: /*db*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const omoblog = new Omo_Blog({
    			props: { blog: /*blog*/ ctx[4], db: /*db*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(omodreams.$$.fragment);
    			t2 = space();
    			create_component(omoenkels.$$.fragment);
    			t3 = space();
    			create_component(omoblog.$$.fragment);
    			attr_dev(div, "class", "py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center\n  justify-center overflow-hidden uppercase font-bolt text-white");
    			set_style(div, "background-image", "url('" + /*city*/ ctx[1].image + "')");
    			attr_dev(div, "title", div_title_value = /*city*/ ctx[1].name);
    			add_location(div, file$f, 13, 0, 534);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(omodreams, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(omoenkels, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omoblog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omodreams_changes = {};
    			if (dirty & /*db*/ 1) omodreams_changes.db = /*db*/ ctx[0];
    			omodreams.$set(omodreams_changes);
    			const omoenkels_changes = {};
    			if (dirty & /*db*/ 1) omoenkels_changes.db = /*db*/ ctx[0];
    			omoenkels.$set(omoenkels_changes);
    			const omoblog_changes = {};
    			if (dirty & /*db*/ 1) omoblog_changes.db = /*db*/ ctx[0];
    			omoblog.$set(omoblog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omodreams.$$.fragment, local);
    			transition_in(omoenkels.$$.fragment, local);
    			transition_in(omoblog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omodreams.$$.fragment, local);
    			transition_out(omoenkels.$$.fragment, local);
    			transition_out(omoblog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(omodreams, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omoenkels, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omoblog, detaching);
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
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let city = db.cities.find(item => item.id == currentId);
    	let enkels = db.enkels.filter(item => item.city == city.id);
    	let dreams = db.dreams.filter(item => item.city == city.id);
    	let blog = db.blog.filter(item => item.cities.some(id => id == city.id));
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(5, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoCity: Omo_City,
    		OmoEnkels: Omo_Enkels,
    		OmoDreams: Omo_Dreams,
    		OmoBlog: Omo_Blog,
    		db,
    		currentId,
    		city,
    		enkels,
    		dreams,
    		blog
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(5, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(1, city = $$props.city);
    		if ("enkels" in $$props) $$invalidate(2, enkels = $$props.enkels);
    		if ("dreams" in $$props) $$invalidate(3, dreams = $$props.dreams);
    		if ("blog" in $$props) $$invalidate(4, blog = $$props.blog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, city, enkels, dreams, blog, currentId];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { db: 0, currentId: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<City> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[5] === undefined && !("currentId" in props)) {
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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /* istanbul ignore next (See: https://github.com/graphql/graphql-js/issues/2317) */
    var nodejsCustomInspectSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('nodejs.util.inspect.custom') : undefined;

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
    var MAX_ARRAY_LENGTH = 10;
    var MAX_RECURSIVE_DEPTH = 2;
    /**
     * Used to print values in error messages.
     */

    function inspect(value) {
      return formatValue(value, []);
    }

    function formatValue(value, seenValues) {
      switch (_typeof(value)) {
        case 'string':
          return JSON.stringify(value);

        case 'function':
          return value.name ? "[function ".concat(value.name, "]") : '[function]';

        case 'object':
          if (value === null) {
            return 'null';
          }

          return formatObjectValue(value, seenValues);

        default:
          return String(value);
      }
    }

    function formatObjectValue(value, previouslySeenValues) {
      if (previouslySeenValues.indexOf(value) !== -1) {
        return '[Circular]';
      }

      var seenValues = [].concat(previouslySeenValues, [value]);
      var customInspectFn = getCustomFn(value);

      if (customInspectFn !== undefined) {
        // $FlowFixMe(>=0.90.0)
        var customValue = customInspectFn.call(value); // check for infinite recursion

        if (customValue !== value) {
          return typeof customValue === 'string' ? customValue : formatValue(customValue, seenValues);
        }
      } else if (Array.isArray(value)) {
        return formatArray(value, seenValues);
      }

      return formatObject(value, seenValues);
    }

    function formatObject(object, seenValues) {
      var keys = Object.keys(object);

      if (keys.length === 0) {
        return '{}';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[' + getObjectTag(object) + ']';
      }

      var properties = keys.map(function (key) {
        var value = formatValue(object[key], seenValues);
        return key + ': ' + value;
      });
      return '{ ' + properties.join(', ') + ' }';
    }

    function formatArray(array, seenValues) {
      if (array.length === 0) {
        return '[]';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[Array]';
      }

      var len = Math.min(MAX_ARRAY_LENGTH, array.length);
      var remaining = array.length - len;
      var items = [];

      for (var i = 0; i < len; ++i) {
        items.push(formatValue(array[i], seenValues));
      }

      if (remaining === 1) {
        items.push('... 1 more item');
      } else if (remaining > 1) {
        items.push("... ".concat(remaining, " more items"));
      }

      return '[' + items.join(', ') + ']';
    }

    function getCustomFn(object) {
      var customInspectFn = object[String(nodejsCustomInspectSymbol)];

      if (typeof customInspectFn === 'function') {
        return customInspectFn;
      }

      if (typeof object.inspect === 'function') {
        return object.inspect;
      }
    }

    function getObjectTag(object) {
      var tag = Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/]$/, '');

      if (tag === 'Object' && typeof object.constructor === 'function') {
        var name = object.constructor.name;

        if (typeof name === 'string' && name !== '') {
          return name;
        }
      }

      return tag;
    }

    /**
     * The `defineToJSON()` function defines toJSON() and inspect() prototype
     * methods, if no function provided they become aliases for toString().
     */

    function defineToJSON(classObject) {
      var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : classObject.prototype.toString;
      classObject.prototype.toJSON = fn;
      classObject.prototype.inspect = fn;
      /* istanbul ignore else (See: https://github.com/graphql/graphql-js/issues/2317) */

      if (nodejsCustomInspectSymbol) {
        classObject.prototype[nodejsCustomInspectSymbol] = fn;
      }
    }

    /**
     * Contains a range of UTF-8 character offsets and token references that
     * identify the region of the source from which the AST derived.
     */
    var Location =
    /**
     * The character offset at which this Node begins.
     */

    /**
     * The character offset at which this Node ends.
     */

    /**
     * The Token at which this Node begins.
     */

    /**
     * The Token at which this Node ends.
     */

    /**
     * The Source document the AST represents.
     */
    function Location(startToken, endToken, source) {
      this.start = startToken.start;
      this.end = endToken.end;
      this.startToken = startToken;
      this.endToken = endToken;
      this.source = source;
    }; // Print a simplified form when appearing in JSON/util.inspect.

    defineToJSON(Location, function () {
      return {
        start: this.start,
        end: this.end
      };
    });
    /**
     * Represents a range of characters represented by a lexical token
     * within a Source.
     */

    var Token =
    /**
     * The kind of Token.
     */

    /**
     * The character offset at which this Node begins.
     */

    /**
     * The character offset at which this Node ends.
     */

    /**
     * The 1-indexed line number on which this Token appears.
     */

    /**
     * The 1-indexed column number at which this Token begins.
     */

    /**
     * For non-punctuation tokens, represents the interpreted value of the token.
     */

    /**
     * Tokens exist as nodes in a double-linked-list amongst all tokens
     * including ignored tokens. <SOF> is always the first node and <EOF>
     * the last.
     */
    function Token(kind, start, end, line, column, prev, value) {
      this.kind = kind;
      this.start = start;
      this.end = end;
      this.line = line;
      this.column = column;
      this.value = value;
      this.prev = prev;
      this.next = null;
    }; // Print a simplified form when appearing in JSON/util.inspect.

    defineToJSON(Token, function () {
      return {
        kind: this.kind,
        value: this.value,
        line: this.line,
        column: this.column
      };
    });
    /**
     * @internal
     */

    function isNode(maybeNode) {
      return maybeNode != null && typeof maybeNode.kind === 'string';
    }
    /**
     * The list of all possible AST node types.
     */

    /**
     * A visitor is provided to visit, it contains the collection of
     * relevant functions to be called during the visitor's traversal.
     */

    var QueryDocumentKeys = {
      Name: [],
      Document: ['definitions'],
      OperationDefinition: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
      VariableDefinition: ['variable', 'type', 'defaultValue', 'directives'],
      Variable: ['name'],
      SelectionSet: ['selections'],
      Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
      Argument: ['name', 'value'],
      FragmentSpread: ['name', 'directives'],
      InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
      FragmentDefinition: ['name', // Note: fragment variable definitions are experimental and may be changed
      // or removed in the future.
      'variableDefinitions', 'typeCondition', 'directives', 'selectionSet'],
      IntValue: [],
      FloatValue: [],
      StringValue: [],
      BooleanValue: [],
      NullValue: [],
      EnumValue: [],
      ListValue: ['values'],
      ObjectValue: ['fields'],
      ObjectField: ['name', 'value'],
      Directive: ['name', 'arguments'],
      NamedType: ['name'],
      ListType: ['type'],
      NonNullType: ['type'],
      SchemaDefinition: ['description', 'directives', 'operationTypes'],
      OperationTypeDefinition: ['type'],
      ScalarTypeDefinition: ['description', 'name', 'directives'],
      ObjectTypeDefinition: ['description', 'name', 'interfaces', 'directives', 'fields'],
      FieldDefinition: ['description', 'name', 'arguments', 'type', 'directives'],
      InputValueDefinition: ['description', 'name', 'type', 'defaultValue', 'directives'],
      InterfaceTypeDefinition: ['description', 'name', 'interfaces', 'directives', 'fields'],
      UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
      EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
      EnumValueDefinition: ['description', 'name', 'directives'],
      InputObjectTypeDefinition: ['description', 'name', 'directives', 'fields'],
      DirectiveDefinition: ['description', 'name', 'arguments', 'locations'],
      SchemaExtension: ['directives', 'operationTypes'],
      ScalarTypeExtension: ['name', 'directives'],
      ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      InterfaceTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      UnionTypeExtension: ['name', 'directives', 'types'],
      EnumTypeExtension: ['name', 'directives', 'values'],
      InputObjectTypeExtension: ['name', 'directives', 'fields']
    };
    var BREAK = Object.freeze({});
    /**
     * visit() will walk through an AST using a depth first traversal, calling
     * the visitor's enter function at each node in the traversal, and calling the
     * leave function after visiting that node and all of its child nodes.
     *
     * By returning different values from the enter and leave functions, the
     * behavior of the visitor can be altered, including skipping over a sub-tree of
     * the AST (by returning false), editing the AST by returning a value or null
     * to remove the value, or to stop the whole traversal by returning BREAK.
     *
     * When using visit() to edit an AST, the original AST will not be modified, and
     * a new version of the AST with the changes applied will be returned from the
     * visit function.
     *
     *     const editedAST = visit(ast, {
     *       enter(node, key, parent, path, ancestors) {
     *         // @return
     *         //   undefined: no action
     *         //   false: skip visiting this node
     *         //   visitor.BREAK: stop visiting altogether
     *         //   null: delete this node
     *         //   any value: replace this node with the returned value
     *       },
     *       leave(node, key, parent, path, ancestors) {
     *         // @return
     *         //   undefined: no action
     *         //   false: no action
     *         //   visitor.BREAK: stop visiting altogether
     *         //   null: delete this node
     *         //   any value: replace this node with the returned value
     *       }
     *     });
     *
     * Alternatively to providing enter() and leave() functions, a visitor can
     * instead provide functions named the same as the kinds of AST nodes, or
     * enter/leave visitors at a named key, leading to four permutations of
     * visitor API:
     *
     * 1) Named visitors triggered when entering a node a specific kind.
     *
     *     visit(ast, {
     *       Kind(node) {
     *         // enter the "Kind" node
     *       }
     *     })
     *
     * 2) Named visitors that trigger upon entering and leaving a node of
     *    a specific kind.
     *
     *     visit(ast, {
     *       Kind: {
     *         enter(node) {
     *           // enter the "Kind" node
     *         }
     *         leave(node) {
     *           // leave the "Kind" node
     *         }
     *       }
     *     })
     *
     * 3) Generic visitors that trigger upon entering and leaving any node.
     *
     *     visit(ast, {
     *       enter(node) {
     *         // enter any node
     *       },
     *       leave(node) {
     *         // leave any node
     *       }
     *     })
     *
     * 4) Parallel visitors for entering and leaving nodes of a specific kind.
     *
     *     visit(ast, {
     *       enter: {
     *         Kind(node) {
     *           // enter the "Kind" node
     *         }
     *       },
     *       leave: {
     *         Kind(node) {
     *           // leave the "Kind" node
     *         }
     *       }
     *     })
     */

    function visit(root, visitor) {
      var visitorKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : QueryDocumentKeys;

      /* eslint-disable no-undef-init */
      var stack = undefined;
      var inArray = Array.isArray(root);
      var keys = [root];
      var index = -1;
      var edits = [];
      var node = undefined;
      var key = undefined;
      var parent = undefined;
      var path = [];
      var ancestors = [];
      var newRoot = root;
      /* eslint-enable no-undef-init */

      do {
        index++;
        var isLeaving = index === keys.length;
        var isEdited = isLeaving && edits.length !== 0;

        if (isLeaving) {
          key = ancestors.length === 0 ? undefined : path[path.length - 1];
          node = parent;
          parent = ancestors.pop();

          if (isEdited) {
            if (inArray) {
              node = node.slice();
            } else {
              var clone = {};

              for (var _i2 = 0, _Object$keys2 = Object.keys(node); _i2 < _Object$keys2.length; _i2++) {
                var k = _Object$keys2[_i2];
                clone[k] = node[k];
              }

              node = clone;
            }

            var editOffset = 0;

            for (var ii = 0; ii < edits.length; ii++) {
              var editKey = edits[ii][0];
              var editValue = edits[ii][1];

              if (inArray) {
                editKey -= editOffset;
              }

              if (inArray && editValue === null) {
                node.splice(editKey, 1);
                editOffset++;
              } else {
                node[editKey] = editValue;
              }
            }
          }

          index = stack.index;
          keys = stack.keys;
          edits = stack.edits;
          inArray = stack.inArray;
          stack = stack.prev;
        } else {
          key = parent ? inArray ? index : keys[index] : undefined;
          node = parent ? parent[key] : newRoot;

          if (node === null || node === undefined) {
            continue;
          }

          if (parent) {
            path.push(key);
          }
        }

        var result = void 0;

        if (!Array.isArray(node)) {
          if (!isNode(node)) {
            throw new Error("Invalid AST Node: ".concat(inspect(node), "."));
          }

          var visitFn = getVisitFn(visitor, node.kind, isLeaving);

          if (visitFn) {
            result = visitFn.call(visitor, node, key, parent, path, ancestors);

            if (result === BREAK) {
              break;
            }

            if (result === false) {
              if (!isLeaving) {
                path.pop();
                continue;
              }
            } else if (result !== undefined) {
              edits.push([key, result]);

              if (!isLeaving) {
                if (isNode(result)) {
                  node = result;
                } else {
                  path.pop();
                  continue;
                }
              }
            }
          }
        }

        if (result === undefined && isEdited) {
          edits.push([key, node]);
        }

        if (isLeaving) {
          path.pop();
        } else {
          var _visitorKeys$node$kin;

          stack = {
            inArray: inArray,
            index: index,
            keys: keys,
            edits: edits,
            prev: stack
          };
          inArray = Array.isArray(node);
          keys = inArray ? node : (_visitorKeys$node$kin = visitorKeys[node.kind]) !== null && _visitorKeys$node$kin !== void 0 ? _visitorKeys$node$kin : [];
          index = -1;
          edits = [];

          if (parent) {
            ancestors.push(parent);
          }

          parent = node;
        }
      } while (stack !== undefined);

      if (edits.length !== 0) {
        newRoot = edits[edits.length - 1][1];
      }

      return newRoot;
    }
    /**
     * Given a visitor instance, if it is leaving or not, and a node kind, return
     * the function the visitor runtime should call.
     */

    function getVisitFn(visitor, kind, isLeaving) {
      var kindVisitor = visitor[kind];

      if (kindVisitor) {
        if (!isLeaving && typeof kindVisitor === 'function') {
          // { Kind() {} }
          return kindVisitor;
        }

        var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;

        if (typeof kindSpecificVisitor === 'function') {
          // { Kind: { enter() {}, leave() {} } }
          return kindSpecificVisitor;
        }
      } else {
        var specificVisitor = isLeaving ? visitor.leave : visitor.enter;

        if (specificVisitor) {
          if (typeof specificVisitor === 'function') {
            // { enter() {}, leave() {} }
            return specificVisitor;
          }

          var specificKindVisitor = specificVisitor[kind];

          if (typeof specificKindVisitor === 'function') {
            // { enter: { Kind() {} }, leave: { Kind() {} } }
            return specificKindVisitor;
          }
        }
      }
    }

    var genericMessage = "Invariant Violation";
    var _a = Object.setPrototypeOf, setPrototypeOf = _a === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a;
    var InvariantError = /** @class */ (function (_super) {
        __extends(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage;
            setPrototypeOf(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant(condition, message) {
        if (!condition) {
            throw new InvariantError(message);
        }
    }
    function wrapConsoleMethod(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod("warn");
        invariant.error = wrapConsoleMethod("error");
    })(invariant || (invariant = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub = { env: {} };
    if (typeof process === "object") {
        processStub = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var fastJsonStableStringify = function (data, opts) {
        if (!opts) opts = {};
        if (typeof opts === 'function') opts = { cmp: opts };
        var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

        var cmp = opts.cmp && (function (f) {
            return function (node) {
                return function (a, b) {
                    var aobj = { key: a, value: node[a] };
                    var bobj = { key: b, value: node[b] };
                    return f(aobj, bobj);
                };
            };
        })(opts.cmp);

        var seen = [];
        return (function stringify (node) {
            if (node && node.toJSON && typeof node.toJSON === 'function') {
                node = node.toJSON();
            }

            if (node === undefined) return;
            if (typeof node == 'number') return isFinite(node) ? '' + node : 'null';
            if (typeof node !== 'object') return JSON.stringify(node);

            var i, out;
            if (Array.isArray(node)) {
                out = '[';
                for (i = 0; i < node.length; i++) {
                    if (i) out += ',';
                    out += stringify(node[i]) || 'null';
                }
                return out + ']';
            }

            if (node === null) return 'null';

            if (seen.indexOf(node) !== -1) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }

            var seenIndex = seen.push(node) - 1;
            var keys = Object.keys(node).sort(cmp && cmp(node));
            out = '';
            for (i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node[key]);

                if (!value) continue;
                if (out) out += ',';
                out += JSON.stringify(key) + ':' + value;
            }
            seen.splice(seenIndex, 1);
            return '{' + out + '}';
        })(data);
    };

    var _a$1 = Object.prototype, toString = _a$1.toString, hasOwnProperty = _a$1.hasOwnProperty;
    var previousComparisons = new Map();
    /**
     * Performs a deep equality check on two JavaScript values, tolerating cycles.
     */
    function equal(a, b) {
        try {
            return check(a, b);
        }
        finally {
            previousComparisons.clear();
        }
    }
    function check(a, b) {
        // If the two values are strictly equal, our job is easy.
        if (a === b) {
            return true;
        }
        // Object.prototype.toString returns a representation of the runtime type of
        // the given value that is considerably more precise than typeof.
        var aTag = toString.call(a);
        var bTag = toString.call(b);
        // If the runtime types of a and b are different, they could maybe be equal
        // under some interpretation of equality, but for simplicity and performance
        // we just return false instead.
        if (aTag !== bTag) {
            return false;
        }
        switch (aTag) {
            case '[object Array]':
                // Arrays are a lot like other objects, but we can cheaply compare their
                // lengths as a short-cut before comparing their elements.
                if (a.length !== b.length)
                    return false;
            // Fall through to object case...
            case '[object Object]': {
                if (previouslyCompared(a, b))
                    return true;
                var aKeys = Object.keys(a);
                var bKeys = Object.keys(b);
                // If `a` and `b` have a different number of enumerable keys, they
                // must be different.
                var keyCount = aKeys.length;
                if (keyCount !== bKeys.length)
                    return false;
                // Now make sure they have the same keys.
                for (var k = 0; k < keyCount; ++k) {
                    if (!hasOwnProperty.call(b, aKeys[k])) {
                        return false;
                    }
                }
                // Finally, check deep equality of all child properties.
                for (var k = 0; k < keyCount; ++k) {
                    var key = aKeys[k];
                    if (!check(a[key], b[key])) {
                        return false;
                    }
                }
                return true;
            }
            case '[object Error]':
                return a.name === b.name && a.message === b.message;
            case '[object Number]':
                // Handle NaN, which is !== itself.
                if (a !== a)
                    return b !== b;
            // Fall through to shared +a === +b case...
            case '[object Boolean]':
            case '[object Date]':
                return +a === +b;
            case '[object RegExp]':
            case '[object String]':
                return a == "" + b;
            case '[object Map]':
            case '[object Set]': {
                if (a.size !== b.size)
                    return false;
                if (previouslyCompared(a, b))
                    return true;
                var aIterator = a.entries();
                var isMap = aTag === '[object Map]';
                while (true) {
                    var info = aIterator.next();
                    if (info.done)
                        break;
                    // If a instanceof Set, aValue === aKey.
                    var _a = info.value, aKey = _a[0], aValue = _a[1];
                    // So this works the same way for both Set and Map.
                    if (!b.has(aKey)) {
                        return false;
                    }
                    // However, we care about deep equality of values only when dealing
                    // with Map structures.
                    if (isMap && !check(aValue, b.get(aKey))) {
                        return false;
                    }
                }
                return true;
            }
        }
        // Otherwise the values are not equal.
        return false;
    }
    function previouslyCompared(a, b) {
        // Though cyclic references can make an object graph appear infinite from the
        // perspective of a depth-first traversal, the graph still contains a finite
        // number of distinct object references. We use the previousComparisons cache
        // to avoid comparing the same pair of object references more than once, which
        // guarantees termination (even if we end up comparing every object in one
        // graph to every object in the other graph, which is extremely unlikely),
        // while still allowing weird isomorphic structures (like rings with different
        // lengths) a chance to pass the equality test.
        var bSet = previousComparisons.get(a);
        if (bSet) {
            // Return true here because we can be sure false will be returned somewhere
            // else if the objects are not equivalent.
            if (bSet.has(b))
                return true;
        }
        else {
            previousComparisons.set(a, bSet = new Set);
        }
        bSet.add(b);
        return false;
    }

    function isStringValue(value) {
        return value.kind === 'StringValue';
    }
    function isBooleanValue(value) {
        return value.kind === 'BooleanValue';
    }
    function isIntValue(value) {
        return value.kind === 'IntValue';
    }
    function isFloatValue(value) {
        return value.kind === 'FloatValue';
    }
    function isVariable(value) {
        return value.kind === 'Variable';
    }
    function isObjectValue(value) {
        return value.kind === 'ObjectValue';
    }
    function isListValue(value) {
        return value.kind === 'ListValue';
    }
    function isEnumValue(value) {
        return value.kind === 'EnumValue';
    }
    function isNullValue(value) {
        return value.kind === 'NullValue';
    }
    function valueToObjectRepresentation(argObj, name, value, variables) {
        if (isIntValue(value) || isFloatValue(value)) {
            argObj[name.value] = Number(value.value);
        }
        else if (isBooleanValue(value) || isStringValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isObjectValue(value)) {
            var nestedArgObj_1 = {};
            value.fields.map(function (obj) {
                return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
            });
            argObj[name.value] = nestedArgObj_1;
        }
        else if (isVariable(value)) {
            var variableValue = (variables || {})[value.name.value];
            argObj[name.value] = variableValue;
        }
        else if (isListValue(value)) {
            argObj[name.value] = value.values.map(function (listValue) {
                var nestedArgArrayObj = {};
                valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
                return nestedArgArrayObj[name.value];
            });
        }
        else if (isEnumValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isNullValue(value)) {
            argObj[name.value] = null;
        }
        else {
            throw process.env.NODE_ENV === "production" ? new InvariantError(17) : new InvariantError("The inline argument \"" + name.value + "\" of kind \"" + value.kind + "\"" +
                'is not supported. Use variables instead of inline arguments to ' +
                'overcome this limitation.');
        }
    }
    function storeKeyNameFromField(field, variables) {
        var directivesObj = null;
        if (field.directives) {
            directivesObj = {};
            field.directives.forEach(function (directive) {
                directivesObj[directive.name.value] = {};
                if (directive.arguments) {
                    directive.arguments.forEach(function (_a) {
                        var name = _a.name, value = _a.value;
                        return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
                    });
                }
            });
        }
        var argObj = null;
        if (field.arguments && field.arguments.length) {
            argObj = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj, name, value, variables);
            });
        }
        return getStoreKeyName(field.name.value, argObj, directivesObj);
    }
    var KNOWN_DIRECTIVES = [
        'connection',
        'include',
        'skip',
        'client',
        'rest',
        'export',
    ];
    function getStoreKeyName(fieldName, args, directives) {
        if (directives &&
            directives['connection'] &&
            directives['connection']['key']) {
            if (directives['connection']['filter'] &&
                directives['connection']['filter'].length > 0) {
                var filterKeys = directives['connection']['filter']
                    ? directives['connection']['filter']
                    : [];
                filterKeys.sort();
                var queryArgs_1 = args;
                var filteredArgs_1 = {};
                filterKeys.forEach(function (key) {
                    filteredArgs_1[key] = queryArgs_1[key];
                });
                return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs_1) + ")";
            }
            else {
                return directives['connection']['key'];
            }
        }
        var completeFieldName = fieldName;
        if (args) {
            var stringifiedArgs = fastJsonStableStringify(args);
            completeFieldName += "(" + stringifiedArgs + ")";
        }
        if (directives) {
            Object.keys(directives).forEach(function (key) {
                if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
                    return;
                if (directives[key] && Object.keys(directives[key]).length) {
                    completeFieldName += "@" + key + "(" + JSON.stringify(directives[key]) + ")";
                }
                else {
                    completeFieldName += "@" + key;
                }
            });
        }
        return completeFieldName;
    }
    function argumentsObjectFromField(field, variables) {
        if (field.arguments && field.arguments.length) {
            var argObj_1 = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj_1, name, value, variables);
            });
            return argObj_1;
        }
        return null;
    }
    function resultKeyNameFromField(field) {
        return field.alias ? field.alias.value : field.name.value;
    }
    function isField(selection) {
        return selection.kind === 'Field';
    }
    function isInlineFragment(selection) {
        return selection.kind === 'InlineFragment';
    }
    function isIdValue(idObject) {
        return idObject &&
            idObject.type === 'id' &&
            typeof idObject.generated === 'boolean';
    }
    function toIdValue(idConfig, generated) {
        if (generated === void 0) { generated = false; }
        return __assign({ type: 'id', generated: generated }, (typeof idConfig === 'string'
            ? { id: idConfig, typename: undefined }
            : idConfig));
    }
    function isJsonValue(jsonObject) {
        return (jsonObject != null &&
            typeof jsonObject === 'object' &&
            jsonObject.type === 'json');
    }

    function getDirectiveInfoFromField(field, variables) {
        if (field.directives && field.directives.length) {
            var directiveObj_1 = {};
            field.directives.forEach(function (directive) {
                directiveObj_1[directive.name.value] = argumentsObjectFromField(directive, variables);
            });
            return directiveObj_1;
        }
        return null;
    }
    function shouldInclude(selection, variables) {
        if (variables === void 0) { variables = {}; }
        return getInclusionDirectives(selection.directives).every(function (_a) {
            var directive = _a.directive, ifArgument = _a.ifArgument;
            var evaledValue = false;
            if (ifArgument.value.kind === 'Variable') {
                evaledValue = variables[ifArgument.value.name.value];
                process.env.NODE_ENV === "production" ? invariant(evaledValue !== void 0, 1) : invariant(evaledValue !== void 0, "Invalid variable referenced in @" + directive.name.value + " directive.");
            }
            else {
                evaledValue = ifArgument.value.value;
            }
            return directive.name.value === 'skip' ? !evaledValue : evaledValue;
        });
    }
    function getDirectiveNames(doc) {
        var names = [];
        visit(doc, {
            Directive: function (node) {
                names.push(node.name.value);
            },
        });
        return names;
    }
    function hasDirectives(names, doc) {
        return getDirectiveNames(doc).some(function (name) { return names.indexOf(name) > -1; });
    }
    function hasClientExports(document) {
        return (document &&
            hasDirectives(['client'], document) &&
            hasDirectives(['export'], document));
    }
    function isInclusionDirective(_a) {
        var value = _a.name.value;
        return value === 'skip' || value === 'include';
    }
    function getInclusionDirectives(directives) {
        return directives ? directives.filter(isInclusionDirective).map(function (directive) {
            var directiveArguments = directive.arguments;
            var directiveName = directive.name.value;
            process.env.NODE_ENV === "production" ? invariant(directiveArguments && directiveArguments.length === 1, 2) : invariant(directiveArguments && directiveArguments.length === 1, "Incorrect number of arguments for the @" + directiveName + " directive.");
            var ifArgument = directiveArguments[0];
            process.env.NODE_ENV === "production" ? invariant(ifArgument.name && ifArgument.name.value === 'if', 3) : invariant(ifArgument.name && ifArgument.name.value === 'if', "Invalid argument for the @" + directiveName + " directive.");
            var ifValue = ifArgument.value;
            process.env.NODE_ENV === "production" ? invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 4) : invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), "Argument for the @" + directiveName + " directive must be a variable or a boolean value.");
            return { directive: directive, ifArgument: ifArgument };
        }) : [];
    }

    function getFragmentQueryDocument(document, fragmentName) {
        var actualFragmentName = fragmentName;
        var fragments = [];
        document.definitions.forEach(function (definition) {
            if (definition.kind === 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError(5) : new InvariantError("Found a " + definition.operation + " operation" + (definition.name ? " named '" + definition.name.value + "'" : '') + ". " +
                    'No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            }
            if (definition.kind === 'FragmentDefinition') {
                fragments.push(definition);
            }
        });
        if (typeof actualFragmentName === 'undefined') {
            process.env.NODE_ENV === "production" ? invariant(fragments.length === 1, 6) : invariant(fragments.length === 1, "Found " + fragments.length + " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.");
            actualFragmentName = fragments[0].name.value;
        }
        var query = __assign(__assign({}, document), { definitions: __spreadArrays([
                {
                    kind: 'OperationDefinition',
                    operation: 'query',
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                            {
                                kind: 'FragmentSpread',
                                name: {
                                    kind: 'Name',
                                    value: actualFragmentName,
                                },
                            },
                        ],
                    },
                }
            ], document.definitions) });
        return query;
    }

    function assign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            if (typeof source === 'undefined' || source === null) {
                return;
            }
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        });
        return target;
    }
    function checkDocument(doc) {
        process.env.NODE_ENV === "production" ? invariant(doc && doc.kind === 'Document', 8) : invariant(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
        var operations = doc.definitions
            .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
            .map(function (definition) {
            if (definition.kind !== 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError(9) : new InvariantError("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
            }
            return definition;
        });
        process.env.NODE_ENV === "production" ? invariant(operations.length <= 1, 10) : invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
        return doc;
    }
    function getOperationDefinition(doc) {
        checkDocument(doc);
        return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
    }
    function getOperationName(doc) {
        return (doc.definitions
            .filter(function (definition) {
            return definition.kind === 'OperationDefinition' && definition.name;
        })
            .map(function (x) { return x.name.value; })[0] || null);
    }
    function getFragmentDefinitions(doc) {
        return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
    }
    function getQueryDefinition(doc) {
        var queryDef = getOperationDefinition(doc);
        process.env.NODE_ENV === "production" ? invariant(queryDef && queryDef.operation === 'query', 12) : invariant(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
        return queryDef;
    }
    function getFragmentDefinition(doc) {
        process.env.NODE_ENV === "production" ? invariant(doc.kind === 'Document', 13) : invariant(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
        process.env.NODE_ENV === "production" ? invariant(doc.definitions.length <= 1, 14) : invariant(doc.definitions.length <= 1, 'Fragment must have exactly one definition.');
        var fragmentDef = doc.definitions[0];
        process.env.NODE_ENV === "production" ? invariant(fragmentDef.kind === 'FragmentDefinition', 15) : invariant(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.');
        return fragmentDef;
    }
    function getMainDefinition(queryDoc) {
        checkDocument(queryDoc);
        var fragmentDefinition;
        for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            if (definition.kind === 'OperationDefinition') {
                var operation = definition.operation;
                if (operation === 'query' ||
                    operation === 'mutation' ||
                    operation === 'subscription') {
                    return definition;
                }
            }
            if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
                fragmentDefinition = definition;
            }
        }
        if (fragmentDefinition) {
            return fragmentDefinition;
        }
        throw process.env.NODE_ENV === "production" ? new InvariantError(16) : new InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
    }
    function createFragmentMap(fragments) {
        if (fragments === void 0) { fragments = []; }
        var symTable = {};
        fragments.forEach(function (fragment) {
            symTable[fragment.name.value] = fragment;
        });
        return symTable;
    }
    function getDefaultValues(definition) {
        if (definition &&
            definition.variableDefinitions &&
            definition.variableDefinitions.length) {
            var defaultValues = definition.variableDefinitions
                .filter(function (_a) {
                var defaultValue = _a.defaultValue;
                return defaultValue;
            })
                .map(function (_a) {
                var variable = _a.variable, defaultValue = _a.defaultValue;
                var defaultValueObj = {};
                valueToObjectRepresentation(defaultValueObj, variable.name, defaultValue);
                return defaultValueObj;
            });
            return assign.apply(void 0, __spreadArrays([{}], defaultValues));
        }
        return {};
    }

    function filterInPlace(array, test, context) {
        var target = 0;
        array.forEach(function (elem, i) {
            if (test.call(this, elem, i, array)) {
                array[target++] = elem;
            }
        }, context);
        array.length = target;
        return array;
    }

    var TYPENAME_FIELD = {
        kind: 'Field',
        name: {
            kind: 'Name',
            value: '__typename',
        },
    };
    function isEmpty(op, fragments) {
        return op.selectionSet.selections.every(function (selection) {
            return selection.kind === 'FragmentSpread' &&
                isEmpty(fragments[selection.name.value], fragments);
        });
    }
    function nullIfDocIsEmpty(doc) {
        return isEmpty(getOperationDefinition(doc) || getFragmentDefinition(doc), createFragmentMap(getFragmentDefinitions(doc)))
            ? null
            : doc;
    }
    function getDirectiveMatcher(directives) {
        return function directiveMatcher(directive) {
            return directives.some(function (dir) {
                return (dir.name && dir.name === directive.name.value) ||
                    (dir.test && dir.test(directive));
            });
        };
    }
    function removeDirectivesFromDocument(directives, doc) {
        var variablesInUse = Object.create(null);
        var variablesToRemove = [];
        var fragmentSpreadsInUse = Object.create(null);
        var fragmentSpreadsToRemove = [];
        var modifiedDoc = nullIfDocIsEmpty(visit(doc, {
            Variable: {
                enter: function (node, _key, parent) {
                    if (parent.kind !== 'VariableDefinition') {
                        variablesInUse[node.name.value] = true;
                    }
                },
            },
            Field: {
                enter: function (node) {
                    if (directives && node.directives) {
                        var shouldRemoveField = directives.some(function (directive) { return directive.remove; });
                        if (shouldRemoveField &&
                            node.directives &&
                            node.directives.some(getDirectiveMatcher(directives))) {
                            if (node.arguments) {
                                node.arguments.forEach(function (arg) {
                                    if (arg.value.kind === 'Variable') {
                                        variablesToRemove.push({
                                            name: arg.value.name.value,
                                        });
                                    }
                                });
                            }
                            if (node.selectionSet) {
                                getAllFragmentSpreadsFromSelectionSet(node.selectionSet).forEach(function (frag) {
                                    fragmentSpreadsToRemove.push({
                                        name: frag.name.value,
                                    });
                                });
                            }
                            return null;
                        }
                    }
                },
            },
            FragmentSpread: {
                enter: function (node) {
                    fragmentSpreadsInUse[node.name.value] = true;
                },
            },
            Directive: {
                enter: function (node) {
                    if (getDirectiveMatcher(directives)(node)) {
                        return null;
                    }
                },
            },
        }));
        if (modifiedDoc &&
            filterInPlace(variablesToRemove, function (v) { return !variablesInUse[v.name]; }).length) {
            modifiedDoc = removeArgumentsFromDocument(variablesToRemove, modifiedDoc);
        }
        if (modifiedDoc &&
            filterInPlace(fragmentSpreadsToRemove, function (fs) { return !fragmentSpreadsInUse[fs.name]; })
                .length) {
            modifiedDoc = removeFragmentSpreadFromDocument(fragmentSpreadsToRemove, modifiedDoc);
        }
        return modifiedDoc;
    }
    function addTypenameToDocument(doc) {
        return visit(checkDocument(doc), {
            SelectionSet: {
                enter: function (node, _key, parent) {
                    if (parent &&
                        parent.kind === 'OperationDefinition') {
                        return;
                    }
                    var selections = node.selections;
                    if (!selections) {
                        return;
                    }
                    var skip = selections.some(function (selection) {
                        return (isField(selection) &&
                            (selection.name.value === '__typename' ||
                                selection.name.value.lastIndexOf('__', 0) === 0));
                    });
                    if (skip) {
                        return;
                    }
                    var field = parent;
                    if (isField(field) &&
                        field.directives &&
                        field.directives.some(function (d) { return d.name.value === 'export'; })) {
                        return;
                    }
                    return __assign(__assign({}, node), { selections: __spreadArrays(selections, [TYPENAME_FIELD]) });
                },
            },
        });
    }
    var connectionRemoveConfig = {
        test: function (directive) {
            var willRemove = directive.name.value === 'connection';
            if (willRemove) {
                if (!directive.arguments ||
                    !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
                    process.env.NODE_ENV === "production" || invariant.warn('Removing an @connection directive even though it does not have a key. ' +
                        'You may want to use the key parameter to specify a store key.');
                }
            }
            return willRemove;
        },
    };
    function removeConnectionDirectiveFromDocument(doc) {
        return removeDirectivesFromDocument([connectionRemoveConfig], checkDocument(doc));
    }
    function getArgumentMatcher(config) {
        return function argumentMatcher(argument) {
            return config.some(function (aConfig) {
                return argument.value &&
                    argument.value.kind === 'Variable' &&
                    argument.value.name &&
                    (aConfig.name === argument.value.name.value ||
                        (aConfig.test && aConfig.test(argument)));
            });
        };
    }
    function removeArgumentsFromDocument(config, doc) {
        var argMatcher = getArgumentMatcher(config);
        return nullIfDocIsEmpty(visit(doc, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign(__assign({}, node), { variableDefinitions: node.variableDefinitions.filter(function (varDef) {
                            return !config.some(function (arg) { return arg.name === varDef.variable.name.value; });
                        }) });
                },
            },
            Field: {
                enter: function (node) {
                    var shouldRemoveField = config.some(function (argConfig) { return argConfig.remove; });
                    if (shouldRemoveField) {
                        var argMatchCount_1 = 0;
                        node.arguments.forEach(function (arg) {
                            if (argMatcher(arg)) {
                                argMatchCount_1 += 1;
                            }
                        });
                        if (argMatchCount_1 === 1) {
                            return null;
                        }
                    }
                },
            },
            Argument: {
                enter: function (node) {
                    if (argMatcher(node)) {
                        return null;
                    }
                },
            },
        }));
    }
    function removeFragmentSpreadFromDocument(config, doc) {
        function enter(node) {
            if (config.some(function (def) { return def.name === node.name.value; })) {
                return null;
            }
        }
        return nullIfDocIsEmpty(visit(doc, {
            FragmentSpread: { enter: enter },
            FragmentDefinition: { enter: enter },
        }));
    }
    function getAllFragmentSpreadsFromSelectionSet(selectionSet) {
        var allFragments = [];
        selectionSet.selections.forEach(function (selection) {
            if ((isField(selection) || isInlineFragment(selection)) &&
                selection.selectionSet) {
                getAllFragmentSpreadsFromSelectionSet(selection.selectionSet).forEach(function (frag) { return allFragments.push(frag); });
            }
            else if (selection.kind === 'FragmentSpread') {
                allFragments.push(selection);
            }
        });
        return allFragments;
    }
    function buildQueryFromSelectionSet(document) {
        var definition = getMainDefinition(document);
        var definitionOperation = definition.operation;
        if (definitionOperation === 'query') {
            return document;
        }
        var modifiedDoc = visit(document, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign(__assign({}, node), { operation: 'query' });
                },
            },
        });
        return modifiedDoc;
    }
    function removeClientSetsFromDocument(document) {
        checkDocument(document);
        var modifiedDoc = removeDirectivesFromDocument([
            {
                test: function (directive) { return directive.name.value === 'client'; },
                remove: true,
            },
        ], document);
        if (modifiedDoc) {
            modifiedDoc = visit(modifiedDoc, {
                FragmentDefinition: {
                    enter: function (node) {
                        if (node.selectionSet) {
                            var isTypenameOnly = node.selectionSet.selections.every(function (selection) {
                                return isField(selection) && selection.name.value === '__typename';
                            });
                            if (isTypenameOnly) {
                                return null;
                            }
                        }
                    },
                },
            });
        }
        return modifiedDoc;
    }

    var canUseWeakMap = typeof WeakMap === 'function' && !(typeof navigator === 'object' &&
        navigator.product === 'ReactNative');

    var toString$1 = Object.prototype.toString;
    function cloneDeep(value) {
        return cloneDeepHelper(value, new Map());
    }
    function cloneDeepHelper(val, seen) {
        switch (toString$1.call(val)) {
            case "[object Array]": {
                if (seen.has(val))
                    return seen.get(val);
                var copy_1 = val.slice(0);
                seen.set(val, copy_1);
                copy_1.forEach(function (child, i) {
                    copy_1[i] = cloneDeepHelper(child, seen);
                });
                return copy_1;
            }
            case "[object Object]": {
                if (seen.has(val))
                    return seen.get(val);
                var copy_2 = Object.create(Object.getPrototypeOf(val));
                seen.set(val, copy_2);
                Object.keys(val).forEach(function (key) {
                    copy_2[key] = cloneDeepHelper(val[key], seen);
                });
                return copy_2;
            }
            default:
                return val;
        }
    }

    function getEnv() {
        if (typeof process !== 'undefined' && process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        return 'development';
    }
    function isEnv(env) {
        return getEnv() === env;
    }
    function isProduction() {
        return isEnv('production') === true;
    }
    function isDevelopment() {
        return isEnv('development') === true;
    }
    function isTest() {
        return isEnv('test') === true;
    }

    function tryFunctionOrLogError(f) {
        try {
            return f();
        }
        catch (e) {
            if (console.error) {
                console.error(e);
            }
        }
    }
    function graphQLResultHasError(result) {
        return result.errors && result.errors.length;
    }

    function deepFreeze(o) {
        Object.freeze(o);
        Object.getOwnPropertyNames(o).forEach(function (prop) {
            if (o[prop] !== null &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])) {
                deepFreeze(o[prop]);
            }
        });
        return o;
    }
    function maybeDeepFreeze(obj) {
        if (isDevelopment() || isTest()) {
            var symbolIsPolyfilled = typeof Symbol === 'function' && typeof Symbol('') === 'string';
            if (!symbolIsPolyfilled) {
                return deepFreeze(obj);
            }
        }
        return obj;
    }

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    function mergeDeep() {
        var sources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
        }
        return mergeDeepArray(sources);
    }
    function mergeDeepArray(sources) {
        var target = sources[0] || {};
        var count = sources.length;
        if (count > 1) {
            var pastCopies = [];
            target = shallowCopyForMerge(target, pastCopies);
            for (var i = 1; i < count; ++i) {
                target = mergeHelper(target, sources[i], pastCopies);
            }
        }
        return target;
    }
    function isObject(obj) {
        return obj !== null && typeof obj === 'object';
    }
    function mergeHelper(target, source, pastCopies) {
        if (isObject(source) && isObject(target)) {
            if (Object.isExtensible && !Object.isExtensible(target)) {
                target = shallowCopyForMerge(target, pastCopies);
            }
            Object.keys(source).forEach(function (sourceKey) {
                var sourceValue = source[sourceKey];
                if (hasOwnProperty$1.call(target, sourceKey)) {
                    var targetValue = target[sourceKey];
                    if (sourceValue !== targetValue) {
                        target[sourceKey] = mergeHelper(shallowCopyForMerge(targetValue, pastCopies), sourceValue, pastCopies);
                    }
                }
                else {
                    target[sourceKey] = sourceValue;
                }
            });
            return target;
        }
        return source;
    }
    function shallowCopyForMerge(value, pastCopies) {
        if (value !== null &&
            typeof value === 'object' &&
            pastCopies.indexOf(value) < 0) {
            if (Array.isArray(value)) {
                value = value.slice(0);
            }
            else {
                value = __assign({ __proto__: Object.getPrototypeOf(value) }, value);
            }
            pastCopies.push(value);
        }
        return value;
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var Observable_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Observable = void 0;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    // === Symbol Support ===
    var hasSymbols = function () {
      return typeof Symbol === 'function';
    };

    var hasSymbol = function (name) {
      return hasSymbols() && Boolean(Symbol[name]);
    };

    var getSymbol = function (name) {
      return hasSymbol(name) ? Symbol[name] : '@@' + name;
    };

    if (hasSymbols() && !hasSymbol('observable')) {
      Symbol.observable = Symbol('observable');
    }

    var SymbolIterator = getSymbol('iterator');
    var SymbolObservable = getSymbol('observable');
    var SymbolSpecies = getSymbol('species'); // === Abstract Operations ===

    function getMethod(obj, key) {
      var value = obj[key];
      if (value == null) return undefined;
      if (typeof value !== 'function') throw new TypeError(value + ' is not a function');
      return value;
    }

    function getSpecies(obj) {
      var ctor = obj.constructor;

      if (ctor !== undefined) {
        ctor = ctor[SymbolSpecies];

        if (ctor === null) {
          ctor = undefined;
        }
      }

      return ctor !== undefined ? ctor : Observable;
    }

    function isObservable(x) {
      return x instanceof Observable; // SPEC: Brand check
    }

    function hostReportError(e) {
      if (hostReportError.log) {
        hostReportError.log(e);
      } else {
        setTimeout(function () {
          throw e;
        });
      }
    }

    function enqueue(fn) {
      Promise.resolve().then(function () {
        try {
          fn();
        } catch (e) {
          hostReportError(e);
        }
      });
    }

    function cleanupSubscription(subscription) {
      var cleanup = subscription._cleanup;
      if (cleanup === undefined) return;
      subscription._cleanup = undefined;

      if (!cleanup) {
        return;
      }

      try {
        if (typeof cleanup === 'function') {
          cleanup();
        } else {
          var unsubscribe = getMethod(cleanup, 'unsubscribe');

          if (unsubscribe) {
            unsubscribe.call(cleanup);
          }
        }
      } catch (e) {
        hostReportError(e);
      }
    }

    function closeSubscription(subscription) {
      subscription._observer = undefined;
      subscription._queue = undefined;
      subscription._state = 'closed';
    }

    function flushSubscription(subscription) {
      var queue = subscription._queue;

      if (!queue) {
        return;
      }

      subscription._queue = undefined;
      subscription._state = 'ready';

      for (var i = 0; i < queue.length; ++i) {
        notifySubscription(subscription, queue[i].type, queue[i].value);
        if (subscription._state === 'closed') break;
      }
    }

    function notifySubscription(subscription, type, value) {
      subscription._state = 'running';
      var observer = subscription._observer;

      try {
        var m = getMethod(observer, type);

        switch (type) {
          case 'next':
            if (m) m.call(observer, value);
            break;

          case 'error':
            closeSubscription(subscription);
            if (m) m.call(observer, value);else throw value;
            break;

          case 'complete':
            closeSubscription(subscription);
            if (m) m.call(observer);
            break;
        }
      } catch (e) {
        hostReportError(e);
      }

      if (subscription._state === 'closed') cleanupSubscription(subscription);else if (subscription._state === 'running') subscription._state = 'ready';
    }

    function onNotify(subscription, type, value) {
      if (subscription._state === 'closed') return;

      if (subscription._state === 'buffering') {
        subscription._queue.push({
          type: type,
          value: value
        });

        return;
      }

      if (subscription._state !== 'ready') {
        subscription._state = 'buffering';
        subscription._queue = [{
          type: type,
          value: value
        }];
        enqueue(function () {
          return flushSubscription(subscription);
        });
        return;
      }

      notifySubscription(subscription, type, value);
    }

    var Subscription =
    /*#__PURE__*/
    function () {
      function Subscription(observer, subscriber) {
        _classCallCheck(this, Subscription);

        // ASSERT: observer is an object
        // ASSERT: subscriber is callable
        this._cleanup = undefined;
        this._observer = observer;
        this._queue = undefined;
        this._state = 'initializing';
        var subscriptionObserver = new SubscriptionObserver(this);

        try {
          this._cleanup = subscriber.call(undefined, subscriptionObserver);
        } catch (e) {
          subscriptionObserver.error(e);
        }

        if (this._state === 'initializing') this._state = 'ready';
      }

      _createClass(Subscription, [{
        key: "unsubscribe",
        value: function unsubscribe() {
          if (this._state !== 'closed') {
            closeSubscription(this);
            cleanupSubscription(this);
          }
        }
      }, {
        key: "closed",
        get: function () {
          return this._state === 'closed';
        }
      }]);

      return Subscription;
    }();

    var SubscriptionObserver =
    /*#__PURE__*/
    function () {
      function SubscriptionObserver(subscription) {
        _classCallCheck(this, SubscriptionObserver);

        this._subscription = subscription;
      }

      _createClass(SubscriptionObserver, [{
        key: "next",
        value: function next(value) {
          onNotify(this._subscription, 'next', value);
        }
      }, {
        key: "error",
        value: function error(value) {
          onNotify(this._subscription, 'error', value);
        }
      }, {
        key: "complete",
        value: function complete() {
          onNotify(this._subscription, 'complete');
        }
      }, {
        key: "closed",
        get: function () {
          return this._subscription._state === 'closed';
        }
      }]);

      return SubscriptionObserver;
    }();

    var Observable =
    /*#__PURE__*/
    function () {
      function Observable(subscriber) {
        _classCallCheck(this, Observable);

        if (!(this instanceof Observable)) throw new TypeError('Observable cannot be called as a function');
        if (typeof subscriber !== 'function') throw new TypeError('Observable initializer must be a function');
        this._subscriber = subscriber;
      }

      _createClass(Observable, [{
        key: "subscribe",
        value: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            observer = {
              next: observer,
              error: arguments[1],
              complete: arguments[2]
            };
          }

          return new Subscription(observer, this._subscriber);
        }
      }, {
        key: "forEach",
        value: function forEach(fn) {
          var _this = this;

          return new Promise(function (resolve, reject) {
            if (typeof fn !== 'function') {
              reject(new TypeError(fn + ' is not a function'));
              return;
            }

            function done() {
              subscription.unsubscribe();
              resolve();
            }

            var subscription = _this.subscribe({
              next: function (value) {
                try {
                  fn(value, done);
                } catch (e) {
                  reject(e);
                  subscription.unsubscribe();
                }
              },
              error: reject,
              complete: resolve
            });
          });
        }
      }, {
        key: "map",
        value: function map(fn) {
          var _this2 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            return _this2.subscribe({
              next: function (value) {
                try {
                  value = fn(value);
                } catch (e) {
                  return observer.error(e);
                }

                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "filter",
        value: function filter(fn) {
          var _this3 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            return _this3.subscribe({
              next: function (value) {
                try {
                  if (!fn(value)) return;
                } catch (e) {
                  return observer.error(e);
                }

                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "reduce",
        value: function reduce(fn) {
          var _this4 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          var hasSeed = arguments.length > 1;
          var hasValue = false;
          var seed = arguments[1];
          var acc = seed;
          return new C(function (observer) {
            return _this4.subscribe({
              next: function (value) {
                var first = !hasValue;
                hasValue = true;

                if (!first || hasSeed) {
                  try {
                    acc = fn(acc, value);
                  } catch (e) {
                    return observer.error(e);
                  }
                } else {
                  acc = value;
                }
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                if (!hasValue && !hasSeed) return observer.error(new TypeError('Cannot reduce an empty sequence'));
                observer.next(acc);
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "concat",
        value: function concat() {
          var _this5 = this;

          for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
            sources[_key] = arguments[_key];
          }

          var C = getSpecies(this);
          return new C(function (observer) {
            var subscription;
            var index = 0;

            function startNext(next) {
              subscription = next.subscribe({
                next: function (v) {
                  observer.next(v);
                },
                error: function (e) {
                  observer.error(e);
                },
                complete: function () {
                  if (index === sources.length) {
                    subscription = undefined;
                    observer.complete();
                  } else {
                    startNext(C.from(sources[index++]));
                  }
                }
              });
            }

            startNext(_this5);
            return function () {
              if (subscription) {
                subscription.unsubscribe();
                subscription = undefined;
              }
            };
          });
        }
      }, {
        key: "flatMap",
        value: function flatMap(fn) {
          var _this6 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            var subscriptions = [];

            var outer = _this6.subscribe({
              next: function (value) {
                if (fn) {
                  try {
                    value = fn(value);
                  } catch (e) {
                    return observer.error(e);
                  }
                }

                var inner = C.from(value).subscribe({
                  next: function (value) {
                    observer.next(value);
                  },
                  error: function (e) {
                    observer.error(e);
                  },
                  complete: function () {
                    var i = subscriptions.indexOf(inner);
                    if (i >= 0) subscriptions.splice(i, 1);
                    completeIfDone();
                  }
                });
                subscriptions.push(inner);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                completeIfDone();
              }
            });

            function completeIfDone() {
              if (outer.closed && subscriptions.length === 0) observer.complete();
            }

            return function () {
              subscriptions.forEach(function (s) {
                return s.unsubscribe();
              });
              outer.unsubscribe();
            };
          });
        }
      }, {
        key: SymbolObservable,
        value: function () {
          return this;
        }
      }], [{
        key: "from",
        value: function from(x) {
          var C = typeof this === 'function' ? this : Observable;
          if (x == null) throw new TypeError(x + ' is not an object');
          var method = getMethod(x, SymbolObservable);

          if (method) {
            var observable = method.call(x);
            if (Object(observable) !== observable) throw new TypeError(observable + ' is not an object');
            if (isObservable(observable) && observable.constructor === C) return observable;
            return new C(function (observer) {
              return observable.subscribe(observer);
            });
          }

          if (hasSymbol('iterator')) {
            method = getMethod(x, SymbolIterator);

            if (method) {
              return new C(function (observer) {
                enqueue(function () {
                  if (observer.closed) return;
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = method.call(x)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var _item = _step.value;
                      observer.next(_item);
                      if (observer.closed) return;
                    }
                  } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                      }
                    } finally {
                      if (_didIteratorError) {
                        throw _iteratorError;
                      }
                    }
                  }

                  observer.complete();
                });
              });
            }
          }

          if (Array.isArray(x)) {
            return new C(function (observer) {
              enqueue(function () {
                if (observer.closed) return;

                for (var i = 0; i < x.length; ++i) {
                  observer.next(x[i]);
                  if (observer.closed) return;
                }

                observer.complete();
              });
            });
          }

          throw new TypeError(x + ' is not observable');
        }
      }, {
        key: "of",
        value: function of() {
          for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            items[_key2] = arguments[_key2];
          }

          var C = typeof this === 'function' ? this : Observable;
          return new C(function (observer) {
            enqueue(function () {
              if (observer.closed) return;

              for (var i = 0; i < items.length; ++i) {
                observer.next(items[i]);
                if (observer.closed) return;
              }

              observer.complete();
            });
          });
        }
      }, {
        key: SymbolSpecies,
        get: function () {
          return this;
        }
      }]);

      return Observable;
    }();

    exports.Observable = Observable;

    if (hasSymbols()) {
      Object.defineProperty(Observable, Symbol('extensions'), {
        value: {
          symbol: SymbolObservable,
          hostReportError: hostReportError
        },
        configurable: true
      });
    }
    });

    unwrapExports(Observable_1);
    var Observable_2 = Observable_1.Observable;

    var zenObservable = Observable_1.Observable;

    var Observable = zenObservable;

    function validateOperation(operation) {
        var OPERATION_FIELDS = [
            'query',
            'operationName',
            'variables',
            'extensions',
            'context',
        ];
        for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
            var key = _a[_i];
            if (OPERATION_FIELDS.indexOf(key) < 0) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(2) : new InvariantError("illegal argument: " + key);
            }
        }
        return operation;
    }
    var LinkError = (function (_super) {
        __extends(LinkError, _super);
        function LinkError(message, link) {
            var _this = _super.call(this, message) || this;
            _this.link = link;
            return _this;
        }
        return LinkError;
    }(Error));
    function isTerminating(link) {
        return link.request.length <= 1;
    }
    function fromError(errorValue) {
        return new Observable(function (observer) {
            observer.error(errorValue);
        });
    }
    function transformOperation(operation) {
        var transformedOperation = {
            variables: operation.variables || {},
            extensions: operation.extensions || {},
            operationName: operation.operationName,
            query: operation.query,
        };
        if (!transformedOperation.operationName) {
            transformedOperation.operationName =
                typeof transformedOperation.query !== 'string'
                    ? getOperationName(transformedOperation.query)
                    : '';
        }
        return transformedOperation;
    }
    function createOperation(starting, operation) {
        var context = __assign({}, starting);
        var setContext = function (next) {
            if (typeof next === 'function') {
                context = __assign({}, context, next(context));
            }
            else {
                context = __assign({}, context, next);
            }
        };
        var getContext = function () { return (__assign({}, context)); };
        Object.defineProperty(operation, 'setContext', {
            enumerable: false,
            value: setContext,
        });
        Object.defineProperty(operation, 'getContext', {
            enumerable: false,
            value: getContext,
        });
        Object.defineProperty(operation, 'toKey', {
            enumerable: false,
            value: function () { return getKey(operation); },
        });
        return operation;
    }
    function getKey(operation) {
        var query = operation.query, variables = operation.variables, operationName = operation.operationName;
        return JSON.stringify([operationName, query, variables]);
    }

    function passthrough(op, forward) {
        return forward ? forward(op) : Observable.of();
    }
    function toLink(handler) {
        return typeof handler === 'function' ? new ApolloLink(handler) : handler;
    }
    function empty$1() {
        return new ApolloLink(function () { return Observable.of(); });
    }
    function from(links) {
        if (links.length === 0)
            return empty$1();
        return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
    }
    function split(test, left, right) {
        var leftLink = toLink(left);
        var rightLink = toLink(right || new ApolloLink(passthrough));
        if (isTerminating(leftLink) && isTerminating(rightLink)) {
            return new ApolloLink(function (operation) {
                return test(operation)
                    ? leftLink.request(operation) || Observable.of()
                    : rightLink.request(operation) || Observable.of();
            });
        }
        else {
            return new ApolloLink(function (operation, forward) {
                return test(operation)
                    ? leftLink.request(operation, forward) || Observable.of()
                    : rightLink.request(operation, forward) || Observable.of();
            });
        }
    }
    var concat = function (first, second) {
        var firstLink = toLink(first);
        if (isTerminating(firstLink)) {
            process.env.NODE_ENV === "production" || invariant.warn(new LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
            return firstLink;
        }
        var nextLink = toLink(second);
        if (isTerminating(nextLink)) {
            return new ApolloLink(function (operation) {
                return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable.of(); }) || Observable.of();
            });
        }
        else {
            return new ApolloLink(function (operation, forward) {
                return (firstLink.request(operation, function (op) {
                    return nextLink.request(op, forward) || Observable.of();
                }) || Observable.of());
            });
        }
    };
    var ApolloLink = (function () {
        function ApolloLink(request) {
            if (request)
                this.request = request;
        }
        ApolloLink.prototype.split = function (test, left, right) {
            return this.concat(split(test, left, right || new ApolloLink(passthrough)));
        };
        ApolloLink.prototype.concat = function (next) {
            return concat(this, next);
        };
        ApolloLink.prototype.request = function (operation, forward) {
            throw process.env.NODE_ENV === "production" ? new InvariantError(1) : new InvariantError('request is not implemented');
        };
        ApolloLink.empty = empty$1;
        ApolloLink.from = from;
        ApolloLink.split = split;
        ApolloLink.execute = execute;
        return ApolloLink;
    }());
    function execute(link, operation) {
        return (link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || Observable.of());
    }

    function symbolObservablePonyfill(root) {
    	var result;
    	var Symbol = root.Symbol;

    	if (typeof Symbol === 'function') {
    		if (Symbol.observable) {
    			result = Symbol.observable;
    		} else {
    			result = Symbol('observable');
    			Symbol.observable = result;
    		}
    	} else {
    		result = '@@observable';
    	}

    	return result;
    }

    /* global window */

    var root;

    if (typeof self !== 'undefined') {
      root = self;
    } else if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof module !== 'undefined') {
      root = module;
    } else {
      root = Function('return this')();
    }

    var result = symbolObservablePonyfill(root);

    var NetworkStatus;
    (function (NetworkStatus) {
        NetworkStatus[NetworkStatus["loading"] = 1] = "loading";
        NetworkStatus[NetworkStatus["setVariables"] = 2] = "setVariables";
        NetworkStatus[NetworkStatus["fetchMore"] = 3] = "fetchMore";
        NetworkStatus[NetworkStatus["refetch"] = 4] = "refetch";
        NetworkStatus[NetworkStatus["poll"] = 6] = "poll";
        NetworkStatus[NetworkStatus["ready"] = 7] = "ready";
        NetworkStatus[NetworkStatus["error"] = 8] = "error";
    })(NetworkStatus || (NetworkStatus = {}));
    function isNetworkRequestInFlight(networkStatus) {
        return networkStatus < 7;
    }

    var Observable$1 = (function (_super) {
        __extends(Observable, _super);
        function Observable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Observable.prototype[result] = function () {
            return this;
        };
        Observable.prototype['@@observable'] = function () {
            return this;
        };
        return Observable;
    }(Observable));

    function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
    }

    function isApolloError(err) {
        return err.hasOwnProperty('graphQLErrors');
    }
    var generateErrorMessage = function (err) {
        var message = '';
        if (isNonEmptyArray(err.graphQLErrors)) {
            err.graphQLErrors.forEach(function (graphQLError) {
                var errorMessage = graphQLError
                    ? graphQLError.message
                    : 'Error message not found.';
                message += "GraphQL error: " + errorMessage + "\n";
            });
        }
        if (err.networkError) {
            message += 'Network error: ' + err.networkError.message + '\n';
        }
        message = message.replace(/\n$/, '');
        return message;
    };
    var ApolloError = (function (_super) {
        __extends(ApolloError, _super);
        function ApolloError(_a) {
            var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError, errorMessage = _a.errorMessage, extraInfo = _a.extraInfo;
            var _this = _super.call(this, errorMessage) || this;
            _this.graphQLErrors = graphQLErrors || [];
            _this.networkError = networkError || null;
            if (!errorMessage) {
                _this.message = generateErrorMessage(_this);
            }
            else {
                _this.message = errorMessage;
            }
            _this.extraInfo = extraInfo;
            _this.__proto__ = ApolloError.prototype;
            return _this;
        }
        return ApolloError;
    }(Error));

    var FetchType;
    (function (FetchType) {
        FetchType[FetchType["normal"] = 1] = "normal";
        FetchType[FetchType["refetch"] = 2] = "refetch";
        FetchType[FetchType["poll"] = 3] = "poll";
    })(FetchType || (FetchType = {}));

    var hasError = function (storeValue, policy) {
        if (policy === void 0) { policy = 'none'; }
        return storeValue && (storeValue.networkError ||
            (policy === 'none' && isNonEmptyArray(storeValue.graphQLErrors)));
    };
    var ObservableQuery = (function (_super) {
        __extends(ObservableQuery, _super);
        function ObservableQuery(_a) {
            var queryManager = _a.queryManager, options = _a.options, _b = _a.shouldSubscribe, shouldSubscribe = _b === void 0 ? true : _b;
            var _this = _super.call(this, function (observer) {
                return _this.onSubscribe(observer);
            }) || this;
            _this.observers = new Set();
            _this.subscriptions = new Set();
            _this.isTornDown = false;
            _this.options = options;
            _this.variables = options.variables || {};
            _this.queryId = queryManager.generateQueryId();
            _this.shouldSubscribe = shouldSubscribe;
            var opDef = getOperationDefinition(options.query);
            _this.queryName = opDef && opDef.name && opDef.name.value;
            _this.queryManager = queryManager;
            return _this;
        }
        ObservableQuery.prototype.result = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var observer = {
                    next: function (result) {
                        resolve(result);
                        _this.observers.delete(observer);
                        if (!_this.observers.size) {
                            _this.queryManager.removeQuery(_this.queryId);
                        }
                        setTimeout(function () {
                            subscription.unsubscribe();
                        }, 0);
                    },
                    error: reject,
                };
                var subscription = _this.subscribe(observer);
            });
        };
        ObservableQuery.prototype.currentResult = function () {
            var result = this.getCurrentResult();
            if (result.data === undefined) {
                result.data = {};
            }
            return result;
        };
        ObservableQuery.prototype.getCurrentResult = function () {
            if (this.isTornDown) {
                var lastResult = this.lastResult;
                return {
                    data: !this.lastError && lastResult && lastResult.data || void 0,
                    error: this.lastError,
                    loading: false,
                    networkStatus: NetworkStatus.error,
                };
            }
            var _a = this.queryManager.getCurrentQueryResult(this), data = _a.data, partial = _a.partial;
            var queryStoreValue = this.queryManager.queryStore.get(this.queryId);
            var result;
            var fetchPolicy = this.options.fetchPolicy;
            var isNetworkFetchPolicy = fetchPolicy === 'network-only' ||
                fetchPolicy === 'no-cache';
            if (queryStoreValue) {
                var networkStatus = queryStoreValue.networkStatus;
                if (hasError(queryStoreValue, this.options.errorPolicy)) {
                    return {
                        data: void 0,
                        loading: false,
                        networkStatus: networkStatus,
                        error: new ApolloError({
                            graphQLErrors: queryStoreValue.graphQLErrors,
                            networkError: queryStoreValue.networkError,
                        }),
                    };
                }
                if (queryStoreValue.variables) {
                    this.options.variables = __assign(__assign({}, this.options.variables), queryStoreValue.variables);
                    this.variables = this.options.variables;
                }
                result = {
                    data: data,
                    loading: isNetworkRequestInFlight(networkStatus),
                    networkStatus: networkStatus,
                };
                if (queryStoreValue.graphQLErrors && this.options.errorPolicy === 'all') {
                    result.errors = queryStoreValue.graphQLErrors;
                }
            }
            else {
                var loading = isNetworkFetchPolicy ||
                    (partial && fetchPolicy !== 'cache-only');
                result = {
                    data: data,
                    loading: loading,
                    networkStatus: loading ? NetworkStatus.loading : NetworkStatus.ready,
                };
            }
            if (!partial) {
                this.updateLastResult(__assign(__assign({}, result), { stale: false }));
            }
            return __assign(__assign({}, result), { partial: partial });
        };
        ObservableQuery.prototype.isDifferentFromLastResult = function (newResult) {
            var snapshot = this.lastResultSnapshot;
            return !(snapshot &&
                newResult &&
                snapshot.networkStatus === newResult.networkStatus &&
                snapshot.stale === newResult.stale &&
                equal(snapshot.data, newResult.data));
        };
        ObservableQuery.prototype.getLastResult = function () {
            return this.lastResult;
        };
        ObservableQuery.prototype.getLastError = function () {
            return this.lastError;
        };
        ObservableQuery.prototype.resetLastResults = function () {
            delete this.lastResult;
            delete this.lastResultSnapshot;
            delete this.lastError;
            this.isTornDown = false;
        };
        ObservableQuery.prototype.resetQueryStoreErrors = function () {
            var queryStore = this.queryManager.queryStore.get(this.queryId);
            if (queryStore) {
                queryStore.networkError = null;
                queryStore.graphQLErrors = [];
            }
        };
        ObservableQuery.prototype.refetch = function (variables) {
            var fetchPolicy = this.options.fetchPolicy;
            if (fetchPolicy === 'cache-only') {
                return Promise.reject(process.env.NODE_ENV === "production" ? new InvariantError(3) : new InvariantError('cache-only fetchPolicy option should not be used together with query refetch.'));
            }
            if (fetchPolicy !== 'no-cache' &&
                fetchPolicy !== 'cache-and-network') {
                fetchPolicy = 'network-only';
            }
            if (!equal(this.variables, variables)) {
                this.variables = __assign(__assign({}, this.variables), variables);
            }
            if (!equal(this.options.variables, this.variables)) {
                this.options.variables = __assign(__assign({}, this.options.variables), this.variables);
            }
            return this.queryManager.fetchQuery(this.queryId, __assign(__assign({}, this.options), { fetchPolicy: fetchPolicy }), FetchType.refetch);
        };
        ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
            var _this = this;
            process.env.NODE_ENV === "production" ? invariant(fetchMoreOptions.updateQuery, 4) : invariant(fetchMoreOptions.updateQuery, 'updateQuery option is required. This function defines how to update the query data with the new results.');
            var combinedOptions = __assign(__assign({}, (fetchMoreOptions.query ? fetchMoreOptions : __assign(__assign(__assign({}, this.options), fetchMoreOptions), { variables: __assign(__assign({}, this.variables), fetchMoreOptions.variables) }))), { fetchPolicy: 'network-only' });
            var qid = this.queryManager.generateQueryId();
            return this.queryManager
                .fetchQuery(qid, combinedOptions, FetchType.normal, this.queryId)
                .then(function (fetchMoreResult) {
                _this.updateQuery(function (previousResult) {
                    return fetchMoreOptions.updateQuery(previousResult, {
                        fetchMoreResult: fetchMoreResult.data,
                        variables: combinedOptions.variables,
                    });
                });
                _this.queryManager.stopQuery(qid);
                return fetchMoreResult;
            }, function (error) {
                _this.queryManager.stopQuery(qid);
                throw error;
            });
        };
        ObservableQuery.prototype.subscribeToMore = function (options) {
            var _this = this;
            var subscription = this.queryManager
                .startGraphQLSubscription({
                query: options.document,
                variables: options.variables,
            })
                .subscribe({
                next: function (subscriptionData) {
                    var updateQuery = options.updateQuery;
                    if (updateQuery) {
                        _this.updateQuery(function (previous, _a) {
                            var variables = _a.variables;
                            return updateQuery(previous, {
                                subscriptionData: subscriptionData,
                                variables: variables,
                            });
                        });
                    }
                },
                error: function (err) {
                    if (options.onError) {
                        options.onError(err);
                        return;
                    }
                    process.env.NODE_ENV === "production" || invariant.error('Unhandled GraphQL subscription error', err);
                },
            });
            this.subscriptions.add(subscription);
            return function () {
                if (_this.subscriptions.delete(subscription)) {
                    subscription.unsubscribe();
                }
            };
        };
        ObservableQuery.prototype.setOptions = function (opts) {
            var oldFetchPolicy = this.options.fetchPolicy;
            this.options = __assign(__assign({}, this.options), opts);
            if (opts.pollInterval) {
                this.startPolling(opts.pollInterval);
            }
            else if (opts.pollInterval === 0) {
                this.stopPolling();
            }
            var fetchPolicy = opts.fetchPolicy;
            return this.setVariables(this.options.variables, oldFetchPolicy !== fetchPolicy && (oldFetchPolicy === 'cache-only' ||
                oldFetchPolicy === 'standby' ||
                fetchPolicy === 'network-only'), opts.fetchResults);
        };
        ObservableQuery.prototype.setVariables = function (variables, tryFetch, fetchResults) {
            if (tryFetch === void 0) { tryFetch = false; }
            if (fetchResults === void 0) { fetchResults = true; }
            this.isTornDown = false;
            variables = variables || this.variables;
            if (!tryFetch && equal(variables, this.variables)) {
                return this.observers.size && fetchResults
                    ? this.result()
                    : Promise.resolve();
            }
            this.variables = this.options.variables = variables;
            if (!this.observers.size) {
                return Promise.resolve();
            }
            return this.queryManager.fetchQuery(this.queryId, this.options);
        };
        ObservableQuery.prototype.updateQuery = function (mapFn) {
            var queryManager = this.queryManager;
            var _a = queryManager.getQueryWithPreviousResult(this.queryId), previousResult = _a.previousResult, variables = _a.variables, document = _a.document;
            var newResult = tryFunctionOrLogError(function () {
                return mapFn(previousResult, { variables: variables });
            });
            if (newResult) {
                queryManager.dataStore.markUpdateQueryResult(document, variables, newResult);
                queryManager.broadcastQueries();
            }
        };
        ObservableQuery.prototype.stopPolling = function () {
            this.queryManager.stopPollingQuery(this.queryId);
            this.options.pollInterval = undefined;
        };
        ObservableQuery.prototype.startPolling = function (pollInterval) {
            assertNotCacheFirstOrOnly(this);
            this.options.pollInterval = pollInterval;
            this.queryManager.startPollingQuery(this.options, this.queryId);
        };
        ObservableQuery.prototype.updateLastResult = function (newResult) {
            var previousResult = this.lastResult;
            this.lastResult = newResult;
            this.lastResultSnapshot = this.queryManager.assumeImmutableResults
                ? newResult
                : cloneDeep(newResult);
            return previousResult;
        };
        ObservableQuery.prototype.onSubscribe = function (observer) {
            var _this = this;
            try {
                var subObserver = observer._subscription._observer;
                if (subObserver && !subObserver.error) {
                    subObserver.error = defaultSubscriptionObserverErrorCallback;
                }
            }
            catch (_a) { }
            var first = !this.observers.size;
            this.observers.add(observer);
            if (observer.next && this.lastResult)
                observer.next(this.lastResult);
            if (observer.error && this.lastError)
                observer.error(this.lastError);
            if (first) {
                this.setUpQuery();
            }
            return function () {
                if (_this.observers.delete(observer) && !_this.observers.size) {
                    _this.tearDownQuery();
                }
            };
        };
        ObservableQuery.prototype.setUpQuery = function () {
            var _this = this;
            var _a = this, queryManager = _a.queryManager, queryId = _a.queryId;
            if (this.shouldSubscribe) {
                queryManager.addObservableQuery(queryId, this);
            }
            if (this.options.pollInterval) {
                assertNotCacheFirstOrOnly(this);
                queryManager.startPollingQuery(this.options, queryId);
            }
            var onError = function (error) {
                _this.updateLastResult(__assign(__assign({}, _this.lastResult), { errors: error.graphQLErrors, networkStatus: NetworkStatus.error, loading: false }));
                iterateObserversSafely(_this.observers, 'error', _this.lastError = error);
            };
            queryManager.observeQuery(queryId, this.options, {
                next: function (result) {
                    if (_this.lastError || _this.isDifferentFromLastResult(result)) {
                        var previousResult_1 = _this.updateLastResult(result);
                        var _a = _this.options, query_1 = _a.query, variables = _a.variables, fetchPolicy_1 = _a.fetchPolicy;
                        if (queryManager.transform(query_1).hasClientExports) {
                            queryManager.getLocalState().addExportedVariables(query_1, variables).then(function (variables) {
                                var previousVariables = _this.variables;
                                _this.variables = _this.options.variables = variables;
                                if (!result.loading &&
                                    previousResult_1 &&
                                    fetchPolicy_1 !== 'cache-only' &&
                                    queryManager.transform(query_1).serverQuery &&
                                    !equal(previousVariables, variables)) {
                                    _this.refetch();
                                }
                                else {
                                    iterateObserversSafely(_this.observers, 'next', result);
                                }
                            });
                        }
                        else {
                            iterateObserversSafely(_this.observers, 'next', result);
                        }
                    }
                },
                error: onError,
            }).catch(onError);
        };
        ObservableQuery.prototype.tearDownQuery = function () {
            var queryManager = this.queryManager;
            this.isTornDown = true;
            queryManager.stopPollingQuery(this.queryId);
            this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
            this.subscriptions.clear();
            queryManager.removeObservableQuery(this.queryId);
            queryManager.stopQuery(this.queryId);
            this.observers.clear();
        };
        return ObservableQuery;
    }(Observable$1));
    function defaultSubscriptionObserverErrorCallback(error) {
        process.env.NODE_ENV === "production" || invariant.error('Unhandled error', error.message, error.stack);
    }
    function iterateObserversSafely(observers, method, argument) {
        var observersWithMethod = [];
        observers.forEach(function (obs) { return obs[method] && observersWithMethod.push(obs); });
        observersWithMethod.forEach(function (obs) { return obs[method](argument); });
    }
    function assertNotCacheFirstOrOnly(obsQuery) {
        var fetchPolicy = obsQuery.options.fetchPolicy;
        process.env.NODE_ENV === "production" ? invariant(fetchPolicy !== 'cache-first' && fetchPolicy !== 'cache-only', 5) : invariant(fetchPolicy !== 'cache-first' && fetchPolicy !== 'cache-only', 'Queries that specify the cache-first and cache-only fetchPolicies cannot also be polling queries.');
    }

    var MutationStore = (function () {
        function MutationStore() {
            this.store = {};
        }
        MutationStore.prototype.getStore = function () {
            return this.store;
        };
        MutationStore.prototype.get = function (mutationId) {
            return this.store[mutationId];
        };
        MutationStore.prototype.initMutation = function (mutationId, mutation, variables) {
            this.store[mutationId] = {
                mutation: mutation,
                variables: variables || {},
                loading: true,
                error: null,
            };
        };
        MutationStore.prototype.markMutationError = function (mutationId, error) {
            var mutation = this.store[mutationId];
            if (mutation) {
                mutation.loading = false;
                mutation.error = error;
            }
        };
        MutationStore.prototype.markMutationResult = function (mutationId) {
            var mutation = this.store[mutationId];
            if (mutation) {
                mutation.loading = false;
                mutation.error = null;
            }
        };
        MutationStore.prototype.reset = function () {
            this.store = {};
        };
        return MutationStore;
    }());

    var QueryStore = (function () {
        function QueryStore() {
            this.store = {};
        }
        QueryStore.prototype.getStore = function () {
            return this.store;
        };
        QueryStore.prototype.get = function (queryId) {
            return this.store[queryId];
        };
        QueryStore.prototype.initQuery = function (query) {
            var previousQuery = this.store[query.queryId];
            process.env.NODE_ENV === "production" ? invariant(!previousQuery ||
                previousQuery.document === query.document ||
                equal(previousQuery.document, query.document), 19) : invariant(!previousQuery ||
                previousQuery.document === query.document ||
                equal(previousQuery.document, query.document), 'Internal Error: may not update existing query string in store');
            var isSetVariables = false;
            var previousVariables = null;
            if (query.storePreviousVariables &&
                previousQuery &&
                previousQuery.networkStatus !== NetworkStatus.loading) {
                if (!equal(previousQuery.variables, query.variables)) {
                    isSetVariables = true;
                    previousVariables = previousQuery.variables;
                }
            }
            var networkStatus;
            if (isSetVariables) {
                networkStatus = NetworkStatus.setVariables;
            }
            else if (query.isPoll) {
                networkStatus = NetworkStatus.poll;
            }
            else if (query.isRefetch) {
                networkStatus = NetworkStatus.refetch;
            }
            else {
                networkStatus = NetworkStatus.loading;
            }
            var graphQLErrors = [];
            if (previousQuery && previousQuery.graphQLErrors) {
                graphQLErrors = previousQuery.graphQLErrors;
            }
            this.store[query.queryId] = {
                document: query.document,
                variables: query.variables,
                previousVariables: previousVariables,
                networkError: null,
                graphQLErrors: graphQLErrors,
                networkStatus: networkStatus,
                metadata: query.metadata,
            };
            if (typeof query.fetchMoreForQueryId === 'string' &&
                this.store[query.fetchMoreForQueryId]) {
                this.store[query.fetchMoreForQueryId].networkStatus =
                    NetworkStatus.fetchMore;
            }
        };
        QueryStore.prototype.markQueryResult = function (queryId, result, fetchMoreForQueryId) {
            if (!this.store || !this.store[queryId])
                return;
            this.store[queryId].networkError = null;
            this.store[queryId].graphQLErrors = isNonEmptyArray(result.errors) ? result.errors : [];
            this.store[queryId].previousVariables = null;
            this.store[queryId].networkStatus = NetworkStatus.ready;
            if (typeof fetchMoreForQueryId === 'string' &&
                this.store[fetchMoreForQueryId]) {
                this.store[fetchMoreForQueryId].networkStatus = NetworkStatus.ready;
            }
        };
        QueryStore.prototype.markQueryError = function (queryId, error, fetchMoreForQueryId) {
            if (!this.store || !this.store[queryId])
                return;
            this.store[queryId].networkError = error;
            this.store[queryId].networkStatus = NetworkStatus.error;
            if (typeof fetchMoreForQueryId === 'string') {
                this.markQueryResultClient(fetchMoreForQueryId, true);
            }
        };
        QueryStore.prototype.markQueryResultClient = function (queryId, complete) {
            var storeValue = this.store && this.store[queryId];
            if (storeValue) {
                storeValue.networkError = null;
                storeValue.previousVariables = null;
                if (complete) {
                    storeValue.networkStatus = NetworkStatus.ready;
                }
            }
        };
        QueryStore.prototype.stopQuery = function (queryId) {
            delete this.store[queryId];
        };
        QueryStore.prototype.reset = function (observableQueryIds) {
            var _this = this;
            Object.keys(this.store).forEach(function (queryId) {
                if (observableQueryIds.indexOf(queryId) < 0) {
                    _this.stopQuery(queryId);
                }
                else {
                    _this.store[queryId].networkStatus = NetworkStatus.loading;
                }
            });
        };
        return QueryStore;
    }());

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    var LocalState = (function () {
        function LocalState(_a) {
            var cache = _a.cache, client = _a.client, resolvers = _a.resolvers, fragmentMatcher = _a.fragmentMatcher;
            this.cache = cache;
            if (client) {
                this.client = client;
            }
            if (resolvers) {
                this.addResolvers(resolvers);
            }
            if (fragmentMatcher) {
                this.setFragmentMatcher(fragmentMatcher);
            }
        }
        LocalState.prototype.addResolvers = function (resolvers) {
            var _this = this;
            this.resolvers = this.resolvers || {};
            if (Array.isArray(resolvers)) {
                resolvers.forEach(function (resolverGroup) {
                    _this.resolvers = mergeDeep(_this.resolvers, resolverGroup);
                });
            }
            else {
                this.resolvers = mergeDeep(this.resolvers, resolvers);
            }
        };
        LocalState.prototype.setResolvers = function (resolvers) {
            this.resolvers = {};
            this.addResolvers(resolvers);
        };
        LocalState.prototype.getResolvers = function () {
            return this.resolvers || {};
        };
        LocalState.prototype.runResolvers = function (_a) {
            var document = _a.document, remoteResult = _a.remoteResult, context = _a.context, variables = _a.variables, _b = _a.onlyRunForcedResolvers, onlyRunForcedResolvers = _b === void 0 ? false : _b;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_c) {
                    if (document) {
                        return [2, this.resolveDocument(document, remoteResult.data, context, variables, this.fragmentMatcher, onlyRunForcedResolvers).then(function (localResult) { return (__assign(__assign({}, remoteResult), { data: localResult.result })); })];
                    }
                    return [2, remoteResult];
                });
            });
        };
        LocalState.prototype.setFragmentMatcher = function (fragmentMatcher) {
            this.fragmentMatcher = fragmentMatcher;
        };
        LocalState.prototype.getFragmentMatcher = function () {
            return this.fragmentMatcher;
        };
        LocalState.prototype.clientQuery = function (document) {
            if (hasDirectives(['client'], document)) {
                if (this.resolvers) {
                    return document;
                }
                process.env.NODE_ENV === "production" || invariant.warn('Found @client directives in a query but no ApolloClient resolvers ' +
                    'were specified. This means ApolloClient local resolver handling ' +
                    'has been disabled, and @client directives will be passed through ' +
                    'to your link chain.');
            }
            return null;
        };
        LocalState.prototype.serverQuery = function (document) {
            return this.resolvers ? removeClientSetsFromDocument(document) : document;
        };
        LocalState.prototype.prepareContext = function (context) {
            if (context === void 0) { context = {}; }
            var cache = this.cache;
            var newContext = __assign(__assign({}, context), { cache: cache, getCacheKey: function (obj) {
                    if (cache.config) {
                        return cache.config.dataIdFromObject(obj);
                    }
                    else {
                        process.env.NODE_ENV === "production" ? invariant(false, 6) : invariant(false, 'To use context.getCacheKey, you need to use a cache that has ' +
                            'a configurable dataIdFromObject, like apollo-cache-inmemory.');
                    }
                } });
            return newContext;
        };
        LocalState.prototype.addExportedVariables = function (document, variables, context) {
            if (variables === void 0) { variables = {}; }
            if (context === void 0) { context = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (document) {
                        return [2, this.resolveDocument(document, this.buildRootValueFromCache(document, variables) || {}, this.prepareContext(context), variables).then(function (data) { return (__assign(__assign({}, variables), data.exportedVariables)); })];
                    }
                    return [2, __assign({}, variables)];
                });
            });
        };
        LocalState.prototype.shouldForceResolvers = function (document) {
            var forceResolvers = false;
            visit(document, {
                Directive: {
                    enter: function (node) {
                        if (node.name.value === 'client' && node.arguments) {
                            forceResolvers = node.arguments.some(function (arg) {
                                return arg.name.value === 'always' &&
                                    arg.value.kind === 'BooleanValue' &&
                                    arg.value.value === true;
                            });
                            if (forceResolvers) {
                                return BREAK;
                            }
                        }
                    },
                },
            });
            return forceResolvers;
        };
        LocalState.prototype.buildRootValueFromCache = function (document, variables) {
            return this.cache.diff({
                query: buildQueryFromSelectionSet(document),
                variables: variables,
                returnPartialData: true,
                optimistic: false,
            }).result;
        };
        LocalState.prototype.resolveDocument = function (document, rootValue, context, variables, fragmentMatcher, onlyRunForcedResolvers) {
            if (context === void 0) { context = {}; }
            if (variables === void 0) { variables = {}; }
            if (fragmentMatcher === void 0) { fragmentMatcher = function () { return true; }; }
            if (onlyRunForcedResolvers === void 0) { onlyRunForcedResolvers = false; }
            return __awaiter(this, void 0, void 0, function () {
                var mainDefinition, fragments, fragmentMap, definitionOperation, defaultOperationType, _a, cache, client, execContext;
                return __generator(this, function (_b) {
                    mainDefinition = getMainDefinition(document);
                    fragments = getFragmentDefinitions(document);
                    fragmentMap = createFragmentMap(fragments);
                    definitionOperation = mainDefinition
                        .operation;
                    defaultOperationType = definitionOperation
                        ? capitalizeFirstLetter(definitionOperation)
                        : 'Query';
                    _a = this, cache = _a.cache, client = _a.client;
                    execContext = {
                        fragmentMap: fragmentMap,
                        context: __assign(__assign({}, context), { cache: cache,
                            client: client }),
                        variables: variables,
                        fragmentMatcher: fragmentMatcher,
                        defaultOperationType: defaultOperationType,
                        exportedVariables: {},
                        onlyRunForcedResolvers: onlyRunForcedResolvers,
                    };
                    return [2, this.resolveSelectionSet(mainDefinition.selectionSet, rootValue, execContext).then(function (result) { return ({
                            result: result,
                            exportedVariables: execContext.exportedVariables,
                        }); })];
                });
            });
        };
        LocalState.prototype.resolveSelectionSet = function (selectionSet, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var fragmentMap, context, variables, resultsToMerge, execute;
                var _this = this;
                return __generator(this, function (_a) {
                    fragmentMap = execContext.fragmentMap, context = execContext.context, variables = execContext.variables;
                    resultsToMerge = [rootValue];
                    execute = function (selection) { return __awaiter(_this, void 0, void 0, function () {
                        var fragment, typeCondition;
                        return __generator(this, function (_a) {
                            if (!shouldInclude(selection, variables)) {
                                return [2];
                            }
                            if (isField(selection)) {
                                return [2, this.resolveField(selection, rootValue, execContext).then(function (fieldResult) {
                                        var _a;
                                        if (typeof fieldResult !== 'undefined') {
                                            resultsToMerge.push((_a = {},
                                                _a[resultKeyNameFromField(selection)] = fieldResult,
                                                _a));
                                        }
                                    })];
                            }
                            if (isInlineFragment(selection)) {
                                fragment = selection;
                            }
                            else {
                                fragment = fragmentMap[selection.name.value];
                                process.env.NODE_ENV === "production" ? invariant(fragment, 7) : invariant(fragment, "No fragment named " + selection.name.value);
                            }
                            if (fragment && fragment.typeCondition) {
                                typeCondition = fragment.typeCondition.name.value;
                                if (execContext.fragmentMatcher(rootValue, typeCondition, context)) {
                                    return [2, this.resolveSelectionSet(fragment.selectionSet, rootValue, execContext).then(function (fragmentResult) {
                                            resultsToMerge.push(fragmentResult);
                                        })];
                                }
                            }
                            return [2];
                        });
                    }); };
                    return [2, Promise.all(selectionSet.selections.map(execute)).then(function () {
                            return mergeDeepArray(resultsToMerge);
                        })];
                });
            });
        };
        LocalState.prototype.resolveField = function (field, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var variables, fieldName, aliasedFieldName, aliasUsed, defaultResult, resultPromise, resolverType, resolverMap, resolve;
                var _this = this;
                return __generator(this, function (_a) {
                    variables = execContext.variables;
                    fieldName = field.name.value;
                    aliasedFieldName = resultKeyNameFromField(field);
                    aliasUsed = fieldName !== aliasedFieldName;
                    defaultResult = rootValue[aliasedFieldName] || rootValue[fieldName];
                    resultPromise = Promise.resolve(defaultResult);
                    if (!execContext.onlyRunForcedResolvers ||
                        this.shouldForceResolvers(field)) {
                        resolverType = rootValue.__typename || execContext.defaultOperationType;
                        resolverMap = this.resolvers && this.resolvers[resolverType];
                        if (resolverMap) {
                            resolve = resolverMap[aliasUsed ? fieldName : aliasedFieldName];
                            if (resolve) {
                                resultPromise = Promise.resolve(resolve(rootValue, argumentsObjectFromField(field, variables), execContext.context, { field: field, fragmentMap: execContext.fragmentMap }));
                            }
                        }
                    }
                    return [2, resultPromise.then(function (result) {
                            if (result === void 0) { result = defaultResult; }
                            if (field.directives) {
                                field.directives.forEach(function (directive) {
                                    if (directive.name.value === 'export' && directive.arguments) {
                                        directive.arguments.forEach(function (arg) {
                                            if (arg.name.value === 'as' && arg.value.kind === 'StringValue') {
                                                execContext.exportedVariables[arg.value.value] = result;
                                            }
                                        });
                                    }
                                });
                            }
                            if (!field.selectionSet) {
                                return result;
                            }
                            if (result == null) {
                                return result;
                            }
                            if (Array.isArray(result)) {
                                return _this.resolveSubSelectedArray(field, result, execContext);
                            }
                            if (field.selectionSet) {
                                return _this.resolveSelectionSet(field.selectionSet, result, execContext);
                            }
                        })];
                });
            });
        };
        LocalState.prototype.resolveSubSelectedArray = function (field, result, execContext) {
            var _this = this;
            return Promise.all(result.map(function (item) {
                if (item === null) {
                    return null;
                }
                if (Array.isArray(item)) {
                    return _this.resolveSubSelectedArray(field, item, execContext);
                }
                if (field.selectionSet) {
                    return _this.resolveSelectionSet(field.selectionSet, item, execContext);
                }
            }));
        };
        return LocalState;
    }());

    function multiplex(inner) {
        var observers = new Set();
        var sub = null;
        return new Observable$1(function (observer) {
            observers.add(observer);
            sub = sub || inner.subscribe({
                next: function (value) {
                    observers.forEach(function (obs) { return obs.next && obs.next(value); });
                },
                error: function (error) {
                    observers.forEach(function (obs) { return obs.error && obs.error(error); });
                },
                complete: function () {
                    observers.forEach(function (obs) { return obs.complete && obs.complete(); });
                },
            });
            return function () {
                if (observers.delete(observer) && !observers.size && sub) {
                    sub.unsubscribe();
                    sub = null;
                }
            };
        });
    }
    function asyncMap(observable, mapFn) {
        return new Observable$1(function (observer) {
            var next = observer.next, error = observer.error, complete = observer.complete;
            var activeNextCount = 0;
            var completed = false;
            var handler = {
                next: function (value) {
                    ++activeNextCount;
                    new Promise(function (resolve) {
                        resolve(mapFn(value));
                    }).then(function (result) {
                        --activeNextCount;
                        next && next.call(observer, result);
                        completed && handler.complete();
                    }, function (e) {
                        --activeNextCount;
                        error && error.call(observer, e);
                    });
                },
                error: function (e) {
                    error && error.call(observer, e);
                },
                complete: function () {
                    completed = true;
                    if (!activeNextCount) {
                        complete && complete.call(observer);
                    }
                },
            };
            var sub = observable.subscribe(handler);
            return function () { return sub.unsubscribe(); };
        });
    }

    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
    var QueryManager = (function () {
        function QueryManager(_a) {
            var link = _a.link, _b = _a.queryDeduplication, queryDeduplication = _b === void 0 ? false : _b, store = _a.store, _c = _a.onBroadcast, onBroadcast = _c === void 0 ? function () { return undefined; } : _c, _d = _a.ssrMode, ssrMode = _d === void 0 ? false : _d, _e = _a.clientAwareness, clientAwareness = _e === void 0 ? {} : _e, localState = _a.localState, assumeImmutableResults = _a.assumeImmutableResults;
            this.mutationStore = new MutationStore();
            this.queryStore = new QueryStore();
            this.clientAwareness = {};
            this.idCounter = 1;
            this.queries = new Map();
            this.fetchQueryRejectFns = new Map();
            this.transformCache = new (canUseWeakMap ? WeakMap : Map)();
            this.inFlightLinkObservables = new Map();
            this.pollingInfoByQueryId = new Map();
            this.link = link;
            this.queryDeduplication = queryDeduplication;
            this.dataStore = store;
            this.onBroadcast = onBroadcast;
            this.clientAwareness = clientAwareness;
            this.localState = localState || new LocalState({ cache: store.getCache() });
            this.ssrMode = ssrMode;
            this.assumeImmutableResults = !!assumeImmutableResults;
        }
        QueryManager.prototype.stop = function () {
            var _this = this;
            this.queries.forEach(function (_info, queryId) {
                _this.stopQueryNoBroadcast(queryId);
            });
            this.fetchQueryRejectFns.forEach(function (reject) {
                reject(process.env.NODE_ENV === "production" ? new InvariantError(8) : new InvariantError('QueryManager stopped while query was in flight'));
            });
        };
        QueryManager.prototype.mutate = function (_a) {
            var mutation = _a.mutation, variables = _a.variables, optimisticResponse = _a.optimisticResponse, updateQueriesByName = _a.updateQueries, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? [] : _b, _c = _a.awaitRefetchQueries, awaitRefetchQueries = _c === void 0 ? false : _c, updateWithProxyFn = _a.update, _d = _a.errorPolicy, errorPolicy = _d === void 0 ? 'none' : _d, fetchPolicy = _a.fetchPolicy, _e = _a.context, context = _e === void 0 ? {} : _e;
            return __awaiter(this, void 0, void 0, function () {
                var mutationId, generateUpdateQueriesInfo, self;
                var _this = this;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            process.env.NODE_ENV === "production" ? invariant(mutation, 9) : invariant(mutation, 'mutation option is required. You must specify your GraphQL document in the mutation option.');
                            process.env.NODE_ENV === "production" ? invariant(!fetchPolicy || fetchPolicy === 'no-cache', 10) : invariant(!fetchPolicy || fetchPolicy === 'no-cache', "Mutations only support a 'no-cache' fetchPolicy. If you don't want to disable the cache, remove your fetchPolicy setting to proceed with the default mutation behavior.");
                            mutationId = this.generateQueryId();
                            mutation = this.transform(mutation).document;
                            this.setQuery(mutationId, function () { return ({ document: mutation }); });
                            variables = this.getVariables(mutation, variables);
                            if (!this.transform(mutation).hasClientExports) return [3, 2];
                            return [4, this.localState.addExportedVariables(mutation, variables, context)];
                        case 1:
                            variables = _f.sent();
                            _f.label = 2;
                        case 2:
                            generateUpdateQueriesInfo = function () {
                                var ret = {};
                                if (updateQueriesByName) {
                                    _this.queries.forEach(function (_a, queryId) {
                                        var observableQuery = _a.observableQuery;
                                        if (observableQuery) {
                                            var queryName = observableQuery.queryName;
                                            if (queryName &&
                                                hasOwnProperty$2.call(updateQueriesByName, queryName)) {
                                                ret[queryId] = {
                                                    updater: updateQueriesByName[queryName],
                                                    query: _this.queryStore.get(queryId),
                                                };
                                            }
                                        }
                                    });
                                }
                                return ret;
                            };
                            this.mutationStore.initMutation(mutationId, mutation, variables);
                            this.dataStore.markMutationInit({
                                mutationId: mutationId,
                                document: mutation,
                                variables: variables,
                                updateQueries: generateUpdateQueriesInfo(),
                                update: updateWithProxyFn,
                                optimisticResponse: optimisticResponse,
                            });
                            this.broadcastQueries();
                            self = this;
                            return [2, new Promise(function (resolve, reject) {
                                    var storeResult;
                                    var error;
                                    self.getObservableFromLink(mutation, __assign(__assign({}, context), { optimisticResponse: optimisticResponse }), variables, false).subscribe({
                                        next: function (result) {
                                            if (graphQLResultHasError(result) && errorPolicy === 'none') {
                                                error = new ApolloError({
                                                    graphQLErrors: result.errors,
                                                });
                                                return;
                                            }
                                            self.mutationStore.markMutationResult(mutationId);
                                            if (fetchPolicy !== 'no-cache') {
                                                self.dataStore.markMutationResult({
                                                    mutationId: mutationId,
                                                    result: result,
                                                    document: mutation,
                                                    variables: variables,
                                                    updateQueries: generateUpdateQueriesInfo(),
                                                    update: updateWithProxyFn,
                                                });
                                            }
                                            storeResult = result;
                                        },
                                        error: function (err) {
                                            self.mutationStore.markMutationError(mutationId, err);
                                            self.dataStore.markMutationComplete({
                                                mutationId: mutationId,
                                                optimisticResponse: optimisticResponse,
                                            });
                                            self.broadcastQueries();
                                            self.setQuery(mutationId, function () { return ({ document: null }); });
                                            reject(new ApolloError({
                                                networkError: err,
                                            }));
                                        },
                                        complete: function () {
                                            if (error) {
                                                self.mutationStore.markMutationError(mutationId, error);
                                            }
                                            self.dataStore.markMutationComplete({
                                                mutationId: mutationId,
                                                optimisticResponse: optimisticResponse,
                                            });
                                            self.broadcastQueries();
                                            if (error) {
                                                reject(error);
                                                return;
                                            }
                                            if (typeof refetchQueries === 'function') {
                                                refetchQueries = refetchQueries(storeResult);
                                            }
                                            var refetchQueryPromises = [];
                                            if (isNonEmptyArray(refetchQueries)) {
                                                refetchQueries.forEach(function (refetchQuery) {
                                                    if (typeof refetchQuery === 'string') {
                                                        self.queries.forEach(function (_a) {
                                                            var observableQuery = _a.observableQuery;
                                                            if (observableQuery &&
                                                                observableQuery.queryName === refetchQuery) {
                                                                refetchQueryPromises.push(observableQuery.refetch());
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        var queryOptions = {
                                                            query: refetchQuery.query,
                                                            variables: refetchQuery.variables,
                                                            fetchPolicy: 'network-only',
                                                        };
                                                        if (refetchQuery.context) {
                                                            queryOptions.context = refetchQuery.context;
                                                        }
                                                        refetchQueryPromises.push(self.query(queryOptions));
                                                    }
                                                });
                                            }
                                            Promise.all(awaitRefetchQueries ? refetchQueryPromises : []).then(function () {
                                                self.setQuery(mutationId, function () { return ({ document: null }); });
                                                if (errorPolicy === 'ignore' &&
                                                    storeResult &&
                                                    graphQLResultHasError(storeResult)) {
                                                    delete storeResult.errors;
                                                }
                                                resolve(storeResult);
                                            });
                                        },
                                    });
                                })];
                    }
                });
            });
        };
        QueryManager.prototype.fetchQuery = function (queryId, options, fetchType, fetchMoreForQueryId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, metadata, _b, fetchPolicy, _c, context, query, variables, storeResult, isNetworkOnly, needToFetch, _d, complete, result, shouldFetch, requestId, cancel, networkResult;
                var _this = this;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = options.metadata, metadata = _a === void 0 ? null : _a, _b = options.fetchPolicy, fetchPolicy = _b === void 0 ? 'cache-first' : _b, _c = options.context, context = _c === void 0 ? {} : _c;
                            query = this.transform(options.query).document;
                            variables = this.getVariables(query, options.variables);
                            if (!this.transform(query).hasClientExports) return [3, 2];
                            return [4, this.localState.addExportedVariables(query, variables, context)];
                        case 1:
                            variables = _e.sent();
                            _e.label = 2;
                        case 2:
                            options = __assign(__assign({}, options), { variables: variables });
                            isNetworkOnly = fetchPolicy === 'network-only' || fetchPolicy === 'no-cache';
                            needToFetch = isNetworkOnly;
                            if (!isNetworkOnly) {
                                _d = this.dataStore.getCache().diff({
                                    query: query,
                                    variables: variables,
                                    returnPartialData: true,
                                    optimistic: false,
                                }), complete = _d.complete, result = _d.result;
                                needToFetch = !complete || fetchPolicy === 'cache-and-network';
                                storeResult = result;
                            }
                            shouldFetch = needToFetch && fetchPolicy !== 'cache-only' && fetchPolicy !== 'standby';
                            if (hasDirectives(['live'], query))
                                shouldFetch = true;
                            requestId = this.idCounter++;
                            cancel = fetchPolicy !== 'no-cache'
                                ? this.updateQueryWatch(queryId, query, options)
                                : undefined;
                            this.setQuery(queryId, function () { return ({
                                document: query,
                                lastRequestId: requestId,
                                invalidated: true,
                                cancel: cancel,
                            }); });
                            this.invalidate(fetchMoreForQueryId);
                            this.queryStore.initQuery({
                                queryId: queryId,
                                document: query,
                                storePreviousVariables: shouldFetch,
                                variables: variables,
                                isPoll: fetchType === FetchType.poll,
                                isRefetch: fetchType === FetchType.refetch,
                                metadata: metadata,
                                fetchMoreForQueryId: fetchMoreForQueryId,
                            });
                            this.broadcastQueries();
                            if (shouldFetch) {
                                networkResult = this.fetchRequest({
                                    requestId: requestId,
                                    queryId: queryId,
                                    document: query,
                                    options: options,
                                    fetchMoreForQueryId: fetchMoreForQueryId,
                                }).catch(function (error) {
                                    if (isApolloError(error)) {
                                        throw error;
                                    }
                                    else {
                                        if (requestId >= _this.getQuery(queryId).lastRequestId) {
                                            _this.queryStore.markQueryError(queryId, error, fetchMoreForQueryId);
                                            _this.invalidate(queryId);
                                            _this.invalidate(fetchMoreForQueryId);
                                            _this.broadcastQueries();
                                        }
                                        throw new ApolloError({ networkError: error });
                                    }
                                });
                                if (fetchPolicy !== 'cache-and-network') {
                                    return [2, networkResult];
                                }
                                networkResult.catch(function () { });
                            }
                            this.queryStore.markQueryResultClient(queryId, !shouldFetch);
                            this.invalidate(queryId);
                            this.invalidate(fetchMoreForQueryId);
                            if (this.transform(query).hasForcedResolvers) {
                                return [2, this.localState.runResolvers({
                                        document: query,
                                        remoteResult: { data: storeResult },
                                        context: context,
                                        variables: variables,
                                        onlyRunForcedResolvers: true,
                                    }).then(function (result) {
                                        _this.markQueryResult(queryId, result, options, fetchMoreForQueryId);
                                        _this.broadcastQueries();
                                        return result;
                                    })];
                            }
                            this.broadcastQueries();
                            return [2, { data: storeResult }];
                    }
                });
            });
        };
        QueryManager.prototype.markQueryResult = function (queryId, result, _a, fetchMoreForQueryId) {
            var fetchPolicy = _a.fetchPolicy, variables = _a.variables, errorPolicy = _a.errorPolicy;
            if (fetchPolicy === 'no-cache') {
                this.setQuery(queryId, function () { return ({
                    newData: { result: result.data, complete: true },
                }); });
            }
            else {
                this.dataStore.markQueryResult(result, this.getQuery(queryId).document, variables, fetchMoreForQueryId, errorPolicy === 'ignore' || errorPolicy === 'all');
            }
        };
        QueryManager.prototype.queryListenerForObserver = function (queryId, options, observer) {
            var _this = this;
            function invoke(method, argument) {
                if (observer[method]) {
                    try {
                        observer[method](argument);
                    }
                    catch (e) {
                        process.env.NODE_ENV === "production" || invariant.error(e);
                    }
                }
                else if (method === 'error') {
                    process.env.NODE_ENV === "production" || invariant.error(argument);
                }
            }
            return function (queryStoreValue, newData) {
                _this.invalidate(queryId, false);
                if (!queryStoreValue)
                    return;
                var _a = _this.getQuery(queryId), observableQuery = _a.observableQuery, document = _a.document;
                var fetchPolicy = observableQuery
                    ? observableQuery.options.fetchPolicy
                    : options.fetchPolicy;
                if (fetchPolicy === 'standby')
                    return;
                var loading = isNetworkRequestInFlight(queryStoreValue.networkStatus);
                var lastResult = observableQuery && observableQuery.getLastResult();
                var networkStatusChanged = !!(lastResult &&
                    lastResult.networkStatus !== queryStoreValue.networkStatus);
                var shouldNotifyIfLoading = options.returnPartialData ||
                    (!newData && queryStoreValue.previousVariables) ||
                    (networkStatusChanged && options.notifyOnNetworkStatusChange) ||
                    fetchPolicy === 'cache-only' ||
                    fetchPolicy === 'cache-and-network';
                if (loading && !shouldNotifyIfLoading) {
                    return;
                }
                var hasGraphQLErrors = isNonEmptyArray(queryStoreValue.graphQLErrors);
                var errorPolicy = observableQuery
                    && observableQuery.options.errorPolicy
                    || options.errorPolicy
                    || 'none';
                if (errorPolicy === 'none' && hasGraphQLErrors || queryStoreValue.networkError) {
                    return invoke('error', new ApolloError({
                        graphQLErrors: queryStoreValue.graphQLErrors,
                        networkError: queryStoreValue.networkError,
                    }));
                }
                try {
                    var data = void 0;
                    var isMissing = void 0;
                    if (newData) {
                        if (fetchPolicy !== 'no-cache' && fetchPolicy !== 'network-only') {
                            _this.setQuery(queryId, function () { return ({ newData: null }); });
                        }
                        data = newData.result;
                        isMissing = !newData.complete;
                    }
                    else {
                        var lastError = observableQuery && observableQuery.getLastError();
                        var errorStatusChanged = errorPolicy !== 'none' &&
                            (lastError && lastError.graphQLErrors) !==
                                queryStoreValue.graphQLErrors;
                        if (lastResult && lastResult.data && !errorStatusChanged) {
                            data = lastResult.data;
                            isMissing = false;
                        }
                        else {
                            var diffResult = _this.dataStore.getCache().diff({
                                query: document,
                                variables: queryStoreValue.previousVariables ||
                                    queryStoreValue.variables,
                                returnPartialData: true,
                                optimistic: true,
                            });
                            data = diffResult.result;
                            isMissing = !diffResult.complete;
                        }
                    }
                    var stale = isMissing && !(options.returnPartialData ||
                        fetchPolicy === 'cache-only');
                    var resultFromStore = {
                        data: stale ? lastResult && lastResult.data : data,
                        loading: loading,
                        networkStatus: queryStoreValue.networkStatus,
                        stale: stale,
                    };
                    if (errorPolicy === 'all' && hasGraphQLErrors) {
                        resultFromStore.errors = queryStoreValue.graphQLErrors;
                    }
                    invoke('next', resultFromStore);
                }
                catch (networkError) {
                    invoke('error', new ApolloError({ networkError: networkError }));
                }
            };
        };
        QueryManager.prototype.transform = function (document) {
            var transformCache = this.transformCache;
            if (!transformCache.has(document)) {
                var cache = this.dataStore.getCache();
                var transformed = cache.transformDocument(document);
                var forLink = removeConnectionDirectiveFromDocument(cache.transformForLink(transformed));
                var clientQuery = this.localState.clientQuery(transformed);
                var serverQuery = this.localState.serverQuery(forLink);
                var cacheEntry_1 = {
                    document: transformed,
                    hasClientExports: hasClientExports(transformed),
                    hasForcedResolvers: this.localState.shouldForceResolvers(transformed),
                    clientQuery: clientQuery,
                    serverQuery: serverQuery,
                    defaultVars: getDefaultValues(getOperationDefinition(transformed)),
                };
                var add = function (doc) {
                    if (doc && !transformCache.has(doc)) {
                        transformCache.set(doc, cacheEntry_1);
                    }
                };
                add(document);
                add(transformed);
                add(clientQuery);
                add(serverQuery);
            }
            return transformCache.get(document);
        };
        QueryManager.prototype.getVariables = function (document, variables) {
            return __assign(__assign({}, this.transform(document).defaultVars), variables);
        };
        QueryManager.prototype.watchQuery = function (options, shouldSubscribe) {
            if (shouldSubscribe === void 0) { shouldSubscribe = true; }
            process.env.NODE_ENV === "production" ? invariant(options.fetchPolicy !== 'standby', 11) : invariant(options.fetchPolicy !== 'standby', 'client.watchQuery cannot be called with fetchPolicy set to "standby"');
            options.variables = this.getVariables(options.query, options.variables);
            if (typeof options.notifyOnNetworkStatusChange === 'undefined') {
                options.notifyOnNetworkStatusChange = false;
            }
            var transformedOptions = __assign({}, options);
            return new ObservableQuery({
                queryManager: this,
                options: transformedOptions,
                shouldSubscribe: shouldSubscribe,
            });
        };
        QueryManager.prototype.query = function (options) {
            var _this = this;
            process.env.NODE_ENV === "production" ? invariant(options.query, 12) : invariant(options.query, 'query option is required. You must specify your GraphQL document ' +
                'in the query option.');
            process.env.NODE_ENV === "production" ? invariant(options.query.kind === 'Document', 13) : invariant(options.query.kind === 'Document', 'You must wrap the query string in a "gql" tag.');
            process.env.NODE_ENV === "production" ? invariant(!options.returnPartialData, 14) : invariant(!options.returnPartialData, 'returnPartialData option only supported on watchQuery.');
            process.env.NODE_ENV === "production" ? invariant(!options.pollInterval, 15) : invariant(!options.pollInterval, 'pollInterval option only supported on watchQuery.');
            return new Promise(function (resolve, reject) {
                var watchedQuery = _this.watchQuery(options, false);
                _this.fetchQueryRejectFns.set("query:" + watchedQuery.queryId, reject);
                watchedQuery
                    .result()
                    .then(resolve, reject)
                    .then(function () {
                    return _this.fetchQueryRejectFns.delete("query:" + watchedQuery.queryId);
                });
            });
        };
        QueryManager.prototype.generateQueryId = function () {
            return String(this.idCounter++);
        };
        QueryManager.prototype.stopQueryInStore = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryInStoreNoBroadcast = function (queryId) {
            this.stopPollingQuery(queryId);
            this.queryStore.stopQuery(queryId);
            this.invalidate(queryId);
        };
        QueryManager.prototype.addQueryListener = function (queryId, listener) {
            this.setQuery(queryId, function (_a) {
                var listeners = _a.listeners;
                listeners.add(listener);
                return { invalidated: false };
            });
        };
        QueryManager.prototype.updateQueryWatch = function (queryId, document, options) {
            var _this = this;
            var cancel = this.getQuery(queryId).cancel;
            if (cancel)
                cancel();
            var previousResult = function () {
                var previousResult = null;
                var observableQuery = _this.getQuery(queryId).observableQuery;
                if (observableQuery) {
                    var lastResult = observableQuery.getLastResult();
                    if (lastResult) {
                        previousResult = lastResult.data;
                    }
                }
                return previousResult;
            };
            return this.dataStore.getCache().watch({
                query: document,
                variables: options.variables,
                optimistic: true,
                previousResult: previousResult,
                callback: function (newData) {
                    _this.setQuery(queryId, function () { return ({ invalidated: true, newData: newData }); });
                },
            });
        };
        QueryManager.prototype.addObservableQuery = function (queryId, observableQuery) {
            this.setQuery(queryId, function () { return ({ observableQuery: observableQuery }); });
        };
        QueryManager.prototype.removeObservableQuery = function (queryId) {
            var cancel = this.getQuery(queryId).cancel;
            this.setQuery(queryId, function () { return ({ observableQuery: null }); });
            if (cancel)
                cancel();
        };
        QueryManager.prototype.clearStore = function () {
            this.fetchQueryRejectFns.forEach(function (reject) {
                reject(process.env.NODE_ENV === "production" ? new InvariantError(16) : new InvariantError('Store reset while query was in flight (not completed in link chain)'));
            });
            var resetIds = [];
            this.queries.forEach(function (_a, queryId) {
                var observableQuery = _a.observableQuery;
                if (observableQuery)
                    resetIds.push(queryId);
            });
            this.queryStore.reset(resetIds);
            this.mutationStore.reset();
            return this.dataStore.reset();
        };
        QueryManager.prototype.resetStore = function () {
            var _this = this;
            return this.clearStore().then(function () {
                return _this.reFetchObservableQueries();
            });
        };
        QueryManager.prototype.reFetchObservableQueries = function (includeStandby) {
            var _this = this;
            if (includeStandby === void 0) { includeStandby = false; }
            var observableQueryPromises = [];
            this.queries.forEach(function (_a, queryId) {
                var observableQuery = _a.observableQuery;
                if (observableQuery) {
                    var fetchPolicy = observableQuery.options.fetchPolicy;
                    observableQuery.resetLastResults();
                    if (fetchPolicy !== 'cache-only' &&
                        (includeStandby || fetchPolicy !== 'standby')) {
                        observableQueryPromises.push(observableQuery.refetch());
                    }
                    _this.setQuery(queryId, function () { return ({ newData: null }); });
                    _this.invalidate(queryId);
                }
            });
            this.broadcastQueries();
            return Promise.all(observableQueryPromises);
        };
        QueryManager.prototype.observeQuery = function (queryId, options, observer) {
            this.addQueryListener(queryId, this.queryListenerForObserver(queryId, options, observer));
            return this.fetchQuery(queryId, options);
        };
        QueryManager.prototype.startQuery = function (queryId, options, listener) {
            process.env.NODE_ENV === "production" || invariant.warn("The QueryManager.startQuery method has been deprecated");
            this.addQueryListener(queryId, listener);
            this.fetchQuery(queryId, options)
                .catch(function () { return undefined; });
            return queryId;
        };
        QueryManager.prototype.startGraphQLSubscription = function (_a) {
            var _this = this;
            var query = _a.query, fetchPolicy = _a.fetchPolicy, variables = _a.variables;
            query = this.transform(query).document;
            variables = this.getVariables(query, variables);
            var makeObservable = function (variables) {
                return _this.getObservableFromLink(query, {}, variables, false).map(function (result) {
                    if (!fetchPolicy || fetchPolicy !== 'no-cache') {
                        _this.dataStore.markSubscriptionResult(result, query, variables);
                        _this.broadcastQueries();
                    }
                    if (graphQLResultHasError(result)) {
                        throw new ApolloError({
                            graphQLErrors: result.errors,
                        });
                    }
                    return result;
                });
            };
            if (this.transform(query).hasClientExports) {
                var observablePromise_1 = this.localState.addExportedVariables(query, variables).then(makeObservable);
                return new Observable$1(function (observer) {
                    var sub = null;
                    observablePromise_1.then(function (observable) { return sub = observable.subscribe(observer); }, observer.error);
                    return function () { return sub && sub.unsubscribe(); };
                });
            }
            return makeObservable(variables);
        };
        QueryManager.prototype.stopQuery = function (queryId) {
            this.stopQueryNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryNoBroadcast = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.removeQuery(queryId);
        };
        QueryManager.prototype.removeQuery = function (queryId) {
            this.fetchQueryRejectFns.delete("query:" + queryId);
            this.fetchQueryRejectFns.delete("fetchRequest:" + queryId);
            this.getQuery(queryId).subscriptions.forEach(function (x) { return x.unsubscribe(); });
            this.queries.delete(queryId);
        };
        QueryManager.prototype.getCurrentQueryResult = function (observableQuery, optimistic) {
            if (optimistic === void 0) { optimistic = true; }
            var _a = observableQuery.options, variables = _a.variables, query = _a.query, fetchPolicy = _a.fetchPolicy, returnPartialData = _a.returnPartialData;
            var lastResult = observableQuery.getLastResult();
            var newData = this.getQuery(observableQuery.queryId).newData;
            if (newData && newData.complete) {
                return { data: newData.result, partial: false };
            }
            if (fetchPolicy === 'no-cache' || fetchPolicy === 'network-only') {
                return { data: undefined, partial: false };
            }
            var _b = this.dataStore.getCache().diff({
                query: query,
                variables: variables,
                previousResult: lastResult ? lastResult.data : undefined,
                returnPartialData: true,
                optimistic: optimistic,
            }), result = _b.result, complete = _b.complete;
            return {
                data: (complete || returnPartialData) ? result : void 0,
                partial: !complete,
            };
        };
        QueryManager.prototype.getQueryWithPreviousResult = function (queryIdOrObservable) {
            var observableQuery;
            if (typeof queryIdOrObservable === 'string') {
                var foundObserveableQuery = this.getQuery(queryIdOrObservable).observableQuery;
                process.env.NODE_ENV === "production" ? invariant(foundObserveableQuery, 17) : invariant(foundObserveableQuery, "ObservableQuery with this id doesn't exist: " + queryIdOrObservable);
                observableQuery = foundObserveableQuery;
            }
            else {
                observableQuery = queryIdOrObservable;
            }
            var _a = observableQuery.options, variables = _a.variables, query = _a.query;
            return {
                previousResult: this.getCurrentQueryResult(observableQuery, false).data,
                variables: variables,
                document: query,
            };
        };
        QueryManager.prototype.broadcastQueries = function () {
            var _this = this;
            this.onBroadcast();
            this.queries.forEach(function (info, id) {
                if (info.invalidated) {
                    info.listeners.forEach(function (listener) {
                        if (listener) {
                            listener(_this.queryStore.get(id), info.newData);
                        }
                    });
                }
            });
        };
        QueryManager.prototype.getLocalState = function () {
            return this.localState;
        };
        QueryManager.prototype.getObservableFromLink = function (query, context, variables, deduplication) {
            var _this = this;
            if (deduplication === void 0) { deduplication = this.queryDeduplication; }
            var observable;
            var serverQuery = this.transform(query).serverQuery;
            if (serverQuery) {
                var _a = this, inFlightLinkObservables_1 = _a.inFlightLinkObservables, link = _a.link;
                var operation = {
                    query: serverQuery,
                    variables: variables,
                    operationName: getOperationName(serverQuery) || void 0,
                    context: this.prepareContext(__assign(__assign({}, context), { forceFetch: !deduplication })),
                };
                context = operation.context;
                if (deduplication) {
                    var byVariables_1 = inFlightLinkObservables_1.get(serverQuery) || new Map();
                    inFlightLinkObservables_1.set(serverQuery, byVariables_1);
                    var varJson_1 = JSON.stringify(variables);
                    observable = byVariables_1.get(varJson_1);
                    if (!observable) {
                        byVariables_1.set(varJson_1, observable = multiplex(execute(link, operation)));
                        var cleanup = function () {
                            byVariables_1.delete(varJson_1);
                            if (!byVariables_1.size)
                                inFlightLinkObservables_1.delete(serverQuery);
                            cleanupSub_1.unsubscribe();
                        };
                        var cleanupSub_1 = observable.subscribe({
                            next: cleanup,
                            error: cleanup,
                            complete: cleanup,
                        });
                    }
                }
                else {
                    observable = multiplex(execute(link, operation));
                }
            }
            else {
                observable = Observable$1.of({ data: {} });
                context = this.prepareContext(context);
            }
            var clientQuery = this.transform(query).clientQuery;
            if (clientQuery) {
                observable = asyncMap(observable, function (result) {
                    return _this.localState.runResolvers({
                        document: clientQuery,
                        remoteResult: result,
                        context: context,
                        variables: variables,
                    });
                });
            }
            return observable;
        };
        QueryManager.prototype.fetchRequest = function (_a) {
            var _this = this;
            var requestId = _a.requestId, queryId = _a.queryId, document = _a.document, options = _a.options, fetchMoreForQueryId = _a.fetchMoreForQueryId;
            var variables = options.variables, _b = options.errorPolicy, errorPolicy = _b === void 0 ? 'none' : _b, fetchPolicy = options.fetchPolicy;
            var resultFromStore;
            var errorsFromStore;
            return new Promise(function (resolve, reject) {
                var observable = _this.getObservableFromLink(document, options.context, variables);
                var fqrfId = "fetchRequest:" + queryId;
                _this.fetchQueryRejectFns.set(fqrfId, reject);
                var cleanup = function () {
                    _this.fetchQueryRejectFns.delete(fqrfId);
                    _this.setQuery(queryId, function (_a) {
                        var subscriptions = _a.subscriptions;
                        subscriptions.delete(subscription);
                    });
                };
                var subscription = observable.map(function (result) {
                    if (requestId >= _this.getQuery(queryId).lastRequestId) {
                        _this.markQueryResult(queryId, result, options, fetchMoreForQueryId);
                        _this.queryStore.markQueryResult(queryId, result, fetchMoreForQueryId);
                        _this.invalidate(queryId);
                        _this.invalidate(fetchMoreForQueryId);
                        _this.broadcastQueries();
                    }
                    if (errorPolicy === 'none' && isNonEmptyArray(result.errors)) {
                        return reject(new ApolloError({
                            graphQLErrors: result.errors,
                        }));
                    }
                    if (errorPolicy === 'all') {
                        errorsFromStore = result.errors;
                    }
                    if (fetchMoreForQueryId || fetchPolicy === 'no-cache') {
                        resultFromStore = result.data;
                    }
                    else {
                        var _a = _this.dataStore.getCache().diff({
                            variables: variables,
                            query: document,
                            optimistic: false,
                            returnPartialData: true,
                        }), result_1 = _a.result, complete = _a.complete;
                        if (complete || options.returnPartialData) {
                            resultFromStore = result_1;
                        }
                    }
                }).subscribe({
                    error: function (error) {
                        cleanup();
                        reject(error);
                    },
                    complete: function () {
                        cleanup();
                        resolve({
                            data: resultFromStore,
                            errors: errorsFromStore,
                            loading: false,
                            networkStatus: NetworkStatus.ready,
                            stale: false,
                        });
                    },
                });
                _this.setQuery(queryId, function (_a) {
                    var subscriptions = _a.subscriptions;
                    subscriptions.add(subscription);
                });
            });
        };
        QueryManager.prototype.getQuery = function (queryId) {
            return (this.queries.get(queryId) || {
                listeners: new Set(),
                invalidated: false,
                document: null,
                newData: null,
                lastRequestId: 1,
                observableQuery: null,
                subscriptions: new Set(),
            });
        };
        QueryManager.prototype.setQuery = function (queryId, updater) {
            var prev = this.getQuery(queryId);
            var newInfo = __assign(__assign({}, prev), updater(prev));
            this.queries.set(queryId, newInfo);
        };
        QueryManager.prototype.invalidate = function (queryId, invalidated) {
            if (invalidated === void 0) { invalidated = true; }
            if (queryId) {
                this.setQuery(queryId, function () { return ({ invalidated: invalidated }); });
            }
        };
        QueryManager.prototype.prepareContext = function (context) {
            if (context === void 0) { context = {}; }
            var newContext = this.localState.prepareContext(context);
            return __assign(__assign({}, newContext), { clientAwareness: this.clientAwareness });
        };
        QueryManager.prototype.checkInFlight = function (queryId) {
            var query = this.queryStore.get(queryId);
            return (query &&
                query.networkStatus !== NetworkStatus.ready &&
                query.networkStatus !== NetworkStatus.error);
        };
        QueryManager.prototype.startPollingQuery = function (options, queryId, listener) {
            var _this = this;
            var pollInterval = options.pollInterval;
            process.env.NODE_ENV === "production" ? invariant(pollInterval, 18) : invariant(pollInterval, 'Attempted to start a polling query without a polling interval.');
            if (!this.ssrMode) {
                var info = this.pollingInfoByQueryId.get(queryId);
                if (!info) {
                    this.pollingInfoByQueryId.set(queryId, (info = {}));
                }
                info.interval = pollInterval;
                info.options = __assign(__assign({}, options), { fetchPolicy: 'network-only' });
                var maybeFetch_1 = function () {
                    var info = _this.pollingInfoByQueryId.get(queryId);
                    if (info) {
                        if (_this.checkInFlight(queryId)) {
                            poll_1();
                        }
                        else {
                            _this.fetchQuery(queryId, info.options, FetchType.poll).then(poll_1, poll_1);
                        }
                    }
                };
                var poll_1 = function () {
                    var info = _this.pollingInfoByQueryId.get(queryId);
                    if (info) {
                        clearTimeout(info.timeout);
                        info.timeout = setTimeout(maybeFetch_1, info.interval);
                    }
                };
                if (listener) {
                    this.addQueryListener(queryId, listener);
                }
                poll_1();
            }
            return queryId;
        };
        QueryManager.prototype.stopPollingQuery = function (queryId) {
            this.pollingInfoByQueryId.delete(queryId);
        };
        return QueryManager;
    }());

    var DataStore = (function () {
        function DataStore(initialCache) {
            this.cache = initialCache;
        }
        DataStore.prototype.getCache = function () {
            return this.cache;
        };
        DataStore.prototype.markQueryResult = function (result, document, variables, fetchMoreForQueryId, ignoreErrors) {
            if (ignoreErrors === void 0) { ignoreErrors = false; }
            var writeWithErrors = !graphQLResultHasError(result);
            if (ignoreErrors && graphQLResultHasError(result) && result.data) {
                writeWithErrors = true;
            }
            if (!fetchMoreForQueryId && writeWithErrors) {
                this.cache.write({
                    result: result.data,
                    dataId: 'ROOT_QUERY',
                    query: document,
                    variables: variables,
                });
            }
        };
        DataStore.prototype.markSubscriptionResult = function (result, document, variables) {
            if (!graphQLResultHasError(result)) {
                this.cache.write({
                    result: result.data,
                    dataId: 'ROOT_SUBSCRIPTION',
                    query: document,
                    variables: variables,
                });
            }
        };
        DataStore.prototype.markMutationInit = function (mutation) {
            var _this = this;
            if (mutation.optimisticResponse) {
                var optimistic_1;
                if (typeof mutation.optimisticResponse === 'function') {
                    optimistic_1 = mutation.optimisticResponse(mutation.variables);
                }
                else {
                    optimistic_1 = mutation.optimisticResponse;
                }
                this.cache.recordOptimisticTransaction(function (c) {
                    var orig = _this.cache;
                    _this.cache = c;
                    try {
                        _this.markMutationResult({
                            mutationId: mutation.mutationId,
                            result: { data: optimistic_1 },
                            document: mutation.document,
                            variables: mutation.variables,
                            updateQueries: mutation.updateQueries,
                            update: mutation.update,
                        });
                    }
                    finally {
                        _this.cache = orig;
                    }
                }, mutation.mutationId);
            }
        };
        DataStore.prototype.markMutationResult = function (mutation) {
            var _this = this;
            if (!graphQLResultHasError(mutation.result)) {
                var cacheWrites_1 = [{
                        result: mutation.result.data,
                        dataId: 'ROOT_MUTATION',
                        query: mutation.document,
                        variables: mutation.variables,
                    }];
                var updateQueries_1 = mutation.updateQueries;
                if (updateQueries_1) {
                    Object.keys(updateQueries_1).forEach(function (id) {
                        var _a = updateQueries_1[id], query = _a.query, updater = _a.updater;
                        var _b = _this.cache.diff({
                            query: query.document,
                            variables: query.variables,
                            returnPartialData: true,
                            optimistic: false,
                        }), currentQueryResult = _b.result, complete = _b.complete;
                        if (complete) {
                            var nextQueryResult = tryFunctionOrLogError(function () {
                                return updater(currentQueryResult, {
                                    mutationResult: mutation.result,
                                    queryName: getOperationName(query.document) || undefined,
                                    queryVariables: query.variables,
                                });
                            });
                            if (nextQueryResult) {
                                cacheWrites_1.push({
                                    result: nextQueryResult,
                                    dataId: 'ROOT_QUERY',
                                    query: query.document,
                                    variables: query.variables,
                                });
                            }
                        }
                    });
                }
                this.cache.performTransaction(function (c) {
                    cacheWrites_1.forEach(function (write) { return c.write(write); });
                    var update = mutation.update;
                    if (update) {
                        tryFunctionOrLogError(function () { return update(c, mutation.result); });
                    }
                });
            }
        };
        DataStore.prototype.markMutationComplete = function (_a) {
            var mutationId = _a.mutationId, optimisticResponse = _a.optimisticResponse;
            if (optimisticResponse) {
                this.cache.removeOptimistic(mutationId);
            }
        };
        DataStore.prototype.markUpdateQueryResult = function (document, variables, newResult) {
            this.cache.write({
                result: newResult,
                dataId: 'ROOT_QUERY',
                variables: variables,
                query: document,
            });
        };
        DataStore.prototype.reset = function () {
            return this.cache.reset();
        };
        return DataStore;
    }());

    var version = "2.6.8";

    var hasSuggestedDevtools = false;
    var ApolloClient = (function () {
        function ApolloClient(options) {
            var _this = this;
            this.defaultOptions = {};
            this.resetStoreCallbacks = [];
            this.clearStoreCallbacks = [];
            var cache = options.cache, _a = options.ssrMode, ssrMode = _a === void 0 ? false : _a, _b = options.ssrForceFetchDelay, ssrForceFetchDelay = _b === void 0 ? 0 : _b, connectToDevTools = options.connectToDevTools, _c = options.queryDeduplication, queryDeduplication = _c === void 0 ? true : _c, defaultOptions = options.defaultOptions, _d = options.assumeImmutableResults, assumeImmutableResults = _d === void 0 ? false : _d, resolvers = options.resolvers, typeDefs = options.typeDefs, fragmentMatcher = options.fragmentMatcher, clientAwarenessName = options.name, clientAwarenessVersion = options.version;
            var link = options.link;
            if (!link && resolvers) {
                link = ApolloLink.empty();
            }
            if (!link || !cache) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(1) : new InvariantError("In order to initialize Apollo Client, you must specify 'link' and 'cache' properties in the options object.\n" +
                    "These options are part of the upgrade requirements when migrating from Apollo Client 1.x to Apollo Client 2.x.\n" +
                    "For more information, please visit: https://www.apollographql.com/docs/tutorial/client.html#apollo-client-setup");
            }
            this.link = link;
            this.cache = cache;
            this.store = new DataStore(cache);
            this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
            this.queryDeduplication = queryDeduplication;
            this.defaultOptions = defaultOptions || {};
            this.typeDefs = typeDefs;
            if (ssrForceFetchDelay) {
                setTimeout(function () { return (_this.disableNetworkFetches = false); }, ssrForceFetchDelay);
            }
            this.watchQuery = this.watchQuery.bind(this);
            this.query = this.query.bind(this);
            this.mutate = this.mutate.bind(this);
            this.resetStore = this.resetStore.bind(this);
            this.reFetchObservableQueries = this.reFetchObservableQueries.bind(this);
            var defaultConnectToDevTools = process.env.NODE_ENV !== 'production' &&
                typeof window !== 'undefined' &&
                !window.__APOLLO_CLIENT__;
            if (typeof connectToDevTools === 'undefined'
                ? defaultConnectToDevTools
                : connectToDevTools && typeof window !== 'undefined') {
                window.__APOLLO_CLIENT__ = this;
            }
            if (!hasSuggestedDevtools && process.env.NODE_ENV !== 'production') {
                hasSuggestedDevtools = true;
                if (typeof window !== 'undefined' &&
                    window.document &&
                    window.top === window.self) {
                    if (typeof window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
                        if (window.navigator &&
                            window.navigator.userAgent &&
                            window.navigator.userAgent.indexOf('Chrome') > -1) {
                            console.debug('Download the Apollo DevTools ' +
                                'for a better development experience: ' +
                                'https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm');
                        }
                    }
                }
            }
            this.version = version;
            this.localState = new LocalState({
                cache: cache,
                client: this,
                resolvers: resolvers,
                fragmentMatcher: fragmentMatcher,
            });
            this.queryManager = new QueryManager({
                link: this.link,
                store: this.store,
                queryDeduplication: queryDeduplication,
                ssrMode: ssrMode,
                clientAwareness: {
                    name: clientAwarenessName,
                    version: clientAwarenessVersion,
                },
                localState: this.localState,
                assumeImmutableResults: assumeImmutableResults,
                onBroadcast: function () {
                    if (_this.devToolsHookCb) {
                        _this.devToolsHookCb({
                            action: {},
                            state: {
                                queries: _this.queryManager.queryStore.getStore(),
                                mutations: _this.queryManager.mutationStore.getStore(),
                            },
                            dataWithOptimisticResults: _this.cache.extract(true),
                        });
                    }
                },
            });
        }
        ApolloClient.prototype.stop = function () {
            this.queryManager.stop();
        };
        ApolloClient.prototype.watchQuery = function (options) {
            if (this.defaultOptions.watchQuery) {
                options = __assign(__assign({}, this.defaultOptions.watchQuery), options);
            }
            if (this.disableNetworkFetches &&
                (options.fetchPolicy === 'network-only' ||
                    options.fetchPolicy === 'cache-and-network')) {
                options = __assign(__assign({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.watchQuery(options);
        };
        ApolloClient.prototype.query = function (options) {
            if (this.defaultOptions.query) {
                options = __assign(__assign({}, this.defaultOptions.query), options);
            }
            process.env.NODE_ENV === "production" ? invariant(options.fetchPolicy !== 'cache-and-network', 2) : invariant(options.fetchPolicy !== 'cache-and-network', 'The cache-and-network fetchPolicy does not work with client.query, because ' +
                'client.query can only return a single result. Please use client.watchQuery ' +
                'to receive multiple results from the cache and the network, or consider ' +
                'using a different fetchPolicy, such as cache-first or network-only.');
            if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
                options = __assign(__assign({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.query(options);
        };
        ApolloClient.prototype.mutate = function (options) {
            if (this.defaultOptions.mutate) {
                options = __assign(__assign({}, this.defaultOptions.mutate), options);
            }
            return this.queryManager.mutate(options);
        };
        ApolloClient.prototype.subscribe = function (options) {
            return this.queryManager.startGraphQLSubscription(options);
        };
        ApolloClient.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readQuery(options, optimistic);
        };
        ApolloClient.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readFragment(options, optimistic);
        };
        ApolloClient.prototype.writeQuery = function (options) {
            var result = this.cache.writeQuery(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.writeFragment = function (options) {
            var result = this.cache.writeFragment(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.writeData = function (options) {
            var result = this.cache.writeData(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.__actionHookForDevTools = function (cb) {
            this.devToolsHookCb = cb;
        };
        ApolloClient.prototype.__requestRaw = function (payload) {
            return execute(this.link, payload);
        };
        ApolloClient.prototype.initQueryManager = function () {
            process.env.NODE_ENV === "production" || invariant.warn('Calling the initQueryManager method is no longer necessary, ' +
                'and it will be removed from ApolloClient in version 3.0.');
            return this.queryManager;
        };
        ApolloClient.prototype.resetStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore(); })
                .then(function () { return Promise.all(_this.resetStoreCallbacks.map(function (fn) { return fn(); })); })
                .then(function () { return _this.reFetchObservableQueries(); });
        };
        ApolloClient.prototype.clearStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore(); })
                .then(function () { return Promise.all(_this.clearStoreCallbacks.map(function (fn) { return fn(); })); });
        };
        ApolloClient.prototype.onResetStore = function (cb) {
            var _this = this;
            this.resetStoreCallbacks.push(cb);
            return function () {
                _this.resetStoreCallbacks = _this.resetStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.onClearStore = function (cb) {
            var _this = this;
            this.clearStoreCallbacks.push(cb);
            return function () {
                _this.clearStoreCallbacks = _this.clearStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.reFetchObservableQueries = function (includeStandby) {
            return this.queryManager.reFetchObservableQueries(includeStandby);
        };
        ApolloClient.prototype.extract = function (optimistic) {
            return this.cache.extract(optimistic);
        };
        ApolloClient.prototype.restore = function (serializedState) {
            return this.cache.restore(serializedState);
        };
        ApolloClient.prototype.addResolvers = function (resolvers) {
            this.localState.addResolvers(resolvers);
        };
        ApolloClient.prototype.setResolvers = function (resolvers) {
            this.localState.setResolvers(resolvers);
        };
        ApolloClient.prototype.getResolvers = function () {
            return this.localState.getResolvers();
        };
        ApolloClient.prototype.setLocalStateFragmentMatcher = function (fragmentMatcher) {
            this.localState.setFragmentMatcher(fragmentMatcher);
        };
        return ApolloClient;
    }());

    function queryFromPojo(obj) {
        var op = {
            kind: 'OperationDefinition',
            operation: 'query',
            name: {
                kind: 'Name',
                value: 'GeneratedClientQuery',
            },
            selectionSet: selectionSetFromObj(obj),
        };
        var out = {
            kind: 'Document',
            definitions: [op],
        };
        return out;
    }
    function fragmentFromPojo(obj, typename) {
        var frag = {
            kind: 'FragmentDefinition',
            typeCondition: {
                kind: 'NamedType',
                name: {
                    kind: 'Name',
                    value: typename || '__FakeType',
                },
            },
            name: {
                kind: 'Name',
                value: 'GeneratedClientQuery',
            },
            selectionSet: selectionSetFromObj(obj),
        };
        var out = {
            kind: 'Document',
            definitions: [frag],
        };
        return out;
    }
    function selectionSetFromObj(obj) {
        if (typeof obj === 'number' ||
            typeof obj === 'boolean' ||
            typeof obj === 'string' ||
            typeof obj === 'undefined' ||
            obj === null) {
            return null;
        }
        if (Array.isArray(obj)) {
            return selectionSetFromObj(obj[0]);
        }
        var selections = [];
        Object.keys(obj).forEach(function (key) {
            var nestedSelSet = selectionSetFromObj(obj[key]);
            var field = {
                kind: 'Field',
                name: {
                    kind: 'Name',
                    value: key,
                },
                selectionSet: nestedSelSet || undefined,
            };
            selections.push(field);
        });
        var selectionSet = {
            kind: 'SelectionSet',
            selections: selections,
        };
        return selectionSet;
    }
    var justTypenameQuery = {
        kind: 'Document',
        definitions: [
            {
                kind: 'OperationDefinition',
                operation: 'query',
                name: null,
                variableDefinitions: null,
                directives: [],
                selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                        {
                            kind: 'Field',
                            alias: null,
                            name: {
                                kind: 'Name',
                                value: '__typename',
                            },
                            arguments: [],
                            directives: [],
                            selectionSet: null,
                        },
                    ],
                },
            },
        ],
    };

    var ApolloCache = (function () {
        function ApolloCache() {
        }
        ApolloCache.prototype.transformDocument = function (document) {
            return document;
        };
        ApolloCache.prototype.transformForLink = function (document) {
            return document;
        };
        ApolloCache.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.read({
                query: options.query,
                variables: options.variables,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.read({
                query: getFragmentQueryDocument(options.fragment, options.fragmentName),
                variables: options.variables,
                rootId: options.id,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.writeQuery = function (options) {
            this.write({
                dataId: 'ROOT_QUERY',
                result: options.data,
                query: options.query,
                variables: options.variables,
            });
        };
        ApolloCache.prototype.writeFragment = function (options) {
            this.write({
                dataId: options.id,
                result: options.data,
                variables: options.variables,
                query: getFragmentQueryDocument(options.fragment, options.fragmentName),
            });
        };
        ApolloCache.prototype.writeData = function (_a) {
            var id = _a.id, data = _a.data;
            if (typeof id !== 'undefined') {
                var typenameResult = null;
                try {
                    typenameResult = this.read({
                        rootId: id,
                        optimistic: false,
                        query: justTypenameQuery,
                    });
                }
                catch (e) {
                }
                var __typename = (typenameResult && typenameResult.__typename) || '__ClientData';
                var dataToWrite = Object.assign({ __typename: __typename }, data);
                this.writeFragment({
                    id: id,
                    fragment: fragmentFromPojo(dataToWrite, __typename),
                    data: dataToWrite,
                });
            }
            else {
                this.writeQuery({ query: queryFromPojo(data), data: data });
            }
        };
        return ApolloCache;
    }());

    // This currentContext variable will only be used if the makeSlotClass
    // function is called, which happens only if this is the first copy of the
    // @wry/context package to be imported.
    var currentContext = null;
    // This unique internal object is used to denote the absence of a value
    // for a given Slot, and is never exposed to outside code.
    var MISSING_VALUE = {};
    var idCounter = 1;
    // Although we can't do anything about the cost of duplicated code from
    // accidentally bundling multiple copies of the @wry/context package, we can
    // avoid creating the Slot class more than once using makeSlotClass.
    var makeSlotClass = function () { return /** @class */ (function () {
        function Slot() {
            // If you have a Slot object, you can find out its slot.id, but you cannot
            // guess the slot.id of a Slot you don't have access to, thanks to the
            // randomized suffix.
            this.id = [
                "slot",
                idCounter++,
                Date.now(),
                Math.random().toString(36).slice(2),
            ].join(":");
        }
        Slot.prototype.hasValue = function () {
            for (var context_1 = currentContext; context_1; context_1 = context_1.parent) {
                // We use the Slot object iself as a key to its value, which means the
                // value cannot be obtained without a reference to the Slot object.
                if (this.id in context_1.slots) {
                    var value = context_1.slots[this.id];
                    if (value === MISSING_VALUE)
                        break;
                    if (context_1 !== currentContext) {
                        // Cache the value in currentContext.slots so the next lookup will
                        // be faster. This caching is safe because the tree of contexts and
                        // the values of the slots are logically immutable.
                        currentContext.slots[this.id] = value;
                    }
                    return true;
                }
            }
            if (currentContext) {
                // If a value was not found for this Slot, it's never going to be found
                // no matter how many times we look it up, so we might as well cache
                // the absence of the value, too.
                currentContext.slots[this.id] = MISSING_VALUE;
            }
            return false;
        };
        Slot.prototype.getValue = function () {
            if (this.hasValue()) {
                return currentContext.slots[this.id];
            }
        };
        Slot.prototype.withValue = function (value, callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            var _a;
            var slots = (_a = {
                    __proto__: null
                },
                _a[this.id] = value,
                _a);
            var parent = currentContext;
            currentContext = { parent: parent, slots: slots };
            try {
                // Function.prototype.apply allows the arguments array argument to be
                // omitted or undefined, so args! is fine here.
                return callback.apply(thisArg, args);
            }
            finally {
                currentContext = parent;
            }
        };
        // Capture the current context and wrap a callback function so that it
        // reestablishes the captured context when called.
        Slot.bind = function (callback) {
            var context = currentContext;
            return function () {
                var saved = currentContext;
                try {
                    currentContext = context;
                    return callback.apply(this, arguments);
                }
                finally {
                    currentContext = saved;
                }
            };
        };
        // Immediately run a callback function without any captured context.
        Slot.noContext = function (callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            if (currentContext) {
                var saved = currentContext;
                try {
                    currentContext = null;
                    // Function.prototype.apply allows the arguments array argument to be
                    // omitted or undefined, so args! is fine here.
                    return callback.apply(thisArg, args);
                }
                finally {
                    currentContext = saved;
                }
            }
            else {
                return callback.apply(thisArg, args);
            }
        };
        return Slot;
    }()); };
    // We store a single global implementation of the Slot class as a permanent
    // non-enumerable symbol property of the Array constructor. This obfuscation
    // does nothing to prevent access to the Slot class, but at least it ensures
    // the implementation (i.e. currentContext) cannot be tampered with, and all
    // copies of the @wry/context package (hopefully just one) will share the
    // same Slot implementation. Since the first copy of the @wry/context package
    // to be imported wins, this technique imposes a very high cost for any
    // future breaking changes to the Slot class.
    var globalKey = "@wry/context:Slot";
    var host = Array;
    var Slot = host[globalKey] || function () {
        var Slot = makeSlotClass();
        try {
            Object.defineProperty(host, globalKey, {
                value: host[globalKey] = Slot,
                enumerable: false,
                writable: false,
                configurable: false,
            });
        }
        finally {
            return Slot;
        }
    }();

    var bind = Slot.bind, noContext = Slot.noContext;

    function defaultDispose() { }
    var Cache = /** @class */ (function () {
        function Cache(max, dispose) {
            if (max === void 0) { max = Infinity; }
            if (dispose === void 0) { dispose = defaultDispose; }
            this.max = max;
            this.dispose = dispose;
            this.map = new Map();
            this.newest = null;
            this.oldest = null;
        }
        Cache.prototype.has = function (key) {
            return this.map.has(key);
        };
        Cache.prototype.get = function (key) {
            var entry = this.getEntry(key);
            return entry && entry.value;
        };
        Cache.prototype.getEntry = function (key) {
            var entry = this.map.get(key);
            if (entry && entry !== this.newest) {
                var older = entry.older, newer = entry.newer;
                if (newer) {
                    newer.older = older;
                }
                if (older) {
                    older.newer = newer;
                }
                entry.older = this.newest;
                entry.older.newer = entry;
                entry.newer = null;
                this.newest = entry;
                if (entry === this.oldest) {
                    this.oldest = newer;
                }
            }
            return entry;
        };
        Cache.prototype.set = function (key, value) {
            var entry = this.getEntry(key);
            if (entry) {
                return entry.value = value;
            }
            entry = {
                key: key,
                value: value,
                newer: null,
                older: this.newest
            };
            if (this.newest) {
                this.newest.newer = entry;
            }
            this.newest = entry;
            this.oldest = this.oldest || entry;
            this.map.set(key, entry);
            return entry.value;
        };
        Cache.prototype.clean = function () {
            while (this.oldest && this.map.size > this.max) {
                this.delete(this.oldest.key);
            }
        };
        Cache.prototype.delete = function (key) {
            var entry = this.map.get(key);
            if (entry) {
                if (entry === this.newest) {
                    this.newest = entry.older;
                }
                if (entry === this.oldest) {
                    this.oldest = entry.newer;
                }
                if (entry.newer) {
                    entry.newer.older = entry.older;
                }
                if (entry.older) {
                    entry.older.newer = entry.newer;
                }
                this.map.delete(key);
                this.dispose(entry.value, key);
                return true;
            }
            return false;
        };
        return Cache;
    }());

    var parentEntrySlot = new Slot();

    var reusableEmptyArray = [];
    var emptySetPool = [];
    var POOL_TARGET_SIZE = 100;
    // Since this package might be used browsers, we should avoid using the
    // Node built-in assert module.
    function assert(condition, optionalMessage) {
        if (!condition) {
            throw new Error(optionalMessage || "assertion failure");
        }
    }
    function valueIs(a, b) {
        var len = a.length;
        return (
        // Unknown values are not equal to each other.
        len > 0 &&
            // Both values must be ordinary (or both exceptional) to be equal.
            len === b.length &&
            // The underlying value or exception must be the same.
            a[len - 1] === b[len - 1]);
    }
    function valueGet(value) {
        switch (value.length) {
            case 0: throw new Error("unknown value");
            case 1: return value[0];
            case 2: throw value[1];
        }
    }
    function valueCopy(value) {
        return value.slice(0);
    }
    var Entry = /** @class */ (function () {
        function Entry(fn, args) {
            this.fn = fn;
            this.args = args;
            this.parents = new Set();
            this.childValues = new Map();
            // When this Entry has children that are dirty, this property becomes
            // a Set containing other Entry objects, borrowed from emptySetPool.
            // When the set becomes empty, it gets recycled back to emptySetPool.
            this.dirtyChildren = null;
            this.dirty = true;
            this.recomputing = false;
            this.value = [];
            ++Entry.count;
        }
        // This is the most important method of the Entry API, because it
        // determines whether the cached this.value can be returned immediately,
        // or must be recomputed. The overall performance of the caching system
        // depends on the truth of the following observations: (1) this.dirty is
        // usually false, (2) this.dirtyChildren is usually null/empty, and thus
        // (3) valueGet(this.value) is usually returned without recomputation.
        Entry.prototype.recompute = function () {
            assert(!this.recomputing, "already recomputing");
            if (!rememberParent(this) && maybeReportOrphan(this)) {
                // The recipient of the entry.reportOrphan callback decided to dispose
                // of this orphan entry by calling entry.dispose(), so we don't need to
                // (and should not) proceed with the recomputation.
                return void 0;
            }
            return mightBeDirty(this)
                ? reallyRecompute(this)
                : valueGet(this.value);
        };
        Entry.prototype.setDirty = function () {
            if (this.dirty)
                return;
            this.dirty = true;
            this.value.length = 0;
            reportDirty(this);
            // We can go ahead and unsubscribe here, since any further dirty
            // notifications we receive will be redundant, and unsubscribing may
            // free up some resources, e.g. file watchers.
            maybeUnsubscribe(this);
        };
        Entry.prototype.dispose = function () {
            var _this = this;
            forgetChildren(this).forEach(maybeReportOrphan);
            maybeUnsubscribe(this);
            // Because this entry has been kicked out of the cache (in index.js),
            // we've lost the ability to find out if/when this entry becomes dirty,
            // whether that happens through a subscription, because of a direct call
            // to entry.setDirty(), or because one of its children becomes dirty.
            // Because of this loss of future information, we have to assume the
            // worst (that this entry might have become dirty very soon), so we must
            // immediately mark this entry's parents as dirty. Normally we could
            // just call entry.setDirty() rather than calling parent.setDirty() for
            // each parent, but that would leave this entry in parent.childValues
            // and parent.dirtyChildren, which would prevent the child from being
            // truly forgotten.
            this.parents.forEach(function (parent) {
                parent.setDirty();
                forgetChild(parent, _this);
            });
        };
        Entry.count = 0;
        return Entry;
    }());
    function rememberParent(child) {
        var parent = parentEntrySlot.getValue();
        if (parent) {
            child.parents.add(parent);
            if (!parent.childValues.has(child)) {
                parent.childValues.set(child, []);
            }
            if (mightBeDirty(child)) {
                reportDirtyChild(parent, child);
            }
            else {
                reportCleanChild(parent, child);
            }
            return parent;
        }
    }
    function reallyRecompute(entry) {
        // Since this recomputation is likely to re-remember some of this
        // entry's children, we forget our children here but do not call
        // maybeReportOrphan until after the recomputation finishes.
        var originalChildren = forgetChildren(entry);
        // Set entry as the parent entry while calling recomputeNewValue(entry).
        parentEntrySlot.withValue(entry, recomputeNewValue, [entry]);
        if (maybeSubscribe(entry)) {
            // If we successfully recomputed entry.value and did not fail to
            // (re)subscribe, then this Entry is no longer explicitly dirty.
            setClean(entry);
        }
        // Now that we've had a chance to re-remember any children that were
        // involved in the recomputation, we can safely report any orphan
        // children that remain.
        originalChildren.forEach(maybeReportOrphan);
        return valueGet(entry.value);
    }
    function recomputeNewValue(entry) {
        entry.recomputing = true;
        // Set entry.value as unknown.
        entry.value.length = 0;
        try {
            // If entry.fn succeeds, entry.value will become a normal Value.
            entry.value[0] = entry.fn.apply(null, entry.args);
        }
        catch (e) {
            // If entry.fn throws, entry.value will become exceptional.
            entry.value[1] = e;
        }
        // Either way, this line is always reached.
        entry.recomputing = false;
    }
    function mightBeDirty(entry) {
        return entry.dirty || !!(entry.dirtyChildren && entry.dirtyChildren.size);
    }
    function setClean(entry) {
        entry.dirty = false;
        if (mightBeDirty(entry)) {
            // This Entry may still have dirty children, in which case we can't
            // let our parents know we're clean just yet.
            return;
        }
        reportClean(entry);
    }
    function reportDirty(child) {
        child.parents.forEach(function (parent) { return reportDirtyChild(parent, child); });
    }
    function reportClean(child) {
        child.parents.forEach(function (parent) { return reportCleanChild(parent, child); });
    }
    // Let a parent Entry know that one of its children may be dirty.
    function reportDirtyChild(parent, child) {
        // Must have called rememberParent(child) before calling
        // reportDirtyChild(parent, child).
        assert(parent.childValues.has(child));
        assert(mightBeDirty(child));
        if (!parent.dirtyChildren) {
            parent.dirtyChildren = emptySetPool.pop() || new Set;
        }
        else if (parent.dirtyChildren.has(child)) {
            // If we already know this child is dirty, then we must have already
            // informed our own parents that we are dirty, so we can terminate
            // the recursion early.
            return;
        }
        parent.dirtyChildren.add(child);
        reportDirty(parent);
    }
    // Let a parent Entry know that one of its children is no longer dirty.
    function reportCleanChild(parent, child) {
        // Must have called rememberChild(child) before calling
        // reportCleanChild(parent, child).
        assert(parent.childValues.has(child));
        assert(!mightBeDirty(child));
        var childValue = parent.childValues.get(child);
        if (childValue.length === 0) {
            parent.childValues.set(child, valueCopy(child.value));
        }
        else if (!valueIs(childValue, child.value)) {
            parent.setDirty();
        }
        removeDirtyChild(parent, child);
        if (mightBeDirty(parent)) {
            return;
        }
        reportClean(parent);
    }
    function removeDirtyChild(parent, child) {
        var dc = parent.dirtyChildren;
        if (dc) {
            dc.delete(child);
            if (dc.size === 0) {
                if (emptySetPool.length < POOL_TARGET_SIZE) {
                    emptySetPool.push(dc);
                }
                parent.dirtyChildren = null;
            }
        }
    }
    // If the given entry has a reportOrphan method, and no remaining parents,
    // call entry.reportOrphan and return true iff it returns true. The
    // reportOrphan function should return true to indicate entry.dispose()
    // has been called, and the entry has been removed from any other caches
    // (see index.js for the only current example).
    function maybeReportOrphan(entry) {
        return entry.parents.size === 0 &&
            typeof entry.reportOrphan === "function" &&
            entry.reportOrphan() === true;
    }
    // Removes all children from this entry and returns an array of the
    // removed children.
    function forgetChildren(parent) {
        var children = reusableEmptyArray;
        if (parent.childValues.size > 0) {
            children = [];
            parent.childValues.forEach(function (_value, child) {
                forgetChild(parent, child);
                children.push(child);
            });
        }
        // After we forget all our children, this.dirtyChildren must be empty
        // and therefore must have been reset to null.
        assert(parent.dirtyChildren === null);
        return children;
    }
    function forgetChild(parent, child) {
        child.parents.delete(parent);
        parent.childValues.delete(child);
        removeDirtyChild(parent, child);
    }
    function maybeSubscribe(entry) {
        if (typeof entry.subscribe === "function") {
            try {
                maybeUnsubscribe(entry); // Prevent double subscriptions.
                entry.unsubscribe = entry.subscribe.apply(null, entry.args);
            }
            catch (e) {
                // If this Entry has a subscribe function and it threw an exception
                // (or an unsubscribe function it previously returned now throws),
                // return false to indicate that we were not able to subscribe (or
                // unsubscribe), and this Entry should remain dirty.
                entry.setDirty();
                return false;
            }
        }
        // Returning true indicates either that there was no entry.subscribe
        // function or that it succeeded.
        return true;
    }
    function maybeUnsubscribe(entry) {
        var unsubscribe = entry.unsubscribe;
        if (typeof unsubscribe === "function") {
            entry.unsubscribe = void 0;
            unsubscribe();
        }
    }

    // A trie data structure that holds object keys weakly, yet can also hold
    // non-object keys, unlike the native `WeakMap`.
    var KeyTrie = /** @class */ (function () {
        function KeyTrie(weakness) {
            this.weakness = weakness;
        }
        KeyTrie.prototype.lookup = function () {
            var array = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                array[_i] = arguments[_i];
            }
            return this.lookupArray(array);
        };
        KeyTrie.prototype.lookupArray = function (array) {
            var node = this;
            array.forEach(function (key) { return node = node.getChildTrie(key); });
            return node.data || (node.data = Object.create(null));
        };
        KeyTrie.prototype.getChildTrie = function (key) {
            var map = this.weakness && isObjRef(key)
                ? this.weak || (this.weak = new WeakMap())
                : this.strong || (this.strong = new Map());
            var child = map.get(key);
            if (!child)
                map.set(key, child = new KeyTrie(this.weakness));
            return child;
        };
        return KeyTrie;
    }());
    function isObjRef(value) {
        switch (typeof value) {
            case "object":
                if (value === null)
                    break;
            // Fall through to return true...
            case "function":
                return true;
        }
        return false;
    }

    // The defaultMakeCacheKey function is remarkably powerful, because it gives
    // a unique object for any shallow-identical list of arguments. If you need
    // to implement a custom makeCacheKey function, you may find it helpful to
    // delegate the final work to defaultMakeCacheKey, which is why we export it
    // here. However, you may want to avoid defaultMakeCacheKey if your runtime
    // does not support WeakMap, or you have the ability to return a string key.
    // In those cases, just write your own custom makeCacheKey functions.
    var keyTrie = new KeyTrie(typeof WeakMap === "function");
    function defaultMakeCacheKey() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return keyTrie.lookupArray(args);
    }
    var caches = new Set();
    function wrap(originalFunction, options) {
        if (options === void 0) { options = Object.create(null); }
        var cache = new Cache(options.max || Math.pow(2, 16), function (entry) { return entry.dispose(); });
        var disposable = !!options.disposable;
        var makeCacheKey = options.makeCacheKey || defaultMakeCacheKey;
        function optimistic() {
            if (disposable && !parentEntrySlot.hasValue()) {
                // If there's no current parent computation, and this wrapped
                // function is disposable (meaning we don't care about entry.value,
                // just dependency tracking), then we can short-cut everything else
                // in this function, because entry.recompute() is going to recycle
                // the entry object without recomputing anything, anyway.
                return void 0;
            }
            var key = makeCacheKey.apply(null, arguments);
            if (key === void 0) {
                return originalFunction.apply(null, arguments);
            }
            var args = Array.prototype.slice.call(arguments);
            var entry = cache.get(key);
            if (entry) {
                entry.args = args;
            }
            else {
                entry = new Entry(originalFunction, args);
                cache.set(key, entry);
                entry.subscribe = options.subscribe;
                if (disposable) {
                    entry.reportOrphan = function () { return cache.delete(key); };
                }
            }
            var value = entry.recompute();
            // Move this entry to the front of the least-recently used queue,
            // since we just finished computing its value.
            cache.set(key, entry);
            caches.add(cache);
            // Clean up any excess entries in the cache, but only if there is no
            // active parent entry, meaning we're not in the middle of a larger
            // computation that might be flummoxed by the cleaning.
            if (!parentEntrySlot.hasValue()) {
                caches.forEach(function (cache) { return cache.clean(); });
                caches.clear();
            }
            // If options.disposable is truthy, the caller of wrap is telling us
            // they don't care about the result of entry.recompute(), so we should
            // avoid returning the value, so it won't be accidentally used.
            return disposable ? void 0 : value;
        }
        optimistic.dirty = function () {
            var key = makeCacheKey.apply(null, arguments);
            var child = key !== void 0 && cache.get(key);
            if (child) {
                child.setDirty();
            }
        };
        return optimistic;
    }

    var haveWarned = false;
    function shouldWarn() {
        var answer = !haveWarned;
        if (!isTest()) {
            haveWarned = true;
        }
        return answer;
    }
    var HeuristicFragmentMatcher = (function () {
        function HeuristicFragmentMatcher() {
        }
        HeuristicFragmentMatcher.prototype.ensureReady = function () {
            return Promise.resolve();
        };
        HeuristicFragmentMatcher.prototype.canBypassInit = function () {
            return true;
        };
        HeuristicFragmentMatcher.prototype.match = function (idValue, typeCondition, context) {
            var obj = context.store.get(idValue.id);
            var isRootQuery = idValue.id === 'ROOT_QUERY';
            if (!obj) {
                return isRootQuery;
            }
            var _a = obj.__typename, __typename = _a === void 0 ? isRootQuery && 'Query' : _a;
            if (!__typename) {
                if (shouldWarn()) {
                    process.env.NODE_ENV === "production" || invariant.warn("You're using fragments in your queries, but either don't have the addTypename:\n  true option set in Apollo Client, or you are trying to write a fragment to the store without the __typename.\n   Please turn on the addTypename option and include __typename when writing fragments so that Apollo Client\n   can accurately match fragments.");
                    process.env.NODE_ENV === "production" || invariant.warn('Could not find __typename on Fragment ', typeCondition, obj);
                    process.env.NODE_ENV === "production" || invariant.warn("DEPRECATION WARNING: using fragments without __typename is unsupported behavior " +
                        "and will be removed in future versions of Apollo client. You should fix this and set addTypename to true now.");
                }
                return 'heuristic';
            }
            if (__typename === typeCondition) {
                return true;
            }
            if (shouldWarn()) {
                process.env.NODE_ENV === "production" || invariant.error('You are using the simple (heuristic) fragment matcher, but your ' +
                    'queries contain union or interface types. Apollo Client will not be ' +
                    'able to accurately map fragments. To make this error go away, use ' +
                    'the `IntrospectionFragmentMatcher` as described in the docs: ' +
                    'https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher');
            }
            return 'heuristic';
        };
        return HeuristicFragmentMatcher;
    }());

    var hasOwn = Object.prototype.hasOwnProperty;
    var DepTrackingCache = (function () {
        function DepTrackingCache(data) {
            var _this = this;
            if (data === void 0) { data = Object.create(null); }
            this.data = data;
            this.depend = wrap(function (dataId) { return _this.data[dataId]; }, {
                disposable: true,
                makeCacheKey: function (dataId) {
                    return dataId;
                },
            });
        }
        DepTrackingCache.prototype.toObject = function () {
            return this.data;
        };
        DepTrackingCache.prototype.get = function (dataId) {
            this.depend(dataId);
            return this.data[dataId];
        };
        DepTrackingCache.prototype.set = function (dataId, value) {
            var oldValue = this.data[dataId];
            if (value !== oldValue) {
                this.data[dataId] = value;
                this.depend.dirty(dataId);
            }
        };
        DepTrackingCache.prototype.delete = function (dataId) {
            if (hasOwn.call(this.data, dataId)) {
                delete this.data[dataId];
                this.depend.dirty(dataId);
            }
        };
        DepTrackingCache.prototype.clear = function () {
            this.replace(null);
        };
        DepTrackingCache.prototype.replace = function (newData) {
            var _this = this;
            if (newData) {
                Object.keys(newData).forEach(function (dataId) {
                    _this.set(dataId, newData[dataId]);
                });
                Object.keys(this.data).forEach(function (dataId) {
                    if (!hasOwn.call(newData, dataId)) {
                        _this.delete(dataId);
                    }
                });
            }
            else {
                Object.keys(this.data).forEach(function (dataId) {
                    _this.delete(dataId);
                });
            }
        };
        return DepTrackingCache;
    }());
    function defaultNormalizedCacheFactory(seed) {
        return new DepTrackingCache(seed);
    }

    var StoreReader = (function () {
        function StoreReader(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.cacheKeyRoot, cacheKeyRoot = _c === void 0 ? new KeyTrie(canUseWeakMap) : _c, _d = _b.freezeResults, freezeResults = _d === void 0 ? false : _d;
            var _e = this, executeStoreQuery = _e.executeStoreQuery, executeSelectionSet = _e.executeSelectionSet, executeSubSelectedArray = _e.executeSubSelectedArray;
            this.freezeResults = freezeResults;
            this.executeStoreQuery = wrap(function (options) {
                return executeStoreQuery.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var query = _a.query, rootValue = _a.rootValue, contextValue = _a.contextValue, variableValues = _a.variableValues, fragmentMatcher = _a.fragmentMatcher;
                    if (contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(contextValue.store, query, fragmentMatcher, JSON.stringify(variableValues), rootValue.id);
                    }
                }
            });
            this.executeSelectionSet = wrap(function (options) {
                return executeSelectionSet.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var selectionSet = _a.selectionSet, rootValue = _a.rootValue, execContext = _a.execContext;
                    if (execContext.contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(execContext.contextValue.store, selectionSet, execContext.fragmentMatcher, JSON.stringify(execContext.variableValues), rootValue.id);
                    }
                }
            });
            this.executeSubSelectedArray = wrap(function (options) {
                return executeSubSelectedArray.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var field = _a.field, array = _a.array, execContext = _a.execContext;
                    if (execContext.contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(execContext.contextValue.store, field, array, JSON.stringify(execContext.variableValues));
                    }
                }
            });
        }
        StoreReader.prototype.readQueryFromStore = function (options) {
            return this.diffQueryAgainstStore(__assign(__assign({}, options), { returnPartialData: false })).result;
        };
        StoreReader.prototype.diffQueryAgainstStore = function (_a) {
            var store = _a.store, query = _a.query, variables = _a.variables, previousResult = _a.previousResult, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? true : _b, _c = _a.rootId, rootId = _c === void 0 ? 'ROOT_QUERY' : _c, fragmentMatcherFunction = _a.fragmentMatcherFunction, config = _a.config;
            var queryDefinition = getQueryDefinition(query);
            variables = assign({}, getDefaultValues(queryDefinition), variables);
            var context = {
                store: store,
                dataIdFromObject: config && config.dataIdFromObject,
                cacheRedirects: (config && config.cacheRedirects) || {},
            };
            var execResult = this.executeStoreQuery({
                query: query,
                rootValue: {
                    type: 'id',
                    id: rootId,
                    generated: true,
                    typename: 'Query',
                },
                contextValue: context,
                variableValues: variables,
                fragmentMatcher: fragmentMatcherFunction,
            });
            var hasMissingFields = execResult.missing && execResult.missing.length > 0;
            if (hasMissingFields && !returnPartialData) {
                execResult.missing.forEach(function (info) {
                    if (info.tolerable)
                        return;
                    throw process.env.NODE_ENV === "production" ? new InvariantError(8) : new InvariantError("Can't find field " + info.fieldName + " on object " + JSON.stringify(info.object, null, 2) + ".");
                });
            }
            if (previousResult) {
                if (equal(previousResult, execResult.result)) {
                    execResult.result = previousResult;
                }
            }
            return {
                result: execResult.result,
                complete: !hasMissingFields,
            };
        };
        StoreReader.prototype.executeStoreQuery = function (_a) {
            var query = _a.query, rootValue = _a.rootValue, contextValue = _a.contextValue, variableValues = _a.variableValues, _b = _a.fragmentMatcher, fragmentMatcher = _b === void 0 ? defaultFragmentMatcher : _b;
            var mainDefinition = getMainDefinition(query);
            var fragments = getFragmentDefinitions(query);
            var fragmentMap = createFragmentMap(fragments);
            var execContext = {
                query: query,
                fragmentMap: fragmentMap,
                contextValue: contextValue,
                variableValues: variableValues,
                fragmentMatcher: fragmentMatcher,
            };
            return this.executeSelectionSet({
                selectionSet: mainDefinition.selectionSet,
                rootValue: rootValue,
                execContext: execContext,
            });
        };
        StoreReader.prototype.executeSelectionSet = function (_a) {
            var _this = this;
            var selectionSet = _a.selectionSet, rootValue = _a.rootValue, execContext = _a.execContext;
            var fragmentMap = execContext.fragmentMap, contextValue = execContext.contextValue, variables = execContext.variableValues;
            var finalResult = { result: null };
            var objectsToMerge = [];
            var object = contextValue.store.get(rootValue.id);
            var typename = (object && object.__typename) ||
                (rootValue.id === 'ROOT_QUERY' && 'Query') ||
                void 0;
            function handleMissing(result) {
                var _a;
                if (result.missing) {
                    finalResult.missing = finalResult.missing || [];
                    (_a = finalResult.missing).push.apply(_a, result.missing);
                }
                return result.result;
            }
            selectionSet.selections.forEach(function (selection) {
                var _a;
                if (!shouldInclude(selection, variables)) {
                    return;
                }
                if (isField(selection)) {
                    var fieldResult = handleMissing(_this.executeField(object, typename, selection, execContext));
                    if (typeof fieldResult !== 'undefined') {
                        objectsToMerge.push((_a = {},
                            _a[resultKeyNameFromField(selection)] = fieldResult,
                            _a));
                    }
                }
                else {
                    var fragment = void 0;
                    if (isInlineFragment(selection)) {
                        fragment = selection;
                    }
                    else {
                        fragment = fragmentMap[selection.name.value];
                        if (!fragment) {
                            throw process.env.NODE_ENV === "production" ? new InvariantError(9) : new InvariantError("No fragment named " + selection.name.value);
                        }
                    }
                    var typeCondition = fragment.typeCondition && fragment.typeCondition.name.value;
                    var match = !typeCondition ||
                        execContext.fragmentMatcher(rootValue, typeCondition, contextValue);
                    if (match) {
                        var fragmentExecResult = _this.executeSelectionSet({
                            selectionSet: fragment.selectionSet,
                            rootValue: rootValue,
                            execContext: execContext,
                        });
                        if (match === 'heuristic' && fragmentExecResult.missing) {
                            fragmentExecResult = __assign(__assign({}, fragmentExecResult), { missing: fragmentExecResult.missing.map(function (info) {
                                    return __assign(__assign({}, info), { tolerable: true });
                                }) });
                        }
                        objectsToMerge.push(handleMissing(fragmentExecResult));
                    }
                }
            });
            finalResult.result = mergeDeepArray(objectsToMerge);
            if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                Object.freeze(finalResult.result);
            }
            return finalResult;
        };
        StoreReader.prototype.executeField = function (object, typename, field, execContext) {
            var variables = execContext.variableValues, contextValue = execContext.contextValue;
            var fieldName = field.name.value;
            var args = argumentsObjectFromField(field, variables);
            var info = {
                resultKey: resultKeyNameFromField(field),
                directives: getDirectiveInfoFromField(field, variables),
            };
            var readStoreResult = readStoreResolver(object, typename, fieldName, args, contextValue, info);
            if (Array.isArray(readStoreResult.result)) {
                return this.combineExecResults(readStoreResult, this.executeSubSelectedArray({
                    field: field,
                    array: readStoreResult.result,
                    execContext: execContext,
                }));
            }
            if (!field.selectionSet) {
                assertSelectionSetForIdValue(field, readStoreResult.result);
                if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                    maybeDeepFreeze(readStoreResult);
                }
                return readStoreResult;
            }
            if (readStoreResult.result == null) {
                return readStoreResult;
            }
            return this.combineExecResults(readStoreResult, this.executeSelectionSet({
                selectionSet: field.selectionSet,
                rootValue: readStoreResult.result,
                execContext: execContext,
            }));
        };
        StoreReader.prototype.combineExecResults = function () {
            var execResults = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                execResults[_i] = arguments[_i];
            }
            var missing;
            execResults.forEach(function (execResult) {
                if (execResult.missing) {
                    missing = missing || [];
                    missing.push.apply(missing, execResult.missing);
                }
            });
            return {
                result: execResults.pop().result,
                missing: missing,
            };
        };
        StoreReader.prototype.executeSubSelectedArray = function (_a) {
            var _this = this;
            var field = _a.field, array = _a.array, execContext = _a.execContext;
            var missing;
            function handleMissing(childResult) {
                if (childResult.missing) {
                    missing = missing || [];
                    missing.push.apply(missing, childResult.missing);
                }
                return childResult.result;
            }
            array = array.map(function (item) {
                if (item === null) {
                    return null;
                }
                if (Array.isArray(item)) {
                    return handleMissing(_this.executeSubSelectedArray({
                        field: field,
                        array: item,
                        execContext: execContext,
                    }));
                }
                if (field.selectionSet) {
                    return handleMissing(_this.executeSelectionSet({
                        selectionSet: field.selectionSet,
                        rootValue: item,
                        execContext: execContext,
                    }));
                }
                assertSelectionSetForIdValue(field, item);
                return item;
            });
            if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                Object.freeze(array);
            }
            return { result: array, missing: missing };
        };
        return StoreReader;
    }());
    function assertSelectionSetForIdValue(field, value) {
        if (!field.selectionSet && isIdValue(value)) {
            throw process.env.NODE_ENV === "production" ? new InvariantError(10) : new InvariantError("Missing selection set for object of type " + value.typename + " returned for query field " + field.name.value);
        }
    }
    function defaultFragmentMatcher() {
        return true;
    }
    function readStoreResolver(object, typename, fieldName, args, context, _a) {
        var resultKey = _a.resultKey, directives = _a.directives;
        var storeKeyName = fieldName;
        if (args || directives) {
            storeKeyName = getStoreKeyName(storeKeyName, args, directives);
        }
        var fieldValue = void 0;
        if (object) {
            fieldValue = object[storeKeyName];
            if (typeof fieldValue === 'undefined' &&
                context.cacheRedirects &&
                typeof typename === 'string') {
                var type = context.cacheRedirects[typename];
                if (type) {
                    var resolver = type[fieldName];
                    if (resolver) {
                        fieldValue = resolver(object, args, {
                            getCacheKey: function (storeObj) {
                                var id = context.dataIdFromObject(storeObj);
                                return id && toIdValue({
                                    id: id,
                                    typename: storeObj.__typename,
                                });
                            },
                        });
                    }
                }
            }
        }
        if (typeof fieldValue === 'undefined') {
            return {
                result: fieldValue,
                missing: [{
                        object: object,
                        fieldName: storeKeyName,
                        tolerable: false,
                    }],
            };
        }
        if (isJsonValue(fieldValue)) {
            fieldValue = fieldValue.json;
        }
        return {
            result: fieldValue,
        };
    }

    var ObjectCache = (function () {
        function ObjectCache(data) {
            if (data === void 0) { data = Object.create(null); }
            this.data = data;
        }
        ObjectCache.prototype.toObject = function () {
            return this.data;
        };
        ObjectCache.prototype.get = function (dataId) {
            return this.data[dataId];
        };
        ObjectCache.prototype.set = function (dataId, value) {
            this.data[dataId] = value;
        };
        ObjectCache.prototype.delete = function (dataId) {
            this.data[dataId] = void 0;
        };
        ObjectCache.prototype.clear = function () {
            this.data = Object.create(null);
        };
        ObjectCache.prototype.replace = function (newData) {
            this.data = newData || Object.create(null);
        };
        return ObjectCache;
    }());

    var WriteError = (function (_super) {
        __extends(WriteError, _super);
        function WriteError() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.type = 'WriteError';
            return _this;
        }
        return WriteError;
    }(Error));
    function enhanceErrorWithDocument(error, document) {
        var enhancedError = new WriteError("Error writing result to store for query:\n " + JSON.stringify(document));
        enhancedError.message += '\n' + error.message;
        enhancedError.stack = error.stack;
        return enhancedError;
    }
    var StoreWriter = (function () {
        function StoreWriter() {
        }
        StoreWriter.prototype.writeQueryToStore = function (_a) {
            var query = _a.query, result = _a.result, _b = _a.store, store = _b === void 0 ? defaultNormalizedCacheFactory() : _b, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, fragmentMatcherFunction = _a.fragmentMatcherFunction;
            return this.writeResultToStore({
                dataId: 'ROOT_QUERY',
                result: result,
                document: query,
                store: store,
                variables: variables,
                dataIdFromObject: dataIdFromObject,
                fragmentMatcherFunction: fragmentMatcherFunction,
            });
        };
        StoreWriter.prototype.writeResultToStore = function (_a) {
            var dataId = _a.dataId, result = _a.result, document = _a.document, _b = _a.store, store = _b === void 0 ? defaultNormalizedCacheFactory() : _b, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, fragmentMatcherFunction = _a.fragmentMatcherFunction;
            var operationDefinition = getOperationDefinition(document);
            try {
                return this.writeSelectionSetToStore({
                    result: result,
                    dataId: dataId,
                    selectionSet: operationDefinition.selectionSet,
                    context: {
                        store: store,
                        processedData: {},
                        variables: assign({}, getDefaultValues(operationDefinition), variables),
                        dataIdFromObject: dataIdFromObject,
                        fragmentMap: createFragmentMap(getFragmentDefinitions(document)),
                        fragmentMatcherFunction: fragmentMatcherFunction,
                    },
                });
            }
            catch (e) {
                throw enhanceErrorWithDocument(e, document);
            }
        };
        StoreWriter.prototype.writeSelectionSetToStore = function (_a) {
            var _this = this;
            var result = _a.result, dataId = _a.dataId, selectionSet = _a.selectionSet, context = _a.context;
            var variables = context.variables, store = context.store, fragmentMap = context.fragmentMap;
            selectionSet.selections.forEach(function (selection) {
                var _a;
                if (!shouldInclude(selection, variables)) {
                    return;
                }
                if (isField(selection)) {
                    var resultFieldKey = resultKeyNameFromField(selection);
                    var value = result[resultFieldKey];
                    if (typeof value !== 'undefined') {
                        _this.writeFieldToStore({
                            dataId: dataId,
                            value: value,
                            field: selection,
                            context: context,
                        });
                    }
                    else {
                        var isDefered = false;
                        var isClient = false;
                        if (selection.directives && selection.directives.length) {
                            isDefered = selection.directives.some(function (directive) { return directive.name && directive.name.value === 'defer'; });
                            isClient = selection.directives.some(function (directive) { return directive.name && directive.name.value === 'client'; });
                        }
                        if (!isDefered && !isClient && context.fragmentMatcherFunction) {
                            process.env.NODE_ENV === "production" || invariant.warn("Missing field " + resultFieldKey + " in " + JSON.stringify(result, null, 2).substring(0, 100));
                        }
                    }
                }
                else {
                    var fragment = void 0;
                    if (isInlineFragment(selection)) {
                        fragment = selection;
                    }
                    else {
                        fragment = (fragmentMap || {})[selection.name.value];
                        process.env.NODE_ENV === "production" ? invariant(fragment, 4) : invariant(fragment, "No fragment named " + selection.name.value + ".");
                    }
                    var matches = true;
                    if (context.fragmentMatcherFunction && fragment.typeCondition) {
                        var id = dataId || 'self';
                        var idValue = toIdValue({ id: id, typename: undefined });
                        var fakeContext = {
                            store: new ObjectCache((_a = {}, _a[id] = result, _a)),
                            cacheRedirects: {},
                        };
                        var match = context.fragmentMatcherFunction(idValue, fragment.typeCondition.name.value, fakeContext);
                        if (!isProduction() && match === 'heuristic') {
                            process.env.NODE_ENV === "production" || invariant.error('WARNING: heuristic fragment matching going on!');
                        }
                        matches = !!match;
                    }
                    if (matches) {
                        _this.writeSelectionSetToStore({
                            result: result,
                            selectionSet: fragment.selectionSet,
                            dataId: dataId,
                            context: context,
                        });
                    }
                }
            });
            return store;
        };
        StoreWriter.prototype.writeFieldToStore = function (_a) {
            var _b;
            var field = _a.field, value = _a.value, dataId = _a.dataId, context = _a.context;
            var variables = context.variables, dataIdFromObject = context.dataIdFromObject, store = context.store;
            var storeValue;
            var storeObject;
            var storeFieldName = storeKeyNameFromField(field, variables);
            if (!field.selectionSet || value === null) {
                storeValue =
                    value != null && typeof value === 'object'
                        ?
                            { type: 'json', json: value }
                        :
                            value;
            }
            else if (Array.isArray(value)) {
                var generatedId = dataId + "." + storeFieldName;
                storeValue = this.processArrayValue(value, generatedId, field.selectionSet, context);
            }
            else {
                var valueDataId = dataId + "." + storeFieldName;
                var generated = true;
                if (!isGeneratedId(valueDataId)) {
                    valueDataId = '$' + valueDataId;
                }
                if (dataIdFromObject) {
                    var semanticId = dataIdFromObject(value);
                    process.env.NODE_ENV === "production" ? invariant(!semanticId || !isGeneratedId(semanticId), 5) : invariant(!semanticId || !isGeneratedId(semanticId), 'IDs returned by dataIdFromObject cannot begin with the "$" character.');
                    if (semanticId ||
                        (typeof semanticId === 'number' && semanticId === 0)) {
                        valueDataId = semanticId;
                        generated = false;
                    }
                }
                if (!isDataProcessed(valueDataId, field, context.processedData)) {
                    this.writeSelectionSetToStore({
                        dataId: valueDataId,
                        result: value,
                        selectionSet: field.selectionSet,
                        context: context,
                    });
                }
                var typename = value.__typename;
                storeValue = toIdValue({ id: valueDataId, typename: typename }, generated);
                storeObject = store.get(dataId);
                var escapedId = storeObject && storeObject[storeFieldName];
                if (escapedId !== storeValue && isIdValue(escapedId)) {
                    var hadTypename = escapedId.typename !== undefined;
                    var hasTypename = typename !== undefined;
                    var typenameChanged = hadTypename && hasTypename && escapedId.typename !== typename;
                    process.env.NODE_ENV === "production" ? invariant(!generated || escapedId.generated || typenameChanged, 6) : invariant(!generated || escapedId.generated || typenameChanged, "Store error: the application attempted to write an object with no provided id but the store already contains an id of " + escapedId.id + " for this object. The selectionSet that was trying to be written is:\n" + JSON.stringify(field));
                    process.env.NODE_ENV === "production" ? invariant(!hadTypename || hasTypename, 7) : invariant(!hadTypename || hasTypename, "Store error: the application attempted to write an object with no provided typename but the store already contains an object with typename of " + escapedId.typename + " for the object of id " + escapedId.id + ". The selectionSet that was trying to be written is:\n" + JSON.stringify(field));
                    if (escapedId.generated) {
                        if (typenameChanged) {
                            if (!generated) {
                                store.delete(escapedId.id);
                            }
                        }
                        else {
                            mergeWithGenerated(escapedId.id, storeValue.id, store);
                        }
                    }
                }
            }
            storeObject = store.get(dataId);
            if (!storeObject || !equal(storeValue, storeObject[storeFieldName])) {
                store.set(dataId, __assign(__assign({}, storeObject), (_b = {}, _b[storeFieldName] = storeValue, _b)));
            }
        };
        StoreWriter.prototype.processArrayValue = function (value, generatedId, selectionSet, context) {
            var _this = this;
            return value.map(function (item, index) {
                if (item === null) {
                    return null;
                }
                var itemDataId = generatedId + "." + index;
                if (Array.isArray(item)) {
                    return _this.processArrayValue(item, itemDataId, selectionSet, context);
                }
                var generated = true;
                if (context.dataIdFromObject) {
                    var semanticId = context.dataIdFromObject(item);
                    if (semanticId) {
                        itemDataId = semanticId;
                        generated = false;
                    }
                }
                if (!isDataProcessed(itemDataId, selectionSet, context.processedData)) {
                    _this.writeSelectionSetToStore({
                        dataId: itemDataId,
                        result: item,
                        selectionSet: selectionSet,
                        context: context,
                    });
                }
                return toIdValue({ id: itemDataId, typename: item.__typename }, generated);
            });
        };
        return StoreWriter;
    }());
    function isGeneratedId(id) {
        return id[0] === '$';
    }
    function mergeWithGenerated(generatedKey, realKey, cache) {
        if (generatedKey === realKey) {
            return false;
        }
        var generated = cache.get(generatedKey);
        var real = cache.get(realKey);
        var madeChanges = false;
        Object.keys(generated).forEach(function (key) {
            var value = generated[key];
            var realValue = real[key];
            if (isIdValue(value) &&
                isGeneratedId(value.id) &&
                isIdValue(realValue) &&
                !equal(value, realValue) &&
                mergeWithGenerated(value.id, realValue.id, cache)) {
                madeChanges = true;
            }
        });
        cache.delete(generatedKey);
        var newRealValue = __assign(__assign({}, generated), real);
        if (equal(newRealValue, real)) {
            return madeChanges;
        }
        cache.set(realKey, newRealValue);
        return true;
    }
    function isDataProcessed(dataId, field, processedData) {
        if (!processedData) {
            return false;
        }
        if (processedData[dataId]) {
            if (processedData[dataId].indexOf(field) >= 0) {
                return true;
            }
            else {
                processedData[dataId].push(field);
            }
        }
        else {
            processedData[dataId] = [field];
        }
        return false;
    }

    var defaultConfig = {
        fragmentMatcher: new HeuristicFragmentMatcher(),
        dataIdFromObject: defaultDataIdFromObject,
        addTypename: true,
        resultCaching: true,
        freezeResults: false,
    };
    function defaultDataIdFromObject(result) {
        if (result.__typename) {
            if (result.id !== undefined) {
                return result.__typename + ":" + result.id;
            }
            if (result._id !== undefined) {
                return result.__typename + ":" + result._id;
            }
        }
        return null;
    }
    var hasOwn$1 = Object.prototype.hasOwnProperty;
    var OptimisticCacheLayer = (function (_super) {
        __extends(OptimisticCacheLayer, _super);
        function OptimisticCacheLayer(optimisticId, parent, transaction) {
            var _this = _super.call(this, Object.create(null)) || this;
            _this.optimisticId = optimisticId;
            _this.parent = parent;
            _this.transaction = transaction;
            return _this;
        }
        OptimisticCacheLayer.prototype.toObject = function () {
            return __assign(__assign({}, this.parent.toObject()), this.data);
        };
        OptimisticCacheLayer.prototype.get = function (dataId) {
            return hasOwn$1.call(this.data, dataId)
                ? this.data[dataId]
                : this.parent.get(dataId);
        };
        return OptimisticCacheLayer;
    }(ObjectCache));
    var InMemoryCache = (function (_super) {
        __extends(InMemoryCache, _super);
        function InMemoryCache(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this) || this;
            _this.watches = new Set();
            _this.typenameDocumentCache = new Map();
            _this.cacheKeyRoot = new KeyTrie(canUseWeakMap);
            _this.silenceBroadcast = false;
            _this.config = __assign(__assign({}, defaultConfig), config);
            if (_this.config.customResolvers) {
                process.env.NODE_ENV === "production" || invariant.warn('customResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating customResolvers in the next major version.');
                _this.config.cacheRedirects = _this.config.customResolvers;
            }
            if (_this.config.cacheResolvers) {
                process.env.NODE_ENV === "production" || invariant.warn('cacheResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating cacheResolvers in the next major version.');
                _this.config.cacheRedirects = _this.config.cacheResolvers;
            }
            _this.addTypename = !!_this.config.addTypename;
            _this.data = _this.config.resultCaching
                ? new DepTrackingCache()
                : new ObjectCache();
            _this.optimisticData = _this.data;
            _this.storeWriter = new StoreWriter();
            _this.storeReader = new StoreReader({
                cacheKeyRoot: _this.cacheKeyRoot,
                freezeResults: config.freezeResults,
            });
            var cache = _this;
            var maybeBroadcastWatch = cache.maybeBroadcastWatch;
            _this.maybeBroadcastWatch = wrap(function (c) {
                return maybeBroadcastWatch.call(_this, c);
            }, {
                makeCacheKey: function (c) {
                    if (c.optimistic) {
                        return;
                    }
                    if (c.previousResult) {
                        return;
                    }
                    if (cache.data instanceof DepTrackingCache) {
                        return cache.cacheKeyRoot.lookup(c.query, JSON.stringify(c.variables));
                    }
                }
            });
            return _this;
        }
        InMemoryCache.prototype.restore = function (data) {
            if (data)
                this.data.replace(data);
            return this;
        };
        InMemoryCache.prototype.extract = function (optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return (optimistic ? this.optimisticData : this.data).toObject();
        };
        InMemoryCache.prototype.read = function (options) {
            if (typeof options.rootId === 'string' &&
                typeof this.data.get(options.rootId) === 'undefined') {
                return null;
            }
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            return this.storeReader.readQueryFromStore({
                store: options.optimistic ? this.optimisticData : this.data,
                query: this.transformDocument(options.query),
                variables: options.variables,
                rootId: options.rootId,
                fragmentMatcherFunction: fragmentMatcherFunction,
                previousResult: options.previousResult,
                config: this.config,
            }) || null;
        };
        InMemoryCache.prototype.write = function (write) {
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            this.storeWriter.writeResultToStore({
                dataId: write.dataId,
                result: write.result,
                variables: write.variables,
                document: this.transformDocument(write.query),
                store: this.data,
                dataIdFromObject: this.config.dataIdFromObject,
                fragmentMatcherFunction: fragmentMatcherFunction,
            });
            this.broadcastWatches();
        };
        InMemoryCache.prototype.diff = function (query) {
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            return this.storeReader.diffQueryAgainstStore({
                store: query.optimistic ? this.optimisticData : this.data,
                query: this.transformDocument(query.query),
                variables: query.variables,
                returnPartialData: query.returnPartialData,
                previousResult: query.previousResult,
                fragmentMatcherFunction: fragmentMatcherFunction,
                config: this.config,
            });
        };
        InMemoryCache.prototype.watch = function (watch) {
            var _this = this;
            this.watches.add(watch);
            return function () {
                _this.watches.delete(watch);
            };
        };
        InMemoryCache.prototype.evict = function (query) {
            throw process.env.NODE_ENV === "production" ? new InvariantError(1) : new InvariantError("eviction is not implemented on InMemory Cache");
        };
        InMemoryCache.prototype.reset = function () {
            this.data.clear();
            this.broadcastWatches();
            return Promise.resolve();
        };
        InMemoryCache.prototype.removeOptimistic = function (idToRemove) {
            var toReapply = [];
            var removedCount = 0;
            var layer = this.optimisticData;
            while (layer instanceof OptimisticCacheLayer) {
                if (layer.optimisticId === idToRemove) {
                    ++removedCount;
                }
                else {
                    toReapply.push(layer);
                }
                layer = layer.parent;
            }
            if (removedCount > 0) {
                this.optimisticData = layer;
                while (toReapply.length > 0) {
                    var layer_1 = toReapply.pop();
                    this.performTransaction(layer_1.transaction, layer_1.optimisticId);
                }
                this.broadcastWatches();
            }
        };
        InMemoryCache.prototype.performTransaction = function (transaction, optimisticId) {
            var _a = this, data = _a.data, silenceBroadcast = _a.silenceBroadcast;
            this.silenceBroadcast = true;
            if (typeof optimisticId === 'string') {
                this.data = this.optimisticData = new OptimisticCacheLayer(optimisticId, this.optimisticData, transaction);
            }
            try {
                transaction(this);
            }
            finally {
                this.silenceBroadcast = silenceBroadcast;
                this.data = data;
            }
            this.broadcastWatches();
        };
        InMemoryCache.prototype.recordOptimisticTransaction = function (transaction, id) {
            return this.performTransaction(transaction, id);
        };
        InMemoryCache.prototype.transformDocument = function (document) {
            if (this.addTypename) {
                var result = this.typenameDocumentCache.get(document);
                if (!result) {
                    result = addTypenameToDocument(document);
                    this.typenameDocumentCache.set(document, result);
                    this.typenameDocumentCache.set(result, result);
                }
                return result;
            }
            return document;
        };
        InMemoryCache.prototype.broadcastWatches = function () {
            var _this = this;
            if (!this.silenceBroadcast) {
                this.watches.forEach(function (c) { return _this.maybeBroadcastWatch(c); });
            }
        };
        InMemoryCache.prototype.maybeBroadcastWatch = function (c) {
            c.callback(this.diff({
                query: c.query,
                variables: c.variables,
                previousResult: c.previousResult && c.previousResult(),
                optimistic: c.optimistic,
            }));
        };
        return InMemoryCache;
    }(ApolloCache));

    /**
     * Produces the value of a block string from its parsed raw value, similar to
     * CoffeeScript's block string, Python's docstring trim or Ruby's strip_heredoc.
     *
     * This implements the GraphQL spec's BlockStringValue() static algorithm.
     *
     * @internal
     */
    function dedentBlockStringValue(rawString) {
      // Expand a block string's raw value into independent lines.
      var lines = rawString.split(/\r\n|[\n\r]/g); // Remove common indentation from all lines but first.

      var commonIndent = getBlockStringIndentation(lines);

      if (commonIndent !== 0) {
        for (var i = 1; i < lines.length; i++) {
          lines[i] = lines[i].slice(commonIndent);
        }
      } // Remove leading and trailing blank lines.


      while (lines.length > 0 && isBlank(lines[0])) {
        lines.shift();
      }

      while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
        lines.pop();
      } // Return a string of the lines joined with U+000A.


      return lines.join('\n');
    }
    /**
     * @internal
     */

    function getBlockStringIndentation(lines) {
      var commonIndent = null;

      for (var i = 1; i < lines.length; i++) {
        var line = lines[i];
        var indent = leadingWhitespace(line);

        if (indent === line.length) {
          continue; // skip empty lines
        }

        if (commonIndent === null || indent < commonIndent) {
          commonIndent = indent;

          if (commonIndent === 0) {
            break;
          }
        }
      }

      return commonIndent === null ? 0 : commonIndent;
    }

    function leadingWhitespace(str) {
      var i = 0;

      while (i < str.length && (str[i] === ' ' || str[i] === '\t')) {
        i++;
      }

      return i;
    }

    function isBlank(str) {
      return leadingWhitespace(str) === str.length;
    }
    /**
     * Print a block string in the indented block form by adding a leading and
     * trailing blank line. However, if a block string starts with whitespace and is
     * a single-line, adding a leading blank line would strip that whitespace.
     *
     * @internal
     */


    function printBlockString(value) {
      var indentation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var preferMultipleLines = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var isSingleLine = value.indexOf('\n') === -1;
      var hasLeadingSpace = value[0] === ' ' || value[0] === '\t';
      var hasTrailingQuote = value[value.length - 1] === '"';
      var printAsMultipleLines = !isSingleLine || hasTrailingQuote || preferMultipleLines;
      var result = ''; // Format a multi-line block quote to account for leading space.

      if (printAsMultipleLines && !(isSingleLine && hasLeadingSpace)) {
        result += '\n' + indentation;
      }

      result += indentation ? value.replace(/\n/g, '\n' + indentation) : value;

      if (printAsMultipleLines) {
        result += '\n';
      }

      return '"""' + result.replace(/"""/g, '\\"""') + '"""';
    }

    /**
     * Converts an AST into a string, using one set of reasonable
     * formatting rules.
     */

    function print(ast) {
      return visit(ast, {
        leave: printDocASTReducer
      });
    } // TODO: provide better type coverage in future

    var printDocASTReducer = {
      Name: function Name(node) {
        return node.value;
      },
      Variable: function Variable(node) {
        return '$' + node.name;
      },
      // Document
      Document: function Document(node) {
        return join(node.definitions, '\n\n') + '\n';
      },
      OperationDefinition: function OperationDefinition(node) {
        var op = node.operation;
        var name = node.name;
        var varDefs = wrap$1('(', join(node.variableDefinitions, ', '), ')');
        var directives = join(node.directives, ' ');
        var selectionSet = node.selectionSet; // Anonymous queries with no directives or variable definitions can use
        // the query short form.

        return !name && !directives && !varDefs && op === 'query' ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], ' ');
      },
      VariableDefinition: function VariableDefinition(_ref) {
        var variable = _ref.variable,
            type = _ref.type,
            defaultValue = _ref.defaultValue,
            directives = _ref.directives;
        return variable + ': ' + type + wrap$1(' = ', defaultValue) + wrap$1(' ', join(directives, ' '));
      },
      SelectionSet: function SelectionSet(_ref2) {
        var selections = _ref2.selections;
        return block(selections);
      },
      Field: function Field(_ref3) {
        var alias = _ref3.alias,
            name = _ref3.name,
            args = _ref3.arguments,
            directives = _ref3.directives,
            selectionSet = _ref3.selectionSet;
        return join([wrap$1('', alias, ': ') + name + wrap$1('(', join(args, ', '), ')'), join(directives, ' '), selectionSet], ' ');
      },
      Argument: function Argument(_ref4) {
        var name = _ref4.name,
            value = _ref4.value;
        return name + ': ' + value;
      },
      // Fragments
      FragmentSpread: function FragmentSpread(_ref5) {
        var name = _ref5.name,
            directives = _ref5.directives;
        return '...' + name + wrap$1(' ', join(directives, ' '));
      },
      InlineFragment: function InlineFragment(_ref6) {
        var typeCondition = _ref6.typeCondition,
            directives = _ref6.directives,
            selectionSet = _ref6.selectionSet;
        return join(['...', wrap$1('on ', typeCondition), join(directives, ' '), selectionSet], ' ');
      },
      FragmentDefinition: function FragmentDefinition(_ref7) {
        var name = _ref7.name,
            typeCondition = _ref7.typeCondition,
            variableDefinitions = _ref7.variableDefinitions,
            directives = _ref7.directives,
            selectionSet = _ref7.selectionSet;
        return (// Note: fragment variable definitions are experimental and may be changed
          // or removed in the future.
          "fragment ".concat(name).concat(wrap$1('(', join(variableDefinitions, ', '), ')'), " ") + "on ".concat(typeCondition, " ").concat(wrap$1('', join(directives, ' '), ' ')) + selectionSet
        );
      },
      // Value
      IntValue: function IntValue(_ref8) {
        var value = _ref8.value;
        return value;
      },
      FloatValue: function FloatValue(_ref9) {
        var value = _ref9.value;
        return value;
      },
      StringValue: function StringValue(_ref10, key) {
        var value = _ref10.value,
            isBlockString = _ref10.block;
        return isBlockString ? printBlockString(value, key === 'description' ? '' : '  ') : JSON.stringify(value);
      },
      BooleanValue: function BooleanValue(_ref11) {
        var value = _ref11.value;
        return value ? 'true' : 'false';
      },
      NullValue: function NullValue() {
        return 'null';
      },
      EnumValue: function EnumValue(_ref12) {
        var value = _ref12.value;
        return value;
      },
      ListValue: function ListValue(_ref13) {
        var values = _ref13.values;
        return '[' + join(values, ', ') + ']';
      },
      ObjectValue: function ObjectValue(_ref14) {
        var fields = _ref14.fields;
        return '{' + join(fields, ', ') + '}';
      },
      ObjectField: function ObjectField(_ref15) {
        var name = _ref15.name,
            value = _ref15.value;
        return name + ': ' + value;
      },
      // Directive
      Directive: function Directive(_ref16) {
        var name = _ref16.name,
            args = _ref16.arguments;
        return '@' + name + wrap$1('(', join(args, ', '), ')');
      },
      // Type
      NamedType: function NamedType(_ref17) {
        var name = _ref17.name;
        return name;
      },
      ListType: function ListType(_ref18) {
        var type = _ref18.type;
        return '[' + type + ']';
      },
      NonNullType: function NonNullType(_ref19) {
        var type = _ref19.type;
        return type + '!';
      },
      // Type System Definitions
      SchemaDefinition: addDescription(function (_ref20) {
        var directives = _ref20.directives,
            operationTypes = _ref20.operationTypes;
        return join(['schema', join(directives, ' '), block(operationTypes)], ' ');
      }),
      OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
        var operation = _ref21.operation,
            type = _ref21.type;
        return operation + ': ' + type;
      },
      ScalarTypeDefinition: addDescription(function (_ref22) {
        var name = _ref22.name,
            directives = _ref22.directives;
        return join(['scalar', name, join(directives, ' ')], ' ');
      }),
      ObjectTypeDefinition: addDescription(function (_ref23) {
        var name = _ref23.name,
            interfaces = _ref23.interfaces,
            directives = _ref23.directives,
            fields = _ref23.fields;
        return join(['type', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      }),
      FieldDefinition: addDescription(function (_ref24) {
        var name = _ref24.name,
            args = _ref24.arguments,
            type = _ref24.type,
            directives = _ref24.directives;
        return name + (hasMultilineItems(args) ? wrap$1('(\n', indent(join(args, '\n')), '\n)') : wrap$1('(', join(args, ', '), ')')) + ': ' + type + wrap$1(' ', join(directives, ' '));
      }),
      InputValueDefinition: addDescription(function (_ref25) {
        var name = _ref25.name,
            type = _ref25.type,
            defaultValue = _ref25.defaultValue,
            directives = _ref25.directives;
        return join([name + ': ' + type, wrap$1('= ', defaultValue), join(directives, ' ')], ' ');
      }),
      InterfaceTypeDefinition: addDescription(function (_ref26) {
        var name = _ref26.name,
            interfaces = _ref26.interfaces,
            directives = _ref26.directives,
            fields = _ref26.fields;
        return join(['interface', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      }),
      UnionTypeDefinition: addDescription(function (_ref27) {
        var name = _ref27.name,
            directives = _ref27.directives,
            types = _ref27.types;
        return join(['union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
      }),
      EnumTypeDefinition: addDescription(function (_ref28) {
        var name = _ref28.name,
            directives = _ref28.directives,
            values = _ref28.values;
        return join(['enum', name, join(directives, ' '), block(values)], ' ');
      }),
      EnumValueDefinition: addDescription(function (_ref29) {
        var name = _ref29.name,
            directives = _ref29.directives;
        return join([name, join(directives, ' ')], ' ');
      }),
      InputObjectTypeDefinition: addDescription(function (_ref30) {
        var name = _ref30.name,
            directives = _ref30.directives,
            fields = _ref30.fields;
        return join(['input', name, join(directives, ' '), block(fields)], ' ');
      }),
      DirectiveDefinition: addDescription(function (_ref31) {
        var name = _ref31.name,
            args = _ref31.arguments,
            repeatable = _ref31.repeatable,
            locations = _ref31.locations;
        return 'directive @' + name + (hasMultilineItems(args) ? wrap$1('(\n', indent(join(args, '\n')), '\n)') : wrap$1('(', join(args, ', '), ')')) + (repeatable ? ' repeatable' : '') + ' on ' + join(locations, ' | ');
      }),
      SchemaExtension: function SchemaExtension(_ref32) {
        var directives = _ref32.directives,
            operationTypes = _ref32.operationTypes;
        return join(['extend schema', join(directives, ' '), block(operationTypes)], ' ');
      },
      ScalarTypeExtension: function ScalarTypeExtension(_ref33) {
        var name = _ref33.name,
            directives = _ref33.directives;
        return join(['extend scalar', name, join(directives, ' ')], ' ');
      },
      ObjectTypeExtension: function ObjectTypeExtension(_ref34) {
        var name = _ref34.name,
            interfaces = _ref34.interfaces,
            directives = _ref34.directives,
            fields = _ref34.fields;
        return join(['extend type', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      },
      InterfaceTypeExtension: function InterfaceTypeExtension(_ref35) {
        var name = _ref35.name,
            interfaces = _ref35.interfaces,
            directives = _ref35.directives,
            fields = _ref35.fields;
        return join(['extend interface', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      },
      UnionTypeExtension: function UnionTypeExtension(_ref36) {
        var name = _ref36.name,
            directives = _ref36.directives,
            types = _ref36.types;
        return join(['extend union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
      },
      EnumTypeExtension: function EnumTypeExtension(_ref37) {
        var name = _ref37.name,
            directives = _ref37.directives,
            values = _ref37.values;
        return join(['extend enum', name, join(directives, ' '), block(values)], ' ');
      },
      InputObjectTypeExtension: function InputObjectTypeExtension(_ref38) {
        var name = _ref38.name,
            directives = _ref38.directives,
            fields = _ref38.fields;
        return join(['extend input', name, join(directives, ' '), block(fields)], ' ');
      }
    };

    function addDescription(cb) {
      return function (node) {
        return join([node.description, cb(node)], '\n');
      };
    }
    /**
     * Given maybeArray, print an empty string if it is null or empty, otherwise
     * print all items together separated by separator if provided
     */


    function join(maybeArray) {
      var _maybeArray$filter$jo;

      var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return (_maybeArray$filter$jo = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.filter(function (x) {
        return x;
      }).join(separator)) !== null && _maybeArray$filter$jo !== void 0 ? _maybeArray$filter$jo : '';
    }
    /**
     * Given array, print each item on its own line, wrapped in an
     * indented "{ }" block.
     */


    function block(array) {
      return array && array.length !== 0 ? '{\n' + indent(join(array, '\n')) + '\n}' : '';
    }
    /**
     * If maybeString is not null or empty, then wrap with start and end, otherwise
     * print an empty string.
     */


    function wrap$1(start, maybeString) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      return maybeString ? start + maybeString + end : '';
    }

    function indent(maybeString) {
      return maybeString && '  ' + maybeString.replace(/\n/g, '\n  ');
    }

    function isMultiline(string) {
      return string.indexOf('\n') !== -1;
    }

    function hasMultilineItems(maybeArray) {
      return maybeArray && maybeArray.some(isMultiline);
    }

    var defaultHttpOptions = {
        includeQuery: true,
        includeExtensions: false,
    };
    var defaultHeaders = {
        accept: '*/*',
        'content-type': 'application/json',
    };
    var defaultOptions = {
        method: 'POST',
    };
    var fallbackHttpConfig = {
        http: defaultHttpOptions,
        headers: defaultHeaders,
        options: defaultOptions,
    };
    var throwServerError = function (response, result, message) {
        var error = new Error(message);
        error.name = 'ServerError';
        error.response = response;
        error.statusCode = response.status;
        error.result = result;
        throw error;
    };
    var parseAndCheckHttpResponse = function (operations) { return function (response) {
        return (response
            .text()
            .then(function (bodyText) {
            try {
                return JSON.parse(bodyText);
            }
            catch (err) {
                var parseError = err;
                parseError.name = 'ServerParseError';
                parseError.response = response;
                parseError.statusCode = response.status;
                parseError.bodyText = bodyText;
                return Promise.reject(parseError);
            }
        })
            .then(function (result) {
            if (response.status >= 300) {
                throwServerError(response, result, "Response not successful: Received status code " + response.status);
            }
            if (!Array.isArray(result) &&
                !result.hasOwnProperty('data') &&
                !result.hasOwnProperty('errors')) {
                throwServerError(response, result, "Server response was missing for query '" + (Array.isArray(operations)
                    ? operations.map(function (op) { return op.operationName; })
                    : operations.operationName) + "'.");
            }
            return result;
        }));
    }; };
    var checkFetcher = function (fetcher) {
        if (!fetcher && typeof fetch === 'undefined') {
            var library = 'unfetch';
            if (typeof window === 'undefined')
                library = 'node-fetch';
            throw process.env.NODE_ENV === "production" ? new InvariantError(1) : new InvariantError("\nfetch is not found globally and no fetcher passed, to fix pass a fetch for\nyour environment like https://www.npmjs.com/package/" + library + ".\n\nFor example:\nimport fetch from '" + library + "';\nimport { createHttpLink } from 'apollo-link-http';\n\nconst link = createHttpLink({ uri: '/graphql', fetch: fetch });");
        }
    };
    var createSignalIfSupported = function () {
        if (typeof AbortController === 'undefined')
            return { controller: false, signal: false };
        var controller = new AbortController();
        var signal = controller.signal;
        return { controller: controller, signal: signal };
    };
    var selectHttpOptionsAndBody = function (operation, fallbackConfig) {
        var configs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            configs[_i - 2] = arguments[_i];
        }
        var options = __assign({}, fallbackConfig.options, { headers: fallbackConfig.headers, credentials: fallbackConfig.credentials });
        var http = fallbackConfig.http;
        configs.forEach(function (config) {
            options = __assign({}, options, config.options, { headers: __assign({}, options.headers, config.headers) });
            if (config.credentials)
                options.credentials = config.credentials;
            http = __assign({}, http, config.http);
        });
        var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
        var body = { operationName: operationName, variables: variables };
        if (http.includeExtensions)
            body.extensions = extensions;
        if (http.includeQuery)
            body.query = print(query);
        return {
            options: options,
            body: body,
        };
    };
    var serializeFetchParameter = function (p, label) {
        var serialized;
        try {
            serialized = JSON.stringify(p);
        }
        catch (e) {
            var parseError = process.env.NODE_ENV === "production" ? new InvariantError(2) : new InvariantError("Network request failed. " + label + " is not serializable: " + e.message);
            parseError.parseError = e;
            throw parseError;
        }
        return serialized;
    };
    var selectURI = function (operation, fallbackURI) {
        var context = operation.getContext();
        var contextURI = context.uri;
        if (contextURI) {
            return contextURI;
        }
        else if (typeof fallbackURI === 'function') {
            return fallbackURI(operation);
        }
        else {
            return fallbackURI || '/graphql';
        }
    };

    var createHttpLink = function (linkOptions) {
        if (linkOptions === void 0) { linkOptions = {}; }
        var _a = linkOptions.uri, uri = _a === void 0 ? '/graphql' : _a, fetcher = linkOptions.fetch, includeExtensions = linkOptions.includeExtensions, useGETForQueries = linkOptions.useGETForQueries, requestOptions = __rest(linkOptions, ["uri", "fetch", "includeExtensions", "useGETForQueries"]);
        checkFetcher(fetcher);
        if (!fetcher) {
            fetcher = fetch;
        }
        var linkConfig = {
            http: { includeExtensions: includeExtensions },
            options: requestOptions.fetchOptions,
            credentials: requestOptions.credentials,
            headers: requestOptions.headers,
        };
        return new ApolloLink(function (operation) {
            var chosenURI = selectURI(operation, uri);
            var context = operation.getContext();
            var clientAwarenessHeaders = {};
            if (context.clientAwareness) {
                var _a = context.clientAwareness, name_1 = _a.name, version = _a.version;
                if (name_1) {
                    clientAwarenessHeaders['apollographql-client-name'] = name_1;
                }
                if (version) {
                    clientAwarenessHeaders['apollographql-client-version'] = version;
                }
            }
            var contextHeaders = __assign({}, clientAwarenessHeaders, context.headers);
            var contextConfig = {
                http: context.http,
                options: context.fetchOptions,
                credentials: context.credentials,
                headers: contextHeaders,
            };
            var _b = selectHttpOptionsAndBody(operation, fallbackHttpConfig, linkConfig, contextConfig), options = _b.options, body = _b.body;
            var controller;
            if (!options.signal) {
                var _c = createSignalIfSupported(), _controller = _c.controller, signal = _c.signal;
                controller = _controller;
                if (controller)
                    options.signal = signal;
            }
            var definitionIsMutation = function (d) {
                return d.kind === 'OperationDefinition' && d.operation === 'mutation';
            };
            if (useGETForQueries &&
                !operation.query.definitions.some(definitionIsMutation)) {
                options.method = 'GET';
            }
            if (options.method === 'GET') {
                var _d = rewriteURIForGET(chosenURI, body), newURI = _d.newURI, parseError = _d.parseError;
                if (parseError) {
                    return fromError(parseError);
                }
                chosenURI = newURI;
            }
            else {
                try {
                    options.body = serializeFetchParameter(body, 'Payload');
                }
                catch (parseError) {
                    return fromError(parseError);
                }
            }
            return new Observable(function (observer) {
                fetcher(chosenURI, options)
                    .then(function (response) {
                    operation.setContext({ response: response });
                    return response;
                })
                    .then(parseAndCheckHttpResponse(operation))
                    .then(function (result) {
                    observer.next(result);
                    observer.complete();
                    return result;
                })
                    .catch(function (err) {
                    if (err.name === 'AbortError')
                        return;
                    if (err.result && err.result.errors && err.result.data) {
                        observer.next(err.result);
                    }
                    observer.error(err);
                });
                return function () {
                    if (controller)
                        controller.abort();
                };
            });
        });
    };
    function rewriteURIForGET(chosenURI, body) {
        var queryParams = [];
        var addQueryParam = function (key, value) {
            queryParams.push(key + "=" + encodeURIComponent(value));
        };
        if ('query' in body) {
            addQueryParam('query', body.query);
        }
        if (body.operationName) {
            addQueryParam('operationName', body.operationName);
        }
        if (body.variables) {
            var serializedVariables = void 0;
            try {
                serializedVariables = serializeFetchParameter(body.variables, 'Variables map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('variables', serializedVariables);
        }
        if (body.extensions) {
            var serializedExtensions = void 0;
            try {
                serializedExtensions = serializeFetchParameter(body.extensions, 'Extensions map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('extensions', serializedExtensions);
        }
        var fragment = '', preFragment = chosenURI;
        var fragmentStart = chosenURI.indexOf('#');
        if (fragmentStart !== -1) {
            fragment = chosenURI.substr(fragmentStart);
            preFragment = chosenURI.substr(0, fragmentStart);
        }
        var queryParamsPrefix = preFragment.indexOf('?') === -1 ? '?' : '&';
        var newURI = preFragment + queryParamsPrefix + queryParams.join('&') + fragment;
        return { newURI: newURI };
    }
    var HttpLink = (function (_super) {
        __extends(HttpLink, _super);
        function HttpLink(opts) {
            return _super.call(this, createHttpLink(opts).request) || this;
        }
        return HttpLink;
    }(ApolloLink));

    function onError(errorHandler) {
        return new ApolloLink(function (operation, forward) {
            return new Observable(function (observer) {
                var sub;
                var retriedSub;
                var retriedResult;
                try {
                    sub = forward(operation).subscribe({
                        next: function (result) {
                            if (result.errors) {
                                retriedResult = errorHandler({
                                    graphQLErrors: result.errors,
                                    response: result,
                                    operation: operation,
                                    forward: forward,
                                });
                                if (retriedResult) {
                                    retriedSub = retriedResult.subscribe({
                                        next: observer.next.bind(observer),
                                        error: observer.error.bind(observer),
                                        complete: observer.complete.bind(observer),
                                    });
                                    return;
                                }
                            }
                            observer.next(result);
                        },
                        error: function (networkError) {
                            retriedResult = errorHandler({
                                operation: operation,
                                networkError: networkError,
                                graphQLErrors: networkError &&
                                    networkError.result &&
                                    networkError.result.errors,
                                forward: forward,
                            });
                            if (retriedResult) {
                                retriedSub = retriedResult.subscribe({
                                    next: observer.next.bind(observer),
                                    error: observer.error.bind(observer),
                                    complete: observer.complete.bind(observer),
                                });
                                return;
                            }
                            observer.error(networkError);
                        },
                        complete: function () {
                            if (!retriedResult) {
                                observer.complete.bind(observer)();
                            }
                        },
                    });
                }
                catch (e) {
                    errorHandler({ networkError: e, operation: operation, forward: forward });
                    observer.error(e);
                }
                return function () {
                    if (sub)
                        sub.unsubscribe();
                    if (retriedSub)
                        sub.unsubscribe();
                };
            });
        });
    }
    var ErrorLink = (function (_super) {
        __extends(ErrorLink, _super);
        function ErrorLink(errorHandler) {
            var _this = _super.call(this) || this;
            _this.link = onError(errorHandler);
            return _this;
        }
        ErrorLink.prototype.request = function (operation, forward) {
            return this.link.request(operation, forward);
        };
        return ErrorLink;
    }(ApolloLink));

    function devAssert(condition, message) {
      var booleanCondition = Boolean(condition);
      /* istanbul ignore else (see transformation done in './resources/inlineInvariant.js') */

      if (!booleanCondition) {
        throw new Error(message);
      }
    }

    function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }

    /**
     * Return true if `value` is object-like. A value is object-like if it's not
     * `null` and has a `typeof` result of "object".
     */
    function isObjectLike(value) {
      return _typeof$1(value) == 'object' && value !== null;
    }

    // In ES2015 (or a polyfilled) environment, this will be Symbol.iterator
    /* istanbul ignore next (See: https://github.com/graphql/graphql-js/issues/2317) */

    var SYMBOL_TO_STRING_TAG = // $FlowFixMe Flow doesn't define `Symbol.toStringTag` yet
    typeof Symbol === 'function' ? Symbol.toStringTag : '@@toStringTag';

    /**
     * Represents a location in a Source.
     */

    /**
     * Takes a Source and a UTF-8 character offset, and returns the corresponding
     * line and column as a SourceLocation.
     */
    function getLocation(source, position) {
      var lineRegexp = /\r\n|[\n\r]/g;
      var line = 1;
      var column = position + 1;
      var match;

      while ((match = lineRegexp.exec(source.body)) && match.index < position) {
        line += 1;
        column = position + 1 - (match.index + match[0].length);
      }

      return {
        line: line,
        column: column
      };
    }

    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printLocation(location) {
      return printSourceLocation(location.source, getLocation(location.source, location.start));
    }
    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printSourceLocation(source, sourceLocation) {
      var firstLineColumnOffset = source.locationOffset.column - 1;
      var body = whitespace(firstLineColumnOffset) + source.body;
      var lineIndex = sourceLocation.line - 1;
      var lineOffset = source.locationOffset.line - 1;
      var lineNum = sourceLocation.line + lineOffset;
      var columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
      var columnNum = sourceLocation.column + columnOffset;
      var locationStr = "".concat(source.name, ":").concat(lineNum, ":").concat(columnNum, "\n");
      var lines = body.split(/\r\n|[\n\r]/g);
      var locationLine = lines[lineIndex]; // Special case for minified documents

      if (locationLine.length > 120) {
        var subLineIndex = Math.floor(columnNum / 80);
        var subLineColumnNum = columnNum % 80;
        var subLines = [];

        for (var i = 0; i < locationLine.length; i += 80) {
          subLines.push(locationLine.slice(i, i + 80));
        }

        return locationStr + printPrefixedLines([["".concat(lineNum), subLines[0]]].concat(subLines.slice(1, subLineIndex + 1).map(function (subLine) {
          return ['', subLine];
        }), [[' ', whitespace(subLineColumnNum - 1) + '^'], ['', subLines[subLineIndex + 1]]]));
      }

      return locationStr + printPrefixedLines([// Lines specified like this: ["prefix", "string"],
      ["".concat(lineNum - 1), lines[lineIndex - 1]], ["".concat(lineNum), locationLine], ['', whitespace(columnNum - 1) + '^'], ["".concat(lineNum + 1), lines[lineIndex + 1]]]);
    }

    function printPrefixedLines(lines) {
      var existingLines = lines.filter(function (_ref) {
        var _ = _ref[0],
            line = _ref[1];
        return line !== undefined;
      });
      var padLen = Math.max.apply(Math, existingLines.map(function (_ref2) {
        var prefix = _ref2[0];
        return prefix.length;
      }));
      return existingLines.map(function (_ref3) {
        var prefix = _ref3[0],
            line = _ref3[1];
        return leftPad(padLen, prefix) + (line ? ' | ' + line : ' |');
      }).join('\n');
    }

    function whitespace(len) {
      return Array(len + 1).join(' ');
    }

    function leftPad(len, str) {
      return whitespace(len - str.length) + str;
    }

    function _typeof$2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$2 = function _typeof(obj) { return typeof obj; }; } else { _typeof$2 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$2(obj); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof$2(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

    function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    /**
     * A GraphQLError describes an Error found during the parse, validate, or
     * execute phases of performing a GraphQL operation. In addition to a message
     * and stack trace, it also includes information about the locations in a
     * GraphQL document and/or execution result that correspond to the Error.
     */

    var GraphQLError = /*#__PURE__*/function (_Error) {
      _inherits(GraphQLError, _Error);

      var _super = _createSuper(GraphQLError);

      /**
       * A message describing the Error for debugging purposes.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       *
       * Note: should be treated as readonly, despite invariant usage.
       */

      /**
       * An array of { line, column } locations within the source GraphQL document
       * which correspond to this error.
       *
       * Errors during validation often contain multiple locations, for example to
       * point out two things with the same name. Errors during execution include a
       * single location, the field which produced the error.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array describing the JSON-path into the execution response which
       * corresponds to this error. Only included for errors during execution.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array of GraphQL AST Nodes corresponding to this error.
       */

      /**
       * The source GraphQL document for the first location of this error.
       *
       * Note that if this Error represents more than one node, the source may not
       * represent nodes after the first node.
       */

      /**
       * An array of character offsets within the source GraphQL document
       * which correspond to this error.
       */

      /**
       * The original error thrown from a field resolver during execution.
       */

      /**
       * Extension fields to add to the formatted error.
       */
      function GraphQLError(message, nodes, source, positions, path, originalError, extensions) {
        var _locations2, _source2, _positions2, _extensions2;

        var _this;

        _classCallCheck(this, GraphQLError);

        _this = _super.call(this, message); // Compute list of blame nodes.

        var _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [nodes] : undefined; // Compute locations in the source for the given nodes/positions.


        var _source = source;

        if (!_source && _nodes) {
          var _nodes$0$loc;

          _source = (_nodes$0$loc = _nodes[0].loc) === null || _nodes$0$loc === void 0 ? void 0 : _nodes$0$loc.source;
        }

        var _positions = positions;

        if (!_positions && _nodes) {
          _positions = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(node.loc.start);
            }

            return list;
          }, []);
        }

        if (_positions && _positions.length === 0) {
          _positions = undefined;
        }

        var _locations;

        if (positions && source) {
          _locations = positions.map(function (pos) {
            return getLocation(source, pos);
          });
        } else if (_nodes) {
          _locations = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(getLocation(node.loc.source, node.loc.start));
            }

            return list;
          }, []);
        }

        var _extensions = extensions;

        if (_extensions == null && originalError != null) {
          var originalExtensions = originalError.extensions;

          if (isObjectLike(originalExtensions)) {
            _extensions = originalExtensions;
          }
        }

        Object.defineProperties(_assertThisInitialized(_this), {
          name: {
            value: 'GraphQLError'
          },
          message: {
            value: message,
            // By being enumerable, JSON.stringify will include `message` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: true,
            writable: true
          },
          locations: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_locations2 = _locations) !== null && _locations2 !== void 0 ? _locations2 : undefined,
            // By being enumerable, JSON.stringify will include `locations` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _locations != null
          },
          path: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: path !== null && path !== void 0 ? path : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: path != null
          },
          nodes: {
            value: _nodes !== null && _nodes !== void 0 ? _nodes : undefined
          },
          source: {
            value: (_source2 = _source) !== null && _source2 !== void 0 ? _source2 : undefined
          },
          positions: {
            value: (_positions2 = _positions) !== null && _positions2 !== void 0 ? _positions2 : undefined
          },
          originalError: {
            value: originalError
          },
          extensions: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_extensions2 = _extensions) !== null && _extensions2 !== void 0 ? _extensions2 : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _extensions != null
          }
        }); // Include (non-enumerable) stack trace.

        if (originalError === null || originalError === void 0 ? void 0 : originalError.stack) {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: originalError.stack,
            writable: true,
            configurable: true
          });
          return _possibleConstructorReturn(_this);
        }
        /* istanbul ignore next (See: https://github.com/graphql/graphql-js/issues/2317) */


        if (Error.captureStackTrace) {
          Error.captureStackTrace(_assertThisInitialized(_this), GraphQLError);
        } else {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: Error().stack,
            writable: true,
            configurable: true
          });
        }

        return _this;
      }

      _createClass(GraphQLError, [{
        key: "toString",
        value: function toString() {
          return printError(this);
        } // FIXME: workaround to not break chai comparisons, should be remove in v16
        // $FlowFixMe Flow doesn't support computed properties yet

      }, {
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Object';
        }
      }]);

      return GraphQLError;
    }( /*#__PURE__*/_wrapNativeSuper(Error));
    /**
     * Prints a GraphQLError to a string, representing useful location information
     * about the error's position in the source.
     */

    function printError(error) {
      var output = error.message;

      if (error.nodes) {
        for (var _i2 = 0, _error$nodes2 = error.nodes; _i2 < _error$nodes2.length; _i2++) {
          var node = _error$nodes2[_i2];

          if (node.loc) {
            output += '\n\n' + printLocation(node.loc);
          }
        }
      } else if (error.source && error.locations) {
        for (var _i4 = 0, _error$locations2 = error.locations; _i4 < _error$locations2.length; _i4++) {
          var location = _error$locations2[_i4];
          output += '\n\n' + printSourceLocation(error.source, location);
        }
      }

      return output;
    }

    /**
     * Produces a GraphQLError representing a syntax error, containing useful
     * descriptive information about the syntax error's position in the source.
     */

    function syntaxError(source, position, description) {
      return new GraphQLError("Syntax Error: ".concat(description), undefined, source, [position]);
    }

    /**
     * The set of allowed kind values for AST nodes.
     */
    var Kind = Object.freeze({
      // Name
      NAME: 'Name',
      // Document
      DOCUMENT: 'Document',
      OPERATION_DEFINITION: 'OperationDefinition',
      VARIABLE_DEFINITION: 'VariableDefinition',
      SELECTION_SET: 'SelectionSet',
      FIELD: 'Field',
      ARGUMENT: 'Argument',
      // Fragments
      FRAGMENT_SPREAD: 'FragmentSpread',
      INLINE_FRAGMENT: 'InlineFragment',
      FRAGMENT_DEFINITION: 'FragmentDefinition',
      // Values
      VARIABLE: 'Variable',
      INT: 'IntValue',
      FLOAT: 'FloatValue',
      STRING: 'StringValue',
      BOOLEAN: 'BooleanValue',
      NULL: 'NullValue',
      ENUM: 'EnumValue',
      LIST: 'ListValue',
      OBJECT: 'ObjectValue',
      OBJECT_FIELD: 'ObjectField',
      // Directives
      DIRECTIVE: 'Directive',
      // Types
      NAMED_TYPE: 'NamedType',
      LIST_TYPE: 'ListType',
      NON_NULL_TYPE: 'NonNullType',
      // Type System Definitions
      SCHEMA_DEFINITION: 'SchemaDefinition',
      OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',
      // Type Definitions
      SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
      OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
      FIELD_DEFINITION: 'FieldDefinition',
      INPUT_VALUE_DEFINITION: 'InputValueDefinition',
      INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
      UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
      ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
      ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
      INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',
      // Directive Definitions
      DIRECTIVE_DEFINITION: 'DirectiveDefinition',
      // Type System Extensions
      SCHEMA_EXTENSION: 'SchemaExtension',
      // Type Extensions
      SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
      OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
      INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
      UNION_TYPE_EXTENSION: 'UnionTypeExtension',
      ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
      INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension'
    });
    /**
     * The enum type representing the possible kind values of AST nodes.
     */

    function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

    /**
     * A representation of source input to GraphQL.
     * `name` and `locationOffset` are optional. They are useful for clients who
     * store GraphQL documents in source files; for example, if the GraphQL input
     * starts at line 40 in a file named Foo.graphql, it might be useful for name to
     * be "Foo.graphql" and location to be `{ line: 40, column: 0 }`.
     * line and column in locationOffset are 1-indexed
     */
    var Source = /*#__PURE__*/function () {
      function Source(body) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GraphQL request';
        var locationOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
          line: 1,
          column: 1
        };
        this.body = body;
        this.name = name;
        this.locationOffset = locationOffset;
        this.locationOffset.line > 0 || devAssert(0, 'line in locationOffset is 1-indexed and must be positive.');
        this.locationOffset.column > 0 || devAssert(0, 'column in locationOffset is 1-indexed and must be positive.');
      } // $FlowFixMe Flow doesn't support computed properties yet


      _createClass$1(Source, [{
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Source';
        }
      }]);

      return Source;
    }();

    /**
     * The set of allowed directive location values.
     */
    var DirectiveLocation = Object.freeze({
      // Request Definitions
      QUERY: 'QUERY',
      MUTATION: 'MUTATION',
      SUBSCRIPTION: 'SUBSCRIPTION',
      FIELD: 'FIELD',
      FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
      FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
      INLINE_FRAGMENT: 'INLINE_FRAGMENT',
      VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',
      // Type System Definitions
      SCHEMA: 'SCHEMA',
      SCALAR: 'SCALAR',
      OBJECT: 'OBJECT',
      FIELD_DEFINITION: 'FIELD_DEFINITION',
      ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
      INTERFACE: 'INTERFACE',
      UNION: 'UNION',
      ENUM: 'ENUM',
      ENUM_VALUE: 'ENUM_VALUE',
      INPUT_OBJECT: 'INPUT_OBJECT',
      INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
    });
    /**
     * The enum type representing the directive location values.
     */

    /**
     * An exported enum describing the different kinds of tokens that the
     * lexer emits.
     */
    var TokenKind = Object.freeze({
      SOF: '<SOF>',
      EOF: '<EOF>',
      BANG: '!',
      DOLLAR: '$',
      AMP: '&',
      PAREN_L: '(',
      PAREN_R: ')',
      SPREAD: '...',
      COLON: ':',
      EQUALS: '=',
      AT: '@',
      BRACKET_L: '[',
      BRACKET_R: ']',
      BRACE_L: '{',
      PIPE: '|',
      BRACE_R: '}',
      NAME: 'Name',
      INT: 'Int',
      FLOAT: 'Float',
      STRING: 'String',
      BLOCK_STRING: 'BlockString',
      COMMENT: 'Comment'
    });
    /**
     * The enum type representing the token kinds values.
     */

    /**
     * Given a Source object, creates a Lexer for that source.
     * A Lexer is a stateful stream generator in that every time
     * it is advanced, it returns the next token in the Source. Assuming the
     * source lexes, the final Token emitted by the lexer will be of kind
     * EOF, after which the lexer will repeatedly return the same EOF token
     * whenever called.
     */

    var Lexer = /*#__PURE__*/function () {
      /**
       * The previously focused non-ignored token.
       */

      /**
       * The currently focused non-ignored token.
       */

      /**
       * The (1-indexed) line containing the current token.
       */

      /**
       * The character offset at which the current line begins.
       */
      function Lexer(source) {
        var startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);
        this.source = source;
        this.lastToken = startOfFileToken;
        this.token = startOfFileToken;
        this.line = 1;
        this.lineStart = 0;
      }
      /**
       * Advances the token stream to the next non-ignored token.
       */


      var _proto = Lexer.prototype;

      _proto.advance = function advance() {
        this.lastToken = this.token;
        var token = this.token = this.lookahead();
        return token;
      }
      /**
       * Looks ahead and returns the next non-ignored token, but does not change
       * the state of Lexer.
       */
      ;

      _proto.lookahead = function lookahead() {
        var token = this.token;

        if (token.kind !== TokenKind.EOF) {
          do {
            var _token$next;

            // Note: next is only mutable during parsing, so we cast to allow this.
            token = (_token$next = token.next) !== null && _token$next !== void 0 ? _token$next : token.next = readToken(this, token);
          } while (token.kind === TokenKind.COMMENT);
        }

        return token;
      };

      return Lexer;
    }();
    /**
     * @internal
     */

    function isPunctuatorTokenKind(kind) {
      return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
    }

    function printCharCode(code) {
      return (// NaN/undefined represents access beyond the end of the file.
        isNaN(code) ? TokenKind.EOF : // Trust JSON for ASCII.
        code < 0x007f ? JSON.stringify(String.fromCharCode(code)) : // Otherwise print the escaped form.
        "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
      );
    }
    /**
     * Gets the next token from the source starting at the given position.
     *
     * This skips over whitespace until it finds the next lexable token, then lexes
     * punctuators immediately or calls the appropriate helper function for more
     * complicated tokens.
     */


    function readToken(lexer, prev) {
      var source = lexer.source;
      var body = source.body;
      var bodyLength = body.length;
      var pos = positionAfterWhitespace(body, prev.end, lexer);
      var line = lexer.line;
      var col = 1 + pos - lexer.lineStart;

      if (pos >= bodyLength) {
        return new Token(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
      }

      var code = body.charCodeAt(pos); // SourceCharacter

      switch (code) {
        // !
        case 33:
          return new Token(TokenKind.BANG, pos, pos + 1, line, col, prev);
        // #

        case 35:
          return readComment(source, pos, line, col, prev);
        // $

        case 36:
          return new Token(TokenKind.DOLLAR, pos, pos + 1, line, col, prev);
        // &

        case 38:
          return new Token(TokenKind.AMP, pos, pos + 1, line, col, prev);
        // (

        case 40:
          return new Token(TokenKind.PAREN_L, pos, pos + 1, line, col, prev);
        // )

        case 41:
          return new Token(TokenKind.PAREN_R, pos, pos + 1, line, col, prev);
        // .

        case 46:
          if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
            return new Token(TokenKind.SPREAD, pos, pos + 3, line, col, prev);
          }

          break;
        // :

        case 58:
          return new Token(TokenKind.COLON, pos, pos + 1, line, col, prev);
        // =

        case 61:
          return new Token(TokenKind.EQUALS, pos, pos + 1, line, col, prev);
        // @

        case 64:
          return new Token(TokenKind.AT, pos, pos + 1, line, col, prev);
        // [

        case 91:
          return new Token(TokenKind.BRACKET_L, pos, pos + 1, line, col, prev);
        // ]

        case 93:
          return new Token(TokenKind.BRACKET_R, pos, pos + 1, line, col, prev);
        // {

        case 123:
          return new Token(TokenKind.BRACE_L, pos, pos + 1, line, col, prev);
        // |

        case 124:
          return new Token(TokenKind.PIPE, pos, pos + 1, line, col, prev);
        // }

        case 125:
          return new Token(TokenKind.BRACE_R, pos, pos + 1, line, col, prev);
        // A-Z _ a-z

        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 95:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          return readName(source, pos, line, col, prev);
        // - 0-9

        case 45:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          return readNumber(source, pos, code, line, col, prev);
        // "

        case 34:
          if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
            return readBlockString(source, pos, line, col, prev, lexer);
          }

          return readString(source, pos, line, col, prev);
      }

      throw syntaxError(source, pos, unexpectedCharacterMessage(code));
    }
    /**
     * Report a message that an unexpected character was encountered.
     */


    function unexpectedCharacterMessage(code) {
      if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
        return "Cannot contain the invalid character ".concat(printCharCode(code), ".");
      }

      if (code === 39) {
        // '
        return 'Unexpected single quote character (\'), did you mean to use a double quote (")?';
      }

      return "Cannot parse the unexpected character ".concat(printCharCode(code), ".");
    }
    /**
     * Reads from body starting at startPosition until it finds a non-whitespace
     * character, then returns the position of that character for lexing.
     */


    function positionAfterWhitespace(body, startPosition, lexer) {
      var bodyLength = body.length;
      var position = startPosition;

      while (position < bodyLength) {
        var code = body.charCodeAt(position); // tab | space | comma | BOM

        if (code === 9 || code === 32 || code === 44 || code === 0xfeff) {
          ++position;
        } else if (code === 10) {
          // new line
          ++position;
          ++lexer.line;
          lexer.lineStart = position;
        } else if (code === 13) {
          // carriage return
          if (body.charCodeAt(position + 1) === 10) {
            position += 2;
          } else {
            ++position;
          }

          ++lexer.line;
          lexer.lineStart = position;
        } else {
          break;
        }
      }

      return position;
    }
    /**
     * Reads a comment token from the source file.
     *
     * #[\u0009\u0020-\uFFFF]*
     */


    function readComment(source, start, line, col, prev) {
      var body = source.body;
      var code;
      var position = start;

      do {
        code = body.charCodeAt(++position);
      } while (!isNaN(code) && ( // SourceCharacter but not LineTerminator
      code > 0x001f || code === 0x0009));

      return new Token(TokenKind.COMMENT, start, position, line, col, prev, body.slice(start + 1, position));
    }
    /**
     * Reads a number token from the source file, either a float
     * or an int depending on whether a decimal point appears.
     *
     * Int:   -?(0|[1-9][0-9]*)
     * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
     */


    function readNumber(source, start, firstCode, line, col, prev) {
      var body = source.body;
      var code = firstCode;
      var position = start;
      var isFloat = false;

      if (code === 45) {
        // -
        code = body.charCodeAt(++position);
      }

      if (code === 48) {
        // 0
        code = body.charCodeAt(++position);

        if (code >= 48 && code <= 57) {
          throw syntaxError(source, position, "Invalid number, unexpected digit after 0: ".concat(printCharCode(code), "."));
        }
      } else {
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 46) {
        // .
        isFloat = true;
        code = body.charCodeAt(++position);
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 69 || code === 101) {
        // E e
        isFloat = true;
        code = body.charCodeAt(++position);

        if (code === 43 || code === 45) {
          // + -
          code = body.charCodeAt(++position);
        }

        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      } // Numbers cannot be followed by . or NameStart


      if (code === 46 || isNameStart(code)) {
        throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
      }

      return new Token(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, body.slice(start, position));
    }
    /**
     * Returns the new position in the source after reading digits.
     */


    function readDigits(source, start, firstCode) {
      var body = source.body;
      var position = start;
      var code = firstCode;

      if (code >= 48 && code <= 57) {
        // 0 - 9
        do {
          code = body.charCodeAt(++position);
        } while (code >= 48 && code <= 57); // 0 - 9


        return position;
      }

      throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
    }
    /**
     * Reads a string token from the source file.
     *
     * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
     */


    function readString(source, start, line, col, prev) {
      var body = source.body;
      var position = start + 1;
      var chunkStart = position;
      var code = 0;
      var value = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position)) && // not LineTerminator
      code !== 0x000a && code !== 0x000d) {
        // Closing Quote (")
        if (code === 34) {
          value += body.slice(chunkStart, position);
          return new Token(TokenKind.STRING, start, position + 1, line, col, prev, value);
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        ++position;

        if (code === 92) {
          // \
          value += body.slice(chunkStart, position - 1);
          code = body.charCodeAt(position);

          switch (code) {
            case 34:
              value += '"';
              break;

            case 47:
              value += '/';
              break;

            case 92:
              value += '\\';
              break;

            case 98:
              value += '\b';
              break;

            case 102:
              value += '\f';
              break;

            case 110:
              value += '\n';
              break;

            case 114:
              value += '\r';
              break;

            case 116:
              value += '\t';
              break;

            case 117:
              {
                // uXXXX
                var charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));

                if (charCode < 0) {
                  var invalidSequence = body.slice(position + 1, position + 5);
                  throw syntaxError(source, position, "Invalid character escape sequence: \\u".concat(invalidSequence, "."));
                }

                value += String.fromCharCode(charCode);
                position += 4;
                break;
              }

            default:
              throw syntaxError(source, position, "Invalid character escape sequence: \\".concat(String.fromCharCode(code), "."));
          }

          ++position;
          chunkStart = position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Reads a block string token from the source file.
     *
     * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
     */


    function readBlockString(source, start, line, col, prev, lexer) {
      var body = source.body;
      var position = start + 3;
      var chunkStart = position;
      var code = 0;
      var rawValue = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position))) {
        // Closing Triple-Quote (""")
        if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          rawValue += body.slice(chunkStart, position);
          return new Token(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, dedentBlockStringValue(rawValue));
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        if (code === 10) {
          // new line
          ++position;
          ++lexer.line;
          lexer.lineStart = position;
        } else if (code === 13) {
          // carriage return
          if (body.charCodeAt(position + 1) === 10) {
            position += 2;
          } else {
            ++position;
          }

          ++lexer.line;
          lexer.lineStart = position;
        } else if ( // Escape Triple-Quote (\""")
        code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
          rawValue += body.slice(chunkStart, position) + '"""';
          position += 4;
          chunkStart = position;
        } else {
          ++position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Converts four hexadecimal chars to the integer that the
     * string represents. For example, uniCharCode('0','0','0','f')
     * will return 15, and uniCharCode('0','0','f','f') returns 255.
     *
     * Returns a negative number on error, if a char was invalid.
     *
     * This is implemented by noting that char2hex() returns -1 on error,
     * which means the result of ORing the char2hex() will also be negative.
     */


    function uniCharCode(a, b, c, d) {
      return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
    }
    /**
     * Converts a hex character to its integer value.
     * '0' becomes 0, '9' becomes 9
     * 'A' becomes 10, 'F' becomes 15
     * 'a' becomes 10, 'f' becomes 15
     *
     * Returns -1 on error.
     */


    function char2hex(a) {
      return a >= 48 && a <= 57 ? a - 48 // 0-9
      : a >= 65 && a <= 70 ? a - 55 // A-F
      : a >= 97 && a <= 102 ? a - 87 // a-f
      : -1;
    }
    /**
     * Reads an alphanumeric + underscore name from the source.
     *
     * [_A-Za-z][_0-9A-Za-z]*
     */


    function readName(source, start, line, col, prev) {
      var body = source.body;
      var bodyLength = body.length;
      var position = start + 1;
      var code = 0;

      while (position !== bodyLength && !isNaN(code = body.charCodeAt(position)) && (code === 95 || // _
      code >= 48 && code <= 57 || // 0-9
      code >= 65 && code <= 90 || // A-Z
      code >= 97 && code <= 122) // a-z
      ) {
        ++position;
      }

      return new Token(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
    } // _ A-Z a-z


    function isNameStart(code) {
      return code === 95 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
    }

    /**
     * Configuration options to control parser behavior
     */

    /**
     * Given a GraphQL source, parses it into a Document.
     * Throws GraphQLError if a syntax error is encountered.
     */
    function parse(source, options) {
      var parser = new Parser(source, options);
      return parser.parseDocument();
    }
    /**
     * Given a string containing a GraphQL value (ex. `[42]`), parse the AST for
     * that value.
     * Throws GraphQLError if a syntax error is encountered.
     *
     * This is useful within tools that operate upon GraphQL Values directly and
     * in isolation of complete GraphQL documents.
     *
     * Consider providing the results to the utility function: valueFromAST().
     */

    function parseValue(source, options) {
      var parser = new Parser(source, options);
      parser.expectToken(TokenKind.SOF);
      var value = parser.parseValueLiteral(false);
      parser.expectToken(TokenKind.EOF);
      return value;
    }
    /**
     * Given a string containing a GraphQL Type (ex. `[Int!]`), parse the AST for
     * that type.
     * Throws GraphQLError if a syntax error is encountered.
     *
     * This is useful within tools that operate upon GraphQL Types directly and
     * in isolation of complete GraphQL documents.
     *
     * Consider providing the results to the utility function: typeFromAST().
     */

    function parseType(source, options) {
      var parser = new Parser(source, options);
      parser.expectToken(TokenKind.SOF);
      var type = parser.parseTypeReference();
      parser.expectToken(TokenKind.EOF);
      return type;
    }

    var Parser = /*#__PURE__*/function () {
      function Parser(source, options) {
        var sourceObj = typeof source === 'string' ? new Source(source) : source;
        sourceObj instanceof Source || devAssert(0, "Must provide Source. Received: ".concat(inspect(sourceObj), "."));
        this._lexer = new Lexer(sourceObj);
        this._options = options;
      }
      /**
       * Converts a name lex token into a name parse node.
       */


      var _proto = Parser.prototype;

      _proto.parseName = function parseName() {
        var token = this.expectToken(TokenKind.NAME);
        return {
          kind: Kind.NAME,
          value: token.value,
          loc: this.loc(token)
        };
      } // Implements the parsing rules in the Document section.

      /**
       * Document : Definition+
       */
      ;

      _proto.parseDocument = function parseDocument() {
        var start = this._lexer.token;
        return {
          kind: Kind.DOCUMENT,
          definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
          loc: this.loc(start)
        };
      }
      /**
       * Definition :
       *   - ExecutableDefinition
       *   - TypeSystemDefinition
       *   - TypeSystemExtension
       *
       * ExecutableDefinition :
       *   - OperationDefinition
       *   - FragmentDefinition
       */
      ;

      _proto.parseDefinition = function parseDefinition() {
        if (this.peek(TokenKind.NAME)) {
          switch (this._lexer.token.value) {
            case 'query':
            case 'mutation':
            case 'subscription':
              return this.parseOperationDefinition();

            case 'fragment':
              return this.parseFragmentDefinition();

            case 'schema':
            case 'scalar':
            case 'type':
            case 'interface':
            case 'union':
            case 'enum':
            case 'input':
            case 'directive':
              return this.parseTypeSystemDefinition();

            case 'extend':
              return this.parseTypeSystemExtension();
          }
        } else if (this.peek(TokenKind.BRACE_L)) {
          return this.parseOperationDefinition();
        } else if (this.peekDescription()) {
          return this.parseTypeSystemDefinition();
        }

        throw this.unexpected();
      } // Implements the parsing rules in the Operations section.

      /**
       * OperationDefinition :
       *  - SelectionSet
       *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
       */
      ;

      _proto.parseOperationDefinition = function parseOperationDefinition() {
        var start = this._lexer.token;

        if (this.peek(TokenKind.BRACE_L)) {
          return {
            kind: Kind.OPERATION_DEFINITION,
            operation: 'query',
            name: undefined,
            variableDefinitions: [],
            directives: [],
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        var operation = this.parseOperationType();
        var name;

        if (this.peek(TokenKind.NAME)) {
          name = this.parseName();
        }

        return {
          kind: Kind.OPERATION_DEFINITION,
          operation: operation,
          name: name,
          variableDefinitions: this.parseVariableDefinitions(),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * OperationType : one of query mutation subscription
       */
      ;

      _proto.parseOperationType = function parseOperationType() {
        var operationToken = this.expectToken(TokenKind.NAME);

        switch (operationToken.value) {
          case 'query':
            return 'query';

          case 'mutation':
            return 'mutation';

          case 'subscription':
            return 'subscription';
        }

        throw this.unexpected(operationToken);
      }
      /**
       * VariableDefinitions : ( VariableDefinition+ )
       */
      ;

      _proto.parseVariableDefinitions = function parseVariableDefinitions() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
      }
      /**
       * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseVariableDefinition = function parseVariableDefinition() {
        var start = this._lexer.token;
        return {
          kind: Kind.VARIABLE_DEFINITION,
          variable: this.parseVariable(),
          type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
          defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseValueLiteral(true) : undefined,
          directives: this.parseDirectives(true),
          loc: this.loc(start)
        };
      }
      /**
       * Variable : $ Name
       */
      ;

      _proto.parseVariable = function parseVariable() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return {
          kind: Kind.VARIABLE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      }
      /**
       * SelectionSet : { Selection+ }
       */
      ;

      _proto.parseSelectionSet = function parseSelectionSet() {
        var start = this._lexer.token;
        return {
          kind: Kind.SELECTION_SET,
          selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * Selection :
       *   - Field
       *   - FragmentSpread
       *   - InlineFragment
       */
      ;

      _proto.parseSelection = function parseSelection() {
        return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
      }
      /**
       * Field : Alias? Name Arguments? Directives? SelectionSet?
       *
       * Alias : Name :
       */
      ;

      _proto.parseField = function parseField() {
        var start = this._lexer.token;
        var nameOrAlias = this.parseName();
        var alias;
        var name;

        if (this.expectOptionalToken(TokenKind.COLON)) {
          alias = nameOrAlias;
          name = this.parseName();
        } else {
          name = nameOrAlias;
        }

        return {
          kind: Kind.FIELD,
          alias: alias,
          name: name,
          arguments: this.parseArguments(false),
          directives: this.parseDirectives(false),
          selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : undefined,
          loc: this.loc(start)
        };
      }
      /**
       * Arguments[Const] : ( Argument[?Const]+ )
       */
      ;

      _proto.parseArguments = function parseArguments(isConst) {
        var item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
      }
      /**
       * Argument[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseArgument = function parseArgument() {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.ARGUMENT,
          name: name,
          value: this.parseValueLiteral(false),
          loc: this.loc(start)
        };
      };

      _proto.parseConstArgument = function parseConstArgument() {
        var start = this._lexer.token;
        return {
          kind: Kind.ARGUMENT,
          name: this.parseName(),
          value: (this.expectToken(TokenKind.COLON), this.parseValueLiteral(true)),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Fragments section.

      /**
       * Corresponds to both FragmentSpread and InlineFragment in the spec.
       *
       * FragmentSpread : ... FragmentName Directives?
       *
       * InlineFragment : ... TypeCondition? Directives? SelectionSet
       */
      ;

      _proto.parseFragment = function parseFragment() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        var hasTypeCondition = this.expectOptionalKeyword('on');

        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
          return {
            kind: Kind.FRAGMENT_SPREAD,
            name: this.parseFragmentName(),
            directives: this.parseDirectives(false),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentDefinition :
       *   - fragment FragmentName on TypeCondition Directives? SelectionSet
       *
       * TypeCondition : NamedType
       */
      ;

      _proto.parseFragmentDefinition = function parseFragmentDefinition() {
        var _this$_options;

        var start = this._lexer.token;
        this.expectKeyword('fragment'); // Experimental support for defining variables within fragments changes
        // the grammar of FragmentDefinition:
        //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet

        if (((_this$_options = this._options) === null || _this$_options === void 0 ? void 0 : _this$_options.experimentalFragmentVariables) === true) {
          return {
            kind: Kind.FRAGMENT_DEFINITION,
            name: this.parseFragmentName(),
            variableDefinitions: this.parseVariableDefinitions(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.FRAGMENT_DEFINITION,
          name: this.parseFragmentName(),
          typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentName : Name but not `on`
       */
      ;

      _proto.parseFragmentName = function parseFragmentName() {
        if (this._lexer.token.value === 'on') {
          throw this.unexpected();
        }

        return this.parseName();
      } // Implements the parsing rules in the Values section.

      /**
       * Value[Const] :
       *   - [~Const] Variable
       *   - IntValue
       *   - FloatValue
       *   - StringValue
       *   - BooleanValue
       *   - NullValue
       *   - EnumValue
       *   - ListValue[?Const]
       *   - ObjectValue[?Const]
       *
       * BooleanValue : one of `true` `false`
       *
       * NullValue : `null`
       *
       * EnumValue : Name but not `true`, `false` or `null`
       */
      ;

      _proto.parseValueLiteral = function parseValueLiteral(isConst) {
        var token = this._lexer.token;

        switch (token.kind) {
          case TokenKind.BRACKET_L:
            return this.parseList(isConst);

          case TokenKind.BRACE_L:
            return this.parseObject(isConst);

          case TokenKind.INT:
            this._lexer.advance();

            return {
              kind: Kind.INT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.FLOAT:
            this._lexer.advance();

            return {
              kind: Kind.FLOAT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.STRING:
          case TokenKind.BLOCK_STRING:
            return this.parseStringLiteral();

          case TokenKind.NAME:
            this._lexer.advance();

            switch (token.value) {
              case 'true':
                return {
                  kind: Kind.BOOLEAN,
                  value: true,
                  loc: this.loc(token)
                };

              case 'false':
                return {
                  kind: Kind.BOOLEAN,
                  value: false,
                  loc: this.loc(token)
                };

              case 'null':
                return {
                  kind: Kind.NULL,
                  loc: this.loc(token)
                };

              default:
                return {
                  kind: Kind.ENUM,
                  value: token.value,
                  loc: this.loc(token)
                };
            }

          case TokenKind.DOLLAR:
            if (!isConst) {
              return this.parseVariable();
            }

            break;
        }

        throw this.unexpected();
      };

      _proto.parseStringLiteral = function parseStringLiteral() {
        var token = this._lexer.token;

        this._lexer.advance();

        return {
          kind: Kind.STRING,
          value: token.value,
          block: token.kind === TokenKind.BLOCK_STRING,
          loc: this.loc(token)
        };
      }
      /**
       * ListValue[Const] :
       *   - [ ]
       *   - [ Value[?Const]+ ]
       */
      ;

      _proto.parseList = function parseList(isConst) {
        var _this = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this.parseValueLiteral(isConst);
        };

        return {
          kind: Kind.LIST,
          values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectValue[Const] :
       *   - { }
       *   - { ObjectField[?Const]+ }
       */
      ;

      _proto.parseObject = function parseObject(isConst) {
        var _this2 = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this2.parseObjectField(isConst);
        };

        return {
          kind: Kind.OBJECT,
          fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectField[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseObjectField = function parseObjectField(isConst) {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.OBJECT_FIELD,
          name: name,
          value: this.parseValueLiteral(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Directives section.

      /**
       * Directives[Const] : Directive[?Const]+
       */
      ;

      _proto.parseDirectives = function parseDirectives(isConst) {
        var directives = [];

        while (this.peek(TokenKind.AT)) {
          directives.push(this.parseDirective(isConst));
        }

        return directives;
      }
      /**
       * Directive[Const] : @ Name Arguments[?Const]?
       */
      ;

      _proto.parseDirective = function parseDirective(isConst) {
        var start = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return {
          kind: Kind.DIRECTIVE,
          name: this.parseName(),
          arguments: this.parseArguments(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Types section.

      /**
       * Type :
       *   - NamedType
       *   - ListType
       *   - NonNullType
       */
      ;

      _proto.parseTypeReference = function parseTypeReference() {
        var start = this._lexer.token;
        var type;

        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
          type = this.parseTypeReference();
          this.expectToken(TokenKind.BRACKET_R);
          type = {
            kind: Kind.LIST_TYPE,
            type: type,
            loc: this.loc(start)
          };
        } else {
          type = this.parseNamedType();
        }

        if (this.expectOptionalToken(TokenKind.BANG)) {
          return {
            kind: Kind.NON_NULL_TYPE,
            type: type,
            loc: this.loc(start)
          };
        }

        return type;
      }
      /**
       * NamedType : Name
       */
      ;

      _proto.parseNamedType = function parseNamedType() {
        var start = this._lexer.token;
        return {
          kind: Kind.NAMED_TYPE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Type Definition section.

      /**
       * TypeSystemDefinition :
       *   - SchemaDefinition
       *   - TypeDefinition
       *   - DirectiveDefinition
       *
       * TypeDefinition :
       *   - ScalarTypeDefinition
       *   - ObjectTypeDefinition
       *   - InterfaceTypeDefinition
       *   - UnionTypeDefinition
       *   - EnumTypeDefinition
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemDefinition = function parseTypeSystemDefinition() {
        // Many definitions begin with a description and require a lookahead.
        var keywordToken = this.peekDescription() ? this._lexer.lookahead() : this._lexer.token;

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaDefinition();

            case 'scalar':
              return this.parseScalarTypeDefinition();

            case 'type':
              return this.parseObjectTypeDefinition();

            case 'interface':
              return this.parseInterfaceTypeDefinition();

            case 'union':
              return this.parseUnionTypeDefinition();

            case 'enum':
              return this.parseEnumTypeDefinition();

            case 'input':
              return this.parseInputObjectTypeDefinition();

            case 'directive':
              return this.parseDirectiveDefinition();
          }
        }

        throw this.unexpected(keywordToken);
      };

      _proto.peekDescription = function peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
      }
      /**
       * Description : StringValue
       */
      ;

      _proto.parseDescription = function parseDescription() {
        if (this.peekDescription()) {
          return this.parseStringLiteral();
        }
      }
      /**
       * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
       */
      ;

      _proto.parseSchemaDefinition = function parseSchemaDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        return {
          kind: Kind.SCHEMA_DEFINITION,
          description: description,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * OperationTypeDefinition : OperationType : NamedType
       */
      ;

      _proto.parseOperationTypeDefinition = function parseOperationTypeDefinition() {
        var start = this._lexer.token;
        var operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        var type = this.parseNamedType();
        return {
          kind: Kind.OPERATION_TYPE_DEFINITION,
          operation: operation,
          type: type,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
       */
      ;

      _proto.parseScalarTypeDefinition = function parseScalarTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.SCALAR_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeDefinition :
       *   Description?
       *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseObjectTypeDefinition = function parseObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * ImplementsInterfaces :
       *   - implements `&`? NamedType
       *   - ImplementsInterfaces & NamedType
       */
      ;

      _proto.parseImplementsInterfaces = function parseImplementsInterfaces() {
        var types = [];

        if (this.expectOptionalKeyword('implements')) {
          // Optional leading ampersand
          this.expectOptionalToken(TokenKind.AMP);

          do {
            var _this$_options2;

            types.push(this.parseNamedType());
          } while (this.expectOptionalToken(TokenKind.AMP) || // Legacy support for the SDL?
          ((_this$_options2 = this._options) === null || _this$_options2 === void 0 ? void 0 : _this$_options2.allowLegacySDLImplementsInterfaces) === true && this.peek(TokenKind.NAME));
        }

        return types;
      }
      /**
       * FieldsDefinition : { FieldDefinition+ }
       */
      ;

      _proto.parseFieldsDefinition = function parseFieldsDefinition() {
        var _this$_options3;

        // Legacy support for the SDL?
        if (((_this$_options3 = this._options) === null || _this$_options3 === void 0 ? void 0 : _this$_options3.allowLegacySDLEmptyFields) === true && this.peek(TokenKind.BRACE_L) && this._lexer.lookahead().kind === TokenKind.BRACE_R) {
          this._lexer.advance();

          this._lexer.advance();

          return [];
        }

        return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
      }
      /**
       * FieldDefinition :
       *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
       */
      ;

      _proto.parseFieldDefinition = function parseFieldDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.FIELD_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          type: type,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ArgumentsDefinition : ( InputValueDefinition+ )
       */
      ;

      _proto.parseArgumentDefs = function parseArgumentDefs() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
      }
      /**
       * InputValueDefinition :
       *   - Description? Name : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseInputValueDef = function parseInputValueDef() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var defaultValue;

        if (this.expectOptionalToken(TokenKind.EQUALS)) {
          defaultValue = this.parseValueLiteral(true);
        }

        var directives = this.parseDirectives(true);
        return {
          kind: Kind.INPUT_VALUE_DEFINITION,
          description: description,
          name: name,
          type: type,
          defaultValue: defaultValue,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeDefinition :
       *   - Description? interface Name Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseInterfaceTypeDefinition = function parseInterfaceTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.INTERFACE_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeDefinition :
       *   - Description? union Name Directives[Const]? UnionMemberTypes?
       */
      ;

      _proto.parseUnionTypeDefinition = function parseUnionTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();
        return {
          kind: Kind.UNION_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * UnionMemberTypes :
       *   - = `|`? NamedType
       *   - UnionMemberTypes | NamedType
       */
      ;

      _proto.parseUnionMemberTypes = function parseUnionMemberTypes() {
        var types = [];

        if (this.expectOptionalToken(TokenKind.EQUALS)) {
          // Optional leading pipe
          this.expectOptionalToken(TokenKind.PIPE);

          do {
            types.push(this.parseNamedType());
          } while (this.expectOptionalToken(TokenKind.PIPE));
        }

        return types;
      }
      /**
       * EnumTypeDefinition :
       *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
       */
      ;

      _proto.parseEnumTypeDefinition = function parseEnumTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();
        return {
          kind: Kind.ENUM_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * EnumValuesDefinition : { EnumValueDefinition+ }
       */
      ;

      _proto.parseEnumValuesDefinition = function parseEnumValuesDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
      }
      /**
       * EnumValueDefinition : Description? EnumValue Directives[Const]?
       *
       * EnumValue : Name
       */
      ;

      _proto.parseEnumValueDefinition = function parseEnumValueDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.ENUM_VALUE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeDefinition :
       *   - Description? input Name Directives[Const]? InputFieldsDefinition?
       */
      ;

      _proto.parseInputObjectTypeDefinition = function parseInputObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();
        return {
          kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InputFieldsDefinition : { InputValueDefinition+ }
       */
      ;

      _proto.parseInputFieldsDefinition = function parseInputFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
      }
      /**
       * TypeSystemExtension :
       *   - SchemaExtension
       *   - TypeExtension
       *
       * TypeExtension :
       *   - ScalarTypeExtension
       *   - ObjectTypeExtension
       *   - InterfaceTypeExtension
       *   - UnionTypeExtension
       *   - EnumTypeExtension
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemExtension = function parseTypeSystemExtension() {
        var keywordToken = this._lexer.lookahead();

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaExtension();

            case 'scalar':
              return this.parseScalarTypeExtension();

            case 'type':
              return this.parseObjectTypeExtension();

            case 'interface':
              return this.parseInterfaceTypeExtension();

            case 'union':
              return this.parseUnionTypeExtension();

            case 'enum':
              return this.parseEnumTypeExtension();

            case 'input':
              return this.parseInputObjectTypeExtension();
          }
        }

        throw this.unexpected(keywordToken);
      }
      /**
       * SchemaExtension :
       *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
       *  - extend schema Directives[Const]
       */
      ;

      _proto.parseSchemaExtension = function parseSchemaExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);

        if (directives.length === 0 && operationTypes.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCHEMA_EXTENSION,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeExtension :
       *   - extend scalar Name Directives[Const]
       */
      ;

      _proto.parseScalarTypeExtension = function parseScalarTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);

        if (directives.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCALAR_TYPE_EXTENSION,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeExtension :
       *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend type Name ImplementsInterfaces? Directives[Const]
       *  - extend type Name ImplementsInterfaces
       */
      ;

      _proto.parseObjectTypeExtension = function parseObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.OBJECT_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeExtension :
       *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend interface Name ImplementsInterfaces? Directives[Const]
       *  - extend interface Name ImplementsInterfaces
       */
      ;

      _proto.parseInterfaceTypeExtension = function parseInterfaceTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INTERFACE_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeExtension :
       *   - extend union Name Directives[Const]? UnionMemberTypes
       *   - extend union Name Directives[Const]
       */
      ;

      _proto.parseUnionTypeExtension = function parseUnionTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();

        if (directives.length === 0 && types.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.UNION_TYPE_EXTENSION,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * EnumTypeExtension :
       *   - extend enum Name Directives[Const]? EnumValuesDefinition
       *   - extend enum Name Directives[Const]
       */
      ;

      _proto.parseEnumTypeExtension = function parseEnumTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();

        if (directives.length === 0 && values.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.ENUM_TYPE_EXTENSION,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeExtension :
       *   - extend input Name Directives[Const]? InputFieldsDefinition
       *   - extend input Name Directives[Const]
       */
      ;

      _proto.parseInputObjectTypeExtension = function parseInputObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();

        if (directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveDefinition :
       *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
       */
      ;

      _proto.parseDirectiveDefinition = function parseDirectiveDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        var repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        var locations = this.parseDirectiveLocations();
        return {
          kind: Kind.DIRECTIVE_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          repeatable: repeatable,
          locations: locations,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveLocations :
       *   - `|`? DirectiveLocation
       *   - DirectiveLocations | DirectiveLocation
       */
      ;

      _proto.parseDirectiveLocations = function parseDirectiveLocations() {
        // Optional leading pipe
        this.expectOptionalToken(TokenKind.PIPE);
        var locations = [];

        do {
          locations.push(this.parseDirectiveLocation());
        } while (this.expectOptionalToken(TokenKind.PIPE));

        return locations;
      }
      /*
       * DirectiveLocation :
       *   - ExecutableDirectiveLocation
       *   - TypeSystemDirectiveLocation
       *
       * ExecutableDirectiveLocation : one of
       *   `QUERY`
       *   `MUTATION`
       *   `SUBSCRIPTION`
       *   `FIELD`
       *   `FRAGMENT_DEFINITION`
       *   `FRAGMENT_SPREAD`
       *   `INLINE_FRAGMENT`
       *
       * TypeSystemDirectiveLocation : one of
       *   `SCHEMA`
       *   `SCALAR`
       *   `OBJECT`
       *   `FIELD_DEFINITION`
       *   `ARGUMENT_DEFINITION`
       *   `INTERFACE`
       *   `UNION`
       *   `ENUM`
       *   `ENUM_VALUE`
       *   `INPUT_OBJECT`
       *   `INPUT_FIELD_DEFINITION`
       */
      ;

      _proto.parseDirectiveLocation = function parseDirectiveLocation() {
        var start = this._lexer.token;
        var name = this.parseName();

        if (DirectiveLocation[name.value] !== undefined) {
          return name;
        }

        throw this.unexpected(start);
      } // Core parsing utility functions

      /**
       * Returns a location object, used to identify the place in
       * the source that created a given parsed object.
       */
      ;

      _proto.loc = function loc(startToken) {
        var _this$_options4;

        if (((_this$_options4 = this._options) === null || _this$_options4 === void 0 ? void 0 : _this$_options4.noLocation) !== true) {
          return new Location(startToken, this._lexer.lastToken, this._lexer.source);
        }
      }
      /**
       * Determines if the next token is of a given kind
       */
      ;

      _proto.peek = function peek(kind) {
        return this._lexer.token.kind === kind;
      }
      /**
       * If the next token is of the given kind, return that token after advancing
       * the lexer. Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectToken = function expectToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        throw syntaxError(this._lexer.source, token.start, "Expected ".concat(getTokenKindDesc(kind), ", found ").concat(getTokenDesc(token), "."));
      }
      /**
       * If the next token is of the given kind, return that token after advancing
       * the lexer. Otherwise, do not change the parser state and return undefined.
       */
      ;

      _proto.expectOptionalToken = function expectOptionalToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        return undefined;
      }
      /**
       * If the next token is a given keyword, advance the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectKeyword = function expectKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();
        } else {
          throw syntaxError(this._lexer.source, token.start, "Expected \"".concat(value, "\", found ").concat(getTokenDesc(token), "."));
        }
      }
      /**
       * If the next token is a given keyword, return "true" after advancing
       * the lexer. Otherwise, do not change the parser state and return "false".
       */
      ;

      _proto.expectOptionalKeyword = function expectOptionalKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();

          return true;
        }

        return false;
      }
      /**
       * Helper function for creating an error when an unexpected lexed token
       * is encountered.
       */
      ;

      _proto.unexpected = function unexpected(atToken) {
        var token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
        return syntaxError(this._lexer.source, token.start, "Unexpected ".concat(getTokenDesc(token), "."));
      }
      /**
       * Returns a possibly empty list of parse nodes, determined by
       * the parseFn. This list begins with a lex token of openKind
       * and ends with a lex token of closeKind. Advances the parser
       * to the next lex token after the closing token.
       */
      ;

      _proto.any = function any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        while (!this.expectOptionalToken(closeKind)) {
          nodes.push(parseFn.call(this));
        }

        return nodes;
      }
      /**
       * Returns a list of parse nodes, determined by the parseFn.
       * It can be empty only if open token is missing otherwise it will always
       * return non-empty list that begins with a lex token of openKind and ends
       * with a lex token of closeKind. Advances the parser to the next lex token
       * after the closing token.
       */
      ;

      _proto.optionalMany = function optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
          var nodes = [];

          do {
            nodes.push(parseFn.call(this));
          } while (!this.expectOptionalToken(closeKind));

          return nodes;
        }

        return [];
      }
      /**
       * Returns a non-empty list of parse nodes, determined by
       * the parseFn. This list begins with a lex token of openKind
       * and ends with a lex token of closeKind. Advances the parser
       * to the next lex token after the closing token.
       */
      ;

      _proto.many = function many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));

        return nodes;
      };

      return Parser;
    }();
    /**
     * A helper function to describe a token as a string for debugging
     */


    function getTokenDesc(token) {
      var value = token.value;
      return getTokenKindDesc(token.kind) + (value != null ? " \"".concat(value, "\"") : '');
    }
    /**
     * A helper function to describe a token kind as a string for debugging
     */


    function getTokenKindDesc(kind) {
      return isPunctuatorTokenKind(kind) ? "\"".concat(kind, "\"") : kind;
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        parse: parse,
        parseValue: parseValue,
        parseType: parseType
    });

    var parser$1 = getCjsExportFromNamespace(parser);

    var parse$1 = parser$1.parse;

    // Strip insignificant whitespace
    // Note that this could do a lot more, such as reorder fields etc.
    function normalize(string) {
      return string.replace(/[\s,]+/g, ' ').trim();
    }

    // A map docString -> graphql document
    var docCache = {};

    // A map fragmentName -> [normalized source]
    var fragmentSourceMap = {};

    function cacheKeyFromLoc(loc) {
      return normalize(loc.source.body.substring(loc.start, loc.end));
    }

    // For testing.
    function resetCaches() {
      docCache = {};
      fragmentSourceMap = {};
    }

    // Take a unstripped parsed document (query/mutation or even fragment), and
    // check all fragment definitions, checking for name->source uniqueness.
    // We also want to make sure only unique fragments exist in the document.
    var printFragmentWarnings = true;
    function processFragments(ast) {
      var astFragmentMap = {};
      var definitions = [];

      for (var i = 0; i < ast.definitions.length; i++) {
        var fragmentDefinition = ast.definitions[i];

        if (fragmentDefinition.kind === 'FragmentDefinition') {
          var fragmentName = fragmentDefinition.name.value;
          var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

          // We know something about this fragment
          if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {

            // this is a problem because the app developer is trying to register another fragment with
            // the same name as one previously registered. So, we tell them about it.
            if (printFragmentWarnings) {
              console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
                + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
                + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
            }

            fragmentSourceMap[fragmentName][sourceKey] = true;

          } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
            fragmentSourceMap[fragmentName] = {};
            fragmentSourceMap[fragmentName][sourceKey] = true;
          }

          if (!astFragmentMap[sourceKey]) {
            astFragmentMap[sourceKey] = true;
            definitions.push(fragmentDefinition);
          }
        } else {
          definitions.push(fragmentDefinition);
        }
      }

      ast.definitions = definitions;
      return ast;
    }

    function disableFragmentWarnings() {
      printFragmentWarnings = false;
    }

    function stripLoc(doc, removeLocAtThisLevel) {
      var docType = Object.prototype.toString.call(doc);

      if (docType === '[object Array]') {
        return doc.map(function (d) {
          return stripLoc(d, removeLocAtThisLevel);
        });
      }

      if (docType !== '[object Object]') {
        throw new Error('Unexpected input.');
      }

      // We don't want to remove the root loc field so we can use it
      // for fragment substitution (see below)
      if (removeLocAtThisLevel && doc.loc) {
        delete doc.loc;
      }

      // https://github.com/apollographql/graphql-tag/issues/40
      if (doc.loc) {
        delete doc.loc.startToken;
        delete doc.loc.endToken;
      }

      var keys = Object.keys(doc);
      var key;
      var value;
      var valueType;

      for (key in keys) {
        if (keys.hasOwnProperty(key)) {
          value = doc[keys[key]];
          valueType = Object.prototype.toString.call(value);

          if (valueType === '[object Object]' || valueType === '[object Array]') {
            doc[keys[key]] = stripLoc(value, true);
          }
        }
      }

      return doc;
    }

    var experimentalFragmentVariables = false;
    function parseDocument(doc) {
      var cacheKey = normalize(doc);

      if (docCache[cacheKey]) {
        return docCache[cacheKey];
      }

      var parsed = parse$1(doc, { experimentalFragmentVariables: experimentalFragmentVariables });
      if (!parsed || parsed.kind !== 'Document') {
        throw new Error('Not a valid GraphQL document.');
      }

      // check that all "new" fragments inside the documents are consistent with
      // existing fragments of the same name
      parsed = processFragments(parsed);
      parsed = stripLoc(parsed, false);
      docCache[cacheKey] = parsed;

      return parsed;
    }

    function enableExperimentalFragmentVariables() {
      experimentalFragmentVariables = true;
    }

    function disableExperimentalFragmentVariables() {
      experimentalFragmentVariables = false;
    }

    // XXX This should eventually disallow arbitrary string interpolation, like Relay does
    function gql(/* arguments */) {
      var args = Array.prototype.slice.call(arguments);

      var literals = args[0];

      // We always get literals[0] and then matching post literals for each arg given
      var result = (typeof(literals) === "string") ? literals : literals[0];

      for (var i = 1; i < args.length; i++) {
        if (args[i] && args[i].kind && args[i].kind === 'Document') {
          result += args[i].loc.source.body;
        } else {
          result += args[i];
        }

        result += literals[i];
      }

      return parseDocument(result);
    }

    // Support typescript, which isn't as nice as Babel about default exports
    gql.default = gql;
    gql.resetCaches = resetCaches;
    gql.disableFragmentWarnings = disableFragmentWarnings;
    gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
    gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

    var src = gql;

    var PRESET_CONFIG_KEYS = [
        'request',
        'uri',
        'credentials',
        'headers',
        'fetch',
        'fetchOptions',
        'clientState',
        'onError',
        'cacheRedirects',
        'cache',
        'name',
        'version',
        'resolvers',
        'typeDefs',
        'fragmentMatcher',
    ];
    var DefaultClient = (function (_super) {
        __extends(DefaultClient, _super);
        function DefaultClient(config) {
            if (config === void 0) { config = {}; }
            var _this = this;
            if (config) {
                var diff = Object.keys(config).filter(function (key) { return PRESET_CONFIG_KEYS.indexOf(key) === -1; });
                if (diff.length > 0) {
                    process.env.NODE_ENV === "production" || invariant.warn('ApolloBoost was initialized with unsupported options: ' +
                        ("" + diff.join(' ')));
                }
            }
            var request = config.request, uri = config.uri, credentials = config.credentials, headers = config.headers, fetch = config.fetch, fetchOptions = config.fetchOptions, clientState = config.clientState, cacheRedirects = config.cacheRedirects, errorCallback = config.onError, name = config.name, version = config.version, resolvers = config.resolvers, typeDefs = config.typeDefs, fragmentMatcher = config.fragmentMatcher;
            var cache = config.cache;
            process.env.NODE_ENV === "production" ? invariant(!cache || !cacheRedirects, 1) : invariant(!cache || !cacheRedirects, 'Incompatible cache configuration. When not providing `cache`, ' +
                'configure the provided instance with `cacheRedirects` instead.');
            if (!cache) {
                cache = cacheRedirects
                    ? new InMemoryCache({ cacheRedirects: cacheRedirects })
                    : new InMemoryCache();
            }
            var errorLink = errorCallback
                ? onError(errorCallback)
                : onError(function (_a) {
                    var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError;
                    if (graphQLErrors) {
                        graphQLErrors.forEach(function (_a) {
                            var message = _a.message, locations = _a.locations, path = _a.path;
                            return process.env.NODE_ENV === "production" || invariant.warn("[GraphQL error]: Message: " + message + ", Location: " +
                                (locations + ", Path: " + path));
                        });
                    }
                    if (networkError) {
                        process.env.NODE_ENV === "production" || invariant.warn("[Network error]: " + networkError);
                    }
                });
            var requestHandler = request
                ? new ApolloLink(function (operation, forward) {
                    return new Observable(function (observer) {
                        var handle;
                        Promise.resolve(operation)
                            .then(function (oper) { return request(oper); })
                            .then(function () {
                            handle = forward(operation).subscribe({
                                next: observer.next.bind(observer),
                                error: observer.error.bind(observer),
                                complete: observer.complete.bind(observer),
                            });
                        })
                            .catch(observer.error.bind(observer));
                        return function () {
                            if (handle) {
                                handle.unsubscribe();
                            }
                        };
                    });
                })
                : false;
            var httpLink = new HttpLink({
                uri: uri || '/graphql',
                fetch: fetch,
                fetchOptions: fetchOptions || {},
                credentials: credentials || 'same-origin',
                headers: headers || {},
            });
            var link = ApolloLink.from([errorLink, requestHandler, httpLink].filter(function (x) { return !!x; }));
            var activeResolvers = resolvers;
            var activeTypeDefs = typeDefs;
            var activeFragmentMatcher = fragmentMatcher;
            if (clientState) {
                if (clientState.defaults) {
                    cache.writeData({
                        data: clientState.defaults,
                    });
                }
                activeResolvers = clientState.resolvers;
                activeTypeDefs = clientState.typeDefs;
                activeFragmentMatcher = clientState.fragmentMatcher;
            }
            _this = _super.call(this, {
                cache: cache,
                link: link,
                name: name,
                version: version,
                resolvers: activeResolvers,
                typeDefs: activeTypeDefs,
                fragmentMatcher: activeFragmentMatcher,
            }) || this;
            return _this;
        }
        return DefaultClient;
    }(ApolloClient));

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
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

    var OBSERVABLE;
    function isObservable(value) {
        // Lazy-load Symbol to give polyfills a chance to run
        if (!OBSERVABLE) {
            OBSERVABLE =
                (typeof Symbol === 'function' && Symbol.observable) || '@@observable';
        }
        return value && value[OBSERVABLE] && value[OBSERVABLE]() === value;
    }
    function deferred(set, initial) {
        var initialized = initial !== undefined;
        var resolve;
        var reject;
        // Set initial value
        set(initialized
            ? initial
            : new Promise(function (_resolve, _reject) {
                resolve = _resolve;
                reject = _reject;
            }));
        return {
            fulfill: function (value) {
                if (initialized)
                    return set(Promise.resolve(value));
                initialized = true;
                resolve(value);
            },
            reject: function (error) {
                if (initialized)
                    return set(Promise.reject(error));
                initialized = true;
                reject(error);
            }
        };
    }

    var noop$1 = function () { };
    function observe(observable, initial) {
        if (!isObservable(observable)) {
            return readable(observable, noop$1);
        }
        return readable(undefined, function (set) {
            var _a = deferred(set, initial), fulfill = _a.fulfill, reject = _a.reject;
            var subscription = observable.subscribe({
                next: function (value) {
                    fulfill(value);
                },
                error: function (err) {
                    reject(err);
                }
            });
            return function () { return subscription.unsubscribe(); };
        });
    }

    var CLIENT = typeof Symbol !== 'undefined' ? Symbol('client') : '@@client';
    function getClient() {
        return getContext(CLIENT);
    }
    function setClient(client) {
        setContext(CLIENT, client);
    }

    var restoring = typeof WeakSet !== 'undefined' ? new WeakSet() : new Set();

    function query(client, options) {
        var subscribed = false;
        var initial_value;
        // If client is restoring (e.g. from SSR)
        // attempt synchronous readQuery first (to prevent loading in {#await})
        if (restoring.has(client)) {
            try {
                // undefined = skip initial value (not in cache)
                initial_value = client.readQuery(options) || undefined;
                initial_value = { data: initial_value };
            }
            catch (err) {
                // Ignore preload errors
            }
        }
        // Create query and observe,
        // but don't subscribe directly to avoid firing duplicate value if initialized
        var observable_query = client.watchQuery(options);
        var subscribe_to_query = observe(observable_query, initial_value).subscribe;
        // Wrap the query subscription with a readable to prevent duplicate values
        var subscribe = readable(initial_value, function (set) {
            subscribed = true;
            var skip_duplicate = initial_value !== undefined;
            var initialized = false;
            var skipped = false;
            var unsubscribe = subscribe_to_query(function (value) {
                if (skip_duplicate && initialized && !skipped) {
                    skipped = true;
                }
                else {
                    if (!initialized)
                        initialized = true;
                    set(value);
                }
            });
            return unsubscribe;
        }).subscribe;
        return {
            subscribe: subscribe,
            refetch: function (variables) {
                // If variables have not changed and not subscribed, skip refetch
                if (!subscribed && equal(variables, observable_query.variables))
                    return observable_query.result();
                return observable_query.refetch(variables);
            },
            result: function () { return observable_query.result(); },
            fetchMore: function (options) { return observable_query.fetchMore(options); },
            setOptions: function (options) { return observable_query.setOptions(options); },
            updateQuery: function (map) { return observable_query.updateQuery(map); },
            startPolling: function (interval) { return observable_query.startPolling(interval); },
            stopPolling: function () { return observable_query.stopPolling(); },
            subscribeToMore: function (options) { return observable_query.subscribeToMore(options); }
        };
    }

    function mutate(client, options) {
        return client.mutate(options);
    }

    /* src/quants/Omo-Query.svelte generated by Svelte v3.20.1 */
    const file$g = "src/quants/Omo-Query.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (39:2) {:catch e}
    function create_catch_block(ctx) {
    	let t_value = /*e*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$feedOp*/ 1 && t_value !== (t_value = /*e*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(39:2) {:catch e}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {:then result}
    function create_then_block(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*result*/ ctx[4].data["feed"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*feed*/ ctx[6].id;
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$feedOp*/ 1) {
    				const each_value = /*result*/ ctx[4].data["feed"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$8, each_1_anchor, get_each_context$8);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(29:2) {:then result}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#each result.data['feed'] as feed (feed.id)}
    function create_each_block$8(key_1, ctx) {
    	let div;
    	let p0;
    	let t0_value = /*feed*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*feed*/ ctx[6].content + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4;
    	let t5_value = /*feed*/ ctx[6].published + "";
    	let t5;
    	let t6;
    	let p3;
    	let t7;
    	let t8_value = /*feed*/ ctx[6].author.name + "";
    	let t8;
    	let t9;
    	let p4;
    	let t10;
    	let t11_value = /*feed*/ ctx[6].author.email + "";
    	let t11;
    	let t12;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text("published: ");
    			t5 = text(t5_value);
    			t6 = space();
    			p3 = element("p");
    			t7 = text("author name: ");
    			t8 = text(t8_value);
    			t9 = space();
    			p4 = element("p");
    			t10 = text("author mail: ");
    			t11 = text(t11_value);
    			t12 = space();
    			add_location(p0, file$g, 31, 8, 608);
    			add_location(p1, file$g, 32, 8, 636);
    			add_location(p2, file$g, 33, 8, 666);
    			add_location(p3, file$g, 34, 8, 709);
    			add_location(p4, file$g, 35, 8, 756);
    			attr_dev(div, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div, file$g, 30, 6, 540);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(div, t3);
    			append_dev(div, p2);
    			append_dev(p2, t4);
    			append_dev(p2, t5);
    			append_dev(div, t6);
    			append_dev(div, p3);
    			append_dev(p3, t7);
    			append_dev(p3, t8);
    			append_dev(div, t9);
    			append_dev(div, p4);
    			append_dev(p4, t10);
    			append_dev(p4, t11);
    			append_dev(div, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$feedOp*/ 1 && t0_value !== (t0_value = /*feed*/ ctx[6].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$feedOp*/ 1 && t2_value !== (t2_value = /*feed*/ ctx[6].content + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$feedOp*/ 1 && t5_value !== (t5_value = /*feed*/ ctx[6].published + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$feedOp*/ 1 && t8_value !== (t8_value = /*feed*/ ctx[6].author.name + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$feedOp*/ 1 && t11_value !== (t11_value = /*feed*/ ctx[6].author.email + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(30:4) {#each result.data['feed'] as feed (feed.id)}",
    		ctx
    	});

    	return block;
    }

    // (25:18)       <p>.. loading</p>    {:then result}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = ".. loading";
    			add_location(p, file$g, 26, 4, 448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(25:18)       <p>.. loading</p>    {:then result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 4,
    		error: 5
    	};

    	handle_promise(promise = /*$feedOp*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			set_style(div, "text-align", "center");
    			add_location(div, file$g, 23, 0, 392);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$feedOp*/ 1 && promise !== (promise = /*$feedOp*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[4] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
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
    	let $feedOp;

    	const getFeed = src`
    {
      feed {
        id
        title
        content
        published
        author {
          id
          name
          email
        }
      }
    }
  `;

    	const client = getClient();
    	const feedOp = query(client, { query: getFeed });
    	validate_store(feedOp, "feedOp");
    	component_subscribe($$self, feedOp, value => $$invalidate(0, $feedOp = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Query> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Query", $$slots, []);

    	$$self.$capture_state = () => ({
    		getClient,
    		query,
    		mutate,
    		gql: src,
    		getFeed,
    		client,
    		feedOp,
    		$feedOp
    	});

    	return [$feedOp, feedOp];
    }

    class Omo_Query extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Query",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/quants/Omo-Graphql.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$h = "src/quants/Omo-Graphql.svelte";

    function create_fragment$l(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let iframe;
    	let iframe_src_value;
    	let current;
    	const omoquery = new Omo_Query({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(omoquery.$$.fragment);
    			t = space();
    			iframe = element("iframe");
    			attr_dev(div0, "class", "w-full h-full");
    			add_location(div0, file$h, 18, 4, 470);
    			attr_dev(div1, "class", "w-1/2");
    			add_location(div1, file$h, 17, 2, 446);
    			if (iframe.src !== (iframe_src_value = "http://localhost:4000")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "class", "h-full w-1/2");
    			attr_dev(iframe, "title", "graphql ui");
    			add_location(iframe, file$h, 22, 2, 539);
    			attr_dev(div2, "class", "flex w-full h-full");
    			add_location(div2, file$h, 16, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(omoquery, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, iframe);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoquery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoquery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(omoquery);
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
    	const client = new DefaultClient({
    			uri: "http://localhost:4000/",
    			onError: ({ networkError, graphQLErrors }) => {
    				console.log("graphQLErrors", graphQLErrors);
    				console.log("networkError", networkError);
    			}
    		});

    	setClient(client);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Omo_Graphql> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Graphql", $$slots, []);

    	$$self.$capture_state = () => ({
    		ApolloClient: DefaultClient,
    		setClient,
    		OmoQuery: Omo_Query,
    		client
    	});

    	return [];
    }

    class Omo_Graphql extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Graphql",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/routes/Graphql.svelte generated by Svelte v3.20.1 */

    function create_fragment$m(ctx) {
    	let current;
    	const omographql = new Omo_Graphql({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(omographql.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(omographql, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omographql.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omographql.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(omographql, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Graphql> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Graphql", $$slots, []);
    	$$self.$capture_state = () => ({ OmoGraphQL: Omo_Graphql });
    	return [];
    }

    class Graphql extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graphql",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/routes/Enkel.svelte generated by Svelte v3.20.1 */
    const file$i = "src/routes/Enkel.svelte";

    function create_fragment$n(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let p;
    	let t4;
    	let div4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t5;
    	let h2;
    	let t7;
    	let div2;
    	let t8;
    	let div5;
    	let current;

    	const omocity = new Omo_City({
    			props: { city: /*city*/ ctx[2], db: /*db*/ ctx[0] },
    			$$inline: true
    		});

    	const omoleidenschaften = new OmoLeidenschaften({
    			props: {
    				leidenschaften: /*leidenschaften*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = `"${/*enkel*/ ctx[1].story}"`;
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t5 = space();
    			h2 = element("h2");
    			h2.textContent = "Meine schöne Heimatstadt";
    			t7 = space();
    			div2 = element("div");
    			create_component(omocity.$$.fragment);
    			t8 = space();
    			div5 = element("div");
    			create_component(omoleidenschaften.$$.fragment);
    			attr_dev(div0, "class", "py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap\n  bg-cover bg-center justify-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*enkel*/ ctx[1].image + "')");
    			attr_dev(div0, "title", "dream");
    			add_location(div0, file$i, 13, 0, 459);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$i, 22, 2, 780);
    			attr_dev(div1, "class", "text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap\n  justify-center content-center");
    			add_location(div1, file$i, 19, 0, 661);
    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$i, 27, 4, 933);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$i, 28, 4, 1006);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$i, 33, 4, 1163);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$i, 26, 2, 900);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$i, 25, 0, 858);
    			attr_dev(div5, "class", "flex justify-center my-10");
    			add_location(div5, file$i, 40, 0, 1256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div3, t5);
    			append_dev(div3, h2);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			mount_component(omocity, div2, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(omoleidenschaften, div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omocity_changes = {};
    			if (dirty & /*db*/ 1) omocity_changes.db = /*db*/ ctx[0];
    			omocity.$set(omocity_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omocity.$$.fragment, local);
    			transition_in(omoleidenschaften.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omocity.$$.fragment, local);
    			transition_out(omoleidenschaften.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			destroy_component(omocity);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div5);
    			destroy_component(omoleidenschaften);
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
    	let { db } = $$props;
    	let { currentId } = $$props;
    	let enkel = db.enkels.find(item => item.id == currentId);
    	let city = db.cities.find(item => item.id == enkel.city);
    	let leidenschaften = db.leidenschaften.filter(x => enkel.leidenschaften.some(y => y == x.id));
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Enkel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Enkel", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoEnkel: Omo_Enkel,
    		OmoCity: Omo_City,
    		OmoLeidenschaften,
    		db,
    		currentId,
    		enkel,
    		city,
    		leidenschaften
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    		if ("enkel" in $$props) $$invalidate(1, enkel = $$props.enkel);
    		if ("city" in $$props) $$invalidate(2, city = $$props.city);
    		if ("leidenschaften" in $$props) $$invalidate(3, leidenschaften = $$props.leidenschaften);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, enkel, city, leidenschaften, currentId];
    }

    class Enkel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { db: 0, currentId: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Enkel",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<Enkel> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[4] === undefined && !("currentId" in props)) {
    			console.warn("<Enkel> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<Enkel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Enkel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Enkel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Enkel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    /* src/routes/Chat.svelte generated by Svelte v3.20.1 */
    const file$j = "src/routes/Chat.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (94:6) {#each comments as comment}
    function create_each_block$9(ctx) {
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
    			add_location(span, file$j, 95, 10, 4198);
    			attr_dev(article, "class", "m-1  svelte-n1zsew");
    			toggle_class(article, "left", /*comment*/ ctx[8].author != "");
    			add_location(article, file$j, 94, 8, 4131);
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
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(94:6) {#each comments as comment}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let div3;
    	let div2;
    	let h2;
    	let t1;
    	let div0;
    	let p;
    	let t3;
    	let div1;
    	let t4;
    	let footer;
    	let div5;
    	let div4;
    	let input;
    	let dispose;
    	let each_value = /*comments*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Willkommen";
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Ich bin dein persönlicher Assistent Robin und führe dich durch alle\n        Prozesse";
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			footer = element("footer");
    			div5 = element("div");
    			div4 = element("div");
    			input = element("input");
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$j, 78, 4, 3591);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$j, 84, 6, 3795);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$j, 83, 4, 3734);
    			attr_dev(div1, "class", "scrollable");
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "column");
    			set_style(div1, "align-items", "flex-end");
    			add_location(div1, file$j, 89, 4, 3965);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$j, 77, 2, 3558);
    			attr_dev(div3, "class", "flex flex-1 justify-center ");
    			set_style(div3, "height", "calc('100%-100px')");
    			add_location(div3, file$j, 76, 0, 3480);
    			attr_dev(input, "class", "block w-full text-gray-700 border border-gray-500 rounded py-2\n        px-4 leading-tight focus:outline-none focus:bg-white\n        focus:border-gray-500");
    			attr_dev(input, "id", "chat-text");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Gebe hier deine Antwort ein");
    			set_style(input, "font-family", "'Indie Flower'", 1);
    			add_location(input, file$j, 111, 6, 4670);
    			attr_dev(div4, "class", "w-5/6 xl:w-4/6 px-3");
    			add_location(div4, file$j, 110, 4, 4630);
    			attr_dev(div5, "class", "flex flex-wrap -mx-3 justify-center");
    			add_location(div5, file$j, 109, 2, 4576);
    			attr_dev(footer, "class", "w-full text-center border-t border-grey bg-gray-300 p-4 sticky bottom-0");
    			add_location(footer, file$j, 107, 0, 4483);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[7](div1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div5);
    			append_dev(div5, div4);
    			append_dev(div4, input);
    			if (remount) dispose();
    			dispose = listen_dev(input, "keydown", /*handleKeydown*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*comments*/ 2) {
    				each_value = /*comments*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
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
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[7](null);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(footer);
    			dispose();
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
    	let chat = [
    		"Hi schön das du an diesem tollen Projekt interessiert bist, ich heiße Robin und wie heißt du?",
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

    	function div1_binding($$value) {
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

    	return [div, comments, handleKeydown, autoscroll, i, chat, eliza, div1_binding];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/quants/Omo-Enkel-Match.svelte generated by Svelte v3.20.1 */

    const file$k = "src/quants/Omo-Enkel-Match.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (17:8) {#each leidenschaften as leidenschaft}
    function create_each_block$a(ctx) {
    	let a;
    	let t0;
    	let t1_value = /*leidenschaft*/ ctx[3].tag + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(a, "href", a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[3].id);
    			attr_dev(a, "class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm\n            font-semibold text-gray-700 mr-2 mb-2");
    			add_location(a, file$k, 17, 10, 510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(17:8) {#each leidenschaften as leidenschaft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let img;
    	let img_src_value;
    	let t;
    	let div0;
    	let a_href_value;
    	let each_value = /*leidenschaften*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			img = element("img");
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = /*enkel*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "primary h-64 w-full rounded-t-lg object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$k, 11, 6, 288);
    			attr_dev(div0, "class", "px-6 pt-4 pb-3");
    			add_location(div0, file$k, 15, 6, 424);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$k, 10, 4, 222);
    			attr_dev(a, "href", a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id);
    			add_location(a, file$k, 9, 2, 187);
    			attr_dev(div2, "class", "w-1/3 p-2");
    			add_location(div2, file$k, 8, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enkel*/ 1 && img.src !== (img_src_value = /*enkel*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*leidenschaften*/ 2) {
    				each_value = /*leidenschaften*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*enkel*/ 1 && a_href_value !== (a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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
    	let { enkel } = $$props;
    	let { db } = $$props;
    	let leidenschaften = db.leidenschaften.filter(x => enkel.leidenschaften.some(y => x.id == y));
    	const writable_props = ["enkel", "db"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Enkel_Match> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Enkel_Match", $$slots, []);

    	$$self.$set = $$props => {
    		if ("enkel" in $$props) $$invalidate(0, enkel = $$props.enkel);
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    	};

    	$$self.$capture_state = () => ({ enkel, db, leidenschaften });

    	$$self.$inject_state = $$props => {
    		if ("enkel" in $$props) $$invalidate(0, enkel = $$props.enkel);
    		if ("db" in $$props) $$invalidate(2, db = $$props.db);
    		if ("leidenschaften" in $$props) $$invalidate(1, leidenschaften = $$props.leidenschaften);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [enkel, leidenschaften, db];
    }

    class Omo_Enkel_Match extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { enkel: 0, db: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkel_Match",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*enkel*/ ctx[0] === undefined && !("enkel" in props)) {
    			console.warn("<Omo_Enkel_Match> was created without expected prop 'enkel'");
    		}

    		if (/*db*/ ctx[2] === undefined && !("db" in props)) {
    			console.warn("<Omo_Enkel_Match> was created without expected prop 'db'");
    		}
    	}

    	get enkel() {
    		throw new Error("<Omo_Enkel_Match>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enkel(value) {
    		throw new Error("<Omo_Enkel_Match>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get db() {
    		throw new Error("<Omo_Enkel_Match>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Enkel_Match>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quants/Omo-Enkels-Match.svelte generated by Svelte v3.20.1 */
    const file$l = "src/quants/Omo-Enkels-Match.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (17:6) {#each enkels as enkel, i (enkel.id)}
    function create_each_block$b(key_1, ctx) {
    	let first;
    	let current;

    	const omoenkel = new Omo_Enkel_Match({
    			props: {
    				enkel: /*enkel*/ ctx[2],
    				db: /*db*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(omoenkel.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(omoenkel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const omoenkel_changes = {};
    			if (dirty & /*enkels*/ 1) omoenkel_changes.enkel = /*enkel*/ ctx[2];
    			if (dirty & /*db*/ 2) omoenkel_changes.db = /*db*/ ctx[1];
    			omoenkel.$set(omoenkel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoenkel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoenkel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(omoenkel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(17:6) {#each enkels as enkel, i (enkel.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*enkels*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*enkel*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$b, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Enkel";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$l, 9, 4, 219);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$l, 10, 4, 292);
    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$l, 15, 4, 430);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$l, 8, 2, 186);
    			attr_dev(div2, "class", "flex justify-center my-20");
    			add_location(div2, file$l, 7, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enkels, db*/ 3) {
    				const each_value = /*enkels*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$b, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$b, null, get_each_context$b);
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
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { db } = $$props;
    	let { enkels } = $$props;
    	if (!enkels) enkels = db.enkels;
    	const writable_props = ["db", "enkels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Enkels_Match> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Enkels_Match", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("enkels" in $$props) $$invalidate(0, enkels = $$props.enkels);
    	};

    	$$self.$capture_state = () => ({ OmoEnkel: Omo_Enkel_Match, db, enkels });

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("enkels" in $$props) $$invalidate(0, enkels = $$props.enkels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [enkels, db];
    }

    class Omo_Enkels_Match extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { db: 1, enkels: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkels_Match",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Omo_Enkels_Match> was created without expected prop 'db'");
    		}

    		if (/*enkels*/ ctx[0] === undefined && !("enkels" in props)) {
    			console.warn("<Omo_Enkels_Match> was created without expected prop 'enkels'");
    		}
    	}

    	get db() {
    		throw new Error("<Omo_Enkels_Match>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Omo_Enkels_Match>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enkels() {
    		throw new Error("<Omo_Enkels_Match>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enkels(value) {
    		throw new Error("<Omo_Enkels_Match>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Leidenschaft.svelte generated by Svelte v3.20.1 */
    const file$m = "src/routes/Leidenschaft.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:2) {#each db.leidenschaften as leidenschaft}
    function create_each_block$c(ctx) {
    	let a;
    	let t0;
    	let t1_value = /*leidenschaft*/ ctx[0].tag + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(a, "href", a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[0].id);
    			attr_dev(a, "class", "inline-block bg-gray-400 rounded-full px-3 py-1 text-sm\n      font-semibold text-gray-700 mr-2");
    			add_location(a, file$m, 24, 4, 799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*db*/ 2 && t1_value !== (t1_value = /*leidenschaft*/ ctx[0].tag + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*db*/ 2 && a_href_value !== (a_href_value = "leidenschaft?id=" + /*leidenschaft*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(24:2) {#each db.leidenschaften as leidenschaft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let div0;
    	let p;
    	let t0_value = /*leidenschaft*/ ctx[0].tag + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let current;
    	let each_value = /*db*/ ctx[1].leidenschaften;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const omodreams = new Omo_Dreams({
    			props: {
    				dreams: /*dreams*/ ctx[2],
    				db: /*db*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const omoenkels = new Omo_Enkels_Match({
    			props: {
    				enkels: /*enkels*/ ctx[3],
    				db: /*db*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(omodreams.$$.fragment);
    			t3 = space();
    			create_component(omoenkels.$$.fragment);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$m, 19, 2, 601);
    			attr_dev(div0, "class", "text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap\n  justify-center content-center");
    			add_location(div0, file$m, 16, 0, 482);
    			attr_dev(div1, "class", "flex flex-wrap justify-center content-center px-6 pt-2");
    			add_location(div1, file$m, 22, 0, 682);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t2, anchor);
    			mount_component(omodreams, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omoenkels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*leidenschaft*/ 1) && t0_value !== (t0_value = /*leidenschaft*/ ctx[0].tag + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*db*/ 2) {
    				each_value = /*db*/ ctx[1].leidenschaften;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const omodreams_changes = {};
    			if (dirty & /*db*/ 2) omodreams_changes.db = /*db*/ ctx[1];
    			omodreams.$set(omodreams_changes);
    			const omoenkels_changes = {};
    			if (dirty & /*db*/ 2) omoenkels_changes.db = /*db*/ ctx[1];
    			omoenkels.$set(omoenkels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omodreams.$$.fragment, local);
    			transition_in(omoenkels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omodreams.$$.fragment, local);
    			transition_out(omoenkels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omodreams, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omoenkels, detaching);
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
    	let { db } = $$props;
    	let { leidenschaft } = $$props;
    	let { currentId } = $$props;
    	if (!leidenschaft) leidenschaft = db.leidenschaften.find(x => x.id == currentId);
    	let dreams = db.dreams.filter(x => x.leidenschaften.some(y => y == leidenschaft.id));
    	let enkels = db.enkels.filter(x => x.leidenschaften.some(y => y == leidenschaft.id));
    	const writable_props = ["db", "leidenschaft", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Leidenschaft> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Leidenschaft", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("leidenschaft" in $$props) $$invalidate(0, leidenschaft = $$props.leidenschaft);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoDreams: Omo_Dreams,
    		OmoEnkels: Omo_Enkels_Match,
    		db,
    		leidenschaft,
    		currentId,
    		dreams,
    		enkels
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(1, db = $$props.db);
    		if ("leidenschaft" in $$props) $$invalidate(0, leidenschaft = $$props.leidenschaft);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    		if ("dreams" in $$props) $$invalidate(2, dreams = $$props.dreams);
    		if ("enkels" in $$props) $$invalidate(3, enkels = $$props.enkels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leidenschaft, db, dreams, enkels, currentId];
    }

    class Leidenschaft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { db: 1, leidenschaft: 0, currentId: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leidenschaft",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[1] === undefined && !("db" in props)) {
    			console.warn("<Leidenschaft> was created without expected prop 'db'");
    		}

    		if (/*leidenschaft*/ ctx[0] === undefined && !("leidenschaft" in props)) {
    			console.warn("<Leidenschaft> was created without expected prop 'leidenschaft'");
    		}

    		if (/*currentId*/ ctx[4] === undefined && !("currentId" in props)) {
    			console.warn("<Leidenschaft> was created without expected prop 'currentId'");
    		}
    	}

    	get db() {
    		throw new Error("<Leidenschaft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set db(value) {
    		throw new Error("<Leidenschaft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get leidenschaft() {
    		throw new Error("<Leidenschaft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leidenschaft(value) {
    		throw new Error("<Leidenschaft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentId() {
    		throw new Error("<Leidenschaft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentId(value) {
    		throw new Error("<Leidenschaft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/OmoCard.svelte generated by Svelte v3.20.1 */

    const file$n = "src/quanta/OmoCard.svelte";

    function create_fragment$s(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let p0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let p1;
    	let t5;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			t1 = text(/*job*/ ctx[1]);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(/*name*/ ctx[0]);
    			t4 = space();
    			p1 = element("p");
    			t5 = text(/*description*/ ctx[3]);
    			attr_dev(div0, "class", "h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none\n    lg:rounded-l text-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*image*/ ctx[2] + "')");
    			attr_dev(div0, "title", /*name*/ ctx[0]);
    			add_location(div0, file$n, 14, 2, 548);
    			attr_dev(p0, "class", "text-sm text-grey-dark flex items-center");
    			add_location(p0, file$n, 24, 6, 1000);
    			attr_dev(div1, "class", "text-black font-bold text-2xl mb-2");
    			add_location(div1, file$n, 25, 6, 1068);
    			attr_dev(p1, "class", "text-grey-darker text-base");
    			add_location(p1, file$n, 26, 6, 1135);
    			attr_dev(div2, "class", "mb-8");
    			add_location(div2, file$n, 23, 4, 975);
    			attr_dev(div3, "class", "w-full border-r border-b border-l border-grey-light lg:border-l-0\n    lg:border-t lg:border-grey-light bg-white rounded-b lg:rounded-b-none\n    lg:rounded-r p-4 flex flex-col justify-between leading-normal");
    			add_location(div3, file$n, 19, 2, 747);
    			attr_dev(div4, "class", "max-w-md w-full lg:flex");
    			add_location(div4, file$n, 13, 0, 508);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, p1);
    			append_dev(p1, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 4) {
    				set_style(div0, "background-image", "url('" + /*image*/ ctx[2] + "')");
    			}

    			if (dirty & /*name*/ 1) {
    				attr_dev(div0, "title", /*name*/ ctx[0]);
    			}

    			if (dirty & /*job*/ 2) set_data_dev(t1, /*job*/ ctx[1]);
    			if (dirty & /*name*/ 1) set_data_dev(t3, /*name*/ ctx[0]);
    			if (dirty & /*description*/ 8) set_data_dev(t5, /*description*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
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

    function instance$s($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { job } = $$props;
    	let { image } = $$props;
    	let { description } = $$props;
    	const writable_props = ["name", "job", "image", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoCard", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("job" in $$props) $$invalidate(1, job = $$props.job);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ name, job, image, description });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("job" in $$props) $$invalidate(1, job = $$props.job);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, job, image, description];
    }

    class OmoCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			name: 0,
    			job: 1,
    			image: 2,
    			description: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCard",
    			options,
    			id: create_fragment$s.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<OmoCard> was created without expected prop 'name'");
    		}

    		if (/*job*/ ctx[1] === undefined && !("job" in props)) {
    			console.warn("<OmoCard> was created without expected prop 'job'");
    		}

    		if (/*image*/ ctx[2] === undefined && !("image" in props)) {
    			console.warn("<OmoCard> was created without expected prop 'image'");
    		}

    		if (/*description*/ ctx[3] === undefined && !("description" in props)) {
    			console.warn("<OmoCard> was created without expected prop 'description'");
    		}
    	}

    	get name() {
    		throw new Error("<OmoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<OmoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get job() {
    		throw new Error("<OmoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set job(value) {
    		throw new Error("<OmoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<OmoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<OmoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<OmoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<OmoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Tutorial.svelte generated by Svelte v3.20.1 */
    const file$o = "src/routes/Tutorial.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (127:4) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Invalid Input";
    			add_location(p, file$o, 127, 6, 3662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(127:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if formState === 'done'}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "success";
    			add_location(p, file$o, 125, 6, 3629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(125:4) {#if formState === 'done'}",
    		ctx
    	});

    	return block;
    }

    // (142:4) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("no contacts yet");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(142:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (132:4) {#each contacts as c, i (c.id)}
    function create_each_block$d(key_1, ctx) {
    	let div;
    	let t0;
    	let t1_value = /*i*/ ctx[15] + 1 + "";
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const omocard = new OmoCard({
    			props: {
    				class: "w-full",
    				name: /*c*/ ctx[13].name,
    				job: /*c*/ ctx[13].job,
    				image: /*c*/ ctx[13].image,
    				description: /*c*/ ctx[13].description
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(omocard.$$.fragment);
    			t3 = space();
    			attr_dev(div, "class", "mb-5 w-full");
    			add_location(div, file$o, 132, 6, 3782);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			mount_component(omocard, div, null);
    			append_dev(div, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*contacts*/ 32) && t1_value !== (t1_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t1, t1_value);
    			const omocard_changes = {};
    			if (dirty & /*contacts*/ 32) omocard_changes.name = /*c*/ ctx[13].name;
    			if (dirty & /*contacts*/ 32) omocard_changes.job = /*c*/ ctx[13].job;
    			if (dirty & /*contacts*/ 32) omocard_changes.image = /*c*/ ctx[13].image;
    			if (dirty & /*contacts*/ 32) omocard_changes.description = /*c*/ ctx[13].description;
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
    			if (detaching) detach_dev(div);
    			destroy_component(omocard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(132:4) {#each contacts as c, i (c.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div9;
    	let form;
    	let div4;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div3;
    	let label3;
    	let t10;
    	let textarea;
    	let t11;
    	let div5;
    	let t13;
    	let div6;
    	let t15;
    	let div7;
    	let t17;
    	let t18;
    	let div8;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*formState*/ ctx[4] === "done") return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*contacts*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*c*/ ctx[13].id;
    	validate_each_keys(ctx, each_value, get_each_context$d, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$d(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			form = element("form");
    			div4 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Job Title";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Image";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Description";
    			t10 = space();
    			textarea = element("textarea");
    			t11 = space();
    			div5 = element("div");
    			div5.textContent = "Save";
    			t13 = space();
    			div6 = element("div");
    			div6.textContent = "Delete First";
    			t15 = space();
    			div7 = element("div");
    			div7.textContent = "Delete Last";
    			t17 = space();
    			if_block.c();
    			t18 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(label0, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n          mb-2");
    			attr_dev(label0, "for", "grid-first-name");
    			add_location(label0, file$o, 44, 8, 960);
    			attr_dev(input0, "class", "block w-full text-gray-700 border bg-white rounded py-3 px-4\n          mb-3 leading-tight outline-none focus:bg-white");
    			attr_dev(input0, "id", "grid-first-name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", /*name*/ ctx[0]);
    			add_location(input0, file$o, 50, 8, 1135);
    			attr_dev(div0, "class", "w-full md:w-1/2 px-3 mb-6 md:mb-0");
    			add_location(div0, file$o, 43, 6, 904);
    			attr_dev(label1, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n          mb-2");
    			attr_dev(label1, "for", "grid-last-name");
    			add_location(label1, file$o, 60, 8, 1454);
    			attr_dev(input1, "class", "block w-full text-gray-700 border bg-white rounded py-3 px-4\n          leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input1, "id", "grid-last-name");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", /*job*/ ctx[1]);
    			add_location(input1, file$o, 66, 8, 1633);
    			attr_dev(div1, "class", "w-full md:w-1/2 px-3");
    			add_location(div1, file$o, 59, 6, 1411);
    			attr_dev(label2, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n          mb-2");
    			attr_dev(label2, "for", "grid-first-name");
    			add_location(label2, file$o, 75, 8, 1975);
    			attr_dev(input2, "class", "block w-full text-gray-700 border bg-white rounded py-3 px-4\n          leading-tight outline-none focus:bg-white");
    			attr_dev(input2, "id", "grid-first-name");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", /*image*/ ctx[2]);
    			add_location(input2, file$o, 81, 8, 2151);
    			attr_dev(div2, "class", "w-full px-3 mb-6 md:mb-0");
    			add_location(div2, file$o, 74, 6, 1928);
    			attr_dev(label3, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n          mb-2");
    			attr_dev(label3, "for", "grid-first-name");
    			add_location(label3, file$o, 90, 8, 2470);
    			attr_dev(textarea, "class", "block w-full text-gray-700 border bg-white rounded py-3 px-4\n          leading-tight outline-none focus:bg-white");
    			attr_dev(textarea, "id", "grid-first-name");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "placeholder", /*description*/ ctx[3]);
    			add_location(textarea, file$o, 96, 8, 2652);
    			attr_dev(div3, "class", "w-full px-3 mb-6 md:mb-0");
    			add_location(div3, file$o, 89, 6, 2423);
    			attr_dev(div4, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div4, file$o, 42, 4, 858);
    			attr_dev(div5, "type", "submit");
    			attr_dev(div5, "class", "block text-white border bg-ci rounded py-3 px-4 leading-tight\n      outline-none hover:bg-yellow-300 hover:text-gray-800");
    			add_location(div5, file$o, 105, 4, 2948);
    			attr_dev(div6, "class", "block text-white border bg-gray-500 rounded py-3 px-4 leading-tight\n      outline-none hover:bg-yellow-300 hover:text-gray-800");
    			add_location(div6, file$o, 112, 4, 3178);
    			attr_dev(div7, "class", "block text-white border bg-gray-500 rounded py-3 px-4 leading-tight\n      outline-none hover:bg-yellow-300 hover:text-gray-800");
    			add_location(div7, file$o, 118, 4, 3388);
    			attr_dev(form, "class", "w-2/3 pr-8");
    			add_location(form, file$o, 41, 2, 828);
    			attr_dev(div8, "class", "flex flex-wrap w-1/3");
    			add_location(div8, file$o, 130, 2, 3705);
    			attr_dev(div9, "class", "py-24 px-16 flex");
    			add_location(div9, file$o, 40, 0, 795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, form);
    			append_dev(form, div4);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*job*/ ctx[1]);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t7);
    			append_dev(div2, input2);
    			set_input_value(input2, /*image*/ ctx[2]);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t10);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*description*/ ctx[3]);
    			append_dev(form, t11);
    			append_dev(form, div5);
    			append_dev(form, t13);
    			append_dev(form, div6);
    			append_dev(form, t15);
    			append_dev(form, div7);
    			append_dev(form, t17);
    			if_block.m(form, null);
    			append_dev(div9, t18);
    			append_dev(div9, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div8, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12]),
    				listen_dev(div5, "click", prevent_default(/*addContact*/ ctx[6]), false, true, false),
    				listen_dev(div6, "click", /*deleteFirst*/ ctx[7], false, false, false),
    				listen_dev(div7, "click", /*deleteLast*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) {
    				attr_dev(input0, "placeholder", /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (!current || dirty & /*job*/ 2) {
    				attr_dev(input1, "placeholder", /*job*/ ctx[1]);
    			}

    			if (dirty & /*job*/ 2 && input1.value !== /*job*/ ctx[1]) {
    				set_input_value(input1, /*job*/ ctx[1]);
    			}

    			if (!current || dirty & /*image*/ 4) {
    				attr_dev(input2, "placeholder", /*image*/ ctx[2]);
    			}

    			if (dirty & /*image*/ 4 && input2.value !== /*image*/ ctx[2]) {
    				set_input_value(input2, /*image*/ ctx[2]);
    			}

    			if (!current || dirty & /*description*/ 8) {
    				attr_dev(textarea, "placeholder", /*description*/ ctx[3]);
    			}

    			if (dirty & /*description*/ 8) {
    				set_input_value(textarea, /*description*/ ctx[3]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(form, null);
    				}
    			}

    			if (dirty & /*contacts*/ 32) {
    				const each_value = /*contacts*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$d, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div8, outro_and_destroy_block, create_each_block$d, null, get_each_context$d);
    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div8, null);
    				}
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
    			if (detaching) detach_dev(div9);
    			if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			run_all(dispose);
    		}
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

    function instance$t($$self, $$props, $$invalidate) {
    	let name = "Samuel";
    	let job = "Founder";
    	let image = "/images/profile.jpg";
    	let description = "";
    	let formState = "empty";
    	let contacts = [];

    	function addContact() {
    		if (name.trim().length == 0 || job.trim().length == 0 || image.trim().length == 0 || description.trim().length == 0) {
    			$$invalidate(4, formState = "invalid");
    			return;
    		}

    		$$invalidate(4, formState = "done");

    		$$invalidate(5, contacts = [
    			...contacts,
    			{
    				id: Math.random(),
    				name,
    				job,
    				image,
    				description
    			}
    		]);
    	}

    	function deleteFirst() {
    		$$invalidate(5, contacts = contacts.slice(1));
    	}

    	function deleteLast() {
    		$$invalidate(5, contacts = contacts.slice(0, -1));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tutorial> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tutorial", $$slots, []);

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		job = this.value;
    		$$invalidate(1, job);
    	}

    	function input2_input_handler() {
    		image = this.value;
    		$$invalidate(2, image);
    	}

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(3, description);
    	}

    	$$self.$capture_state = () => ({
    		OmoCard,
    		name,
    		job,
    		image,
    		description,
    		formState,
    		contacts,
    		addContact,
    		deleteFirst,
    		deleteLast
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("job" in $$props) $$invalidate(1, job = $$props.job);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("formState" in $$props) $$invalidate(4, formState = $$props.formState);
    		if ("contacts" in $$props) $$invalidate(5, contacts = $$props.contacts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		job,
    		image,
    		description,
    		formState,
    		contacts,
    		addContact,
    		deleteFirst,
    		deleteLast,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class Tutorial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tutorial",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    const router = {
        '/': Home,
        '/home': Home,
        '/dream': Dream,
        '/city': City,
        '/graphql': Graphql,
        '/enkel': Enkel,
        '/chat': Chat,
        '/leidenschaft': Leidenschaft,
        '/tutorial': Tutorial,

    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quants/Omo-Navbar.svelte generated by Svelte v3.20.1 */

    const file$p = "src/quants/Omo-Navbar.svelte";

    function create_fragment$u(ctx) {
    	let header;
    	let nav;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let div0;
    	let a1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			a1 = element("a");
    			a1.textContent = "Jetzt Lebensträume erfüllen";
    			if (img.src !== (img_src_value = "images/logo_light.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image");
    			attr_dev(img, "class", "w-auto h-8");
    			add_location(img, file$p, 3, 6, 111);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$p, 2, 4, 92);
    			attr_dev(a1, "href", "chat");
    			attr_dev(a1, "class", " hover:bg-orange-300 hover:text-gray-800 bg-ci text-gray-100\n          rounded-full px-3 py-1 text-lg font-semibold");
    			set_style(a1, "font-family", "'Indie Flower'", 1);
    			add_location(a1, file$p, 7, 8, 284);
    			attr_dev(div0, "class", "flex text-sm");
    			attr_dev(div0, "v-else", "");
    			add_location(div0, file$p, 6, 6, 242);
    			attr_dev(div1, "class", "md:items-center md:w-auto flex");
    			add_location(div1, file$p, 5, 4, 191);
    			attr_dev(nav, "class", "flex justify-between w-full text-white p-4");
    			add_location(nav, file$p, 1, 2, 31);
    			attr_dev(header, "class", "bg-gray-900");
    			add_location(header, file$p, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, a0);
    			append_dev(a0, img);
    			append_dev(nav, t0);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
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

    function instance$u($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Omo_Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Omo_Navbar", $$slots, []);
    	return [];
    }

    class Omo_Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Navbar",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    const db = {
      wishes: [
        {
          id: "1",
          title: "Wunsch",
          content: "Regelmäßig zusammen kochen und essen"
        },
        {
          id: "2",
          title: "Wunsch",
          content: "Einmal die Woche Schachspielen"
        },
        {
          id: "3",
          title: "Wunsch",
          content: "Öfters in die Natur spazieren gehen"
        },
        {
          id: "4",
          title: "Wunsch",
          content: "Eine tolle Brieffreundschaft"
        },
        {
          id: "5",
          title: "Wunsch",
          content: "mal wieder richtig zu lachen"
        },
        {
          id: "6",
          title: "Wunsch",
          content: "das Schalke Deutscher Meister wird"
        }
      ],
      schwierigkeiten: [
        {
          id: "1",
          tag: "hören"
        },
        {
          id: "2",
          tag: "sehen"
        },
        {
          id: "3",
          tag: "laufen"
        },
        {
          id: "4",
          tag: "essen"
        },
        {
          id: "5",
          tag: "reden"
        }
      ],
      leidenschaften: [
        {
          id: "1",
          tag: "stricken"
        },
        {
          id: "2",
          tag: "fischen"
        },
        {
          id: "3",
          tag: "kochen"
        },
        {
          id: "4",
          tag: "backen"
        },
        {
          id: "5",
          tag: "schach"
        },
        {
          id: "6",
          tag: "internet"
        },
        {
          id: "7",
          tag: "billiard"
        },
        {
          id: "8",
          tag: "tanzen"
        },
        {
          id: "9",
          tag: "reisen"
        }
      ],
      cities: [
        {
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
          name: "Memmingen",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Memmingen-Marktplatz.JPG"
        },
        {
          id: 4,
          name: "Neue Stadt gründen",
          image: "/images/addcity.jpg"
        }
      ],
      enkels: [
        {
          id: 0,
          name: "Emma",
          image: "https://source.unsplash.com/rDEOVtE7vOs",
          story:
            "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
          city: 2,
          leidenschaften: [1, 4, 7, 8, 9]
        },
        {
          id: 1,
          name: "Jakob",
          image: "https://source.unsplash.com/7YVZYZeITc8",
          story:
            "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabtf",
          city: 1,
          leidenschaften: [1, 2, 3, 4]
        },
        {
          id: 2,
          name: "Volker",
          image: "https://source.unsplash.com/rriAI0nhcbc",
          story:
            "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
          city: 2,
          leidenschaften: [1, 3, 5, 6, 9]
        },
        {
          id: 3,
          name: "Adele",
          image: "https://source.unsplash.com/xe68QiMaDrQ",
          story:
            "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
          city: 3,
          leidenschaften: [1, 2, 3]
        }
      ],
      dreams: [
        {
          id: 1,
          name: "Oma Erna",
          dream: "als ältester Mensch einen Marathon zu laufen",
          leidenschaften: [5, 4, 3],
          schwierigkeiten: [1, 2],
          wishes: [1, 4, 6],
          color: "bg-ci-2",
          image: "https://source.unsplash.com/y0I85D5QKvs",
          city: 1
        },
        {
          id: 2,
          name: "Tante Inge",
          dream: "noch einmal an die Nordsee zu fahren",
          color: "bg-ci",
          city: 2,
          leidenschaften: [2, 3, 7],
          schwierigkeiten: [3, 4, 5],
          wishes: [2, 5, 3],
          image: "https://source.unsplash.com/MTg6nH8_lOY"
        },

        {
          id: 3,
          name: "Onkel Otto",
          dream: "ins Stadion des Champions League Finales gehen",
          color: "bg-ci-2",
          city: 3,
          leidenschaften: [1, 3, 4, 8],
          schwierigkeiten: [1, 2, 5],
          wishes: [1, 4, 6],
          image: "https://source.unsplash.com/xSOfm3S2QQg"
        }
      ],
      blog: [
        {
          id: 1,
          title: "Alf und Emmy,",
          subtitle: "eine wundersame Begegnung",
          excerpt:
            "Letzte Woche haben sich zum ersten mal zwicshen Alf und Emmy ein Generationen Tandem gebildet. Sie waren gemeinam auf dem Weg zum Schachspielen als es geschah...",
          image: "https://source.unsplash.com/random?sig=123/800x800/",
          cities: [1, 2, 3]
        },
        {
          id: 2,
          title: "Wie alles began,",
          subtitle: "die ersten Tage von Opa Franz",
          excerpt:
            "Peter, Philipp und Samuel hatten eines Tages den Geistesblitz Opa Franz für Memmingen zu entwickeln. Innerhalb von 24 Stunden bauten sie gemeinsam den ersten...",
          image: "https://source.unsplash.com/random?sig=321/800x800/",
          cities: [1, 2, 3]
        }
      ]
    };

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$q = "src/App.svelte";

    function create_fragment$v(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let dispose;
    	const omonavbar = new Omo_Navbar({ $$inline: true });
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
    			add_location(div0, file$q, 38, 2, 1005);
    			attr_dev(div1, "id", "pageContent");
    			attr_dev(div1, "class", "app flex flex-col overflow-y-scroll");
    			add_location(div1, file$q, 37, 0, 936);
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
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$v($$self, $$props, $$invalidate) {
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
    		OmoNavbar: Omo_Navbar,
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
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
