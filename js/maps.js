var map,
	markers = [],
	id = [],
	infoWindow,
	search,
	searchBox,
	defaultIcon,
	highlightedIcon,
	markerList,
	styleArray;

	// Issues:
	//X markerList().length = 10;
	// icon doesn't change on selection

markerList = ko.observableArray([

	{
		title: 'Doylestown Starbucks',
		position: {lat: 40.310323, lng: -75.130746},

		map: map,
		icon: defaultIcon,
		// animation: google.maps.Animation.DROP,
		id: ko.observable(0),
		colorId: false
	}, {
		title: 'Central Bucks Family YMCA',
		position: {lat: 40.303162, lng: -75.140643},

		map: map,
		icon: defaultIcon,
		// animation: google.maps.Animation.DROP,
		id: ko.observable(1),
		colorId: false
	}, {
		title: 'Peace Valley Park',
		position: {lat: 40.329817, lng: -75.192421},

		map: map,
		icon: defaultIcon,
		// animation: google.maps.Animation.DROP,
		id: ko.observable(2),
		colorId: false
	}, {
		title: 'California Tortilla',
		position: {lat: 40.304436, lng: -75.129210},

		map: map,
		icon: defaultIcon,
		// animation: google.maps.Animation.DROP,
		id: ko.observable(3),
		colorId: false
	}, {
		title: 'Five Ponds Golf Course',
		position: {lat: 40.219718, lng: -75.112137},

		map: map,
		icon: defaultIcon,
		// animation: google.maps.Animation.DROP,
		id: ko.observable(4),
		colorId: false
	}]
);

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
		for (var i = 0; i < markerList().length; i++) {

			markerList()[i].map = map;
			markerList()[i].animation = google.maps.Animation.DROP;

			var value = markerList()[i];
			var marker = new google.maps.Marker(value);

			markerList()[i] = marker;
			markerList()[i].setIcon(defaultIcon);

			console.log(markerList().length);
			defaultMarkerListener(marker);
		}
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
			console.log(markerList());
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

			var marker = new Marker(place.name, place.geometry.location, place.length);
			// console.log(marker);

			markerList().push(marker);
			// markers.push(marker);  --> causes new markers to not change color when deselected

			defaultMarkerListener(marker);
		});
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

	defineDefaultMarkerArray();
	showListings();



} // End initMap()

// Knockout JS :`(
function Marker(title, location, id) {
	var self = this;

	var marker =  new google.maps.Marker({
		map: map,
		title: title,
		position: location,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP,
		id: ko.observable(id),
		colorId: false
	});
	console.log(markerList().length);

	return marker;

}

function viewModel() {
	var self = this;

	// self.createMarker = function(title, location, id){
	// 	var name = title;
	// 	var latlng = location;
	// 	var newid = id;

	// 	self.markerList.push(new Marker(name, latlng, newid));
	// };
}

ko.applyBindings(new markerList());

// new Marker("Chalfont", "{lat: 40.31, lng: -75.15}");