const INTERACTION_TYPES = {
    PROPOSE_PROJECT: 'Propose Project',
    REQUEST_FUNDING: 'Request Funding',
    SUBMIT_BID: 'Submit Bid',
    REQUEST_BID: 'Request Bid',
    DRAFT_CONTRACT: 'Draft Contract',
    REVIEW_CONTRACT: 'Review Contract',
    HIRE_MANPOWER: 'Hire Manpower',
    REQUEST_LOAN: 'Request Loan'
};

const INTERACTION_STEPS = {
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

module.exports = { INTERACTION_TYPES, INTERACTION_STEPS };
