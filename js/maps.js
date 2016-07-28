/* ******************************************************************
*******              Neighborhood Map Project             ***********
*******                                                   ***********
*******              Created By: Eric Phy                 ***********
*******                                                   ***********
******************************************************************* */


// Set global variables
var map,
  markers = [],
  id = [],
  activeFilter,
  wikiUrl,
  infoWindow,
  search,
  searchBox,
  removeMarker,
  defaultIcon,
  highlightedIcon,
  styleArray,
  locations,
  filter,
  filterSpot,
  filterRadius,
  filterButtonClear;


// Assign some global variables
filterSpot = null;
search = document.getElementById("searchBox");
locations = document.getElementById("locations");
filter = document.getElementById("filterBox");
filterRadius = document.getElementById("filterRadius");
filterButtonClear = document.getElementById("filterButtonClear");
filterButton = document.getElementById("filterButton");

// Styles for Google Map
styleArray =[
    {
      "featureType": "landscape",
      "stylers": [
        {
            "hue": "#FFBB00"
        },
        {
            "saturation": 43.4
        },
        {
            "lightness": 37.6
        },
        {
            "gamma": 1
        }
      ]
    },
    {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
   },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "hue": "#FFC200"
            },
            {
                "saturation": -61.8
            },
            {
                "lightness": 45.6
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 51.2
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 52
            },
            {
                "gamma": 1
            }
        ]
    },
    {
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
   },
    {
        "featureType": "water",
        "stylers": [
            {
                "hue": "#0078FF"
            },
            {
                "saturation": -13.2
            },
            {
                "lightness": 2.4
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "hue": "#00FF6A"
            },
            {
                "saturation": -1.1
            },
            {
                "lightness": 11
            },
            {
                "gamma": 1
            }
        ]
    }
];

