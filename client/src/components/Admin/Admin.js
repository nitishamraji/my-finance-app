import React, { Component } from 'react';

import { Tabs, Tab, TabContent, Button, ListGroup, Form } from 'react-bootstrap';


export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      isAuthorized: false,
      allUsersInfo: [],
      users: []
    }
  }

  async componentDidMount() {
    const userInfoRes = await fetch('/api/getUserInfo/' + this.state.userId );
    const userInfoJson = await userInfoRes.json();
    const userInfo = userInfoJson.data;

    if( userInfo.role !== 'admin' ) {
      return false;
    }

    const allUsersInfoRes = await fetch('/api/getAllUsersInfo/' + this.state.userId );
    const allUsersInfo = await allUsersInfoRes.json()
    const users  = allUsersInfo.data.users;

    this.setState({ isAuthorized: true, users: users })
  }

  async updateUserApproval(userId) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        approve: document.getElementById("cbx-approv-"+userId).checked
      })
    };
    await fetch('/api/updateUserApproval', requestOptions)
  }

  render() {
    return (
      <Tabs defaultActiveKey={"users"}>
        <Tab eventKey={"users"} title="Users">
          <TabContent className="p-3">
            <ListGroup>
            {
              this.state.isAuthorized && this.state.users && this.state.users.length > 0 &&
              this.state.users.map((user, i) => (

                  <ListGroup.Item key={i}>
                    <div className="d-inline-block mr-3" style={{width:'500px'}}>
                    <span>{user.userId}</span>
                    <span className="pl-3">{user.userName}</span>
                    </div>
                    <input className="cursor-pointer" type="checkbox" id={`cbx-approv-${user.userId}`} defaultChecked={user.approved} />
                    <label className="mx-2 cursor-pointer" htmlFor={`cbx-approv-${user.userId}`}>Approved</label>
                    <Button type="button" className="ml-3" onClick={ () => this.updateUserApproval(user.userId)}>Update</Button>
                  </ListGroup.Item>

              ))
            }
            </ListGroup>
          </TabContent>
        </Tab>
      </Tabs>
    )
  };
}
