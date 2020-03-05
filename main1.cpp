#include "DHTesp.h"
#include <ESP8266WiFi.h>
#include <MQTT.h>
#include <Wire.h>
#include "SparkFunCCS811.h"

#ifdef ESP32
#pragma message(THIS EXAMPLE IS FOR ESP8266 ONLY!)
#error Select ESP8266 board.
#endif

/*
* control+shift+p
*/

DHTesp dht;

const char ssid[] = "Verizon-SM-G965U-9794";
const char pass[] = "vvyq518*";

WiFiClient net;
MQTTClient client;

unsigned long lastMillis = millis();

#define CCS811_ADDR 0x5B //Default I2C Address

CCS811 airQualitySensor(CCS811_ADDR);

const float MAX_CURRENT = 9;
const int ToasterRelayPin = 15;
const int Pot1Pin = 17;
int pot1Value = analogRead(Pot1Pin);
float current = ((float)(pot1Value) / 1024.0) * MAX_CURRENT;

void connect() {
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  while (!client.connect("arduino", "try", "try")) {
    Serial.print(".");
    delay(1000);
  }

  client.subscribe("/devices/toaster/state");

  Serial.println("\nconnected!");
}

void toasterCallback(String &topic, String &payload) {
  if (payload == "on") {
    digitalWrite(ToasterRelayPin, HIGH);
    Serial.println("on");
  } else {
    digitalWrite(ToasterRelayPin, LOW);
    Serial.println("off");
  }
}

void setup()
{
  Serial.begin(9600);

  WiFi.begin(ssid, pass);

  // Note: Local domain names (e.g. "Computer.local" on OSX) are not supported by Arduino.
  // You need to set the IP address directly.
  client.begin("192.168.43.41", net);
  client.onMessage(toasterCallback);

  connect();

  Wire.begin(); //Inialize I2C Hardware

  if (airQualitySensor.begin() == false)
  {
    Serial.print("CCS811 error. Please check wiring. Freezing...");
    while (true);
  }

  pinMode(Pot1Pin, INPUT);

  dht.setup(13, DHTesp::DHT11); // Connect DHT sensor to GPIO 17

  pinMode(ToasterRelayPin, OUTPUT);
  digitalWrite(ToasterRelayPin, LOW);
}

void loop()
{
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability

  if (!client.connected()) {
    connect();
  }

  delay(dht.getMinimumSamplingPeriod());

  float humidity = dht.getHumidity();
  float temperature = dht.toFahrenheit(dht.getTemperature());

  char humidityStr[8];
  dtostrf(humidity, 6, 2, humidityStr);
  client.publish("/sensors/humidity", humidityStr);

  char temperatureStr[8];
  dtostrf(temperature, 6, 2, temperatureStr);
  client.publish("/sensors/temperature", temperatureStr);

  if (airQualitySensor.dataAvailable())
  {
    //If so, have the sensor read and calculate the results.
    //Get them later
    airQualitySensor.readAlgorithmResults();

    //Returns calculated CO2 reading
    char co2Str[8];
    dtostrf(airQualitySensor.getCO2(), 6, 2, co2Str);
    client.publish("/sensors/co2", co2Str);

    //Returns calculated TVOC reading
    char tvocStr[8];
    dtostrf(airQualitySensor.getTVOC(), 6, 2, tvocStr);
    client.publish("/sensors/tvoc", tvocStr);
  }

  pot1Value = analogRead(Pot1Pin);
  current = ((float)(pot1Value) / 1024) * MAX_CURRENT;
  Serial.println(current);

  float power = current * 120;
  float wPerMs = (millis() - lastMillis) * power;
  char wPerMsStr[12];
  dtostrf(wPerMs, 10, 0, wPerMsStr);
  client.publish("/devices/toaster/power", wPerMsStr);

  lastMillis = millis();

  delay(5000);
}