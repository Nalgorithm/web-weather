class Pair {
    first = null
    second = null

    constructor(_f, _s) {
        this.first = _f
        this.second = _s
    }
}

let Templates = {
    cityInfo: function (dict) {
        let windDirection
        let deg = dict["wind"]["deg"]
        switch (true) {
            case deg >= 348.75 || deg <= 11.25:
                windDirection = "N"
                break
            case deg >= 11.25 && deg <= 33.75:
                windDirection = "NNE"
                break
            case deg >= 33.75 && deg <= 56.25:
                windDirection = "NE"
                break
            case deg >= 56.25 && deg <= 78.75:
                windDirection = "ENE"
                break
            case deg >= 78.75 && deg <= 101.25:
                windDirection = "E"
                break
            case deg >= 101.25 && deg <= 123.75:
                windDirection = "ESE"
                break
            case deg >= 123.75 && deg <= 146.25:
                windDirection = "SE"
                break
            case deg >= 146.25 && deg <= 168.65:
                windDirection = "SSE"
                break
            case deg >= 168.65 && deg <= 191.25:
                windDirection = "S"
                break
            case deg >= 191.25 && deg <= 213.75:
                windDirection = "SSW"
                break
            case deg >= 213.75 && deg <= 236.25:
                windDirection = "SW"
                break
            case deg >= 236.25 && deg <= 258.75:
                windDirection = "WSW"
                break
            case deg >= 258.75 && deg <= 281.25:
                windDirection = "W"
                break
            case deg >= 281.25 && deg <= 303.75:
                windDirection = "WNW"
                break
            case deg >= 303.75 && deg <= 326.25:
                windDirection = "NW"
                break
            case deg >= 326.25 && deg <= 348.75:
                windDirection = "NNW"
                break
        }
        return `
        <ul class="city_info">
            <li class="city_info_topic">
                <span class="city_info_key">Облачность</span>
                <span class="city_info_value">`+dict["clouds"]["all"]+` %</span>
            </li>
            <li class="city_info_topic">
                <span class="city_info_key">Ветер</span>
                <span class="city_info_value">`+dict["wind"]["speed"]+` m/s, `+windDirection+`</span>
            </li>
            <li class="city_info_topic">
                <span class="city_info_key">Давление</span>
                <span class="city_info_value">`+dict["main"]["pressure"]+` hpa</span>
            </li>
            <li class="city_info_topic">
                <span class="city_info_key">Влажность</span>
                <span class="city_info_value">`+dict["main"]["humidity"]+` %</span>
            </li>
            <li class="city_info_topic">
                <span class="city_info_key">Координаты</span>
                <span class="city_info_value">[ `+dict["coord"]["lat"]+`, `+dict["coord"]["lon"]+` ]</span>
            </li>
        </ul>
        `
    },

    cityPreviewTop: function (dict) {
        let temp = Math.round(dict["main"]["temp"] - 273)
        return `
        <div class="city_preview">
            <h2 class="city_name">`+dict["name"]+`</h2>
            <img class="weather_icon" src="`+"https://openweathermap.org/img/w/" + dict["weather"][0]["icon"] + ".png"+`">
            <div class="degrees">`+temp+` C</div>
        </div>
        `
    },

    cityListLoadingItem: function (name, status) {
        return `
        <li class="fav_city" id="list-city-`+name+`">
            <div class="city_preview">
                <h3 class="city_name">`+name+`</h3>
                <button class="delete_btn" id="delete-city-`+name+`">x</button>
            </div>
            <div id="status-city-`+name+`">`+status+`</div>
        </li>
        `
    },

    cityListItem: function (dict) {
        let temp = Math.round(dict["main"]["temp"] - 273)
        return `
        <div class="city_preview">
            <h2 class="city_name">`+dict["name"]+`</h2>
            <img class="weather_icon" src="`+"https://openweathermap.org/img/w/" + dict["weather"][0]["icon"] + ".png"+`">
            <div class="degrees">`+temp+` C</div>
            <button class="delete_btn" id="delete-city-`+dict["id"]+`">x</button>
        </div>

        
        ` + this.cityInfo(dict)
    }
}

let myLocation = function() {
    let loc = new Pair(50.5997, 36.5983)

    return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) {
            alert("Не поддерживается")
            resolve(loc)
        }
        else {
            navigator.geolocation.getCurrentPosition(
                function (newLoc) {
                    resolve(new Pair(newLoc.coords.latitude, newLoc.coords.longitude))
                },
                function () {
                    resolve(loc)
                }
            )
        }
    })
}

let weatherApiGet = function (coord) {
    let key = "5bf9135ddddc03a2ab08a56c0f4716cc"
    let url = null

    if (typeof coord === "string") {
        url = "https://api.openweathermap.org/data/2.5/weather?q="+coord+"&appid="+key
    }
    else {
        url = "https://api.openweathermap.org/data/2.5/weather?lat="+coord.first+"&lon="+coord.second+"&appid="+key
    }

    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(function (d) {
                return d.json()
            })
            .then(function (d) {
                if (d["cod"] === 200) {
                    resolve(d)
                }
                else {
                    reject(d["message"])
                }
            })
            .catch(err => reject(err))

    })
}

let weatherCurrentLocApi = function () {
    return myLocation()
        .then(function (loc) {
            return weatherApiGet(loc)
        })
        .then(function (weather) {
            return weather
        })
}

let viewShowCurrentCity = function () {
    let selector = document.querySelector("#current_city_info")

    selector.innerHTML = "Загрузка"

    weatherCurrentLocApi()
        .then(function (dict) {
            selector.innerHTML = ""
            selector.insertAdjacentHTML("afterbegin", Templates.cityInfo(dict))
            selector.insertAdjacentHTML("afterbegin", Templates.cityPreviewTop(dict))
        },
        function (error) {
            selector.innerHTML = "Произошла ошибка сорян"
        })
}

viewShowCurrentCity()
document.getElementById("refresh_geo_btn").addEventListener("click", viewShowCurrentCity)

let attachDeleteListener = function () {
    let btns = document.querySelectorAll('.delete_btn');

    [].forEach.call(btns, function(btn) {
        btn.onclick = function () {
            btn.parentElement.parentElement.remove()
            let myId = btn.id.replace("delete-city-", "")

            if (!isNaN(myId)) {
                localStorage.removeItem(myId)
            }
        }
    });
}

let viewAddCity = function (cityName, shouldAddCity) {
    let favCityListSelector = document.getElementById("fav_city_list")

    favCityListSelector.insertAdjacentHTML("afterbegin", Templates.cityListLoadingItem(cityName, "Загрузка"))

    attachDeleteListener()
    weatherApiGet(cityName)
        .then(function (weather) {
            document.getElementById("list-city-"+cityName).innerHTML = Templates.cityListItem(weather)
            if (shouldAddCity) {
                localStorage.setItem(weather["id"], weather["name"])
            }
            attachDeleteListener()
        })
        .catch(function (error) {
            document.getElementById("list-city-"+cityName).innerHTML = Templates.cityListLoadingItem(cityName, "Ошибка "+error)
            attachDeleteListener()
        })
}

document.getElementById("fav_cities_form").onsubmit = function () {
    let cityNameInput = document.getElementById("fav_cities_input")
    let cityName = cityNameInput.value
    cityNameInput.value = ""

    viewAddCity(cityName, true)
    return false
}

for (var i = 0; i < localStorage.length; i++){
    viewAddCity(localStorage.getItem(localStorage.key(i)))
}