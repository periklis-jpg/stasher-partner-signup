// Form State Management
const formState = {
    currentPage: 1,
    program: null,
    language: 'en',
    acceptTerms: false,
    companyType: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    commissionType: '',
    city: '',
    country: '',
    companyName: '',
    companyWebsite: '',
    numberOfProperties: '',
    companyDescription: ''
};

// Backend API Endpoint
// This should point to your serverless function (Netlify/Vercel/etc)
// For local development, use: 'http://localhost:8888/.netlify/functions/create-affiliate'
// For production, this will be automatically set by your hosting platform
const BACKEND_API_URL = '/.netlify/functions/create-affiliate';

// Map program currency to Tapfiliate Program ID
// These are the actual program IDs from your Tapfiliate dashboard
const PROGRAM_ID_MAP = {
    'USD': 'stasher-affiliates-usd',
    'EUR': 'stasher-affiliate-program-sp',
    'GBP': 'stasher-affiliate-program',
    'AUD': 'jg-affiliate-program'
};

// Country name to ISO 3166-1 alpha-2 code mapping
const COUNTRY_ISO_MAP = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Ireland': 'IE',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Cyprus': 'CY',
    'Japan': 'JP',
    'South Korea': 'KR',
    'China': 'CN',
    'India': 'IN',
    'Singapore': 'SG',
    'Hong Kong': 'HK',
    'Taiwan': 'TW',
    'Thailand': 'TH',
    'Malaysia': 'MY',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'New Zealand': 'NZ',
    'South Africa': 'ZA',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Uruguay': 'UY',
    'Paraguay': 'PY',
    'Ecuador': 'EC',
    'Venezuela': 'VE',
    'Costa Rica': 'CR',
    'Panama': 'PA',
    'Guatemala': 'GT',
    'Honduras': 'HN',
    'El Salvador': 'SV',
    'Nicaragua': 'NI',
    'Dominican Republic': 'DO',
    'Jamaica': 'JM',
    'Trinidad and Tobago': 'TT',
    'Barbados': 'BB',
    'Bahamas': 'BS',
    'Belize': 'BZ',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'Bolivia': 'BO',
    'Russia': 'RU',
    'Ukraine': 'UA',
    'Turkey': 'TR',
    'Israel': 'IL',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
    'Qatar': 'QA',
    'Kuwait': 'KW',
    'Oman': 'OM',
    'Bahrain': 'BH',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Egypt': 'EG',
    'Morocco': 'MA',
    'Tunisia': 'TN',
    'Algeria': 'DZ',
    'Kenya': 'KE',
    'Nigeria': 'NG',
    'Ghana': 'GH',
    'Senegal': 'SN',
    'Ivory Coast': 'CI',
    'Tanzania': 'TZ',
    'Uganda': 'UG',
    'Ethiopia': 'ET',
    'Rwanda': 'RW',
    'Mauritius': 'MU'
};

// Helper function to get ISO country code
function getCountryISOCode(countryName) {
    return COUNTRY_ISO_MAP[countryName] || countryName.substring(0, 2).toUpperCase();
}

// Country List
const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Poland', 'Portugal', 'Greece', 'Ireland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
    'Croatia', 'Slovakia', 'Slovenia', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
    'Cyprus', 'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Hong Kong', 'Taiwan',
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'New Zealand', 'South Africa',
    'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Paraguay',
    'Ecuador', 'Venezuela', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'El Salvador',
    'Nicaragua', 'Dominican Republic', 'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Bahamas',
    'Belize', 'Guyana', 'Suriname', 'Bolivia', 'Russia', 'Ukraine', 'Turkey', 'Israel',
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Jordan',
    'Lebanon', 'Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Kenya', 'Nigeria', 'Ghana',
    'Senegal', 'Ivory Coast', 'Tanzania', 'Uganda', 'Ethiopia', 'Rwanda', 'Mauritius'
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeLandingPage();
    initializeForm();
    populateCountries();
    setupEventListeners();
    setupProgressBarNavigation();
});

