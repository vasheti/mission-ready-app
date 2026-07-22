# Day 1 Production Checklist

**Date:** Wednesday, July 22, 2026  
**Goal:** Complete the Mission Ready™ demo foundation before building automation.

## A. Repository Foundation

- [x] Create public repository: `vasheti/mission-ready-app`
- [x] Add `README.md`
- [x] Add `docs/MASTER_BUILD_BRIEF.md`
- [x] Add `docs/FIVE_DAY_PLAN.md`
- [x] Add `docs/DAY_1_CHECKLIST.md`
- [x] Add `.env.example`
- [ ] Add `.gitignore`
- [ ] Decide whether a license is needed before broader public promotion

## B. Credentials and Services

Record only status here. Never paste secrets into this document.

- [ ] Confirm GoHighLevel Location ID is available
- [ ] Confirm GoHighLevel API access token or approved authentication method
- [ ] Confirm OpenAI API key is available
- [ ] Select middleware host: Render, Railway, or another approved option
- [ ] Create hosting project
- [ ] Add environment variables in the hosting dashboard
- [ ] Confirm a public HTTPS webhook URL can be created

## C. Donor Field Setup in GoHighLevel

Create or map the following fields. Use native GHL fields where they already meet the need.

- [ ] Donor Status
  - Prospect
  - First-Time Donor
  - Donor
  - Recurring Donor
  - Lapsed Donor
- [ ] First Gift Date
- [ ] Last Gift Date
- [ ] Last Gift Amount
- [ ] Lifetime Giving
- [ ] Journey Stage
- [ ] Next Action
- [ ] Relationship Owner
- [ ] Attention Flag

### Field Verification

For each field:

- [ ] Clear label
- [ ] Correct field type
- [ ] Appropriate options
- [ ] Visible on the contact record
- [ ] Editable by the demo user
- [ ] No duplicate field created unnecessarily

## D. Journey Enrollment Object

Create a custom object if supported by the selected GHL configuration. If custom objects are unavailable or impractical for the demo account, document the fallback implementation before proceeding.

Suggested fields:

- [ ] Contact / Donor relationship
- [ ] Journey Name
- [ ] Journey Stage
- [ ] Enrollment Date
- [ ] Status
- [ ] Next Action
- [ ] Next Action Due Date
- [ ] Relationship Owner
- [ ] Last Completed Action
- [ ] Notes

### Suggested Status Options

- Active
- Paused
- Completed
- Cancelled

## E. AI Output Object

Suggested fields:

- [ ] Contact / Donor relationship
- [ ] Output Type
- [ ] Output Status
- [ ] Generated Content
- [ ] Generated Date
- [ ] Prompt Version
- [ ] Reviewed By
- [ ] Reviewed Date
- [ ] Source Context
- [ ] Error / Retry Notes

### Suggested Output Types

- Welcome Message
- Impact Update

### Suggested Output Statuses

- Draft
- Approved
- Used
- Archived

## F. Create the First Demo Donor

Use fictional data only.

### Monica — First-Time Donor

- [ ] First name: Monica
- [ ] Fictional surname selected
- [ ] Clearly fake email address or non-deliverable test address
- [ ] Donor Status visible
- [ ] First Gift Date visible
- [ ] Last Gift Date visible
- [ ] Last Gift Amount visible
- [ ] Lifetime Giving visible
- [ ] Journey Stage visible
- [ ] Next Action visible
- [ ] Relationship Owner visible
- [ ] Attention Flag visible
- [ ] Journey Enrollment can be linked
- [ ] AI Output can be linked

## G. Day 1 Acceptance Test

Day 1 is complete only when one fictional donor record visibly supports all of the following:

- [ ] Donor status
- [ ] Gift information
- [ ] Journey assignment
- [ ] Relationship owner
- [ ] Attention flag
- [ ] Journey Enrollment
- [ ] AI Output capability

## H. Day 1 Stop Rule

Do **not** build the first-gift automation until the Day 1 Acceptance Test passes.

## I. Deferred-Idea Parking Lot

Add ideas here instead of expanding today’s scope.

- [ ] Public user authentication
- [ ] Multi-tenant nonprofit accounts
- [ ] Additional CRM integrations
- [ ] Payment processing
- [ ] Advanced reporting
- [ ] Board engagement module
- [ ] Grant management module
- [ ] Full nonprofit operating-system roadmap
