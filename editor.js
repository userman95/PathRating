var map;
var geoJsonOutput;
var downloadLink;
var left_column;
var info_window;
var selected;
var PropertyValue="unknown";
var totalSelected=0;
var array = [];
var to;
var distance,coord;
var pos,marker,cityCircle,total;
var dbref = firebase.database().ref();
var messagesRef = firebase.database().ref('Users');
var topUserPostsRef = firebase.database().ref('Users').orderByChild('distance');
alert("Hello there! Create a path inside the circle and click on it to rate it to make it functionable.Every line outside the circle will be deleted.After rating the path ,sumbit your login form and see your stats in the leaderboar.");
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
	  map.data.loadGeoJson('2013139_review.geojson')
	 map.data.setControls(['Point','LineString','Polygon']);

	  map.data.setStyle({
	    editable: true,
	    draggable: true,
	    clickable: true
	  });
	
	  bindDataLayerListeners(map.data);

	map.data.addListener('mouseover', function(clicked) {
		distance=0;
		selected=clicked.feature;
		array[0]=selected;
		map.data.overrideStyle(array[0], {strokeWeight: 8}); //otan mouseover selected kane entono to feature auto
		dbref.child('GeoJson').set(geoJsonOutput.value); // steile to geojson arxeio sthn vasi dedomenwn
		var paths = selected.getGeometry().getArray(); //pare ths suntetagmenes tou selected se pinaka
		var i,meters;

		for(i=0;i<paths.length-1;i++){ //ypologismos olwn twn suntetagmenwn kai telika upologismos ths apostashs tou selected feature se metra.
			 meters = google.maps.geometry.spherical.computeDistanceBetween(paths[i],paths[i+1]);
			distance += meters;
			distance=Math.ceil(distance);
		} 

	    });

	map.data.addListener('mouseout', function(clicked) {
		map.data.revertStyle();//epanafora arxikwn idiothtwn 
	    });
	map.data.addListener("click",function(event){
		 info_box(event); //info box pou periexei thn apostash,ta ratings kai thn epilogh delete path
	    });
	map.data.addListener('mousemove',function(event){
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
	   var colour = "black";
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
	
	//Get Location of user
	 var  new_infoWindow;

	new_infoWindow = new google.maps.InfoWindow;

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(function(position) {
	     pos = {
	      lat: position.coords.latitude,
	      lng: position.coords.longitude
	    };
	to = new google.maps.LatLng(pos.lat,pos.lng);

	    new_infoWindow.setPosition(pos);
	    new_infoWindow.setContent('<h2 style="color:black">You are here</h2>');
	    new_infoWindow.open(map);
	    map.setCenter(pos);
	var  marker = new google.maps.Marker({
	    position: pos,
	    icon: {
	      path: google.maps.SymbolPath.CIRCLE,
	      scale: 10
	    },
	    draggable: false,
	    map: map
	    });  
	cityCircle = new google.maps.Circle({
	      strokeColor: '#FF0000',
	      strokeOpacity: 0.8,
	      strokeWeight: 2,
	      clickable : false,
	      map: map,
	      center:  pos,
	      radius:  100
	    });
	  }, function() {
	    handleLocationError(true, new_infoWindow, map.getCenter());
	  });
	} else {
	  // Browser doesn't support Geolocation
	  handleLocationError(false, new_infoWindow, map.getCenter());
	}

	function handleLocationError(browserHasGeolocation, new_infoWindow, pos) {
	new_infoWindow.setPosition(pos);
	new_infoWindow.setContent(browserHasGeolocation ?
			      'Error: The Geolocation service failed.' :
			      'Error: Your browser doesn\'t support geolocation.');
	new_infoWindow.open(map);
	}        

}

google.maps.event.addDomListener(window, 'load', init);

// Refresh different components from other components.
function refreshGeoJsonFromData() {
  map.data.toGeoJson(function(geoJson) {
  geoJsonOutput.value = JSON.stringify(geoJson,null,2);	
  refreshDownloadLinkFromGeoJson();
  dbref.child('GeoJson').set(geoJsonOutput.value);//apostoli kainourgiwn dedomenwn sth vasi 
  });
}
  
