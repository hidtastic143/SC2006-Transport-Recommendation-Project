const minCarparkAllowed = 10;
const minTaxiAvailableAllowed = 2;

var recTransport = "";
var averageCostToTravelByCar = 0;
var averageCostToTravelByPublic = 0;
var averageCostToTravelByTaxi = 0;

var averageDistanceToTravelByCar = 0;
var averageDistanceToTravelByTaxi = 0;
var averageDistanceToTravelByPublic;

var averageTimeToArriveByCar = 0;
var averageTimeToArriveByTaxi= 0;
var averageTimeToArriveByPublic = 0;

var carparkCount = 0;
var taxiCount = 0;

let carListRec = [];
let taxiListRec = [];
let busListRec = [];
var travelOptions = 0;

function recommendation()
{
    if (carparkCount < minCarparkAllowed)
    {
        recTransport = "Taxi";
        travelOptions = 0;
        document.getElementById("recommend-transport").innerHTML = "local_taxi";
    }
    else if (taxiCount < minTaxiAvailableAllowed)
    {
        recTransport = "Public";
        travelOptions = 1;
        document.getElementById("recommend-transport").innerHTML = "directions_transit";
    }
    else
    {
        recTransport = "Car";
        travelOptions = 0;
        document.getElementById("recommend-transport").innerHTML = "directions_car";
    }
    document.getElementById("recommendation").style.visibility = "visible";
    document.getElementById("result").style.visibility = "hidden";
    document.getElementById("transit-info").style.visibility= "hidden";

    var elements = document.getElementsByClassName("button-container");
    for(var i =0; i < elements.length; i++)
    {
        elements[i].style.visibility = "hidden";
    }
    return recTransport;
}

function displayReason()
{
    var result = document.getElementById("result");
    var p = document.createElement("p");

    if (recTransport == "Car")
    {
        p.innerHTML = "Currently there are " + total_carpark_count + " carparks near your destination";
    }
    else if (recTransport == "Taxi")
    {
        p.innerHTML = "Currently there are " + taxiCount + " taxis near you!";
    }
    else
    {
        p.innerHTML = "Car and Taxi are not recommended.. Time to take public transport!";
    }
    if (result.hasChildNodes())
    {
        result.replaceChild(p, result.childNodes[0]);
    }
    else
        result.appendChild(p);

    if (result.style.visibility == "hidden")
        result.style.visibility = "visible";
    else
        result.style.visibility = "hidden";
    
    document.getElementById("transit-info").style.visibility= "visible";
    var elements = document.getElementsByClassName("button-container");
    for(var i =0; i < elements.length; i++)
    {
        elements[i].style.visibility = "visible";
    }
}

function displayRecommendedRoutes(selectedRouteIndex)
{
    if(recTransport == "Car" || recTransport == "Taxi")
        displayRoute(selectedRouteIndex - 1, 0);
    else
        displayRoute(selectedRouteIndex - 1, 1);
}