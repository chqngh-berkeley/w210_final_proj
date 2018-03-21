import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import {api} from './../../../util/api';
import {setReceiptItem} from './../../../actions/receiptAction'
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
  return {
    currentReceipt : state.receiptReducer.current_receipt
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      setReceiptItem :(item) => {
        dispatch(setReceiptItem(item));
      }
    }
};

class ReceiptInfo extends React.Component {
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

  handleOnReceiptEdit = (event, item) => {
    this.props.setReceiptItem(item);
  }
  handleOnReceiptRemove = (event, item) => {
    console.log('remove data...', item)
  }

  componentDidMount() {

  }

  render() {

    return (
      <div>
        <h1> Grocery Info </h1>
        <br />
        <Table
          height={this.state.height}
          fixedHeader={this.state.fixedHeader}
          fixedFooter={this.state.fixedFooter}
          selectable = {false}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={false}
            >
            <TableRow>
              <TableHeaderColumn colSpan="6" style={{textAlign: 'left'}}>
                Grocery Info
              </TableHeaderColumn>
            </TableRow>
            <TableRow>
            <TableHeaderColumn tooltip="item">Food Name</TableHeaderColumn>
            <TableHeaderColumn tooltip="quantity">Quantity</TableHeaderColumn>
            <TableHeaderColumn tooltip="unit">Unit</TableHeaderColumn>
            <TableHeaderColumn tooltip="price">Price($)</TableHeaderColumn>
            <TableHeaderColumn tooltip="category">Category</TableHeaderColumn>
            <TableHeaderColumn tooltip="closest_category">Closest Category</TableHeaderColumn>
            <TableHeaderColumn tooltip="wastage_info">Wastage %</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
            {this.props.currentReceipt && this.props.currentReceipt.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.name}</TableRowColumn>
                <TableRowColumn>{row.quantity}</TableRowColumn>
                <TableRowColumn>{row.unit}</TableRowColumn>
                <TableRowColumn tooltip={row.price}>{row.price}</TableRowColumn>
                <TableRowColumn tooltip={row.category}>{row.category}</TableRowColumn>
                <TableRowColumn tooltip={row.closest_category}>{row.closest_category}</TableRowColumn>
                <TableRowColumn>
                  <TextField value={row.wastage} onChange={this.handleOnReceiptEdit.bind(this, null, row)} />
                </TableRowColumn>
              </TableRow>
              ))}
          </TableBody>
          <TableFooter>
          </TableFooter>
        </Table>
        <div>
          <Link to='/consumer'>Back</Link>
          <RaisedButton style={{marginLeft: '20px'}} label = 'Save' primary={true}/>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiptInfo)
