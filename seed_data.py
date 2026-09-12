import sqlite3

conn = sqlite3.connect('urbanx.db')
cursor = conn.cursor()

# 1. Insert sample row into reports
cursor.execute('''
    INSERT INTO reports (
        bus_id, camera_id, vehicles, persons, traffic_status,
        road_defects, potholes, floods, zebra_crossings, active_alerts, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', ('BUS-001', 'CAM-001', 15, 6, 'MEDIUM', 2, 2, 0, 1, 1, 11.0168, 76.9558))

# 2. Insert sample row into accident_incidents
cursor.execute('''
    INSERT INTO accident_incidents (
        incident_id, bus_id, camera_id, vehicle_type, registration_number,
        plate_confidence, status, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', ('INC-101', 'BUS-001', 'CAM-001', 'Car', 'TN37AB1234', 0.94, 'New', 11.0168, 76.9558))

# 3. Insert sample row into detection_events
cursor.execute('''
    INSERT INTO detection_events (
        detection_type, bus_id, camera_id, confidence, status, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
''', ('Pothole Detected', 'BUS-001', 'CAM-001', 0.88, 'OPEN', 11.0168, 76.9558))

conn.commit()
conn.close()

print("Sample data inserted successfully!")