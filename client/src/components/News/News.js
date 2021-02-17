import React, { Component } from 'react';

import { Modal, Card, Spinner } from 'react-bootstrap';
import { CardText } from 'react-bootstrap-icons';

import './styles.css';

export default class News extends React.Component {

  constructor(props) {
    super(props);

    const newsListSize = this.props.newsListSize ? this.props.newsListSize : 5;
    this.state = {
      feed: [],
      feedSizeLimit: newsListSize,
      limit: newsListSize,
      stockSymbol: this.props.symbol,
      newsSource: this.props.newsSource,
      stockName: this.props.stockName,
      newsItems: [],
      loadingNews: true,
      modalNewsTitle: '',
      modalNewsLink: '',
      modalNewsContent: '',
      showContentIcon: false
    }

    this.onLoadMore = this.onLoadMore.bind(this);
    this.getNewsFeed = this.getNewsFeed.bind(this);
  }

  hideModal = (e) => {
    this.setState({
      showModal: false,
      modalNewsContent: '',
      modalNewsLink: '',
      modalNewsTitle: ''
     });
  }

  showModal = (title, link, content) => {
    this.setState({
      showModal: true,
      modalNewsContent: content,
      modalNewsTitle: title,
      modalNewsLink: link
    });
  }

  onLoadMore() {
      const newLimit = this.state.limit + this.state.feedSizeLimit;
      const newsItems = this.state.feed.items.slice(0,newLimit);
      this.setState({
          limit: newLimit,
          newsItems: newsItems
      });
  }

  async getNewsFeed(symbol, stockName){
    let showContentIcon = false;
    try {
      let newsSource = '';
      console.log('newsSource: ' + this.state.newsSource)
      switch(this.state.newsSource) {
        case "Google":
          newsSource = "getGoogleNews";
          break;
        case "CNBC":
          newsSource = "getCnbcNews";
          break;
        case "cnbcTopNews":
          newsSource = "getCnbcNews/cnbcTopNews";
          break;
        case "cnbcWorldNews":
          newsSource = "getCnbcNews/cnbcTopNews";
          break;
        case "cnbcInvesting":
          newsSource = "getCnbcNews/cnbcInvesting";
          break;
        case "cnbcOptionsAction":
          newsSource = "getCnbcNews/cnbcOptionsAction";
          break;
        case "Finviz":
          newsSource = "getFinvizNews";
          break;
        case "Reddit":
          newsSource = "getRedditNews";
          showContentIcon = true;
          break;
        case "r/wallstreetbets":
          newsSource = "getRedditNews/wallstreetbets";
          showContentIcon = true;
          break;
        case "r/options":
          newsSource = "getRedditNews/options";
          showContentIcon = true;
          break;
        case "r/StockMarket":
          newsSource = "getRedditNews/StockMarket";
          showContentIcon = true;
          break;
        case "r/investing":
          newsSource = "getRedditNews/investing";
          showContentIcon = true;
          break;
        case "r/stocks":
          newsSource = "getRedditNews/stocks";
          showContentIcon = true;
          break;
        case "r/StocksAndTrading":
          newsSource = "getRedditNews/StocksAndTrading";
          showContentIcon = true;
          break;
        case "r/Stock_Picks":
          newsSource = "getRedditNews/Stock_Picks";
          showContentIcon = true;
          break;
        default:
          newsSource = "getGoogleNews";
      }

      const apiUrl = this.state.stockSymbol && this.state.stockSymbol.length > 0 ? `/api/${newsSource}/${symbol}` : `/api/${newsSource}`;
      const stockNewsFeedRes = await fetch(apiUrl);
      const stockNewsFeedResJson = await stockNewsFeedRes.json();

      const feed = stockNewsFeedResJson.data;
      this.setState({ feed: feed });
      console.log('feed length: ' + feed);
      if( feed ) {
        const newsItems = feed.items.slice(0,this.state.limit);
        this.setState({ newsItems: newsItems });
      }

    } catch (error) {
      console.log(error);
    }
    this.setState({
      loadingNews: false,
      showContentIcon: showContentIcon
    });
  }

  async componentDidUpdate(prevProps) {
    if (this.props.symbol !== this.state.stockSymbol) {
      this.setState({loadingNews: true});
      this.setState({
          stockSymbol: this.props.symbol,
          stockName: this.props.stockName,
          limit: this.state.feedSizeLimit,
          feed: []
      });
      this.getNewsFeed(this.props.symbol,this.props.stockName);
    }
  }

  async componentDidMount() {
    this.getNewsFeed(this.state.stockSymbol,this.state.stockName);
  }

  render() {
    return (
      <div>
          {
            this.state.loadingNews &&
            <Spinner style={{margin: '150px 0px 0px 200px'}} animation="border" role="status" className="d-flex text-primary">
              <span className="sr-only">Loading...</span>
            </Spinner>
          }
          <div className={`tab-content ${this.props.loadingNews ? 'hidden' : 'block'}`}>
            {
              this.state.feed && this.state.feed.items && this.state.feed.items.slice(0,this.state.limit).map((item, i) => (
                <div className="tab-pane py-0 d-block" key={i}>
                  <div className="media p-1">
                    <div className="media-body w-100">
                      <div className="news-title">
                        <h6 className="title-small mb-0">
                          <a className="text-fiord-blue" href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
                        </h6>
                      </div>
                      <div className="news-auther small text-secondary">
                        <span className="time d-inline-block">{item.pubDateFromNow}</span>
                        <span style={{marginLeft: '20px'}} className="time d-inline-block">{item.source}</span>
                        { this.state.showContentIcon &&
                          <span style={{marginLeft: '20px'}} className="time d-inline-block"><CardText onClick={() => this.showModal(item.title, item.link, item.content)}/></span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div className="tab-content py-0">
          {
            this.state.feed && this.state.feed.items && this.state.feed.items.length > this.state.feedSizeLimit &&
            <button className="btn btn-link py-0 medium font-weight-bold pl-0" onClick={this.onLoadMore}> Load More>> </button>
          }
          </div>

          <Modal
            show={this.state.showModal} onHide={(e)=> this.hideModal(e)}
            className="rss-news-modal"
            >
              <Modal.Body style={{maxHeight:'600px', maxWidth: '800px', overflowY:'scroll'}} >
                <h6 className="title-small mb-2"><b>
                  <a className="text-dark" href={this.state.modalNewsLink} target="_blank" rel="noreferrer">{this.state.modalNewsTitle}</a>
                </b></h6>
                <div dangerouslySetInnerHTML={{ __html: this.state.modalNewsContent}} />
              </Modal.Body>
          </Modal>
      </div>
    );
  }
}
