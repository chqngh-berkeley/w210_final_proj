import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import {setAllReceipts, setReceipt} from './../../../actions/receiptAction'
import {api} from './../../../util/api';
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

const mapStateToProps = function(state) {
  return {
    receipts : state.receiptReducer.receipts
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      setCurrentReceipt :(item) => {
        console.log(item)
        api.getReceiptDataById(1, item['id']).then(function(res) {
            dispatch(setReceipt(res['data']));
        })
        // dispatch(push('/receiptInfo'))
      },
      getAllReceipts: () => {
        api.getAllReceipts(1).then(function(res) {
            dispatch(setAllReceipts(res['data']));
        })
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

  handleOnReceiptEdit = (event, item) => {
    console.log('Edit data...', item);
    this.props.setCurrentReceipt(item);
  }
  handleOnReceiptRemove = (event, idx) => {
    console.log('remove data...', idx)
  }

  componentDidMount() {
    // this.setState({receipts : this.props.receipts})
    this.props.getAllReceipts();
  }

  getSlider() {
  return (<div>
        <Slider />
      </div>
    );
  }
  render() {
//
    return (
      <div>
        <h1> Past Grocery Receipts </h1>
        <br />

        <br />
        <Table
          height={this.state.height}
          selectable = {false}
          fixedHeader={this.state.fixedHeader}
          fixedFooter={this.state.fixedFooter}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={false}
            >
            <TableRow>
              <TableHeaderColumn colSpan="4" style={{textAlign: 'left'}}>
                Receipt List History
              </TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn tooltip="item">Receipt ID</TableHeaderColumn>
              <TableHeaderColumn tooltip="timestamp">Date</TableHeaderColumn>
              <TableHeaderColumn tooltip="action">Wastage in $</TableHeaderColumn>
              <TableHeaderColumn tooltip="action">Edit</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
            {this.props.receipts && this.props.receipts.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.id}</TableRowColumn>
                <TableRowColumn>{new Date(parseInt(row.timestamp)).toString()}</TableRowColumn>
                <TableRowColumn>
                  {row.wastageInfo ? row.wastageInfo : 'N/A'}
                </TableRowColumn>
                <TableRowColumn>
                  <Link
                    to = '/receiptInfo'
                    onClick = {this.handleOnReceiptEdit.bind(this, null, row)}>
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
