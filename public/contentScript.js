// console.log("contentScript.js loaded");

const getEmailData = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 500; 

  const waitForElement = (selector) => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          resolve(element);
        } else if (retries >= MAX_RETRIES) {
         
          clearInterval(interval);
          reject(new Error(`Element ${selector} not found`));
        }
        retries++;
      }, RETRY_DELAY);
    });
  };

  try {

    await waitForElement("h2.hP");
    await waitForElement(".gD");


    const emailSubject =
      document.querySelector("h2.hP")?.textContent.trim() || "No subject found";
    const senderElement = document.querySelector(".gD");
    const emailSenderName =
      senderElement?.textContent.trim() || "Unknown sender";
    const emailSenderEmail =
      senderElement?.getAttribute("email") || "Unknown email";
    const emailDate =
      document.querySelector("span.g3")?.textContent.trim() || "No date found";
    const emailBodyElement = document.querySelector("div.a3s");
    const emailBody =
      emailBodyElement?.textContent.trim().replace(/\s+/g, " ") ||
      "No body found";

    // Extract URLs from 'a' elements
    const emailURLsFromLinks = emailBodyElement
      ? Array.from(emailBodyElement.querySelectorAll("a[href]")).map(
          (a) => a.href
        )
      : [];

    // Extract URLs from plain text using regex
    const urlRegex = /https?:\/\/[^\s<>"']+/g; // Security Issue: This is simple regex.

    const textContent = emailBodyElement?.innerHTML || "";
    const emailURLsFromText = [...textContent.matchAll(urlRegex)].map(
      (match) => match[0]
    );


    const combinedUrls = [...emailURLsFromLinks, ...emailURLsFromText];
    const uniqueUrls = Array.from(new Set(combinedUrls));


    const uniqueDomainNames = new Set();
    uniqueUrls.forEach((url) => {
      try {
        const domainName = new URL(url).hostname;
        uniqueDomainNames.add(domainName);
      } catch (e) {

      }
    });


    const emailSenderDomain = emailSenderEmail
      .split("@")
      .pop()
      .replace(">", "")
      .split(".")
      .slice(-2)
      .join(".");


    const emailId = window.location.href.split("/").pop().split("?")[0];

    return {
      subject: emailSubject,
      senderName: emailSenderName,
      senderEmail: emailSenderEmail,
      date: emailDate,
      senderDomain: emailSenderDomain,
      body: emailBody,
      urls: uniqueUrls,
      uniqueDomains: Array.from(uniqueDomainNames),
      emailId: emailId,
      version: "1.1",
      extractionTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error extracting email data:", error);
    return null;
  }
};


const injectEmailScanningUI = () => {
  // Remove existing injected UI if any
  const existingUI = document.getElementById("injected-email-details");
  if (existingUI) {
    existingUI.remove();
  }


  const container = document.createElement("div");
  container.id = "injected-email-details";
  container.style.cssText = `
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 97%;
        background-color: #fdff6e;
        border-radius: 15px;
        margin: 10px 0;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
        line-height: 1.6;
        transition: all 0.3s ease;
    `;


  const content = `
        <p>Scanning this email</p>
        <span class="loader">⌛</span>
    `;

  container.innerHTML = content;


  const emailContainer = document.querySelector(".a3s.aiL");
  if (emailContainer) {
    emailContainer.parentNode.insertBefore(container, emailContainer);
  }
};


const injectEmailResultsUI = (
  emailData,
  results,
  scanDate,
  classification,
  confidence,
  status
) => {
  const container = document.getElementById("injected-email-details");
  if (!container) return;


  const backgroundColors = {
    Danger: "#ffcdd2",
    Caution: "#ffeb3b",
    Legitimate: "#c8e6c9",
    Default: "#a4a1f7",
  };

  container.style.backgroundColor =
    backgroundColors[classification] || backgroundColors.Default;
  container.style.flexDirection = "column";
  container.style.alignItems = "flex-start";

  injectStyles();

  const sanitiseHTML = (html) => {
    const temp = document.createElement("div");
    temp.textContent = html;
    return temp.innerHTML;
  };

  const content = `
   ${
     status === "Success"
       ? ""
       : `<h3 class="email-suspicion suspicious">Email Not Scanned. Please try again</h3>`
   }
    <h2 class="email-subject">Subject: ${sanitiseHTML(emailData.subject)}</h2>
    <div class="email-summary">
      <p><strong>Classification:</strong> ${sanitiseHTML(
        classification || "N/A"
      )}</p>
      
      <p><strong>From Name:</strong> ${sanitiseHTML(
        emailData.senderName || "N/A"
      )}</p>
      <p><strong>From Email:</strong> ${sanitiseHTML(
        emailData.senderEmail || "N/A"
      )}</p>
      <p><strong>Scan Date:</strong> ${sanitiseHTML(
        scanDate ? new Date(scanDate).toLocaleString() : "N/A"
      )}. But you received this email on <strong>${sanitiseHTML(
    emailData.date || "N/A"
  )}</strong></p>
    </div>
    <div class="toggle-section">
      <h3 class="toggle-header" data-target="analysis">LLM Analysis <span class="toggle-icon">▼</span></h3>
      <div class="toggle-content hidden" id="analysis">
        <p>${results || "No analysis available."}</p>
      </div>
    </div>
    <div class="toggle-section">
      <h3 class="toggle-header" data-target="content">Content Found <span class="toggle-icon">▼</span></h3>
      <div class="toggle-content hidden" id="content">
        <p>${sanitiseHTML(emailData.body || "No body found.")}</p>
      </div>
    </div>
    <div class="toggle-section">
      <h3 class="toggle-header" data-target="urls">URLs Found <span class="toggle-icon">▼</span></h3>
      <div class="toggle-content hidden" id="urls">
        <ul>
          ${(emailData.urls || [])
            .map(
              (url) =>
                `<li><a href="${sanitiseHTML(
                  url
                )}" target="_blank">${sanitiseHTML(url)}</a></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>
    <div class="toggle-section">
      <h3 class="toggle-header" data-target="domains">Unique Domains Found (${
        emailData.uniqueDomains.length
      })
        <span class="toggle-icon">▼</span>
      </h3>
      <div class="toggle-content hidden" id="domains">
        <ul>
          ${(emailData.uniqueDomains || [])
            .map((domain) => `<li>${sanitiseHTML(domain)}</li>`)
            .join("")}
        </ul>
      </div>
    </div>
    <button id="toggle-highlight" class="highlight-button">Show/Hide Areas Scanned</button>
    <button id="rescan-button" class="rescan-button">Rescan Email</button>
   
  `;

  container.innerHTML = content;

  // Add event listeners for toggles
  const toggleHeaders = container.querySelectorAll(".toggle-header");
  toggleHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const targetId = header.dataset.target;
      const content = container.querySelector(`#${targetId}`);
      if (content) {
        content.classList.toggle("hidden");
        // Change the arrow icon
        const icon = header.querySelector(".toggle-icon");
        if (icon) {
          icon.textContent = content.classList.contains("hidden") ? "▼" : "▲";
        }
      }
    });
  });

  // Highlight Toggle Button
  const toggleButton = container.querySelector("#toggle-highlight");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const contentElements = document.querySelectorAll("div.a3s");
      contentElements.forEach((element) => {
        if (element.textContent.trim().length > 0) {
          element.style.backgroundColor = element.style.backgroundColor
            ? ""
            : "rgba(0, 128, 0, 0.2)";
        }
      });
    });
  }

  // Rescan Button
  const rescanButton = container.querySelector("#rescan-button");
  if (rescanButton) {
    rescanButton.addEventListener("click", () => {
      injectEmailScanningUI();
      processEmailData(emailData);
    });
  }
};

