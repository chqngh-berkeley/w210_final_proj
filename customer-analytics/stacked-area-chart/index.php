
<?php
//header("Access-Control-Allow-Origin: *");
// $db_host="50.97.219.169";
// $db_host="0.0.0.0";
$db_host="db";
$mysqli = new mysqli($db_host, "root", "", "FOOD_WASTE_CONSUMER_DB", 3306);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


function CallAPI($method, $url, $data = false)
{
    $curl = curl_init();

    switch ($method)
    {
        case "POST":
            // curl_setopt($curl, CURLOPT_POST, 1);
            $data_string = json_encode($data);

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
              'Content-Type: application/json',
              'Content-Length: ' . strlen($data_string))
            );
            $result = curl_exec($ch);
            return $result;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
};

#echo "Log Start";
#$f1 = fopen("test1.csv","w");
#echo $f1;
#echo "Log End";
$GLOBALS['user_id'] = "dummy";
//echo $mysqli->host_info . "\n";
$database = "FOOD_WASTE_CONSUMER_DB";
    if ( $GLOBALS['user_id'] == 'dummy' ) {
      $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      $GLOBALS['user_id'] = explode('=',parse_url($url)['query'])[1];
      // echo $GLOBALS['user_id'];
    }
    $user_id = $GLOBALS['user_id'];
    $myquery = "
    SELECT YEAR(`WASTE_DATA_ENTRY_DT`) as yr, DATE_FORMAT(`WASTE_DATA_ENTRY_DT`, '%b') as MTH, ITEM_CLASS, ROUND(SUM(ITEM_TOTAL_PRICE*WASTE_AMT)/100,2) as WASTED_DOLLARS


    FROM     USER_GROCERY_ITEM_WASTE_ACTUAL
    WHERE USER_ID =  '$user_id' /*hardcoded right now - need to change */
    GROUP BY 1,2,3
    ;

    ";
    // echo $myquery;
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

    mysqli_close($mysqli);

    $data2 = json_encode($data, JSON_PRETTY_PRINT);
    //echo $data2;

   if (isset($_POST["yrbutton"]) && !empty($_POST["yrbutton"])) {
         $selectOption = $_POST['yrbutton'];
    }else{
          $selectOption = "2018";
    }

    $res2 = CallAPI('GET','http://backend:8090/receipt/test');
    $array = array(
        "data1" => $data2,
        "data2" => $selectOption
    );
    $res1 = CallAPI('POST', 'http://backend:8090/util/stacked',$array);
    #$res1 = exec('python json_manip_test.py ' . escapeshellarg($data2) . ' ' . escapeshellarg($selectOption) . ' 2>&1', $out1);


    #echo $res1;

    $pieces = explode("-", $res1);
    // $pieces = json_decode($res1->data);
    // var_dump($pieces);
    $json_a = json_decode($pieces[0], true);
    $json_b = json_decode($pieces[1], true);

    $data =  json_encode($json_a, JSON_NUMERIC_CHECK);
    $axis = json_encode($json_b, JSON_NUMERIC_CHECK);
    $title = json_encode("In " . $selectOption . ", How much total dollars of food have I wasted by month?" );

?>

<!DOCTYPE html>
<html>
<head>
<title>How much total dollars of food have I wasted by month this year?</title>
<link rel="stylesheet" href="./stack.css">
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
</head>

<body>

<div id="container" style="min-width: 310px; height: 500px; margin: 0 auto"></div>

<!--div class="Year"-->
<div class='select-container'>
<?php
  $serve = "
  <form method='post' action='./index.php?user_id=$user_id' autocomplete='off'>
    <select id='form_frame' name='yrbutton' id= 'yrbutton' style='width: 100px; color:
      white; background-color: grey; opacity: 0.75;' onchange='getData(this);'>
      <optgroup name = 'Select Year'>
        <option value='2016' selected>2016</option>
        <option value='2017' >2017</option>
        <option value='2018' >2018</option>
      </optgroup>
    </select>
    <input class ='Year' type='submit' value='Select Year' style='width: 100px; color: white; background-color: purple; opacity: 0.75;' >
    </form>
    ";
  echo $serve;
?>
</div>
<!--/div-->


<div id='container' style="height: 400px; width:500px;"></div>
<script type="text/javascript">

var data_series = <?php echo $data; ?>;
var axis_series = <?php echo $axis; ?>;
var title_name = <?php echo $title; ?>;
//
// Highcharts.chart('container', {
//     chart: {
//         type: 'area'
//     },
//     title: {
//         text: title_name
//     },
//     subtitle: {
//         text: 'Source: Food Waste Estimator Application'
//     },
//     xAxis: {
//         categories: axis_series,
//         tickmarkPlacement: 'on',
//         title: {
//             enabled: false
//         }
//     },
//     yAxis: {
//         title: {
//             text: 'Dollars'
//         },
//         labels: {
//             formatter: function () {
//                 return this.value;
//             }
//         }
//     },
//     tooltip: {
//         split: true,
//         valueSuffix: ' Dollars'
//     },
//     plotOptions: {
//         area: {
//             stacking: 'normal',
//             lineColor: '#666666',
//             lineWidth: 1,
//             marker: {
//                 lineWidth: 1,
//                 lineColor: '#666666'
//             }
//         }
//     },
//     series: data_series
// });

Highcharts.chart('container', {
    chart: {
        type: 'column'
    },
    title: {
        text: title_name
    },
    xAxis: {
        categories: axis_series
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Total Wasted Dollars'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        }
    },
    legend: {
        align: 'center',
        x: -30,
        verticalAlign: 'bottom',
        y: 20,
        //floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
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
