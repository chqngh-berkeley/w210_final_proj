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


    '''
    CREATE_USER

    url query param: none
    body json :
    {
        "username" : "abc@abc.com",
        "password" : "randompassword",
        "name": "bob",
        "age" : "35",
        "family_size" : 3,
        "num_adults" : 3,
        "num_kids" : 0,
        "income" : 100000,
        "shop_trip_freq": 3
    }
    '''
    def createUser(self, request_json):
        uid = request_json['username']
        email = request_json['email']
        password = request_json['password']
        name = request_json['lastname'] + ',' + request_json['firstname']
        age = request_json['age']
        family_size = request_json['family_size']
        num_adults = request_json['num_adults']
        num_kids = request_json['num_kids']
        income = request_json['income']
        shop_trip_freq = request_json['shop_trip_freq']
        data = self.sql_.insert('USER_PROFILE', \
        USER_ID = uid, PASSWORD= password, USER_NM= name, USER_AGE=age, \
        FAMILY_SIZE = family_size, NUM_ADULTS=num_adults, \
        NUM_KIDS=num_kids, ANNUAL_HOUSEHOLD_INCOME=income,  \
        SHOP_TRIP_FREQ=shop_trip_freq)
        return data

    '''
    UPDATE_USER

    url query param: id
    body json :
    {
        "username" : "abc@abc.com",
        "password" : "randompassword",
        "name": "bob",
        "age" : "35",
        "family_size" : 3,
        "num_adults" : 2,
        "num_kids" : 1,
        "income" : 150000,
        "shop_trip_freq": 3
    }
    '''
    def updateUser(self, user_id, user):
        # conditional_query = 'USER_ID = %s'
        # data = MySQLDBPython.update('USER_PROFILE', conditional_query, user_id, USER_NM=name, USER_AGE=age, FAMILY_SIZE=family_size, NUM_ADULTS=num_adults, NUM_KIDS=num_kids, ANNUAL_HOUSEHOLD_INCOME=income,SHOP_TRIP_FREQ=shop_trip_freq)
        pass
    '''
    GET_USER

    url query param: id
    body json : none
    '''
    def getUser(self, user_id):
        conditional_query = 'USER_ID = '+user_id
        fields = self.ui_to_db.keys()
        data = self.sql_.selectFields('USER_PROFILE', conditional_query, \
        fields)
        d = {}
        for k in self.db_to_ui.keys():
            d[self.db_to_ui[k]] = data[k]
        return d
    '''
    LOGIN_USER

    url query param: none
    body json :
    {
        "username" : "abc@abc.com",
        "password" : "randompassword"
    }
    '''
    def getUserViaLogin(self, username, password):
        conditional_query = 'USER_ID="%s" AND PASSWORD="%s"' % (username, password)
        fields = self.ui_to_db.keys()
        data = self.sql_.selectFields('USER_PROFILE', conditional_query, \
        fields)
        return data
