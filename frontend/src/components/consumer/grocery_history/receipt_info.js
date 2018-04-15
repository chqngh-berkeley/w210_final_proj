import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import {api} from './../../../util/api';
import {setReceipt} from './../../../actions/receiptAction'
import {toastr} from 'react-redux-toastr'
import {BASE_URL} from '../../../constants/constants'
import { withRouter } from 'react-router-dom'
import Lightbox from 'react-image-lightbox';


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
      setReceiptItem :(receipt) => {
        dispatch(setReceipt(receipt));
      },
      updateReceiptInfo :(user_id,receipt_id, receipts, cb) => {
        api.updateWastageDataById(user_id, receipt_id, receipts).then(function(res){
          console.log(res);
          cb()
          toastr.success('Updated Receipt Id:', receipt_id);
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
      height: '270px'
    };
  }

  handleChange = (event) => {
    this.setState({height: event.target.value});
  };

  handleOnWastageAmountEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    console.log(val, idx,item)
    let receipt = this.props.currentReceipt;
    let res = receipt.receipt.slice();
    let waste = receipt.wastage.slice();
    waste[idx]['wastage'] = val
    this.props.setReceiptItem({receipt: res, wastage: waste})
  }
  handleOnWastageUnitEdit = (idx, item,e,val) => {
    // this.props.setReceiptItem(item);
    console.log(val, idx,item)
    let receipt = this.props.currentReceipt;
    let res = receipt.receipt.slice();
    let waste = receipt.wastage.slice();
    waste[idx]['wastage_unit'] = val
    this.props.setReceiptItem({receipt: res, wastage: waste})
  }
  handleOnReceiptRemove = (event, item) => {
    console.log('remove data...', item)
  }

  onSubmit() {
    // console.log(this.props.currentReceipt)
    let receipt_id = this.props.currentReceipt['receipt'][0]['receipt_id'];
    let wastage = this.props.currentReceipt['wastage']
    this.props.updateReceiptInfo(this.props.username,
      receipt_id, wastage,() => {
      console.log('finished...')
      this.props.history.push('/consumer')
    })
  }

  componentDidMount() {
    // if(this.props.currentReceipt && this.props.currentReceipt.receipt
    // && this.props.currentReceipt.receipt.length == 0) {
    //   this.props.history.push('/consumer')
    // }
    this.setState({receipt: this.props.currentReceipt})
  }

  renderReceiptImg() {
    if(this.props.currentReceipt && this.props.currentReceipt.receipt
    && this.props.currentReceipt.receipt.length > 0) {
      console.log(url);
      let receipt_id = this.props.currentReceipt.receipt[0]['receipt_id']
      let path = this.props.username + '_' + receipt_id;
      let url =`${BASE_URL}/receipt_image/${path}`;
      // <img style={{width: '200px', height:'200px'}} src= {url} />
      return <div  style={{display: 'inline-block', textAlign: 'right', width: '45%', position: 'absolute'}}>
        <img className='clickable' onClick={()=>{this.setState({isOpen: true})}} style={{width: '120px', height:'200px'}} src= {url} />
        {this.state.isOpen && (<Lightbox
            mainSrc={url}
            onCloseRequest={() => this.setState({ isOpen: false })}
          />)
        }
      </div>
    }
    return <div></div>
  }
  convertDate(d) {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
      if(d.includes('/')) {
        let arr = d.split('/')
        let da = arr[2] +'-' + arr[0] + '-' + arr[1]
        return new Date(da).toLocaleDateString("en-US",options);
      } else {
        return new Date(d).toLocaleDateString("en-US",options);
      }
  }
  getDollarsWasted() {
    if(!this.props.currentReceipt.receipt) {
      return 0
    }
    // let total = 0;
    // for(var i =0; i< this.props.currentReceipt.receipt.length; i ++) {
    //   let item = this.props.currentReceipt.receipt[i];
    //   total += parseFloat(item['price'])
    // }
    let wastedAmount = 0;
    for(var i =0; i< this.props.currentReceipt.wastage.length; i ++) {
      let itemPrice = this.props.currentReceipt.receipt[i]['price'];
      let itemWasted = this.props.currentReceipt.wastage[i]['wastage'];
      wastedAmount += (parseFloat(itemPrice) * parseFloat(itemWasted) / 100.)
    }
    return Math.round(wastedAmount * 100) / 100
  }
  getTotalPrice(receipt) {
    if(!receipt) {
      return 0
    }
    let total = 0;
    for(var i =0; i< this.props.currentReceipt.receipt.length; i ++) {
      let item = this.props.currentReceipt.receipt[i];
      total += parseFloat(item['price'])
    }
    return Math.round(total * 100) / 100
  }
  renderReceiptStats() {
    let receipt_stats_st = {
      display: 'block'
    }
    let spacer = {
      marginRight: '5px'
    }
    return (
      <div style={{position: 'absolute', right:'15%',display: 'inline-block',width: '35%', marginLeft: '20px'}}>
      <div style={receipt_stats_st}>
        <label style={spacer}>Receipt Id:</label>
        <span>{parseInt(this.props.currentReceipt.receipt[0]['receipt_id'])}</span>
      </div>
      <div style={receipt_stats_st}>
        <label style={spacer}>Upload Date:</label>
        <span>{this.convertDate(this.props.currentReceipt.receipt[0]['upload_date'])}</span>
      </div>
      <div style={receipt_stats_st}>
        <label style={spacer}>Number of Items:</label>
        <span>{this.props.currentReceipt.receipt.length}</span>
      </div>
      <div style={receipt_stats_st}>
        <label style={spacer}>Total Price($):</label>
        <span>{this.getTotalPrice(this.props.currentReceipt.receipt)}</span>
      </div>
      <div style={receipt_stats_st}>
        <label style={{marginRight: '5px','color': 'firebrick' ,'fontWeight': 'bold'}}>Total Wasted($):</label>
        <span style={{'color': 'firebrick'}}><b>{this.getDollarsWasted()}</b></span>
      </div>
    </div>)
  }
  titleCase(str) {
    if(!str) {
      return str
    }
    return str.toLowerCase().split(' ').map(function(word) {
      return word.length > 0 ? word.replace(word[0], word[0].toUpperCase()) : word;
    }).join(' ');
  }
  render() {
    if(!this.props.currentReceipt ||
      !this.props.currentReceipt.receipt ||
      this.props.currentReceipt.receipt.length ==0 ||
      !this.props.currentReceipt.wastage){
      return <span>Loading...</span>
    }
    let strSt = {
      whiteSpace : 'normal',
      overflow: 'auto',
      fontSize: '1.15em'
    }
    let unitSt = {
      fontSize: '1.15em'
    }
    let items = []
    for(var i =0; i< this.props.currentReceipt.wastage.length; i ++) {
      let receipt = this.props.currentReceipt.receipt[i];
      let wastage = this.props.currentReceipt.wastage[i];
      let el = (
        <TableRow key={i} style={{  backgroundColor: '#FCFCE3' }}>
          <TableRowColumn style={strSt}>{this.titleCase(receipt['name'])}</TableRowColumn>
          <TableRowColumn style={unitSt}>{receipt['quantity']}</TableRowColumn>
          <TableRowColumn style={unitSt}>{receipt['unit']}</TableRowColumn>
          <TableRowColumn style={unitSt}>{receipt['price']}</TableRowColumn>
          <TableRowColumn style={strSt}>{this.titleCase(receipt['category'])}</TableRowColumn>
          <TableRowColumn>
            <TextField onChange={this.handleOnWastageAmountEdit.bind(this,i,wastage)} value={wastage.wastage}/>
          </TableRowColumn>
      </TableRow>
      )
      //
      items.push(el)
    }
    let st = {

    }

    return (
      <div>
        <h1> Grocery Info</h1>
        <div style={{height: 200, textAlign: 'left', position: 'relative'}}>
          {this.renderReceiptImg()}
          {this.renderReceiptStats()}
        </div>
        <p style={{textAlign:'center'}}>Enter what percent of each food item was wasted. The more accurate waste data you enter, the more money GrocerySaver can help you keep in your pocket!</p>
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
            <TableRow style={{backgroundColor: '#324fe1'}}>
            <TableHeaderColumn  style={{color: 'white', fontSize: '1.2em'}} tooltip="item">Food Name</TableHeaderColumn>
            <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="quantity">Quantity</TableHeaderColumn>
            <TableHeaderColumn  style={{color: 'white', fontSize: '1.2em'}} tooltip="unit">Unit</TableHeaderColumn>
            <TableHeaderColumn  style={{color: 'white', fontSize: '1.2em'}} tooltip="price">Price($)</TableHeaderColumn>
            <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="category">Category</TableHeaderColumn>
            <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="wastage_info">Wastage Amount(%)</TableHeaderColumn>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReceiptInfo))
