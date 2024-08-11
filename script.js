// Your web app's Firebase configuration
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
    dataContainer.innerHTML = ''; 

    // First, add the heart rate card
    addDataItemSimple(dataContainer, '<i class="fas fa-heartbeat"></i>', 'Heart Rate', data.avgbpm);

    // Then, add the other data cards
    addDataItem(dataContainer, 'https://img.icons8.com/fluency/48/000000/test-tube.png', 'C2H5OH', data.C2H5OH, data.C2H5OHalarm);
    addDataItem(dataContainer, 'https://img.icons8.com/fluency/48/000000/gas.png', 'CH4', data.CH4, data.CH4alarm);
    addDataItem(dataContainer, 'https://img.icons8.com/fluency/48/000000/poison-bottle.png', 'CO', data.CO, data.COalarm);
    addDataItemSimple(dataContainer, '<i class="fas fa-hard-hat"></i>', 'FSR', data.fsr);

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

function addDataItem(container, icon, label, value, alarm) {
    const item = document.createElement('div');
    item.className = 'data-item';
    item.innerHTML = `
        <img src="${icon}" alt="${label} Icon">
        <span>${label}: ${value}</span>
        <span>${label} Alarm: ${alarm ? 'Yes' : 'No'}</span>
    `;
    container.appendChild(item);
}

function addDataItemSimple(container, icon, label, value) {
    const item = document.createElement('div');
    item.className = 'data-item';
    item.innerHTML = `
        ${icon}
        <span>${label}: ${value}</span>
    `;
    container.appendChild(item);
}

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
