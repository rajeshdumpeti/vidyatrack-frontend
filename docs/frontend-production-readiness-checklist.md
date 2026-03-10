# VidyaTrack Frontend Production Readiness Checklist

## 1. Document Purpose
This checklist is the formal release gate for promoting the VidyaTrack frontend to production.

It is intended for:
- frontend engineering
- QA
- product management
- release management
- engineering leadership

This is not a best-effort list. A production release should not proceed unless all mandatory checks are explicitly reviewed and either passed or formally waived with owner and risk acknowledgment.

## 2. Release Metadata
Record the following before the review begins.

- Release name:
- Release version:
- Release branch:
- Commit SHA:
- Build artifact reference:
- Environment under review:
- Release owner:
- QA owner:
- Product approver:
- Engineering approver:
- Proposed production date:
- Rollback owner:

## 3. Release Scope Confirmation
### Mandatory
- release scope is documented and frozen
- in-scope features and fixes are listed
- out-of-scope work is listed
- known issues are documented
- release candidate branch is identified
- no unreviewed late changes have been merged after QA completion

### Evidence to attach
- release notes link
- pull request list or changelog
- final release candidate SHA

## 4. Repository and Build Health
### Mandatory
- `eslint` passes on the frontend repository
- production build passes successfully
- no unresolved merge conflicts exist
- no temporary debug logs are shipping
- no commented-out production logic is shipping
- no placeholder environment values are present in production config
- no empty, dead, or abandoned feature folders remain from refactor work
- dependency changes are reviewed and approved
- lockfile is in the expected state for the release

### Validation evidence
- lint output attached
- build output attached
- dependency diff reviewed

## 5. Environment and Configuration Readiness
### Mandatory
- production environment variables are defined and validated
- production API base URL is correct
- production auth endpoint is correct
- public asset paths are correct
- deep-link refresh behavior works for protected routes
- source maps are handled according to production policy
- no development-only flags are enabled in production builds
- school-scoped configuration is validated in the target environment

### Validate explicitly
- auth base URL
- API base URL
- public/base path
- OTP and login callback flow
- static asset loading from a cold browser session

## 6. Authentication and Authorization
### Mandatory
- OTP request flow works for valid numbers
- OTP verify flow works for valid codes
- invalid OTP handling shows the correct user-facing state
- expired OTP behavior is validated
- role-based redirect after login is correct
- multi-school selection works where applicable
- unauthorized routes are blocked
- logout clears session correctly
- session expiry behavior is validated
- hard refresh on a protected route preserves valid auth state

### Validate across roles
- `super_admin`
- `management`
- `principal`
- `teacher`

## 7. Routing and Navigation Readiness
### Mandatory
- all major route groups load without runtime failure
- direct URL entry works for deep-linked routes
- breadcrumbs render correctly where expected
- back navigation works for major flows
- role-guarded routes reject invalid role access
- empty states, loading states, and error states appear correctly
- route-level redirects do not loop

### Route groups
- `/auth/*`
- `/platform/*`
- `/management/*`
- `/principal/*`
- `/teacher/*`

## 8. Core Workflow Readiness
### Platform
- schools list renders and search works
- school detail renders and tab state behaves correctly
- create school wizard completes end to end
- create school validation works step by step

### Management
- dashboard loads with valid data
- classes and sections setup works
- subject catalog flows work
- subject assignment works and refreshes correctly
- principal onboarding and OTP verification work
- teacher creation works
- student creation works
- CSV preview and CSV commit work

### Principal
- dashboard loads
- attendance history filters work
- marks history filters and export work
- communications tabs work
- teacher and student drill-down navigation works

### Teacher
- dashboard loads and preserves route-state toasts
- attendance entry works end to end
- marks entry works end to end
- communications flows work
- student drill-down navigation works

