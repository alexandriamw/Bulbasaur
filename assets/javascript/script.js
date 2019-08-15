//global API URL's / api keys
const issPositionAPI = "http://api.open-notify.org/iss-now.json";


//this function fetches the position data from the api
function getIssPosition(){
    fetch(issPositionAPI)
        .then(response=>{
            return response.json();
        })
        .then(responseJson =>{
            //position data of iss here
        })
}