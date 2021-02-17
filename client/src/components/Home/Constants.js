export const HOME_HTML = {

  overview: () => {
    return `
    <!-- TradingView Widget BEGIN -->
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>

      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
      {
      "colorTheme": "dark",
      "dateRange": "1D",
      "showChart": true,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": false,
      "showSymbolLogo": true,
      "width": "430",
      "height": "550",
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
          "title": "Crypto",
          "symbols": [
            {
              "s": "COINBASE:BTCUSD",
              "d": "Bitcoin"
            },
            {
              "s": "COINBASE:ETHUSD",
              "d": "Ethereum"
            },
            {
              "s": "COINBASE:LTCUSD",
              "d": "Litecoin"
            },
            {
              "s": "KRAKEN:XRPUSD",
              "d": "Ripple"
            },
            {
              "s": "KRAKEN:ADAUSD",
              "d": "Cardano"
            }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Ark ETFs",
          "symbols": [
            {
              "s": "AMEX:ARKK",
              "d": "ARK Innovation"
            },
            {
              "s": "AMEX:ARKW",
              "d": "ARK Next Gen Internet"
            },
            {
              "s": "AMEX:ARKG",
              "d": "ARK Genomic Revolution"
            },
            {
              "s": "AMEX:ARKF",
              "d": "ARK Fintech"
            },
            {
              "s": "AMEX:ARKQ",
              "d": "ARK Autonomous Tech & Robotics"
            }
          ],
          "originalTitle": "Ark ETFs"
        },
        {
          "title": "ETFs",
          "symbols": [
            {
              "s": "NASDAQ:IBB",
              "d": "Biotech"
            },
            {
              "s": "AMEX:TAN",
              "d": "Solar"
            },
            {
              "s": "NASDAQ:ICLN",
              "d": "Clean Energy"
            },
            {
              "s": "AMEX:BETZ",
              "d": "Sports Betting"
            },
            {
              "s": "AMEX:MJ",
              "d": "Cannabis"
            },
            {
              "s": "NASDAQ:BIB",
              "d": "Biotech"
            },
            {
              "s": "AMEX:PBW",
              "d": "Clean Energy"
            }
          ],
          "originalTitle": "Ark ETFs"
        },
        {
          "title": "Commodities",
          "symbols": [
            {
              "s": "COMEX:GC1!",
              "d": "Gold"
            },
            {
              "s": "TVC:SILVER",
              "d": "Silver"
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
        `
  },

  topActive: () => {
    return `
      <!-- TradingView Widget BEGIN -->
      <div class="tradingview-widget-container">
        <div class="tradingview-widget-container__widget"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js" async>
        {
        "colorTheme": "dark",
        "dateRange": "1D",
        "exchange": "US",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": false,
        "width": "400",
        "height": "600",
        "plotLineColorGrowing": "rgba(25, 118, 210, 1)",
        "plotLineColorFalling": "rgba(25, 118, 210, 1)",
        "gridLineColor": "rgba(42, 46, 57, 1)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(33, 150, 243, 0.12)",
        "belowLineFillColorFalling": "rgba(33, 150, 243, 0.12)",
        "symbolActiveColor": "rgba(33, 150, 243, 0.12)"
      }
        </script>
      </div>
      <!-- TradingView Widget END -->
    `
  }

}
