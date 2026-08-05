# Key Rotation Guide

This guide covers how to rotate environment keys.
For keys with rake tasks, the task header contains the exact setup steps —
this guide covers the full picture including impact, ordering, and special cases.

```
lib/key_rotation/
├── KEY_ROTATION_GUIDE.md              ← this file
├── invitation_token_verifier.rb       ← shared verifier used during SECRET_KEY_BASE rotation
└── jwt_verifier.rb                    ← JWT fallback verifier used during ENCRYPTED_KEY rotation

lib/tasks/key_rotation/
├── rotate_encrypted_key.rake          ← ENCRYPTED_KEY
├── rotate_hogan_encrypted_key.rake    ← HOGAN_ENCRYPTED_KEY
├── rotate_secret_token_for_generate.rake ← SECRET_TOKEN_FOR_GENERATE
└── rotate_devise_secret_key.rake      ← DEVISE_SECRET_KEY
```

---

## Keys with rake tasks

### ENCRYPTED_KEY

**What it protects:** `attr_encrypted` columns across multiple models
(`ApiKey#token`, `Campaign#pdf_password`, `SmtpSetting#password`,
`ClientAuditlogExportSetting#s3_secret_access_key`,
`WebhookSystem::Subscription` — 4 columns) and `Encryptor`-encrypted columns
(`SamlServiceProvider`, `Integration` config).

Also used as the JWT signing secret for partner integrations (Pearson, SkillVue,
Simulation, LTI, IIHT, Saville, Examus, mobile verification).

**Key format:** `SecureRandom.base64(32)` — must decode to 32 bytes.

**Rake task:** See header in `rotate_encrypted_key.rake` for setup steps.

**JWT tokens in-flight:** Add `PREV_ENCRYPTED_KEY` to Heroku config alongside
`ENCRYPTED_KEY` to keep accepting JWTs signed with the old key during the
rotation window. `JwtAuthenticator#decode_with_encrypted_key_fallback` reads
both. Remove `PREV_ENCRYPTED_KEY` once in-flight tokens have expired.

---

### HOGAN_ENCRYPTED_KEY

**What it protects:** `HoganCredential#password` — Hogan assessment platform
credentials stored per user.

**Key format:** `SecureRandom.base64(32)` — must decode to 32 bytes.

**Rake task:** See header in `rotate_hogan_encrypted_key.rake` for setup steps.

---

### SECRET_TOKEN_FOR_GENERATE

**What it protects:** `User#encrypted_invitation_raw` — tamper-proof envelope
around raw Devise invitation tokens. Used by `FindOrCreateInvitationToken` and
`CommunicationEmailMailer` to verify tokens before sending invitation emails.

**Key format:** `SecureRandom.hex(64)` — plain string used as salt.

**Rotation order constraint — read before rotating:**

`encrypted_invitation_raw` is derived from **both** `SECRET_KEY_BASE` (root)
and `SECRET_TOKEN_FOR_GENERATE` (salt). The rake task builds the old verifier
using `Rails.application.message_verifier` which always uses the **current**
`SECRET_KEY_BASE` as root.

**Always rotate `SECRET_TOKEN_FOR_GENERATE` before `SECRET_KEY_BASE`.**
If `SECRET_KEY_BASE` is changed first, the rake task will fail to verify any
existing tokens and skip all users as unrecoverable.

**Rake task:** See header in `rotate_secret_token_for_generate.rake` for setup steps.

---

### DEVISE_SECRET_KEY

**What it protects:** Devise token digests — `invitation_token`,
`reset_password_token`, `confirmation_token`, `unlock_token`. When
`DEVISE_SECRET_KEY` changes, Devise's `token_generator` produces different
digests for the same raw token, invalidating all pending Devise tokens in
the database.

**Key format:** `SecureRandom.hex(64)` — plain string.

**Impact:**

