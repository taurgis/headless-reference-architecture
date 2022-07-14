# Table of contents

- [Conventions for branch names and commit messages ](#conventions-for-branch-names-and-commit-messages)
- [Submitting your first pull request ](#submitting-your-first-pull-request)
- [Submitting a pull request ](#submitting-a-pull-request)
- [What to expect](#what-to-expect)
- [Community contributors](#community-contributors)
- [Contributor License Agreement (CLA)](#contributor-license-agreement) 
- [Commit signing](#commit-signing)
- [Back to README](./README.md)

# Contributing to HRA

To contribute to the HRA base cartridge, follow the guidelines below. This helps us address your pull request in a more timely manner. 

## Conventions for branch names and commit messages

### Branch names

To name a branch, use the following pattern: `yourusername-description` 

In this pattern, `description` is dash-delimited.

For example: jdoe-unify-shipping-isml

### Commit messages

To create a commit message, use the following pattern: `action-term: short-description`

In this pattern, `action-term` is one of the following: 

* Bug
* Doc
* Chore
* Update
* Breaking
* New

After `action-term,` add a colon, and then write a short description. You can optionally include a GUS ticket number in parentheses.

For example:  "Breaking: Unify the single- and multi-ship shipping isml templates (W-999999)."

## Submitting your first pull request
If this is your first pull request, follow these steps:

  1. Create a fork of the HRA repository

  2. Download the forked repository

  3. Checkout the integration branch

  4. Apply your code fix

  5. Create a pull request against the integration branch

## Submitting a pull request

  1. Create a branch off the integration branch.
       * To reduce merge conflicts, rebase your branch before submitting your pull request.
       * If applicable, reference the issue number in the comments of your pull request.

  2. In your pull request, include:
       * A brief description of the problem and your solution
       * (optional) Screen shots
       * (optional) Error logs
       * (optional) Steps to reproduce 

  3. Grant HRA team members access to your fork so we can run an automated test on your pull request prior to merging it into our integration branch.
       * From within your forked repository, find the 'Settings' link (see the site navigation on left of the page).
       * Under the settings menu, click 'User and group access'.
       * Add the new user to the input field under the heading 'Users' and give the new user write access.

  4. Indicate if there is any data that needs to be included with your code submission. 

  5. Your code should pass the automation process.
       * Lint your code:  
         `npm run lint`    
       * Run and pass the unit test:  
         `npm run test`
       * Run and pass the unit/intergration test:  
         `npm run test:integration`

## What to expect

After you submit your pull request, we'll look it over and consider it for merging.

As long as your submission has met the above guidelines, we should merge it in a timely manner.

## Contributor License Agreement

All external contributors must sign our Contributor License Agreement (CLA).  

## Commit signing

All contributors must set up [commit signing](https://help.github.com/en/github/authenticating-to-github/signing-commits).



