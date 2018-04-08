import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import TextField from 'material-ui/TextField';
import VerifyTable from './VerifyTable'
import {api} from './../../../util/api';
import {setReceipt} from './../../../actions/receiptAction';
var Loader = require('react-loader');
import {toastr} from 'react-redux-toastr'

import {connect} from 'react-redux';

const uploadFileboxCss = {
  // width: '100%',
  height: '250px',
  textAlign: 'center',
  // padding: '50px 120px',
  paddingTop: '50px',
  color: '#898989',
  border: '2px dashed #B8B8B8'
}


const mapStateToProps = function(state){
  return {
    username : state.loginReducer.username
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    resetCurrentReceipt: () => {
      dispatch(setReceipt([]))
    },
    uploadReceiptData : (username, data, cb) => {
      api.submitFileUpload(username, data).then(function(json_res) {
        console.log('res:', json_res)
        if(json_res['error']) {
          toastr.error('Failed to upload receipt...', json_res['error']);
          cb(false);
          return;
        }
        // dispatch(setReceiptId(json_res['result']));
        api.getReceiptDataById(username,json_res['data'][0]['receipt_id']).then(function(res) {
          console.log('receipt data:', res);
          dispatch(setReceipt({receipt: res['receipt_data']}));
          cb(true);
        });
      }, function(err) {
        console.log(err)
        toastr.error('Failed to upload receipt...', err['error']);
        cb(false);
      });
    }
  };
};

class ReceiptUploader extends React.Component {
  constructor(props) {
    super(props);
    console.log('ReceiptUploader', props)
    this.onTabChange = props.onTabChange;
    this.state = {
      loading: false,
      finished: false,
      file : null,
      stepIndex: 0,
    };
  }


  componentDidMount() {
    this.props.resetCurrentReceipt();
  }

  dummyAsync = (cb) => {
    this.setState({loading: true}, () => {
      this.asyncTimer = setTimeout(cb, 500);
    });
  };

  handleNext = () => {

    const {stepIndex} = this.state;
    if (!this.state.loading) {
      this.dummyAsync(() => this.setState({
        loading: false,
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
      }));
    }
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (!this.state.loading) {
      this.dummyAsync(() => this.setState({
        loading: false,
        stepIndex: stepIndex - 1,
      }));
    }
  };

  handleFileUpload = (e) => {
    console.log('file',e.target.files)
    this.setState({file: e.target.files[0]})
    //
  }

  submitFileUpload = (e) => {
    const {stepIndex} = this.state;
    this.setState({loading: true}, () => {
      this.props.uploadReceiptData(this.props.username, this.state.file, (isSuccess) => {
        if(isSuccess) {
          this.setState({
            loading: false,
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2,
          })
        } else {
          this.setState({
            loading: false
          })
        }
      })
    })
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div style={uploadFileboxCss}>
            <div style={{'marginBottom': '20px'}}> Upload your receipt here</div>
              <div className='file-upload-container'>
                Select a file: <input type="file" name="upload" onChange={this.handleFileUpload.bind(this)}/>
              </div>
            <br/>
            <RaisedButton
              label={'Upload'}
              primary={true}
              onClick={this.submitFileUpload}
            />
          </div>
        );
      case 1:
        return (
          <VerifyTable onTabChange={this.onTabChange}/>
        );
      case 2:
        return (
          <div>
            <WastageTable />
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent = () => {
    const {finished, stepIndex, file} = this.state;
    const contentStyle = {margin: '0 16px', overflow: 'hidden'};

    if (finished) {
      return (
        <div style={contentStyle}>
          <h2>Analytic/Results</h2>
        </div>
      );
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
      </div>
    );
  }

  render() {
    const {loading, stepIndex} = this.state;
    // <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
    // <p>Nulla semper at enim eget sodales. Donec ac iaculis dolor, ac tincidunt nunc. Nulla scelerisque massa non libero interdum sollicitudin. Suspendisse tempus purus dolor, a tincidunt lacus pharetra a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed eleifend ipsum. Curabitur at augue arcu. Duis efficitur mauris sit amet ipsum porttitor semper. Phasellus magna ex, auctor vitae eros eu, efficitur dictum lacus. Nulla posuere tortor ante. Etiam a augue libero. Maecenas eget sagittis erat. Sed ullamcorper vulputate nulla commodo posuere.</p>
    // <div style={{'textAlign' : 'left'}}>
    //
    // </div>
    return (
      <div style={{width: '100%', margin: 'auto'}}>
        <h1>
          Upload Receipt
        </h1>
        <p>Upload your shopping receipts by taking a picture and uploading the picture here. Then be sure to enter how much food is wasted in the Receipt History section. The more accurate waste data you enter, the more money GrocerySaver can help you keep in your pocket!</p>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Upload Receipt</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify Receipt Items</StepLabel>
          </Step>
        </Stepper>
        <Loader loaded={!this.state.loading}>
        <ExpandTransition loading={loading} open={true}>
            {this.renderContent()}
        </ExpandTransition>
        </Loader>
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ReceiptUploader);
