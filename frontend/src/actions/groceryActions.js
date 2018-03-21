import * as c from '../constants/constants'


export const addToDefaultList = (item) => {
  return {
    type: c.ADD_TO_DEFAULT,
    item
  }
}

export const removeFromDefaultList = (item) => {
  return {
    type: c.REMOVE_FROM_DEFAULT,
    item
  }
}

export const updateItemFromDefault = (item) => {
  return {
    type: c.UPDATE_DEFAULT_ITEM,
    item
  }
}

export const removeFromSuggestedList = (item) => {
  return {
    type: c.REMOVE_FROM_SUGGESTED,
    item
  }
}
export const setSuggestedItemsList = (items) => {
  return {
    type: c.SET_SUGGESTED_ITEM_LIST,
    items
  }
}
export const setRecommendedGroceryList = (items) => {
  return {
    type: c.SET_RECOMMENDED_GROCERY_LIST,
    items
  }
}
