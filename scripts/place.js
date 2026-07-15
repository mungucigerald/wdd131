const temperature = 16.3;
const wind = 5;

function calculateWindChill(temp, wind) {
    return 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16)
}

let windChillResult;

if (temperature <= 10 && wind > 4.8) {
    windChillResult = calculateWindChill(temperature, wind).toFixed(1) + "℃";
}
else {
    windChillResult = "N/A";
}

document.getElementById("windChill").textContent = windChillResult;