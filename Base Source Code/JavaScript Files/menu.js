function swapLocations(){    
    //TO SWAP THE LOCATION     
    var temp_name = document.getElementById('origin').value;
    document.getElementById('origin').value = document.getElementById('destination').value;
    document.getElementById('destination').value = temp_name;

    //TO SWAP THE COORDINATES
    var temp = originLocation;
    originLocation = destinationLocation;
    destinationLocation = temp;
    
    mapMarking();
}

// Function to check if both origin and destination are filled
function checkInputsFilled() {
    var originValue = document.getElementById('origin').value.trim();
    var destinationValue = document.getElementById('destination').value.trim();
    return originValue !== '' && destinationValue !== '';
}

// Event listener for Enter key press on document level
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && checkInputsFilled()) {
        e.preventDefault(); // Prevent the default key behavior
        mapMarking(); // Call the function to handle the action
    }
});