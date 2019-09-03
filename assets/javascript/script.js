//global API URL's / api keys
const issPositionAPI = "https://api.wheretheiss.at/v1/satellites/25544";
// this is our google maps api key and link
const googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAvh-RJE3-FnbTJlwKg-npCYZl_Yo8P6RU&callback=initMap";
// this is our weather API key


let map;


//global vars for setting forage loops
let lat_global = "";
let lon_global = "";

//the distance global variables to save to local forage because the data is already being processed so why not save it for display
let distance_global = "";
let city_cords_global = {
    lat: 44.948628,
    lon: -93.245329,
    city: "Minneapolis"
}
// global weather coords
let lat_WeatherGlobal = "";
let lon_WeatherGlobal = "";

//store the interval for displaying data in the right bar normally when the menu is not present as to be able to start and stop it
let rightBarDataGlobal = {
    timerInterval: null,
    isRunning: false
}

getLastPoints();
displayRightBarData();

let geocoder;

//converted the map dot to an svg so we can change the color on the fly
let mapDot = {
    path: 'M25 125 c-14 -13 -25 -36 -25 -50 0 -33 42 -75 75 -75 33 0 75 42 75 75 0 14 -11 37 -25 50 -13 14 -36 25 -50 25 -14 0 -37 -11 -50 -25z',
    fillColor: 'red',
    fillOpacity: 1,
    scale: 0.1
};


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
        geocoder = new google.maps.Geocoder();
        codeAddress();

        //adds marker that centers on iss
        issMarker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lon),
            map: map,
            icon: mapDot,
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

