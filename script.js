let userData = {
  name: "",
  title: "",
  profile: "",
  profileImage: "default-profile.png",
  contact: [],
  education: [],
  skills: [],
  languages: [],
  experience: [],
  references: []
};

let originalData = {};

// Load data from JSON file
async function loadJSONData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    const data = await response.json();
    userData = {...data};
    originalData = JSON.parse(JSON.stringify(data)); // Deep copy for reset
    populateFormFromData();
    showStatus("Data loaded successfully!");
  } catch (error) {
    console.error("Error loading JSON:", error);
    showStatus("Error loading data. Using default.", "error");
    // Load from localStorage if available
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
      userData = JSON.parse(savedData);
      originalData = JSON.parse(savedData);
      populateFormFromData();
    }
  }
}

window.onload = () => {
  loadJSONData();
  
  document.getElementById('profile-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('profile-img').src = event.target.result;
        userData.profileImage = event.target.result;
        saveAllData();
      };
      reader.readAsDataURL(file);
    }
  });
};

function populateFormFromData() {
  document.getElementById("name-input").value = userData.name;
  document.getElementById("title-input").value = userData.title;
  document.getElementById("profile-text").textContent = userData.profile;
  document.getElementById("profile-img").src = userData.profileImage;

  loadList("contact-info", userData.contact, "contact");
  loadList("education-info", userData.education, "education");
  loadList("skills-info", userData.skills, "skills");
  loadList("languages-info", userData.languages, "languages");
  loadList("experience-info", userData.experience, "experience");
  loadReferences();
}

function loadList(id, array, section) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  array.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = id.replace("-info", "-item");
    div.innerHTML = `
      <div class="view-mode">${item}</div>
      <input type="text" class="edit-mode" value="${item}" style="display:none;">
      <div class="item-actions">
        <button class="edit-btn" onclick="toggleEditMode(this, '${section}', ${index})">Edit</button>
        <button class="delete-btn" onclick="deleteItem('${section}', ${index})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function loadReferences() {
  const refContainer = document.getElementById("references-info");
  refContainer.innerHTML = "";
  userData.references.forEach((ref, index) => {
    const div = document.createElement("div");
    div.className = "reference-item";
    div.innerHTML = `
      <div class="view-mode">
        <p><strong>${ref.name}</strong><br>${ref.company} / ${ref.role}<br>${ref.contact}<br>${ref.email}</p>
      </div>
      <div class="edit-mode" style="display:none;">
        <input type="text" value="${ref.name}" placeholder="Name">
        <input type="text" value="${ref.role}" placeholder="Role">
        <input type="text" value="${ref.company}" placeholder="Company">
        <input type="text" value="${ref.contact}" placeholder="Contact">
        <input type="text" value="${ref.email}" placeholder="Email">
      </div>
      <div class="item-actions">
        <button class="edit-btn" onclick="toggleReferenceEditMode(this, ${index})">Edit</button>
        <button class="delete-btn" onclick="deleteReference(${index})">Delete</button>
      </div>
    `;
    refContainer.appendChild(div);
  });
}

function toggleEditMode(button, section, index) {
  const parent = button.closest(".item-actions").parentNode;
  const viewMode = parent.querySelector(".view-mode");
  const editMode = parent.querySelector(".edit-mode");
  
  if (viewMode.style.display === "none") {
    // Save changes
    const newValue = editMode.value.trim();
    if (newValue) {
      userData[section][index] = newValue;
      viewMode.textContent = newValue;
      saveAllData();
    }
    viewMode.style.display = "";
    editMode.style.display = "none";
    button.textContent = "Edit";
  } else {
    // Switch to edit mode
    viewMode.style.display = "none";
    editMode.style.display = "";
    editMode.focus();
    button.textContent = "Save";
  }
}

function toggleReferenceEditMode(button, index) {
  const parent = button.closest(".item-actions").parentNode;
  const viewMode = parent.querySelector(".view-mode");
  const editMode = parent.querySelector(".edit-mode");
  
  if (viewMode.style.display === "none") {
    // Save changes
    const inputs = editMode.querySelectorAll("input");
    const updatedRef = {
      name: inputs[0].value.trim(),
      role: inputs[1].value.trim(),
      company: inputs[2].value.trim(),
      contact: inputs[3].value.trim(),
      email: inputs[4].value.trim()
    };
    
    if (updatedRef.name && updatedRef.role && updatedRef.company) {
      userData.references[index] = updatedRef;
      viewMode.innerHTML = `
        <p><strong>${updatedRef.name}</strong><br>${updatedRef.company} / ${updatedRef.role}<br>${updatedRef.contact}<br>${updatedRef.email}</p>
      `;
      saveAllData();
    }
    
    viewMode.style.display = "";
    editMode.style.display = "none";
    button.textContent = "Edit";
  } else {
    // Switch to edit mode
    viewMode.style.display = "none";
    editMode.style.display = "";
    editMode.querySelector("input").focus();
    button.textContent = "Save";
  }
}

function resetAllData() {
  if (confirm("Are you sure you want to reset all changes?")) {
    userData = JSON.parse(JSON.stringify(originalData));
    populateFormFromData();
    showStatus("All changes reset!");
  }
}

// ... (rest of your existing functions remain the same, just add this new button to your HTML)

function saveAllData() {
  localStorage.setItem('cvData', JSON.stringify(userData));
  // Update original data when saving
  originalData = JSON.parse(JSON.stringify(userData));
}
