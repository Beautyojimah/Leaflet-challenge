// Initialize the map object and set the initial view
var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 4.5
});

// Define the tile layer and add it to the map
var grayscale = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define Satellite layer
var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Define the URL for the earthquake data
var earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Define the function to get the color based on the earthquake depth
function getColor(depth) {
    return depth > 90 ? '#BF360C' :
           depth > 70  ? '#FFAB91' :
           depth > 50  ? '#F57F17' :
           depth > 30  ? '#FDD835' :
           depth > 10  ? '#EEFF41' :
                         '#76FF03'; 
}

// Define a variable to hold the earthquakes layer
var earthquakes;

// Load and visualize the earthquake data
d3.json(earthquakeDataURL).then(function(data) {
    earthquakes = L.geoJSON(data, {
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

    // Define the path for the tectonic plates data
    var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    // Define a style for the tectonic plates lines
    var plateStyle = {
        color: "orange",
        weight: 2,
        fill: false
    };

    // Load and visualize the tectonic plates data
    d3.json(tectonicPlatesURL).then(function(plateData) {
        var tectonicPlates = L.geoJSON(plateData, {
            style: plateStyle
        }).addTo(myMap);

        // Define base maps
        var baseMaps = {
            "Grayscale": grayscale,
            "Satellite": satellite
        };

        // Define overlay maps
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
        };

        // Add layer controls to the map
        L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);
    });
});

// Create the legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    var depths = [-10, 10, 30, 50, 70, 90];
    for (var i = 0; i < depths.length; i++) {
        var range = depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+');
        var colorBar = '<div style="background:' + getColor(depths[i] + 1) + '; width: 30px; height: 20px; display: inline-block;"></div>';
        var label = '<div style="text-align: center; margin: 2px 0; display: inline-block;">' + range + '</div>';
        div.innerHTML += '<div>' + colorBar + label + '</div>';
    }
    return div;
};

legend.addTo(myMap);
