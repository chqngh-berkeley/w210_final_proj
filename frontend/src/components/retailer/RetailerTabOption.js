import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import DatePicker from 'material-ui/DatePicker';
import Toggle from 'material-ui/Toggle';
import OptimizerTable from './OptimizerTable'

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  }
};

export default class RetailerTabOption extends React.Component {

  constructor(props) {
    super(props);
    const minDate = new Date();
    const maxDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    minDate.setHours(0, 0, 0, 0);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    maxDate.setHours(0, 0, 0, 0);

    this.state = {
      minDate: minDate,
      maxDate: maxDate,
      autoOk: false,
      disableYearSelection: false,
      value: 'a',
    };
  }

  handleChange = (value) => {
    this.setState({
      value: value,
    });
  };


  handleChangeMinDate = (event, date) => {
    this.setState({
      minDate: date,
    });
  };

  handleChangeMaxDate = (event, date) => {
    this.setState({
      maxDate: date,
    });
  };

  render() {
    return (
      <Tabs
        value={this.state.value}
        onChange={this.handleChange}
      >
        <Tab label="Optimizer" value="a">
          <div>
            <DatePicker
              onChange={this.handleChangeMinDate}
              autoOk={this.state.autoOk}
              floatingLabelText="Min Date"
              defaultDate={this.state.minDate}
              disableYearSelection={this.state.disableYearSelection}
            />
            <DatePicker
              onChange={this.handleChangeMaxDate}
              autoOk={this.state.autoOk}
              floatingLabelText="Max Date"
              defaultDate={this.state.maxDate}
              disableYearSelection={this.state.disableYearSelection}
            />
            <OptimizerTable />
            <hr />
          </div>
        </Tab>
        <Tab label="General Analysis" value="b">
          <div>
            <DatePicker
              onChange={this.handleChangeMinDate}
              autoOk={this.state.autoOk}
              floatingLabelText="Min Date"
              defaultDate={this.state.minDate}
              disableYearSelection={this.state.disableYearSelection}
            />
            <DatePicker
              onChange={this.handleChangeMaxDate}
              autoOk={this.state.autoOk}
              floatingLabelText="Max Date"
              defaultDate={this.state.maxDate}
              disableYearSelection={this.state.disableYearSelection}
            />
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
        </Tab>
      </Tabs>
    );
  }
}
