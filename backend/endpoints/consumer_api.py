from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file

import re
import json
import os
import sys
from datetime import datetime
import uuid
import base64

# sys.path.append('/Users/chu/Documents/sc/W210/w210_final_proj/backend/')
# print(sys.path)
# # sys.path.append("...")
#

from consumer_module import consumer_controller
from retailer_module import retailer_controller
from db import db_controller
import bottle
bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024

def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)
    return _enable_cors

consumer_app = Bottle()
db_c = db_controller.DBController()
retailer_c = retailer_controller.RetailerController()
consumer_c = consumer_controller.ConsumerController()


@consumer_app.route(path='/receipt/test', method='GET')
@enable_cors
def receiptTest():
    try:
        return {'result': 'receipt test'}
    except Exception as e:
        print e
        return e


@consumer_app.route(path='/receipt/<id>', method='GET')
@enable_cors
def receiptData(id):
    try:
        receipt_id = id
        print(receipt_id)
        # return {'result': receipt_id}
        res = db_c._useOCR(receipt_id)
        return {'result': res}
    except Exception as e:
        print e
        return e

@consumer_app.route(path='/receipt/verify', method='POST')
@enable_cors
def receiptVerify():
    try:
        request_json = request.json
        print(request_json)
        return {'result': request_json}
    except Exception as e:
        print e
        return e

@consumer_app.route(path='/receipt/wastage', method='GET')
@enable_cors
def receiptWastage():
    try:
        request_json = request.json
        print(request_json)
        return {'result': request_json}
    except Exception as e:
        print e
        return e

@consumer_app.route(path='/receipt/upload_receipt', method='POST')
@enable_cors
def upload_receipt():
    try:
        upload = request.files.get('upload')
        res = db_c.saveReceipt(upload)
        return {'result': res}
    except Exception as e:
        print e
        return e
