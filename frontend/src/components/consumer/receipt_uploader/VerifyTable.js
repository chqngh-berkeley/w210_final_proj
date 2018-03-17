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

const tableData = [
  {
    name: 'Apple',
    quantity: 4,
    cost : '10',
    category : 'fruit'
  },
  {
    name: 'bananas',
    quantity: 4,
    cost : '10',
    category : 'fruit'
  },
  {
    name: 'chicken wings',
    quantity: 2,
    cost : '10',
    category : 'mean'
  }
];

const mapStateToProps = function(state){
  return {
    receiptId : state.receiptReducer.receiptId,
    tableData : state.receiptReducer.receiptData
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
    getReceiptData : (receipt_id) => {
      api.getReceiptDataById(receipt_id).then(function(res) {
        console.log('receipt data:', res);
        dispatch(setReceiptData(res['result']));
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

        {this.getUploadReceipt()}
      </div>
    );
  }
  getUploadReceipt() {
    // <TextField
    //   onChange = {(e) => {this.setState({'receipt_id': e.target.value})}}
    //   floatingLabelText="Receipt Id" />
    // <FlatButton primary={true} onClick={() => {this.props.getReceiptData(this.state.receipt_id)}}
    // label = 'Get Receipt Data'>
    // </FlatButton>
    return (<div>

    <br />
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
          {this.props.tableData && this.props.tableData.length > 0 &&
            this.props.tableData.map( (row, index) => (
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
      </Table>

    </div>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyTable)
