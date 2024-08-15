const firebaseConfig = {
    apiKey: "AIzaSyDQLBZquq18ScMUz-CusPv1LZtTwV4dJxA",
    authDomain: "fir-flutter-codelab-a80ae.firebaseapp.com",
    projectId: "fir-flutter-codelab-a80ae",
    storageBucket: "fir-flutter-codelab-a80ae.appspot.com",
    messagingSenderId: "226303980858",
    appId: "1:226303980858:web:b887d62cba3c22fff34c03"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to fetch and display data
function fetchAndDisplayData(doc) {
    const data = doc.data();
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = ''; // Clear the container

    // Add instructions before the Wearing Status card
    addInstruction(dataContainer, `
        <strong>1.</strong> If the LED does not light up, please turn on the switch of the helmet. Then wait for the device to connect to Wi-Fi and the gas sensor to wake up. This process takes about 3 minutes. (LED white - waiting for connection, LED yellow - waking up and preheating).
        <br><strong>2.</strong> When the LED turns green, the gas sensor is warmed up and the device is ready to use. Please wear the helmet and check if the "Wearing" status is displayed.
    `);

    // Add the Wearing Status card
    addDataItemSimple(dataContainer, '<i class="fas fa-hard-hat"></i>', 'Wearing Status', data.fsr ? 'Wearing' : 'Not Wearing');

    // Add instructions before the Heart Rate card
    addInstruction(dataContainer, `
        <strong>3.</strong> Press your forehead against the heart rate sensor in the helmet to ensure good contact. Then check the changes in heart rate data.
    `);

    // Add the Heart Rate card
    addDataItemSimple(dataContainer, '<i class="fas fa-heartbeat"></i>', 'Heart Rate', data.avgbpm);

    // Add instructions before the Gas Sensor card
    addInstruction(dataContainer, `
        <strong>4.</strong> Take a cotton swab and dip it in a small amount of Isopropanol Alcohol liquid. Place the cotton swab close to the ventilation hole on the top of the helmet to simulate a gas leak. (The red LED lights up and the buzzer sounds at the same time)
    `);

    // Add the Gas Sensor card (combining all gas data into one card)
    addGasDataItem(dataContainer, data);

    // Add instructions before the Impact Data card
    addInstruction(dataContainer, `
        <strong>5.</strong> Tap the top of the helmet to simulate a head impact and see if an impact alert is received.
    `);

    // Fetch and display impact data
    fetchAndDisplayImpactData();
}

// Listen to real-time updates in the Helmet-data-3in1 collection
db.collection("Helmet-data-3in1")
    .orderBy("timestamp", "desc")
    .limit(1)
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added" || change.type === "modified") {
                fetchAndDisplayData(change.doc);
            }
        });
    });

// Function to add an instruction paragraph before a card
function addInstruction(container, instruction) {
    const instructionItem = document.createElement('div');
    instructionItem.className = 'instruction';
    instructionItem.innerHTML = instruction;
    container.appendChild(instructionItem);
}

// Function to add a gas data item card (combining all gas data into one card)
function addGasDataItem(container, data) {
    const item = document.createElement('div');
    item.className = 'data-item';
    item.innerHTML = `
        <img src="https://img.icons8.com/fluency/48/000000/test-tube.png" alt="Gas Sensors Icon">
        <span>C2H5OH: ${data.C2H5OH} | Alarm: ${data.C2H5OHalarm ? 'Yes' : 'No'}</span>
        <span>CH4: ${data.CH4} | Alarm: ${data.CH4alarm ? 'Yes' : 'No'}</span>
        <span>CO: ${data.CO} | Alarm: ${data.COalarm ? 'Yes' : 'No'}</span>
    `;
    container.appendChild(item);
}

// Function to add a simple data item card
function addDataItemSimple(container, icon, label, value) {
    const item = document.createElement('div');
    item.className = 'data-item';
    item.innerHTML = `
        ${icon}
        <span>${label}: ${value}</span>
    `;
    container.appendChild(item);
}

// Function to fetch and display impact data
function fetchAndDisplayImpactData() {
    db.collection("Helmet-data-impact")
        .orderBy("timestamp", "desc")
        .limit(10)
        .onSnapshot(snapshot => {
            const impactContainer = document.createElement('div');
            impactContainer.className = 'data-item';
            impactContainer.innerHTML = `
                <i class="fas fa-car-crash"></i>
                <span>Impact Data</span>
                <div class="impact-list" id="impactList"></div>
            `;

            const impactList = impactContainer.querySelector('#impactList');

            snapshot.forEach(doc => {
                const impactData = doc.data();
                const formattedTimestamp = new Date(impactData.timestamp.seconds * 1000).toLocaleString('en-US');
                const impactItem = document.createElement('div');
                impactItem.className = 'impact-item';
                impactItem.innerHTML = `
                    <span>${formattedTimestamp}</span>
                    <span>${impactData.impact ? 'Impact Detected' : 'No'}</span>
                `;
                impactList.appendChild(impactItem);
            });

            // Ensure only one Impact Data card exists
            const existingImpactCard = document.querySelector('.data-item .fas.fa-car-crash');
            if (existingImpactCard) {
                existingImpactCard.parentElement.remove();
            }

            document.getElementById('dataContainer').appendChild(impactContainer);
        });
}
