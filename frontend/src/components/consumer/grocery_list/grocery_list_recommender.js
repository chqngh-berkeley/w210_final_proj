import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router';
import {api} from './../../../util/api';
import { cyan500 } from 'material-ui/styles/colors';
var Loader = require('react-loader');
import {toastr} from 'react-redux-toastr'
let logo = require('../../../images/logo.png')
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
// import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';
import Slider from 'material-ui-slider-label/Slider';

import {addToDefaultList,
  removeFromDefaultList,
  updateItemFromDefault,
  removeFromSuggestedList,
  setRecommendedGroceryList
} from './../../../actions/groceryActions'
const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const sliderStyles = {
  subheader: {
    textTransform: 'capitalize',
    textAlign: 'left'
  },
  labelStyleOuter: {
    width: '50px',
    height: '50px',
    borderRadius: '50% 50% 50% 0',
    position: 'absolute',
    background: 'rgb(50, 79, 225)',
    transform: 'rotate(-45deg)',
    top: '-60px',
    left: '-20px',
  },
  labelStyleInner: {
    transform: 'rotate(45deg)',
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    top: '15px',
    right: '0px',
    fontSize: '14px',
  },
};
const mapStateToProps = function(state){
  return {
    username: state.loginReducer.username,
    recommendedList : state.groceryRecReducer.recommendedList
  };
};

const mapDispatchToProps =(dispatch) => {
  return {
      addToDefaultList : (item) => {
        dispatch(addToDefaultList(item))
      },
      removeFromDefaultList : (item) => {
        dispatch(removeFromDefaultList(item))
      },
      updateItemFromDefault : (item) => {
        dispatch(updateItemFromDefault(item))
      },
      removeFromSuggestedList : (item) => {
        dispatch(removeFromSuggestedList(item))
      },
      getRecommendations : (username, threshold, cb) => {
        function convertData(item) {
          return {
            'section': item['SECTION'],
            'name' : item['ITEM_CATEGORY'],
            'size': item['ITEM_SIZE'],
            'quantity' : item['ITEM_QTY_PRCH'],
            'class' : item['ITEM_CLASS'],
            'avg' : item['FIRST_SIZE']
          }
        }
        api.getGroceryListRecommendations(username, threshold).then(function(res) {
          console.log(res);
          if(res['error']) {
            dispatch(setRecommendedGroceryList([]))
            cb(false);
            return;
          }
          let data = res['data']
          let arr = []
          let item_name_arr = []
          for(var i =0 ; i< data.length; i++) {
            let obj = convertData(data[i])
            if(!item_name_arr.includes(obj['name'])) {
                arr.push(obj)
            }
            item_name_arr.push(obj['name']);
          }
          dispatch(setRecommendedGroceryList(arr))
          cb(false);
        })
      },
      getItemSuggestion : (username) => {
        api.getGroceryItemSuggestions(username).then(function(res) {
          // dispatch(setSuggestedItemsList(res['data']))
        })
      }
    }
};


