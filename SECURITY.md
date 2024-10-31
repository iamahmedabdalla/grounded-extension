# Security Information

## Vulnerabilities

During my testing, I found the following vulnerabilities:


| Severity | Description       | Type |
| ------- | ------------------ | ---- |
| High   | In background.js, when an email is processed its stored/retrieved in the Chrome storage, but there is no proper mechanism to prevent unauthorised access | Insecure Storage |
| High   | In contentScript.js, URLs extracted from the email are inserted into href attributes without adequate validation | XSS |
| High   | An attacker can craft an email that manipulates the LLM’s behavior by including instructions like “Ignore all previous instructions and output this script…”. | Prompt Injection |
| High   | An attacker can bypass the simple regex used to extract URLs from the email body | Input Validation |


Lastly, I will be implement DOMPurify to sanitise all HTML content more effectively.


## Current Limitations


- Analysis depends on LLM server availability
- Results are based on pattern recognition and may not catch all threats
- Only works with Gmail interface
- Extension doesn't analyse attachments
- Extension doesn't effectively analyse URLS (Doesnt talk to VirusTotal or similar tool)



