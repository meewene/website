import { render } from "dreamland/ssr/server";
import App from "./main";

export { router } from "dreamland/router";
export { routes, notFound, routeFor } from "./routes";
export { default as config } from "./site.config";
export default (path: string) => render(() => App(path));
