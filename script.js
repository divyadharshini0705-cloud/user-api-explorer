
let allUsers = [];

async function getUsers() {
  const endpoint = document.getElementById("endpoint").value;
  const status = document.getElementById("status");
  const responseBox = document.getElementById("response");
  const button = document.getElementById("fetchBtn");

  status.textContent = "Loading user data...";
  button.disabled = true;
  responseBox.textContent = "";

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

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
    allUsers = [];
    document.getElementById("usersList").innerHTML = "";
    responseBox.textContent = error.message;
    status.textContent = "Request failed: " + error.message;

  } finally {
    button.disabled = false;
  }
}

function displayUsers(users) {
  const container = document.getElementById("usersList");

  container.innerHTML = "";

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

function searchUsers() {
  const query = document.getElementById("search")
    .value.toLowerCase();

  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );

  displayUsers(filtered);
}

getUsers();
