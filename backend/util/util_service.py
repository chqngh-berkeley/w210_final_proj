#!/usr/bin/env python

import pandas as pd
import json, sys

from collections import defaultdict
import numpy as np
from orderedset import OrderedSet
class UtilService(object):
    def __init__(self):
        pass
    def testService(self):
        return "working"
    def getBarchartData(self, datum1, datum2):
        # data = json.dumps(datum1)
        df= pd.DataFrame(datum1)
        #df = pd.read_csv('test1.csv')
        #df = pd.read_json(json.loads(sys.argv[1]), orient='index')

        yrs = df['yr'].unique()
        df["MTH"] =  pd.Categorical(df['MTH'], ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
        table = pd.pivot_table(df, index=['yr', 'ITEM_CLASS'], columns=['MTH'], aggfunc=np.sum)
        json_str = table.to_json(orient='split') #table.to_json('file.json',orient='split')
        #print json_str
        chk2 = json.loads(json_str) #json.load(open('file.json'))

        yrs = OrderedSet([i[0] for i in chk2['index']])
        items = OrderedSet([i[1] for i in chk2['index']])
        metrics = OrderedSet([i[0] for i in chk2['columns']])
        mths = ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        indices = chk2['index']
        datum = chk2['data']
        cols = chk2['columns']
        cuts = [len(datum[0])/(len(metrics) - metrics.index(i)) for i in metrics]
        #print cuts

        productDict = {k:dict() for k in items}


        for i in yrs:
            for j in productDict.values():
                j[i] = []


        for i in metrics:
            for j in yrs:
                for k in items:
                    dataitems = [chk2['data'][z] for z in np.where(np.array(chk2['index']) == k)[0]]
                    data_for_metric = dataitems[yrs.index(j)][cuts[metrics.index(i)]-12:cuts[metrics.index(i)]]
                    productDict[k][j].append({"name":i, "data":[[mths[f],data_for_metric[f]] for f in range(len(data_for_metric))]})
        seriesDict = {k:[] for k in items}
        # print('did it get here?')
        for i in metrics:
            for j in items:
                dataitems = [chk2['data'][z] for z in np.where(np.array(chk2['index']) == j)[0]]
                #print dataitems
                seriesDict[j].append(
                {
                    "name" : i,
                    "data": [
                        { "name": l, "drilldown":True,
                        "y": round(sum([ float(f) for f in dataitems[yrs.index(l)][cuts[metrics.index(i)]-12:cuts[metrics.index(i)]] if f is not None]),2)} for l in yrs
                    ]
                })
        return json.dumps(productDict[datum2]), "-", json.dumps(seriesDict[datum2])
    def getStackedAreaChartData(self,datum1, datum2):
        # data = json.dumps(datum1)
        df= pd.DataFrame(datum1)
        #df = pd.read_csv('test1.csv')
        #df = pd.read_json(json.loads(sys.argv[1]), orient='index')
        yrs = df['yr'].unique()

        table = pd.pivot_table(df, values='WASTED_DOLLARS', index=['yr', 'ITEM_CLASS'], columns=['MTH'], aggfunc=np.sum)

        column_order = ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        table2 = table.reindex_axis(column_order, axis=1)

        json_str = table2.reset_index().to_json(orient='values')

        #print json_str
        chk2 = json.loads(json_str) #json.load(open('file.json'))

        #print chk2

        testDict = dict()
        for each in chk2:
            if each[0] not in testDict.keys():
                testDict[each[0]] = [{'name':each[1], 'data':each[2:]}]
                #print testDict[each[0]]
            else:
                testDict[each[0]].append({'name':each[1], 'data':each[2:]})

        #print testDict[datum2]
        # print json.dumps(testDict[datum2]), "-", json.dumps(column_order) #, json.dumps("Test"), json.dumps(productDict)
        # return testDict[datum2]
        return json.dumps(testDict[datum2]), "-", json.dumps(column_order)
    #print df
