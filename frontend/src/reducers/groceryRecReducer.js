import * as c from '../constants/constants'

let groceryRecommendationData = {

  recommendedList : [
   //  {food_name : 'Apple',
   //   price : '5$',
   //   count : '5',
   //   size : '2 lbs',
   //   category : 'Fruit',
   //   closest_category : 'Fruit'},
   //  {food_name : 'Beef',
   //   price : '15$',
   //   count : '2',
   //   size : '32oz',
   //   category : 'Meat',
   //   closest_category : 'Meat'},
   //  {food_name : 'Banana',
   //   price : '5$',
   //   count : '5',
   //   size : '2 lbs',
   //   category : 'Fruit',
   //   closest_category : 'Fruit'
   // }
  ],
  suggestedList : [
   //  {food_name : 'Pork',
   //   price : '5$',
   //   count : '5',
   //   size : '32',
   //   category : 'Fruit',
   //   closest_category : 'Fruit'},
   //  {food_name : 'Beef',
   //   price : '5$',
   //   count : '5',
   //   size : '32',
   //   category : 'Fruit',
   //   closest_category : 'Fruit'},
   //  {food_name : 'Banana',
   //   price : '5$',
   //   count : '5',
   //   size : '32',
   //   category : 'Fruit',
   //   closest_category : 'Fruit'
   // }
  ]
}

export function groceryRecReducer(state=groceryRecommendationData, action) {
  switch(action.type) {
      case c.SET_RECOMMENDED_GROCERY_LIST:
        return Object.assign({}, state,{recommendedList: action.items});
      case c.SET_SUGGESTED_ITEM_LIST:
        return Object.assign({}, state,{suggestedList: action.items});
      case c.ADD_TO_DEFAULT:
        let d = Object.assign({}, state)
        d.defaultList.push(action.item)
        return d;
      case c.REMOVE_FROM_SUGGESTED:
        let s = Object.assign({}, state)
        var food_name = action.item.food_name;
        s.suggestedList.filter((item) => (item.food_name != food_name))
        return s;
      case c.REMOVE_FROM_DEFAULT:
        let f = Object.assign({}, state)
        var food_name = action.item.food_name;
        f.defaultList.filter((item) => (item.food_name != food_name))
        return d;
      case c.UPDATE_DEFAULT_ITEM:
        let g = Object.assign({}, state)
        var food_name = action.item.food_name;
        return g;
      default:
        return state;
  }
}
