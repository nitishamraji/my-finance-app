import React, { Component } from 'react';
import './styles.css';

class CustomIframe extends Component {
  iframe () {
    return {
      __html: this.props.iframe
    }
  }

  render() {
    return (
      <div className="cust-iframe-div">
        <div dangerouslySetInnerHTML={ this.iframe() } />
      </div>
    );
  }
}

export default CustomIframe;
