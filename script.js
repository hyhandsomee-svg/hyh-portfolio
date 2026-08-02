const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const readingIndex = document.querySelector(".reading-state__index");
const readingLabel = document.querySelector(".reading-state__label");
const revealItems = document.querySelectorAll(".reveal");
const immersiveSections = document.querySelectorAll(".immersive-section");
const storyFrames = document.querySelectorAll(".story-frame");
const dock = document.querySelector(".chapter-dock");
const dockLinks = document.querySelectorAll("[data-dock-section]");
const intentFlow = document.querySelector("[data-intent-flow]");
const intentSteps = document.querySelectorAll("[data-flow-step]");
const profileHero = document.querySelector(".profile-hero");
const contactOpen = document.querySelector("[data-contact-open]");
const contactDialog = document.querySelector("[data-contact-dialog]");
const contactClose = document.querySelector("[data-contact-close]");
const languageToggle = document.querySelector("[data-language-toggle]");
const languageCurrent = document.querySelector("[data-language-current]");
const bilingualItems = document.querySelectorAll("[data-zh][data-en]");

const setLanguage = (language) => {
  const isEnglish = language === "en";
  document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  bilingualItems.forEach((item) => {
    item.textContent = isEnglish ? item.dataset.en : item.dataset.zh;
  });
  if (languageCurrent) languageCurrent.textContent = isEnglish ? "中" : "中";
  languageToggle?.setAttribute("aria-pressed", String(isEnglish));
  languageToggle?.setAttribute("aria-label", isEnglish ? "切换为中文" : "Switch to English");
};

languageToggle?.addEventListener("click", () => {
  setLanguage(document.documentElement.lang === "en" ? "zh-CN" : "en");
});

const openContactDialog = () => {
  if (!contactDialog || contactDialog.open) return;
  contactDialog.showModal();
  document.body.classList.add("has-contact-dialog");
};

const closeContactDialog = () => {
  if (!contactDialog?.open) return;
  contactDialog.close();
};

contactOpen?.addEventListener("click", openContactDialog);
contactClose?.addEventListener("click", closeContactDialog);
contactDialog?.addEventListener("click", (event) => {
  if (event.target === contactDialog) closeContactDialog();
});
contactDialog?.addEventListener("close", () => {
  document.body.classList.remove("has-contact-dialog");
  contactOpen?.focus();
});

storyFrames.forEach((frame) => {
  const viewport = frame.querySelector(".frame-viewport");
  if (!viewport || viewport.parentElement?.classList.contains("cockpit-screen")) return;

  const screen = document.createElement("div");
  screen.className = "cockpit-screen";
  screen.setAttribute("aria-label", "车机屏幕作品展示");
  viewport.before(screen);
  screen.append(viewport);
});

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;

  header?.classList.toggle("scrolled", scrollTop > 24);
  document.body.classList.toggle("is-at-hero", scrollTop < window.innerHeight * 0.58);
  if (progress) progress.style.width = `${ratio * 100}%`;
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -8%" },
);

const updateActiveSection = () => {
  const focusPoint = window.innerHeight * 0.35;
  let activeSection = immersiveSections[0];

  immersiveSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= focusPoint && rect.bottom > focusPoint) activeSection = section;
  });

  if (!activeSection) return;
  const section = activeSection.dataset.section;
  const label = activeSection.dataset.label;
  const isCaseChapter = ["01", "02", "03", "04", "05"].includes(section);

  if (readingIndex) readingIndex.textContent = section;
  if (readingLabel) readingLabel.textContent = label;
  dock?.classList.toggle("is-visible", isCaseChapter);

  dockLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.dockSection === section);
  });

  const frameAtFocus = Array.from(storyFrames).some((frame) => {
    const rect = frame.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
  });
  dock?.classList.toggle("is-in-frame", frameAtFocus);
};

