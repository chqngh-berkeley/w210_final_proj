from gevent import monkey; monkey.patch_all()
from bottle import Bottle, route, run, request, response, \
install, HTTPResponse, hook, error, static_file


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
import requests

def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, user_id'

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
def receiptData(id):
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        print('receipt id:', id)
        receipt_data = receipt_serv.getReceipt(user_id, id)
        wastage_data = receipt_serv.getWastageInfo(user_id, id)
        return {
        'receipt_data': receipt_data,
        'wastage_data' : wastage_data,
        'receipt_id': id}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@receipt_app.route(path='/receipt_image/<path>', method=['GET', 'OPTIONS'])
@enable_cors
def receiptImage(path):
    try:
        return static_file('%s.png'%(path), root='/backend/images')
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}
@receipt_app.route(path='/receipt/all', method=['GET'])
@enable_cors
def getAllReceiptData():
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        if not user_id:
            return {'error': 'user_id required'}
        receipt_data = receipt_serv.getAllReceipts(user_id)
        return { 'data' : receipt_data }
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@receipt_app.route(path='/receipt/<id>', method=['PUT','OPTIONS'])
@enable_cors
def receiptVerify(id):
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        print('receipt id:', id)
        request_json = dict(request.json)
        print(request_json)
        receipt_info_data = receipt_serv.updateReceipt(user_id, receipt_id, request_json)
        return {'data': receipt_info_data, 'receipt_id': id}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}
@receipt_app.route(path='/wastage/<id>', method=['PUT','OPTIONS'])
@enable_cors
def wastageUpdate(id):
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        print('receipt id:', id)
        print('request.json', request.json)
        request_json = dict(request.json)['data']

        wastage_info_data = receipt_serv.updateWastageInfo(user_id, id, request_json)
        return {'data': wastage_info_data, 'receipt_id': id}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}
@receipt_app.route(path='/receipt/<id>', method=['PUT','OPTIONS'])
@enable_cors
def receiptUpdate(id):
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        print('receipt id:', id)
        print('request.json', request.json)
        request_json = list(request.json)

        receipt_info_data = receipt_serv.updateReceipt(user_id, id, request_json)
        return {'data': receipt_info_data, 'receipt_id': id}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@receipt_app.delete(path='/receipt/<id>')
@enable_cors
def deleteWastageInfo(id):
    try:
        user_id = request.query['user_id']
        print('user id:', user_id)
        print('receipt id:', id)
        # request_json = dict(request.json)['data']

        result = receipt_serv.deleteReceipt(user_id, id)
        return {'data': result}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@receipt_app.route(path='/receipt/upload_receipt', method=['POST','OPTIONS'])
@enable_cors
def upload_receipt():
    try:
        user_id = request.query['user_id']
        upload = request.files.get('upload')
        if not user_id:
            response.status = 400
            return {'data': 'user_id cannot be empty'}
        if not upload:
            response.status = 400
            return {'data': 'upload cannot be empty'}

        print user_id
        data = receipt_serv.storeReceiptAndWastageInfo(user_id, upload.file)
        return {'data': data}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("--host", dest="host", default="0.0.0.0",
                      help="hostname or ip address", metavar="host")
    parser.add_option("--port", dest="port", default=8090,
                      help="port number", metavar="port")
    (options, args) = parser.parse_args()

    run(receipt_app,  server='gevent', host=options.host, port=int(options.port))
