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
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, user_id'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)
    return _enable_cors

wastage_app = Bottle()
data = 'dummy data'
@wastage_app.route(path='/wastage/test', method=['GET','OPTIONS'])
@enable_cors
def wastageTest():
    try:
        return {'result': 'wastage test'}
    except Exception as e:
        print e
        return e


@wastage_app.route(path='/wastage/<id>', method=['GET', 'OPTIONS'])
@enable_cors
def wastageData(receipt_id):
    try:
        user_id = request.get_header('user_id')
        return {'result': data}
    except Exception as e:
        print e
        return e

@wastage_app.route(path='/wastage/<id>', method=['PUT','OPTIONS'])
@enable_cors
def wastageVerify(receipt_id):
    try:
        user_id = request.get_header('user_id')
        return {'result': data}
    except Exception as e:
        print e
        return e