// Initialize Landing Page
function initializeLandingPage() {
    const startSignupBtn = document.getElementById('startSignupBtn');
    if (startSignupBtn) {
        startSignupBtn.addEventListener('click', function() {
            showSignupForm();
        });
    }

    const startSignupBtnSecondary = document.getElementById('startSignupBtnSecondary');
    if (startSignupBtnSecondary) {
        startSignupBtnSecondary.addEventListener('click', function() {
            showSignupForm();
        });
    }

    // Get started button in "How does it work?" section
    const getStartedHowItWorks = document.getElementById('getStartedHowItWorks');
    if (getStartedHowItWorks) {
        getStartedHowItWorks.addEventListener('click', function() {
            showSignupForm();
        });
    }

    // Get started button in "Check our locations" section
    const getStartedLocations = document.getElementById('getStartedLocations');
    if (getStartedLocations) {
        getStartedLocations.addEventListener('click', function() {
            showSignupForm();
        });
    }

    const footerStartSignup = document.getElementById('footerStartSignup');
    if (footerStartSignup) {
        footerStartSignup.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }

    const footerYear = document.getElementById('footerYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // Logo click - redirect to landing page
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            goBackToLandingPage();
        });
    }
}

// Show Signup Form (hide landing page)
function showSignupForm() {
    const landingPage = document.getElementById('landingPage');
    const progressContainer = document.getElementById('progressContainer');
    const formContainer = document.getElementById('formContainer');
    
    if (landingPage) {
        landingPage.style.display = 'none';
    }
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    if (formContainer) {
        formContainer.style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Go back to landing page (from signup form)
function goBackToLandingPage() {
    const landingPage = document.getElementById('landingPage');
    const progressContainer = document.getElementById('progressContainer');
    const formContainer = document.getElementById('formContainer');
    
    if (landingPage) {
        landingPage.style.display = 'block';
    }
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    
    // Reset form to page 1
    formState.currentPage = 1;
    showPage(1);
    updateProgressBar(1);
    updateContinueButton(1);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize Form
function initializeForm() {
    showPage(1);
    updateProgressBar(1);
    updateContinueButton(1);
}

// Populate Country Lists
function populateCountries() {
    const datalist = document.getElementById('countryOptions');
    if (!datalist) return;
    datalist.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        datalist.appendChild(option);
    });
}

function setupCountryInputs() {
    const countryInputs = [document.getElementById('country'), document.getElementById('country2')];
    countryInputs.forEach(input => {
        setupCountryInput(input);
    });
}

function setupCountryInput(input) {
    if (!input) return;
    ['input', 'change', 'blur'].forEach(eventType => {
        input.addEventListener(eventType, function() {
            validateCountryInput(input);
            updateContinueButton(4);
        });
    });
    validateCountryInput(input);
}

function validateCountryInput(input) {
    if (!input) return false;
    const value = input.value.trim();
    if (value === '') {
        input.setCustomValidity('Please select a country from the list');
        // Update formState based on which input this is
        if (input.id === 'country') {
            formState.country = '';
        } else if (input.id === 'country2') {
            formState.country = '';
        }
        updateContinueButton(4);
        return false;
    }
    if (countries.includes(value)) {
        input.setCustomValidity('');
        // Update formState based on which input this is
        if (input.id === 'country' || input.id === 'country2') {
            formState.country = value;
        }
        updateContinueButton(4);
        return true;
    } else {
        input.setCustomValidity('Please select a country from the list');
        // Update formState based on which input this is
        if (input.id === 'country') {
            formState.country = '';
        } else if (input.id === 'country2') {
            formState.country = '';
        }
        updateContinueButton(4);
        return false;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Language Select
    const languageSelect = document.getElementById('languageSelect');
    const currentLanguageFlag = document.getElementById('currentLanguageFlag');
    
    // Update flag when language changes
    languageSelect.addEventListener('change', function(e) {
        formState.language = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        const flag = selectedOption.getAttribute('data-flag');
        if (flag && currentLanguageFlag) {
            currentLanguageFlag.textContent = flag;
        }
    });
    
    // Initialize flag on page load
    const initialOption = languageSelect.options[languageSelect.selectedIndex];
    const initialFlag = initialOption.getAttribute('data-flag');
    if (initialFlag && currentLanguageFlag) {
        currentLanguageFlag.textContent = initialFlag;
    }

    // Page 1: Program Selection
    document.querySelectorAll('.currency-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.currency-box').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            formState.program = this.dataset.currency;
            updateContinueButton(1);
            
            // Auto-advance to next page
            setTimeout(() => {
                if (validatePage1()) {
                    nextPage();
                }
            }, 300);
        });
    });

    // Terms Checkbox (moved to page 3)
    document.getElementById('acceptTerms').addEventListener('change', function(e) {
        formState.acceptTerms = e.target.checked;
        updateContinueButton(3);
    });

    // Terms & Conditions Modal
    const termsLink = document.getElementById('termsLink');
    const termsModal = document.getElementById('termsModal');
    const termsModalClose = document.getElementById('termsModalClose');
    const termsModalOverlay = document.getElementById('termsModalOverlay');

    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            openTermsModal();
        });
    }

    if (termsModalClose) {
        termsModalClose.addEventListener('click', function() {
            closeTermsModal();
        });
    }

    if (termsModalOverlay) {
        termsModalOverlay.addEventListener('click', function() {
            closeTermsModal();
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && termsModal && termsModal.classList.contains('active')) {
            closeTermsModal();
        }
    });

    // Continue Button 1
    document.getElementById('continueBtn1').addEventListener('click', function() {
        if (validatePage1()) {
            nextPage();
        }
    });

    // Back Button 1 - Go back to landing page
    const backBtn1 = document.getElementById('backBtn1');
    if (backBtn1) {
        backBtn1.addEventListener('click', function() {
            goBackToLandingPage();
        });
    }

    // Page 2: Company Type
    document.querySelectorAll('.company-type-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.company-type-box').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            formState.companyType = this.dataset.type;
            updateContinueButton(2);
            
            // Auto-advance to next page
            setTimeout(() => {
                if (validatePage2()) {
                    // Check if Supply was selected - redirect immediately
                    if (formState.companyType === 'supply') {
                        window.location.href = 'https://hosts.stasher.com/signup';
                        return;
                    }
                    nextPage();
                }
            }, 300);
        });
    });

    // Continue Button 2
    document.getElementById('continueBtn2').addEventListener('click', function() {
        if (validatePage2()) {
            // Check if Supply was selected - redirect immediately
            if (formState.companyType === 'supply') {
                window.location.href = 'https://hosts.stasher.com/signup';
                return;
            }
            nextPage();
        }
    });

    // Back Button 2
    document.getElementById('backBtn2').addEventListener('click', function() {
        previousPage();
    });

    // Page 3: Personal Info
    const page3Inputs = ['firstName', 'lastName', 'email', 'password'];
    page3Inputs.forEach(field => {
        const input = document.getElementById(field);
        input.addEventListener('input', function() {
            formState[field] = this.value;
            updateContinueButton(3);
        });
    });

    // Continue Button 3
    document.getElementById('continueBtn3').addEventListener('click', function() {
        if (validatePage3()) {
            nextPage();
        }
    });

    // Back Button 3
    document.getElementById('backBtn3').addEventListener('click', function() {
        previousPage();
    });

    // Page 4: Company Details
    setupPage4Listeners();
    setupCountryInputs();

    // Continue Button 4
    document.getElementById('continueBtn4').addEventListener('click', function() {
        if (validatePage4()) {
            nextPage();
        }
    });

    // Back Button 4
    document.getElementById('backBtn4').addEventListener('click', function() {
        previousPage();
    });

    // Page 5: Final Step
    const bookDemoBtn = document.getElementById('bookDemoBtn');
    if (bookDemoBtn) {
        bookDemoBtn.addEventListener('click', function() {
            window.location.href = 'https://cal.com/periklis/15min';
        });
    }

    // Use event delegation for skip demo link to ensure it works
    document.addEventListener('click', function(e) {
        const skipDemoLink = e.target.closest('#skipDemoLink');
        if (skipDemoLink) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Skip demo link clicked');
            handleSkipDemo();
        }
    });

    // Back Button 5
    const backBtn5 = document.getElementById('backBtn5');
    if (backBtn5) {
        backBtn5.addEventListener('click', function() {
            previousPage();
        });
    }

    const returnHomeBtn = document.getElementById('returnHomeBtn');
    if (returnHomeBtn) {
        returnHomeBtn.addEventListener('click', function() {
            goBackToLandingPage();
        });
    }
}

