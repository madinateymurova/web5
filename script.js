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

function deleteItem(section, index) {
  userData[section].splice(index, 1);
  loadList(`${section}-info`, userData[section], section);
  saveAllData();
}

function deleteReference(index) {
  userData.references.splice(index, 1);
  loadReferences();
  saveAllData();
}

function validateName(name) {
  if (!name.trim()) {
    document.getElementById("name-error").textContent = "Name is required";
    document.getElementById("name-input").classList.add("invalid");
    return false;
  }
  document.getElementById("name-error").textContent = "";
  document.getElementById("name-input").classList.remove("invalid");
  return true;
}

function validateTitle(title) {
  if (!title.trim()) {
    document.getElementById("title-error").textContent = "Title is required";
    document.getElementById("title-input").classList.add("invalid");
    return false;
  }
  document.getElementById("title-error").textContent = "";
  document.getElementById("title-input").classList.remove("invalid");
  return true;
}

function validateProfile(profile) {
  if (!profile.trim()) {
    document.getElementById("profile-error").textContent = "Profile text is required";
    document.getElementById("profile-edit").classList.add("invalid");
    return false;
  }
  if (profile.length > 500) {
    document.getElementById("profile-error").textContent = "Profile must be less than 500 characters";
    document.getElementById("profile-edit").classList.add("invalid");
    return false;
  }
  document.getElementById("profile-error").textContent = "";
  document.getElementById("profile-edit").classList.remove("invalid");
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("email-error").textContent = "Please enter a valid email";
    document.getElementById("new-email").classList.add("invalid");
    return false;
  }
  document.getElementById("email-error").textContent = "";
  document.getElementById("new-email").classList.remove("invalid");
  return true;
}

function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phoneRegex.test(phone)) {
    document.getElementById("phone-error").textContent = "Please enter a valid phone number";
    document.getElementById("new-phone").classList.add("invalid");
    return false;
  }
  document.getElementById("phone-error").textContent = "";
  document.getElementById("new-phone").classList.remove("invalid");
  return true;
}

function saveBasicInfo() {
  const name = document.getElementById("name-input").value;
  const title = document.getElementById("title-input").value;
  
  if (validateName(name) && validateTitle(title)) {
    userData.name = name;
    userData.title = title;
    showStatus("Basic info saved!");
    saveAllData();
  }
}

function editProfile() {
  document.getElementById("profile-text").style.display = "none";
  const textarea = document.getElementById("profile-edit");
  textarea.style.display = "block";
  textarea.value = userData.profile;
  document.getElementById("save-profile").style.display = "inline";
}

function saveProfile() {
  const newText = document.getElementById("profile-edit").value.trim();
  if (validateProfile(newText)) {
    userData.profile = newText;
    document.getElementById("profile-text").textContent = newText;
    document.getElementById("profile-text").style.display = "block";
    document.getElementById("profile-edit").style.display = "none";
    document.getElementById("save-profile").style.display = "none";
    showStatus("Profile saved!");
    saveAllData();
  }
}

function addContact() {
  const phone = document.getElementById("new-phone").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const address = document.getElementById("new-address").value.trim();
  const website = document.getElementById("new-website").value.trim();
  
  let isValid = true;
  
  if (phone && !validatePhone(phone)) isValid = false;
  if (email && !validateEmail(email)) isValid = false;
  
  if (isValid) {
    if (phone) userData.contact.push(phone);
    if (email) userData.contact.push(email);
    if (address) userData.contact.push(address);
    if (website) userData.contact.push(website);
    
    loadList("contact-info", userData.contact, "contact");
    document.getElementById("new-phone").value = "";
    document.getElementById("new-email").value = "";
    document.getElementById("new-address").value = "";
    document.getElementById("new-website").value = "";
    showStatus("Contact info added!");
    saveAllData();
  }
}

function addEducation() {
  const val = document.getElementById("new-edu").value.trim();
  if (!val) {
    document.getElementById("edu-error").textContent = "Education info is required";
    document.getElementById("new-edu").classList.add("invalid");
    return;
  }
  
  document.getElementById("edu-error").textContent = "";
  document.getElementById("new-edu").classList.remove("invalid");
  
  userData.education.push(val);
  loadList("education-info", userData.education, "education");
  document.getElementById("new-edu").value = "";
  showStatus("Education added!");
  saveAllData();
}

function addSkill() {
  const val = document.getElementById("new-skill").value.trim();
  if (!val) {
    document.getElementById("skill-error").textContent = "Skill is required";
    document.getElementById("new-skill").classList.add("invalid");
    return;
  }
  
  document.getElementById("skill-error").textContent = "";
  document.getElementById("new-skill").classList.remove("invalid");
  
  userData.skills.push(val);
  loadList("skills-info", userData.skills, "skills");
  document.getElementById("new-skill").value = "";
  showStatus("Skill added!");
  saveAllData();
}

function addLanguage() {
  const val = document.getElementById("new-language").value.trim();
  if (!val) {
    document.getElementById("language-error").textContent = "Language is required";
    document.getElementById("new-language").classList.add("invalid");
    return;
  }
  
  document.getElementById("language-error").textContent = "";
  document.getElementById("new-language").classList.remove("invalid");
  
  userData.languages.push(val);
  loadList("languages-info", userData.languages, "languages");
  document.getElementById("new-language").value = "";
  showStatus("Language added!");
  saveAllData();
}

function addExperience() {
  const val = document.getElementById("new-exp").value.trim();
  if (!val) {
    document.getElementById("exp-error").textContent = "Experience is required";
    document.getElementById("new-exp").classList.add("invalid");
    return;
  }
  
  document.getElementById("exp-error").textContent = "";
  document.getElementById("new-exp").classList.remove("invalid");
  
  userData.experience.push(val);
  loadList("experience-info", userData.experience, "experience");
  document.getElementById("new-exp").value = "";
  showStatus("Experience added!");
  saveAllData();
}

function addReference() {
  const name = document.getElementById("ref-name").value.trim();
  const role = document.getElementById("ref-role").value.trim();
  const company = document.getElementById("ref-company").value.trim();
  const contact = document.getElementById("ref-contact").value.trim();
  const email = document.getElementById("ref-email").value.trim();
  
  if (!name || !role || !company) {
    showStatus("Please fill at least name, role and company", "error");
    return;
  }
  
  userData.references.push({
    name, role, company, contact, email
  });
  
  loadReferences();
  document.getElementById("ref-name").value = "";
  document.getElementById("ref-role").value = "";
  document.getElementById("ref-company").value = "";
  document.getElementById("ref-contact").value = "";
  document.getElementById("ref-email").value = "";
  showStatus("Reference added!");
  saveAllData();
}

function saveAllData() {
  localStorage.setItem('cvData', JSON.stringify(userData));
  // Update original data when saving
  originalData = JSON.parse(JSON.stringify(userData));
  showStatus("All data saved!");
}

function showStatus(message, type = "success") {
  const statusElement = document.getElementById("save-status");
  statusElement.textContent = message;
  statusElement.style.color = type === "error" ? "#e74c3c" : "#27ae60";
  
  setTimeout(() => {
    statusElement.textContent = "";
  }, 3000);
}
