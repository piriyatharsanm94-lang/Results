document.getElementById("result-date").innerText = "Published on: " + new Date().toLocaleDateString();
document.getElementById("search-btn").addEventListener("click", searchResult);

const streamUrls = {
  "Commerce": "https://script.google.com/macros/s/AKfycbxYytWtit1ydc9epmKw5GcLGiANzdrp9oh5L2ITvRXzraoZ1fioxYVdheAX7rD2mhUD/exec",
  "Maths": "https://script.google.com/macros/s/AKfycbx5MBldrkqyIpvuy2P4HltYxBxJ1Jun6uASIUa_M-BRwouZ9JLJE1OMtvTnhY79Y9xKOA/exec",
  "Biology": "https://script.google.com/macros/s/AKfycbyjb3oieQ8z1OwlmbjEnMTlOpd17SpwnZ1Mtuv1_uuPwu5Ji0hjmdHCARFOlyQI1_Kz/exec"
};

async function searchResult() {
  const index = document.getElementById("indexInput").value.trim();
  const stream = document.getElementById("streamSelect").value;
  const errorCard = document.getElementById("search-error");
  const searchBtn = document.getElementById("search-btn");

  errorCard.style.display = "none";

  if (!stream) {
    errorCard.style.display = "block";
    errorCard.innerText = "Please select a stream.";
    return;
  }

  if (!index) {
    errorCard.style.display = "block";
    errorCard.innerText = "Please enter an Index Number.";
    return;
  }

  searchBtn.disabled = true;
  searchBtn.innerText = "Searching...";

  try {
    const response = await fetch(`${streamUrls[stream]}?index=${encodeURIComponent(index)}`);
    const data = await response.json();
    searchBtn.disabled = false;
    searchBtn.innerText = "Search";

    if (data.message) { // If results not released
      errorCard.style.display = "block";
      errorCard.innerText = data.message;
      return;
    }

    if (data.length === 0) {
      errorCard.style.display = "block";
      errorCard.innerText = `Student not found for Index Number: ${index} in ${stream} stream`;
      return;
    }

    const student = data[0];

    document.querySelector(".student-info").innerHTML = `
      <div><strong>Name:</strong> ${student.name}</div>
      <div><strong>Stream:</strong> ${stream}</div>
      <div><strong>Index Number:</strong> ${student.index}</div>
      <div><strong>School:</strong> ${student.school}</div>
    `;

    let tableBody = "";
    for (const [subject, grade] of Object.entries(student.subjects)) {
      tableBody += `<tr><td>${subject}</td><td>${grade}</td></tr>`;
    }
    document.querySelector(".results tbody").innerHTML = tableBody;

    document.querySelector(".summary-grid").innerHTML = `
      <div class="summary-card"><h3>Z-Score</h3><p>${student.zscore}</p></div>
      <div class="summary-card"><h3>Rank</h3><p>${student.rank}</p></div>
      ${student.districtRank ? `<div class="summary-card"><h3>District Rank</h3><p>${student.districtRank}</p></div>` : ''}
      ${student.islandRank ? `<div class="summary-card"><h3>Island Rank</h3><p>${student.islandRank}</p></div>` : ''}
    `;

    // Animate transition
    fadeOut(document.querySelector(".search-card"), () => {
      document.getElementById("result-container").style.display = "block";
      fadeIn(document.getElementById("result-container"));
    });

  } catch(err) {
    searchBtn.disabled = false;
    searchBtn.innerText = "Search";
    errorCard.style.display = "block";
    errorCard.innerText = "Error fetching results. Please try again.";
  }
}

function backToSearch() {
  // Animate transition
  fadeOut(document.getElementById("result-container"), () => {
    document.querySelector(".results tbody").innerHTML = "";
    document.querySelector(".summary-grid").innerHTML = "";
    document.querySelector(".student-info").innerHTML = "";
    document.getElementById("indexInput").value = "";
    document.getElementById("streamSelect").value = "";
    document.getElementById("result-container").style.display = "none";
    document.querySelector(".search-card").style.display = "block";
    fadeIn(document.querySelector(".search-card"));
  });
}

// Simple fadeIn/fadeOut functions
function fadeOut(element, callback) {
  element.style.opacity = 1;
  const fade = setInterval(() => {
    if ((element.style.opacity -= 0.05) < 0) {
      clearInterval(fade);
      element.style.display = "none";
      if (callback) callback();
    }
  }, 15);
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = "block";
  const fade = setInterval(() => {
    let val = parseFloat(element.style.opacity);
    if (!((val += 0.05) > 1)) element.style.opacity = val;
    else clearInterval(fade);
  }, 15);
}
