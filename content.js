// Função para criar o ícone de cópia
function createIcon() {
  const h1 = document.querySelector('h1');
  if (!h1) {
      console.error('Erro: Elemento <h1> não encontrado na página.');
      return;
  }

  // Remove qualquer ícone existente
  const existingIcon = h1.querySelector('.copy-icon');
  if (existingIcon) {
      existingIcon.remove();
  }

  // Cria e estiliza o ícone
  const icon = document.createElement('img');
  icon.src = 'https://i.imgur.com/gLP7ej2.png'; // URL do ícone
  icon.className = 'copy-icon'; // Adiciona uma classe para identificação
  icon.style.cursor = 'pointer';
  icon.style.marginLeft = '5px';
  icon.style.verticalAlign = 'middle';
  icon.style.width = '20px';
  icon.style.height = '20px';

  // Adiciona evento de clique para copiar o link
  icon.addEventListener('click', () => {
      const link = window.location.href;
      const title = h1.innerText.trim();
      const textToCopy = `[${title}](${link})`;

      navigator.clipboard.writeText(textToCopy).then(() => {
          // Efeito visual ao copiar com sucesso
          icon.style.backgroundColor = '#4CAF50'; // Cor verde
          icon.style.borderRadius = '50%'; // Canto arredondado
          setTimeout(() => {
              icon.style.backgroundColor = ''; // Remove a cor após o efeito
          }, 1000); // Duração de 1 segundo
      }).catch(err => {
          console.error('Erro ao copiar para o clipboard:', err);
      });
  });

  h1.appendChild(icon);
}

// Função para remover o ícone de cópia
function removeIcon() {
  const h1 = document.querySelector('h1');
  if (!h1) {
      console.error('Erro: Elemento <h1> não encontrado na página.');
      return;
  }

  const existingIcon = h1.querySelector('.copy-icon');
  if (existingIcon) {
      existingIcon.remove();
  }
}

// Verifica o estado do toggleIcon e executa a função adequada
function checkIconState() {
  chrome.storage.sync.get(['toggleIcon'], function (data) {
      if (data.toggleIcon) {
          createIcon();
      } else {
          removeIcon();
      }
  });
}

// Executa a verificação assim que o conteúdo é carregado
document.addEventListener('DOMContentLoaded', checkIconState);

// Escuta mensagens do `popup.js` para atualizar o estado do ícone
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateIcon') {
      if (message.iconEnabled) {
          createIcon();
      } else {
          removeIcon();
      }
  }
});
