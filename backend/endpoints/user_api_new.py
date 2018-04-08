from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file

import re
import json
import os
import sys
from datetime import datetime
import uuid
import base64

import bottle

from user import user_service
bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024



def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, user_id'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)
    return _enable_cors

user_serv = user_service.UserService()
user_app = Bottle()

@user_app.route(path='/user', method=['POST', 'OPTIONS'])
@enable_cors
def createUser():
    try:
        request_json = dict(request.json)
        data = user_serv.createUser(request_json)
        return {'data': request_json}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}


@user_app.route(path='/user/login', method=['POST', 'OPTIONS'])
@enable_cors
def loginUser():
    try:
        request_json = dict(request.json)
        username = request_json['username']
        password = request_json['password']
        data = user_serv.getUserViaLogin(username, password)
        return {'data': data}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}


@user_app.route(path='/user/<id>', method='GET')
@enable_cors
def getUser(id):
    try:
        user_id = id
        data = user_serv.getUser(user_id)
        return {'data': data}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@user_app.route(path='/user/<id>', method=['PUT','OPTIONS'])
@enable_cors
def updateUser(id):
    try:
        request_json = dict(request.json)
        user_id = id
        data = user_serv.updateUser(user_id, request_json)
        return { 'data' : data }
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}


@user_app.route(path='/user/<id>', method=['DELETE','OPTION'])
@enable_cors
def deleteUser():
    try:
        user_id = id
        '''
        Business logic here
        '''
        # db.delete_user_based_on_id(user_id)
        data = user_serv.removeUser(user_id)
        return {'data': data }
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}
@user_app.route(path='/user/test', method='GET')
@enable_cors
def userTest():
    try:
        print('user_id:',request.get_header('user_id'))
        return {'data': 'user test'}
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

    run(user_app,  server='gevent', host=options.host, port=int(options.port))
