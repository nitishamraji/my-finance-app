import React, { Component } from 'react';
import { Tabs, Tab, TabContent } from 'react-bootstrap';

import Iframe from 'react-iframe';

import CustomIframe from './../Common/CustomIframe';

const miniChartDoc = (symbol) => {
return `
<!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>

  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
  {
  "colorTheme": "dark",
  "dateRange": "12M",
  "showChart": true,
  "locale": "en",
  "largeChartUrl": "",
  "isTransparent": false,
  "showSymbolLogo": true,
  "width": "400",
  "height": "500",
  "plotLineColorGrowing": "rgba(25, 118, 210, 1)",
  "plotLineColorFalling": "rgba(25, 118, 210, 1)",
  "gridLineColor": "rgba(42, 46, 57, 1)",
  "scaleFontColor": "rgba(120, 123, 134, 1)",
  "belowLineFillColorGrowing": "rgba(33, 150, 243, 0.12)",
  "belowLineFillColorFalling": "rgba(33, 150, 243, 0.12)",
  "symbolActiveColor": "rgba(33, 150, 243, 0.12)",
  "tabs": [
    {
      "title": "Indices",
      "symbols": [
        {
          "s": "FOREXCOM:SPXUSD",
          "d": "S&P 500"
        },
        {
          "s": "FOREXCOM:NSXUSD",
          "d": "Nasdaq 100"
        },
        {
          "s": "FOREXCOM:DJI",
          "d": "Dow 30"
        },
        {
          "s": "AMEX:IWM",
          "d": "RUSSELL 2000"
        }
      ],
      "originalTitle": "Indices"
    },
    {
      "title": "Commodities",
      "symbols": [
        {
          "s": "CME_MINI:ES1!",
          "d": "S&P 500"
        },
        {
          "s": "CME:6E1!",
          "d": "Euro"
        },
        {
          "s": "COMEX:GC1!",
          "d": "Gold"
        },
        {
          "s": "NYMEX:CL1!",
          "d": "Crude Oil"
        },
        {
          "s": "NYMEX:NG1!",
          "d": "Natural Gas"
        },
        {
          "s": "CBOT:ZC1!",
          "d": "Corn"
        }
      ],
      "originalTitle": "Commodities"
    }
  ]
}
  </script>
</div>
`;
};

const iframeMiniChart = (symbol) => {
  return `<iframe src='data:text/html,`+miniChartDoc(symbol)+`' width='450'
        height='540' ></iframe>`;
};


class Home extends Component {

  render() {

    return (

      <Tabs defaultActiveKey="overview" >
        <Tab eventKey="overview" title="Market Overview">
          <TabContent>
            <CustomIframe iframe={iframeMiniChart('AAPL')} />
          </TabContent>
        </Tab>
        <Tab eventKey="topActive" title="Top Active">

        </Tab>
      </Tabs>

    	);
  }
}

export default Home;
