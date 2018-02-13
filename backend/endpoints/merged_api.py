from gevent import monkey; monkey.patch_all()
from bottle import Bottle, route, run, request, response, install, HTTPResponse, hook, error, static_file
from bottle import static_file
from consumer_api import consumer_app
from retailer_api import retailer_app
from user_api import user_app
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
from db import db_controller
import bottle

consumer_app.merge(retailer_app)
consumer_app.merge(user_app)
app = consumer_app
print(app)

if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("--host", dest="host", default="localhost",
                      help="hostname or ip address", metavar="host")
    parser.add_option("--port", dest="port", default=8090,
                      help="port number", metavar="port")
    (options, args) = parser.parse_args()

    run(app,  server='gevent', host=options.host, port=int(options.port))
