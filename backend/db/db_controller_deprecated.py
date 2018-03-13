import pandas as pd
import sys
import os
import numpy as np
from ocr_module import ocr
import logging

class DBController(object):
    def __init__(self):
        # connected to DB
        self.connected = False
        self.USER_DF_PATH = 'data/users.json'
        self.IMAGE_FOLDER = '/backend/images'
    # save to db
    def save(self, receiptData):
        pass

    def createUser(self, username, password, email):
        if self.connected:
            pass
        else:
            obj = {"username": username,"password": password,"email" : email}
            df = self._readJsonDF(self.USER_DF_PATH)
            if df is None:
                df = pd.DataFrame([obj])
            else:
                df = df.append(obj, ignore_index=True)
            self._saveJsonDF(self.USER_DF_PATH, df)
            return 'success'
    def getUser(self, username, password):
        if self.connected:
            pass
        else:
            df = self._readJsonDF(self.USER_DF_PATH)
            if df is None:
                return 'user not found'
            else:
                return df[(df['username'] == username) & (df['password'] == password)].to_dict(orient='records')
    def getAllUser(self):
            df = self._readJsonDF(self.USER_DF_PATH)
            if df is None:
                return 'user not found'
            else:
                return df.to_dict(orient='records')

    def saveReceipt(self, upload):
        if self.connected:
            pass
        else:
            name, ext = os.path.splitext(upload.filename)
            if ext not in ('.png', '.jpg', '.jpeg'):
                return "File extension not allowed."
            UPLOAD_DIR = self.IMAGE_FOLDER

            if not os.path.exists(UPLOAD_DIR):
                os.makedirs(UPLOAD_DIR)

            fname = str(np.random.randint(10000)) + ext
            file_path = "{path}/{file}".format(path=UPLOAD_DIR, file=fname)
            upload.save(file_path)
            logging.log(file_path)
            # res = self._useOCR(file_path)
            return fname

    def _useOCR(self, receipt_id):
        def PIL2array(img):
            return np.array(img.getdata(),
                            np.uint8).reshape(img.size[1], img.size[0], 3)

        fname = self.IMAGE_FOLDER + '/' + str(receipt_id)
        try:
            logging.log(fname)
            if os.path.exists(fname):
                args = {
                    'image' : fname,
                    'preprocess' :  None
                }
                df = ocr.ocr(args)
                logger.log(df)
                return df.to_dict(orient='records')
        except Exception as e:
            logging.error('error...', e)
            return {'error':True, 'e': e}
    def _readJsonDF(self, path):
        try:
            with open(path, 'r') as f:
                df = pd.read_json(f, orient='records')
                return df
        except Exception as e:
            logging.error(e)
            return {'error':True, 'e': e}
    def _saveJsonDF(self, path, df):
        try:
            with open(path, 'wb') as f:
                df.to_json(f, orient='records')
                return df
        except Exception as e:
            logging.error(e)
            return {'error':True, 'e': e}
