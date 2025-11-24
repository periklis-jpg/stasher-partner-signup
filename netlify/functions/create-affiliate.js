// Netlify Serverless Function for Tapfiliate API Integration
// API key must be set as environment variable: TAPFILIATE_API_KEY

const TAPFILIATE_BASE_URL = 'https://api.tapfiliate.com/1.6/';
const PROGRAM_ID_MAP = {
    'USD': 'stasher-affiliates-usd',
    'EUR': 'stasher-affiliate-program-sp',
    'GBP': 'stasher-affiliate-program',
    'AUD': 'jg-affiliate-program'
};

// Helper function to map country names to ISO 3166-1 alpha-2 codes
function getCountryISOCode(countryName) {
    if (!countryName) return 'GB'; // Default to GB if no country
    
    const countryMap = {
        'United Kingdom': 'GB',
        'UK': 'GB',
        'United States': 'US',
        'USA': 'US',
        'US': 'US',
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
        'Poland': 'PL',
        'Portugal': 'PT',
        'Ireland': 'IE',
        'Greece': 'GR',
        'Finland': 'FI',
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
        'Cyprus': 'CY'
    };
    
    // If already a 2-letter code, return as-is (uppercase)
    if (countryName.length === 2) {
        return countryName.toUpperCase();
    }
    
    // Try to find in map (case-insensitive)
    const normalized = countryName.trim();
    for (const [key, code] of Object.entries(countryMap)) {
        if (key.toLowerCase() === normalized.toLowerCase()) {
            return code;
        }
    }
    
    // Default to GB if not found
    return 'GB';
}

