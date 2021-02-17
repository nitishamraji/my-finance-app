import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import App from './App';
import Home from './components/Home/Home';
import Crypto from './components/Crypto/Crypto';
import StockDetail from './components/StockDetail/StockDetail';
import NewsPage from './components/News/NewsPage';
import Settings from './components/Settings/Settings';
import Stocks from './components/Stocks/Stocks';
import UserProfile from './components/User/UserProfile';
import Admin from './components/Admin/Admin';

import { USER_DATA } from './components/Common/UserData';

export default class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: USER_DATA.myAppUser(),
      isAuthed: USER_DATA.isUserLoggedIn() ? true : false,
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
            <Home {...props} isAuthed={this.state.isAuthed} userId={this.state.userId}/>
          )}
        />

        <Route
          path="/home"
          render={(props) => (
            <Home {...props} isAuthed={this.state.isAuthed} userId={this.state.userId}/>
          )}
        />

        <Route
          path="/admin-settings"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <Admin {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/user-profile"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <UserProfile {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/settings"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <Settings {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/stocks"
        >
          {!this.state.isAuthed ? <Redirect to="/home" /> : <Stocks {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />}
        </Route>

        <Route
          path="/crypto"
        >
           <Crypto {...props} isAuthed={this.state.isAuthed} userId={this.state.userId} />
        </Route>

        <Route
          path="/stockdetail/:symbol"
          render={(props) => (
           <StockDetail {...props} symbol={props.match.params.symbol} isAuthed={this.state.isAuthed} userId={this.state.userId} />
          )}
        />

        <Route
          path="/news"
        >
          <NewsPage isAuthed={this.state.isAuthed} userId={this.state.userId} />
        </Route>

      </Switch>
    )
  }
}
