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
  },
  labelStyleOuter: {
    width: '40px',
    height: '40px',
    borderRadius: '50% 50% 50% 0',
    position: 'absolute',
    background: cyan500,
    transform: 'rotate(-45deg)',
    top: '-53px',
    left: '-14px',
  },
  labelStyleInner: {
    transform: 'rotate(45deg)',
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    top: '10px',
    right: '0px',
    fontSize: '10px',
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
            'size': item['ITEM_TRUE_SIZE'],
            'quantity' : item['ITEM_QTY_PRCH'],
            'class' : item['ITEM_CLASS']
          }
        }
        api.getGroceryListRecommendations(username, threshold).then(function(res) {
          console.log(res);
          let data = res['data']
          let arr = []
          for(var i =0 ; i< data.length; i++) {
            let obj = convertData(data[i])
            arr.push(obj)
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
    wasteThreshold: 50,
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
    return (<div style={{position: 'relative'}}>
      <div style={{width: '70%', display: 'inline-block'}}>
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
  render() {
    // if(this.props.recommendedList && this.props.recommendedList.length ==  0) {
    //   return (
    //     <div>
    //       <h1> Grocery List Recommender </h1>
    //         <h3 style= {{textAlign : 'center', 'margin': '50px auto'}}>
    //         Upload a receipt to get your recommendations!
    //       </h3>
    //     </div>
    //     )
    // }
    return (
      <div>
        <h1> Grocery List Recommender </h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
        {this.renderSlider()}
        <Loader loaded={!this.state.loading}>
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
                <TableHeaderColumn tooltip="category">Category</TableHeaderColumn>
                <TableHeaderColumn tooltip="item">Name</TableHeaderColumn>
                <TableHeaderColumn tooltip="Quantity">Quantity</TableHeaderColumn>
                <TableHeaderColumn tooltip="Size">Size</TableHeaderColumn>
                <TableHeaderColumn tooltip="Category">Category</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={this.state.showCheckboxes}
              deselectOnClickaway={this.state.deselectOnClickaway}
              showRowHover={this.state.showRowHover}
              stripedRows={this.state.stripedRows}
            >
              {this.props.recommendedList && this.props.recommendedList.map( (row, index) => (
                <TableRow key={index}>
                  <TableRowColumn>{row.section}</TableRowColumn>
                  <TableRowColumn>{row.name}</TableRowColumn>
                  <TableRowColumn>
                    {row.quantity ? row.quantity : '-N/A-'}
                  </TableRowColumn>
                  <TableRowColumn>
                    {row.size ? row.size : '-N/A-'}
                  </TableRowColumn>
                  <TableRowColumn>
                    {row.class}
                  </TableRowColumn>

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
