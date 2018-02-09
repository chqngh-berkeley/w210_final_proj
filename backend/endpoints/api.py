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

sys.path.append('/Users/chu/Documents/sc/W210/w210_final_proj/backend/')
print(sys.path)
# sys.path.append("...")


from consumer_module import consumer_controller
from retailer_module import retailer_controller
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


app = Bottle()
retailer_c = retailer_controller.RetailerController()
consumer_c = consumer_controller.ConsumerController()


def routex(**kwargs):
    def decorator(callback):
        kwargs['callback'] = callback
        app.route(**kwargs)

        kwargs['method'] = 'OPTIONS'
        kwargs['callback'] = lambda: {}
        app.route(**kwargs)
        return callback
    return decorator
#
#
# @app.hook('after_request')
# def enable_cors():
#     """
#     You need to add some headers to each request.
#     Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
#     """
#     response.headers['Access-Control-Allow-Origin'] = '*'
#     response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
#     response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@app.route('/test')
def test():
    return 'working'


@routex(path='/upload_receipt', method='POST')
@enable_cors
def upload_receipt():
    # request_json = dict(request.json)
    upload = request.files.get('upload')
    print(upload.filename)
    name, ext = os.path.splitext(upload.filename)
    if ext not in ('.png', '.jpg', '.jpeg'):
        return "File extension not allowed."
    UPLOAD_DIR = "/Users/chu/Documents/sc/W210/w210_final_proj/backend/images/"

    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    import numpy as np
    fname = str(np.random.randint(1000)) + ext
    file_path = "{path}/{file}".format(path=UPLOAD_DIR, file=fname)
    upload.save(file_path)
    return "File successfully saved."

@routex(path='/retailer/analytics', method='GET')
def get_retailer_analytics():
    try:
        res = retailer_c.get_analytics()
        print(res)
        return {'result':res}
    except Exception as e:
        print e
        return e



if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("--host", dest="host", default="localhost",
                      help="hostname or ip address", metavar="host")
    parser.add_option("--port", dest="port", default=8090,
                      help="port number", metavar="port")
    (options, args) = parser.parse_args()

    run(app,  server='gevent', host=options.host, port=int(options.port))
