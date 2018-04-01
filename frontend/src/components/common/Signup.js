import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {signUpUser} from '../../actions/loginAction'
import { push } from 'react-router-redux';
import {api} from './../../util/api';
import { Link } from 'react-router-dom'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {toastr} from 'react-redux-toastr'

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
    signupUser : (info) => {
      api.signup(info).then(function(res) {
        dispatch(signUpUser(info))
        dispatch(push('/login'))
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
      password : '',
      email : '',
      name : '',
      age : '',
      income : '',
      family_size : '',
      num_adults : '',
      num_kids : '',
      shop_trip_freq : ''
     }
  }

  onSignup(e) {
    let info = this.state;
    this.props.signupUser(info)
  }

  render() {
    let spacer = {
      marginLeft : '10px'
    }
    // <button
    //     onClick={() => toastr.success('The title', 'The message')}
    //     type="button">Toastr Success</button>
    return (
      <div>
      <h1>
        Signup
      </h1>

      <div>
      <TextField
        onChange = {(e) => {this.setState({username: e.target.value})}}
        floatingLabelFixed = {true}
        floatingLabelText="Username"
      />
      <TextField
          onChange = {(e) => {this.setState({password: e.target.value})}}
          floatingLabelFixed = {true}
          style={spacer}
          floatingLabelText="Password"
          type="password" />
      </div>
      <br />
      <div>
      <TextField
          onChange = {(e) => {this.setState({name: e.target.value})}}
          floatingLabelFixed = {true}
          floatingLabelText="Name" />
        <TextField
        onChange = {(e) => {this.setState({age: e.target.value})}}
        floatingLabelFixed = {true}
        style = {spacer}
        floatingLabelText="Age" />

      </div>
      <div>
          <TextField
          onChange = {(e) => {this.setState({income: e.target.value})}}
          floatingLabelFixed = {true}
          floatingLabelText="Income in $" />
          <TextField
            onChange = {(e) => {this.setState({shop_trip_freq: e.target.value})}}
            floatingLabelFixed = {true}
            style = {spacer}
            floatingLabelText="Shopping frequency"/>
      </div>
      <br />
      <h4>Family Details</h4>
      <div>
        <TextField
          onChange = {(e) => {this.setState({family_size: e.target.value})}}
          floatingLabelFixed = {true}
          floatingLabelText="Family Size"
        />
        <TextField
            onChange = {(e) => {this.setState({num_adults: e.target.value})}}
            floatingLabelFixed = {true}
            style={spacer}
            floatingLabelText="Number of Adults"/>
        <TextField
            onChange = {(e) => {this.setState({num_kids: e.target.value})}}
            floatingLabelFixed = {true}
            style={spacer}
            floatingLabelText="Number of Kids"/>
      </div>
      <br />
      <Link to='/login'>Back to Login</Link>
      <span style={{'paddingRight':'20px'}}></span>
      <RaisedButton primary={true} onClick={this.onSignup.bind(this)} label = 'Signup'></RaisedButton>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
