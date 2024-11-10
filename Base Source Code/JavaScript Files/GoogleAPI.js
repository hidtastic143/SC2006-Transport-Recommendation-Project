var map, directionsService, directionsRenderer;
var originLocation, destinationLocation;
var originMarker, destinationMarker;
var print = false;

function initMap() {
// Initialize map
map = new google.maps.Map(document.getElementById('map'), {
zoom: 12,
center: {
    lat: 1.3802409,lng: 103.7907347
    }
});

    // Initialize Directions Service and Renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
}

function hideInfo(){
    drivingInfo.style.display = 'none';
    transitInfo.style.display = 'none';
}

function GPSlocation() {
    navigator.geolocation.getCurrentPosition(showLocation);
}

function showLocation(position) {
    document.getElementById('origin').value = position.coords.latitude + "," + position.coords.longitude;
}

function mapMarking() {
    var origin = document.getElementById('origin').value;
    var destination = document.getElementById('destination').value;

    getCoordinates(origin, true);
    getCoordinates(destination, false);

    clearCarparkMarkings();

    // Calls for recommendation function
    recommendation();
}

function clearMarkings() {
    originLocation = "";
    destinationLocation = "";
    if (originMarker!=null)
        originMarker.setMap(null);
    if (destinationMarker!=null)
        destinationMarker.setMap(null);
    document.getElementById("origin").value = "";
    document.getElementById("destination").value = "";

    if (directionsRenderer!= null)
        directionsRenderer.setMap(null);

    recTransport = "";
    document.getElementById("recommendation").style.visibility = "hidden";
    document.getElementById("result").style.visibility = "hidden";

    var elements = document.getElementsByClassName("button-container");

    for(var i = 0; i < elements.length; i++)
    {
        elements[i].style.visibility = "hidden";
    }

    document.getElementById('transit-info').innerHTML = "";

    clearCarparkMarkings();
}

function createMarker(location, title)
{
    const iconBase = "http://maps.gstatic.com/mapfiles/ms2/micons/";
    if (title === "Origin") {
        if (originMarker) {
            originMarker.setMap(null);
        }
        originMarker = new google.maps.Marker({
            position: location,
            map: map,
            title: title,
            icon: iconBase + "pink-dot.png"
        });
        originMarker.setMap(map);
    } else if (title === "Destination") {
        if (destinationMarker) {
            destinationMarker.setMap(null);
        }
        destinationMarker = new google.maps.Marker({
            position: location,
            map: map,
            title: title,
            icon: iconBase + "red-dot.png"
        });
        destinationMarker.setMap(map);
    }
}

function getCoordinates(location, isOrigin) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        'address': location
        }, function (results, status) {
        if (status === 'OK') {
            if (isOrigin) {
                originLocation = results[0].geometry.location;
                // Extract latitude and longitude from the origin location
                var userLatitude = originLocation.lat();
                var userLongitude = originLocation.lng();
                // Call checkTaxiAvailability()
                var value = checkTaxiAvailability(userLatitude, userLongitude);
                //setTaxiCount(value);
                createMarker(originLocation, "Origin");
            } else {
                destinationLocation = results[0].geometry.location;
                createMarker(destinationLocation, "Destination");
                travelOptions = 0; //default is driving result
                calculateRoute();
                checkCarparkAvailability(destinationLocation);
                carparkCount = getTotalCarparkAvailability();
            }
        } else {
            alert("Error: Invalid Entry, Please Key Again");
        }
    })
}

function calculateRoute() {
    if(travelOptions == 0){
        travelMode = 'DRIVING';
    }
    else if(travelOptions == 1){
        travelMode = 'TRANSIT';
    }
    directionsService.route({
        origin: originLocation,
        destination: destinationLocation,
        travelMode, // Set travel mode to transit
        provideRouteAlternatives: true // Request multiple route alternatives
    }, function (response, status) {
            if (status === 'OK') {                    
            var routes = response.routes;
            var transitInfo = document.getElementById('transit-info');
            transitInfo.innerHTML = '';
            var limit = routes.length;
            for (var i = 0; i < Math.min(routes.length, 3); i++) { 
                var route = routes[i];
                var distance = 0;
                var duration = 0;
                for (var j = 0; j < route.legs.length; j++) {
                    distance += route.legs[j].distance.value;
                    duration += route.legs[j].duration.value;
                }
                // Convert distance to kilometers and time to minutes
                distance = distance / 1000;
                duration = duration / 60;

                // Create a div for each route
                var routeDiv = document.createElement('div');
                routeDiv.classList.add('transit-info', 'route');

                // Populate the div with route information
                var header = document.createElement('div');
                header.innerHTML = "<p>Route " + (i + 1) + "<br>Distance: " 
                    + distance.toFixed(2) + " km, Duration: " + duration.toFixed(0) + " mins</p>";
                if(travelOptions == 1){
                    header.classList.add('step');
                }
                routeDiv.appendChild(header);

                // Iterate through transit steps
                for (var k = 0; k < route.legs[0].steps.length; k++) {
                    var step = route.legs[0].steps[k];
                    if (step.travel_mode === 'TRANSIT') {
                        var transitDetails = step.transit;
                        var stepDiv = document.createElement('div');
                        if(k+2 != route.legs[0].steps.length){
                            stepDiv.classList.add('step');
                        }
                            
                        stepDiv.innerHTML = "<p>" + transitDetails.line.name + " (" + transitDetails.line.vehicle.type + ")</p><p>Departure: " 
                            + transitDetails.departure_stop.name + "</p><p>Arrival: " + transitDetails.arrival_stop.name + "</p>";
                        routeDiv.appendChild(stepDiv);
                    }
                    
                }

                // Append the div to transitInfo
                transitInfo.appendChild(routeDiv);
            }
        } else {
            window.alert('Request failed due to ' + status);
        }
    });
}

function displayRoute(selectedRouteIndex) {
    if(travelOptions == 0){
        travelMode = 'DRIVING';
    }
    else if(travelOptions == 1){
        travelMode = 'TRANSIT';
    }
    directionsService.route({
        origin: originLocation,
        destination: destinationLocation,
        travelMode, // Set travel mode to transit
        provideRouteAlternatives: true // Request multiple route alternatives
    }, function (response, status) {
            if (status === 'OK') {       
                if (selectedRouteIndex >= response.routes.length) {
                    window.alert('Route Does Not Exist.');  
                } 
                else{
                    if (directionsRenderer!= null)
                        directionsRenderer.setMap(null);
                    directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: selectedRouteIndex
                    });
                }
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
    originMarker.setMap(null);
    destinationMarker.setMap(null);
}


function printDrivingInfo(){
    travelOptions = 0; //switch travel mode
    calculateRoute();
}

function printTransitInfo(){
    travelOptions = 1; //switch travel mode
    calculateRoute();
}

function printTaxiInfo() {
    travelOptions = 0; //switch travel mode
    calculateRoute();
}

function printRouteOne(){
    displayRecommendedRoutes(1);
}

function printRouteTwo(){
    displayRecommendedRoutes(2);
}

function printRouteThree(){
    displayRecommendedRoutes(3);
}