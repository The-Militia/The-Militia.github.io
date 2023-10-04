let initialNationList = [];
let newNations = [];
let intervalId;
let running = false;

// Enable or disable the Start button based on the User-Agent input
document.querySelector("#nation-name").addEventListener("input", function() {
  const startButton = document.querySelector("#start-button");
  startButton.disabled = this.value.trim().length <= 3; // Disable if User-Agent has 3 or fewer characters
});

function startFetching() {
  const regionName = document.querySelector("#region-name").value;
  const nationName = document.querySelector("#nation-name").value;
  const startButton = document.querySelector("#start-button");
  const stopButton = document.querySelector("#stop-button");

  if (regionName && !running) {
    // Fetch the initial nation list
    fetchAPIAndDisplay(regionName, nationName);

    // Set an interval to fetch updates
    intervalId = setInterval(() => {
      fetchAPIAndDisplay(regionName, nationName);
    }, 700);

    running = true;
    document.querySelector("#status").textContent = "Running...";
    startButton.disabled = true;
    stopButton.style.display = "block";
  } else {
    console.error("Region name is required or the app is already running.");
  }
}

function stopFetching() {
  const startButton = document.querySelector("#start-button");
  const stopButton = document.querySelector("#stop-button");

  clearInterval(intervalId);
  running = false;
  document.querySelector("#status").textContent = "Stopped.";
  startButton.disabled = false;
  stopButton.style.display = "none";
}

async function fetchAPIAndDisplay(regionName, nationName) {
  const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?region=${regionName}&q=wanations+lastupdate`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": nationName
      }
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const nationList = xmlDoc.querySelector("UNNATIONS").textContent.split(",");

    if (initialNationList.length === 0) {
      // This is the first request, so save the initial nation list
      initialNationList = nationList;
    } else {
      // Compare with the initial list to find new nations
      newNations = nationList.filter((nation) => !initialNationList.includes(nation));

      // Update the web page with new nation names and links
      if (newNations.length > 0) {
        const nationDiv = document.querySelector("#nation-list");
        newNations.forEach((nation) => {
          if (!document.querySelector(`#nation-${nation}`)) {
            // Check if the nation element already exists
            const nationLink = document.createElement("a");
            nationLink.href = `https://www.nationstates.net/nation=${nation}#composebutton`;
            nationLink.textContent = nation;
            nationLink.id = `nation-${nation}`;
            nationDiv.appendChild(nationLink);
            nationDiv.appendChild(document.createElement("br"));

            // Open a new tab for the nation's link
            window.open(`https://www.nationstates.net/nation=${nation}#composebutton`, "_blank");
          }
        });
      }
    }
    document.querySelector("#status").textContent = "Running...";
  } catch (error) {
    console.error("Error fetching data: ", error);
    document.querySelector("#status").textContent = "Error fetching data.";
  }
}
