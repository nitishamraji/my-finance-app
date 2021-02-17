import React, { Component } from 'react';
import './styles.css';

class CustomIframe extends Component {
  iframe () {
    return {
      __html: this.props.iframe
    }
  }

  async componentDidUpdate(prevProps) {
    // if (this.props.symbol !== prevProps.symbol) {
    //   console.log('testing force update')
    //   this.forceUpdate();
    // }
  }

  // Listen for changes inside the DOM Node
  componentDidMount() {
     this.myElement.addEventListener('DOMSubtreeModified', () => {
       // console.log('test modified');
     });
  }

  render() {
    return (
      <div className="cust-iframe-div">
        <div dangerouslySetInnerHTML={ this.iframe() }
        ref={myElement => this.myElement = myElement} />
      </div>
    );
  }
}

export default CustomIframe;
