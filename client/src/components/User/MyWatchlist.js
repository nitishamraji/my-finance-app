import React, { Component } from 'react';
import {  Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { XCircleFill } from 'react-bootstrap-icons';

import './styles.css';

const { SearchBar, ClearSearchButton } = Search;


const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: false,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
    <div className="dataTables_length">
      <label>
        {
          <select
            name="datatable-basic_length"
            aria-controls="datatable-basic"
            className="form-control form-control-sm"
            onChange={e => onSizePerPageChange(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        }
      </label>
    </div>
  )
});

export default class MyWatchlist extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      allAddedStocksData: [],
      tableData: [],
      initalTableData: [],
      nonUsedKey: Date.now(),
      tableColumns: this.addTableColumns(),
      showSave: false,
      saveMsg: '',
      hasSaveError: false
    };
    this.watchListSearchTypeaheadRef = React.createRef();
    this.handleStockSelectionChange = this.handleStockSelectionChange.bind(this);
    this.addTableColumns = this.addTableColumns.bind(this);
    this.removeSymbol = this.removeSymbol.bind(this);
    this.handleSearchFocus = this.handleSearchFocus.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  addTableColumns() {
    const columns = [
      {
        dataField: 'symbol',
        text: 'Symbol',
        sort: true,
      },
      {
        dataField: 'name',
        text: 'Name',
        formatter: (n) => { return (
          <span
          style={{
            width:'400px',overflow: 'hidden', whiteSpace: 'nowrap', textOverflow:'ellipsis', display: 'inline-block'
          }}
          >
          {n}
          </span>
        )},
      },
      {
        dataField: 'settings',
        text: '',
        formatter: (symbol) => { return ( <span className="cursor-pointer" onClick={() => this.removeSymbol(symbol) }><XCircleFill className="text-danger"/></span> ) },
      }
    ];
    return columns;
  }

  removeSymbol(symbolToRemove) {
    console.log('removeSymbol: ' + JSON.stringify(symbolToRemove))
    const tableData = this.state.tableData;
    const newTableData = []
    tableData.forEach((item) => {
      if( item.symbol !== symbolToRemove ) {
        newTableData.push(item)
      }
    });
    this.setState({
      tableData: newTableData,
      nonUsedKey: Date.now()
    })
  }

  async handleSave() {
    try {
      const watchlist = []
      this.state.tableData.forEach(item => {
        watchlist.push({
          symbol: item.symbol,
          name: item.name
        })
      });

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.userId,
          watchlist: watchlist
        })
      };
      const res = await fetch('/api/saveUserWatchList', requestOptions)
      const resJson = await res.json();

      this.setState({
        saveMsg: resJson.msg,
        hasSaveError: !resJson.success,
        initalTableData: this.state.tableData
      })

    } catch (e) {
      console.log(e)
      this.setState({
        saveMsg: 'Error',
        hasSaveError: true
      })
    }

    setTimeout(() => {
      this.setState({saveMsg: ''})
    }, 3000)
  }

  async componentDidMount() {
    try {
      const watchlistRes = await fetch('/api/getUserWatchList/'+ this.state.userId);
      const watchlistResJson = await watchlistRes.json();
      console.log('watchlistResJson ' + watchlistResJson)
      const tableData = watchlistResJson.data;
      if( watchlistResJson.success ) {
        tableData.forEach((item, i) => {
          item.settings = item.symbol
        });

        this.setState({
          tableData: tableData,
          initalTableData: tableData,
          nonUsedKey: new Date()
        })
      }

      if( tableData && tableData.length > 0 ){
        this.setState({showSave: true})
      }

      const res = await fetch('/api/getAllAddedStocks');
      const allAddedStocksJson = await res.json();
      sessionStorage.setItem("allAddedStocksJson", JSON.stringify(allAddedStocksJson.data));
      this.setState({
        allAddedStocksData: allAddedStocksJson.data,
      });

    } catch (error) {
      console.log(error);
    }
  }

  handleSearchFocus() {
    const searchVal = this.watchListSearchTypeaheadRef.current.inputNode.value;
    if( searchVal && searchVal.length > 0 ) {
      this.watchListSearchTypeaheadRef.current.clear();
    }
  }

  async handleStockSelectionChange(selectedOptions) {
    const selectedStockOption = selectedOptions[0];
    if( !selectedStockOption ) {
      return;
    }
    const tableData = this.state.tableData;

    let hasAdded = false;
    tableData.forEach((item, i) => {
      if( item.symbol === selectedStockOption.symbol ) {
        hasAdded = true;
      }
    });

    if( hasAdded ) {
      return
    }

    tableData.push({
      symbol: selectedStockOption.symbol,
      name: selectedStockOption.name,
      settings: selectedStockOption.symbol
    })

    console.log('tableData ' + JSON.stringify(tableData))
    this.setState({
      tableData: tableData,
      nonUsedKey: new Date(),
      showSave: true
    })
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
      <div id="watchlist-container">
        <Typeahead
            filterBy={this.filterByCallback}
            ref={this.watchListSearchTypeaheadRef}
            paginate={true}
            paginateResults={500}
            paginationText="Load more"
            className="w-50"
            id="watchlist-search"
            labelKey={(option) => ( "(" + option.symbol + ") " + option.name  ) }
            options={this.state.allAddedStocksData}
            placeholder="add stock..."
            typeahead-show-hint="true"
            onChange={this.handleStockSelectionChange}
            onFocus={this.handleSearchFocus}
            inputProps={{ required: true }}
            clearButton
            renderMenuItemChildren={(option, props) => (
              <div className="row">
                <div title={option.symbol} className="col-2 small pl-1 pr-1"><b>{option.symbol}</b></div>
                <div title={option.name} className="col-10 small pl-0 ellipsis">{option.name}</div>
              </div>
            )}
        />

        <ToolkitProvider
          key={this.state.nonUsedKey}
          keyField="symbol"
          data={ this.state.tableData }
          columns={ this.state.tableColumns }
          search
        >
          {
            props => (
              <div>
                { this.props.showSearch &&
                  <div autoComplete="off">
                    <form autoComplete="off">
                    <SearchBar { ...props.searchProps } />
                    </form>
                  </div>
              }
                <BootstrapTable bootstrap4={true} classes="table-responsive"
                  { ...props.baseProps } {...(this.state.tableData.length > 10 && { pagination: pagination })}
                  rowStyle={ { height: '5px' } }
                />
              </div>
            )
          }
        </ToolkitProvider>

        <div className={`${this.state.showSave ? 'd-block' : 'd-none'}`}>
          <Button onClick={this.handleSave} className="w-25 mt-2">Save</Button>
          <div className='mt-1'>
          <b className={`d-block ${this.state.hasSaveError ? 'text-danger' : 'text-success'}`}>{this.state.saveMsg}</b>
          </div>
        </div>

      </div>
    )
  }
}
