# Privacy notes

## Design

OutOfOffice Guard is designed to perform its checks locally in the browser. The supplied v1.2 source contains no intentional remote API calls, analytics endpoint, server-side processing, or message-upload feature.

## What the extension processes

Depending on the feature the user invokes, the extension may process:

- Text manually pasted into the popup.
- Text extracted from visible page fields that match the OOO-context heuristic when the user selects the page-scan action.
- Text entered into a field identified as an OOO field while live protection is active.

The page-scan function returns candidate field text to the popup so the user can review it. Live mode analyses candidate field text in the page and displays findings in the on-page panel.

## What it does not do

The supplied code does not:

- Sign in to the user's mailbox.
- Use Gmail or Microsoft APIs.
- Request mailbox credentials.
- Intentionally transmit message text to a remote server.
- Change, save, or activate automatic-reply settings.
- Send messages on the user's behalf.

## User choices and cautions

Page scanning and live protection require an explicit user action. The user should use dummy text for testing and should not enter real passwords, active tokens, or other secrets into test messages. Closing the live panel ends the current live session; refreshing the page also ends the injected session.

## Important qualification

This document describes the behaviour visible in the current repository source. Before publishing a Chrome Web Store listing, review the final packaged code, any future dependencies, store disclosures, and Google's current developer policies. If future versions add analytics, remote services, storage, or other data handling, update this document and the store privacy declarations accordingly.
