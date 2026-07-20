# Carolyn DiLoreto Portfolio

Portfolio website for a Film Editor / Graphic Designer / UX Engineer. It uses TanStack Start, React 19, Vite, Nitro, and Contentful.

**Production domain:** [carolyndiloreto.com](https://carolyndiloreto.com)

AWS Amplify Hosting serves production through Route 53. `www.carolyndiloreto.com` and the cross-account legacy hostname `carolyn.diloreto.com` permanently redirect to the canonical HTTPS domain while preserving paths and query strings. Keep the former Netlify site and DNS zone intact only until pre-cutover nameserver caches have expired and global checks remain healthy.

## Tech stack

- **Framework:** TanStack Start with TanStack Router and React 19
- **Build:** Vite 8 and Nitro's `aws_amplify` preset
- **Hosting:** AWS Amplify Hosting `WEB_COMPUTE` in `us-west-2`
- **Runtime:** Node.js 24
- **Infrastructure:** AWS CDK v2 in `infra/`
- **CMS:** Contentful
- **Images:** `@unpic/react` with Contentful image transforms
- **Styling:** Tailwind CSS v4, shadcn/ui, and Radix UI
- **Package manager:** Bun 1.3.14 in CI and Amplify
- **Testing:** Bun unit tests and canonical Playwright behavior/visual tests

## Local development

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- Bun 1.3.14
- Access to the project's Contentful delivery API

```bash
git clone https://github.com/soodoh/carolyn-portfolio.git
cd carolyn-portfolio
bun install
cp .env.example .env
```

Local `.env` variables are server-only:

| Variable | Description |
| --- | --- |
| `CONTENTFUL_SPACE_ID` | Non-secret Contentful space identifier |
| `CONTENTFUL_ACCESS_TOKEN` | Local Content Delivery API token |
| `PROJECT_AUTH_SECRET` | Local HMAC key for protected-project cookies |

Generate a local signing key with `openssl rand -hex 32`. Never use a production token or signing key in a checked-in file, `.env.production`, CDK context, an Amplify environment variable, or a GitHub Actions secret.

```bash
bun dev
```

The predev step creates the gitignored `lib/project-auth-manifest.json`, then Vite serves the application at `http://localhost:3000`.

## Build and test

```bash
bun run build
bun run validate
bun run test:visual
```

`bun run build` refreshes the auth manifest, prerenders persistent public routes, and emits Amplify's deployment contract under `.amplify-hosting/`:

- `static/` contains public assets and prerendered `/`, `/about`, `/projects`, and `/photography` pages.
- `compute/default/server.js` starts the Node.js 24 SSR server.
- `deploy-manifest.json` is explicitly rewritten with exact static routes for those four persistent pages, followed by Nitro's generated static-asset route with compute fallback and its generated compute catch-all.
- Project details, `/resume`, server functions, missing static assets, and unknown paths therefore remain compute-backed. Keeping every project detail dynamic makes clean project URLs independent of authorization changes and avoids unused static routes.
- Amplify permits at most 25 deployment routes. The build fails before publishing if the four exact public routes plus the two generated fallback routes exceed that limit.
- Fixture builds use the checked-in Contentful JSON and `public/test-assets/`. Production builds use the live Contentful client, leave `public/test-assets/` unchanged, and remove the copied `static/test-assets/` directory from the emitted artifact.

`bun run verify:prerender` checks the exact static page set, keeps protected projects and `/resume` dynamic, rejects public bcrypt hashes and configured secret values, validates the replacement route order and runtime, and enforces Amplify's 220 MiB uncompressed compute limit. Amplify commands explicitly set production artifact mode and disable Playwright/hermetic fixture flags; production entrypoints reject those flags unless the repository's explicit hermetic production-test command is running.

| Command | Description |
| --- | --- |
| `bun dev` | Generate auth data and start Vite on port 3000 |
| `bun run build` | Emit a cleaned `.amplify-hosting` production bundle |
| `bun run typecheck` | Build fixture output and run TypeScript |
| `bun run validate` | Run lint, unit tests, typecheck, build, and artifact checks |
| `bun run test:unit` | Run focused Bun unit tests |
| `bun run test:amplify` | Run deployed Amplify smoke tests against `AMPLIFY_BASE_URL` |
| `bun run test:visual` | Build a production-shaped fixture artifact, then run canonical ARM64 Playwright behavior/visual tests against it |
| `bun run test:visual:update` | Rebuild the production-shaped fixture artifact and update reviewed canonical screenshots |

## Application architecture

TanStack Start routes live in `src/routes/`. The four persistent public index pages are prerendered and installed as exact Amplify static routes. Every project detail slug, `/resume`, server functions, missing assets, and unknown routes use the generated Amplify compute fallbacks.

| Route | Behavior |
| --- | --- |
| `/` | Home hero and project previews |
| `/about` | Bio and profile picture |
| `/projects` | Filterable project grid |
| `/projects/$slug` | Public detail or project-specific password gate |
| `/photography` | On-demand album server functions and gallery |
| `/resume` | Dynamic, non-permanent HTTP 307 redirect to the current allowed HTTPS Contentful asset; it is never prerendered or cacheable as a permanent redirect |

Protected routes fail closed against the generated auth manifest. Successful authentication sets a project-specific HTTP-only, Secure, SameSite=Strict cookie. The project loader first fetches only the matching slug/password authorization state and validates it against the release manifest. For protected projects it then verifies the cookie before fetching full detail content, and revalidates the detail query's authorization state before returning content so changes between queries fail closed. Passwords are bcrypt-verified only in server functions; hashes remain in compute and are rejected from public output.

Production secrets are loaded through `lib/server-secrets.server.ts`:

- Local development and fixture CI can use `.env`.
- Amplify build and SSR compute use SSM `SecureString` parameters.
- Values are requested with decryption once per process/secret and cached in memory.
- Provider errors are replaced with non-sensitive initialization errors.

## AWS infrastructure

The CDK project is under `infra/` with its own package manifest and lockfile. It imports shared deployment parameters and Amplify clean-URL policy from the repository root, but it does not import or depend on the generated project auth manifest. Application and infrastructure validation remain independent; generate the manifest only for application development and builds.

```bash
bun run validate
cd infra
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run synth
```

`CarolynPortfolioHostingStack` defines:

- An Amplify `WEB_COMPUTE` app and `amplify-production` branch
- Disabled auto-builds and pull-request previews
- A cookie-aware managed cache policy plus explicit `private, no-store` protected-project responses
- A build/service/logging role restricted to the Contentful and project-auth parameters, their KMS encryption contexts, and Amplify log groups
- A branch compute role restricted to the same two production parameters and their KMS encryption contexts
- A retained customer-managed KMS key for SSM
- The existing Route 53 public zone, imported as `Z32YJCERCJ1WLI`
- Production apex/`www` and legacy `carolyn.diloreto.com` Amplify associations with permanent canonical redirects
- GitHub Actions OIDC trust restricted to this repository's `main` ref
- An Amplify-only deployment role
- Fourteen-day SSR log retention, a minimal 5xx alarm, and email notifications
- An account-wide $5 monthly actual/forecast AWS budget warning

Route 53 is authoritative for `carolyndiloreto.com`, and `EnableDomainAssociation` now defaults to `true` as the deployed steady state. Setting it to `false` is destructive and removes both Amplify domain associations; it is not a routine rollback switch.

### Initial infrastructure deployment

Infrastructure deployment is allowed only after local validation. The target account was not bootstrapped when migration work began.

```bash
PRODUCTION_ACCOUNT_ID=725669362139
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ "$ACCOUNT_ID" != "$PRODUCTION_ACCOUNT_ID" ]; then
  echo "Refusing to bootstrap AWS account $ACCOUNT_ID; expected $PRODUCTION_ACCOUNT_ID" >&2
  exit 1
fi
cd infra
bunx cdk bootstrap "aws://$PRODUCTION_ACCOUNT_ID/us-west-2"
```

For the first connected-app creation, authorize the regional Amplify GitHub App for only `soodoh/carolyn-portfolio`. If the API requires a bootstrap token, store a JSON object with a `token` key in a temporary `us-west-2` Secrets Manager secret. Pass only that secret ARN to CDK; never pass the token through CDK context or a CloudFormation parameter.

```bash
bun run deploy -- \
  --parameters ContentfulSpaceId=CONTENTFUL_SPACE_ID \
  --parameters NotificationEmail=NOTIFICATION_EMAIL \
  --parameters GitHubAccessTokenSecretArn=TEMPORARY_SECRET_ARN \
  --parameters EnableDomainAssociation=false
```

After the GitHub connection and a connected build are proven, deploy again with an empty `GitHubAccessTokenSecretArn`, verify the repository remains connected, then revoke the token and delete the temporary Secrets Manager secret. For the deployed production state, pass `EnableDomainAssociation=true` or rely on its current `true` default.

### Create production SSM parameters

CDK creates the KMS key but never creates secret values. On a secure workstation, use non-echoing input and a mode-0600 temporary JSON file with `aws ssm put-parameter --cli-input-json file://...`. Create standard `SecureString` parameters under the stack's `SecretKmsKeyArn` output:

- `/carolyn-portfolio/prod/contentful-access-token`
- `/carolyn-portfolio/prod/project-auth-secret`

At cutover, create a new Contentful delivery token and a new `openssl rand -hex 32` project-auth secret. Do not revoke the old Contentful token until AWS production passes all behavior checks. Rotating `PROJECT_AUTH_SECRET` intentionally invalidates existing protected-project cookies.

### Required SSM access spike

Before provisioning production DNS or relying on Amplify:

1. Create temporary production parameter values with the stack KMS key.
2. Trigger one connected Amplify build and confirm auth-manifest generation reads the Contentful token and project-auth secret through the Amplify service role.
3. Request a dynamic route on the Amplify hostname and confirm SSR compute reads both parameters through the compute role.
4. Confirm no value appears in build logs, CloudWatch logs, `.amplify-hosting`, Amplify environment variables, or the synthesized template.
5. If build-time SSM access fails, stop. Do not fall back to plaintext Amplify variables or long-lived AWS keys.

### Configure GitHub deployment variables

Create a GitHub Actions environment named `production`, restrict it to the selected `main` branch, and leave required reviewers disabled so validated main deployments remain automatic. The deployment job references this environment even though it needs no application credential; production password smoke coverage runs against the hermetic fixture artifact instead of storing a real project password in GitHub.

Read stack outputs, then configure non-secret repository variables:

```bash
gh variable set AMPLIFY_APP_ID --body "APP_ID"
gh variable set AMPLIFY_DEPLOYMENT_ROLE_ARN --body "DEPLOYMENT_ROLE_ARN"
```

No AWS access key is stored in GitHub. The production workflow:

1. Waits for validation and canonical Playwright jobs.
2. Skips a tested SHA when `main` has advanced.
3. Uses a dedicated `contents: write` job to advance `amplify-production` to the exact tested SHA.
4. Uses a separate OIDC-only job to call `amplify:StartJob`.
5. Rejects the wrong commit, polls `GetJob`, fails terminal error states/timeouts, and publishes the Amplify URL in the job summary.

Amplify rebuilds the SSR app from the connected branch. The duplicate GitHub validation build and Amplify production build are intentional.

## Deployment verification

Run the automated desktop/mobile production smoke suite after each release:

```bash
AMPLIFY_BASE_URL=https://carolyndiloreto.com \
  bun run test:amplify
```

The production workflow runs this small deployment-integration suite without application credentials after each successful Amplify release. Full behavior, visual, valid-password, secure-cookie, and project-cookie-isolation coverage runs earlier against a production-shaped Amplify artifact built from the stable checked-in Contentful fixture. The live suite verifies only behavior that the fixture artifact cannot prove:

- The expected release is available from canonical and default Amplify origins
- `/`, `/about`, `/projects`, `/photography`, and a public project use live production content successfully
- The protected gate does not expose protected data or bcrypt hashes and rejects an invalid password
- Live photography server functions can read Contentful data and return healthy Contentful images
- `/resume` returns a non-permanent 307 to the current allowed Contentful HTTPS asset
- A real 404 status/page, static asset delivery, and canonical domain redirects work through Amplify

The production-shaped fixture artifact uses the same source, build command, SSR runtime, route manifest, and artifact server as production, but it is not byte-identical to the deployed artifact because Amplify rebuilds with live Contentful data. The minimal live suite covers that integration boundary without storing a real project password in GitHub. Separately, from a secure operations shell, confirm the Amplify job commit ID equals the validated GitHub SHA, the `5xxErrors` metric remains zero, and CloudWatch/build logs and artifacts do not contain either production secret value.

Keep the generated asset fallback and compute catch-all in the explicit route replacement until POST server functions, protected/dynamic fallbacks, and SSR 404 behavior have been verified in production.

## DNS operations

The production cutover completed after exporting all four Netlify-managed DNS records, validating both Amplify certificates, and testing the target distributions directly. The registrar delegates `carolyndiloreto.com` to the Route 53 nameservers emitted by the CDK stack.

- AWS account `725669362139` owns the Carolyn Amplify app, `carolyndiloreto.com`, and hosted zone `Z32YJCERCJ1WLI`.
- AWS account `658271954302` owns the shared `diloreto.com` hosted zone `Z07741203I5VR48TBSMSA`. Only `carolyn.diloreto.com` and its dedicated ACM validation CNAME belong to this project.
- The shared zone's apex, `www`, `home`, wildcard, mail, and `paul` records belong to other services/projects and must never be changed by this repository's operations.
- There is no cross-account IAM trust. Account `725669362139` owns the Amplify domain association and certificate; account `658271954302` supplies only the two DNS CNAMEs that prove ownership and route the legacy hostname.
- Before any cross-account DNS write, verify `aws sts get-caller-identity`: local profile `default` must resolve to `725669362139`, and the dedicated alias-DNS profile must resolve to `658271954302`. Never use the unrelated `sarabeth-production` profile.
- Both domain associations must report `AVAILABLE` before changing either target.
- DNSSEC is not enabled. Recheck CAA implications before adding restrictive CAA records.
- After DNS changes, query every authoritative server and multiple public resolvers, verify TLS and redirect path/query preservation, run `bun run test:amplify`, and inspect the Amplify 5xx metric and compute logs.
- Do not delete the former Netlify site or DNS zone until old NS caches have expired. Remove the temporary Amplify certificate-validation record from Netlify only after Route 53 is consistently authoritative worldwide.

For emergency rollback before Netlify retirement, restore the registrar's NS1 nameservers and point the Route 53 apex and `www` records back to the exported Netlify IPv4/IPv6 targets so resolvers with either delegation remain healthy.

### Netlify retirement

Do not delete Netlify before **2026-07-21 23:00 UTC**, which is later than the pre-cutover 172800-second nameserver TTL. At that time, repeat authoritative/public resolver checks, the credentialed production smoke suite, TLS/redirect checks, and the Amplify metric/log review. Then use a freshly authenticated, pinned Netlify CLI—not the dashboard—to verify and delete only the `carolyndiloreto` project and `carolyndiloreto.com` DNS zone. Abort if the CLI cannot enumerate the expected project and exactly the exported Carolyn DNS records; never delete by a guessed ID.

## Rollback

### Application rollback

Select a previously validated commit, force `amplify-production` to that exact SHA, and start/monitor a new Amplify `RELEASE` job. Confirm the returned job uses the rollback SHA. Do not point production at an untested branch head.

### DNS rollback

Before Netlify retirement, restore the registrar's previous NS1 nameservers if Amplify DNS/TLS/application behavior is unhealthy. Also restore the exported Netlify apex and `www` targets in Route 53 so resolvers caching either delegation remain healthy. The cross-account `carolyn.diloreto.com` CNAME can be returned to `carolyndiloreto.com` while Netlify still holds its wildcard certificate. Restore any changed TTLs only after service is stable. After Netlify deletion, rollback is forward-only through Amplify/CDK and Route 53.

### Infrastructure rollback

Use `cdk diff` before every change. KMS keys and SSR logs are retained on stack deletion; account for their continuing cost and remove them manually only after secret recovery and log-retention requirements are satisfied.

## Secret rotation

1. Create the replacement value in Contentful or generate a new project-auth key.
2. Overwrite only the corresponding SSM parameter using the same KMS key.
3. Trigger an exact-SHA Amplify release so fresh compute processes load the new value.
4. Verify public and protected behavior and inspect logs.
5. Revoke the old Contentful token only after successful verification.

Never print parameter values while troubleshooting. Use metadata-only `describe-parameters` calls when checking existence.

## Cost posture

Current public pricing assumptions, before free-tier credits:

| Item | Assumption |
| --- | --- |
| Route 53 hosted zone | $0.50/month plus about $0.40 per million standard queries |
| Dedicated KMS key | About $1/month plus negligible API use |
| CloudWatch 5xx alarm | About $0.10/month; logs/SNS are usage-based |
| Amplify standard build | $0.01/minute |
| Amplify CDN storage | $0.023/GB-month |
| Amplify transfer out | $0.15/GB |
| Amplify SSR requests | $0.30/million |
| Amplify SSR duration | $0.20/GB-hour |
| AWS Budget monitoring | Free for notification-only budgets |

Expected fixed baseline is roughly $1.60/month plus low logs, build, CDN, transfer, DNS query, and SSR usage. Data transfer is the largest likely variable. Amplify WAF is intentionally omitted because its Amplify integration charge alone is $15/month before normal WAF charges. A DynamoDB-backed password-attempt limiter is also intentionally omitted while traffic and abuse remain negligible; it would add trusted client-IP handling, atomic counter/TTL policy, IAM, and failure modes disproportionate to the current risk. Revisit distributed limiting if invalid-password traffic or SSR cost materially increases. PR previews, staging branches, and unnecessary alarms are disabled.

After one complete billing week, review Cost Explorer by service, Amplify build minutes/data transfer/SSR use, CloudWatch ingestion, KMS, and Route 53. Recalculate the monthly projection and investigate any forecast approaching the $5 warning.

## Visual testing

Visual tests first build the production artifact path with a live-shaped transformation of the checked-in Contentful fixture, then run the full browser suite against the emitted Amplify bundle in a pinned Linux ARM64 Playwright container. Hermetic Contentful image URLs are fulfilled from the fixture assets inside Playwright, preserving stable screenshots while exercising production routing and SSR packaging. An ARM64 Docker engine must be running.

```bash
bun run test:visual
bun run test:visual -- tests/home.test.ts
bun run test:visual:update
```

Do not update snapshots from a native Playwright run. Review image diffs before accepting canonical baselines. The checked-in Contentful fixture keeps CMS data stable; deliberately refresh it with `bun run scripts/capture-contentful-fixture.ts` and review generated content plus visual diffs.

## License

MIT