function controlPaths(){
	 	 map.data.forEach(function(feature){
		 coord = feature.getGeometry().getArray();
		   for(var i=0;i<coord.length;i++){//gia kathe coordinate enos  feature an i apostasi einai >=100 (100m diladi) kai exei uknown property, diegrapse to.
			   if((google.maps.geometry.spherical.computeDistanceBetween(coord[i],to) > 100) && feature.getProperty("Rating")===PropertyValue)
			   {
				      // alert('Ops!Outside of your circle!!!');

					map.data.remove(feature);
			   }			
	 	    }//end of for
		 });//end of forEach
}
function compute_total_distance(){ // oles oi apostaseis mazi apothikeuontai sto all_coords_together kai meta sthn global metavliti total gia na xrhsimopoieithei allou
	var met =0;
	var all_coords_together=0;
	map.data.forEach(function(feature){
  		  coord = feature.getGeometry().getArray();
  		  for(var i=0;i<coord.length-1;i++){
		  met = google.maps.geometry.spherical.computeDistanceBetween(coord[i],coord[i+1]);
		  all_coords_together += met;
		  all_coords_together=Math.ceil(all_coords_together);
          	   }//end of for loop					
	});//END forEach
	total = all_coords_together;
	console.log(all_coords_together);
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
			col = '#e86b97';
			break;
		case 4:
			col = 'blue';
			break;
		case 5:
			col = 'green';
			break;	
	}
	selected.setProperty("Rating",rate);
	selected.setProperty("Colour",col);
	refreshGeoJsonFromData();
	compute_total_distance();
	
	 if(info_window){
	info_window.close();
      }
}

function resize() {
  var geoJsonOutputRect = geoJsonOutput.getBoundingClientRect();
  var stiliRect = left_column.getBoundingClientRect();
  geoJsonOutput.style.height = stiliRect.bottom - geoJsonOutputRect.top - 8 + "px";
}
//epeksergasia tou info window 
function info_box(data){
	 controlPaths(); //diagrafh monopatiou pou einai eksw apo ton kuklo 100 metrwn ths trexousas topothesias tou xristi

      if(info_window){
	info_window.close();
	dbref.child('GeoJson').set(geoJsonOutput.value);

      }
    info_window = new google.maps.InfoWindow({
    content:'<h1 style="color:black;">Meters:'+distance+'</h1>'+'<b><p style="color:black;">Choose a color to select a rating'
	    +'<br>for the selected path or delete it </p></b>' 
	    +'<button id="demo" onclick="Rating(1)" class="vbRow">Very Bad </button>'
	    +'<a onclick="map.data.remove(selected);" style="float:right;color: #8e0707;" href="#">Delete Path</a>'
	    +'<br><button id="demo" onclick="Rating(2)" class="badRow">   Bad   </button>'
	    +'<br><button id="demo" onclick="Rating(3)" class="normalRow">  Normal </button>'
	    +'<br><button id="demo" onclick="Rating(4)" class="goodRow">   Good  </button>'
	    +'<br><button id="demo" onclick="Rating(5)" class="vgRow">Very Good</button>',
	    position: data.latLng
	
     });
   info_window.open(map);
}
//syles tou sidebar
function openNav() {
    document.getElementById("mySidenav").style.width = "50%";
    document.getElementById("main").style.marginLeft = "50%";

}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";

}

window.addEventListener("load", startup);
function startup(){
// listener gia sumbit 
document.getElementById('contactform').addEventListener('submit', submitForm);

// Submit form
function submitForm(e){
  e.preventDefault();
  alert("Done");
  // Get to name kai to email apo to input
  var name = getInputVal('name');
  var email = getInputVal('email');
  //var distance = getInputVal('distance');
  // Apostoli stoixeiwn sthn vasi me kladia : name,email,distance
  saveMessage(name, email,total);
 
document.getElementById('valueofdistance').innerHTML = total;

  // Show alert
  document.querySelector('.alert').style.display = 'block';

  // Hide alert after 3 seconds
  setTimeout(function(){
    document.querySelector('.alert').style.display = 'none';
  },3000);
//epanafora ths sumbit form
   document.getElementById('contactform').reset();
}

//  get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

// Save message to firebase
function saveMessage(name, email,total){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email:email,
    distance: total	
  });
}
}
//hide/show to login page me thn epilogh "hide"
function Hide_Show() {
    var x = document.getElementById("login-page");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
//hide/show to leaderboard me thn epilogh "Open/Hide leaderboard"
function Hide_Show_Table(){
  var y = document.getElementById("leaderboard");
    if (y.style.display === "none") {
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }
}
//dynamiki prosthiki stoixeiou ston pinaka 
topUserPostsRef.on('child_added', function(snapshot) {
var table = document.getElementById("leaderboard");
var row = table.insertRow(0);
var cell1 = row.insertCell(0);
var cell2 = row.insertCell(1);
cell1.innerHTML = snapshot.val().name;
cell2.innerHTML = snapshot.val().distance;
});
