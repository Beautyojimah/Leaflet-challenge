// Initialize the map object and set the initial view to the coordinates [37.7749, -122.4194] and zoom level 5
var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5
});

// Define the tile layer and add it to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define the URL for the earthquake data
var earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Define the function to get the color based on the earthquake depth
function getColor(depth) {
    return depth > 90 ? '#BF360C':
           depth > 70  ? '#FFAB91':
           depth > 50  ? '#F57F17':
           depth > 30  ? '#FDD835':
           depth > 10  ? '#EEFF41':
                         '#76FF03'; 
}

// Load and visualize the earthquake data
d3.json(earthquakeDataURL).then(function(data) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            var geojsonMarkerOptions = {
                radius: feature.properties.mag * 3,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup("Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2]);
        }
    }).addTo(myMap);
});

// Create the legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    var depths = [-10, 10, 30, 50, 70, 90];
    
     // Create a container div for each color bar and label
     for (var i = 0; i < depths.length; i++) {
        var range = depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+');
        var colorBar = '<div style="background:' + getColor(depths[i] + 1) + '; width: 30px; height: 20px; display: inline-block;"></div>';
        var label = '<div style="text-align: center; margin: 2px 0; display: inline-block;">' + range + '</div>';
        div.innerHTML += '<div>' + colorBar + label + '</div>';
    }

    return div;
};

legend.addTo(myMap);
