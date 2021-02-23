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
  var num = Number(c).toFixed(2);
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
    text: 'TCKR',
    sort: true,
    formatter: (c) => { return symbolFormat(c) },
  },
  {
    dataField: 'companyName',
    formatter: (c) => { return ( <span style={{width:'50px'}} className="ellipsis d-inline-block" title={c}>{c}</span> ) },
    text: 'Name',
    hidden: false
  },
  {
    dataField: 'lastPrice',
    text: 'Price',
    sort: false,
    hidden: false
  },
  {
    dataField: 'open',
    text: 'Open',
    sort: false,
    hidden: false
  },
  {
    dataField: 'close',
    text: 'Close',
    sort: false,
    hidden: false
  },
  {
    dataField: 'low',
    text: 'Low',
    hidden: false,
    sort: false,
  },
  {
    dataField: 'high',
    text: 'High',
    hidden: false,
    sort: false,
  },
  {
    dataField: 'changePercent',
    text: '1d %',
    sort: true,
    formatter: (c) => { return  pctFormatter(c) },
    sortFunc: basicSort
  },
  {
    dataField: 'extendedPrice',
    text: 'AH %',
    sort: true,
    hidden: false,
    formatter: (c) => { return  pctFormatter(c.extendedChangePercent) },
    sortFunc: (a,b, order) => { return basicSort( a.extendedChangePercent, b.extendedChangePercent, order) }
  },
  {
    dataField: 'volume',
    text: 'V',
    sort: true,
    formatter: (c) => { return convertNum(c) }
  },
  {
    dataField: 'marketCap',
    text: 'M Cap',
    sort: true,
    formatter: (c) => { return convertNum(c) },
    hidden: true,
  },
  {
    dataField: 'week52High',
    text: '52W H',
  },
  {
    dataField: 'week52Low',
    text: '52W L',
  },
  {
    dataField: 'pct7d',
    text: '1w %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) }
  },
  {
    dataField: 'pct14d',
    text: '2w %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) }
  },
  {
    dataField: 'pct1m',
    text: '1m %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) }
  },
  {
    dataField: 'pct3m',
    text: '3m %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c) }
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
      open: data.open,
      close: data.close,
      lastPrice: data.lastPrice,
      low: data.low,
      high: data.high,
      changePercent: data.changePercent,
      extendedPrice: data,
      extendedChangePercent: data.extendedChangePercent,
      volume: data.volume,
      marketCap: data.marketCap,
      week52High: data.week52High,
      week52Low: data.week52Low,
      pct7d: data.pct7d,
      pct14d: data.pct14d,
      pct1m: data.pct1m,
      pct3m: data.pct3m
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
