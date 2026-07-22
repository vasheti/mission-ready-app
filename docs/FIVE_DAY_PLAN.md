# Mission Ready™ — Five-Day Workshop Sprint

## Sprint Goal

Create a reliable, eight-minute demonstration for the July 27 Get More Donors workshop that shows the core donor journey and supports a founding-cohort invitation.

## Wednesday, July 22 — Day 1: Foundation

### Outcome

The repository, data model, credentials plan, and GHL structure are defined and ready for automation.

### Deliverables

- Repository initialized.
- Master Build Brief committed.
- Environment-variable template committed.
- GHL access confirmed.
- OpenAI access confirmed.
- Hosting selected.
- Nine donor fields created or mapped.
- Journey Enrollment object created.
- AI Output object created.
- One fictional donor created and verified.

### Stop Rule

Do not begin workflow automation until one donor record visibly supports:

- donor status,
- gift information,
- journey assignment,
- relationship owner,
- attention flag,
- Journey Enrollment,
- AI Output capability.

## Thursday, July 23 — Day 2: One Automation

### Outcome

One donor moves automatically from first gift to active stewardship.

### Build

- Trigger when first gift information is recorded.
- Update Donor Status.
- Create Journey Enrollment.
- Assign Journey Stage.
- Populate Next Action.
- Send a webhook payload to middleware or a controlled test endpoint.

### Success Test

```text
Enter first gift
→ donor status becomes Donor
→ Journey Enrollment is created
→ Next Action appears
```

## Friday, July 24 — Day 3: Two AI Outputs

### Outcome

Mission Ready™ generates and saves useful, editable donor communications.

### Build

- Personalized welcome message.
- Impact stewardship update.
- Save output to the donor record or AI Output object.
- Make output visible for staff review.
- Preserve a pre-generated fallback.

### Guardrail

No automated sending is required. Human review remains part of the demonstration.

## Saturday, July 25 — Day 4: Demo Data and Stabilization

### Outcome

The demonstration environment feels believable and survives repeated testing.

### Demo Records

- Jordan — Prospect.
- Monica — First-time donor and live demo record.
- Alicia — Donor awaiting stewardship.
- Danielle — Recurring donor.

### Additional Data

- Two fictional impact records.
- One recurring donor example.
- Pre-generated welcome and impact messages.

### Testing

- Run the live flow repeatedly.
- Test missing-field behavior.
- Confirm records are easy to find.
- Fix only issues that threaten the workshop demonstration.

## Sunday, July 26 — Day 5: Freeze and Rehearse

### Outcome

The demonstration is presentation-ready with backups.

### Work

- Add no new features.
- Write the click-by-click demo script.
- Rehearse under eight minutes.
- Record a backup walkthrough.
- Capture screenshots.
- Prepare a slide-based fallback.

### Fallback Levels

1. Live workflow.
2. Pre-seeded completed donor record.
3. Screenshots or recorded walkthrough.

## Monday, July 27 — Workshop

### Workshop Job

Show that nonprofit fundraising can feel more thoughtful, organized, and sustainable.

### Demonstrate

- a donor entering the system,
- a gift initiating a journey,
- personalized stewardship support,
- a clear staff next action,
- a path toward ongoing impact communication.

### Offer

Invite aligned attendees into the Mission Ready™ Founding Cohort for hands-on implementation and product co-creation.

## Deferred Until After the Workshop

- public SaaS architecture,
- production authentication,
- multi-tenancy,
- multiple CRM connectors,
- payment processing,
- advanced analytics,
- full reporting suite,
- extensive permissions,
- complete workflow library,
- polished public dashboard.
