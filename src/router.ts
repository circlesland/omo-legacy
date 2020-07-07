import { writable } from "svelte/store";

export var curRoute = writable("?route=home");
export const curId = writable(0);