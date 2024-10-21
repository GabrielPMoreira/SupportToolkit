document.getElementById('infoButton').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    const url = new URL(tab.url);
    if (url.hostname !== "www.bling.com.br" || url.pathname !== "/configuracoes.integracoes.lojas.virtuais.php") {
      document.getElementById('warning').textContent = "Acesse 'Minhas Instalações > Amazon' para executar o script";
      return;
    }
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: obterInformacoes
    }, (results) => {
      const info = results[0].result;
  
      if (info.idLoja && info.idEmpresa && info.idIntegracao) {
        document.getElementById('idLoja').textContent = info.idLoja;
        document.getElementById('idEmpresa').textContent = info.idEmpresa;
        document.getElementById('idIntegracao').textContent = info.idIntegracao;
        document.getElementById('sendRequestButton').disabled = false;
        document.getElementById('sendRequestButton').addEventListener('click', () => {
          const finalUrl = `https://www.bling.com.br/services/request.produtos.amazon.services.php?idLoja=${info.idLoja}&idIntegracao=${info.idIntegracao}&tipoIntegracao=Amazon&idEmpresa=${info.idEmpresa}`;
          window.open(finalUrl, '_blank');
        });
      } else {
        document.getElementById('warning').textContent = "Erro ao obter informações, verifique se está na página correta.";
      }
    });
  });
  
  function obterInformacoes() {
    const idLoja = document.querySelector('input[name="id"]').value;
    const idEmpresa = document.querySelector('input[name="id_company_track_events"]').value;
    const idIntegracao = document.querySelector('input[name="idIntegracao"]').value;
  
    return { idLoja, idEmpresa, idIntegracao };
  }
  