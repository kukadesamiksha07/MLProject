/**
 * JobShield AI — Frontend Application Logic
 * Integrates directly with Flask /predict endpoint
 * Manages UI interactions, risk gauge rendering, and browser history
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // DOM Elements
  const form = document.getElementById("job-analyzer-form");
  const jobDescriptionInput = document.getElementById("job-description");
  const jobTitleInput = document.getElementById("job-title");
  const companyNameInput = document.getElementById("company-name");
  const companyWebsiteInput = document.getElementById("company-website");
  const salaryRangeInput = document.getElementById("salary-range");
  const jobUrlInput = document.getElementById("job-url");

  const charCounter = document.getElementById("char-counter");
  const analyzeBtn = document.getElementById("btn-analyze-submit");
  const clearBtn = document.getElementById("btn-clear-form");
  const errorBanner = document.getElementById("error-banner");
  const errorText = document.getElementById("error-text");
  const loadingIndicator = document.getElementById("loading-indicator");
  const loadingSubtext = document.getElementById("loading-subtext");

  // Results Elements
  const resultsContainer = document.getElementById("results-container");
  const resultCard = document.getElementById("result-card");
  const verdictBadge = document.getElementById("verdict-badge");
  const verdictBadgeText = document.getElementById("verdict-badge-text");
  const verdictBadgeIcon = document.getElementById("verdict-badge-icon");
  const riskLevelTag = document.getElementById("risk-level-tag");
  const verdictTitle = document.getElementById("verdict-title");
  const verdictExplanation = document.getElementById("verdict-explanation");
  const gaugeFill = document.getElementById("gauge-fill");
  const gaugeValue = document.getElementById("gauge-value");
  const fraudSignalsList = document.getElementById("fraud-signals-list");
  const legitSignalsList = document.getElementById("legit-signals-list");
  const btnScanAnother = document.getElementById("btn-scan-another");

  // History Elements
  const historyTableBody = document.getElementById("history-table-body");
  const emptyHistoryState = document.getElementById("history-empty-state");
  const historyTableWrap = document.getElementById("history-table-wrap");
  const btnClearHistory = document.getElementById("btn-clear-history");

  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navLinks = document.getElementById("nav-links");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("mobile-open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Accordion Toggle for Optional Metadata Inputs
  const accordionTrigger = document.getElementById("optional-accordion-trigger");
  const optionalFields = document.getElementById("optional-fields-content");

  if (accordionTrigger && optionalFields) {
    accordionTrigger.addEventListener("click", () => {
      const isOpen = optionalFields.classList.toggle("show");
      accordionTrigger.classList.toggle("open", isOpen);
      const textSpan = accordionTrigger.querySelector("span");
      if (textSpan) {
        textSpan.textContent = isOpen
          ? "Hide Optional Job Details"
          : "Add Optional Job Details (Title, Company, Salary, Links)";
      }
    });
  }

  // Live Character and Word Counter
  if (jobDescriptionInput && charCounter) {
    const updateCounts = () => {
      const len = jobDescriptionInput.value.length;
      const words = jobDescriptionInput.value.trim()
        ? jobDescriptionInput.value.trim().split(/\s+/).length
        : 0;
      charCounter.textContent = `${len.toLocaleString()} chars • ${words} words`;
    };
    jobDescriptionInput.addEventListener("input", updateCounts);
    updateCounts();
  }

  // Sample Presets Loading (Scam / Legitimate / Corporate)
  let cachedSamples = null;

  async function fetchSamples() {
    if (cachedSamples) return cachedSamples;
    try {
      const res = await fetch("/api/samples");
      if (res.ok) {
        cachedSamples = await res.json();
        return cachedSamples;
      }
    } catch (e) {
      console.warn("Could not fetch remote samples, using fallback presets.", e);
    }
    return null;
  }

  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sampleType = btn.getAttribute("data-sample");
      const samples = await fetchSamples();

      let target = null;
      if (samples && Array.isArray(samples)) {
        target = samples.find((s) => s.id === sampleType);
      }

      // Hardcoded fallback sample data in case offline or API is down
      if (!target) {
        if (sampleType === "sample-scam") {
          target = {
            title: "Data Entry Specialist (Work From Home)",
            company: "Global Career Staffing Inc.",
            website: "http://secure-quick-apply.biz/data",
            salary: "$45/hour (Immediate Start)",
            url: "http://telegram.me/career_recruiter_direct",
            description:
              "URGENT HIRING! Work from home full-time or part-time as a Data Entry Specialist. " +
              "No experience required. Earn $4,500 every month. Immediate job offer without formal interview. " +
              "Selected candidates will receive a cashier check of $2,500 for home-office equipment via wire transfer. " +
              "A one-time administrative registration fee of $49 is required before your contract letter is finalized. " +
              "Apply using link or contact recruiter on Telegram directly."
          };
        } else if (sampleType === "sample-legit") {
          target = {
            title: "Senior Frontend Engineer (React / TypeScript)",
            company: "CloudSphere Technologies Inc.",
            website: "https://www.cloudspheretech.io",
            salary: "$130,000 - $160,000 / year",
            url: "https://careers.cloudspheretech.io/jobs/fe-eng-2026",
            description:
              "CloudSphere Technologies is seeking a Senior Frontend Engineer to join our core web architecture team. " +
              "In this role, you will design, develop, and maintain high-performance user interfaces for our enterprise observability platform.\n" +
              "Requirements:\n" +
              "- 5+ years of experience with modern TypeScript, React, and CSS architecture.\n" +
              "- Strong understanding of web performance, browser rendering, and accessibility standards.\n" +
              "- Experience building automated unit and integration tests (Jest, Playwright).\n" +
              "- Strong cross-functional collaboration with product management and design teams.\n" +
              "Benefits include medical/dental/vision coverage, 401(k) matching, flexible PTO, and annual learning stipends."
          };
        } else {
          target = {
            title: "Executive Administrative Coordinator",
            company: "Apex Financial Partners",
            website: "https://www.apexfinpartners.com",
            salary: "$65,000 - $75,000 / year",
            url: "https://www.apexfinpartners.com/careers/admin-coord",
            description:
              "Apex Financial Partners is looking for an organized and detail-oriented Executive Administrative Coordinator " +
              "to support our senior leadership team at our Chicago headquarters. " +
              "Responsibilities include managing complex executive calendars, coordinating international and domestic travel arrangements, " +
              "preparing quarterly board meeting presentation materials, and liaising with external corporate clients.\n" +
              "Qualifications:\n" +
              "- Bachelor's degree or equivalent professional administrative experience.\n" +
              "- Proficiency in Microsoft Office Suite (Excel, PowerPoint, Outlook) and digital document workflows.\n" +
              "- Impeccable verbal and written communication abilities.\n" +
              "Background check and reference verification conducted upon conditional employment offer."
          };
        }
      }

      if (target) {
        jobDescriptionInput.value = target.description || "";
        jobTitleInput.value = target.title || "";
        companyNameInput.value = target.company || "";
        companyWebsiteInput.value = target.website || "";
        salaryRangeInput.value = target.salary || "";
        jobUrlInput.value = target.url || "";

        // Open optional fields so user sees populated metadata
        if (optionalFields && !optionalFields.classList.contains("show")) {
          optionalFields.classList.add("show");
          if (accordionTrigger) {
            accordionTrigger.classList.add("open");
            const textSpan = accordionTrigger.querySelector("span");
            if (textSpan) textSpan.textContent = "Hide Optional Job Details";
          }
        }

        // Trigger character counter
        const event = new Event("input", { bubbles: true });
        jobDescriptionInput.dispatchEvent(event);

        hideError();
        jobDescriptionInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  // Clear Form Button
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      form.reset();
      hideError();
      resultsContainer.classList.remove("show");
      const event = new Event("input", { bubbles: true });
      jobDescriptionInput.dispatchEvent(event);
    });
  }

  // Scan Another Job Button
  if (btnScanAnother) {
    btnScanAnother.addEventListener("click", () => {
      resultsContainer.classList.remove("show");
      jobDescriptionInput.focus();
      jobDescriptionInput.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Form Submission & Real Backend Classification
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError();

      const description = jobDescriptionInput.value.trim();
      const title = jobTitleInput.value.trim();
      const company = companyNameInput.value.trim();
      const website = companyWebsiteInput.value.trim();
      const salary = salaryRangeInput.value.trim();
      const url = jobUrlInput.value.trim();

      // Client-side Validation
      if (!description) {
        showError("Please enter or paste a job description to analyze.");
        jobDescriptionInput.focus();
        return;
      }

      if (description.length < 15) {
        showError("The job description is too short. Please provide at least 15 characters for machine learning evaluation.");
        jobDescriptionInput.focus();
        return;
      }

      // Enter Loading State
      setLoading(true);

      try {
        const response = await fetch("/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            description,
            title,
            company,
            website,
            salary,
            url
          })
        });

        const data = await response.json();

        if (!response.ok) {
          const message = data.error || `Server responded with status code ${response.status}.`;
          showError(message);
          setLoading(false);
          return;
        }

        // Success: Render real model predictions
        renderResults(data, { title, company, description });
        saveToLocalHistory(data, { title, company, description });

      } catch (err) {
        console.error("Fetch error:", err);
        showError(
          "Unable to connect to the JobShield AI Flask backend. Please ensure the server is running on http://127.0.0.1:5000."
        );
      } finally {
        setLoading(false);
      }
    });
  }

  // Render Machine Learning Predictions
  function renderResults(data, inputMeta) {
    const isFraud = data.prediction === "Potentially Fraudulent";
    const probability = typeof data.fraud_probability === "number" ? data.fraud_probability : 0;
    const riskLevel = data.risk_level || (isFraud ? "High Risk" : "Low Risk");

    // 1. Update Card Styling
    resultCard.classList.remove("fraud", "legit");
    resultCard.classList.add(isFraud ? "fraud" : "legit");

    // 2. Verdict Badge
    verdictBadge.classList.remove("badge-fraud", "badge-legit");
    verdictBadge.classList.add(isFraud ? "badge-fraud" : "badge-legit");

    if (verdictBadgeText) {
      verdictBadgeText.textContent = data.prediction;
    }

    if (verdictBadgeIcon) {
      verdictBadgeIcon.setAttribute("data-lucide", isFraud ? "alert-triangle" : "shield-check");
    }

    // 3. Risk Level Tag
    if (riskLevelTag) {
      riskLevelTag.textContent = riskLevel;
      const riskTone = data.risk_tone || (isFraud ? "critical" : "safe");
      riskLevelTag.classList.remove("risk-safe", "risk-warning", "risk-critical");
      riskLevelTag.classList.add(
        riskTone === "warning" ? "risk-warning" :
        riskTone === "critical" ? "risk-critical" : "risk-safe"
      );
    }

    // 4. Headline and Explanation
    if (verdictTitle) {
      verdictTitle.textContent = isFraud
        ? "Warning: Suspicious Recruitment Patterns Detected"
        : "Standard Recruitment Patterns Identified";
    }

    if (verdictExplanation) {
      verdictExplanation.textContent = isFraud
        ? `The model evaluated the vocabulary and linguistic structure of this posting and identified statistical markers commonly associated with fraudulent recruitment operations (${probability}% estimated probability).`
        : `The model evaluated this posting and determined its vocabulary and phrasing align with established legitimate employment advertisements (${(100 - probability).toFixed(1)}% estimated legitimacy).`;
    }

    // 5. Circular Risk Meter Animation
    animateGauge(probability, isFraud);

    // 6. Linguistic Evidence Chips (Real Model Weights)
    renderSignals(data.signals);

    // 7. Reveal & Refresh Icons
    resultsContainer.classList.add("show");
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Smooth scroll to results
    resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Gauge Animation Helper
  function animateGauge(percentage, isFraud) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius; // ~339.29

    // Gauge Color
    let strokeColor = "#56d6a7"; // Safe Emerald
    if (percentage >= 70) {
      strokeColor = "#ff7185"; // Danger Red
    } else if (percentage >= 40) {
      strokeColor = "#f3b65b"; // Warning Amber
    }

    if (gaugeFill) {
      gaugeFill.style.stroke = strokeColor;
      // Calculate offset: 0% = 339, 100% = 0
      const offset = circumference - (circumference * percentage) / 100;
      gaugeFill.style.strokeDasharray = `${circumference}`;
      gaugeFill.style.strokeDashoffset = `${offset}`;
    }

    // Animate Number Count-Up
    if (gaugeValue) {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = (percentage * easeOut).toFixed(1);
        gaugeValue.textContent = `${currentVal}%`;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          gaugeValue.textContent = `${percentage.toFixed(1)}%`;
        }
      }
      requestAnimationFrame(updateNumber);
    }
  }

  // Render Linguistic Signals Chips
  function renderSignals(signals) {
    if (!fraudSignalsList || !legitSignalsList) return;

    fraudSignalsList.innerHTML = "";
    legitSignalsList.innerHTML = "";

    const fraudSignals = signals && signals.fraud_signals ? signals.fraud_signals : [];
    const legitSignals = signals && signals.legit_signals ? signals.legit_signals : [];

    if (fraudSignals.length === 0) {
      fraudSignalsList.innerHTML = '<span class="signal-chip">None detected above threshold</span>';
    } else {
      fraudSignals.forEach((sig) => {
        const chip = document.createElement("span");
        chip.className = "signal-chip fraud-chip";
        chip.innerHTML = `<span>${escapeHtml(sig.term)}</span> <span class="signal-weight">+${sig.weight}</span>`;
        fraudSignalsList.appendChild(chip);
      });
    }

    if (legitSignals.length === 0) {
      legitSignalsList.innerHTML = '<span class="signal-chip">None detected above threshold</span>';
    } else {
      legitSignals.forEach((sig) => {
        const chip = document.createElement("span");
        chip.className = "signal-chip legit-chip";
        chip.innerHTML = `<span>${escapeHtml(sig.term)}</span> <span class="signal-weight">-${sig.weight}</span>`;
        legitSignalsList.appendChild(chip);
      });
    }
  }

  // Local Browser History Management (localStorage)
  const STORAGE_KEY = "jobshield_recent_analyses_v1";

  function loadLocalHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Could not read localStorage history:", e);
      return [];
    }
  }

  function saveToLocalHistory(data, inputMeta) {
    try {
      const history = loadLocalHistory();
      const newEntry = {
        id: "job-" + Date.now(),
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString(),
        title: inputMeta.title || "Job Description Analysis",
        company: inputMeta.company || "Unknown Company",
        snippet: inputMeta.description.slice(0, 80) + (inputMeta.description.length > 80 ? "..." : ""),
        fullDescription: inputMeta.description,
        fullTitle: inputMeta.title,
        fullCompany: inputMeta.company,
        prediction: data.prediction,
        probability: data.fraud_probability,
        riskLevel: data.risk_level || (data.prediction === "Potentially Fraudulent" ? "High Risk" : "Low Risk")
      };

      // Keep only up to 8 recent entries
      const updated = [newEntry, ...history.filter(h => h.snippet !== newEntry.snippet)].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      renderHistoryTable();
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  function renderHistoryTable() {
    if (!historyTableBody) return;

    const history = loadLocalHistory();
    historyTableBody.innerHTML = "";

    if (history.length === 0) {
      if (emptyHistoryState) emptyHistoryState.style.display = "block";
      if (historyTableWrap) historyTableWrap.style.display = "none";
      return;
    }

    if (emptyHistoryState) emptyHistoryState.style.display = "none";
    if (historyTableWrap) historyTableWrap.style.display = "block";

    history.forEach((item) => {
      const row = document.createElement("tr");
      const isFraud = item.prediction === "Potentially Fraudulent";
      const badgeClass = isFraud ? "badge-fraud" : "badge-legit";

      row.innerHTML = `
        <td class="mono" style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(item.date)}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.company)}</div>
        </td>
        <td>
          <span class="verdict-badge ${badgeClass}" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
            ${escapeHtml(item.prediction)}
          </span>
        </td>
        <td class="mono" style="font-weight: 700; color: ${isFraud ? 'var(--status-danger)' : 'var(--status-safe)'};">
          ${item.probability}%
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm btn-reload-history" data-id="${item.id}" title="Reload this job into the form">
            <i data-lucide="rotate-ccw" style="width: 13px; height: 13px;"></i> Reload
          </button>
        </td>
      `;

      historyTableBody.appendChild(row);
    });

    // Attach reload listeners
    document.querySelectorAll(".btn-reload-history").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const entry = history.find((h) => h.id === id);
        if (entry) {
          jobDescriptionInput.value = entry.fullDescription || "";
          jobTitleInput.value = entry.fullTitle || "";
          companyNameInput.value = entry.fullCompany || "";
          const event = new Event("input", { bubbles: true });
          jobDescriptionInput.dispatchEvent(event);
          jobDescriptionInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Clear Local History Button
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your local analysis history?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderHistoryTable();
      }
    });
  }

  // Initial History Render
  renderHistoryTable();

  // Loading State Helper
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon" style="animation: spin 1s linear infinite;"></i> Analyzing posting...`;
      loadingIndicator.classList.add("show");
      resultsContainer.classList.remove("show");

      if (loadingSubtext) {
        loadingSubtext.textContent = "Tokenizing words and removing stop words...";
        setTimeout(() => {
          if (loadingIndicator.classList.contains("show")) {
            loadingSubtext.textContent = "Extracting TF-IDF n-gram vectors (50,000 features)...";
          }
        }, 350);
        setTimeout(() => {
          if (loadingIndicator.classList.contains("show")) {
            loadingSubtext.textContent = "Evaluating logistic regression decision boundary...";
          }
        }, 700);
      }
    } else {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `<i data-lucide="search" style="width: 16px; height: 16px;"></i> Analyze Job Posting`;
      loadingIndicator.classList.remove("show");
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Error Banner Helpers
  function showError(msg) {
    if (errorBanner && errorText) {
      errorText.textContent = msg;
      errorBanner.classList.add("show");
      errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function hideError() {
    if (errorBanner) {
      errorBanner.classList.remove("show");
    }
  }

  // Security Helper: Escape HTML strings
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
