<?php

$mysqli = new mysqli("127.0.0.1", "root", "", "FOOD_WASTE_CONSUMER_DB", 3306);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

#echo "Log Start";
#$f1 = fopen("test1.csv","w");
#echo $f1;
#echo "Log End";

echo $mysqli->host_info . "\n";
$database = "FOOD_WASTE_CONSUMER_DB";

#$connection = mysql_select_db($database, $mysqli);

    $myquery = "
    
    SELECT * 
    FROM
    (SELECT  ITEM_NAME as grant_title, ROW_NUMBER() OVER (ORDER BY USER_ID DESC) AS id,
    ITEM_CATEGORY as organization, (ITEM_SIZE* ITEM_TOTAL_PRICE* WASTE_AMT)/100 as total_amount,
    CASE WHEN (ITEM_SIZE* ITEM_TOTAL_PRICE* WASTE_AMT)/100  < 4.3 then 'LOW' 
         when (ITEM_SIZE* ITEM_TOTAL_PRICE* WASTE_AMT)/100  >= 4.3 and (ITEM_SIZE* ITEM_TOTAL_PRICE* WASTE_AMT)/100  < 22 then 'MEDIUM'
         else 'HIGH'
    END as gp,
    RECEIPT_UPLOAD_DT,
    USER_ID,
    DENSE_RANK() OVER ( ORDER BY RECEIPT_UPLOAD_DT DESC) as start_year
   
    FROM USER_GROCERY_ITEM_WASTE_ACTUAL ) A
    having start_year < 4
    ;
 
    ";

//Get the Date and store it in array
$records = array();
if ( $result=mysqli_query($mysqli,$myquery) )
    while ( $obj=mysqli_fetch_object($result) )
        $records[] = $obj;

//echo in json format on screen       
echo "[";
$comma_1 = "";
foreach($records as $obj)
{
    echo $comma_1."{";
    $comma_2 = "";
    foreach($obj as $key => $value)
    {
        echo $comma_2.'"'.$key."\": \"". $value . "\"";
        $comma_2 = ", ";
    }
    echo "}";
    $comma_1 = ", \n";
}

    mysqli_close($mysqli);

?>