#include <SPI.h>
#include <WiFi101.h>
#include <WiFiUdp.h>
#include <RTCZero.h>
#include <ArduinoJson.h>

// Time Related
RTCZero rtc;

// Wifi Related
//char ssid[] = "Sebastian's iPhone";
//char pass[] = "675washington";
char ssid[] = "Freedom Ain't Not Free";
char pass[] = "Isabelthegreat";
//char ssid[] = "Device-Northwestern";
int status = WL_IDLE_STATUS;

// Firebase
WiFiSSLClient client;
#define HOST "eecs-399.firebaseio.com"
#define SECRET "vA96yvu9Rv4aCE6d0vdv3m5wbV2FvipcKNPq2qNI"
#define PATH "/test.json"
char bodyBuffer[100];

void setup() {
  Serial.begin(115200);
  connectToWifi();
  setupRTC();
  client.connect(HOST, 443);
}

void loop() {
  update_fuego(3);
  delay(20000);
}

void update_fuego(int count) {
  while(!connectClient()) {
    connectClient();
  }
  sendData(count);
}

boolean connectClient() {
  if (!client.connected()) {
    Serial.println("Error connecting to host");
    client.stop();
    client.flush();
    delay(1000);
    client.connect(HOST, 443);
  } else {
    Serial.println("Connected");
    return true;
  }
  
  return false;
}

void sendData(int count) {
  Serial.println("Preparing payload:");
  int size = constructJson(count);
  Serial.println(bodyBuffer);

  char pathBuffer[100];
  sprintf(pathBuffer, "POST %s?auth=%s HTTP/1.1", PATH, SECRET);
  client.println(pathBuffer);
  client.print("Host: ");
  client.println(HOST);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(size);
  client.println("Accept: application/json");
  client.println("Connection: close");
  client.println();
  client.println(bodyBuffer);
}

int constructJson(int count) {
  StaticJsonBuffer<100> jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  
  int timestamp = rtc.getHours()*10000 + rtc.getMinutes()*100 + rtc.getSeconds();
  int datestamp = rtc.getYear()*10000 + rtc.getMonth()*100 +rtc.getDay();
  
  root["count"] = count;
  root["time"] = timestamp;
  root["date"] = datestamp;
  root.printTo(bodyBuffer, sizeof(bodyBuffer));
  return root.measureLength();
}

void connectToWifi() {
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);
    delay(10000);
  }
  printWiFiStatus();
}

void printWiFiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void setupRTC() {
  rtc.begin();
  unsigned long epoch;
  int numberOfTries = 0, maxTries = 6;
  do {
    epoch = WiFi.getTime();
    numberOfTries++;
  }
  while ((epoch == 0) || (numberOfTries > maxTries));

  if (numberOfTries > maxTries) {
    Serial.print("NTP unreachable!!");
    while (1);
  }
  else {
    Serial.print("Epoch received: ");
    Serial.println(epoch);
    rtc.setEpoch(epoch);
    Serial.println();
  }
}