// Setup Page 4 Listeners
function setupPage4Listeners() {
    // Vacation Rental Fields
    const vacationRentalFields = ['city', 'companyName', 'companyWebsite', 'numberOfProperties'];
    vacationRentalFields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            ['input', 'change'].forEach(evt => {
                input.addEventListener(evt, function() {
                    formState[field] = this.value;
                    updateContinueButton(4);
                });
            });
        }
    });

    // Commission Type for Vacation Rental
    const commissionType = document.getElementById('commissionType');
    if (commissionType) {
        commissionType.addEventListener('change', function() {
            formState.commissionType = this.value;
            updateContinueButton(4);
        });
    }

    // Other Fields (PMS, Venue, Blog, Other)
    const otherFields = ['city2', 'companyName2', 'companyWebsite2', 'companyDescription'];
    otherFields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            ['input', 'change'].forEach(evt => {
                input.addEventListener(evt, function() {
                    // Map to formState
                    if (field === 'city2') formState.city = this.value;
                    if (field === 'companyName2') formState.companyName = this.value;
                    if (field === 'companyWebsite2') formState.companyWebsite = this.value;
                    if (field === 'companyDescription') formState.companyDescription = this.value;
                    updateContinueButton(4);
                });
            });
        }
    });

    // Commission Type for Other Fields
    const commissionType2 = document.getElementById('commissionType2');
    if (commissionType2) {
        commissionType2.addEventListener('change', function() {
            formState.commissionType = this.value;
            updateContinueButton(4);
        });
    }
}

