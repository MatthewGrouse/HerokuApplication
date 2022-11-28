//setting up the path
const express = require("express");
const app = express();
const port = 3000;

const path = require("path");
let publicPath = path.resolve(__dirname, "public");
//import fetch from "node-fetch";
//For API call
app.use(express.static(publicPath));
app.listen(port, () => console.log(`Weather app listening on port ${port}`));

const fetch = require("node-fetch");
const apiKey = "42e4fb7459186a43f29caf0e88cdd0c6";

app.get("/weather/:location", checkWeather);
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/Client.html"));
});

//checkweather gets the forecast for the nect 5 days(4day forecast api wouldnt work) and indexes the data
//to be returned in json format to the client side
async function checkWeather(req, res) {
  //Make API call for weather
  let city = req.params.location;
  console.log(city);
  let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  let resp = await fetch(url);
  //console.log(resp);
  let weatherData = await resp.json();
  // console.log(weatherData);

  //Define variables
  let whatToPack,
    description,
    rain,
    date = "";
  let temp,
    hum,
    windSpeed = 0;
  let forecastArray = {
    umbrella: "No umbrella needed",
    tempForpacking: "",
    forecastList: [],
    airPollution: "",
  };
  umbrella = "No umbrella";
  airPollution = " ";
  tempForpacking = " ";

  //Index data into array
  for (var index = 0; index < weatherData.list.length; index++) {
    date = weatherData.list[index].dt_txt;
    description = weatherData.list[index].weather[0].description;
    temp = weatherData.list[index].main.temp;
    rain = checkRain(weatherData.list[index].rain, forecastArray);
    windSpeed = weatherData.list[index].wind.speed;
    hum = weatherData.list[index].main.humidity;
    whatToPack = checkPacking(weatherData.list[index].main.temp, forecastArray);

    //Push data into array
    forecastArray.forecastList.push({
      Date: date,
      City: city,
      Temp: temp,
      Description: description,
      Rainfall: rain,
      Windspeed: windSpeed,
      Humidity: hum,
      Packing: whatToPack,
    });
  }

  //make api call for airpollution
  let urlAP = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.city.coord.lat}&lon=${weatherData.city.coord.lon}&appid=${apiKey}`;
  let respAP = await fetch(urlAP);
  let airPolData = await respAP.json();
  //forecastArray.airPollution = "hi hihihihih";
  //checkAirPol(weatherData.city.coord, forecastArray);
  for (var x = 0; x < airPolData.list.length; x++) {
    console.log(airPolData.list[x].components.pm2_5);
    if (airPolData.list[x].components.pm2_5 > 10) {
      forecastArray.airPollution =
        "The air quality in this city is bad over the next 5 days. Please wear a mask!";
    } else {
      forecastArray.airPollution =
        "No need to wear a face covering. The air is nice out here :)";
    }
  }
  //Return parsed data as a json (send to client side)
  res.json(forecastArray);
}

//get rainfall info in mm and determine if user should bring umbrella
function checkRain(weatherData, forecastArray) {
  if (weatherData != undefined) {
    if (JSON.stringify(weatherData).substr(6, 5) != "") {
      rain = parseFloat(JSON.stringify(weatherData).substr(6, 5));
    }
    forecastArray.umbrella = "You should probably bring an umbrella ";
  } else {
    rain = "Not raining, no umbrella needed";
  }
  return rain;
}

/*Tell user how to pack for the queried cities weather; 
   cold < 12 degrees
   mild >=12 < 24
   hot > 24
Returns what to pack for as string*/
function checkPacking(temp, forecastArray) {
  if (temp <= 12) {
    whatToPack = "Cold";
  } else if (temp > 12 && temp <= 24) {
    whatToPack = "Mild";
  } else {
    whatToPack = "Hot";
  }
  forecastArray.tempForpacking =
    "It will be " +
    whatToPack +
    ", " +
    " So pack accordingly over the next day.";
  return whatToPack;
}

//async function checkAirPol(coords, forecastArray) {
// let url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`;
// let respAP = await fetch(url);
//  let airPolData = await respAP.json();
//console.log(airPolData.list[0].components);;
//console.log(airPolData.list.components.pm2_5);
// for (var x = 0; x < airPolData.list.length; x++) {
//   console.log(airPolData.list[x].components.pm2_5);
//   if (airPolData.list[x].components.pm2_5 > 10) {
//     console.log("polluted");
//     forecastArray.airPollution =
//       "The air quality in this city is bad over the next 5 days. Please wear a mask";
//     return;
//   } else {
//     console.log("not polluted");
//     forecastArray.airPollution =
//      "The air is not polluted over the next 5 days, no mask needed.";
//   }
//  }
// return;
//if (airPolData.list[i].components.pm2_5 >= 10) {
//return true;
//} else {
//  return false;
// this.airPol =
//   "The air is not polluted over the next 5 days, no mask needed.";