// Initiatize the Google Map
function initMap() {

  // Create the map, set some of the controls off, and set viewport to be over Doylestown, PA
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.31, lng: -75.185},
      zoom: 13,
      styles: styleArray,
      mapTypeControl: false
      });

  filterBox = new google.maps.places.SearchBox(filter);
  searchBox = new google.maps.places.SearchBox(search);

  // Focus SearchBox results on the current map viewport
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
    filterBox.setBounds(map.getBounds());
  });

  // Establish marker styles
  defaultIcon = makeMarkerIcon('B590D4');
  highlightedIcon = makeMarkerIcon('FFFA73');

  // Generates default markers on the google map
  function defineDefaultMarkerArray(){

      // Hard coded initial Google Map markers
      var marker1 = new viewModel.Marker("Doylestown Starbucks", {lat: 40.310323, lng: -75.130746});
      var marker2 = new viewModel.Marker("Central Bucks Family YMCA", {lat: 40.303162, lng: -75.140643});
      var marker3 = new viewModel.Marker("Peace Valley Park", {lat: 40.329817, lng: -75.192421});
      var marker4 = new viewModel.Marker("California Tortilla", {lat: 40.304436, lng: -75.129210});
      var marker5 = new viewModel.Marker("Five Ponds Golf Course", {lat: 40.219718, lng: -75.112137});

      // Push initial locations in the observable array viewModel.markerList
      viewModel.markerList.push(marker1);
      viewModel.markerList.push(marker2);
      viewModel.markerList.push(marker3);
      viewModel.markerList.push(marker4);
      viewModel.markerList.push(marker5);

      // Set eventListeners for each initial marker
      defaultMarkerListener(marker1);
      defaultMarkerListener(marker2);
      defaultMarkerListener(marker3);
      defaultMarkerListener(marker4);
      defaultMarkerListener(marker5);

      // Establish a unique ID (0,1,2 etc) for each li in the html's side_bar ul
      trackLiIndex();

  }

  // This controls most of the functionality for when a user clicks a Google Maps marker
  function defaultMarkerListener(marker) {

    marker.addListener('click', function() {

      // Initiate infoWindow for the selected marker
      populateInfoWindow(this);

      // Check current marker's id property and set the selectedLi observable to it
      id = parseInt(marker.id);
      viewModel.selectedLi(id);

      // Reset all marker's icon to default
      for(var i = 0; i < viewModel.markerList().length; i++) {

        viewModel.markerList()[i].setIcon(defaultIcon);
        viewModel.markerList()[i].colorId(false);
        viewModel.markerList()[i].activeButton(false);
      }

      // Set current marker to highlightedIcon style
      this.setIcon(highlightedIcon);
      this.colorId(true);
      this.activeButton(true);

    });
  }

  // This helps ensure that markers created outside of the viewport are shifted towards when created
  function showListings() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < viewModel.markerList().length; i++) {

      viewModel.markerList()[i].setMap(map);
      bounds.extend(viewModel.markerList()[i].position);
    }

    map.fitBounds(bounds);
  }

  // // This draws a circle over the map, and removes outlying markers and their corresponding li elements
  // function applyFilter(centerPoint) {

  //   // Defines the circle to use as a visual for the filter
  //   activeFilter = new google.maps.Circle({
  //     strokeColor: '#D190D4',
  //     strokeOpacity: 0.6,
  //     strokeWeight: 2,
  //     fillColor: '#D190D4',
  //     fillOpacity: 0.15,
  //     map: map,
  //     center: centerPoint,
  //     radius: parseInt(filterRadius.value) * 1609.34
  //   });

  //   var currentLength = viewModel.markerList().length;
  //   var filterRemoveArray = [];

  //   // Checks the distance between the Circle's origin point and the marker locations
  //   for (var i = 0; i < currentLength; i++) {

  //     var distance = google.maps.geometry.spherical.computeDistanceBetween(viewModel.markerList()[i].position, centerPoint);

  //     // Removes overlying markers from the map and pushes them into the fitlerRemoveArray for deletion
  //     if (distance > activeFilter.radius) {
  //       viewModel.markerList()[i].setMap(null);
  //       filterRemoveArray.push(viewModel.markerList()[i]);
  //     }
  //   }

  //   var currentFilteredLength = filterRemoveArray.length;

  //   // Uses the removeButton function to completely clear out the filtered markers
  //   for (var ii = 0; ii < currentFilteredLength; ii++) {
  //     removeButton(filterRemoveArray[ii]);
  //   }

  //   // Resets the filtered array for next time :P
  //   filterRemoveArray = [];

  //   // Sets the state for the filter being active, and disables the ability to add another filter
  //   viewModel.filter(true);
  //   viewModel.searchEnable(false);

  //   search.value = "Clear filter to use";
  //   filterRadius.value = parseInt(filterRadius.value) + " miles";

  //   // Calls function to enable removeFilter functionality
  //   removeFilter(activeFilter);

  // }

  // // Enables the removeFilter button
  // function removeFilter(currentFilter) {

  //   // *** Note to reviewer: I use jQuery below because it only handles the Google Map directly.
  //   $("#filterButtonClear").click(function() {

  //     if(currentFilter) {
  //       currentFilter.setMap(null);
  //     }
  //     // Google Maps recommends doing this to completely remove the overlay
  //     currentFilter = null;
  //   });
  // }

  // Call zoomToFilter when filter button is clicked
  // $("#filterButton").click(function () {

  //     zoomToFilter();

  // });

  // // Set this function outside of the eventListener incase any other function would use it later
  // function zoomToFilter() {

  // // Initialize the geocoder.
  //   var geocoder = new google.maps.Geocoder();

  //   // Get the address or place that the user entered.
  //   var address = filter.value;

  //   // Make sure the address isn't blank.
  //   if (address === '') {
  //     window.alert('You must enter a place, or address.');
  //   } else {

  //     // Geocode the address/area entered to get the center. Then, center the map
  //     // on it and zoom in
  //     geocoder.geocode(
  //       { address: address,
  //         bounds: map.getBounds(),
  //         region: "Bucks County, PA"
  //       }, function(results, status) {
  //         if (status == google.maps.GeocoderStatus.OK) {
  //           map.setCenter(results[0].geometry.location);
  //           var centerPoint = results[0].geometry.location;
  //           applyFilter(centerPoint);
  //           map.setZoom(12);
  //         } else {
  //           window.alert('We could not find that location - try entering a more' +
  //           ' specific place.');
  //       }
  //     });
  //   }
  // }

  // markerButton.addEventListener("click", addMarker, false); //   this doesn't work, because getPlaces() is
  // search.addEventListener("keypress", addMarker, false);    //  an ajax call that's designed to work with
                                                               //   the "places_changed" event specifically

  // Search box input and marker generation
  searchBox.addListener("places_changed", addMarker);

  function addMarker() {

      // Google function to return auto-search locations
      var places = searchBox.getPlaces();

      // Error checking incase something doesn't work
      if (!places) {
        alert("Search failed: please try your search again");
        return;
      }

      // Error checking incase an empty value is returned
      if (places.length === 0) {
        alert("No search Results, please try again");
        return;
      }

      var id = 0;

      // Sets markers down for each place found, including when multiple places are found
      places.forEach(function(place) {

        id+=1;

        // Push marker through Marker constructor
        var marker = new viewModel.Marker(place.name, place.geometry.location, id);

        // Add new marker to the observable array
        viewModel.markerList.push(marker);

        // Set new marker listener functionality
        defaultMarkerListener(marker);

        // Assign li listener for new marker
        listItemSelect();
      });

      // Assign new marker to a corresponding li in the side_bar *outside of loop*
      trackLiIndex();

      // Call fourSquare API function
      setFoursquareUrl(viewModel.markerList().length);

      // Reset search text via observable
      viewModel.searchActive("");
  }

  // Function to create custom marker icons (currently includes: defaultMarker and highlightedMarker)
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34)
      );
    return markerImage;
  }














  // // Make li selection active corresponding marker selection
  // function listItemSelect() {

  //   // Note to reviewer: I use jQuery for this because it's only handling the Google Map directly.
  //   $("li").click(function(item) {
  //     var id = item.target.id;
  //     var marker = viewModel.markerList()[id];

  //     // The following mimics functionality from when a user selects a marker (see defaultMarkerListener())
  //     populateInfoWindow(marker);

  //   });

  // }

  // Iniatize initial map functionality
  defineDefaultMarkerArray();
  showListings();
  listItemSelect();

  /* *************************************************s */

  // Prepare for AJAX API calls to Foursquare
  var thisLat,
    thisLng,
    thisName,
    foursquareUrl;

  // Prepare foursquare api call URL
  // Length is set as a parameter to detect whether or not there are multiple URLs to supply or not *several wawas, for example*
  function setFoursquareUrl(length) {

    var i = viewModel.markerList().length - 1;

    // Only create one URL when adding a new marker
    if (length) {

      foursquareUrl = "https://api.foursquare.com/v2/venues/search" +
                      "?client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +        // If these don't work, replace website URL
                      "&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK" +    // on foursquare app to generate new codes
                      "&v=20130815" +
                      "&limit=1" +
                      "&radius=1000" +
                      "&intent=checkin" +
                      "&ll=" + viewModel.markerList()[i].getPosition().lat() + "," + viewModel.markerList()[i].getPosition().lng() +
                      "&query=" + viewModel.markerList()[i].title;

      // Send completed URL to ajax call
      ajax(foursquareUrl, i);

    } else {

      // Create multiple URLs when creating multiple markers
      for (var j = 0; j <= i; j++) {

        foursquareUrl = "https://api.foursquare.com/v2/venues/search" +
                        "?client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +        // If these don't work, replace website URL
                        "&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK" +    // on foursquare app to generate new codes
                        "&v=20130815" +
                        "&limit=1" +
                        "&radius=1000" +
                        "&intent=checkin" +
                        "&ll=" + viewModel.markerList()[j].getPosition().lat() + "," + viewModel.markerList()[j].getPosition().lng() +
                        "&query=" + viewModel.markerList()[j].title;

        // Send completed URLs to ajax call
        ajax(foursquareUrl, j);
      }
    }

  }


  // AJAX request to foursquare API for image and link information, when available
  function ajax(FS_url, index) {

    $.ajax({
        url: FS_url,
        dataType: "jsonp"

    }).done(function(response) {

      // If nothing from foursquare, stop here
      if (!response.response.venues[0]) {
        return;
      }

      // If request takes too long, apologize to user
      var timeoutTest = setTimeout(function() {
        alert("An error occurred.  Please try again!");
      }, 3000);

      // Create image URL request based on current marker location
      var foursquarePhotoUrl =   "https://api.foursquare.com/v2/venues/" +
                    response.response.venues[0].id +
                    "/photos" +
                    "?v=20130815" +
                    "&limit=1" +
                    "&client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +
                    "&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK";

      // Set obs array .FS_url properties to the website URL supplied by Foursquare
      var webUrl = response.response.venues[0].url;
      viewModel.markerList()[index].FS_url = webUrl;


      $.ajax({
        url: foursquarePhotoUrl,
        dataType: "jsonp"

      }).done(function(photoResponse) {

        // If a photo is found, set its URL, and resize to 125x125 pixels
        if(photoResponse.response.photos.items.length === 1) {
          var photo = photoResponse.response.photos.items[0].prefix +
                "125x125" +
                photoResponse.response.photos.items[0].suffix;

          // Set obs array .FS_url_image value to photo source
          viewModel.markerList()[index].FS_url_image = photo;
        }

        // Clear timeout, since AJAX call finished successfully
        clearTimeout(timeoutTest);

      // Notify user if an error occurs
      }).fail(function() {
        alert("A problem occurred, please try your request again.");
      });

    }).fail(function() {
        alert("A problem occurred, please try your request again.");
    });
  }

  // Initialize foursquare data for preset markers
  setFoursquareUrl();

} // End initMap()

















