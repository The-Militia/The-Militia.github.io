let nationName = '';
let lastClickTime = 0;
const buttonCooldown = 1000; // 1 second cooldown

function saveNationName() {
  if (isCooldownActive()) return;
  nationName = document.getElementById('nationNameInput').value.trim();
  document.getElementById('nationNameInput').value = '';
  updateButtonStates();
}


function searchUpdates() {
  if (isCooldownActive()) return;
  const region = document.getElementById('searchInput').value.trim();
  document.getElementById('searchInput').value = '';
  startCooldown();

  const userAgent = nationName;
  const upurl = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=lastminorupdate+lastmajorupdate`;
  const upOptions = {
    method: 'GET',
    headers: {
     'User-Agent': `the watchtower - update times, used by ${userAgent}`,
    },
  };

  fetch(upurl, upOptions)
    .then(response => response.text())
    .then(data => {
      const parsedData = new DOMParser().parseFromString(data, 'text/xml');
      const majorUpdate = parsedData.querySelector('LASTMAJORUPDATE').textContent;
      const minorUpdate = parsedData.querySelector('LASTMINORUPDATE').textContent;

      const majorUpdateDate = new Date(parseInt(majorUpdate) * 1000).toLocaleString();
      const minorUpdateDate = new Date(parseInt(minorUpdate) * 1000).toLocaleString();

      document.getElementById('result').innerHTML = `
        <p>Major Update: ${majorUpdateDate}</p>
        <p>Minor Update: ${minorUpdateDate}</p>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('result').innerHTML = '<p>Error occurred while fetching update times.</p>';
    });
}

