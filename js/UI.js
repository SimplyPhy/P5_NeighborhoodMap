var viewModel = {
	markerList: ko.observableArray([
		{title: 'Doylestown Starbucks', location: {lat: 40.310323, lng: -75.130746}},
		{title: 'Central Bucks Family YMCA', location: {lat: 40.303162, lng: -75.140643}},
		{title: 'Peace Valley Park', location: {lat: 40.329817, lng: -75.192421}},
		{title: 'California Tortilla', location: {lat: 40.304436, lng: -75.129210}},
		{title: 'Five Ponds Golf Course', location: {lat: 40.219718, lng: -75.112137}}
	])
};
ko.applyBindings(viewModel);