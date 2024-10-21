document.addEventListener('DOMContentLoaded', function() {
    const lojasSelect = document.getElementById('lojasVinculadas');
    const gerarBackupButton = document.getElementById('gerarBackup');
    const desvincularButton = document.getElementById('desvincular');
  
    // Popula o dropdown de lojas
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getLojas
      }, function(results) {
        const lojas = results[0].result;
        lojas.forEach(loja => {
          const option = document.createElement('option');
          option.value = loja.value;
          option.textContent = loja.text;
          lojasSelect.appendChild(option);
        });
        console.log('Dropdown de lojas populado.');
      });
    });
  
    // Evento de clique para o botão de gerar backup
    gerarBackupButton.addEventListener('click', function() {
      const selectedLoja = lojasSelect.value;
      console.log('Botão de gerar backup clicado. Loja selecionada:', selectedLoja);
      if (selectedLoja) {
        console.log(`Loja selecionada para gerar backup: ${selectedLoja}`);
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          console.log('Tabs query para gerar backup executada');
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: realizarBackup,
            args: [selectedLoja]
          }, function(results) {
            if (chrome.runtime.lastError) {
              console.error('Erro ao executar script de backup:', chrome.runtime.lastError);
            } else {
              console.log('Script de backup executado com sucesso:', results);
            }
          });
        });
      } else {
        console.error('Nenhuma loja selecionada.');
      }
    });
  
    // Evento de clique para o botão de desvincular
    desvincularButton.addEventListener('click', function() {
      const selectedLoja = lojasSelect.value;
      console.log('Botão de desvincular clicado. Loja selecionada:', selectedLoja);
      if (selectedLoja) {
        console.log(`Loja selecionada para desvinculação: ${selectedLoja}`);
  
        // Exibe a mensagem de confirmação
        const lojaNome = document.querySelector(`#lojasVinculadas option[value="${selectedLoja}"]`).textContent;
        const confirmacao = confirm(`Você tem certeza que deseja desvincular os produtos da loja ${lojaNome}?`);
        if (!confirmacao) {
          console.log('Processo de desvinculação cancelado pelo usuário.');
          return;
        }
  
        console.log('Processo de desvinculação confirmado pelo usuário.');
  
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          console.log('Tabs query para desvincular executada');
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: desvincularProdutos,
            args: [selectedLoja]
          }, function(results) {
            if (chrome.runtime.lastError) {
              console.error('Erro ao executar script de desvinculação:', chrome.runtime.lastError);
            } else {
              console.log('Script de desvinculação executado com sucesso:', results);
            }
          });
        });
      } else {
        console.error('Nenhuma loja selecionada.');
      }
    });
  
    // Função para obter as lojas
    function getLojas() {
      console.log('Função getLojas executada');
      const lojas = Array.from(document.querySelectorAll('#lojasVinculadas option')).map(option => ({
        value: option.value,
        text: option.textContent
      }));
      return lojas.filter(loja => loja.value !== '');
    }
  
    // Função para realizar o backup
    async function realizarBackup(selectedLoja) {
      console.log('Iniciando o processo de backup.');
  
      // Seleciona os produtos com checkbox marcada
      const produtos = document.querySelectorAll('tbody tr');
      const produtosSelecionados = [];
      produtos.forEach(produto => {
        const checkbox = produto.querySelector('td.checkbox-item input[type="checkbox"]');
        if (checkbox && checkbox.checked && produto.classList.contains('selected')) {
          produtosSelecionados.push(produto);
        }
      });
  
      if (produtosSelecionados.length === 0) {
        console.log('Nenhum produto selecionado.');
        alert('Nenhum produto selecionado.');
        return;
      }
  
      console.log(`Produtos selecionados: ${produtosSelecionados.length}`);
  
      // Exibe a mensagem de confirmação
      const lojaNome = document.querySelector(`#lojasVinculadas option[value="${selectedLoja}"]`).textContent;
      const confirmacao = confirm(`Você tem certeza que deseja gerar backup de ${produtosSelecionados.length} produtos da loja ${lojaNome}?`);
      if (!confirmacao) {
        console.log('Processo cancelado pelo usuário.');
        return;
      }
  
      console.log('Processo de backup confirmado pelo usuário.');
  
      // Clica no botão "Exportar planilha de produtos selecionados para vínculo multiloja"
      const exportButton = document.querySelector('li[data-function="exportarPrecosMultiloja"]');
      if (exportButton) {
        console.log('Botão de exportação encontrado.');
        exportButton.click();
      } else {
        console.error('Botão de exportação não encontrado.');
        return;
      }
  
      // Delay para garantir que a janela de exportação seja aberta
      await new Promise(r => setTimeout(r, 1000));
  
      // Seleciona a loja na nova janela aberta
      const lojaDropdown = document.querySelector('#listaLojasAtivasGeneral');
      if (lojaDropdown) {
        console.log('Dropdown de lojas encontrado.');
        const optionToSelect = lojaDropdown.querySelector(`option[idloja="${selectedLoja}"]`);
        if (optionToSelect) {
          console.log(`Loja ${selectedLoja} encontrada na lista.`);
          lojaDropdown.value = optionToSelect.value;
          lojaDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.error('Loja não encontrada na lista.');
          return;
        }
      } else {
        console.error('Dropdown de lojas não encontrado.');
        return;
      }
  
      // Seleciona "Todos" no dropdown de exportação
      const exportarDropdown = document.querySelector('#exportar');
      if (exportarDropdown) {
        console.log('Dropdown de exportação encontrado.');
        exportarDropdown.value = 'todos';
        exportarDropdown.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        console.error('Dropdown de exportação não encontrado.');
        return;
      }
  
      // Clica no botão "Exportar"
      const exportarButton = document.querySelector('button.Button--primary.ui-button');
      if (exportarButton) {
        console.log('Botão de exportar encontrado.');
        exportarButton.click();
      } else {
        console.error('Botão de exportar não encontrado.');
        return;
      }
  
      // Delay para garantir que o backup seja concluído antes de continuar
      await new Promise(r => setTimeout(r, 6000)); // Ajuste o delay conforme necessário
  
      console.log('Backup concluído.');
    }
  
    // Função para desvincular os produtos
    function desvincularProdutos(selectedLoja) {
      const lojas = Array.from(document.querySelectorAll('#lojasVinculadas option')).map(option => ({
        value: option.value,
        text: option.textContent
      }));
      const lojaIds = lojas.map(loja => loja.value).filter(value => value !== '');
  
      // Seleciona os produtos com checkbox marcada
      const produtos = document.querySelectorAll('tbody tr');
      const produtosSelecionados = [];
      produtos.forEach(produto => {
        const checkbox = produto.querySelector('td.checkbox-item input[type="checkbox"]');
        if (checkbox && checkbox.checked && produto.classList.contains('selected')) {
          produtosSelecionados.push(produto);
        }
      });
  
      if (produtosSelecionados.length === 0) {
        console.log('Nenhum produto selecionado.');
        alert('Nenhum produto selecionado.');
        return;
      }
  
      console.log(`Produtos selecionados: ${produtosSelecionados.length}`);
  
      processarProduto(produtosSelecionados, 0, selectedLoja, lojaIds);
  
      function processarProduto(produtos, index, selectedLoja, lojaIds) {
        if (index >= produtos.length) {
          console.log('Todos os produtos foram processados.');
          return;
        }
  
        const produto = produtos[index];
        const shoppingCartIcon = produto.querySelector('i.fas.fa-shopping-cart');
        if (shoppingCartIcon) {
          console.log(`Processando produto ${index + 1} de ${produtos.length}`);
          shoppingCartIcon.click();
          setTimeout(() => {
            const dialog = document.querySelector('.ui-dialog.open');
            if (dialog) {
              const lojaIndex = lojaIds.indexOf(selectedLoja);
              const checkbox = dialog.querySelector(`input[name="vinculoLoja[${lojaIndex}][marcado]"]`);
              if (checkbox) {
                console.log(`Desmarcando checkbox para loja ID ${selectedLoja}`);
                checkbox.checked = false;
                const saveButton = dialog.querySelector('#saveProductStore');
                if (saveButton) {
                  console.log('Clicando no botão Salvar');
                  saveButton.click();
                  setTimeout(() => {
                    processarProduto(produtos, index + 1, selectedLoja, lojaIds);
                  }, 1000); // Ajuste o delay conforme necessário
                } else {
                  console.error('Botão Salvar não encontrado');
                }
              } else {
                console.error(`Checkbox para loja ID ${selectedLoja} não encontrado`);
              }
            } else {
              console.error('Diálogo não encontrado');
            }
          }, 1000); // Ajuste o delay conforme necessário
        } else {
          console.error('Ícone de carrinho de compras não encontrado para o produto');
          processarProduto(produtos, index + 1, selectedLoja, lojaIds);
        }
      }
    }
  });
  