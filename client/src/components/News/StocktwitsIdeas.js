import React, { Component } from 'react';

import CustomIframe from './../Common/CustomIframe';
import Helmet from 'react-helmet';
import './styles.css';

export default class StocktwitsIdeas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stockSymbol: this.props.symbol,
      showChild : true
    };

    this.reloadChild = this.reloadChild.bind(this);
    // this.handleHeatMapOnClick = this.handleHeatMapOnClick.bind(this);
  }

  async componentDidUpdate(prevProps) {
    if (this.props.symbol !== this.state.stockSymbol) {
      const newsDiv = document.getElementById('stocktwits-widget-news')
      if( newsDiv ) {
        newsDiv.innerHTML = '';
      }

      this.setState({
          stockSymbol: this.props.symbol,
      });
      this.reloadChild();
    }
  }

  reloadChild = () => {
    this.setState({
      showChild : false
    })

    setTimeout(() => {
      this.setState({
        showChild : true
      })
    },100);

    console.log("Reload Child Invoked")
  }

  async componentDidMount() {
  }

  render() {
    return (
      <div>
        <div id="stocktwits-widget-news"></div>
        {this.state.showChild ?
        <Helmet symbol={this.state.stockSymbol} reloadChild={this.reloadChild}
          script={[{
            type: 'text/javascript',
            innerHTML: `STWT.Widget({
              container: "stocktwits-widget-news",
              symbol: "` + this.state.stockSymbol + `",
              width: "800",
              height: "500",
              limit: "200",
              scrollbars: "true",
              streaming: "true",
              title: "` + this.state.stockSymbol + ` Ideas",
              style: {
                link_color: "4871a8",
                link_hover_color: "4871a8",
                header_text_color: "000000",
                border_color: "cecece",
                divider_color: "cecece",
                divider_color: "cecece",
                divider_type: "solid",
                box_color: "f5f5f5",
                stream_color: "ffffff",
                text_color: "000000",
                time_color: "999999"
              }
            })`
          }]}
        />
        : null
        }
      </div>
    )
  }
}
