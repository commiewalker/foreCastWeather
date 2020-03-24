// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast

$(document).ready(function () {

    var apiKey = "f40f93f453f58a48164d6e4f3f2f8958";
    var arrayBtn = [];

    function urlWeather(city) {

        var queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (data) {
            // update all elements below
            $("#currentPlaceNDate").text(data.name);
            $("#currentPic").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
            $("#currentTemp").text(convertDegree(data.main.temp) + " F");
            $("#currentHu").text(data.main.humidity + " %");
            $("#currentWind").text(data.wind.speed + " MPH");

            urlUV(data.coord.lon, data.coord.lat)

        }); // END of promise

    }; // End of Weather

    function urlUV(lon, lat) {

        var queryUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function (data) {
            // update all elements below
            var justDate = noTimeNeeded(data.date_iso);
            $("#currentPlaceNDate").append(" " + justDate);
            $("#currentUV").removeClass();
            $("#currentUV").addClass(colorUV(data.value));
            $("#currentUV").text(data.value);

        });
    }; // End of UV

    function urlForecast(city) {
        var queryUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function (data) {

            var fiveDay = oneTimePerDay(data.list, 5);
            clearElement($(".forecastView"));

            var newH2 = $("<h2>").text("5-Day Forecast:");
            $(".forecastView").append(newH2);
            for (var i = 0; i < 5; i++) {
                // create element and assign value to its
                var newDiv = $("<div>");
                var newDate = $("<h3>").text(noTimeNeeded(fiveDay[i].dt_txt));
                newDiv.addClass("foreCastCard");
                var newImg = $("<img>");
                newImg.attr("src", "http://openweathermap.org/img/w/" + fiveDay[i].weather[0].icon + ".png");
                var fDegree = "Temp: " + convertDegree(fiveDay[i].main.temp) + " F";
                var newTemp = $("<p>").text(fDegree);
                var newHu = $("<p>").text("Humidity: " + fiveDay[i].main.humidity + " %");
                // apped
                $(".forecastView").append(newDiv);
                newDiv.append(newDate, newImg, newTemp, newHu);
            }


        });


    }; // End of Forecast

    function noTimeNeeded(dateWithTime) {
        return dateWithTime.substring(0, 10);
    };

    function colorUV(uvNumber) {
        if (uvNumber > 0 && uvNumber <= 2) {
            return "greC";
        } else if (uvNumber <= 5) {
            return "yelC";
        } else if (uvNumber <= 7) {
            return "oraC";
        } else if (uvNumber <= 10) {
            return "redC"
        } else { return "vioC"; }
    };

    function oneTimePerDay(timeArray, day) {
        for (var i = 0; i < day; i++) {
            timeArray.splice(i, 7);
        }
        return timeArray;
    };

    function convertDegree(kelvin) {
        return Math.round((kelvin * 9) / 5 - 459.67);
    };

    function clearElement(idElement) {
        idElement.empty();
    }

    function createBtn(cityName) {
        var newBtn = $("<button>");
        newBtn.addClass("btnCity");
        newBtn.attr("data-city", cityName);
        newBtn.text(cityName);
        $("#historySearch").prepend(newBtn);
    }

    function saveLocal(arrayCity) {

        var stringArray = JSON.stringify(arrayCity);

        localStorage.setItem("searchHistory", stringArray);
    }

    $(function() {
        var storedSearch = JSON.parse(localStorage.getItem("searchHistory"));

        if (storedSearch != null) {
            arrayBtn = storedSearch;                      // update array

            $.each(arrayBtn, function (index, value) {
                createBtn(value);                
            })
            var lastSearch = arrayBtn[arrayBtn.length - 1]
            urlWeather(lastSearch);
            urlForecast(lastSearch);
        }
    }); // onLoad function

    $("#searchBtn").click(function (event) {
        event.preventDefault();
        var searchCity = $("#searchInput").val().trim();

        urlWeather(searchCity);
        urlForecast(searchCity);

        arrayBtn.push(searchCity);

        createBtn(searchCity);
        saveLocal(arrayBtn);
    });

    $(document).on("click", ".btnCity", function () {
        var cityName = $(this).attr("data-city");
        urlWeather(cityName);
        urlForecast(cityName);
    });



});// END of documentReady