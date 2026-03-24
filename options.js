// @ts-nocheck
// Options page script - Created by M Abhilash Kumar

// Complete field list for profiles
const PROFILE_FIELDS = [
  // Personal Info
  { key: 'name', label: 'Full Name', placeholder: 'Full Name' },
  { key: 'firstName', label: 'First Name', placeholder: 'First Name' },
  { key: 'lastName', label: 'Last Name', placeholder: 'Last Name' },
  { key: 'email', label: 'Email', placeholder: 'Email Address' },
  { key: 'phone', label: 'Phone', placeholder: 'Phone Number' },
  { key: 'mobile', label: 'Mobile', placeholder: 'Mobile Number' },
  
  // Address
  { key: 'address', label: 'Address', placeholder: 'Street Address' },
  { key: 'street', label: 'Street', placeholder: 'Street' },
  { key: 'city', label: 'City', placeholder: 'City' },
  { key: 'state', label: 'State', placeholder: 'State/Province' },
  { key: 'zip', label: 'Zip Code', placeholder: 'Zip/Postal Code' },
  { key: 'postalCode', label: 'Postal Code', placeholder: 'Postal Code' },
  { key: 'country', label: 'Country', placeholder: 'Country' },
  
  // Work
  { key: 'company', label: 'Company', placeholder: 'Company Name' },
  { key: 'jobTitle', label: 'Job Title', placeholder: 'Job Title/Position' },
  { key: 'website', label: 'Website', placeholder: 'Website URL' },
  { key: 'username', label: 'Username', placeholder: 'Username' },
  
  // Personal Details
  { key: 'birthday', label: 'Birthday', placeholder: 'YYYY-MM-DD' },
  { key: 'age', label: 'Age', placeholder: 'Age' },
  { key: 'gender', label: 'Gender', placeholder: 'Gender' }
];

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    if (tab === 'profiles') loadProfiles();
    if (tab === 'learned') loadLearnedForms();
  });
});

// Load profiles
function loadProfiles() {
  console.log('Loading profiles...');
  
  chrome.storage.local.get(['profiles'], (result) => {
    const profiles = result.profiles || {};
    const profilesList = document.getElementById('profiles-list');
    
    if (!profilesList) return;
    
    profilesList.innerHTML = '';
    
    if (Object.keys(profiles).length === 0) {
      profilesList.innerHTML = '<p style="text-align: center; padding: 40px;">No profiles found. Create one below.</p>';
    }
    
    Object.entries(profiles).forEach(([name, data]) => {
      const profileCard = createProfileCard(name, data);
      profilesList.appendChild(profileCard);
    });
  });
}

