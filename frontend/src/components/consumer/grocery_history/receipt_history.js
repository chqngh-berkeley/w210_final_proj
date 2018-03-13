import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'

import {setReceiptData, removeReceiptFromHistory} from './../../../actions/receiptAction'
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';

const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const mapStateToProps = function(state){
  console.log(state)
  return {
    receiptHistoryData : state.receiptHistoryReducer
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      removeReceiptFromHistory :(item) => {
        dispatch(removeReceiptFromHistory(item));
      },
      setCurrentReceipt :(item) => {
        let dummyJson = [
          {food_name : 'Apple',
           price : '5$',
           count : '5',
           size : '32oz',
           category : 'Fruit',
           closest_category : 'Fruit'},
          {food_name : 'Orange',
           price : '5$',
           count : '5',
           size : '32oz',
           category : 'Fruit',
           closest_category : 'Fruit'},
          {food_name : 'Banana',
           price : '5$',
           count : '5',
           size : '32oz',
           category : 'Fruit',
           closest_category : 'Fruit'
         }
        ]
        dispatch(setReceiptData(dummyJson));
      }
    }
};


class ReceiptHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fixedHeader: true,
      fixedFooter: true,
      stripedRows: false,
      showRowHover: false,
      selectable: false,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: true,
      showCheckboxes: true,
      height: '300px',
    };
  }
  handleToggle = (event, toggled) => {
    this.setState({
      [event.target.name]: toggled,
    });
  };

  handleChange = (event) => {
    this.setState({height: event.target.value});
  };

  handleOnReceiptEdit = (event, idx) => {
    console.log('Edit data...', idx, this.props.receiptHistoryData[idx])
    this.props.setCurrentReceipt(this.props.receiptHistoryData[idx]);
  }
  handleOnReceiptRemove = (event, idx) => {
    console.log('remove data...', idx, this.props.receiptHistoryData[idx])
    this.props.removeReceiptFromHistory(this.props.receiptHistoryData[idx]);
  }

  componentDidMount() {

  }
  render() {

    return (
      <div>
        <h1> Grocery List Recommender </h1>
        <br />
        <Table
          height={this.state.height}
          fixedHeader={this.state.fixedHeader}
          fixedFooter={this.state.fixedFooter}

        >
          <TableHeader>
            <TableRow>
              <TableHeaderColumn colSpan="3" style={{textAlign: 'left'}}>
                Receipt List History
              </TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn tooltip="item">Receipt ID</TableHeaderColumn>
              <TableHeaderColumn tooltip="timestamp">Date</TableHeaderColumn>
              <TableHeaderColumn tooltip="action">Wastage Info</TableHeaderColumn>
              <TableHeaderColumn tooltip="action">Edit</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
            {this.props.receiptHistoryData && this.props.receiptHistoryData.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.id}</TableRowColumn>
                <TableRowColumn>{new Date(parseInt(row.timestamp)).toString()}</TableRowColumn>
                <TableRowColumn>
                  {row.wastageInfo ? row.wastageInfo : 'N/A'}
                </TableRowColumn>
                <TableRowColumn>
                  <Link
                    to = '/receiptInfo'
                    onClick = {this.handleOnReceiptEdit.bind(this, null, index)}>
                  Edit
                  </Link>
                </TableRowColumn>
              </TableRow>
              ))}
          </TableBody>
          <TableFooter>
          </TableFooter>
        </Table>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiptHistory)
