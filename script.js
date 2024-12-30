// Section 1: Variables and Initialization
let userData = {
    part1Sent: 0,
    part1Received: 0,
    part2Sent: 0,
    part2Received: 0,
    part3Sent: 0,
    part3Received: 0,
    part4Sent: 0,
    part4Received: 0,
    part5Sent: 0,
    part5Received: 0,
    part6Sent: 0,
    part6Received: 0,
    surveyResponses: {},
    part1Times: [],
    part2Times: [],
    part3Times: [],
    part4Times: [],
    part5Times: [],
    part6Times: [],
    returnRateCondition: '',
    groupCondition: '',
    religionCondition1: '',
    religionCondition2: '',
    cultureWarCondition1: '',
    cultureWarCondition2: ''
};

// Game state variables
let groupType = '';
let trusteeNationality = '';
let trusteeReligion = '';
let trusteeIssue = '';
let totalSent = 0;
let totalReceived = 0;
let trialCount = 0;
let currentCondition = '';
let startTime = Date.now();
let timerInterval;
let trialTimes = [];
let returnRate = '';
let initialReturnRate = '';
let currentPhase = 'nationality';

// Simplified issues array
const importantIssues = [
    'Inflation',
    'Climate Change',
    'Immigration'
];

// Event Listener for DOM Load
document.addEventListener('DOMContentLoaded', function() {
    const trustorInput = document.getElementById('trustorAmount');
    if (trustorInput) {
        trustorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMoney();
            }
        });
    }
    updateReturnRateDisplays();
});
// Basic Utility Functions
function calculateAverageTime(times) {
    if (!times || times.length === 0) return "0.0";
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    document.getElementById('timeElapsed').textContent = elapsedSeconds.toFixed(1);
}

function updateRoundDisplay() {
    const roundElement = document.getElementById('roundNumber');
    if (roundElement) {
        roundElement.textContent = trialCount;
    }
}

function updateReturnRateDisplays() {
    const displays = [
        document.getElementById('returnRateDisplay'),
        document.getElementById('returnRateDisplay2'),
        document.getElementById('resultReturnRate')
    ];
    
    let displayText = '';
    switch(returnRate) {
        case 'break_even':
            displayText = 'Break Even (Final total will be equal)';
            break;
        case 'gain':
            displayText = 'Gain (You will receive more)';
            break;
        case 'lose':
            displayText = 'Loss (You will receive less)';
            break;
    }
    
    displays.forEach(display => {
        if (display) {
            display.textContent = displayText;
        }
    });
}

// Consent and Survey Functions
function consent(userConsents) {
    if (userConsents) {
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('survey').style.display = 'block';
        document.getElementById('question1').style.display = 'block';
    } else {
        alert("Thank you for your interest. You may close this window.");
        window.close();
    }
}

function nextQuestion(questionNumber) {
    const currentQuestion = document.getElementById(`question${questionNumber}`);
    const input = currentQuestion.querySelector('input, select');
    const value = input.value.trim();

    console.log('Question', questionNumber, 'Answer:', userData.surveyResponses);

    // Validate input
    if (!value) {
        alert('Please provide an answer before proceeding.');
        return;
    }

    // Validate number inputs
    if (input.type === 'number') {
        const numValue = parseFloat(value);
        const min = parseFloat(input.getAttribute('min'));
        const max = parseFloat(input.getAttribute('max'));
        if (isNaN(numValue) || numValue < min || numValue > max) {
            alert(`Please enter a valid number between ${min} and ${max}.`);
            return;
        }
    }

    // Store response and move to next question
    userData.surveyResponses[`question${questionNumber}`] = value;
    currentQuestion.style.display = 'none';

    if (questionNumber < 8) {
        document.getElementById(`question${questionNumber + 1}`).style.display = 'block';
    } else {
        document.getElementById('survey').style.display = 'none';
        document.getElementById('gameInstructionsPage').style.display = 'block';
        // const payload = mapSurveyResponsesToPayload(userData.surveyResponses);
        // sendUserData(payload);
    }
}