| What | Impact |
|---|---|
| Pending invitation links | `invitation_token` digest no longer matches — link returns invalid token error |
| Pending password reset emails | `reset_password_token` digest no longer matches — link returns invalid token error |
| Pending confirmation emails | `confirmation_token` digest no longer matches |
| Pending unlock emails | `unlock_token` digest no longer matches |
| Active sessions | **Not affected** — sessions use `SECRET_KEY_BASE`, not `DEVISE_SECRET_KEY` |
| `encrypted_invitation_raw` | **Not affected** — signed by `SECRET_TOKEN_FOR_GENERATE`, not `DEVISE_SECRET_KEY` |

**No ordering dependency with other keys.**
`DEVISE_SECRET_KEY` only affects `Devise.token_generator.digest`. It has no
effect on `message_verifier`, `encrypted_invitation_raw`, or session cookies.
Rotate it independently at any time.

**Unlike other keys — update env var first, then run the rake task.**
The task re-hashes `invitation_token` using the new `DEVISE_SECRET_KEY` already
loaded by the running app. Running it before the env var update would re-hash
with the old key — no-op.

**Rake task:** See header in `rotate_devise_secret_key.rake` for setup steps.

---

## Keys without rake tasks

### HASHIDS_SALT

**What it protects:** Stateless reversible encoding of integer IDs for
`UserAssessment`, `UsersResult`, and `MediaResponse` (`app/models/concerns/encodable_id.rb`).

| Model | Used in |
|---|---|
| `UserAssessment` | LTI `login_hint` / `line_item_id`, SkillVue `userId`, LTI AGS score callbacks |
| `UsersResult` | Admin export spreadsheets (14+ export jobs), assessment result export files, API responses via `UsersResultSerializer` |
| `MediaResponse` | Export/import of video and media response question data |

> **Not affected:** Standard assessment URLs in emails (Saville, Hogan, IIHT,
> Pearson) use raw integer IDs via Rails routes. Invitation links are signed by
> `SECRET_TOKEN_FOR_GENERATE`, not Hashids.

**Why no rake task:** Hashids is stateless — the salt is never stored in the
database. A fallback decoder was rejected because a wrong salt returns a
**different integer** (not `[]`), which would silently serve the wrong record
instead of a clean 404. That is a data integrity risk worse than letting old URLs break.

**What breaks immediately after rotation:**

| What breaks | Recoverable? |
|---|---|
| LTI assessments in-flight — old `login_hint` fails to look up the record | Re-launch the assessment |
| SkillVue result callbacks — stored `userId` returned hours/days later is silently dropped | Re-trigger results from SkillVue |
| LTI AGS score submissions — old encoded `userId` returns nil, score not recorded | Re-submit scores from external tool |
| Admin export spreadsheets containing encoded IDs | Re-download reports after rotation |
| Old export/import files with encoded IDs | Re-export from the app |
| API clients that stored an `encoded_id` from `UsersResultSerializer` | Re-fetch from API |

**Import file fallback — `PREV_HASHIDS_SALT`:**
Export files (assessment results, media responses) store encoded IDs. If an
export file is re-imported after rotation, `decode_id` will return `[]` for
old encoded IDs using the new salt. Setting `PREV_HASHIDS_SALT` causes
`decode_id` to fall back to the previous salt when the primary salt returns
`[]`, allowing old export files to be re-imported correctly.

The fallback is only triggered on empty decode — if the new salt decodes to
a non-empty result it is used as-is, minimising wrong-record risk.

**How to rotate:**
```bash
CURRENT_SALT=$(heroku config:get HASHIDS_SALT --app your-app)
NEW_SALT=$(ruby -e "require 'securerandom'; puts SecureRandom.hex(32)")
heroku config:set PREV_HASHIDS_SALT="$CURRENT_SALT" HASHIDS_SALT="$NEW_SALT" --app your-app
heroku restart --app your-app

# After confirming all old export files have been re-imported or discarded:
heroku config:unset PREV_HASHIDS_SALT --app your-app
heroku restart --app your-app
```

**Before rotating:** Confirm no LTI or SkillVue assessments are in-flight.
Re-trigger any pending SkillVue results after rotation.

---

### SECRET_KEY_BASE

