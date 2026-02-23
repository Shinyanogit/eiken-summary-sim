# Security and Cost Audit (2026-02-23)

## Scope
- `src/lib/rate-limit.ts`
- `src/lib/gemini.ts`
- `src/app/api/score/route.ts`

## Main Findings and Fixes
1. API key exposure
- Status: No direct client-side exposure was found.
- Fix: Added `server-only` to `gemini.ts` and `rate-limit.ts` to prevent accidental client import.

2. Rate limit robustness
- Risk: Cookie-only counting can be bypassed by cookie reset.
- Fixes:
  - Added HMAC signature verification with `timingSafeEqual`.
  - Bound cookie payload to a request fingerprint.
  - Added server-side in-memory counter (daily, JST) and combined count with cookie to resist cookie reset bypass.
  - Added `consumeRateLimit()` to check+increment in one flow.
  - Daily limit remains 20 submissions.

3. API cost control
- Risks: Excess prompt tokens, missing output token cap, repeated identical requests.
- Fixes:
  - Shortened prompts in `gemini.ts`.
  - Added `generationConfig.maxOutputTokens = 220` and `responseMimeType = application/json`.
  - Added short TTL cache for identical `(answer, serious)` requests.
  - Added server-side early return for serious mode when answer is too short.

4. Input validation
- Risks: Weak request validation could allow malformed/oversized input.
- Fixes in `route.ts`:
  - Require JSON content type.
  - Enforce request size limit (`content-length`).
  - Validate `answer` type/empty/max length.
  - Validate `serious` boolean type.
  - Validate optional `questionId` against known IDs.
  - Added same-origin check via `Origin` header.

5. OWASP Top 10 review summary
- SQLi: Not applicable (no SQL/ORM usage in scope).
- SSRF: Not found (no user-controlled URL fetch in scoring path).
- XSS: No direct sink found in reviewed path (`dangerouslySetInnerHTML` not used).
- DoS/cost abuse: Reduced by stricter validation, size cap, and stronger rate-limit flow.

## Notes
- `.env*` and `FOR*.md` are already covered in `.gitignore`.
- Existing project-wide lint/build issues remain outside this audit scope.
