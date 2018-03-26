import sys
from db import db_connection_cls
from ocr_module import ocr
import hashlib
import numpy as np
import time


class ReceiptService(object):
    def __init__(self):
        self.sql_ = db_connection_cls.MysqlDBPython()
        self.ocr_ = ocr
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

    def getRandomItem(self, user_id, receipt_id):
        names = ['apple','banana','orange', 'beef','pork','grapes']
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
             "receipt_id" : receipt_id,
             "id" : np.random.randint(1,1000),
             "name" : np.random.choice(names, 1)[0],
             "price" : np.random.randint(1,20),
             "quantity" : np.random.randint(1,20),
             "unit" : np.random.randint(1,10),
             "category" : np.random.choice(categories, 1)[0],
             "closest_category" : np.random.choice(categories, 1)[0]
         }
    def getRandomReceipt(self, user_id):
        return {
            "id" : np.random.randint(1,100000),
            "timestamp" : 1520812333157 - 10000000 * np.random.randint(1,10)
        }
    # POST
    def storeReceipt(self, user_id, receiptData):
        ocr_data = self.ocr_.ocr({'image': receiptData})
        current_time = time.time()
        for row in ocr_data:
            obj = {
                "USER_ID" : user_id,
                "RECEIPT_ID" : row["receipt_id"],
                "RECEIPT_UPLOAD_DT" : current_time,
                "ITEM_ID" : row['upc'],
                "ITEM_NAME" : row['food_name'],
                "ITEM_QTY_PRCH" : int(''.join([i for i in row['size'] if not i.isalpha()])),
                "ITEM_UNITS" : ''.join([i for i in row['size'] if not i.isdigit()]),
                "ITEM_TOTAL_PRICE" : row['price'],
                "ITEM_CATEGORY": row["category"]
            }
            data =self.sql_.insertObj('USER_GROCERY_RECEIPT', obj)
        return ocr_data
    # GET
    def getReceipt(self, user_id, receipt_id):
        conditional_query = 'USER_ID = "'+user_id + '" AND RECEIPT_ID = "'+ receipt_id+'"';
        fields = self.ui_to_db.keys()
        data = self.sql_.selectFields('USER_GROCERY_RECEIPT', conditional_query, \
        fields)
        print(data)
        d = []
        for item in data:
            obj = {}
            for k,v in self.db_to_ui.items():
                obj[k] = item[v]
            d.append(obj)
        return d
    def getAllReceipts(self, user_id):
        conditional_query = 'USER_ID = "'+user_id + '"';
        fields = ['RECEIPT_ID', 'RECEIPT_UPLOAD_DT']
        data = self.sql_.selectFields('USER_GROCERY_RECEIPT', conditional_query, \
        fields)
        d = []
        receipt_ids = []

        for item in data:
            obj = {}
            id = item['RECEIPT_ID']
            dt = item['RECEIPT_UPLOAD_DT']
            if id in receipt_ids:
                continue
            else:
                receipt_ids.append(id)
                d.append({
                    'receipt_id' : id,
                    'upload_date': dt
                })
        return d
    # PUT
    def updateReceipt(self, user_id, receipt_id, receiptData):
        return [self.getRandomItem(user_id, receipt_id) for r in range(np.random.randint(2,10))]
    # DELETE
    def deleteReceipt(self, user_id, receipt_id):
        pass
