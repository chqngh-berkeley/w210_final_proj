require('normalize.css/normalize.css');
require('styles/App.css');
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import {
  teal500, teal700,
  pinkA200, lightBlueA700, indigo100,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,amber200
} from 'material-ui/styles/colors';

import HeaderBar from './common/HeaderBar';
import FooterBar from './common/FooterBar';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: teal500,
    primary2Color: teal700,
    primary3Color: grey400,
    accent1Color: '#D7966C',
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    pickerHeaderColor: teal500,
    shadowColor: fullBlack,
  }
});

export default class AppComponent extends React.Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
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