**What it protects:** Rails session cookie signing, ActiveStorage signed URLs,
and admin handoff tokens. Also the **root key** from which all
`message_verifier`-derived keys are computed (including `SECRET_TOKEN_FOR_GENERATE`).

**Why no rake task:** Rails uses `SECRET_KEY_BASE` to sign session cookies inside
`ActionDispatch` at the framework level. There is no public API to try multiple
keys for cookie verification. Rails does provide `config.action_dispatch.cookies_rotations`
for named cookie keys, but this app uses `SECRET_KEY_BASE` directly as the root
signing key, not a named key, so that mechanism does not apply. Rotation is a
hard cutover by design.

**Impact:**

This app stores sessions in the database (`ActiveRecord::SessionStore`), but the
session cookie still contains a signed session ID. When `SECRET_KEY_BASE` changes,
Rails cannot verify the cookie signature and treats every session as unauthenticated.

| What | Impact |
|---|---|
| All active user sessions | Immediately invalidated — every logged-in user is signed out |
| Remember-me cookies | Invalidated |
| Admin handoff tokens | Invalid in-flight (2-minute expiry — low impact) |
| ActiveStorage signed URLs | Invalid until regenerated (10-minute expiry) |
| `encrypted_invitation_raw` | **Handled via fallback** — `KeyRotation::InvitationTokenVerifier` tries current `SECRET_KEY_BASE` first, then `PREV_SECRET_KEY_BASE`. Zero downtime for invitation flows. |
| Devise password reset / confirmation / unlock emails | **Not affected** — `DEVISE_SECRET_KEY` is set separately |

**Rotation order — CRITICAL:**

1. Rotate `SECRET_TOKEN_FOR_GENERATE` first — run `rotate_secret_token_for_generate` rake task
2. Then rotate `SECRET_KEY_BASE`

Reversing this order causes the `rotate_secret_token_for_generate` task to fail
for all users because `message_verifier` roots in the current `SECRET_KEY_BASE`.

**How to rotate:**
```bash
# Step 1 — rotate SECRET_TOKEN_FOR_GENERATE first
PREV_SALT=$(heroku config:get SECRET_TOKEN_FOR_GENERATE --app your-app)
NEW_SALT=$(ruby -e "require 'securerandom'; puts SecureRandom.hex(64)")
heroku config:set PREV_SECRET_TOKEN_FOR_GENERATE="$PREV_SALT" SECRET_TOKEN_FOR_GENERATE="$NEW_SALT" --app your-app
heroku run bundle exec rake key_rotation:rotate_secret_token_for_generate --app your-app
heroku config:unset PREV_SECRET_TOKEN_FOR_GENERATE --app your-app

# Step 2 — rotate SECRET_KEY_BASE with PREV_ fallback window
CURRENT_BASE=$(heroku config:get SECRET_KEY_BASE --app your-app)
NEW_BASE=$(ruby -e "require 'securerandom'; puts SecureRandom.hex(64)")
heroku config:set PREV_SECRET_KEY_BASE="$CURRENT_BASE" SECRET_KEY_BASE="$NEW_BASE" --app your-app
heroku restart --app your-app

# Step 3 — after rotation window (2–4 hours), remove fallback
heroku config:unset PREV_SECRET_KEY_BASE --app your-app
heroku restart --app your-app
```

---

## Pre-rotation checklist

- [ ] Take a database snapshot before starting.
- [ ] Run on staging first and confirm success.
- [ ] `ENCRYPTED_KEY` / `HOGAN_ENCRYPTED_KEY` / `SECRET_TOKEN_FOR_GENERATE` — run rake task **before** updating the env var.
- [ ] `DEVISE_SECRET_KEY` — update env var and restart **first**, then run rake task.
- [ ] `SECRET_KEY_BASE` — rotate `SECRET_TOKEN_FOR_GENERATE` **first**, then `SECRET_KEY_BASE`.
- [ ] `HASHIDS_SALT` — confirm no LTI or SkillVue assessments are in-flight.
- [ ] Monitor error rates and logs immediately after each restart.
- [ ] Remove all `PREV_*` env vars once rotation is confirmed.
