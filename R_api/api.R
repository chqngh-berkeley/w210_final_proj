library(RMariaDB)
library(DBI)
library(sqldf)
# library(car)
library(dplyr)   #reordering rows in df


#
# cors <- function(res) {
#     res$setHeader("Access-Control-Allow-Origin", "*")
#     res$setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS')
#     plumber::forward()
# }

#* @options /train
#* @get /train
train<- function() {
  username <- "root"
  host <- "db"
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
  print("finished setting up Ranks")
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
  print("finished setting up Class")
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
  print("finished setting up all receipts")
  #Train a model
  #Train on all items. Using data_complete because data newly added has no expectation of loss data. Will use new receipt 5 data when using regression in new shopping list
  loss_prediction = lm(WASTE_AMT ~ ITEM_SIZE_Z + ITEM_SIZE_ALL_Z + FAMILY_SIZE + TIME_LOSS + PREV_Z + as.factor(ITEM_CATEGORY) + as.factor(USER_ID), data = subset(data_complete, (data_complete$DAY - today) < -3))
  print("finished setting up training")
  model_parameters <- data.frame(names(coef(loss_prediction)), loss_prediction$coefficients)
  names(model_parameters) <- c("VARIABLE", "COEFFICIENTS")
  dbWriteTable(con, "MODEL_PARAMETERS", model_parameters, overwrite = TRUE)
  dbWriteTable(con, "MODEL_PARAMETERS_STAGING_TABLE", receipts7, overwrite = TRUE)
  dbWriteTable(con, "USER_GROCERY_ITEM_LOOKUP", user_grocery_item_lookup, overwrite = TRUE)
  print("Model Parameters Updated")
  }
  dbDisconnect(con)
}

