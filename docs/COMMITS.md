# Git & Version Control Guidelines for AI Coding Assistants

This document outlines the strict version control standards for this project. The AI must adhere to these rules when generating code, proposing git commands, or writing commit messages.

## 1. Branching Strategy & Naming

- Production Branch Name: The production branch is strictly named main. Do not use "master".

- Branch Source: All feature, bug, and hotfix branches must originate from the develop branch.

    - Strict Rule: Never create a branch directly off main.

- Protected Main: Direct commits or pushes to main are forbidden. main is only updated via release merges from the development workflow.

## 2. Commit Message Convention

- All commits must follow the Conventional Commits format:

        `<type>(<module>): <message>`


- Format: `<type>` is mandatory, `<module>` is optional but recommended, and `<message>` must be imperative and descriptive.

- Allowed Types:

    - feat: A new feature

    - fix: A bug fix

    - docs: Documentation only changes

    - style: Changes that do not affect the meaning of the code (white-space, formatting, etc.)

    - refactor: A code change that neither fixes a bug nor adds a feature

    - test: Adding missing tests or correcting existing tests

    - chore: Changes to the build process or auxiliary tools

    - Example: feat(auth): add new oauth2 scopes for user login