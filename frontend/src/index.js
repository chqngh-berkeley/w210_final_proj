import 'core-js/fn/object/assign';

// import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import WebApp from './reducers/'
import AppComponent from './components/Main';
import Retailer from './components/retailer/Retailer';
import FAQ from './components/common/FAQ';
import Login from './components/common/Login';
import ReceiptInfo from './components/consumer/grocery_history/receipt_info';
import Signup from './components/common/Signup';
import FoodWastage from './components/common/foodwastage';
import Consumer from './components/consumer/Consumer';
import { createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { Provider } from 'react-redux';
import ReduxToastr from 'react-redux-toastr'


// import { Router, Route, Switch , browserHistory, hashHistory} from 'react-router'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'
import { syncHistoryWithStore, routerReducer , routerMiddleware} from 'react-router-redux'
import { createBrowserHistory } from 'history';

const logger = createLogger();
const middleware = applyMiddleware(
  thunk,
  logger
);

let store = createStore(
  WebApp,
  middleware
);

const history = syncHistoryWithStore(createBrowserHistory(), store);


// Render the main component into the dom
ReactDOM.render(
  <Provider store = {store}>
    <Router history={history}>
      <AppComponent>
        <ReduxToastr
          timeOut={4000}
          newestOnTop={false}
          preventDuplicates
          position="top-left"
          transitionIn="fadeIn"
          transitionOut="fadeOut"
          progressBar/>
        <Switch>
          <Route  path="/wastage" component={FoodWastage}/>
          <div className='content'>
          <Route  path="/consumer" component={Consumer}/>
          <Route  path="/retailer" component={Retailer}/>
          <Route  path="/receiptInfo" component={ReceiptInfo}/>
          <Route  path="/faq" component={FAQ}/>
          <Route  path="/login" component={Login}/>
          <Route  path="/userinfo" component={Signup}/>
          <Route  path="/signup" component={Signup}/>
          </div>
        </Switch>
      </AppComponent>
   </Router>

  </Provider>,
  document.getElementById('app')
);
