#!/bin/bash
echo "RUNNING SQL SCRIPT";
mysql -h 0.0.0.0 -P 3306 -u root FOOD_WASTE_CONSUMER_DB < table_creation.sql;