// Function to inject the email results UI in case of errors
const injectErrorUI = (error) => {
  const container = document.getElementById("injected-email-details");
  if (!container) return;

  container.style.backgroundColor = "#ffcdd2";
  container.style.flexDirection = "column";
  container.style.alignItems = "flex-start";

  injectStyles();

  const sanitiseHTML = (html) => {
    const temp = document.createElement("div");
    temp.textContent = html;
    return temp.innerHTML;
  };

  const content = `
    <h3 class="email-suspicion suspicious">Error: ${sanitiseHTML(
      error.message
    )}</h3>
    <button id="rescan-button" class="rescan-button">Rescan Email</button>
    <button id="refresh-page" class="rescan-button">Refresh Page</button>
  `;

  container.innerHTML = content;

  // Rescan Button
  const rescanButton = container.querySelector("#rescan-button");
  if (rescanButton) {
    rescanButton.addEventListener("click", async () => {
      try {
        const emailData = await getEmailData();
        injectEmailScanningUI();
        processEmailData(emailData);
      } catch (err) {
        injectErrorUI(err);
        console.error("Error during rescan:", err);
      }
    });
  }

  const refreshButton = container.querySelector("#refresh-page");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      try {
        window.location.reload();
      } catch (err) {
        console.error("Error refreshing page:", err);
      }
    });
  }
};

