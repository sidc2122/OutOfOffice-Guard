# Chrome permissions

The current manifest requests two permissions.

## `activeTab`

Provides temporary access to the active tab after the user invokes the extension. It supports the user-initiated page scan and live-protection action without declaring broad persistent access to all websites.

## `scripting`

Allows the extension to execute the page-scan function and inject the bundled `live.js` file into the active tab after the user clicks the relevant popup control.

## Permissions not declared

The manifest does not declare:

- `host_permissions`
- `tabs`
- `storage`
- `cookies`
- `webRequest`
- Gmail or Microsoft account/API scopes
- a background service worker

The extension therefore does not request mailbox access or account sign-in credentials. Chrome may still restrict injection on browser-internal pages, protected pages, or certain frame contexts.

## User control

The user initiates page scanning or live protection from the popup. Live protection can be stopped by closing its floating panel. A page refresh ends the injected page session; the user must start it again.