// Page Navigation
function showPage(pageNumber) {
    document.querySelectorAll('.form-page').forEach(page => {
        page.classList.remove('active');
    });
    
    const pageElement = document.getElementById(`page${pageNumber}`);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Show appropriate fields for page 4
    if (pageNumber === 4) {
        showPage4Fields();
    }

    // Generate summary for page 5
    if (pageNumber === 5) {
        generateSummary();
    }
}

function nextPage() {
    if (formState.currentPage < 5) {
        formState.currentPage++;
        showPage(formState.currentPage);
        updateProgressBar(formState.currentPage);
        updateContinueButton(formState.currentPage);
    }
}

function previousPage() {
    if (formState.currentPage > 1) {
        formState.currentPage--;
        showPage(formState.currentPage);
        updateProgressBar(formState.currentPage);
        updateContinueButton(formState.currentPage);
    }
}

// Show Page 4 Fields Based on Company Type
function showPage4Fields() {
    const vacationRentalFields = document.getElementById('vacationRentalFields');
    const otherFields = document.getElementById('otherFields');
    const countrySelect = document.getElementById('country');
    const countrySelect2 = document.getElementById('country2');

    vacationRentalFields.style.display = 'none';
    otherFields.style.display = 'none';

    if (formState.companyType === 'vacation-rental') {
        vacationRentalFields.style.display = 'block';
        if (countrySelect) {
            countrySelect.value = formState.country || '';
            validateCountryInput(countrySelect);
        }
        // Sync commission type value
        const commissionType = document.getElementById('commissionType');
        if (commissionType && formState.commissionType) {
            commissionType.value = formState.commissionType;
        }
    } else if (['pms', 'venue', 'blog', 'tour-operator', 'transportations', 'other'].includes(formState.companyType)) {
        otherFields.style.display = 'block';
        // Sync commission type value
        const commissionType2 = document.getElementById('commissionType2');
        if (commissionType2 && formState.commissionType) {
            commissionType2.value = formState.commissionType;
        }
        if (countrySelect2) {
            countrySelect2.value = formState.country || '';
            validateCountryInput(countrySelect2);
        }
    }
}

