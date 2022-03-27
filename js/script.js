const dropList = document.querySelectorAll('form select'),
  fromCurrency = document.querySelector('.from select'),
  toCurrency = document.querySelector('.to select'),
  getButton = document.querySelector('form button');

for (let i = 0; i < dropList.length; i++) {
  for (let currency_code in country_list) {
    // selecting USD by default as FROM currency and NPR as TO currency
    let selected =
      i == 0
        ? currency_code == 'USD'
          ? 'selected'
          : ''
        : currency_code == 'NPR'
        ? 'selected'
        : '';
    // creating option tag with passing currency code as a text and value
    let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
    // inserting options tag inside select tag
    dropList[i].insertAdjacentHTML('beforeend', optionTag);
  }
  dropList[i].addEventListener('change', (e) => {
    loadFlag(e.target); // calling loadFlag with passing target element as an argument
  });
}

function loadFlag(element) {
  for (let code in country_list) {
    if (code == element.value) {
      // if currency code of country list is equal to option value
      let imgTag = element.parentElement.querySelector('img'); // selecting img tag of particular drop list
      // passing country code of a selected currency code in a img url
      imgTag.src = `https://flagcdn.com/48x36/${country_list[
        code
      ].toLowerCase()}.png`;
    }
  }
}

window.addEventListener('load', () => {
  getExchangeRate();
});

getButton.addEventListener('click', (e) => {
  e.preventDefault(); //preventing form from submitting
  getExchangeRate();
});

const exchangeIcon = document.querySelector('form .icon');
exchangeIcon.addEventListener('click', () => {
  let tempCode = fromCurrency.value; // temporary currency code of FROM drop list
  fromCurrency.value = toCurrency.value; // passing TO currency code to FROM currency code
  toCurrency.value = tempCode; // passing temporary currency code to TO currency code
  loadFlag(fromCurrency); // calling loadFlag with passing select element (fromCurrency) of FROM
  loadFlag(toCurrency); // calling loadFlag with passing select element (toCurrency) of TO
  getExchangeRate(); // calling getExchangeRate
});

function getExchangeRate() {
  const amount = document.querySelector('form input');
  const exchangeRateTxt = document.querySelector('form .exchange-rate');
  let amountVal = amount.value;
  // if user don't enter any value or enter 0 then we'll put 1 value by default in the input field
  if (amountVal == '' || amountVal == '0') {
    amount.value = '1';
    amountVal = 1;
  }
  exchangeRateTxt.innerText = 'Getting exchange rate...';
  let url = `https://v6.exchangerate-api.com/v6/97bff5298b39070fa5ab7b14/latest/${fromCurrency.value}`;
  // fetching api response and returning it with parsing into js obj and in another then method receiving that obj
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let exchangeRate = result.conversion_rates[toCurrency.value]; // getting user selected TO currency rate
      let totalExRate = (amountVal * exchangeRate).toFixed(2); // multiplying user entered value with selected TO currency rate
      exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
    })
    .catch(() => {
      // if user is offline or any other error occured while fetching data then catch function will run
      exchangeRateTxt.innerText = 'Something went wrong';
    });
}

// Weather Part
const wrapper = document.querySelector('.wrapper'),
  inputPart = document.querySelector('.input-part'),
  infoTxt = inputPart.querySelector('.info-txt'),
  inputField = inputPart.querySelector('input'),
  locationBtn = inputPart.querySelector('button'),
  weatherPart = wrapper.querySelector('.weather-part'),
  wIcon = weatherPart.querySelector('img'),
  arrowBack = wrapper.querySelector('header i');

let api;

inputField.addEventListener('keyup', (e) => {
  // if user pressed enter btn and input value is not empty
  if (e.key == 'Enter' && inputField.value != '') {
    requestApi(inputField.value);
  }
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    // if browser support geolocation api
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert('Your browser not support geolocation api');
  }
});

function requestApi(city) {
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=6c0b570888adc594c16b288c80c2e17d`;
  fetchData();
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords; // getting lat and lon of the user device from coords obj
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=6c0b570888adc594c16b288c80c2e17d`;
  fetchData();
}

function onError(error) {
  // if any error occur while getting user location then we'll show it in infoText
  infoTxt.innerText = error.message;
  infoTxt.classList.add('error');
}

function fetchData() {
  infoTxt.innerText = 'Getting weather details...';
  infoTxt.classList.add('pending');
  // getting api response and returning it with parsing into js obj and in another
  // then function calling weatherDetails function with passing api result as an argument
  fetch(api)
    .then((res) => res.json())
    .then((result) => weatherDetails(result))
    .catch(() => {
      infoTxt.innerText = 'Something went wrong';
      infoTxt.classList.replace('pending', 'error');
    });
}

function weatherDetails(info) {
  if (info.cod == '404') {
    // if user entered city name isn't valid
    infoTxt.classList.replace('pending', 'error');
    infoTxt.innerText = `${inputField.value} isn't a valid city name`;
  } else {
    //getting required properties value from the whole weather information
    const city = info.name;
    const country = info.sys.country;
    const { description, id } = info.weather[0];
    const { temp, feels_like, humidity } = info.main;

    // using custom weather icon according to the id which api gives to us
    if (id == 800) {
      wIcon.src = 'icons/clear.svg';
    } else if (id >= 200 && id <= 232) {
      wIcon.src = 'icons/storm.svg';
    } else if (id >= 600 && id <= 622) {
      wIcon.src = 'icons/snow.svg';
    } else if (id >= 701 && id <= 781) {
      wIcon.src = 'icons/haze.svg';
    } else if (id >= 801 && id <= 804) {
      wIcon.src = 'icons/cloud.svg';
    } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
      wIcon.src = 'icons/rain.svg';
    }

    //passing a particular weather info to a particular element
    weatherPart.querySelector('.temp .numb').innerText = Math.floor(temp);
    weatherPart.querySelector('.weather').innerText = description;
    weatherPart.querySelector(
      '.location span'
    ).innerText = `${city}, ${country}`;
    weatherPart.querySelector('.temp .numb-2').innerText =
      Math.floor(feels_like);
    weatherPart.querySelector('.humidity span').innerText = `${humidity}%`;
    infoTxt.classList.remove('pending', 'error');
    infoTxt.innerText = '';
    inputField.value = '';
    wrapper.classList.add('active');
  }
}

arrowBack.addEventListener('click', () => {
  wrapper.classList.remove('active');
});
