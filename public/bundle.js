
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

    /* src/quanta/1-views/2-molecules/OmoHeader.svelte generated by Svelte v3.20.1 */

    const file = "src/quanta/1-views/2-molecules/OmoHeader.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(h2, file, 9, 4, 171);
    			attr_dev(h3, "class", "text-xl");
    			add_location(h3, file, 14, 4, 324);
    			attr_dev(div0, "class", "w-5/6 xl:w-4/6 text-center");
    			add_location(div0, file, 8, 2, 126);
    			attr_dev(div1, "class", "flex justify-center my-16");
    			add_location(div1, file, 7, 0, 84);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { omoheader = { title: "", subtitle: "" } } = $$props;
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { omoheader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHeader",
    			options,
    			id: create_fragment$3.name
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
    			attr_dev(iframe, "class", "embed-responsive-item");
    			if (iframe.src !== (iframe_src_value = /*omovideo*/ ctx[0].link)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", iframe_title_value = /*omovideo*/ ctx[0].title);
    			add_location(iframe, file$1, 12, 6, 254);
    			attr_dev(div0, "class", "embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border\n      ");
    			add_location(div0, file$1, 9, 4, 153);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$1, 8, 2, 120);
    			attr_dev(div2, "class", "flex justify-center");
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { omovideo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoVideo",
    			options,
    			id: create_fragment$4.name
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
    	let div1_class_value;
    	let t3;

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
    			t3 = space();
    			if (img.src !== (img_src_value = /*step*/ ctx[2].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "px-16 py-8 object-cover object-center");
    			attr_dev(img, "alt", "image");
    			add_location(img, file$2, 33, 14, 784);
    			attr_dev(div0, "class", "text-4xl text-center text-blue-800 mb-2 flex flex-wrap\n                justify-center content-center");
    			set_style(div0, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(div0, file$2, 37, 14, 929);
    			attr_dev(div1, "class", div1_class_value = /*step*/ ctx[2].description);
    			add_location(div1, file$2, 43, 14, 1201);
    			attr_dev(div2, "class", " overflow-hidden ");
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
    			append_dev(div3, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*omosteps*/ 2 && img.src !== (img_src_value = /*step*/ ctx[2].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*omosteps*/ 2 && t1_value !== (t1_value = /*step*/ ctx[2].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*omosteps*/ 2 && div1_class_value !== (div1_class_value = /*step*/ ctx[2].description)) {
    				attr_dev(div1, "class", div1_class_value);
    			}
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

    function create_fragment$5(ctx) {
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
    			attr_dev(div2, "class", "bg-white py-20 flex justify-center my-12");
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { omoheader: 0, omosteps: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSteps",
    			options,
    			id: create_fragment$5.name
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

    /* src/quants/Omo-City.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/quants/Omo-City.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(img, file$3, 7, 6, 164);
    			attr_dev(a0, "href", "#city");
    			attr_dev(a0, "class", "text-lg font-semibold");
    			set_style(a0, "font-family", "'Indie Flower'", 1);
    			add_location(a0, file$3, 14, 8, 431);
    			attr_dev(div0, "class", "w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300\n        hover:text-gray-800 bg-ci text-gray-100");
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_City",
    			options,
    			id: create_fragment$6.name
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
    const file$4 = "src/quants/Omo-Cities.svelte";

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

    function create_fragment$7(ctx) {
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
    			add_location(img, file$4, 9, 4, 205);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$4, 10, 4, 278);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$4, 16, 6, 485);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$4, 15, 4, 424);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$4, 20, 4, 642);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$4, 8, 2, 172);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file$4, 7, 0, 130);
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { db: 1, currentId: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Cities",
    			options,
    			id: create_fragment$7.name
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

    /* src/quants/Omo-Enkel.svelte generated by Svelte v3.20.1 */

    const file$7 = "src/quants/Omo-Enkel.svelte";

    function create_fragment$a(ctx) {
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
    			add_location(img, file$7, 8, 6, 191);
    			set_style(p0, "font-family", "'Indie Flower'", 1);
    			add_location(p0, file$7, 14, 10, 411);
    			attr_dev(h3, "class", "text-2xl text-center font-semibold text-gray-800 mb-2");
    			add_location(h3, file$7, 13, 8, 334);
    			attr_dev(p1, "class", "text-gray-600 text-center ");
    			add_location(p1, file$7, 16, 8, 500);
    			attr_dev(div0, "class", "px-6 py-4");
    			add_location(div0, file$7, 12, 6, 302);
    			attr_dev(div1, "class", "flex items-center rounded-lg bg-white shadow-lg overflow-hidden");
    			add_location(div1, file$7, 6, 4, 101);
    			attr_dev(a, "href", a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id);
    			add_location(a, file$7, 5, 2, 66);
    			attr_dev(div2, "class", "w-1/2 p-2");
    			add_location(div2, file$7, 4, 0, 40);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { enkel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkel",
    			options,
    			id: create_fragment$a.name
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
    const file$8 = "src/quants/Omo-Enkels.svelte";

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

    function create_fragment$b(ctx) {
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
    			add_location(img, file$8, 9, 4, 213);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$8, 10, 4, 286);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$8, 16, 6, 492);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$8, 15, 4, 431);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$8, 20, 4, 629);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$8, 8, 2, 180);
    			attr_dev(div3, "class", "flex justify-center my-20");
    			add_location(div3, file$8, 7, 0, 138);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { db: 1, enkels: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkels",
    			options,
    			id: create_fragment$b.name
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

    /* src/quanta/1-views/5-pages/Home.svelte generated by Svelte v3.20.1 */

    function create_fragment$c(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
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

    	const block = {
    		c: function create() {
    			create_component(omoheader.$$.fragment);
    			t0 = space();
    			create_component(omovideo_1.$$.fragment);
    			t1 = space();
    			create_component(omosteps_1.$$.fragment);
    			t2 = space();
    			create_component(omodreams.$$.fragment);
    			t3 = space();
    			create_component(omoenkels.$$.fragment);
    			t4 = space();
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
    			mount_component(omodreams, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(omoenkels, target, anchor);
    			insert_dev(target, t4, anchor);
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
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoheader.$$.fragment, local);
    			transition_in(omovideo_1.$$.fragment, local);
    			transition_in(omosteps_1.$$.fragment, local);
    			transition_in(omodreams.$$.fragment, local);
    			transition_in(omoenkels.$$.fragment, local);
    			transition_in(omocities.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoheader.$$.fragment, local);
    			transition_out(omovideo_1.$$.fragment, local);
    			transition_out(omosteps_1.$$.fragment, local);
    			transition_out(omodreams.$$.fragment, local);
    			transition_out(omoenkels.$$.fragment, local);
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
    			destroy_component(omodreams, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(omoenkels, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(omocities, detaching);
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
    	let { currentId } = $$props;

    	let { dreamheader = {
    		title: "Wir haben einen Traum...",
    		subtitle: "{...... dass wir .......}"
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
    		OmoThemeLight: Omo_Theme_Light,
    		OmoHeader,
    		OmoVideo,
    		OmoSteps,
    		OmoCities: Omo_Cities,
    		OmoDreams: Omo_Dreams,
    		OmoEnkels: Omo_Enkels,
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

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
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
    			id: create_fragment$c.name
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

    /* src/quants/Omo-Wish.svelte generated by Svelte v3.20.1 */

    const file$9 = "src/quants/Omo-Wish.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(a0, file$9, 12, 6, 316);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$9, 11, 4, 263);
    			attr_dev(a1, "class", "text-lg text-gray-700 font-medium ");
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$9, 19, 6, 494);
    			attr_dev(div1, "class", "mt-4 text-center");
    			add_location(div1, file$9, 18, 4, 457);
    			attr_dev(div2, "class", "flex flex-col bg-white px-8 py-6 max-w-sm mx-auto rounded-lg\n    shadow-lg");
    			add_location(div2, file$9, 8, 2, 166);
    			attr_dev(div3, "class", "w-1/3 p-2");
    			add_location(div3, file$9, 7, 0, 140);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { db: 1, currentId: 2, wish: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Wish",
    			options,
    			id: create_fragment$d.name
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
    const file$a = "src/quants/Omo-Wishes.svelte";

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

    function create_fragment$e(ctx) {
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
    			add_location(img, file$a, 9, 2, 168);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mt-6 mb-8");
    			add_location(div0, file$a, 10, 2, 239);
    			attr_dev(div1, "class", "flex content-start flex-wrap");
    			add_location(div1, file$a, 13, 2, 345);
    			add_location(div2, file$a, 8, 0, 160);
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { db: 1, currentId: 2, wishes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Wishes",
    			options,
    			id: create_fragment$e.name
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
    const file$b = "src/quants/OmoLeidenschaften.svelte";

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
    			add_location(a, file$b, 20, 10, 651);
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

    function create_fragment$f(ctx) {
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
    			add_location(a, file$b, 11, 6, 355);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$b, 10, 4, 302);
    			attr_dev(div1, "class", "px-6 pt-2 pb-2");
    			add_location(div1, file$b, 18, 6, 544);
    			attr_dev(div2, "class", "mt-4 text-center");
    			add_location(div2, file$b, 17, 4, 507);
    			attr_dev(div3, "class", "flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg");
    			add_location(div3, file$b, 9, 2, 230);
    			attr_dev(div4, "class", "w-1/2 p-2");
    			add_location(div4, file$b, 8, 0, 204);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { db: 1, leidenschaften: 0, currentId: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoLeidenschaften",
    			options,
    			id: create_fragment$f.name
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

    /* src/quanta/1-views/5-pages/Dream.svelte generated by Svelte v3.20.1 */
    const file$c = "src/quanta/1-views/5-pages/Dream.svelte";

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
    			add_location(span, file$c, 61, 16, 2215);
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

    function create_fragment$g(ctx) {
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
    			add_location(div0, file$c, 18, 0, 675);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$c, 26, 2, 995);
    			attr_dev(div1, "class", "text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap\n  justify-center content-center");
    			add_location(div1, file$c, 23, 0, 876);
    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$c, 32, 4, 1196);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$c, 33, 4, 1269);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$c, 38, 4, 1426);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$c, 31, 2, 1163);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$c, 30, 0, 1121);
    			attr_dev(a0, "class", "p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$c, 52, 12, 1883);
    			attr_dev(div5, "class", "flex justify-center items-center");
    			add_location(div5, file$c, 51, 10, 1824);
    			attr_dev(div6, "class", "px-6 pt-2 pb-2");
    			add_location(div6, file$c, 59, 12, 2115);
    			attr_dev(div7, "class", "mt-4 text-center");
    			add_location(div7, file$c, 58, 10, 2072);
    			attr_dev(div8, "class", "flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg");
    			add_location(div8, file$c, 50, 8, 1746);
    			attr_dev(div9, "class", "w-1/2 p-2");
    			add_location(div9, file$c, 49, 6, 1714);
    			attr_dev(div10, "class", "flex content-start flex-wrap");
    			add_location(div10, file$c, 47, 4, 1620);
    			attr_dev(div11, "class", "w-5/6 xl:w-4/6");
    			add_location(div11, file$c, 44, 2, 1559);
    			attr_dev(div12, "class", "flex justify-center my-10");
    			add_location(div12, file$c, 43, 0, 1517);
    			attr_dev(a1, "href", "chat");
    			attr_dev(a1, "class", "hover:bg-orange-300 hover:text-gray-800 bg-ci text-gray-100\n        font-semibold rounded-full px-6 py-3 text-3xl");
    			set_style(a1, "font-family", "'Indie Flower'", 1);
    			add_location(a1, file$c, 80, 6, 2645);
    			attr_dev(div13, "class", "flex justify-center");
    			add_location(div13, file$c, 79, 4, 2605);
    			attr_dev(div14, "class", "w-5/6");
    			add_location(div14, file$c, 78, 2, 2581);
    			attr_dev(div15, "class", "flex justify-center my-20");
    			add_location(div15, file$c, 77, 0, 2539);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { db: 1, dream: 0, currentId: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dream",
    			options,
    			id: create_fragment$g.name
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

    /* src/quanta/1-views/5-pages/City.svelte generated by Svelte v3.20.1 */
    const file$d = "src/quanta/1-views/5-pages/City.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let t0_value = /*city*/ ctx[1].name + "";
    	let t0;
    	let div_title_value;
    	let t1;
    	let t2;
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

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(omodreams.$$.fragment);
    			t2 = space();
    			create_component(omoenkels.$$.fragment);
    			attr_dev(div, "class", "py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center\n  justify-center overflow-hidden uppercase font-bolt text-white");
    			set_style(div, "background-image", "url('" + /*city*/ ctx[1].image + "')");
    			attr_dev(div, "title", div_title_value = /*city*/ ctx[1].name);
    			add_location(div, file$d, 11, 0, 425);
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
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const omodreams_changes = {};
    			if (dirty & /*db*/ 1) omodreams_changes.db = /*db*/ ctx[0];
    			omodreams.$set(omodreams_changes);
    			const omoenkels_changes = {};
    			if (dirty & /*db*/ 1) omoenkels_changes.db = /*db*/ ctx[0];
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
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(omodreams, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(omoenkels, detaching);
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
    	let { currentId } = $$props;
    	let city = db.cities.find(item => item.id == currentId);
    	let enkels = db.enkels.filter(item => item.city == city.id);
    	let dreams = db.dreams.filter(item => item.city == city.id);
    	const writable_props = ["db", "currentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);

    	$$self.$set = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    	};

    	$$self.$capture_state = () => ({
    		OmoCity: Omo_City,
    		OmoEnkels: Omo_Enkels,
    		OmoDreams: Omo_Dreams,
    		db,
    		currentId,
    		city,
    		enkels,
    		dreams
    	});

    	$$self.$inject_state = $$props => {
    		if ("db" in $$props) $$invalidate(0, db = $$props.db);
    		if ("currentId" in $$props) $$invalidate(4, currentId = $$props.currentId);
    		if ("city" in $$props) $$invalidate(1, city = $$props.city);
    		if ("enkels" in $$props) $$invalidate(2, enkels = $$props.enkels);
    		if ("dreams" in $$props) $$invalidate(3, dreams = $$props.dreams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [db, city, enkels, dreams, currentId];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { db: 0, currentId: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*db*/ ctx[0] === undefined && !("db" in props)) {
    			console.warn("<City> was created without expected prop 'db'");
    		}

    		if (/*currentId*/ ctx[4] === undefined && !("currentId" in props)) {
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

    /* src/quanta/1-views/5-pages/Enkel.svelte generated by Svelte v3.20.1 */
    const file$e = "src/quanta/1-views/5-pages/Enkel.svelte";

    function create_fragment$i(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let t2;
    	let div5;
    	let div4;
    	let img;
    	let img_src_value;
    	let t3;
    	let h2;
    	let t5;
    	let div3;
    	let t6;
    	let div6;
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
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = `${/*enkel*/ ctx[1].story}`;
    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Meine schöne Heimatstadt";
    			t5 = space();
    			div3 = element("div");
    			create_component(omocity.$$.fragment);
    			t6 = space();
    			div6 = element("div");
    			create_component(omoleidenschaften.$$.fragment);
    			attr_dev(div0, "class", "py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap\n  bg-cover bg-center justify-center overflow-hidden");
    			set_style(div0, "background-image", "url('" + /*enkel*/ ctx[1].image + "')");
    			attr_dev(div0, "title", "dream");
    			add_location(div0, file$e, 13, 0, 477);
    			set_style(div1, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(div1, file$e, 22, 2, 799);
    			attr_dev(div2, "class", "text-3xl text-center px-4 py-16 text-white bg-blue-800 flex flex-wrap\n  justify-center content-center");
    			add_location(div2, file$e, 19, 0, 679);
    			if (img.src !== (img_src_value = "/images/divider-1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "divider");
    			attr_dev(img, "class", "px-48 mt-8");
    			add_location(img, file$e, 29, 4, 975);
    			attr_dev(h2, "class", "text-center text-5xl text-green-400 mt-10 mb-6");
    			set_style(h2, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(h2, file$e, 30, 4, 1048);
    			attr_dev(div3, "class", "flex justify-center");
    			add_location(div3, file$e, 35, 4, 1227);
    			attr_dev(div4, "class", "w-5/6 xl:w-4/6");
    			add_location(div4, file$e, 28, 2, 942);
    			attr_dev(div5, "class", "flex justify-center my-10");
    			add_location(div5, file$e, 27, 0, 900);
    			attr_dev(div6, "class", "flex justify-center my-10");
    			add_location(div6, file$e, 41, 0, 1319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div4, t3);
    			append_dev(div4, h2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			mount_component(omocity, div3, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div6, anchor);
    			mount_component(omoleidenschaften, div6, null);
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
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    			destroy_component(omocity);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div6);
    			destroy_component(omoleidenschaften);
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { db: 0, currentId: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Enkel",
    			options,
    			id: create_fragment$i.name
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

    /* src/quanta/1-views/5-pages/Chat.svelte generated by Svelte v3.20.1 */
    const file$f = "src/quanta/1-views/5-pages/Chat.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (94:6) {#each comments as comment}
    function create_each_block$8(ctx) {
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
    			add_location(span, file$f, 95, 10, 4242);
    			attr_dev(article, "class", "m-1  svelte-14e6lzm");
    			toggle_class(article, "left", /*comment*/ ctx[8].author != "");
    			add_location(article, file$f, 94, 8, 4175);
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
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(94:6) {#each comments as comment}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
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
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
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
    			add_location(h2, file$f, 78, 4, 3635);
    			set_style(p, "font-family", "'Indie Flower'", 1);
    			add_location(p, file$f, 84, 6, 3839);
    			attr_dev(div0, "class", "text-2xl text-gray-600 text-center mb-16");
    			add_location(div0, file$f, 83, 4, 3778);
    			attr_dev(div1, "class", "scrollable");
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "column");
    			set_style(div1, "align-items", "flex-end");
    			add_location(div1, file$f, 89, 4, 4009);
    			attr_dev(div2, "class", "w-5/6 xl:w-4/6");
    			add_location(div2, file$f, 77, 2, 3602);
    			attr_dev(div3, "class", "flex flex-1 justify-center ");
    			set_style(div3, "height", "calc('100%-100px')");
    			add_location(div3, file$f, 76, 0, 3524);
    			attr_dev(input, "class", "block w-full text-gray-700 border border-gray-500 rounded py-2\n        px-4 leading-tight focus:outline-none focus:bg-white\n        focus:border-gray-500");
    			attr_dev(input, "id", "chat-text");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Gebe hier deine Antwort ein");
    			set_style(input, "font-family", "'Indie Flower'", 1);
    			add_location(input, file$f, 111, 6, 4714);
    			attr_dev(div4, "class", "w-5/6 xl:w-4/6 px-3");
    			add_location(div4, file$f, 110, 4, 4674);
    			attr_dev(div5, "class", "flex flex-wrap -mx-3 justify-center");
    			add_location(div5, file$f, 109, 2, 4620);
    			attr_dev(footer, "class", "w-full text-center border-t border-grey bg-gray-300 p-4 sticky bottom-0");
    			add_location(footer, file$f, 107, 0, 4527);
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
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/quants/Omo-Enkel-Match.svelte generated by Svelte v3.20.1 */

    const file$g = "src/quants/Omo-Enkel-Match.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (17:8) {#each leidenschaften as leidenschaft}
    function create_each_block$9(ctx) {
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
    			add_location(a, file$g, 17, 10, 510);
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
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(17:8) {#each leidenschaften as leidenschaft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
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
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
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
    			add_location(img, file$g, 11, 6, 288);
    			attr_dev(div0, "class", "px-6 pt-4 pb-3");
    			add_location(div0, file$g, 15, 6, 424);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$g, 10, 4, 222);
    			attr_dev(a, "href", a_href_value = "enkel?id=" + /*enkel*/ ctx[0].id);
    			add_location(a, file$g, 9, 2, 187);
    			attr_dev(div2, "class", "w-1/3 p-2");
    			add_location(div2, file$g, 8, 0, 161);
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
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { enkel: 0, db: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkel_Match",
    			options,
    			id: create_fragment$k.name
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
    const file$h = "src/quants/Omo-Enkels-Match.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (17:6) {#each enkels as enkel, i (enkel.id)}
    function create_each_block$a(key_1, ctx) {
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
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(17:6) {#each enkels as enkel, i (enkel.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context$a, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
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
    			add_location(img, file$h, 9, 4, 219);
    			attr_dev(h2, "class", "text-center text-5xl text-ci mt-10 mb-6");
    			set_style(h2, "font-family", "'Indie Flower'", 1);
    			add_location(h2, file$h, 10, 4, 292);
    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$h, 15, 4, 430);
    			attr_dev(div1, "class", "w-5/6 xl:w-4/6");
    			add_location(div1, file$h, 8, 2, 186);
    			attr_dev(div2, "class", "flex justify-center my-20");
    			add_location(div2, file$h, 7, 0, 144);
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
    				validate_each_keys(ctx, each_value, get_each_context$a, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$a, null, get_each_context$a);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { db: 1, enkels: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Omo_Enkels_Match",
    			options,
    			id: create_fragment$l.name
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

    /* src/quanta/1-views/5-pages/Leidenschaft.svelte generated by Svelte v3.20.1 */
    const file$i = "src/quanta/1-views/5-pages/Leidenschaft.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:2) {#each db.leidenschaften as leidenschaft}
    function create_each_block$b(ctx) {
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
    			add_location(a, file$i, 24, 4, 811);
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
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(24:2) {#each db.leidenschaften as leidenschaft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
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
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
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
    			add_location(p, file$i, 19, 2, 613);
    			attr_dev(div0, "class", "text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap\n  justify-center content-center");
    			add_location(div0, file$i, 16, 0, 494);
    			attr_dev(div1, "class", "flex flex-wrap justify-center content-center px-6 pt-2");
    			add_location(div1, file$i, 22, 0, 694);
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
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { db: 1, leidenschaft: 0, currentId: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leidenschaft",
    			options,
    			id: create_fragment$m.name
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
        '/dream': Dream,
        '/city': City,
        '/enkel': Enkel,
        '/chat': Chat,
        '/leidenschaft': Leidenschaft
    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quanta/1-views/1-atoms/OmoButton.svelte generated by Svelte v3.20.1 */

    const file$j = "src/quanta/1-views/1-atoms/OmoButton.svelte";

    function create_fragment$n(ctx) {
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
    			add_location(button_1, file$j, 9, 2, 122);
    			attr_dev(a, "href", a_href_value = /*button*/ ctx[0].link);
    			add_location(a, file$j, 8, 0, 97);
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoButton",
    			options,
    			id: create_fragment$n.name
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
    const file$k = "src/quanta/1-views/2-molecules/OmoNavbar.svelte";

    function create_fragment$o(ctx) {
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
    			add_location(img, file$k, 12, 8, 292);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "mr-4");
    			add_location(a, file$k, 11, 6, 258);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$k, 10, 4, 233);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$k, 16, 6, 430);
    			attr_dev(div2, "class", "md:items-center md:w-auto flex");
    			add_location(div2, file$k, 15, 4, 379);
    			attr_dev(nav, "class", "flex justify-between w-full px-3 py-3");
    			add_location(nav, file$k, 9, 2, 177);
    			attr_dev(header, "class", "bg-gray-900");
    			add_location(header, file$k, 8, 0, 146);
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { chat: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNavbar",
    			options,
    			id: create_fragment$o.name
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
    const file$l = "src/App.svelte";

    function create_fragment$p(ctx) {
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
    			add_location(div0, file$l, 36, 2, 1020);
    			attr_dev(div1, "id", "pageContent");
    			attr_dev(div1, "class", "app flex flex-col overflow-y-scroll");
    			add_location(div1, file$l, 35, 0, 951);
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
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$p($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
