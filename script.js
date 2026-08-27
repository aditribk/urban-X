// ==========================================
// UrbanEye AI - FINAL SCRIPT
// ==========================================


// ==========================================
// 1. LIVE GIS MAP
// ==========================================

// Create map
const map = L.map("map").setView(
    [11.0168, 76.9558],
    13
);


// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// 2. BUS MARKER
// ==========================================

const busMarker = L.marker(
    [11.0168, 76.9558]
)
.addTo(map)
.bindPopup(`
    <b>🚌 BUS-001</b><br>
    Status: AI Processing<br>
    Network: Online
`);


// ==========================================
// 3. STATIC EVENT MARKERS
// ==========================================

// Pothole
L.marker([11.0220, 76.9600])
    .addTo(map)
    .bindPopup(`
        <b>🕳️ Pothole Detected</b><br>
        Confidence: 94%<br>
        Severity: HIGH
    `);


// Heavy Traffic
L.marker([11.0100, 76.9480])
    .addTo(map)
    .bindPopup(`
        <b>🚗 Heavy Traffic</b><br>
        Traffic Density: HIGH
    `);


// Waterlogging
L.marker([11.0300, 76.9700])
    .addTo(map)
    .bindPopup(`
        <b>🌊 Waterlogging</b><br>
        Severity: HIGH
    `);


// ==========================================
// 4. LIVE AI DATA FROM PYTHON
// ==========================================

async function updateLiveData() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/live-data"
        );

        if (!response.ok) {
            throw new Error("Live API not available");
        }

        const data = await response.json();

        console.log("Live AI Data:", data);


        // ==========================================
        // DASHBOARD DATA
        // ==========================================

        const vehicleElement =
            document.getElementById("vehicle");

        const trafficElement =
            document.getElementById("trafficStatus");

        const alertsElement =
            document.getElementById("alerts");

        const defectsElement =
            document.getElementById("roadDefects");


        if (vehicleElement) {
            vehicleElement.innerText =
                data.vehicles ?? 0;
        }


        if (trafficElement) {
            trafficElement.innerText =
                data.traffic_status ?? "LOW";
        }


        if (alertsElement) {
            alertsElement.innerText =
                data.active_alerts ?? 0;
        }


        if (defectsElement) {
            defectsElement.innerText =
                data.road_defects ?? 0;
        }


        // ==========================================
        // REPORT LIVE SUMMARY
        // ==========================================

        const reportVehicles =
            document.getElementById("reportVehicles");

        const reportDefects =
            document.getElementById("reportDefects");

        const reportAlerts =
            document.getElementById("reportAlerts");

        const reportTraffic =
            document.getElementById("reportTraffic");


        if (reportVehicles) {
            reportVehicles.innerText =
                data.vehicles ?? 0;
        }


        if (reportDefects) {
            reportDefects.innerText =
                data.road_defects ?? 0;
        }


        if (reportAlerts) {
            reportAlerts.innerText =
                data.active_alerts ?? 0;
        }


        if (reportTraffic) {
            reportTraffic.innerText =
                data.traffic_status ?? "LOW";
        }


        // ==========================================
        // TOTAL PERSONS
        // ==========================================

        const reportPersons =
            document.getElementById("reportPersons");

        if (reportPersons && data.persons !== undefined) {

            reportPersons.innerText =
                data.persons ?? 0;

        }


        // ==========================================
        // ACTIVE FLEET
        // ==========================================

        const reportBuses =
            document.getElementById("reportBuses");

        if (reportBuses) {

            // If Python sends active_buses use that.
            // Otherwise show 3 connected buses.
            reportBuses.innerText =
                data.active_buses ??
                data.buses ??
                3;

        }


        // ==========================================
        // GPS LOCATION
        // ==========================================

        const lat =
            Number(data.latitude);

        const lng =
            Number(data.longitude);


        if (
            !isNaN(lat) &&
            !isNaN(lng)
        ) {

            // Move bus marker
            busMarker.setLatLng([
                lat,
                lng
            ]);


            // Update report GPS
            const reportGPS =
                document.getElementById("reportGPS");


            if (reportGPS) {

                reportGPS.innerText =
                    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            }


            // Update map location
            map.setView(
                [lat, lng],
                13,
                {
                    animate: false
                }
            );

        }

    }

    catch (error) {

        console.error(
            "Live API connection error:",
            error
        );

    }

}


// ==========================================
// 5. START LIVE DATA
// ==========================================

updateLiveData();


// Update every 1 second
setInterval(
    updateLiveData,
    1000
);



// ==========================================
// 6. REPORTS PAGE NAVIGATION
// ==========================================

const reportsBtn =
    document.getElementById("reportsBtn");

const reportsPage =
    document.getElementById("reportsPage");

const backDashboard =
    document.getElementById("backDashboard");


const dashboardContent =
    document.querySelectorAll(
        ".main-content > header, " +
        ".main-content > .stats, " +
        ".main-content > .map-section, " +
        ".main-content > .bottom-section"
    );


// ==========================================
// OPEN REPORTS
// ==========================================

if (reportsBtn) {

    reportsBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            // Hide dashboard
            dashboardContent.forEach(
                function (element) {

                    element.style.display =
                        "none";

                }
            );


            // Show reports
            if (reportsPage) {

                reportsPage.style.display =
                    "block";

            }


            // Load saved reports
            loadReports();

        }
    );

}


