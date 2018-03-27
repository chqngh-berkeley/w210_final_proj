library(RMariaDB)
library(DBI)
library(sqldf)
library(car)
#library(plm)
#library(dlnm)
#library(tidyverse)    #Used for data_frame, which can store lists as columns
#library(nnet)    #for #multinom
#library(MASS)    #for #ordinal
#library(dplyr)   #reordering rows in df

username <- "root"
host <- "0.0.0.0"
dbname <- "FOOD_WASTE_CONSUMER_DB"
con <- dbConnect(RMariaDB::MariaDB(), host = host, user = username, dbname = dbname)

#get data from MariaDB 
user_profile <- dbGetQuery(con, "SELECT * FROM USER_PROFILE")
data_complete <- dbGetQuery(con, "SELECT * FROM USER_GROCERY_ITEM_WASTE_PRED")
user_grocery_item_lookup <- dbGetQuery(con, "SELECT * FROM USER_GROCERY_ITEM_LOOKUP")
new_receipts1 <- dbGetQuery(con, "SELECT * FROM SAMPLE_RECEIPTS")

#change datatypes
user_profile$USER_ID <- as.integer(user_profile$USER_ID)
data_complete$USER_ID <-as.integer(data_complete$USER_ID)
data_complete$RECEIPT_ID <-as.numeric(data_complete$RECEIPT_ID)
data_complete$RECEIPT_UPLOAD_DT <-as.integer(data_complete$RECEIPT_UPLOAD_DT)
data_complete$ITEM_ID <-as.integer(data_complete$ITEM_ID)
data_complete$ITEM_NAME <-as.factor(data_complete$ITEM_NAME)
data_complete$ITEM_QTY_PRCH <-as.integer(data_complete$ITEM_QTY_PRCH)
data_complete$ITEM_UNITS <-as.factor(data_complete$ITEM_UNITS)
data_complete$ITEM_CATEGORY <-as.factor(data_complete$ITEM_CATEGORY)
data_complete$ITEM_CLASS <-as.factor(data_complete$ITEM_CLASS)
data_complete$SHOPPING_DATE <-as.integer(data_complete$SHOPPING_DATE)
data_complete$PREVIOUS_SHOP_DATE <-as.integer(data_complete$PREVIOUS_SHOP_DATE)
data_complete$PREVIOUS_SHOP_SIZE <-as.integer(data_complete$PREVIOUS_SHOP_SIZE)
data_complete$TIME_LOSS <-as.integer(data_complete$TIME_LOSS)
data_complete$SHOPPING_RANK <-as.integer(data_complete$SHOPPING_RANK)
user_grocery_item_lookup$ITEM_ID <- as.integer(user_grocery_item_lookup$ITEM_ID)
user_grocery_item_lookup$ITEM_NAME <- as.factor(user_grocery_item_lookup$ITEM_NAME)
user_grocery_item_lookup$ITEM_CATEGORY <- as.factor(user_grocery_item_lookup$ITEM_CATEGORY)
user_grocery_item_lookup$ITEM_CLASS <- as.factor(user_grocery_item_lookup$ITEM_CLASS)
user_grocery_item_lookup$ITEM_UNITS <- as.factor(user_grocery_item_lookup$ITEM_UNITS)
new_receipts1$USER_ID <-as.integer(new_receipts1$USER_ID)
new_receipts1$ITEM_ID <-as.integer(new_receipts1$ITEM_ID)
new_receipts1$ITEM_QTY_PRCH <-as.integer(new_receipts1$ITEM_QTY_PRCH)
new_receipts1$SHOPPING_DATE <-as.integer(new_receipts1$SHOPPING_DATE)
new_receipts1$RECEIPT_ID <-as.numeric(new_receipts1$RECEIPT_ID)
new_receipts1$ITEM_TOTAL_PRICE <-as.integer(new_receipts1$ITEM_TOTAL_PRICE)

#sAMPLE NEW RECEIPT BEING READ IN
new_receipts1$ITEM_TOTAL_SIZE = new_receipts1$ITEM_SIZE * new_receipts1$ITEM_QTY_PRCH
new_receipts1$WASTE_AMT = 0

