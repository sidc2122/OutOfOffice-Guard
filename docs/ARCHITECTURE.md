# Architecture

## Overview

OutOfOffice Guard is a client-side Chrome Manifest V3 extension. It has no application server, database, remote API integration, or background service worker in this release.

```text
                    User
                     |
             Chrome extension popup
             /          |           \
       Manual text   Page scan    Start live protection
           |            |                |
       popup.js     executeScript    executeScript
           |            |                |
       Local rules   Candidate field   live.js injected
           |         text returned          |
       Findings       to popup          DOM heuristics
           |                               |
       Safer text                    Input/change events
                                           |
                                     Local live rules
                                           |
                                     Shadow DOM panel
```

## Components

### `manifest.json`
Declares Manifest V3, extension metadata, the popup action, and `activeTab` / `scripting` permissions.

### `popup.html` and `styles.css`
Provide the popup interface: manual text entry, page-scan and live-protection controls, findings, attention label, and a suggested alternative.

### `popup.js`
Contains the popup's seven detection categories, attention-point calculation, generic safer-reply suggestion, best-effort page-scan function, and click-triggered injection of `live.js`.

### `live.js`
Runs in the active page after explicit user action. It:

1. Avoids starting a second instance when its session flag is already set.
2. Looks for textareas, text inputs, contenteditable elements, and textbox roles.
3. Uses labels, attributes, and nearby page text to identify likely OOO fields.
4. Listens for input and change events and uses a short debounce before checking.
5. Watches DOM mutations to recover when candidate fields are added or replaced.
6. Displays findings in a floating panel hosted in a closed Shadow DOM.
7. Stops its current session when the panel is closed or the page is unloaded.

## Data flow

- Manual mode analyses text entered into the popup.
- Page scan executes a local function in the active tab, returns text from fields that match OOO-context heuristics, and places the returned text in the popup for the user to review.
- Live mode analyses text from a recognised field in the current page and renders the result locally in the page.
- There is no intentional remote transmission in the supplied source code.

## Trust boundaries and limitations

The extension relies on the browser's active-tab permission model and DOM heuristics. The surrounding text used to identify an OOO field is not a cryptographic or provider-authenticated signal. A page may change its DOM, labels, editor structure, or frame arrangement. Treat provider compatibility as tested only in the specific environments actually exercised, not as a guarantee for every Gmail or Outlook account.
