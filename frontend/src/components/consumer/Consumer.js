import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import HorizontalTransition from './HorizontalTransition';
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

class Consumer extends React.Component {
  render() {
    return (
      <div>
      <header>
        Consumer App
      </header>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
        <p>Nulla semper at enim eget sodales. Donec ac iaculis dolor, ac tincidunt nunc. Nulla scelerisque massa non libero interdum sollicitudin. Suspendisse tempus purus dolor, a tincidunt lacus pharetra a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed eleifend ipsum. Curabitur at augue arcu. Duis efficitur mauris sit amet ipsum porttitor semper. Phasellus magna ex, auctor vitae eros eu, efficitur dictum lacus. Nulla posuere tortor ante. Etiam a augue libero. Maecenas eget sagittis erat. Sed ullamcorper vulputate nulla commodo posuere.</p>
        <div style={{'textAlign' : 'left'}}>
          <HorizontalTransition />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Consumer)