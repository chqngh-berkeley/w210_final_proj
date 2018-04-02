
<?php
//header("Access-Control-Allow-Origin: *");

$mysqli = new mysqli("127.0.0.1", "root", "", "FOOD_WASTE_CONSUMER_DB", 3306);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

#echo "Log Start";
#$f1 = fopen("test1.csv","w");
#echo $f1;
#echo "Log End";

//echo $mysqli->host_info . "\n";
$database = "FOOD_WASTE_CONSUMER_DB";

#$connection = mysql_select_db($database, $mysqli);

    $myquery = "
    SELECT YEAR(`WASTE_DATA_ENTRY_DT`) as yr, DATE_FORMAT(`WASTE_DATA_ENTRY_DT`, '%b') as MTH, ITEM_CLASS, ROUND(SUM(ITEM_TOTAL_PRICE*WASTE_AMT)/100,2) as WASTED_DOLLARS


    FROM     USER_GROCERY_ITEM_WASTE_ACTUAL
    WHERE USER_ID = 718  /*hardcoded right now - need to change */
    GROUP BY 1,2,3
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
    
    #echo json_encode($data);     
    #chmod("/Users/srinivvx/Desktop/W210-Capstone/bubble_chart-gh-pages/data/*", 0755);
    
    $fp = fopen('results.json', 'w');
  fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
  fclose($fp);

    
    $file = fopen("test1.csv","w");
    fputcsv($file, array_keys($data[0]));

    foreach ($data as $line)
    {
    fputcsv($file, $line);
    }

    #echo $file;

    fclose($file); 
     
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


    $command = escapeshellcmd('/Users/srinivvx/Desktop/W210-Capstone/stacked-area-chart/json_manip.py');
    shell_exec($command);

    if (isset($_POST["yrbutton"]) && !empty($_POST["yrbutton"])) {  
         $selectOption = $_POST['yrbutton'];
    }else{  
          $selectOption = "2018";
    }

    
    //echo $selectOption;
    $filename = "data" . $selectOption . ".json";

    $string1 = file_get_contents($filename);
    $string2 = file_get_contents("axis.json");


    $json_a = json_decode($string1, true);
    $json_b = json_decode($string2, true);
    
    $data =  json_encode($json_a, JSON_NUMERIC_CHECK);
    $axis = json_encode($json_b, JSON_NUMERIC_CHECK);
    $title = json_encode("In " . $selectOption . ", How much total dollars of food have I wasted by month?" );

?>

<!DOCTYPE html>
<html>
<head>
<title>How much total dollars of food have I wasted by month this year?</title>
<link rel="stylesheet" href="stack.css">
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
</head>

<body>

<div id="container" style="min-width: 310px; height: 800px; margin: 0 auto"></div>

<!--div class="Year"-->
<form method="post" action="index.php" autocomplete="off">
<select id="form_frame" name="yrbutton" id= "yrbutton" style="width: 100px; color: white; background-color: grey; opacity: 0.75;"" onchange="getData(this);">
  <optgroup name = "Select Year">
    <option value="2016" selected>2016</option>
    <option value="2017" >2017</option>
    <option value="2018" >2018</option>
  </optgroup>
</select>
<input class ="Year" type="submit" value="Select Year" style="width: 100px; color: white; background-color: purple; opacity: 0.75;" >
</form>
<!--/div-->


<div id="container" style="height: 400px; width:750px;"></div>
<script type="text/javascript">

var data_series = <?php echo $data; ?>;
var axis_series = <?php echo $axis; ?>;  
var title_name = <?php echo $title; ?>;  

Highcharts.chart('container', {
    chart: {
        type: 'area'
    },
    title: {
        text: title_name
    },
    subtitle: {
        text: 'Source: Food Waste Estimator Application'
    },
    xAxis: {
        categories: axis_series,
        tickmarkPlacement: 'on',
        title: {
            enabled: false
        }
    },
    yAxis: {
        title: {
            text: 'Dollars'
        },
        labels: {
            formatter: function () {
                return this.value;
            }
        }
    },
    tooltip: {
        split: true,
        valueSuffix: ' Dollars'
    },
    plotOptions: {
        area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
                lineWidth: 1,
                lineColor: '#666666'
            }
        }
    },
    series: data_series
});



</script>

<script type="text/javascript">
  document.getElementById('form_frame').value = "<?php 
      if (isset($_POST["yrbutton"]) && !empty($_POST["yrbutton"])) {  
         echo $_POST['yrbutton'];
      }else{  
          echo "2018";
      }
      ?>";  
</script>

</body>
</html>









