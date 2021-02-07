import React, { Component } from 'react';

export default class Screener extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>Testing Screener: {this.props.userId}</div>
    );
  }
}