// This function sets obs array viewModel.markerList objects' id property, syncing it with it's obs array index value.
// This is used to help synchronize li elements with their corresponding marker, and vice versa.

// *** Note to reviewer: I've refactored the functions that are dependent upon trackLiIndex(), and they
// no longer use jQuery impermissably.
function trackLiIndex() {

  for (var i = 0; i < viewModel.markerList().length; i++) {
    $("ul li:eq(" + i + ")").attr("id", i);
    viewModel.markerList()[i].id = i;
  }
}

/* *************************************************************************** */















// Alert user when Google Map fails to load (called in html script tag)
function googleError() {
  alert("Google Maps failed to load.  Please refresh the page to try again.");
}


// This creates the infoWindow
function populateInfoWindow(marker) {

  console.log(marker);

  var infowindow,
      image = marker.FS_url_image,
      url = marker.FS_url,
      title = marker.title;

  // Check if the infoWindow is already open
  if(marker.infowindow) {
      marker.infowindow.close();
  }

  for (var j = 0; j < viewModel.markerList().length; j++) {
    if (viewModel.markerList()[j].infowindow) {
      viewModel.markerList()[j].infowindow.close();
    }
  }

    // Adjust infoWindow content depending on what data foursquare returns
    var contentDiv =  '<div class="infoWindow">';
    if(image && url) {
      contentDiv +=   '<h3><a href="'+ url +'">'+ marker.title +'</a></h3>' +
                      '<a href="'+ url +'"><img width="125" alt="'+ marker.title +'"src="'+ image +'"/></a>' +
                      '</div>';
    } else if (image && !url) {
      contentDiv +=   '<h3>'+ marker.title +'</h3>' +
                      '<img width="125" alt="'+ marker.title +'"src="'+ image +'"/>' +
                      '</div>';
    } else if (!image && url) {
      contentDiv +=   '<a href="'+ url +'"><h3>'+ marker.title +'</h3></a>' +
                      '</div>';
    } else {
      contentDiv +=   '<h3>'+ marker.title +'</h3>' +
                      '</div>';
    }

    // Set infoWindow content and open it

    infowindow = new google.maps.InfoWindow();
    infowindow.setContent( contentDiv );
    infowindow.open(map, marker);

    // Activate Google Map's default close function for the infoWindow
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    for (var i = 0; i < viewModel.markerList().length; i++) {
      if (viewModel.markerList()[i].title == title.toString()) {
        viewModel.markerList()[i].infowindow = infowindow;
      }
    }
}