let customLocation;
// WORK IN PROGRESS!!!!!! getting city cords
function codeAddress() {
    geocoder.geocode({
        'address': city_cords_global.city
    }, function (results, status) {
        if (status == 'OK') {
            let mapDotBlue = mapDot;
            mapDotBlue.fillColor = "blue";
            if (customLocation === undefined){
                customLocation = new google.maps.Marker({
                    map: map,
                    icon: mapDotBlue,
                    position: results[0].geometry.location,
                    title: "Custom Location",
                });
            } else {
                customLocation.setPosition(results[0].geometry.location);
            }
            city_cords_global.lat = customLocation.getPosition().lat();
            city_cords_global.lon = customLocation.getPosition().lng();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
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

            // lat_WeatherGlobal = responseJson.latitude;
            // lon_WeatherGlobal = responseJson.longitude;
        })
}

// the loop that pushes lat and lon to localForage
setInterval(() => {
    //combined the localTime array and issArray so we do not have to mess with 2 arrays to get the time 
    let time = moment().format('MMMM Do YYYY, h:mm:ss a');
    localforage.getItem("issArray").then(function (results) {
        let issData = results || [];
        issData.unshift({ //changed from push to unshift so newest will always be at the top 
            lat: lat_global,
            lon: lon_global,
            time: time,
            distance: distance_global,
            cityData: city_cords_global
        });

        // this keeps the data from being stored more that 100 items/ always keeps the newer data
        if (issData.length > 100) issData.pop();
        localforage.setItem("issArray", issData).then(function () {

        });
    })
}, 30000)


//function that grabs the last few lat lon points from localForage
function getLastPoints() {
    localforage.getItem("issArray").then(function (results) {
        if(results === null) return;
        console.log({
            coordsA: results[results.length - 1],
            coordsB: results[results.length - 2],
            coordsC: results[results.length - 3]
        })
    })
}



//grab the right bar and put it into a variable
const rightBar = document.getElementById("mainInput");

//menu animation with anime.js
const menuElement = document.getElementById("menu");
menuElement.addEventListener("click", function () {


    if (menuElement.classList.contains("open")) {
        rightBar.innerHTML = "";
        displayRightBarData();
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
        loadRight();
        displayRightBarData();
    }
});


// distance function


function distanceMath() {
    //placeholder coords are Minneapolis -  Now in global variable to be changed upon input
    (calcCrow(city_cords_global.lat, city_cords_global.lon, lat_global, lon_global).toFixed(1));
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
        distance_global = Math.floor(d) + " Kilometers";
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

//making a function that loads dynamic data and input fields onto the right card for user input

// was lazy and just hid the fields until clicked
function loadRight() {
    rightBar.innerHTML = "";

    //adds the animation delay in dynamically so as to not have to bind an id to this just for that 
    let animateDelay = 1500;

    //loop thorught because i am lazy and did not want to copy and paste 4 times until we figure out what we are doing here
    for (let i = 1; i < 15; i++) {
        //create a div with an h3 of test inside of it just to see if it
        const newTestDiv = createDivs();
        newTestDiv.innerHTML = `<h3>test</h3>`;
        newTestDiv.style = `animation-delay: ${animateDelay}ms`;
        rightBar.prepend(newTestDiv);

        //devreases the animation delay as we are prepending to the right side and we want the top of the menu to load first
        animateDelay -= 150;
    }

    //create an input field and add it to the top of the right bar 
    const newInputDiv = createDivs();
    newInputDiv.id = "textBoxField"
    newInputDiv.innerHTML = `<input id="toggledField" type="text" value="${city_cords_global.city}" name="inputValue">`;
    rightBar.prepend(newInputDiv);

    const newButton = createDivs();

    newButton.innerHTML = `<button id="inputButton" type="submit" value="Click Me" name="submit">`
    newButton.addEventListener("click", function(){
        const cityInput = document.getElementById("toggledField");
        if (typeof cityInput.value === "string"){
            city_cords_global.city = cityInput.value;
            codeAddress();
        } else {
            cityInput.value = "Value is not a string!";
        }
    })
    rightBar.prepend(newButton);
}

//this function exists to create div's for the right sidebar and add a preset class list
function createDivs() {
    const newDiv = document.createElement("div");
    newDiv.classList = "animated fadeInRightBig testFields";
    return newDiv;
}


//intended to display sort of a console-esk log of previous coordinates every 30 seconds if the interval is running 
function displayRightBarData() {
    if (rightBarDataGlobal.isRunning === false) {
        rightBarDataGlobal.timerInterval = setInterval(() => {
            createRightConsoleData();
        }, 30000);
        //wait 2 seconds after function called to display data because it looks cooler

        setTimeout(createRightConsoleData, 1000)

        //set is running var to true so we can identify if the interval is running or not
        rightBarDataGlobal.isRunning = true;
    } else {
        //clear the interval so to not mess wit the menu when open
        clearTimeout(rightBarDataGlobal.timerInterval)
        //set is running var to false so we can identify if the interval is running or not
        rightBarDataGlobal.isRunning = false
    }
}

//this creates the "Console like" elements in the right bar using the data stored in local forage
function createRightConsoleData() {
    //query local forage for the issArray array
    localforage.getItem("issArray").then(function (results) {
        let issData = results || [];

        

        //if the array is not empty do things
        if (issData.length !== 0) {



            //check if previous data is displayed
            let previousConsoleData = document.getElementsByClassName("consoleData");
           

            //if not then try to make some exist in a reverse for loop counting down from 10
            if (previousConsoleData.length === 0) {
                for (let i = 10; i >= 0; i--) {
                    //if issData with the index of i exists then put it on the page
                    if (issData[i] !== undefined) {
                        //create a div for it add consoleData to the classList so to be identified
                        let newDiv = createDivs()
                        newDiv.classList.add("consoleData");

                        //set the id of the new div to the longitude coordinate and set the innerHTML to the data
                        newDiv.id = `${issData[i].lon}`;

                        //this binds the entire object stringified to the div
                        newDiv.setAttribute("rawData", JSON.stringify(issData[i]));
                        newDiv.innerHTML = `<p style="font-size: 14px">lat: ${issData[i].lat}<br/>lon: ${issData[i].lon}<br/>timeStamp: ${issData[i].time}<br/>distance from ${issData[i].cityData.city}: ${issData[i].distance}</p>`;
                        rightBar.prepend(newDiv);
                    }
                }
            } else {

                //if  then try to make some exist in a reverse for loop counting down from 10
                for (let i = 10; i >= 0; i--) {
                    let existing;
                    if (issData[i] !== undefined) existing = document.getElementById(`${issData[i].lon}`);
                    // console.log(existing);
                    if (existing === null && issData[i] !== undefined) {
                        //create a div for it add consoleData to the classList so to be identified
                        let newDiv = createDivs()
                        newDiv.classList.add("consoleData");

                        //set the id of the new div to the longitude coordinate and set the innerHTML to the data
                        newDiv.id = `${issData[i].lon}`;
                        
                        //this binds the entire object stringified to the div
                        newDiv.setAttribute("rawdata", JSON.stringify(issData[i]));
                        newDiv.innerHTML = `<p style="font-size: 14px">lat: ${issData[i].lat}<br/>lon: ${issData[i].lon}<br/>timeStamp: ${issData[i].time}<br/>distance from ${issData[i].cityData.city}: ${issData[i].distance}</p>`;
                        rightBar.prepend(newDiv);

                        selectData();

                    }
                }

            }
        }
    })
}


// our weather API
function getWeather() {
    // instead of trying to get the iss data from iss loop itself, I grabbed it from the latest local forage push
    localforage.getItem("issArray").then(function (results) {
        if(results === null) return;
        let forageLat = results[0].lat;
        let forageLon = results[0].lon;
        let weatherAPI = "https://api.openweathermap.org/data/2.5/weather?lat=" + forageLat + "&lon=" + forageLon + "&units=imperial&appid=0ce03d42e54802b6dbe51878757418ee";

        fetch(weatherAPI).then(response => {
                return response.json();
            })
            .then(responseJson => {
                // console.log(responseJson);
                // grabs the respons and appends the html every 30 seconds with the weather data for that specific location
                document.getElementById("currentIssWeatherTemp").innerHTML = responseJson.main.temp + " Degrees F";
                document.getElementById("currentIssWeatherHum").innerHTML = "Humidity: " + responseJson.main.humidity;
                document.getElementById("currentIssWeatherRain").innerHTML = responseJson.weather[0].description;
                document.getElementById("currentIssWeatherWind").innerHTML = "Wind: " + responseJson.wind.speed + " MPH";

            })
    })

}
// calls the weather function to generate it and then sets the 30 second interval that matches the rest of the main intervals for this app
getWeather();
setInterval(() => {
    getWeather();
}, 30000);

(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    window.requestAnimationFrame = requestAnimationFrame;
})();

// Terrain stuff.
var background = document.getElementById("bgCanvas"),
    bgCtx = background.getContext("2d"),
    width = window.innerWidth,
    height = document.body.offsetHeight;

(height < 400) ? height = 400: height;

background.width = width;
background.height = height;


// Second canvas used for the stars
bgCtx.fillStyle = '#05004c';
bgCtx.fillRect(0, 0, width, height);

// stars
function Star(options) {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = options.x;
    this.y = options.y;
}

Star.prototype.reset = function () {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = width;
    this.y = Math.random() * height;
}

Star.prototype.update = function () {
    this.x -= this.speed;
    if (this.x < 0) {
        this.reset();
    } else {
        bgCtx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function ShootingStar() {
    this.reset();
}

ShootingStar.prototype.reset = function () {
    this.x = Math.random() * width;
    this.y = 0;
    this.len = (Math.random() * 80) + 10;
    this.speed = (Math.random() * 10) + 6;
    this.size = (Math.random() * 1) + 0.1;
    // this is used so the shooting stars arent constant
    this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
    this.active = false;
}

ShootingStar.prototype.update = function () {
    if (this.active) {
        this.x -= this.speed;
        this.y += this.speed;
        if (this.x < 0 || this.y >= height) {
            this.reset();
        } else {
            bgCtx.lineWidth = this.size;
            bgCtx.beginPath();
            bgCtx.moveTo(this.x, this.y);
            bgCtx.lineTo(this.x + this.len, this.y - this.len);
            bgCtx.stroke();
        }
    } else {
        if (this.waitTime < new Date().getTime()) {
            this.active = true;
        }
    }
}

var entities = [];

// init the stars
for (var i = 0; i < height; i++) {
    entities.push(new Star({
        x: Math.random() * width,
        y: Math.random() * height
    }));
}

// Add 2 shooting stars that just cycle.
entities.push(new ShootingStar());
entities.push(new ShootingStar());


//animate background
function animate() {
    bgCtx.fillStyle = '#110E19';
    bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.strokeStyle = '#ffffff';

    var entLen = entities.length;

    while (entLen--) {
        entities[entLen].update();
    }
    requestAnimationFrame(animate);
}
animate();

// this function is going to grab the data from the right bar and let the user get previous data sets from the ISS
function selectData() {
    document.querySelectorAll(".consoleData").forEach(item => { 
        item.addEventListener('click', () => {
            let newData = item.getAttribute("rawData");
            let clickedData = JSON.parse(newData);
            console.log(clickedData);

            dataMArker = new google.maps.Marker({
                position: new google.maps.LatLng(clickedData.lat, clickedData.lon),
                map: map,
                icon: mapDot,
                title: "Data Point",
                optimized: false
            })
        })
    })
}
selectData();

