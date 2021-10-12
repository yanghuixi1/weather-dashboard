const geoApiKey = "86a40763255da094daa23fb31d973c06";
const geoURL = "http://api.positionstack.com/v1/forward";
const weatherAPIKey = "4390f37b9c4fc93b40fc7ec689f91a3d";
const weatherExclude = "minutely,hourly,alerts";
const weatherURL = "https://api.openweathermap.org/data/2.5/onecall";
const weatherUnits = "imperial";
let currentContainer = $("#current-weather");
let futureContainer = $("#forecasts");
let searchAside = $("#search-aside");

function generateCurrentWeather(city, currentWeather) {
  let temp = currentWeather.temp;
  let wind = currentWeather.wind_speed;
  let uvi = currentWeather.uvi;
  let humidity = currentWeather.humidity;
  let currDate = moment().format("M/D/YYYY");
  currentContainer.html("");
  currentContainer.addClass("current-weather-border");
  currentContainer.append(`<h2>${city} (${currDate})</h2>`);
  currentContainer.append(`<p>Temp: ${temp}&ordm;F</p>`);
  currentContainer.append(`<p>Wind: ${wind} MPH</p>`);
  currentContainer.append(`<p>Humidity: ${humidity} %</p>`);

  let uvEl = $("<p>");
  let uv_index = $("<span>");
  uvEl.text("UV Index: ");
  uv_index.text(uvi);

  if (uvi < 3) {
    uv_index.addClass("uvi-low");
  } else if (3 <= uvi < 8) {
    uv_index.addClass("uvi-medium");
  } else if (uvi >= 8) {
    uv_index.addClass("uvi-high");
  }

  uvEl.append(uv_index);
  currentContainer.append(uvEl);
}

function generateFutureWeather(futureWeather) {
  let currDate = moment();
  futureContainer.html("");

  futureWeather.forEach(function (element, i) {
    let futureDate = currDate.add(1, "d").format("M/D/YYYY");
    let temp = element.temp.day;
    let wind = element.wind_speed;
    let humidity = element.humidity;
    let weatherCard = $("<div>");
    weatherCard.addClass("weather-card");
    weatherCard.append(`<h3>${futureDate}</h3>`);
    weatherCard.append(`<p>Temp: ${temp}&ordm;F</p>`);
    weatherCard.append(`<p>Wind: ${wind} MPH</p>`);
    weatherCard.append(`<p>Humidity: ${humidity} %</p>`);
    futureContainer.append(weatherCard);
  });
}

function getLatLongByCity(city) {
  let geoQuery = `${geoURL}?access_key=${geoApiKey}&query=${city}&country=US&limit=1`;
  let coords = fetch(geoQuery)
    .then((resp) => resp.json())
    .then((location) => {
      return {
        lat: location.data[0].latitude,
        long: location.data[0].longitude,
      };
    });
  return coords;
}

function getWeatherFromCity(city) {
  getLatLongByCity(city).then((latLong) => {
    let weatherQuery = `${weatherURL}?lat=${latLong.lat}&lon=${latLong.long}&exclude=${weatherExclude}&appid=${weatherAPIKey}&units=${weatherUnits}`;
    fetch(weatherQuery)
      .then((resp) => resp.json())
      .then((data) => {
        generateCurrentWeather(city, data.current);
        generateFutureWeather(data.daily.slice(1, 6));
      });
  });
}

function generateRecentSearches() {
  for (let i = 0; i < localStorage.length; i++) {
    let city = localStorage.key(i);
    searchAside.append(`<p>${city}</p>`);
  }
}

$("#search-btn").on("click", function (e) {
  e.preventDefault();
  let city = $("#city-search").val();
  localStorage.setItem(city, null);
  getWeatherFromCity(city);
});

$(function () {
  generateRecentSearches();
});
