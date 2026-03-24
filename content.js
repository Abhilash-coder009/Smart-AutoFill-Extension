// @ts-nocheck
// Smart AutoFill Extension - Content Script
// Created by M Abhilash Kumar

console.log('🚀 Smart AutoFill extension loaded - Created by M Abhilash Kumar');

// Enhanced field patterns with more types
const fieldPatterns = {
  // Personal Info
  name: [/fullname/i, /full_name/i, /full-name/i],
  firstName: [/first/i, /fname/i, /given/i, /first_name/i, /first-name/i],
  lastName: [/last/i, /lname/i, /family/i, /surname/i, /last_name/i, /last-name/i],
  email: [/email/i, /e-mail/i, /mail/i, /email_address/i],
  phone: [/phone/i, /mobile/i, /cell/i, /telephone/i, /phone_number/i, /contact/i],
  
  // Address
  address: [/address/i, /addr/i, /street/i, /street_address/i, /location/i],
  city: [/city/i, /town/i, /suburb/i],
  state: [/state/i, /province/i, /region/i],
  zip: [/zip/i, /postal/i, /postcode/i, /pincode/i, /zipcode/i],
  country: [/country/i, /nation/i],
  
  // Work
  company: [/company/i, /employer/i, /organization/i, /work/i],
  jobTitle: [/title/i, /job/i, /position/i, /role/i, /designation/i],
  website: [/website/i, /url/i, /web/i, /homepage/i, /site/i],
  
  // Login
  username: [/username/i, /user/i, /login/i, /user_name/i],
  
  // Additional
  birthday: [/birthday/i, /birth/i, /dob/i, /date_of_birth/i, /birth_date/i],
  age: [/age/i],
  gender: [/gender/i, /sex/i],
  message: [/message/i, /comment/i, /feedback/i, /notes/i]
};

// Improved name splitting function
function splitFullName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return { firstName: fullName, lastName: '' };
  } else if (nameParts.length === 2) {
    return { firstName: nameParts[0], lastName: nameParts[1] };
  } else {
    // For names with multiple parts -> first = all except last, last = last word
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, -1).join(' ');
    return { firstName, lastName };
  }
}

// Intelligent field matching function - PRIORITIZES first/last name detection
function matchFieldToType(field) {
  const fieldName = (field.name || '').toLowerCase();
  const fieldId = (field.id || '').toLowerCase();
  const fieldPlaceholder = (field.placeholder || '').toLowerCase();
  const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
  
  const combinedText = fieldName + ' ' + fieldId + ' ' + fieldPlaceholder + ' ' + ariaLabel;
  const fieldType = field.type?.toLowerCase() || '';
  
  // Check for specific field types
  if (fieldType === 'email') return 'email';
  if (fieldType === 'tel') return 'phone';
  if (fieldType === 'url') return 'website';
  if (fieldType === 'date') return 'birthday';
  
  // CHECK FIRST NAME FIRST (more specific)
  for (const pattern of fieldPatterns.firstName) {
    if (pattern.test(combinedText)) {
      return 'firstName';
    }
  }
  
  // CHECK LAST NAME
  for (const pattern of fieldPatterns.lastName) {
    if (pattern.test(combinedText)) {
      return 'lastName';
    }
  }
  
  // Then check other patterns
  for (const [fieldType, patterns] of Object.entries(fieldPatterns)) {
    if (fieldType === 'firstName' || fieldType === 'lastName') continue;
    for (const pattern of patterns) {
      if (pattern.test(combinedText)) {
        return fieldType;
      }
    }
  }
  
  return 'text';
}

// Get all form fields
function getAllFormFields() {
  console.log('🔍 Searching for form fields...');
  
  const selectors = [
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])',
    'textarea',
    'select'
  ];
  
  let allFields = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      allFields.push(...Array.from(elements));
    }
  });
  
  // Remove duplicates
  const uniqueFields = Array.from(new Set(allFields));
  
  // Filter out disabled fields
  const editableFields = uniqueFields.filter(field => {
    const isDisabled = field.disabled === true;
    return !isDisabled;
  });
  
  console.log(`✅ Total editable fields found: ${editableFields.length}`);
  
  return editableFields;
}

