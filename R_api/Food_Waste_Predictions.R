library(RMariaDB)
library(DBI)
library(sqldf)
library(dplyr)   #reordering rows in df

username <- "root"
host <- "0.0.0.0"
dbname <- "FOOD_WASTE_CONSUMER_DB"
con <- dbConnect(RMariaDB::MariaDB(), host = host, user = username, dbname = dbname)

args = commandArgs(trailingOnly=TRUE)
current_date = 717 #need to make not a static variable

#get data from MariaDB
intercept <- dbGetQuery(con, "SELECT * FROM MODEL_PARAMETERS LIMIT 1")
numeric_parameters <- dbGetQuery(con, "SELECT * FROM MODEL_PARAMETERS LIMIT 1,5")
item_category_parameters <- dbGetQuery(con, "SELECT REPLACE(VARIABLE, 'as.factor(ITEM_CATEGORY)', ''), COEFFICIENTS FROM MODEL_PARAMETERS WHERE VARIABLE LIKE '%ITEM_CATEGORY%'")
user_category_parameters <- dbGetQuery(con, "SELECT REPLACE(VARIABLE, 'as.factor(USER_ID)', ''), COEFFICIENTS FROM MODEL_PARAMETERS WHERE VARIABLE LIKE '%USER_ID%'")
names(item_category_parameters) <- c("ITEM_CATEGORY", "ITEM_CATEGORY_COEF")
names(user_category_parameters) <- c("USER_ID", "USER_ID_COEF")

sqlquery <- paste("SELECT * FROM MODEL_PARAMETERS_STAGING_TABLE WHERE USER_ID = ", args[1])
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


new_list2 = new_list(user_list_prep, current_date, args[2])
print(new_list2)
dbWriteTable(con, "USER_GROCERY_LIST_PREDICTION", new_list2, overwrite = TRUE)

dbDisconnect(con)
