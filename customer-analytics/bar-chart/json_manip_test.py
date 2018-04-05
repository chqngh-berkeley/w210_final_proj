#!/usr/bin/env python

import pandas as pd
import json, sys

from collections import defaultdict
import numpy as np
import simplejson
from orderedset import OrderedSet

try:
	#datum =  eval(sys.argv[1])[0]
	datum1 = json.loads(sys.argv[1])
	datum2 = sys.argv[2]
	#print datum2

except:
	print "Something went wrong!!"

data = json.dumps(datum1)
df= pd.read_json(data)
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

for i in metrics:
    for j in items:
        dataitems = [chk2['data'][z] for z in np.where(np.array(chk2['index']) == j)[0]]
        #print dataitems
        seriesDict[j].append({"name" : i, "data": [{"name": l, "drilldown":True, "y": round(sum([ f for f in dataitems[yrs.index(l)][cuts[metrics.index(i)]-12:cuts[metrics.index(i)]] if f is not None]),2)} for l in yrs]})


#for  item in items:
#    f1n =  'data' + str(item) + '.json'
#    f2n = 'series' + str(item) + '.json'
#    f1 = open(f1n, 'w')
#    f2 = open(f2n, 'w')
#    simplejson.dump(productDict[item], f1)
#    simplejson.dump(seriesDict[item], f2)

print json.dumps(productDict[datum2]), "-", json.dumps(seriesDict[datum2]) #, json.dumps("Test"), json.dumps(productDict)


#print df
