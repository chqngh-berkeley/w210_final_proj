import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom'

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
        <a style={lstSt} href='/'>Adam Reilly</a> |
        <a style={lstSt} href='/'>Peter Zhou</a> |
        <a style={lstSt} href='/'>Varadarajan Srinivasan</a> |
        <a style={lstSt} href='/'>Chuqing He</a>

      </footer>
    );
  }
}

export default FooterBar;
