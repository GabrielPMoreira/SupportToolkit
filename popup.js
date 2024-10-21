document.addEventListener('DOMContentLoaded', function () {
    const settingsIcon = document.getElementById('settings-icon');
    const preferencesArea = document.getElementById('preferences-area');
    const functionalitySelect = document.getElementById('functionality-select');
    const contentArea = document.getElementById('content-area');
    const preferencesForm = document.getElementById('preferences-form');
    const confirmationMessage = document.getElementById('confirmation-message');
    const toggleIcon = document.getElementById('toggleIcon'); // Verifique se o ID do checkbox está correto

    // Verifica se o elemento `toggleIcon` existe antes de acessar suas propriedades
    if (toggleIcon) {
        // Carregar preferências salvas e ativar o ícone se necessário
        chrome.storage.sync.get(['toggleIcon', 'param2'], function (data) {
            if (data.toggleIcon !== undefined) {
                toggleIcon.checked = data.toggleIcon;
            }
            if (data.param2 !== undefined) {
                const param2Checkbox = document.getElementById('param2');
                if (param2Checkbox) {
                    param2Checkbox.checked = data.param2;
                }
            }

            console.log('Preferências carregadas:', data);

            // Atualizar o ícone conforme o estado inicial de 'toggleIcon'
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) {
                    console.error('Erro: Nenhuma aba ativa encontrada.');
                    return;
                }
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: updateIcon,
                    args: [data.toggleIcon || false]
                });
            });
        });

        preferencesForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const param1 = toggleIcon.checked;
            const param2 = document.getElementById('param2').checked;

            console.log('Salvando preferências:', { param1, param2 });

            // Salvar preferências
            chrome.storage.sync.set({ toggleIcon: param1, param2 }, function () {
                console.log('Preferências salvas com sucesso.');

                confirmationMessage.innerText = 'Configurações salvas!';
                confirmationMessage.classList.remove('hidden');
                setTimeout(function () {
                    confirmationMessage.classList.add('hidden');
                }, 2000);

                // Atualizar o ícone conforme o novo estado de 'toggleIcon'
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length === 0) {
                        console.error('Erro: Nenhuma aba ativa encontrada.');
                        return;
                    }
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: updateIcon,
                        args: [param1]
                    });
                });
            });
        });
    } else {
        console.error('Erro: Elemento toggleIcon não encontrado.');
    }

    // Carregar última funcionalidade selecionada
    chrome.storage.local.get('lastFunctionality', function (data) {
        if (data.lastFunctionality) {
            functionalitySelect.value = data.lastFunctionality;
            loadFunctionalityContent(data.lastFunctionality);
        }
    });

    functionalitySelect.addEventListener('change', function () {
        const selectedFunctionality = functionalitySelect.value;
        loadFunctionalityContent(selectedFunctionality);

        // Salvar última funcionalidade selecionada
        chrome.storage.local.set({ lastFunctionality: selectedFunctionality });
    });

    settingsIcon.addEventListener('click', function () {
        preferencesArea.classList.toggle('hidden');
        contentArea.classList.toggle('hidden', !preferencesArea.classList.contains('hidden'));
    });

    function loadFunctionalityContent(func) {
        contentArea.innerHTML = ''; // Limpar a área de conteúdo

        // Carregar HTML e script correspondente
        switch (func) {
            case 'func1': // Desvincula
                loadScriptAndHTML('obtemID');
                break;
            case 'func2': // Obtém ID
                loadScriptAndHTML('requestAmazon');
                break;
            case 'func3': // Request Amazon
                loadScriptAndHTML('desvincula');
                break;
        }
    }

    function loadScriptAndHTML(scriptName) {
        // Carregar HTML
        fetch(`html/${scriptName}.html`)
            .then(response => response.text())
            .then(html => {
                contentArea.innerHTML = html;

                // Carregar o script correspondente
                const script = document.createElement('script');
                script.src = `scripts/${scriptName}.js`;
                document.body.appendChild(script);
            })
            .catch(error => console.error('Erro ao carregar o HTML:', error));
    }
});

// Função para atualizar o ícone de acordo com o estado de ativação
function updateIcon(iconEnabled) {
    if (iconEnabled) {
        createIcon();
    } else {
        removeIcon();
    }
}

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
