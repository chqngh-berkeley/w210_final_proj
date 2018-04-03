
<?php
//header("Access-Control-Allow-Origin: *");
$GLOBALS['user_id'] = "dummy";
$mysqli = new mysqli("50.97.219.169", "root", "", "FOOD_WASTE_CONSUMER_DB", 3306);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

$database = "FOOD_WASTE_CONSUMER_DB";

#$connection = mysql_select_db($database, $mysqli);
    if ( $GLOBALS['user_id'] == 'dummy' ) {
      $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      $GLOBALS['user_id'] = explode('=',parse_url($url)['query'])[1];
      // echo $GLOBALS['user_id'];
    }
    $user_id = $GLOBALS['user_id'];
    $myquery = "
    SELECT A.yr,A.MTH, A.ITEM_CLASS, ROUND(A.WASTED_DOLLARS,2) as YOUR_WASTED_DOLLAR, ROUND(B.WASTED_DOLLARS,2) as POPN_WASTED_DOLLARS
    FROM
    (SELECT YEAR(`WASTE_DATA_ENTRY_DT`) as yr, DATE_FORMAT(`WASTE_DATA_ENTRY_DT`, '%b') as MTH, ITEM_CLASS, SUM(ITEM_TOTAL_PRICE*WASTE_AMT)/100 as WASTED_DOLLARS


    FROM     USER_GROCERY_ITEM_WASTE_ACTUAL
    WHERE USER_ID = $user_id
    GROUP BY 1,2,3) A,
    (SELECT YEAR(`WASTE_DATA_ENTRY_DT`) as yr, DATE_FORMAT(`WASTE_DATA_ENTRY_DT`, '%b') as MTH, ITEM_CLASS, AVG(ITEM_TOTAL_PRICE*WASTE_AMT)/100 as WASTED_DOLLARS


    FROM     USER_GROCERY_ITEM_WASTE_ACTUAL
    WHERE USER_ID <> $user_id
    GROUP BY 1,2,3) B

    WHERE A.yr = B.yr
    and A.MTH = B.MTH
    and A.ITEM_CLASS = B.ITEM_CLASS
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


    mysqli_close($mysqli);

    $data2 = json_encode($data, JSON_PRETTY_PRINT);
    //echo $data2;

   if (isset($_POST["yrbutton"]) && !empty($_POST["yrbutton"])) {
         $selectOption = $_POST['yrbutton'];
    }else{
          $selectOption = "DAIRY";
    }


    $res1 = exec('python ./json_manip_test.py ' . escapeshellarg($data2) . ' ' . escapeshellarg($selectOption) . ' 2>&1', $out1);
    // ECHO $res1;

    $pieces = explode("-", $res1);


    $json_a = json_decode($pieces[0], true);
    $json_b = json_decode($pieces[1], true);

   # echo $json_a;
   # echo $json_b;


    $data =  json_encode($json_a , JSON_NUMERIC_CHECK);
    $axis = json_encode($json_b , JSON_NUMERIC_CHECK);

    #echo $data;
    #echo $axis;
    $title = json_encode("For " . $selectOption . " items, How much am I wasting compared to a comparable peer group?" );

?>


<!DOCTYPE html>
<html>
<head>
<title>How much total dollars of food have I wasted by month this year?</title>
<link rel="stylesheet" href="./stack.css">
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="http://code.highcharts.com/modules/drilldown.js"></script>
</head>

<body>

<div id="container" style="min-width: 310px; height: 800px; margin: 0 auto"></div>

<!--div class="Year"-->
<div class='select-container'>
<?php
 $serve = "
 <form method='post' action='index.php?user_id=$user_id' autocomplete='off'>
<select id='form_frame' name='yrbutton' id= 'yrbutton' style='width: 150px; color: white; background-color: grey; opacity: 0.75;' onchange='getData(this);'>
  <optgroup name = 'Select Year'>
    <option value='DAIRY' selected>DAIRY</option>
    <option value='FISH' >FISH</option>
    <option value='FOWL' >FOWL</option>
    <option value='FRESH FRUIT' >FRESH FRUIT</option>
    <option value='FRESH VEGETABLES' >FRESH VEGETABLES</option>
    <option value='MEAT' >MEAT</option>
    <option value='MILK' >MILK</option>
    <option value='PROCESSED FRUIT' >PROCESSED FRUIT</option>
    <option value='PROCESSED VEGETABLES' >PROCESSED VEGETABLES</option>
  </optgroup>
</select>
<input class ='Year' type='submit' value='Select Product' style='width: 100px; color: white; background-color: purple; opacity: 0.75;' >
</form>
";
 echo $serve
?>

</div>
<!--/div-->


<div id="container" style="height: 400px; width:600px;"></div>


<script type="text/javascript">

var data_series = <?php echo $data; ?>;
var axis_series = <?php echo $axis; ?>;
var title_name = <?php echo $title; ?>;

//$(function () {

    var drilldownsAdded = 0;

    // Create the chart
    Highcharts.chart('container',{
        chart: {
            type: 'column',
            events: {
                drilldown: function (e) {
                    if (!e.seriesOptions) {

                        console.log(
                            'point.name', e.point.name,
                            'series.name', e.point.series.name,
                            'byCategory', e.byCategory
                        );

                        var chart = this,
                            drilldowns = data_series;
                            var stateSeries = drilldowns[e.point.name],
                                series;
                            for (var i = 0; i < stateSeries.length; i++) {
                                if (stateSeries[i].name === e.point.series.name) {
                                    series = stateSeries[i];
                                    break;
                                }
                            }

                        // Show the loading label
                                        console.log(e.point);
                        chart.showLoading('Simulating Ajax for ' + e.point.name);

                        setTimeout(function () {
                            chart.addSingleSeriesAsDrilldown(e.point, series);
                            drilldownsAdded++;
                            if (drilldownsAdded === 2) {
                                drilldownsAdded = 0;
                                chart.hideLoading();
                                chart.applyDrilldown();
                            }
                        }, 1000);
                    }

                }
            }
        },
        title: {
            text: title_name
        },
        xAxis: {
            type: 'category',
        },

        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true
                }
            }
        },

        series: axis_series,

        drilldown: {
            series: []
        },

        colors: ["#7D2714", "#576B85"] //90BBE6
    });
//});



</script>

<script type="text/javascript">
  document.getElementById('form_frame').value = "<?php
      if (isset($_POST["yrbutton"]) && !empty($_POST["yrbutton"])) {
         echo $_POST['yrbutton'];
      }else{
          echo "DAIRY";
      }
      ?>";
</script>

</body>
</html>
