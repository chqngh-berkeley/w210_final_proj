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
         "USER_ID": "user_id",
         "ITEM_CATEGORY": "category",
         "FAMILY_SIZE": "",
         "ITEM_ID": "id",
         "FIRST_SIZE": "",
         "ITEM_SIZE": "",
         "ITEM_TRUE_SIZE": "",
         "ITEM_TOTAL_SIZE": "",
         "ITEM_SIZE_AVG": "",
         "ITEM_SIZE_STDEV": "",
         "ITEM_SIZE_Z": "",
         "ITEM_SIZE_ALL_AVG": "",
         "ITEM_SIZE_ALL_STDEV": "",
         "ITEM_SIZE_ALL_Z": "",
         "ITEM_QTY_PRCH": "",
         "PREVIOUS_SHOP_DATE": "upload_date",
         "DAYS_BETWEEN_AVG": "",
         "DAYS_BETWEEN_STDEV": "",
         "PREV_DATE_Z": "",
         "PREVIOUS_SHOP_SIZE": "",
         "TRIP_SIZE_AVG": "",
         "TRIP_SIZE_STDEV": "",
         "PREV_SIZE_Z": "",
         "PREV_Z": "",
         "TIME_LOSS_COUNTER": "",
         "TIME_LOSS": "",
         "SECTION": "",
         "prediction": ""
         }
        self.ui_to_db = mapper
        self.db_to_ui = {v:k for (k,v) in mapper.items()}

    # GET
    def getPredictedList(self, user_id):
        conditional_query = 'USER_ID = "'+user_id + '"';
        fields = ['RECEIPT_ID', 'RECEIPT_UPLOAD_DT']
        data = self.sql_.selectFields('USER_GROCERY_LIST_PREDICTION', conditional_query, \
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

    # GET
    def getSuggestedGrocery(self, user_id):
        return [self.getRandomItem(user_id) for r in range(np.random.randint(2,10))]
