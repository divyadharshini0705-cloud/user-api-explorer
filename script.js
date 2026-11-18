
let allUsers = [];
let latestResponse = null;
let latestResponseTime = 0;

// --------------------------------
// 1. SEND API REQUEST
// --------------------------------

async function getUsers() {
  const endpoint = document.getElementById("endpoint").value.trim();
  const status = document.getElementById("status");
  const responseBox = document.getElementById("response");
  const button = document.getElementById("fetchBtn");

  if (!endpoint) {
    status.textContent = "Please enter an API endpoint.";
    return;
  }

  status.textContent = "Loading user data...";
  button.disabled = true;
  responseBox.textContent = "";

  const startTime = performance.now();

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    latestResponseTime = Math.round(performance.now() - startTime);

    latestResponse = {
      response,
      data
    };

    document.getElementById("responseTime").textContent =
      latestResponseTime + " ms";

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    if (!Array.isArray(data)) {
      throw new Error("Expected an array of users.");
    }

    allUsers = data;

    displayUsers(allUsers);

    responseBox.textContent =
      JSON.stringify(data, null, 2);

    status.textContent =
      `Success! Retrieved ${data.length} users.`;

  } catch (error) {

    latestResponse = null;
    allUsers = [];

    document.getElementById("usersList").innerHTML = "";

    responseBox.textContent = error.message;

    status.textContent =
      "Request failed: " + error.message;

  } finally {
    button.disabled = false;
  }
}


// --------------------------------
// 2. DISPLAY USERS
// --------------------------------

function displayUsers(users) {

  const container = document.getElementById("usersList");

  container.innerHTML = "";

  if (users.length === 0) {
    container.textContent = "No matching users found.";
    return;
  }

  users.forEach(user => {

    const card = document.createElement("div");
    card.className = "user-card";

    const name = document.createElement("strong");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = user.email;

    card.append(name, email);

    card.onclick = () => {
      document.getElementById("response").textContent =
        JSON.stringify(user, null, 2);
    };

    container.appendChild(card);
  });
}


// --------------------------------
// 3. SEARCH USERS
// --------------------------------

function searchUsers() {

  const query = document.getElementById("search")
    .value.toLowerCase().trim();

  const filtered = allUsers.filter(user => {

    const name = String(user.name || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();

    return name.includes(query) || email.includes(query);
  });

  displayUsers(filtered);
}


// --------------------------------
// 4. AUTOMATED API TEST RUNNER
// --------------------------------

async function runTests() {

  const endpoint = document.getElementById("endpoint")
    .value.trim();

  const testButton = document.getElementById("testBtn");
  const resultsBox = document.getElementById("testResults");
  const status = document.getElementById("status");

  if (!endpoint) {
    status.textContent = "Enter an API endpoint first.";
    return;
  }

  testButton.disabled = true;
  resultsBox.innerHTML = '<p class="empty">Running API tests...</p>';

  status.textContent = "Executing test cases...";

  const startTime = performance.now();

  let response;
  let data;
  let requestError = null;

  try {

    response = await fetch(endpoint);
    data = await response.json();

  } catch (error) {

    requestError = error;

  }

  const elapsedTime = Math.round(performance.now() - startTime);

  document.getElementById("responseTime").textContent =
    elapsedTime + " ms";

  // Each test returns PASS or FAIL

  const tests = [

    {
      name: "API Request Validation",
      description: "Checks whether the API request succeeds.",
      passed: !requestError && response.ok
    },

    {
      name: "HTTP Status Code",
      description: "Checks whether the response status is 200.",
      passed: !requestError && response.status === 200
    },

    {
      name: "JSON Response Validation",
      description: "Checks whether the API returns valid JSON.",
      passed: !requestError && data !== undefined
    },

    {
      name: "Array Data Validation",
      description: "Checks whether the response contains an array.",
      passed: !requestError && Array.isArray(data)
    },

    {
      name: "Required Fields Validation",
      description: "Checks whether users contain ID, name and email.",
      passed: !requestError &&
        Array.isArray(data) &&
        data.length > 0 &&
        data.every(user =>
          user.id !== undefined &&
          typeof user.name === "string" &&
          typeof user.email === "string"
        )
    },

    {
      name: "Duplicate ID Validation",
      description: "Checks whether every user has a unique ID.",
      passed: !requestError &&
        Array.isArray(data) &&
        data.length > 0 &&
        new Set(data.map(user => user.id)).size === data.length
    },

    {
      name: "Response Data Validation",
      description: "Checks whether the API returns at least one user.",
      passed: !requestError &&
        Array.isArray(data) &&
        data.length > 0
    }

  ];

  // Display test results

  let passed = tests.filter(test => test.passed).length;
  let failed = tests.length - passed;

  document.getElementById("totalTests").textContent =
    tests.length;

  document.getElementById("passedTests").textContent =
    passed;

  document.getElementById("failedTests").textContent =
    failed;

  resultsBox.innerHTML = "";

  tests.forEach((test, index) => {

    const item = document.createElement("div");
    item.className = "test-result";

    const details = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = `TC${String(index + 1).padStart(2, "0")} - ${test.name}`;

    const description = document.createElement("p");
    description.textContent = test.description;

    details.append(title, description);

    const badge = document.createElement("span");
    badge.className = test.passed
      ? "result-badge pass"
      : "result-badge fail";

    badge.textContent = test.passed ? "PASS" : "FAIL";

    item.append(details, badge);

    resultsBox.appendChild(item);

  });

  status.textContent =
    `Testing completed: ${passed} passed, ${failed} failed.`;

  testButton.disabled = false;
}


// --------------------------------
// 5. LOAD APPLICATION
// --------------------------------

getUsers();

