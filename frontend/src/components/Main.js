require('normalize.css/normalize.css');
require('styles/App.css');
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import HeaderBar from './common/HeaderBar';
import FooterBar from './common/FooterBar';

export default class AppComponent extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <HeaderBar />
          <div>
            {this.props.children}
          </div>
          <br />
          <br />
          <br />
          <br />
          <FooterBar />
        </div>
      </MuiThemeProvider>
    );
  }
}
