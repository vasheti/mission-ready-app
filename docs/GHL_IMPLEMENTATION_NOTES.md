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

### V1 single-option values

For the V1 endpoint `POST /locations/{id}/customFields`, `SINGLE_OPTIONS` choices must be sent as plain strings.

Accepted:

```json
["Prospect", "Donor", "Recurring Donor", "Lapsed"]
```

Rejected:

```json
[{"label": "Prospect"}]
```

### V2 custom-object option values

For the V2 endpoint `POST /custom-fields/`, option values must be objects containing both `label` and `key`.

Accepted:

```json
[
  {"label": "Active", "key": "active"},
  {"label": "Recurring Donor", "key": "recurring_donor"}
]
```

The `key` is mandatory. Use the normalized pattern:

- lowercase
- spaces converted to underscores
- punctuation omitted where possible

### Attention Flag behavior

GHL `CHECKBOX` behaves as a multi-select rather than a boolean toggle.

For the demo, Attention Flag uses:

- data type: `RADIO`
- options: `["Yes", "No"]`
- stored values: `"Yes"` or `"No"`

Workflow conditions must compare against those exact string values.

### Native custom-object associations

Journey Enrollment records link to contacts through GHL's native Associations interface on both records.

Do not create duplicate donor-name, donor-email, donor-phone, or contact-ID custom fields solely to represent this relationship.

### Primary display property restrictions

`primaryDisplayPropertyDetails` accepts only:

- `name`
- `dataType`
- `key`

Adding properties such as `placeholder` or `description` returns a 422 response.

### Object creation side effects

Creating a custom object automatically creates:

1. the primary display field, and
2. a parent custom-field folder.

For each new object:

1. Create the object with its primary display property.
2. Call `GET /custom-fields/object-key/{key}`.
3. Capture the returned folder ID.
4. Use that folder ID as `parentId` for every subsequent field created on the object.

Do not attempt to recreate the primary display field as a separate custom field.

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
