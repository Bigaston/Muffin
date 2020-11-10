import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
  
import Podcast from "./page/public/podcast"
import Episode from "./page/public/episode"

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
