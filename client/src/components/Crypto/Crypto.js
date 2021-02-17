import React, { Component } from 'react';

import CustomIframe from './../Common/CustomIframe';

const miniChartDoc = (symbol) => {
return `
<script type="text/javascript" src="https://files.coinmarketcap.com/static/widget/coinMarquee.js">
</script>
<div id="coinmarketcap-widget-marquee" coins="1,1027,2,2010,52,1975,512,7083" currency="USD" theme="light" transparent="false" show-symbol-logo="true">
</div>
<script type="text/javascript">
</script>
<style type="text/css">
  .coin-marquee-header{ display: none !important}
  .coin-marquee-container{ width: 800px !important}
  .coin-marquee-item-inner{ height: 60px !important }
  .coin-marquee-item-name, .coin-marquee-item-price { font-size: 15px !important; }
</style>
`;
};

const iframeMiniChart = () => {
  return `<iframe id="cryptoMarqueeFrame" src='data:text/html,`+miniChartDoc()+`' width='800'
        height='60' ></iframe>`;
};

const reloadIFrame = () => {
  if( document.getElementById('cryptoMarqueeFrame') ) {
    document.getElementById('cryptoMarqueeFrame').src += '';
  }
}
export default class Crypto extends React.Component {

  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    window.setInterval(reloadIFrame, 1000 * 2 * 60);
  }

  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <CustomIframe iframe={iframeMiniChart()} />
      </div>
    );
  }
}
