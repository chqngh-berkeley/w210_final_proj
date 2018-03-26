import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
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
import Slider from 'material-ui/Slider';

import {addToDefaultList,
  removeFromDefaultList,
  updateItemFromDefault,
  removeFromSuggestedList,
  setRecommendedGroceryList,
  setSuggestedItemsList
} from './../../../actions/receiptAction'
const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const mapStateToProps = function(state){
  return {
    username: state.loginReducer.username,
    defaultList : state.groceryRecReducer.defaultList,
    suggestedList : state.groceryRecReducer.suggestedList
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
      getRecommendations : (username) => {
        api.getGroceryListRecommendations(username).then(function(res) {
          // dispatch(setRecommendedGroceryList(res['data']))
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
    fixedHeader: true,
    fixedFooter: true,
    stripedRows: false,
    showRowHover: false,
    selectable: false,
    multiSelectable: false,
    enableSelectAll: false,
    deselectOnClickaway: true,
    showCheckboxes: false,
    height: '250px'
    };
  }

  componentDidMount() {

    this.props.getRecommendations(this.props.username);
    this.props.getItemSuggestion(this.props.username);
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

  updateDefaultListItem = (item, e, newVal) => {
    console.log(newVal, item)
  }
  render() {
    return (
      <div>
        <h1> Grocery List Recommender </h1>
        <br />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vulputate cursus scelerisque. Phasellus at laoreet mi. Morbi non nibh facilisis, viverra dui luctus, vestibulum metus. Aliquam suscipit mauris dui, quis hendrerit tellus sagittis ut. Nam leo mi, dignissim sit amet dapibus eget, pharetra at neque. Integer ut facilisis purus. Aliquam erat volutpat.</p>
        <h3>Frequently Purchased Items</h3>

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
              <TableHeaderColumn colSpan="6" tooltip="Super Header" style={{textAlign: 'center'}}>
                Frequently Purchased
              </TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn tooltip="item">Item</TableHeaderColumn>
              <TableHeaderColumn tooltip="Count">Recommended Count</TableHeaderColumn>
              <TableHeaderColumn tooltip="Size">Recommended Size</TableHeaderColumn>
              <TableHeaderColumn tooltip="Category">Category</TableHeaderColumn>
              <TableHeaderColumn tooltip="wastage">Wastage Threshold</TableHeaderColumn>
              <TableHeaderColumn tooltip="Actions">Actions</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={this.state.showCheckboxes}
            deselectOnClickaway={this.state.deselectOnClickaway}
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
            {this.props.defaultList && this.props.defaultList.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.food_name}</TableRowColumn>
                <TableRowColumn>
                  <TextField value = {row.count ? row.count : '-N/A-'} />
                </TableRowColumn>
                <TableRowColumn>
                  <TextField value = {row.size ? row.size : '-N/A-'} />
                </TableRowColumn>

                <TableRowColumn>
                  {row.category}
                </TableRowColumn>
                <TableRowColumn>
                  <div style={{position : 'relative'}}>
                    <div style={{display : 'inline-block', position: 'absolute', top: -15}}>
                      {row.wastage ? row.wastage*100 : 50}%
                    </div>
                    <Slider sliderStyle={{marginBottom : 20}}
                      value ={row.wastage ? row.wastage : 0.5}
                      onChange={this.updateDefaultListItem.bind(this, row)} />
                  </div>
                </TableRowColumn>
                <TableRowColumn>
                  <FlatButton onClick={this.removeFromDefaultList.bind(this, row)} secondary = {true} label = 'Remove'></FlatButton>
                </TableRowColumn>
              </TableRow>
              ))}
          </TableBody>
        </Table>
        <hr />
        <div>
          <h3>Suggested Items</h3>
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
                  <TableHeaderColumn colSpan="4" tooltip="Super Header" style={{textAlign: 'center'}}>
                    Suggested Grocery Items
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn tooltip="item">Item</TableHeaderColumn>
                  <TableHeaderColumn tooltip="Count">Count</TableHeaderColumn>
                  <TableHeaderColumn tooltip="Category">Category</TableHeaderColumn>
                  <TableHeaderColumn tooltip="Actions">Actions</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                displayRowCheckbox={this.state.showCheckboxes}
                deselectOnClickaway={this.state.deselectOnClickaway}
                showRowHover={this.state.showRowHover}
                stripedRows={this.state.stripedRows}
              >
                {this.props.suggestedList && this.props.suggestedList.map( (row, index) => (
                  <TableRow key={index}>
                    <TableRowColumn>{row.food_name}</TableRowColumn>
                    <TextField value = {row.count} />
                    <TableRowColumn>{row.category}</TableRowColumn>
                    <TableRowColumn>
                      <FlatButton onClick={this.addToDefaultList.bind(this, row)} primary = {true} label = 'Add'></FlatButton>
                    </TableRowColumn>
                  </TableRow>
                  ))}
              </TableBody>
            </Table>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroceryListRecommender)
