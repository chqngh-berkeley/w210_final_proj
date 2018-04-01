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
    username : state.loginReducer.username,
    receipts : state.receiptReducer.receipts
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      setCurrentReceipt :(username, item) => {
        api.getReceiptDataById(username, item['receipt_id']).then(function(res) {
            console.log(res['receipt_data']);
            console.log(res['wastage_data']);
            var receipt_data = res['receipt_data'];
            var wastage_data = res['wastage_data'];
            // for(var i=0; i< receipt_data.length; i++) {
            //   let receipt = receipt_data[i];
            //   let waste = wastage_data[i];
            //   receipt_obj = {
            //     category: receipt['category'],
            //     id : receipt['id'],
            //     name : receipt['name'],
            //     price: receipt['price'],
            //     quantity: receipt['quantity'],
            //     receipt_id: receipt['receipt_id'],
            //     unit: receipt['unit']
            //   }
            // }
            dispatch(setReceipt({receipt: receipt_data, wastage: wastage_data}));
        })
        // dispatch(push('/receiptInfo'))
      },
      getAllReceipts: (username) => {
        api.getAllReceipts(username).then(function(res) {
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
    this.props.setCurrentReceipt(this.props.username, item);
  }
  handleOnReceiptRemove = (event, idx) => {
    console.log('remove data...', idx)
  }

  componentDidMount() {
    // this.setState({receipts : this.props.receipts})
    this.props.getAllReceipts(this.props.username);
  }

  getSlider() {
  return (<div>
        <Slider />
      </div>
    );
  }

  renderTable() {
    if(this.props.receipts && this.props.receipts.length ==  0) {
      return (<h3 style= {{textAlign : 'center', 'margin': '50px auto'}}>
        No Receipt History
      </h3>)
    }
    return (
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
            <TableHeaderColumn colSpan="3" style={{textAlign: 'left'}}>
              Receipt List History
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn tooltip="item">Receipt ID</TableHeaderColumn>
            <TableHeaderColumn tooltip="timestamp">Date</TableHeaderColumn>

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
              <TableRowColumn>{row.receipt_id}</TableRowColumn>
              <TableRowColumn>{new Date(parseInt(row.upload_date)).toString()}</TableRowColumn>

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
    )
  }

  render() {
// <TableHeaderColumn tooltip="action">Wastage in $</TableHeaderColumn>

// <TableRowColumn>
//   {row.wastageInfo ? row.wastageInfo : 'N/A'}
// </TableRowColumn>
    return (
      <div>
        <h1> Past Grocery Receipts </h1>
        <br />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
        <br />

        {this.renderTable()}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiptHistory)
