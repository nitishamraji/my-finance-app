import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Popup from 'reactjs-popup';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { InfoCircle } from 'react-bootstrap-icons';

import StockDetail from './../../StockDetail/StockDetail';

import LZString from 'lz-string';

import './styles.css';

const { SearchBar, ClearSearchButton } = Search;

const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: false,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
    <div className="dataTables_length" id="datatable-basic_length">
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


const columnHover = (cell, row, enumObject, rowIndex) => {
    return cell
  }

const pctFormatter = (c) => {
  var num = Number(c).toFixed(3);
  var cssClass = num < 0 ? 'text-danger' : 'text-success';
  return  <span className={cssClass}>{num}</span>
}

const basicSort =  (a, b, order, dataField, rowA, rowB) => {
      if (order === 'asc') {
        return b - a;
      }
      return a - b; // desc
    }

const symbolFormat = (symbol) => {
  return (
      <Popup trigger={<span style={{cursor: 'pointer'}} className="td-popup text-primary" title={symbol}>{symbol}</span>} modal nested>
          <StockDetail symbol={symbol} isAuthed={true}/>
      </Popup>
    );
}

const getColumns = (customInfo) => {
const columns = [
  {
    dataField: 'symbol',
    text: 'Symbol',
    sort: true,
    formatter: (c) => { return symbolFormat(c) },
  },
  {
    dataField: 'companyName',
    formatter: (c) => { return ( <span style={{width:'200px'}} className="ellipsis d-inline-block" title={c}>{c}</span> ) },
    text: 'Name',
    hidden: false
  },
  {
    dataField: 'lastPrice',
    text: 'Last Price',
    hidden: false,
    sort: false
  },
  {
    dataField: 'open',
    text: 'Open',
    hidden: false,
    sort: false
  },
  {
    dataField: 'close',
    text: 'Close',
    hidden: false,
    sort: false
  },
  {
    dataField: 'low',
    text: 'Low',
    hidden: false,
    sort: false
  },
  {
    dataField: 'high',
    text: 'High',
    hidden: false,
    sort: false
  },
  {
    dataField: 'changePercent',
    text: 'Change %',
    sort: true,
    formatter: (c) => { return  pctFormatter(c) },
    sortFunc: basicSort
  },
  {
    dataField: 'extendedChangePercent',
    text: 'After Hours %',
    sort: true,
    formatter: (c) => { return  pctFormatter(c) },
    sortFunc: basicSort
  },
  {
    dataField: 'volume',
    text: 'Vol',
    sort: true,
    formatter: (c) => { return convertNum(c) }
  },
  {
    dataField: 'week52High',
    text: '52W H',
    sort: false
  },
  {
    dataField: 'week52Low',
    text: '52W L',
    sort: false
  }
];

if( customInfo && customInfo.addInfoColumn ) {
  columns.push({
    dataField: 'info',
    text: '',
    sort: false,
    formatter: (c) => { return (

      <OverlayTrigger
        placement={'left'}
        overlay={
          <Tooltip>
            {c}
          </Tooltip>
        }
      >
        <InfoCircle className={`cursor-pointer ${c && c.length > 0 ? '' : 'd-none'}`}/>
      </OverlayTrigger>

    )}
  })
}

return columns;
}
const defaultSorted = [{
  dataField: 'symbol',
  order: 'desc'
}];

function constructStockJson(data, addInfoColumn, infoColumnData){
  const symbol = data.symbol;
  const dataJson = {
      symbol: symbol,
      companyName: data.companyName,
      lastPrice: data.lastPrice,
      open: data.open,
      close: data.close,
      low: data.low,
      high: data.high,
      changePercent: data.changePercent,
      extendedChangePercent: data.extendedChangePercent,
      volume: data.volume,
      week52High: data.week52High,
      week52Low: data.week52Low,
  }

  if( addInfoColumn ) {
    let info = '';
    try {
      const symbolInfo = infoColumnData.find(symInfo => symInfo.symbol === symbol)
      info = symbolInfo.comment
    } catch(e) {
      console.log(e)
    }
    dataJson.info = info;
  }
  return dataJson;
}

