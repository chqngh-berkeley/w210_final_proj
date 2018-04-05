
# if (!require('devtools')) install.packages('devtools',repos = "http://cran.us.r-project.org")
# install.packages("devtools", repos = "http://cran.us.r-project.org")
# if (!require('DBI')) devtools::install_github("r-dbi/DBI")
# if (!require('RMariaDB')) devtools::install_github("r-dbi/RMariaDB")
# if (!require('sqldf')) install.packages('sqldf',repos = "http://cran.us.r-project.org")
# if (!require('car')) install.packages('car',repos = "http://cran.us.r-project.org")
# if (!require('dplyr')) install.packages('dplyr',repos = "http://cran.us.r-project.org")

library(RMariaDB)
library(DBI)
library(sqldf)
# library(car)
library(dplyr)   #reordering rows in df

#* @get /train
train<- function() {
  username <- "root"
  host <- "0.0.0.0"
  dbname <- "FOOD_WASTE_CONSUMER_DB"
  con <- dbConnect(RMariaDB::MariaDB(), host = host, user = username, dbname = dbname, port= 3306)

  #get data from MariaDB
  user_profile <- dbGetQuery(con, "SELECT * FROM USER_PROFILE")
  data_no_date <- dbGetQuery(con, "SELECT * FROM USER_GROCERY_ITEM_WASTE_PRED")
  user_grocery_item_lookup <- dbGetQuery(con, "SELECT ITEM_ID, ITEM_NAME, ITEM_CATEGORY, ITEM_CLASS, ITEM_UNITS, ITEM_DURATION
                                         FROM USER_GROCERY_ITEM_WASTE_PRED
                                         GROUP BY ITEM_ID")
  new_receipts1 <- dbGetQuery(con, "SELECT * FROM USER_GROCERY_RECEIPT
                              WHERE RECEIPT_ID NOT IN (SELECT RECEIPT_ID FROM USER_GROCERY_ITEM_WASTE_PRED)")
  print("finished query...")
  print(user_profile)
  #edit new_receipts1 format
  if(nrow(new_receipts1) == 0){
    stop("No new receipts to add to model")
  } else {
  new_receipts1 <- subset(new_receipts1, select=c("USER_ID", "ITEM_ID", "ITEM_QTY_PRCH", "RECEIPT_ID", "ITEM_TOTAL_PRICE"))
  colnames(new_receipts1)[which(names(new_receipts1) == "ITEM_QTY_PRCH")] <- "ITEM_SIZE"
  new_receipts1$ITEM_QTY_PRCH = 1

  upc_codes <- c('030000320631', '077745247526', '812049006901', '012511446413', '226068004075', '894700010335',
                 '681131180467', '071464100056', '681131148344', '845963000021', '894700010052', '078742020532',
                 '037600736169', '028400152242', '894700010328', '707375034219', '260067017667', '0825926606410',
                 '845963000021', '850148003117')

  item_ids <- c(1050310, 870515, 1007195, 860776, 822407, 847989, 950118, 999104, 7024927,
                6979299, 889551, 885356, 844740, 821562, 889551, 12524588, 897306, 866211,
                6979299, 1081177)

  receipt_lookup <- data.frame(upc_codes, item_ids)

  new_receipts1 <- merge(new_receipts1, receipt_lookup, by.x = 'ITEM_ID', by.y = 'upc_codes')
  new_receipts1$ITEM_ID <- NULL
  colnames(new_receipts1)[which(names(new_receipts1) == "item_ids")] <- "ITEM_ID"

  #change datatypes
  user_profile$USER_ID <- as.integer(user_profile$USER_ID)
  user_profile$SHOP_TRIP_FREQ <- as.integer(user_profile$SHOP_TRIP_FREQ)
  data_no_date$USER_ID <-as.integer(data_no_date$USER_ID)
  data_no_date$RECEIPT_ID <-as.numeric(data_no_date$RECEIPT_ID)
  data_no_date$RECEIPT_UPLOAD_DT <-as.integer(data_no_date$RECEIPT_UPLOAD_DT)
  data_no_date$ITEM_ID <-as.integer(data_no_date$ITEM_ID)
  data_no_date$ITEM_NAME <-as.factor(data_no_date$ITEM_NAME)
  data_no_date$ITEM_QTY_PRCH <-as.integer(data_no_date$ITEM_QTY_PRCH)
  data_no_date$ITEM_UNITS <-as.factor(data_no_date$ITEM_UNITS)
  data_no_date$ITEM_CATEGORY <-as.factor(data_no_date$ITEM_CATEGORY)
  data_no_date$ITEM_CLASS <-as.factor(data_no_date$ITEM_CLASS)
  data_no_date$DAY <-as.integer(data_no_date$DAY)
  data_no_date$PREVIOUS_SHOP_DATE <-as.integer(data_no_date$PREVIOUS_SHOP_DATE)
  data_no_date$PREVIOUS_SHOP_SIZE <-as.integer(data_no_date$PREVIOUS_SHOP_SIZE)
  data_no_date$TIME_LOSS <-as.integer(data_no_date$TIME_LOSS)
  data_no_date$SHOPPING_RANK <-as.integer(data_no_date$SHOPPING_RANK)
  data_no_date$WASTE_AMT <-as.numeric(data_no_date$WASTE_AMT)
  data_no_date$ITEM_SIZE_ALL_STDEV <-as.numeric(data_no_date$ITEM_SIZE_ALL_STDEV)
  data_no_date$ITEM_SIZE_STDEV <-as.numeric(data_no_date$ITEM_SIZE_STDEV)
  user_grocery_item_lookup$ITEM_ID <- as.integer(user_grocery_item_lookup$ITEM_ID)
  user_grocery_item_lookup$ITEM_NAME <- as.factor(user_grocery_item_lookup$ITEM_NAME)
  user_grocery_item_lookup$ITEM_CATEGORY <- as.factor(user_grocery_item_lookup$ITEM_CATEGORY)
  user_grocery_item_lookup$ITEM_CLASS <- as.factor(user_grocery_item_lookup$ITEM_CLASS)
  user_grocery_item_lookup$ITEM_UNITS <- as.factor(user_grocery_item_lookup$ITEM_UNITS)
  user_grocery_item_lookup$ITEM_DURATION <- as.numeric(user_grocery_item_lookup$ITEM_DURATION)
  new_receipts1$USER_ID <-as.integer(new_receipts1$USER_ID)
  new_receipts1$ITEM_ID <-as.integer(new_receipts1$ITEM_ID)
  new_receipts1$ITEM_QTY_PRCH <-as.integer(new_receipts1$ITEM_QTY_PRCH)
  new_receipts1$RECEIPT_ID <-as.numeric(new_receipts1$RECEIPT_ID)
  new_receipts1$ITEM_TOTAL_PRICE <-as.integer(new_receipts1$ITEM_TOTAL_PRICE)

  DAY <- seq_len(731)
  date_converter <- data.frame(DAY)
  date_converter$CONVERTER_FIELD <- as.integer(date_converter$DAY - 717)
  date_converter$SHOPPING_DATE = Sys.Date() + date_converter$CONVERTER_FIELD

  data_complete = merge(data_no_date, date_converter, by = 'DAY')
  drop_converter = c('CONVERTER_FIELD')
  data_complete= data_complete[ , !(names(data_complete) %in% drop_converter)]

  #sAMPLE NEW RECEIPT BEING READ IN
  new_receipts1$SHOPPING_DATE = Sys.Date() - 5
  new_receipts1$DAY = date_converter$DAY[new_receipts1$SHOPPING_DATE == date_converter$SHOPPING_DATE]
  new_receipts1$ITEM_TOTAL_SIZE = new_receipts1$ITEM_SIZE * new_receipts1$ITEM_QTY_PRCH
  new_receipts1$WASTE_AMT = 0

  #Join Household_size
  user_family_count = sqldf('SELECT USER_ID, FAMILY_SIZE from user_profile')
  new_receipts2 = merge(new_receipts1, user_family_count, by = 'USER_ID')
  new_receipts2$PER_CAPITA_SIZE = new_receipts2$ITEM_TOTAL_SIZE / new_receipts2$FAMILY_SIZE

  #new_receipts3 is each an aggregation of each trip w/ per capita spend and size
  new_receipts3 = sqldf('SELECT USER_ID, DAY, sum(PER_CAPITA_SIZE)/FAMILY_SIZE as PER_CAPITA_SIZE_TRIP
                        FROM new_receipts2
                        GROUP BY USER_ID, DAY')
  #Purch_Trip_merge adds the data from trip_purch_Agg to the purchases
  new_receipts4 = merge(new_receipts2, new_receipts3, by = c('USER_ID', 'DAY'))
  item_duration = sqldf('SELECT ITEM_ID, ITEM_NAME, ITEM_CATEGORY, ITEM_CLASS, ITEM_DURATION from user_grocery_item_lookup')

  new_receipts5 = merge(new_receipts4, item_duration, by = 'ITEM_ID')

  #Getting Previous Shopping Data into new receipts
  #LAST SHOPPING SIZES AND DATES
  last_data = sqldf('SELECT USER_ID, DAY as PREV_DATE, PER_CAPITA_SIZE_TRIP as PREVIOUS_SHOP_SIZE FROM data_complete
                    WHERE SHOPPING_RANK == 1
                    GROUP BY USER_ID')

  new_receipts6 = merge(new_receipts5, last_data, by = 'USER_ID')
  new_receipts6$PREVIOUS_SHOP_DATE = new_receipts6$DAY - new_receipts6$PREV_DATE
  drops = 'PREV_DATE'
  new_receipts6 = new_receipts6[ , !(names(new_receipts6) %in% drops)]

  #At this point, we need to aggregate old and new data together to create new information on averages for items, global items, shopping patterns...etc
  #First Updating Average/Stdev/Z for Shopping Trip Patterns
  old_trip_stats = sqldf('SELECT USER_ID, DAY, PREVIOUS_SHOP_DATE, PER_CAPITA_SIZE_TRIP FROM data_complete
                         GROUP BY USER_ID, DAY')
  new_trip_stats = sqldf('SELECT USER_ID, DAY, PREVIOUS_SHOP_DATE, PER_CAPITA_SIZE_TRIP FROM new_receipts6
                         GROUP BY USER_ID, DAY')
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

  today = 717
  #Now we can merge_all_items
  new_receipts9$RECEIPT_UPLOAD_DT = Sys.Date()
  new_receipts9$ITEM_UNITS = 'oz'
  new_receipts9$SHOPPING_RANK = 0
  receipts = rbind(data_complete, new_receipts9)
  print("finished setting up receipts")
  #Reranking Shopping Rank
  #Creating Variables for Shopping Trips
  trip_rank_agg = sqldf('SELECT USER_ID, DAY
                        FROM receipts
                        GROUP BY USER_ID, DAY')
  #Removed PREVIOUS_SHOP_DATE, PREVIOUS_SHOP_SIZE, , PER_CAPITA_SIZE_TRIP, sum(WASTE_AMT*ITEM_TOTAL_SIZE/100) as LOSS_AMT,

  #FROM trip_aggr'))
  trip_ranker = trip_rank_agg %>% arrange(USER_ID) %>% group_by(USER_ID) %>% mutate(SHOPPING_RANK = rank(-DAY))
  drops_new = 'SHOPPING_RANK'
  receipts = receipts[ , !(names(receipts) %in% drops_new)]
  receipts_upd = merge(receipts, trip_ranker, by=c('USER_ID', 'DAY'))

  #Now that we have an updated data set, we need to recalc the data to make the list

  #whether an item purchased in last 30 days, last 90 days of 1 year ago
  receipts_upd$IN_30 = ifelse(Sys.Date() - receipts_upd$DAY <= 30, 1, 0)
  receipts_upd$IN_90 = ifelse(Sys.Date() - receipts_upd$DAY <= 90, 1, 0)
  receipts_upd$YEAR_AGO = ifelse(Sys.Date() - receipts_upd$DAY <= 365 &&
                                   Sys.Date() - receipts_upd$DAY >= 335, 1, 0)

  #Creating a database to predict how often someone buys items
  #Interim Steps to creating grocery lists
  #Need a stat for when someone last bought an item
  shop_trip_count = sqldf('SELECT USER_ID, count(distinct(DAY)) as SHOP_TRIP_COUNT FROM receipts_upd GROUP BY USER_ID')
  receipts2 = merge(receipts_upd, shop_trip_count, by = 'USER_ID')
  chance_of_purch_item = sqldf('SELECT USER_ID, ITEM_ID, ITEM_CATEGORY, ITEM_CLASS, max(DAY) as LAST_PURCH_DAY_ITEM,
                               count(DISTINCT(DAY)) as ITEM_TRIP_COUNT, SHOP_TRIP_COUNT,
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
  chance_of_purch_cat = sqldf('SELECT USER_ID, ITEM_CATEGORY, ITEM_CLASS, max(DAY) as LAST_PURCH_DAY_CAT, count(ITEM_CATEGORY) as
                              CAT_TOTAL_COUNT, count(DISTINCT(DAY)) as CAT_TRIP_COUNT, SHOP_TRIP_COUNT, avg(ITEM_SIZE) as
                              CAT_SIZE_AVG,
                              avg(ITEM_QTY_PRCH) as CAT_QTY_AVG
                              from receipts2
                              group by USER_ID, ITEM_CATEGORY, ITEM_CLASS')
  chance_of_purch_cat$CAT_PRCH_PERC = chance_of_purch_cat$CAT_TRIP_COUNT/chance_of_purch_cat$SHOP_TRIP_COUNT

  #Class Data
  chance_of_purch_class = sqldf('SELECT USER_ID, ITEM_CLASS, max(DAY) as LAST_PURCH_DAY_CLASS, count(ITEM_CATEGORY) as
                                CLASS_TOTAL_COUNT, count(DISTINCT(DAY)) as CLASS_TRIP_COUNT, SHOP_TRIP_COUNT
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

  #Whether items were purchased on last 5 days
  receipts5$LAST_TRIP = ifelse(receipts4$SHOPPING_RANK == 1, 1, 0)
  receipts5$SECOND_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 2, 1, 0)
  receipts5$THIRD_LAST_TRIP  = ifelse(receipts5$SHOPPING_RANK == 3, 1, 0)
  receipts5$FOURTH_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 4, 1, 0)
  receipts5$FIFTH_LAST_TRIP = ifelse(receipts5$SHOPPING_RANK == 5, 1, 0)

  receipts6 = sqldf('SELECT USER_ID, ITEM_ID, SUM(LAST_TRIP+SECOND_LAST_TRIP) AS SUM_2, SUM(LAST_TRIP+SECOND_LAST_TRIP+THIRD_LAST_TRIP +
                    FOURTH_LAST_TRIP + FIFTH_LAST_TRIP) AS SUM_5, MAX(IN_30) AS WITHIN_30, MAX(IN_90) AS WITHIN_90, MAX(YEAR_AGO) AS
                    ONE_YEAR_AGO  FROM receipts5 GROUP BY USER_ID, ITEM_ID')
  receipts7 = merge(receipts5, receipts6, by = c('USER_ID', 'ITEM_ID'))

  #Train a model
  #Train on all items. Using data_complete because data newly added has no expectation of loss data. Will use new receipt 5 data when using regression in new shopping list
  loss_prediction = lm(WASTE_AMT ~ ITEM_SIZE_Z + ITEM_SIZE_ALL_Z + FAMILY_SIZE + TIME_LOSS + PREV_Z + as.factor(ITEM_CATEGORY) + as.factor(USER_ID), data = subset(data_complete, (data_complete$DAY - today) < -3))

  model_parameters <- data.frame(names(coef(loss_prediction)), loss_prediction$coefficients)
  names(model_parameters) <- c("VARIABLE", "COEFFICIENTS")
  dbWriteTable(con, "MODEL_PARAMETERS", model_parameters, overwrite = TRUE)
  dbWriteTable(con, "MODEL_PARAMETERS_STAGING_TABLE", receipts7, overwrite = TRUE)
  dbWriteTable(con, "USER_GROCERY_ITEM_LOOKUP", user_grocery_item_lookup, overwrite = TRUE)
  print("Model Parameters Updated")
  }
  dbDisconnect(con)
}


#* @get /mean
normalMean <- function(samples=10){
  print(samples)
  data <- rnorm(samples)
  mean(data)
}
