import React, { Component } from 'react';

import socketIOClient from "socket.io-client";

export default class StocksLive extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      socketDate: ''
    }
  }

  async componentDidMount() {
    const userId = 'test';
    const socket = socketIOClient(window.location.origin.replace(/^http/, 'ws'), {
      query:"userId="+userId
    });
    socket.on("FromAPI", data => {
      this.setState({socketDate: data});
    });
  }

  render() {
    return (
      <div>Scoket Date: {this.state.socketDate}</div>
    )
  }
}
