import cv2
import requests
from ultralytics import YOLO

# 1. Load your YOLO model weight file from the repository
model = YOLO('yolo11n.pt')

# 2. Open webcam (use 0) or replace with 'video.mp4' for a test video file
cap = cv2.VideoCapture(0)

print("Starting YOLO Urban Intelligence Detection... Press 'q' to stop.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Run detection on current frame
    results = model(frame)

    # Track object counts
    vehicle_count = 0
    person_count = 0

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]
            
            if class_name in ['car', 'bus', 'truck', 'motorbike']:
                vehicle_count += 1
            elif class_name == 'person':
                person_count += 1

    # 3. Payload to send to Flask API
    payload = {
        "bus_id": "BUS-101",
        "camera_id": "CAM-001",
        "vehicles": vehicle_count,
        "persons": person_count,
        "traffic_status": "HIGH" if vehicle_count > 10 else "MEDIUM" if vehicle_count > 4 else "LOW",
        "road_defects": 0,
        "potholes": 0,
        "floods": 0,
        "zebra_crossings": 0,
        "active_alerts": 1 if vehicle_count > 10 else 0,
        "latitude": 11.0168,
        "longitude": 76.9558
    }

    # 4. Push detection output to SQLite via Flask
    try:
        requests.post('http://127.0.0.1:5000/api/reports', json=payload)
    except Exception as e:
        print("Backend server not connected:", e)

    # Render detection box visuals on screen
    annotated_frame = results[0].plot()
    cv2.imshow("Urban-X Real-Time YOLO Detection", annotated_frame)

    # Press 'q' on keyboard to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()