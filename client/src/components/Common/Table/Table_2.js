import React, { Component } from 'react';
import { Link } from "react-router-dom";

// React Bootstrap Table
import BootstrapTable from 'react-bootstrap-table-next';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

// import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import '../../../node_modules/react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
// import '../../../node_modules/react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
// import '../../../node_modules/react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

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

const popupStyles = { width: '800px' }; // style for an svg element

const MyModel = (props) => (<Modal show={props.isHidden} onHide={props.onClose}>
  <Modal.Header closeButton>
    <Modal.Title>Translations</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <h4>Filter:</h4>
    <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
    <hr />
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={props.onClose}>Close</Button>
  </Modal.Footer>
</Modal>);

const settingsFormat = (symbol) => {
  return (
      <Popup
        trigger={
          <span class="cell-settings" stock-symbol={symbol}>
          <i className="material-icons">settings</i>
          </span>
        }
        modal
        nested>
        <div style={{width: '400px',height:'300px'}} className="card mx-auto">
          <div className="card-body">
          <input type="text" id="modalInput"/>
          <label onClick={(e)=>{
              console.log("testing modal click");
              console.log(document.getElementById('modalInput').value);
          }
          }>{symbol}</label>
          </div>
        </div>
      </Popup>
    );
}

const symbolFormat = (symbol) => {
  return (
      <Popup trigger={<a href="/#" className="symbol-popup" title={symbol}>{symbol}</a>} modal nested>
        <div style={{width: "800px"}}><TradingViewWidget theme={Themes.DARK} style={BarStyles.LINE} symbol={symbol} width="800" height="400"/></div>
      </Popup>
    );
}

const columns = [
  {
    dataField: 'symbol',
    text: 'Tckr',
    sort: true,
    formatter: (c) => { return symbolFormat(c) },
  },
  {
    dataField: 'companyName',
    formatter: (c) => { return ( <span title={c}>{c}</span> ) },
    text: 'Name',
    hidden: true
  },
  {
    dataField: 'low',
    text: 'L',
    hidden: false
  },
  {
    dataField: 'high',
    text: 'H',
    hidden: false
  },
  {
    dataField: 'changePercent',
    text: '%',
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
    formatter: (c) => { return convertNum(c) }
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
    formatter: (c) => { return  pctFormatter(c.pct7d) }
  },
  {
    dataField: 'pct14d',
    text: '2w %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c.pct14d) }
  },
  {
    dataField: 'pct1m',
    text: '1m %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c.pct1m) }
  },
  {
    dataField: 'pct3m',
    text: '3m %',
    sort: true,
    sortFunc: basicSort,
    formatter: (c) => { return  pctFormatter(c.pct3m) }
  },
  {
    dataField: 'symbol',
    text: 'S',
    sort: false,
    formatter: (c) => { return settingsFormat(c) },
  }
];

const defaultSorted = [{
  dataField: 'symbol',
  order: 'desc'
}];

const tableProps = (stocksList) => {
  return {
    defaultSorted: defaultSorted,
    columns: columns,
    products: stocksList,
    columnTitle: columnHover
  }
}

function constructCategoriesList(stocksList, categoryStocksMapper){
  var categoriesDataArr= [];
  categoryStocksMapper.forEach(function(categoryMapper) {
    var categoryStocks = categoryMapper.stocks;

    const stocksListJson = [];

    categoryStocks.forEach((stockSymbol) => {
      stocksList.forEach((item) => {
        if( item.symbol === stockSymbol )
          stocksListJson.push(item);
      });
    });
    categoriesDataArr.push( {category: categoryMapper.category, stocksListJson: stocksListJson} );
  });
  return categoriesDataArr;
}

function constructStockJson(data){
  const dataJson = {
      symbol: data.symbol,
      companyName: data.companyName,
      low: data.low,
      high: data.high,
      changePercent: data.changePercent,
      extendedPrice: data,
      extendedChangePercent: data.extendedChangePercent,
      volume: data.volume,
      marketCap: data.marketCap,
      week52High: data.week52High,
      week52Low: data.week52Low,
      pct7d: data,
      pct14d: data,
      pct1m: data,
      pct3m: data
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

	render() {
	    return (
	    		<div>

		    		<div className="mt-3 stock-category" id={this.props.customProps.category}>
		    			{ !this.props.customProps.isShowAll &&
		    				<div className="text-dark"><h6 class="my-0 ml-2 category-title">{this.props.customProps.category}</h6></div>
			    		}

						<ToolkitProvider
						  keyField="symbol"
						  data={ this.props.tableProps.products }
						  columns={ this.props.tableProps.columns }
						  search
						>
						  {
						    props => (
						      <div>
						       	{ this.props.customProps.showSearch &&
							      	<div autoComplete="off">
                        <form autoComplete="off">
							        	<SearchBar { ...props.searchProps } />
                        </form>
							        </div>
						    	}
						        <BootstrapTable bootstrap4={true} classes="table-responsive"
						          { ...props.baseProps } {...(this.props.tableProps.products.length > 10 && { pagination: pagination })}
						          rowStyle={ { height: '5px' } }
						        />
						      </div>
						    )
						  }
						</ToolkitProvider>
					</div>

				</div>
	    );
  }
}

export default Table;
