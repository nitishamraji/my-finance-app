import React, { Component, useEffect } from 'react';

import News from './News';

import CustomIframe from './../Common/CustomIframe';

import { Tabs, Tab, TabContent, Spinner } from 'react-bootstrap';

export default class NewsPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthed: this.props.isAuthed,
      loadReddit: false,
      loadFinviz: false,
      loadRedditWallstreetBets: false,
      loadRedditOptions: false,
      loadRedditStockMarket: false,
      loadRedditInvesting: false,
      loadRedditStocks: false,
      loadRedditStocksAndTrading: false,
      loadRedditStockPicks: false,
      loadCnbcTopNews: false,
      loadCnbcWorldNews: false,
      loadCnbcInvesting: false,
      loadCnbcOptionsAction: false
    }

    this.handleNewsTabsSelect = this.handleNewsTabsSelect.bind(this);
    this.handleRedditTabsSelect = this.handleRedditTabsSelect.bind(this);
    this.handleCnbcNewsTabsSelect = this.handleCnbcNewsTabsSelect.bind(this);
  }

  handleNewsTabsSelect(key) {
    console.log('test news tab select: '+ key);
    switch(key) {
      case "reddit":
        this.setState({
          loadReddit: true,
          loadRedditWallstreetBets: true
        })
        break;
      case "cnbc":
        this.setState({
          loadCnbcTopNews: true
        })
        break;
      default:;
    }
  }

  handleRedditTabsSelect(key) {
    switch(key) {
      case "wallstreetbets":
        this.setState({loadRedditWallstreetBets: true})
        break;
      case "options":
        this.setState({loadRedditOptions: true})
        break;
      case "StockMarket":
        this.setState({loadRedditStockMarket: true})
        break;
      case "investing":
        this.setState({loadRedditInvesting: true})
        break;
      case "stocks":
        this.setState({loadRedditStocks: true})
        break;
      case "StocksAndTrading":
        this.setState({loadRedditStocksAndTrading: true})
        break;
      case "Stock_Picks":
        this.setState({loadRedditStockPicks: true})
        break;
      default:
        this.setState({loadRedditWallstreetBets: true});
        break;
    }
  }

  handleCnbcNewsTabsSelect(key) {
    switch(key) {
      case "topnews":
        this.setState({loadCnbcTopNews: true})
        break;
      case "worldnews":
        this.setState({loadCnbcWorldNews: true})
        break;
      case "investing":
        this.setState({loadCnbcInvesting: true})
        break;
      case "optionsAction":
        this.setState({loadCnbcOptionsAction: true})
        break;
      default:
        this.setState({loadCnbcTopNews: true});
        break;
    }
  }

  render() {
    return (
      <Tabs defaultActiveKey={"google"} onSelect={this.handleNewsTabsSelect}>

        <Tab eventKey={"google"} title="Google">
          <TabContent className="p-2">
            <News newsListSize={15} newsSource={'Google'}/>
          </TabContent>
        </Tab>

        <Tab eventKey={"cnbc"} title="CNBC" tabClassName={!this.state.isAuthed ? 'd-none' : ''} >
          <TabContent className="p-2">
            <Tabs defaultActiveKey={"topnews"} onSelect={this.handleCnbcNewsTabsSelect} >
              <Tab eventKey={"topnews"} title="Top News">
                <TabContent className="p-2">
                  { this.state.loadCnbcTopNews && this.state.isAuthed &&
                  <News newsListSize={15} newsSource={'cnbcTopNews'}/>
                  }
                </TabContent>
              </Tab>
              <Tab eventKey={"investing"} title="Investing" >
                <TabContent className="p-2">
                  { this.state.loadCnbcInvesting && this.state.isAuthed &&
                  <News newsListSize={15} newsSource={'cnbcInvesting'}/>
                  }
                </TabContent>
              </Tab>
              <Tab tabClassName="d-none" eventKey={"optionsAction"} title="Options Action">
                <TabContent className="p-2">
                  { this.state.loadCnbcOptionsAction && this.state.isAuthed && false &&
                  <News newsListSize={15} newsSource={'cnbcOptionsAction'}/>
                  }
                </TabContent>
              </Tab>
            </Tabs>
          </TabContent>
        </Tab>

        <Tab eventKey={"reddit"} title="Reddit" tabClassName={!this.state.isAuthed ? 'd-none' : ''}>

          <TabContent className="p-3">

            <Tabs defaultActiveKey={"wallstreetbets"} onSelect={this.handleRedditTabsSelect} >
                <Tab eventKey={"wallstreetbets"} title="r/wallstreetbets">
                  <TabContent className="p-2">
                    { this.state.loadRedditWallstreetBets &&
                    <News newsListSize={15} newsSource={'r/wallstreetbets'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"options"} title="r/options">
                  <TabContent className="p-2">
                    { this.state.loadRedditOptions &&
                    <News newsListSize={15} newsSource={'r/options'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"StockMarket"} title="r/StockMarket">
                  <TabContent className="p-2">
                    { this.state.loadRedditStockMarket &&
                    <News newsListSize={15} newsSource={'r/StockMarket'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"investing"} title="r/investing">
                  <TabContent className="p-2">
                    { this.state.loadRedditInvesting &&
                    <News newsListSize={15} newsSource={'r/investing'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"stocks"} title="r/stocks">
                  <TabContent className="p-2">
                    { this.state.loadRedditStocks &&
                    <News newsListSize={15} newsSource={'r/stocks'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"StocksAndTrading"} title="r/StocksAndTrading">
                  <TabContent className="p-2">
                    { this.state.loadRedditStocksAndTrading &&
                    <News newsListSize={15} newsSource={'r/StocksAndTrading'}/>
                    }
                  </TabContent>
                </Tab>
                <Tab eventKey={"Stock_Picks"} title="r/Stock_Picks" tabClassName="d-none">
                  <TabContent className="p-2">
                    { this.state.loadRedditStockPicks && false &&
                    <News newsListSize={15} newsSource={'r/Stock_Picks'}/>
                    }
                  </TabContent>
                </Tab>
            </Tabs>

          </TabContent>

        </Tab>

        <Tab eventKey={"twitter"} title="Twitter" tabClassName={!this.state.isAuthed ? 'd-none' : ''}>
          <TabContent className="p-2">
            <Tabs defaultActiveKey={"trades"} onSelect={this.handleTwitterNewsTabsSelect} >
              <Tab eventKey={"trades"} title="Trades">
                <TabContent className="p-2">
                  <TabContent className="p-2">
                    <CustomIframe symbol={this.state.symbol} iframe={`<iframe src='data:text/html,<a class="twitter-timeline" data-width="500" data-height="900" href="https://twitter.com/pxyellanki/lists/trade-ideas-41799?ref_src=twsrc%5Etfw"></a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
                    width='510' height='900' ></iframe>`} />
                  </TabContent>
                </TabContent>
              </Tab>
              <Tab eventKey={"people"} title="People">
                <TabContent className="p-2">
                  <CustomIframe symbol={this.state.symbol} iframe={`<iframe src='data:text/html,<a class="twitter-timeline" data-width="500" data-height="900" href="https://twitter.com/pxyellanki/lists/stocks-people-11813?ref_src=twsrc%5Etfw"></a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
                  width='510' height='900' ></iframe>`} />
                </TabContent>
              </Tab>
              <Tab eventKey={"options"} title="Options">
                <TabContent className="p-2">
                  <CustomIframe symbol={this.state.symbol} iframe={`<iframe src='data:text/html,<a class="twitter-timeline" data-width="500" data-height="900" href="https://twitter.com/pxyellanki/lists/options-12241?ref_src=twsrc%5Etfw"></a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
                  width='510' height='900' ></iframe>`} />
                </TabContent>
              </Tab>
            </Tabs>
          </TabContent>
        </Tab>

      </Tabs>
    )
  }
}
