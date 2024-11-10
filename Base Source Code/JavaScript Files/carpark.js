var carpark_markers_list = [];
var carpark_count_list = [];
var carpark_recommendation_list = [];

const maxDistance = 0.5;

function checkCarparkAvailability(destinationLocation) {
    var destination = document.getElementById('destination').value;

    // Convert destination to a LatLng object
    var destinationLatLng = new google.maps.LatLng(destinationLocation);
    var firebaseConfig = {
        apiKey: "AIzaSyAuFCI42el2tAKCQugmD4r04GyLs7Odazo",
        authDomain: "carpark-777e0.firebaseapp.com",
        databaseURL: "https://carpark-777e0-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "carpark-777e0",
        storageBucket: "carpark-777e0.appspot.com",
        messagingSenderId: "710266680839",
        appId: "1:710266680839:web:ff3f458d76b0412c5d5ca2"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var database = firebase.database();
    var total_carpark_count = 0;
    axios.get('https://api.data.gov.sg/v1/transport/carpark-availability')
    .then(response => {
        const data = response.data;
        // Loop through all items in the list
        for (var carpark of data.items[0].carpark_data) {
            var carpark_number_api = carpark.carpark_number;
            var carpark_lot_api=carpark.carpark_info[0].lots_available;
            // Fetch the carpark info from Firebase
            const carparkRef = firebase.database().ref();
            carparkRef.on('value', function(snapshot) {
                const dbData = snapshot.val();
                if (dbData === null) {
                    console.log("Null Data" );
                 }
                else{
                    //console.log(dbData);
                    let totalAvailableLots = 0;
                    for(let id in dbData)
                    {
                        var carpark_id=dbData[id];
                        var carpark_location = {lat: carpark_id.latitude, lng: carpark_id.longitude};
                        var distance = google.maps.geometry.spherical.computeDistanceBetween(destinationLatLng, carpark_location) / 1000; 
                        //console.log(distance);
                        if (distance <= maxDistance) {
                            //console.log("Carpark " + dbData[id].carpark_number + " is within 1km of " + destinationLatLng +" and has "+carpark_lot_api+ " lots available");
                            totalAvailableLots += Number(carpark_lot_api);
                            var marker = new google.maps.Marker({
                            position: carpark_location,
                            map: map,
                            title: "Carpark " + dbData[id].carpark_number
                            })
                            carpark_markers_list.push(marker);
                            carpark_recommendation_list.push(dbData[id]);
                            carpark_count_list.push(carpark_lot_api);
                            var infoWindowContent = "Carpark " + dbData[id].carpark_number + " is " + distance.toFixed(2) +" km away and has "+ carpark_lot_api+ " lots available";
                            marker.addListener('mouseover', (function(infoWindowContent) {
                                return function() {
                                    var infoWindow = new google.maps.InfoWindow({
                                        content: infoWindowContent
                                    });
                                    infoWindow.open(map, this);
                                    this.infoWindow = infoWindow;
                                }
                            })(infoWindowContent));
                            marker.addListener('mouseout', function() {
                                if (this.infoWindow) {
                                    this.infoWindow.close();
                                }
                            });
                            marker.addListener('click', (function(infoWindowContent) {
                                return function() {
                                    var infoWindow = new google.maps.InfoWindow({
                                        content: infoWindowContent
                                    });
                                    infoWindow.open(map, this);
                                    this.clickInfoWindow = infoWindow;
                                }
                            })(infoWindowContent));
                            //console.log("Carpark " + dbData[id].carpark_number + " is within 1km of " + destinationLatLng +" and has "+carpark_lot_api+ " lots available");
                        }
                        else if(distance>=5){
                            //console.log("Carpark " + dbData[id].carpark_number + " is more than 5km of " + destinationLatLng +" and has "+carpark_lot_api+ " lots available");
                    }
                }
                console.log("Total available lots: " + totalAvailableLots);
             }
            });
        }
    });
    return total_carpark_count;
}

function getCarparkRecommendedList() {
    return carpark_recommendation_list;
}

function getAverageCarparkAvailability() {
    var average = 0;
    for (let id in carpark_recommendation_list)
    {
        average += carpark_recommendation_list[id].carpark_availability;
    }
    return average / carpark_recommendation_list.length;
}

function getTotalCarparkAvailability()
{
    var total = 0;
    for(let id in carpark_count_list)
    {
        total += carpark_count_list[id];
    }
    return total;
}

function clearCarparkMarkings()
{
    console.log(carpark_markers_list.length);
    while(carpark_markers_list.length > 0)
    {
        var carpark_markers = carpark_markers_list.pop();
        carpark_markers.setMap(null);

        carpark_count_list.pop();
    }
}
