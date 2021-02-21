import React, { Component } from 'react';

import Table from './Table/Table';
import MyWatchlist from './../../components/User/MyWatchlist';
import AppWatchlist from './../../components/User/AppWatchlist';

import { Tabs, Tab, TabContent, Button, Card, Accordion, Form, Modal } from 'react-bootstrap';
import $ from "jquery";
import { Bag, Gear, PlusCircle, DashCircle } from 'react-bootstrap-icons';
import './styles.css';
import socketIOClient from "socket.io-client";

export default class StocksLive extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isAuthed: this.props.isAuthed,
      userId: this.props.userId,
      allStocksData: {},
      categoryStocksMapper: {},
      checkedCategories: new Map(),
      filterCategories: [],
      showAll: true,
      showCategoriesFilter: false,
      myWatchlistStocks: [],
      loadMyWatchlist: false,
      loadAppWatchlist: false,
      appWatchlistStocks: [],
      appWatchlistStocksInfo: [],
      showModal: false,
      reRenderMyWatchlistTriggerKey: '',
      reRenderAppWatchlistTriggerKey: '',
      liveStatusMessage: '',
      isMarketHours: false,
      liveStreamConnected: false,
      socket: null
    };

    this.handleCategoryFilterChange = this.handleCategoryFilterChange.bind(this);
    this.handleToggleAll = this.handleToggleAll.bind(this);
    this.handleTabsSelect = this.handleTabsSelect.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.myWatchlistSaveCallback = this.myWatchlistSaveCallback.bind(this);
    this.appWatchlistSaveCallback = this.appWatchlistSaveCallback.bind(this);
    this.handleSocketConnectClick = this.handleSocketConnectClick.bind(this);
    this.handleSocketCancelClick = this.handleSocketCancelClick.bind(this);

  }

  async componentDidMount() {
    try {
      const response = await fetch('/api/getAllStocksLiveData');
      // const response = await fetch('/api/getAllStocksData');
      const stocksDataJson = await response.json();
      this.setState({allStocksData: stocksDataJson.data.stocks});

      const categoryStocksMapperResponse = await fetch('/api/getCategoryStocksMapper');
      const categoryStocksMapper = await categoryStocksMapperResponse.json();
      this.setState({categoryStocksMapper: categoryStocksMapper.data})

      var filterCategories = Object.keys(categoryStocksMapper.data);

      const checkedCategories = new Map()
      filterCategories.forEach(category => {
        checkedCategories.set(category, true)
      });

      this.setState({
        checkedCategories: checkedCategories,
        filterCategories: filterCategories
       });

       this.setState({liveStatusMessage: 'Connect live stream. Available during market hours'})
       const isMarketHoursRes = await fetch('/api/isMarketOpen');
       const isMarketHoursResJson = await isMarketHoursRes.json();
       this.setState({
         isMarketHours: isMarketHoursResJson.isMarketOpen
       })

    } catch(error) {
      console.log(error);
    }
  }

  toggleCategoryDiv(category, isShow) {
    // $("#"+category).toggle(isShow);
    $("#categories-tab-content *[data-category='"+category+"']").toggle(isShow);
  }

  handleCategoryFilterChange(e) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    const category = e.target.value;

    this.setState(prevState => ({ checkedCategories: prevState.checkedCategories.set(category, isChecked) }));

    // this.toggleCategoryDiv(category, isChecked);

    console.log(this.state.checkedCategories);
  }

  handleToggleAll(){

    const isShow = !this.state.showAll; //if previous show.. hide now

    this.state.filterCategories.forEach((category) => {
      this.setState(prevState => ({ checkedCategories: prevState.checkedCategories.set(category, isShow) }));
      // this.toggleCategoryDiv(category, isShow);
    });

    this.setState({ showAll: !this.state.showAll });
  }

  async handleTabsSelect(key) {
    if( key === 'mywatchlist' ) {

      if( !this.state.loadMyWatchlist ) {
        const watchlistRes = await fetch('/api/getUserWatchList/'+ this.state.userId);
        const watchlistResJson = await watchlistRes.json();

        if( watchlistResJson.success ) {
          this.setState({
            myWatchlistStocks: watchlistResJson.data,
            nonUsedKey: new Date()
          })
        }

      }
    }

    if( key === 'appWatchlist' ) {
      if( !this.state.loadAppWatchlist ) {
        const watchlistRes = await fetch('/api/getAppWatchlist');
        const watchlistResJson = await watchlistRes.json();
        console.log('app watchlist: ' + JSON.stringify(watchlistResJson));
        if( watchlistResJson.success ) {
          this.setState({
            appWatchlistStocks: watchlistResJson.data.map(symbolInfo => symbolInfo.symbol),
            appWatchlistStocksInfo: watchlistResJson.data,
            nonUsedKey: new Date()
          })
        }

      }
    }
  }

  hideModal(e) {
    // this.clearLoginForm();
    this.setState({
      showModal: false,
      showWatchLisDialogFor: ''
    });
  }

  showModal(watchlistType) {
    this.setState({
      showModal: true,
      showWatchLisDialogFor:  watchlistType
    });
  }

  myWatchlistSaveCallback(hasChanged, myWatchListChangedData){
    console.log('hasChanged: ' + hasChanged )
    console.log('myWatchListChangedData: ' + JSON.stringify(myWatchListChangedData) )
    try {
      this.setState({
        myWatchlistStocks: myWatchListChangedData.map(stockInfo => stockInfo.symbol),
        reRenderMyWatchlistTriggerKey: new Date()
      });
    } catch(e) {
      console.log(e)
    }
  }

  appWatchlistSaveCallback(hasChanged, appWatchListChangedData){
    console.log('hasChanged: ' + hasChanged )
    console.log('appWatchListChangedData: ' + JSON.stringify(appWatchListChangedData) )
    try {
      this.setState({
        appWatchlistStocks: appWatchListChangedData.map(stockInfo => stockInfo.symbol),
        appWatchlistStocksInfo: appWatchListChangedData,
        reRenderAppWatchlistTriggerKey: new Date()
      });
    } catch(e) {
      console.log(e)
    }
  }

  async handleSocketCancelClick() {
    if( this.state.socket ) {
      this.state.socket.disconnect()
    }
  }

  async handleSocketConnectClick() {
    const socket = socketIOClient(window.location.origin.replace(/^http/, 'ws'), {
      query:"userId="+this.state.userId,
      reconnectionAttempts: 20,
      reconnection: true
    });

    this.setState({
      liveStreamConnected: socket.connected,
      socket: socket
    })

    socket.on("FromAPI", data => {
      this.setState({
        socketDate: data,
        liveStatusMessage: data
      });
    });
    socket.on('connect', () => {
        this.setState({
          liveStreamConnected: socket.connected,
          liveStatusMessage: 'connected'
        });
    });
    socket.on('disconnect', (reason) => {
      this.setState({
        liveStreamConnected: false,
        liveStatusMessage: 'disconnected'
       });
    });
    socket.on('reconnect', (reason) => {
      this.setState({liveStatusMessage: 'reconnected'  });
    });
  }

  render() {
    return (
      <div>
        <div className="connect-live-section mb-3 w-50 m-auto">
          <Accordion>
            <Card>
              <Card.Header className="bg-info">
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  <span className="small text-white">{this.state.liveStatusMessage}</span>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body className="m-auto">
                  <Button onClick={this.handleSocketConnectClick} className="" disabled={!this.state.isMarketHours}>Connect Live Stream</Button>
                  <Button onClick={this.handleSocketCancelClick} className="ml-3 btn-secondary" disabled={!this.state.isMarketHours}>Cancel</Button>

                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
        <div>
          <Tabs defaultActiveKey={"all"} onSelect={this.handleTabsSelect}>
              <Tab eventKey={"all"} title="All">
                <TabContent className="mt-3">
                 {
                   this.state.allStocksData && Object.keys(this.state.allStocksData).length > 0  &&
                   <Table
                    stocksList={ Object.keys(this.state.allStocksData) }
                    allStocksData={ this.state.allStocksData }
                    showSearch={true}
                   />
                 }
                </TabContent>
             </Tab>
             <Tab eventKey={"categories"} title="Categories">
                <TabContent className="mt-3" id="categories-tab-content">
                  <React.Fragment>
                  {
                    this.state.categoryStocksMapper && Object.keys(this.state.categoryStocksMapper).length > 0 &&
                    <Accordion defaultActiveKey="0">
                    <Card className="mb-3">
                      <Card.Header>
                        <Accordion.Toggle as={Button} variant="link" eventKey="0">
                          Filter
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey="0">
                        <Card.Body className="ml-3 mt-2">
                          <React.Fragment>
                          <button type="button" className={ `btn mb-2 btn-sm ${this.state.showAll ? 'btn-secondary' : 'btn-primary'}`}  onClick={this.handleToggleAll}>{this.state.showAll ? 'Hide All' : 'Show All'}</button>
                          <div className="category-items-section">
                            <ul className="list-inline mb-0">
                            {
                              this.state.filterCategories && this.state.filterCategories.length > 0 && this.state.filterCategories.map(category => (
                                <li key={category} className={ `list-inline-item mr-3 mb-0 ${category}`}>
                                  <span className="category-selection-span">
                                   <input  className="form-check-input" id={`cbx-cat-${category}`} name={category} type="checkbox" value={category}  checked={this.state.checkedCategories.get(category)} onChange={this.handleCategoryFilterChange}/>
                                    <label className="pl-0 small cursor-pointer" htmlFor={`cbx-cat-${category}`}>
                                      {category}
                                    </label>
                                    </span>
                                </li>
                              ))
                            }
                            </ul>
                          </div>
                          </React.Fragment>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                    </Accordion>
                  }
                  {
                    this.state.categoryStocksMapper && Object.keys(this.state.categoryStocksMapper).length > 0 &&
                    Object.keys(this.state.categoryStocksMapper).map(category => (
                      <Accordion defaultActiveKey="0" key={category}>
                      <Card key={category} className={ `mb-3 ${this.state.checkedCategories.get(category) ? 'd-block': 'd-none'}`} data-category={category}>
                        <Card.Header>
                          <Accordion.Toggle as={Button} variant="link" eventKey="0">
                            {category}
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                          <Card.Body>
                            <Table
                             stocksList={ this.state.categoryStocksMapper[category] }
                             allStocksData={ this.state.allStocksData }
                             showSearch={false}
                            />
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                      </Accordion>
                    ))
                  }
                  </React.Fragment>
                </TabContent>
             </Tab>
             <Tab eventKey={"appWatchlist"} title="Global Watchlist">
               <TabContent className="mt-3">
                   {
                   // <Popup trigger={<Gear className="cursor-pointer" />} modal nested>
                   //     <MyWatchlist userId={this.state.userId} isAuthed={this.state.isAuthed}/>
                   // </Popup>
                  }
                   <Gear className="cursor-pointer" onClick={() => this.showModal('appWatchlist')}/>
                 {
                   this.state.appWatchlistStocks.length > 0  &&
                   <Table
                    stocksList={ this.state.appWatchlistStocks }
                    allStocksData={ this.state.allStocksData }
                    showSearch={false}
                    key={this.state.reRenderAppWatchlistTriggerKey}
                    addInfoColumn={true}
                    infoColumnData={this.state.appWatchlistStocksInfo}
                   />
                 }
                 {
                   this.state.appWatchlistStocks.length <= 0  &&
                   <Bag style={{fontSize:'25px'}} className={`m-auto ${this.state.appWatchlistStocks.length <= 0 ? 'd-block' : 'd-none'} `}/>
                 }
               </TabContent>
             </Tab>
             <Tab eventKey={"mywatchlist"} title="My Watchlist">
               <TabContent className="mt-3">
                  <Gear className="cursor-pointer" onClick={() => this.showModal('mywatchlist')}/>
                 {
                   this.state.myWatchlistStocks.length > 0  &&
                   <Table
                    stocksList={ this.state.myWatchlistStocks }
                    allStocksData={ this.state.allStocksData }
                    showSearch={false}
                    key={this.state.reRenderMyWatchlistTriggerKey}
                   />
                 }
                 {
                   this.state.myWatchlistStocks.length <= 0  &&
                   <Bag style={{fontSize:'25px'}} className={`m-auto ${this.state.myWatchlistStocks.length > 0 ? 'd-block' : 'd-none'}`}/>
                 }
               </TabContent>
             </Tab>
             <Tab eventKey={"trends"} title="Trends">
               <TabContent className="mt-3">
               
               </TabContent>
             </Tab>
         </Tabs>
         <Modal dialogClassName='stocks-dialog'
           show={this.state.showModal} onHide={(e)=> this.hideModal(e)}
           >
           <Modal.Header>
           <h5 className="mb-0 text-primary">
           {this.state.showWatchLisDialogFor === 'mywatchlist' ? 'My Watchlist' : 'Global Watchlist'}
           </h5>
           </Modal.Header>
           <Modal.Body style={{padding: '25px', width: '80% !important', maxWidth: 'none !important'}}>
              { this.state.showWatchLisDialogFor === 'mywatchlist' &&
                <MyWatchlist onSaveCallback={this.myWatchlistSaveCallback} userId={this.state.userId} isAuthed={this.state.isAuthed}/>
              }

              { this.state.showWatchLisDialogFor === 'appWatchlist' &&
                <AppWatchlist onSaveCallback={this.appWatchlistSaveCallback} userId={this.state.userId} isAuthed={this.state.isAuthed}/>
              }
           </Modal.Body>
           <Modal.Footer>
             <Button variant="secondary" onClick={this.hideModal}>Close</Button>
           </Modal.Footer>
         </Modal>
        </div>
      </div>
    )
  }
}
