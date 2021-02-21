import React, { Component } from 'react';

import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Form, Button, Card, Accordion, Modal } from 'react-bootstrap';
import { PencilSquare, Save, XCircleFill, PlusCircle, DashCircle } from 'react-bootstrap-icons';
import Linkify from 'react-linkify';
import { SecureLink } from "react-secure-link"
import { InfoCircle } from 'react-bootstrap-icons';

import $ from "jquery";
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

export default class Messages extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      messagesData: [],
      nonUsedKey: '',
      tableColumns: this.addTableColumns(),
      addMessageText: '',
      formMsg: '',
      isMessageUpdate: false,
      updateMessageInfo: {},
      isFormButtonDisabled: true,
      initialMessageText: '',
      isFormCollpased: true,
      accordionFormActiveKey: '-1',
      showAppOveriewDialog: false
    }

    this.msgInputRef = React.createRef();
    this.accordionRef = React.createRef();

    this.handleAddMsgSubmit = this.handleAddMsgSubmit.bind(this);
    this.addTableColumns = this.addTableColumns.bind(this);
    this.toggleMessageEdit = this.toggleMessageEdit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.revertToInitial = this.revertToInitial.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.showAppOveriewDialog = this.showAppOveriewDialog.bind(this);
    this.hideAppOveriewDialog = this.hideAppOveriewDialog.bind(this);
  }

  addTableColumns() {
    const columns = [
      {
        dataField: 'id',
        text:'',
        hidden: true
      },
      {
        dataField: 'message',
        text:'',
        hidden: true
      },
      {
        dataField: 'completeInfo',
        text: ' ',
        formatter: (messageInfo) => { return (
            <div key={messageInfo.id} className="p-2" style={{width:'700px'}}>

              <p className="mb-1">
                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                  <SecureLink href={decoratedHref} key={key}>{decoratedText}</SecureLink>
                )}>
                  {messageInfo.message}
                </Linkify>
              </p>
              <div className="text-muted">{messageInfo.dateFromNow}</div>
            </div>
        )},
      },
      {
        dataField: 'settings',
        text: ' ',
        formatter: (messageInfo) => { return (

          this.state.userId === messageInfo.userId ? (
            <div className="p-2 cursor-pointer" key={messageInfo.id}>
                <PencilSquare onClick={() => this.toggleMessageEdit(messageInfo)}/>
            </div>
          ) : ''

        )}
      }
    ];
    return columns;
  }

  async loadMessages() {
    try {
      const messagesRes = await fetch('/api/getMessages/' + this.props.userId)
      const messagesResJson = await messagesRes.json()
      if( messagesResJson.success ) {
        messagesResJson.data.forEach((messageData) => {
          messageData.completeInfo = messageData;
          messageData.settings = messageData;
        });

        this.setState({
          messagesData: messagesResJson.data,
          nonUsedKey: new Date()
        })
      }
    } catch(e) {
      console.log(e)
    }
  }

  async componentDidMount() {
    this.loadMessages()
    try{
      fetch('/api/updateUserLastSeenMessages/'+this.state.userId)
    } catch(e) {
      console.log(e)
    }
  }

  async handleAddMsgSubmit(e){
    e.preventDefault()
    if( !this.state.addMessageText || this.state.addMessageText.length <= 0 ) {
      return;
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.userId,
          message: this.state.addMessageText,
        })
      };
      const res = await fetch('/api/addMessage', requestOptions)
      const resJson = await res.json();
      this.setState({
        formMsg: resJson.success ? resJson.msg : 'Error'
      })
      this.revertToInitial()
      this.loadMessages()
    } catch(e){
      console.log(e)
    }
  }

  revertToInitial() {
    this.setState({
      initialMessageText: '',
      isFormButtonDisabled: true,
      isMessageUpdate: false,
      updateMessageInfo: {},
      addMessageText:''
    })
    setTimeout(() => {
      this.setState({formMsg: ''})
    }, 3000)
  }

  async handleUpdate(){
    if( !this.state.updateMessageInfo || !this.state.updateMessageInfo.id ) {
      return;
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.updateMessageInfo.userId,
          messageId: this.state.updateMessageInfo.id,
          message: this.state.addMessageText
        })
      };
      const res = await fetch('/api/updateMessage/'+this.state.userId, requestOptions)
      const resJson = await res.json();
      this.setState({
        formMsg: resJson.success ? resJson.msg : 'Error'
      })
      this.revertToInitial()
      this.loadMessages()
    } catch(e){
      console.log(e)
    }
  }

  async handleRemove(){
    if( !this.state.updateMessageInfo || !this.state.updateMessageInfo.id ) {
      return;
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.updateMessageInfo.userId,
          messageId: this.state.updateMessageInfo.id,
        })
      };
      const res = await fetch('/api/removeMessage/'+this.state.userId, requestOptions)
      const resJson = await res.json();
      this.setState({
        formMsg: resJson.success ? resJson.msg : 'Error'
      })
      this.revertToInitial()
      this.loadMessages()
    } catch(e){
      console.log(e)
    }
  }

  handleCancel(){
    this.revertToInitial()
  }

  handleMessageChange(event) {
    const messageVal = event.target.value;
    this.setState({
      addMessageText: messageVal
    })
    this.setState({isFormButtonDisabled: this.state.initialMessageText === messageVal })
  }

  toggleMessageEdit(messageInfo){
    console.log(messageInfo);
    this.setState({
      addMessageText: messageInfo.message,
      isMessageUpdate: true,
      initialMessageText: messageInfo.message,
      isFormButtonDisabled: true,
      updateMessageInfo: messageInfo,
      accordionFormActiveKey: '0'
    });
    this.msgInputRef.current.scrollTo(0, 0);
    this.msgInputRef.current.focus();
  }

  showAppOveriewDialog(e) {
    this.setState({
      showAppOveriewDialog: true
    })
  }

  hideAppOveriewDialog(e) {
    this.setState({
      showAppOveriewDialog: false
    })
  }

  render() {
    return (
      <div id="messages-container">
        <div className="mb-3 d-none" onClick={this.showAppOveriewDialog}><InfoCircle/></div>
        <Accordion ref={this.accordionRef} activeKey={this.state.accordionFormActiveKey}>
          <Card>
            <Card.Header className="p-1">
              <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={() => { this.setState(prevState => ({accordionFormActiveKey: prevState.accordionFormActiveKey === '-1' ? '0' : '-1'})) } }>
                <PlusCircle className={`${this.state.accordionFormActiveKey === '-1'? '' : 'd-none'}`}/>
                <DashCircle className={`${this.state.accordionFormActiveKey === '-1' ? 'd-none' : ''}`}/>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>

                <Form className="mb-3" onSubmit={this.handleAddMsgSubmit}>
                  <Form.Group controlId="input-add-msg">
                    <Form.Control value={this.state.addMessageText} ref={this.msgInputRef}
                    onChange = {this.handleMessageChange}
                     as="textarea" rows={3} placeholder="add a message.."/>
                  </Form.Group>
                  <React.Fragment>
                  { !this.state.isMessageUpdate &&
                    <Button type="submit" className="w-25" disabled={this.state.isFormButtonDisabled}>Add</Button>
                  }
                  {
                    this.state.isMessageUpdate &&
                    <div>
                    <Button type="button" className="w-25" disabled={this.state.isFormButtonDisabled} onClick={this.handleUpdate}>Update</Button>
                    <Button type="button" className="w-25 ml-5 btn-danger" onClick={this.handleRemove}>Remove</Button>
                    <Button type="button" className="w-25 ml-5 btn-secondary" onClick={this.handleCancel}>Cancel</Button>
                    </div>
                  }
                  </React.Fragment>
                  <Form.Text className="text-success"><b>{this.state.formMsg}</b></Form.Text>
                </Form>

              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>

        <ToolkitProvider
          key={this.state.nonUsedKey}
          keyField="id"
          data={ this.state.messagesData }
          columns={ this.state.tableColumns }
          search
        >
          {
            props => (
              <div>
                { this.state.messagesData.length > 20 &&
                  <div autoComplete="off" className="mt-3">
                    <form autoComplete="off">
                    <SearchBar { ...props.searchProps } />
                    </form>
                  </div>
                }
                <BootstrapTable bootstrap4={true} classes="table-responsive"
                  { ...props.baseProps } {...(this.state.messagesData.length > 10 && { pagination: pagination })}
                  rowStyle={ { height: '5px' } }
                />
              </div>
            )
          }
        </ToolkitProvider>

        <div>
          <Modal dialogClassName='app-overview-info-dialog'
            show={this.state.showAppOveriewDialog} onHide={(e)=> this.hideAppOveriewDialog(e)}
            >
            <Modal.Header>
            <h5 className="mb-0">
            App Overview
            </h5>
            </Modal.Header>
            <Modal.Body style={{padding: '25px', width: '80% !important', maxWidth: 'none !important'}}>
              <ul>
                <li></li>
                <li></li>
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.hideAppOveriewDialog}>Close</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    )
  }
}
