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
	markerList,
	styleArray,
	locations,
	filter,
	filterSpot,
	filterRadius,
	filterButtonClear;

	// TO-DO:
	//X Add remove location button next to each list item
	//X Make list items clickable/selectable
	//X Add foursquare content to infoWindows for each location selected
	//X Create dynamic side-bar containing the list and text input
	//X Add touch functionality
	// make sure ui is responsive
	//X Add error handling for API AJAX requests

	// Bugs:
	//X markerList().length = 10;
	//X icon doesn't change on selection
	//X markerList doesn't update the ul when new markers are added
	//X Need to make marker disappear when item is removed from the obsArray via the remove button
	// (minor) map doesn't reposition south all the way when marker is selected south of viewport
	//X (minor) when searching "churchville, pa" for a new marker, everything works, but console logs an error


	// Current task: Make UI mobile friendly :D!!



markerList = ko.observableArray([]);
filterSpot = null;
search = document.getElementById("searchBox");
locations = document.getElementById("locations");
filter = document.getElementById("filterBox");
filterRadius = document.getElementById("filterRadius");
filterButtonClear = document.getElementById("filterButtonClear");
filterButton = document.getElementById("filterButton");

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


function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 40.31, lng: -75.185},
			zoom: 13,
			styles: styleArray,
			mapTypeControl: false
	    });

	infoWindow = new google.maps.InfoWindow();

	// filter = document.getElementById("filterBox");
	filterBox = new google.maps.places.SearchBox(filter);

	// search = document.getElementById("searchBox"); // now called in the global scope at top
	searchBox = new google.maps.places.SearchBox(search);
	// map.controls[google.maps.ControlPosition.TOP_LEFT].push(search); // Removed searchbox from google map

	// Focus SearchBox results on the current map viewport
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
		filterBox.setBounds(map.getBounds());
	});

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

			markerList.push(marker1);
			markerList.push(marker2);
			markerList.push(marker3);
			markerList.push(marker4);
			markerList.push(marker5);

			defaultMarkerListener(marker1);
			defaultMarkerListener(marker2);
			defaultMarkerListener(marker3);
			defaultMarkerListener(marker4);
			defaultMarkerListener(marker5);

			trackLiIndex();

	}

	function defaultMarkerListener(marker) {

		marker.addListener('click', function() {

			var locationsArray = locations.getElementsByTagName("li");

			populateInfoWindow(this, infoWindow, this.FS_url_image, this.FS_url);
			$(".li").css("background-color", "black");
			$(".li_div").css("background-color", "black");

			id = parseInt(marker.id);
			viewModel.selectedLi(id);

			for(var i = 0; i < markerList().length; i++) {

				markerList()[i].setIcon(defaultIcon);
				markerList()[i].colorId = false;

				if (i === id) {
					locationsArray[i].style.backgroundColor = "#6B8C5F";
					locationsArray[i].parentNode.style.backgroundColor = "#6B8C5F";
				}
			}


			this.setIcon(highlightedIcon);
			this.colorId = true;

		});
	}

	// this creates the infoWindow
	function populateInfoWindow(marker, infowindow, image, url) {
        if (infowindow.marker != marker) {
			infowindow.marker = marker;

			var contentDiv = 	'<div class="infoWindow">';
			if(image && url) {
				contentDiv +=		'<h3><a href="'+ url +'">'+ marker.title +'</a></h3>' +
									'<a href="'+ url +'"><img width="125" alt="'+ marker.title +'"src="'+ image +'"/></a>' +
								'</div>';
			} else if (image && !url) {
				contentDiv +=		'<h3>'+ marker.title +'</h3>' +
									'<img width="125" alt="'+ marker.title +'"src="'+ image +'"/>' +
								'</div>';
			} else if (!image && url) {
				contentDiv +=		'<a href="'+ url +'"><h3>'+ marker.title +'</h3></a>' +
								'</div>';
			} else {
				contentDiv += 		'<h3>'+ marker.title +'</h3>' +
								'</div>';
			}

			infowindow.setContent(

				contentDiv


			);

			infowindow.open(map, marker);
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			});
        }
    }

	function showListings() {
		var bounds = new google.maps.LatLngBounds();

		for (var i = 0; i < markerList().length; i++) {

			markerList()[i].setMap(map);
			bounds.extend(markerList()[i].position);
		}

		map.fitBounds(bounds);
	}

	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.CIRCLE,
		drawingControl: false,
    }); // this is the drawing initialization

	/* **************************************** */
	// https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB3TDBhlOLkHGkU6zqQ6PQjp2AL_AlLpd0&latlng=40.3,-75.1


	drawingManager.addListener("overlaycomplete", function(event) {

		if (filterSpot) {
			filterSpot = null;
		}

		// deactivate the hand cursor functionality
		drawingManager.setDrawingMode(null);

		filterSpot = event.overlay;

		filterMap();


	});

	function applyFilter(centerPoint) {

		activeFilter = new google.maps.Circle({
			strokeColor: '#D190D4',
			strokeOpacity: 0.6,
			strokeWeight: 2,
			fillColor: '#D190D4',
			fillOpacity: 0.15,
			map: map,
			center: centerPoint,
			radius: filterRadius.value * 1609.34
		});

		var currentLength = markerList().length;
		var filterRemoveArray = [];

		for (var i = 0; i < currentLength; i++) {

			var distance = google.maps.geometry.spherical.computeDistanceBetween(markerList()[i].position, centerPoint);

			if (distance > activeFilter.radius) {
				markerList()[i].setMap(null);
				filterRemoveArray.push(markerList()[i]);
			}
		}

		// The following removes modifies the outlying markers
		var currentFilteredLength = filterRemoveArray.length;

		for (var ii = 0; ii < currentFilteredLength; ii++) {
			removeButton(filterRemoveArray[ii]);
		}

		filterRemoveArray = [];

		viewModel.filter(true);
		viewModel.searchEnable(false);

		search.value = "Clear filter to use";
		filterRadius.value += " miles";

		removeFilter(activeFilter);

	}

	function removeFilter(currentFilter) {
		$("#filterButtonClear").click(function(evt) {

			filter.value = "";
			filterRadius.value = "";
			console.log(currentFilter);
			if(currentFilter) {
				currentFilter.setMap(null);
			}
			currentFilter = null;
			viewModel.filter(false);
			viewModel.searchEnable(true);
			search.value = "";
		});
	}


	$("#filterButton").click(function () {

			zoomToFilter();

	});

	function zoomToFilter() {
	// Initialize the geocoder.
		var geocoder = new google.maps.Geocoder();
		// Get the address or place that the user entered.
		var address = filter.value;
		// Make sure the address isn't blank.
		if (address === '') {
			window.alert('You must enter a place, or address.');
		} else {

			// Geocode the address/area entered to get the center. Then, center the map
			// on it and zoom in
			geocoder.geocode(
				{ address: address
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



/* **************************************** */



	// Search box input and marker generation

	// markerButton.addEventListener("click", addMarker, false);// 	this didn't work, because getPlaces() is
	// search.addEventListener("keypress", addMarker, false);	//	an ajax call that's designed to work with
																// 	the "places_changed" event specifically

	searchBox.addListener("places_changed", addMarker);

	function addMarker() {

			var places = searchBox.getPlaces();

			if (!places) {
				alert("Search failed: please try your search again");
				return;
			}

			if (places.length === 0) {
				alert("No search Results, please try again");
				return;
			}

			places.forEach(function(place) {

				var marker = new viewModel.Marker(place.name, place.geometry.location);

				markerList.push(marker);

				defaultMarkerListener(marker);
				listItemSelect();
			});
			trackLiIndex();
			setFoursquareUrl(markerList().length);
			viewModel.searchActive("");
		// }, timeout);
	}

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


	function listItemSelect() {

			$("li").click(function(item) {
				var id = item.target.id;
				var marker = markerList()[id];

				$(".li").css("background-color", "black");
				$(".li_div").css("background-color", "black");

				populateInfoWindow(marker, infoWindow, marker.FS_url_image, marker.FS_url);

				for(var i = 0; i < markerList().length; i++) {

					markerList()[i].setIcon(defaultIcon);
					markerList()[i].colorId = false;
				}

				marker.setIcon(highlightedIcon);
				marker.colorId = true;

				$(this).css("background-color", "#6B8C5F");
				$(this).parent().css("background-color", "#6B8C5F");


				id = parseInt(id);
				viewModel.selectedLi(id);
			});

	}

	defineDefaultMarkerArray();
	showListings();
	listItemSelect();

	var thisLat,
		thisLng,
		thisName,
		foursquareUrl;

	function setFoursquareUrl(length) {

		var i = markerList().length - 1;

		if (length) {

			foursquareUrl = "https://api.foursquare.com/v2/venues/search" +
			  				"?client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +			// These might not work. Replace website URL
			  				"&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK" +		// on foursquare app to generate new codes
							"&v=20130815" +
							"&limit=1" +
							"&radius=1000" +
							"&intent=checkin" +
							"&ll=" + markerList()[i].getPosition().lat() + "," + markerList()[i].getPosition().lng() +
							"&query=" + markerList()[i].title;  // This will need to be markerList.title

			ajax(foursquareUrl, i);

		} else {

			for (var j = 0; j <= i; j++) {

				foursquareUrl = "https://api.foursquare.com/v2/venues/search" +
			  				"?client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +			// These might not work. Replace website URL
			  				"&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK" +		// on foursquare app to generate new codes
							"&v=20130815" +
							"&limit=1" +
							"&radius=1000" +
							"&intent=checkin" +
							"&ll=" + markerList()[j].getPosition().lat() + "," + markerList()[j].getPosition().lng() +
							"&query=" + markerList()[j].title;

				ajax(foursquareUrl, j);
			}
		}

	}


	function ajax(FS_url, index) {

		$.ajax({
		    url: FS_url,
		    dataType: "jsonp"

		}).done(function(response) {

			if (!response.response.venues[0]) {
				return;
			}

			var timeoutTest = setTimeout(function() {
				alert("An error occurred.  Please try again!");
			}, 3000);

		    var foursquarePhotoUrl = 	"https://api.foursquare.com/v2/venues/" +
			    						response.response.venues[0].id +
			    						"/photos" +
			    						"?v=20130815" +
			    						"&limit=1" +
			    						"&client_id=0PZDERVZX2X0G0I542Y1USL1UQUFVPATWVPGSLEZZ4H1E3QU" +
			    						"&client_secret=1OGYRAXRUWB1KZO4QSMB5G5F0HS2WYUCWKJMRVVVWDPIJGXK";

		    var webUrl = response.response.venues[0].url;
		    markerList()[index].FS_url = webUrl;


		    $.ajax({
		    	url: foursquarePhotoUrl,
		    	dataType: "jsonp"

		    }).done(function(photoResponse) {

		    	if(photoResponse.response.photos.items.length === 1) {
			    	var photo = photoResponse.response.photos.items[0].prefix +
			    				"125x125" +
			    				photoResponse.response.photos.items[0].suffix;

		    		markerList()[index].FS_url_image = photo;
		    	}

		    	clearTimeout(timeoutTest);

		    }).fail(function() {
		    	alert("A problem occurred, please try your request again.");
		    });

		}).fail(function() {
		    alert("A problem occurred, please try your request again.");
		});
	}


	setFoursquareUrl();

} // End initMap()


function trackLiIndex() {

	for (var i = 0; i < markerList().length; i++) {
		$("ul li:eq(" + i + ")").attr("id", i);
		markerList()[i].id = i;
	}
}



// UI

// $( window ).on( "orientationchange", function( event ) {
//   $("#side_bar").css(
//     "margin-left", "-30vw"
//   );
//   $("#top_bar").css(
//     "margin-left", "0vw"
//   );
//   viewModel.navToggleBool(!viewModel.navToggleBool());
// });


ko.bindingHandlers.toggleClick = {
	init: function (element, valueAccessor) {
		var value = viewModel.navToggleBool();
		var shift = -20;

		if (window.matchMedia('(max-width: 750px)').matches)
		{ shift = 0; }

    if (window.matchMedia('(orientation: portrait)').matches)
      { shift = 0; }

		ko.utils.registerEventHandler(element, "click", function () {
			$("#side_bar").animate({
					left: shift + "vw",
				}, 350);
			$("#top_bar").animate({
					left: shift + "vw",
				}, 350);

			if (shift === 60) {
				setTimeout(function(){
					$("#top_bar").css("width", "40vw");
				}, 400);
        viewModel.mobileScroll(false);
			} else {
				$("#top_bar").css("width", "100%");
			}
			viewModel.navToggleBool(!viewModel.navToggleBool());

			if (!viewModel.navToggleBool()) 	{ shift = 0;}
			else if (viewModel.navToggleBool() && window.matchMedia('(max-width: 750px)').matches)
												                { shift = 60;
                                          setTimeout(function() {
                                            viewModel.mobileScroll(true);
                                          }, 300);
                                        }
      else if (viewModel.navToggleBool() && window.matchMedia('(orientation: portrait)').matches) {
                                        { shift = -30; }
      }
			else 							                { shift = -20; }
		});
	}
};

function removeButton(marker) {
	var thisId = marker.id;

	marker.setMap(null);
	markerList.remove(marker);
	trackLiIndex();
	viewModel.selectedLi("");
}

var viewModel = {
	navToggleBool: ko.observable(true),

	searchActive: ko.observable(""),
	searchEnable: ko.observable(true),

	selectedLi: ko.observable(),
	filter: ko.observable(),

  mobileScroll: ko.observable(true),

	Marker: function(title, location) {
		var self = this;

		var marker =  new google.maps.Marker({
			map: map,
			title: title,
			position: location,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			colorId: false,
			customLatLng: location
		});

		return marker;
	}

};

var searching = ko.observable(search.value.length);

function AppViewModel() {

	var self = this;

	self.filterSearchInput = ko.observable();
	self.filterRadiusInput = ko.observable();

	self.filterReady = ko.computed(function(){
		if (!self.filterSearchInput() || !self.filterRadiusInput()) { return false; }

		if ( self.filterSearchInput().length && self.filterRadiusInput()) {
			return true;
		} else {
			return false;
		}
	});


}

ko.applyBindings(new AppViewModel());


// Fixes scrolling overflow on mobile
// var fixedSide = document.getElementById('side_bar');
// var fixedTop = document.getElementById('top_bar');

// fixedSide.addEventListener('touchmove', function(e) {
//         e.preventDefault();
// }, false);

// fixedTop.addEventListener('touchmove', function(e) {
//         e.preventDefault();
// }, false);