function resetTrialData() {
    trialTimes = [];
    totalSent = 0;
    totalReceived = 0;
    trialCount = 0;
}
// Scenario and Game Phase Management
function showScenario() {
    const nationality = userData.surveyResponses.question5;
    if (!nationality) {
        alert('Error retrieving nationality. Please restart the survey.');
        return;
    }

    // Initialize conditions if not already set
    if (!groupType) {
        groupType = Math.random() < 0.5 ? 'ingroup' : 'outgroup';
        const rates = ['break_even', 'gain', 'lose'];
        returnRate = rates[Math.floor(Math.random() * rates.length)];
        initialReturnRate = returnRate;
        userData.returnRateCondition = returnRate;
        userData.groupCondition = groupType;
    }
    currentCondition = groupType;

    // For outgroup, create a different nationality
    if (groupType === 'outgroup') {
        const commonNationalities = ['American', 'British', 'Chinese', 'Indian', 'Brazilian', 'French', 'German'];
        trusteeNationality = commonNationalities.filter(n => 
            n.toLowerCase() !== nationality.toLowerCase()
        )[Math.floor(Math.random() * (commonNationalities.length - 1))];
    }

    const scenarioText = groupType === 'ingroup' 
        ? `You are on vacation in Dubai. While you are in a bar you meet someone who also happens to be ${nationality} and get to talking.`
        : `You are on vacation in Dubai. As a ${nationality} tourist you feel out of place, but you meet someone and get to talking. It turns out that this person is ${trusteeNationality}.`;

    document.getElementById('scenarioTitle').innerText = 'Please read the following carefully:';
    document.getElementById('scenarioDescription').innerText = scenarioText;
    document.getElementById('gameInstructionsPage').style.display = 'none';
    document.getElementById('scenarioPage').style.display = 'block';
}

// Religion Phase Functions
function startReligionPhase() {
    const userReligion = userData.surveyResponses.question7;
    currentPhase = 'religion';
    
    userData.religionCondition1 = Math.random() < 0.5 ? 'ingroup' : 'outgroup';
    
    if (userData.religionCondition1 === 'ingroup') {
        trusteeReligion = userReligion;
    } else {
        const commonReligions = ['Christian', 'Muslim', 'Jewish', 'Buddhist', 'Hindu', 'Atheist'];
        trusteeReligion = commonReligions.filter(r => 
            r.toLowerCase() !== userReligion.toLowerCase()
        )[Math.floor(Math.random() * (commonReligions.length - 1))];
    }
    
    showReligionScenario(userReligion, true);
}

function startSecondReligionPhase() {
    const userReligion = userData.surveyResponses.question7;
    userData.religionCondition2 = userData.religionCondition1 === 'ingroup' ? 'outgroup' : 'ingroup';
    
    if (userData.religionCondition2 === 'ingroup') {
        trusteeReligion = userReligion;
    } else {
        const commonReligions = ['Christian', 'Muslim', 'Jewish', 'Buddhist', 'Hindu', 'Atheist'];
        trusteeReligion = commonReligions.filter(r => 
            r.toLowerCase() !== userReligion.toLowerCase()
        )[Math.floor(Math.random() * (commonReligions.length - 1))];
    }
    
    showReligionScenario(userReligion, false);
}

function showReligionScenario(userReligion, isFirstPhase) {
    const currentCondition = isFirstPhase ? userData.religionCondition1 : userData.religionCondition2;
    const scenarioText = currentCondition === 'ingroup' 
        ? `You are in the waiting room at your doctor's office when someone comes to sit next to you. This person turns out to be ${userReligion} and you engage in a light conversation.`
        : `You are in the waiting room at your doctor's office when someone comes to sit next to you. This person turns out to be ${trusteeReligion}, while you are ${userReligion}. You two engage in a light conversation about religion.`;

    document.getElementById('scenarioTitle').innerText = 'Please read the following carefully:';
    document.getElementById('scenarioDescription').innerText = scenarioText;
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('scenarioPage').style.display = 'block';
}

// Start Trust Game
function startTrustGame() {
    document.getElementById('scenarioPage').style.display = 'none';
    document.getElementById('trustGame').style.display = 'block';
    trialCount = 1;
    startTime = Date.now();
    updateRoundDisplay();
    updateReturnRateDisplays();
    startTimer();
}
// Core Game Mechanics
function sendMoney() {
    // Get the input element and its value
    const input = document.getElementById('trustorAmount');
    const amount = parseFloat(input.value);

    // Basic validation
    if (isNaN(amount) || amount < 0 || amount > 10) {
        alert('Please enter a valid amount between $0 and $10');
        input.value = '';
        return;
    }

    // Calculate time elapsed and clear timer
    const timeElapsed = (Date.now() - startTime) / 1000;
    clearInterval(timerInterval);

    // Store trial data
    trialTimes.push(timeElapsed);
    totalSent += Number(amount.toFixed(2));

    // Calculate return amount
    const doubledAmount = amount * 2;
    let returnAmount = calculateReturnAmount(amount, doubledAmount);
    totalReceived += returnAmount;

    // Display results
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'block';
    document.getElementById('returnAmount').textContent = returnAmount.toFixed(2);

    // Clear input for next trial
    input.value = '';
}

