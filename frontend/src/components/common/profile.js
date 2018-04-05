import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {updateUser} from '../../actions/loginAction'
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
    user : state.loginReducer
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    updateUserInfo : (info) => {
      console.log(info)
      api.updateUserInfo(info['username'],info).then(function(res) {
        // dispatch(signUpUser(info))
        console.log(res)
      });
      // dispatch(push('/consumer'));
    },
    updateUser: ( info) => {
      dispatch(updateUser(info))
    }
  };
};


class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  onUpdate(e) {
    let user = this.props.user;
    this.props.updateUserInfo(user)
  }

  onValueChange = (field, e, v) => {
    let cp = Object.assign({},this.props.user)
    cp[field] = v;
    this.props.updateUser(cp)
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
        Profile Info
      </h1>

      <div>
      <TextField
        onChange = {this.onValueChange.bind(this,'username')}
        floatingLabelFixed = {true}
        disabled={true}
        value={this.props.user.username}
        floatingLabelText="Username"
      />
      <TextField
          onChange = {this.onValueChange.bind(this,'password')}
          floatingLabelFixed = {true}
          style={spacer}
          value={this.props.user.password}
          floatingLabelText="Password"
           />
      </div>
      <br />
      <div>
      <TextField
          onChange = {this.onValueChange.bind(this,'name')}
          floatingLabelFixed = {true}
          value={this.props.user.name}
          floatingLabelText="Name" />

        <TextField
        onChange = {this.onValueChange.bind(this,'age')}
        value={this.props.user.age}
        floatingLabelFixed = {true}
        style = {spacer}
        floatingLabelText="Age" />

      </div>
      <div>
          <TextField
          onChange = {this.onValueChange.bind(this,'income')}
          value={this.props.user.income}
          floatingLabelFixed = {true}
          floatingLabelText="Income in $" />
          <TextField
            onChange = {this.onValueChange.bind(this,'shopping_freq')}
            value={this.props.user.shopping_freq}
            floatingLabelFixed = {true}
            style = {spacer}
            floatingLabelText="Shopping frequency"/>
      </div>
      <br />
      <h4>Family Details</h4>
      <div>
        <TextField
          onChange = {this.onValueChange.bind(this,'family_size')}
          value={this.props.user.family_size}
          floatingLabelFixed = {true}
          floatingLabelText="Family Size"
        />
        <TextField
            onChange = {this.onValueChange.bind(this,'num_adults')}
            value={this.props.user.num_adults}
            floatingLabelFixed = {true}
            style={spacer}
            floatingLabelText="Number of Adults"/>
        <TextField
            onChange = {this.onValueChange.bind(this,'num_kids')}
            value={this.props.user.num_kids}
            floatingLabelFixed = {true}
            style={spacer}
            floatingLabelText="Number of Kids"/>
      </div>
      <br />
      <RaisedButton primary={true} onClick={this.onUpdate.bind(this)} label = 'Update'></RaisedButton>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