// Enhanced fill field function
function fillField(field, value, fieldType) {
  if (!value || value === '') return false;
  
  console.log(`  📝 Filling ${fieldType}: ${field.name || field.id} = "${value}"`);
  
  try {
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      field.value = value;
      
      // Trigger all possible events
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
      
      // For React
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(field, value);
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      return true;
    }
    
    if (field.tagName === 'SELECT') {
      const options = Array.from(field.options);
      const matchingOption = options.find(opt => 
        opt.text.toLowerCase().includes(value.toLowerCase()) || 
        opt.value.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchingOption) {
        field.value = matchingOption.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`    ❌ Error:`, error);
    return false;
  }
}

// Fill form with profile data
function fillFormWithProfile(profile) {
  console.log('🚀 Starting to fill form...');
  console.log('📋 Profile:', profile);
  
  if (!profile) {
    return { success: false, error: 'No profile data', filledCount: 0 };
  }
  
  const fields = getAllFormFields();
  
  if (fields.length === 0) {
    return { success: false, error: 'No fields found', filledCount: 0 };
  }
  
  // Split the name
  const { firstName, lastName } = splitFullName(profile.name);
  console.log(`📝 Name split: First="${firstName}", Last="${lastName}"`);
  
  let filledCount = 0;
  
  fields.forEach(field => {
    // Skip radio and checkbox
    if (field.type === 'radio' || field.type === 'checkbox') {
      return;
    }
    
    // Skip if field already has value
    if (field.value && field.value !== '') {
      return;
    }
    
    const fieldType = matchFieldToType(field);
    let value = null;
    
    const fieldName = (field.name || '').toLowerCase();
    const fieldId = (field.id || '').toLowerCase();
    
    console.log(`  🔍 Field: ${fieldName || fieldId} -> Type: ${fieldType}`);
    
    // FIRST NAME - specific check
    if (fieldType === 'firstName' || 
        fieldName === 'fname' || fieldId === 'fname' ||
        fieldName === 'firstname' || fieldId === 'firstname' ||
        fieldName.includes('first') || fieldId.includes('first')) {
      value = profile.firstName || firstName;
      console.log(`    ✅ FIRST NAME: using "${value}"`);
    }
    // LAST NAME - specific check
    else if (fieldType === 'lastName' || 
             fieldName === 'lname' || fieldId === 'lname' ||
             fieldName === 'lastname' || fieldId === 'lastname' ||
             fieldName.includes('last') || fieldId.includes('last')) {
      value = profile.lastName || lastName;
      console.log(`    ✅ LAST NAME: using "${value}"`);
    }
    // FULL NAME
    else if (fieldType === 'name' || 
             fieldName.includes('name') || fieldId.includes('name')) {
      value = profile.name;
      console.log(`    ✅ FULL NAME: using "${value}"`);
    }
    // EMAIL
    else if (fieldType === 'email' || fieldName.includes('email')) {
      value = profile.email;
      console.log(`    ✅ EMAIL: using "${value}"`);
    }
    // PHONE
    else if (fieldType === 'phone' || fieldName.includes('phone') || fieldName.includes('mobile')) {
      value = profile.phone || profile.mobile;
      console.log(`    ✅ PHONE: using "${value}"`);
    }
    // ADDRESS
    else if (fieldType === 'address' || fieldName.includes('address') || fieldName.includes('street')) {
      value = profile.address || profile.street;
      console.log(`    ✅ ADDRESS: using "${value}"`);
    }
    // CITY
    else if (fieldType === 'city' || fieldName.includes('city')) {
      value = profile.city;
      console.log(`    ✅ CITY: using "${value}"`);
    }
    // STATE
    else if (fieldType === 'state' || fieldName.includes('state')) {
      value = profile.state;
      console.log(`    ✅ STATE: using "${value}"`);
    }
    // ZIP
    else if (fieldType === 'zip' || fieldName.includes('zip') || fieldName.includes('postal')) {
      value = profile.zip || profile.postalCode;
      console.log(`    ✅ ZIP: using "${value}"`);
    }
    // COUNTRY
    else if (fieldType === 'country' || fieldName.includes('country')) {
      value = profile.country;
      console.log(`    ✅ COUNTRY: using "${value}"`);
    }
    // COMPANY
    else if (fieldType === 'company' || fieldName.includes('company')) {
      value = profile.company;
      console.log(`    ✅ COMPANY: using "${value}"`);
    }
    // JOB TITLE
    else if (fieldType === 'jobTitle' || fieldName.includes('title') || fieldName.includes('position')) {
      value = profile.jobTitle;
      console.log(`    ✅ JOB TITLE: using "${value}"`);
    }
    // WEBSITE
    else if (fieldType === 'website' || fieldName.includes('website') || fieldName.includes('url')) {
      value = profile.website;
      console.log(`    ✅ WEBSITE: using "${value}"`);
    }
    // USERNAME
    else if (fieldType === 'username' || fieldName.includes('username')) {
      value = profile.username;
      console.log(`    ✅ USERNAME: using "${value}"`);
    }
    // BIRTHDAY
    else if (fieldType === 'birthday' || fieldName.includes('birth') || fieldName.includes('dob')) {
      value = profile.birthday;
      console.log(`    ✅ BIRTHDAY: using "${value}"`);
    }
    // AGE
    else if (fieldType === 'age' || fieldName.includes('age')) {
      value = profile.age;
      console.log(`    ✅ AGE: using "${value}"`);
    }
    // GENDER
    else if (fieldType === 'gender' || fieldName.includes('gender')) {
      value = profile.gender;
      console.log(`    ✅ GENDER: using "${value}"`);
    }
    
    // Fill if we have a value
    if (value && value !== '') {
      if (fillField(field, value, fieldType)) {
        filledCount++;
      }
    }
  });
  
  console.log(`📊 Filled ${filledCount} out of ${fields.length} fields`);
  return { success: filledCount > 0, filledCount, totalFields: fields.length };
}

