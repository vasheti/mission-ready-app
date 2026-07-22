# GoHighLevel Implementation Notes

These rules were confirmed against the Well Balanced Fundraising OS™ location during the July 22, 2026 demo build.

## Confirmed API Behaviors

### Monetary field enum

GoHighLevel accepts the misspelled enum value `MONETORY`, not `MONETARY`.

Use `MONETORY` for:

- Total Lifetime Giving
- First Gift Amount
- Last Gift Amount

Do not normalize or silently correct this value in middleware.

### Single-option values

`SINGLE_OPTIONS` choices must be sent as plain strings.

Accepted:

```json
["Prospect", "Donor", "Recurring Donor", "Lapsed"]
```

Rejected:

```json
[{"label": "Prospect"}]
```

### Attention Flag behavior

GHL `CHECKBOX` behaves as a multi-select rather than a boolean toggle.

For the demo, Attention Flag uses:

- data type: `RADIO`
- options: `["Yes", "No"]`
- stored values: `"Yes"` or `"No"`

Workflow conditions must compare against those exact string values.

## Contact Merge Keys

| Field | Merge Key |
|---|---|
| Donor Status | `{{contact.donor_status}}` |
| Total Lifetime Giving | `{{contact.total_lifetime_giving}}` |
| First Gift Date | `{{contact.first_gift_date}}` |
| First Gift Amount | `{{contact.first_gift_amount}}` |
| Last Gift Date | `{{contact.last_gift_date}}` |
| Last Gift Amount | `{{contact.last_gift_amount}}` |
| Assigned Journey | `{{contact.assigned_journey}}` |
| Primary Relationship Owner | `{{contact.primary_relationship_owner}}` |
| Attention Flag | `{{contact.attention_flag}}` |

## Demo Safety

- Use fictional donor records only.
- Never commit GHL tokens or location credentials.
- Treat custom object associations as the donor link rather than duplicating contact PII inside object fields.
