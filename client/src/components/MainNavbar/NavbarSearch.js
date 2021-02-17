import React, { Component } from 'react';
import { Typeahead, TypeaheadMenu, Menu, MenuItem } from 'react-bootstrap-typeahead'; // ES2015
import {withRouter} from 'react-router-dom';

class NavbarSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      supportedStocksData: [],
    };
    this.navbarSearchTypeaheadRef = React.createRef();

    this.handleNavbarSearchFocus = this.handleNavbarSearchFocus.bind(this);
    this.handleStockSelectionChange = this.handleStockSelectionChange.bind(this);
  }

  async handleNavbarSearchFocus(){

    if( !this.supportedStocksData || this.supportedStocksData.length <= 0 ) {
      const supportedStocksDataSessionStorage = sessionStorage.getItem('supportedStocksJson');
      if( !supportedStocksDataSessionStorage || supportedStocksDataSessionStorage.length < 3000 ) {
        const res = await fetch('/api/getSupportedStocks');
        const supportedStocksJson = await res.json();
        sessionStorage.setItem("supportedStocksJson", JSON.stringify(supportedStocksJson.data));
        this.setState({
          supportedStocksData: supportedStocksJson.data
        });
      } else {
        this.setState({
          supportedStocksData: JSON.parse(supportedStocksDataSessionStorage)
        });
      }
    }
  }

  async handleStockSelectionChange(selectedOptions) {
    const selectedStockOption = selectedOptions[0];
    if( !selectedStockOption ) {
      return;
    }

    try {
      this.props.history.push('/stockdetail/' + selectedStockOption.symbol);
      setTimeout(() => {
        this.navbarSearchTypeaheadRef.current.clear();
      }, 300);
    } catch (e) {
      console.log(e);
    }
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

  render() {
    return (
      <Typeahead
          filterBy={this.filterByCallback}
          ref={this.navbarSearchTypeaheadRef}
          paginate={true}
          paginateResults={500}
          paginationText="Load more"
          className="w-50"
          id="navbar-search"
          labelKey={(option) => ( "(" + option.symbol + ") " + option.name  ) }
          options={this.state.supportedStocksData}
          placeholder="search stock by name or symbol..."
          typeahead-show-hint="true"
          onChange={this.handleStockSelectionChange}
          onFocus={this.handleNavbarSearchFocus}
          inputProps={{ required: true }}

          renderMenuItemChildren={(option, props) => (
            <div className="row">
              <div title={option.symbol} className="col-2 small pl-1 pr-1"><b>{option.symbol}</b></div>
              <div title={option.name} className="col-10 small pl-0 ellipsis">{option.name}</div>
            </div>
          )}
      />
    );
  }
}

export default withRouter(NavbarSearch);
