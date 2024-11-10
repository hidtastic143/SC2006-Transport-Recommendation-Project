function checkTaxiAvailability(userLatitude, userLongitude) {
    var currentDate = new Date();
    var currentTime = currentDate.toISOString();
    currentTime = currentTime.slice(0, 19);
    var numTaxisWithin3km;

    var apiURL = 'https://api.data.gov.sg/v1/transport/taxi-availability?key=rUhz8DB8SoaSwhQ6B83UiQ==?date_time=' + encodeURIComponent(currentTime);
    //apiURL += "&param1" + currentDate;

    axios.get('http://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability', {
        headers: {
            'AccountKey': 'rUhz8DB8SoaSwhQ6B83UiQ=='
        }
    })
    //axios.get(apiURL)
    .then(function (response) {
        const taxiData = response.data.value;
        const taxiLocations = taxiData.map(taxi => ({ latitude: parseFloat(taxi.Latitude), longitude: parseFloat(taxi.Longitude) }));
        const userLocation = { latitude: parseFloat(userLatitude), longitude: parseFloat(userLongitude) };
        numTaxisWithin3km = countTaxisWithin3km(userLocation, taxiLocations);
        taxiCount = numTaxisWithin3km;
        return numTaxisWithin3km;
    })
    .catch(function (error) {
        console.error('Failed to retrieve taxi availability data:', error);
    });
}

// Function to count available taxis within 3km of user location
function countTaxisWithin3km(userLocation, taxiLocations) {
    let count = 0;
    taxiLocations.forEach(taxiLocation => {
        let distance = haversineDistance(userLocation, taxiLocation);
        if (distance <= 3) {
            count++;
        }
    });
    return count;
}

// Function to calculate distance between two points using Haversine formula
function haversineDistance(point1, point2) {
    const earthRadiusKm = 6371;

    const lat1 = degreesToRadians(point1.latitude);
    const lon1 = degreesToRadians(point1.longitude);
    const lat2 = degreesToRadians(point2.latitude);
    const lon2 = degreesToRadians(point2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

// Function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}