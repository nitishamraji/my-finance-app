import React, { Component } from 'react';

import socketIOClient from "socket.io-client";

export default class StocksLive extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      socketDate: '',
      connected: ''
    }
  }

  async componentDidMount() {
    const userId = 'test';
    const socket = socketIOClient(window.location.origin.replace(/^http/, 'ws'), {
      query:"userId="+userId
    });
    this.setState({
      connected: socket.connected
    })
    socket.on("FromAPI", data => {
      this.setState({socketDate: data});
    });
    socket.on('connect', () => {
        this.setState({connected: 'connected'});
    });
    socket.on('disconnect', (reason) => {
      this.setState({connected: 'disconnected ' + reason });
    });
  }

  render() {
    return (
      <div>
      <div>Scoket Date: {this.state.socketDate}</div>
      <div>Connected: {this.state.connected}</div>
      </div>
    )
  }
}
