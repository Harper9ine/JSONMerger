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

function mergeAndRecalculate(allData, newSubmission) {
    const existingIndex = allData.findIndex(item =>
        item.GameType === newSubmission.GameType &&
        item.Prompt === newSubmission.Prompt &&
        item.LLM1stPlayer === newSubmission.LLM1stPlayer &&
        item.LLM2ndPlayer === newSubmission.LLM2ndPlayer
    );

    if (existingIndex !== -1) {
        const existingData = allData[existingIndex];

        // Update Wins and Draws
        existingData.Wins1st += newSubmission.Wins1st;
        existingData.Wins2nd += newSubmission.Wins2nd;
        existingData.Draws += newSubmission.Draws;

        // Calculate total games
        const totalGames = existingData.Wins1st + existingData.Wins2nd + existingData.Draws;

        // Recalculate Win Ratios
        existingData.WinRatio1st = existingData.Wins1st / totalGames;
        existingData.WinRatio2nd = existingData.Wins2nd / totalGames;

        // Recalculate Invalid Moves Ratios
        const totalInvalidMoves1st = (existingData.InvalidMovesRatio1st * existingData.TotalMoves1st) + (newSubmission.InvalidMovesRatio1st * newSubmission.TotalMoves1st);
        const totalInvalidMoves2nd = (existingData.InvalidMovesRatio2nd * existingData.TotalMoves2nd) + (newSubmission.InvalidMovesRatio2nd * newSubmission.TotalMoves2nd);
        const totalMoves1st = existingData.TotalMoves1st + newSubmission.TotalMoves1st;
        const totalMoves2nd = existingData.TotalMoves2nd + newSubmission.TotalMoves2nd;
        existingData.InvalidMovesRatio1st = totalInvalidMoves1st / totalMoves1st;
        existingData.InvalidMovesRatio2nd = totalInvalidMoves2nd / totalMoves2nd;

        // Update Total Moves
        existingData.TotalMoves1st = totalMoves1st;
        existingData.TotalMoves2nd = totalMoves2nd;

        // Update ProviderEmail by adding new emails if they don't already exist
        const existingEmails = existingData.ProviderEmail.split(',').map(email => email.trim());
        const newEmails = newSubmission.ProviderEmail.split(',').map(email => email.trim());
        newEmails.forEach(email => {
            if (!existingEmails.includes(email)) {
                existingEmails.push(email);
            }
        });
        existingData.ProviderEmail = existingEmails.join(', ');

        allData[existingIndex] = existingData;
    } else {
        // Add new submission as a new object
        allData.push(newSubmission);
    }
}

document.getElementById('mergeAndDownloadBtn').addEventListener('click', function() {
    if (allDataJSON.length === 0 || receivedSubmissionsJSON.length === 0) {
        alert("Please upload both JSON files before merging.");
        return;
    }

    receivedSubmissionsJSON.forEach(submission => mergeAndRecalculate(allDataJSON, submission));

    const mergedJSONBlob = new Blob([JSON.stringify(allDataJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(mergedJSONBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_data.json';
    a.click();
    URL.revokeObjectURL(url);
    alert("Files merged and downloaded successfully.");
});