import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
  
import Podcast from "./page/public/podcast"
import Episode from "./page/public/episode"

import Login from "./page/admin/login"

import Player from "./component/player"

function App() {
  return (
    <>
		<Router>
			<Switch>
				<Route path="/a/login">
					<Login/>
				</Route>

				<Route path="/:slug">
					<Episode />
				</Route>
				<Route path="/">
					<Podcast />
				</Route>
			</Switch>
		</Router>

		<Player />
    </>
  );
}

export default App;
