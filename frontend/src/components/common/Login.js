import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {loginUser} from '../../actions/loginAction'
import { push } from 'react-router-redux';
import {api} from './../../util/api';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import {toastr} from 'react-redux-toastr'
import { withRouter } from 'react-router-dom'
let logo = require('../../images/logo.png')
const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const mapStateToProps = function(state){
  return {
    isLoggedIn: state.loginReducer.loggedIn
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    loginUser : (username, password, cb) => {
      api.loginUser(username, password).then(function(res) {
        if(res['error']) {
          toastr.error('Failed to login:', res['error']);
          return;
        }
        if( Object.keys(res['data']).length === 0) {
          toastr.error('Failed to login:', 'User does not exist');
          return
        }
        console.log(res['data'])
        if(res['data']) {
          dispatch(loginUser(res['data']));
          cb(true);
        }
      }, function(err) {
        console.log(err)
        toastr.error('Failed to login:', err);
      });
      //
    }
  };
};


class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username : '',
      password : ''
    }
  }

  onLogin(e) {
    let username = this.state.username;
    let password = this.state.password;
    if(!username || !password) {
        toastr.error('The fields cannot be empty', '')
        return;
    }
    this.props.loginUser(username, password, (isSuccess) => {
      console.log(isSuccess)
      if(isSuccess) {
          this.props.history.push('/consumer')
      }
    })
  }

  render() {
    if (this.props.isLoggedIn) {
      return <Redirect to="/consumer" push={true} />
    }
    return (
      <div>
      <img src={logo} />
      <h1>
        Login
      </h1>
      <TextField
        onChange = {(e) => {this.setState({username: e.target.value})}}
        floatingLabelText="Username"
        hintText='Enter 184 as a sample'
        floatingLabelFixed = {true}
      />
      <br />
      <TextField
        onChange = {(e) => {this.setState({password: e.target.value})}}
        floatingLabelText="Password"
        floatingLabelFixed = {true}
        hintText='Enter NA as a sample'
        type="password" />
      <br />
      <Link to='/signup'>Sign up</Link>
      <span style={{'paddingRight':'20px'}}></span>
      <RaisedButton primary={true} onClick={this.onLogin.bind(this)} label = 'Login'></RaisedButton>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