// Setup Progress Bar Navigation
function setupProgressBarNavigation() {
    document.querySelectorAll('.progress-step').forEach((step) => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            const currentStep = formState.currentPage;
            
            // Only allow navigation to completed or current steps (not future steps)
            if (stepNumber <= currentStep) {
                navigateToStep(stepNumber);
            }
        });
    });
}

// Navigate to a specific step
function navigateToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= 5) {
        formState.currentPage = stepNumber;
        showPage(stepNumber);
        updateProgressBar(stepNumber);
        updateContinueButton(stepNumber);
    }
}

// Update Progress Bar
function updateProgressBar(currentStep) {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNumber = index + 1;
        const circle = step.querySelector('.step-circle');
        const line = step.querySelector('.progress-line');

        circle.classList.remove('active', 'completed');
        if (line) line.classList.remove('completed');
        step.classList.remove('clickable');

        if (stepNumber < currentStep) {
            circle.classList.add('completed');
            if (line) line.classList.add('completed');
            step.classList.add('clickable');
        } else if (stepNumber === currentStep) {
            circle.classList.add('active');
            step.classList.add('clickable');
        }
        // Future steps remain non-clickable (no clickable class added)
    });
}

// Update Continue Button State
function updateContinueButton(pageNumber) {
    let isValid = false;
    let button = null;

    switch(pageNumber) {
        case 1:
            isValid = formState.program !== null;
            button = document.getElementById('continueBtn1');
            break;
        case 2:
            isValid = formState.companyType !== null;
            button = document.getElementById('continueBtn2');
            break;
        case 3:
            isValid = formState.firstName.trim() !== '' &&
                     formState.lastName.trim() !== '' &&
                     formState.email.trim() !== '' &&
                     isValidEmail(formState.email) &&
                     formState.password.length >= 8 &&
                     formState.acceptTerms;
            button = document.getElementById('continueBtn3');
            break;
        case 4:
            let fieldsValid = false;
            if (formState.companyType === 'vacation-rental') {
                fieldsValid = formState.city.trim() !== '' &&
                         formState.country.trim() !== '' &&
                         formState.companyName.trim() !== '' &&
                         formState.commissionType.trim() !== '';
            } else if (['pms', 'venue', 'blog', 'tour-operator', 'transportations', 'other'].includes(formState.companyType)) {
                fieldsValid = formState.city.trim() !== '' &&
                         formState.country.trim() !== '' &&
                         formState.companyName.trim() !== '' &&
                         formState.commissionType.trim() !== '';
            }
            isValid = fieldsValid;
            button = document.getElementById('continueBtn4');
            break;
    }

    if (button) {
        button.disabled = !isValid;
    }
}

// Validation Functions
function validatePage1() {
    return formState.program !== null;
}

function validatePage2() {
    return formState.companyType !== null;
}

function validatePage3() {
    return formState.firstName.trim() !== '' &&
           formState.lastName.trim() !== '' &&
           formState.email.trim() !== '' &&
           isValidEmail(formState.email) &&
           formState.password.length >= 8 &&
           formState.acceptTerms;
}

