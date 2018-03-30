import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import {api} from './../../../util/api';
import {connect} from 'react-redux';
import {setReceiptData} from './../../../actions/receiptAction';
const styles = {
  propContainer: {
    width: 200,
    overflow: 'hidden',
    margin: '20px auto 0',
  },
  propToggleHeader: {
    margin: '20px auto 10px',
  },
};

const mapStateToProps = function(state){
  return {
    username: state.loginReducer.username,
    current_receipt : state.receiptReducer.current_receipt
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    getReceiptData : (user_id, receipt_id) => {
      api.getReceiptDataById(user_id, receipt_id).then(function(res) {
        console.log('receipt data:', res);
        dispatch(setReceiptData(res['result']));
      });
    },
    updateReceipt : (user_id, receipt_id, receipt_data).then(function(res) {
      api.updateReceiptDataById(user_id, receipt_id, receipt_data).then(function(res) {
        console.log('receipt data:', res);
        dispatch(setReceiptData(res['result']));
      });
    })
  };
};
/**
 * A more complex example, allowing the table height to be set, and key boolean properties to be toggled.
 */
class VerifyTable extends Component {
  constructor(props) {
    super(props);

  }
  state = {
    fixedHeader: true,
    fixedFooter: true,
    stripedRows: false,
    showRowHover: true,
    selectable: false,
    multiSelectable: false,
    enableSelectAll: false,
    deselectOnClickaway: true,
    showCheckboxes: false,
    height: '250x',
  };

  componentDidMount() {
    // this.props.getReceiptData(this.props.receiptId)
  }

  handleToggle = (event, toggled) => {
    this.setState({
      [event.target.name]: toggled,
    });
  };

  handleChange = (event) => {
    this.setState({height: event.target.value});
  };

  render() {
    return (
      <div>
        {this.getUploadedReceipt()}
        <RaisedButton label="Submit"></RaisedButton>
      </div>
    );
  }

  getUploadedReceipt() {
    return (
      <Table
        height={this.state.height}
        fixedHeader={this.state.fixedHeader}
        fixedFooter={this.state.fixedFooter}
        selectable={this.state.selectable}
        multiSelectable={this.state.multiSelectable}
      >
        <TableHeader
          displaySelectAll={this.state.showCheckboxes}
          adjustForCheckbox={this.state.showCheckboxes}
          enableSelectAll={this.state.enableSelectAll}
        >
          <TableRow>
            <TableHeaderColumn colSpan="4" tooltip="Receipt Data" style={{textAlign: 'left'}}>
              Receipt data
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
          <TableHeaderColumn tooltip="item">Food Name</TableHeaderColumn>

          <TableHeaderColumn tooltip="price">Price($)</TableHeaderColumn>
          <TableHeaderColumn tooltip="category">Category</TableHeaderColumn>
          <TableHeaderColumn tooltip="closest_category">Closest Category</TableHeaderColumn>
          <TableHeaderColumn tooltip="count">Count</TableHeaderColumn>
          <TableHeaderColumn tooltip="size">Size</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={this.state.showCheckboxes}
          deselectOnClickaway={this.state.deselectOnClickaway}
          showRowHover={this.state.showRowHover}
          stripedRows={this.state.stripedRows}
        >
          {this.props.current_receipt && this.props.current_receipt.length > 0 &&
            this.props.current_receipt.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn tooltip={row.food_name}>{row.food_name}</TableRowColumn>
              <TableRowColumn tooltip={row.price}>{row.price}</TableRowColumn>
              <TableRowColumn tooltip={row.category}>{row.category}</TableRowColumn>
              <TableRowColumn tooltip={row.closest_category}>{row.closest_category}</TableRowColumn>
              <TableRowColumn tooltip={row.count}>
                <TextField value = {row.count == 'unknown_count'?  'N/A' :  row.count} />
              </TableRowColumn>
              <TableRowColumn tooltip={row.size}>
                <TextField value = {row.size == 'Unknown Size'?  'N/A' :  row.size} />
              </TableRowColumn>
            </TableRow>
            ))}
        </TableBody>
        <TableFooter
          adjustForCheckbox={this.state.showCheckboxes}
        >
        </TableFooter>
      </Table>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyTable)
