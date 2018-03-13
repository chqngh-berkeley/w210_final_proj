import sys
from db import db_connection_cls
import hashlib


class ReceiptService(object):
    def __init__(self):
        self.sql_ = db_connection_cls.MysqlDBPython()
    # POST
    def storeReceipt(self, receiptData):
        pass
    # GET
    def getReceipt(self, receipt_id):
        pass
    # PUT
    def updateReceipt(self, receipt_id, receiptData):
        pass
    # DELETE
    def deleteReceipt(self, receipt_id):
        pass
