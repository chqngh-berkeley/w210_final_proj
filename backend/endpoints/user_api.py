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

user_app = Bottle()
db_c = db_controller.DBController()

@user_app.route(path='/user/test', method='GET')
@enable_cors
def userTest():
    try:
        return {'result': 'user test'}
    except Exception as e:
        print e
        return e

@user_app.route(path='/user/all', method='GET')
@enable_cors
def getAllUsers():
    try:
        users = db_c.getAllUser()
        return {'result': users}
    except Exception as e:
        print e
        return e

@user_app.route(path='/user/login', method='POST')
@enable_cors
def userLogin():
    try:
        request_json = dict(request.json)
        username = request_json['username']
        password = request_json['password']
        user = db_c.getUser(username, password)
        return {'result': user}
    except Exception as e:
        print e
        return e

@user_app.route(path='/user/save', method='POST')
@enable_cors
def userCreation():
    try:
        request_json = dict(request.json)
        username = request_json['username']
        password = request_json['password']
        email = request_json['email']
        db_c.createUser(username, password, email)
        return {'result': request_json}
    except Exception as e:
        print e
        return e
