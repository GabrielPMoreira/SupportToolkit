document.addEventListener('DOMContentLoaded', () => {
    loadSavedProductData();

    function loadSavedProductData() {
        const savedProductId = localStorage.getItem('savedProductId');
        const savedProductData = localStorage.getItem('savedProductData');

        if (savedProductId && savedProductData) {
            document.getElementById('productId').value = savedProductId;
            updateProductInfo(JSON.parse(savedProductData));
        }
    }

    // Desabilita o botão "Copiar" inicialmente, até ter dados
    document.getElementById('copyData').disabled = true;
});

document.getElementById('fetchData').addEventListener('click', async () => {
    const productId = document.getElementById('productId').value.trim();
    
    if (!productId) {
        flashInputColor('error');
        return;
    }

    const apiUrl = `https://api.mercadolibre.com/items/${productId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Erro ao buscar os dados do produto');
        const data = await response.json();

        // Atualiza as informações do produto
        updateProductInfo(data);

        // Armazena os dados no localStorage
        localStorage.setItem('savedProductId', productId);
        localStorage.setItem('savedProductData', JSON.stringify(data));

        flashInputColor('success');
    } catch (error) {
        console.error('Erro ao buscar os dados do produto:', error);
        flashInputColor('error');
    }
});

document.getElementById('copyData').addEventListener('click', () => {
    const clipboardText = document.getElementById('copyData').dataset.clipboardText;

    if (clipboardText) {
        navigator.clipboard.writeText(clipboardText).then(() => {
            const copyButton = document.getElementById('copyData');
            const originalText = copyButton.innerText;
            copyButton.innerText = 'Copiado!';
            
            // Retorna ao texto original após 2 segundos
            setTimeout(() => {
                copyButton.innerText = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Falha ao copiar o texto: ', err);
        });
    }
});

document.getElementById('clearData').addEventListener('click', () => {
    document.getElementById('productId').value = '';
    document.getElementById('productTitle').innerText = 'Título do Anúncio';
    document.getElementById('productCode').innerText = 'ID do Produto';
    document.getElementById('thumbnailImage').src = 'icons/placeholder.png';
    document.getElementById('variationsBody').innerHTML = '';
    
    // Limpa os dados armazenados no localStorage
    localStorage.removeItem('savedProductId');
    localStorage.removeItem('savedProductData');
    
    // Desabilita o botão "Copiar" quando os dados são limpos
    document.getElementById('copyData').disabled = true;

    flashInputColor('success');
});

// Função para aplicar a cor temporariamente ao input
function flashInputColor(type) {
    const input = document.getElementById('productId');
    
    // Remove classes anteriores
    input.classList.remove('success', 'error');
    
    // Adiciona a classe correspondente
    input.classList.add(type);
    
    // Remove a classe após 2 segundos
    setTimeout(() => {
        input.classList.remove(type);
    }, 1000);
}

function updateProductInfo(data) {
    document.getElementById('productTitle').innerText = data.title || 'Sem título';
    document.getElementById('productCode').innerText = `Cod.: ${data.id || 'Desconhecido'}`;
    document.getElementById('thumbnailImage').src = data.thumbnail || 'icons/placeholder.png';

    const variationsBody = document.getElementById('variationsBody');
    variationsBody.innerHTML = '';  // Limpa o conteúdo existente

    let clipboardData = '';

    if (data.variations && data.variations.length > 0) {
        data.variations.forEach(variation => {
            let attributes = variation.attribute_combinations.map(attr => `${attr.name}: ${attr.value_name}`).join('; ');
            let row = `
                <tr>
                    <td>${attributes}</td>
                    <td>${variation.id}</td>
                </tr>
            `;
            variationsBody.insertAdjacentHTML('beforeend', row);

            // Prepara os dados para o clipboard
            clipboardData += `${attributes}\t${variation.id}\n`;
        });

        // Habilita o botão "Copiar" após carregar os dados
        document.getElementById('copyData').disabled = false;

    } else {
        clipboardData = 'Sem variações disponíveis.';
        variationsBody.innerHTML = `<tr><td colspan="2">Sem variações disponíveis</td></tr>`;

        // Desabilita o botão "Copiar" se não houver variações
        document.getElementById('copyData').disabled = true;
    }

    document.getElementById('copyData').dataset.clipboardText = clipboardData;
}
