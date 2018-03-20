#include <LIDARLite.h>
#include <Wire.h>

LIDARLite myLidarLiteInstance;

void lidarSetup()
{
  myLidarLiteInstance.begin();
  int sensorPins[] = {1,3};
  unsigned char addresses[] = {0x64,0x66};
  myLidarLiteInstance.changeAddressMultiPwrEn(2,sensorPins,addresses,false);
}

int getLidarDistance(char lidarAddress)
{
  return myLidarLiteInstance.distance(true,true,lidarAddress);
}

void printLidarDistances()
{
  Serial.println("Left:");
  Serial.println(getLidarDistance(0x64));
  Serial.println(" ");
  delay(1000);  
  Serial.println("Right:");
  Serial.println(getLidarDistance(0x66));
  Serial.println(" ");
  delay(1000);  
}

void setup()
{
  Serial.begin(115200); // Initialize serial connection to display distance readings
  Serial.println("Setting up lidar");
  lidarSetup();
}

void loop()
{
  printLidarDistances();
}


