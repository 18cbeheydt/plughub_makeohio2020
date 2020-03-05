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

const float MAX_CURRENT = 9;
const int fanRelayPin = 15;
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
  while (!client.connect("arduino2", "try", "try")) {
    Serial.print(".");
    delay(1000);
  }

  client.subscribe("/devices/fan/state");

  Serial.println("\nconnected!");
}

void fanCallback(String &topic, String &payload) {
  if (payload == "on") {
    digitalWrite(fanRelayPin, HIGH);
    Serial.println("on");
  } else {
    digitalWrite(fanRelayPin, LOW);
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
  client.onMessage(fanCallback);

  connect();

  pinMode(Pot1Pin, INPUT);

  pinMode(fanRelayPin, OUTPUT);
  digitalWrite(fanRelayPin, LOW);
}

void loop()
{
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability

  if (!client.connected()) {
    connect();
  }

  pot1Value = analogRead(Pot1Pin);
  current = ((float)(pot1Value) / 1024) * MAX_CURRENT;
  Serial.println(current);

  float power = current * 120;
  float wPerMs = (millis() - lastMillis) * power;
  char wPerMsStr[12];
  dtostrf(wPerMs, 10, 0, wPerMsStr);
  client.publish("/devices/fan/power", wPerMsStr);

  lastMillis = millis();

  delay(5000);
}