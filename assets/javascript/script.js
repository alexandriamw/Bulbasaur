//global API URL's / api keys
const issPositionAPI = "https://api.wheretheiss.at/v1/satellites/25544";
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
    getIssPosition(function (data) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: data.lat,
                lng: data.lon
            },
            zoom: 5
        });
        console.log(data);
    })

}


//this function fetches the position data from the api
function getIssPosition(callbackFunction) {
    fetch(issPositionAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            //position data of iss here
            callbackFunction({
                lat: responseJson.latitude,
                lon: responseJson.longitude
            })
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

//========================================================
// localforage TEST 1: BEGIN
//========================================================
//It at least takes care of automatically converting your data to/from JSON strings.
//Also, data other than strings.
//Test to download picture for your app and cache it for offline use. 
//We can save binary data with localForage:

//Download image photo with AJAX.
let request = new XMLHttpRequest();
 
//Get photo.
request.open('GET', "http://i.imgur.com/YzkSFCW.png", true);
request.responseType = 'arraybuffer';
console.log(request.responseType);

//An Ajax http request has 5 states as your reference code:

//0   UNSENT  open() has not been called yet.
//1   OPENED  send() has been called.
//2   HEADERS_RECEIVED    send() has been called, and headers and status are available.
//3   LOADING Downloading; responseText holds partial data.
//4   DONE    The operation is complete.

// When the AJAX state changes, save the data locally.
request.addEventListener('readystatechange', function() {
    if (request.readyState === 4) { // readyState DONE
        // We store the binary data as-is.
        localforage.setItem('user_1_photo', request.response, function() {
            // Photo has been saved, do whatever happens next!
        });
    }
});
 
request.send()

//Next time we can get the photo out of localForage with just three lines of code:

localforage.getItem('user_1_photo', function(photo) {
    // Create a data URI or something to put the photo in an img tag or similar.
    console.log(photo);
});

// Save our users.
let users = [ {id: 1, fullName: 'Matt'}, {id: 2, fullName: 'Bob'} ];
localforage.setItem('users', users, function(result) {
    console.log(result);
});

//To use promises instead of a callback:
localforage.getItem('user_1_photo').then(function(photo) {
    // Create a data URI or something to put the photo in an <img> tag or similar.
    console.log("Did you get here?",photo);
});

//We can create multiple instances (Stores) of localForage that point to different stores using createInstance. 
//All the configuration options used by config are supported.
//let store = localforage.createInstance({
//name: "primaryStorage"
//});

//let otherStore = localforage.createInstance({
//name: "secondaryStorage"
//});

// Setting the key on one of these doesn't affect the other.
//store.setItem("key", "value");
//otherStore.setItem("key", "value2");
//========================================================
// localforage TEST 1: END
//========================================================