// Clear all form fields
function clearFormFields() {
  console.log('🗑️ Clearing form fields...');
  const fields = getAllFormFields();
  let clearedCount = 0;
  
  fields.forEach(field => {
    if (field.type !== 'checkbox' && field.type !== 'radio') {
      field.value = '';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      clearedCount++;
    }
  });
  
  console.log(`✅ Cleared ${clearedCount} fields`);
  return { success: true, clearedCount };
}

// Learn form structure
function learnFormStructure() {
  console.log('📚 Learning form structure...');
  const fields = getAllFormFields();
  const formStructure = fields.map(field => ({
    type: field.type,
    name: field.name,
    id: field.id,
    placeholder: field.placeholder,
    matchedType: matchFieldToType(field)
  }));
  
  const url = window.location.hostname;
  chrome.storage.local.get(['learnedForms'], (result) => {
    const learnedForms = result.learnedForms || {};
    learnedForms[url] = {
      timestamp: Date.now(),
      fields: formStructure,
      count: formStructure.length
    };
    chrome.storage.local.set({ learnedForms });
    console.log(`📚 Learned ${formStructure.length} fields`);
  });
  
  return formStructure.length;
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message:', request.action);
  
  if (request.action === 'fillForm') {
    const result = fillFormWithProfile(request.profile);
    sendResponse(result);
  } else if (request.action === 'learnForm') {
    sendResponse({ success: true, fieldCount: learnFormStructure() });
  } else if (request.action === 'clearForm') {
    sendResponse(clearFormFields());
  }
  
  return true;
});

console.log('✅ Smart AutoFill ready!');