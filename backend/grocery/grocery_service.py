import sys
from db import db_connection_cls
from ocr_module import ocr
import hashlib
import numpy as np



class GroceryService(object):
    def __init__(self):
        self.sql_ = db_connection_cls.MysqlDBPython()
        self.init()
    def init(self):
        mapper = {
            "USER_ID" : "user_id",
            "RECEIPT_ID" : "receipt_id",
            "RECEIPT_UPLOAD_DT" : "upload_date",
            "ITEM_ID" : "id",
            "ITEM_NAME" : "name",
            "ITEM_QTY_PRCH" : "quantity",
            "ITEM_UNITS" : "unit",
            "ITEM_TOTAL_PRICE" : "price",
            "ITEM_CATEGORY": "category"
        }
        self.ui_to_db = mapper
        self.db_to_ui = {v:k for (k,v) in mapper.items()}
    def getRandomItem(self, user_id):
        names = ['apple','banana','orange']
        categories = ['JUICE', 'FROZEN FRUIT', 'APPLES', 'APRICOTS', 'BANANAS', 'BERRIES',
           'CHERRIES', 'GRAPES', 'MELONS', 'KIWI', 'CITRUS', 'MANGO', 'PEACH',
           'PEAR', 'PLUM', 'ASPARAGUS', 'FROZEN VEGETABLE', 'BROCCOLI',
           'CAULIFLOWER', 'CABBAGE', 'CARROTS', 'CELERY', 'CANNED', 'CORN',
           'CUCUMBER', 'ICEBURG LETTUCE', 'LETTUCE LEAF', 'CANNED SAUERKRAUT',
           'MUSHROOM', 'ONIONS- DRY', 'ONIONS- GREEN', 'POTATO', 'RADISH',
           'SPINACH', 'SUMMER SQUASH', 'WINTER SQUASH', 'BELL PEPPERS',
           'TOMATO', 'DRIED BEANS', 'MILK', 'BUTTER', 'HARD CHEESE',
           'SHREDDED CHEESE', 'PROCESSED CHEESE', 'SOFT CHEESE',
           'COTTAGE CHEESE', 'CREAM CHEESE', 'CANNED MILK', 'CREAM', 'DIPS',
           'EGGNOG', 'ICE CREAM', 'MARGARINE', 'PUDDING', 'SOUR CREAM',
           'YOGURT', 'SHORTENING', 'EGG', 'FISH', 'FROZEN RAW FISH',
           'FROZEN SHELLFISH', 'SHRIMP', 'CLAMS', 'FROZEN BREADED SEAFOOD',
           'WHOLE CHICKEN', 'WHOLE TURKEY', 'PARTED CHICKEN', 'PARTED TURKEY',
           'GROUND TURKEY', 'COOKED CHICKEN', 'GROUND CHICKEN',
           'COOKED TURKEY', 'TURKEY LUNCHMEAT', 'ROASTS', 'BEEF VARIETY',
           'PORK VARIETY', 'LAMB VARIETY', 'GROUND MEAT', 'COOKED MEAT',
           'BACON', 'COOKED HAM', 'HOT DOGS', 'LUNCHMEAT', 'SAUSAGE',
           'SMOKED SAUSAGE', 'CEREAL', 'OATMEAL', 'BREAD ', 'TORTILLA',
           'ANGEL CAKE', 'CHEESECAKE', 'CHOCOLATE CAKE', 'COOKIES', 'DONUTS',
           'MUFFINS', 'CHIFFON PIE', 'PUMPKIN', 'ROLLS', 'PASTA',
           'PANCAKE MIX', 'WAFFLS', 'NUTS', 'STORABLE JUICE', 'FROZEN JUICE',
           'CRACKERS', 'POP CORN', 'POTATO CHIPS', 'DRIED FRUIT',
           'FROZEN BAGELS', 'FROZEN DOUGH', 'CORNMEAL', 'OLIVES', 'PICKLES',
           'SUGAR', 'CHOCOLATE SYRUP', 'CHOCOLATE  ',
           'CHOCOLATE (OR GO CRAZY WITH EATBYDATE)', 'FLOUR',
           'CAKE/BROWNIE/BREAD', 'FROSTING MIX', 'BAKING POWDER',
           'MARSHMALLOW', 'SYRUP', 'PASTRIES', 'SODA', 'SPAGHETTI SAUCE',
           'WHIPPED CREAM', 'FRESH PASTA', 'RICE BEVERAGE', 'HONEY', 'JELLY',
           'PEANUT BUTTER', 'KETCHUP', 'SALSA', 'FRIED CHICKEN', 'RICE  ',
           'GELATIN', 'JERKY', 'CUT FRUIT', 'CUT VEGETABLE', 'OILS',
           'FROZEN WHIPPED', 'FROZEN ENTREE', 'FROZEN SANDWICH']
        return {
             "user_id" : user_id,
             "id" : np.random.randint(1,1000),
             "name" : np.random.choice(names, 1)[0],
             "price" : np.random.randint(1,20),
             "quantity" : np.random.randint(1,20),
             "unit" : np.random.randint(1,10),
             "category" : np.random.choice(categories, 1)[0],
             "closest_category" : np.random.choice(categories, 1)[0]
         }
    # GET
    def getRecommendedGrocery(self, user_id):
        return [self.getRandomItem(user_id) for r in range(np.random.randint(2,10))]

    # GET
    def getSuggestedGrocery(self, user_id):
        return [self.getRandomItem(user_id) for r in range(np.random.randint(2,10))]
