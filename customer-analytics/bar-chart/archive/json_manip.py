#!/usr/bin/env python

import pandas as pd
import json
from collections import defaultdict
import numpy as np
import simplejson
from orderedset import OrderedSet

df = pd.read_csv('test1.csv')
yrs = df['yr'].unique()
df["MTH"] =  pd.Categorical(df['MTH'], ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
table = pd.pivot_table(df, index=['yr', 'ITEM_CLASS'], columns=['MTH'], aggfunc=np.sum)
table.to_json('file.json',orient='split')
chk2 = json.load(open('file.json'))

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


for  item in items:
    f1n =  'data' + str(item) + '.json'
    f2n = 'series' + str(item) + '.json'
    f1 = open(f1n, 'w')
    f2 = open(f2n, 'w')
    simplejson.dump(productDict[item], f1)
    simplejson.dump(seriesDict[item], f2)