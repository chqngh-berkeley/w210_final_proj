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
import {setReceiptId, setReceiptData} from './../../../actions/receiptAction';

import {connect} from 'react-redux';

const uploadFileboxCss = {
  // width: '100%',
  height: '150px',
  textAlign: 'center',
  // padding: '50px 120px',
  paddingTop: '50px',
  color: '#898989',
  border: '2px dashed #B8B8B8'
}


const mapStateToProps = function(state){
  return {

  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    uploadReceiptData : (data) => {
      api.submitFileUpload(data).then(function(json_res) {
        console.log('res:', json_res)
        dispatch(setReceiptId(json_res['result']));
        api.getReceiptDataById(json_res['result']).then(function(res) {
          console.log('receipt data:', res);
          dispatch(setReceiptData(res['result']));
        });
      });
    }
  };
};

class ReceiptUploader extends React.Component {

  state = {
    loading: false,
    finished: false,
    file : null,
    stepIndex: 0,
  };

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
    this.props.uploadReceiptData(this.state.file);
    this.handleNext()
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
          <VerifyTable />
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
          <hr />
          <br/>
          <br/>
          <h3> TBD: Tableau Analytics </h3>
          <hr />
          <br/>
          <br/>
          <h3> TBD: Tableau Analytics </h3>
          <hr />
          <br/>
          <br/>
          <h3> TBD: Tableau Analytics </h3>
          <hr/>
          <p>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                this.setState({stepIndex: 0, finished: false});
              }}
            >
              Click here
            </a> to start over.
          </p>
        </div>
      );
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={{marginTop: 24, marginBottom: 12}}>
          <FlatButton
            label="Back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={{marginRight: 12}}
          />
          <RaisedButton
            label={stepIndex === 1 ? 'Finish' : 'Next'}
            primary={true}
            onClick={this.handleNext}
          />
        </div>
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

        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Upload Receipt</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify Receipt Items</StepLabel>
          </Step>
        </Stepper>
        <ExpandTransition loading={loading} open={true}>
          {this.renderContent()}
        </ExpandTransition>
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ReceiptUploader);
