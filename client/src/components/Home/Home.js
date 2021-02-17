import React, { Component } from 'react';
import { Tabs, Tab, TabContent, Spinner } from 'react-bootstrap';

import CustomIframe from './../Common/CustomIframe';
import InnerImageZoom from 'react-inner-image-zoom';

import { HOME_HTML } from './Constants';

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthed: this.props.isAuthed,
      heatmapUrl: '',
      loadingHeatMap: false
    };

    this.handleTabsSelect = this.handleTabsSelect.bind(this);
    this.handleHeatMapOnClick = this.handleHeatMapOnClick.bind(this);
  }

  async componentDidMount() {
  }

  async handleTabsSelect(key) {
    if (key === "heatmap") {
      this.handleHeatMapOnClick();
    }
  }

  async handleHeatMapOnClick() {
    if( !this.state.isAuthed ) {
      return false;
    }

    const hasHeatMapUrl = this.state.heatmapUrl && this.state.heatmapUrl.length > 0;
    if( hasHeatMapUrl ) {
      return;
    }
    this.setState({loadingHeatMap: true})
    try {
      const response = await fetch(`/api/getHeatMapUrl`)
      const heatmapUrlJson = await response.json()
      this.setState({heatmapUrl: heatmapUrlJson.url})
    } catch(error) {

    }
    this.setState({loadingHeatMap: false});
  }

  render() {

    return (

      <Tabs defaultActiveKey={"overview"} onSelect={this.handleTabsSelect}>
        <Tab eventKey={"overview"} title="Market Overview">
          <TabContent className="p-2">
            <CustomIframe iframe={`<iframe src='data:text/html,`+ HOME_HTML.overview() +`' width='450' height='550' ></iframe>`} />
          </TabContent>
        </Tab>
        <Tab eventKey={"topActive"} title="Top Active">
          <TabContent className="p-2">
            <CustomIframe iframe={`<iframe src='data:text/html,`+ HOME_HTML.topActive() +`' width='420' height='580' ></iframe>`} />
          </TabContent>
        </Tab>
        <Tab eventKey={"heatmap"} title="Heat Map" tabClassName={this.props.isAuthed ? 'd-block' : 'd-none'}>
          <TabContent className="p-2">
            {
              this.state.loadingHeatMap && this.props.isAuthed &&
              <Spinner style={{margin: '150px 0px 0px 200px'}} animation="border" role="status" className="d-flex text-primary">
                <span className="sr-only">Loading...</span>
              </Spinner>
            }
            {
              this.state.heatmapUrl && this.state.heatmapUrl.length > 0 && (
                <img alt="Heatmap"
                src={this.state.heatmapUrl}
                />
              )
            }
          </TabContent>
        </Tab>
      </Tabs>
    	);
  }
}

export default Home;
