// this is our google maps api key and link


const googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAvh-RJE3-FnbTJlwKg-npCYZl_Yo8P6RU&callback=initMap";

function googleMaps() {
    fetch(googleMapsAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
        //    return responseJson;
        })
}
googleMaps();

let map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: , lng: },
    zoom: 8
  });
}
//global API URL's / api keys
const issPositionAPI = "http://api.open-notify.org/iss-now.json";


//this function fetches the position data from the api
function getIssPosition() {
    fetch(issPositionAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            //position data of iss here
        })
}