// UI














// Set this function outside of the eventListener incase any other function would use it later
  function zoomToFilter() {

  // Initialize the geocoder.
    var geocoder = new google.maps.Geocoder();

    // Get the address or place that the user entered.
    var address = filter.value;
        console.log("happy");

    // Make sure the address isn't blank.
    if (address === '') {
      window.alert('You must enter a place, or address.');
    } else {

      // Geocode the address/area entered to get the center. Then, center the map
      // on it and zoom in
      geocoder.geocode(
        { address: address,
          bounds: map.getBounds(),
          region: "Bucks County, PA"
        }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var centerPoint = results[0].geometry.location;
            applyFilter(centerPoint);
            map.setZoom(12);
          } else {
            window.alert('We could not find that location - try entering a more' +
            ' specific place.');
        }
      });
    }
  }

// This draws a circle over the map, and removes outlying markers and their corresponding li elements
  function applyFilter(centerPoint) {

    console.log("happier");

    // Defines the circle to use as a visual for the filter
    activeFilter = new google.maps.Circle({
      strokeColor: '#D190D4',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: '#D190D4',
      fillOpacity: 0.15,
      map: map,
      center: centerPoint,
      radius: parseInt(filterRadius.value) * 1609.34
    });

    var currentLength = viewModel.markerList().length;
    var filterRemoveArray = [];

    // Checks the distance between the Circle's origin point and the marker locations
    for (var i = 0; i < currentLength; i++) {

      console.log("happierier");

      var distance = google.maps.geometry.spherical.computeDistanceBetween(viewModel.markerList()[i].position, centerPoint);

      // Removes overlying markers from the map and pushes them into the fitlerRemoveArray for deletion
      if (distance > activeFilter.radius) {
        viewModel.markerList()[i].setMap(null);
        filterRemoveArray.push(viewModel.markerList()[i]);
      }
    }

    var currentFilteredLength = filterRemoveArray.length;

    // Uses the removeButton function to completely clear out the filtered markers
    for (var ii = 0; ii < currentFilteredLength; ii++) {
      removeButton(filterRemoveArray[ii]);
    }

    // Resets the filtered array for next time :P
    filterRemoveArray = [];

    // Sets the state for the filter being active, and disables the ability to add another filter
    viewModel.filter(true);
    viewModel.searchEnable(false);

    search.value = "Clear filter to use";
    filterRadius.value = parseInt(filterRadius.value) + " miles";

  }


