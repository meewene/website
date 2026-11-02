import { Route, Router, router } from "dreamland/router";
import { Shell } from "./components/Shell";
import { clean, notFound, routes } from "./routes";

function App(this: { path: string }) {
	return (
		<div id="app" data-path={this.path}>
			<Shell />
			<Router>{[...routes.map((r) => <Route path={r.path.slice(1)} show={r.page} />), <Route path="*" show={notFound.page} />]}</Router>
		</div>
	);
}

export default (url?: string) => {
	const path = clean(url ?? location.pathname);
	const app = <App path={path} />;
	router.route(path, url ? "http://localhost" : location.origin);
	return app;
};
