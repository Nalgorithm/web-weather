class Pair {
    first = null
    second = null

    constructor(_f, _s) {
        this.first = _f
        this.second = _s
    }
}

let getWindDirection = function (deg){
    let windDirection
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

    return windDirection
}


class Template {
    static MakeTmpl(weather) {
        let tmpl = document.querySelector('#tmpl_city').content

        let params = tmpl.querySelectorAll(".city_info_value")

        params[0].innerHTML = weather["clouds"]["all"] + " %"
        params[1].innerHTML = weather["wind"]["speed"] +" m/s " + getWindDirection(weather["wind"]["deg"])
        params[2].innerHTML = weather["main"]["pressure"]+ " hpa"
        params[3].innerHTML = weather["main"]["humidity"]+ " %"
        params[4].innerHTML = "[ " + weather["coord"]["lat"] + ", " + weather["coord"]["lon"] +" ]"

        let cityName = tmpl.querySelector('.city_name')
        cityName.innerHTML = weather["name"]

        let icon= tmpl.querySelector(".weather_icon")
        icon.setAttribute("src", "https://openweathermap.org/img/w/" + weather["weather"][0]["icon"] + ".png")

        let deg = tmpl.querySelector(".degrees")
        let temp = Math.round(weather["main"]["temp"] - 273)
        deg.innerHTML = temp + " C"

        let btn = tmpl.querySelector(".delete_btn")
        btn.setAttribute("id", "delete-city-" +weather["id"])
        btn.innerHTML = "x"

        let clone =  tmpl.cloneNode(true)
        let parEl = document.querySelector("#fav_city_list")
        parEl.appendChild(clone)
    }

    static MakeLoadTmpl(name, status) {
        let tmpl = document.querySelector('#tmpl_load').content

        let favCity = tmpl.querySelector(".fav_city")
        favCity.setAttribute("id", "list-city-" + name)

        let cityName = tmpl.querySelector('.city_name')
        cityName.innerHTML = name

        let btn = tmpl.querySelector(".delete_btn")
        btn.setAttribute("id", "delete-city-" + name)
        btn.innerHTML = "x"

        let statEl = tmpl.querySelector(".load_status")
        statEl.setAttribute("id", "status-city-" + name)
        statEl.innerHTML = status

        let clone =  tmpl.cloneNode(true)
        let parEl = document.querySelector("#fav_city_list")
        parEl.appendChild(clone)
    }

    static MakeCurCityTmpl(weather) {
        let tmpl = document.querySelector('#tmpl_cur_city').content

        let params = tmpl.querySelectorAll(".city_info_value")

        params[0].innerHTML = weather["clouds"]["all"] + " %"
        params[1].innerHTML = weather["wind"]["speed"] +" m/s " + getWindDirection(weather["wind"]["deg"])
        params[2].innerHTML = weather["main"]["pressure"]+ " hpa"
        params[3].innerHTML = weather["main"]["humidity"]+ " %"
        params[4].innerHTML = "[ " + weather["coord"]["lat"] + ", " + weather["coord"]["lon"] +" ]"

        let cityName = tmpl.querySelector('.city_name')
        cityName.innerHTML = weather["name"]

        let icon= tmpl.querySelector(".weather_icon")
        icon.setAttribute("src", "https://openweathermap.org/img/w/" + weather["weather"][0]["icon"] + ".png")

        let deg = tmpl.querySelector(".degrees")
        let temp = Math.round(weather["main"]["temp"] - 273)
        deg.innerHTML = temp + " C"

        let clone =  tmpl.cloneNode(true)
        let parEl = document.querySelector("#current_city_info")
        parEl.appendChild(clone)
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
            Template.MakeCurCityTmpl(dict)
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
    Template.MakeLoadTmpl(cityName, "Загрузка")

    attachDeleteListener()
    weatherApiGet(cityName)
        .then(function (weather) {
            if (shouldAddCity && localStorage.getItem(weather["id"]) !== null) {
                alert("Город с таким названием уже добавлен")
                document.getElementById("list-city-"+cityName).remove()
                return
            }
            document.getElementById("list-city-"+cityName).remove()
            Template.MakeTmpl(weather)
            localStorage.setItem(weather["id"], weather["name"])
            attachDeleteListener()
        })
        .catch(function (error) {
            document.getElementById("list-city-"+cityName).remove()
            Template.MakeLoadTmpl(cityName, "Ошибка "+error)
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