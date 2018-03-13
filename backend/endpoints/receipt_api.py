from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file

import re
import json
import os
import sys
from datetime import datetime
import uuid
import base64

from receipt import receipt_service
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

receipt_app = Bottle()
receipt_serv = receipt_service.ReceiptService()


@receipt_app.route(path='/receipt/test', method=['GET','OPTIONS'])
@enable_cors
def receiptTest():
    try:
        return {'result': 'receipt test'}
    except Exception as e:
        print e
        return e


@receipt_app.route(path='/receipt/<id>', method=['GET', 'OPTIONS'])
@enable_cors
def receiptData(receipt_id):
    try:
        user_id = request.get_header('user_id')
        print('receipt id:', receipt_id)
        data = receipt_serv.getReceipt(receipt_id)
        return {'result': data}
    except Exception as e:
        print e
        return e

@receipt_app.route(path='/receipt/<id>', method=['PUT','OPTIONS'])
@enable_cors
def receiptVerify(receipt_id):
    try:
        user_id = request.get_header('user_id')
        print('receipt id:', receipt_id)
        request_json = dict(request.json)
        data = receipt_serv.updateReceipt(receipt_id, request_json)
        return {'result': data}
    except Exception as e:
        print e
        return e

@receipt_app.route(path='/receipt/upload_receipt', method=['POST','OPTIONS'])
@enable_cors
def upload_receipt():
    try:
        user_id = request.get_header('user_id')
        upload = request.files.get('upload')
        data = receipt_serv.storeReceipt(upload)
        return {'result': data}
    except Exception as e:
        print e
        return e
