import React, { Component } from 'react';
import {  Button, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { XCircleFill } from 'react-bootstrap-icons';
import { COMMON_UTIL } from './../Common/Util';

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

export default class AppWatchlist extends Component {

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
      hasSaveError: false,
      isFormButtonDisabled: true,
    };
    this.watchListSearchTypeaheadRef = React.createRef();
    this.handleStockSelectionChange = this.handleStockSelectionChange.bind(this);
    this.addTableColumns = this.addTableColumns.bind(this);
    this.removeSymbol = this.removeSymbol.bind(this);
    this.handleSearchFocus = this.handleSearchFocus.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveEnable = this.handleSaveEnable.bind(this);
    this.createTableData = this.createTableData.bind(this);
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
          <span title={n}
          style={{
            width:'200px',overflow: 'hidden', whiteSpace: 'nowrap', textOverflow:'ellipsis', display: 'inline-block'
          }}
          >
          {n}
          </span>
        )},
      },
      {
        dataField: 'comment',
        text: 'Comments',
        sort: false,
        formatter: (stockInfo) => { return (
          <Form.Control
            style={{width:'400px'}}
            className="d-inline"
            onChange={()=>{ this.setState({isFormButtonDisabled: false}) }}
            type="text"
            id={`comment-sym-${stockInfo.symbol}`}
            defaultValue={stockInfo.comment ? stockInfo.comment : ''}
            placeholder="comments" />
        )}
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
    this.handleSaveEnable(newTableData)
  }

  async handleSave() {
    try {
      const watchlist = []
      this.state.tableData.forEach(item => {
        watchlist.push({
          symbol:item.symbol,
          comment: document.getElementById('comment-sym-' + item.symbol).value
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
      const res = await fetch('/api/saveAppWatchlist', requestOptions)
      const resJson = await res.json();

      this.setState({
        saveMsg: resJson.success ? 'Saved' : 'Error',
        hasSaveError: !resJson.success,
        initalTableData: [...this.state.tableData],
        isFormButtonDisabled: true
      })

      if( resJson.success && this.props.onSaveCallback ) {
        this.props.onSaveCallback(true, watchlist )
      }

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

  createTableData(appWatchlist){
    const tableData = [];
    appWatchlist.forEach((symbolInfo) => {
      try {
        tableData.push({
          settings: symbolInfo.symbol,
          symbol: symbolInfo.symbol,
          comment: symbolInfo,
          name: this.state.allAddedStocksData.find(item => item.symbol === symbolInfo.symbol).name
        })
      } catch(e) {
        console.log('error processing  watchlist symbol: ' + symbolInfo.symbol)
      }
    });
    return tableData;
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    //https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component
    this.setState = (state,callback)=>{
        return;
    };
  }

  async componentDidMount() {
    try {

      const res = await fetch('/api/getAllAddedStocks');
      const allAddedStocksJson = await res.json();
      sessionStorage.setItem("allAddedStocksJson", JSON.stringify(allAddedStocksJson.data));
      this.setState({
        allAddedStocksData: allAddedStocksJson.data,
      });

      if( !allAddedStocksJson.data || allAddedStocksJson.data.length <= 0 ) {
        return;
      }

      const watchlistRes = await fetch('/api/getAppWatchlist');
      const watchlistResJson = await watchlistRes.json();
      const appWatchlist = watchlistResJson.data;
      let tableData = [];
      if( watchlistResJson.success ) {
        tableData = this.createTableData(appWatchlist)
        this.setState({
          tableData: tableData,
          initalTableData: [...tableData],
          nonUsedKey: new Date()
        })
      }

      if( tableData && tableData.length > 0 ){
        this.setState({showSave: true})
      }

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

  handleSaveEnable(tableData) {
    console.log('test inital length: ' + JSON.stringify(this.state.initalTableData) )
    console.log('test table length: ' + JSON.stringify(tableData) )

    if( this.state.initalTableData.length !== tableData.length ) {
      this.setState({isFormButtonDisabled: false});
      return true;
    }

    let isEqual = true
    this.state.initalTableData.forEach((initalItem) => {
      if( !tableData.find(item => item.symbol === initalItem.symbol ) ){
        isEqual = false;
        return;
      }
    });
    this.setState({isFormButtonDisabled: isEqual});
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
      settings: selectedStockOption.symbol,
      comment: selectedStockOption
    })

    console.log('tableData ' + JSON.stringify(tableData))
    this.setState({
      tableData: tableData,
      nonUsedKey: new Date(),
      showSave: true
    });
    this.handleSaveEnable(tableData)
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
            className="w-50 mb-3"
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
          <Button type="button" disabled={this.state.isFormButtonDisabled} onClick={this.handleSave} className="w-25 mt-2">Save</Button>
          <div className='mt-1'>
          <b className={`d-block ${this.state.hasSaveError ? 'text-danger' : 'text-success'}`}>{this.state.saveMsg}</b>
          </div>
        </div>

      </div>
    )
  }
}