// Enables the removeFilter button
  function removeFilter() {

      if(activeFilter) {
        activeFilter.setMap(null);
      }
      // Google Maps recommends doing this to completely remove the overlay
      activeFilter = null;

      filter.value = "";
      filterRadius.value = "";
      search.value = "";

      // Set ko.js states to disable filter elements
      viewModel.filter(false);
      viewModel.searchEnable(true);
  }











// Make Google and foursquare attribution text disappear if clicked
$(".attribution").click(function() {
  $(".attribution").fadeOut();
});

// Make Google and foursquare attribution text disappear after 8 seconds
setTimeout(function() {
  $(".attribution").fadeOut();
}, 8000);

// This custom ko.handler tracks and adjusts the side_bar and top_bar animations depending on screen size and orientation
ko.bindingHandlers.toggleClick = {
  init: function (element, valueAccessor) {
    var value = viewModel.navToggleBool();

    // Set default shift value for animation positions
    var shift = -20;

    // On small screens and medium mobile screens in portrait, start shift at position 0
    if (window.matchMedia('(max-width: 750px)').matches)
      { shift = 0; }
    if (window.matchMedia('(min-width: 751px) and (max-width: 1150px), (orientation: portrait)').matches)
      { shift = 0; }

    // Set click handler based on toggleClick value
    ko.utils.registerEventHandler(element, "click", function () {

      // Template animate functions, using shift as the position variable
      $("#side_bar").animate({
          left: shift + "vw",
        }, 350);
      $("#top_bar").animate({
          left: shift + "vw",
        }, 350);

      // Small screen adjustment
      if (shift === 60) {
        setTimeout(function(){
          $("#top_bar").css("width", "40vw");
        }, 400);
        viewModel.mobileScroll(false);
      } else {
        $("#top_bar").css("width", "100%");
      }

      // Switch navToggleBool value (T/F)
      viewModel.navToggleBool(!viewModel.navToggleBool());

      // Check if click has been triggered yet or not
      if (!viewModel.navToggleBool())   { shift = 0;}

      // Small screen shift variable controller
      else if (viewModel.navToggleBool() && window.matchMedia('(max-width: 750px)').matches)
                                        { shift = 60;
                                          setTimeout(function() {
                                            viewModel.mobileScroll(true);
                                          }, 300);
                                        }

      // Mid-sized mobile screen, and mobile screen in portrait, adjustments
      else if (viewModel.navToggleBool() && window.matchMedia('(min-width: 751px) and (max-width: 1150px), (orientation: portrait)').matches) {
                                        { shift = -30; }
      }
      // Default shift value adjustment
      else                              { shift = -20; }
    });
  }
};

