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
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.SATELLITE
           

        });
        issMarker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lon),
            map: map,
            icon: "./assets/images/redDot.png",
            title: "the ISS",
            optimized: false
        })
        setInterval(() => {
            getIssPosition(function (data) {
                let pos = {
                    lat: data.lat,
                    lng: data.lon
                };
                issMarker.setPosition(pos);
            }, function () {
                handleLocationError(true, issMarker, map.getCenter());
            })
        }, 1000)
        console.log(data);
    })
}

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


function setLocalForage() {

    localforage.getItem("issArray").then(function (results) {
        const data = "";


        let issData = results || [];
        issData.push(data);

        localforage.setItem("issArray", issData).then(function () {
            updateLeft();

        });

    })
}

