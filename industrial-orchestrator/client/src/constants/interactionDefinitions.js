export const ROLES = {
    INVESTOR: 'Investor',
    DEVELOPER: 'Developer',
    CONTRACTOR: 'Contractor',
    LEGAL: 'Legal',
    MANPOWER: 'Manpower',
    BANK: 'Bank'
};

export const INTERACTION_TYPES = {
    PROPOSE_PROJECT: 'Propose Project',
    REQUEST_FUNDING: 'Request Funding',
    SUBMIT_BID: 'Submit Bid',
    REQUEST_BID: 'Request Bid',
    DRAFT_CONTRACT: 'Draft Contract',
    REVIEW_CONTRACT: 'Review Contract',
    HIRE_MANPOWER: 'Hire Manpower',
    REQUEST_LOAN: 'Request Loan'
};

export const INTERACTION_SCHEMAS = {
    [INTERACTION_TYPES.PROPOSE_PROJECT]: [
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'location', label: 'Location', type: 'select', options: ['Jakarta', 'Surabaya', 'Bali', 'Bandung', 'Medan', 'Other'], required: true },
        { name: 'duration', label: 'Duration', type: 'select', options: ['1-3 months', '3-6 months', '6-12 months', '> 1 year'], required: true },
        { name: 'budget', label: 'Budget Estimate', type: 'select', options: ['< $10k', '$10k - $50k', '$50k - $100k', '$100k - $500k', '> $500k'], required: true }
    ],
    [INTERACTION_TYPES.REQUEST_FUNDING]: [
        { name: 'amount', label: 'Amount Needed', type: 'number', required: true },
        { name: 'equity', label: 'Equity Offered (%)', type: 'number', required: true },
        { name: 'roi', label: 'ROI Projection (%)', type: 'number', required: true },
        { name: 'description', label: 'Use of Funds', type: 'textarea', required: true }
    ],
    [INTERACTION_TYPES.SUBMIT_BID]: [
        { name: 'bid_amount', label: 'Bid Amount', type: 'number', required: true },
        { name: 'completion_date', label: 'Estimated Completion Date', type: 'date', required: true },
        { name: 'materials_included', label: 'Materials Included?', type: 'select', options: ['Yes', 'No'], required: true }
    ],
    [INTERACTION_TYPES.REQUEST_BID]: [
        { name: 'scope', label: 'Project Scope', type: 'textarea', required: true },
        { name: 'deadline', label: 'Bid Deadline', type: 'date', required: true }
    ],
    [INTERACTION_TYPES.DRAFT_CONTRACT]: [
        { name: 'contract_value', label: 'Contract Value', type: 'number', required: true },
        { name: 'terms', label: 'Terms & Conditions', type: 'textarea', required: true },
        { name: 'valid_until', label: 'Valid Until', type: 'date', required: true }
    ],
    [INTERACTION_TYPES.HIRE_MANPOWER]: [
        { name: 'role_type', label: 'Role Type', type: 'select', options: ['General Labor', 'Mason', 'Electrician', 'Plumber', 'Carpenter', 'Supervisor'], required: true },
        { name: 'headcount', label: 'Headcount Needed', type: 'number', required: true },
        { name: 'duration_weeks', label: 'Duration', type: 'select', options: ['1 week', '2-4 weeks', '1-3 months', '> 3 months'], required: true }
    ],
    [INTERACTION_TYPES.REQUEST_LOAN]: [
        { name: 'loan_amount', label: 'Loan Amount', type: 'number', required: true },
        { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number', required: true },
        { name: 'collateral', label: 'Collateral', type: 'select', options: ['Real Estate', 'Vehicle', 'Equipment', 'Invotory', 'None'], required: true }
    ],
    [INTERACTION_TYPES.REVIEW_CONTRACT]: [
        { name: 'comments', label: 'Review Comments', type: 'textarea', required: true }
    ]
};

export const INTERACTION_STEPS = {
    [INTERACTION_TYPES.PROPOSE_PROJECT]: [
        'Initial Proposal Sent',
        'Requirements Review',
        'Feasibility Study',
        'Commercial Terms Negotiation',
        'Final Approval'
    ],
    [INTERACTION_TYPES.REQUEST_FUNDING]: [
        'Funding Request Submitted',
        'Investor Due Diligence',
        'Pitch Presentation',
        'Term Sheet Negotiation',
        'Disbursement'
    ],
    [INTERACTION_TYPES.SUBMIT_BID]: [
        'Bid Submitted',
        'Technical Review',
        'Price Comparison',
        'Vendor Selection',
        'PO Issued'
    ],
    [INTERACTION_TYPES.REQUEST_BID]: [
        'Tender Published',
        'Q&A Session',
        'Bid Submission Period',
        'Evaluation',
        'Awarding'
    ],
    [INTERACTION_TYPES.DRAFT_CONTRACT]: [
        'Drafting Started',
        'Legal Review',
        'Version 2 Revision',
        'Final Signing',
        'Execution'
    ],
    [INTERACTION_TYPES.HIRE_MANPOWER]: [
        'Role Request',
        'Mobilization Planning',
        'Worker Selection',
        'Onboarding',
        'Deployment'
    ],
    [INTERACTION_TYPES.REQUEST_LOAN]: [
        'Loan Application',
        'Credit Assessment',
        'Collateral Valuation',
        'Offer Letter issued',
        'Drawdown'
    ],
    [INTERACTION_TYPES.REVIEW_CONTRACT]: [
        'Contract Received',
        'Stakeholder Review',
        'Feedback Shared',
        'Revision Request',
        'Accepted'
    ]
};

