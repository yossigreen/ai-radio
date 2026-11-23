# 0018 — AWS target, cloud-ready from day 1, deploy in M2

- **Status:** Accepted · 2026-11-23

## Decision
- **AWS is the target cloud.** It's the most interview-relevant option (IAM, VPC, ECS, RDS, CloudFront), and its extra cost over a VPS (~$50–90/month) fits the budget.
- **Cloud-ready from day 1:**
  - Everything runs in containers except native GPU workers.
  - Configuration comes from environment variables.
  - The same Postgres major version as RDS.
  - MinIO as the local S3.
  - No Mac-specific dependencies in containers.
- **First deploy in M2,** right after M1 works locally. Building infrastructure for a design that is still moving would mean rework, and it would delay the first audible broadcast.
- **Expected shape:** Terraform; ECS Fargate (api, workers, playout as a single instance); RDS Postgres; S3 + CloudFront; Temporal Cloud; GitHub Actions deploying through **OIDC** (no long-lived AWS keys); manual deploy approval via GitHub Environments; one cloud environment plus feature flags; expand/contract migrations; rollback by redeploying the previous image SHA.

## Consequences
- Known cost traps to design around: NAT Gateway, ALB base cost, EKS control plane, idle RDS.
- Terraform makes teardown and recreation routine. That covers "infrastructure can be recreated from documented configuration."
