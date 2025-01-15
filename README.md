# Smartify

Smartify is a complete smart home system which allows users to control and automate their (simulated) smart homes from anywhere.

This repository contains all the code and projects for Smartify. The project uses Flutter for the frontend, and a variety of technologies for the backend, including Node.js, Express, Go, Python, Docker, and some other technologies.

# Prerequisites

To run the app, you will need to have the following installed:

- Flutter
- Node.js
- Docker
- Go
- Python
- MongoDB

Please refer to each's respective documentation for installation instructions.

# Git Hooks

There are git hooks which may run on commits, pushes, etc to ensure no linting
errors, the code is formatted, and so on. To set them up, run the
`setup-hooks.sh` file which will configure your hooks.

### Hook dependencies

- Prettier cli
- Dart cli

# Branches

There are three branches. The `main` branch is the main branch, all commits there are for fully functional releases. `staging` is used to stage changes for the next release to be merged at once into `main`. `dev` is used for development purposes. PRs with approvals are required for the `main` and `staging` branches. `dev` doesn't require PRs, but please please please don't push directly to `dev`. You should create a new branch from `dev` and work there, then create a PR to merge back into `dev` once done. Also add a review, so they're notified they need to review the PR.

Also, please comment, document, and test all you're code. Make sure to also include tests in your PRs.

# App

The Flutter app can be found in the `app` directory.

# API Service

The API backend service can be found in the `api` directory. It's a Node.js Express server written with TypeScript.
