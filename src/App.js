import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Helmet } from 'react-helmet';

import Podcast from './page/public/podcast';
import Episode from './page/public/episode';
import Playlist from './page/public/playlist';
import About from './page/public/about';
import Live from './page/public/live';

import Login from './page/admin/login';
import PodcastAdmin from './page/admin/podcast';
import NewEpisode from './page/admin/add_episode';
import EpisodeList from './page/admin/ep_list';
import EditEpisode from './page/admin/edit_episode';
import Account from './page/admin/edit_me';
import ImportPodcast from './page/admin/import_podcast';
import Widget from './page/admin/widget';
import PlaylistList from './page/admin/playlist_list';
import NewPlaylist from './page/admin/add_playlist';
import EditPlaylist from './page/admin/edit_playlist';
import Reaction from './page/admin/reaction';
import Webhook from './page/admin/webhook';
import Icecast from './page/admin/icecast';
import CreatePerson from './page/admin/create_person';
import Person from './page/admin/person';

import Player from './component/player';
import WS from './component/ws';
import Menu from './component/menu';
import CheckLogged from './component/checkLogged';

import { useDarkTheme } from './utils';

function App() {
  useDarkTheme();

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
          <Route path="/a/playlists">
            <CheckLogged>
              <PlaylistList />
            </CheckLogged>
          </Route>
          <Route path="/a/new_playlist">
            <CheckLogged>
              <NewPlaylist />
            </CheckLogged>
          </Route>
          <Route path="/a/edit_playlist/:id">
            <CheckLogged>
              <EditPlaylist />
            </CheckLogged>
          </Route>
          <Route path="/a/reaction">
            <CheckLogged>
              <Reaction />
            </CheckLogged>
          </Route>
          <Route path="/a/webhook">
            <CheckLogged>
              <Webhook />
            </CheckLogged>
          </Route>

          <Route path="/a/icecast">
            <CheckLogged>
              <Icecast />
            </CheckLogged>
          </Route>

          <Route exact path="/a/person">
            <CheckLogged>
              <Person />
            </CheckLogged>
          </Route>
          <Route path="/a/person/create">
            <CheckLogged>
              <CreatePerson />
            </CheckLogged>
          </Route>

          <Route path="/p/:slug">
            <Playlist />
          </Route>

          <Route path="/about">
            <About />
          </Route>

          <Route path="/live">
            <Live />
          </Route>

          <Route path="/:slug">
            <Episode />
          </Route>

          <Route path="/">
            <Podcast />
          </Route>
        </Switch>

        <WS />
        <Player />
      </Router>
    </>
  );
}

export default App;
