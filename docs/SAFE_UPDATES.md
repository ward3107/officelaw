# Dependency update policy

Dependabot patch and minor updates are automatically merged only after the required checks and existing branch rules pass. Major and unclassified updates remain for owner review. Grouped updates use the highest semantic version change reported by the verified Dependabot metadata action.

The default branch is `main`. Required GitHub Actions checks:

- `Quality checks`
- `test`
- `audit`

Repository auto-merge must be enabled and an active ruleset must require these exact checks from GitHub Actions, an up-to-date branch and a pull request. The workflow verifies that configuration and refuses to enable auto-merge when it is missing. Existing checks, security scans and review requirements still apply.

The automation never checks out or runs pull-request code with write permissions. It uses the built-in repository token, pins the metadata action and matches the current PR commit when enabling auto-merge. No personal access token or administrator bypass is used.

A failed or missing required check blocks merging. Resolve the failure and rerun the affected check; do not remove the requirement to make an update pass. Build/test results do not certify external integrations or production user journeys.

This configuration is installed independently of the pending Tailwind major upgrade. Existing failed audits and browser tests still block dependency merges; enabling auto-merge is not evidence that a failing update was merged. The advisory Snyk integration still requires its repository token.

Native branch protection requires one approval, dismisses stale approvals after new commits, and requires approval after the latest push. The Actions bot supplies that approval only for the current verified Dependabot patch/minor commit. Major and unclassified updates receive no automatic approval.