function listItemSelection(item) {

  console.log(item);

  var marker = viewModel.markerList()[item.id];

  for(var i = 0; i < viewModel.markerList().length; i++) {

    viewModel.markerList()[i].setIcon(defaultIcon);
    viewModel.markerList()[i].colorId(false);
    viewModel.markerList()[i].activeButton(false);
  }

  marker.setIcon(highlightedIcon);
  marker.colorId(true);
  marker.activeButton(true);

  id = parseInt(id);
  viewModel.selectedLi(id);

  populateInfoWindow(item);


}

// Functionality for when removing a marker via the li removeButton
function removeButton(marker) {
  var thisId = marker.id;

  marker.setMap(null);
  viewModel.markerList.remove(marker);
  trackLiIndex();
  viewModel.selectedLi("");
}




// Set Knockout.js viewModel object
var viewModel = {

  // This is the marker constructor for all Google Map markers
  Marker: function(title, location, id) {
    var self = this;

    var marker =  new google.maps.Marker({
      map: map,
      title: title,
      position: location,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      colorId: ko.observable(false),
      activeButton: ko.observable(false),
      customLatLng: location,
      id: ko.observable(id)
    });

    return marker;
  },

  markerList: ko.observableArray([]),

  navToggleBool: ko.observable(true),

  searchActive: ko.observable(""),
  searchEnable: ko.observable(true),

  selectedLi: ko.observable(),
  filter: ko.observable(),

  mobileScroll: ko.observable(true),

  filterSearchInput: ko.observable(),
  filterRadiusInput: ko.observable(),

  // This checks if the user has input anything into both the filter searchBox and the filter Radius box
  filterReady: ko.pureComputed(function(){
    if (!viewModel.filterSearchInput() || !viewModel.filterRadiusInput()) {
      return false;
    }
    if ( viewModel.filterSearchInput().length && viewModel.filterRadiusInput()) {
      return true;
    } else {
      return false;
    }
  })

};

// Apply KO.js
ko.applyBindings(viewModel);