const updateIntentFlow = () => {
  if (!intentFlow || !intentSteps.length) return;

  const rect = intentFlow.getBoundingClientRect();
  const viewportPoint = window.innerHeight * 0.52;
  const localProgress = Math.min(Math.max((viewportPoint - rect.top) / rect.height, 0), 1);
  const activeIndex = Math.min(Math.floor(localProgress * intentSteps.length), intentSteps.length - 1);

  intentFlow.style.setProperty("--flow-progress", `${localProgress * 100}%`);
  intentSteps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));
};

const updateFrameDepth = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth <= 720) return;

  storyFrames.forEach((frame) => {
    const screen = frame.querySelector(".cockpit-screen");
    if (!screen) return;
    const rect = frame.getBoundingClientRect();
    const centerOffset = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    const proximity = 1 - Math.min(centerOffset / (window.innerHeight * 0.9), 1);
    screen.style.setProperty("--depth", proximity.toFixed(3));
  });
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollState();
    updateActiveSection();
    updateIntentFlow();
    updateFrameDepth();
    ticking = false;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });

if ("IntersectionObserver" in window) {
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

requestAnimationFrame(() => profileHero?.classList.add("is-entered"));
updateScrollState();
updateActiveSection();
updateIntentFlow();
updateFrameDepth();

const portraitScanner = document.querySelector("[data-portrait-scan]");

if (portraitScanner) {
  const portraitImage = portraitScanner.querySelector(".portrait");
  const codeCanvas = portraitScanner.querySelector("[data-portrait-code]");
  const portraitState = portraitScanner.querySelector("[data-portrait-state]");
  const scanLabel = portraitScanner.querySelector(".portrait-scan-line span");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const characters = "01{}[]<>/\\|;:+-*#";
  let animationFrame = 0;
  let cycleStartedAt = 0;
  let activeCycle = -1;

  const drawCodePortrait = () => {
    if (!portraitImage?.complete || !portraitImage.naturalWidth || !codeCanvas) return;

    const bounds = portraitScanner.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    const source = document.createElement("canvas");
    const sourceContext = source.getContext("2d", { willReadFrequently: true });
    const context = codeCanvas.getContext("2d");
    if (!sourceContext || !context) return;

    codeCanvas.width = width;
    codeCanvas.height = height;
    source.width = width;
    source.height = height;

    const scale = Math.max(width / portraitImage.naturalWidth, height / portraitImage.naturalHeight);
    const imageWidth = portraitImage.naturalWidth * scale;
    const imageHeight = portraitImage.naturalHeight * scale;
    const offsetX = (width - imageWidth) / 2;
    const offsetY = (height - imageHeight) * 0.12;
    sourceContext.clearRect(0, 0, width, height);
    sourceContext.drawImage(portraitImage, offsetX, offsetY, imageWidth, imageHeight);

    const pixels = sourceContext.getImageData(0, 0, width, height).data;
    const cell = Math.max(8, Math.round(9 * ratio));
    context.clearRect(0, 0, width, height);
    context.font = `${Math.max(7, Math.round(8 * ratio))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const alphaAt = (x, y) => pixels[(Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))) * 4 + 3];

    for (let y = cell / 2; y < height; y += cell) {
      for (let x = cell / 2; x < width; x += cell) {
        const alpha = alphaAt(Math.round(x), Math.round(y));
        if (alpha < 42) continue;

        const edge =
          alphaAt(Math.round(x - cell), Math.round(y)) < 34 ||
          alphaAt(Math.round(x + cell), Math.round(y)) < 34 ||
          alphaAt(Math.round(x), Math.round(y - cell)) < 34 ||
          alphaAt(Math.round(x), Math.round(y + cell)) < 34;
        const seed = (Math.round(x / cell) * 17 + Math.round(y / cell) * 29) % 19;
        if (!edge && seed > 11) continue;

        const character = characters[(seed + Math.round(y / cell)) % characters.length];
        if (edge) {
          context.fillStyle = seed % 4 === 0 ? "rgba(255,171,61,0.98)" : "rgba(255,239,214,0.96)";
        } else {
          const opacity = 0.28 + (alpha / 255) * 0.46;
          context.fillStyle = seed % 5 === 0 ? `rgba(255,171,61,${opacity})` : `rgba(218,210,199,${opacity})`;
        }
        context.fillText(character, x, y);
      }
    }
  };

  const smoothStep = (value) => value * value * (3 - 2 * value);
  const animatePortraitScan = (timestamp) => {
    if (!cycleStartedAt) cycleStartedAt = timestamp;
    const cycle = 7200;
    const elapsed = timestamp - cycleStartedAt;
    const cycleIndex = Math.floor(elapsed / cycle);
    const phase = (elapsed % cycle) / cycle;
    const target = cycleIndex % 2 === 0 ? "code" : "human";
    let progress = 0;
    let opacity = 0;

    if (cycleIndex !== activeCycle) {
      activeCycle = cycleIndex;
      portraitScanner.dataset.scanTarget = target;
    }

    if (phase >= 0.12 && phase < 0.5) {
      const pulse = (phase - 0.12) / 0.38;
      progress = smoothStep(pulse);
      opacity = Math.pow(Math.sin(Math.PI * pulse), 0.72) * 0.78;
    } else if (phase >= 0.5) {
      progress = 1;
    }

    portraitScanner.style.setProperty("--scan-progress", `${(progress * 100).toFixed(3)}%`);
    portraitScanner.style.setProperty("--scan-opacity", Math.max(0, opacity).toFixed(3));
    const sourceState = target === "code" ? "HUMAN" : "CODEFORM";
    const targetState = target === "code" ? "CODEFORM" : "HUMAN";
    const nextState = progress < 0.04 ? sourceState : progress > 0.98 ? targetState : "SCANNING";
    if (portraitState && portraitState.textContent !== nextState) portraitState.textContent = nextState;
    if (scanLabel) {
      const nextLabel = target === "code" ? "PULSE / HUMAN → CODE" : "PULSE / CODE → HUMAN";
      if (scanLabel.textContent !== nextLabel) scanLabel.textContent = nextLabel;
    }
    animationFrame = requestAnimationFrame(animatePortraitScan);
  };

  const startPortraitScan = () => {
    cancelAnimationFrame(animationFrame);
    if (reducedMotion.matches) {
      portraitScanner.style.setProperty("--scan-progress", "0%");
      portraitScanner.style.setProperty("--scan-opacity", "0");
      if (portraitState) portraitState.textContent = "HUMAN";
      return;
    }
    cycleStartedAt = 0;
    activeCycle = -1;
    portraitScanner.dataset.scanTarget = "code";
    animationFrame = requestAnimationFrame(animatePortraitScan);
  };

  if (portraitImage?.complete) drawCodePortrait();
  portraitImage?.addEventListener("load", drawCodePortrait, { once: true });
  new ResizeObserver(drawCodePortrait).observe(portraitScanner);
  reducedMotion.addEventListener?.("change", startPortraitScan);
  startPortraitScan();
}

const ambientVideo = document.querySelector("[data-ambient-video]");
const ambientTrack = document.querySelector("[data-ambient-track]");

if (ambientVideo && ambientTrack) {
  ambientTrack.volume = 0.22;

  ambientVideo.addEventListener("play", async () => {
    ambientTrack.currentTime = ambientVideo.currentTime % Math.max(ambientTrack.duration || 60, 1);
    try {
      await ambientTrack.play();
    } catch {
      // Browser autoplay policies can still require a second explicit interaction.
    }
  });

  ambientVideo.addEventListener("pause", () => ambientTrack.pause());
  ambientVideo.addEventListener("ended", () => {
    ambientTrack.pause();
    ambientTrack.currentTime = 0;
  });
  ambientVideo.addEventListener("seeking", () => {
    ambientTrack.currentTime = ambientVideo.currentTime % Math.max(ambientTrack.duration || 60, 1);
  });
  ambientVideo.addEventListener("volumechange", () => {
    ambientTrack.muted = ambientVideo.muted;
  });
}

const simDemo = document.querySelector("[data-sim-demo]");

if (simDemo) {
  const form = simDemo.querySelector("[data-sim-form]");
  const runButton = simDemo.querySelector("[data-sim-run]");
  const status = simDemo.querySelector("[data-sim-status]");
  const stages = Array.from(simDemo.querySelectorAll("[data-stage]"));
  const output = simDemo.querySelector("[data-sim-output]");
  const respondentGrid = simDemo.querySelector("[data-sim-respondents]");
  const cohortCount = simDemo.querySelector("[data-cohort-count]");
  const cohortNote = simDemo.querySelector("[data-cohort-note]");
  const responseProgress = simDemo.querySelector("[data-response-progress]");
  const responseEmpty = simDemo.querySelector("[data-response-empty]");
  const responseCard = simDemo.querySelector("[data-response-card]");
  const liveId = simDemo.querySelector("[data-live-id]");
  const liveType = simDemo.querySelector("[data-live-type]");
  const liveState = simDemo.querySelector("[data-live-state]");
  const liveContext = simDemo.querySelector("[data-live-context]");
  const liveAnswer = simDemo.querySelector("[data-live-answer]");
  const outputMeta = simDemo.querySelector("[data-output-meta]");
  const outputQ1 = simDemo.querySelector("[data-output-q1]");
  const differenceOutput = simDemo.querySelector("[data-output-difference]");
  const nextOutput = simDemo.querySelector("[data-output-next]");
  const recruitmentOutput = simDemo.querySelector("[data-output-recruitment]");

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  const personaTypes = [
    {
      key: "time",
      label: "时间压力型",
      contexts: [
        "工作日通勤约 50 分钟，路线熟悉，驾驶中会优先维持注意力。",
        "常在早高峰并线与改道，能留给语音确认的时间很短。",
        "接送任务和工作消息交叠，倾向让系统减少重复询问。",
      ],
      answers: [
        "“普通推荐直接执行，涉及支付或改道时再确认。”",
        "“连续问两次会打断驾驶，我更需要一句话完成修正。”",
        "“我会说出新的条件，希望系统直接更新当前任务。”",
      ],
    },
    {
      key: "risk",
      label: "风险谨慎型",
      contexts: [
        "经常跨城驾驶，对扣费、路线变更和第三方服务调用较敏感。",
        "使用语音服务频率中等，会在不可撤销操作前核对关键信息。",
        "对系统能力边界保持谨慎，期望看到明确的执行状态。",
      ],
      answers: [
        "“付款、下单和改变目的地前，需要让我确认关键参数。”",
        "“确认次数可以少，但每次都要告诉我会发生什么。”",
        "“我更愿意补充一个条件，再让系统重新给出方案。”",
      ],
    },
    {
      key: "familiar",
      label: "任务熟悉型",
      contexts: [
        "高频使用导航和车控语音，熟悉常用命令与撤销路径。",
        "会组合多个语音指令，对系统连续处理能力有稳定预期。",
        "熟悉车机反馈方式，能快速判断任务是否进入执行阶段。",
      ],
      answers: [
        "“熟悉的任务无需确认，新服务首次调用时提示一次即可。”",
        "“只要有持续状态反馈，我可以接受系统后台处理。”",
        "“我会直接说‘改成沿途并延后半小时’，让任务原位更新。”",
      ],
    },
  ];

  const resetStages = () => {
    stages.forEach((stage) => {
      stage.classList.remove("is-active", "is-complete");
      const state = stage.querySelector("b");
      if (state) state.textContent = "queued";
    });
  };

  const runStage = async (stageIndex, duration = 520) => {
    const stage = stages[stageIndex];
    if (!stage) return;
    stage.classList.add("is-active");
    const state = stage.querySelector("b");
    if (state) state.textContent = "running";
    await wait(duration);
    stage.classList.remove("is-active");
    stage.classList.add("is-complete");
    if (state) state.textContent = "pass";
  };

  const buildVisibleCohort = (sampleSize) => {
    if (!respondentGrid) return [];
    respondentGrid.innerHTML = "";
    const visibleCount = Math.min(12, sampleSize);
    return Array.from({ length: visibleCount }, (_, index) => {
      const type = personaTypes[index % personaTypes.length];
      const person = document.createElement("span");
      person.className = `sim-person is-${type.key}`;
      person.textContent = `R${String(index + 1).padStart(2, "0")}`;
      person.dataset.personType = type.key;
      respondentGrid.appendChild(person);
      return person;
    });
  };

  buildVisibleCohort(24);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (runButton?.disabled) return;

    const topic = simDemo.querySelector("[data-sim-topic]")?.value.trim() || "当前研究主题";
    const audience = simDemo.querySelector("[data-sim-audience]")?.value.trim() || "目标用户";
    const sampleSize = Number(simDemo.querySelector("[data-sim-size]")?.value || 24);
    const questions = Array.from(simDemo.querySelectorAll("[data-sim-question]")).map((input, index) => input.value.trim() || `核心问题 ${index + 1}`);

    if (runButton) runButton.disabled = true;
    if (output) output.hidden = true;
    if (status) status.textContent = "BUILDING COHORT";
    if (responseEmpty) responseEmpty.hidden = false;
    if (responseCard) responseCard.hidden = true;
    if (responseProgress) responseProgress.textContent = `0 / ${sampleSize}`;
    if (cohortCount) cohortCount.textContent = `0 / ${sampleSize} READY`;
    if (cohortNote) cohortNote.textContent = `正在从“${audience}”反推场景类型`;
    resetStages();

    const people = buildVisibleCohort(sampleSize);
    await runStage(0, 540);
    if (cohortNote) cohortNote.textContent = `3 类场景 · ${people.length} / ${sampleSize} 人可见窗口`;
    if (cohortCount) cohortCount.textContent = `${sampleSize} / ${sampleSize} MAPPED`;

    if (status) status.textContent = "GENERATING PERSONAS";
    people.forEach((person, index) => {
      window.setTimeout(() => person.classList.add("is-active"), index * 38);
    });
    await runStage(1, 620);
    people.forEach((person) => person.classList.remove("is-active"));

    if (status) status.textContent = "ISOLATED RESPONSES";
    const responseStage = stages[2];
    responseStage?.classList.add("is-active");
    if (responseStage?.querySelector("b")) responseStage.querySelector("b").textContent = "running";
    if (responseEmpty) responseEmpty.hidden = true;
    if (responseCard) responseCard.hidden = false;

    for (let index = 0; index < people.length; index += 1) {
      const person = people[index];
      const type = personaTypes[index % personaTypes.length];
      person.classList.add("is-active");
      if (liveId) liveId.textContent = `R${String(index + 1).padStart(2, "0")}`;
      if (liveType) liveType.textContent = type.label;
      if (liveState) liveState.textContent = `Q${(index % questions.length) + 1} / answering`;
      if (liveContext) liveContext.textContent = type.contexts[index % type.contexts.length];
      if (liveAnswer) liveAnswer.textContent = type.answers[index % type.answers.length];
      const completed = Math.round(((index + 1) / people.length) * sampleSize);
      if (responseProgress) responseProgress.textContent = `${completed} / ${sampleSize}`;
      await wait(145);
      person.classList.remove("is-active");
      person.classList.add("is-complete");
    }

    responseStage?.classList.remove("is-active");
    responseStage?.classList.add("is-complete");
    if (responseStage?.querySelector("b")) responseStage.querySelector("b").textContent = "pass";
    if (liveState) liveState.textContent = "completed";

    if (status) status.textContent = "ANALYZING RESPONSES";
    await runStage(3, 560);

    if (outputMeta) outputMeta.textContent = `分层预演 · N=${sampleSize} · ${audience}`;
    if (outputQ1) outputQ1.textContent = `Q1 / ${questions[0]}`;
    if (differenceOutput) differenceOutput.textContent = `围绕“${topic}”，时间压力型更关注减少打断；风险谨慎型更关注不可撤销操作前的确认；任务熟悉型更依赖持续状态反馈。`;
    if (nextOutput) nextOutput.textContent = `真人研究待验证 / ${audience}`;
    if (recruitmentOutput) recruitmentOutput.textContent = `在真实任务中核对三类作答差异，并验证“${questions[1]}”受到场景压力影响的程度。`;
    if (output) output.hidden = false;
    if (status) status.textContent = "COMPLETE / SYNTHETIC N=" + sampleSize;
    if (runButton) runButton.disabled = false;
  });
}

const collegePreview = document.querySelector("[data-college-preview]");

if (collegePreview) {
  const frame = collegePreview.querySelector("[data-preview-frame]");
  const stage = collegePreview.querySelector("[data-preview-stage]");
  const shell = collegePreview.querySelector("[data-preview-shell]");
  const status = collegePreview.querySelector("[data-preview-status]");
  const openLink = collegePreview.querySelector("[data-preview-open]");
  const pageButtons = Array.from(collegePreview.querySelectorAll("[data-preview-page]"));
  const deviceButtons = Array.from(collegePreview.querySelectorAll("[data-preview-device]"));
  const viewportSizes = {
    desktop: { width: 1440, height: 900, label: "DESKTOP 1440" },
    mobile: { width: 390, height: 844, label: "MOBILE 390" },
  };
  const pageLabels = {
    home: "HOME",
    course: "COURSE MAP",
    resources: "RESOURCE SEARCH",
  };
  let activePage = "home";
  let activeDevice = "desktop";
  let switchTimer;
  let resizeFrame;

  const updatePreviewSize = () => {
    if (!frame || !stage || !shell) return;
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      const size = viewportSizes[activeDevice];
      const stageStyle = window.getComputedStyle(stage);
      const horizontalPadding = parseFloat(stageStyle.paddingLeft) + parseFloat(stageStyle.paddingRight);
      const verticalPadding = parseFloat(stageStyle.paddingTop) + parseFloat(stageStyle.paddingBottom);
      const availableWidth = Math.max(stage.clientWidth - horizontalPadding, 280);
      const availableHeight = window.innerWidth <= 720 ? 620 : 720;
      const scale = Math.min(availableWidth / size.width, availableHeight / size.height, 1);
      const scaledWidth = Math.round(size.width * scale);
      const scaledHeight = Math.round(size.height * scale);

      shell.style.width = `${scaledWidth}px`;
      shell.style.height = `${scaledHeight}px`;
      shell.style.borderRadius = activeDevice === "mobile" ? "18px" : "8px";
      frame.style.width = `${size.width}px`;
      frame.style.height = `${size.height}px`;
      frame.style.transform = `scale(${scale})`;
      stage.style.minHeight = `${scaledHeight + verticalPadding}px`;

      window.setTimeout(() => {
        if (frame.contentWindow) frame.contentWindow.dispatchEvent(new frame.contentWindow.Event("resize"));
      }, 500);
    });
  };

  const updatePreviewState = () => {
    pageButtons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.previewPage === activePage)));
    deviceButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.previewDevice === activeDevice)));
    if (status) status.textContent = `${pageLabels[activePage]} / ${viewportSizes[activeDevice].label}`;
    updatePreviewSize();
  };

  pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextPage = button.dataset.previewPage;
      const nextSource = button.dataset.previewSrc;
      if (!nextPage || !nextSource || nextPage === activePage) return;

      activePage = nextPage;
      collegePreview.classList.add("is-switching");
      window.clearTimeout(switchTimer);
      switchTimer = window.setTimeout(() => {
        if (frame) frame.src = nextSource;
        if (openLink) openLink.href = nextSource;
      }, 150);
      updatePreviewState();
    });
  });

  deviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextDevice = button.dataset.previewDevice;
      if (!nextDevice || nextDevice === activeDevice) return;
      activeDevice = nextDevice;
      updatePreviewState();
    });
  });

  frame?.addEventListener("load", () => {
    collegePreview.classList.remove("is-switching");
    try {
      frame.contentDocument.documentElement.style.scrollBehavior = "smooth";
      frame.contentWindow.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      // The local prototype is same-origin; this remains a fallback for hosted previews.
    }
  });

  if ("ResizeObserver" in window && stage) {
    new ResizeObserver(updatePreviewSize).observe(stage);
  }
  window.addEventListener("resize", updatePreviewSize, { passive: true });
  updatePreviewState();
}
