from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file

import re
import json
import os
import sys
from datetime import datetime
import uuid
import base64
#
# sys.path.append('/Users/chu/Documents/sc/W210/w210_final_proj/backend/')
# print(sys.path)
# # sys.path.append("...")


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

retailer_app = Bottle()
retailer_c = retailer_controller.RetailerController()
consumer_c = consumer_controller.ConsumerController()
db_c = db_controller.DBController()

@retailer_app.route(path='/retailer/test', method='GET')
@enable_cors
def retailerTest():
    try:
        return {'result': 'retailer test'}
    except Exception as e:
        print e
        return e

@retailer_app.route(path='/retailer/analytics', method='GET')
@enable_cors
def get_retailer_analytics():
    try:
        res = retailer_c.get_analytics()
        print(res)
        return {'result':res}
    except Exception as e:
        print e
        return e
