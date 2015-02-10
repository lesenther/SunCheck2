App = Ember.Application.create();

App.Router.map(function() {
  this.route('now', {path: 'now'});
  this.route('past', {path: 'past'});
});

// Now Route, see:  http://www.9limes.com/api/?request=current&latitude=37.8109162&longitude=-122.243506
App.NowRoute = Ember.Route.extend({
  model: function(params){
    return Ember.$.getJSON('http://localhost:8008/api' + '?request=' + params.request + '&latitude=' + params.latitude + '&longitude=' + params.longitude);
    /*
    return {
      "time":1423524113,
      "summary":"Partly Cloudy",
      "icon":"partly-cloudy-day",
      "nearestStormDistance":6,
      "nearestStormBearing":278,
      "precipIntensity":0,
      "precipProbability":0,
      "temperature":61.96,
      "apparentTemperature":61.96,
      "dewPoint":54.52,
      "humidity":0.77,
      "windSpeed":5.53,
      "windBearing":272,
      "visibility":9.35,
      "cloudCover":0.25,
      "pressure":1022.24,
      "ozone":294.39
    };//*/
  }
});

// Past Route, see:  http://www.9limes.com/api?request=historical&latitude=37.810883499999996&longitude=-122.2434742&dateStart=1%2F1%2F2011&dateEnd=1%2F11%2F2011
App.PastRoute = Ember.Route.extend({
  model: function(){
    //return // Ember.$.getJSON('http://localhost:8008/api?request=historical&latitude=37.810883499999996&longitude=-122.2434742&dateStart=1%2F1%2F2011&dateEnd=1%2F11%2F2011');
    return {
      "total_days":11,
      "percent_sunny":"0%",
      "percent_rainy":"36%",
      "temp_map":"http:\/\/chart.googleapis.com\/chart?cht=lc&chs=400x100&chd=t:44,48,49,50,47,48,46,42,44,44,43&chxl=0:|01\/01|01\/02|01\/03|01\/04|01\/05|01\/06|01\/07|01\/08|01\/09|01\/10|01\/11&chxt=x,y&chxr=1,40,52&chds=40,52&chf=bg,s,FFFFFF00&chco=6688FF&chma=30,0,0,0",
      "rain_map":"http:\/\/chart.googleapis.com\/chart?cht=bvg:nda&chs=400x20&chd=t:0,100,100,0,0,100,0,0,0,0,100&chf=bg,s,FFFFFF00&chco=90C0F0&chma=30,0,0,0&chbh=a",
      "sun_map":"http:\/\/chart.googleapis.com\/chart?cht=bvg:nda&chs=400x20&chd=t:0,0,0,0,0,0,0,0,0,0,0&chf=bg,s,FFFFFF00&chco=F0C090&chma=30,0,0,0&chbh=a",
      "location_map":"http:\/\/maps.googleapis.com\/maps\/api\/staticmap?center=37.810883499999996, -122.2434742&zoom=12&size=600x400&sensor=false&maptype=satellite",
      "error":""
    };//*/
  }
});

/*
App.CurrentWeatherRoute = Ember.Route.extend({
  model: function() {
    return Ember.$.getJSON('http://www.9limes.com/api').then(function(data) {
      return data.splice(0, 3);
    });
  }
});//*/

/*
App.CurrentWeather = DS.Model.extend({
  description: DS.attr('string'),
  temperature: DS>attr('string'),
  humidity: DS.attr('string')
});

App.HistoricalWeather = DS.Model.extend({
  sun_percent: DS.attr('string'),
  sun_map: DS.attr('string'),
  rain_percent: DS.attr('string'),
  rain_map: DS.attr('string'),
  temperature_map: DS.attr('string')
});//*/

//******************************************************************************

/*
App.SunCheckController = Ember.Controller.extend({
  locationQuery: '',
  init: function() {
    // Get users location with html5 geolocation
  }
});//*/