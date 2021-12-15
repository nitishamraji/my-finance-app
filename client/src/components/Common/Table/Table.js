import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Popup from 'reactjs-popup';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

import paginationFactory from 'react-bootstrap-table2-paginator';
import { InfoCircle } from 'react-bootstrap-icons';

import StockDetail from './../../StockDetail/StockDetail';

import './styles.css';

const { SearchBar } = Search;

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
  // var num = Number(c);//.toFixed(2);
  var cssClass = Number(c) < 0 ? 'text-danger' : 'text-success';
  return  <span className={cssClass}>{c}%</span>
}

const marketCapFieldSort =  (a, b, order, dataField, rowA, rowB) => {

  // nulls sort after anything else
  if (a[0] === 0) {
      return 1;
  }
  else if (b[0] === 0) {
      return -1;
  }

  if (order === 'asc') {
    return b[0] - a[0];
  }
  return a[0] - b[0]; // desc
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
    text: 'TCKR',
    sort: true,
    formatter: (c) => { return symbolFormat(c) }
  },
  {
    dataField: 'companyName',
    formatter: (c) => { return ( <span style={{width:'50px'}} className="ellipsis d-inline-block" title={c}>{c}</span> ) },
    text: 'Name',
    hidden: false,
  },
  {
    dataField: 'lastPrice',
    text: 'Price',
    sort: false,
    hidden: false,
    searchable: false
  },
  {
    dataField: 'openClose',
    text: 'Open/Close',
    sort: false,
    hidden: false,
    searchable: false
  },
  {
    dataField: 'lowHigh',
    text: 'Low/High',
    hidden: false,
    sort: false,
    searchable: false
  },
  {
    dataField: 'changePercent',
    text: '1d%',
    sort: true,
    formatter: (c) => { return  pctFormatter(c) },
    sortFunc: basicSort,
    searchable: false
  },
  {
    dataField: 'extendedChangePercent',
    text: 'AH%',
    sort: true,
    hidden: false,
    formatter: (c) => { return  pctFormatter(c) },
    sortFunc: basicSort,
    searchable: false
    // sortFunc: (a,b, order) => { return basicSort( a.extendedChangePercent, b.extendedChangePercent, order) }
  },
  {
    dataField: 'volume',
    text: 'Vol',
    sort: true,
    formatter: (c) => { return convertNum(c) },
    hidden: true,
    searchable: false
  },
  {
    dataField: 'marketCap',
    text: 'MCap',
    sort: true,
    formatter: (c) => { return c[1] },
    sortFunc: marketCapFieldSort,
    searchable: false
  },
  {
    dataField: 'week52LH',
    text: '52w L/H',
    searchable: false
  },
  {
    dataField: 'pct52WeekLowChg',
    text: '52wL%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
  },
  {
    dataField: 'pct52WeekHighChg',
    text: '52wH%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
  },
  {
    dataField: 'pct7d',
    text: '1w%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
  },
  {
    dataField: 'pct14d',
    text: '2w%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
  },
  {
    dataField: 'pct1m',
    text: '1m%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
  },
  {
    dataField: 'pct3m',
    text: '3m%',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) },
    searchable: false
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

function getMarketCapFormat(num) {
    var units = ["M","B","T","Q"]
    var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
    var r = unit%3
    var x =  Math.abs(Number(num))/Number('1.0e+'+(unit-r)).toFixed(2)
    var unitsIdx = units[Math.floor(unit / 3) - 2];
    return x.toFixed(2)+ '' + (unitsIdx ? unitsIdx : units[0]);
}

function constructStockJson(data, addInfoColumn, infoColumnData){
  const symbol = data.symbol;
  const open = roundToTwoDecimals(data.open);
  const close = roundToTwoDecimals(data.close);
  const openClose = open.toString() + '/' + close.toString();

  const low = roundToTwoDecimals(data.low);
  const high = roundToTwoDecimals(data.high);
  const lowHigh = low.toString() + '/' + high.toString();

  let marketCap=0, marketCapFormat='0.0M';
  try {
    marketCap = data.marketCap;
    marketCapFormat = getMarketCapFormat(marketCap);
  } catch (e) {
    marketCap=0; marketCapFormat='0.0M';
  }

  const week52LH = roundToTwoDecimals(data.week52Low).toString() + '/' + roundToTwoDecimals(data.week52High).toString();
  const dataJson = {
      symbol: symbol,
      companyName: data.companyName,
      open: roundToTwoDecimals(data.open),
      close: roundToTwoDecimals(data.close),
      openClose: openClose,
      lastPrice: roundToTwoDecimals(data.lastPrice),
      low: roundToTwoDecimals(data.low),
      high: roundToTwoDecimals(data.high),
      lowHigh: lowHigh,
      changePercent: roundToTwoDecimals(data.changePercent),
      extendedChangePercent: roundToTwoDecimals(data.extendedChangePercent),
      volume: roundToTwoDecimals(data.volume),
      marketCap: [marketCap,marketCapFormat],
      week52High: roundToTwoDecimals(data.week52High),
      week52Low: roundToTwoDecimals(data.week52Low),
      week52LH: week52LH,
      pct52WeekHighChg: roundToTwoDecimals(data.pct52WeekHighChg),
      pct52WeekLowChg: roundToTwoDecimals(data.pct52WeekLowChg),
      pct7d: roundToTwoDecimals(data.pct7d),
      pct14d: roundToTwoDecimals(data.pct14d),
      pct1m: roundToTwoDecimals(data.pct1m),
      pct3m: roundToTwoDecimals(data.pct3m)
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

function roundToTwoDecimals(num) {
  return (Math.round(parseFloat(num) * 100) / 100).toFixed(2)
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

function customMatchFunc({searchText,value,column,row}) {
  if (typeof value !== 'undefined') {
    if(column.text == 'TCKR') {
       return value.toUpperCase().startsWith(searchText.toUpperCase()) || value.toUpperCase() === searchText.toUpperCase();
    } else {
      return value.toUpperCase().includes(searchText.toUpperCase());
    }
  }
  return false;
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
  }

  async componentDidMount() {
    const tableData = []
    this.state.stocksList.forEach((symbol) => {
      try {
        tableData.push(constructStockJson(this.state.allStocksData[symbol], this.state.addInfoColumn, this.state.infoColumnData))
      } catch(e) {
        console.log('Error processing symbol:' + symbol + ' ' + e)
      }
    });
    this.setState({
      tableData: tableData
    })
  }

	render() {
	    return (

						<ToolkitProvider
						  keyField="symbol"
						  data={ this.state.tableData }
						  columns={ getColumns({addInfoColumn: this.state.addInfoColumn, infoColumnData: this.state.infoColumnData}) }
						  search = { { onColumnMatch: customMatchFunc } }
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
						        <BootstrapTable bootstrap4={true} classes=""
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
