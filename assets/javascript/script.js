//global API URL's / api keys
const issPositionAPI = "https://api.wheretheiss.at/v1/satellites/25544";
// this is our google maps api key and link
const googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAvh-RJE3-FnbTJlwKg-npCYZl_Yo8P6RU&callback=initMap";
// this is our weather API key


// not sure what this does??? fetches map. cool.
function googleMaps() {
    fetch(googleMapsAPI)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {

        })
}


let map;

//global vars for setting forage loops
let lat_global = "";
let lon_global = "";
getLastPoints();



// our main map function
function initMap() {
    // gets iss API and plugs that info into coords for map
    getIssPosition(function (data) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: data.lat,
                lng: data.lon
            },
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        });
        //adds marker that centers on iss
        issMarker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lon),
            map: map,
            icon: "./assets/images/redDot.png",
            title: "the ISS",
            optimized: false
        })

        //1 second loop that updates and moves the blinking iss marker across the map
        setInterval(() => {

            getIssPosition(function (data) {
                    let pos = {
                        lat: data.lat,
                        lng: data.lon
                    };
                    issMarker.setPosition(pos);
                    document.getElementById("issLocationLat").innerHTML = data.lat;
                    document.getElementById("issLocationLon").innerHTML = data.lon;
                },
                function () {
                    handleLocationError(true, issMarker, map.getCenter());
                })

        }, 1000)
        console.log(data);
    })
}



// funtion to grab local time and log it in localForage that matches a specific iss position
function setTime() {
    let time = moment().format('MMMM Do YYYY, h:mm:ss a');
    localforage.getItem("localTime").then(function (results) {
        let issTime = results || [];
        issTime.push(time);
        localforage.setItem("localTime", issTime).then(function () {

        });
    })
}

// sets time interval to log time
setInterval(() => {
    // setLocation();
    setTime();
}, 30000)




//what does this do?????
function callback(response, status) {
    // See Parsing the Results for
    // the basics of a callback function.
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
            lat_global = responseJson.latitude;
            lon_global = responseJson.longitude;
        })
}

// the loop that pushes lat and lon to localForage
setInterval(() => {
    localforage.getItem("issArray").then(function (results) {
        let issData = results || [];
        issData.push({
            lat: lat_global,
            lon: lon_global
        });
        localforage.setItem("issArray", issData).then(function () {

        });
    })
}, 30000)

//function that grabs the last few lat lon points from localForage
function getLastPoints() {
    localforage.getItem("issArray").then(function (results) {
        console.log({
            coordsA: results[results.length - 1],
            coordsB: results[results.length - 2],
            coordsC: results[results.length - 3]
        })
    })
    localforage.getItem("localTime").then(function (results) {
        console.log({
            timeA: results[results.length - 1],
            timeB: results[results.length - 2],
            timeC: results[results.length - 3]
        })
    })
}



//menu animation with anime.js
const menuElement = document.getElementById("menu");
menuElement.addEventListener("click", function () {


    if (menuElement.classList.contains("open")) {
        anime({
            targets: "div#menu",
            rotate: {
                value: 0,
                duration: 1000,
                easing: "easeInOutSine"
            }
        });

        anime({
            targets: "span#row2",
            rotate: {
                value: 0
            }
        });

        anime({
            targets: "span#row3",
            rotate: {
                value: 0
            }
        });

        anime({
            targets: "span#row1, span#row4",
            opacity: 1
        });

        menuElement.classList.remove("open");
    } else {
        anime({
            targets: "div#menu",
            rotate: {
                value: 360,
                duration: 1000,
                easing: "easeInOutSine"
            }
        });

        anime({
            targets: "span#row2",
            rotate: {
                value: -45
            }
        });

        anime({
            targets: "span#row3",
            rotate: {
                value: 45
            }
        });

        anime({
            targets: "span#row1, span#row4",
            opacity: 0
        });

        menuElement.classList.add("open");
    }
});


// distance function



function distanceMath() {
    //placeholder coords are Minneapolis
    (calcCrow(44.948628, -93.245329, lat_global, lon_global).toFixed(1));

    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    function calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = toRad(lat2 - lat1);
        var dLon = toRad(lon2 - lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        document.getElementById("issDistance").innerHTML = Math.floor(d) + " Kilometers";
        return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) {
        return Value * Math.PI / 180;
    }

}

//updates the distance matrix every second to display a dynamic html distance
setInterval(() => {
    distanceMath();
}, 1000)

// let new_lat = parseFloat(lat_global);
// let new_lon = parseFloat(lon_global);
//cant get this to work yet
const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=45&lon=15&appid=0ce03d42e54802b6dbe51878757418ee`;

function getWeather (){
    console.log(weatherAPI);
    console.log(lat_global, lon_global);
    fetch(weatherAPI).then(response =>{
        return response.json();
    })
    .then(responseJson => {
        console.log(responseJson);
        
    })
}

getWeather();