function validatePage4() {
    let fieldsValid = false;
    if (formState.companyType === 'vacation-rental') {
        fieldsValid = formState.city.trim() !== '' &&
               formState.country.trim() !== '' &&
               formState.companyName.trim() !== '' &&
               formState.commissionType.trim() !== '';
    } else if (['pms', 'venue', 'blog', 'tour-operator', 'transportations', 'other'].includes(formState.companyType)) {
        fieldsValid = formState.city.trim() !== '' &&
               formState.country.trim() !== '' &&
               formState.companyName.trim() !== '' &&
               formState.commissionType.trim() !== '';
    }
    return fieldsValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate Summary
function generateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    const companyTypeLabels = {
        'supply': 'I want to store bags (Supply)',
        'vacation-rental': 'Vacation Rental / STR / Airbnb Host',
        'pms': 'PMS',
        'venue': 'Venue',
        'blog': 'Blog',
        'tour-operator': 'Tour Operator',
        'transportations': 'Transportations',
        'other': 'Other'
    };

    let html = `
        <div class="summary-item">
            <span class="summary-label">Program:</span>
            <span>${formState.program}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Company Type:</span>
            <span>${companyTypeLabels[formState.companyType] || formState.companyType}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Name:</span>
            <span>${formState.firstName} ${formState.lastName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Email:</span>
            <span>${formState.email}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Company Name:</span>
            <span>${formState.companyName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Location:</span>
            <span>${formState.city}, ${formState.country}</span>
        </div>
    `;

    if (formState.companyWebsite) {
        html += `
            <div class="summary-item">
                <span class="summary-label">Website:</span>
                <span>${formState.companyWebsite}</span>
            </div>
        `;
    }

    if (formState.numberOfProperties) {
        html += `
            <div class="summary-item">
                <span class="summary-label">Number of Properties:</span>
                <span>${formState.numberOfProperties}</span>
            </div>
        `;
    }

    if (formState.companyDescription) {
        html += `
            <div class="summary-item">
                <span class="summary-label">Description:</span>
                <span>${formState.companyDescription}</span>
            </div>
        `;
    }

    summaryContent.innerHTML = html;
}

// Handle Skip Demo
async function handleSkipDemo() {
    const skipDemoLink = document.getElementById('skipDemoLink');
    if (skipDemoLink) {
        skipDemoLink.setAttribute('aria-busy', 'true');
        skipDemoLink.style.pointerEvents = 'none';
        skipDemoLink.style.opacity = '0.6';
    }

    try {
        // Complete form submission - send data to Tapfiliate
        console.log('Submitting form to Tapfiliate...');
        const result = await createTapfiliateAffiliate();
        
        if (result && result.success) {
            // Show confirmation page on success
            console.log('Form submitted successfully, showing confirmation page');
            showConfirmationPage();
        } else {
            // API call completed but result indicates failure - still show confirmation page
            console.warn('Form submission had issues, but showing confirmation page anyway:', result);
            showConfirmationPage();
        }
    } catch (error) {
        console.error('Error submitting form to Tapfiliate:', error);
        // Even on error, show confirmation page (user has completed the form)
        console.warn('Error occurred, but showing confirmation page anyway');
        showConfirmationPage();
    } finally {
        // Reset button state
        if (skipDemoLink) {
            skipDemoLink.removeAttribute('aria-busy');
            skipDemoLink.style.pointerEvents = 'auto';
            skipDemoLink.style.opacity = '1';
        }
    }
}

