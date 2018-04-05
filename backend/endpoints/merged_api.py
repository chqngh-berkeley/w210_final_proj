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

from user_api_new import user_app
from receipt_api import receipt_app
from grocery_api import grocery_app
from util_api import util_app
import bottle

user_app.merge(receipt_app)
user_app.merge(grocery_app)
user_app.merge(util_app)
app = user_app
print(app)

if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("--host", dest="host", default="0.0.0.0",
                      help="hostname or ip address", metavar="host")
    parser.add_option("--port", dest="port", default=8090,
                      help="port number", metavar="port")
    (options, args) = parser.parse_args()

    run(app,  server='gevent', host=options.host, port=int(options.port))
