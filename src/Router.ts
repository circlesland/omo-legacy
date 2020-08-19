// https://medium.com/swlh/simple-svelte-3-app-with-router-44fe83c833b6

import { writable } from "svelte/store";
import { Navigated } from "./events/omo/shell/navigated";

export var curRoute = writable("?page=home");

export function getRoute() {
  let route: string[] = [];
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("page")) route.push(`page=${urlParams.get("page")}`);
  if (urlParams.has("data")) route.push(`data=${urlParams.get("data")}`);
  if (urlParams.has("redirect"))
    route.push(`${urlParams.get("redirect")}`);
  if (route.length == 0) return "";
  return `?${route.join("&")}`;
}

export function getComponent(route, routes) {
  var page = route.split('&')[0];
  var component = routes.find(r => r.route == page);
  if (component == undefined) {
    alert(`route "${route}" not defined`);
    return;
  }
  if (component.authenticate && window.o.odentity.current == null) {
    var urlParams = new URLSearchParams(window.location.search);
    navigate("omoauth", urlParams.get("data"), page)
    return;
  }
  return component.quant;
}

export function navigate(page: string, data: string | null, redirect: string) {
  page = page.replace("?page=", "");
  var route = `?page=${page}`;
  if (data !== null && data !== undefined && data !== "") {
    route += `&data=${data}`
  }
  if (redirect !== null && redirect !== undefined && redirect !== "") {
    route += `&redirect=${redirect}`
  }
  window.history.pushState({ route: route }, page, route);
  curRoute.set(route);

  window.o.publishShellEventAsync(new Navigated(page));
}
