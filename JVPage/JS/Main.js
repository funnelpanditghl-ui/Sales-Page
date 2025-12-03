document.querySelectorAll(".tp-tabs-section").forEach(section => {
  const buttons = section.querySelectorAll(".tp-tab-btn");
  const panes   = section.querySelectorAll(".tp-pane");
  if (!buttons.length || !panes.length) return;

  function activateTab(tabId){
    buttons.forEach(btn =>
      btn.classList.toggle("active", btn.dataset.tab === tabId)
    );
    panes.forEach(pane =>
      pane.classList.toggle("active", pane.dataset.tab === tabId)
    );
  }

  const firstBtn = buttons[0];
  if (firstBtn) activateTab(firstBtn.dataset.tab);

  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => activateTab(btn.dataset.tab));
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
});
