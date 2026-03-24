// Background service worker
// Created by M Abhilash Kumar

console.log('🚀 Background script loaded - Created by M Abhilash Kumar');

// Initialize default profiles when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install' || details.reason === 'update') {
    // Create default profiles with more fields
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
    
    // Save profiles to storage
    chrome.storage.local.set({ 
      profiles: defaultProfiles,
      currentProfile: 'personal'
    }, () => {
      console.log('✅ Default profiles initialized!');
    });
  }
});

// Add context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Remove existing menu items to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "fill-form-context",
      title: "✨ AutoFill Form",
      contexts: ["page"]
    });
    
    chrome.contextMenus.create({
      id: "clear-form-context",
      title: "🗑️ Clear Form",
      contexts: ["page"]
    });
    
    console.log('✅ Context menu items created');
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  
  if (info.menuItemId === "fill-form-context") {
    chrome.storage.local.get(['currentProfile', 'profiles'], (result) => {
      const profile = result.profiles?.[result.currentProfile || 'personal'];
      if (profile) {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'fillForm', 
          profile: profile 
        });
      }
    });
  } else if (info.menuItemId === "clear-form-context") {
    chrome.tabs.sendMessage(tab.id, { action: 'clearForm' });
  }
});

// Log when background script is ready
console.log('✅ Background script ready!');
console.log('📝 Created by M Abhilash Kumar');