var dataPoints = 800;
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
var humCount = 0;
var tempCount = 0;
var co2Count = 0;
var tvocCount = 0;
var kWhCount = 0;

//console.log(newDataArray);
for (var i = 1; i < newDataArray.length; i++) {
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
	  case "wms":
		kWhArray[tvocCount] = (newDataArray[i]+tvocArray[kWhCount-1])/(3.6*Math.pow(10,9));
		tvocCount++;
		break;
  }
}

//console.log(humidityArray);
function getData(theArray){
  var dict = [];

  for (var i = 0; i < theArray.length; i++) {
    var d = new Date(0);
    d.setUTCSeconds(theArray[i][0]);
    dict.push({
      x: d,
      //x:  new Date(2020, 2, d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()),
      y: parseInt(theArray[i][2])
    });
  }

  var arrToReturn = []
  for (var i = 0; i < dataPoints + 1; i++) {
    arrToReturn[i] = dict[i];
  }
  return arrToReturn;
}

var humidityValue = getData(humidityArray);
var temperatureValue = getData(tempArray);
var co2Value = getData(co2Array);
var tvocValue = getData(tvocArray);

var containerNames = ["chartContainer1","chartContainer2","chartContainer3","chartContainer4"];
var chartTitles = ["Humidity", "Temperature", "CO2", "TVOC"];
var xAxisNames = ["DD MMM", "DD MMM", "DD MMM", "DD MMM"];
var yAxisNames = ["% Humidity","Fahrenheit", "CO2 ppm", "TVOC ppm"];
var chartColors = ["red","orange","green","blue"];
var dataPointVars = [humidityValue,temperatureValue,co2Value,tvocValue];
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


for(var i=0; i < 4; i++){
    charts[i].render();
}

function toggleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else{
		e.dataSeries.visible = true;
	}
	for(var i=0; i < 4; i++){
        charts[i].render();
    }
}

}