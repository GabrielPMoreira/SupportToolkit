document.addEventListener('DOMContentLoaded', function () {
  const preferencesForm = document.getElementById('preferences-form');
  const confirmationMessage = document.getElementById('confirmation-message');

  // Load saved preferences
  chrome.storage.sync.get(['param1', 'param2'], function (data) {
      if (data.param1) document.getElementById('param1').checked = data.param1;
      if (data.param2) document.getElementById('param2').checked = data.param2;
  });

  preferencesForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const param1 = document.getElementById('param1').checked;
      const param2 = document.getElementById('param2').checked;

      // Save preferences
      chrome.storage.sync.set({ param1, param2 }, function () {
          confirmationMessage.classList.remove('hidden');
          setTimeout(function () {
              confirmationMessage.classList.add('hidden');
          }, 2000);
      });
  });
});
