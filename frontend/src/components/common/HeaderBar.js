import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom'

const st = {
  backgroundColor : 'black',
  color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}


class HeaderBar extends React.Component {
  render() {
    // <FlatButton primary={true} label="Consumer App" />
    // <FlatButton primary={true} label="Retailer App" />
    const linkStyle = {
      color: 'white'
    }
    return (
      <header style = {st}>
        <span>
         <Link style={linkStyle} to='/consumer'>Foot Wastage Statistics/Impacts </Link>
         <span style={{'paddingRight':'20px'}}></span>
          <Link style={linkStyle} to='/consumer'>Consumer App </Link>
          <span style={{'paddingRight':'20px'}}></span>
          <Link style={linkStyle} to='/retailer'>Retailer App </Link>
          <span style={{'paddingRight':'20px'}}></span>
          <Link style={linkStyle} to='/faq'>FAQ</Link>
          <span style={{'paddingRight':'20px'}}></span>
        </span>

      </header>
    );
  }
}

export default HeaderBar;
