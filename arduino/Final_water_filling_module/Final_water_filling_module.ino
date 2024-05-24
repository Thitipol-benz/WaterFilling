#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define RST_PIN     0     // เลือกขา RST ของ RC522 เชื่อมกับขา GPIO 22 ของ ESP32
#define SS_PIN      5     // เลือกขา SDA(SS) ของ RC522 เชื่อมกับขา GPIO 21 ของ ESP32
int Solval = 26;          // Solenoid valve pin 26
#define IR_SENSOR_PIN 16 
#include "HX711.h"
float calibration_factor = 175152.00; 
#define zero_factor 8218449
#define DOUT  25
#define CLK   32
#define DEC_POINT  2

float offset = 0;
float get_units_kg();

HX711 scale(DOUT, CLK);

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

// Connect WiFi
const char *ssid = "j";
const char *password = "Kmutt200";

// Connect API
const char *apiEndpoint = "http://172.20.10.7:3000/usersmongo"; //ดึงข้อมูลลงมา
const char* serverName = "http://localhost:3000/volume/update"; //ส่งข้อมูลกลับ

void setup() {
  Serial.begin(9600); // เริ่มต้นใช้งาน Serial Monitor
  pinMode(IR_SENSOR_PIN, INPUT);
  pinMode(Solval, OUTPUT);
  Serial.println("Load Cell");
  scale.set_scale(calibration_factor); 
  scale.set_offset(zero_factor);  
  SPI.begin();        // เริ่มต้นใช้งาน SPI bus
  mfrc522.PCD_Init(); // เริ่มต้นใช้งาน MFRC522
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");  // เเสดงผล
  }
  Serial.println("Connected to WiFi");  // เเสดงผล
  Serial.println("Scan for RFID tags...");  // เเสดงผล
}

void loop() {
  int IR_value = digitalRead(IR_SENSOR_PIN); // ค่าของ IR = ค่าดิจิตอลของ IR_SENSOR_PIN
  String data = String(get_units_kg() + offset, DEC_POINT);
  Serial.print(data);
  Serial.println(" kg");
  delay(100);
  
  // ค้นหาการสื่อสารจาก tag
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // อ่าน UID
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // แสดง UID ในรูปแบบเลขฐาน 16 (Hex)
  Serial.print("UID tag : =");
  String content = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      Serial.print("0");
      content.concat("0");
    }
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    content.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  Serial.println(content);
  content.toUpperCase();

  HTTPClient http;
  String apiUrl = String(apiEndpoint) + "?rfid=" + content;
  http.begin(apiUrl);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);

  int httpCode = http.GET();
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("Response: " + payload);

    // Parse JSON
    DynamicJsonDocument doc(1024);  // Adjust size as needed
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }

    // Extract volume value
    int volume = doc["volume"].as<int>();
    Serial.print("Volume: ");
    Serial.println(volume);
    float Fill = volume / 1000 + 0.330;
    Serial.println(Fill);

    if (IR_value == 0 && data.toFloat() <= Fill) {
      Serial.print(data);
      Serial.println(" kg");
      Serial.println("Filling");
      digitalWrite(Solval, HIGH); // สั่งให้พิน 16 เป็นสถานะ HIGH
    } else if (IR_value == 0 && data.toFloat() > Fill) {
      Serial.print(data);
      Serial.println(" kg");
      Serial.println("STOP");
      digitalWrite(Solval, LOW); // สั่งให้พิน 16 เป็นสถานะ LOW

      // ส่งข้อมูลไปยัง API serverName
      String postData = "{\"rfid\":\"" + content + "\",\"volume\":\"" + data + "\"}";
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(postData);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println(httpResponseCode);
        Serial.println(response);
      } else {
        Serial.print("Error on sending POST: ");
        Serial.println(httpResponseCode);
      }

      http.end();
    }
  } else {
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  delay(100);
}

float get_units_kg() {
  return (scale.get_units() * 0.453592);
}