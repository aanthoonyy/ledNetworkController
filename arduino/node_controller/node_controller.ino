#include <ArduinoJson.h>

#define LED_PIN 5

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, Serial);

    if (!error && doc["type"] == "light_control") {
      String command = doc["command"].as<String>();
      
      if (command == "on") {
        analogWrite(LED_PIN, 45);
      } else if (command == "off") {
        analogWrite(LED_PIN, 0);
      }
      
      StaticJsonDocument<200> response;
      response["type"] = "arduino_state";
      response["nodeId"] = "node1";
      response["state"] = command;
      response["color"] = "green";
      
      serializeJson(response, Serial);
      Serial.println();
    }
  }
}
