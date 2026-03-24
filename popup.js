// @ts-nocheck
// Smart AutoFill Extension - Popup Script
// Created by M Abhilash Kumar

// Get DOM elements
const profileSelect = document.getElementById('profile-select');
const fillButton = document.getElementById('fill-form');
const learnButton = document.getElementById('learn-form');
const clearButton = document.getElementById('clear-form');
const manageButton = document.getElementById('manage-profiles');
const statusDiv = document.getElementById('status');

// Load profiles and initialize
async function loadProfiles() {
  console.log('Loading profiles...');
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles', 'currentProfile'], (result) => {
      console.log('Storage data:', result);
      
      let profiles = result.profiles;
      
      // If no profiles exist, create default ones
      if (!profiles || Object.keys(profiles).length === 0) {
        console.log('No profiles found, creating defaults');
        profiles = {
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
        
        // Save default profiles
        chrome.storage.local.set({ profiles: profiles }, () => {
          console.log('Default profiles saved:', profiles);
        });
      }
      
      // Update dropdown options
      if (profileSelect) {
        // Clear existing options
        profileSelect.innerHTML = '';
        
        // Add options for each profile
        Object.keys(profiles).forEach(profileName => {
          const option = document.createElement('option');
          option.value = profileName;
          let displayName = profileName;
          if (profileName === 'work') displayName = '💼 Work';
          if (profileName === 'personal') displayName = '👤 Personal';
          if (profileName === 'fake') displayName = '🕵️ Fake Data';
          option.textContent = displayName;
          profileSelect.appendChild(option);
        });
        
        // Set current profile
        const currentProfile = result.currentProfile || 'personal';
        if (profiles[currentProfile]) {
          profileSelect.value = currentProfile;
        }
      }
      
      resolve(profiles);
    });
  });
}

// Save profile when changed
if (profileSelect) {
  profileSelect.addEventListener('change', () => {
    const selectedProfile = profileSelect.value;
    chrome.storage.local.set({ currentProfile: selectedProfile });
    showStatus(`Profile set to: ${selectedProfile}`, 'success');
  });
}

// Fill form button
if (fillButton) {
  fillButton.addEventListener('click', async () => {
    showStatus('🤖 Analyzing form fields...', 'info');
    
    try {
      // Get selected profile
      const selectedProfile = profileSelect ? profileSelect.value : 'personal';
      console.log('Selected profile:', selectedProfile);
      
      // Get profile data
      const profile = await getProfileData(selectedProfile);
      console.log('Profile data retrieved:', profile);
      
      if (!profile) {
        showStatus('❌ Error: No profile data found. Please edit your profile in settings.', 'error');
        return;
      }
      
      // Check if profile has any data
      const hasData = Object.values(profile).some(value => value && value !== '');
      if (!hasData) {
        showStatus('❌ Profile is empty! Click "Manage" to add your information.', 'error');
        return;
      }
      
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab.url);
      
      if (!tab.id) {
        showStatus('❌ Error: No active tab found', 'error');
        return;
      }
      
      // Execute fill in content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'fillForm',
        profile: profile
      });
      
      console.log('Fill response:', response);
      
      if (response && response.success) {
        showStatus(`✅ Filled ${response.filledCount} fields successfully!`, 'success');
      } else {
        showStatus(`⚠️ ${response?.error || 'No fields found to fill'}`, 'warning');
      }
    } catch (error) {
      console.error('Fill error:', error);
      showStatus('❌ Error: Could not fill form. Make sure the page has form fields.', 'error');
    }
  });
}

// Learn form button
if (learnButton) {
  learnButton.addEventListener('click', async () => {
    showStatus('📝 Learning form structure...', 'info');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        showStatus('❌ Error: No active tab found', 'error');
        return;
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'learnForm'
      });
      
      if (response && response.success) {
        showStatus(`✅ Learned ${response.fieldCount} fields from this form!`, 'success');
      } else {
        showStatus('⚠️ No form fields found on this page', 'warning');
      }
    } catch (error) {
      console.error('Learn error:', error);
      showStatus('❌ Error: Could not learn form structure', 'error');
    }
  });
}

// Clear form button
if (clearButton) {
  clearButton.addEventListener('click', async () => {
    showStatus('🗑️ Clearing form...', 'info');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        showStatus('❌ Error: No active tab found', 'error');
        return;
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'clearForm'
      });
      
      if (response && response.success) {
        showStatus('✅ Form cleared successfully!', 'success');
      } else {
        showStatus('⚠️ No fields to clear', 'warning');
      }
    } catch (error) {
      console.error('Clear error:', error);
      showStatus('❌ Error: Could not clear form', 'error');
    }
  });
}

// Manage profiles button
if (manageButton) {
  manageButton.addEventListener('click', () => {
    if (chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  });
}

// Helper function to get profile data
function getProfileData(profileType) {
  return new Promise((resolve) => {
    console.log('Getting profile data for:', profileType);
    
    chrome.storage.local.get(['profiles'], (result) => {
      console.log('Stored profiles:', result.profiles);
      
      const profiles = result.profiles;
      
      if (!profiles) {
        console.error('No profiles found in storage');
        resolve(null);
        return;
      }
      
      const selectedProfile = profiles[profileType];
      console.log('Selected profile data:', selectedProfile);
      
      if (!selectedProfile) {
        console.error(`Profile "${profileType}" not found`);
        resolve(null);
      } else {
        resolve(selectedProfile);
      }
    });
  });
}

// Show status message
function showStatus(message, type) {
  if (!statusDiv) return;
  
  statusDiv.textContent = message;
  statusDiv.style.background = type === 'error' ? '#fee' : 
                               type === 'success' ? '#e8f5e9' : 
                               type === 'warning' ? '#fff3e0' : '#e3f2fd';
  statusDiv.style.color = type === 'error' ? '#c33' : 
                          type === 'success' ? '#2e7d32' : 
                          type === 'warning' ? '#ed6c02' : '#1976d2';
  
  setTimeout(() => {
    if (statusDiv.textContent === message) {
      statusDiv.style.background = '#f7f9fc';
      statusDiv.style.color = '#666';
      statusDiv.textContent = 'Ready to fill forms';
    }
  }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded - Created by M Abhilash Kumar');
  await loadProfiles();
  showStatus('Ready to fill forms', 'info');
});