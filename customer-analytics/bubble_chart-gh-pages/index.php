<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bubble Chart - Food Waste</title>
  <meta name="description" content="Example Bubble chart implementation in JS. Based on User Entered Food Waste Data">
  <meta name="author" content="Varadarajan Srinivasan">

  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="./css/reset.css">
  <link rel="stylesheet" href="./css/bubble_chart.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.5/d3-legend.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.5/d3-legend.min.js"></script>
  <script src="https://d3plus.org/js/d3.js"></script>
  <script src="https://d3plus.org/js/d3plus.js"></script>
  <script src="./lib/d3.js"></script>

</head>
<body>

   <div class="container">
    <h1>Which Food Items Am I Wasting the Most?</h1>
    <h3>Based on last 3 user receipts</h3>
    <div id="toolbar">
      <a href="#" id="all" class="button active">Combined Receipts</a>
      <a href="#" id="year" class="button">Separate by each receipt</a>
    </div>
    <div id="vis">
    <!--svg height="800" width="1200"><text x="350" y="250" fill="black" text-anchor="right" text-align= "center" font-size="50px">Welcome to Customer Analytics</text></svg-->
    </div>
    <div class='my-legend'>
<div class='legend-title'>% Waste Levels</div>
<div class='legend-scale'>
  <ul class='legend-labels'>
    <li><span style='background:#7aa25c;'></span>Low (0%-5%)</li>
    <li><span style='background:#beccae;'></span>Medium (5%-15%)</li>
    <li><span style='background:#d84b2a;'></span>High (>15%)</li>
  </ul>

<style type='text/css'>
  .my-legend .legend-title {
    text-align: left;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 90%;
    }
  .my-legend .legend-scale ul {
    margin: 0;
    margin-bottom: 5px;
    padding: 0;
    float: left;
    list-style: none;
    }
  .my-legend .legend-scale ul li {
    font-size: 80%;
    list-style: none;
    margin-left: 0;
    line-height: 18px;
    margin-bottom: 2px;
    }
  .my-legend ul.legend-labels li span {
    display: block;
    float: left;
    height: 16px;
    width: 30px;
    margin-right: 5px;
    margin-left: 0;
    border: 1px solid #999;
    }
  .my-legend .legend-source {
    font-size: 70%;
    color: #999;
    clear: both;
    }
  .my-legend a {
    color: #777;
    }
</style>


   <!-- <div class="footer">
      <p>A demonstration of animated bubble charts in JavaScript and D3.js</p>
      <p><a href="http://vallandingham.me/bubble_charts_in_js.html">Blog Post</a> | <a href="https://github.com/vlandham/bubble_chart">Code</a></p>
    </div> -->
  </div>

  <!--script src="php/data.php"></script-->
  <!--
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script type="text/javascript">
  function doSomething() {
    $.get("data.php");
    	return false;
   	}
	</script>-->
  <!--form method="POST">
    <input type="hidden" name="submitted">
    <button type ="submit">Run the Script!</button>
  </form-->
  <!--a href="?run=true">Click Me!</a-->
  <!--a href="#" onclick="doSomething();">Refresh Data!</a-->
  <script src="./src/tooltip.js"></script>
  <script src="./src/bubble_chart.js"></script>

</body>
</html>


<?php
//header("Access-Control-Allow-Origin: *");
// $db_host = "0.0.0.0";
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
            curl_setopt($curl, CURLOPT_POST, 1);

            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
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
}
#echo "Log Start";
#$f1 = fopen("test1.csv","w");
#echo $f1;
#echo "Log End";

//echo $mysqli->host_info . "\n";
$GLOBALS['user_id'] = "dummy";
$database = "FOOD_WASTE_CONSUMER_DB";

#$connection = mysql_select_db($database, $mysqli);
    if ( $GLOBALS['user_id'] == 'dummy' ) {
      $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      $GLOBALS['user_id'] = explode('=',parse_url($url)['query'])[1];
      // echo $GLOBALS['user_id'];
    }
    $user_id = $GLOBALS['user_id'];
    $myquery = "

    SELECT *
    FROM
    (SELECT  ITEM_NAME as grant_title, ROW_NUMBER() OVER (ORDER BY USER_ID DESC) AS id,
    ITEM_CLASS as organization, ROUND((ITEM_TOTAL_PRICE* WASTE_AMT)/100,2) as total_amount,
    CASE WHEN WASTE_AMT/100 < 0.05 then 'LOW'
         when WASTE_AMT/100  >= 0.05 and (WASTE_AMT)/100  < 0.15 then 'MEDIUM'
         else 'HIGH'
    END as gp,
    WASTE_DATA_ENTRY_DT,
    USER_ID,
    DENSE_RANK() OVER ( ORDER BY WASTE_DATA_ENTRY_DT DESC) as start_year

    FROM USER_GROCERY_ITEM_WASTE_ACTUAL
    WHERE USER_ID = $user_id
     ) A
    WHERE total_amount > 0
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

    #echo json_encode($data);
    #chmod("/Users/srinivvx/Desktop/W210-Capstone/bubble_chart-gh-pages/data/*", 0755);
    // echo realpath('./');
    // echo '------';
    $fp = fopen('./results.json', 'w');
	fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
	fclose($fp);


    $file = fopen("./data/test1.csv","w");
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

?>
