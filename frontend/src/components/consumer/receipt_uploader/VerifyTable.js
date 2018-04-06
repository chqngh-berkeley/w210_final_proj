import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
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
import {toastr} from 'react-redux-toastr';
import { withRouter } from 'react-router-dom'
import {setReceiptData, setReceipt} from './../../../actions/receiptAction';
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
    setReceiptItem :(receipt) => {
      dispatch(setReceipt(receipt));
    },
    updateReceipt : (user_id, receipt_id, receipt_data, cb) => {
      console.log(receipt_data)
      api.updateReceiptDataById(user_id, receipt_id, receipt_data).then(function(res) {
        console.log('receipt data:', res);
        if(res['error']) {
          cb(false);
          toastr.error('Failed to Update Receipt:', res['error']);
          return;
        }
        cb(true)
        toastr.success('Updated Receipt:', receipt_id);

      });
    }
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
    height: '400px',
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
  submitReceipt() {
    console.log('submit receipt clicked');
    let receipt_id = this.props.current_receipt['receipt'][0]['receipt_id'];
    let receipt = this.props.current_receipt['receipt']
    this.props.updateReceipt(this.props.username,
      receipt_id, receipt,(isSuccess) => {
      console.log('finished...')
      if(isSuccess) {
        console.log('verify', this.props)
          this.props.onTabChange('b')
      }
    });
  }

  render() {
    return (
      <div>
        {this.getUploadedReceipt()}
      </div>
    );
  }

  handleOnPriceEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    let receipt = this.props.current_receipt;
    console.log(receipt)
    let res = receipt.receipt.slice();
    let waste = []
    if(receipt.wastage) {
      waste = receipt.wastage.slice();
    }
    res[idx]['price'] = val
    this.props.setReceiptItem({receipt: res, wastage: waste})
  }

  handleOnQuantityEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    let receipt = this.props.current_receipt;
    let res = receipt.receipt.slice();
    let waste = []
    if(receipt.wastage) {
      waste = receipt.wastage.slice();
    }
    res[idx]['quantity'] = val
    this.props.setReceiptItem({receipt: res, wastage: waste})
  }

  handleOnUnitEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    let receipt = this.props.current_receipt;
    console.log(receipt)
    let res = receipt.receipt.slice();
    let waste = []
    if(receipt.wastage) {
      waste = receipt.wastage.slice();
    }
    res[idx]['unit'] = val
    this.props.setReceiptItem({receipt: res, wastage: waste})
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
            <TableHeaderColumn colSpan="5" tooltip="Receipt Data" style={{textAlign: 'left'}}>
              Receipt data
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
          <TableHeaderColumn tooltip="item">Food Name</TableHeaderColumn>
          <TableHeaderColumn tooltip="unit">Unit</TableHeaderColumn>
          <TableHeaderColumn tooltip="category">Category</TableHeaderColumn>
          <TableHeaderColumn tooltip="quantity">Quantity</TableHeaderColumn>
          <TableHeaderColumn tooltip="price">Price($)</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={this.state.showCheckboxes}
          deselectOnClickaway={this.state.deselectOnClickaway}
          showRowHover={this.state.showRowHover}
          stripedRows={this.state.stripedRows}
        >
          {this.props.current_receipt &&this.props.current_receipt.receipt &&this.props.current_receipt.receipt.length > 0 &&
            this.props.current_receipt.receipt.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn tooltip={row.name}>{row.name}</TableRowColumn>
                <TableRowColumn>
                  <TextField value = {row.unit}
                    onChange={this.handleOnUnitEdit.bind(this,index,row)} value={row.unit}
                    />
                </TableRowColumn>
              <TableRowColumn tooltip={row.name}>{row.category}</TableRowColumn>
              <TableRowColumn>
                <TextField value = {row.quantity}
                  onChange={this.handleOnQuantityEdit.bind(this,index,row)} value={row.quantity}
                  />
              </TableRowColumn>
              <TableRowColumn tooltip={row.price}>
                <TextField value = {row.price}
                  onChange={this.handleOnPriceEdit.bind(this,index,row)} value={row.price}
                  />
              </TableRowColumn>
            </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          <div style={{textAlign: 'center'}}>
            <RaisedButton primary={true} onClick={this.submitReceipt.bind(this)} label="Submit"></RaisedButton>
          </div>
        </TableFooter>
      </Table>)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VerifyTable))