export const PROFILE_SCHEMAS = {
    [ROLES.INVESTOR]: [
        { name: 'ticket_size', label: 'Investment Ticket Size', type: 'select', options: ['< $50k', '$50k - $200k', '$200k - $1M', '> $1M'] },
        { name: 'asset_preference', label: 'Preferred Asset Classes', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use'] },
        { name: 'liquidity', label: 'Liquid Capital Available', type: 'number' }
    ],
    [ROLES.DEVELOPER]: [
        { name: 'specialization', label: 'Specialization', type: 'select', options: ['High-rise', 'Residential Cluster', 'Commercial Complex', 'Mixed-use', 'Industrial'], required: true },
        { name: 'years_experience', label: 'Years of Experience', type: 'number' },
        { name: 'website', label: 'Portfolio Website', type: 'text' }
    ],
    [ROLES.CONTRACTOR]: [
        { name: 'capabilities', label: 'Construction Capabilities', type: 'select', options: ['General Contracting', 'MEP', 'Civil Works', 'Interior Fit-out', 'Infrastructure'], required: true },
        { name: 'manpower_size', label: 'Total Manpower', type: 'number' },
        { name: 'license_no', label: 'License Number', type: 'text' }
    ],
    [ROLES.LEGAL]: [
        { name: 'firm_name', label: 'Firm Name', type: 'text' },
        { name: 'bar_license', label: 'Bar License No', type: 'text' },
        { name: 'specialties', label: 'Specialties', type: 'select', options: ['Property Law', 'Corporate Law', 'Contract Law', 'Litigation'] }
    ],
    [ROLES.MANPOWER]: [
        { name: 'trades_available', label: 'Trades Available', type: 'select', options: ['General Labor', 'Mason', 'Electrician', 'Plumber', 'Carpenter', 'Welder'] },
        { name: 'mobilization_speed', label: 'Mobilization Speed (days)', type: 'number' }
    ],
    [ROLES.BANK]: [
        { name: 'loan_products', label: 'Key Loan Products', type: 'select', options: ['Construction Loan', 'Mortgage', 'Bridge Loan', 'Working Capital'] },
        { name: 'min_interest_rate', label: 'Min. Interest Rate (%)', type: 'number' }
    ]
};

// matrix[UserRole][TargetRole] = [Allowed Actions]
export const RELATIONSHIP_MATRIX = {
    [ROLES.INVESTOR]: {
        [ROLES.DEVELOPER]: [INTERACTION_TYPES.REQUEST_FUNDING, INTERACTION_TYPES.REVIEW_CONTRACT],
        [ROLES.LEGAL]: [INTERACTION_TYPES.DRAFT_CONTRACT],
    },
    [ROLES.DEVELOPER]: {
        [ROLES.INVESTOR]: [INTERACTION_TYPES.PROPOSE_PROJECT, INTERACTION_TYPES.DRAFT_CONTRACT],
        [ROLES.CONTRACTOR]: [INTERACTION_TYPES.REQUEST_BID],
        [ROLES.LEGAL]: [INTERACTION_TYPES.DRAFT_CONTRACT],
        [ROLES.BANK]: [INTERACTION_TYPES.REQUEST_LOAN],
    },
    [ROLES.CONTRACTOR]: {
        [ROLES.DEVELOPER]: [INTERACTION_TYPES.SUBMIT_BID],
        [ROLES.MANPOWER]: [INTERACTION_TYPES.HIRE_MANPOWER],
    },
    [ROLES.LEGAL]: {
        [ROLES.INVESTOR]: [INTERACTION_TYPES.REVIEW_CONTRACT],
        [ROLES.DEVELOPER]: [INTERACTION_TYPES.REVIEW_CONTRACT],
        [ROLES.CONTRACTOR]: [INTERACTION_TYPES.REVIEW_CONTRACT],
    },
    [ROLES.MANPOWER]: {
        [ROLES.CONTRACTOR]: [INTERACTION_TYPES.SUBMIT_BID],
    },
    [ROLES.BANK]: {
        [ROLES.DEVELOPER]: [INTERACTION_TYPES.REVIEW_CONTRACT],
    }
};

export const getAvailableInteractions = (userRole, targetRole) => {
    if (!userRole || !targetRole) return [];

    // Helper to normalize string to Title Case (e.g. "investor" -> "Investor")
    // or just match case-insensitively against keys
    const normalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const userRoleKey = Object.keys(RELATIONSHIP_MATRIX).find(key =>
        key.toLowerCase() === userRole.toLowerCase()
    );

    if (!userRoleKey) return [];

    const roleInteractions = RELATIONSHIP_MATRIX[userRoleKey];

    const targetRoleKey = Object.keys(roleInteractions).find(key =>
        key.toLowerCase() === targetRole.toLowerCase()
    );

    return roleInteractions[targetRoleKey] || [];
};
