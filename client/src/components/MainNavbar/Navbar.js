import React from 'react';
import { Link, NavLink } from 'react-router-dom'

import { Navbar, Nav, NavDropdown, Form, Button, FormControl, Modal } from 'react-bootstrap';
import { BarChartFill, PersonFill, BoxArrowRight, Sliders, ChatDotsFill, GraphUp } from 'react-bootstrap-icons';
import { USER_DATA } from './../Common/UserData';
import NavbarSearch from './NavbarSearch';

import './styles.css';


export default class MainNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      register: false,
      userId: '',
      userName: '',
      isUserLoggedIn: USER_DATA.isUserLoggedIn(),
      userIdMsg: '',
      userNameMsg: '',
      userNameValid: true,
      userIdValid: true
    };

    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleLoginRegisterToggle = this.handleLoginRegisterToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.clearLoginForm = this.clearLoginForm.bind(this);
    this.clearLoginFormMessages = this.clearLoginFormMessages.bind(this);
  }

  showModal = (e) => {
    this.setState({ showModal: true, register: false });
  }

  clearLoginFormMessages() {
    this.setState({
      userIdMsg: '',
      userNameMsg: '',
    });
  }

  clearLoginForm() {
    this.setState({
      showModal: false,
      userId: '',
      userName: ''
    });
    this.clearLoginFormMessages();
  }

  hideModal = (e) => {
    this.clearLoginForm();
  }

  handleFormChange (event) {
    let {name: fieldName, value} = event.target;
    this.setState({ [fieldName]: value });
  }

  handleLogout() {
      USER_DATA.logOutMyAppUser();
      window.location.reload();
  }

  handleLoginRegisterToggle() {
    this.setState({
      register: !this.state.register
    })
    this.clearLoginFormMessages();
  }

  handleOnFocus(){
    this.setState({
      userIdMsg: '',
      userNameMsg: ''
    })
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    // const form = event.currentTarget;
    const userId = this.state.userId.trim();
    const isLogin = !this.state.register;
    const userName = this.state.userName.trim();

    let hasError = false;

    if( !isLogin && !userName ){
      this.setState({
        userNameValid: false,
        userNameMsg: 'Required'
      })
      hasError = true;
    }

    if( !userId ){
      this.setState({
        userIdValid: false,
        userIdMsg: 'Required'
      })
      hasError = true;
    }

    if( hasError ){
      return;
    }

    try {
      const url = isLogin ? '/api/loginUser' : 'api/registerUser';

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userName: userName
        })
      };

      const res = await fetch(url, requestOptions);
      const resJson = await res.json();

      const responseData = resJson;

      this.setState({
        userIdValid: responseData.success,
        userIdMsg: responseData.msg,
        userNameMsg: ''
      });

      if( isLogin && responseData.success ) {
        setTimeout(() => {
          USER_DATA.storeMyAppUser(userId);
          window.location.reload();
        }, 1000);
      }
    } catch(error) {
        console.log(Object.keys(error), error.message);
        this.setState({
          userIdValid: false,
          userIdMsg: 'Error',
          userNameMsg: ''
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Navbar id="main-navbar" style={{borderBottom: '1px solid #ccc', backgroundColor:"#3f5c80"}}  variant="dark" expand="lg">
          <Navbar.Brand className="pl-2 mr-4" as={Link} to="/home">
            <BarChartFill style={{fontSize:'1.6rem',position:'relative', top:'-1px'}} className="pr-2"/>
            <span style={{fontWeight:'600'}}>1Stop</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {
              !this.state.isUserLoggedIn &&
              <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/home">Home</Nav.Link>
                <Nav.Link as={NavLink} to="/crypto">Crypto</Nav.Link>
                <Nav.Link as={NavLink} to="/news">News</Nav.Link>
              </Nav>
            }

            {
              this.state.isUserLoggedIn &&
              <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/stocks">Stocks</Nav.Link>
                <Nav.Link as={NavLink} to="/live">Live</Nav.Link>
                <Nav.Link as={NavLink} to="/crypto">Crypto</Nav.Link>
                <Nav.Link as={NavLink} to="/settings">Settings</Nav.Link>
                <Nav.Link as={NavLink} to="/news">News</Nav.Link>
              </Nav>
            }

            <NavbarSearch />

            {
              !this.state.isUserLoggedIn &&
              <Nav className="ml-auto">
                <Nav.Link onClick={this.showModal}><BoxArrowRight style={{top:'-2px'}} className="mr-1 position-relative"/>Login</Nav.Link>
              </Nav>
            }

            {
              this.state.isUserLoggedIn &&
              <Nav className="ml-auto">
                <Nav.Link href="#link"><ChatDotsFill /></Nav.Link>
                <NavDropdown alignRight
                  title={<div style={{display: "inline-block"}}> <PersonFill/> </div>}>
                  <NavDropdown.Item as={NavLink} to="/user-profile">
                    <Sliders style={{top:'-2px'}} className="mr-2 position-relative"/>Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={this.handleLogout}>
                    <BoxArrowRight style={{top:'-2px'}} className="text-danger mr-2 position-relative"/>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            }
          </Navbar.Collapse>
        </Navbar>

        <Modal
          show={this.state.showModal} onHide={(e)=> this.hideModal(e)}
          >
          <Form noValidate  onSubmit={this.handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{this.state.register ? 'Register' : 'Log In'}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Group className="mb-0">
                {
                this.state.register &&
                <div className="mb-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control  type="text" placeholder='Enter a name...' name="userName" value={this.state.userName} onFocus={this.handleOnFocus} onChange={this.handleFormChange} />
                  <div className={`mt-1 small ${this.state.userNameValid ? 'text-success' : 'text-danger'}`}>
                      {this.state.userNameMsg}
                  </div>
                </div>
                }
                <Form.Label>User ID</Form.Label>
                <Form.Control  type="text" placeholder={this.state.register ? 'Enter a user id to register...' : 'Enter user id to log in...'} name="userId" value={this.state.userId} onFocus={this.handleOnFocus} onChange={this.handleFormChange} />
                <div className={`mt-1 small ${this.state.userIdValid ? 'text-success' : 'text-danger'}`}>
                    {this.state.userIdMsg}
                </div>
                <Button variant="link" onClick={this.handleLoginRegisterToggle} className="text-primary pl-0 mt-3 font-weight-bold shadow-none">{this.state.register ? 'Log In' : 'Register'}</Button>
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={this.hideModal}>Close</Button>
              <Button variant="primary" type="submit">Submit</Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </React.Fragment>
    );
  }
}
