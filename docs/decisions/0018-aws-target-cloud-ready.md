# 0018 — AWS target, cloud-ready from day 1, deploy in M2

- **Status:** Accepted · 2026-11-23 · Amended 2026-11-23: local S3 is RustFS, not MinIO

## Decision
- **AWS is the target cloud.** It's the most interview-relevant option (IAM, VPC, ECS, RDS, CloudFront), and its extra cost over a VPS (~$50–90/month) fits the budget.
- **Cloud-ready from day 1:**
  - Everything runs in containers except native GPU workers.
  - Configuration comes from environment variables.
  - The same Postgres major version as RDS.
  - **RustFS** as the local S3 (originally MinIO; see the amendment below).
  - No Mac-specific dependencies in containers.
- **First deploy in M2,** right after M1 works locally. Building infrastructure for a design that is still moving would mean rework, and it would delay the first audible broadcast.
- **Expected shape:** Terraform; ECS Fargate (api, workers, playout as a single instance); RDS Postgres; S3 + CloudFront; Temporal Cloud; GitHub Actions deploying through **OIDC** (no long-lived AWS keys); manual deploy approval via GitHub Environments; one cloud environment plus feature flags; expand/contract migrations; rollback by redeploying the previous image SHA.

## Amendment 2026-11-23: RustFS replaces MinIO locally
MinIO stopped publishing community images in 2025: `minio/minio` is gone from Docker Hub, and the quay.io repository is empty. Two maintained, Apache-2.0, S3-compatible stores were tested against what M1 needs (bucket, upload, public-read policy, CORS for the browser player, and **rejecting anonymous writes**):
- **RustFS 1.0.6:** passed everything. Young (started 2023), designed as a MinIO drop-in.
- **SeaweedFS 4.55:** mature, but **accepted anonymous uploads** unless a separate identities config is added. A dev store that's laxer than S3 hides permission bugs until production.

RustFS was chosen. The risk of a young project is contained: it only stands in for S3 locally, and the code speaks only the S3 API, so swapping it means changing one image in `compose.yaml`.

## Consequences
- Known cost traps to design around: NAT Gateway, ALB base cost, EKS control plane, idle RDS.
- Terraform makes teardown and recreation routine. That covers "infrastructure can be recreated from documented configuration."
