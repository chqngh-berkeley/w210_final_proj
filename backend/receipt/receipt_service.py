import sys
from db import db_connection_cls
from ocr_module import ocr
import hashlib
import numpy as np
import time

# def ocr(args):
#     print args

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
    def storeReceiptAndWastageInfo(self, user_id, receiptData):
        args = {
            'image': receiptData,
            'user_id': user_id
        }
        ocr_data = self.ocr_.ocr(args)
        import datetime
        now = datetime.date.today()
        for row in ocr_data:
            obj = {
                "USER_ID" : user_id,
                "RECEIPT_ID" : str(row["receipt_id"]),
                "RECEIPT_UPLOAD_DT" : str(now),
                "ITEM_ID" : str(row['upc']),
                "ITEM_NAME" : row['food_name'].split(',')[0],
                "ITEM_QTY_PRCH" : 1, #float(''.join([i for i in row['size'] if not i.isalpha()]).trim()),
                "ITEM_UNITS" : ''.join([i for i in row['size'] if not i.isdigit()]),
                "ITEM_TOTAL_PRICE" : row['price'],
                "ITEM_CATEGORY": row["category"]
            }
            data =self.sql_.insertObj('USER_GROCERY_RECEIPT', obj)

            wastage_obj = {
                "USER_ID" : obj["USER_ID"],
                "RECEIPT_ID" : str(obj["RECEIPT_ID"]),
                "WASTE_DATA_ENTRY_DT" : now,
                "ITEM_ID" : obj['ITEM_ID'],
                "ITEM_NAME" : obj['ITEM_NAME'],
                "ITEM_SIZE" : obj['ITEM_QTY_PRCH'],
                "ITEM_CLASS" : obj['ITEM_CATEGORY'],
                "ITEM_TOTAL_PRICE" : obj['ITEM_TOTAL_PRICE'],
                "ITEM_CATEGORY": obj["ITEM_CATEGORY"],
                "WASTE_AMT" : 0,
                "WASTE_UNITS" : 0
            }
            wastage_data = self.sql_.insertObj('USER_GROCERY_ITEM_WASTE_ACTUAL', wastage_obj)

        return ocr_data
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
                obj[k] = str(item[v])
            d.append(obj)
        return d
    # Delete
    def deleteReceipt(self, user_id, receipt_id):
        conditional_query = 'USER_ID = "'+user_id + '" AND RECEIPT_ID = "'+ receipt_id+'"';
        result1 = self.sql_.delete('USER_GROCERY_RECEIPT', conditional_query)
        result2 = self.sql_.delete('USER_GROCERY_ITEM_WASTE_ACTUAL', conditional_query)
        return {"result_1": result1, "result_2": result2 }


    # GET
    def getWastageInfo(self, user_id, receipt_id):
        conditional_query = 'USER_ID = "'+user_id + '" AND RECEIPT_ID = "'+ receipt_id+'"';
        mapping_obj = {
            "USER_ID" : "user_id",
            "RECEIPT_ID" : "receipt_id",
            "WASTE_DATA_ENTRY_DT" : "date",
            "ITEM_ID" : "id",
            "ITEM_NAME" : "food_name",
            "ITEM_TOTAL_PRICE" : "price",
            "ITEM_CATEGORY" : "category",
            "WASTE_AMT": "wastage",
            "WASTE_UNITS": "waste_unit"
        }
        fields = mapping_obj.keys()
        data = self.sql_.selectFields('USER_GROCERY_ITEM_WASTE_ACTUAL', conditional_query, \
        fields)
        d = []
        for item in data:
            print item
            obj = {}
            for k,v in mapping_obj.items():
                obj[v] = str(item[k])
            d.append(obj)
        return d
    # PUT
    def updateWastageInfo(self, user_id, receipt_id, receiptData):
        current_time = time.time()
        mapping_obj = {
            "USER_ID" : "user_id",
            "RECEIPT_ID" : "receipt_id",
            "WASTE_DATA_ENTRY_DT" : "date",
            "ITEM_ID" : "id",
            "ITEM_NAME" : "food_name",
            "ITEM_UNITS" : "unit",
            "ITEM_TOTAL_PRICE" : "price",
            "ITEM_CATEGORY" : "category",
            "ITEM_CLASS" : "class",
            "WASTE_AMT": "wastage",
            "WASTE_UNITS": "waste_unit"
        }
        result = []
        for item in receiptData:
            obj = {}
            print(item)
            item_id = item['id']
            conditional_query = ('USER_ID = "%s" AND RECEIPT_ID=%s AND ITEM_ID=%s')%(user_id, receipt_id, item_id)
            for k,v in mapping_obj.items():
                if v in item:
                    obj[k] = item[v]
            # obj['WASTE_DATA_ENTRY_DT'] = current_time
            data = self.sql_.updateObj('USER_GROCERY_ITEM_WASTE_ACTUAL', conditional_query,obj)
            result.append(data)
        return result
    # PUT
    def updateReceipt(self, user_id, receipt_id, receiptData):
        mapping_obj = {
            "USER_ID" : "user_id",
            "RECEIPT_ID" : "receipt_id",
            "ITEM_ID" : "id",
            "ITEM_NAME" : "food_name",
            "ITEM_TOTAL_PRICE" : "price",
            "ITEM_CATEGORY" : "category",
            "WASTE_AMT": "wastage",
            "WASTE_UNITS": "waste_unit"
        }
        result = []
        import datetime
        now = datetime.date.today()
        for item in receiptData:
            obj = {}
            print(item)
            item_id = item['id']
            conditional_query = ('USER_ID = "%s" AND RECEIPT_ID=%s AND ITEM_ID=%s')%(user_id, receipt_id, item_id)
            for k,v in self.ui_to_db.items():
                if v in item:
                    obj[k] = item[v]
            data = self.sql_.updateObj('USER_GROCERY_RECEIPT', conditional_query,obj)
            result.append(data)
            obj = {}
            for k,v in mapping_obj.items():
                if v in item:
                    obj[k] = item[v]
            obj['WASTE_DATA_ENTRY_DT'] = now
            data = self.sql_.updateObj('USER_GROCERY_ITEM_WASTE_ACTUAL', conditional_query,obj)
        return result
