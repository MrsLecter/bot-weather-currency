const axios = require('axios');
const fs = require('fs');
const { DAYS, MONTHS, MAX_HOUR_VALUE, RATE_URL_PRIVAT,RATE_URL_MONOBANK, STORAGE_PRIVAT, STORAGE_MONOBANK } = require("./constants");

//formatted data for weather
function getFormattedData(data, hourInterval = 3) {
  let formatted = "";
  let tempDay = 0;
  let tempHour = 0;
  //date
  let dateCommon;
  let dateInWeek;
  let dayInMonth;
  let month;
  let hours;
  let minutes;
  //temp
  let signDegree = String.fromCharCode(176);
  let currentTemp;
  let feelsTemp;
  let weatherDescription;

  for (let i = 0; i < data.length; i++) {
    //convert to human readable format
    dateCommon = new Date(data[i].dt * 1000);
    //get number of day and find relevant day's name in array
    dateInWeek = DAYS[dateCommon.getUTCDay()];

    hours = dateCommon.getHours();
    dayInMonth = dateCommon.getDate();
    //get number of month and find relevant month's name in array
    month = MONTHS[dateCommon.getMonth()].slice(0,-1)+'я';
    minutes = dateCommon.getMinutes();
    currentTemp = Math.round(data[i].main.temp);
    feelsTemp = Math.round(data[i].main.feels_like);
    weatherDescription = data[i].weather[0].description;
    //if current day number have already recorded - skip this
    if (tempDay !== dateInWeek) {
      formatted += `\n${dateInWeek}, ${dayInMonth} ${month}:`;
      tempDay = dateInWeek;
    }

    if (i !== 0) {
      //find difference between last recorded hour and current note
      let diff = Math.abs(hours - tempHour);
      //if difference too large - recount 
      let interv = diff > hourInterval ? MAX_HOUR_VALUE - diff : diff;
      //if calculated difference is equal to requested - make a note
      if (interv === hourInterval) {
        tempHour = hours;
        formatted += `\n   ${hours}:${minutes}0, ${
          currentTemp > 0 ? "+" + currentTemp : "-" + currentTemp
        }${signDegree}C, ощущается: ${
          feelsTemp > 0 ? "+" + feelsTemp : "-" + feelsTemp
        }${signDegree}C, ${weatherDescription}`;
      }
    } else if (i == 0) {
      tempHour = hours;
      formatted += `\n   ${hours}:${minutes}0, ${
        currentTemp > 0 ? "+" + currentTemp : "-" + currentTemp
      }${signDegree}C, ощущается: ${
        feelsTemp > 0 ? "+" + feelsTemp : "-" + feelsTemp
      }${signDegree}C, ${weatherDescription}`;
    }
  }
  //return the resulting line
  return formatted;
}

function toReadData(bank){
  let fileRoute;
  //coose bank options
  if(bank.localeCompare('privat')===0){
    fileRoute = STORAGE_PRIVAT;
  }else if(bank.localeCompare('monobank')===0){
    fileRoute = STORAGE_MONOBANK;
  }
  //read file
  let fileData = fs.readFileSync(fileRoute, "utf8", function(error){
    if(error) console.log(error); });
  let parsedData = JSON.parse(fileData);
  return parsedData;
}

//check currency data in storage
function isOldData(bank){
  let parsedData = toReadData(bank);
  //calculate the time interval between the present date and the date of recording, translated into minutes
  let timeGap = (new Date().getTime() - parsedData.recordTime)/60000;
  //if time gap more then 2 minutes
  if(timeGap  > 2){
    return true;
  }else if(timeGap <= 2){
    return false;
  }
}


async function toRewriteData(bank){
  let fileRoute;
  let bankUrl;

  //coose bank options
  if(bank.localeCompare('privat')===0){
    fileRoute = STORAGE_PRIVAT;
    bankUrl = RATE_URL_PRIVAT;

  }else if(bank.localeCompare('monobank')===0){
    fileRoute = STORAGE_MONOBANK;
    bankUrl = RATE_URL_MONOBANK;
  }

  return await axios.get(bankUrl).then(function (response) {
    //data from bank
    let data = response.data[0];
    //time now
    let newDate = new Date();
    //storage for data
    let obj;
    //choose storage template
    if(bank.localeCompare('privat')===0){
      obj = {
        "bank": bank,
        "buy": data.buy,
        "sale": data.sale,
        "recordTime": newDate.getTime()
      };
    }else if(bank.localeCompare('monobank')===0){
      obj = {
        "bank": bank,
        "buy": data.rateBuy,
        "sale": data.rateSell,
        "recordTime": newDate.getTime()
      };
    }

    fs.writeFile(fileRoute, JSON.stringify(obj), function(error){
        if(error) console.log(error); 
    });
    return obj;
  }).catch(function (error) {
    console.log(error);
  });
}

module.exports = { getFormattedData, isOldData, toRewriteData, toReadData };
