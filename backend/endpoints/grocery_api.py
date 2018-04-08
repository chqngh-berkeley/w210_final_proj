from gevent import monkey; monkey.patch_all()
from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file

import re
import json
import os
import sys
from datetime import datetime
import uuid
import base64
import requests
from grocery import grocery_service
import bottle
bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024
import subprocess

def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, DELETE, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, user_id'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)
    return _enable_cors

grocery_app = Bottle()
grocery_serv = grocery_service.GroceryService()

@grocery_app.route(path='/grocery/test', method=['GET','OPTIONS'])
@enable_cors
def groceryTest():
    try:
        return {'result': 'grocery test'}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

#
# @grocery_app.route(path='/grocery/recommended', method=['GET', 'OPTIONS'])
# @enable_cors
# def getRecommendedGrocery():
#     try:
#         user_id = request.query['user_id']
#         print('user id:', user_id)
#         rec_grocery_data = grocery_serv.getPredictedList(user_id)
#         if len(rec_grocery_data) == 0:
#             import os
#             command = ("sh ./models/predict.sh %s %s")%(user_id, 50)
#             print command
#             os.system(command)
#         return { 'data': rec_grocery_data}
#     except Exception as e:
#         print e
#         response.status = 400
#         return {'error': str(e)}

@grocery_app.route(path='/grocery/train', method=['GET', 'OPTIONS'])
@enable_cors
def train():
    try:
        r = requests.get('http://r_api:8282/train')
        return {'data': 'training'}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@grocery_app.route(path='/grocery/predict', method=['GET', 'OPTIONS'])
@enable_cors
def predict():
    try:
        user_id = request.query['user_id']
        threshold = request.query['threshold']
        obj = {
            'user_id': user_id,
            'waste_threshold' : threshold
        }
        r = requests.post('http://r_api:8282/predict', data = obj)
        res_obj = r.json()
        print(res_obj)
        return {'data' : res_obj}
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

    run(grocery_app,  server='gevent', host=options.host, port=int(options.port))
