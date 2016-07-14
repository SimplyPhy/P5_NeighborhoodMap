var map,
	markers = [],
	id = [],
	currentLi = [],
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
	// Make list items clickable/selectable
	// Add wikimedia content to infoWindows for each location selected
	// Create dynamic side-bar containing the list and text input
	// Add touch functionality
	// make sure ui is responsive
	// Add error handling for API AJAX requests

	// Bugs:
	//X markerList().length = 10;
	//X icon doesn't change on selection
	//X markerList doesn't update the ul when new markers are added
	// Need to make marker disappear when item is removed from the obsArray via the remove button

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

	// var marker = new google.maps.Marker({
	// 		position: position,
	// 		title: title,
	// 		icon: defaultIcon,
	// 		animation: google.maps.Animation.DROP,
	// 		id: i,
	// 		colorId: false
	// 	});

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

	// var contentString = '<div id="content">' +
	// 	'<div id="siteNotice">' +
	// 	'</div>' +
	// 	'<h2 id="firstHeading" class="firstHeading">Starbucks</h1>' +
	// 	'<p>The <b>Doylestown Starbucks</b> is super, thanks for asking!</p>' +
	// 	'</div>';

	// var infowindow = new google.maps.InfoWindow({
	// 	content: contentString
	// });

	defaultIcon = makeMarkerIcon('B590D4');
	highlightedIcon = makeMarkerIcon('FFFA73');

	// original marker auto-populate based on markerList() data

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

	}

	// console.log(markerList());
	function defaultMarkerListener(marker) {
		marker.addListener('click', function() {
			populateInfoWindow(this, infoWindow);

			for(var i = 0; i < markerList().length; i++) {
				// console.log(markerList()[i]);
				markerList()[i].setIcon(defaultIcon);
				markerList()[i].colorId = false;
			}

			this.setIcon(highlightedIcon);
			this.colorId = true;
			// console.log(markerList());
		});
	}

	// this creates the infoWindow
	//>> This is where wikimedia data will go
	function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
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

			// var marker = new google.maps.Marker({
			// 	map: map,
			// 	position: place.geometry.location,
			// 	title: place.name,
			// 	icon: defaultIcon,
			// 	animation: google.maps.Animation.DROP,
			// 	id: places.length,
			// 	colorId: true
			// });

			var marker = new viewModel.Marker(place.name, place.geometry.location);
			// console.log(marker);

			markerList.push(marker);

			defaultMarkerListener(marker);
		});
		trackLiIndex();
	});

	// removeMarker = document.getElementsByClassName("removeMarker");
	// console.log(removeMarker);

	// function setRemoveListeners () {
	// 	var i = 0;
	// 	removeMarker.foreach(function() {
	// 		removeMaker[i].addEventListener( "click", function(){

	// 		});
	// 		i++;
	// 	});
	// }
	// removeMarker.addEventListener('click', function(){
	// 	console.log("happy");
	// });

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

	defineDefaultMarkerArray();
	showListings();


} // End initMap()

function trackLiIndex() {

	for (var i = 0; i < markerList().length; i++) {
		$("ul li:eq(" + i + ")").attr("id", i);
		markerList()[i].index = i;
	}
	console.log(markerList());
}


// Knockout JS :`(
function removeButton(marker) {
	markerList.remove(marker);
	trackLiIndex();
	// markerList()[?].setMap(null);  <--- needs a way to find which array index to setMap to
	console.log(markerList());
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
	// console.log(markerList().length);

	return marker;
	}

};

ko.applyBindings(viewModel);
trackLiIndex();
// new Marker("Chalfont", "{lat: 40.31, lng: -75.15}");