function convertNum (num) {
    if( !num )
      return "";

    // Nine Zeroes for Billions
    var convertNum = Math.abs(Number(num)) >= 1.0e+12

    ? (Math.abs(Number(num)) / 1.0e+12).toFixed(2) + "T"

    : Math.abs(Number(num)) >= 1.0e+9

    ? Number( Math.abs(Number(num)) / 1.0e+9).toFixed(2) + "B"
    // Six Zeroes for Millions
    : Number( Math.abs(Number(num)) >= 1.0e+6).toFixed(2)

    ? Number( Math.abs(Number(num)) / 1.0e+6).toFixed(2) + "M"
    // Three Zeroes for Thousands
    : Number( Math.abs(Number(num)) >= 1.0e+3).toFixed(2)

    ? Number( Math.abs(Number(num)) / 1.0e+3).toFixed(2) + "K"

    : Number( Math.abs(Number(num))).toFixed(2);

    return convertNum
}

class Table extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      stocksList: props.stocksList && props.stocksList.length > 0 ? props.stocksList : [],
      allStocksData: props.allStocksData,
      addInfoColumn: props.addInfoColumn,
      infoColumnData: props.infoColumnData
    };
    this.refreshFromLocalStorage = this.refreshFromLocalStorage.bind(this);
    this.getTableData = this.getTableData.bind(this);
  }

  getTableData(allStocksData) {
    const tableData = []
    this.state.stocksList.forEach((symbol) => {
      try {
        tableData.push(constructStockJson(allStocksData[symbol], this.state.addInfoColumn, this.state.infoColumnData))
      } catch(e) {
        console.log('Error processing symbol:' + symbol + ' ' + e)
      }
    });
    return tableData
  }

  refreshFromLocalStorage() {
    try {
      // let tabData = this.state.tableData;
      // tabData.forEach((stockJson) => {
      //   if( stockJson['symbol'] === 'TSLA' ) {
      //     stockJson['lastPrice'] = Math.floor(Math.random() * 1000)
      //   }
      // });
      const tabData = JSON.parse(LZString.decompress(localStorage.getItem('StocksLiveData')))
      if( !tabData || tabData.length < 1 ) {
        return
      }

      this.setState({
        tableData: this.getTableData(tabData)
      })
      localStorage.removeItem('StocksLiveData')
    } catch (e) {

    }

  }

  async componentDidUpdate(prevProps) {
    // console.log('testing table props updated')
  }

  // async shouldComponentUpdate(nextProps, nextState) {
  //   console.log('testing table props updated3')
  // }

  // async shouldComponentUpdate(nextProps, nextState) {
  //   let tabData = this.state.tableData;
  //   tabData.forEach((stockJson) => {
  //     if( stockJson['symbol'] === 'TSLA' ) {
  //       stockJson['lastPrice'] = Math.floor(Math.random() * 1000)
  //     }
  //   });
  //   // if( nextProps.allStocksData && nextProps.allStocksData.length > 0 ) {
  //   //   this.setState({
  //   //     tableData: nextProps.allStocksData
  //   //   })
  //   // }
  //   return false
  // }

  async componentDidMount() {
    const tableData = this.getTableData(this.state.allStocksData)
    this.setState({
      tableData: tableData
    })
    // this.interval = setInterval(this.refreshFromLocalStorage, 1*1000)
  }

  componentWillUnmount() {
    // Clear the interval right before component unmount
    // clearInterval(this.interval);
  }

	render() {
	    return (

						<ToolkitProvider
						  keyField="symbol"
						  data={ this.state.tableData }
						  columns={ getColumns({addInfoColumn: this.state.addInfoColumn, infoColumnData: this.state.infoColumnData}) }
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
						        <BootstrapTable bootstrap4={true} classes="" sort={ { dataField: 'changePercent', order: 'asc' } }
						          { ...props.baseProps } {...(this.state.tableData.length > 10 && { pagination: pagination })}
						          rowStyle={ { height: '5px' } }
						        />
						      </div>
						    )
						  }
						</ToolkitProvider>
	    );
  }
}

export default Table;
