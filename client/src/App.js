import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

import Router from './router';
import { withRouter } from "react-router-dom";

import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import NavBar from './components/MainNavbar/Navbar';

import { Redirect } from 'react-router-dom';
import { USER_DATA } from './components/Common/UserData';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      userId: USER_DATA.myAppUser(),
      isAuthed: false,
      isAuthVerified: false
    }
  }

  async componentDidMount() {

    try {
      const userInfoRes = await fetch('/api/getUserInfo/' + this.state.userId)
      const userInfoJson = await userInfoRes.json()
      this.setState({
        isAuthed: userInfoJson.success && userInfoJson.data && Object.keys(userInfoJson.data).length > 0
      })
    } catch(e) {
      console.log(e)
    }
    this.setState({
      isAuthVerified: true
    })
  }

  render() {
    return (
      <div className="App">
        { this.state.isAuthVerified &&
          <React.Fragment>
          <NavBar userId={this.state.userId} isAuthed={this.state.isAuthed}/>
          <div className="my-3 container-fluid px-3">
            <Router userId={this.state.userId} isAuthed={this.state.isAuthed}/>
          </div>
          </React.Fragment>
        }
      </div>
    );
  }
}

export default withRouter(App);
