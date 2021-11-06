/*
 * Written by FevenKitsune (https://github.com/FevenKitsune)
 * This is free and unencumbered software released into the public domain.
 * 
 * The HTTPSRedirect library can be found here:
 * https://github.com/jbuszkie/HTTPSRedirect
 */

#include <Arduino.h>
#include <esp_task_wdt.h>
#include "WiFi.h"
#include "HTTPSRedirect.h"
#include <Wire.h>
#include "Adafruit_HTU21DF.h"

HTTPSRedirect *client = nullptr;

Adafruit_HTU21DF htu = Adafruit_HTU21DF();

const char *ssid = "SSIDREMOVED";
int httpCode;

String temperature;
String humidity;

String redirect;

void setup()
{
  Serial.begin(9600);

  /*
   * Sensor initialization block.
   */
  Serial.println(F("Armed 5s WDT, connecting to sensors..."));
  esp_task_wdt_init(5, true);
  esp_task_wdt_add(NULL);
  while (!htu.begin())
    ;
  Serial.println(F("Connection success! Disarming WDT..."));
  esp_task_wdt_delete(NULL);

  /*
   * WiFi initialization block.
   */
  Serial.println(F("Armed 5s WDT, connecting to WiFi..."));
  esp_task_wdt_init(5, true);
  esp_task_wdt_add(NULL);
  WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED)
    ;
  Serial.println(F("Connection success! Disarming WDT..."));
  esp_task_wdt_delete(NULL);

  Serial.print(F("IP Address: "));
  Serial.println(WiFi.localIP());

  delay(1000);

  /*
   * HTTP Post block.
   */
  Serial.println(F("Armed 25m WDT, posting data."));
  esp_task_wdt_init(1500, true); // 1500 = 25 minutes.
  esp_task_wdt_add(NULL);
  Serial.println(F("Polling sensors..."));
  temperature = htu.readTemperature();
  humidity = htu.readHumidity();
  Serial.println(F("Creating HTTPSRedirect object."));
  client = new HTTPSRedirect(433);
  client->setInsecure();
  Serial.println(F("Connecting and posting data."));
  client->connect("script.google.com", 443);
  client->GET("/macros/s/IDREMOVED/exec?temperature=" + temperature + "&humidity=" + humidity + "&outsideHumidity=0.0", "script.google.com");
  client->stop();
  Serial.println(F("Transfer complete. Awaiting WDT reset."));
}

void loop()
{
  /*lol*/
}