import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
  
import Podcast from "./page/podcast"

function App() {
  return (
    <>
      <Router>
          <Switch>
            <Route path="/">
				<Podcast />
            </Route>
          </Switch>
      </Router>
    </>
  );
}

export default App;
