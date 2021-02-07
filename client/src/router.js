import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import App from './App';
import Home from './components/Home/Home';
import Screener from './components/Screener/Screener';
import Crypto from './components/Crypto/Crypto';

import { USER_DATA } from './components/Common/UserData';

export default class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: USER_DATA.myAppUser(),
      isAuthed: USER_DATA.isUserLoggedIn(),
    };

    // this.handleFormChange = this.handleFormChange.bind(this);
  }

  render(props) {
    return (
      <Switch>

        <Route
          path="/"
          exact
          render={(props) => (
            <Home {...props} />
          )}
        />

        <Route
          path="/home"
          render={(props) => (
            <Home {...props} />
          )}
        />

        <Route
          path="/screener"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <Screener {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/crypto"
        >
           <Crypto {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />
        </Route>

        <Route
          path="/crypto2"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <Screener {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/crypto3"
          render={(props) => (
            <Home {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />
          )}
        />

      </Switch>
    )
  }
}