// ==========================================
// BACK TO DASHBOARD
// ==========================================

if (backDashboard) {

    backDashboard.addEventListener(
        "click",
        function () {

            // Hide reports
            if (reportsPage) {

                reportsPage.style.display =
                    "none";

            }


            // Show dashboard
            dashboardContent.forEach(
                function (element) {

                    element.style.display =
                        "";

                }
            );

        }
    );

}



// ==========================================
// 7. LOAD SAVED REPORT HISTORY
// ==========================================

async function loadReports() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/reports"
        );


        if (!response.ok) {

            throw new Error(
                "Reports API not available"
            );

        }


        const reports =
            await response.json();


        console.log(
            "Reports loaded:",
            reports
        );


        // ==========================================
        // GET HTML ELEMENTS
        // ==========================================

        const tableBody =
            document.getElementById(
                "reportsTableBody"
            );


        const reportCount =
            document.getElementById(
                "reportCount"
            );


        const reportVehicles =
            document.getElementById(
                "reportVehicles"
            );


        const reportPersons =
            document.getElementById(
                "reportPersons"
            );


        const reportDefects =
            document.getElementById(
                "reportDefects"
            );


        const reportAlerts =
            document.getElementById(
                "reportAlerts"
            );


        const reportTraffic =
            document.getElementById(
                "reportTraffic"
            );


        const reportGPS =
            document.getElementById(
                "reportGPS"
            );



        // ==========================================
        // NO REPORTS
        // ==========================================

        if (
            !Array.isArray(reports) ||
            reports.length === 0
        ) {

            if (tableBody) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8">
                            No reports saved yet.
                        </td>
                    </tr>
                `;

            }


            if (reportCount) {

                reportCount.innerText =
                    "0 Reports";

            }

            return;

        }



        // ==========================================
        // CALCULATE TOTALS
        // ==========================================

        let totalVehicles = 0;

        let totalPersons = 0;

        let totalDefects = 0;

        let totalAlerts = 0;


        reports.forEach(
            function (report) {

                totalVehicles +=
                    Number(
                        report.vehicles || 0
                    );


                totalPersons +=
                    Number(
                        report.persons || 0
                    );


                totalDefects +=
                    Number(
                        report.road_defects || 0
                    );


                totalAlerts +=
                    Number(
                        report.active_alerts || 0
                    );

            }
        );



        // ==========================================
        // LATEST REPORT
        // ==========================================

        const latestReport =
            reports[reports.length - 1];



        // ==========================================
        // UPDATE SUMMARY CARDS
        // ==========================================

        if (reportVehicles) {

            reportVehicles.innerText =
                totalVehicles;

        }


        if (reportPersons) {

            reportPersons.innerText =
                totalPersons;

        }


        if (reportDefects) {

            reportDefects.innerText =
                totalDefects;

        }


        if (reportAlerts) {

            reportAlerts.innerText =
                totalAlerts;

        }


        if (reportTraffic) {

            reportTraffic.innerText =
                latestReport.traffic_status ||
                "LOW";

        }



        // ==========================================
        // UPDATE GPS
        // ==========================================

        if (reportGPS) {

            const latestLat =
                latestReport.latitude ??
                11.0168;

            const latestLng =
                latestReport.longitude ??
                76.9558;


            reportGPS.innerText =
                `${latestLat}, ${latestLng}`;

        }



        // ==========================================
        // REPORT COUNT
        // ==========================================

        if (reportCount) {

            reportCount.innerText =
                `${reports.length} Reports`;

        }



        // ==========================================
        // CREATE TABLE
        // ==========================================

        if (!tableBody) {
            return;
        }


        // Clear old rows
        tableBody.innerHTML = "";


        // Latest report first
        const latestReports =
            [...reports].reverse();



        latestReports.forEach(
            function (report) {

                const row =
                    document.createElement("tr");


                const traffic =
                    report.traffic_status ||
                    "LOW";


                const trafficClass =
                    traffic
                        .toLowerCase()
                        .replace(/\s+/g, "-");


                row.innerHTML = `

                    <td>
                        🕒 ${report.timestamp ?? "-"}
                    </td>

                    <td>
                        🚗 ${report.vehicles ?? 0}
                    </td>

                    <td>
                        👤 ${report.persons ?? 0}
                    </td>

                    <td>
                        <span class="traffic-badge ${trafficClass}">
                            ${traffic}
                        </span>
                    </td>

                    <td>
                        🛣️ ${report.road_defects ?? 0}
                    </td>

                    <td>
                        🚨 ${report.active_alerts ?? 0}
                    </td>

                    <td>
                        📍 ${report.latitude ?? "-"}
                    </td>

                    <td>
                        📍 ${report.longitude ?? "-"}
                    </td>

                `;


                tableBody.appendChild(row);

            }
        );


        console.log(
            "Detection history updated successfully."
        );

    }


    catch (error) {

        console.error(
            "Reports loading error:",
            error
        );

    }

}



// ==========================================
// 8. LOAD REPORTS WHEN PAGE LOADS
// ==========================================

// This is useful if reports page is already visible
// or if data needs to be ready immediately.

loadReports();

// SIDEBAR ACTIVE MENU
const menuItems = document.querySelectorAll(".sidebar nav a");

menuItems.forEach(item => {
    item.addEventListener("click", function () {

        menuItems.forEach(menu => {
            menu.classList.remove("active");
        });

        this.classList.add("active");
    });
});