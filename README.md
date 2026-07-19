# Carolyn DiLoreto Portfolio

Portfolio website for a Film Editor / Graphic Designer / UX Engineer. It uses TanStack Start, React 19, Vite, Nitro, and Contentful.

**Production domain:** [carolyndiloreto.com](https://carolyndiloreto.com)

> The repository is being migrated from Netlify to AWS Amplify Hosting. Do not remove the Netlify site or change authoritative DNS until the Amplify hostname, TLS, DNS inventory, and production behavior have all passed the cutover checklist below.

## Tech stack

- **Framework:** TanStack Start with TanStack Router and React 19
- **Build:** Vite 8 and Nitro's `aws_amplify` preset
- **Hosting:** AWS Amplify Hosting `WEB_COMPUTE` in `us-west-2`
- **Runtime:** Node.js 24
- **Infrastructure:** AWS CDK v2 in `infra/`
- **CMS:** Contentful
- **Images:** `@unpic/react` with Contentful image transforms
- **Styling:** Tailwind CSS v4, shadcn/ui, and Radix UI
- **Package manager:** Bun 1.2.4 in CI and Amplify
- **Testing:** Bun unit tests and canonical Playwright behavior/visual tests

## Local development

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- Bun 1.2.4
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

`bun run build` refreshes the auth manifest, prerenders public routes, and emits Amplify's deployment contract under `.amplify-hosting/`:

- `static/` contains public assets and prerendered public pages.
- `compute/default/server.js` starts the Node.js 24 SSR server.
- `deploy-manifest.json` retains Nitro's default static-with-compute-fallback routing.
- `static/test-assets/` is deleted after the build so local visual fixtures are never deployed.

`bun run verify:prerender` checks the exact static page set, keeps protected projects and `/resume` dynamic, rejects public bcrypt hashes and configured secret values, validates the deployment manifest/runtime, and enforces Amplify's 220 MiB uncompressed compute limit.

| Command | Description |
| --- | --- |
| `bun dev` | Generate auth data and start Vite on port 3000 |
| `bun run build` | Emit a cleaned `.amplify-hosting` production bundle |
| `bun run typecheck` | Build fixture output and run TypeScript |
| `bun run validate` | Run lint, unit tests, typecheck, build, and artifact checks |
| `bun run test:unit` | Run focused Bun unit tests |
| `bun run test:amplify` | Run deployed Amplify smoke tests against `AMPLIFY_BASE_URL` |
| `bun run test:visual` | Run canonical ARM64 Playwright behavior/visual tests |
| `bun run test:visual:update` | Update reviewed canonical screenshots |

## Application architecture

TanStack Start routes live in `src/routes/`. Public pages and public project slugs are prerendered. Protected project slugs, `/resume`, server functions, and unknown routes use Amplify SSR compute.

| Route | Behavior |
| --- | --- |
| `/` | Home hero and project previews |
| `/about` | Bio and profile picture |
| `/projects` | Filterable project grid |
| `/projects/$slug` | Public detail or project-specific password gate |
| `/photography` | On-demand album server functions and gallery |
| `/resume` | Dynamic HTTP 308 redirect to an allowed HTTPS Contentful asset |

Protected routes fail closed against the generated auth manifest. Successful authentication sets a project-specific HTTP-only, Secure, SameSite=Strict cookie. The project loader validates that cookie before fetching or returning protected Contentful data. Passwords are bcrypt-verified only in server functions; hashes remain in compute and are rejected from public output.

Production secrets are loaded through `lib/server-secrets.server.ts`:

- Local development and fixture CI can use `.env`.
- Amplify build and SSR compute use SSM `SecureString` parameters.
- Values are requested with decryption once per process/secret and cached in memory.
- Provider errors are replaced with non-sensitive initialization errors.

## AWS infrastructure

The self-contained CDK project is under `infra/` with its own package manifest and lockfile.

```bash
cd infra
bun install --frozen-lockfile
bun run typecheck
bun run synth
```

`CarolynPortfolioHostingStack` defines:

- An Amplify `WEB_COMPUTE` app and `amplify-production` branch
- Disabled auto-builds and pull-request previews
- A no-cookie managed cache policy for protected SSR responses
- A build/service/logging role restricted to the Contentful parameter, its KMS encryption context, and Amplify log groups
- A branch compute role restricted to the two production parameters and their KMS encryption contexts
- A retained customer-managed KMS key for SSM
- The existing Route 53 public zone, imported as `Z32YJCERCJ1WLI`
- Optional apex/`www` Amplify domain association and a permanent `www` to apex redirect
- GitHub Actions OIDC trust restricted to this repository's `main` ref
- An Amplify-only deployment role
- Fourteen-day SSR log retention, a minimal 5xx alarm, and email notifications
- An account-wide $5 monthly actual/forecast AWS budget warning

The Route 53 zone currently contains only NS/SOA data and public delegation still points to Netlify/NS1. The stack intentionally gates domain association behind `EnableDomainAssociation=false`; this is not a cutover switch.

### Initial infrastructure deployment

Infrastructure deployment is allowed only after local validation. The target account was not bootstrapped when migration work began.

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cd infra
bunx cdk bootstrap "aws://$ACCOUNT_ID/us-west-2"
```

For the first connected-app creation, authorize the regional Amplify GitHub App for only `soodoh/carolyn-portfolio`. If the API requires a bootstrap token, store a JSON object with a `token` key in a temporary `us-west-2` Secrets Manager secret. Pass only that secret ARN to CDK; never pass the token through CDK context or a CloudFormation parameter.

```bash
bun run deploy -- \
  --parameters ContentfulSpaceId=CONTENTFUL_SPACE_ID \
  --parameters NotificationEmail=NOTIFICATION_EMAIL \
  --parameters GitHubAccessTokenSecretArn=TEMPORARY_SECRET_ARN \
  --parameters EnableDomainAssociation=false
```

After the GitHub connection and a connected build are proven, deploy again with an empty `GitHubAccessTokenSecretArn`, verify the repository remains connected, then revoke the token and delete the temporary Secrets Manager secret.

### Create production SSM parameters

CDK creates the KMS key but never creates secret values. On a secure workstation, use non-echoing input and a mode-0600 temporary JSON file with `aws ssm put-parameter --cli-input-json file://...`. Create standard `SecureString` parameters under the stack's `SecretKmsKeyArn` output:

- `/carolyn-portfolio/prod/contentful-access-token`
- `/carolyn-portfolio/prod/project-auth-secret`

At cutover, create a new Contentful delivery token and a new `openssl rand -hex 32` project-auth secret. Do not revoke the old Contentful token until AWS production passes all behavior checks. Rotating `PROJECT_AUTH_SECRET` intentionally invalidates existing protected-project cookies.

### Required SSM access spike

Before provisioning production DNS or relying on Amplify:

1. Create temporary production parameter values with the stack KMS key.
2. Trigger one connected Amplify build and confirm auth-manifest generation reads Contentful through the Amplify service role.
3. Request a dynamic route on the Amplify hostname and confirm SSR compute reads both parameters through the compute role.
4. Confirm no value appears in build logs, CloudWatch logs, `.amplify-hosting`, Amplify environment variables, or the synthesized template.
5. If build-time SSM access fails, stop. Do not fall back to plaintext Amplify variables or long-lived AWS keys.

### Configure GitHub deployment variables

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

Before DNS cutover, run the automated desktop/mobile smoke suite:

```bash
AMPLIFY_BASE_URL=https://amplify-production.APP_ID.amplifyapp.com \
  bun run test:amplify
```

The production workflow runs this suite without credentials after each successful Amplify release. Set `AMPLIFY_PROTECTED_PROJECT_PASSWORD` only in a secure invoking process to add the valid-password checks; the suite otherwise skips that credentialed test. The suite verifies:

- `/`, `/about`, `/projects`, `/photography`, and a public project
- Protected gate without protected data or bcrypt leakage
- Invalid-password behavior
- Photography album server calls
- `/resume` returning 308 to an allowed Contentful HTTPS asset
- A real 404 status/page and static asset delivery

The credentialed test additionally verifies valid-password behavior, secure cookie attributes, and project-cookie isolation. Separately, from a secure operations shell, confirm the Amplify job commit ID equals the validated GitHub SHA, the `5xxErrors` metric remains zero, and CloudWatch/build logs and artifacts do not contain either production secret value.

Keep Nitro's generated routing until POST server functions, protected fallbacks, and SSR 404 behavior have been verified in production.

## DNS and cutover runbook

DNS cutover is destructive and requires explicit final confirmation immediately before execution.

1. Export every record from the current Netlify/NS1 authoritative zone. Include A, AAAA, CNAME, MX, TXT/SPF/DKIM/DMARC, CAA, SRV, and verification records—not only web records.
2. Query all four current authoritative servers and compare the export with public resolvers.
3. Recreate the full record inventory in Route 53 with reviewed TTLs.
4. Enable the Amplify domain association only after the inventory is complete. Add certificate/domain-verification records to both NS1 and Route 53 when Amplify requires them.
5. Validate the Route 53 zone directly against each stack-output name server before delegation.
6. Lower relevant TTLs in advance where the current provider permits it.
7. After final confirmation, update the Route 53 Registrar nameservers to the stack outputs.
8. Verify authoritative delegation and DNSSEC/CAA implications with multiple public resolvers; then verify TLS, apex application behavior, permanent `www` redirect, path/query preservation, and no redirect loops.
9. Run the production smoke suite and confirm GitHub/Amplify still report the expected SHA.
10. Wait for old NS caches to expire and repeat global checks. Do not delete Netlify at the instant nameservers change.
11. Only then revoke the old Contentful token, delete the Netlify site/zone/integration, and remove any remaining external Netlify configuration.

There is no planned seven-day rollback window, but Netlify remains the emergency DNS rollback target until post-delegation verification completes.

## Rollback

### Application rollback

Select a previously validated commit, force `amplify-production` to that exact SHA, and start/monitor a new Amplify `RELEASE` job. Confirm the returned job uses the rollback SHA. Do not point production at an untested branch head.

### DNS rollback

Before Netlify retirement, restore the registrar's previous NS1 nameservers if Amplify DNS/TLS/application behavior is unhealthy. Restore any changed TTLs only after service is stable. After Netlify deletion, rollback is forward-only through Amplify/CDK and Route 53.

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

Expected fixed baseline is roughly $1.60/month plus low logs, build, CDN, transfer, DNS query, and SSR usage. Data transfer is the largest likely variable. Amplify WAF is intentionally omitted because its Amplify charge alone is $15/month. PR previews, staging branches, and unnecessary alarms are disabled.

After one complete billing week, review Cost Explorer by service, Amplify build minutes/data transfer/SSR use, CloudWatch ingestion, KMS, and Route 53. Recalculate the monthly projection and investigate any forecast approaching the $5 warning.

## Visual testing

Visual tests run in a pinned Linux ARM64 Playwright container so local and CI rendering is identical. An ARM64 Docker engine must be running.

```bash
bun run test:visual
bun run test:visual -- tests/home.test.ts
bun run test:visual:update
```

Do not update snapshots from a native Playwright run. Review image diffs before accepting canonical baselines. The checked-in Contentful fixture keeps CMS data stable; deliberately refresh it with `bun run scripts/capture-contentful-fixture.ts` and review generated content plus visual diffs.

## License

MIT
