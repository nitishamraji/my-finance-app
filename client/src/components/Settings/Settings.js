import React, { Component, useRef } from 'react';
import { Typeahead, TypeaheadMenu, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { Row, Col, Card, Tabs, Tab, TabContent, Spinner, Container, Form } from 'react-bootstrap';

import { COMMON_UTIL } from './../Common/Util';

import './styles.css';

class Settings extends React.Component {

  _isMounted = false;

  constructor(props) {
		super(props);

    this.state = {
      userId: this.props.userId,
      supportedStocksData: [],
      existingCategories: [],
      stockToAdd: '',
      stockToAddCategories: [],
      addStockFldValidationdMsg: '',
      isFormSuccess: true,
      formValidationMsg: '',
      selectedCategories: [],
      isExistingStock: false,
      watchlistComment: ''
    };

    this.watchlistCommentRef = React.createRef();
    this.adStockTypeaheadRef = React.createRef();
    this.categoriesTypeaheadRef = React.createRef();

    this.addStockFrom  = this.addStockFrom.bind(this);
    this.handleStockSelectionChange = this.handleStockSelectionChange.bind(this);
    this.handleStockInputChange = this.handleStockInputChange.bind(this);
    this.handleAddStockSubmit = this.handleAddStockSubmit.bind(this);
    this.handleCategoriesChange = this.handleCategoriesChange.bind(this);
    this.handleFieldFocus = this.handleFieldFocus.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.clearFormMessages = this.clearFormMessages.bind(this);
    this._renderMenu = this._renderMenu.bind(this);
    this.handleAppWatchlistChange = this.handleAppWatchlistChange.bind(this);
	}

  async getAllCategories(){
    const categoriesRes = await fetch('/api/getAllCategories');
    const categoriesResJson = await categoriesRes.json();

    const categoires = [];
    categoriesResJson.data.forEach((category, i) => {
      categoires.push({name: category});
    });

    if( this._isMounted ) {
      this.setState({
        existingCategories: categoires
      });
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    try {
      if( this._isMounted ) {
        const supportedStocksData = await COMMON_UTIL.getSupportedStocksJson();
        this.setState({
          supportedStocksData: supportedStocksData
        })
        this.getAllCategories();
      }
    } catch (error) {
      console.log(error);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleStockInputChange(input, e) {
    // console.log("value", input)
    // this.setState({defaultSelectedCategories:[]});
  }

  async handleStockSelectionChange(selectedOptions) {

    document.getElementById('cbx-global-watchlist').checked = false
    document.getElementById('cbx-my-watchlist').checked = false

    const selectedStockOption = selectedOptions[0];
    this.setState({
      isExistingStock: false,
      selectedCategories: [],
      watchlistComment: ''
    });
    if( !selectedStockOption ) {
      return;
    }
    this.setState({ stockToAdd: selectedStockOption.symbol });

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.userId,
          symbol: selectedStockOption.symbol
        })
      };

      const res = await fetch(`/api/getAddedStockInfo`, requestOptions);
      const resJson = await res.json();
      console.log(resJson);
      if( resJson.success && resJson.data.stockExists ){
        const stockExistingCategories = resJson.data.stockCategories;
        console.log('stockExistingCategories: ' + stockExistingCategories);
        let selectedCategories = [];
        stockExistingCategories.forEach((category) => {
          selectedCategories.push({name: category})
        });

        this.setState({
          isExistingStock: true,
          selectedCategories: selectedCategories,
          stockToAddCategories: [...selectedCategories]
        });

        document.getElementById('cbx-global-watchlist').checked = resJson.data.isInAppWatchlist
        document.getElementById('cbx-my-watchlist').checked = resJson.data.isInUserWatchlist
        this.setState({watchlistComment: resJson.data.watchlistComment})
      }
    } catch (e) {
      console.log(e);
    }
  }

  clearFormMessages() {
    this.setState({
      addStockFldValidationdMsg: '',
      formValidationMsg: ''
    });
  }

  handleFieldFocus() {
    this.clearFormMessages()
  }

  handleCategoriesChange(selectedOptions){
    console.log(JSON.stringify(selectedOptions));
    this.setState({
      stockToAddCategories: selectedOptions,
      selectedCategories: selectedOptions
    });
  }

  async handleAddStockSubmit() {
    this.clearFormMessages();
    try {
      if( !this.state.stockToAdd ){
        this.setState({ addStockFldValidationdMsg: 'Required' });
        return;
      }

      const categories = [];
      this.state.stockToAddCategories.forEach((categoryOption) =>{
        categories.push(categoryOption.name.trim());
      })

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.userId,
          stockToAdd: this.state.stockToAdd.trim(),
          categories: categories,
          addToGlobalWatchList: document.getElementById('cbx-global-watchlist').checked,
          watchlistComment: this.state.watchlistComment,
          addToMyWatchList: document.getElementById('cbx-my-watchlist').checked,
        })
      };

      const res = await fetch(`/api/addStock`, requestOptions);
      const resJson = await res.json();

      setTimeout(() => {
        this.adStockTypeaheadRef.current.clear();
        this.categoriesTypeaheadRef.current.clear()
      }, 0);

      this.setState({
        isFormSuccess: true,
        formValidationMsg: resJson.msg,
        stockToAdd: '',
        stockToAddCategories: [],
        selectedCategories: [],
        isExistingStock: false,
        watchlistComment: ''
      });

      document.getElementById('cbx-global-watchlist').checked = false;
      document.getElementById('cbx-my-watchlist').checked = false;

      setTimeout(() => {
        this.setState({formValidationMsg: ''})
      }, 3000);

      this.getAllCategories();
    } catch (e) {
      console.log(e);
      this.setState({
        isFormSuccess: false,
        formValidationMsg: 'error'
      });
    }
  }

  _renderMenu(results, menuProps, state) {
      let items = {};
      if( state.text.length > 2 ) {

        console.log("results length: " + results.length);
        // let hasPaginationOption = false, paginatinItemIndex = 0, finalResults = [], paginationItem = {};
        //
        // results.forEach((item, i) => {
        //   if( item.paginationOption ){
        //     hasPaginationOption = true;
        //     paginatinItemIndex = i;
        //     paginationItem = item;
        //   }
        // });
        //
        // if( hasPaginationOption ) {
        // //  finalResults = results.splice(paginatinItemIndex, 1);
        //   finalResults = results;
        // } else {
        //   finalResults = results;
        // }
        //
        // items = finalResults.sort(function(a, b) {
        //   if ( a.symbol.toLowerCase().startsWith(state.text.toLowerCase() ) ||
        //       a.symbol.toLowerCase() === state.text.toLowerCase()) {
        //       return -1;
        //   } else if ( a.name != undefined && a.name.toLowerCase().indexOf(state.text) !== -1 ) {
        //       return 1;
        //   } else {
        //       return 0;
        //   }
        // });

        // if( hasPaginationOption ) {
        //   items = items.push(paginationItem);
        // }

        items = results;
      } else {
        items = results;
      }

      return (
        <Menu {...menuProps}>
          {items.map((result, index) => (
            <MenuItem option={result} position={index}>
              <div className="row">
                <div className="col-2">{result.paginationOption ? "Load more" : result.symbol}</div>
                <div className="col-10">{result.name}</div>
              </div>
            </MenuItem>
          ))}
        </Menu>
      );
    }

  filterByCallback(option, props) {
    if( props.text.length === 1 ) {
      return option.symbol.toLowerCase() === props.text.toLowerCase();
    } else if ( props.text.length < 3 ){
      return option.symbol.toLowerCase().startsWith(props.text.toLowerCase());
    } else {
      return option.symbol.toLowerCase().startsWith(props.text.toLowerCase()) ||
        option.name.toLowerCase().indexOf(props.text.toLowerCase()) !== -1
    }
  }

  handleAppWatchlistChange(event) {
    if( !event.target.checked ) {
      this.setState({watchlistComment: '' })
    } else {
      this.watchlistCommentRef.current.focus();
    }
  }

  addStockFrom() {
    return (

              <form id="addStockForm" noValidate autoComplete="off" className="col col-8">

                <div className="form-group stock-div">
                  <label htmlFor="stock" className="small">Stock</label>
                  <Typeahead
                      filterBy={this.filterByCallback}
                      ref={this.adStockTypeaheadRef}
                      paginate={true}
                      paginateResults={500}
                      paginationText="Load more"
                      clearButton
                      id="stock"
                      labelKey={(option) => ( "(" + option.symbol + ") " + option.name  ) }
                      options={this.state.supportedStocksData}
                      placeholder="search stock by name or symbol..."
                      typeahead-show-hint="true"
                      onInputChange={this.handleStockInputChange}
                      onChange={this.handleStockSelectionChange}

                      onFocus={this.handleFieldFocus}
                      inputProps={{ required: true }}

                      renderMenuItemChildren={(option, props) => (
                        <div className="row">
                          <div title={option.symbol} className="col-2 small pl-1 pr-1"><b>{option.symbol}</b></div>
                          <div title={option.name} className="col-10 small pl-0 ellipsis">{option.name}</div>
                        </div>
                      )}
                  />
                  <div className="small font-weight-bold text-danger">
                    {this.state.addStockFldValidationdMsg}
                  </div>
                </div>

                <div className="form-group category-div">
                  <label htmlFor="categories" className="small">Categories</label>
                  <Typeahead
                      filterBy={['name']}
                      ref={this.categoriesTypeaheadRef}
                      selected={this.state.selectedCategories}
                      clearButton
                      multiple
                      allowNew={true}
                      labelKey="name"
                      newSelectionPrefix="Add new category: "
                      id="categories"
                      options={this.state.existingCategories}
                      onChange={this.handleCategoriesChange}
                      placeholder="select or add categories..."
                      typeahead-show-hint="true"
                      onFocus={this.handleFieldFocus}
                      renderMenuItemChildren={(option, props) => (
                        <div className="row">
                          <div style={{color: "#212121", fontWeight: "500", fontSize: "0.85rem"}}className="pl-3">{option.name}</div>
                        </div>
                      )}
                  />
                </div>

                <div className="form-check mt-4">
                  <input
                    onChange={this.handleAppWatchlistChange}
                    style={{position:'relative', top:'-2px'}}
                    type="checkbox"
                    className="form-check-input cursor-pointer mr-2"
                    id="cbx-global-watchlist"/>
                  <label style={{position:'relative', top:'-2px'}} className="form-check-label small cursor-pointer" htmlFor="cbx-global-watchlist">Add to Global Watchlist</label>
                  <Form.Control
                    className="d-inline w-75 ml-3"
                    type="text"
                    id="global-watchlist-comment"
                    ref={this.watchlistCommentRef}
                    onChange = {(event) => this.setState({watchlistComment: event.target.value })}
                    value={this.state.watchlistComment}
                    placeholder="comments" />
                </div>

                <div className="form-check mt-4">
                  <input type="checkbox" className="form-check-input cursor-pointer" id="cbx-my-watchlist"/>
                  <label style={{position:'relative', top:'-2px'}} className="form-check-label small cursor-pointer" htmlFor="cbx-my-watchlist">Add to My Watchlist</label>
                </div>

                <div className="mt-4 form-group">
                  <button className="btn btn-primary w-25" type="button" onClick={this.handleAddStockSubmit}>{this.state.isExistingStock ? 'Update Stock' : 'Add Stock'}</button>
                </div>

                <div className={`small font-weight-bold ${this.state.isFormSuccess ? "text-success" : "text-danger"}`}>
                  {this.state.formValidationMsg}
                </div>

              </form>
    );
  }

  render() {

    return (


              <Card>
                <Card.Header><h6 className="m-0">Add/Update Stocks</h6></Card.Header>
                <Card.Body>
                  <div>
                  {
                    this.state.supportedStocksData &&
                    this.state.supportedStocksData.length > 0 &&
                    this.addStockFrom()
                  }
                  </div>
                </Card.Body>
              </Card>


    );

  }
}

export default Settings;
