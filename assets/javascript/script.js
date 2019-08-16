// this is our google maps api key and link


const googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAvh-RJE3-FnbTJlwKg-npCYZl_Yo8P6RU&callback=initMap";

function googleMaps() {
    fetch(googleMapsAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
        
        })
}


let map;
function initMap() {
    getIssPosition(function (data){
        map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: data.lat, lng: data.lon},
            zoom: 4
          });
          console.log(data);
    })
    
}

//global API URL's / api keys
const issPositionAPI = "http://api.open-notify.org/iss-now.json";


//this function fetches the position data from the api
function getIssPosition(callbackFunction){
    fetch(issPositionAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            //position data of iss here
            callbackFunction({lat: parseInt(responseJson.iss_position.latitude), lon: parseInt(responseJson.iss_position.longitude)})
        })
}




// <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
// type="text/javascript"></script>

// $.ajax({
//     url: Auto_Complete_Link, 
//     type: "GET",   
//     dataType: 'jsonp',
//     cache: false,
//     success: function(response){                          
//         alert(response);                   
//     }           
// });  


// AIzaSyAvh-RJE3-FnbTJlwKg-npCYZl_Yo8P6RU