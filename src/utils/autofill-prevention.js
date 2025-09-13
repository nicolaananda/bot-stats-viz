// Prevent autofill overlay conflicts
document.addEventListener("DOMContentLoaded", function() {
  // Disable autofill overlay
  const style = document.createElement("style");
  style.textContent = `
    .autofill-overlay-container,
    [data-autofill-overlay],
    .browser-autofill-overlay {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    input[data-form-type="other"] {
      -webkit-box-shadow: 0 0 0 1000px white inset !important;
      -webkit-text-fill-color: #000 !important;
      background-color: transparent !important;
    }
    
    input[data-form-type="other"]:-webkit-autofill,
    input[data-form-type="other"]:-webkit-autofill:hover,
    input[data-form-type="other"]:-webkit-autofill:focus,
    input[data-form-type="other"]:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px white inset !important;
      -webkit-text-fill-color: #000 !important;
      background-color: transparent !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  `;
  document.head.appendChild(style);

  // Remove any existing autofill overlays
  const removeAutofillOverlays = () => {
    const overlays = document.querySelectorAll(".autofill-overlay-container, [data-autofill-overlay], .browser-autofill-overlay");
    overlays.forEach(overlay => overlay.remove());
  };

  // Run immediately and on mutations
  removeAutofillOverlays();
  
  const observer = new MutationObserver(removeAutofillOverlays);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

  // Prevent autofill on form elements
  const forms = document.querySelectorAll("form");
  forms.forEach(form => {
    form.setAttribute("autocomplete", "off");
    form.setAttribute("data-lpignore", "true");
  });

  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("data-lpignore", "true");
    input.setAttribute("data-form-type", "other");
  });
});
