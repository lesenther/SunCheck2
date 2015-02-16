<?php
/**
 * SunCheck API for forecast.io
 *
 * For more info, see:
 *  - https://developer.forecast.io/docs/v2
 *
 **/

/* // Debugging
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
//*/

header('Content-Type: application/javascript');

$apiKey = '5f0b624e922d6c1082480617cc2a3767';  // Reset key if compromised!!!

$request   = isset($_GET['request'])   ? $_GET['request']   : false;
$latitude  = isset($_GET['latitude'])  ? $_GET['latitude']  : false;
$longitude = isset($_GET['longitude']) ? $_GET['longitude'] : false;

if (!$request || !$latitude || !$longitude) {
  echo json_encode(
    array(
      'error' => 'Missing parameter:  ' . print_r($_GET, true)
    )
  );
  exit();
}

switch ($request) {

  case 'current':
    $weather = json_decode(
      file_get_contents(
        'https://api.forecast.io/forecast/'.$apiKey.'/'.
          $latitude.','.$longitude.'?units=us&lang=en'
      )
    );
    echo json_encode($weather->currently);
    break;

  case 'historical':
    $dateStart = isset($_GET['dateStart']) ?
      new DateTime(urldecode($_GET['dateStart'])) : false;
    $dateEnd   = isset($_GET['dateEnd'])   ?
      new DateTime(urldecode($_GET['dateEnd']))   : false;
    $dateEnd->modify('+1 day');  // Increment last day before creating range

    $dateRange = new DatePeriod(
      $dateStart,
      new DateInterval('P1D'),
      $dateEnd
    );

    $dayCount=0;
    $tempMap=array();
    $rainMap=array();
    $sunMap=array();

    // Loop through each day and get info to build statistics
    foreach ($dateRange as $date) {
      if ($dayCount > 30) {
        $error = '30 day limit';
        break;
      }
      $dayCount++;
      $weather = json_decode(
        file_get_contents(
          'https://api.forecast.io/forecast/'.$apiKey.'/'.$latitude.','.
            $longitude.','.$date->getTimestamp().
            '?units=us&lang=en&exclude=minutely,hourly,currently'
        )
      );
      $dailyWeather = $weather->daily->data[0];

      // Determine if sunny / rainy
      // Note: For some locations, cloudCover is undefined
      $sunMap[$dayCount] = ( isset($dailyWeather->cloudCover)
        && $dailyWeather->cloudCover < 0.1 ) ? 100 : 0;
      $rainMap[$dayCount] = ( isset($dailyWeather->precipIntensity)
        && $dailyWeather->precipIntensity > 0 ) ? 100 : 0;
      $tempMap[$dayCount]  = round( $dailyWeather->temperatureMin +
        ($dailyWeather->temperatureMax - $dailyWeather->temperatureMin) / 2);
      $x_axis[$dayCount] = $date->format('m/d');
    }

    echo json_encode(
      array(
        'total_days' => $dayCount,
        'percent_sunny' => number_format(array_sum($sunMap)/count($sunMap)).'%',
        'percent_rainy' => number_format(array_sum($rainMap)/count($rainMap)).'%',
        // See:  https://developers.google.com/chart/image/
        'temp_map' => 'http://chart.googleapis.com/chart'.
          '?cht=lc'. // Line chart
          '&chs=400x100'. // Size
          '&chd=t:'.implode(',', $tempMap). // data
          '&chxl=0:|'.implode('|', $x_axis).
          '&chxt=x,y'. // Show y-axis
          '&chxr=1,'.(min($tempMap)-2).','.(max($tempMap)+2). // set y range
          '&chds='.(min($tempMap)-2).','.(max($tempMap)+2).
          '&chf=bg,s,FFFFFF00'. // transparent back
          '&chco=6688FF'. // line colors
          '&chma=30,0,0,0'. // margins
          '',
        'rain_map' => 'http://chart.googleapis.com/chart'.
          '?cht=bvg:nda'. // bar chart
          '&chs=400x20'. // size
          '&chd=t:'.implode(',', $rainMap). // data
          '&chf=bg,s,FFFFFF00'. // transparent back
          '&chco=90C0F0'. // bar color
          '&chma=30,0,0,0'. // margins
          '&chbh=a'. // bar width
          '',

        'sun_map' => 'http://chart.googleapis.com/chart'.
          '?cht=bvg:nda'. // bar chart
          '&chs=400x20'. // size
          '&chd=t:'.implode(',', $sunMap). // data
          '&chf=bg,s,FFFFFF00'. // transparent back
          '&chco=F0C090'. // bar color
          '&chma=30,0,0,0'. // margins
          '&chbh=a'. // bar width
          '',
        // TODO:  Show map?  https://developers.google.com/maps/documentation/staticmaps/
        'location_map' =>
          'http://maps.googleapis.com/maps/api/staticmap?center='.$latitude.
          ', '.$longitude.'&zoom=12&size=600x400&sensor=false&maptype=satellite',

        'error' => isset($error) ? $error : ''
      )
    );
    break;

  default:
    echo json_encode(
      array(
        'error' => 'Bad request, <em>'.$request.'</em>'
      )
    );
    break;
}

?>