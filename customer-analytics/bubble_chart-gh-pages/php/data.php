<? header("Access-Control-Allow-Origin: *"); ?>
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
    $query = mysqli_query($mysqli, $myquery);
    
    if ( ! $query ) {
        echo mysqli_error($mysqli);
        die;
    }
    
    $data = array();
    
    for ($x = 0; $x < mysqli_num_rows($query); $x++) {
        $data[] = mysqli_fetch_assoc($query);
    }
    
    echo json_encode($data, JSON_PRETTY_PRINT); 
    
    $fp = fopen('results.json', 'w');
	fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
	fclose($fp);
    
    #chmod("/Users/srinivvx/Desktop/W210-Capstone/bubble_chart-gh-pages/data/*", 0755);
    
    #$file = fopen("/Users/srinivvx/Desktop/W210-Capstone/bubble_chart-gh-pages/data/test1.csv","w");
    #fputcsv($file, array_keys($data[0]));

    #foreach ($data as $line)
    #{
    #fputcsv($file, $line);
    #}

    #echo $file;

    #fclose($file); 
     
/*
    // Create a stream opening it with read / write mode
    $stream = fopen('data://text/plain,' . "", 'w+');

    // Iterate over the data, writting each line to the text stream
    fputcsv($stream, array_keys($data[0]));

    foreach ($data as $val) {
        fputcsv($stream, $val);
    }

    // Rewind the stream
    rewind($stream);

    // You can now echo it's content
    echo stream_get_contents($stream);
    

    // Close the stream 
    fclose($stream);
    */
    mysqli_close($mysqli);

?>


