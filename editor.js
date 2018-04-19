var map;
var x;
var geoJsonOutput;
var downloadLink;
var left_column;
var info_window;
var selected;
var PropertyValue="unknown";
var totalSelected=0;
var array = [];
function init() {
  // Initialise the map.
  map = new google.maps.Map(document.getElementById('map-holder'), {
    center: {lat: 39.6249838, lng: 19.922346100000027},
    zoom: 17,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeId: 'satellite'
  });
  map.data.loadGeoJson('data/2013139.geojson')
  map.data.setControls(['Point', 'LineString', 'Polygon']);
  map.data.setStyle({
    editable: true,
    draggable: true,
    clickable: true
  });

  bindDataLayerListeners(map.data);

map.data.addListener('rightclick', function(event){
         map.data.remove(event.feature);
    });
map.data.addListener('mouseover', function(clicked) {
	selected=clicked.feature;
	array[0]=selected;
        map.data.overrideStyle(array[0], {strokeWeight: 8});
    });
map.data.addListener('mouseout', function(clicked) {
	map.data.revertStyle();
    });
  map.data.addListener("click",function(event){
	 // Rating(rate);
         info_box(event);
    });
	
  // Retrieve HTML elements.
  left_column = document.getElementById('left-column');
  var mapContainer = document.getElementById('map-holder');
  geoJsonOutput = document.getElementById('geojson-output');
  downloadLink = document.getElementById('download-link');
  resize();
  google.maps.event.addDomListener(window, 'resize', resize);
	
//reading back the new color value
  map.data.setStyle(function(feature) {
   var colour = "white";
        if (feature.getProperty("Rating") == null && feature.getProperty("Colour") == null ) {
            feature.setProperty("Rating", PropertyValue);
            feature.setProperty("Colour", PropertyValue);
        }
        if (feature.getProperty("Colour") != PropertyValue) {
             colour = feature.getProperty("Colour");
        }
      return ({
	      strokeColor: colour,
      	      strokeWeight: 4
      	      });
});
}

google.maps.event.addDomListener(window, 'load', init);

// Refresh different components from other components.
function refreshGeoJsonFromData() {
  map.data.toGeoJson(function(geoJson) {
    geoJsonOutput.value = JSON.stringify(geoJson,null,2);
    refreshDownloadLinkFromGeoJson();
  });
}

// Refresh download link.
function refreshDownloadLinkFromGeoJson() {
  downloadLink.href = "data:;base64," + btoa(geoJsonOutput.value);
}

// Apply listeners to refresh the GeoJson display on a given data layer.
function bindDataLayerListeners(dataLayer) {
  dataLayer.addListener('addfeature', refreshGeoJsonFromData);
  dataLayer.addListener('removefeature', refreshGeoJsonFromData);
  dataLayer.addListener('setgeometry', refreshGeoJsonFromData);
  dataLayer.addListener('setproperty', refreshGeoJsonFromData);
}
	
// Enable geojson output with the click of the button
function geojsonOutput() {
    var show = document.getElementById("geojson-output");
    if (show.style.display === "block") {
        show.style.display = "none" ;
    } else {
        show.style.display = "block";
    }
}

//Delete paths
function deletepaths(){
  map.data.forEach(function(e){map.data.remove(e);});
  geoJsonOutput.value=null;
}
/*function ratingFunction(rating,col,feature) {
	feature.setProperty("Rating",rating);
	feature.setProperty("Colour",col);
	map.data.overrideStyle(feature,{strokeWeight:4});
}*/
//Colouring the paths
function Rating(rate){
	this.rate=rate;
	var col;
	switch(rate){
		case 1:
			col = 'red';
			break;
		case 2:
			col = 'yellow';
			break;
		case 3:
			col = 'white';
			break;
		case 4:
			col = 'blue';
			break;
		case 5:
			col = 'green';
			break;	
	}
	selected.setProperty("Rating",rating);
	selected.setProperty("Colour",col);
	//map.data.overrideStyle(feature,{strokeWeight:4});
	//ratingFunction(rate,col,selected);
	refreshGeoJsonFromData();
}

function resize() {
  var geoJsonOutputRect = geoJsonOutput.getBoundingClientRect();
  var stiliRect = left_column.getBoundingClientRect();
  geoJsonOutput.style.height = stiliRect.bottom - geoJsonOutputRect.top - 8 + "px";
}

function info_box(data){
      if(info_window){
	info_window.close();
      }
    info_window = new google.maps.InfoWindow({
    content: '<button id="demo" onclick="Rating(1)" class="vbRow">Very Bad</button>',position: data.latLng
	
     });
   info_window.open(map);
}
