# Detection rules

OutOfOffice Guard uses local regular-expression and context heuristics. It does not use a trained machine-learning model, threat-intelligence feed, or calibrated probability model.

## Popup rules

| Rule | What it looks for | Notes |
|---|---|---|
| Specific absence dates | A date range plus absence-related context such as away, unavailable, leave, holiday, return, or back | The expression focuses on month-name date ranges. |
| Travel / movement | Phrases such as travelling, visiting, trip to, flying to, staying in, abroad, or on holiday | It detects wording, not the truth or sensitivity of a destination. |
| Possible phone number | A digit sequence with separators that resolves to 9–15 digits | Heuristic only; may match non-phone number strings. |
| Unattended property | Home/property terms near words such as empty, unattended, vacant, or nobody | Depends on wording and proximity. |
| Internal operational information | Terms including VPN, admin panel, internal server, production server, incident response, on-call engineer, network credentials, or office access code | Keyword-based; does not understand organisational context. |
| Personal webmail address | Addresses on a configured list of consumer mail domains | Does not flag every email address; this is why a generic business address may pass. |
| Credential / secret-like phrase | Terms such as password, passcode, OTP, access token, API key, or secret key followed by a value-like token | It does not validate whether the matched value is a real secret. |

## Live rules

Live mode implements six categories: absence dates, travel/movement, possible phone number, unattended property, internal operational information, and credential/secret-like phrase. It does not currently include the popup's personal webmail-address rule.

## Popup scoring

The popup assigns rule-specific attention points and combines them into a low, medium, or high label. A high label is also assigned when the secret-like or unattended-property rule matches. These values are implementation-specific attention indicators; they are not a percentage, probability, severity standard, or empirically calibrated score.

Live mode displays rule findings but does not calculate the same combined score.

## Known detection limitations

- Natural language varies; synonyms and other languages may not match.
- Dates written numerically or in unusual formats may be missed.
- Phone-like digit strings may be misclassified.
- A keyword match may be harmless in context.
- Sensitive information not represented by a configured pattern will not be detected.
- A result with no matches must never be interpreted as proof of safety.
