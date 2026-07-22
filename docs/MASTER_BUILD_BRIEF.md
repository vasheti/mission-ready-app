# Mission Ready™ — Master Build Brief

## Purpose

Mission Ready™ helps nonprofits move donors through intentional, relationship-centered stewardship journeys so opportunities do not fall through the cracks.

## July 27 Workshop Objective

The workshop demonstration does **not** need to prove that a complete SaaS platform is finished. It needs to prove that the core donor journey is valuable, believable, and worth implementing.

The audience should see a donor:

1. Enter the system.
2. Make a first gift.
3. Become enrolled in a donor journey.
4. Receive a personalized welcome message.
5. Surface a clear next action for staff.
6. Receive an impact-oriented stewardship update.

The desired audience reaction is:

> “I need this in my organization.”

## Demo User

A nonprofit executive director, development director, or small fundraising team that:

- lacks a consistent donor follow-up process,
- relies on memory or disconnected spreadsheets,
- feels overwhelmed by donor stewardship,
- wants AI assistance without losing humanity or control,
- needs a practical system that supports—not replaces—relationships.

## Demo Story

A fictional nonprofit records Monica’s first gift. Mission Ready™ recognizes her as a donor, assigns the appropriate journey, prepares an editable welcome message, displays the next recommended action, and creates the foundation for a later impact update.

## Core Demo Flow

```text
Donor added or selected
        ↓
First gift recorded
        ↓
Donor status updated
        ↓
Journey Enrollment created
        ↓
Next Action assigned
        ↓
Personalized welcome generated
        ↓
Staff reviews or edits output
        ↓
Engagement and impact stewardship continue
```

## Required Demo Capabilities

### GoHighLevel

GoHighLevel is the visible demonstration interface for this sprint.

It must support:

- donor records,
- gift information,
- donor status,
- journey assignment,
- relationship ownership,
- next action visibility,
- Journey Enrollment records,
- AI Output records,
- timeline or note visibility where practical.

### Middleware

A lightweight middleware service will eventually:

- receive webhook data from GHL,
- validate required inputs,
- call the OpenAI API,
- return structured AI output,
- save or route output back to GHL,
- log errors without exposing secrets.

### AI Outputs Included in the Workshop Demo

Only two AI-assisted outputs are required:

1. Personalized first-gift welcome message.
2. Impact stewardship update.

Both outputs must remain editable and should be presented as staff-assistance tools, not unsupervised donor communications.

## Day 1 Data Model

### Donor / Contact Custom Fields

The initial nine-field demo model is:

| Field | Suggested Type | Purpose |
|---|---|---|
| Donor Status | Dropdown | Prospect, First-Time Donor, Donor, Recurring Donor, Lapsed Donor |
| First Gift Date | Date | Starts the first-gift journey |
| Last Gift Date | Date | Supports stewardship timing |
| Last Gift Amount | Currency/Number | Personalization and segmentation |
| Lifetime Giving | Currency/Number | Relationship context |
| Journey Stage | Dropdown | Current stewardship stage |
| Next Action | Single-line or long text | Visible staff recommendation |
| Relationship Owner | User or text | Accountability |
| Attention Flag | Checkbox or dropdown | Surfaces records needing attention |

Use existing native GHL fields where appropriate rather than duplicating them.

### Journey Enrollment Object

Suggested fields:

| Field | Purpose |
|---|---|
| Contact / Donor | Links enrollment to donor |
| Journey Name | Identifies the assigned journey |
| Journey Stage | Current stage |
| Enrollment Date | Start date |
| Status | Active, Paused, Completed, Cancelled |
| Next Action | Staff-facing action |
| Next Action Due Date | Follow-up timing |
| Relationship Owner | Accountability |
| Last Completed Action | History |
| Notes | Context |

### AI Output Object

Suggested fields:

| Field | Purpose |
|---|---|
| Contact / Donor | Links output to donor |
| Output Type | Welcome Message or Impact Update |
| Output Status | Draft, Approved, Used, Archived |
| Generated Content | Editable AI output |
| Generated Date | Audit context |
| Prompt Version | Reproducibility |
| Reviewed By | Human oversight |
| Reviewed Date | Human oversight |
| Source Context | Gift, impact, or journey information used |
| Error / Retry Notes | Troubleshooting |

## Demo Data

Use fictional or clearly designated test records only.

Planned donor examples:

- Jordan — Prospect.
- Monica — First-time donor and live demonstration record.
- Alicia — Donor awaiting stewardship.
- Danielle — Recurring donor.

## Non-Goals Before July 27

The following are explicitly deferred:

- production authentication,
- multi-tenant accounts,
- complete public SaaS frontend,
- payment processing,
- broad CRM integrations,
- advanced analytics,
- full permissions architecture,
- complex audit controls,
- every possible donor journey,
- automated sending without review,
- production-grade reporting.

## Scope Rule

Every proposed task must pass this test:

> Does this directly help the eight-minute demonstration work or help the founding-cohort offer sell?

If not, place it in the post-workshop backlog.

## Workshop Offer Positioning

Mission Ready™ should be positioned as a founding implementation opportunity—not as finished software.

Suggested framing:

> Join the Mission Ready™ Founding Cohort and install a donor journey and stewardship system designed around your organization—with the platform, templates, AI tools, and hands-on implementation support included.

## Workshop Success Criteria

The sprint succeeds when:

- the donor journey is easy to understand,
- the demonstration is reliable or has a reliable fallback,
- the audience sees thoughtful stewardship rather than generic automation,
- attendees express interest in implementation,
- real feedback is captured for the post-workshop roadmap.

## Long-Term Direction

The intended long-term architecture is:

```text
Mission Ready™ application and database
        ↓
Optional CRM integrations, including GHL
```

GHL is the demonstration interface for this sprint, not the permanent source of truth for the future public SaaS.
