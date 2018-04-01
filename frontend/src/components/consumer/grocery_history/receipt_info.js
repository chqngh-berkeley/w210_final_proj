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
    username : state.loginReducer.username,
    currentReceipt : state.receiptReducer.current_receipt
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      setReceiptItem :(item) => {
        dispatch(setReceiptItem(item));
      },
      updateReceiptInfo :(user_id,receipt_id, receipts) => {
        api.updateWastageDataById(user_id, receipt_id, receipts).then(function(res, err){
          console.log(res);
          console.log(err)
        })
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

  handleOnReceiptEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    console.log(val, idx,item)
    let receipt = this.state.receipt;
    let res = receipt.receipt.slice();
    let waste = receipt.wastage.slice();
    waste[idx]['wastage'] = val
    this.setState({receipt: {receipt: res, wastage: waste}})
  }
  handleOnReceiptRemove = (event, item) => {
    console.log('remove data...', item)
  }

  onSubmit() {
    console.log(this.state.receipt)
    this.props.updateReceiptInfo(this.props.username, this.props.currentReceipt.receipt[0]['receipt_id'],
    this.state.receipt.wastage)
  }

  componentDidMount() {
    this.setState({receipt: this.props.currentReceipt})
  }

  render() {
    if(!this.props.currentReceipt || !this.props.currentReceipt.wastage
      || !this.state.receipt || !this.state.receipt.wastage){
      return <span>Loading...</span>
    }
    let items = []
    for(var i =0; i< this.state.receipt.wastage.length; i ++) {
      let receipt = this.state.receipt.receipt[i];
      let wastage = this.state.receipt.wastage[i];
      let el = (
        <TableRow key={i}>
          <TableRowColumn>{receipt['name']}</TableRowColumn>
          <TableRowColumn>{receipt['quantity']}</TableRowColumn>
          <TableRowColumn>{receipt['unit']}</TableRowColumn>
          <TableRowColumn>{receipt['price']}</TableRowColumn>
          <TableRowColumn>{receipt['category']}</TableRowColumn>
          <TableRowColumn>
            <TextField onChange={this.handleOnReceiptEdit.bind(this,i,wastage)} value={wastage.wastage}/>
          </TableRowColumn>
      </TableRow>
      )
      //
      items.push(el)
    }
    return (
      <div>
        <h1> Grocery Info for Id: {this.props.currentReceipt && this.props.currentReceipt[0] && this.props.currentReceipt[0].receipt_id}</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
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
            <TableHeaderColumn tooltip="wastage_info">Wastage %</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
            {items && items.map((row) =>
              (row))
            }
          </TableBody>
          <TableFooter>
          </TableFooter>
        </Table>
        <div>
          <Link to='/consumer'>Back</Link>
          <RaisedButton onClick={this.onSubmit.bind(this)} style={{marginLeft: '20px'}} label = 'Save' primary={true}/>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiptInfo)
