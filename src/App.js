import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";

import { Helmet } from "react-helmet";

import Podcast from "./page/public/podcast"
import Episode from "./page/public/episode"

import Login from "./page/admin/login"
import PodcastAdmin from "./page/admin/podcast"
import NewEpisode from "./page/admin/add_episode"
import EpisodeList from "./page/admin/ep_list"
import EditEpisode from "./page/admin/edit_episode"
import Account from "./page/admin/edit_me"
import ImportPodcast from "./page/admin/import_podcast"
import Widget from "./page/admin/widget"

import Player from "./component/player"
import Menu from "./component/menu"
import CheckLogged from "./component/checkLogged"

function App() {
	return (
		<>
			<Helmet>
				<title>Muffin</title>
			</Helmet>

			<Router>
				<Menu />

				<Switch>
					<Route path="/a/login">
						<Login />
					</Route>
					<Route path="/a/podcast">
						<CheckLogged>
							<PodcastAdmin />
						</CheckLogged>
					</Route>
					<Route path="/a/episodes">
						<CheckLogged>
							<EpisodeList />
						</CheckLogged>
					</Route>
					<Route path="/a/new_episode">
						<CheckLogged>
							<NewEpisode />
						</CheckLogged>
					</Route>
					<Route path="/a/edit_episode/:id">
						<CheckLogged>
							<EditEpisode />
						</CheckLogged>
					</Route>
					<Route path="/a/account">
						<CheckLogged>
							<Account />
						</CheckLogged>
					</Route>
					<Route path="/a/import">
						<CheckLogged>
							<ImportPodcast />
						</CheckLogged>
					</Route>
					<Route path="/a/widget">
						<CheckLogged>
							<Widget />
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