#* @options /predict
#* @post /predict
predict <- function(user_id, waste_threshold) {
  username <- "root"
  host <- "db"
  dbname <- "FOOD_WASTE_CONSUMER_DB"
  con <- dbConnect(RMariaDB::MariaDB(), host = host, user = username, dbname = dbname)

  # args = commandArgs(trailingOnly=TRUE)
  current_date = 717 #need to make not a static variable

  #get data from MariaDB
  intercept <- dbGetQuery(con, "SELECT * FROM MODEL_PARAMETERS LIMIT 1")
  numeric_parameters <- dbGetQuery(con, "SELECT * FROM MODEL_PARAMETERS LIMIT 1,5")
  item_category_parameters <- dbGetQuery(con, "SELECT REPLACE(VARIABLE, 'as.factor(ITEM_CATEGORY)', ''), COEFFICIENTS FROM MODEL_PARAMETERS WHERE VARIABLE LIKE '%ITEM_CATEGORY%'")
  user_category_parameters <- dbGetQuery(con, "SELECT REPLACE(VARIABLE, 'as.factor(USER_ID)', ''), COEFFICIENTS FROM MODEL_PARAMETERS WHERE VARIABLE LIKE '%USER_ID%'")
  names(item_category_parameters) <- c("ITEM_CATEGORY", "ITEM_CATEGORY_COEF")
  names(user_category_parameters) <- c("USER_ID", "USER_ID_COEF")

  sqlquery <- paste("SELECT * FROM MODEL_PARAMETERS_STAGING_TABLE WHERE USER_ID = ",  as.character(user_id))
  household_purch <- dbGetQuery(con, sqlquery)

  #change datatypes
  household_purch$ITEM_CLASS <- as.factor(household_purch$ITEM_CLASS)
  household_purch$ITEM_CATEGORY <- as.factor(household_purch$ITEM_CATEGORY)
  household_purch$ITEM_NAME <- as.factor(household_purch$ITEM_NAME)
  item_category_parameters$ITEM_CATEGORY <- as.factor(item_category_parameters$ITEM_CATEGORY)
  user_category_parameters$USER_ID <- as.factor(user_category_parameters$USER_ID)

  #######
  last_size = unique(household_purch$PER_CAPITA_SIZE_TRIP[household_purch$SHOPPING_RANK == 1])
  last_date = unique(household_purch$DAY[household_purch$SHOPPING_RANK == 1])

  user_list_prep = sqldf('SELECT USER_ID, FAMILY_SIZE, ITEM_ID, DAY, ITEM_CATEGORY, ITEM_CLASS, ITEM_PRCH_PERC, CAT_PRCH_PERC, CLASS_PRCH_PERC, ITEM_FREQ_RANKED, ITEM_RECENCY_RANKED, CAT_FREQ_RANKED, CAT_RECENCY_RANKED, ITEM_SIZE_AVG, ITEM_QTY_AVG, LAST_PURCH_DAY_ITEM, ITEM_SIZE_STDEV, ITEM_SIZE_ALL_AVG, ITEM_SIZE_ALL_STDEV, TRIP_SIZE_AVG, TRIP_SIZE_STDEV, current_date as CURRENT_DAY, DAYS_BETWEEN_AVG, DAYS_BETWEEN_STDEV, ITEM_DURATION, PREVIOUS_SHOP_DATE, MAX(LAST_TRIP) as LAST_TRIP, SUM_2, SUM_5, WITHIN_90, ONE_YEAR_AGO
                         FROM household_purch
                         GROUP BY ITEM_ID')
  user_list_prep$PREVIOUS_SHOP_SIZE = last_size
  user_list_prep$PREVIOUS_SHOP_DATE = ifelse(current_date - last_date > 4 * unique(household_purch$DAYS_BETWEEN_AVG), 4 * unique(household_purch$DAYS_BETWEEN_AVG), current_date - last_date)

  shopping_list = data_frame(USER_ID = integer(), FAMILY_SIZE = integer(), ITEM_ID = integer(), ITEM_CATEGORY = character(), ITEM_CLASS =
                               character(), FIRST_SIZE=numeric(), ITEM_SIZE=numeric(), ITEM_TRUE_SIZE = numeric(), ITEM_TOTAL_SIZE =
                               numeric(), ITEM_SIZE_AVG=numeric(), ITEM_SIZE_STDEV=numeric(), ITEM_SIZE_Z = numeric(), ITEM_SIZE_ALL_AVG =
                               numeric(), ITEM_SIZE_ALL_STDEV=numeric(), ITEM_SIZE_ALL_Z = numeric(), ITEM_QTY_PRCH = integer(),
                             PREVIOUS_SHOP_DATE = integer(), DAYS_BETWEEN_AVG = numeric(), DAYS_BETWEEN_STDEV = numeric(), PREV_DATE_Z =
                               integer(), PREVIOUS_SHOP_SIZE = numeric(), TRIP_SIZE_AVG = numeric(), TRIP_SIZE_STDEV = numeric(), PREV_SIZE_Z =
                               numeric(), PREV_Z = numeric(), TIME_LOSS_COUNTER = integer(), TIME_LOSS = integer(), ITEM_FREQ_RANKED =
                               integer(), CAT_FREQ_RANKED = integer(), MARKER = integer(), SECTION = character())

  #First Model- Binomial model to predict full use (then remove these from data set and merge these in with the others later)
  #cull_negative = function(df){
  #  df = subset(df, df$prediction[x] > 0)
  #  culled = subset(df, df$prediction[x] <= 0)
  #

  tolerance_check = function(df, tolerance){
    repeat{
      for (x in 1:nrow(df)){
        if (df$prediction[x] > tolerance & df$ITEM_SIZE[x] > 2){
          df$ITEM_SIZE[x] = df$ITEM_SIZE[x] * 0.9
          df$ITEM_SIZE_Z[x] = (df$ITEM_SIZE[x] -
                                 df$ITEM_SIZE_AVG[x]) /
            df$ITEM_SIZE_STDEV[x]
          df$ITEM_SIZE_Z[is.na(df$ITEM_SIZE_Z)] = 0
          df$ITEM_SIZE_Z[df$ITEM_SIZE_Z == -Inf] = 0
          df$ITEM_SIZE_Z[df$ITEM_SIZE_Z == Inf] = 0
          df$ITEM_SIZE_ALL_Z[x] = (df$ITEM_SIZE[x] -
                                     df$ITEM_SIZE_ALL_AVG[x]) /
            df$ITEM_SIZE_ALL_STDEV[x]
          df$ITEM_SIZE_ALL_Z[is.na(df$ITEM_SIZE_ALL_Z)] = 0
          df$ITEM_SIZE_ALL_Z[df$ITEM_SIZE_ALL_Z == -Inf] = 0
          df$ITEM_SIZE_ALL_Z[df$ITEM_SIZE_ALL_Z == Inf] = 0
          df$ITEM_TRUE_SIZE[x] = df$ITEM_SIZE[x] * df$FAMILY_SIZE[x]
          df$ITEM_TOTAL_SIZE[x] = df$ITEM_SIZE[x] * df$ITEM_QTY_PRCH[x]
        }
      }
      df$prediction = intercept$COEFFICIENTS +
        numeric_parameters$COEFFICIENTS[1] * df$ITEM_SIZE_Z +
        numeric_parameters$COEFFICIENTS[2] * df$ITEM_SIZE_ALL_Z +
        numeric_parameters$COEFFICIENTS[3] * df$FAMILY_SIZE +
        numeric_parameters$COEFFICIENTS[4] * df$TIME_LOSS +
        numeric_parameters$COEFFICIENTS[5] * df$PREV_Z +
        df$ITEM_CATEGORY_COEF +
        df$USER_ID_COEF

      if (any(df$prediction > tolerance & df$ITEM_SIZE > 2)){
      } else {
        break
      }
    }
    return(df)
  }

  new_list = function(df, today, tolerance){
    for (x in 1:length(unique(df$ITEM_ID))){     ###number of items in database? How to best iterate over this))
      product_temp = unique(df$ITEM_ID)[x]
      main_count = nrow(shopping_list) + 1

      if ((df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_ID[df$ITEM_ID == product_temp] %in%
           unique(df$ITEM_ID[df$LAST_TRIP == 1])) |
          (df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5) |
          (df$SUM_2[df$ITEM_ID == product_temp] == 2) |
          (df$SUM_5[df$ITEM_ID == product_temp] >= 3) |
          (df$CAT_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1) |
          (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5 & df$CAT_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1 &
           df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1) |
          (df$CAT_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_FREQ_RANKED[df$ITEM_ID == product_temp] == 1) |
          (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5 & df$CAT_FREQ_RANKED[df$ITEM_ID == product_temp] == 1 &
           df$ITEM_FREQ_RANKED[df$ITEM_ID == product_temp] == 1) |
          (df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] <= 0.25 & df$ITEM_ID[df$ITEM_ID == product_temp] %in%
           unique(df$ITEM_ID[df$LAST_TRIP == 1])) |
          (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.15 & df$CAT_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1 &
           df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1) |
          (df$ONE_YEAR_AGO[df$ITEM_ID == product_temp] == 1 & df$WITHIN_90[df$ITEM_ID == product_temp] == 0)){

        shopping_list[main_count,]$USER_ID = unique(df$USER_ID)
        shopping_list[main_count,]$FAMILY_SIZE = unique(df$FAMILY_SIZE)
        shopping_list[main_count,]$ITEM_ID = product_temp
        shopping_list[main_count,]$ITEM_CATEGORY = as.character(df$ITEM_CATEGORY[df$ITEM_ID == product_temp])
        shopping_list[main_count,]$ITEM_CLASS = as.character(df$ITEM_CLASS[df$ITEM_ID == product_temp])
        shopping_list[main_count,]$FIRST_SIZE = df$ITEM_SIZE_AVG[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_SIZE = df$ITEM_SIZE_AVG[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_TRUE_SIZE = df$ITEM_SIZE_AVG[df$ITEM_ID == product_temp] * shopping_list[main_count,]$FAMILY_SIZE
        shopping_list[main_count,]$ITEM_QTY_PRCH = as.integer(df$ITEM_QTY_AVG[df$ITEM_ID == product_temp])
        shopping_list[main_count,]$ITEM_TOTAL_SIZE = shopping_list[main_count,]$ITEM_TRUE_SIZE * shopping_list[main_count,]$ITEM_QTY_PRCH
        shopping_list[main_count,]$ITEM_SIZE_AVG = df$ITEM_SIZE_AVG[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_SIZE_STDEV = df$ITEM_SIZE_STDEV[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_SIZE_Z = (shopping_list[main_count,]$ITEM_SIZE -
                                                    shopping_list[main_count,]$ITEM_SIZE_AVG) /
          shopping_list[main_count,]$ITEM_SIZE_STDEV
        shopping_list[main_count,]$ITEM_SIZE_ALL_AVG = df$ITEM_SIZE_ALL_AVG[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_SIZE_ALL_STDEV = df$ITEM_SIZE_ALL_STDEV[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$ITEM_SIZE_ALL_Z = (shopping_list[main_count,]$ITEM_SIZE -
                                                        shopping_list[main_count,]$ITEM_SIZE_ALL_AVG) /
          shopping_list[main_count,]$ITEM_SIZE_ALL_STDEV
        shopping_list[main_count,]$PREVIOUS_SHOP_DATE = unique(df$PREVIOUS_SHOP_DATE)
        shopping_list[main_count,]$DAYS_BETWEEN_AVG = unique(df$DAYS_BETWEEN_AVG[df$DAY == max(df$DAY)])
        shopping_list[main_count,]$DAYS_BETWEEN_STDEV = unique(df$DAYS_BETWEEN_STDEV[df$DAY == max(df$DAY)])
        shopping_list[main_count,]$PREV_DATE_Z = (shopping_list[main_count,]$PREVIOUS_SHOP_DATE -
                                                    shopping_list[main_count,]$DAYS_BETWEEN_AVG) /
          shopping_list[main_count,]$DAYS_BETWEEN_STDEV
        shopping_list[main_count,]$PREVIOUS_SHOP_SIZE = unique(df$PREVIOUS_SHOP_SIZE)
        shopping_list[main_count,]$TRIP_SIZE_AVG = unique(df$TRIP_SIZE_AVG[df$DAY == max(df$DAY)])
        shopping_list[main_count,]$TRIP_SIZE_STDEV = unique(df$TRIP_SIZE_STDEV[df$DAY == max(df$DAY)])
        shopping_list[main_count,]$PREV_SIZE_Z = (shopping_list[main_count,]$PREVIOUS_SHOP_SIZE -
                                                    shopping_list[main_count,]$TRIP_SIZE_AVG) /
          shopping_list[main_count,]$TRIP_SIZE_STDEV
        shopping_list$ITEM_SIZE_Z[is.na(shopping_list$ITEM_SIZE_Z)] = 0
        shopping_list$ITEM_SIZE_Z[shopping_list$ITEM_SIZE_Z == -Inf] = 0
        shopping_list$ITEM_SIZE_Z[shopping_list$ITEM_SIZE_Z == Inf] = 0
        shopping_list$ITEM_SIZE_ALL_Z[is.na(shopping_list$ITEM_SIZE_ALL_Z)] = 0
        shopping_list$ITEM_SIZE_ALL_Z[shopping_list$ITEM_SIZE_ALL_Z == -Inf] = 0
        shopping_list$ITEM_SIZE_ALL_Z[shopping_list$ITEM_SIZE_ALL_Z == Inf] = 0
        shopping_list$PREV_DATE_Z[is.na(shopping_list$PREV_DATE_Z)] = 0
        shopping_list$PREV_DATE_Z[shopping_list$PREV_DATE_Z == -Inf] = 0
        shopping_list$PREV_DATE_Z[shopping_list$PREV_DATE_Z == Inf] = 0
        shopping_list[main_count,]$PREV_Z = shopping_list[main_count,]$PREV_SIZE_Z -
          shopping_list[main_count,]$PREV_DATE_Z
        shopping_list[main_count,]$TIME_LOSS_COUNTER = ifelse(unique(df$PREVIOUS_SHOP_DATE) -
                                                                unique(df$ITEM_DURATION[df$ITEM_ID == product_temp]) > 0,
                                                              unique(df$PREVIOUS_SHOP_DATE) -
                                                                unique(df$ITEM_DURATION[df$ITEM_ID == product_temp]), 0)
        shopping_list[main_count,]$TIME_LOSS = ifelse(shopping_list[main_count,]$TIME_LOSS_COUNTER == 0, 0,
                                                      ifelse(shopping_list[main_count,]$TIME_LOSS_COUNTER < 15, shopping_list[main_count,]$TIME_LOSS_COUNTER *
                                                               2, 30))
        shopping_list[main_count,]$ITEM_FREQ_RANKED = df$ITEM_FREQ_RANKED[df$ITEM_ID == product_temp]
        shopping_list[main_count,]$CAT_FREQ_RANKED = df$CAT_FREQ_RANKED[df$ITEM_ID == product_temp]
        if (df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_ID[df$ITEM_ID == product_temp] %in%
            unique(df$ITEM_ID[df$LAST_TRIP == 1])){
          shopping_list[main_count,]$MARKER = 1
        } else if (df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5){
          shopping_list[main_count,]$MARKER = 2
        } else if (df$SUM_2[df$ITEM_ID == product_temp] == 2) {
          shopping_list[main_count,]$MARKER = 3
        } else if (df$SUM_5[df$ITEM_ID == product_temp] >= 3) {
          shopping_list[main_count,]$MARKER = 4
        } else if (df$CAT_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1) {
          shopping_list[main_count,]$MARKER = 5
        } else if (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5 & df$CAT_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1 &
                   df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1){
          shopping_list[main_count,]$MARKER = 6
        } else if (df$CAT_PRCH_PERC[df$ITEM_ID == product_temp] > 0.25 & df$ITEM_FREQ_RANKED[df$ITEM_ID == product_temp] == 1) {
          shopping_list[main_count,]$MARKER = 7
        } else if (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.5 && df$CAT_FREQ_RANKED[df$ITEM_ID == product_temp] == 1 &
                   df$ITEM_FREQ_RANKED[df$ITEM_ID == product_temp] == 1){
          shopping_list[main_count,]$MARKER = 8
        } else if (df$ITEM_PRCH_PERC[df$ITEM_ID == product_temp] <= 0.25 & df$ITEM_ID[df$ITEM_ID == product_temp] %in%
                   unique(df$ITEM_ID[df$LAST_TRIP == 1])){
          shopping_list[main_count,]$MARKER = 9
        } else if (df$CLASS_PRCH_PERC[df$ITEM_ID == product_temp] > 0.15 && df$CAT_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1 &
                   df$ITEM_RECENCY_RANKED[df$ITEM_ID == product_temp] == 1){
          shopping_list[main_count,]$MARKER = 10
        } else if (df$ONE_YEAR_AGO[df$ITEM_ID == product_temp] == 1 & df$WITHIN_90[df$ITEM_ID == product_temp] == 0){
          shopping_list[main_count,]$MARKER = 11
        }
      }
      shopping_list = merge(shopping_list, item_category_parameters, by = "ITEM_CATEGORY", all.x=TRUE)
      shopping_list = merge(shopping_list, user_category_parameters, by = "USER_ID", all.x=TRUE)
      shopping_list$ITEM_CATEGORY_COEF[is.na(shopping_list$ITEM_CATEGORY_COEF)] <- 0
      shopping_list$USER_ID_COEF[is.na(shopping_list$USER_ID_COEF)] <- 0

      shopping_list$prediction = intercept$COEFFICIENTS +
        numeric_parameters$COEFFICIENTS[1] * shopping_list$ITEM_SIZE_Z +
        numeric_parameters$COEFFICIENTS[2] * shopping_list$ITEM_SIZE_ALL_Z +
        numeric_parameters$COEFFICIENTS[3] * shopping_list$FAMILY_SIZE +
        numeric_parameters$COEFFICIENTS[4] * shopping_list$TIME_LOSS +
        numeric_parameters$COEFFICIENTS[5] * shopping_list$PREV_Z +
        shopping_list$ITEM_CATEGORY_COEF +
        shopping_list$USER_ID_COEF

      if (any(shopping_list$prediction > tolerance)){
        shopping_list = tolerance_check(shopping_list, tolerance)
      }
      shopping_list$ITEM_CATEGORY_COEF <- NULL
      shopping_list$USER_ID_COEF <- NULL
    }
    #Reorder by Marker Order
    shopping_list = arrange(shopping_list, MARKER)
    #This next section takes the list and assigns them to the right category. Those in the variable_list could fall in main or suggested
    main_list = c(1, 2, 3, 4)
    seasonal_list = 11
    suggested_list = c(7, 8, 9, 10)
    variable_list = c(5, 6)
    for (x in 1:nrow(shopping_list)){
      if(shopping_list[x,]$prediction < 0){
        shopping_list[x,]$prediction = 0
      } else if (shopping_list[x,]$prediction > 100){
        shopping_list[x,]$prediction = 100
      }
      #      print(shopping_list[x,]$MARKER)
      if (shopping_list[x,]$MARKER %in% main_list){
        shopping_list[x,]$SECTION = 'main'
      } else if (shopping_list[x,]$MARKER %in% suggested_list){
        shopping_list[x,]$SECTION = 'suggested'
      } else if (shopping_list[x,]$MARKER == 11){
        shopping_list[x,]$SECTION = 'time'
      } else if (shopping_list[x,]$MARKER %in% variable_list){
        if (shopping_list[x,]$MARKER == 5){
          if (sum(shopping_list$MARKER == 5 & shopping_list$ITEM_CATEGORY == shopping_list[x,]$ITEM_CATEGORY) == 1){
            shopping_list[x,]$SECTION = 'main'
          } else {
            cond5 = subset(shopping_list, shopping_list$MARKER == 5 & shopping_list$ITEM_CATEGORY == shopping_list[x,]$ITEM_CATEGORY)
            if (shopping_list[x,]$ITEM_FREQ_RANKED == min(cond5$ITEM_FREQ_RANKED) && !shopping_list[x,]$ITEM_CATEGORY %in%
                unique(shopping_list$ITEM_CATEGORY[shopping_list$SECTION == 'main'])) {
              shopping_list[x,]$SECTION = 'main'
            } else {
              shopping_list[x,]$SECTION = 'suggested'
            }
          }
        } else if (shopping_list[x,]$MARKER == 6){
          if (shopping_list[x,]$ITEM_CATEGORY %in% unique(shopping_list$ITEM_CATEGORY[shopping_list$SECTION == 'main'])){
            shopping_list[x,]$SECTION = 'suggested'
          } else if (sum(shopping_list$MARKER == 6 & shopping_list$ITEM_CLASS == shopping_list[x,]$ITEM_CLASS) == 1) {
            shopping_list[x,]$SECTION = 'main'
          } else {
            cond6 = subset(shopping_list, shopping_list$MARKER == 6 & shopping_list$ITEM_CLASS == shopping_list[x,]$ITEM_CLASS)
            cond6a = subset(cond6, min(cond6$CAT_FREQ_RANKED[!cond6$ITEM_CATEGORY %in%
                                                               unique(shopping_list$ITEM_CATEGORY[shopping_list$SECTION == 'main'])]) ==
                              TRUE)
            if (shopping_list[x,]$ITEM_ID %in% unique(cond6a$ITEM_ID) & shopping_list[x,]$ITEM_FREQ_RANKED ==
                min(cond6a$ITEM_FREQ_RANKED)) {
              shopping_list[x,]$SECTION = 'main'
            } else {
              shopping_list[x,]$SECTION = 'suggested'
            }
          }
        }
      }
    }
    shopping_list = arrange(shopping_list, SECTION)
    return(shopping_list)

  }


  new_list2 = new_list(user_list_prep, current_date, as.integer(waste_threshold))
  dbDisconnect(con)
  # print(new_list2)
  # dbWriteTable(con, "USER_GROCERY_LIST_PREDICTION", new_list2, overwrite = TRUE)
  return(new_list2)

}

#* @get /mean
normalMean <- function(samples=10){
  print(samples)
  data <- rnorm(samples)
  mean(data)
}
