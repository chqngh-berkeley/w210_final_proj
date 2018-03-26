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
    loginUser : (username, password) => {
      api.loginUser(username, password).then(function(res) {
        console.log(res['data'])
        if(res['data']) {
          dispatch(loginUser(res['data']));
          dispatch(push('/consumer'));
        }
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
    this.props.loginUser(username, password)
  }

  render() {
    if (this.props.isLoggedIn) {
      return <Redirect to="/consumer" push={true} />
    }
    return (
      <div>
      <h1>
        Login
      </h1>
      <TextField
        onChange = {(e) => {this.setState({username: e.target.value})}}
        floatingLabelText="Username"
        floatingLabelFixed = {true}
      />
      <br />
      <TextField
        onChange = {(e) => {this.setState({password: e.target.value})}}
        floatingLabelText="Password"
        floatingLabelFixed = {true}
        type="password" />
      <br />
      <Link to='/signup'>Sign up</Link>
      <span style={{'paddingRight':'20px'}}></span>
      <RaisedButton primary={true} onClick={this.onLogin.bind(this)} label = 'Login'></RaisedButton>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
