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
import WastageTable from './WastageTable'

const uploadFileboxCss = {
  // width: '100%',
  height: '150px',
  textAlign: 'center',
  // padding: '50px 120px',
  paddingTop: '50px',
  color: '#898989',
  border: '2px dashed #B8B8B8'
  
}

class HorizontalTransition extends React.Component {

  state = {
    loading: false,
    finished: false,
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
  
  handleUpload = () => {
    
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div style={uploadFileboxCss}>
            <div style={{'marginBottom': '20px'}}> Drag/Drop your receipt here or use the Upload button</div>
            
            <RaisedButton
              label={'Upload'}
              primary={true}
              onClick={this.handleUpload}
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
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px', overflow: 'hidden'};

    if (finished) {
      return (
        <div style={contentStyle}>
          <p>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                this.setState({stepIndex: 0, finished: false});
              }}
            >
              Click here
            </a> to reset the example.
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
            label={stepIndex === 2 ? 'Finish' : 'Next'}
            primary={true}
            onClick={this.handleNext}
          />
        </div>
      </div>
    );
  }

  render() {
    const {loading, stepIndex} = this.state;

    return (
      <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Upload Receipt</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify Info</StepLabel>
          </Step>
          <Step>
            <StepLabel>Analytics</StepLabel>
          </Step>
        </Stepper>
        <ExpandTransition loading={loading} open={true}>
          {this.renderContent()}
        </ExpandTransition>
      </div>
    );
  }
}

export default HorizontalTransition;