function calculateReturnAmount(amount, doubledAmount) {
    let returnAmount;
    switch(returnRate) {
        case 'break_even':
            const keptAmount = 10 - amount;
            const baseReturn = 10 - keptAmount;
            const maxVariation = doubledAmount * 0.2;
            const randomVariation = (Math.random() * 2 - 1) * maxVariation;
            returnAmount = baseReturn + randomVariation;
            returnAmount = Math.min(Math.max(returnAmount, 0), doubledAmount);
            break;
        case 'gain':
            const gainPercent = 0.65 + (Math.random() * 0.20);
            returnAmount = doubledAmount * gainPercent;
            break;
        case 'lose':
            const losePercent = 0.15 + (Math.random() * 0.20);
            returnAmount = doubledAmount * losePercent;
            break;
        default:
            returnAmount = doubledAmount * 0.5; // Default fallback
    }
    return Number(returnAmount.toFixed(2));
}

function nextTrial() {
    trialCount++;
    if (trialCount > 9) {
        clearInterval(timerInterval);
        document.getElementById('trusteeReturn').style.display = 'none';
        if (!userData.part1Sent) {
            // Skip results page after first nationality trials
            userData.part1Sent = totalSent;
            userData.part1Received = totalReceived;
            userData.part1Times = [...trialTimes];
            resetTrialData();
            groupType = groupType === 'ingroup' ? 'outgroup' : 'ingroup';
            currentCondition = groupType;
            showScenario();
        } else if (!userData.part2Sent) {
            handlePart2Completion();
        } else if (!userData.part3Sent) {
            handlePart3Completion();
        } else if (!userData.part4Sent) {
            handlePart4Completion();
        } else if (!userData.part5Sent) {
            handlePart5Completion();
        } else if (!userData.part6Sent) {
            handlePart6Completion();
        } else {
            showFinalResults();
        }
    } else {
        continueCurrentTrial();
    }
}

function continueCurrentTrial() {
    document.getElementById('trusteeReturn').style.display = 'none';
    document.getElementById('trustGame').style.display = 'block';
    document.getElementById('roundNumber').textContent = trialCount;
    startTime = Date.now();
    startTimer();
    updateReturnRateDisplays();
}
// Culture War Phase Functions
function startCultureWarPhase() {
    const userIssue = userData.surveyResponses.question6;
    currentPhase = 'cultureWar';
    
    userData.cultureWarCondition1 = Math.random() < 0.5 ? 'ingroup' : 'outgroup';
    
    if (userData.cultureWarCondition1 === 'ingroup') {
        trusteeIssue = userIssue;
    } else {
        trusteeIssue = importantIssues.filter(i => i !== userIssue)[Math.floor(Math.random() * 2)];
    }
    
    showCultureWarScenario(userIssue, true);
}

function startSecondCultureWarPhase() {
    const userIssue = userData.surveyResponses.question6;
    userData.cultureWarCondition2 = userData.cultureWarCondition1 === 'ingroup' ? 'outgroup' : 'ingroup';
    
    if (userData.cultureWarCondition2 === 'ingroup') {
        trusteeIssue = userIssue;
    } else {
        trusteeIssue = importantIssues.filter(i => i !== userIssue)[Math.floor(Math.random() * 2)];
    }
    
    showCultureWarScenario(userIssue, false);
}

function showCultureWarScenario(userIssue, isFirstPhase) {
    const currentCondition = isFirstPhase ? userData.cultureWarCondition1 : userData.cultureWarCondition2;
    const scenarioText = currentCondition === 'ingroup' 
        ? `While at a community meeting, you meet someone new. During the discussion, you discover that like you, they also believe ${userIssue} is the most important issue facing the country today.`
        : `While at a community meeting, you meet someone new. During the discussion, you learn they believe ${trusteeIssue} is the most important issue, while you believe ${userIssue} is most important.`;

    document.getElementById('scenarioTitle').innerText = 'Please read the following carefully:';
    document.getElementById('scenarioDescription').innerText = scenarioText;
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('scenarioPage').style.display = 'block';
}

// Phase Completion Handlers


function handlePart2Completion() {
    userData.part2Sent = totalSent;
    userData.part2Received = totalReceived;
    userData.part2Times = [...trialTimes];
    
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    resetTrialData();
    currentPhase = 'religion';
    startReligionPhase();
}

