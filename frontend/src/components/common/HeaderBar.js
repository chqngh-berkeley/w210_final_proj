import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom'
import {connect} from 'react-redux';
import { push } from 'react-router-redux';
import {logoutUser} from '../../actions/loginAction'
import {BASE_HOST} from '../../constants/constants';
let logo = require('../../images/logo.png')
const st = {
  backgroundColor : 'white',
  color: 'black',
  textAlign: 'left',
  // margin: '0 auto',
  padding: '15px'
}

const mapStateToProps = function(state){
  return {
    loggedIn : state.loginReducer.loggedIn,
    username : state.loginReducer.username
  };
};


const mapDispatchToProps =(dispatch) => {
  return {
    logoutUser : () => {
        dispatch(logoutUser());
      //
    }
  };
};

class HeaderBar extends React.Component {
  render() {
    const linkStyle = {
      // color: 'black',
      textDecoration: 'none',
      marginLeft : '5px'
    }
    var el = <span></span>
    if(this.props.username) {
      el = (<span className="w3-bar-item w3-button w3-hide-small">
          <i className="fa fa-sign-out"></i>
          <Link style={linkStyle} to='/login' onClick={this.props.logoutUser}>Logout</Link>
        </span>)
    } else {
      //
      // <i className="fa fa-binoculars"></i>
      el = (<span className="w3-bar-item w3-button w3-hide-small">
        <img style={{width: 19, height: 19}} src={logo} />
        <Link style={linkStyle} to='/login'>
          Grocery Saver
        </Link>
        </span>)
    }
    return (
      <header>
          <a href={`http://people.ischool.berkeley.edu/~chqngh/w210/intro/#home`} className="w3-bar-item w3-button"><i className="fa fa-home"></i> Home</a>
          <a href={`http://people.ischool.berkeley.edu/~chqngh/w210/intro/#introduction`} className="w3-bar-item w3-button w3-hide-small"><i className="fa fa-circle"></i> Introduction</a>
          <a href={`http://people.ischool.berkeley.edu/~chqngh/w210/intro/#data`} className="w3-bar-item w3-button w3-hide-small"><i className="fa fa-database"></i> The Data</a>
          <a href={`http://people.ischool.berkeley.edu/~chqngh/w210/intro/#about`} className="w3-bar-item w3-button w3-hide-small"><i className="fa fa-user"></i> About Us</a>
         <a href={`http://people.ischool.berkeley.edu/~chqngh/w210/informational-analytics/`} className="w3-bar-item w3-button w3-hide-small"><i className="fa fa-area-chart"></i> Infomatics </a>
         {el}
     </header>
   );
 }
}
      //   </span>
      //
      // </header>


export default connect(mapStateToProps, mapDispatchToProps)(HeaderBar)