#Join Household_size
user_family_count = sqldf('SELECT USER_ID, FAMILY_SIZE from user_profile')
new_receipts2 = merge(new_receipts1, user_family_count, by = 'USER_ID')
new_receipts2$PER_CAPITA_SIZE = new_receipts2$ITEM_TOTAL_SIZE / new_receipts2$FAMILY_SIZE

#new_receipts3 is each an aggregation of each trip w/ per capita spend and size
new_receipts3 = sqldf('SELECT USER_ID, SHOPPING_DATE, sum(PER_CAPITA_SIZE)/FAMILY_SIZE as PER_CAPITA_SIZE_TRIP
                      FROM new_receipts2
                      GROUP BY USER_ID, SHOPPING_DATE')

#Purch_Trip_merge adds the data from trip_purch_Agg to the purchases
new_receipts4 = merge(new_receipts2, new_receipts3, by = c('USER_ID', 'SHOPPING_DATE'))
item_duration = sqldf('SELECT ITEM_ID, ITEM_NAME, ITEM_CATEGORY, ITEM_CLASS, ITEM_DURATION from user_grocery_item_lookup')

new_receipts5 = merge(new_receipts4, item_duration, by = 'ITEM_ID')

#Getting Previous Shopping Data into new receipts
#LAST SHOPPING SIZES AND DATES
last_data = sqldf('SELECT USER_ID, SHOPPING_DATE as PREV_DATE, PER_CAPITA_SIZE_TRIP as PREVIOUS_SHOP_SIZE FROM data_complete 
                  WHERE SHOPPING_RANK == 1
                  GROUP BY USER_ID')

new_receipts6 = merge(new_receipts5, last_data, by = 'USER_ID')
new_receipts6$PREVIOUS_SHOP_DATE = new_receipts6$SHOPPING_DATE - new_receipts6$PREV_DATE
drops = 'PREV_DATE'
new_receipts6 = new_receipts6[ , !(names(new_receipts6) %in% drops)]

#At this point, we need to aggregate old and new data together to create new information on averages for items, global items, shopping patterns...etc
#First Updating Average/Stdev/Z for Shopping Trip Patterns
old_trip_stats = sqldf('SELECT USER_ID, SHOPPING_DATE, PREVIOUS_SHOP_DATE, PER_CAPITA_SIZE_TRIP FROM data_complete
                       GROUP BY USER_ID, SHOPPING_DATE')
new_trip_stats = sqldf('SELECT USER_ID, SHOPPING_DATE, PREVIOUS_SHOP_DATE, PER_CAPITA_SIZE_TRIP FROM new_receipts6
                       GROUP BY USER_ID, SHOPPING_DATE')
all_trip_stats = rbind(old_trip_stats, new_trip_stats)
all_trip_stats_agg = sqldf('SELECT USER_ID, avg(PREVIOUS_SHOP_DATE) as DAYS_BETWEEN_AVG, stdev(PREVIOUS_SHOP_DATE) as DAYS_BETWEEN_STDEV, avg(PER_CAPITA_SIZE_TRIP) as TRIP_SIZE_AVG, stdev(PER_CAPITA_SIZE_TRIP) as TRIP_SIZE_STDEV
                           FROM all_trip_stats
                           GROUP BY USER_ID')

new_receipts7 = merge(new_receipts6, all_trip_stats_agg, by = 'USER_ID')


new_receipts7$PREV_SIZE_Z = (new_receipts7$PREVIOUS_SHOP_SIZE-new_receipts7$TRIP_SIZE_AVG)/new_receipts7$TRIP_SIZE_STDEV
new_receipts7$PREV_DATE_Z = (new_receipts7$PREVIOUS_SHOP_DATE-new_receipts7$DAYS_BETWEEN_AVG)/new_receipts7$DAYS_BETWEEN_STDEV
#PREV_SIZE_Z up, loss up. PREV_DATE_Z up (assuming same PREV_SIZE_Z) loss down.
new_receipts7$PREV_Z = new_receipts7$PREV_SIZE_Z - new_receipts7$PREV_DATE_Z

#Now to deal with Comparing Item Average Sizes to Personal and Global Patterns
old_item_stats = sqldf('SELECT USER_ID, ITEM_ID, ITEM_CATEGORY, PER_CAPITA_SIZE FROM data_complete')
new_item_stats = sqldf('SELECT USER_ID, ITEM_ID, ITEM_CATEGORY, PER_CAPITA_SIZE FROM data_complete')
all_item_stats = rbind(old_item_stats, new_item_stats)

item_avg_size = sqldf('SELECT USER_ID, ITEM_CATEGORY, AVG(PER_CAPITA_SIZE) as ITEM_SIZE_AVG, STDEV(PER_CAPITA_SIZE) as ITEM_SIZE_STDEV
                      FROM all_item_stats
                      GROUP BY USER_ID, ITEM_CATEGORY')
new_receipts8 = merge(new_receipts7, item_avg_size, by = c('USER_ID', 'ITEM_CATEGORY'))
new_receipts8$ITEM_SIZE_Z = (new_receipts8$PER_CAPITA_SIZE - new_receipts8$ITEM_SIZE_AVG) / new_receipts8$ITEM_SIZE_STDEV
new_receipts8$ITEM_SIZE_Z[is.na(new_receipts8$ITEM_SIZE_Z)] = 0
new_receipts8$ITEM_SIZE_Z[new_receipts8$ITEM_SIZE_Z == -Inf] = 0
new_receipts8$ITEM_SIZE_Z[new_receipts8$ITEM_SIZE_Z == Inf] = 0

#Global
item_all_avg_size = sqldf('SELECT ITEM_CATEGORY, AVG(PER_CAPITA_SIZE) as ITEM_SIZE_ALL_AVG, STDEV(PER_CAPITA_SIZE) as ITEM_SIZE_ALL_STDEV
                          FROM all_item_stats
                          GROUP BY ITEM_CATEGORY')
new_receipts9 = merge(new_receipts8, item_all_avg_size, by = 'ITEM_CATEGORY')
new_receipts9$ITEM_SIZE_ALL_Z = (new_receipts9$PER_CAPITA_SIZE - new_receipts9$ITEM_SIZE_ALL_AVG) / new_receipts9$ITEM_SIZE_ALL_STDEV
new_receipts9$ITEM_SIZE_ALL_Z[is.na(new_receipts9$ITEM_SIZE_ALL_Z)] = 0
new_receipts9$ITEM_SIZE_ALL_Z[new_receipts9$ITEM_SIZE_ALL_Z == -Inf] = 0
new_receipts9$ITEM_SIZE_ALL_Z[new_receipts9$ITEM_SIZE_ALL_Z == Inf] = 0

#Adding in duration loss stats
new_receipts9$TIME_LOSS_COUNTER = ifelse(new_receipts9$PREVIOUS_SHOP_DATE - new_receipts9$ITEM_DURATION < 0, 0, 
                                         new_receipts9$PREVIOUS_SHOP_DATE - new_receipts9$ITEM_DURATION)
new_receipts9$TIME_LOSS = ifelse(new_receipts9$TIME_LOSS_COUNTER == 0, 0, 
                                 ifelse(new_receipts9$TIME_LOSS_COUNTER < 15, new_receipts9$TIME_LOSS_COUNTER * 2, 30))

day = 712
#Now we can merge_all_items
new_receipts9$RECEIPT_UPLOAD_DT = day
new_receipts9$ITEM_UNITS = 'oz'
new_receipts9$SHOPPING_RANK = 0
print(!names(data_complete) %in% names(new_receipts9))
print(names(data_complete))
receipts = rbind(data_complete, new_receipts9)

#Reranking Shopping Rank
#Creating Variables for Shopping Trips
trip_rank_agg = sqldf('SELECT USER_ID, SHOPPING_DATE 
                      FROM receipts
                      GROUP BY USER_ID, SHOPPING_DATE')
#Removed PREVIOUS_SHOP_DATE, PREVIOUS_SHOP_SIZE, , PER_CAPITA_SIZE_TRIP, sum(WASTE_AMT*ITEM_TOTAL_SIZE/100) as LOSS_AMT,

#FROM trip_aggr'))
trip_ranker = trip_rank_agg %>% arrange(USER_ID) %>% group_by(USER_ID) %>% mutate(SHOPPING_RANK = rank(-SHOPPING_DATE))
drops_new = 'SHOPPING_RANK'
receipts = receipts[ , !(names(receipts) %in% drops_new)]
receipts_upd = merge(receipts, trip_ranker, by=c('USER_ID', 'SHOPPING_DATE'))

#Now that we have an updated data set, we need to recalc the data to make the list
#This includes
#Whether item bought on last 1-5 trips
current_day = 712

#whether an item purchased in last 30 days, last 90 days of 1 year ago
receipts_upd$within_30 = ifelse(current_day - receipts_upd$SHOPPING_DATE <= 30, 1, 0)
receipts_upd$within_90 = ifelse(current_day - receipts_upd$SHOPPING_DATE <= 90, 1, 0)
receipts_upd$one_year_ago = ifelse(current_day - receipts_upd$SHOPPING_DATE <= 365 && 
                                     current_day - receipts_upd$SHOPPING_DATE >= 305, 1, 0)

#Creating a database to predict how often someone buys items
#Interim Steps to creating grocery lists
#Need a stat for when someone last bought an item
shop_trip_count = sqldf('SELECT USER_ID, count(distinct(SHOPPING_DATE)) as SHOP_TRIP_COUNT FROM receipts_upd GROUP BY USER_ID')
receipts2 = merge(receipts_upd, shop_trip_count, by = 'USER_ID')
chance_of_purch_item = sqldf('SELECT USER_ID, ITEM_ID, ITEM_CATEGORY, ITEM_CLASS, max(SHOPPING_DATE) as LAST_PURCH_DAY_ITEM, 
                             count(DISTINCT(SHOPPING_DATE)) as ITEM_TRIP_COUNT, SHOP_TRIP_COUNT, 
                             ITEM_SIZE_AVG, avg(ITEM_QTY_PRCH) as ITEM_QTY_AVG 
                             from receipts2
                             group by USER_ID, ITEM_ID')
chance_of_purch_item$ITEM_PRCH_PERC = chance_of_purch_item$ITEM_TRIP_COUNT/chance_of_purch_item$SHOP_TRIP_COUNT

#Creating Ranks for recency and frequency to use in choosing items for the grocery list
item_freq_ranked = chance_of_purch_item %>% arrange(USER_ID, ITEM_CATEGORY) %>% group_by(USER_ID, ITEM_CATEGORY) %>% mutate(ITEM_FREQ_RANKED = rank(-ITEM_PRCH_PERC, ties.method="min"))
item_recency_ranked = chance_of_purch_item %>% arrange(USER_ID, ITEM_CATEGORY) %>% group_by(USER_ID, ITEM_CATEGORY) %>% mutate(ITEM_RECENCY_RANKED = rank(-LAST_PURCH_DAY_ITEM, ties.method="min"))

item_freq_ranked$ITEM_RECENCY_RANKED = item_recency_ranked$ITEM_RECENCY_RANKED[item_freq_ranked$USER_ID == item_recency_ranked$USER_ID &&
                                                                                 item_freq_ranked$ITEM_ID == item_recency_ranked$ITEM_ID]
#Category Data
chance_of_purch_cat = sqldf('SELECT USER_ID, ITEM_CATEGORY, ITEM_CLASS, max(SHOPPING_DATE) as LAST_PURCH_DAY_CAT, count(ITEM_CATEGORY) as 
                            CAT_TOTAL_COUNT, count(DISTINCT(SHOPPING_DATE)) as CAT_TRIP_COUNT, SHOP_TRIP_COUNT, avg(ITEM_SIZE) as 
                            CAT_SIZE_AVG, 
                            avg(ITEM_QTY_PRCH) as CAT_QTY_AVG 
                            from receipts2
                            group by USER_ID, ITEM_CATEGORY, ITEM_CLASS')
chance_of_purch_cat$CAT_PRCH_PERC = chance_of_purch_cat$CAT_TRIP_COUNT/chance_of_purch_cat$SHOP_TRIP_COUNT

#Class Data
chance_of_purch_class = sqldf('SELECT USER_ID, ITEM_CLASS, max(SHOPPING_DATE) as LAST_PURCH_DAY_CLASS, count(ITEM_CATEGORY) as 
                              CLASS_TOTAL_COUNT, count(DISTINCT(SHOPPING_DATE)) as CLASS_TRIP_COUNT, SHOP_TRIP_COUNT
                              from receipts2
                              group by USER_ID, ITEM_CLASS')
chance_of_purch_class$CLASS_PRCH_PERC = chance_of_purch_class$CLASS_TRIP_COUNT/chance_of_purch_class$SHOP_TRIP_COUNT

#Creating Descr rank variables
cat_freq_ranked = chance_of_purch_cat %>% arrange(USER_ID, ITEM_CLASS) %>% group_by(USER_ID, ITEM_CLASS) %>% mutate(CAT_FREQ_RANKED = 
                                                                                                                      rank(-CAT_PRCH_PERC, ties.method="min"))
cat_recency_ranked = chance_of_purch_cat %>% arrange(USER_ID, ITEM_CLASS) %>% group_by(USER_ID, ITEM_CLASS) %>% mutate(CAT_RECENCY_RANKED =
                                                                                                                         rank(-LAST_PURCH_DAY_CAT, ties.method="min"))
cat_freq_ranked$CAT_RECENCY_RANKED = cat_recency_ranked$CAT_RECENCY_RANKED[cat_freq_ranked$USER_ID == cat_recency_ranked$USER_ID &&
                                                                             cat_freq_ranked$ITEM_CATEGORY == cat_recency_ranked$ITEM_CATEGORY]
#Merging all this data back
drops3 = c('SHOP_TRIP_COUNT', 'ITEM_SIZE_AVG')
item_recency_ranked = item_recency_ranked[ , !(names(item_recency_ranked) %in% drops3)]
receipts3 = merge(receipts2, item_freq_ranked, by = c('USER_ID', 'ITEM_ID', 'ITEM_CATEGORY', 'ITEM_CLASS', 'ITEM_SIZE_AVG'))
receipts4 = merge(receipts3, cat_freq_ranked, by=c('USER_ID', 'ITEM_CLASS', 'ITEM_CATEGORY'))
receipts5 = merge(receipts4, chance_of_purch_class, by = c('USER_ID', 'ITEM_CLASS', 'SHOP_TRIP_COUNT'))
receipts5$LAST_TRIP = ifelse(receipts4$SHOPPING_RANK == 1, 1, 0)
receipts5$SECOND_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 2, 1, 0)
receipts5$THIRD_LAST_TRIP  = ifelse(receipts5$SHOPPING_RANK == 3, 1, 0)
receipts5$FOURTH_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 4, 1, 0)
receipts5$FIFTH_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 5, 1, 0)

#Train a model
#Train on all items. Using data_complete because data newly added has no expectation of loss data. Will use new receipt 5 data when using regression in new shopping list
loss_prediction = lm(WASTE_AMT ~ ITEM_SIZE_Z + ITEM_SIZE_ALL_Z + FAMILY_SIZE + TIME_LOSS + PREV_Z + as.factor(ITEM_CATEGORY) + as.factor(USER_ID), data = data_complete)

model_parameters <- data.frame(names(coef(loss_prediction)), loss_prediction$coefficients)
names(model_parameters) <- c("VARIABLE", "COEFFICIENTS")
dbWriteTable(con, "MODEL_PARAMETERS", model_parameters, overwrite = TRUE)
dbDisconnect(con)