function handlePart3Completion() {
    userData.part3Sent = totalSent;
    userData.part3Received = totalReceived;
    userData.part3Times = [...trialTimes];
    
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    resetTrialData();
    startSecondReligionPhase();
}

function handlePart4Completion() {
    userData.part4Sent = totalSent;
    userData.part4Received = totalReceived;
    userData.part4Times = [...trialTimes];
    
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    resetTrialData();
    startCultureWarPhase();
}

function handlePart5Completion() {
    userData.part5Sent = totalSent;
    userData.part5Received = totalReceived;
    userData.part5Times = [...trialTimes];
    
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    resetTrialData();
    startSecondCultureWarPhase();
}

function handlePart6Completion() {
    userData.part6Sent = totalSent;
    userData.part6Received = totalReceived;
    userData.part6Times = [...trialTimes];
    
    document.getElementById('trustGame').style.display = 'none';
    document.getElementById('trusteeReturn').style.display = 'none';
    
    resetTrialData();
    showFinalResults();
}
// Results Display Functions
function showResultsAndContinuePrompt(phase) {
    document.getElementById('resultsPage').style.display = 'block';
    document.getElementById('totalSent').textContent = totalSent.toFixed(2);
    document.getElementById('totalReceived').textContent = totalReceived.toFixed(2);
    document.getElementById('avgDecisionTime').textContent = calculateAverageTime(trialTimes);
    document.getElementById('resultReturnRate').textContent = returnRate;
}
    
    const continueButton = document.querySelector('#phaseCompleteButton');
    if (phase === 'nationality') {
        if (!userData.part2Sent) {
            groupType = groupType === 'ingroup' ? 'outgroup' : 'ingroup';
            currentCondition = groupType;
            continueButton.onclick = () => {
                document.getElementById('resultsPage').style.display = 'none';
                showScenario();
            };
        } else {
            continueButton.onclick = () => {
                document.getElementById('resultsPage').style.display = 'none';
                startReligionPhase();
            };
        }
    }


function showFinalResults() {
    const containers = document.querySelectorAll('.container, .game-container, .results-container');
    containers.forEach(container => container.style.display = 'none');
  
    const thankYouDiv = document.createElement('div');
    thankYouDiv.className = 'container thank-you';
    
    thankYouDiv.innerHTML = `
      <h1>Final Results</h1>
      <div class="results-summary">
        <h2>Nationality Phase</h2>
        <div class="phase-results">
          <h3>Round 1: ${userData.groupCondition}</h3>
          <p>Money Sent: $${userData.part1Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part1Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part1Times)} seconds</p>
  
          <h3>Round 2: ${userData.groupCondition === 'ingroup' ? 'outgroup' : 'ingroup'}</h3>
          <p>Money Sent: $${userData.part2Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part2Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part2Times)} seconds</p>
        </div>
  
        <h2>Religion Phase</h2>
        <div class="phase-results">
          <h3>Round 1: ${userData.religionCondition1}</h3>
          <p>Money Sent: $${userData.part3Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part3Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part3Times)} seconds</p>
  
          <h3>Round 2: ${userData.religionCondition2}</h3>
          <p>Money Sent: $${userData.part4Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part4Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part4Times)} seconds</p>
        </div>
  
        <h2>Culture War Phase</h2>
        <div class="phase-results">
          <h3>Round 1: ${userData.cultureWarCondition1}</h3>
          <p>Money Sent: $${userData.part5Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part5Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part5Times)} seconds</p>
  
          <h3>Round 2: ${userData.cultureWarCondition2}</h3>
          <p>Money Sent: $${userData.part6Sent.toFixed(2)}</p>
          <p>Money Received: $${userData.part6Received.toFixed(2)}</p>
          <p>Average Time: ${calculateAverageTime(userData.part6Times)} seconds</p>
        </div>
      </div>
      <button onclick="window.close()">Close Window</button>
    `;
  
    document.body.appendChild(thankYouDiv);
    console.log('Complete experiment data:', userData);
  }

  function mapSurveyResponsesToPayload(surveyResponses) {
    const surveyValues = Object.values(surveyResponses);
    return {
    age: surveyValues[0],
    gender: surveyValues[1],
    education: surveyValues[2],
    ethnicity: surveyValues[3],
    nationality: surveyValues[4],
    issue: surveyValues[5],
    religious_affiliation: surveyValues[6],
    lived_year: surveyValues[7]
    };
  }

  // Function to send POST request
  async function sendUserData(payload) {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('User created:', data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }