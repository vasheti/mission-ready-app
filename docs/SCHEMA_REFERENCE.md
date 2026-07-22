# Mission Ready™ Canonical Middleware Schema

These table names are locked for all middleware code, SQL, tests, and documentation.

| Purpose | Canonical table name |
|---|---|
| General event and audit store | `integration_logs` |
| OpenAI pipeline job tracker | `ai_generation_jobs` |
| Incoming webhook event store | `webhook_events` |

## Deprecated draft names

Do not use these names in future work:

- `audit_log`
- `ai_output_jobs`

The previously approved column definitions still apply. Only the table names changed.

## Middleware rule

Every query, insert, update, foreign-key reference, test fixture, and documentation example must use:

```text
integration_logs
ai_generation_jobs
webhook_events
```
