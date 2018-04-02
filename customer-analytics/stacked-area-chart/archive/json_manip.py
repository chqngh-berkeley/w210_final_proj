#!/usr/bin/env python

import pandas as pd
import json
from collections import defaultdict
import numpy as np
import simplejson

df = pd.read_csv('test1.csv')
yrs = df['yr'].unique()

table = pd.pivot_table(df, values='WASTED_DOLLARS', index=['yr', 'ITEM_CLASS'], columns=['MTH'], aggfunc=np.sum)

column_order = ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

table2 = table.reindex_axis(column_order, axis=1)

table2.reset_index().to_json('file.json',orient='values')

chk2 = json.load(open('file.json'))

testDict = dict()
for each in chk2:
    if each[0] not in testDict.keys():
        testDict[each[0]] = [{'name':each[1], 'data':each[2:]}]
        #print testDict[each[0]]
    else:
        testDict[each[0]].append({'name':each[1], 'data':each[2:]})


for  yr in yrs:
	finalDict = testDict[yr]
	f1n =  'data' + str(yr) + '.json'
	f1 = open(f1n, 'w')
	simplejson.dump(finalDict, f1)

f2 = open('axis.json', 'w')	
simplejson.dump(column_order, f2)
