#!/usr/bin/env python
# coding=utf-8
import sys
import mysql.connector as mariadb

class MysqlDBPython(object):
    """
        Python Class for connecting  with MySQL server and accelerate development project using MySQL
        Extremely easy to learn and use, friendly construction.
    """

    __instance   = None
    __host       = 'db'
    # __host       = '50.97.219.169'
    __user       = None
    __port       = '3306'
    __password   = None
    __database   = None
    __session    = None
    __connection = None

    def __new__(cls, *args, **kwargs):
        if not cls.__instance or not cls.__database:
             cls.__instance = super(MysqlDBPython, cls).__new__(cls,*args,**kwargs)
        return cls.__instance
    ## End def __new__

    def __init__(self, host=None, user='root', \
    password='', database='FOOD_WASTE_CONSUMER_DB'):
        if not host is None:
            self.__host     = host
        self.__user     = user
        self.__password = password
        self.__database = database
        print self.__host,self.__port, self.__database
    ## End def __init__

    def __open(self):
        try:
            cnx = mariadb.connect(host=self.__host, user=self.__user, password=self.__password, database=self.__database, port=self.__port)
            self.__connection = cnx
            self.__session    = cnx.cursor()
        except mariadb.Error as e:
            print "Error %d: %s" % (e.args[0],e.args[1])
    ## End def __open

    def __close(self):
        self.__session.close()
        self.__connection.close()
    ## End def __close

    def select(self, table, where=None, *args, **kwargs):
        result = None
        query = 'SELECT '
        keys = args
        values = tuple(kwargs.values())
        l = len(keys) - 1

        for i, key in enumerate(keys):
            query += "`"+key+"`"
            if i < l:
                query += ","
        ## End for keys

        query += 'FROM %s' % table

        if where:
            query += " WHERE %s" % where
        ## End if where

        self.__open()
        self.__session.execute(query, values)
        number_rows = self.__session.rowcount
        number_columns = len(self.__session.description)

        if number_rows >= 1 and number_columns > 1:
            result = [item for item in self.__session.fetchall()]
        else:
            result = [item[0] for item in self.__session.fetchall()]
        self.__close()

        return result
    ## End def select

    def selectFields(self, table, where, fields):
        result = None
        query = 'SELECT '
        keys = fields
        l = len(keys) - 1

        for i, key in enumerate(keys):
            query += key
            if i < l:
                query += ","
        ## End for keys
        query += ' '
        query += 'FROM %s' % table

        if where:
            query += " WHERE %s" % where
        ## End if where
        print(query)
        self.__open()
        self.__session.execute(query)
        number_rows = self.__session.rowcount
        number_columns = len(self.__session.description)
        result = []
        for row in self.__session.fetchall():
            retOb =  {}
            for idx, item in enumerate(fields):
                retOb[item] = row[idx]
            result.append(retOb)
        self.__close()
        return result
    ## End def select

    def update(self, table, where=None, *args, **kwargs):
        query  = "UPDATE %s SET " % table
        keys   = kwargs.keys()
        values = tuple(kwargs.values()) + tuple(args)
        l = len(keys) - 1
        for i, key in enumerate(keys):
            query += "`"+key+"` = %s"
            if i < l:
                query += ","
            ## End if i less than 1
        ## End for keys
        query += " WHERE %s" % where

        self.__open()
        self.__session.execute(query, values)
        self.__connection.commit()

        # Obtain rows affected
        update_rows = self.__session.rowcount
        self.__close()

        return update_rows
    ## End function update

    def updateObj(self, table, where, obj):
        query  = "UPDATE %s SET " % table
        keys   = obj.keys()
        values = tuple(obj.values())
        l = len(keys) - 1
        for i, key in enumerate(keys):
            query += ""+key+' = "%s"'
            if i < l:
                query += ","
            ## End if i less than 1
        ## End for keys
        query += " WHERE %s" % where
        query = query%(values)
        print(query)
        self.__open()
        self.__session.execute(query)
        self.__connection.commit()

        # Obtain rows affected
        update_rows = self.__session.rowcount
        self.__close()

        return update_rows
    ## End function update

    def insert(self, table, *args, **kwargs):
        values = None
        query = "INSERT INTO %s " % table
        if kwargs:
            keys = kwargs.keys()
            values = tuple(kwargs.values())
            query += "(" + ",".join(["`%s`"] * len(keys)) %  tuple (keys) + ") VALUES (" + ",".join(["%s"]*len(values)) + ")"
        elif args:
            values = args
            query += " VALUES(" + ",".join(["%s"]*len(values)) + ")"

        self.__open()
        self.__session.execute(query, values)
        self.__connection.commit()
        self.__close()
        return self.__session.lastrowid
    ## End def insert

    def insertObj(self, table, obj):
        values = None
        query = "INSERT INTO %s " % table
        keys = obj.keys()
        values = obj.values()
        query += "(" + ",".join(["`%s`"] * len(keys)) %  tuple (keys) + ") VALUES (" + ",".join(["%s"]*len(values)) + ")"
        # if kwargs:
        #     keys = kwargs.keys()
        #     values = tuple(kwargs.values())
        #     query += "(" + ",".join(["`%s`"] * len(keys)) %  tuple (keys) + ") VALUES (" + ",".join(["%s"]*len(values)) + ")"
        # elif args:
        #     values = args
        #     query += " VALUES(" + ",".join(["%s"]*len(values)) + ")"

        self.__open()
        self.__session.execute(query, values)
        self.__connection.commit()
        self.__close()
        return self.__session.lastrowid
    ## End def insert

    def delete(self, table, where=None, *args):
        query = "DELETE FROM %s" % table
        if where:
            query += ' WHERE %s' % where

        values = tuple(args)

        self.__open()
        self.__session.execute(query, values)
        self.__connection.commit()

        # Obtain rows affected
        delete_rows = self.__session.rowcount
        self.__close()

        return delete_rows
    ## End def delete

    def run_raw_query(self, query):
        self.__open()
        self.__session.execute(query)
        self.__connection.commit()
        number_rows = self.__session.rowcount
        number_columns = len(self.__session.description)

        if number_rows >= 1 and number_columns > 1:
            result = [item for item in self.__session.fetchall()]
        else:
            result = [item[0] for item in self.__session.fetchall()]
        self.__close()
        return result
    def select_advanced(self, sql, *args):
        od = OrderedDict(args)
        query  = sql
        values = tuple(od.values())
        self.__open()
        self.__session.execute(query, values)
        number_rows = self.__session.rowcount
        number_columns = len(self.__session.description)

        if number_rows >= 1 and number_columns > 1:
            result = [item for item in self.__session.fetchall()]
        else:
            result = [item[0] for item in self.__session.fetchall()]

        self.__close()
        return result
    ## End def select_advanced
## End class