## 9. Data Integrity and Cache Validation
### Mandatory
- create/update operations refresh relevant data correctly
- stale data is not shown after critical mutations
- school switching updates visible data correctly
- cross-school cache leakage is not observed
- query invalidation works for students, teachers, sections, subjects, attendance, and marks
- optimistic UI paths reconcile correctly after success and failure

### High-risk areas to validate closely
- teaching assignments
- attendance submission
- marks submission
- student notes
- management principal onboarding
- school-scoped detail pages

## 10. Error Handling and Resilience
### Mandatory
- loading states render on intentionally slowed requests
- empty states render when datasets are empty
- retry actions work where they are present
- API failures do not crash the app shell
- error boundaries do not hide critical failures silently
- user-facing validation messages are understandable
- mutation failures do not leave the page in an invalid success state

### Failure-path checks
- invalid OTP
- missing school context
- import preview failure
- import commit failure
- attendance submit failure
- marks submit failure
- network timeout
- 401 / 403 auth failures
- 422 validation failure

## 11. UX and Accessibility Review
### Mandatory
- major flows are usable on desktop widths
- major flows are usable on tablet widths
- major flows are usable on narrow mobile widths
- buttons and inputs have visible interaction states
- modal open/close behavior works correctly
- keyboard interaction works on critical forms
- focus handling is acceptable for OTP, dialogs, and form workflows
- no obvious text overflow or broken layout appears on common screens

### Recommended
- quick screen-reader pass on auth flows
- quick screen-reader pass on critical setup forms
- color contrast spot-check on high-traffic screens

## 12. Browser and Device Validation
### Minimum supported matrix
- Chrome latest
- Safari latest
- Edge latest

### Viewports
- desktop
- tablet
- mobile

### Mandatory
- no critical rendering issues in the supported matrix
- no critical form interaction issues in the supported matrix

## 13. Performance and Build Quality
### Mandatory
- production build completes successfully
- chunk output is reviewed for unexpected growth
- initial load on auth and one dashboard route is acceptable
- no major production console errors appear in tested flows

### Recommended
- Lighthouse or equivalent for auth route
- Lighthouse or equivalent for one dashboard route
- test list-heavy screens with realistic data volume
- test import flows with realistic file size

## 14. Security and Privacy Review
### Mandatory
- no secrets are present in shipped frontend code
- auth tokens are handled consistently
- role-restricted routes are protected
- school-scoped data does not leak across contexts
- user PII is only displayed where intended
- dev-only globals or helpers are not exposed in production unintentionally

### Recommended
- targeted auth/session review
- review browser storage usage
- verify production error screens do not leak sensitive internal details

## 15. Observability and Operational Readiness
### Mandatory
- release owner knows rollback steps
- release owner knows post-deploy smoke procedure
- support/escalation path is defined
- monitoring or logs exist for critical failures
- production validation owners are assigned

### Recommended
- watch auth failure rate
- watch import failure rate
- watch attendance submission failure rate
- watch marks submission failure rate

## 16. Documentation and Handoff Readiness
### Mandatory
- architecture documentation is current
- QA test plan is current
- release sign-off document is prepared
- release notes are prepared
- known issues are documented with owner and mitigation
- handoff recipients understand release scope and risks

## 17. Final Go / No-Go Review
### Engineering
- [ ] Go
- [ ] No-Go
- Comments:

### QA
- [ ] Go
- [ ] No-Go
- Comments:

### Product
- [ ] Go
- [ ] No-Go
- Comments:

### Final Decision
- [ ] Approved for production
- [ ] Blocked

## 18. Blocking Issues Log
For every blocking issue, capture:
- Issue:
- Severity:
- Owner:
- ETA:
- Mitigation:
- Re-test required:

## 19. Post-Release Validation Plan
Capture the immediate production validation plan.

- first smoke test owner:
- first smoke completion time target:
- monitored routes:
- monitored mutations:
- rollback trigger criteria:
- stakeholder update plan:

## 20. Approval Signatures
- Engineering approver:
- QA approver:
- Product approver:
- Release owner:
- Date:
