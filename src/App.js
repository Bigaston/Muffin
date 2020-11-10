import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
  
import Podcast from "./page/podcast"
import Episode from "./page/episode"

import Player from "./component/player"

function App() {
  return (
    <>
		<Router>
			<Switch>
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
