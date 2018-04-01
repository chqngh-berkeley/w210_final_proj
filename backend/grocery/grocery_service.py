import sys
from db import db_connection_cls
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
         "ITEM_NAME" : "name",
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
        fields = ['ITEM_CATEGORY','ITEM_CLASS', 'ITEM_TRUE_SIZE','ITEM_QTY_PRCH','prediction']
        data = self.sql_.selectFields('USER_GROCERY_LIST_PREDICTION', conditional_query, \
        fields)
        d = []
        for item in data:
            d.append({
                'name' : item['ITEM_CATEGORY'],
                'size': item['ITEM_TRUE_SIZE'],
                'quantity' : item['ITEM_QTY_PRCH'],
                'class' : item['ITEM_CLASS']
            })
        return d
