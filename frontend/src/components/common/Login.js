import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {loginUser} from '../../actions/loginAction'
import { push } from 'react-router-redux';
import {api} from './../../util/api';

const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const mapStateToProps = function(state){
  return {

  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    loginUser : (username, password) => {
      api.loginUser(username, password).then(function(res) {
        dispatch(loginUser(username, password))
      });
      // dispatch(push('/consumer'));
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
    return (
      <div>
      <h1>
        Login
      </h1>
      <TextField
        onChange = {(e) => {this.setState({username: e.target.value})}}
        hintText="Email"
        floatingLabelText="Email"
      />
      <br />
          <TextField
          onChange = {(e) => {this.setState({password: e.target.value})}}
          hintText="Password"
          floatingLabelText="Password"
          type="password" />
      <br />
      <RaisedButton primary={true} onClick={this.onLogin.bind(this)} label = 'Login'>
      </RaisedButton>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
