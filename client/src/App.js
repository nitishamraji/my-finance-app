import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

import Router from './router';
import { withRouter } from "react-router-dom";

import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import NavBar from './components/MainNavbar/Navbar';

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar/>
        <Container className="my-3">
          <Router/>
        </Container>
      </div>
    );
  }
}

export default withRouter(App);
