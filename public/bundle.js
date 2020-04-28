
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    const context = {
      subscribe: null,
      addNotification: null,
      removeNotification: null,
      clearNotifications: null,
    };

    const getNotificationsContext = () => getContext(context);

    /* node_modules/svelte-notifications/src/components/Notification.svelte generated by Svelte v3.20.1 */

    function create_fragment(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: {
    				notification: /*notification*/ ctx[1],
    				withoutStyles: /*withoutStyles*/ ctx[2],
    				onRemove: /*removeNotificationHandler*/ ctx[3]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*notification*/ 2) switch_instance_changes.notification = /*notification*/ ctx[1];
    			if (dirty & /*withoutStyles*/ 4) switch_instance_changes.withoutStyles = /*withoutStyles*/ ctx[2];

    			if (switch_value !== (switch_value = /*item*/ ctx[0])) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
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
    	let { item } = $$props;
    	let { notification = {} } = $$props;
    	let { withoutStyles = false } = $$props;
    	const { removeNotification } = getNotificationsContext();
    	const { id, removeAfter, customClass = "" } = notification;
    	const removeNotificationHandler = () => removeNotification(id);
    	let timeout = null;

    	if (removeAfter) {
    		timeout = setTimeout(removeNotificationHandler, removeAfter);
    	}

    	onDestroy(() => {
    		if (removeAfter && timeout) clearTimeout(timeout);
    	});

    	const writable_props = ["item", "notification", "withoutStyles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Notification", $$slots, []);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("notification" in $$props) $$invalidate(1, notification = $$props.notification);
    		if ("withoutStyles" in $$props) $$invalidate(2, withoutStyles = $$props.withoutStyles);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		fade,
    		getNotificationsContext,
    		item,
    		notification,
    		withoutStyles,
    		removeNotification,
    		id,
    		removeAfter,
    		customClass,
    		removeNotificationHandler,
    		timeout
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("notification" in $$props) $$invalidate(1, notification = $$props.notification);
    		if ("withoutStyles" in $$props) $$invalidate(2, withoutStyles = $$props.withoutStyles);
    		if ("timeout" in $$props) timeout = $$props.timeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, notification, withoutStyles, removeNotificationHandler];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			item: 0,
    			notification: 1,
    			withoutStyles: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<Notification> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notification() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notification(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-notifications/src/components/DefaultNotification.svelte generated by Svelte v3.20.1 */
    const file = "node_modules/svelte-notifications/src/components/DefaultNotification.svelte";

    // (102:10) {text}
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(102:10) {text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let button;
    	let t1;
    	let button_class_value;
    	let div1_class_value;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t0 = space();
    			button = element("button");
    			t1 = text("×");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*getClass*/ ctx[2]("content")) + " svelte-5jgk0r"));
    			add_location(div0, file, 100, 2, 5188);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*getClass*/ ctx[2]("button")) + " svelte-5jgk0r"));
    			attr_dev(button, "aria-label", "delete notification");
    			add_location(button, file, 103, 2, 5257);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*getClass*/ ctx[2]()) + " svelte-5jgk0r"));
    			attr_dev(div1, "role", "status");
    			attr_dev(div1, "aria-live", "polite");
    			add_location(div1, file, 93, 0, 5100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, t1);
    			current = true;
    			if (remount) dispose();

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*onRemove*/ ctx[0])) /*onRemove*/ ctx[0].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fade, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			dispose();
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
    	let { notification = {} } = $$props;
    	let { withoutStyles = false } = $$props;
    	let { onRemove = null } = $$props;
    	const { id, text, type } = notification;

    	const getClass = suffix => {
    		const defaultSuffix = suffix ? `-${suffix}` : "";
    		const defaultNotificationClass = ` default-notification-style${defaultSuffix}`;
    		const defaultNotificationType = type && !suffix ? ` default-notification-${type}` : "";
    		return `notification${defaultSuffix}${withoutStyles ? "" : defaultNotificationClass}${defaultNotificationType}`;
    	};

    	const writable_props = ["notification", "withoutStyles", "onRemove"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DefaultNotification> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DefaultNotification", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("notification" in $$props) $$invalidate(3, notification = $$props.notification);
    		if ("withoutStyles" in $$props) $$invalidate(4, withoutStyles = $$props.withoutStyles);
    		if ("onRemove" in $$props) $$invalidate(0, onRemove = $$props.onRemove);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		notification,
    		withoutStyles,
    		onRemove,
    		id,
    		text,
    		type,
    		getClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("notification" in $$props) $$invalidate(3, notification = $$props.notification);
    		if ("withoutStyles" in $$props) $$invalidate(4, withoutStyles = $$props.withoutStyles);
    		if ("onRemove" in $$props) $$invalidate(0, onRemove = $$props.onRemove);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		onRemove,
    		text,
    		getClass,
    		notification,
    		withoutStyles,
    		id,
    		type,
    		$$scope,
    		$$slots
    	];
    }

    class DefaultNotification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			notification: 3,
    			withoutStyles: 4,
    			onRemove: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefaultNotification",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get notification() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notification(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onRemove() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onRemove(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    const isNotificationValid = notification => {
      if (!notification || !notification.text) return false;
      if (typeof notification.text !== 'string') return false;
      if (!positions.includes(notification.position)) return false;

      return true;
    };

    const addNotification = (notification, update) => {
      if (!isNotificationValid(notification)) throw new Error('Notification object is not valid');

      const {
        id = new Date().getTime(),
        removeAfter = +notification.removeAfter,
        ...rest
      } = notification;

      update((notifications) => {
        return [...notifications, {
          id,
          removeAfter,
          ...rest,
        }];
      });
    };

    const removeNotification = (notificationId, update) => update((notifications) => {
      return notifications.filter(n => n.id !== notificationId);
    });

    const clearNotifications = set => set([]);

    const createNotificationsStore = () => {
      const {
        subscribe,
        set,
        update,
      } = writable([]);

      return {
        subscribe,
        addNotification: notification => addNotification(notification, update),
        removeNotification: notificationId => removeNotification(notificationId, update),
        clearNotifications: () => clearNotifications(set),
      };
    };

    var store = createNotificationsStore();

    /* node_modules/svelte-notifications/src/components/Notifications.svelte generated by Svelte v3.20.1 */
    const file$1 = "node_modules/svelte-notifications/src/components/Notifications.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (71:8) {#if notification.position === position}
    function create_if_block(ctx) {
    	let current;

    	const notification = new Notification({
    			props: {
    				notification: /*notification*/ ctx[9],
    				withoutStyles: /*withoutStyles*/ ctx[1],
    				item: /*item*/ ctx[0] ? /*item*/ ctx[0] : DefaultNotification
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notification_changes = {};
    			if (dirty & /*$store*/ 4) notification_changes.notification = /*notification*/ ctx[9];
    			if (dirty & /*withoutStyles*/ 2) notification_changes.withoutStyles = /*withoutStyles*/ ctx[1];
    			if (dirty & /*item*/ 1) notification_changes.item = /*item*/ ctx[0] ? /*item*/ ctx[0] : DefaultNotification;
    			notification.$set(notification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:8) {#if notification.position === position}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#each $store as notification (notification.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*notification*/ ctx[9].position === /*position*/ ctx[6] && create_if_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*notification*/ ctx[9].position === /*position*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(70:6) {#each $store as notification (notification.id)}",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#each positions as position}
    function create_each_block(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let div_class_value;
    	let current;
    	let each_value_1 = /*$store*/ ctx[2];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*notification*/ ctx[9].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*getClass*/ ctx[3](/*position*/ ctx[6])) + " svelte-r7ntzo"));
    			add_location(div, file$1, 68, 4, 3050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, withoutStyles, item, DefaultNotification, positions*/ 7) {
    				const each_value_1 = /*$store*/ ctx[2];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(68:2) {#each positions as position}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let each_value = positions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "notifications");
    			add_location(div, file$1, 66, 0, 2986);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    				}
    			}

    			if (dirty & /*getClass, positions, $store, withoutStyles, item, DefaultNotification*/ 15) {
    				each_value = positions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			transition_in(default_slot, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
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
    	let $store;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(2, $store = $$value));
    	let { item = null } = $$props;
    	let { withoutStyles = false } = $$props;

    	const getClass = (position = "") => {
    		const defaultPositionClass = ` default-position-style-${position}`;
    		return `position-${position}${withoutStyles ? "" : defaultPositionClass}`;
    	};

    	setContext(context, store);
    	const writable_props = ["item", "withoutStyles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notifications> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Notifications", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("withoutStyles" in $$props) $$invalidate(1, withoutStyles = $$props.withoutStyles);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		Notification,
    		DefaultNotification,
    		context,
    		store,
    		positions,
    		item,
    		withoutStyles,
    		getClass,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("withoutStyles" in $$props) $$invalidate(1, withoutStyles = $$props.withoutStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, withoutStyles, $store, getClass, $$scope, $$slots];
    }

    class Notifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 0, withoutStyles: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get item() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCardArticle.svelte generated by Svelte v3.20.1 */

    const file$2 = "src/quanta/1-views/2-molecules/OmoCardArticle.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(a0, file$2, 24, 4, 418);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$2, 23, 2, 367);
    			attr_dev(a1, "class", "text-lg text-gray-700 font-medium");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$2, 29, 4, 558);
    			attr_dev(div1, "class", "mt-4");
    			add_location(div1, file$2, 28, 2, 535);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "w-8 h-8 object-cover rounded");
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$2, 35, 6, 755);
    			attr_dev(a2, "class", "text-gray-700 text-sm mx-3");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$2, 39, 6, 866);
    			attr_dev(div2, "class", "flex items-center");
    			add_location(div2, file$2, 34, 4, 717);
    			attr_dev(span, "class", "font-light text-sm text-gray-600");
    			add_location(span, file$2, 41, 4, 952);
    			attr_dev(div3, "class", "flex justify-between items-center mt-4");
    			add_location(div3, file$2, 33, 2, 660);
    			attr_dev(div4, "class", div4_class_value = "flex flex-col px-8 py-6 max-w-md mx-auto " + /*quant*/ ctx[0].design.layout);
    			add_location(div4, file$2, 22, 0, 288);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardArticle",
    			options,
    			id: create_fragment$3.name
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

    const file$3 = "src/quanta/1-views/1-atoms/OmoButton.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(button_1, file$3, 9, 2, 122);
    			attr_dev(a, "href", a_href_value = /*button*/ ctx[0].link);
    			add_location(a, file$3, 8, 0, 97);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoButton",
    			options,
    			id: create_fragment$4.name
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
    const file$4 = "src/quanta/1-views/2-molecules/OmoNavbar.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(img, file$4, 11, 8, 279);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "mr-4");
    			add_location(a0, file$4, 10, 6, 245);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$4, 9, 4, 220);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a1, file$4, 16, 8, 433);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a2, file$4, 21, 8, 575);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ");
    			add_location(a3, file$4, 26, 8, 717);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$4, 15, 6, 406);
    			attr_dev(div2, "class", "content-center flex");
    			add_location(div2, file$4, 14, 4, 366);
    			attr_dev(nav, "class", "flex justify-between w-full px-3 py-3");
    			add_location(nav, file$4, 8, 2, 164);
    			attr_dev(header, "class", "bg-gray-800");
    			add_location(header, file$4, 7, 0, 133);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNavbar",
    			options,
    			id: create_fragment$5.name
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

    const file$5 = "src/quanta/1-views/2-molecules/OmoBanner.svelte";

    function create_fragment$6(ctx) {
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
    			attr_dev(p0, "class", "text-gray-300 text-xs uppercase");
    			add_location(p0, file$5, 16, 4, 390);
    			attr_dev(p1, "class", "text-3xl font-bold font-title uppercase");
    			add_location(p1, file$5, 17, 4, 462);
    			attr_dev(p2, "class", "text-xl text-gray-200 mb-10 leading-none");
    			add_location(p2, file$5, 18, 4, 540);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "bg-green-400 py-3 px-6 text-white font-bold uppercase text-xs\n      rounded hover:bg-blue-800 hover:text-white");
    			add_location(a, file$5, 21, 4, 634);
    			attr_dev(div0, "class", "md:w-1/2");
    			add_location(div0, file$5, 15, 2, 363);
    			attr_dev(div1, "class", "bg-cover bg-center rounded h-auto text-white py-24 px-16 object-fill");
    			set_style(div1, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
    			add_location(div1, file$5, 12, 0, 224);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoBanner",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoBanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoBanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Treeshaking safe.
    const MediaType = function MediaType() {};
    MediaType.NONE = 0;
    MediaType.AUDIO = 1;
    MediaType.VIDEO = 2;

    // Treeshaking safe.
    const PlayerState = function PlayerState() {};
    PlayerState.IDLE = 1;
    PlayerState.CUED = 2;
    PlayerState.PLAYING = 3;
    PlayerState.PAUSED = 4;
    PlayerState.BUFFERING = 5;
    PlayerState.ENDED = 6;

    // Treeshaking safe.
    const VideoQuality = function VideoQuality() {};
    VideoQuality.UNKNOWN = 0;
    VideoQuality.XXS = 144;
    VideoQuality.XS = 240;
    VideoQuality.S = 360;
    VideoQuality.M = 480;
    VideoQuality.L = 720;
    VideoQuality.XL = 1080;
    VideoQuality.XXL = 1440;
    VideoQuality.MAX = 2160;

    const currentPlayer = writable(null);

    // eslint-disable-next-line no-param-reassign
    const set_style$1 = (el, prop, value = null) => { if (el) el.style[prop] = value; };

    const is_null = (input) => input === null;
    const is_undefined = (input) => typeof input === 'undefined';
    const is_null_or_undefined = (input) => is_null(input) || is_undefined(input);

    const get_constructor = (input) => (
      !is_null_or_undefined(input) ? input.constructor : null
    );

    const is_object = (input) => get_constructor(input) === Object;
    const is_number = (input) => get_constructor(input) === Number && !Number.isNaN(input);
    const is_string = (input) => get_constructor(input) === String;
    const is_boolean = (input) => get_constructor(input) === Boolean;
    const is_function$1 = (input) => get_constructor(input) === Function;
    const is_array = (input) => Array.isArray(input);

    function try_parse_json(json, onFail) {
      try {
        return JSON.parse(json);
      } catch (e) {
        if (onFail) onFail(e);
        return null;
      }
    }

    const is_json_or_obj = (input) => {
      if (!input) return false;
      return is_object(input) || input.startsWith('{');
    };

    const obj_or_try_parse_json = (input) => {
      if (is_object(input)) return input;
      return try_parse_json(input);
    };

    /* eslint-disable max-len */

    const IS_CLIENT = typeof window !== 'undefined';
    const UA = (IS_CLIENT && window.navigator.userAgent.toLowerCase());
    const IS_IE = (UA && /msie|trident/.test(UA));
    const IS_IOS = (UA && /iphone|ipad|ipod|ios/.test(UA));
    const IS_ANDROID = (UA && /android/.test(UA));
    const IS_EDGE = (UA && UA.indexOf('edge/') > 0);
    const IS_CHROME = (UA && /chrome\/\d+/.test(UA) && !IS_EDGE);
    const IS_IPHONE = (IS_CLIENT && /(iPhone|iPod)/gi.test(navigator.platform));
    const IS_MOBILE = (IS_IOS || IS_ANDROID);

    /**
     * To detect autoplay, we create a video element and call play on it, if it is `paused` after
     * a `play()` call, autoplay is supported. Although this unintuitive, it works across browsers
     * and is currently the lightest way to detect autoplay without using a data source.
     *
     * @see https://github.com/ampproject/amphtml/blob/9bc8756536956780e249d895f3e1001acdee0bc0/src/utils/video.js#L25
     */
    const can_autoplay = (muted = true, playsinline = true) => {
      if (!IS_CLIENT) return false;

      const video = element('video');

      if (muted) {
        video.setAttribute('muted', '');
        video.muted = true;
      }

      if (playsinline) {
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.playsinline = true;
        video.webkitPlaysinline = true;
      }

      video.setAttribute('height', '0');
      video.setAttribute('width', '0');

      video.style.position = 'fixed';
      video.style.top = 0;
      video.style.width = 0;
      video.style.height = 0;
      video.style.opacity = 0;

      // Promise wrapped this way to catch both sync throws and async rejections.
      // More info: https://github.com/tc39/proposal-promise-try
      new Promise((resolve) => resolve(video.play())).catch(noop);

      return Promise.resolve(!video.paused);
    };

    const serialize_query_string = (params) => {
      const qs = [];
      const appendQueryParam = (param, v) => {
        qs.push(`${encodeURIComponent(param)}=${encodeURIComponent(v)}`);
      };
      Object.keys(params).forEach((param) => {
        const value = params[param];
        if (is_null_or_undefined(value)) return;
        if (is_array(value)) {
          value.forEach((v) => appendQueryParam(param, v));
        } else {
          appendQueryParam(param, value);
        }
      });
      return qs.join('&');
    };

    const apppend_querystring_to_url = (url, qs) => {
      if (!qs) return url;
      const mainAndQuery = url.split('?', 2);
      return mainAndQuery[0] + (mainAndQuery[1] ? `?${mainAndQuery[1]}&${qs}` : `?${qs}`);
    };

    const add_params_to_url = (
      url,
      params,
    ) => apppend_querystring_to_url(url, serialize_query_string(params));

    const prefetch = (rel, url, as) => {
      if (!IS_CLIENT) return false;
      const link = element('link');
      link.rel = rel;
      link.href = url;
      if (as) link.as = as;
      link.crossorigin = true;
      document.head.append(link);
      return true;
    };

    const decode_json = (data) => is_json_or_obj(data) && obj_or_try_parse_json(data);

    const create_prop = (
      object,
      key,
      descriptor,
    ) => Object.defineProperty(object, key, descriptor);

    const deferred = () => {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    const is_store = (store) => store && is_function$1(store.subscribe);

    const safe_get = (v) => (is_store(v) ? get_store_value(v) : v);

    // Private is "private" to the component who instantiates it, when it is exposed publically
    // the set method should be removed. The utility `make_private_stores_readonly` does exactly
    // this. This is also what `map_store_to_component` below uses.
    const make_store_private = (store) => ({
      ...store,
      private: true,
    });

    const add_condition_to_store = (store, condition) => ({
      ...store,
      set: (value) => { if (safe_get(condition)) store.set(value); },
      forceSet: store.set,
    });

    const private_writable = (initialValue) => make_store_private(writable(initialValue));

    const writable_if = (
      initialValue,
      condition,
    ) => add_condition_to_store(writable(initialValue), condition);

    const private_writable_if = (
      initialValue,
      condition,
    ) => make_store_private(writable_if(initialValue, condition));

    const indexable = (bounds) => {
      const store = writable(-1);
      return {
        ...store,
        subscribe: derived([store, bounds], ([$value, $bounds]) => {
          if (!$bounds || $bounds.length === 0) return -1;
          if ($value >= 0 && $value < $bounds.length) return $value;
          return -1;
        }).subscribe,
      };
    };

    const rangeable = (initialValue, lowerBound, upperBound) => {
      const store = writable(initialValue);
      return {
        ...store,
        set: (value) => {
          store.set(Math.max(safe_get(lowerBound), Math.min(value, safe_get(upperBound))));
        },
      };
    };

    const rangeable_if = (
      initialValue,
      lowerBound,
      upperBound,
      condition,
    ) => add_condition_to_store(rangeable(initialValue, lowerBound, upperBound), condition);

    const selectable = (initialValue, values) => {
      let newValue;
      const store = writable(initialValue);
      return {
        ...store,
        subscribe: derived([store, values], ([$value, $values]) => {
          if (!$values) { newValue = null; }
          if ($values.includes($value)) { newValue = $value; }
          return newValue;
        }).subscribe,
      };
    };

    const selectable_if = (
      initialValue,
      values,
      condition,
    ) => add_condition_to_store(selectable(initialValue, values), condition);

    const make_store_readonly = (store) => ({ subscribe: store.subscribe });

    const make_private_stores_readonly = (stores) => {
      const result = {};
      Object.keys(stores).forEach((name) => {
        const store = stores[name];
        result[name] = store.private ? make_store_readonly(store) : store;
      });
      return result;
    };

    const map_store_to_component = (comp, stores) => {
      let canWrite = {};
      const component = comp || get_current_component();

      create_prop(component, 'getStore', {
        get: () => () => make_private_stores_readonly(stores),
        configurable: true,
      });

      component.$$.on_destroy.push(() => {
        Object.keys(stores).forEach((prop) => { delete component[prop]; });
        delete component.getStore;
        canWrite = {};
      });

      const onUpdateProp = (prop, newValue, shouldFlush = false) => {
        if (!canWrite[prop] || !not_equal(get_store_value(stores[prop]), newValue)) return;
        stores[prop].set(newValue);
        if (shouldFlush) flush();
      };

      Object.keys(stores).forEach((prop) => {
        const store = stores[prop];
        canWrite[prop] = !!store.set && !store.private;
        create_prop(component, prop, {
          get: () => get_store_value(store),
          set: canWrite[prop] ? ((v) => { onUpdateProp(prop, v, true); }) : undefined,
          configurable: true,
        });
      });

      // onPropsChange
      return (props) => Object.keys(props).forEach((prop) => { onUpdateProp(prop, props[prop]); });
    };

    function vAspectRatio(node, initialAspectRatio) {
      const update = (newAspectRatio) => {
        if (!newAspectRatio) {
          set_style$1(node, 'paddingBottom');
          return;
        }
        const [width, height] = newAspectRatio.split(':');
        set_style$1(node, 'paddingBottom', `${(100 / width) * height}%`);
      };

      update(initialAspectRatio);

      return {
        update,
        destroy() {
          update(null);
        },
      };
    }

    // Player defaults used when the `src` changes or `resetStore` is called.
    const playerDefaults = () => ({
      paused: true,
      playing: false,
      seeking: false,
      rebuilding: false,
      internalTime: 0,
      currentTime: 0,
      title: '',
      duration: 0,
      buffered: 0,
      mediaId: null,
      currentSrc: null,
      buffering: false,
      videoQuality: VideoQuality.UNKNOWN,
      videoQualities: [],
      playbackRate: 1,
      playbackRates: [1],
      playbackStarted: false,
      playbackEnded: false,
      playbackReady: false,
      isLive: false,
      nativePoster: null,
      isControlsActive: true,
    });

    const resetStore = (store) => {
      const defaults = playerDefaults();
      Object.keys(defaults)
        .forEach((prop) => store[prop] && store[prop].set(defaults[prop]));
    };

    const fillStore = async (store) => {
      store.canAutoplay.set(await can_autoplay(false));
      store.canMutedAutoplay.set(await can_autoplay(true));
    };

    const buildStandardStore = (player) => {
      const store = {};
      const defaults = playerDefaults();

      store.playbackReady = private_writable(defaults.playbackReady);
      store.rebuilding = private_writable_if(defaults.rebuilding, store.playbackReady);
      store.canAutoplay = private_writable(false);
      store.canMutedAutoplay = private_writable(false);
      store.canInteract = derived(
        [store.playbackReady, store.rebuilding],
        ([$playbackReady, $rebuilding]) => $playbackReady && !$rebuilding,
      );

      // --------------------------------------------------------------
      // Native
      // --------------------------------------------------------------

      store.useNativeView = writable(true);
      store.useNativeControls = writable(true);
      store.useNativeCaptions = writable(true);
      store.nativePoster = private_writable(defaults.nativePoster);

      // --------------------------------------------------------------
      // Src
      // --------------------------------------------------------------

      store.src = writable(null);
      store.mediaId = private_writable(defaults.mediaId);
      store.poster = writable(null);
      store.provider = private_writable(null);
      store.providers = writable([]);
      store.providerConfig = writable({});
      store.providerVersion = writable('latest');
      store.origin = private_writable(null);
      store.title = private_writable(defaults.title);
      store.currentSrc = private_writable(defaults.currentSrc);

      store.Provider = derived(
        [store.src, store.providers],
        ([$src, $providers]) => $providers.find((p) => p.canPlay($src)),
      );

      store.canSetPoster = derived(
        store.provider,
        ($provider) => $provider && is_function$1($provider.setPoster),
      );

      // --------------------------------------------------------------
      // Metadata
      // --------------------------------------------------------------

      store.mediaType = private_writable(MediaType.NONE);
      store.isAudio = derived(store.mediaType, ($mediaType) => $mediaType === MediaType.AUDIO);
      store.isVideo = derived(store.mediaType, ($mediaType) => $mediaType === MediaType.VIDEO);
      store.isLive = private_writable(false);
      store.playbackRates = private_writable(defaults.playbackRates);
      store.videoQualities = private_writable(defaults.videoQualities);
      store.duration = private_writable(defaults.duration);

      // Used by @vime-js/complete.
      // eslint-disable-next-line no-underscore-dangle
      store._posterPlugin = writable(false);
      store.isVideoView = derived(
        // eslint-disable-next-line no-underscore-dangle
        [store.poster, store.nativePoster, store.canSetPoster, store._posterPlugin, store.isVideo],
        ([
          $poster,
          $nativePoster,
          $canSetPoster,
          $plugin,
          $isVideo,
        ]) => !!(($canSetPoster || $plugin) && ($poster || $nativePoster)) || $isVideo,
      );

      store.isVideoReady = derived(
        [store.playbackReady, store.isVideoView],
        ([$playbackReady, $isVideoView]) => $playbackReady && $isVideoView,
      );

      // --------------------------------------------------------------
      // Playback
      // --------------------------------------------------------------

      store.canSetPlaybackRate = derived(
        [store.provider, store.playbackRates],
        ([
          $provider,
          $playbackRates,
        ]) => $provider && $playbackRates.length > 1 && is_function$1($provider.setPlaybackRate),
      );

      store.canSetVideoQuality = derived(
        [store.provider, store.isVideo, store.videoQualities],
        ([$provider, $isVideo, $videoQualities]) => $provider
          && $isVideo
          && $videoQualities.length > 0
          && is_function$1($provider.setVideoQuality),
      );

      store.paused = writable(defaults.paused);
      store.playbackRate = selectable_if(
        defaults.playbackRate,
        store.playbackRates,
        store.canSetPlaybackRate,
      );
      store.videoQuality = selectable_if(
        defaults.videoQuality,
        store.videoQualities,
        store.canSetVideoQuality,
      );
      store.currentTime = rangeable(defaults.currentTime, 0, store.duration);
      store.internalTime = private_writable(defaults.internalTime);
      store.muted = writable(false);
      store.volume = rangeable_if(30, 0, 100, !IS_MOBILE);
      store.buffered = private_writable(defaults.buffered);
      store.isControlsEnabled = writable(true);
      store.isControlsActive = private_writable(defaults.isControlsActive);

      store.progress = derived(
        [store.currentTime, store.duration, store.buffered],
        ([$currentTime, $duration, $buffered]) => ({
          played: {
            seconds: $currentTime,
            percent: ($currentTime / $duration) * 100,
          },
          buffered: {
            seconds: $buffered,
            percent: ($buffered / $duration) * 100,
          },
        }),
      );

      // --------------------------------------------------------------
      // State
      // --------------------------------------------------------------

      store.playing = private_writable(defaults.playing);
      store.buffering = private_writable(defaults.buffering);
      store.playbackEnded = private_writable(defaults.playbackEnded);
      store.playbackStarted = private_writable(defaults.playbackStarted);
      store.seeking = private_writable(defaults.seeking);
      store.isPlayerActive = private_writable(false);

      store.state = derived(
        [
          store.playbackStarted,
          store.playbackEnded,
          store.paused,
          store.buffering,
          store.playbackReady,
        ],
        ([$playbackStarted, $playbackEnded, $paused, $buffering, $playbackReady]) => {
          if ($playbackEnded) {
            return PlayerState.ENDED;
          } if ($buffering) {
            return PlayerState.BUFFERING;
          } if ($playbackStarted && $paused) {
            return PlayerState.PAUSED;
          } if ($playbackStarted) {
            return PlayerState.PLAYING;
          } if ($playbackReady) {
            return PlayerState.CUED;
          }
          return PlayerState.IDLE;
        },
      );

      // --------------------------------------------------------------
      // Tracks
      // --------------------------------------------------------------

      store.canSetTracks = derived(
        store.provider,
        ($provider) => $provider && is_function$1($provider.setTracks),
      );

      // Don't block writing of `tracks` as it might be stored and used by a provider when possible.
      store.tracks = writable([]);

      store.canSetTrack = derived(
        [store.provider, store.tracks],
        ([$provider, $tracks]) => $provider
          && $tracks
          && $tracks.length > 0
          && is_function$1($provider.setTrack),
      );

      // Can't block current track with `canSetTrack` because it'll stop @vime-js/complete from updating
      // the value when a plugin is managing captions.
      store.currentTrackIndex = indexable(store.tracks);

      store.currentTrack = derived(
        [store.tracks, store.currentTrackIndex],
        ([$tracks, $index]) => (($index >= 0) ? $tracks[$index] : null),
      );

      store.isCaptionsActive = derived(
        [store.playbackReady, store.isAudio, store.currentTrackIndex],
        ([$playbackReady, $isAudio, $currentTrackIndex]) => $playbackReady
          && !$isAudio
          && ($currentTrackIndex !== -1),
      );

      // TODO: add cues support (cues, currentCueIndex, currentCue, activeCues).

      // --------------------------------------------------------------
      // Picture in Picture
      // --------------------------------------------------------------

      store.canSetPiP = derived(
        [store.isVideoReady, store.provider],
        ([$isVideoReady, $provider]) => $isVideoReady
          && $provider
          && $provider.supportsPiP()
          && is_function$1($provider.setPiP),
      );

      store.isPiPActive = private_writable(false);

      // --------------------------------------------------------------
      // Fullscreen
      // --------------------------------------------------------------

      // Set in the Player.
      store.canSetFullscreen = private_writable(false);
      store.isFullscreenActive = private_writable(false);

      // --------------------------------------------------------------
      // Options
      // --------------------------------------------------------------

      store.autopause = writable(true);
      store.aspectRatio = writable('16:9');
      store.playsinline = writable(true);
      store.autoplay = writable(false);
      store.loop = writable(false);

      fillStore(store);

      return {
        store,
        onPropsChange: map_store_to_component(player, store),
        resetStore: () => resetStore(store),
      };
    };

    /* node_modules/@vime-js/lite/src/Embed.svelte generated by Svelte v3.20.1 */
    const file$6 = "node_modules/@vime-js/lite/src/Embed.svelte";

    function create_fragment$7(ctx) {
    	let iframe_1;
    	let iframe_1_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			iframe_1 = element("iframe");
    			attr_dev(iframe_1, "id", /*id*/ ctx[3]);
    			attr_dev(iframe_1, "title", /*title*/ ctx[0]);
    			if (iframe_1.src !== (iframe_1_src_value = /*srcWithParams*/ ctx[2])) attr_dev(iframe_1, "src", iframe_1_src_value);
    			iframe_1.allowFullscreen = "1";
    			attr_dev(iframe_1, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			attr_dev(iframe_1, "class", "svelte-jism0y");
    			add_location(iframe_1, file$6, 2, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, iframe_1, anchor);
    			/*iframe_1_binding*/ ctx[18](iframe_1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window, "message", /*onMessage*/ ctx[4], false, false, false),
    				listen_dev(iframe_1, "load", /*load_handler*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) {
    				attr_dev(iframe_1, "title", /*title*/ ctx[0]);
    			}

    			if (dirty & /*srcWithParams*/ 4 && iframe_1.src !== (iframe_1_src_value = /*srcWithParams*/ ctx[2])) {
    				attr_dev(iframe_1, "src", iframe_1_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe_1);
    			/*iframe_1_binding*/ ctx[18](null);
    			run_all(dispose);
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

    let idCount = 0;
    const PRECONNECTED = [];

    function instance$7($$self, $$props, $$invalidate) {
    	let iframe = null;
    	let srcWithParams = null;

    	// eslint-disable-next-line prefer-const
    	idCount += 1;

    	const id = `vime-embed-${idCount}`;
    	const dispatch = createEventDispatcher();

    	const Event = {
    		SRC_CHANGE: "srcchange",
    		MESSAGE: "message",
    		DATA: "data",
    		REBUILD: "rebuild"
    	};

    	let { src = null } = $$props;
    	let { title = null } = $$props;
    	let { params = {} } = $$props;
    	let { origin = null } = $$props;
    	let { preconnections = [] } = $$props;
    	let { decoder = null } = $$props;
    	const getId = () => id;
    	const getIframe = () => iframe;
    	const getSrc = () => srcWithParams;

    	const postMessage = (message, target) => {
    		if (!iframe || !iframe.contentWindow) return;
    		iframe.contentWindow.postMessage(JSON.stringify(message), target || origin || "*");
    	};

    	const originMatches = e => {
    		if (!iframe || e.source !== iframe.contentWindow) return false;
    		return is_string(origin) && origin === e.origin;
    	};

    	const onMessage = e => {
    		if (!originMatches(e)) return;
    		dispatch(Event.MESSAGE, e);
    		const data = decoder ? decoder(e.data) : null;
    		if (data) dispatch(Event.DATA, data);
    	};

    	const writable_props = ["src", "title", "params", "origin", "preconnections", "decoder"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Embed> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Embed", $$slots, []);

    	function load_handler(event) {
    		bubble($$self, event);
    	}

    	function iframe_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, iframe = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("params" in $$props) $$invalidate(6, params = $$props.params);
    		if ("origin" in $$props) $$invalidate(7, origin = $$props.origin);
    		if ("preconnections" in $$props) $$invalidate(8, preconnections = $$props.preconnections);
    		if ("decoder" in $$props) $$invalidate(9, decoder = $$props.decoder);
    	};

    	$$self.$capture_state = () => ({
    		idCount,
    		PRECONNECTED,
    		createEventDispatcher,
    		is_string,
    		prefetch,
    		add_params_to_url,
    		iframe,
    		srcWithParams,
    		id,
    		dispatch,
    		Event,
    		src,
    		title,
    		params,
    		origin,
    		preconnections,
    		decoder,
    		getId,
    		getIframe,
    		getSrc,
    		postMessage,
    		originMatches,
    		onMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("iframe" in $$props) $$invalidate(1, iframe = $$props.iframe);
    		if ("srcWithParams" in $$props) $$invalidate(2, srcWithParams = $$props.srcWithParams);
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("params" in $$props) $$invalidate(6, params = $$props.params);
    		if ("origin" in $$props) $$invalidate(7, origin = $$props.origin);
    		if ("preconnections" in $$props) $$invalidate(8, preconnections = $$props.preconnections);
    		if ("decoder" in $$props) $$invalidate(9, decoder = $$props.decoder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*src, params*/ 96) {
    			 $$invalidate(2, srcWithParams = src ? add_params_to_url(src, params) : null);
    		}

    		if ($$self.$$.dirty & /*srcWithParams*/ 4) {
    			 dispatch(Event.SRC_CHANGE, srcWithParams);
    		}

    		if ($$self.$$.dirty & /*srcWithParams*/ 4) {
    			 if (srcWithParams) dispatch(Event.REBUILD);
    		}

    		if ($$self.$$.dirty & /*srcWithParams, iframe*/ 6) {
    			 if (srcWithParams && !iframe && !PRECONNECTED.includes(srcWithParams)) {
    				if (prefetch("preconnect", srcWithParams)) PRECONNECTED.push(srcWithParams);
    			}
    		}

    		if ($$self.$$.dirty & /*preconnections*/ 256) {
    			// TODO: improve preconnections
    			// @see https://github.com/ampproject/amphtml/blob/master/src/preconnect.js
    			 preconnections.filter(p => !PRECONNECTED.includes(p)).forEach(url => {
    				if (prefetch("preconnect", url)) PRECONNECTED.push(url);
    			});
    		}
    	};

    	return [
    		title,
    		iframe,
    		srcWithParams,
    		id,
    		onMessage,
    		src,
    		params,
    		origin,
    		preconnections,
    		decoder,
    		getId,
    		getIframe,
    		getSrc,
    		postMessage,
    		dispatch,
    		Event,
    		originMatches,
    		load_handler,
    		iframe_1_binding
    	];
    }

    class Embed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			src: 5,
    			title: 0,
    			params: 6,
    			origin: 7,
    			preconnections: 8,
    			decoder: 9,
    			getId: 10,
    			getIframe: 11,
    			getSrc: 12,
    			postMessage: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Embed",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get src() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get origin() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set origin(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preconnections() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preconnections(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get decoder() {
    		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set decoder(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getId() {
    		return this.$$.ctx[10];
    	}

    	set getId(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getIframe() {
    		return this.$$.ctx[11];
    	}

    	set getIframe(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSrc() {
    		return this.$$.ctx[12];
    	}

    	set getSrc(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get postMessage() {
    		return this.$$.ctx[13];
    	}

    	set postMessage(value) {
    		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@vime-js/lite/src/Lazy.svelte generated by Svelte v3.20.1 */
    const file$7 = "node_modules/@vime-js/lite/src/Lazy.svelte";
    const get_default_slot_changes = dirty => ({ intersecting: dirty & /*intersecting*/ 2 });
    const get_default_slot_context = ctx => ({ intersecting: /*intersecting*/ ctx[1] });

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1eigdsz");
    			add_location(div, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, intersecting*/ 10) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
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
    	let el;
    	let intersecting = false;
    	let { threshold = 0.75 } = $$props;

    	onMount(() => {
    		if (typeof IntersectionObserver !== "undefined") {
    			const observer = new IntersectionObserver(entries => {
    					$$invalidate(1, intersecting = entries[0].isIntersecting);
    					if (intersecting) observer.unobserve(el);
    				},
    			{ threshold });

    			observer.observe(el);
    			return () => observer.unobserve(el);
    		}

    		function onScroll() {
    			const rect = el.getBoundingClientRect();
    			$$invalidate(1, intersecting = rect.bottom > 0 && rect.right > 0 && rect.top * (1 + threshold) < window.innerHeight && rect.left < window.innerWidth);
    			if (intersecting) window.removeEventListener("scroll", onScroll);
    		}

    		window.addEventListener("scroll", onScroll);
    		return () => window.removeEventListener("scroll", onScroll);
    	});

    	const writable_props = ["threshold"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lazy> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Lazy", $$slots, ['default']);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, el = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("threshold" in $$props) $$invalidate(2, threshold = $$props.threshold);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onMount, el, intersecting, threshold });

    	$$self.$inject_state = $$props => {
    		if ("el" in $$props) $$invalidate(0, el = $$props.el);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("threshold" in $$props) $$invalidate(2, threshold = $$props.threshold);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [el, intersecting, threshold, $$scope, $$slots, div_binding];
    }

    class Lazy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { threshold: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lazy",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get threshold() {
    		throw new Error("<Lazy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Lazy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@vime-js/lite/src/PlayerWrapper.svelte generated by Svelte v3.20.1 */
    const file$8 = "node_modules/@vime-js/lite/src/PlayerWrapper.svelte";

    // (13:0) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if isEnabled}
    function create_if_block$1(ctx) {
    	let current;

    	const lazy = new Lazy({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ intersecting }) => ({ 7: intersecting }),
    						({ intersecting }) => intersecting ? 128 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(lazy.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lazy, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lazy_changes = {};

    			if (dirty & /*$$scope, el, isEnabled, aspectRatio, intersecting*/ 199) {
    				lazy_changes.$$scope = { dirty, ctx };
    			}

    			lazy.$set(lazy_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lazy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lazy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lazy, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(1:0) {#if isEnabled}",
    		ctx
    	});

    	return block;
    }

    // (3:4) {#if intersecting}
    function create_if_block_1(ctx) {
    	let div;
    	let vAspectRatio_action;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-rcny3m");
    			toggle_class(div, "bg", !is_null(/*aspectRatio*/ ctx[0]));
    			add_location(div, file$8, 3, 6, 71);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    			if (remount) dispose();
    			dispose = action_destroyer(vAspectRatio_action = vAspectRatio.call(null, div, /*isEnabled*/ ctx[1] ? /*aspectRatio*/ ctx[0] : null));
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}

    			if (vAspectRatio_action && is_function(vAspectRatio_action.update) && dirty & /*isEnabled, aspectRatio*/ 3) vAspectRatio_action.update.call(null, /*isEnabled*/ ctx[1] ? /*aspectRatio*/ ctx[0] : null);

    			if (dirty & /*is_null, aspectRatio*/ 1) {
    				toggle_class(div, "bg", !is_null(/*aspectRatio*/ ctx[0]));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(3:4) {#if intersecting}",
    		ctx
    	});

    	return block;
    }

    // (2:2) <Lazy let:intersecting>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*intersecting*/ ctx[7] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*intersecting*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(2:2) <Lazy let:intersecting>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isEnabled*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	const dispatch = createEventDispatcher();
    	let el;
    	let { aspectRatio = null } = $$props;
    	let { isEnabled = true } = $$props;
    	const writable_props = ["aspectRatio", "isEnabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerWrapper> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PlayerWrapper", $$slots, ['default']);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, el = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("aspectRatio" in $$props) $$invalidate(0, aspectRatio = $$props.aspectRatio);
    		if ("isEnabled" in $$props) $$invalidate(1, isEnabled = $$props.isEnabled);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		is_null,
    		vAspectRatio,
    		Lazy,
    		dispatch,
    		el,
    		aspectRatio,
    		isEnabled
    	});

    	$$self.$inject_state = $$props => {
    		if ("el" in $$props) $$invalidate(2, el = $$props.el);
    		if ("aspectRatio" in $$props) $$invalidate(0, aspectRatio = $$props.aspectRatio);
    		if ("isEnabled" in $$props) $$invalidate(1, isEnabled = $$props.isEnabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*el*/ 4) {
    			 if (el) dispatch("mount", el);
    		}
    	};

    	return [aspectRatio, isEnabled, el, dispatch, $$slots, div_binding, $$scope];
    }

    class PlayerWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { aspectRatio: 0, isEnabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerWrapper",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get aspectRatio() {
    		throw new Error("<PlayerWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aspectRatio(value) {
    		throw new Error("<PlayerWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isEnabled() {
    		throw new Error("<PlayerWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isEnabled(value) {
    		throw new Error("<PlayerWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@vime-js/lite/src/LitePlayer.svelte generated by Svelte v3.20.1 */

    // (3:0) <PlayerWrapper    {aspectRatio}    isEnabled={hasWrapper}  >
    function create_default_slot$1(ctx) {
    	let current;

    	let embed_1_props = {
    		params: /*params*/ ctx[0],
    		decoder: /*decoder*/ ctx[7],
    		preconnections: /*preconnections*/ ctx[8],
    		src: /*embedURL*/ ctx[5],
    		title: /*iframeTitle*/ ctx[6],
    		origin: /*origin*/ ctx[4]
    	};

    	const embed_1 = new Embed({ props: embed_1_props, $$inline: true });
    	/*embed_1_binding*/ ctx[30](embed_1);
    	embed_1.$on("load", /*load_handler*/ ctx[31]);
    	embed_1.$on("data", /*data_handler*/ ctx[32]);
    	embed_1.$on("message", /*message_handler*/ ctx[33]);
    	embed_1.$on("rebuild", /*rebuild_handler*/ ctx[34]);
    	embed_1.$on("load", /*onLoad*/ ctx[11]);

    	embed_1.$on("data", function () {
    		if (is_function(/*onData*/ ctx[9])) /*onData*/ ctx[9].apply(this, arguments);
    	});

    	embed_1.$on("srcchange", /*onReload*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(embed_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(embed_1, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const embed_1_changes = {};
    			if (dirty[0] & /*params*/ 1) embed_1_changes.params = /*params*/ ctx[0];
    			if (dirty[0] & /*decoder*/ 128) embed_1_changes.decoder = /*decoder*/ ctx[7];
    			if (dirty[0] & /*preconnections*/ 256) embed_1_changes.preconnections = /*preconnections*/ ctx[8];
    			if (dirty[0] & /*embedURL*/ 32) embed_1_changes.src = /*embedURL*/ ctx[5];
    			if (dirty[0] & /*iframeTitle*/ 64) embed_1_changes.title = /*iframeTitle*/ ctx[6];
    			if (dirty[0] & /*origin*/ 16) embed_1_changes.origin = /*origin*/ ctx[4];
    			embed_1.$set(embed_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(embed_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(embed_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*embed_1_binding*/ ctx[30](null);
    			destroy_component(embed_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(3:0) <PlayerWrapper    {aspectRatio}    isEnabled={hasWrapper}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current;

    	const playerwrapper = new PlayerWrapper({
    			props: {
    				aspectRatio: /*aspectRatio*/ ctx[2],
    				isEnabled: /*hasWrapper*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(playerwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(playerwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const playerwrapper_changes = {};
    			if (dirty[0] & /*aspectRatio*/ 4) playerwrapper_changes.aspectRatio = /*aspectRatio*/ ctx[2];
    			if (dirty[0] & /*hasWrapper*/ 2) playerwrapper_changes.isEnabled = /*hasWrapper*/ ctx[1];

    			if (dirty[0] & /*params, decoder, preconnections, embedURL, iframeTitle, origin, embed, onData*/ 1017 | dirty[1] & /*$$scope*/ 16) {
    				playerwrapper_changes.$$scope = { dirty, ctx };
    			}

    			playerwrapper.$set(playerwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playerwrapper, detaching);
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
    	const dispatch = createEventDispatcher();

    	const Event = {
    		READY: "ready",
    		TITLE_CHANGE: "titlechange",
    		ORIGIN_CHANGE: "originchange",
    		EMBED_URL_CHANGE: "embedurlchange",
    		ERROR: "error"
    	};

    	let embed;
    	let mediaTitle = null;
    	let ready = deferred();
    	let initialized = false;
    	let { src = null } = $$props;
    	let { params = {} } = $$props;
    	let { providers = [] } = $$props;
    	let { cookies = false } = $$props;
    	let { hasWrapper = true } = $$props;
    	let { aspectRatio = "16:9" } = $$props;
    	const getOrigin = () => origin;
    	const getEmbed = () => embed;
    	const getEmbedURL = () => embedURL;
    	const getTitle = () => mediaTitle;
    	const getProvider = () => Provider;
    	const getMediaId = () => Provider ? Provider.extractMediaId(src) : null;

    	const sendCommand = async (command, args, force) => {
    		if (!Provider) return;

    		try {
    			if (!force) {
    				await tick();
    				await ready.promise;
    			}

    			embed.postMessage(Provider.buildPostMessage(command, args));
    		} catch(e) {
    			
    		} /** noop */
    	};

    	const onReload = () => {
    		ready.promise.catch(noop);
    		ready.reject();
    		ready = deferred();
    		$$invalidate(24, initialized = false);

    		ready.promise.then(() => {
    			$$invalidate(24, initialized = true);
    			dispatch(Event.READY);
    		}).catch(e => {
    			dispatch(Event.ERROR, e);
    		});
    	};

    	const onSrcChange = () => {
    		$$invalidate(22, mediaTitle = null);
    	};

    	const onLoad = () => {
    		if (Provider) Provider.onLoad(embed);
    	};

    	const onDataHandler = e => {
    		const data = e.detail;
    		if (!data || !Provider) return;
    		Provider.resolveReadyState(data, ready, sendCommand);
    		if (!mediaTitle) $$invalidate(22, mediaTitle = Provider.extractMediaTitle(data));
    	};

    	onReload();
    	const writable_props = ["src", "params", "providers", "cookies", "hasWrapper", "aspectRatio"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LitePlayer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LitePlayer", $$slots, []);

    	function embed_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, embed = $$value);
    		});
    	}

    	function load_handler(event) {
    		bubble($$self, event);
    	}

    	function data_handler(event) {
    		bubble($$self, event);
    	}

    	function message_handler(event) {
    		bubble($$self, event);
    	}

    	function rebuild_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(12, src = $$props.src);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("providers" in $$props) $$invalidate(13, providers = $$props.providers);
    		if ("cookies" in $$props) $$invalidate(14, cookies = $$props.cookies);
    		if ("hasWrapper" in $$props) $$invalidate(1, hasWrapper = $$props.hasWrapper);
    		if ("aspectRatio" in $$props) $$invalidate(2, aspectRatio = $$props.aspectRatio);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		createEventDispatcher,
    		noop,
    		deferred,
    		Embed,
    		PlayerWrapper,
    		dispatch,
    		Event,
    		embed,
    		mediaTitle,
    		ready,
    		initialized,
    		src,
    		params,
    		providers,
    		cookies,
    		hasWrapper,
    		aspectRatio,
    		getOrigin,
    		getEmbed,
    		getEmbedURL,
    		getTitle,
    		getProvider,
    		getMediaId,
    		sendCommand,
    		onReload,
    		onSrcChange,
    		onLoad,
    		onDataHandler,
    		origin,
    		embedURL,
    		Provider,
    		iframeTitle,
    		decoder,
    		preconnections,
    		onData
    	});

    	$$self.$inject_state = $$props => {
    		if ("embed" in $$props) $$invalidate(3, embed = $$props.embed);
    		if ("mediaTitle" in $$props) $$invalidate(22, mediaTitle = $$props.mediaTitle);
    		if ("ready" in $$props) ready = $$props.ready;
    		if ("initialized" in $$props) $$invalidate(24, initialized = $$props.initialized);
    		if ("src" in $$props) $$invalidate(12, src = $$props.src);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("providers" in $$props) $$invalidate(13, providers = $$props.providers);
    		if ("cookies" in $$props) $$invalidate(14, cookies = $$props.cookies);
    		if ("hasWrapper" in $$props) $$invalidate(1, hasWrapper = $$props.hasWrapper);
    		if ("aspectRatio" in $$props) $$invalidate(2, aspectRatio = $$props.aspectRatio);
    		if ("origin" in $$props) $$invalidate(4, origin = $$props.origin);
    		if ("embedURL" in $$props) $$invalidate(5, embedURL = $$props.embedURL);
    		if ("Provider" in $$props) $$invalidate(25, Provider = $$props.Provider);
    		if ("iframeTitle" in $$props) $$invalidate(6, iframeTitle = $$props.iframeTitle);
    		if ("decoder" in $$props) $$invalidate(7, decoder = $$props.decoder);
    		if ("preconnections" in $$props) $$invalidate(8, preconnections = $$props.preconnections);
    		if ("onData" in $$props) $$invalidate(9, onData = $$props.onData);
    	};

    	let origin;
    	let embedURL;
    	let Provider;
    	let iframeTitle;
    	let decoder;
    	let preconnections;
    	let onData;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*src*/ 4096) {
    			 onSrcChange();
    		}

    		if ($$self.$$.dirty[0] & /*providers, src*/ 12288) {
    			 $$invalidate(25, Provider = providers.find(p => p.canPlay(src)));
    		}

    		if ($$self.$$.dirty[0] & /*Provider, cookies*/ 33570816) {
    			 $$invalidate(4, origin = Provider ? Provider.buildOrigin(cookies) : null);
    		}

    		if ($$self.$$.dirty[0] & /*Provider, src, cookies*/ 33574912) {
    			 $$invalidate(5, embedURL = Provider ? Provider.buildEmbedURL(src, cookies) : null);
    		}

    		if ($$self.$$.dirty[0] & /*Provider, mediaTitle*/ 37748736) {
    			 $$invalidate(6, iframeTitle = Provider && mediaTitle
    			? `${Provider.name} - ${mediaTitle || "Video Player"}`
    			: null);
    		}

    		if ($$self.$$.dirty[0] & /*Provider*/ 33554432) {
    			 $$invalidate(7, decoder = Provider ? Provider.decoder : null);
    		}

    		if ($$self.$$.dirty[0] & /*Provider*/ 33554432) {
    			 $$invalidate(8, preconnections = Provider ? Provider.preconnections : []);
    		}

    		if ($$self.$$.dirty[0] & /*initialized, mediaTitle*/ 20971520) {
    			 $$invalidate(9, onData = !initialized || !mediaTitle ? onDataHandler : null);
    		}

    		if ($$self.$$.dirty[0] & /*src*/ 4096) {
    			 dispatch(Event.SRC_CHANGE, src);
    		}

    		if ($$self.$$.dirty[0] & /*mediaTitle*/ 4194304) {
    			 dispatch(Event.TITLE_CHANGE, mediaTitle);
    		}

    		if ($$self.$$.dirty[0] & /*origin*/ 16) {
    			 dispatch(Event.ORIGIN_CHANGE, origin);
    		}

    		if ($$self.$$.dirty[0] & /*embedURL*/ 32) {
    			 dispatch(Event.EMBED_URL_CHANGE, embedURL);
    		}
    	};

    	return [
    		params,
    		hasWrapper,
    		aspectRatio,
    		embed,
    		origin,
    		embedURL,
    		iframeTitle,
    		decoder,
    		preconnections,
    		onData,
    		onReload,
    		onLoad,
    		src,
    		providers,
    		cookies,
    		getOrigin,
    		getEmbed,
    		getEmbedURL,
    		getTitle,
    		getProvider,
    		getMediaId,
    		sendCommand,
    		mediaTitle,
    		ready,
    		initialized,
    		Provider,
    		dispatch,
    		Event,
    		onSrcChange,
    		onDataHandler,
    		embed_1_binding,
    		load_handler,
    		data_handler,
    		message_handler,
    		rebuild_handler
    	];
    }

    class LitePlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				src: 12,
    				params: 0,
    				providers: 13,
    				cookies: 14,
    				hasWrapper: 1,
    				aspectRatio: 2,
    				getOrigin: 15,
    				getEmbed: 16,
    				getEmbedURL: 17,
    				getTitle: 18,
    				getProvider: 19,
    				getMediaId: 20,
    				sendCommand: 21
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LitePlayer",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get src() {
    		return this.$$.ctx[12];
    	}

    	set src(src) {
    		this.$set({ src });
    		flush();
    	}

    	get params() {
    		return this.$$.ctx[0];
    	}

    	set params(params) {
    		this.$set({ params });
    		flush();
    	}

    	get providers() {
    		return this.$$.ctx[13];
    	}

    	set providers(providers) {
    		this.$set({ providers });
    		flush();
    	}

    	get cookies() {
    		return this.$$.ctx[14];
    	}

    	set cookies(cookies) {
    		this.$set({ cookies });
    		flush();
    	}

    	get hasWrapper() {
    		return this.$$.ctx[1];
    	}

    	set hasWrapper(hasWrapper) {
    		this.$set({ hasWrapper });
    		flush();
    	}

    	get aspectRatio() {
    		return this.$$.ctx[2];
    	}

    	set aspectRatio(aspectRatio) {
    		this.$set({ aspectRatio });
    		flush();
    	}

    	get getOrigin() {
    		return this.$$.ctx[15];
    	}

    	set getOrigin(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getOrigin'");
    	}

    	get getEmbed() {
    		return this.$$.ctx[16];
    	}

    	set getEmbed(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getEmbed'");
    	}

    	get getEmbedURL() {
    		return this.$$.ctx[17];
    	}

    	set getEmbedURL(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getEmbedURL'");
    	}

    	get getTitle() {
    		return this.$$.ctx[18];
    	}

    	set getTitle(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getTitle'");
    	}

    	get getProvider() {
    		return this.$$.ctx[19];
    	}

    	set getProvider(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getProvider'");
    	}

    	get getMediaId() {
    		return this.$$.ctx[20];
    	}

    	set getMediaId(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'getMediaId'");
    	}

    	get sendCommand() {
    		return this.$$.ctx[21];
    	}

    	set sendCommand(value) {
    		throw new Error("<LitePlayer>: Cannot set read-only property 'sendCommand'");
    	}
    }

    const NAME = 'Vimeo';
    const ORIGIN = 'https://www.vimeo.com';
    const EMBED_ORIGIN = 'https://player.vimeo.com';
    const SRC = /vimeo(?:\.com|)\/([0-9]{9,})/;
    const FILE_URL = /vimeo\.com\/external\/[0-9]+\..+/;
    const THUMBNAIL_URL = /vimeocdn\.com\/video\/([0-9]+)/;
    const BLANK_SRC_ID = '390460225';

    const PRECONNECTIONS = [
      ORIGIN,
      'https://i.vimeocdn.com',
      'https://f.vimeocdn.com',
      'https://fresnel.vimeocdn.com',
    ];

    const DECODER = decode_json;

    const can_play = (src) => is_string(src) && !FILE_URL.test(src) && SRC.test(src);

    const extract_media_id = (src) => {
      const match = src ? src.match(SRC) : null;
      return match ? match[1] : null;
    };

    const build_embed_url = (src) => {
      const mediaId = extract_media_id(src);
      return `${EMBED_ORIGIN}/video/${mediaId || BLANK_SRC_ID}`;
    };

    const fetch_poster = (src) => {
      const url = build_embed_url(src);
      if (!url) return Promise.resolve(null);
      return window.fetch(`https://noembed.com/embed?url=${url}`)
        .then((response) => response.json())
        .then((data) => {
          const thumbnailId = data.thumbnail_url.match(THUMBNAIL_URL)[1];
          return `https://i.vimeocdn.com/video/${thumbnailId}_1920x1080.jpg`;
        });
    };

    var VimeoProvider = {
      name: NAME,
      decoder: DECODER,
      preconnections: PRECONNECTIONS,
      canPlay: can_play,
      buildEmbedURL: build_embed_url,
      extractMediaId: extract_media_id,
      onLoad: () => {},
      buildOrigin: () => EMBED_ORIGIN,
      buildPostMessage: (command, args) => ({
        method: command,
        value: args || '',
      }),
      resolveReadyState: (data, ready, sendCommand) => {
        const { event, data: payload } = data;
        if ((event === 'error') && payload && payload.method === 'ready') {
          const error = new Error(payload.message);
          error.name = payload.name;
          ready.reject(error);
        }
        if (event === 'ready') sendCommand('addEventListener', 'loaded', true);
        if (event === 'loaded') {
          ready.resolve();
          sendCommand('getVideoTitle', [], true);
        }
      },
      extractMediaTitle: (data) => {
        if (data.method === 'getVideoTitle') return data.value;
        return null;
      },
    };

    // @see https://github.com/videojs/video.js/blob/7.6.x/src/js/fullscreen-api.js

    const FullscreenApi = {
      prefixed: true,
    };

    const apiMap = [
      [
        'requestFullscreen',
        'exitFullscreen',
        'fullscreenElement',
        'fullscreenEnabled',
        'fullscreenchange',
        'fullscreenerror',
        'fullscreen',
      ],
      // WebKit
      [
        'webkitRequestFullscreen',
        'webkitExitFullscreen',
        'webkitFullscreenElement',
        'webkitFullscreenEnabled',
        'webkitfullscreenchange',
        'webkitfullscreenerror',
        '-webkit-full-screen',
      ],
      // Mozilla
      [
        'mozRequestFullScreen',
        'mozCancelFullScreen',
        'mozFullScreenElement',
        'mozFullScreenEnabled',
        'mozfullscreenchange',
        'mozfullscreenerror',
        '-moz-full-screen',
      ],
      // Microsoft
      [
        'msRequestFullscreen',
        'msExitFullscreen',
        'msFullscreenElement',
        'msFullscreenEnabled',
        'MSFullscreenChange',
        'MSFullscreenError',
        '-ms-fullscreen',
      ],
    ];

    const specApi = apiMap[0];
    let browserApi;

    // Determine the supported set of functions.
    for (let i = 0; i < apiMap.length; i += 1) {
      // Check for exitFullscreen function.
      if (apiMap[i][1] in document) {
        browserApi = apiMap[i];
        break;
      }
    }

    // Map the browser API names to the spec API names.
    if (browserApi) {
      for (let i = 0; i < browserApi.length; i += 1) {
        FullscreenApi[specApi[i]] = browserApi[i];
      }

      FullscreenApi.prefixed = browserApi[0] !== specApi[0];
    }

    /* node_modules/@vime-js/standard/src/StandardPlayer.svelte generated by Svelte v3.20.1 */

    // (3:0) <PlayerWrapper   isEnabled={hasWrapper}   aspectRatio={($isVideoView && !$isFullscreenActive) ? $aspectRatio : null}   on:mount="{(e) => { playerWrapper = e.detail; }}" >
    function create_default_slot$2(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*props*/ ctx[2],
    		{ src: /*$src*/ ctx[5] },
    		{ config: /*$providerConfig*/ ctx[9] },
    		{ version: /*$providerVersion*/ ctx[10] }
    	];

    	var switch_value = /*$Provider*/ ctx[6] && /*$Provider*/ ctx[6].default;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		/*switch_instance_binding*/ ctx[150](switch_instance);
    		switch_instance.$on("update", /*onUpdate*/ ctx[57]);
    		switch_instance.$on("error", /*error_handler*/ ctx[151]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*props, $src, $providerConfig, $providerVersion*/ 1572)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*props*/ 4 && get_spread_object(/*props*/ ctx[2]),
    					dirty[0] & /*$src*/ 32 && { src: /*$src*/ ctx[5] },
    					dirty[0] & /*$providerConfig*/ 512 && { config: /*$providerConfig*/ ctx[9] },
    					dirty[0] & /*$providerVersion*/ 1024 && { version: /*$providerVersion*/ ctx[10] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*$Provider*/ ctx[6] && /*$Provider*/ ctx[6].default)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					/*switch_instance_binding*/ ctx[150](switch_instance);
    					switch_instance.$on("update", /*onUpdate*/ ctx[57]);
    					switch_instance.$on("error", /*error_handler*/ ctx[151]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    			/*switch_instance_binding*/ ctx[150](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(3:0) <PlayerWrapper   isEnabled={hasWrapper}   aspectRatio={($isVideoView && !$isFullscreenActive) ? $aspectRatio : null}   on:mount=\\\"{(e) => { playerWrapper = e.detail; }}\\\" >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current;

    	const playerwrapper = new PlayerWrapper({
    			props: {
    				isEnabled: /*hasWrapper*/ ctx[0],
    				aspectRatio: /*$isVideoView*/ ctx[8] && !/*$isFullscreenActive*/ ctx[4]
    				? /*$aspectRatio*/ ctx[7]
    				: null,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	playerwrapper.$on("mount", /*mount_handler*/ ctx[152]);

    	const block = {
    		c: function create() {
    			create_component(playerwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(playerwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const playerwrapper_changes = {};
    			if (dirty[0] & /*hasWrapper*/ 1) playerwrapper_changes.isEnabled = /*hasWrapper*/ ctx[0];

    			if (dirty[0] & /*$isVideoView, $isFullscreenActive, $aspectRatio*/ 400) playerwrapper_changes.aspectRatio = /*$isVideoView*/ ctx[8] && !/*$isFullscreenActive*/ ctx[4]
    			? /*$aspectRatio*/ ctx[7]
    			: null;

    			if (dirty[0] & /*$Provider, props, $src, $providerConfig, $providerVersion, $provider*/ 1644 | dirty[4] & /*$$scope*/ 536870912) {
    				playerwrapper_changes.$$scope = { dirty, ctx };
    			}

    			playerwrapper.$set(playerwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playerwrapper, detaching);
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

    const NO_PIP_SUPPORT_ERROR_MSG = "Provider does not support PiP.";
    const VIDEO_NOT_READY_ERROR_MSG = "Action not supported, must be a video that is ready for playback.";
    const FULLSCREEN_NOT_SUPPORTED_ERROR_MSG = "Fullscreen not supported.";

    function instance$b($$self, $$props, $$invalidate) {
    	let $currentPlayer;
    	let $isPlayerActive;
    	let $playbackReady;
    	let $canMutedAutoplay;
    	let $playsinline;
    	let $playbackEnded;
    	let $internalTime;
    	let $currentTime;
    	let $provider;
    	let $paused;
    	let $seeking;
    	let $canInteract;
    	let $buffered;
    	let $playbackStarted;
    	let $buffering;
    	let $duration;
    	let $autoplay;
    	let $rebuilding;
    	let $canAutoplay;
    	let $muted;
    	let $isFullscreenActive;
    	let $autopause;
    	let $playing;
    	let $volume;
    	let $useNativeCaptions;
    	let $tracks;
    	let $currentTrackIndex;
    	let $isPiPActive;
    	let $src;
    	let $Provider;
    	let $canSetPoster;
    	let $useNativeControls;
    	let $poster;
    	let $aspectRatio;
    	let $useNativeView;
    	let $isControlsEnabled;
    	let $canSetPlaybackRate;
    	let $playbackRate;
    	let $canSetVideoQuality;
    	let $videoQuality;
    	let $canSetTracks;
    	let $canSetTrack;
    	let $isVideoReady;
    	let $canSetPiP;
    	let $isVideoView;
    	let $providerConfig;
    	let $providerVersion;
    	validate_store(currentPlayer, "currentPlayer");
    	component_subscribe($$self, currentPlayer, $$value => $$invalidate(75, $currentPlayer = $$value));
    	let self = get_current_component();
    	let { _standardStore = null } = $$props;
    	let onPropsChange = noop;

    	if (is_null(_standardStore)) {
    		_standardStore = buildStandardStore(self);
    		({ onPropsChange } = _standardStore);
    	}

    	const { store, resetStore } = _standardStore;
    	const { playsinline, paused, muted, playbackEnded, volume, seeking, internalTime, currentTime, isPiPActive, playbackRate, videoQuality, src, isControlsEnabled, aspectRatio, buffering, buffered, autopause, autoplay, playing, playbackStarted, poster, playbackReady, isVideoView, tracks, currentTrackIndex, provider, rebuilding, isVideoReady, canInteract, isFullscreenActive, useNativeView, useNativeControls, useNativeCaptions, duration, Provider, isPlayerActive, providerConfig, providerVersion } = store;
    	validate_store(playsinline, "playsinline");
    	component_subscribe($$self, playsinline, value => $$invalidate(79, $playsinline = value));
    	validate_store(paused, "paused");
    	component_subscribe($$self, paused, value => $$invalidate(83, $paused = value));
    	validate_store(muted, "muted");
    	component_subscribe($$self, muted, value => $$invalidate(93, $muted = value));
    	validate_store(playbackEnded, "playbackEnded");
    	component_subscribe($$self, playbackEnded, value => $$invalidate(80, $playbackEnded = value));
    	validate_store(volume, "volume");
    	component_subscribe($$self, volume, value => $$invalidate(96, $volume = value));
    	validate_store(seeking, "seeking");
    	component_subscribe($$self, seeking, value => $$invalidate(84, $seeking = value));
    	validate_store(internalTime, "internalTime");
    	component_subscribe($$self, internalTime, value => $$invalidate(81, $internalTime = value));
    	validate_store(currentTime, "currentTime");
    	component_subscribe($$self, currentTime, value => $$invalidate(82, $currentTime = value));
    	validate_store(isPiPActive, "isPiPActive");
    	component_subscribe($$self, isPiPActive, value => $$invalidate(100, $isPiPActive = value));
    	validate_store(playbackRate, "playbackRate");
    	component_subscribe($$self, playbackRate, value => $$invalidate(107, $playbackRate = value));
    	validate_store(videoQuality, "videoQuality");
    	component_subscribe($$self, videoQuality, value => $$invalidate(109, $videoQuality = value));
    	validate_store(src, "src");
    	component_subscribe($$self, src, value => $$invalidate(5, $src = value));
    	validate_store(isControlsEnabled, "isControlsEnabled");
    	component_subscribe($$self, isControlsEnabled, value => $$invalidate(105, $isControlsEnabled = value));
    	validate_store(aspectRatio, "aspectRatio");
    	component_subscribe($$self, aspectRatio, value => $$invalidate(7, $aspectRatio = value));
    	validate_store(buffering, "buffering");
    	component_subscribe($$self, buffering, value => $$invalidate(88, $buffering = value));
    	validate_store(buffered, "buffered");
    	component_subscribe($$self, buffered, value => $$invalidate(86, $buffered = value));
    	validate_store(autopause, "autopause");
    	component_subscribe($$self, autopause, value => $$invalidate(94, $autopause = value));
    	validate_store(autoplay, "autoplay");
    	component_subscribe($$self, autoplay, value => $$invalidate(90, $autoplay = value));
    	validate_store(playing, "playing");
    	component_subscribe($$self, playing, value => $$invalidate(95, $playing = value));
    	validate_store(playbackStarted, "playbackStarted");
    	component_subscribe($$self, playbackStarted, value => $$invalidate(87, $playbackStarted = value));
    	validate_store(poster, "poster");
    	component_subscribe($$self, poster, value => $$invalidate(103, $poster = value));
    	validate_store(playbackReady, "playbackReady");
    	component_subscribe($$self, playbackReady, value => $$invalidate(77, $playbackReady = value));
    	validate_store(isVideoView, "isVideoView");
    	component_subscribe($$self, isVideoView, value => $$invalidate(8, $isVideoView = value));
    	validate_store(tracks, "tracks");
    	component_subscribe($$self, tracks, value => $$invalidate(98, $tracks = value));
    	validate_store(currentTrackIndex, "currentTrackIndex");
    	component_subscribe($$self, currentTrackIndex, value => $$invalidate(99, $currentTrackIndex = value));
    	validate_store(provider, "provider");
    	component_subscribe($$self, provider, value => $$invalidate(3, $provider = value));
    	validate_store(rebuilding, "rebuilding");
    	component_subscribe($$self, rebuilding, value => $$invalidate(91, $rebuilding = value));
    	validate_store(isVideoReady, "isVideoReady");
    	component_subscribe($$self, isVideoReady, value => $$invalidate(112, $isVideoReady = value));
    	validate_store(canInteract, "canInteract");
    	component_subscribe($$self, canInteract, value => $$invalidate(85, $canInteract = value));
    	validate_store(isFullscreenActive, "isFullscreenActive");
    	component_subscribe($$self, isFullscreenActive, value => $$invalidate(4, $isFullscreenActive = value));
    	validate_store(useNativeView, "useNativeView");
    	component_subscribe($$self, useNativeView, value => $$invalidate(104, $useNativeView = value));
    	validate_store(useNativeControls, "useNativeControls");
    	component_subscribe($$self, useNativeControls, value => $$invalidate(102, $useNativeControls = value));
    	validate_store(useNativeCaptions, "useNativeCaptions");
    	component_subscribe($$self, useNativeCaptions, value => $$invalidate(97, $useNativeCaptions = value));
    	validate_store(duration, "duration");
    	component_subscribe($$self, duration, value => $$invalidate(89, $duration = value));
    	validate_store(Provider, "Provider");
    	component_subscribe($$self, Provider, value => $$invalidate(6, $Provider = value));
    	validate_store(isPlayerActive, "isPlayerActive");
    	component_subscribe($$self, isPlayerActive, value => $$invalidate(76, $isPlayerActive = value));
    	validate_store(providerConfig, "providerConfig");
    	component_subscribe($$self, providerConfig, value => $$invalidate(9, $providerConfig = value));
    	validate_store(providerVersion, "providerVersion");
    	component_subscribe($$self, providerVersion, value => $$invalidate(10, $providerVersion = value));
    	const { canSetPiP, canSetTracks, canSetTrack, canAutoplay, canMutedAutoplay, canSetPoster, canSetPlaybackRate, canSetVideoQuality } = store;
    	validate_store(canSetPiP, "canSetPiP");
    	component_subscribe($$self, canSetPiP, value => $$invalidate(113, $canSetPiP = value));
    	validate_store(canSetTracks, "canSetTracks");
    	component_subscribe($$self, canSetTracks, value => $$invalidate(110, $canSetTracks = value));
    	validate_store(canSetTrack, "canSetTrack");
    	component_subscribe($$self, canSetTrack, value => $$invalidate(111, $canSetTrack = value));
    	validate_store(canAutoplay, "canAutoplay");
    	component_subscribe($$self, canAutoplay, value => $$invalidate(92, $canAutoplay = value));
    	validate_store(canMutedAutoplay, "canMutedAutoplay");
    	component_subscribe($$self, canMutedAutoplay, value => $$invalidate(78, $canMutedAutoplay = value));
    	validate_store(canSetPoster, "canSetPoster");
    	component_subscribe($$self, canSetPoster, value => $$invalidate(101, $canSetPoster = value));
    	validate_store(canSetPlaybackRate, "canSetPlaybackRate");
    	component_subscribe($$self, canSetPlaybackRate, value => $$invalidate(106, $canSetPlaybackRate = value));
    	validate_store(canSetVideoQuality, "canSetVideoQuality");
    	component_subscribe($$self, canSetVideoQuality, value => $$invalidate(108, $canSetVideoQuality = value));
    	let playerWrapper;
    	let { parentEl = null } = $$props;
    	let { hasWrapper = true } = $$props;
    	const tick$1 = () => tick();

    	// Filter out any player props before passing them to the provider.
    	const props = {};

    	onDestroy(() => {
    		if ($currentPlayer === self) set_store_value(currentPlayer, $currentPlayer = null);
    		$$invalidate(65, self = null);
    	});

    	if (is_null($currentPlayer)) set_store_value(currentPlayer, $currentPlayer = self);

    	// --------------------------------------------------------------
    	// Provider Events
    	// --------------------------------------------------------------
    	// Temporary states used to normalize player differences.
    	let tempMute = false;

    	let tempPlay = false;
    	let tempPause = false;
    	let tempControls = false;
    	let updatingVolume = false;
    	let updatingTime = false;

    	const cancelTempAction = async cb => {
    		// Give some time for the provider to be set to it's original value before we receive
    		// event updates.
    		await tick();

    		setTimeout(
    			() => {
    				cb();
    			},
    			100
    		);
    	};

    	const initiateTempPlayback = () => {
    		if (!$playbackReady || !$canMutedAutoplay) return;
    		$$invalidate(67, tempMute = true);
    		$$invalidate(68, tempPlay = true);
    		set_store_value(playsinline, $playsinline = true);
    	};

    	const onRestart = () => {
    		if (get_store_value(store.live) || !$playbackEnded) return;
    		set_store_value(internalTime, $internalTime = 0);
    		set_store_value(currentTime, $currentTime = 0);
    		set_store_value(playbackEnded, $playbackEnded = false);
    		$provider.setCurrentTime(0);
    		set_store_value(paused, $paused = false);
    	};

    	const onTimeUpdate = time => {
    		if ($seeking || updatingTime || !$canInteract) return;
    		set_store_value(internalTime, $internalTime = time);
    		set_store_value(currentTime, $currentTime = time);
    		if ($internalTime === 0 && $playbackEnded) onRestart();
    	};

    	afterUpdate(() => {
    		if (!$playbackReady || $seeking || $currentTime === $internalTime) return;
    		set_store_value(internalTime, $internalTime = $currentTime);
    		$provider.setCurrentTime($currentTime);
    		updatingTime = true;
    	});

    	const checkIfBuffering = () => {
    		if ($buffered < $currentTime || $playbackStarted && $buffered === 0) {
    			set_store_value(buffering, $buffering = true);
    		}
    	};

    	const checkHasSeeked = () => {
    		if (!$seeking || $buffered <= $currentTime && $currentTime < $duration) return;
    		set_store_value(seeking, $seeking = false);
    		set_store_value(buffering, $buffering = false);
    		updatingTime = false;

    		if (!$playbackStarted) {
    			set_store_value(playbackStarted, $playbackStarted = true);
    			if ($currentTime === $duration) set_store_value(currentTime, $currentTime = 0);
    		}

    		if ($playbackEnded) set_store_value(playbackEnded, $playbackEnded = false);

    		cancelTempAction(() => {
    			$$invalidate(69, tempPause = false);
    		});
    	};

    	const onAutoplay = () => {
    		if (!$autoplay || $rebuilding || $currentTime > 0 || (!$canAutoplay || !$canMutedAutoplay)) return;
    		set_store_value(paused, $paused = false);
    		set_store_value(playsinline, $playsinline = true);
    		if (!$canAutoplay) set_store_value(muted, $muted = true);
    	};

    	const onRebuildStart = () => {
    		if (!$playbackReady) return;
    		set_store_value(rebuilding, $rebuilding = true);
    		set_store_value(buffering, $buffering = true);
    	};

    	const onRebuildEnd = async () => {
    		if (!$playbackReady || !$rebuilding) return;
    		if ($currentTime > 0) $provider.setCurrentTime($currentTime);
    		await tick();
    		set_store_value(rebuilding, $rebuilding = false);

    		// eslint-disable-next-line no-use-before-define
    		if ($isFullscreenActive) requestFullscreen().catch(noop);
    	};

    	const onRebuild = async () => {
    		if (!$playbackReady) return;

    		// Cancel any existing temp states as rebuild may be called multiple times.
    		$$invalidate(67, tempMute = false);

    		$$invalidate(68, tempPlay = false);
    		await tick();

    		if ($currentTime > 0 && $canMutedAutoplay) {
    			initiateTempPlayback();
    			return;
    		}

    		onRebuildEnd();
    	};

    	const onPlaybackReady = async () => {
    		// Wait incase of any sudden src changes.
    		await tick();

    		set_store_value(playbackReady, $playbackReady = true);
    		set_store_value(buffering, $buffering = false);
    		onRebuild();
    	};

    	const onAutopause = () => {
    		if (!$autopause || !$currentPlayer || $currentPlayer === self) return;
    		set_store_value(currentPlayer, $currentPlayer.paused = true, $currentPlayer);
    	};

    	// If a provider fires a `pause` event before `seeking` we cancel it to not mess
    	// with our internal paused state.
    	let firePauseTimer;

    	const onPause = () => {
    		firePauseTimer = window.setTimeout(
    			() => {
    				if (tempPause) return;
    				set_store_value(paused, $paused = true);
    				set_store_value(buffering, $buffering = false);
    				set_store_value(playing, $playing = false);
    			},
    			100
    		);
    	};

    	const onVolumeChange = newVolume => {
    		set_store_value(volume, $volume = newVolume);
    		$$invalidate(71, updatingVolume = true);
    	};

    	const onBuffered = progress => {
    		if (progress) set_store_value(buffered, $buffered = progress);
    		if ($seeking) checkHasSeeked();
    	};

    	const onSeeking = () => {
    		if ($seeking) return;
    		window.clearTimeout(firePauseTimer);
    		set_store_value(seeking, $seeking = true);
    		checkIfBuffering();

    		!$playbackStarted
    		? initiateTempPlayback()
    		: $$invalidate(69, tempPause = true);
    	};

    	const onSeeked = async () => {
    		if (!$seeking) return;

    		// Wait incase `seeking` and `seeked` are fired immediately after each other.
    		await tick();

    		onBuffered($buffered);
    	};

    	const onPlay = () => {
    		set_store_value(paused, $paused = false);
    		checkIfBuffering();
    	};

    	const onPlaying = () => {
    		set_store_value(buffering, $buffering = false);
    		set_store_value(playbackStarted, $playbackStarted = true);
    		onSeeked();
    		onAutopause();
    		set_store_value(currentPlayer, $currentPlayer = self);

    		if (!tempPlay) {
    			set_store_value(paused, $paused = false);
    			set_store_value(playing, $playing = true);
    		}

    		$provider.setPaused($paused);
    		$provider.setMuted($muted);

    		cancelTempAction(() => {
    			$$invalidate(68, tempPlay = false);
    			$$invalidate(67, tempMute = false);
    		});

    		onRebuildEnd();
    	};

    	const onLoop = async () => {
    		if (get_store_value(store.live) || !get_store_value(store.loop)) return;
    		await tick();
    		onRestart();
    	};

    	const onPlaybackEnd = () => {
    		set_store_value(playbackEnded, $playbackEnded = true);
    		set_store_value(paused, $paused = true);
    		onLoop();
    	};

    	const onStateChange = async state => {
    		await tick();

    		switch (state) {
    			case PlayerState.CUED:
    				onPlaybackReady();
    				break;
    			case PlayerState.PAUSED:
    				if ($rebuilding) return;
    				onPause();
    				break;
    			case PlayerState.BUFFERING:
    				set_store_value(buffering, $buffering = true);
    				break;
    			case PlayerState.PLAYING:
    				onPlaying();
    				break;
    			case PlayerState.ENDED:
    				onPlaybackEnd();
    				break;
    		}
    	};

    	// TODO: this is basically a crappy reducer.
    	const onUpdate = e => {
    		const info = e.detail;
    		if (info.state) onStateChange(info.state);
    		if (info.play && !tempPlay) onPlay();
    		if (info.rebuild) onRebuildStart();
    		if ($rebuilding) return;
    		if (is_null(info.poster) || info.poster) store.nativePoster.set(info.poster);
    		if (is_boolean(info.isLive)) store.isLive.set(info.isLive);
    		if (is_number(info.duration)) set_store_value(duration, $duration = parseFloat(info.duration));
    		if (is_number(info.currentTime)) onTimeUpdate(parseFloat(info.currentTime));
    		if (is_number(info.buffered)) onBuffered(parseFloat(info.buffered));
    		if (info.seeking) onSeeking();
    		if (info.seeked) onSeeked();
    		if (is_number(info.mediaType)) store.mediaType.set(info.mediaType);
    		if (info.title) store.title.set(info.title);
    		if (info.currentSrc) store.currentSrc.set(info.currentSrc);
    		if (info.mediaId) store.mediaId.set(info.mediaId);
    		if (is_number(info.volume)) onVolumeChange(parseInt(info.volume, 10));
    		if (is_boolean(info.muted) && !tempMute) set_store_value(muted, $muted = info.muted);
    		if (info.origin) store.origin.set(info.origin);
    		if (is_number(info.videoQuality)) store.videoQuality.forceSet(info.videoQuality);
    		if (info.videoQualities) store.videoQualities.set(info.videoQualities);
    		if (info.playbackRate) store.playbackRate.forceSet(info.playbackRate);
    		if (info.playbackRates) store.playbackRates.set(info.playbackRates);

    		if ($useNativeCaptions) {
    			if (info.tracks) set_store_value(tracks, $tracks = info.tracks);
    			if (is_number(info.currentTrackIndex)) set_store_value(currentTrackIndex, $currentTrackIndex = info.currentTrackIndex);
    		}

    		if (is_boolean(info.pip)) set_store_value(isPiPActive, $isPiPActive = info.pip);

    		// eslint-disable-next-line no-use-before-define
    		if (is_boolean(info.fullscreen)) onFullscreenChange(info.fullscreen);
    	};

    	const onSrcChange = () => {
    		resetStore();

    		// TODO: what if provider can't play the src? Need to stop buffering.
    		if ($src && $Provider) set_store_value(buffering, $buffering = true);

    		updatingTime = false;
    		$$invalidate(68, tempPlay = false);
    		$$invalidate(68, tempPlay = false);
    		$$invalidate(67, tempMute = false);
    		$$invalidate(70, tempControls = false);
    	};

    	const onProviderChange = () => {
    		onSrcChange();
    		store.origin.set(null);
    		store.isPiPActive.set(false);

    		// eslint-disable-next-line no-use-before-define
    		if ($isFullscreenActive) exitFullscreen().catch(noop);

    		if (!$Provider) store.mediaType.set(MediaType.NONE);
    	};

    	const pipRequest = active => {
    		if (!$isVideoReady) {
    			return Promise.reject(VIDEO_NOT_READY_ERROR_MSG);
    		}

    		if (!$canSetPiP) {
    			return Promise.reject(NO_PIP_SUPPORT_ERROR_MSG);
    		}

    		return Promise.resolve($provider.setPiP(active));
    	};

    	const requestPiP = () => pipRequest(true);
    	const exitPiP = () => pipRequest(false);
    	const FULLSCREEN_DOC_SUPPORT = !!FullscreenApi.requestFullscreen;
    	let fsDispose = [];

    	const isFullscreen = () => {
    		const els = [playerWrapper, parentEl, $provider && $provider.getEl()].filter(Boolean);
    		let isActive = els.includes(document[FullscreenApi.fullscreenElement]);
    		if (!isActive) isActive = els.some(el => el.matches && el.matches(`:${FullscreenApi.fullscreen}`));
    		return isActive;
    	};

    	const onDocumentFullscreenChange = () => {
    		set_store_value(isFullscreenActive, $isFullscreenActive = isFullscreen());
    	};

    	const onFullscreenChange = isActive => {
    		set_store_value(isFullscreenActive, $isFullscreenActive = isActive);
    		if (!$isFullscreenActive) $$invalidate(70, tempControls = false);
    		$$invalidate(69, tempPause = false);

    		// iOS pauses the video when exiting fullscreen.
    		if (!$paused) {
    			setTimeout(
    				() => {
    					$provider.setPaused(false);
    				},
    				300
    			);
    		}
    	};

    	const requestDocumentFullscreen = shouldEnter => {
    		const el = parentEl || playerWrapper;
    		if (!el || !shouldEnter && !isFullscreen()) return Promise.reject();
    		if (shouldEnter && isFullscreen()) return Promise.resolve();

    		const request = shouldEnter
    		? el[FullscreenApi.requestFullscreen]()
    		: document[FullscreenApi.exitFullscreen]();

    		return Promise.resolve(request);
    	};

    	// TODO: the two providers which can set fullscreen at the moment (File/Dailymotion) don't
    	// require a rebuild when enabling controls, if at some point a provider does this won't work.
    	const requestProviderFullscreen = shouldEnter => {
    		if (shouldEnter) $$invalidate(70, tempControls = true);
    		$$invalidate(69, tempPause = true);
    		return Promise.resolve($provider.setFullscreen(shouldEnter));
    	};

    	const fullscreenRequest = shouldEnter => {
    		if (!$isVideoReady) {
    			return Promise.reject(VIDEO_NOT_READY_ERROR_MSG);
    		}

    		if (FULLSCREEN_DOC_SUPPORT) {
    			return requestDocumentFullscreen(shouldEnter);
    		}

    		if (canProviderFullscreen) {
    			return requestProviderFullscreen(shouldEnter);
    		}

    		return Promise.reject(FULLSCREEN_NOT_SUPPORTED_ERROR_MSG);
    	};

    	const requestFullscreen = () => fullscreenRequest(true);
    	const exitFullscreen = () => fullscreenRequest(false);

    	onMount(() => {
    		if (!FULLSCREEN_DOC_SUPPORT) return;
    		fsDispose.push(listen(document, FullscreenApi.fullscreenchange, onDocumentFullscreenChange));

    		/* *
     * We have to listen to this on webkit, because no `fullscreenchange` event is fired when the
     * video element enters or exits fullscreen by:
     *
     *  1. The native Html5 fullscreen video control.
     *  2. Calling requestFullscreen from the video element directly.
     *  3. Calling requestFullscreen inside an iframe.
     * */
    		if (document.webkitExitFullscreen) {
    			fsDispose.push(listen(document, "webkitfullscreenchange", onDocumentFullscreenChange));
    		}
    	});

    	onDestroy(() => {
    		run_all(fsDispose);
    		fsDispose = [];
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("StandardPlayer", $$slots, []);

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			provider.set($provider = $$value);
    		});
    	}

    	function error_handler(event) {
    		bubble($$self, event);
    	}

    	const mount_handler = e => {
    		$$invalidate(1, playerWrapper = e.detail);
    	};

    	$$self.$set = $$new_props => {
    		$$invalidate(149, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("_standardStore" in $$new_props) $$invalidate(58, _standardStore = $$new_props._standardStore);
    		if ("parentEl" in $$new_props) $$invalidate(59, parentEl = $$new_props.parentEl);
    		if ("hasWrapper" in $$new_props) $$invalidate(0, hasWrapper = $$new_props.hasWrapper);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		currentPlayer,
    		buildStandardStore,
    		PlayerWrapper,
    		MediaType,
    		PlayerState,
    		noop,
    		listen,
    		get_current_component,
    		run_all,
    		svelteTick: tick,
    		onMount,
    		onDestroy,
    		afterUpdate,
    		is_function: is_function$1,
    		is_number,
    		is_boolean,
    		is_null,
    		self,
    		_standardStore,
    		onPropsChange,
    		store,
    		resetStore,
    		playsinline,
    		paused,
    		muted,
    		playbackEnded,
    		volume,
    		seeking,
    		internalTime,
    		currentTime,
    		isPiPActive,
    		playbackRate,
    		videoQuality,
    		src,
    		isControlsEnabled,
    		aspectRatio,
    		buffering,
    		buffered,
    		autopause,
    		autoplay,
    		playing,
    		playbackStarted,
    		poster,
    		playbackReady,
    		isVideoView,
    		tracks,
    		currentTrackIndex,
    		provider,
    		rebuilding,
    		isVideoReady,
    		canInteract,
    		isFullscreenActive,
    		useNativeView,
    		useNativeControls,
    		useNativeCaptions,
    		duration,
    		Provider,
    		isPlayerActive,
    		providerConfig,
    		providerVersion,
    		canSetPiP,
    		canSetTracks,
    		canSetTrack,
    		canAutoplay,
    		canMutedAutoplay,
    		canSetPoster,
    		canSetPlaybackRate,
    		canSetVideoQuality,
    		playerWrapper,
    		parentEl,
    		hasWrapper,
    		tick: tick$1,
    		props,
    		tempMute,
    		tempPlay,
    		tempPause,
    		tempControls,
    		updatingVolume,
    		updatingTime,
    		cancelTempAction,
    		initiateTempPlayback,
    		onRestart,
    		onTimeUpdate,
    		checkIfBuffering,
    		checkHasSeeked,
    		onAutoplay,
    		onRebuildStart,
    		onRebuildEnd,
    		onRebuild,
    		onPlaybackReady,
    		onAutopause,
    		firePauseTimer,
    		onPause,
    		onVolumeChange,
    		onBuffered,
    		onSeeking,
    		onSeeked,
    		onPlay,
    		onPlaying,
    		onLoop,
    		onPlaybackEnd,
    		onStateChange,
    		onUpdate,
    		onSrcChange,
    		onProviderChange,
    		NO_PIP_SUPPORT_ERROR_MSG,
    		VIDEO_NOT_READY_ERROR_MSG,
    		pipRequest,
    		requestPiP,
    		exitPiP,
    		FullscreenApi,
    		FULLSCREEN_NOT_SUPPORTED_ERROR_MSG,
    		FULLSCREEN_DOC_SUPPORT,
    		fsDispose,
    		isFullscreen,
    		onDocumentFullscreenChange,
    		onFullscreenChange,
    		requestDocumentFullscreen,
    		requestProviderFullscreen,
    		fullscreenRequest,
    		requestFullscreen,
    		exitFullscreen,
    		$currentPlayer,
    		$isPlayerActive,
    		$playbackReady,
    		$canMutedAutoplay,
    		$playsinline,
    		$playbackEnded,
    		$internalTime,
    		$currentTime,
    		$provider,
    		$paused,
    		$seeking,
    		$canInteract,
    		$buffered,
    		$playbackStarted,
    		$buffering,
    		$duration,
    		$autoplay,
    		$rebuilding,
    		$canAutoplay,
    		$muted,
    		$isFullscreenActive,
    		$autopause,
    		$playing,
    		$volume,
    		$useNativeCaptions,
    		$tracks,
    		$currentTrackIndex,
    		$isPiPActive,
    		$src,
    		$Provider,
    		$canSetPoster,
    		$useNativeControls,
    		$poster,
    		$aspectRatio,
    		$useNativeView,
    		$isControlsEnabled,
    		$canSetPlaybackRate,
    		$playbackRate,
    		$canSetVideoQuality,
    		$videoQuality,
    		$canSetTracks,
    		$canSetTrack,
    		$isVideoReady,
    		$canSetPiP,
    		canProviderFullscreen,
    		$isVideoView,
    		$providerConfig,
    		$providerVersion
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(149, $$props = assign(assign({}, $$props), $$new_props));
    		if ("self" in $$props) $$invalidate(65, self = $$new_props.self);
    		if ("_standardStore" in $$props) $$invalidate(58, _standardStore = $$new_props._standardStore);
    		if ("onPropsChange" in $$props) $$invalidate(66, onPropsChange = $$new_props.onPropsChange);
    		if ("playerWrapper" in $$props) $$invalidate(1, playerWrapper = $$new_props.playerWrapper);
    		if ("parentEl" in $$props) $$invalidate(59, parentEl = $$new_props.parentEl);
    		if ("hasWrapper" in $$props) $$invalidate(0, hasWrapper = $$new_props.hasWrapper);
    		if ("tempMute" in $$props) $$invalidate(67, tempMute = $$new_props.tempMute);
    		if ("tempPlay" in $$props) $$invalidate(68, tempPlay = $$new_props.tempPlay);
    		if ("tempPause" in $$props) $$invalidate(69, tempPause = $$new_props.tempPause);
    		if ("tempControls" in $$props) $$invalidate(70, tempControls = $$new_props.tempControls);
    		if ("updatingVolume" in $$props) $$invalidate(71, updatingVolume = $$new_props.updatingVolume);
    		if ("updatingTime" in $$props) updatingTime = $$new_props.updatingTime;
    		if ("firePauseTimer" in $$props) firePauseTimer = $$new_props.firePauseTimer;
    		if ("fsDispose" in $$props) fsDispose = $$new_props.fsDispose;
    		if ("canProviderFullscreen" in $$props) $$invalidate(114, canProviderFullscreen = $$new_props.canProviderFullscreen);
    	};

    	let canProviderFullscreen;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 onPropsChange($$props);

    		 Object.keys($$props).filter(prop => !store[prop]).forEach(prop => {
    			$$invalidate(2, props[prop] = $$props[prop], props);
    		});

    		if ($$self.$$.dirty[2] & /*$currentPlayer, self*/ 8200) {
    			 set_store_value(isPlayerActive, $isPlayerActive = $currentPlayer === self);
    		}

    		if ($$self.$$.dirty[0] & /*$src*/ 32) {
    			 onSrcChange();
    		}

    		if ($$self.$$.dirty[0] & /*$Provider*/ 64) {
    			 onProviderChange();
    		}

    		if ($$self.$$.dirty[2] & /*$autoplay, $playbackReady*/ 268468224) {
    			// --------------------------------------------------------------
    			// State Updates
    			// --------------------------------------------------------------
    			 if ($autoplay && $playbackReady) onAutoplay();
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$rebuilding, $playsinline*/ 537001984) {
    			 if ($provider && !$rebuilding) $provider.setPlaysinline($playsinline);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$rebuilding*/ 536870912 | $$self.$$.dirty[3] & /*$canSetPoster, $useNativeControls, $poster*/ 1792) {
    			 if ($canSetPoster && !$rebuilding) $provider.setPoster($useNativeControls ? $poster : null);
    		}

    		if ($$self.$$.dirty[0] & /*$provider, $aspectRatio*/ 136) {
    			 if ($provider && is_function$1($provider.setAspectRatio)) $provider.setAspectRatio($aspectRatio);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$rebuilding*/ 536870912 | $$self.$$.dirty[3] & /*$useNativeView*/ 2048) {
    			 if ($provider && !$rebuilding && is_function$1($provider.setView)) {
    				$provider.setView($useNativeView);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$rebuilding, tempControls*/ 536871168 | $$self.$$.dirty[3] & /*$isControlsEnabled, $useNativeControls*/ 4608) {
    			 if ($provider && !$rebuilding) {
    				$provider.setControls($isControlsEnabled && ($useNativeControls || tempControls));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$paused, $playbackEnded*/ 2359296) {
    			 if ($provider && !$paused && $playbackEnded) onRestart();
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$playbackReady, $paused, tempPause, tempPlay*/ 2130112) {
    			 if ($provider && $playbackReady) $provider.setPaused(($paused || tempPause) && !tempPlay);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract, tempMute*/ 8388640 | $$self.$$.dirty[3] & /*$muted*/ 1) {
    			 if ($provider && $canInteract) $provider.setMuted($muted || tempMute);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract*/ 8388608 | $$self.$$.dirty[3] & /*$canSetPlaybackRate, $playbackRate*/ 24576) {
    			 if ($canSetPlaybackRate && $canInteract) $provider.setPlaybackRate($playbackRate);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract*/ 8388608 | $$self.$$.dirty[3] & /*$canSetVideoQuality, $videoQuality*/ 98304) {
    			 if ($canSetVideoQuality && $canInteract) $provider.setVideoQuality($videoQuality);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract, updatingVolume*/ 8389120 | $$self.$$.dirty[3] & /*$volume*/ 8) {
    			 $provider && $canInteract && !updatingVolume
    			? $provider.setVolume($volume)
    			: $$invalidate(71, updatingVolume = false);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract*/ 8388608 | $$self.$$.dirty[3] & /*$canSetTracks, $useNativeCaptions, $tracks*/ 131120) {
    			// --------------------------------------------------------------
    			// Tracks
    			// --------------------------------------------------------------
    			 if ($canSetTracks && $canInteract) $provider.setTracks($useNativeCaptions ? $tracks : []);
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8 | $$self.$$.dirty[2] & /*$canInteract*/ 8388608 | $$self.$$.dirty[3] & /*$canSetTrack, $useNativeCaptions, $currentTrackIndex*/ 262224) {
    			 if ($canSetTrack && $canInteract) {
    				$provider.setTrack($useNativeCaptions ? $currentTrackIndex : -1);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$provider*/ 8) {
    			 $$invalidate(114, canProviderFullscreen = $provider && $provider.supportsFullscreen() && is_function$1($provider.setFullscreen));
    		}

    		if ($$self.$$.dirty[3] & /*$isVideoReady, canProviderFullscreen*/ 2621440) {
    			 store.canSetFullscreen.set($isVideoReady && (FULLSCREEN_DOC_SUPPORT || canProviderFullscreen));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		hasWrapper,
    		playerWrapper,
    		props,
    		$provider,
    		$isFullscreenActive,
    		$src,
    		$Provider,
    		$aspectRatio,
    		$isVideoView,
    		$providerConfig,
    		$providerVersion,
    		playsinline,
    		paused,
    		muted,
    		playbackEnded,
    		volume,
    		seeking,
    		internalTime,
    		currentTime,
    		isPiPActive,
    		playbackRate,
    		videoQuality,
    		src,
    		isControlsEnabled,
    		aspectRatio,
    		buffering,
    		buffered,
    		autopause,
    		autoplay,
    		playing,
    		playbackStarted,
    		poster,
    		playbackReady,
    		isVideoView,
    		tracks,
    		currentTrackIndex,
    		provider,
    		rebuilding,
    		isVideoReady,
    		canInteract,
    		isFullscreenActive,
    		useNativeView,
    		useNativeControls,
    		useNativeCaptions,
    		duration,
    		Provider,
    		isPlayerActive,
    		providerConfig,
    		providerVersion,
    		canSetPiP,
    		canSetTracks,
    		canSetTrack,
    		canAutoplay,
    		canMutedAutoplay,
    		canSetPoster,
    		canSetPlaybackRate,
    		canSetVideoQuality,
    		onUpdate,
    		_standardStore,
    		parentEl,
    		tick$1,
    		requestPiP,
    		exitPiP,
    		requestFullscreen,
    		exitFullscreen,
    		self,
    		onPropsChange,
    		tempMute,
    		tempPlay,
    		tempPause,
    		tempControls,
    		updatingVolume,
    		updatingTime,
    		firePauseTimer,
    		fsDispose,
    		$currentPlayer,
    		$isPlayerActive,
    		$playbackReady,
    		$canMutedAutoplay,
    		$playsinline,
    		$playbackEnded,
    		$internalTime,
    		$currentTime,
    		$paused,
    		$seeking,
    		$canInteract,
    		$buffered,
    		$playbackStarted,
    		$buffering,
    		$duration,
    		$autoplay,
    		$rebuilding,
    		$canAutoplay,
    		$muted,
    		$autopause,
    		$playing,
    		$volume,
    		$useNativeCaptions,
    		$tracks,
    		$currentTrackIndex,
    		$isPiPActive,
    		$canSetPoster,
    		$useNativeControls,
    		$poster,
    		$useNativeView,
    		$isControlsEnabled,
    		$canSetPlaybackRate,
    		$playbackRate,
    		$canSetVideoQuality,
    		$videoQuality,
    		$canSetTracks,
    		$canSetTrack,
    		$isVideoReady,
    		$canSetPiP,
    		canProviderFullscreen,
    		store,
    		resetStore,
    		cancelTempAction,
    		initiateTempPlayback,
    		onRestart,
    		onTimeUpdate,
    		checkIfBuffering,
    		checkHasSeeked,
    		onAutoplay,
    		onRebuildStart,
    		onRebuildEnd,
    		onRebuild,
    		onPlaybackReady,
    		onAutopause,
    		onPause,
    		onVolumeChange,
    		onBuffered,
    		onSeeking,
    		onSeeked,
    		onPlay,
    		onPlaying,
    		onLoop,
    		onPlaybackEnd,
    		onStateChange,
    		onSrcChange,
    		onProviderChange,
    		pipRequest,
    		FULLSCREEN_DOC_SUPPORT,
    		isFullscreen,
    		onDocumentFullscreenChange,
    		onFullscreenChange,
    		requestDocumentFullscreen,
    		requestProviderFullscreen,
    		fullscreenRequest,
    		$$props,
    		switch_instance_binding,
    		error_handler,
    		mount_handler
    	];
    }

    class StandardPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				_standardStore: 58,
    				parentEl: 59,
    				hasWrapper: 0,
    				tick: 60,
    				requestPiP: 61,
    				exitPiP: 62,
    				requestFullscreen: 63,
    				exitFullscreen: 64
    			},
    			[-1, -1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StandardPlayer",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get _standardStore() {
    		return this.$$.ctx[58];
    	}

    	set _standardStore(_standardStore) {
    		this.$set({ _standardStore });
    		flush();
    	}

    	get parentEl() {
    		return this.$$.ctx[59];
    	}

    	set parentEl(parentEl) {
    		this.$set({ parentEl });
    		flush();
    	}

    	get hasWrapper() {
    		return this.$$.ctx[0];
    	}

    	set hasWrapper(hasWrapper) {
    		this.$set({ hasWrapper });
    		flush();
    	}

    	get tick() {
    		return this.$$.ctx[60];
    	}

    	set tick(value) {
    		throw new Error("<StandardPlayer>: Cannot set read-only property 'tick'");
    	}

    	get requestPiP() {
    		return this.$$.ctx[61];
    	}

    	set requestPiP(value) {
    		throw new Error("<StandardPlayer>: Cannot set read-only property 'requestPiP'");
    	}

    	get exitPiP() {
    		return this.$$.ctx[62];
    	}

    	set exitPiP(value) {
    		throw new Error("<StandardPlayer>: Cannot set read-only property 'exitPiP'");
    	}

    	get requestFullscreen() {
    		return this.$$.ctx[63];
    	}

    	set requestFullscreen(value) {
    		throw new Error("<StandardPlayer>: Cannot set read-only property 'requestFullscreen'");
    	}

    	get exitFullscreen() {
    		return this.$$.ctx[64];
    	}

    	set exitFullscreen(value) {
    		throw new Error("<StandardPlayer>: Cannot set read-only property 'exitFullscreen'");
    	}
    }

    /* node_modules/@vime-js/standard/src/providers/Vimeo.svelte generated by Svelte v3.20.1 */

    function create_fragment$c(ctx) {
    	let current;

    	let liteplayer_props = {
    		src: /*src*/ ctx[0],
    		params: /*params*/ ctx[2],
    		providers: [VimeoProvider],
    		hasWrapper: false
    	};

    	const liteplayer = new LitePlayer({ props: liteplayer_props, $$inline: true });
    	/*liteplayer_binding*/ ctx[33](liteplayer);
    	liteplayer.$on("error", /*error_handler*/ ctx[34]);
    	liteplayer.$on("titlechange", /*onTitleChange*/ ctx[4]);
    	liteplayer.$on("rebuild", /*onReload*/ ctx[6]);
    	liteplayer.$on("rebuild", /*onRebuildStart*/ ctx[3]);
    	liteplayer.$on("embedurlchange", /*onEmbedURLChange*/ ctx[5]);
    	liteplayer.$on("data", /*onData*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(liteplayer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(liteplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const liteplayer_changes = {};
    			if (dirty[0] & /*src*/ 1) liteplayer_changes.src = /*src*/ ctx[0];
    			if (dirty[0] & /*params*/ 4) liteplayer_changes.params = /*params*/ ctx[2];
    			liteplayer.$set(liteplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(liteplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(liteplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*liteplayer_binding*/ ctx[33](null);
    			destroy_component(liteplayer, detaching);
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

    const VM = {};

    // @see https://developer.vimeo.com/player/sdk/reference#methods-for-playback-controls
    VM.Command = {
    	PLAY: "play",
    	PAUSE: "pause",
    	SET_MUTED: "setMuted",
    	SET_VOLUME: "setVolume",
    	SET_CURRENT_TIME: "setCurrentTime",
    	SET_PLAYBACK_RATE: "setPlaybackRate",
    	ADD_EVENT_LISTENER: "addEventListener",
    	GET_DURATION: "getDuration",
    	GET_CURRENT_TIME: "getCurrentTime",
    	GET_TEXT_TRACKS: "getTextTracks",
    	ENABLE_TEXT_TRACK: "enableTextTrack",
    	DISABLE_TEXT_TRACK: "disableTextTrack"
    };

    // Some reason event names are different when calling `addEventListener` vs the event name
    // that comes through `onData`, hence `VM.Event` and `VM.EVENTS` below.
    VM.Event = {
    	PLAY: "play",
    	PAUSE: "pause",
    	READY: "ready",
    	LOAD_PROGRESS: "loadProgress",
    	BUFFER_START: "bufferstart",
    	BUFFER_END: "bufferend",
    	LOADED: "loaded",
    	FINISH: "finish",
    	SEEKING: "seeking",
    	SEEKED: "seeked",
    	CUE_CHANGE: "cuechange",
    	FULLSCREEN_CHANGE: "fullscreenchange",
    	VOLUME_CHANGE: "volumechange",
    	DURATION_CHANGE: "durationchange",
    	PLAYBACK_RATE_CHANGE: "playbackratechange",
    	TEXT_TRACK_CHANGE: "texttrackchange",
    	ERROR: "error"
    };

    // @see https://developer.vimeo.com/player/sdk/reference#events-for-playback-controls
    VM.EVENTS = [
    	VM.Event.PLAY,
    	VM.Event.PAUSE,
    	VM.Event.SEEKING,
    	VM.Event.SEEKED,
    	"timeupdate",
    	VM.Event.VOLUME_CHANGE,
    	VM.Event.DURATION_CHANGE,
    	VM.Event.FULLSCREEN_CHANGE,
    	VM.Event.CUE_CHANGE,
    	"progress",
    	VM.Event.ERROR,
    	VM.Event.PLAYBACK_RATE_CHANGE,
    	VM.Event.LOADED,
    	VM.Event.BUFFER_START,
    	VM.Event.BUFFER_END,
    	VM.Event.TEXT_TRACK_CHANGE,
    	"waiting",
    	"ended"
    ];

    const canPlay = can_play;

    function instance$c($$self, $$props, $$invalidate) {
    	let litePlayer;
    	let info = {};
    	let tracks = [];
    	let seeking = false;
    	let playbackReady = false;
    	let internalTime = 0;

    	const params = {
    		// Controlled by Vime.
    		autopause: false
    	};

    	const dispatch = createEventDispatcher();
    	const send = (command, args) => litePlayer && litePlayer.sendCommand(command, args);
    	let { src = null } = $$props;
    	const getLitePlayer = () => litePlayer;
    	const getEl = () => litePlayer ? litePlayer.getEmbed().getIframe() : null;

    	const setMuted = isMuted => {
    		send(VM.Command.SET_MUTED, isMuted);
    	};

    	const setVolume = newVolume => {
    		send(VM.Command.SET_VOLUME, newVolume / 100);
    	};

    	const setCurrentTime = newTime => {
    		send(VM.Command.SET_CURRENT_TIME, newTime);
    	};

    	const setPlaysinline = isEnabled => {
    		$$invalidate(2, params.playsinline = isEnabled, params);
    	};

    	const setControls = isEnabled => {
    		$$invalidate(2, params.controls = isEnabled, params);
    	};

    	const setPlaybackRate = newRate => {
    		send(VM.Command.SET_PLAYBACK_RATE, newRate);
    	};

    	const setPaused = isPaused => {
    		isPaused
    		? send(VM.Command.PAUSE)
    		: send(VM.Command.PLAY);
    	};

    	const supportsPiP = () => false;
    	const supportsFullscreen = () => true;

    	const setTrack = newIndex => {
    		if (newIndex === -1) {
    			send(VM.Command.DISABLE_TEXT_TRACK);
    			return;
    		}

    		const { language, kind } = tracks[newIndex];
    		send(VM.Command.ENABLE_TEXT_TRACK, { language, kind });
    	};

    	onMount(() => {
    		$$invalidate(20, info.origin = litePlayer.getOrigin(), info);
    	});

    	onMount(() => {
    		$$invalidate(20, info.mediaType = MediaType.VIDEO, info);
    	});

    	const onRebuildStart = () => {
    		$$invalidate(20, info.rebuild = true, info);
    	};

    	const onTitleChange = e => {
    		$$invalidate(20, info.title = e.detail, info);
    	};

    	const onEmbedURLChange = e => {
    		$$invalidate(20, info.currentSrc = e.detail, info);
    		$$invalidate(20, info.mediaId = litePlayer.getMediaId(), info);
    	};

    	const onReload = () => {
    		$$invalidate(23, playbackReady = false);
    		$$invalidate(22, seeking = false);
    		internalTime = 0;
    		tracks = [];
    	};

    	const onTimeUpdate = time => {
    		$$invalidate(20, info.currentTime = time, info);

    		if (Math.abs(internalTime - time) > 1) {
    			$$invalidate(22, seeking = true);
    			$$invalidate(20, info.seeking = true, info);
    		}

    		internalTime = time;
    	};

    	let timeRaf;
    	const cancelTimeUpdates = () => window.cancelAnimationFrame(timeRaf);
    	onDestroy(cancelTimeUpdates);

    	const getTimeUpdates = () => {
    		send(VM.Command.GET_CURRENT_TIME);
    		timeRaf = raf(getTimeUpdates);
    	};

    	const onMethod = (method, value) => {
    		switch (method) {
    			case VM.Command.GET_CURRENT_TIME:
    				onTimeUpdate(parseFloat(value));
    				break;
    			case VM.Command.GET_TEXT_TRACKS:
    				tracks = value || [];
    				$$invalidate(20, info.tracks = tracks.map(track => ({ ...track, srclang: track.language })), info);
    				$$invalidate(20, info.currentTrackIndex = tracks.findIndex(t => t.mode === "showing"), info);
    				break;
    			case VM.Command.GET_DURATION:
    				$$invalidate(20, info.duration = parseFloat(value), info);
    				break;
    		}
    	};

    	const onData = e => {
    		const data = e.detail;
    		if (!data) return;
    		const { event, data: payload } = data;
    		if (data.method) onMethod(data.method, data.value);
    		if (!event) return;

    		switch (event) {
    			case VM.Event.READY:
    				VM.EVENTS.forEach(vmEvent => send(VM.Command.ADD_EVENT_LISTENER, vmEvent));
    				break;
    			case VM.Event.LOADED:
    				$$invalidate(20, info.state = PlayerState.CUED, info);
    				send(VM.Command.GET_DURATION);
    				send(VM.Command.GET_TEXT_TRACKS);
    				$$invalidate(23, playbackReady = true);
    				break;
    			case VM.Event.PLAY:
    				$$invalidate(20, info.state = PlayerState.PLAYING, info);
    				break;
    			case VM.Event.PAUSE:
    				$$invalidate(20, info.state = PlayerState.PAUSED, info);
    				break;
    			case VM.Event.LOAD_PROGRESS:
    				$$invalidate(20, info.buffered = parseFloat(payload.seconds), info);
    				break;
    			case VM.Event.BUFFER_START:
    				$$invalidate(20, info.state = PlayerState.BUFFERING, info);
    				break;
    			case VM.Event.SEEKING:
    				$$invalidate(20, info.seeking = true, info);
    				break;
    			case VM.Event.TEXT_TRACK_CHANGE:
    				$$invalidate(20, info.currentTrackIndex = tracks.findIndex(t => t.label === payload.label), info);
    				break;
    			case VM.Event.SEEKED:
    				$$invalidate(22, seeking = false);
    				$$invalidate(20, info.seeked = true, info);
    				break;
    			case VM.Event.VOLUME_CHANGE:
    				$$invalidate(20, info.volume = parseFloat(payload.volume) * 100, info);
    				break;
    			case VM.Event.DURATION_CHANGE:
    				$$invalidate(20, info.duration = parseFloat(payload.duration), info);
    				break;
    			case VM.Event.PLAYBACK_RATE_CHANGE:
    				$$invalidate(20, info.playbackRate = parseFloat(payload.playbackRate), info);
    				break;
    			case VM.Event.FULLSCREEN_CHANGE:
    				$$invalidate(20, info.fullscreen = !!payload.fullscreen, info);
    				break;
    			case VM.Event.FINISH:
    				$$invalidate(20, info.state = PlayerState.ENDED, info);
    				break;
    			case VM.Event.ERROR:
    				dispatch("error", payload);
    				break;
    		}
    	};

    	const fetchPoster = () => fetch_poster(src).then(poster => {
    		$$invalidate(20, info.poster = poster, info);
    	}).catch(e => dispatch("error", e));

    	const writable_props = ["src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vimeo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Vimeo", $$slots, []);

    	function liteplayer_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, litePlayer = $$value);
    		});
    	}

    	function error_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		can_play,
    		VM,
    		canPlay,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		raf,
    		LitePlayer,
    		VimeoProvider,
    		fetch_poster,
    		MediaType,
    		PlayerState,
    		litePlayer,
    		info,
    		tracks,
    		seeking,
    		playbackReady,
    		internalTime,
    		params,
    		dispatch,
    		send,
    		src,
    		getLitePlayer,
    		getEl,
    		setMuted,
    		setVolume,
    		setCurrentTime,
    		setPlaysinline,
    		setControls,
    		setPlaybackRate,
    		setPaused,
    		supportsPiP,
    		supportsFullscreen,
    		setTrack,
    		onRebuildStart,
    		onTitleChange,
    		onEmbedURLChange,
    		onReload,
    		onTimeUpdate,
    		timeRaf,
    		cancelTimeUpdates,
    		getTimeUpdates,
    		onMethod,
    		onData,
    		fetchPoster
    	});

    	$$self.$inject_state = $$props => {
    		if ("litePlayer" in $$props) $$invalidate(1, litePlayer = $$props.litePlayer);
    		if ("info" in $$props) $$invalidate(20, info = $$props.info);
    		if ("tracks" in $$props) tracks = $$props.tracks;
    		if ("seeking" in $$props) $$invalidate(22, seeking = $$props.seeking);
    		if ("playbackReady" in $$props) $$invalidate(23, playbackReady = $$props.playbackReady);
    		if ("internalTime" in $$props) internalTime = $$props.internalTime;
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("timeRaf" in $$props) timeRaf = $$props.timeRaf;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*src*/ 1) {
    			 fetchPoster();
    		}

    		if ($$self.$$.dirty[0] & /*seeking, playbackReady*/ 12582912) {
    			 !seeking && playbackReady
    			? getTimeUpdates()
    			: cancelTimeUpdates();
    		}

    		if ($$self.$$.dirty[0] & /*info*/ 1048576) {
    			 {
    				dispatch("update", info);
    				$$invalidate(20, info = {});
    			}
    		}
    	};

    	return [
    		src,
    		litePlayer,
    		params,
    		onRebuildStart,
    		onTitleChange,
    		onEmbedURLChange,
    		onReload,
    		onData,
    		getLitePlayer,
    		getEl,
    		setMuted,
    		setVolume,
    		setCurrentTime,
    		setPlaysinline,
    		setControls,
    		setPlaybackRate,
    		setPaused,
    		supportsPiP,
    		supportsFullscreen,
    		setTrack,
    		info,
    		tracks,
    		seeking,
    		playbackReady,
    		internalTime,
    		timeRaf,
    		dispatch,
    		send,
    		onTimeUpdate,
    		cancelTimeUpdates,
    		getTimeUpdates,
    		onMethod,
    		fetchPoster,
    		liteplayer_binding,
    		error_handler
    	];
    }

    class Vimeo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				src: 0,
    				getLitePlayer: 8,
    				getEl: 9,
    				setMuted: 10,
    				setVolume: 11,
    				setCurrentTime: 12,
    				setPlaysinline: 13,
    				setControls: 14,
    				setPlaybackRate: 15,
    				setPaused: 16,
    				supportsPiP: 17,
    				supportsFullscreen: 18,
    				setTrack: 19
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vimeo",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get src() {
    		throw new Error("<Vimeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getLitePlayer() {
    		return this.$$.ctx[8];
    	}

    	set getLitePlayer(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getEl() {
    		return this.$$.ctx[9];
    	}

    	set getEl(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setMuted() {
    		return this.$$.ctx[10];
    	}

    	set setMuted(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setVolume() {
    		return this.$$.ctx[11];
    	}

    	set setVolume(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setCurrentTime() {
    		return this.$$.ctx[12];
    	}

    	set setCurrentTime(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setPlaysinline() {
    		return this.$$.ctx[13];
    	}

    	set setPlaysinline(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setControls() {
    		return this.$$.ctx[14];
    	}

    	set setControls(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setPlaybackRate() {
    		return this.$$.ctx[15];
    	}

    	set setPlaybackRate(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setPaused() {
    		return this.$$.ctx[16];
    	}

    	set setPaused(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get supportsPiP() {
    		return this.$$.ctx[17];
    	}

    	set supportsPiP(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get supportsFullscreen() {
    		return this.$$.ctx[18];
    	}

    	set supportsFullscreen(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setTrack() {
    		return this.$$.ctx[19];
    	}

    	set setTrack(value) {
    		throw new Error("<Vimeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var VimeoProvider$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Vimeo,
        canPlay: canPlay
    });

    /* src/quanta/1-views/2-molecules/OmoVideo.svelte generated by Svelte v3.20.1 */

    const file$9 = "src/quanta/1-views/2-molecules/OmoVideo.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	let player_1_props = { providers: /*providers*/ ctx[1] };
    	const player_1 = new StandardPlayer({ props: player_1_props, $$inline: true });
    	/*player_1_binding*/ ctx[5](player_1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(player_1.$$.fragment);
    			attr_dev(div, "class", "bg-blue-900 w-full");
    			add_location(div, file$9, 28, 0, 602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(player_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const player_1_changes = {};
    			player_1.$set(player_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*player_1_binding*/ ctx[5](null);
    			destroy_component(player_1);
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
    	let player;
    	const providers = [VimeoProvider$1];

    	onMount(() => {
    		$$invalidate(0, player.src = data.video_id, player);
    	});

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
    		link: "https://player.vimeo.com/video/349650067",
    		video_id: "vimeo/349650067"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoVideo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoVideo", $$slots, []);

    	function player_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, player = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Player: StandardPlayer,
    		VimeoProvider: VimeoProvider$1,
    		player,
    		providers,
    		model,
    		design,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, providers, model, design, data, player_1_binding];
    }

    class OmoVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { model: 2, design: 3, data: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoVideo",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get model() {
    		return this.$$.ctx[2];
    	}

    	set model(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get design() {
    		return this.$$.ctx[3];
    	}

    	set design(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		return this.$$.ctx[4];
    	}

    	set data(value) {
    		throw new Error("<OmoVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoHero.svelte generated by Svelte v3.20.1 */

    const file$a = "src/quanta/1-views/2-molecules/OmoHero.svelte";

    function create_fragment$e(ctx) {
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
    			add_location(h1, file$a, 29, 6, 579);
    			attr_dev(div0, "class", "text-3xl text-gray-600 font-sans italic font-light tracking-wide\n        mb-6");
    			add_location(div0, file$a, 34, 6, 740);
    			attr_dev(p, "class", "text-gray-500 leading-relaxed mb-12");
    			add_location(p, file$a, 39, 6, 888);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "bg-green-400 hover:bg-blue-800 py-2 px-4 text-lg font-bold\n        text-white rounded");
    			add_location(a, file$a, 42, 6, 986);
    			attr_dev(div1, "class", "sm:w-3/5 flex flex-col items-center sm:items-start text-center\n      sm:text-left");
    			add_location(div1, file$a, 26, 4, 471);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.illustration)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*quant*/ ctx[0].data.title);
    			add_location(img, file$a, 50, 6, 1198);
    			attr_dev(div2, "class", "lg:px-20 w-2/5");
    			add_location(div2, file$a, 49, 4, 1163);
    			attr_dev(div3, "class", "flex flex-col-reverse sm:flex-row jusitfy-between items-center");
    			add_location(div3, file$a, 25, 2, 390);
    			attr_dev(div4, "class", div4_class_value = "flex flex-col mx-auto " + /*quant*/ ctx[0].design.layout);
    			add_location(div4, file$a, 24, 0, 330);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHero",
    			options,
    			id: create_fragment$e.name
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

    const file$b = "src/quanta/1-views/2-molecules/OmoHeader.svelte";

    // (31:2) {#if quant.data.subline}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t_value = /*quant*/ ctx[0].data.subline + "";
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "flex-wrap text-2xl " + /*quant*/ ctx[0].design.subline);
    			add_location(div, file$b, 31, 4, 673);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(31:2) {#if quant.data.subline}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if quant.data.illustration}
    function create_if_block$2(ctx) {
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
    			add_location(img, file$b, 37, 6, 878);
    			attr_dev(div, "class", div_class_value = "mt-16 mb-10 m-auto " + /*quant*/ ctx[0].design.illustration);
    			add_location(div, file$b, 36, 4, 811);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(36:2) {#if quant.data.illustration}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*quant*/ ctx[0].data.title + "";
    	let t0;
    	let h2_class_value;
    	let t1;
    	let t2;
    	let div_class_value;
    	let if_block0 = /*quant*/ ctx[0].data.subline && create_if_block_1$1(ctx);
    	let if_block1 = /*quant*/ ctx[0].data.illustration && create_if_block$2(ctx);

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
    			add_location(h2, file$b, 27, 2, 548);
    			attr_dev(div, "class", div_class_value = "m-auto flex flex-col justify-center text-center " + /*quant*/ ctx[0].design.layout);
    			add_location(div, file$b, 25, 0, 460);
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
    					if_block0 = create_if_block_1$1(ctx);
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
    					if_block1 = create_if_block$2(ctx);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoHeader",
    			options,
    			id: create_fragment$f.name
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

    const file$c = "src/quanta/1-views/2-molecules/OmoCard.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(img, file$c, 7, 6, 164);
    			attr_dev(a0, "href", a0_href_value = "city?id=" + /*city*/ ctx[0].id);
    			attr_dev(a0, "class", "text-xl font-bold font-title uppercase");
    			add_location(a0, file$c, 14, 8, 413);
    			attr_dev(div0, "class", "w-full px-4 pb-2 pt-3 text-center hover:bg-green-400 bg-blue-800\n        text-white");
    			add_location(div0, file$c, 11, 6, 299);
    			attr_dev(div1, "class", "primary omo-border overflow-hidden omo-shadow");
    			add_location(div1, file$c, 6, 4, 98);
    			attr_dev(a1, "href", a1_href_value = "city?id=" + /*city*/ ctx[0].id);
    			add_location(a1, file$c, 5, 2, 65);
    			attr_dev(div2, "class", "min-w-100");
    			add_location(div2, file$c, 4, 0, 39);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { city: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCard",
    			options,
    			id: create_fragment$g.name
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
    const file$d = "src/quanta/1-views/3-organisms/OmoCities.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (10:2) {#each $cities as city, i (city.id)}
    function create_each_block$1(key_1, ctx) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:2) {#each $cities as city, i (city.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$cities*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*city*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4\n  gap-6");
    			add_location(div, file$d, 6, 0, 150);
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
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { currentId: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCities",
    			options,
    			id: create_fragment$h.name
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

    const file$e = "src/quanta/1-views/2-molecules/OmoPricing.svelte";

    function create_fragment$i(ctx) {
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
    			add_location(h10, file$e, 25, 8, 671);
    			attr_dev(h20, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h20, file$e, 30, 8, 811);
    			attr_dev(div0, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n        text-black px-8 lg:px-6");
    			add_location(div0, file$e, 22, 6, 552);
    			attr_dev(path0, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path0, file$e, 49, 16, 1525);
    			attr_dev(polyline0, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline0, file$e, 50, 16, 1589);
    			attr_dev(svg0, "class", "w-6 h-6 align-middle");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			add_location(svg0, file$e, 39, 14, 1189);
    			attr_dev(div1, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div1, file$e, 38, 12, 1115);
    			attr_dev(span0, "class", "text-gray-700 text-lg ml-3");
    			add_location(span0, file$e, 53, 12, 1685);
    			attr_dev(li0, "class", "flex items-center");
    			add_location(li0, file$e, 37, 10, 1072);
    			attr_dev(path1, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path1, file$e, 67, 16, 2226);
    			attr_dev(polyline1, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline1, file$e, 68, 16, 2290);
    			attr_dev(svg1, "class", "w-6 h-6 align-middle");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			add_location(svg1, file$e, 57, 14, 1890);
    			attr_dev(div2, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div2, file$e, 56, 12, 1816);
    			attr_dev(span1, "class", "text-gray-700 text-lg ml-3");
    			add_location(span1, file$e, 71, 12, 2386);
    			attr_dev(li1, "class", "flex items-center");
    			add_location(li1, file$e, 55, 10, 1773);
    			attr_dev(path2, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path2, file$e, 85, 16, 2925);
    			attr_dev(polyline2, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline2, file$e, 86, 16, 2989);
    			attr_dev(svg2, "class", "w-6 h-6 align-middle");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			add_location(svg2, file$e, 75, 14, 2589);
    			attr_dev(div3, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div3, file$e, 74, 12, 2515);
    			attr_dev(span2, "class", "text-gray-700 text-lg ml-3");
    			add_location(span2, file$e, 89, 12, 3085);
    			attr_dev(li2, "class", "flex items-center");
    			add_location(li2, file$e, 73, 10, 2472);
    			add_location(ul0, file$e, 36, 8, 1057);
    			attr_dev(div4, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div4, file$e, 35, 6, 1010);
    			attr_dev(button0, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n          text-green-400 rounded px-4 py-2 block shadow-xl hover:border-blue-800\n          hover:bg-blue-800 hover:text-white");
    			add_location(button0, file$e, 94, 8, 3251);
    			attr_dev(div5, "class", "block flex items-center p-8");
    			add_location(div5, file$e, 93, 6, 3201);
    			attr_dev(div6, "class", "bg-white text-black rounded shadow-inner shadow-lg overflow-hidden");
    			add_location(div6, file$e, 20, 4, 459);
    			attr_dev(div7, "class", "max-w-sm sm:w-4/5 lg:w-1/3 sm:my-5 my-8 z-0 rounded shadow-lg");
    			add_location(div7, file$e, 19, 2, 379);
    			attr_dev(div8, "class", "text-sm leading-none rounded-t-lg bg-blue-800 text-white\n      font-semibold uppercase py-2 text-center tracking-wide");
    			add_location(div8, file$e, 106, 4, 3651);
    			attr_dev(h11, "class", "text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide");
    			add_location(h11, file$e, 114, 6, 3936);
    			attr_dev(span3, "class", "text-3xl");
    			add_location(span3, file$e, 119, 8, 4117);
    			attr_dev(h21, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h21, file$e, 118, 6, 4057);
    			attr_dev(div9, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black\n      px-8 lg:px-6");
    			add_location(div9, file$e, 111, 4, 3823);
    			attr_dev(path3, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path3, file$e, 139, 14, 4810);
    			attr_dev(polyline3, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline3, file$e, 140, 14, 4872);
    			attr_dev(svg3, "class", "w-6 h-6 align-middle");
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "24");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			add_location(svg3, file$e, 129, 12, 4494);
    			attr_dev(div10, "class", "rounded-full p-2 fill-current text-green-700");
    			add_location(div10, file$e, 128, 10, 4423);
    			attr_dev(span4, "class", "text-gray-700 text-lg ml-3");
    			add_location(span4, file$e, 143, 10, 4962);
    			attr_dev(li3, "class", "flex items-center");
    			add_location(li3, file$e, 127, 8, 4382);
    			attr_dev(path4, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path4, file$e, 157, 14, 5474);
    			attr_dev(polyline4, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline4, file$e, 158, 14, 5536);
    			attr_dev(svg4, "class", "w-6 h-6 align-middle");
    			attr_dev(svg4, "width", "24");
    			attr_dev(svg4, "height", "24");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-width", "2");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			add_location(svg4, file$e, 147, 12, 5158);
    			attr_dev(div11, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div11, file$e, 146, 10, 5086);
    			attr_dev(span5, "class", "text-gray-700 text-lg ml-3");
    			add_location(span5, file$e, 161, 10, 5626);
    			attr_dev(li4, "class", "flex items-center");
    			add_location(li4, file$e, 145, 8, 5045);
    			attr_dev(path5, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path5, file$e, 175, 14, 6146);
    			attr_dev(polyline5, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline5, file$e, 176, 14, 6208);
    			attr_dev(svg5, "class", "w-6 h-6 align-middle");
    			attr_dev(svg5, "width", "24");
    			attr_dev(svg5, "height", "24");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "stroke-width", "2");
    			attr_dev(svg5, "stroke-linecap", "round");
    			attr_dev(svg5, "stroke-linejoin", "round");
    			add_location(svg5, file$e, 165, 12, 5830);
    			attr_dev(div12, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div12, file$e, 164, 10, 5758);
    			attr_dev(span6, "class", "text-gray-700 text-lg ml-3");
    			add_location(span6, file$e, 179, 10, 6298);
    			attr_dev(li5, "class", "flex items-center");
    			add_location(li5, file$e, 163, 8, 5717);
    			add_location(ul1, file$e, 126, 6, 4369);
    			attr_dev(div13, "class", "flex pl-12 justify-start sm:justify-start mt-3");
    			add_location(div13, file$e, 125, 4, 4302);
    			attr_dev(button1, "class", "mt-3 text-lg font-semibold bg-green-400 w-full text-white rounded\n        px-6 py-3 block shadow-xl hover:bg-blue-800");
    			add_location(button1, file$e, 185, 6, 6455);
    			attr_dev(div14, "class", "block flex items-center p-8");
    			add_location(div14, file$e, 184, 4, 6407);
    			attr_dev(div15, "class", "w-full max-w-md sm:w-2/3 lg:w-1/3 sm:my-5 my-8 relative z-10 bg-white\n    rounded-lg shadow-lg");
    			add_location(div15, file$e, 103, 2, 3534);
    			attr_dev(h12, "class", "text-lg font-medium uppercase p-3 pb-0 text-center\n          tracking-wide");
    			add_location(h12, file$e, 200, 8, 6963);
    			attr_dev(h22, "class", "text-sm text-gray-500 text-center pb-6");
    			add_location(h22, file$e, 205, 8, 7105);
    			attr_dev(div16, "class", "block text-left text-sm sm:text-md max-w-sm mx-auto mt-2\n        text-black px-8 lg:px-6");
    			add_location(div16, file$e, 197, 6, 6844);
    			attr_dev(path6, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path6, file$e, 223, 16, 7827);
    			attr_dev(polyline6, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline6, file$e, 224, 16, 7891);
    			attr_dev(svg6, "class", "w-6 h-6 align-middle");
    			attr_dev(svg6, "width", "24");
    			attr_dev(svg6, "height", "24");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "stroke-width", "2");
    			attr_dev(svg6, "stroke-linecap", "round");
    			attr_dev(svg6, "stroke-linejoin", "round");
    			add_location(svg6, file$e, 213, 14, 7491);
    			attr_dev(div17, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div17, file$e, 212, 12, 7417);
    			attr_dev(span7, "class", "text-gray-700 text-lg ml-3");
    			add_location(span7, file$e, 227, 12, 7987);
    			attr_dev(li6, "class", "flex items-center");
    			add_location(li6, file$e, 211, 10, 7374);
    			attr_dev(path7, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path7, file$e, 241, 16, 8526);
    			attr_dev(polyline7, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline7, file$e, 242, 16, 8590);
    			attr_dev(svg7, "class", "w-6 h-6 align-middle");
    			attr_dev(svg7, "width", "24");
    			attr_dev(svg7, "height", "24");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "stroke-width", "2");
    			attr_dev(svg7, "stroke-linecap", "round");
    			attr_dev(svg7, "stroke-linejoin", "round");
    			add_location(svg7, file$e, 231, 14, 8190);
    			attr_dev(div18, "class", "rounded-full p-2 fill-current text-green-700");
    			add_location(div18, file$e, 230, 12, 8117);
    			attr_dev(span8, "class", "text-gray-700 text-lg ml-3");
    			add_location(span8, file$e, 245, 12, 8686);
    			attr_dev(li7, "class", "flex items-center");
    			add_location(li7, file$e, 229, 10, 8074);
    			attr_dev(path8, "d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
    			add_location(path8, file$e, 259, 16, 9234);
    			attr_dev(polyline8, "points", "22 4 12 14.01 9 11.01");
    			add_location(polyline8, file$e, 260, 16, 9298);
    			attr_dev(svg8, "class", "w-6 h-6 align-middle");
    			attr_dev(svg8, "width", "24");
    			attr_dev(svg8, "height", "24");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "stroke-width", "2");
    			attr_dev(svg8, "stroke-linecap", "round");
    			attr_dev(svg8, "stroke-linejoin", "round");
    			add_location(svg8, file$e, 249, 14, 8898);
    			attr_dev(div19, "class", " rounded-full p-2 fill-current text-green-700");
    			add_location(div19, file$e, 248, 12, 8824);
    			attr_dev(span9, "class", "text-gray-700 text-lg ml-3");
    			add_location(span9, file$e, 263, 12, 9394);
    			attr_dev(li8, "class", "flex items-center");
    			add_location(li8, file$e, 247, 10, 8781);
    			add_location(ul2, file$e, 210, 8, 7359);
    			attr_dev(div20, "class", "flex flex-wrap mt-3 px-6");
    			add_location(div20, file$e, 209, 6, 7312);
    			attr_dev(button2, "class", "mt-3 text-lg font-semibold border-2 border-green-400 w-full\n          text-green-400 rounded px-4 py-2 block shadow-xl hover:border-blue-800\n          hover:bg-blue-800 hover:text-white");
    			add_location(button2, file$e, 269, 8, 9561);
    			attr_dev(div21, "class", "block flex items-center p-8");
    			add_location(div21, file$e, 268, 6, 9511);
    			attr_dev(div22, "class", "bg-white text-black rounded-lg shadow-inner shadow-lg\n      overflow-hidden");
    			add_location(div22, file$e, 194, 4, 6742);
    			attr_dev(div23, "class", "w-full max-w-sm sm:w-4/5 lg:w-1/3 sm:my-5 my-8 z-0 rounded shadow-lg");
    			add_location(div23, file$e, 192, 2, 6651);
    			attr_dev(div24, "class", "w-full m-auto flex flex-col md:flex-row items-center");
    			add_location(div24, file$e, 18, 0, 310);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoPricing_1",
    			options,
    			id: create_fragment$i.name
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

    const file$f = "src/quanta/1-views/2-molecules/OmoSubscribe.svelte";

    function create_fragment$j(ctx) {
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
    			add_location(div0, file$f, 26, 4, 612);
    			attr_dev(div1, "class", " m-0 p-0 text-2xl text-white italic font-light font-sans\n      antialiased text-center");
    			add_location(div1, file$f, 31, 4, 761);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "text-lg text-gray-600 w-2/3 px-6 rounded");
    			attr_dev(input, "placeholder", input_placeholder_value = /*quant*/ ctx[0].data.email);
    			add_location(input, file$f, 37, 6, 960);
    			attr_dev(button, "class", "py-3 px-4 w-1/3 bg-green-400 font-bold text-lg rounded text-white\n        hover:bg-blue-800");
    			attr_dev(button, "type", "button");
    			add_location(button, file$f, 41, 6, 1092);
    			attr_dev(div2, "class", " mt-3 flex flex-row flex-wrap");
    			add_location(div2, file$f, 36, 4, 910);
    			attr_dev(div3, "class", "p-10 py-20 flex flex-col flex-wrap justify-center content-center");
    			add_location(div3, file$f, 25, 2, 529);
    			attr_dev(div4, "class", "bg-cover bg-center h-auto text-white py-24 px-16 object-fill");
    			set_style(div4, "background-image", "url(" + /*quant*/ ctx[0].data.image + ")");
    			add_location(div4, file$f, 22, 0, 398);
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSubscribe",
    			options,
    			id: create_fragment$j.name
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

    const file$g = "src/quanta/1-views/1-atoms/OmoToggle.svelte";

    // (7:0) {#if omotoggle.status}
    function create_if_block_1$2(ctx) {
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
    			add_location(span0, file$g, 9, 6, 204);
    			attr_dev(input, "id", "checked");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "absolute opacity-0 w-0 h-0");
    			add_location(input, file$g, 14, 8, 511);
    			attr_dev(span1, "class", "absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0\n        left-0 focus-within:shadow-outline transition-transform duration-300\n        ease-in-out bg-gray-100 transform translate-x-full");
    			add_location(span1, file$g, 10, 6, 281);
    			attr_dev(span2, "class", "relative");
    			add_location(span2, file$g, 8, 4, 174);
    			attr_dev(label, "for", "checked");
    			attr_dev(label, "class", "mt-3 inline-flex items-center cursor-pointer");
    			add_location(label, file$g, 7, 2, 95);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(7:0) {#if omotoggle.status}",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if !omotoggle.status}
    function create_if_block$3(ctx) {
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
    			add_location(span0, file$g, 26, 6, 796);
    			attr_dev(input, "id", "unchecked");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "absolute opacity-0 w-0 h-0");
    			add_location(input, file$g, 31, 8, 1072);
    			attr_dev(span1, "class", "absolute block w-4 h-4 mt-1 ml-1 bg-white rounded-full shadow\n        inset-y-0 left-0 focus-within:shadow-outline transition-transform\n        duration-300 ease-in-out");
    			add_location(span1, file$g, 27, 6, 872);
    			attr_dev(span2, "class", "relative");
    			add_location(span2, file$g, 25, 4, 766);
    			attr_dev(label, "for", "unchecked");
    			attr_dev(label, "class", "mt-3 inline-flex items-center cursor-pointer");
    			add_location(label, file$g, 24, 2, 685);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(24:0) {#if !omotoggle.status}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*omotoggle*/ ctx[0].status && create_if_block_1$2(ctx);
    	let if_block1 = !/*omotoggle*/ ctx[0].status && create_if_block$3(ctx);

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
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*omotoggle*/ ctx[0].status) {
    				if (!if_block1) {
    					if_block1 = create_if_block$3(ctx);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { omotoggle: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoToggle",
    			options,
    			id: create_fragment$k.name
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
    const file$h = "src/quanta/1-views/2-molecules/OmoTable.svelte";

    function create_fragment$l(ctx) {
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
    			add_location(th0, file$h, 17, 12, 426);
    			attr_dev(th1, "class", "text-sm");
    			add_location(th1, file$h, 18, 12, 480);
    			attr_dev(th2, "class", "hidden md:table-cell text-sm");
    			add_location(th2, file$h, 19, 12, 522);
    			attr_dev(th3, "class", "hidden md:table-cell text-sm ");
    			add_location(th3, file$h, 20, 12, 587);
    			attr_dev(tr0, "class", " text-gray-600 text-left bg-gray-300 uppercase");
    			add_location(tr0, file$h, 16, 10, 354);
    			attr_dev(thead, "class", "");
    			add_location(thead, file$h, 15, 8, 327);
    			attr_dev(td0, "class", "pl-6 py-4");
    			add_location(td0, file$h, 25, 12, 796);
    			attr_dev(img0, "class", "hidden mr-1 md:mr-2 md:inline-block h-8 w-8 rounded\n                  object-cover");
    			if (img0.src !== (img0_src_value = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$h, 30, 16, 969);
    			add_location(span0, file$h, 29, 14, 946);
    			attr_dev(p0, "class", "text-gray-800 text-sm");
    			add_location(p0, file$h, 37, 16, 1366);
    			attr_dev(p1, "class", "md:hidden text-xs text-gray-600 font-medium");
    			add_location(p1, file$h, 38, 16, 1432);
    			attr_dev(p2, "class", "hidden md:table-cell text-xs text-gray-500 font-medium");
    			add_location(p2, file$h, 41, 16, 1553);
    			attr_dev(span1, "class", "py-4 w-40");
    			add_location(span1, file$h, 36, 14, 1325);
    			attr_dev(td1, "class", "flex inline-flex items-center");
    			add_location(td1, file$h, 28, 12, 889);
    			attr_dev(p3, "class", "text-sm text-gray-800 font-medium");
    			add_location(p3, file$h, 48, 14, 1785);
    			attr_dev(p4, "class", "text-xs text-gray-500 font-medium");
    			add_location(p4, file$h, 49, 14, 1858);
    			attr_dev(td2, "class", "hidden md:table-cell");
    			add_location(td2, file$h, 47, 12, 1737);
    			attr_dev(p5, "class", "text-sm text-gray-700 font-medium");
    			add_location(p5, file$h, 52, 14, 2001);
    			attr_dev(td3, "class", "hidden md:table-cell");
    			add_location(td3, file$h, 51, 12, 1953);
    			attr_dev(tr1, "class", "accordion border-b border-grey-light hover:bg-gray-100");
    			add_location(tr1, file$h, 24, 10, 716);
    			attr_dev(td4, "class", "pl-6 py-4");
    			add_location(td4, file$h, 57, 12, 2190);
    			attr_dev(img1, "class", "hidden mr-1 md:mr-2 md:inline-block h-8 w-8 rounded\n                  object-cover");
    			if (img1.src !== (img1_src_value = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$h, 62, 16, 2364);
    			add_location(span2, file$h, 61, 14, 2341);
    			attr_dev(p6, "class", "text-gray-800 text-sm");
    			add_location(p6, file$h, 69, 16, 2761);
    			attr_dev(p7, "class", "md:hidden text-xs text-gray-600 font-medium");
    			add_location(p7, file$h, 70, 16, 2827);
    			attr_dev(p8, "class", "hidden md:table-cell text-xs text-gray-500 font-medium");
    			add_location(p8, file$h, 73, 16, 2948);
    			attr_dev(span3, "class", "py-3 w-40");
    			add_location(span3, file$h, 68, 14, 2720);
    			attr_dev(td5, "class", "flex inline-flex items-center");
    			add_location(td5, file$h, 60, 12, 2284);
    			attr_dev(p9, "class", "text-sm text-gray-800 font-medium");
    			add_location(p9, file$h, 80, 14, 3180);
    			attr_dev(p10, "class", "text-xs text-gray-500 font-medium");
    			add_location(p10, file$h, 81, 14, 3253);
    			attr_dev(td6, "class", "hidden md:table-cell");
    			add_location(td6, file$h, 79, 12, 3132);
    			attr_dev(p11, "class", "text-sm text-gray-700 font-medium");
    			add_location(p11, file$h, 84, 14, 3395);
    			attr_dev(td7, "class", "hidden md:table-cell");
    			add_location(td7, file$h, 83, 12, 3347);
    			attr_dev(tr2, "class", "accordion border-b border-grey-light hover:bg-gray-100");
    			add_location(tr2, file$h, 56, 10, 2110);
    			attr_dev(tbody, "class", "bg-white");
    			add_location(tbody, file$h, 23, 8, 681);
    			attr_dev(table, "class", "w-full shadow-lg rounded ");
    			add_location(table, file$h, 14, 6, 277);
    			set_style(div0, "overflow-x", "auto");
    			add_location(div0, file$h, 13, 4, 240);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$h, 12, 2, 212);
    			attr_dev(div2, "class", "container mx-auto");
    			add_location(div2, file$h, 11, 0, 178);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { omotoggle: 0, omotoggle2: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoTable",
    			options,
    			id: create_fragment$l.name
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

    const file$i = "src/quanta/1-views/2-molecules/OmoAccordion.svelte";

    function create_fragment$m(ctx) {
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
    			add_location(path0, file$i, 11, 10, 482);
    			attr_dev(svg0, "class", "w-3 h-3 fill-current");
    			attr_dev(svg0, "viewBox", "0 -192 469.33333 469");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$i, 7, 8, 341);
    			attr_dev(span0, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span0, file$i, 6, 6, 262);
    			attr_dev(div0, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div0, file$i, 2, 4, 63);
    			attr_dev(p0, "class", "text-gray-600 mb-3");
    			add_location(p0, file$i, 19, 6, 792);
    			attr_dev(p1, "class", "text-gray-600");
    			add_location(p1, file$i, 26, 6, 1201);
    			attr_dev(div1, "class", "p-3");
    			add_location(div1, file$i, 18, 4, 768);
    			attr_dev(div2, "class", "mb-4");
    			add_location(div2, file$i, 1, 2, 40);
    			attr_dev(path1, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path1, file$i, 44, 10, 2006);
    			attr_dev(svg1, "class", "w-3 h-3 fill-current");
    			attr_dev(svg1, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$i, 40, 8, 1862);
    			attr_dev(span1, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span1, file$i, 39, 6, 1783);
    			attr_dev(div3, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div3, file$i, 35, 4, 1584);
    			attr_dev(div4, "class", "mb-4");
    			add_location(div4, file$i, 34, 2, 1561);
    			attr_dev(path2, "d", "m437.332031\n            192h-160v-160c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062\n            0-32 14.335938-32 32v160h-160c-17.664062 0-32 14.335938-32\n            32v21.332031c0 17.664063 14.335938 32 32 32h160v160c0 17.664063\n            14.335938 32 32 32h21.332031c17.664063 0 32-14.335937\n            32-32v-160h160c17.664063 0 32-14.335937\n            32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0");
    			add_location(path2, file$i, 66, 10, 2948);
    			attr_dev(svg2, "class", "w-3 h-3 fill-current");
    			attr_dev(svg2, "viewBox", "0 0 469.33333 469.33333");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$i, 62, 8, 2804);
    			attr_dev(span2, "class", "h-6 w-6 flex items-center justify-center text-green-400");
    			add_location(span2, file$i, 61, 6, 2725);
    			attr_dev(div5, "class", "flex items-center justify-between bg-gray-200 pl-3 pr-2 py-3 w-full\n      rounded text-gray-600 font-bold cursor-pointer hover:bg-gray-300");
    			add_location(div5, file$i, 57, 4, 2526);
    			attr_dev(div6, "class", "mb-4");
    			add_location(div6, file$i, 56, 2, 2503);
    			attr_dev(div7, "class", "bg-white mx-auto w-full");
    			add_location(div7, file$i, 0, 0, 0);
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoAccordion",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/quanta/1-views/1-atoms/OmoIconsFA.svelte generated by Svelte v3.20.1 */

    const file$j = "src/quanta/1-views/1-atoms/OmoIconsFA.svelte";

    function create_fragment$n(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$j, 0, 0, 0);
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoIconsFA",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoMenuVertical.svelte generated by Svelte v3.20.1 */
    const file$k = "src/quanta/1-views/2-molecules/OmoMenuVertical.svelte";

    function create_fragment$o(ctx) {
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
    			add_location(i0, file$k, 23, 4, 522);
    			attr_dev(span0, "class", "cursor-pointer hover:text-gray-500 px-1 block mb-2");
    			add_location(span0, file$k, 22, 2, 452);
    			attr_dev(i1, "class", "fas fa-search p-2 bg-gray-300 rounded");
    			add_location(i1, file$k, 26, 4, 648);
    			attr_dev(span1, "class", "cursor-pointer hover:text-gray-500 px-1 block");
    			add_location(span1, file$k, 25, 2, 583);
    			attr_dev(div, "class", "w-16 h-full pt-4 pb-4 bg-gray-200 text-blue-900 text-center shadow-lg");
    			add_location(div, file$k, 20, 0, 364);
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoMenuVertical",
    			options,
    			id: create_fragment$o.name
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
    const file$l = "src/quanta/1-views/2-molecules/OmoMenuHorizontal.svelte";

    function create_fragment$p(ctx) {
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
    	let i0;
    	let t2;
    	let span1;
    	let t4;
    	let a2;
    	let span4;
    	let i1;
    	let t5;
    	let span3;
    	let t7;
    	let span5;
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
    			i0 = element("i");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Quanta";
    			t4 = space();
    			a2 = element("a");
    			span4 = element("span");
    			i1 = element("i");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Editor";
    			t7 = space();
    			span5 = element("span");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "/images/logo_single.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "alt placeholder");
    			attr_dev(img0, "class", "h-8 -my-1 inline mx-auto");
    			add_location(img0, file$l, 10, 8, 290);
    			attr_dev(span0, "class", "pl-1 pr-3 mr-2 border-r border-gray-800");
    			add_location(span0, file$l, 9, 6, 227);
    			attr_dev(a0, "href", "/home");
    			add_location(a0, file$l, 8, 4, 204);
    			attr_dev(i0, "class", "fas fa-th p-2 bg-gray-800 rounded");
    			add_location(i0, file$l, 27, 8, 819);
    			attr_dev(span1, "class", "mx-1");
    			add_location(span1, file$l, 28, 8, 875);
    			attr_dev(span2, "class", "px-1 hover:text-white cursor-pointer");
    			add_location(span2, file$l, 26, 6, 759);
    			attr_dev(a1, "href", "/quanta");
    			add_location(a1, file$l, 25, 4, 734);
    			attr_dev(i1, "class", "fas fa-th p-2 bg-gray-800 rounded");
    			add_location(i1, file$l, 33, 8, 1020);
    			attr_dev(span3, "class", "mx-1");
    			add_location(span3, file$l, 34, 8, 1076);
    			attr_dev(span4, "class", "px-1 hover:text-white cursor-pointer");
    			add_location(span4, file$l, 32, 6, 960);
    			attr_dev(a2, "href", "/editor");
    			add_location(a2, file$l, 31, 4, 935);
    			if (img1.src !== (img1_src_value = "/images/samuel.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "alt placeholder");
    			attr_dev(img1, "class", "h-8 inline mx-auto rounded border border-gray-600");
    			add_location(img1, file$l, 53, 6, 1766);
    			attr_dev(span5, "class", "cursor-pointer relative float-right");
    			add_location(span5, file$l, 52, 4, 1709);
    			attr_dev(div0, "class", "p-2 w-full text-gray-600 bg-gray-900 shadow-lg ");
    			add_location(div0, file$l, 7, 2, 138);
    			attr_dev(div1, "class", "pb-0 w-full flex flex-wrap");
    			add_location(div1, file$l, 6, 0, 95);
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
    			append_dev(span2, i0);
    			append_dev(span2, t2);
    			append_dev(span2, span1);
    			append_dev(div0, t4);
    			append_dev(div0, a2);
    			append_dev(a2, span4);
    			append_dev(span4, i1);
    			append_dev(span4, t5);
    			append_dev(span4, span3);
    			append_dev(div0, t7);
    			append_dev(div0, span5);
    			append_dev(span5, img1);
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
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoMenuHorizontal",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoCardGroup.svelte generated by Svelte v3.20.1 */

    const file$m = "src/quanta/1-views/2-molecules/OmoCardGroup.svelte";

    function create_fragment$q(ctx) {
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
    			add_location(div0, file$m, 28, 8, 626);
    			if (img0.src !== (img0_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "h-40 rounded-lg w-full object-cover object-center");
    			add_location(img0, file$m, 33, 8, 825);
    			if (img1.src !== (img1_src_value = /*quant*/ ctx[0].data.user)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "rounded-full -mt-16 border-8 object-center object-cover\n            border-white mr-2 h-32 w-32");
    			add_location(img1, file$m, 37, 10, 986);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$m, 36, 8, 942);
    			attr_dev(div2, "class", "font-bold font-title text-xl text-center");
    			add_location(div2, file$m, 43, 10, 1201);
    			attr_dev(div3, "class", "text-sm font-light text-center my-2");
    			add_location(div3, file$m, 46, 10, 1313);
    			attr_dev(div4, "class", "py-2 px-2");
    			add_location(div4, file$m, 42, 8, 1167);
    			attr_dev(div5, "class", "bg-white relative shadow p-2 rounded-lg text-gray-800\n        hover:shadow-lg");
    			add_location(div5, file$m, 25, 6, 518);
    			attr_dev(a, "href", "/");
    			add_location(a, file$m, 24, 4, 499);
    			attr_dev(div6, "class", "w-full m-auto md:w-1/2 lg:w-1/2");
    			add_location(div6, file$m, 23, 2, 449);
    			attr_dev(div7, "class", "flex flex-wrap ");
    			add_location(div7, file$m, 22, 0, 417);
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
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardGroup",
    			options,
    			id: create_fragment$q.name
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

    const file$n = "src/quanta/1-views/2-molecules/OmoCardProduct.svelte";

    function create_fragment$r(ctx) {
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
    			add_location(h10, file$n, 26, 6, 639);
    			attr_dev(p, "class", "text-gray-600 text-sm mt-1");
    			add_location(p, file$n, 29, 6, 750);
    			attr_dev(div0, "class", "text-xs text-blue-600 font-bold ");
    			add_location(div0, file$n, 30, 6, 823);
    			attr_dev(div1, "class", "px-4 py-2");
    			add_location(div1, file$n, 25, 4, 609);
    			attr_dev(img, "class", "h-56 w-full object-cover mt-2");
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].data.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "NIKE AIR");
    			add_location(img, file$n, 32, 4, 895);
    			attr_dev(h11, "class", "text-gray-200 font-bold text-xl");
    			add_location(h11, file$n, 38, 6, 1093);
    			attr_dev(button, "class", "px-3 py-1 bg-green-400 text-sm text-white hover:bg-blue-800\n        font-semibold rounded");
    			add_location(button, file$n, 39, 6, 1167);
    			attr_dev(div2, "class", "flex items-center justify-between px-4 py-2 bg-gray-900 rounded-b");
    			add_location(div2, file$n, 36, 4, 1001);
    			attr_dev(div3, "class", "bg-white shadow-lg rounded");
    			add_location(div3, file$n, 24, 2, 564);
    			attr_dev(div4, "class", "flex flex-col bg-white max-w-sm mx-auto rounded shadow-lg");
    			add_location(div4, file$n, 23, 0, 490);
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
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardProduct",
    			options,
    			id: create_fragment$r.name
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

    const file$o = "src/quanta/1-views/2-molecules/OmoCardUser.svelte";

    function create_fragment$s(ctx) {
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
    			add_location(img, file$o, 18, 2, 276);
    			attr_dev(path0, "d", "M256 48C150 48 64 136.2 64 245.1v153.3c0 36.3 28.6 65.7 64\n        65.7h64V288h-85.3v-42.9c0-84.7 66.8-153.3 149.3-153.3s149.3 68.5 149.3\n        153.3V288H320v176h64c35.4 0 64-29.3 64-65.7V245.1C448 136.2 362 48 256\n        48z");
    			add_location(path0, file$o, 24, 6, 640);
    			attr_dev(svg0, "class", "h-6 w-6 text-white fill-current");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			add_location(svg0, file$o, 23, 4, 566);
    			attr_dev(h10, "class", "mx-3 text-white font-semibold text-lg");
    			add_location(h10, file$o, 30, 4, 905);
    			attr_dev(div0, "class", "flex items-center px-6 py-3 bg-gray-900");
    			add_location(div0, file$o, 22, 2, 508);
    			attr_dev(h11, "class", "text-xl font-title uppercase text-blue-900 font-bold");
    			add_location(h11, file$o, 33, 4, 1008);
    			attr_dev(p, "class", "py-2 text-md text-gray-700");
    			add_location(p, file$o, 36, 4, 1108);
    			attr_dev(path1, "d", "M239.208 343.937c-17.78 10.103-38.342 15.876-60.255 15.876-21.909\n          0-42.467-5.771-60.246-15.87C71.544 358.331 42.643 406 32\n          448h293.912c-10.639-42-39.537-89.683-86.704-104.063zM178.953\n          120.035c-58.479 0-105.886 47.394-105.886 105.858 0 58.464 47.407\n          105.857 105.886 105.857s105.886-47.394\n          105.886-105.857c0-58.464-47.408-105.858-105.886-105.858zm0\n          186.488c-33.671 0-62.445-22.513-73.997-50.523H252.95c-11.554\n          28.011-40.326 50.523-73.997 50.523z");
    			add_location(path1, file$o, 42, 8, 1377);
    			attr_dev(path2, "d", "M322.602 384H480c-10.638-42-39.537-81.691-86.703-96.072-17.781\n            10.104-38.343 15.873-60.256 15.873-14.823\n            0-29.024-2.654-42.168-7.49-7.445 12.47-16.927 25.592-27.974\n            34.906C289.245 341.354 309.146 364 322.602 384zM306.545\n            200h100.493c-11.554 28-40.327 50.293-73.997 50.293-8.875\n            0-17.404-1.692-25.375-4.51a128.411 128.411 0 0 1-6.52 25.118c10.066\n            3.174 20.779 4.862 31.895 4.862 58.479 0 105.886-47.41\n            105.886-105.872 0-58.465-47.407-105.866-105.886-105.866-37.49\n            0-70.427 19.703-89.243 49.09C275.607 131.383 298.961 163 306.545\n            200z");
    			add_location(path2, file$o, 52, 10, 1936);
    			add_location(g, file$o, 51, 8, 1922);
    			attr_dev(svg1, "class", "h-6 w-6 fill-current");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			add_location(svg1, file$o, 41, 6, 1312);
    			attr_dev(h12, "class", "px-2 text-sm");
    			add_location(h12, file$o, 65, 6, 2634);
    			attr_dev(div1, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div1, file$o, 40, 4, 1255);
    			attr_dev(path3, "d", "M256 32c-88.004 0-160 70.557-160 156.801C96 306.4 256 480 256\n          480s160-173.6 160-291.199C416 102.557 344.004 32 256 32zm0\n          212.801c-31.996 0-57.144-24.645-57.144-56 0-31.357 25.147-56\n          57.144-56s57.144 24.643 57.144 56c0 31.355-25.148 56-57.144 56z");
    			add_location(path3, file$o, 69, 8, 2812);
    			attr_dev(svg2, "class", "h-6 w-6 fill-current");
    			attr_dev(svg2, "viewBox", "0 0 512 512");
    			add_location(svg2, file$o, 68, 6, 2747);
    			attr_dev(h13, "class", "px-2 text-sm");
    			add_location(h13, file$o, 75, 6, 3130);
    			attr_dev(div2, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div2, file$o, 67, 4, 2690);
    			attr_dev(path4, "d", "M437.332 80H74.668C51.199 80 32 99.198 32 122.667v266.666C32\n          412.802 51.199 432 74.668 432h362.664C460.801 432 480 412.802 480\n          389.333V122.667C480 99.198 460.801 80 437.332 80zM432 170.667L256 288\n          80 170.667V128l176 117.333L432 128v42.667z");
    			add_location(path4, file$o, 79, 8, 3308);
    			attr_dev(svg3, "class", "h-6 w-6 fill-current");
    			attr_dev(svg3, "viewBox", "0 0 512 512");
    			add_location(svg3, file$o, 78, 6, 3243);
    			attr_dev(h14, "class", "px-2 text-sm");
    			add_location(h14, file$o, 85, 6, 3620);
    			attr_dev(div3, "class", "flex items-center mt-4 text-gray-700");
    			add_location(div3, file$o, 77, 4, 3186);
    			attr_dev(div4, "class", "py-4 px-6");
    			add_location(div4, file$o, 32, 2, 980);
    			attr_dev(div5, "class", "m-auto max-w-sm bg-white shadow-lg rounded-lg");
    			add_location(div5, file$o, 17, 0, 214);
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoCardUser",
    			options,
    			id: create_fragment$s.name
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

    const file$p = "src/quanta/1-views/2-molecules/OmoSteps.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (23:4) {#each quant.data.steps as step, i}
    function create_each_block$2(ctx) {
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
    			add_location(img, file$p, 24, 8, 521);
    			attr_dev(div0, "class", "text-2xl text-center text-blue-800 mb-2 flex flex-wrap\n          justify-center content-center font-title uppercase font-bold");
    			add_location(div0, file$p, 29, 8, 656);
    			attr_dev(div1, "class", "text-gray-600");
    			add_location(div1, file$p, 34, 8, 852);
    			attr_dev(div2, "class", "w-1/3 px-6 content-center text-center");
    			add_location(div2, file$p, 23, 6, 461);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:4) {#each quant.data.steps as step, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*quant*/ ctx[0].data.steps;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex content-start flex-wrap");
    			add_location(div0, file$p, 21, 2, 372);
    			attr_dev(div1, "class", "bg-white flex justify-center0");
    			add_location(div1, file$p, 20, 0, 326);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoSteps_1",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoSteps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoSteps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoNotifications.svelte generated by Svelte v3.20.1 */
    const file$q = "src/quanta/1-views/2-molecules/OmoNotifications.svelte";

    function create_fragment$u(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Add Notification";
    			attr_dev(button, "class", "bg-blue-800 text-white py-2 px-4");
    			add_location(button, file$q, 26, 0, 453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
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
    	const { addNotification } = getNotificationsContext();

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoNotifications> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoNotifications", $$slots, []);

    	const click_handler = () => addNotification({
    		text: "Notification",
    		position: "top-right"
    	});

    	$$self.$set = $$props => {
    		if ("quant" in $$props) $$invalidate(1, quant = $$props.quant);
    	};

    	$$self.$capture_state = () => ({
    		getNotificationsContext,
    		addNotification,
    		quant
    	});

    	$$self.$inject_state = $$props => {
    		if ("quant" in $$props) $$invalidate(1, quant = $$props.quant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [addNotification, quant, click_handler];
    }

    class OmoNotifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { quant: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoNotifications",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get quant() {
    		throw new Error("<OmoNotifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quant(value) {
    		throw new Error("<OmoNotifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoResponsive.svelte generated by Svelte v3.20.1 */

    function create_fragment$v(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Responsive Test");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
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

    function instance$v($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoResponsive> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoResponsive", $$slots, []);
    	return [];
    }

    class OmoResponsive extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoResponsive",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    const quanta = writable([{
        id: "q0",
        component: OmoNavbar,
        model: {
          id: "m0",
          name: "Omo Navbar",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {
          id: "d0",
        },
      },
      {
        id: "q1",
        component: OmoHeader,
        model: {
          id: "m1",
          name: "Omo Header",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {
          layout: "py-20 bg-white",
          title: "text-blue-900 font-bold font-title",
          subline: "text-gray-500 italic font-light font-sans tracking-wide",
          illustration: "w-1/2",
        },
        data: {
          id: "d1",
          title: "title from store",
          subline: "subline from store",
          illustration: "/images/through_the_park.svg",
        },
      },
      {
        id: "q2",
        component: OmoVideo,
        model: {
          id: "m2",
          name: "Omo Video",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {
          id: "d2",
          title: "title set from store",
          link: "https://player.vimeo.com/video/349650067",
        },
      },
      {
        id: "q3",
        component: OmoHero,
        model: {
          id: "m3",
          name: "Omo Hero",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {
          layout: "bg-white p-20",
        },
        data: {
          id: "d3",
          title: "hero set by store ",
          subline: "hero subtitle message",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
          illustration: "/images/progressive_app.svg",
          button: "Call to Action",
        },
      },
      {
        id: "q55",
        component: OmoSteps_1,
        model: {
          id: "m55",
          name: "Omo Steps",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {
          id: "d3",
          steps: [{
              title: "Step 1",
              description: "description 1",
              image: "/images/progressive_app.svg",
            },
            {
              title: "Step 2",
              description: "description 2",
              image: "/images/online_messaging.svg",
            },
            {
              title: "Step 3",
              description: "description 3",
              image: "images/shopping_app.svg",
            },
          ],
        },
      },
      {
        id: "q44",
        component: OmoBanner,
        model: {
          id: "m44",
          name: "Omo Banner",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {
          uptitle: "Uptitle",
          title: "Title",
          subtitle: "subtitle",
          image: "https://source.unsplash.com/random",
          button: "call to action",
        },
      },
      {
        id: "q5",
        component: OmoCities,
        model: {
          id: "m5",
          name: "Omo Cities",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "organism",
        },
        design: {
          grid: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        },
        data: [],
      },
      {
        id: "q8",
        component: OmoPricing_1,
        model: {
          id: "m8",
          name: "Omo Pricing",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: [],
      },
      {
        id: "q10",
        component: OmoSubscribe,
        model: {
          id: "m10",
          name: "Omo Subscribe",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {
          layout: "",
        },
        data: {
          id: "d10",
          title: "Get Our Updates",
          subline: "Find out about events and other news",
          email: "john@mail.com",
          image: "https://source.unsplash.com/random",
          button: "Subscribe",
        },
      },
      {
        id: "q11",
        component: OmoTable,
        model: {
          id: "m11",
          name: "Omo Table",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: [],
      },
      {
        id: "q11",
        component: OmoAccordion,
        model: {
          id: "m11",
          name: "Omo Pricing",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: [],
      },
      {
        id: "q4",
        component: OmoCardArticle,
        model: {
          id: "m4",
          name: "Omo Card Article",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {
          layout: "bg-gray-100 border border-gray-100 rounded-lg shadow-sm py-16",
        },
        data: {
          id: "d4",
          tag: "#tag",
          excerpt: "Build Your New Idea with Laravel Framework.",
          image: "https://randomuser.me/api/portraits/women/21.jpg",
          author: "John Doe",
          date: "Mar 10, 2018",
        },
      },
      {
        id: "q6",
        component: OmoMenuVertical,
        model: {
          id: "m6",
          name: "Omo Menu Vertical",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: [],
      },
      {
        id: "q7",
        component: OmoMenuHorizontal,
        model: {
          id: "m7",
          name: "Omo Menu Horizontal",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: [],
      },
      {
        id: "q20",
        component: OmoCardGroup,
        model: {
          name: "Omo Card Group",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {
          id: "",
          follower: "10",
          name: "Group Name",
          description: "group description",
          image: "https://source.unsplash.com/random",
          user: "https://randomuser.me/api/portraits/women/21.jpg",
        },
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
          tags: "molecule",
        },
        design: {},
        data: {
          id: "d33    ",
          name: "PRODUCT NAME",
          description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
          image: "https://source.unsplash.com/random",
          price: "129€",
          button: "Add to Card",
        },
      },
      {
        id: "q88",
        component: OmoCardUser,
        model: {
          id: "m88",
          name: "Omo Card User",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {},
      },
      {
        id: "q111",
        component: OmoNotifications,
        model: {
          id: "m111",
          name: "Omo Notifications",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {},
      },
      {
        id: "q1111",
        component: OmoResponsive,
        model: {
          id: "m1111",
          name: "Omo Responsive",
          image: "/images/samuel.jpg",
          author: "Samuel Andert",
          type: "view",
          group: "omo",
          tags: "molecule",
        },
        design: {},
        data: {},
      },
    ]);

    /* src/quanta/1-views/5-pages/Home.svelte generated by Svelte v3.20.1 */
    const file$r = "src/quanta/1-views/5-pages/Home.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (15:2) {#each $quanta as quant}
    function create_each_block$3(ctx) {
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
    			add_location(div, file$r, 15, 4, 774);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(15:2) {#each $quanta as quant}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
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

    			attr_dev(div, "class", "bg-image p-10 svelte-2nh93m");
    			add_location(div, file$r, 13, 0, 715);
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
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$w.name
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
    const file$s = "src/quanta/1-views/5-pages/User.svelte";

    function create_fragment$x(ctx) {
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
    			add_location(div0, file$s, 9, 0, 249);
    			set_style(p, "font-family", "'Permanent Marker', cursive", 1);
    			add_location(p, file$s, 17, 2, 581);
    			attr_dev(div1, "class", "text-5xl text-center px-4 py-16 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$s, 14, 0, 458);
    			attr_dev(div2, "class", "flex justify-center");
    			add_location(div2, file$s, 23, 4, 766);
    			attr_dev(div3, "class", "w-5/6 xl:w-4/6");
    			add_location(div3, file$s, 22, 2, 733);
    			attr_dev(div4, "class", "flex justify-center my-10");
    			add_location(div4, file$s, 21, 0, 691);
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
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { db: 1, user: 0, currentId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$x.name
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
    const file$t = "src/quanta/1-views/5-pages/City.svelte";

    function create_fragment$y(ctx) {
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
    			add_location(img, file$t, 9, 2, 225);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$t, 8, 0, 208);
    			attr_dev(p, "class", "font-title uppercase font-bold");
    			add_location(p, file$t, 19, 2, 477);
    			attr_dev(div1, "class", "text-4xl text-center px-4 py-12 text-gray-200 bg-blue-800 flex\n  flex-wrap justify-center content-center");
    			add_location(div1, file$t, 16, 0, 354);
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
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$y.name
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

    const file$u = "src/quanta/1-views/2-molecules/OmoQuantPreview.svelte";

    function create_fragment$z(ctx) {
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
    			add_location(div0, file$u, 26, 2, 1371);
    			attr_dev(div1, "class", "w-100 bg-green-200 overflow-hidden h-48 overflow-y-scroll object-center\n  object-cover border border-gray-300 bg-image svelte-nu1sos");
    			add_location(div1, file$u, 23, 0, 1234);
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
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantPreview",
    			options,
    			id: create_fragment$z.name
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
    const file$v = "src/quanta/1-views/2-molecules/OmoQuantaItem.svelte";

    function create_fragment$A(ctx) {
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
    			add_location(a0, file$v, 8, 4, 227);
    			attr_dev(div0, "class", "py-2 px-3 bg-gray-100");
    			add_location(div0, file$v, 7, 2, 187);
    			if (img.src !== (img_src_value = /*quant*/ ctx[0].model.image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "w-10 h-10 object-cover rounded");
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$v, 16, 6, 478);
    			add_location(br, file$v, 22, 8, 696);
    			attr_dev(span, "class", "font-light text-xs text-gray-500");
    			add_location(span, file$v, 23, 8, 711);
    			attr_dev(a1, "class", "text-gray-700 text-sm mx-3");
    			attr_dev(a1, "href", a1_href_value = "/quant?id=" + /*quant*/ ctx[0].id);
    			add_location(a1, file$v, 20, 6, 592);
    			attr_dev(div1, "class", "flex items-center");
    			add_location(div1, file$v, 15, 4, 440);
    			attr_dev(div2, "class", "pb-2 px-3 flex justify-between items-center mt-2");
    			add_location(div2, file$v, 14, 2, 373);
    			attr_dev(div3, "class", "bg-white max-w-sm rounded shadow-md border");
    			add_location(div3, file$v, 5, 0, 98);
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
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { quant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantaItem",
    			options,
    			id: create_fragment$A.name
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
    const file$w = "src/quanta/1-views/5-pages/Quanta.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:2) {#each $quanta as item}
    function create_each_block$4(ctx) {
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(9:2) {#each $quanta as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let div;
    	let current;
    	let each_value = /*$quanta*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
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
    			add_location(div, file$w, 5, 0, 138);
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
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quanta",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/quanta/1-views/5-pages/Quant.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$x = "src/quanta/1-views/5-pages/Quant.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
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
    			add_location(label, file$x, 35, 12, 1610);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$x, 36, 12, 1673);
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
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[4] != "id" && /*key*/ ctx[4] != "image" && create_if_block_2(ctx);

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
    			if (/*key*/ ctx[4] != "id" && /*key*/ ctx[4] != "image") if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    function create_if_block_1$3(ctx) {
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
    			add_location(label, file$x, 52, 12, 2132);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$x, 53, 12, 2195);
    			add_location(div, file$x, 51, 10, 2114);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(51:8) {#if key != 'id'}",
    		ctx
    	});

    	return block;
    }

    // (50:6) {#each Object.entries(quant.design) as [key, value]}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[4] != "id" && create_if_block_1$3(ctx);

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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(50:6) {#each Object.entries(quant.design) as [key, value]}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if key != 'id'}
    function create_if_block$4(ctx) {
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
    			add_location(label, file$x, 69, 12, 2650);
    			attr_dev(input, "class", "w-full text-sm text-blue rounded border border-gray-300\n              px-2 py-1");
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$x, 70, 12, 2713);
    			add_location(div, file$x, 68, 10, 2632);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(68:8) {#if key != 'id'}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#each Object.entries(quant.data) as [key, value]}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[4] != "id" && create_if_block$4(ctx);

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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(67:6) {#each Object.entries(quant.data) as [key, value]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
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
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Object.entries(/*quant*/ ctx[0].data);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
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
    			add_location(div0, file$x, 18, 2, 946);
    			attr_dev(div1, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div1, file$x, 26, 6, 1240);
    			attr_dev(div2, "class", "flex flex-wrap");
    			add_location(div2, file$x, 29, 6, 1353);
    			attr_dev(div3, "class", "mb-4");
    			add_location(div3, file$x, 25, 4, 1215);
    			attr_dev(div4, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div4, file$x, 46, 6, 1918);
    			attr_dev(div5, "class", "mb-4");
    			add_location(div5, file$x, 45, 4, 1893);
    			attr_dev(div6, "class", "text-sm uppercase text-blue-900 font-title font-bold");
    			add_location(div6, file$x, 63, 6, 2440);
    			attr_dev(div7, "class", "mb-4");
    			add_location(div7, file$x, 62, 4, 2415);
    			attr_dev(div8, "class", "p-6 h-full overflow-hidden overflow-y-scroll bg-gray-100 border-l\n    border-gray-300");
    			set_style(div8, "width", "300px");
    			add_location(div8, file$x, 21, 2, 1082);
    			attr_dev(div9, "class", "h-full w-full flex");
    			add_location(div9, file$x, 17, 0, 911);
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
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
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
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
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
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, { currentId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quant",
    			options,
    			id: create_fragment$C.name
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

    /* src/quanta/1-views/3-organisms/OmoFlow.svelte generated by Svelte v3.20.1 */

    const file$y = "src/quanta/1-views/3-organisms/OmoFlow.svelte";

    function create_fragment$D(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "OmoFlow";
    			add_location(h1, file$y, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OmoFlow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OmoFlow", $$slots, []);
    	return [];
    }

    class OmoFlow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoFlow",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/quanta/1-views/5-pages/Editor.svelte generated by Svelte v3.20.1 */
    const file$z = "src/quanta/1-views/5-pages/Editor.svelte";

    function create_fragment$E(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let current;
    	const omoflow = new OmoFlow({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = text("Editor\n");
    			br = element("br");
    			t1 = text("\nFlow:\n");
    			create_component(omoflow.$$.fragment);
    			add_location(br, file$z, 5, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(omoflow, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(omoflow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(omoflow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			destroy_component(omoflow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Editor", $$slots, []);
    	$$self.$capture_state = () => ({ OmoFlow });
    	return [];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    const router = {
        '/': Home,
        '/home': Home,
        '/user': User,
        '/city': City,
        '/quant': Quant,
        '/quanta': Quanta,
        '/editor': Editor,
    };
    const curRoute = writable('/home');
    const curId = writable(0);

    /* src/quanta/1-views/0-themes/OmoDesignBase.svelte generated by Svelte v3.20.1 */

    function create_fragment$F(ctx) {
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
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props) {
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
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignBase",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoDesignUtilities.svelte generated by Svelte v3.20.1 */

    function create_fragment$G(ctx) {
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
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props) {
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
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoDesignUtilities",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src/quanta/1-views/0-themes/OmoThemeLight.svelte generated by Svelte v3.20.1 */

    function create_fragment$H(ctx) {
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
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoThemeLight",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src/quanta/1-views/2-molecules/OmoQuantaList.svelte generated by Svelte v3.20.1 */
    const file$A = "src/quanta/1-views/2-molecules/OmoQuantaList.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (10:2) {#each $quanta as quant}
    function create_each_block$6(ctx) {
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
    			add_location(br, file$A, 15, 8, 502);
    			attr_dev(span, "class", "text-gray-500 text-xs");
    			add_location(span, file$A, 16, 8, 517);
    			attr_dev(div, "class", "mb-2 text-sm text-blue-900 rounded border-gray-200 border\n        bg-white px-4 py-2");
    			add_location(div, file$A, 11, 6, 360);
    			attr_dev(a, "href", a_href_value = "quant?id=" + /*quant*/ ctx[1].id);
    			attr_dev(a, "class", "cursor-pointer");
    			add_location(a, file$A, 10, 4, 300);
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(10:2) {#each $quanta as quant}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$I(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let each_value = /*$quanta*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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
    			add_location(div0, file$A, 6, 2, 171);
    			attr_dev(div1, "class", "ml-4 grid grid-cols-1 mr-4 mt-4");
    			add_location(div1, file$A, 5, 0, 123);
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
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
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
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoQuantaList",
    			options,
    			id: create_fragment$I.name
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
    const file$B = "src/quanta/1-views/4-layouts/OmoLayoutEditor.svelte";

    function create_fragment$J(ctx) {
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
    			add_location(div0, file$B, 33, 4, 942);
    			add_location(header, file$B, 32, 2, 929);
    			attr_dev(div1, "class", "border-r border-gray-200");
    			add_location(div1, file$B, 38, 4, 1160);
    			attr_dev(div2, "class", "overflow-y-scroll bg-gray-100 border-t border-r border-gray-200");
    			set_style(div2, "width", "220px");
    			add_location(div2, file$B, 41, 4, 1240);
    			attr_dev(div3, "class", "h-full w-full");
    			add_location(div3, file$B, 47, 6, 1442);
    			attr_dev(div4, "class", "h-full flex-1 overflow-y-scroll");
    			add_location(div4, file$B, 46, 4, 1390);
    			attr_dev(div5, "class", "h-full flex overflow-hidden");
    			add_location(div5, file$B, 37, 2, 1114);
    			add_location(footer, file$B, 52, 2, 1576);
    			attr_dev(div6, "class", "h-full flex flex-col");
    			add_location(div6, file$B, 31, 0, 892);
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
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation(event) {
    	curRoute.set(event.state.path);
    }

    function instance$J($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OmoLayoutEditor",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$C = "src/App.svelte";

    // (33:0) <Notifications>
    function create_default_slot$3(ctx) {
    	let div;
    	let current;
    	const omolayouteditor = new OmoLayoutEditor({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(omolayouteditor.$$.fragment);
    			attr_dev(div, "class", "h-screen w-screen");
    			add_location(div, file$C, 33, 2, 909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(omolayouteditor, div, null);
    			current = true;
    		},
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(33:0) <Notifications>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$K(ctx) {
    	let current;
    	let dispose;

    	const notifications = new Notifications({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notifications.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			mount_component(notifications, target, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window_1, "popstate", handlerBackNavigation$1, false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const notifications_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				notifications_changes.$$scope = { dirty, ctx };
    			}

    			notifications.$set(notifications_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notifications.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notifications.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notifications, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlerBackNavigation$1(event) {
    	curRoute.set(event.state.path);
    }

    function instance$K($$self, $$props, $$invalidate) {
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
    		Notifications,
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
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
