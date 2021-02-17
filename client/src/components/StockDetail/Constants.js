export const STOCK_DETAIL_HTML = {

  info: (symbol) => {
    return `
      <script type="text/javascript">
      window.onerror = function (msg, url, line) {
        return false;
      }
      </script>
        <!-- TradingView Widget BEGIN -->
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js" async>
      {
      "symbol": "` + symbol + `",
      "width": 800,
      "locale": "en",
      "colorTheme": "light",
      "isTransparent": false
    }
      </script>
    </div>
    <!-- TradingView Widget END -->
        `
  },

  technicalAnalysis: (symbol) => {
    return `
    <script type="text/javascript">
    window.onerror = function (msg, url, line) {
      return false;
    }
    </script>
  <!-- TradingView Widget BEGIN -->
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js" async>
    {
    "interval": "1D",
    "width": 425,
    "isTransparent": false,
    "height": 450,
    "symbol": "` + symbol + `",
    "showIntervalTabs": true,
    "locale": "en",
    "colorTheme": "dark"
  }
    </script>
  </div>
  <!-- TradingView Widget END -->
  `;
  },


  miniChart: (symbol) => {
      return `
      <script type="text/javascript">
      window.onerror = function (msg, url, line) {
        return false;
      }
      </script>
      <!-- TradingView Widget BEGIN -->
      <div class="tradingview-widget-container">
        <div id="tradingview_09180"></div>
        <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/AAPL/" rel="noopener" target="_blank"><span class="blue-text">Apple</span></a> by TradingView</div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
        new TradingView.MediumWidget(
        {
        "symbols": [
          [
            "Apple",
            "AAPL"
          ],
          [
            "Google",
            "GOOGL"
          ],
          [
            "Microsoft",
            "MSFT"
          ]
        ],
        "chartOnly": false,
        "width": 1000,
        "height": 400,
        "locale": "en",
        "colorTheme": "dark",
        "gridLineColor": "#2A2E39",
        "trendLineColor": "#1976D2",
        "fontColor": "#787B86",
        "underLineColor": "rgba(55, 166, 239, 0.15)",
        "isTransparent": false,
        "autosize": false,
        "container_id": "tradingview_09180"
      }
        );
        </script>
      </div>
      <!-- TradingView Widget END -->
      `
  },

  financials: (symbol) => {
    return `
    <!-- TradingView Widget BEGIN -->
    <div class="tradingview-financial-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <style>
        .tv-feed-widget__scroll-wrapper {
          min-height: 630px !important;
        }
      </style>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-financials.js" async>
      {
      "symbol": "` + symbol + `",
      "colorTheme": "dark",
      "isTransparent": false,
      "largeChartUrl": "",
      "displayMode": "regular",
      "width": 480,
      "height": 850,
      "locale": "en",
      "autosize": true
    }
      </script>
    </div>
    <!-- TradingView Widget END -->
    `
  },

  profile: (symbol) => {
    return `
    <script type="text/javascript">
    window.onerror = function (msg, url, line) {
      return false;
    }
    </script>
      <!-- TradingView Widget BEGIN -->
      <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js" async>
      {
      "symbol": "` + symbol + `",
      "width": 480,
      "height": 650,
      "colorTheme": "dark",
      "isTransparent": false,
      "locale": "en"
      }
      </script>
      </div>
      <!-- TradingView Widget END -->
    `
  }


}
