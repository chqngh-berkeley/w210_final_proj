import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import ReceiptHistory from './grocery_history/receipt_history';
import  GroceryListRecommender from './grocery_list/grocery_list_recommender';
import ReceiptUploader from './receipt_uploader/receipt_uploader';
import {connect} from 'react-redux';
import {Tabs, Tab} from 'material-ui/Tabs';
const st = {
  backgroundColor : '#FAFAFA',
  // color: 'black',
  textAlign: 'right',
  margin: '0 auto',
  padding: '15px 0'
}

const mapStateToProps = function(state){
  return {

  };
};

class Consumer extends React.Component {

  getTabs() {
    return (
    <Tabs>
     <Tab label="Receipt History" value="b">
       <ReceiptHistory />
     </Tab>
     <Tab label="Grocery Recommender" value="c">
       <GroceryListRecommender />
     </Tab>
     <Tab label="Receipt Uploader" value="a">
        <div>
          <ReceiptUploader />
        </div>
      </Tab>
  </Tabs>)
  }
  render() {
    return (
      <div>
        {this.getTabs()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Consumer)