// Inject Styles
const injectStyles = () => {
  const styles = `
    #injected-email-details {
              width: 97%;
    border-radius: 8px;
    margin: 10px 0;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    line-height: 1.6;
    transition: all 0.3s ease;
      }
      #injected-email-details h2.email-subject {
          font-size: 16px;
          margin: 0;
      }
      #injected-email-details .email-summary {
          margin-top: 10px;
          font-size: 14px;
      }
      #injected-email-details .toggle-section {
          margin-top: 10px;
          border-top: 1px solid #eee;
      }
      #injected-email-details .toggle-header {
          cursor: pointer;
          margin: 10px 0;
          font-size: 14px;
          color: #007bff;
      }
      #injected-email-details .toggle-content.hidden {
          display: none;
      }
      #injected-email-details .toggle-content {
          margin-top: 5px;
      }
      #injected-email-details .highlight-button {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
      }
      #injected-email-details .highlight-button:hover {
          background-color: #0056b3;
      }
      #injected-email-details .email-suspicion {
          margin-top: 10px;
          padding: 5px;
          font-size: 14px;
      }
      #injected-email-details .email-suspicion.suspicious {
          color: #ff0000;
      }
      #injected-email-details .email-suspicion.safe {
          color: #00ff00;
      }
      .processing-ui {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 97%;
          background-color: #fdff6e;
          border-radius: 15px;
          margin: 10px 0;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
          line-height: 1.6;
          transition: all 0.3s ease;
      }
      .processing-ui .loader {
          font-size: 24px;
      }
      .rescan-button {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
      }
      .rescan-button:hover {
          background-color: #0056b3;
      }
      
      .scanned-highlight {
          background-color: yellow;
        }
  `;

  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
};

// Variable to store the last processed email ID
let lastProcessedEmailId = null;


function processEmailData(emailData) {
  // Try three times before giving up
  const MAX_RETRIES = 3;
  let retryCount = 0;

  function attemptProcessing() {
    chrome.runtime.sendMessage(
      { action: "foundThisEmail", data: emailData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError);
          handleError(new Error(chrome.runtime.lastError.message));
        } else if (!response || !response.data) {
          console.error("Invalid response from background script:", response);
          handleError(new Error(response.message));
        } else {
          // Show the results
          const disclaimer = "<h3> Disclaimer </h3> This LLM can make mistakes, please be mindful.";
          injectEmailResultsUI(
            emailData,
            response.data.results + disclaimer,
            response.data.scanDate,
            response.data.classification,
            response.data.confidence,
            response.status
          );
          // console.log("Email processed, got this response", response);
        }
      }
    );
  }

  function handleError(error) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying (${retryCount}/${MAX_RETRIES}) in 10 seconds`);
      setTimeout(attemptProcessing, 10000 * retryCount); // waiting for 10s
    } else {
      console.error("Max retries reached. Issue is " + error);
      injectErrorUI(error);
    }
  }

  attemptProcessing();
}

// Function to handle email data changes
const handleEmailDataChange = async () => {
  try {
    const emailData = await getEmailData();

    if (!emailData) {
      throw new Error("Failed to retrieve email data.");
    }

    if (emailData.emailId === lastProcessedEmailId) {
      return;
    }

    lastProcessedEmailId = emailData.emailId;

    // Inject the scanning UI
    injectEmailScanningUI();

    // Process the email data
    processEmailData(emailData);
  } catch (error) {
    injectErrorUI(error);
    console.error("Error handling email data change:", error);
  }
};

// Variable to store the current URL
let currentUrl = window.location.href;

// Function to check for URL changes
const checkUrlChange = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;

    // Wait for the DOM to update after URL change
    setTimeout(() => {
      if (document.querySelector("h2.hP")) {
        handleEmailDataChange();
      }
    }, 1000); // Delay of 1 second
  }
};

// Set up an interval to check for URL changes
setInterval(checkUrlChange, 500); // Check every 500ms

// Add initial check when content script loads
const initializeExtension = () => {
  if (document.querySelector("h2.hP")) {
    handleEmailDataChange();
  } else {
    // If email header not found immediately, wait and try again
    setTimeout(() => {
      if (document.querySelector("h2.hP")) {
        handleEmailDataChange();
      }
    }, 1000);
  }
};

// Run initialization
initializeExtension();
