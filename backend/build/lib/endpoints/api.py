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

# sys.path.append('/Users/chu/Documents/sc/W210/w210_final_proj/backend/')
sys.path.append("...")


from consumer_module import consumer_controller
from retailer_module import retailer_controller

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


@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, Authorization, X-Zendesk-App-Installation-Id, X-Zendesk-App-Id'



@app.route('/test')
def test():
    return 'working'


@routex(path='/upload_receipt', method='POST')
def upload_receipt():
    request_json = dict(request.json)
    category = request.forms.get('category')
    upload = request.files.get('upload')
    name, ext = os.path.splitext(upload.filename)
    if ext not in ('.png', '.jpg', '.jpeg'):
        return "File extension not allowed."

    save_path = "/tmp/{category}".format(category=category)
    if not os.path.exists(save_path):
        os.makedirs(save_path)

    file_path = "{path}/{file}".format(path=save_path, file=upload.filename)
    upload.save(file_path)
    return "File successfully saved to '{0}'.".format(save_path)

@routex(path='/retailer/analytics', method='GET')
def get_retailer_analytics():
    return retailer_c.get_analytics()




if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("--host", dest="host", default="localhost",
                      help="hostname or ip address", metavar="host")
    parser.add_option("--port", dest="port", default=8090,
                      help="port number", metavar="port")

    parser.add_option("--es_host", dest="es_host", default="localhost",
                      help="elasticsearch host name", metavar="es_host")

    parser.add_option("--es_port", dest="es_port", default=9200,
                      help="elasticsearch port number", metavar="es_port")

    (options, args) = parser.parse_args()

    run(app,  server='gevent', host=options.host, port=int(options.port))
