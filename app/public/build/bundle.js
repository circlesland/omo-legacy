
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
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

    /* src/Tailwind.svelte generated by Svelte v3.24.1 */

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tailwind", $$slots, []);
    	return [];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Welcome.svelte generated by Svelte v3.24.1 */

    const file = "src/components/Welcome.svelte";

    function create_fragment$1(ctx) {
    	let div9;
    	let div7;
    	let div6;
    	let div0;
    	let t1;
    	let div4;
    	let div1;
    	let span0;
    	let t3;
    	let p0;
    	let t5;
    	let div2;
    	let span1;
    	let t7;
    	let p1;
    	let t9;
    	let div3;
    	let span2;
    	let t11;
    	let p2;
    	let t13;
    	let div5;
    	let t15;
    	let button;
    	let t17;
    	let div8;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "Welcome Omo";
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Country";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Japan";
    			t5 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "Region";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Kanto";
    			t9 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "island";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Honshu";
    			t13 = space();
    			div5 = element("div");
    			div5.textContent = "Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional,\n        from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto\n        Shrine is known for its towering gate and surrounding woods. The\n        Imperial Palace sits amid large public gardens";
    			t15 = space();
    			button = element("button");
    			button.textContent = "read more";
    			t17 = space();
    			div8 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "font-title text-6xl font-bold mt-16 text-dark");
    			add_location(div0, file, 5, 6, 163);
    			attr_dev(span0, "class", "uppercase");
    			add_location(span0, file, 12, 10, 387);
    			attr_dev(p0, "class", "text-2xl text-gray-900 font-semibold pt-2");
    			add_location(p0, file, 13, 10, 436);
    			attr_dev(div1, "class", "pr-4");
    			add_location(div1, file, 11, 8, 358);
    			attr_dev(span1, "class", "uppercase");
    			add_location(span1, file, 16, 10, 551);
    			attr_dev(p1, "class", "text-2xl text-gray-900 font-semibold pt-2");
    			add_location(p1, file, 17, 10, 599);
    			attr_dev(div2, "class", "pr-4");
    			add_location(div2, file, 15, 8, 522);
    			attr_dev(span2, "class", "uppercase");
    			add_location(span2, file, 20, 10, 714);
    			attr_dev(p2, "class", "text-2xl text-gray-900 font-semibold pt-2");
    			add_location(p2, file, 21, 10, 762);
    			attr_dev(div3, "class", "pr-4");
    			add_location(div3, file, 19, 8, 685);
    			attr_dev(div4, "class", "flex mt-16 font-light text-gray-500");
    			add_location(div4, file, 10, 6, 300);
    			attr_dev(div5, "class", "description w-full sm: md:w-2/3 mt-16 text-gray-500 text-sm");
    			add_location(div5, file, 26, 6, 888);
    			attr_dev(button, "class", "uppercase mt-5 text-sm font-semibold hover:underline");
    			add_location(button, file, 33, 6, 1270);
    			attr_dev(div6, "class", "mx-32");
    			add_location(div6, file, 4, 4, 137);
    			attr_dev(div7, "class", "bg-white w-full md:w-1/2 h-screen");
    			add_location(div7, file, 3, 2, 85);
    			if (img.src !== (img_src_value = "https://source.unsplash.com/random")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "h-screen w-full");
    			attr_dev(img, "alt", "");
    			add_location(img, file, 39, 4, 1450);
    			attr_dev(div8, "class", "bg-red-600 w-full md:w-1/2 h-screen");
    			add_location(div8, file, 38, 2, 1396);
    			attr_dev(div9, "class", "flex flex-wrap md items-center h-screen");
    			add_location(div9, file, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div4);
    			append_dev(div4, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t7);
    			append_dev(div2, p1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, span2);
    			append_dev(div3, t11);
    			append_dev(div3, p2);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div6, t15);
    			append_dev(div6, button);
    			append_dev(div9, t17);
    			append_dev(div9, div8);
    			append_dev(div8, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
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

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Welcome> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Welcome", $$slots, []);
    	return [];
    }

    class Welcome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Welcome",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Landing.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/Landing.svelte";

    function create_fragment$2(ctx) {
    	let div184;
    	let div9;
    	let div8;
    	let div4;
    	let a0;
    	let t1;
    	let div3;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div6;
    	let div5;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let a3;
    	let t10;
    	let div7;
    	let a4;
    	let t12;
    	let a5;
    	let t14;
    	let div183;
    	let div182;
    	let div181;
    	let div180;
    	let div10;
    	let h1;
    	let t16;
    	let p;
    	let t18;
    	let a6;
    	let t20;
    	let div179;
    	let div106;
    	let div21;
    	let div19;
    	let div11;
    	let span0;
    	let t21;
    	let span1;
    	let t22;
    	let span2;
    	let t23;
    	let div12;
    	let t24;
    	let div13;
    	let t25;
    	let div16;
    	let div14;
    	let t26;
    	let div15;
    	let t27;
    	let div17;
    	let t28;
    	let div18;
    	let t29;
    	let div20;
    	let t30;
    	let br0;
    	let t31;
    	let t32;
    	let div29;
    	let div27;
    	let div22;
    	let t33;
    	let div23;
    	let t34;
    	let div25;
    	let div24;
    	let t35;
    	let div26;
    	let t36;
    	let div28;
    	let t38;
    	let div39;
    	let div37;
    	let div30;
    	let t39;
    	let div33;
    	let div31;
    	let t40;
    	let div32;
    	let t41;
    	let div36;
    	let div34;
    	let t42;
    	let div35;
    	let t43;
    	let div38;
    	let t44;
    	let br1;
    	let t45;
    	let t46;
    	let div103;
    	let div40;
    	let t47;
    	let div102;
    	let h20;
    	let t49;
    	let div49;
    	let div42;
    	let div41;
    	let t50;
    	let div44;
    	let div43;
    	let t51;
    	let div46;
    	let div45;
    	let t52;
    	let div48;
    	let div47;
    	let t53;
    	let div65;
    	let div54;
    	let div53;
    	let div50;
    	let t54;
    	let div51;
    	let t55;
    	let div52;
    	let t56;
    	let div59;
    	let div58;
    	let div55;
    	let t57;
    	let div56;
    	let t58;
    	let div57;
    	let t59;
    	let div64;
    	let div63;
    	let div60;
    	let t60;
    	let div61;
    	let t61;
    	let div62;
    	let t62;
    	let h21;
    	let t64;
    	let div77;
    	let div71;
    	let div70;
    	let div66;
    	let t65;
    	let div69;
    	let div67;
    	let t66;
    	let div68;
    	let t67;
    	let div74;
    	let div73;
    	let div72;
    	let t68;
    	let div76;
    	let div75;
    	let t69;
    	let div89;
    	let div83;
    	let div82;
    	let div78;
    	let t70;
    	let div81;
    	let div79;
    	let t71;
    	let div80;
    	let t72;
    	let div86;
    	let div85;
    	let div84;
    	let t73;
    	let div88;
    	let div87;
    	let t74;
    	let div101;
    	let div95;
    	let div94;
    	let div90;
    	let t75;
    	let div93;
    	let div91;
    	let t76;
    	let div92;
    	let t77;
    	let div98;
    	let div97;
    	let div96;
    	let t78;
    	let div100;
    	let div99;
    	let t79;
    	let div105;
    	let div104;
    	let t80;
    	let div168;
    	let div107;
    	let span3;
    	let t81;
    	let span4;
    	let t82;
    	let span5;
    	let t83;
    	let div121;
    	let div108;
    	let t84;
    	let div112;
    	let div109;
    	let t85;
    	let div111;
    	let div110;
    	let t86;
    	let div113;
    	let t87;
    	let div114;
    	let t88;
    	let div115;
    	let t89;
    	let div116;
    	let t90;
    	let div117;
    	let t91;
    	let div118;
    	let t92;
    	let div119;
    	let t93;
    	let div120;
    	let t94;
    	let div167;
    	let h22;
    	let t96;
    	let div126;
    	let div122;
    	let t97;
    	let div123;
    	let t98;
    	let div124;
    	let t99;
    	let div125;
    	let t100;
    	let div142;
    	let div131;
    	let div130;
    	let div127;
    	let t101;
    	let div128;
    	let t102;
    	let div129;
    	let t103;
    	let div136;
    	let div135;
    	let div132;
    	let t104;
    	let div133;
    	let t105;
    	let div134;
    	let t106;
    	let div141;
    	let div140;
    	let div137;
    	let t107;
    	let div138;
    	let t108;
    	let div139;
    	let t109;
    	let h23;
    	let t111;
    	let div154;
    	let div148;
    	let div147;
    	let div143;
    	let t112;
    	let div146;
    	let div144;
    	let t113;
    	let div145;
    	let t114;
    	let div151;
    	let div150;
    	let div149;
    	let t115;
    	let div153;
    	let div152;
    	let t116;
    	let div166;
    	let div160;
    	let div159;
    	let div155;
    	let t117;
    	let div158;
    	let div156;
    	let t118;
    	let div157;
    	let t119;
    	let div163;
    	let div162;
    	let div161;
    	let t120;
    	let div165;
    	let div164;
    	let t121;
    	let div178;
    	let div176;
    	let div169;
    	let t122;
    	let div172;
    	let div170;
    	let t123;
    	let div171;
    	let t124;
    	let div175;
    	let div173;
    	let t125;
    	let div174;
    	let t126;
    	let div177;
    	let t127;
    	let br2;
    	let t128;
    	let t129;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div184 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div4 = element("div");
    			a0 = element("a");
    			a0.textContent = "Omo Earth";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
    			a1 = element("a");
    			a1.textContent = "How it Works";
    			t6 = space();
    			a2 = element("a");
    			a2.textContent = "Services";
    			t8 = space();
    			a3 = element("a");
    			a3.textContent = "Blog";
    			t10 = space();
    			div7 = element("div");
    			a4 = element("a");
    			a4.textContent = "Login";
    			t12 = space();
    			a5 = element("a");
    			a5.textContent = "Sign Up";
    			t14 = space();
    			div183 = element("div");
    			div182 = element("div");
    			div181 = element("div");
    			div180 = element("div");
    			div10 = element("div");
    			h1 = element("h1");
    			h1.textContent = "FOLLOW YOUR DREAMS";
    			t16 = space();
    			p = element("p");
    			p.textContent = "and kickstart with us the universal basic income economy of\n              tomorrow";
    			t18 = space();
    			a6 = element("a");
    			a6.textContent = "Get Started";
    			t20 = space();
    			div179 = element("div");
    			div106 = element("div");
    			div21 = element("div");
    			div19 = element("div");
    			div11 = element("div");
    			span0 = element("span");
    			t21 = space();
    			span1 = element("span");
    			t22 = space();
    			span2 = element("span");
    			t23 = space();
    			div12 = element("div");
    			t24 = space();
    			div13 = element("div");
    			t25 = space();
    			div16 = element("div");
    			div14 = element("div");
    			t26 = space();
    			div15 = element("div");
    			t27 = space();
    			div17 = element("div");
    			t28 = space();
    			div18 = element("div");
    			t29 = space();
    			div20 = element("div");
    			t30 = text("Omo\n                  ");
    			br0 = element("br");
    			t31 = text("\n                  SmartPassID");
    			t32 = space();
    			div29 = element("div");
    			div27 = element("div");
    			div22 = element("div");
    			t33 = space();
    			div23 = element("div");
    			t34 = space();
    			div25 = element("div");
    			div24 = element("div");
    			t35 = space();
    			div26 = element("div");
    			t36 = space();
    			div28 = element("div");
    			div28.textContent = "One Universal Basic Income";
    			t38 = space();
    			div39 = element("div");
    			div37 = element("div");
    			div30 = element("div");
    			t39 = space();
    			div33 = element("div");
    			div31 = element("div");
    			t40 = space();
    			div32 = element("div");
    			t41 = space();
    			div36 = element("div");
    			div34 = element("div");
    			t42 = space();
    			div35 = element("div");
    			t43 = space();
    			div38 = element("div");
    			t44 = text("0% Payment\n                  ");
    			br1 = element("br");
    			t45 = text("\n                  Fees");
    			t46 = space();
    			div103 = element("div");
    			div40 = element("div");
    			t47 = space();
    			div102 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Popular Payments";
    			t49 = space();
    			div49 = element("div");
    			div42 = element("div");
    			div41 = element("div");
    			t50 = space();
    			div44 = element("div");
    			div43 = element("div");
    			t51 = space();
    			div46 = element("div");
    			div45 = element("div");
    			t52 = space();
    			div48 = element("div");
    			div47 = element("div");
    			t53 = space();
    			div65 = element("div");
    			div54 = element("div");
    			div53 = element("div");
    			div50 = element("div");
    			t54 = space();
    			div51 = element("div");
    			t55 = space();
    			div52 = element("div");
    			t56 = space();
    			div59 = element("div");
    			div58 = element("div");
    			div55 = element("div");
    			t57 = space();
    			div56 = element("div");
    			t58 = space();
    			div57 = element("div");
    			t59 = space();
    			div64 = element("div");
    			div63 = element("div");
    			div60 = element("div");
    			t60 = space();
    			div61 = element("div");
    			t61 = space();
    			div62 = element("div");
    			t62 = space();
    			h21 = element("h2");
    			h21.textContent = "Popular Payments";
    			t64 = space();
    			div77 = element("div");
    			div71 = element("div");
    			div70 = element("div");
    			div66 = element("div");
    			t65 = space();
    			div69 = element("div");
    			div67 = element("div");
    			t66 = space();
    			div68 = element("div");
    			t67 = space();
    			div74 = element("div");
    			div73 = element("div");
    			div72 = element("div");
    			t68 = space();
    			div76 = element("div");
    			div75 = element("div");
    			t69 = space();
    			div89 = element("div");
    			div83 = element("div");
    			div82 = element("div");
    			div78 = element("div");
    			t70 = space();
    			div81 = element("div");
    			div79 = element("div");
    			t71 = space();
    			div80 = element("div");
    			t72 = space();
    			div86 = element("div");
    			div85 = element("div");
    			div84 = element("div");
    			t73 = space();
    			div88 = element("div");
    			div87 = element("div");
    			t74 = space();
    			div101 = element("div");
    			div95 = element("div");
    			div94 = element("div");
    			div90 = element("div");
    			t75 = space();
    			div93 = element("div");
    			div91 = element("div");
    			t76 = space();
    			div92 = element("div");
    			t77 = space();
    			div98 = element("div");
    			div97 = element("div");
    			div96 = element("div");
    			t78 = space();
    			div100 = element("div");
    			div99 = element("div");
    			t79 = space();
    			div105 = element("div");
    			div104 = element("div");
    			t80 = space();
    			div168 = element("div");
    			div107 = element("div");
    			span3 = element("span");
    			t81 = space();
    			span4 = element("span");
    			t82 = space();
    			span5 = element("span");
    			t83 = space();
    			div121 = element("div");
    			div108 = element("div");
    			t84 = space();
    			div112 = element("div");
    			div109 = element("div");
    			t85 = space();
    			div111 = element("div");
    			div110 = element("div");
    			t86 = space();
    			div113 = element("div");
    			t87 = space();
    			div114 = element("div");
    			t88 = space();
    			div115 = element("div");
    			t89 = space();
    			div116 = element("div");
    			t90 = space();
    			div117 = element("div");
    			t91 = space();
    			div118 = element("div");
    			t92 = space();
    			div119 = element("div");
    			t93 = space();
    			div120 = element("div");
    			t94 = space();
    			div167 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Popular Payments";
    			t96 = space();
    			div126 = element("div");
    			div122 = element("div");
    			t97 = space();
    			div123 = element("div");
    			t98 = space();
    			div124 = element("div");
    			t99 = space();
    			div125 = element("div");
    			t100 = space();
    			div142 = element("div");
    			div131 = element("div");
    			div130 = element("div");
    			div127 = element("div");
    			t101 = space();
    			div128 = element("div");
    			t102 = space();
    			div129 = element("div");
    			t103 = space();
    			div136 = element("div");
    			div135 = element("div");
    			div132 = element("div");
    			t104 = space();
    			div133 = element("div");
    			t105 = space();
    			div134 = element("div");
    			t106 = space();
    			div141 = element("div");
    			div140 = element("div");
    			div137 = element("div");
    			t107 = space();
    			div138 = element("div");
    			t108 = space();
    			div139 = element("div");
    			t109 = space();
    			h23 = element("h2");
    			h23.textContent = "Popular Payments";
    			t111 = space();
    			div154 = element("div");
    			div148 = element("div");
    			div147 = element("div");
    			div143 = element("div");
    			t112 = space();
    			div146 = element("div");
    			div144 = element("div");
    			t113 = space();
    			div145 = element("div");
    			t114 = space();
    			div151 = element("div");
    			div150 = element("div");
    			div149 = element("div");
    			t115 = space();
    			div153 = element("div");
    			div152 = element("div");
    			t116 = space();
    			div166 = element("div");
    			div160 = element("div");
    			div159 = element("div");
    			div155 = element("div");
    			t117 = space();
    			div158 = element("div");
    			div156 = element("div");
    			t118 = space();
    			div157 = element("div");
    			t119 = space();
    			div163 = element("div");
    			div162 = element("div");
    			div161 = element("div");
    			t120 = space();
    			div165 = element("div");
    			div164 = element("div");
    			t121 = space();
    			div178 = element("div");
    			div176 = element("div");
    			div169 = element("div");
    			t122 = space();
    			div172 = element("div");
    			div170 = element("div");
    			t123 = space();
    			div171 = element("div");
    			t124 = space();
    			div175 = element("div");
    			div173 = element("div");
    			t125 = space();
    			div174 = element("div");
    			t126 = space();
    			div177 = element("div");
    			t127 = text("Payment for\n                ");
    			br2 = element("br");
    			t128 = text("\n                Internet");
    			t129 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "font-title inline-block py-2 text-white text-2xl uppercase\n          font-bold");
    			add_location(a0, file$1, 8, 8, 260);
    			attr_dev(div0, "class", "bg-gray-400 w-8 mb-2");
    			set_style(div0, "height", "2px");
    			add_location(div0, file$1, 15, 10, 483);
    			attr_dev(div1, "class", "bg-gray-400 w-8 mb-2");
    			set_style(div1, "height", "2px");
    			add_location(div1, file$1, 16, 10, 551);
    			attr_dev(div2, "class", "bg-gray-400 w-8");
    			set_style(div2, "height", "2px");
    			add_location(div2, file$1, 17, 10, 619);
    			attr_dev(div3, "class", "inline-block cursor-pointer md:hidden");
    			add_location(div3, file$1, 14, 8, 421);
    			attr_dev(div4, "class", "flex justify-between items-center");
    			add_location(div4, file$1, 7, 6, 204);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "inline-block py-1 md:py-4 text-gray-100 mr-6 font-bold");
    			add_location(a1, file$1, 23, 10, 771);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "inline-block py-1 md:py-4 text-gray-500 hover:text-gray-100\n            mr-6");
    			add_location(a2, file$1, 28, 10, 921);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "inline-block py-1 md:py-4 text-gray-500 hover:text-gray-100");
    			add_location(a3, file$1, 34, 10, 1089);
    			attr_dev(div5, "class", "hidden md:block uppercase");
    			add_location(div5, file$1, 22, 8, 721);
    			add_location(div6, file$1, 21, 6, 707);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "inline-block py-1 md:py-4 text-gray-500 hover:text-gray-100\n          mr-6");
    			add_location(a4, file$1, 42, 8, 1298);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "inline-block py-2 px-4 text-gray-700 bg-white hover:bg-gray-100\n          rounded-lg");
    			add_location(a5, file$1, 48, 8, 1451);
    			attr_dev(div7, "class", "hidden md:block");
    			add_location(div7, file$1, 41, 6, 1260);
    			attr_dev(div8, "class", "md:max-w-6xl md:mx-auto md:flex md:items-center md:justify-between");
    			add_location(div8, file$1, 5, 4, 111);
    			attr_dev(div9, "class", "bg-dark px-4 py-4");
    			add_location(div9, file$1, 4, 2, 75);
    			attr_dev(h1, "class", "font-title uppercase text-white text-2xl md:text-5xl\n              leading-tight mb-4");
    			add_location(h1, file$1, 63, 12, 1891);
    			attr_dev(p, "class", "font-subtitle text-indigo-200 md:text-2xl md:pr-48");
    			add_location(p, file$1, 69, 12, 2068);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "mt-6 mb-12 md:mb-0 md:mt-10 inline-block py-3 px-8\n              font-title text-xl uppercase text-white hover:bg-secondary\n              bg-tertiary rounded-lg shadow");
    			add_location(a6, file$1, 74, 12, 2258);
    			attr_dev(div10, "class", "md:w-1/2 text-center md:text-left md:pt-16");
    			add_location(div10, file$1, 62, 10, 1822);
    			attr_dev(span0, "class", "w-1 h-1 bg-indigo-100 rounded-full inline-block");
    			set_style(span0, "margin-right", "1px");
    			add_location(span0, file$1, 91, 20, 2974);
    			attr_dev(span1, "class", "w-1 h-1 bg-indigo-100 rounded-full inline-block");
    			set_style(span1, "margin-right", "1px");
    			add_location(span1, file$1, 94, 20, 3130);
    			attr_dev(span2, "class", "w-1 h-1 bg-indigo-100 rounded-full inline-block");
    			add_location(span2, file$1, 97, 20, 3286);
    			attr_dev(div11, "class", "mb-1");
    			add_location(div11, file$1, 90, 18, 2935);
    			attr_dev(div12, "class", "h-1 w-12 bg-indigo-100 rounded mb-1");
    			add_location(div12, file$1, 100, 18, 3416);
    			attr_dev(div13, "class", "h-1 w-10 bg-indigo-100 rounded mb-2");
    			add_location(div13, file$1, 101, 18, 3486);
    			attr_dev(div14, "class", "w-6 h-3 rounded bg-indigo-100 mr-1");
    			add_location(div14, file$1, 104, 20, 3596);
    			attr_dev(div15, "class", "w-6 h-3 rounded bg-indigo-100");
    			add_location(div15, file$1, 105, 20, 3667);
    			attr_dev(div16, "class", "flex");
    			add_location(div16, file$1, 103, 18, 3557);
    			attr_dev(div17, "class", "-mr-2 -mb-4 absolute bottom-0 right-0 h-16 w-10\n                    rounded-lg bg-tertiary border-2 border-white");
    			add_location(div17, file$1, 108, 18, 3757);
    			attr_dev(div18, "class", "w-2 h-2 rounded-full bg-tertiary mx-auto absolute\n                    bottom-0 right-0 mr-2 -mb-2 z-10 border-2 border-white");
    			add_location(div18, file$1, 111, 18, 3924);
    			attr_dev(div19, "class", "bg-secondary mx-auto rounded-lg px-2 pb-2 relative mb-8");
    			add_location(div19, file$1, 88, 16, 2829);
    			add_location(br0, file$1, 118, 18, 4205);
    			attr_dev(div20, "class", "text-gray-800 text-center");
    			add_location(div20, file$1, 116, 16, 4125);
    			attr_dev(div21, "class", "-ml-24 -mb-40 absolute left-0 bottom-0 w-40 bg-white\n                rounded-lg shadow-lg px-6 py-8");
    			set_style(div21, "transform", "rotate(-8deg)");
    			add_location(div21, file$1, 84, 14, 2633);
    			attr_dev(div22, "class", "h-8 bg-tertiary w-8 rounded absolute left-0 top-0\n                    -mt-3 ml-4");
    			set_style(div22, "transform", "rotate(-45deg)");
    			set_style(div22, "z-index", "-1");
    			add_location(div22, file$1, 130, 18, 4653);
    			attr_dev(div23, "class", "h-8 bg-tertiary w-8 rounded absolute left-0 top-0\n                    -mt-3 ml-8");
    			set_style(div23, "transform", "rotate(-12deg)");
    			set_style(div23, "z-index", "-2");
    			add_location(div23, file$1, 134, 18, 4856);
    			attr_dev(div24, "class", "h-2 w-2 rounded-full bg-secondary border-2\n                      border-white");
    			add_location(div24, file$1, 142, 20, 5237);
    			attr_dev(div25, "class", "flex items-center justify-center h-6 bg-secondary w-6\n                    rounded-l-lg ml-auto border-4 border-white -mr-1");
    			add_location(div25, file$1, 139, 18, 5060);
    			attr_dev(div26, "class", "w-8 h-8 bg-tertiary border-4 border-white\n                    rounded-full -ml-3 -mb-5");
    			add_location(div26, file$1, 147, 18, 5397);
    			attr_dev(div27, "class", "bg-secondary mx-auto rounded-lg relative mb-8 py-2 w-20\n                  border-2 border-white");
    			add_location(div27, file$1, 127, 16, 4507);
    			attr_dev(div28, "class", "text-gray-800 text-center");
    			add_location(div28, file$1, 152, 16, 5560);
    			attr_dev(div29, "class", "ml-24 mb-16 absolute left-0 bottom-0 w-40 bg-white\n                rounded-lg shadow-lg px-6 py-8");
    			set_style(div29, "transform", "rotate(-8deg)");
    			set_style(div29, "z-index", "2");
    			add_location(div29, file$1, 123, 14, 4301);
    			attr_dev(div30, "class", "h-4 bg-white");
    			add_location(div30, file$1, 164, 18, 6046);
    			attr_dev(div31, "class", "inline-flex w-3 h-3 rounded-full bg-white -mr-2");
    			add_location(div31, file$1, 167, 20, 6149);
    			attr_dev(div32, "class", "inline-flex w-3 h-3 rounded-full bg-secondary\n                      border-2 border-white mr-2");
    			add_location(div32, file$1, 169, 20, 6255);
    			attr_dev(div33, "class", "text-right my-2 pb-1");
    			add_location(div33, file$1, 166, 18, 6094);
    			attr_dev(div34, "class", "h-2 bg-white mb-2");
    			add_location(div34, file$1, 177, 20, 6589);
    			attr_dev(div35, "class", "h-2 bg-white w-6 ml-auto rounded mr-2");
    			add_location(div35, file$1, 178, 20, 6643);
    			attr_dev(div36, "class", "-ml-4 -mb-6 absolute left-0 bottom-0 w-16 bg-tertiary\n                    mx-auto rounded-lg pb-2 pt-3");
    			add_location(div36, file$1, 174, 18, 6432);
    			attr_dev(div37, "class", "bg-secondary mx-auto rounded-lg pt-4 mb-16 relative");
    			add_location(div37, file$1, 162, 16, 5944);
    			add_location(br1, file$1, 184, 18, 6849);
    			attr_dev(div38, "class", "text-gray-800 text-center");
    			add_location(div38, file$1, 182, 16, 6762);
    			attr_dev(div39, "class", "ml-32 absolute left-0 bottom-0 w-48 bg-white rounded-lg\n                shadow-lg px-10 py-8");
    			set_style(div39, "transform", "rotate(-8deg)");
    			set_style(div39, "z-index", "2");
    			set_style(div39, "margin-bottom", "-220px");
    			add_location(div39, file$1, 157, 14, 5704);
    			attr_dev(div40, "class", "w-32 bg-gray-200");
    			set_style(div40, "height", "560px");
    			add_location(div40, file$1, 194, 16, 7187);
    			attr_dev(h20, "class", "text-lg text-gray-700 font-bold mb-3");
    			add_location(h20, file$1, 196, 18, 7302);
    			attr_dev(div41, "class", "p-1 rounded-full bg-gray-300");
    			add_location(div41, file$1, 201, 22, 7556);
    			attr_dev(div42, "class", "w-16 rounded-full bg-gray-100 py-2 px-4 mr-2");
    			add_location(div42, file$1, 200, 20, 7475);
    			attr_dev(div43, "class", "p-1 rounded-full bg-gray-300");
    			add_location(div43, file$1, 204, 22, 7729);
    			attr_dev(div44, "class", "w-16 rounded-full bg-gray-100 py-2 px-4 mr-2");
    			add_location(div44, file$1, 203, 20, 7648);
    			attr_dev(div45, "class", "p-1 rounded-full bg-gray-300");
    			add_location(div45, file$1, 207, 22, 7902);
    			attr_dev(div46, "class", "w-16 rounded-full bg-gray-100 py-2 px-4 mr-2");
    			add_location(div46, file$1, 206, 20, 7821);
    			attr_dev(div47, "class", "p-1 rounded-full bg-gray-300");
    			add_location(div47, file$1, 210, 22, 8070);
    			attr_dev(div48, "class", "w-16 rounded-full bg-gray-100 py-2 px-4");
    			add_location(div48, file$1, 209, 20, 7994);
    			attr_dev(div49, "class", "flex mb-5");
    			add_location(div49, file$1, 199, 18, 7431);
    			attr_dev(div50, "class", "w-16 h-16 rounded-full bg-gray-200 mb-6");
    			add_location(div50, file$1, 217, 24, 8370);
    			attr_dev(div51, "class", "h-2 w-16 bg-gray-200 mb-2 rounded-full");
    			add_location(div51, file$1, 218, 24, 8450);
    			attr_dev(div52, "class", "h-2 w-10 bg-gray-200 rounded-full");
    			add_location(div52, file$1, 219, 24, 8529);
    			attr_dev(div53, "class", "h-40 rounded-lg bg-white shadow-lg p-6");
    			add_location(div53, file$1, 216, 22, 8293);
    			attr_dev(div54, "class", "w-1/3 px-4");
    			add_location(div54, file$1, 215, 20, 8246);
    			attr_dev(div55, "class", "w-16 h-16 rounded-full bg-gray-200 mb-6");
    			add_location(div55, file$1, 224, 24, 8779);
    			attr_dev(div56, "class", "h-2 w-16 bg-gray-200 mb-2 rounded-full");
    			add_location(div56, file$1, 225, 24, 8859);
    			attr_dev(div57, "class", "h-2 w-10 bg-gray-200 rounded-full");
    			add_location(div57, file$1, 226, 24, 8938);
    			attr_dev(div58, "class", "h-40 rounded-lg bg-white shadow-lg p-6");
    			add_location(div58, file$1, 223, 22, 8702);
    			attr_dev(div59, "class", "w-1/3 px-4");
    			add_location(div59, file$1, 222, 20, 8655);
    			attr_dev(div60, "class", "w-16 h-16 rounded-full bg-gray-200 mb-6");
    			add_location(div60, file$1, 231, 24, 9188);
    			attr_dev(div61, "class", "h-2 w-16 bg-gray-200 mb-2 rounded-full");
    			add_location(div61, file$1, 232, 24, 9268);
    			attr_dev(div62, "class", "h-2 w-10 bg-gray-200 rounded-full");
    			add_location(div62, file$1, 233, 24, 9347);
    			attr_dev(div63, "class", "h-40 rounded-lg bg-white shadow-lg p-6");
    			add_location(div63, file$1, 230, 22, 9111);
    			attr_dev(div64, "class", "w-1/3 px-4");
    			add_location(div64, file$1, 229, 20, 9064);
    			attr_dev(div65, "class", "flex flex-wrap -mx-4 mb-5");
    			add_location(div65, file$1, 214, 18, 8186);
    			attr_dev(h21, "class", "text-lg text-gray-700 font-bold mb-3");
    			add_location(h21, file$1, 238, 18, 9497);
    			attr_dev(div66, "class", "h-8 w-8 rounded bg-gray-200 mr-4");
    			add_location(div66, file$1, 247, 24, 9869);
    			attr_dev(div67, "class", "h-2 w-16 bg-gray-200 mb-1 rounded-full");
    			add_location(div67, file$1, 249, 26, 9974);
    			attr_dev(div68, "class", "h-2 w-10 bg-gray-100 rounded-full");
    			add_location(div68, file$1, 250, 26, 10055);
    			add_location(div69, file$1, 248, 24, 9942);
    			attr_dev(div70, "class", "flex");
    			add_location(div70, file$1, 246, 22, 9826);
    			attr_dev(div71, "class", "w-1/3");
    			add_location(div71, file$1, 245, 20, 9784);
    			attr_dev(div72, "class", "p-1 rounded-full bg-green-200");
    			add_location(div72, file$1, 257, 24, 10365);
    			attr_dev(div73, "class", "w-16 rounded-full bg-green-100 py-2 px-4 mx-auto");
    			add_location(div73, file$1, 255, 22, 10254);
    			attr_dev(div74, "class", "w-1/3");
    			add_location(div74, file$1, 254, 20, 10212);
    			attr_dev(div75, "class", "h-2 w-10 bg-gray-100 rounded-full mx-auto");
    			add_location(div75, file$1, 261, 22, 10529);
    			attr_dev(div76, "class", "w-1/3");
    			add_location(div76, file$1, 260, 20, 10487);
    			attr_dev(div77, "class", "w-full flex flex-wrap justify-between items-center\n                    border-b-2 border-gray-100 py-3");
    			add_location(div77, file$1, 242, 18, 9627);
    			attr_dev(div78, "class", "h-8 w-8 rounded bg-gray-200 mr-4");
    			add_location(div78, file$1, 270, 24, 10893);
    			attr_dev(div79, "class", "h-2 w-16 bg-gray-200 mb-1 rounded-full");
    			add_location(div79, file$1, 272, 26, 10998);
    			attr_dev(div80, "class", "h-2 w-10 bg-gray-100 rounded-full");
    			add_location(div80, file$1, 273, 26, 11079);
    			add_location(div81, file$1, 271, 24, 10966);
    			attr_dev(div82, "class", "flex");
    			add_location(div82, file$1, 269, 22, 10850);
    			attr_dev(div83, "class", "w-1/3");
    			add_location(div83, file$1, 268, 20, 10808);
    			attr_dev(div84, "class", "p-1 rounded-full bg-orange-200");
    			add_location(div84, file$1, 280, 24, 11390);
    			attr_dev(div85, "class", "w-16 rounded-full bg-orange-100 py-2 px-4 mx-auto");
    			add_location(div85, file$1, 278, 22, 11278);
    			attr_dev(div86, "class", "w-1/3");
    			add_location(div86, file$1, 277, 20, 11236);
    			attr_dev(div87, "class", "h-2 w-16 bg-gray-100 rounded-full mx-auto");
    			add_location(div87, file$1, 284, 22, 11555);
    			attr_dev(div88, "class", "w-1/3");
    			add_location(div88, file$1, 283, 20, 11513);
    			attr_dev(div89, "class", "flex flex-wrap justify-between items-center\n                    border-b-2 border-gray-100 py-3");
    			add_location(div89, file$1, 265, 18, 10658);
    			attr_dev(div90, "class", "h-8 w-8 rounded bg-gray-200 mr-4");
    			add_location(div90, file$1, 293, 24, 11919);
    			attr_dev(div91, "class", "h-2 w-16 bg-gray-200 mb-1 rounded-full");
    			add_location(div91, file$1, 295, 26, 12024);
    			attr_dev(div92, "class", "h-2 w-10 bg-gray-100 rounded-full");
    			add_location(div92, file$1, 296, 26, 12105);
    			add_location(div93, file$1, 294, 24, 11992);
    			attr_dev(div94, "class", "flex");
    			add_location(div94, file$1, 292, 22, 11876);
    			attr_dev(div95, "class", "w-1/3");
    			add_location(div95, file$1, 291, 20, 11834);
    			attr_dev(div96, "class", "p-1 rounded-full bg-blue-200");
    			add_location(div96, file$1, 303, 24, 12414);
    			attr_dev(div97, "class", "w-16 rounded-full bg-blue-100 py-2 px-4 mx-auto");
    			add_location(div97, file$1, 301, 22, 12304);
    			attr_dev(div98, "class", "w-1/3");
    			add_location(div98, file$1, 300, 20, 12262);
    			attr_dev(div99, "class", "h-2 w-8 bg-gray-100 rounded-full mx-auto");
    			add_location(div99, file$1, 307, 22, 12577);
    			attr_dev(div100, "class", "w-1/3");
    			add_location(div100, file$1, 306, 20, 12535);
    			attr_dev(div101, "class", "flex flex-wrap justify-between items-center\n                    border-b-2 border-gray-100 py-3");
    			add_location(div101, file$1, 288, 18, 11684);
    			attr_dev(div102, "class", "flex-1 p-6");
    			add_location(div102, file$1, 195, 16, 7259);
    			attr_dev(div103, "class", "mt-10 w-full absolute right-0 top-0 flex rounded-lg\n                bg-white overflow-hidden shadow-lg");
    			set_style(div103, "transform", "rotate(-8deg)");
    			set_style(div103, "margin-right", "-250px");
    			set_style(div103, "z-index", "1");
    			add_location(div103, file$1, 189, 14, 6938);
    			attr_dev(div104, "class", "grid--gray h-48 w-48");
    			add_location(div104, file$1, 317, 16, 12929);
    			attr_dev(div105, "class", "w-full absolute left-0 bottom-0 ml-1");
    			set_style(div105, "transform", "rotate(-8deg)");
    			set_style(div105, "z-index", "1");
    			set_style(div105, "margin-bottom", "-360px");
    			add_location(div105, file$1, 313, 14, 12745);
    			attr_dev(div106, "class", "hidden md:block");
    			add_location(div106, file$1, 83, 12, 2589);
    			attr_dev(span3, "class", "h-2 w-2 rounded-full bg-red-500 inline-block mr-1 ml-2");
    			add_location(span3, file$1, 327, 16, 13302);
    			attr_dev(span4, "class", "h-2 w-2 rounded-full bg-orange-400 inline-block mr-1");
    			add_location(span4, file$1, 329, 16, 13408);
    			attr_dev(span5, "class", "h-2 w-2 rounded-full bg-green-500 inline-block mr-1");
    			add_location(span5, file$1, 331, 16, 13512);
    			attr_dev(div107, "class", "h-4 bg-gray-200 absolute top-0 left-0 right-0\n                rounded-t-lg flex items-center");
    			add_location(div107, file$1, 324, 14, 13163);
    			attr_dev(div108, "class", "h-2 w-16 bg-gray-300 rounded-full mb-4");
    			add_location(div108, file$1, 335, 16, 13714);
    			attr_dev(div109, "class", "h-5 w-5 rounded-full bg-gray-300 mr-3 flex-shrink-0");
    			add_location(div109, file$1, 337, 18, 13840);
    			attr_dev(div110, "class", "h-2 w-10 bg-gray-300 rounded-full");
    			add_location(div110, file$1, 340, 20, 13972);
    			add_location(div111, file$1, 339, 18, 13946);
    			attr_dev(div112, "class", "flex items-center mb-4");
    			add_location(div112, file$1, 336, 16, 13785);
    			attr_dev(div113, "class", "h-2 w-16 bg-gray-200 rounded-full mb-2");
    			add_location(div113, file$1, 344, 16, 14087);
    			attr_dev(div114, "class", "h-2 w-10 bg-gray-200 rounded-full mb-2");
    			add_location(div114, file$1, 345, 16, 14158);
    			attr_dev(div115, "class", "h-2 w-20 bg-gray-200 rounded-full mb-2");
    			add_location(div115, file$1, 346, 16, 14229);
    			attr_dev(div116, "class", "h-2 w-6 bg-gray-200 rounded-full mb-2");
    			add_location(div116, file$1, 347, 16, 14300);
    			attr_dev(div117, "class", "h-2 w-16 bg-gray-200 rounded-full mb-2");
    			add_location(div117, file$1, 348, 16, 14370);
    			attr_dev(div118, "class", "h-2 w-10 bg-gray-200 rounded-full mb-2");
    			add_location(div118, file$1, 349, 16, 14441);
    			attr_dev(div119, "class", "h-2 w-20 bg-gray-200 rounded-full mb-2");
    			add_location(div119, file$1, 350, 16, 14512);
    			attr_dev(div120, "class", "h-2 w-6 bg-gray-200 rounded-full mb-2");
    			add_location(div120, file$1, 351, 16, 14583);
    			attr_dev(div121, "class", "w-32 bg-gray-100 px-2 py-8");
    			set_style(div121, "height", "340px");
    			add_location(div121, file$1, 334, 14, 13634);
    			attr_dev(h22, "class", "text-xs text-gray-700 font-bold mb-1");
    			add_location(h22, file$1, 354, 16, 14719);
    			attr_dev(div122, "class", "p-2 w-12 rounded-full bg-gray-100 mr-2");
    			add_location(div122, file$1, 358, 18, 14884);
    			attr_dev(div123, "class", "p-2 w-12 rounded-full bg-gray-100 mr-2");
    			add_location(div123, file$1, 359, 18, 14957);
    			attr_dev(div124, "class", "p-2 w-12 rounded-full bg-gray-100 mr-2");
    			add_location(div124, file$1, 360, 18, 15030);
    			attr_dev(div125, "class", "p-2 w-12 rounded-full bg-gray-100 mr-2");
    			add_location(div125, file$1, 361, 18, 15103);
    			attr_dev(div126, "class", "flex mb-5");
    			add_location(div126, file$1, 357, 16, 14842);
    			attr_dev(div127, "class", "w-6 h-6 rounded-full bg-gray-200 mb-2");
    			add_location(div127, file$1, 367, 22, 15368);
    			attr_dev(div128, "class", "h-2 w-10 bg-gray-200 mb-1 rounded-full");
    			add_location(div128, file$1, 368, 22, 15444);
    			attr_dev(div129, "class", "h-2 w-6 bg-gray-200 rounded-full");
    			add_location(div129, file$1, 369, 22, 15521);
    			attr_dev(div130, "class", "p-3 rounded-lg bg-white shadow");
    			add_location(div130, file$1, 366, 20, 15301);
    			attr_dev(div131, "class", "w-1/3 px-2");
    			add_location(div131, file$1, 365, 18, 15256);
    			attr_dev(div132, "class", "w-6 h-6 rounded-full bg-gray-200 mb-2");
    			add_location(div132, file$1, 374, 22, 15752);
    			attr_dev(div133, "class", "h-2 w-10 bg-gray-200 mb-1 rounded-full");
    			add_location(div133, file$1, 375, 22, 15828);
    			attr_dev(div134, "class", "h-2 w-6 bg-gray-200 rounded-full");
    			add_location(div134, file$1, 376, 22, 15905);
    			attr_dev(div135, "class", "p-3 rounded-lg bg-white shadow");
    			add_location(div135, file$1, 373, 20, 15685);
    			attr_dev(div136, "class", "w-1/3 px-2");
    			add_location(div136, file$1, 372, 18, 15640);
    			attr_dev(div137, "class", "w-6 h-6 rounded-full bg-gray-200 mb-2");
    			add_location(div137, file$1, 381, 22, 16136);
    			attr_dev(div138, "class", "h-2 w-10 bg-gray-200 mb-1 rounded-full");
    			add_location(div138, file$1, 382, 22, 16212);
    			attr_dev(div139, "class", "h-2 w-6 bg-gray-200 rounded-full");
    			add_location(div139, file$1, 383, 22, 16289);
    			attr_dev(div140, "class", "p-3 rounded-lg bg-white shadow");
    			add_location(div140, file$1, 380, 20, 16069);
    			attr_dev(div141, "class", "w-1/3 px-2");
    			add_location(div141, file$1, 379, 18, 16024);
    			attr_dev(div142, "class", "flex flex-wrap -mx-2 mb-5");
    			add_location(div142, file$1, 364, 16, 15198);
    			attr_dev(h23, "class", "text-xs text-gray-700 font-bold mb-1");
    			add_location(h23, file$1, 388, 16, 16430);
    			attr_dev(div143, "class", "h-5 w-5 rounded-full bg-gray-200 mr-3\n                        flex-shrink-0");
    			add_location(div143, file$1, 397, 22, 16786);
    			attr_dev(div144, "class", "h-2 w-16 bg-gray-200 mb-1 rounded-full");
    			add_location(div144, file$1, 401, 24, 16954);
    			attr_dev(div145, "class", "h-2 w-10 bg-gray-100 rounded-full");
    			add_location(div145, file$1, 402, 24, 17033);
    			add_location(div146, file$1, 400, 22, 16924);
    			attr_dev(div147, "class", "flex");
    			add_location(div147, file$1, 396, 20, 16745);
    			attr_dev(div148, "class", "w-1/3");
    			add_location(div148, file$1, 395, 18, 16705);
    			attr_dev(div149, "class", "p-1 rounded-full bg-green-200");
    			add_location(div149, file$1, 409, 22, 17329);
    			attr_dev(div150, "class", "w-16 rounded-full bg-green-100 py-2 px-4 mx-auto");
    			add_location(div150, file$1, 407, 20, 17222);
    			attr_dev(div151, "class", "w-1/3");
    			add_location(div151, file$1, 406, 18, 17182);
    			attr_dev(div152, "class", "h-2 w-10 bg-gray-100 rounded-full mx-auto");
    			add_location(div152, file$1, 413, 20, 17485);
    			attr_dev(div153, "class", "w-1/3");
    			add_location(div153, file$1, 412, 18, 17445);
    			attr_dev(div154, "class", "w-full flex flex-wrap justify-between items-center\n                  border-b-2 border-gray-100 py-3");
    			add_location(div154, file$1, 392, 16, 16554);
    			attr_dev(div155, "class", "h-5 w-5 rounded-full bg-gray-200 mr-3\n                        flex-shrink-0");
    			add_location(div155, file$1, 420, 22, 17770);
    			attr_dev(div156, "class", "h-2 w-16 bg-gray-200 mb-1 rounded-full");
    			add_location(div156, file$1, 424, 24, 17938);
    			attr_dev(div157, "class", "h-2 w-10 bg-gray-100 rounded-full");
    			add_location(div157, file$1, 425, 24, 18017);
    			add_location(div158, file$1, 423, 22, 17908);
    			attr_dev(div159, "class", "flex");
    			add_location(div159, file$1, 419, 20, 17729);
    			attr_dev(div160, "class", "w-1/3");
    			add_location(div160, file$1, 418, 18, 17689);
    			attr_dev(div161, "class", "p-1 rounded-full bg-orange-200");
    			add_location(div161, file$1, 432, 22, 18314);
    			attr_dev(div162, "class", "w-16 rounded-full bg-orange-100 py-2 px-4 mx-auto");
    			add_location(div162, file$1, 430, 20, 18206);
    			attr_dev(div163, "class", "w-1/3");
    			add_location(div163, file$1, 429, 18, 18166);
    			attr_dev(div164, "class", "h-2 w-16 bg-gray-100 rounded-full mx-auto");
    			add_location(div164, file$1, 436, 20, 18471);
    			attr_dev(div165, "class", "w-1/3");
    			add_location(div165, file$1, 435, 18, 18431);
    			attr_dev(div166, "class", "flex flex-wrap justify-between items-center py-3");
    			add_location(div166, file$1, 417, 16, 17608);
    			attr_dev(div167, "class", "flex-1 px-4 py-8");
    			add_location(div167, file$1, 353, 14, 14672);
    			attr_dev(div168, "class", "md:hidden w-full absolute right-0 top-0 flex rounded-lg\n              bg-white overflow-hidden shadow");
    			add_location(div168, file$1, 321, 12, 13019);
    			attr_dev(div169, "class", "h-3 bg-white");
    			add_location(div169, file$1, 448, 16, 18934);
    			attr_dev(div170, "class", "inline-flex w-3 h-3 rounded-full bg-white -mr-2");
    			add_location(div170, file$1, 451, 18, 19028);
    			attr_dev(div171, "class", "inline-flex w-3 h-3 rounded-full bg-indigo-800\n                    border-2 border-white mr-2");
    			add_location(div171, file$1, 453, 18, 19130);
    			attr_dev(div172, "class", "text-right my-2");
    			add_location(div172, file$1, 450, 16, 18980);
    			attr_dev(div173, "class", "h-2 bg-white mb-2");
    			add_location(div173, file$1, 461, 18, 19452);
    			attr_dev(div174, "class", "h-2 bg-white w-6 ml-auto rounded mr-2");
    			add_location(div174, file$1, 462, 18, 19504);
    			attr_dev(div175, "class", "-ml-4 -mb-6 absolute left-0 bottom-0 w-16 bg-green-700\n                  mx-auto rounded-lg pb-2 pt-3");
    			add_location(div175, file$1, 458, 16, 19300);
    			attr_dev(div176, "class", "bg-indigo-800 mx-auto rounded-lg w-20 pt-3 mb-12 relative");
    			add_location(div176, file$1, 446, 14, 18830);
    			add_location(br2, file$1, 468, 16, 19709);
    			attr_dev(div177, "class", "text-gray-800 text-center text-sm");
    			add_location(div177, file$1, 466, 14, 19617);
    			attr_dev(div178, "class", "mr-3 md:hidden absolute right-0 bottom-0 w-40 bg-white\n              rounded-lg shadow-lg px-10 py-6");
    			set_style(div178, "z-index", "2");
    			set_style(div178, "margin-bottom", "-380px");
    			add_location(div178, file$1, 442, 12, 18630);
    			attr_dev(div179, "class", "md:w-1/2 relative");
    			add_location(div179, file$1, 82, 10, 2545);
    			attr_dev(div180, "class", "md:flex md:flex-wrap");
    			add_location(div180, file$1, 61, 8, 1777);
    			attr_dev(div181, "class", "md:max-w-6xl md:mx-auto");
    			add_location(div181, file$1, 60, 6, 1731);
    			attr_dev(div182, "class", "px-4 py-20 md:py-4");
    			add_location(div182, file$1, 59, 4, 1692);
    			attr_dev(path, "fill-opacity", "1");
    			attr_dev(path, "d", "M0,224L1440,32L1440,320L0,320Z");
    			add_location(path, file$1, 480, 6, 19977);
    			attr_dev(svg, "class", "fill-current text-white hidden md:block");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1440 320");
    			add_location(svg, file$1, 476, 4, 19841);
    			attr_dev(div183, "class", "bg-primary md:overflow-hidden");
    			add_location(div183, file$1, 58, 2, 1644);
    			add_location(div184, file$1, 3, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div184, anchor);
    			append_dev(div184, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div4);
    			append_dev(div4, a0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div6, div5);
    			append_dev(div5, a1);
    			append_dev(div5, t6);
    			append_dev(div5, a2);
    			append_dev(div5, t8);
    			append_dev(div5, a3);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div7, a4);
    			append_dev(div7, t12);
    			append_dev(div7, a5);
    			append_dev(div184, t14);
    			append_dev(div184, div183);
    			append_dev(div183, div182);
    			append_dev(div182, div181);
    			append_dev(div181, div180);
    			append_dev(div180, div10);
    			append_dev(div10, h1);
    			append_dev(div10, t16);
    			append_dev(div10, p);
    			append_dev(div10, t18);
    			append_dev(div10, a6);
    			append_dev(div180, t20);
    			append_dev(div180, div179);
    			append_dev(div179, div106);
    			append_dev(div106, div21);
    			append_dev(div21, div19);
    			append_dev(div19, div11);
    			append_dev(div11, span0);
    			append_dev(div11, t21);
    			append_dev(div11, span1);
    			append_dev(div11, t22);
    			append_dev(div11, span2);
    			append_dev(div19, t23);
    			append_dev(div19, div12);
    			append_dev(div19, t24);
    			append_dev(div19, div13);
    			append_dev(div19, t25);
    			append_dev(div19, div16);
    			append_dev(div16, div14);
    			append_dev(div16, t26);
    			append_dev(div16, div15);
    			append_dev(div19, t27);
    			append_dev(div19, div17);
    			append_dev(div19, t28);
    			append_dev(div19, div18);
    			append_dev(div21, t29);
    			append_dev(div21, div20);
    			append_dev(div20, t30);
    			append_dev(div20, br0);
    			append_dev(div20, t31);
    			append_dev(div106, t32);
    			append_dev(div106, div29);
    			append_dev(div29, div27);
    			append_dev(div27, div22);
    			append_dev(div27, t33);
    			append_dev(div27, div23);
    			append_dev(div27, t34);
    			append_dev(div27, div25);
    			append_dev(div25, div24);
    			append_dev(div27, t35);
    			append_dev(div27, div26);
    			append_dev(div29, t36);
    			append_dev(div29, div28);
    			append_dev(div106, t38);
    			append_dev(div106, div39);
    			append_dev(div39, div37);
    			append_dev(div37, div30);
    			append_dev(div37, t39);
    			append_dev(div37, div33);
    			append_dev(div33, div31);
    			append_dev(div33, t40);
    			append_dev(div33, div32);
    			append_dev(div37, t41);
    			append_dev(div37, div36);
    			append_dev(div36, div34);
    			append_dev(div36, t42);
    			append_dev(div36, div35);
    			append_dev(div39, t43);
    			append_dev(div39, div38);
    			append_dev(div38, t44);
    			append_dev(div38, br1);
    			append_dev(div38, t45);
    			append_dev(div106, t46);
    			append_dev(div106, div103);
    			append_dev(div103, div40);
    			append_dev(div103, t47);
    			append_dev(div103, div102);
    			append_dev(div102, h20);
    			append_dev(div102, t49);
    			append_dev(div102, div49);
    			append_dev(div49, div42);
    			append_dev(div42, div41);
    			append_dev(div49, t50);
    			append_dev(div49, div44);
    			append_dev(div44, div43);
    			append_dev(div49, t51);
    			append_dev(div49, div46);
    			append_dev(div46, div45);
    			append_dev(div49, t52);
    			append_dev(div49, div48);
    			append_dev(div48, div47);
    			append_dev(div102, t53);
    			append_dev(div102, div65);
    			append_dev(div65, div54);
    			append_dev(div54, div53);
    			append_dev(div53, div50);
    			append_dev(div53, t54);
    			append_dev(div53, div51);
    			append_dev(div53, t55);
    			append_dev(div53, div52);
    			append_dev(div65, t56);
    			append_dev(div65, div59);
    			append_dev(div59, div58);
    			append_dev(div58, div55);
    			append_dev(div58, t57);
    			append_dev(div58, div56);
    			append_dev(div58, t58);
    			append_dev(div58, div57);
    			append_dev(div65, t59);
    			append_dev(div65, div64);
    			append_dev(div64, div63);
    			append_dev(div63, div60);
    			append_dev(div63, t60);
    			append_dev(div63, div61);
    			append_dev(div63, t61);
    			append_dev(div63, div62);
    			append_dev(div102, t62);
    			append_dev(div102, h21);
    			append_dev(div102, t64);
    			append_dev(div102, div77);
    			append_dev(div77, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div66);
    			append_dev(div70, t65);
    			append_dev(div70, div69);
    			append_dev(div69, div67);
    			append_dev(div69, t66);
    			append_dev(div69, div68);
    			append_dev(div77, t67);
    			append_dev(div77, div74);
    			append_dev(div74, div73);
    			append_dev(div73, div72);
    			append_dev(div77, t68);
    			append_dev(div77, div76);
    			append_dev(div76, div75);
    			append_dev(div102, t69);
    			append_dev(div102, div89);
    			append_dev(div89, div83);
    			append_dev(div83, div82);
    			append_dev(div82, div78);
    			append_dev(div82, t70);
    			append_dev(div82, div81);
    			append_dev(div81, div79);
    			append_dev(div81, t71);
    			append_dev(div81, div80);
    			append_dev(div89, t72);
    			append_dev(div89, div86);
    			append_dev(div86, div85);
    			append_dev(div85, div84);
    			append_dev(div89, t73);
    			append_dev(div89, div88);
    			append_dev(div88, div87);
    			append_dev(div102, t74);
    			append_dev(div102, div101);
    			append_dev(div101, div95);
    			append_dev(div95, div94);
    			append_dev(div94, div90);
    			append_dev(div94, t75);
    			append_dev(div94, div93);
    			append_dev(div93, div91);
    			append_dev(div93, t76);
    			append_dev(div93, div92);
    			append_dev(div101, t77);
    			append_dev(div101, div98);
    			append_dev(div98, div97);
    			append_dev(div97, div96);
    			append_dev(div101, t78);
    			append_dev(div101, div100);
    			append_dev(div100, div99);
    			append_dev(div106, t79);
    			append_dev(div106, div105);
    			append_dev(div105, div104);
    			append_dev(div179, t80);
    			append_dev(div179, div168);
    			append_dev(div168, div107);
    			append_dev(div107, span3);
    			append_dev(div107, t81);
    			append_dev(div107, span4);
    			append_dev(div107, t82);
    			append_dev(div107, span5);
    			append_dev(div168, t83);
    			append_dev(div168, div121);
    			append_dev(div121, div108);
    			append_dev(div121, t84);
    			append_dev(div121, div112);
    			append_dev(div112, div109);
    			append_dev(div112, t85);
    			append_dev(div112, div111);
    			append_dev(div111, div110);
    			append_dev(div121, t86);
    			append_dev(div121, div113);
    			append_dev(div121, t87);
    			append_dev(div121, div114);
    			append_dev(div121, t88);
    			append_dev(div121, div115);
    			append_dev(div121, t89);
    			append_dev(div121, div116);
    			append_dev(div121, t90);
    			append_dev(div121, div117);
    			append_dev(div121, t91);
    			append_dev(div121, div118);
    			append_dev(div121, t92);
    			append_dev(div121, div119);
    			append_dev(div121, t93);
    			append_dev(div121, div120);
    			append_dev(div168, t94);
    			append_dev(div168, div167);
    			append_dev(div167, h22);
    			append_dev(div167, t96);
    			append_dev(div167, div126);
    			append_dev(div126, div122);
    			append_dev(div126, t97);
    			append_dev(div126, div123);
    			append_dev(div126, t98);
    			append_dev(div126, div124);
    			append_dev(div126, t99);
    			append_dev(div126, div125);
    			append_dev(div167, t100);
    			append_dev(div167, div142);
    			append_dev(div142, div131);
    			append_dev(div131, div130);
    			append_dev(div130, div127);
    			append_dev(div130, t101);
    			append_dev(div130, div128);
    			append_dev(div130, t102);
    			append_dev(div130, div129);
    			append_dev(div142, t103);
    			append_dev(div142, div136);
    			append_dev(div136, div135);
    			append_dev(div135, div132);
    			append_dev(div135, t104);
    			append_dev(div135, div133);
    			append_dev(div135, t105);
    			append_dev(div135, div134);
    			append_dev(div142, t106);
    			append_dev(div142, div141);
    			append_dev(div141, div140);
    			append_dev(div140, div137);
    			append_dev(div140, t107);
    			append_dev(div140, div138);
    			append_dev(div140, t108);
    			append_dev(div140, div139);
    			append_dev(div167, t109);
    			append_dev(div167, h23);
    			append_dev(div167, t111);
    			append_dev(div167, div154);
    			append_dev(div154, div148);
    			append_dev(div148, div147);
    			append_dev(div147, div143);
    			append_dev(div147, t112);
    			append_dev(div147, div146);
    			append_dev(div146, div144);
    			append_dev(div146, t113);
    			append_dev(div146, div145);
    			append_dev(div154, t114);
    			append_dev(div154, div151);
    			append_dev(div151, div150);
    			append_dev(div150, div149);
    			append_dev(div154, t115);
    			append_dev(div154, div153);
    			append_dev(div153, div152);
    			append_dev(div167, t116);
    			append_dev(div167, div166);
    			append_dev(div166, div160);
    			append_dev(div160, div159);
    			append_dev(div159, div155);
    			append_dev(div159, t117);
    			append_dev(div159, div158);
    			append_dev(div158, div156);
    			append_dev(div158, t118);
    			append_dev(div158, div157);
    			append_dev(div166, t119);
    			append_dev(div166, div163);
    			append_dev(div163, div162);
    			append_dev(div162, div161);
    			append_dev(div166, t120);
    			append_dev(div166, div165);
    			append_dev(div165, div164);
    			append_dev(div179, t121);
    			append_dev(div179, div178);
    			append_dev(div178, div176);
    			append_dev(div176, div169);
    			append_dev(div176, t122);
    			append_dev(div176, div172);
    			append_dev(div172, div170);
    			append_dev(div172, t123);
    			append_dev(div172, div171);
    			append_dev(div176, t124);
    			append_dev(div176, div175);
    			append_dev(div175, div173);
    			append_dev(div175, t125);
    			append_dev(div175, div174);
    			append_dev(div178, t126);
    			append_dev(div178, div177);
    			append_dev(div177, t127);
    			append_dev(div177, br2);
    			append_dev(div177, t128);
    			append_dev(div183, t129);
    			append_dev(div183, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div184);
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

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Landing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Landing", $$slots, []);
    	return [];
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	let tailwind;
    	let t;
    	let landing;
    	let current;
    	tailwind = new Tailwind({ $$inline: true });
    	landing = new Landing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tailwind.$$.fragment);
    			t = space();
    			create_component(landing.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwind, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(landing, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwind.$$.fragment, local);
    			transition_in(landing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwind.$$.fragment, local);
    			transition_out(landing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwind, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(landing, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Tailwind, Welcome, Landing });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
