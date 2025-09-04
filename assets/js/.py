import requests
import json
import threading
import time
from flask import Flask, request, jsonify

class ExpoAndroidSimulator:
    def __init__(self, expo_url):
        self.expo_url = expo_url
        self.fake_android_headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
            'sec-ch-ua-platform': 'Android',
            'sec-ch-ua-mobile': '?1',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'com.expo.app',
            'Referer': expo_url,
            'Origin': expo_url.replace('exp://', 'http://'),
        }
        
    def send_fake_android_request(self):
        """إرسال طلب بـ platform Android وهمي"""
        try:
            # تحويل exp:// إلى http:// للطلبات
            http_url = self.expo_url.replace('exp://', 'http://')
            
            # بيانات وهمية للطلب
            payload = {
                "platform": "android",
                "deviceId": "fake_android_device_12345",
                "appVersion": "1.0.0",
                "deviceName": "Android Emulator",
                "model": "Pixel 6",
                "osVersion": "13",
                "isDevice": True,
                "expoVersion": "49.0.0"
            }
            
            # إرسال الطلب
            response = requests.post(
                f"{http_url}/_expo/logo",
                headers=self.fake_android_headers,
                json=payload,
                timeout=10
            )
            
            print(f"Request sent to: {http_url}")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            return response.json()
            
        except Exception as e:
            print(f"Error sending request: {e}")
            return None

    def simulate_android_device(self):
        """محاكاة جهاز Android بشكل مستمر"""
        while True:
            self.send_fake_android_request()
            time.sleep(5)  # إرسال كل 5 ثواني

# استخدام الكلاس
if __name__ == "__main__":
    expo_url = "exp://192.168.1.100:8081"  # استبدل بعنوانك
    
    simulator = ExpoAndroidSimulator(expo_url)
    
    # بدء المحاكاة في thread منفصل
    sim_thread = threading.Thread(target=simulator.simulate_android_device, daemon=True)
    sim_thread.start()
    
    print("Android simulation started. Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Simulation stopped.")