import cv2
from ultralytics import YOLO
from flask import Flask, jsonify
from flask_cors import CORS
import threading
from datetime import datetime


# ==========================================
# FLASK API SETUP
# ==========================================

app = Flask(__name__)
CORS(app)


# ==========================================
# LIVE DATA
# ==========================================

live_data = {
    "persons": 0,
    "vehicles": 0,
    "traffic_status": "LOW",
    "road_defects": 0,
    "active_alerts": 0,
    "latitude": 11.0168,
    "longitude": 76.9558
}


# ==========================================
# REPORT HISTORY
# ==========================================

report_history = []


# ==========================================
# LIVE DATA API
# ==========================================

@app.route("/api/live-data")
def get_live_data():
    return jsonify(live_data)


# ==========================================
# REPORTS API
# ==========================================

@app.route("/api/reports")
def get_reports():
    return jsonify(report_history)


# ==========================================
# RUN FLASK SERVER
# ==========================================

def run_api():

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        use_reloader=False
    )


# Start API in background
api_thread = threading.Thread(
    target=run_api,
    daemon=True
)

api_thread.start()


# ==========================================
# LOAD YOLO MODEL
# ==========================================

model = YOLO("yolo11n.pt")


# ==========================================
# OPEN WEBCAM
# ==========================================

cap = cv2.VideoCapture(0)


print("==========================================")
print("UrbanEye AI started...")
print("Live API:")
print("http://127.0.0.1:5000/api/live-data")
print("Reports API:")
print("http://127.0.0.1:5000/api/reports")
print("Press Q to stop")
print("==========================================")


# ==========================================
# TEMPORARY GPS LOCATION
# ==========================================

latitude = 11.0168
longitude = 76.9558


# ==========================================
# WEBCAM DETECTION LOOP
# ==========================================

while True:

    # Read webcam frame
    success, frame = cap.read()

    if not success:
        print("Unable to access webcam")
        break


    # ==========================================
    # YOLO DETECTION
    # ==========================================

    results = model(frame, verbose=False)

    vehicle_count = 0
    person_count = 0


    # ==========================================
    # DETECT OBJECTS
    # ==========================================

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])

            class_name = model.names[class_id]


            # --------------------------------------
            # PERSON DETECTION
            # --------------------------------------

            if class_name == "person":

                person_count += 1


            # --------------------------------------
            # VEHICLE DETECTION
            # --------------------------------------

            if class_name in [

                "car",
                "motorcycle",
                "bus",
                "truck"

            ]:

                vehicle_count += 1


    # ==========================================
    # TRAFFIC STATUS
    # ==========================================

    if vehicle_count <= 2:

        traffic_status = "LOW"

    elif vehicle_count <= 5:

        traffic_status = "MEDIUM"

    else:

        traffic_status = "HIGH"


    # ==========================================
    # ACTIVE ALERTS
    # ==========================================

    active_alerts = 0


    # Heavy traffic alert
    if vehicle_count >= 6:

        active_alerts += 1


    # Pedestrian + vehicle risk alert
    if person_count >= 1 and vehicle_count >= 4:

        active_alerts += 1


    # ==========================================
    # ROAD DEFECTS
    # ==========================================

    # Temporary value
    # Later we can connect a pothole / road defect
    # trained AI model here

    road_defects = 0


    # ==========================================
    # UPDATE LIVE DASHBOARD DATA
    # ==========================================

    live_data["persons"] = person_count

    live_data["vehicles"] = vehicle_count

    live_data["traffic_status"] = traffic_status

    live_data["road_defects"] = road_defects

    live_data["active_alerts"] = active_alerts

    live_data["latitude"] = latitude

    live_data["longitude"] = longitude


    # ==========================================
    # SAVE REPORT WHEN STATUS CHANGES
    # ==========================================

    if (
        len(report_history) == 0
        or report_history[-1]["traffic_status"] != traffic_status
    ):

        report = {

            "timestamp": datetime.now().strftime(
                "%d-%m-%Y %H:%M:%S"
            ),

            "vehicles": vehicle_count,

            "persons": person_count,

            "traffic_status": traffic_status,

            "road_defects": road_defects,

            "active_alerts": active_alerts,

            "latitude": latitude,

            "longitude": longitude

        }


        # Add report
        report_history.append(report)


        # Keep only latest 50 reports
        if len(report_history) > 50:

            report_history.pop(0)


        print("Report saved:", report)


    # ==========================================
    # DRAW YOLO DETECTION BOXES
    # ==========================================

    annotated_frame = results[0].plot()


    # ==========================================
    # DISPLAY INFORMATION
    # ==========================================

    cv2.putText(
        annotated_frame,
        f"Persons: {person_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    cv2.putText(
        annotated_frame,
        f"Vehicles: {vehicle_count}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    cv2.putText(
        annotated_frame,
        f"Traffic: {traffic_status}",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    cv2.putText(
        annotated_frame,
        f"Alerts: {active_alerts}",
        (20, 160),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    # ==========================================
    # SHOW WEBCAM
    # ==========================================

    cv2.imshow(
        "UrbanEye AI - Live Detection",
        annotated_frame
    )


    # ==========================================
    # PRESS Q TO STOP
    # ==========================================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

cap.release()

cv2.destroyAllWindows()

print("UrbanEye AI stopped.")