function getRegions() {
  if (isCooldownActive()) return;
  startCooldown();
  
  const userAgent = nationName;
  const geturl = 'https://www.nationstates.net/cgi-bin/api.cgi?q=regionsbytag;tags=fascist,governorless,-password';
  const getOptions = {
    method: 'GET',
    headers: {
     'User-Agent': `the watchtower - cute fascist regions, used by ${userAgent}`,
    },
  };

  fetch(geturl, getOptions)
    .then(response => response.text())
    .then(data => {
      const parsedData = new DOMParser().parseFromString(data, 'text/xml');
      const regions = parsedData.querySelector('REGIONS').textContent.split(',');

      const regionList = document.getElementById('regionList');
      regionList.innerHTML = '';

      regions.forEach(region => {
        const regionName = region.trim();
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `https://www.nationstates.net/region=${regionName}`;
        link.textContent = `(${regionName})`;
        listItem.appendChild(link);
        regionList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      const regionList = document.getElementById('regionList');
      regionList.innerHTML = '<p>Error occurred while fetching regions.</p>';
    });
}

function updateButtonStates() {
  const searchButton = document.getElementById('searchButton');
  const regionsButton = document.getElementById('regionsButton');
  const findButton = document.getElementById('findButton');
  const autologinButton = document.getElementById('autoStart');

  const enableButtons = nationName !== '';

  searchButton.disabled = !enableButtons;
  regionsButton.disabled = !enableButtons;
  findButton.disabled = !enableButtons;
  if (autoStartButton.textContent === 'Start') {
    autoStartButton.disabled = !enableButtons;
  }
}


function getRegionInfo() {
  if (isCooldownActive()) return;
  startCooldown();

  const regionNameInput = document.getElementById('regionNameInput');
  const regionName = regionNameInput.value.trim();

  if (!regionName) {
    document.getElementById('regionInfo').innerHTML = '<p>Please enter a region name.</p>';
    return;
  }

  const userAgent = nationName;
  const submurl = `https://www.nationstates.net/cgi-bin/api.cgi?region=${regionName}&q=flag+delegatevotes+bannerurl+governor+numnations+delegate+delegateauth`;
  const submOptions = {
    method: 'GET',
    headers: {
     'User-Agent': `the watchtower - submissive and raidable, used by ${userAgent}`,
    },
  };

  fetch(submurl, submOptions)
    .then(response => response.text())
    .then(data => {
      const parsedData = new DOMParser().parseFromString(data, 'text/xml');
      const governor = parsedData.querySelector('GOVERNOR').textContent;
      const delegate = parsedData.querySelector('DELEGATE').textContent;
      const delegateVotes = parseInt(parsedData.querySelector('DELEGATEVOTES').textContent);
      const flagURL = parsedData.querySelector('FLAG').textContent;
      const bannerURL = parsedData.querySelector('BANNERURL').textContent;
      const delegateAuth = parsedData.querySelector('DELEGATEAUTH').textContent;
      const endorsements = delegateVotes === 0 ? 0 : delegateVotes - 1;

      const regionInfo = document.getElementById('regionInfo');
      regionInfo.innerHTML = `
        <div class="region-info">
          <div class="flag-container">
            <img src="${flagURL}" class="flag" alt="Flag">
          </div>
          <img src="https://www.nationstates.net${bannerURL}" class="banner" alt="Banner">
          <div>
            <h3><a id="regionLink" href="https://www.nationstates.net/region=${regionName}" target="_blank">${regionName}</a></h3>
            <p>Delegate: ${delegate === '0' ? 'None' : `<a href="https://www.nationstates.net/nation=${delegate}" target="_blank">${delegate}</a>`}</p>
            <p>Number of Nations: ${parseInt(parsedData.querySelector('NUMNATIONS').textContent)}</p>
            <p>Governor: <span class="${governor === '0' ? 'red' : 'green'}">${governor === '0' ? 'None' : governor}</span></p>
            <p>Raidable: ${delegateAuth.includes('X') ? 'Yes :D' : 'Sadly No :('}</p>
            <p>Endorsements: ${endorsements}</p>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('regionInfo').innerHTML = '<p>Error occurred while fetching region info.</p>';
    });
}

document.addEventListener('DOMContentLoaded', function() {
  const autoStartButton = document.getElementById('autoStartButton');
  autoStartButton.addEventListener('click', startAutologin); // Changed event listener

  const savePasswordsButton = document.getElementById('savePasswords');
  savePasswordsButton.addEventListener('click', savePasswords);
});


let autologinRunning = false;
let autologinTimeouts = [];

function startAutologin() { // Renamed the function to startAutologin
  if (autologinRunning) {
    autologinRunning = false;
    autologinTimeouts.forEach(timeout => clearTimeout(timeout));
    autologinTimeouts = [];
    document.getElementById('autologinStatus').textContent = 'Autologin canceled.';
    return;
  }

  autologinRunning = true;
  document.getElementById('autologinStatus').textContent = 'Autologin in progress...';

  const nationListTextArea = document.getElementById('nationList');
  const nationList = nationListTextArea.value.split('\n');
  const userAgent = nationName; // Replace with your user agent
  const autologinDelay = 800; // 800 milliseconds

  nationList.forEach((entry, index) => {
    const [nationName, password] = entry.split(',').map(item => item.trim());

    if (autologinRunning && nationName && password) {
      const timeout = setTimeout(() => {
        const pingURL = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nationName}&q=ping`;

        const pingOptions = {
          method: 'GET',
          headers: {
            'X-Password': password,
            'User-Agent': `the watchtower - autologin, used by ${userAgent}`,
          },
        };

        fetch(pingURL, pingOptions)
          .then(response => response.text())
          .then(pingResponse => {
            console.log(`${nationName}:`, pingResponse);
          })
          .catch(error => {
            console.error(`Error pinging nation ${nationName}:`, error);
          });

        if (index === nationList.length - 1) {
          document.getElementById('autologinStatus').textContent = 'Autologin finished.';
          autologinRunning = false;
        }
      }, autologinDelay * index);

      autologinTimeouts.push(timeout);
    }
  });
}



// Function to save passwords to localStorage
function savePasswords() {
  const nationListTextArea = document.getElementById('nationList');
  const nationList = nationListTextArea.value;
  localStorage.setItem('nationPasswords', nationList);
  console.log('Passwords saved.');
}

// Function to load saved passwords from localStorage
function loadPasswords() {
  const savedPasswords = localStorage.getItem('nationPasswords');
  if (savedPasswords) {
    const nationListTextArea = document.getElementById('nationList');
    nationListTextArea.value = savedPasswords;
  }
}

// Call loadPasswords function when the page loads to load saved passwords
window.onload = loadPasswords;

function isCooldownActive() {
  const currentTime = new Date().getTime();
  return currentTime - lastClickTime < buttonCooldown;
}

function startCooldown() {
  lastClickTime = new Date().getTime();
      }
      