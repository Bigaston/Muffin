import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
  
import Podcast from "./page/public/podcast"
import Episode from "./page/public/episode"

import Login from "./page/admin/login"
import PodcastAdmin from "./page/admin/podcast"
import NewEpisode from "./page/admin/add_episode"

import Player from "./component/player"
import Menu from "./component/menu"
import CheckLogged from "./component/checkLogged"

function App() {
  return (
    <>
		<Router>
			<Menu />

			<Switch>
				<Route path="/a/login">
					<Login/>
				</Route>
				<Route path="/a/podcast">
					<CheckLogged>
						<PodcastAdmin />
					</CheckLogged>
				</Route>
				<Route path="/a/new_episode">
					<CheckLogged>
						<NewEpisode/>
					</CheckLogged>
				</Route>

				<Route path="/:slug">
					<Episode />
				</Route>
				<Route path="/">
					<Podcast />
				</Route>
			</Switch>

			<Player />
		</Router>


    </>
  );
}

export default App;
