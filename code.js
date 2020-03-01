var numPoints = 60;
var dataStart = 0;
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var response = httpGet('http://192.168.43.41:1880/data.csv');//httpGet('http://localhost:8003/data.csv');
var data = response.split("\n");
var dataArray = [], size = 1;
while (data.length > 0){
      dataArray.push(data.splice(0, size));
    }
//console.log(dataArray)
var newDataArray = [];
for (var i = 0; i < dataArray.length; i++) {
  newDataArray[i] = dataArray[i].toString().split(",");
}
//console.log(newDataArray);

var humidityArray = [];
var tempArray = [];
var co2Array = [];
var tvocArray = [];
var kWhArray = [];
var fanArray = [];
var humCount = 0;
var tempCount = 0;
var co2Count = 0;
var tvocCount = 0;
var kWhCount = 0;
var fanCount = 0;
console.log(dataStart);
console.log(newDataArray.length);
console.log(newDataArray);
for (var i = 0; i < newDataArray.length; i++) {
  switch(newDataArray[i][1]){
	  case "humidity":
      humidityArray[humCount] = newDataArray[i];
      humCount++;
      break;
	  case "temperature":
      tempArray[tempCount] = newDataArray[i];
      tempCount++;
      break;
    case "co2":
      co2Array[co2Count] = newDataArray[i];
      co2Count++;
      break;
	  case "tvoc":
      tvocArray[tvocCount] = newDataArray[i];
      tvocCount++;
      break;
	  case "toaster_power":
      // if(i > 0){
      //   kWhArray[kWhCount] = 1.0*(newDataArray[i]+kWhArray[kWhCount-1]);//(3.6*Math.pow(10.0,9));
      
      // } else{
      //   kWhArray[kWhCount] = newDataArray[i];
      // }
      
      // if(kWhCount > 0){
      //   kWhArray[kWhCount] = 1.0*(newDataArray[i]+kWhArray[kWhCount-1]);
      //   console.log(kWhArray[kWhCount-1]);
      // } else {
      //   kWhArray[0] = newDataArray[i];
      // }
      kWhArray[kWhCount] = newDataArray[i];
      kWhCount++;
      break;
    case "fan_power":
      fanArray[fanCount] = newDataArray[i];
      fanCount++;
      break;
  }
}

//console.log(humidityArray);
function getData(theArray){
  var dict = [];

  for (var i = theArray.length-numPoints; i < theArray.length; i++) {
    var d = new Date(0);
    d.setUTCSeconds(theArray[i][0]);
    dict.push({
      x: d,
      //x:  new Date(2020, 2, d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()),
      y: parseInt(theArray[i][2])
    });
  }

  var arrToReturn = []
  for (var i = 0; i < dict.length; i++) {
    arrToReturn[i] = dict[i];
  }
  return arrToReturn;
}

var humidityValue = getData(humidityArray);
var temperatureValue = getData(tempArray);
var co2Value = getData(co2Array);
var tvocValue = getData(tvocArray);
var toasterkWhValue = getData(kWhArray);
var fankWhValue = getData(fanArray);
console.log(kWhArray);

var containerNames = ["chartContainer1","chartContainer2","chartContainer3","chartContainer4","chartContainer5", "chartContainer6"];
var chartTitles = ["Humidity", "Temperature", "CO2", "TVOC","Toaster Power Consumption", "Fan Power Consumption"];
var xAxisNames = ["DD MMM", "DD MMM", "DD MMM", "DD MMM", "DD MMM", "DD MMM"];
var yAxisNames = ["% Humidity","Fahrenheit", "CO2 ppm", "TVOC ppm", "kWh", "kWh"];
var chartColors = ["red","orange","green","red","purple", "black"];
var dataPointVars = [humidityValue,temperatureValue,co2Value,tvocValue,toasterkWhValue, fankWhValue];
var charts = [];

window.onload = function () {

for(var i = 0; i < this.containerNames.length; i++){
    charts.push( new CanvasJS.Chart(this.containerNames[i], {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: this.chartTitles[i]
        },
        axisX:{
            valueFormatString: this.xAxisNames[i],
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        axisY: {
            title: this.yAxisNames[i],
            crosshair: {
                enabled: true
            }
        },
        toolTip:{
            shared:true
        },
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toggleDataSeries
        },
        data: [{
            type: "line",
            showInLegend: true,
            name: this.chartTitles[i],
            markerType: "square",
            xValueFormatString: "DD MMM, YYYY",
            color: chartColors[i],
            dataPoints: this.dataPointVars[i]
        }]
    })
    );
    this.console.log(charts[i])
}


for(var i=0; i < this.charts.length; i++){
    charts[i].render();
}

function toggleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else{
		e.dataSeries.visible = true;
	}
	for(var i=0; i < this.charts.length; i++){
        charts[i].render();
    }
}

}