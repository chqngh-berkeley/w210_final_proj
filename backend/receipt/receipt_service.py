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
        conditional_query = ('USER_ID = "%s" AND RECEIPT_ID=%s')%(user_id, receipt_id)
        obj = {}
        for k,v in self.db_to_ui.items():
            if k in receiptData:
                obj[v] = receiptData[k]
        data = self.sql_.updateObj('USER_GROCERY_RECEIPT', conditional_query,obj)
        pass
    # DELETE
    def deleteReceipt(self, user_id, receipt_id):
        pass
