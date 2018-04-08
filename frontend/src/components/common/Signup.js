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
import {toastr} from 'react-redux-toastr';
import { withRouter } from 'react-router-dom';
var Loader = require('react-loader');
import Checkbox from 'material-ui/Checkbox';
import {
  teal500, teal700,
  pinkA200, lightBlueA700, indigo100,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,amber200
} from 'material-ui/styles/colors';

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
    signupUser : (info, cb) => {
      api.signup(info).then(function(res) {
        console.log(res)
        if(res['error']) {
          cb(false)
          toastr.error('There is an error creating your account', res['error'])
        } else {
          cb(true)
          toastr.success('Your account has been created','')
        }
      });
      // dispatch(push('/consumer'));
    }
  };
};


class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      username : '',
      password : '',
      name : 'bob',
      age : '',
      income : 0,
      family_size : '',
      num_adults : '',
      num_kids : '',
      shop_trip_freq : 0
     }
  }

  onSignup(e) {
    let info = this.state;
    this.setState({loading: true})
    this.props.signupUser(info, (isSuccess)=> {
      this.setState({loading: false});
      if(isSuccess) {
          this.props.history.push('/login');
      }
    })
  }
  updateCheck(e,v) {
    console.log(e,v);
    this.setState({checked: v})
  }

  render() {
    let spacer = {
      marginLeft : '10px'
    }
    // <div>
    //     <TextField
    //       onChange = {(e) => {this.setState({shop_trip_freq: e.target.value})}}
    //       floatingLabelFixed = {true}
    //       style = {spacer}
    //       floatingLabelText="Shopping frequency"/>
    // </div>
    // <TextField
    //     onChange = {(e) => {this.setState({name: e.target.value})}}
    //     floatingLabelFixed = {true}
    //     floatingLabelText="Name" />
    let privacy_notice = 'By signing up, you are providing consent to use your data in anonymized form for research purpose only.';
    return (
      <div>
      <Loader loaded={!this.state.loading}>
        <h1>
          Signup
        </h1>

        <div>
        <TextField
          onChange = {(e) => {this.setState({username: e.target.value})}}
          floatingLabelFixed = {true}
          floatingLabelShrinkStyle = {{color:'gray'}}
          floatingLabelText="Username"
        />
        <TextField
            onChange = {(e) => {this.setState({password: e.target.value})}}
            floatingLabelFixed = {true}
            style={spacer}
            floatingLabelText="Password"
            floatingLabelShrinkStyle = {{color:'gray'}}
            type="password" />
            <TextField
            onChange = {(e) => {this.setState({age: e.target.value})}}
            floatingLabelFixed = {true}
            style = {spacer}
            floatingLabelShrinkStyle = {{color:'gray'}}
            floatingLabelText="Age" />
        </div>
        <br />
        <br />
        <br />
        <h4>Family Details</h4>
        <div>
          <TextField
            onChange = {(e) => {this.setState({family_size: e.target.value})}}
            floatingLabelFixed = {true}
            floatingLabelShrinkStyle = {{color:'gray'}}
            floatingLabelText="Family Size"
          />

          <TextField
              onChange = {(e) => {this.setState({num_adults: e.target.value})}}
              floatingLabelFixed = {true}
              style={spacer}
              floatingLabelShrinkStyle = {{color:'gray'}}
              floatingLabelText="Number of Adults"/>

          <TextField
              onChange = {(e) => {this.setState({num_kids: e.target.value})}}
              floatingLabelFixed = {true}
              style={spacer}
              floatingLabelShrinkStyle = {{color:'gray'}}
              floatingLabelText="Number of Kids"/>
        </div>
        <br />
        <div style={{textAlign: 'left', display: 'inline-block'}}>
          <Checkbox
              style={{width: '700px'}}
              label={privacy_notice}
              checked={this.state.checked}
              onCheck={this.updateCheck.bind(this)}
            />
        </div>
        <br />
        <br />
        <Link to='/login'>Back to Login</Link>
        <span style={{'paddingRight':'20px'}}></span>
        <RaisedButton primary={true} disabled={!this.state.checked} onClick={this.onSignup.bind(this)} label = 'Signup'></RaisedButton>
        </Loader>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Signup))