// Create profile card with all fields
function createProfileCard(profileName, profileData) {
  const card = document.createElement('div');
  card.className = 'profile-card';
  
  // Generate all fields
  const fieldsHtml = PROFILE_FIELDS.map(field => `
    <div class="profile-field">
      <label>${field.label}</label>
      <input type="text" data-field="${field.key}" value="${escapeHtml(profileData[field.key] || '')}" placeholder="${field.placeholder}">
    </div>
  `).join('');
  
  card.innerHTML = `
    <h3>${profileName.toUpperCase()} Profile</h3>
    <div class="profile-fields">
      ${fieldsHtml}
    </div>
    <div class="profile-actions">
      <button class="save-profile primary-btn" data-profile="${profileName}">💾 Save Changes</button>
      <button class="delete-profile danger-btn" data-profile="${profileName}">🗑️ Delete Profile</button>
    </div>
  `;
  
  // Save button
  const saveBtn = card.querySelector('.save-profile');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const updatedData = {};
      card.querySelectorAll('.profile-field input').forEach(input => {
        const field = input.dataset.field;
        updatedData[field] = input.value;
      });
      
      console.log(`Saving ${profileName}:`, updatedData);
      
      chrome.storage.local.get(['profiles'], (result) => {
        const profiles = result.profiles || {};
        profiles[profileName] = updatedData;
        
        chrome.storage.local.set({ profiles }, () => {
          alert(`✅ ${profileName} profile saved successfully!`);
          loadProfiles();
        });
      });
    });
  }
  
  // Delete button
  const deleteBtn = card.querySelector('.delete-profile');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete ${profileName} profile? This cannot be undone.`)) {
        chrome.storage.local.get(['profiles'], (result) => {
          const profiles = result.profiles || {};
          delete profiles[profileName];
          
          chrome.storage.local.set({ profiles }, () => {
            alert(`✅ ${profileName} profile deleted!`);
            loadProfiles();
          });
        });
      }
    });
  }
  
  return card;
}

// New profile
const newProfileBtn = document.getElementById('new-profile');
if (newProfileBtn) {
  newProfileBtn.addEventListener('click', () => {
    const profileName = prompt('Enter profile name:', 'new_profile');
    if (profileName && profileName.trim()) {
      const cleanName = profileName.trim().toLowerCase().replace(/\s+/g, '_');
      
      chrome.storage.local.get(['profiles'], (result) => {
        const profiles = result.profiles || {};
        
        if (profiles[cleanName]) {
          alert('Profile already exists! Please use a different name.');
          return;
        }
        
        // Create new profile with all fields
        const newProfile = {};
        PROFILE_FIELDS.forEach(field => {
          newProfile[field.key] = '';
        });
        
        profiles[cleanName] = newProfile;
        
        chrome.storage.local.set({ profiles }, () => {
          alert(`✅ New profile "${cleanName}" created!`);
          loadProfiles();
        });
      });
    }
  });
}

// Reset to default profiles
const resetBtn = document.getElementById('reset-profiles');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all profiles to default? This will delete all your custom profiles!')) {
      const defaultProfiles = {
        work: {
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          phone: '+1 (555) 123-4567',
          mobile: '+1 (555) 123-4567',
          address: '123 Business Ave',
          street: '123 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          postalCode: '94105',
          country: 'USA',
          company: 'Tech Corp',
          jobTitle: 'Software Engineer',
          website: 'https://techcorp.com',
          username: 'johndoe',
          birthday: '1990-01-01',
          age: '33',
          gender: 'male'
        },
        personal: {
          name: 'Your Name',
          firstName: 'Your First Name',
          lastName: 'Your Last Name',
          email: 'your.email@example.com',
          phone: '+1 (555) 000-0000',
          mobile: '+1 (555) 000-0000',
          address: 'Your Address',
          street: 'Your Street',
          city: 'Your City',
          state: 'Your State',
          zip: '00000',
          postalCode: '00000',
          country: 'Your Country',
          company: 'Your Company',
          jobTitle: 'Your Job Title',
          website: 'https://yourwebsite.com',
          username: 'yourusername',
          birthday: '1990-01-01',
          age: '30',
          gender: 'prefer not to say'
        },
        fake: {
          name: 'Anonymous User',
          firstName: 'Anonymous',
          lastName: 'User',
          email: 'temp' + Math.floor(Math.random() * 10000) + '@temp.com',
          phone: '+1 (555) 000-0000',
          mobile: '+1 (555) 000-0000',
          address: '123 Privacy Lane',
          street: '123 Privacy Lane',
          city: 'Confidential',
          state: 'XX',
          zip: '00000',
          postalCode: '00000',
          country: 'Unknown',
          company: 'Private',
          jobTitle: 'User',
          website: 'https://anonymous.com',
          username: 'user' + Math.floor(Math.random() * 1000),
          birthday: '1990-01-01',
          age: '30',
          gender: 'prefer not to say'
        }
      };
      
      chrome.storage.local.set({ profiles: defaultProfiles }, () => {
        alert('✅ Profiles reset to default!');
        loadProfiles();
      });
    }
  });
}

// Load learned forms
function loadLearnedForms() {
  chrome.storage.local.get(['learnedForms'], (result) => {
    const learnedForms = result.learnedForms || {};
    const listDiv = document.getElementById('learned-forms-list');
    
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    Object.entries(learnedForms).forEach(([url, data]) => {
      const item = document.createElement('div');
      item.className = 'learned-form-item';
      const fieldCount = data.fields ? data.fields.length : data.count || 0;
      const date = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown date';
      
      item.innerHTML = `
        <strong>🔗 ${url}</strong>
        <p>📝 ${fieldCount} fields learned on ${date}</p>
        <button class="delete-learned secondary-btn" data-url="${url}">🗑️ Forget this form</button>
      `;
      
      const deleteBtn = item.querySelector('.delete-learned');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          delete learnedForms[url];
          chrome.storage.local.set({ learnedForms }, () => {
            loadLearnedForms();
          });
        });
      }
      
      listDiv.appendChild(item);
    });
    
    if (Object.keys(learnedForms).length === 0) {
      listDiv.innerHTML = '<p style="text-align: center; padding: 40px;">✨ No forms learned yet. Visit a website with a form and click "Learn This Form".</p>';
    }
  });
}

// Clear learned forms
const clearLearnedBtn = document.getElementById('clear-learned');
if (clearLearnedBtn) {
  clearLearnedBtn.addEventListener('click', () => {
    if (confirm('Clear ALL learned forms? This action cannot be undone.')) {
      chrome.storage.local.set({ learnedForms: {} }, () => {
        alert('✅ All learned forms cleared!');
        loadLearnedForms();
      });
    }
  });
}

// Load settings
function loadSettings() {
  chrome.storage.local.get(['autoDetect', 'showNotifications', 'debugMode'], (result) => {
    const autoDetect = document.getElementById('auto-detect');
    const showNotifications = document.getElementById('show-notifications');
    const debugMode = document.getElementById('debug-mode');
    
    if (autoDetect) autoDetect.checked = result.autoDetect || false;
    if (showNotifications) showNotifications.checked = result.showNotifications !== false;
    if (debugMode) debugMode.checked = result.debugMode || false;
  });
}

// Save settings
const autoDetect = document.getElementById('auto-detect');
if (autoDetect) {
  autoDetect.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoDetect: e.target.checked });
  });
}

const showNotifications = document.getElementById('show-notifications');
if (showNotifications) {
  showNotifications.addEventListener('change', (e) => {
    chrome.storage.local.set({ showNotifications: e.target.checked });
  });
}

const debugMode = document.getElementById('debug-mode');
if (debugMode) {
  debugMode.addEventListener('change', (e) => {
    chrome.storage.local.set({ debugMode: e.target.checked });
  });
}

// Helper function
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Options page loaded - Created by M Abhilash Kumar');
  loadProfiles();
  loadLearnedForms();
  loadSettings();
});