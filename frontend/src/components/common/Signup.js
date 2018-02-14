import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {signUpUser} from '../../actions/loginAction'
import { push } from 'react-router-redux';
import {api} from './../../util/api';
import { Link } from 'react-router-dom'

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
    signupUser : (username, password, email) => {
      api.signup(username, password, email).then(function(res) {
        dispatch(signUpUser(username))
      });
      // dispatch(push('/consumer'));
    }
  };
};


class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username : '',
      password : ''
    }
  }

  onSignup(e) {
    let username = this.state.username;
    let password = this.state.password;
    let email = this.state.email;
    this.props.signupUser(username, password, email)
  }

  render() {
    return (
      <div>
      <h1>
        Login
      </h1>
      <TextField
        onChange = {(e) => {this.setState({username: e.target.value})}}
        hintText="Username"
        floatingLabelText="Username"
      />
      <br />
          <TextField
          onChange = {(e) => {this.setState({password: e.target.value})}}
          hintText="Password"
          floatingLabelText="Password"
          type="password" />
      <br />
          <TextField
            onChange = {(e) => {this.setState({email: e.target.value})}}
            hintText="Email Address"
            floatingLabelText="Email Address"/>
      <br />
      <RaisedButton primary={true} onClick={this.onSignup.bind(this)} label = 'Signup'></RaisedButton>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
