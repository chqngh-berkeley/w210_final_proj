import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom'
let bottomLogo = require('../../images/berkeleyischool-logo-white-lg.png');
const st = {
  backgroundColor : 'black',
  color: 'white',
  textAlign: 'center',
  position: 'fixed',
  bottom: '0',
  width: '100%',
  fontSize: '10px',
  padding: '15px 0'
}


class FooterBar extends React.Component {
  render() {
    // <FlatButton primary={true} label="Consumer App" />
    // <FlatButton primary={true} label="Retailer App" />
    const lstSt = {
      paddingLeft: '5px',
      paddingRight: '5px',
      color: 'white'
    }
    return (
      <footer style = {st}>
        <div style={{display: 'inline-block', textAlign:'left', float: 'left'}}>
          <img style={{marginLeft: '10px', width: 200, height: 40}} src={bottomLogo} />
        </div>
        <div style={{display: 'inline-block'}}>
          <a style={lstSt} href='mailto:adam.reilly@ischool.berkeley.edu'>Adam Reilly</a> |
          <a style={lstSt} href='mailto:pzhou11@berkeley.edu'>Peter Zhou</a> |
          <a style={lstSt} href='mailto:svaradarajan1982@berkeley.edu'>Varadarajan Srinivasan</a> |
          <a style={lstSt} href='mailto:chqngh@berkeley.edu'>Chuqing He</a>
        </div>

        <div>
          <a target='_blank' href='https://security.berkeley.edu/privacy-statement-uc-berkeley-websites'>Privacy Notice</a>
        </div>
      </footer>
    );
  }
}

export default FooterBar;
