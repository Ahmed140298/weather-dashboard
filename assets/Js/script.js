$(document).ready(function () {
  //apikey
  var APIKey = "fc0909ff152d52e68c7dc3db4a50c9f4";

  // all the variables for date, and elements
  var currentName = $("#currentName");
  var currentTempreture = $("#currentTempreture");
  var currentWind = $("#currentWind");
  var currentWumidity = $("#currentHumidity");
  var fiveDaysDiv = $("#fiveDayDisplayDiv");
  var todaytDate = moment().format("DD/MM/YYYY");
  var cityHistory = [];
  var city;

  //getting the weather apis function
  function getWeather() {
    // variable to store first url
    var url1 =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      city +
      "&limit=" +
      1 +
      "&appid=" +
      APIKey;

    // first ajax call for longitude and latitude of the user input city
    $.ajax({
      url: url1,
      method: "GET",
    }).then(function (firstResponse) {
      if (firstResponse.length === 0) {
        $("#currentName").hide();
        $("#currentDate").hide();
        $("#cardBody").hide();
        $("#forecast").hide();
        return;
      }
      //variable longitude and latitude of the user input city
      var longitude = firstResponse[0].lon;
      var latitude = firstResponse[0].lat;
      var cityName = firstResponse[0].name;

      // second URL to get weather information from the user input city
      var url2 =
        "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        latitude +
        "&lon=" +
        longitude +
        "&appid=" +
        APIKey +
        "&units=metric";

      // second ajax call to get weather information
      $.ajax({
        url: url2,
        method: "GET",
      }).then(function (secondResponse) {
        //show the city, date and the next 5 days weather information
        $("#currentName").show();
        $("#currentDate").show();
        $("#cardBody").show();
        $("#forecast").show();
        $("#today").show();

        // display current city name and current date
        currentName.text(cityName + " " + todaytDate);
        $("#cardBody").prepend(currentName);
        // get and display weather icon
        var icons = secondResponse.list[0].weather[0].icon;
        var imgUrl = "https://openweathermap.org/img/wn/" + icons + ".png";
        var imgIcon = $("<img>").attr("src", imgUrl);
        $("#cardImg").append(imgIcon);

        //store the values of tempreture, wind and humidity to variables
        var temp = secondResponse.list[0].main.temp;
        var wind = secondResponse.list[0].wind.speed;
        var humidity = secondResponse.list[0].main.humidity;

        // variable to store and display information from the api response
        currentTempreture.text("Temp: " + temp + " °C");
        currentWind.text("Wind : " + wind + " KPH");
        currentWumidity.text("Humidity: " + humidity + "%");

        // variables for storing weather information
        var fiveDay = secondResponse.list;
        var forcastNewArr = [];

        // looping into weather information for next 5 days
        $.each(fiveDay, function (index, item) {
          forecast = {
            date: item.dt_txt.split(" ")[0],
            temp: item.main.temp,
            icon: item.weather[0].icon,
            humidityy: item.main.humidity,
            windd: item.wind.speed,
          };
          if (item.dt_txt.split(" ")[1] === "15:00:00") {
            forcastNewArr.push(forecast);
          }
        });

        //loop the stored weather information and display it in cards below
        for (var i = 0; i < forcastNewArr.length; i++) {
          //create cards div
          var Cards = $("<div>");
          Cards.attr("class", "card mb-3 text-white bg-danger mr-2");
          fiveDaysDiv.append(Cards);

          //cards title to be  set date moment().format()
          var forecastHeading = $("<h4>");
          forecastHeading.attr("class", "title px-3 pt-3");
          var datee = moment(forcastNewArr[i].date).format("DD/MM/YYYY");
          forecastHeading.text(datee);
          Cards.append(forecastHeading);

          //div cards body tempreture, wind humidity and icon
          var forcastFiveBody = $("<div>");
          forcastFiveBody.attr("class", "card-body pb-2 pt-0");
          Cards.append(forcastFiveBody);

          var iconImg = $("<img>");
          iconImg.attr("class", "icons ml-2");
          iconImg.attr(
            "src",
            "https://openweathermap.org/img/wn/" +
              forcastNewArr[i].icon +
              ".png"
          );
          forcastFiveBody.append(iconImg);

          var forecastTempreture = $("<p>").text(
            "Temperature: " + forcastNewArr[i].temp.toFixed(2) + "°C"
          );
          forcastFiveBody.append(forecastTempreture);
          var forecastWind = $("<p>").text(
            "Wind: " + forcastNewArr[i].wind + "KPH"
          );
          forcastFiveBody.append(forecastWind);
          var forecastHumidity = $("<p>").text(
            "Humidity: " + forcastNewArr[i].humidity + "%"
          );
          forcastFiveBody.append(forecastHumidity);
        }
      });
    });
    //clear the search input after clicking the search button
    $("#search-input").val("");
  }

  //event handler for search button
  $("#search-button").on("click", function (event) {
    event.preventDefault();
    //display weather information when clicked the button
    $("#today").removeClass("d-none");
    $(".forecastTitle").removeClass("d-none");
    city = $(this).parent(".search").siblings(".inputValue").val().trim();
    if (city === "") {
      return;
    }

    //push the city name to city array
    cityHistory.push(city);

    //store the input in to the local storage
    localStorage.setItem("city", JSON.stringify(cityHistory));
    $("#cardImg").empty();
    fiveDaysDiv.empty();
    searchHistory();
    getWeather();

    //if there city in the localStorage display the clear button
    if (localStorage.getItem("city") !== null) {
      $("#clear-search").removeClass("d-none");
      $("#clear-search").show();
      $(".hr").removeClass("d-none");
      $(".hr").show();
      //or else don't show the clear button
    } else {
      $("#clear-search").hide();
      $(".hr").hide();
    }
  });

  // variable to store the button created below
  var historyDiv = $("#history");

  // function to get searched cities from local storage
  function searchHistory() {
    historyDiv.empty();

    //search 20 cities
    let searchedCities = Math.max(cityHistory.length - 20, 0);

    for (let i = searchedCities; i < cityHistory.length; i++) {
      //create button for seached cities
      var buttons = $("<button>").text(cityHistory[i]);
      buttons.addClass("btn btn-info btn-block historyButton text-capitalize");
      buttons.attr("type", "button");

      historyDiv.prepend(buttons);
    }
    // event handler for searched cities to display again when clicked.
    $(".historyButton").on("click", function (event) {
      event.preventDefault();

      //show data of the clicked city
      $("#today").removeClass("d-none");
      $(".forecastTitle").removeClass("d-none");

      city = $(this).text();

      //remove the current data and replace it with clicked city data
      $("#cardImg").empty();
      fiveDaysDiv.empty();
      //call the get weather function to display data again
      getWeather();
    });
  }

  //event handler for search button
  $("#clear-search").on("click", function (event) {
    event.preventDefault();
    //hide the clear search button
    $(this).hide();
    $(".hr").hide();
    $("#forecast").hide();
    $("#today").hide();

    //clear localStorage
    localStorage.clear();
    $(".list-group").empty();
    localStorage.removeItem("city");
    //reset the city history array to empty
    cityHistory = [];
  });

  function getDataFromLocalStorage() {
    //store localStorage data to variable
    var getLocalData = JSON.parse(localStorage.getItem("city"));
    //check if the city history array in empty if so add the new searched city
    if (getLocalData !== null) {
      cityHistory = getLocalData;

      $("#clear-search").removeClass("d-none");
      $("#clear-search").show();
      $(".hr").removeClass("d-none");
      $(".hr").show();
    } else {
      $("#clear-search").hide();
      $(".hr").hide();
    }

    searchHistory();
  }
  getDataFromLocalStorage();
});
