var map,
	markers = [],
	id = [],
	currentLi = [],
	wikiUrl,
	infoWindow,
	search,
	searchBox,
	removeMarker,
	defaultIcon,
	highlightedIcon,
	markerList,
	styleArray;

	// TO-DO:
	//X Add remove location button next to each list item
	//X Make list items clickable/selectable
	//X Add foursquare content to infoWindows for each location selected
	// Create dynamic side-bar containing the list and text input
	// Add touch functionality
	// make sure ui is responsive
	// Add error handling for API AJAX requests

	// Bugs:
	//X markerList().length = 10;
	//X icon doesn't change on selection
	//X markerList doesn't update the ul when new markers are added
	//X Need to make marker disappear when item is removed from the obsArray via the remove button
	// map doesn't reposition south all the way when marker is selected south of viewport (minor)


	// Current task:



markerList = ko.observableArray([]);

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

	search = document.getElementById("searchBox");
	searchBox = new google.maps.places.SearchBox(search);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);

	// Focus SearchBox results on the current map viewport
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	defaultIcon = makeMarkerIcon('B590D4');
	highlightedIcon = makeMarkerIcon('FFFA73');

	// Generates default markers on the google map
	function defineDefaultMarkerArray(){

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
			populateInfoWindow(this, infoWindow, this.FS_url_image, this.FS_url);

			for(var i = 0; i < markerList().length; i++) {

				markerList()[i].setIcon(defaultIcon);
				markerList()[i].colorId = false;
			}

			this.setIcon(highlightedIcon);
			this.colorId = true;

		});
	}

	// this creates the infoWindow
	function populateInfoWindow(marker, infowindow, image, url) {		// Order of operations can be optimized
        if (infowindow.marker != marker) {
			infowindow.marker = marker;

			var contentDiv = 	'<div class="infoWindow">';

			if(image && url) {

				contentDiv +=		'<h3><a href="' + url + '">' + marker.title + '</a></h3>' +
									'<a href="' + url + '">' + '<img width="125" alt="' + marker.title + '"src="' + image + '"></img></a>' +
								'</div>';
			} else if (image && !url) {

				contentDiv +=		'<h3>' + marker.title + '</h3>' +
									'<img width="125" alt="' + marker.title + '"src="' + image + '"></img>' +
								'</div>';
			} else if (!image && url) {

				contentDiv +=		'<a href="' + url + '"><h3>' + marker.title + '</h3></a>' +
								'</div>';
			} else {

				contentDiv += 		'<h3>' + marker.title + '</h3>' +
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

	// Search box input and marker generation
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();
		if (places.length === 0) {
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
	});

	// function hideListings() {
	// 	for (var i = 0; i < markers.length; i++) {
	// 		markers[i].setMap(null);
	// 	}
	// }

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

				populateInfoWindow(marker, infoWindow, marker.FS_url_image, marker.FS_url);

				for(var i = 0; i < markerList().length; i++) {

					markerList()[i].setIcon(defaultIcon);
					markerList()[i].colorId = false;
				}

				marker.setIcon(highlightedIcon);
				marker.colorId = true;

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


		    }).fail(function() {
		    	// notify user
		    });

		}).fail(function() {
		    // notify user
		});
	} // add timeout


	setFoursquareUrl();

} // End initMap()


function trackLiIndex() {

	for (var i = 0; i < markerList().length; i++) {
		$("ul li:eq(" + i + ")").attr("id", i);
		markerList()[i].id = i;
	}
}

// Knockout JS :`(
function removeButton(marker) {
	var thisId = marker.id;

	marker.setMap(null);
	markerList.remove(marker);
	trackLiIndex();
}

var viewModel = {

	Marker: function(title, location) {
	var self = this;

	var marker =  new google.maps.Marker({
		map: map,
		title: title,
		position: location,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP,
		colorId: false
	});

	return marker;
	}

};

ko.applyBindings(viewModel);


