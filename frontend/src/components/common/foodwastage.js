import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
// var __html = require('../informational-analytics/index.html');
// var template = { __html: __html };

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


class FoodWastage extends React.Component {

  componentDidMount() {
    // var divElement = document.getElementById('viz1517880550497');
    // var vizElement = divElement.getElementsByTagName('object')[0];
    // vizElement.style.width='1200px';vizElement.style.height='827px';
    // var scriptElement = document.createElement('script');
    // scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    // vizElement.parentNode.insertBefore(scriptElement, vizElement);
  }
  rawMarkup(){
      return { __html: `<div class='tableauPlaceholder' id='viz1517880550497' style='position: relative'><noscript><a href='#'><img alt='Human Impact ' src='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;7M&#47;7MGG6C86Z&#47;1_rss.png' style='border: none' /></a></noscript><object class='tableauViz'  style='display:none;'><param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' /> <param name='embed_code_version' value='3' /> <param name='path' value='shared&#47;7MGG6C86Z' /> <param name='toolbar' value='yes' /><param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;7M&#47;7MGG6C86Z&#47;1.png' /> <param name='animate_transition' value='yes' /><param name='display_static_image' value='yes' /><param name='display_spinner' value='yes' /><param name='display_overlay' value='yes' /><param name='display_count' value='yes' /><param name='filter' value='publish=yes' /></object></div>`
    };
  }
  render() {
    // <iframe src='https://public.tableau.com/shared/7MGG6C86Z?:display_count=yes:embed=y' width='600px' height='400px'></iframe>
    // <span dangerouslySetInnerHTML={template}></span>
    let iframe_st = {
      // "position": "fixed",
      // "top": "40px",
      // "left": "0px",
      // "bottom": "40px",
      // "right": "0px",
      // "width": "100%",
      // "height": "100%",
      // "border": "none",
      // "margin": "0",
      // "padding": "0",
      // "overflow": "scroll",
      // "z-index": "999999"
    }
    // <iframe src="http://people.ischool.berkeley.edu/~varadarajan/informational-analytics/" style={iframe_st}></iframe>
    return (
      <div>
        <iframe src="http://0.0.0.0:8585/" width='100%' height='700px' style={iframe_st}></iframe>
        <br />
        <br />
        <br />
        <br />
      </div>
    );
  }
}

export default connect(mapStateToProps)(FoodWastage)