class GroceryListRecommender extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    loading: true,
    wasteThreshold: 20,
    fixedHeader: true,
    fixedFooter: true,
    stripedRows: false,
    showRowHover: false,
    selectable: false,
    multiSelectable: false,
    enableSelectAll: false,
    deselectOnClickaway: true,
    showCheckboxes: false,
    height: '400px'
    };
  }

  setLoader = (b) => {
      this.setState({loading: b})
  }

  componentDidMount() {
    this.props.getRecommendations(this.props.username,
      this.state.wasteThreshold,
      this.setLoader
     );
  }

  handleToggle = (event, toggled) => {
    this.setState({
      [event.target.name]: toggled,
    });
  };

  handleChange = (event) => {
    this.setState({height: event.target.value});
  };

  addToDefaultList = (event, item) => {
    this.props.addToDefaultList(item);
    this.props.removeFromSuggestedList(item);
  }

  removeFromDefaultList = (event, item) => {
    this.props.removeFromDefaultList(item);
  }
  onThresholdChange = (event, val) => {
    console.log(val)
    this.setState({wasteThreshold : val * 100})
  }
  updateDefaultListItem = (item, e, newVal) => {
    console.log(newVal, item)
  }

  onUpdateClick = (event) => {
    // console.log(this.state.wasteThreshold)
    this.setLoader(true);
    this.props.getRecommendations(this.props.username, this.state.wasteThreshold, this.setLoader);
  }

  renderSlider = () => {
    return (<div style={{position: 'relative', textAlign : 'left'}}>
      <div style={{width: '60%', display: 'inline-block', 'textAlign': 'left'}}>
          <Subheader style={sliderStyles.subheader}>
            {'Wastage Threshold'}
          </Subheader>
          <Slider
            defaultValue={5 / 100}
            min={0}
            max={1}
            step={2 / 100}
            value={this.state.wasteThreshold / 100}
            onChange={this.onThresholdChange}
            label={
              <div style={sliderStyles.labelStyleOuter}>
                <div style={sliderStyles.labelStyleInner}>
                  {this.state.wasteThreshold} %
                </div>
              </div>
            }
          />
      </div>
      <div style={{display: 'inline-block', position: 'absolute',
        top: '40px', marginLeft:'30px'}}>
        <RaisedButton primary={true}
          onClick={this.onUpdateClick.bind(this)}
          label='Update'></RaisedButton>
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
  recommendation(row) {
    // if(row['section'] == 'suggested') {
    //   return <span></span>
    // }
    let avg = parseFloat(row['avg']);
    let recommended = parseFloat(row['size']);
    let percentDiff = 100. * ((avg - recommended) / avg);
    percentDiff = Math.round(percentDiff * 100) / 100
    if(avg > recommended) {
      return (<TableRowColumn>
        <span style={{color: 'firebrick', fontSize: '1.2em'}}>
          <i className="fa fa-angle-double-down"></i>
          <span style={{marginLeft: '5px'}}>
            {percentDiff} % less {this.titleCase(row['name'])}
          </span>
        </span>
      </TableRowColumn>)
    } else {
      return <TableRowColumn>
        <span style={{color: 'green', fontSize: '1.2em'}}>
          <i className="fa fa-angellist"></i>
            <span style={{marginLeft: '5px'}}>
              Doing great!
            </span>
        </span>
      </TableRowColumn>
    }
  }
  getStyle(row) {
    console.log(row);
    if(row['section'] == 'main') {
      return {
        backgroundColor: 'aliceblue'
      }
    } else {
      return {
        backgroundColor: '#FCFCE3'
      }
    }
  }
  render() {
    if(this.props.recommendedList && this.props.recommendedList.length ==  0) {
      return (
        <div>
          <h1>
            <img style={{width: 25, height: 25, marginRight: 10}} src={logo} />
            Grocery List Recommender
          </h1>
            <h3 style= {{textAlign : 'center', 'margin': '50px auto'}}>
            Upload a receipt to get your recommendations!
          </h3>
        </div>
        )
    }
    return (
      <div>
        <div style={{textAlign: 'center'}}>
          <img style={{width: 50, height: 50}} src={logo} />
        </div>

        <h1>
          Grocery List Recommender
        </h1>
        <p>Click 'Update' to get a custom grocery list based on your past purchase patterns!
Move the wastage threshold bar to set a target for the maximize amount of food you would like to waste. As you move the threshold lower, you'll save more money!
</p>
<i>Our advice is calculated by comparing our recommended size to your average purchases over the past trips for that item.</i>
        {this.renderSlider()}
        <Loader loaded={!this.state.loading}>
          <Table
            style={{backgroundColor:"transparent"}}
            height={this.state.height}
            fixedHeader={this.state.fixedHeader}
            fixedFooter={this.state.fixedFooter}
            selectable={this.state.selectable}
            multiSelectable={this.state.multiSelectable}
          >
            <TableHeader
              style={{color: 'gray'}}
              displaySelectAll={this.state.showCheckboxes}
              adjustForCheckbox={this.state.showCheckboxes}
              enableSelectAll={this.state.enableSelectAll}
            >

              <TableRow style={{backgroundColor: '#324fe1'}}>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="Section">Section</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="item">Name</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="Quantity">Quantity</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="Size">Size(oz)</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="Category">Category</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white', fontSize: '1.2em'}} tooltip="Our Advice based on your past grocery trips">
                  Advice
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={this.state.showCheckboxes}
              deselectOnClickaway={this.state.deselectOnClickaway}
              showRowHover={this.state.showRowHover}
              stripedRows={this.state.stripedRows}
            >
              {this.props.recommendedList && this.props.recommendedList.map( (row, index) => (
                <TableRow key={index} style={this.getStyle(row)}>
                  <TableRowColumn style={{fontSize: '1.15em'}}>{row.section =='main'? 'Recommended' : 'Suggested' }</TableRowColumn>
                  <TableRowColumn style={{fontSize: '1.15em'}}>{this.titleCase(row.name)}</TableRowColumn>
                  <TableRowColumn style={{fontSize: '1.15em'}}>
                    {row.quantity ? row.quantity : '-N/A-'}
                  </TableRowColumn>
                  <TableRowColumn style={{fontSize: '1.15em'}}>
                    {row.size ? Math.round(parseFloat(row.size)) : '-N/A-'}
                  </TableRowColumn>
                  <TableRowColumn style={{fontSize: '1.15em'}}>
                    {this.titleCase(row.class)}
                  </TableRowColumn>

                  {this.recommendation(row)}

                </TableRow>
                ))}
            </TableBody>
          </Table>
        </Loader>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroceryListRecommender)
