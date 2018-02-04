import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';

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


class FAQ extends React.Component {
  render() {
    return (
      <div>
      <h1>
        FAQ
      </h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
        <p>Nulla semper at enim eget sodales. Donec ac iaculis dolor, ac tincidunt nunc. Nulla scelerisque massa non libero interdum sollicitudin. Suspendisse tempus purus dolor, a tincidunt lacus pharetra a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed eleifend ipsum. Curabitur at augue arcu. Duis efficitur mauris sit amet ipsum porttitor semper. Phasellus magna ex, auctor vitae eros eu, efficitur dictum lacus. Nulla posuere tortor ante. Etiam a augue libero. Maecenas eget sagittis erat. Sed ullamcorper vulputate nulla commodo posuere.</p>
        <br/>
        <img style={{'width': '512px', 'height':'338px'}} src='http://www.berkeleyside.com/wp-content/uploads/2010/12/UC-Berkeley.jpg' />
        <br/>
        <p>Nulla semper at enim eget sodales. Donec ac iaculis dolor, ac tincidunt nunc. Nulla scelerisque massa non libero interdum sollicitudin. Suspendisse tempus purus dolor, a tincidunt lacus pharetra a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed eleifend ipsum. Curabitur at augue arcu. Duis efficitur mauris sit amet ipsum porttitor semper. Phasellus magna ex, auctor vitae eros eu, efficitur dictum lacus. Nulla posuere tortor ante. Etiam a augue libero. Maecenas eget sagittis erat. Sed ullamcorper vulputate nulla commodo posuere.</p>
        
        <p>Nulla semper at enim eget sodales. Donec ac iaculis dolor, ac tincidunt nunc. Nulla scelerisque massa non libero interdum sollicitudin. Suspendisse tempus purus dolor, a tincidunt lacus pharetra a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed eleifend ipsum. Curabitur at augue arcu. Duis efficitur mauris sit amet ipsum porttitor semper. Phasellus magna ex, auctor vitae eros eu, efficitur dictum lacus. Nulla posuere tortor ante. Etiam a augue libero. Maecenas eget sagittis erat. Sed ullamcorper vulputate nulla commodo posuere.</p>
      </div>
    );
  }
}

export default connect(mapStateToProps)(FAQ)