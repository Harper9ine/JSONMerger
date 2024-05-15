document.getElementById('openAllDataBtn').addEventListener('click', function() {
    document.getElementById('allDataFileInput').click();
});

document.getElementById('openReceivedSubmissionsBtn').addEventListener('click', function() {
    document.getElementById('receivedSubmissionsFileInput').click();
});

let allDataJSON = [];
let receivedSubmissionsJSON = [];

document.getElementById('allDataFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                allDataJSON = JSON.parse(e.target.result);
                document.getElementById('allDataTextArea').value = JSON.stringify(allDataJSON, null, 2);
                console.log("All Data JSON:", allDataJSON);
            } catch (error) {
                alert("Error parsing All Data JSON file");
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('receivedSubmissionsFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                receivedSubmissionsJSON = JSON.parse(e.target.result);
                document.getElementById('receivedSubmissionsTextArea').value = JSON.stringify(receivedSubmissionsJSON, null, 2);
                console.log("Received Submissions JSON:", receivedSubmissionsJSON);
            } catch (error) {
                alert("Error parsing Received Submissions JSON file");
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('mergeAndDownloadBtn').addEventListener('click', function() {
    if (allDataJSON.length === 0 || receivedSubmissionsJSON.length === 0) {
        alert("Please upload both JSON files before merging.");
        return;
    }

    const mergedJSON = [...allDataJSON, ...receivedSubmissionsJSON];
    const mergedJSONBlob = new Blob([JSON.stringify(mergedJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(mergedJSONBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_data.json';
    a.click();
    URL.revokeObjectURL(url);
    alert("Files merged and downloaded successfully.");
});
