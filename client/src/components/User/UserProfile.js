import React from 'react';
import { Tabs, Tab, TabContent, Card, Form, Button } from 'react-bootstrap';
import MyWatchlist from './MyWatchlist';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userName: '',
      userIdErrMsg: '',
      userNameErrMsg: '',
      formMsg: '',
      loadWatchlist: false,
    };
    this.handleInfoSubmit = this.handleInfoSubmit.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.clearFormMessages = this.clearFormMessages.bind(this);
    this.handleTabsSelect = this.handleTabsSelect.bind(this);
  }

  async componentDidMount() {
    const userInfoRes = await fetch('/api/getUserInfo/' + this.props.userId)
    const userInfoJson = await userInfoRes.json()
    this.setState({
      userId: userInfoJson.data.userId,
      userName: userInfoJson.data.userName ? userInfoJson.data.userName : ' ',
    })
  }

  clearFormMessages() {
    this.setState({
      userIdErrMsg: '',
      userNameErrMsg: '',
      formMsg: ''
    })
  }

  handleOnFocus(event) {
    this.clearFormMessages()
  }

  async handleInfoSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    let formMsg = ''
    try {
      if( !this.state.userName ||  this.state.userName.length <= 0 ) { this.setState({ userNameErrMsg: 'Required' }) }
      if( !this.state.userId ||  this.state.userId.length <= 0 ) { this.setState({ userIdErrMsg: 'Required' }) }
      if( !(/^\S+$/.test(this.state.userId)) ) { this.setState({ userIdErrMsg: 'No Spaces' })}

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.props.userId,
          userIdUpdated: this.state.userId,
          userName: this.state.userName
        })
      };
      const res = await fetch('/api/updateUserProfile', requestOptions)
      const resJson = await res.json();
      formMsg = resJson.msg;
    } catch(e) {
      console.log(e)
      formMsg = 'Error'
    }
    this.setState({
      formMsg: formMsg
    })
  }

  async handleTabsSelect(key) {
    if( key === 'watchlist' ) {
      this.setState({loadWatchlist: true})
    }
  }

  render() {
    return (
      <Tabs defaultActiveKey={"info"} onSelect={this.handleTabsSelect}>
        <Tab eventKey={"info"} title="Info">
          <TabContent className="p-2">
            <Card className="mt-3" style={{width: '500px'}}>
              <Card.Body>
                <Form onSubmit={this.handleInfoSubmit}>
                  <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" onFocus={this.handleOnFocus} onChange = {(event) => this.setState({userName: event.target.value })} value={this.state.userName} />
                    <Form.Text maxLength="50" className='text-danger'>{this.state.userNameErrMsg}</Form.Text>
                  </Form.Group>

                  <Form.Group controlId="formUserId">
                    <Form.Label>User ID</Form.Label>
                    <Form.Control type="text" onFocus={this.handleOnFocus} onChange = {(event) => this.setState({userId: event.target.value })} value={this.state.userId}/>
                    <Form.Text maxLength="25" className='text-danger'>{this.state.userIdErrMsg}</Form.Text>
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Save
                  </Button>
                  <Form.Text className="text-success"><b>{this.state.formMsg}</b></Form.Text>
                </Form>
              </Card.Body>
            </Card>
          </TabContent>
        </Tab>
        <Tab eventKey={"watchlist"} title="My Watchlist">
          <TabContent className="p-3">
            { this.state.loadWatchlist &&
            <MyWatchlist userId={this.state.userId} />
            }
          </TabContent>
        </Tab>
      </Tabs>
    )
  }
}
