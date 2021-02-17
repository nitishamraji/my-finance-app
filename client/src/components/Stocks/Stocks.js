import React, { Component } from 'react';

import Table from './../../components/Common/Table/Table';
import { Tabs, Tab, TabContent, Button, Card, Accordion, Form } from 'react-bootstrap';
import $ from "jquery";

import './styles.css';

export default class Stocks extends React.Component {

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
      myWatchlistStocks: ['test'],
      loadMyWatchlist: false,
    };
    this.handleCategoryFilterChange = this.handleCategoryFilterChange.bind(this);
    this.handleToggleAll = this.handleToggleAll.bind(this);
    this.handleTabsSelect = this.handleTabsSelect.bind(this);
  }

  async componentDidMount() {
    try {
      const response = await fetch('/api/getAllStocksData');
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
        console.log('watchlistResJson ' + watchlistResJson)
        const myWatchlistStocks = [];

        if( watchlistResJson.success ) {
          watchlistResJson.data.forEach((item, i) => {
            myWatchlistStocks.push(item.symbol)
          });

          this.setState({
            myWatchlistStocks: myWatchlistStocks,
            loadMyWatchlist: true,
            nonUsedKey: new Date()
          })
        }

      }
    }
  }

  render() {
    return (
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
                  <Card.Header className="py-1">
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                      <b>Filter</b>
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>
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
                    <Card.Header className="py-1">
                      <Accordion.Toggle as={Button} variant="link" eventKey="0">
                        <b>{category}</b>
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
         <Tab eventKey={"watchlist"} title="Watchlist">
           <TabContent className="mt-3">
           </TabContent>
         </Tab>
         <Tab eventKey={"mywatchlist"} title="My Watchlist">
           <TabContent className="mt-3">
             {
               this.state.loadMyWatchlist && this.state.myWatchlistStocks.length > 0  &&
               <Table
                stocksList={ this.state.myWatchlistStocks }
                allStocksData={ this.state.allStocksData }
                showSearch={false}
               />
             }
           </TabContent>
         </Tab>
     </Tabs>
    );
  }
}
