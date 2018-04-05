import sys
from db import db_connection_cls
import hashlib

'''
Schema: USER_PROFILE

USER_ID VARCHAR(128) primary key, /*Login User Name*/
USER_NM varchar(128) , /*Name of User*/
USER_AGE integer,
PASSWORD VARCHAR(128),
/*FAMILY_MBR_ID bigint,*/
FAMILY_SIZE integer,
NUM_ADULTS integer,
NUM_KIDS integer,
ANNUAL_HOUSEHOLD_INCOME VARCHAR(200), /* Range */
SHOP_TRIP_FREQ INTEGER
'''

class UserService(object):
    def __init__(self):
        self.sql_ = db_connection_cls.MysqlDBPython()
        self.init()
    def init(self):
        mapper = {
            "USER_ID" :   "username",
            "USER_NM" :   "name",
            "USER_AGE" :  "age",
            "PASSWORD" :  "password",
            "FAMILY_SIZE" :  "family_size",
            "NUM_ADULTS" :  "num_adults",
            "NUM_KIDS" :  "num_kids",
            "ANNUAL_HOUSEHOLD_INCOME" :  "income",
            "SHOP_TRIP_FREQ" : "shop_trip_freq"
        }
        self.ui_to_db = mapper
        self.db_to_ui = {v:k for (k,v) in mapper.items()}
    def createUser(self, request_json):
        obj = {}
        for k,v in self.db_to_ui.items():
            if k in request_json:
                obj[v] = request_json[k]
        data =self.sql_.insertObj('USER_PROFILE', obj)
        return data

    def updateUser(self, user_id, user):
        conditional_query = 'USER_ID = "' + user_id + '"'
        obj = {}
        for k,v in self.db_to_ui.items():
            if k in user:
                obj[v] = user[k]
        data = self.sql_.updateObj('USER_PROFILE', conditional_query,obj)
        pass
    def getUser(self, user_id):
        conditional_query = 'USER_ID = "'+user_id + '"'
        fields = self.ui_to_db.keys()
        data = self.sql_.selectFields('USER_PROFILE', conditional_query, \
        fields)
        print(data)
        d = {}
        for item in data:
            for k,v in self.db_to_ui.items():
                d[k] = item[v]
        return d

    def getUserViaLogin(self, username, password):
        conditional_query = 'USER_ID="%s" AND PASSWORD="%s"' % (username, password)
        fields = self.ui_to_db.keys()
        data = self.sql_.selectFields('USER_PROFILE', conditional_query, \
        fields)
        print(data)
        d = {}
        for item in data:
            for k,v in self.db_to_ui.items():
                d[k] = item[v]
        return d
