import React, { Component } from 'react';

import News from './../News/News';
import StocktwitsIdeas from './../News/StocktwitsIdeas';

import { Tabs, Tab, TabContent } from 'react-bootstrap';
import CustomIframe from './../Common/CustomIframe';
import TradingViewWidget, { Themes, BarStyles } from 'react-tradingview-widget';
import {Helmet} from "react-helmet";
import {TradingViewEmbed} from "./TradingViewEmbed";
import TradingViewOveriewWidget from "./TradingViewOverviewEmbed"

import './styles.css';

import { STOCK_DETAIL_HTML } from './Constants';

export default class StockDetail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      symbol : this.props.symbol,
      stockName: '',
      loadReddit: false,
      loadFinviz: false,
      loadStocktwits: false,
      isAuthed: this.props.isAuthed
    }

    this.updateStockDetailComponent = this.updateStockDetailComponent.bind(this);
    this.handleInfoTabsSelect = this.handleInfoTabsSelect.bind(this);
  }

  async componentDidUpdate(prevProps) {
    if (this.props.symbol !== this.state.symbol) {
      this.setState({
          symbol: this.props.symbol
      });
      this.updateStockDetailComponent();
    }
  }

  async componentDidMount() {
    this.updateStockDetailComponent();
  }

  async updateStockDetailComponent() {
    try {
      console.log('test stock detail mount');
      const res = await fetch(`/api/getStockInfo/${this.state.symbol}`);
      const stockInfoJson = await res.json();
      const stockName = stockInfoJson.data.name;
      this.setState({
        stockName: stockName,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleInfoTabsSelect(key) {
    switch(key) {
      case "reddit":
        this.setState({
          loadReddit: true
        })
        break;
      case "finviz":
        this.setState({
          loadFinviz: true
        })
        break;
      case "stocktwits":
        this.setState({
          loadStocktwits: true
        })
        break;
      default:;
    }
  }

  async fetchRedditNews() {

  }

  render() {
    return (
      <React.Fragment>
        <div>
          <Tabs defaultActiveKey="info" className="" onSelect={this.handleInfoTabsSelect}>
            <Tab eventKey="info" title="Info">
              <TabContent className="p-3">
                <CustomIframe symbol={this.state.symbol} iframe={`<iframe src='data:text/html,`+STOCK_DETAIL_HTML.info(this.state.symbol)+`' width='1000' height='200' ></iframe>`} />
                {
                  this.state.symbol && this.state.symbol.length > 0 &&
                  <Tabs defaultActiveKey={"google"} className="mt-2" onSelect={this.handleInfoTabsSelect}>
                    <Tab eventKey={"google"} title="Google News">
                      <TabContent className="p-3">
                        <News symbol={this.state.symbol} newsSource={'Google'}/>
                      </TabContent>
                    </Tab>
                    <Tab eventKey={"reddit"} title="Reddit News" tabClassName={!this.state.isAuthed ? 'd-none' : ''}>
                      <TabContent className="p-3">
                        { this.state.loadReddit && this.state.isAuthed &&
                          <News symbol={this.state.symbol} newsSource={'Reddit'}/>
                        }
                      </TabContent>
                    </Tab>
                    <Tab eventKey={"finviz"} title="Finviz News" tabClassName={!this.state.isAuthed ? 'd-none' : ''}>
                      <TabContent className="p-3">
                        { this.state.loadFinviz && this.state.isAuthed &&
                          <News symbol={this.state.symbol} newsSource={'Finviz'}/>
                        }
                      </TabContent>
                    </Tab>
                    <Tab eventKey="stocktwits" title="Stocktwits" tabClassName={!this.state.isAuthed ? 'd-none' : ''}>
                      <TabContent className="p-3">
                        { this.state.loadStocktwits && this.state.isAuthed &&
                          <StocktwitsIdeas symbol={this.state.symbol}/>
                        }
                      </TabContent>
                    </Tab>
                  </Tabs>
                }
              </TabContent>
            </Tab>
            <Tab eventKey="technicalAnalysis" title="Technical Analysis">
              <TabContent className="p-3">
                <CustomIframe iframe={`<iframe src='data:text/html,`+STOCK_DETAIL_HTML.technicalAnalysis(this.state.symbol)+`' width='500' height='500' ></iframe>`} />
              </TabContent>
            </Tab>
            <Tab eventKey="overviewChart" title="Overview Chart">
              <TabContent className="p-3">
                  <TradingViewOveriewWidget widgetType="MediumWidget"
                  theme={Themes.DARK} details={true} style={BarStyles.CANDLES} symbols={[[" ", `${this.state.symbol}`]]} width={1000} height={400}/>
                </TabContent>
            </Tab>
            <Tab eventKey="advanceChart" title="Advance Chart">
              <TabContent className="p-3">
                <TradingViewWidget interval={'30'} theme={Themes.DARK} details={true} style={BarStyles.CANDLES} symbol={this.state.symbol} width={1000} height={500}/>
              </TabContent>
            </Tab>
            <Tab eventKey="financials" title="Financials">
              <TabContent className="p-3">
                <CustomIframe iframe={`<iframe src='data:text/html,`+STOCK_DETAIL_HTML.financials(this.state.symbol)+`' width='480' height='850' ></iframe>`} />
              </TabContent>
            </Tab>
            <Tab eventKey="profile" title="Profile">
              <TabContent className="p-3">
                <CustomIframe iframe={`<iframe src='data:text/html,`+STOCK_DETAIL_HTML.profile(this.state.symbol)+`' width='500' height='600' ></iframe>`} />
              </TabContent>
            </Tab>
          </Tabs>
        </div>
      </React.Fragment>
    );
  }
}
