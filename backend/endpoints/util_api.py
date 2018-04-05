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
import json
from util import util_service
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

util_app = Bottle()
util_serv = util_service.UtilService()
@util_app.route(path='/util/test', method=['GET','OPTIONS'])
@enable_cors
def utilTest():
    try:
        data = util_serv.testService()
        return {'result': data}
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}


@util_app.route(path='/util/stacked', method=['POST', 'OPTIONS'])
@enable_cors
def dataManipulation():
    try:
        js = request.json
        d = dict(js)
        data1 = json.loads(d['data1'])
        data = util_serv.getStackedAreaChartData(data1, d['data2'])
        return data
    except Exception as e:
        print e
        response.status = 400
        return {'error': str(e)}

@util_app.route(path='/util/bar', method=['POST', 'OPTIONS'])
@enable_cors
def dataManipulation():
    try:
        js = request.json
        d = dict(js)
        data1 = json.loads(d['data1'])
        data = util_serv.getBarchartData(data1, d['data2'])
        return data
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

    run(util_app,  server='gevent', host=options.host, port=int(options.port))
