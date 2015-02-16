App = Ember.Application.create();

App.Router.map(function() {
  this.resource('now', { path: '/now' });
  this.resource('past', { path: '/past' });
});

App.LoadingView = Ember.View.extend({
  templateName: 'global-loading',
  elementId: 'global-loading'
});

App.ApplicationController = Ember.Controller.extend({
  locationQuery: '',
  longitude: '',
  latitude: '',
  date_start: "1/1/11",
  date_end: "1/11/11",

  init: function(){
    var controller = this; // jquery changes this so we need to keep reference
    setTimeout(function(){
      controller.send('getUserLocation');
    },500);
  },

  actions: {
    /*
    loading: function() {
      var view = this.container.lookup('view:loading').append();
      this.router.one('didTransition', view, 'destroy');
    },//*/

    /**
     * Searches for GPS coordinates for location query
     *  - Requires query (string) as parameter
     *
     * @return {[type]} [description]
     */
    searchCoords: function(){
      var controller = this; // jquery changes this so we need to keep reference

      if (this.get('locationQuery') == '') {
        alertUser('<strong>Error:</strong> Query empty!', 500);
        return;
      }

      alertUser('<span class="load"></span>Getting coordinates for <em>' +
        this.get('locationQuery') + '</em>', -1);

      $.ajax({
        type: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data:{
          address: controller.get('locationQuery')
        },
        dataType: "json"
      }).done(function(data){
        hideAlert();
        if (data.status == 'OK') {
          controller.set('locationQuery', data.results[0].formatted_address);
          controller.set('latitude', data.results[0].geometry.location.lat);
          controller.set('longitude', data.results[0].geometry.location.lng);
          controller.send('getCurrentWeather');
        }else{
          alertUser('<strong>Error:</strong> Location not found, <em>' +
            controller.get('locationQuery') + '</em>');
        }
      });
    },

    /**
     * Gets current weather information from our api middleman
     *  - Sends request name, latitude and longitude as parameters
     *  - Should be GET request
     *  - Receives JSON
     *
     * @return {[type]} [description]
     */
    getCurrentWeather: function(){
      alertUser('<span class="load"></span>Getting weather for <em>' +
        this.get('locationQuery') + '</em>', -1);

      var controller = this;

      if ( !this.get('longitude') || !this.get('latitude') ) {
        alertUser('<strong>Error:</strong> Location not set!');
        return;
      }

      $.ajax({
        type: 'GET',
        url: '/api/current', // TODO: Remove this temporary hack
        data:{
          request: 'current',
          latitude: controller.get('latitude'),
          longitude: controller.get('longitude')
        },
        dataType: "json"
      }).done(function(data){
        hideAlert();
        if (data.error) {
          alertUser('<strong>Error:</strong> ' + data.error);
        }

        // TOOD: Change this to use component
        showResults(
          '<p>Weather right now in <em>' + controller.get('locationQuery') +
            '</em>:</p>' +
          '<ul>' +
            '<li><strong>' + data.summary + '</strong></li>' +
            '<li class="temp">' + Math.floor(data.temperature) + ' &deg;F</li>'+
            '<li>' + Math.round(data.humidity*100) + '% Humidity</li>' +
          '</ul>' +
          '<div style="text-align:center;">' +
            '<a onclick="getHistorialWeather();return false;">' +
              'Get Historical Data' +
            '</a>' +
          '</div>'
        );
      });
    }, // getCurrentWeather

    /**
     * Gets historical weather data from our api middleman
     *  - requires request type, longitude, latitude, datestart and dateend
     *  - Should be GET request
     *  - Receives JSON
     *
     * @return {[type]} [description]
     */
    getHistoricalWeather: function(){
      var controller = this;

      if ( !this.get('longitude') || !this.get('latitude') ) {
        alertUser('<strong>Error:</strong> Location not set!');
        return;
      }

      // TODO: Make better date input control
      var dateStart = new Date(Date.parse(prompt('Enter the start date:  \n\n' +
        '(MM/DD/YYYY or any date string format)', this.get('date_start'))));
      if (dateStart=='' || !isValidDate(dateStart)) {
        alertUser('<strong>Error:</strong> Bad date format, <em>' + dateStart +
          '</em>', 1000);
        return;
      }

      var dateEnd = new Date(Date.parse(prompt('Enter the end date:  \n\n' +
        'Must be within 30 days of ' +
        properDate(dateStart), this.get('date_end'))));
      if ( dateEnd=='' || !isValidDate(dateEnd) ) {
        alertUser('<strong>Error:</strong> Bad date format, <em>' + dateEnd +
          '</em>', 1000);
        return;
      }

      // Swap dates if the user enters them backwards
      if (dateStart > dateEnd) {
        temp = dateStart;
        dateStart = dateEnd;
        dateEnd = temp;
        delete temp;
      }

      // Check 30 day limit
      if ( (dateEnd - dateStart) > (1000 * 60 * 60 * 24 * 30) ) {
        alertUser('<strong>Error:</strong> Date range is currently limited ' +
          'to 30 days due to third-party API restrictions.  Please try again.',
          4000);
        return;
      }

      // Dates should be good, store them in the u object
      this.set('date_start', properDate(dateStart));
      this.set('date_end', properDate(dateEnd));

      alertUser('<span class="load"></span>Getting weather history for <em>' +
        this.get('locationQuery') + '</em>', -1);
      $.ajax({
        type: 'GET',
        url: '/api/historical/',
        data:{
          request: 'historical',
          latitude: controller.get('latitude'),
          longitude: controller.get('longitude'),
          dateStart: controller.get('date_start'),
          dateEnd: controller.get('date_end')
        },
        dataType: "json"
      }).done(function(data){
        hideAlert();
        if (data.error) {
          alertUser('<strong>Error:</strong> ' + data.error);
        }

        // TOOD: Change this to use component ???
        showResults(
          '<p>Weather between <em>' + controller.get('date_start') +
            '</em> and <em>' + controller.get('date_end') + '</em> in <em>' +
            controller.get('locationQuery') + '</em>:</p>' +
          '<ul>' +
            '<li>Sunny days:  <strong>' + data.percent_sunny + '</strong>' +
              '<img src="' + data.sun_map + '"></li>' +
            '<li>Rainy days:  <strong>' + data.percent_rainy + '</strong>' +
              '<img src="' + data.rain_map + '">' +
            '</li>' +
            '<li>Temperature:' +
              '<img src="' + data.temp_map + '"><span>(average, &deg;F)' +
                '</span>' +
            '</li>' +
            '<li></li>' +
          '</ul>' +
          '<div>' +
            // Change this to action
            '<a onclick="getHistorialWeather();return false;">' +
              'Get Historical Data' +
            '</a>' +
          '</div>');
      });
    }, // getHistoricalWeather

    /**
     * Attempts to get the users current location using html5's geolocation
     * feature
     *
     * @return {[type]} [description]
     */
    getUserLocation: function(){
      var controller = this;
      if (navigator.geolocation) {
        alertUser('<span class="load"></span>Getting your location', -1);
        var geocoder = new google.maps.Geocoder();
        navigator.geolocation.getCurrentPosition(function(pos){
          controller.set('latitude', pos.coords.latitude);
          controller.set('longitude', pos.coords.longitude);
          var latlng = new google.maps.LatLng(pos.coords.latitude,
            pos.coords.longitude);
          // User geocoder to get friendly location name
          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                var city = 'unknown', state = 'unknown';
                var arrAddress = results[0].address_components;
                for (ac = 0; ac < arrAddress.length; ac++) {
                  city = (arrAddress[ac].types[0] == "locality")
                    ? arrAddress[ac].long_name : city;
                  state = (arrAddress[ac].types[0] == "administrative_area_level_1")
                    ? arrAddress[ac].short_name : state;
                }
                controller.set('locationQuery', city + ', ' + state);
                hideAlert();
                controller.send('getCurrentWeather');
              } else {
                alertUser("Location could not be found");
                return;
              }
            } else {
              alertUser("Geocoder failed: <em>" + status + '</em>');
              return;
            }
          });
        },function(error){
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alertUser('<strong>Error:</strong> User denied the request for ' +
                'Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              alertUser('<strong>Error:</strong> Location information is ' +
                'unavailable.');
              break;
            case error.TIMEOUT:
              alertUser('<strong>Error:</strong> The request to get user ' +
                'location timed out.');
              break;
            case error.UNKNOWN_ERROR:
              alertUser('<strong>Error:</strong> An unknown error occurred.');
              break;
          }
        });
      } else {
        alertUser('Geolocation is not supported by this browser.');
      }
    } // getUserLocation
  } // actions
});

App.LocationQueryComponent = Ember.Component.extend({
  keyPress: function () {
    if(event.charCode == '13'){ // User presses the enter key
      this.sendAction();
    }
  }
});

App.HistoricalLookupComponent = Ember.Component.extend({
  click: function(){
    this.sendAction();
  }
});