// Centralized function to build Tapfiliate affiliate payload
function buildTapfiliatePayload(affiliateData) {
    const countryCode = getCountryISOCode(affiliateData.country);
    
    // Build address object with required structure
    const address = {
        address: 'n/a',
        postal_code: 'n/a',
        city: affiliateData.city || 'n/a',
        country: {
            code: countryCode
        }
    };
    
    // Build company object
    const company = {
        name: affiliateData.company || 'n/a'
    };
    
    // Build the payload according to Tapfiliate API spec
    const payload = {
        firstname: affiliateData.first_name,
        lastname: affiliateData.last_name,
        email: affiliateData.email,
        password: affiliateData.password,
        address: address,
        company: company
    };
    
    // Add optional company_description if present
    if (affiliateData.company_description) {
        payload.company_description = affiliateData.company_description;
    }
    
    // Note: website is NOT sent in custom_fields here
    // It will be set via meta-data endpoint after affiliate creation
    
    // Remove any undefined/null/empty values
    Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if (value === undefined || value === null || value === '') {
            delete payload[key];
        }
    });
    
    return payload;
}

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Get API key from environment variable, with hardcoded fallback
        // ⚠️ WARNING: Hardcoded API key is a security risk. Use environment variables in production.
        // API Key: 0dc9240a6a10036f9a275537b52be14f5e551e12
        const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY || '0dc9240a6a10036f9a275537b52be14f5e551e12';
        
        // Check if API key is set
        if (!TAPFILIATE_API_KEY) {
            console.error('TAPFILIATE_API_KEY is not set!');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Server configuration error: API key not set.' 
                })
            };
        }

        // Parse request body
        const affiliateData = JSON.parse(event.body);
        console.log('Received affiliate data:', JSON.stringify(affiliateData, null, 2));

        const mappedProgramId = PROGRAM_ID_MAP[affiliateData.program] || affiliateData.program;
        if (!mappedProgramId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing or invalid program selection'
                })
            };
        }

        // Validate required fields (using frontend field names)
        const requiredFields = ['first_name', 'last_name', 'email', 'password', 'city', 'country', 'company'];
        const missing = requiredFields.filter((field) => {
            const value = affiliateData[field];
            return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
        });

        if (missing.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: `Missing required fields: ${missing.join(', ')}`
                })
            };
        }

        // DO NOT send onboarding_fields - Company Type, Commission Type, and Number of Properties
        // are collected in the form for validation only, but NOT sent to Tapfiliate API
        // Explicitly DO NOT include:
        // - company_type (collected in form but not sent to API)
        // - commission_type (collected in form but not sent to API)
        // - number_of_properties (collected in form but not sent to API)

        // Build Tapfiliate payload using centralized function
        const tapfiliatePayload = buildTapfiliatePayload(affiliateData);

        // Log the payload (mask sensitive data)
        const logPayload = { ...tapfiliatePayload };
        if (logPayload.password) {
            logPayload.password = '***MASKED***';
        }
        console.log('Tapfiliate payload (password masked):', JSON.stringify(logPayload, null, 2));
        console.log('Program ID (for enrollment):', mappedProgramId);

        // Step 1: Create affiliate in Tapfiliate
        console.log('Creating affiliate in Tapfiliate...');
        console.log('API Endpoint:', `${TAPFILIATE_BASE_URL}affiliates/`);
        console.log('API Key present:', !!TAPFILIATE_API_KEY);
        
        const createResponse = await fetch(`${TAPFILIATE_BASE_URL}affiliates/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': TAPFILIATE_API_KEY
            },
            body: JSON.stringify(tapfiliatePayload)
        });
        
        console.log('Tapfiliate response status:', createResponse.status);

        if (!createResponse.ok) {
            const contentType = createResponse.headers.get('content-type');
            const errorText = await createResponse.text();
            
            // Log error details (trim long responses)
            const trimmedError = errorText.length > 1000 ? errorText.substring(0, 1000) + '...' : errorText;
            console.error('Tapfiliate API error response (trimmed):', trimmedError);
            console.error('Response status:', createResponse.status);
            console.error('Response content-type:', contentType);
            
            // Check if response is HTML (error page)
            if (contentType && contentType.includes('text/html')) {
                console.error('Tapfiliate returned HTML error page instead of JSON');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Something went wrong while creating your affiliate account. Please try again later.',
                        status: createResponse.status
                    })
                };
            }
            
            let errorMessage = 'Failed to create affiliate';
            
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.errors && Array.isArray(errorJson.errors)) {
                    errorMessage = errorJson.errors.map(e => e.message || e).join(', ');
                } else if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                // If not JSON, it might be HTML or plain text
                errorMessage = 'Something went wrong while creating your affiliate account. Please try again later.';
            }

            return {
                statusCode: createResponse.status,
                headers,
                body: JSON.stringify({ 
                    error: errorMessage,
                    status: createResponse.status
                })
            };
        }

        const affiliate = await createResponse.json();

        if (!affiliate || !affiliate.id) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid response from Tapfiliate API' 
                })
            };
        }

        // Step 1.5: Set website as meta-data if provided
        if (affiliateData.metadata && affiliateData.metadata.website) {
            try {
                console.log('Setting affiliate website meta data...');
                const metaUrl = `${TAPFILIATE_BASE_URL}affiliates/${affiliate.id}/meta-data/website/`;
                const metaBody = { value: affiliateData.metadata.website };

                const metaResponse = await fetch(metaUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': TAPFILIATE_API_KEY
                    },
                    body: JSON.stringify(metaBody)
                });

                console.log('Website meta data response status:', metaResponse.status);

                if (!metaResponse.ok) {
                    const metaText = await metaResponse.text();
                    const trimmedMeta = metaText.length > 1000 ? metaText.substring(0, 1000) + '...' : metaText;
                    console.error('Failed to set website meta data (trimmed):', trimmedMeta);
                }
            } catch (metaError) {
                console.error('Error while setting website meta data:', metaError);
            }
        }

        // Step 2: Enroll affiliate in program (Pending status, not auto-approved)
        console.log('Enrolling affiliate in program:', mappedProgramId);
        console.log('Affiliate ID:', affiliate.id);
        
        // Enrollment payload according to Tapfiliate API docs
        const enrollmentPayload = {
            affiliate: {
                id: affiliate.id
            },
            approved: null
        };
        
        console.log('Enrollment payload:', JSON.stringify(enrollmentPayload, null, 2));
        console.log('Enrollment endpoint:', `${TAPFILIATE_BASE_URL}programs/${mappedProgramId}/affiliates/?send_welcome_email=false`);
        
        const addToProgramResponse = await fetch(
            `${TAPFILIATE_BASE_URL}programs/${mappedProgramId}/affiliates/?send_welcome_email=false`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': TAPFILIATE_API_KEY
                },
                body: JSON.stringify(enrollmentPayload)
            }
        );

        console.log('Enrollment response status:', addToProgramResponse.status);

        if (!addToProgramResponse.ok) {
            const contentType = addToProgramResponse.headers.get('content-type');
            const errorText = await addToProgramResponse.text();
            
            // Log error details (trim long responses)
            const trimmedError = errorText.length > 1000 ? errorText.substring(0, 1000) + '...' : errorText;
            console.error('Failed to enroll affiliate in program (trimmed):', trimmedError);
            console.error('Response status:', addToProgramResponse.status);
            console.error('Response content-type:', contentType);
            
            // Check if response is HTML (error page)
            if (contentType && contentType.includes('text/html')) {
                console.error('Tapfiliate returned HTML error page instead of JSON');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'Something went wrong while creating your affiliate account. Please try again later.',
                        status: addToProgramResponse.status
                    })
                };
            }
            
            return {
                statusCode: addToProgramResponse.status || 500,
                headers,
                body: JSON.stringify({
                    error: 'Affiliate created but failed to enroll in program.',
                    status: addToProgramResponse.status
                })
            };
        }

        const programResult = await addToProgramResponse.json();

        // Success - affiliate created and added to program (should be in Pending status)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                affiliate: affiliate,
                program: programResult
            })
        };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
