#!/bin/bash
echo "RUNNING SQL SCRIPT";
mysql -h 0.0.0.0 -P 3306 -u root FOOD_WASTE_CONSUMER_DB < table_creation.sql;
mysqlimport --ignore-lines=1 --fields-terminated-by=, --columns='USER_ID,USER_NM,USER_AGE,PASSWORD,FAMILY_SIZE,NUM_ADULTS,NUM_KIDS,ANNUAL_HOUSEHOLD_INCOME,SHOP_TRIP_FREQ' --host 0.0.0.0 --port 3306 -u root FOOD_WASTE_CONSUMER_DB /sql/USER_PROFILE.csv
mysqlimport --ignore-lines=1 --fields-terminated-by=, --columns='USER_ID,RECEIPT_ID,WASTE_DATA_ENTRY_DT,ITEM_ID,ITEM_NAME,ITEM_CATEGORY,ITEM_SIZE,ITEM_TOTAL_PRICE,WASTE_AMT,ITEM_UNITS' --host 0.0.0.0 --port 3306 -u root FOOD_WASTE_CONSUMER_DB /sql/USER_GROCERY_ITEM_WASTE_ACTUAL.csv
mysqlimport --ignore-lines=1 --fields-terminated-by=, --columns='USER_ID,RECEIPT_ID,RECEIPT_UPLOAD_DT,ITEM_ID,ITEM_NAME,ITEM_QTY_PRCH,ITEM_UNITS,ITEM_TOTAL_PRICE,ITEM_CATEGORY' --host 0.0.0.0 --port 3306 -u root FOOD_WASTE_CONSUMER_DB /sql/USER_GROCERY_RECEIPT.csv
# mysql -h 0.0.0.0 -P 3306 -u root FOOD_WASTE_CONSUMER_DB
