#!/bin/sh
user_id=$1
threshold=$2
echo "UserId: $user_id";
echo "Wastage Threshold: $threshold";
Rscript ./Food_Waste_Predictions.R $user_id $threshold
