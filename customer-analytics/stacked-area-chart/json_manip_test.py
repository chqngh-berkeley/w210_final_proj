#!/usr/bin/env python

import pandas as pd
import json, sys

from collections import defaultdict
import numpy as np
import simplejson

try:
	#datum =  eval(sys.argv[1])[0]
	datum1 = json.loads(sys.argv[1])
	datum2 = int(sys.argv[2])
	#print datum2

except:
	print "Something went wrong!!"

data = json.dumps(datum1)
df= pd.read_json(data)
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
print json.dumps(testDict[datum2]), "-", json.dumps(column_order) #, json.dumps("Test"), json.dumps(productDict)


#print df