// Show Confirmation Page
function showConfirmationPage() {
    console.log('showConfirmationPage called');
    
    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }
    
    // Hide all form pages except confirmation
    document.querySelectorAll('.form-page').forEach(page => {
        page.classList.remove('active');
        if (page.id !== 'confirmationPage') {
            page.style.display = 'none';
        }
    });
    
    // Show form container
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
    
    // Show confirmation page
    const confirmationPage = document.getElementById('confirmationPage');
    if (confirmationPage) {
        confirmationPage.style.display = 'block';
        confirmationPage.classList.add('active');
        console.log('Confirmation page displayed');
    } else {
        console.error('Confirmation page element not found!');
    }
    
    // Update email in pill - convert to uppercase
    const confirmationEmail = document.getElementById('confirmationEmail');
    if (confirmationEmail) {
        const email = formState.email || 'your.email@example.com';
        confirmationEmail.textContent = email.toUpperCase();
    }
    
    // Hide progress bar
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    
    updateProgressBar(5);
    
    // Scroll to top of page when confirmation page loads
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    console.log('Confirmation page setup complete');
}

// Create affiliate via secure backend endpoint
async function createTapfiliateAffiliate() {
    const companyTypeLabels = {
        'supply': 'I want to store bags (Supply)',
        'vacation-rental': 'Vacation Rental / STR / Airbnb Host',
        'pms': 'PMS',
        'venue': 'Venue',
        'blog': 'Blog',
        'tour-operator': 'Tour Operator',
        'transportations': 'Transportations',
        'other': 'Other'
    };

    const programId = PROGRAM_ID_MAP[formState.program];
    if (!programId) {
        throw new Error('Program selection is missing or invalid.');
    }

    // DO NOT send onboarding_fields - Company Type, Commission Type, and Number of Properties
    // are collected in the form for validation only, but NOT sent to Tapfiliate API
    // Explicitly DO NOT include:
    // - company_type (collected in form but not sent to API)
    // - commission_type (collected in form but not sent to API)
    // - number_of_properties (collected in form but not sent to API)

    // Prepare affiliate data according to Tapfiliate API structure
    // Field mapping: first_name, last_name, email, password, city, country, company
    const affiliatePayload = {
        program: programId,
        first_name: formState.firstName,
        last_name: formState.lastName,
        email: formState.email,
        password: formState.password,
        city: formState.city,
        country: formState.country,
        company: formState.companyName
    };

    // Optional fields
    if (formState.companyDescription) {
        affiliatePayload.company_description = formState.companyDescription;
    }

    if (formState.companyWebsite) {
        affiliatePayload.metadata = { website: formState.companyWebsite };
    }

    // DO NOT add onboarding_fields - Company Type, Commission Type, and Number of Properties
    // are collected in the form for validation only, but NOT sent to Tapfiliate API

    Object.keys(affiliatePayload).forEach((key) => {
        if (affiliatePayload[key] === undefined || affiliatePayload[key] === null) {
            delete affiliatePayload[key];
        }
        if (key === 'metadata' && affiliatePayload.metadata && Object.keys(affiliatePayload.metadata).length === 0) {
            delete affiliatePayload.metadata;
        }
    });

    try {
        console.log('Sending affiliate data to backend:', JSON.stringify(affiliatePayload, null, 2));
        
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(affiliatePayload)
        });

        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        console.log('Backend response status:', response.status);
        console.log('Backend response content-type:', contentType);

        if (!response.ok) {
            // Check if response is HTML (error page)
            if (contentType && contentType.includes('text/html')) {
                console.error('Backend returned HTML error page instead of JSON');
                throw new Error('Something went wrong while creating your affiliate account. Please try again later.');
            }
            
            let errorMessage = 'Something went wrong while creating your affiliate account. Please try again later.';
            
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If not JSON, use generic message
                console.error('Could not parse error response:', responseText);
            }
            
            throw new Error(errorMessage);
        }

        // Parse JSON response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Could not parse success response:', responseText);
            throw new Error('Invalid response from server');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating affiliate:', error);
        throw error;
    }
}

// Terms Modal Functions
function openTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Export form state for debugging (optional)
window.formState = formState;
