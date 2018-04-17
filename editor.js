var map;
var x;
var geoJsonOutput;
var downloadLink;

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
  map.data.addListener("click",function(event){
    event.document.getElementById('dropdown-content').classList.toggle("show");
  });
  // Retrieve HTML elements.
  var left_column = document.getElementById('left-column');
  var mapContainer = document.getElementById('map-holder');
  geoJsonOutput = document.getElementById('geojson-output');
  downloadLink = document.getElementById('download-link');
	  
//reading back the new color value
  map.data.setStyle(function(feature) {
    var default_color = "white";
    if (feature.getProperty("Color")!=x){
        default_color = feature.getProperty("Color");
      }
      else if(feature.getProperty("Color")==null){
          feature.setProperty("Color", x);
      }
      return ({
	      strokeColor: default_color,
      	      strokeWeight: 4
      	      });
});
}

google.maps.event.addDomListener(window, 'load', init);

// Refresh different components from other components.
function refreshGeoJsonFromData() {
  map.data.toGeoJson(function(geoJson) {
    geoJsonOutput.value = JSON.stringify(geoJson);
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
	
/*var rating_counter = 0;
  map.data.addListener('click', function(event) {
          if(rating_counter == 0)
             selected_color(event, '#000000');
          else if(rating_counter == 1)
            selected_color(event, '#ff0000');
          else if(rating_counter == 2)
            selected_color(event, '#ff8100');
          else if(rating_counter == 3)
            selected_color(event, '#e3ff00');
          else if(rating_counter == 4)
            selected_color(event, '#004c00');
          else if(rating_counter == 5)
            selected_color(event, '#00FF00');
        rating_counter++;
        if(rating_counter>5)
          rating_counter = 0;
    	});
    */
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
function selected_color(event, x){
    color = x;
    map.data.overrideStyle(event.feature,{strokeColor: x});
    event.feature.setProperty("Color", x);
}
function resize() {
  var geoJsonOutputRect = geoJsonOutput.getBoundingClientRect();
  var stiliRect = left_column.getBoundingClientRect();
  geoJsonOutput.style.height = stiliRect.bottom - geoJsonOutputRect.top - 8 + "px";
}
