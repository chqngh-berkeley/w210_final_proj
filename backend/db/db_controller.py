import sys
import pandas as pd
from sqlalchemy import create_engine
import MySQLdb
import datetime
import mysql.connector 
#from sqlalchemy import create_engine



class DBController(object):
    def __init__(self):
        pass

    # save to db
    def save(self, receiptData):
      	df = pd.read_json(receiptData)
      	print df
		#mariadb_connection = mariadb.connect(user='some_user', password='some_pass', database='groceries')
		#cursor = mariadb_connection.cursor()
		## Update User, Password, Hostname, PortName and Schema Name
		engine = create_engine('mysql+mysqlconnector://[user]:[pass]@[host]:[port]/[db_schema]', echo=False)
		df.to_sql(name='table_name', con=engine, if_exists = 'append', index=False)

