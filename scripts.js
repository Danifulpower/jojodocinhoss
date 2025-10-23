// ===== VARIÁVEL GLOBAL DE PRODUTOS (será preenchida pelo Google Sheets) =====
let produtos = {
    doces: { tradicionais: [], especiais: [], gourmet: [] },
    bolos: { 
        tamanhos: [
            { id: '10-12', nome: '10/12 fatias (5 pessoas)', tradicional: 115.00, premium: 130.00 },
            { id: '20-24', nome: '20/24 fatias (20 pessoas)', tradicional: 150.00, premium: 165.00 },
            { id: '38-42', nome: '38/42 fatias (30 pessoas)', tradicional: 190.00, premium: 205.00 },
            { id: '56', nome: '56 fatias (50 pessoas)', tradicional: 300.00, premium: 315.00 }
        ],
        recheiosTradicionais: [], 
        recheiosPremium: [] 
    },
    salgados: [],
    tortasSalgadas: [],
    especiais: { tortas: [], bolosCaseiros: [], kits: [] },
	prontaEntrega: [] 
};

// ===== FUNÇÃO PARA CARREGAR PRODUTOS DO GOOGLE SHEETS =====
window.loadProducts = function(productData) {
    console.log('Carregando produtos do Google Sheets...', productData);
    
    // Processar Doces
    if (productData.doces) {
        produtos.doces = productData.doces;
    }
    
    // Processar Salgados (agrupar por nome do produto)
    if (productData.salgados) {
        const salgadosAgrupados = {};
        productData.salgados.forEach(item => {
            if (!salgadosAgrupados[item.nome]) {
                salgadosAgrupados[item.nome] = {
                    nome: item.nome,
                    imagem: item.imagem,
                    sabores: []
                };
            }
            salgadosAgrupados[item.nome].sabores.push({
                nome: item.sabor,
                preco: item.preco
            });
        });
        produtos.salgados = Object.values(salgadosAgrupados);
    }
    
    // Processar Tortas Salgadas
    if (productData.tortas_salgadas) {
        produtos.tortasSalgadas = productData.tortas_salgadas;
    }
    
    // Processar Bolos (recheios)
    if (productData.bolos) {
        if (productData.bolos.tradicional) {
            produtos.bolos.recheiosTradicionais = productData.bolos.tradicional.map(r => r.nome);
        }
        if (productData.bolos.premium) {
            produtos.bolos.recheiosPremium = productData.bolos.premium.map(r => r.nome);
        }
    }

    // Processar pronta entrega
    if (productData.pronta_entrega) {
        produtos.prontaEntrega  = productData.pronta_entrega;
    }
    
    
    // Processar Especiais (agrupar por subcategoria)
    if (productData.especiais) {
        const tortasEspeciais = [];
        const bolosCaseiros = [];
        const kits = [];
        
        productData.especiais.forEach(item => {
            // Extrair subcategoria e nome do campo nome (formato: "Nome (Subcategoria)")
            const match = item.nome.match(/^(.+?)\s*\((.+?)\)$/);
            if (match) {
                const nome = match[1].trim();
                const subcategoria = match[2].trim().toLowerCase();
                
                const produto = {
                    nome: nome,
                    preco: item.preco,
                    fatias: item.fatias || '',
                    imagem: item.imagem
                };
                
                if (subcategoria === 'torta') {
                    tortasEspeciais.push(produto);
                } else if (subcategoria === 'bolo caseiro') {
                    bolosCaseiros.push(produto);
                } else if (subcategoria === 'kit') {
                    // Para kits, o campo fatias contém os itens
                    produto.itens = item.fatias ? item.fatias.split(',').map(i => i.trim()) : [];
                    kits.push(produto);
                }
            }
        });
        
        produtos.especiais.tortas = tortasEspeciais;
        produtos.especiais.bolosCaseiros = bolosCaseiros;
        produtos.especiais.kits = kits;
    }
    
    console.log('Produtos carregados:', produtos);
    
    // Recarregar a seção atual se estiver em uma página de produtos
	const currentSection = document.querySelector('.section.active');
    if (currentSection) {
        const sectionId = currentSection.id;
        if (sectionId === 'doces') loadDoces();
        if (sectionId === 'bolos') loadBolos();
        if (sectionId === 'salgados') loadSalgados();
        if (sectionId === 'especiais') loadEspeciais();
        if (sectionId === 'pronta-entrega') loadProntaEntrega();
    }
};

// ===== SWIPE FUNCTIONS =====
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
            closeMobileMenu();
        } else {
            toggleMobileMenu();
        }
    }
}

// ===== VARIÁVEIS GLOBAIS =====
let carrinho = [];
let quantities = {};
let boloConfig = {
    tamanho: '',
    tipo: 'tradicional',
    sabores: [],
    apenasUmSabor: false // Adicione esta linha
};

// ===== NAVEGAÇÃO =====
function showSection(sectionId) {
    closeMobileMenu();
    
    if (sectionId === "pedido" && carrinho.length === 0) {
        sectionId = "home";
        showAlert("Seu carrinho está vazio! Adicione itens antes de finalizar.", "Carrinho Vazio");
    }
    
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });
    
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.add("active");
        
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
        });
        
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) activeLink.classList.add("active");
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        switch(sectionId) {
            case "doces": loadDoces(); break;
            case "bolos": 
                loadBolos(); 
                // Mostra o alerta de bolo após um pequeno delay
                setTimeout(() => {
                    if (shouldShowBoloAlert()) {
                        showBoloAlert();
                    }
                }, 500);
                break;
            case "salgados": loadSalgados(); break;
            case "especiais": loadEspeciais(); break;
            case "pronta-entrega": loadProntaEntrega(); break;
            case "pedido": showCartPedido(); break;
        }
    }
}

// ===== FUNÇÕES DE CARREGAMENTO =====

function loadProntaEntrega() {
    const container = document.getElementById("pe-grid");
    if (!container) return;

    if (produtos.prontaEntrega.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum produto disponível para pronta entrega no momento.</p>';
        return;
    }

    container.innerHTML = produtos.prontaEntrega.map((produto, index) => {
        const key = `pronta-entrega-${index}`;
        const quantidade = quantities[key] || 0;
        const precoTotal = (produto.preco * quantidade).toFixed(2);
        const maxQuantidade = produto.disponivel;
        const OBS =  produto.OBS;

        return `
            <div class="card product-card">
                <img class="img-div-doces" src="${produto.imagem}" alt="${produto.nome}${OBS}">
                <h3 class="product-title">${produto.nome}</h3>
                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
                <p class="product-description">Disponível: ${produto.disponivel} unidades</p>
						<span style=" font-size: 0.8rem;">Descrição: <p> ${OBS}</p></span>
                
                <div class="quantity-controls">
                    <span>Quantidade:</span>
                    <div class="quantity-input">
                        <button class="quantity-btn" onclick="updateQuantityProntaEntrega('${key}', -1, ${maxQuantidade})" ${quantidade <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-value" value="${quantidade}" min="0" max="${maxQuantidade}" 
                               data-key="${key}" onblur="updateQuantityInputProntaEntrega('${key}', this.value, ${maxQuantidade}, event)"
                               onkeyup="updateQuantityInputProntaEntrega('${key}', this.value, ${maxQuantidade}, event)" onkeydown="allowOnlyNumbers(event)">
                        <button class="quantity-btn" onclick="updateQuantityProntaEntrega('${key}', 1, ${maxQuantidade})" ${quantidade >= maxQuantidade ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="total-price" style="font-weight: bold; font-size: 1.1rem;">Total: R$ ${precoTotal}</span>
                    </div>
                    <button class="btn btn-primary" onclick="addProntaEntregaToCart(${index})" ${quantidade > 0 ? '' : 'disabled'}>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');

}

function updateQuantityProntaEntrega(key, change, max) {
    let currentQuantity = quantities[key] || 0;
    currentQuantity += change;
    
    if (currentQuantity < 0) currentQuantity = 0;
    if (currentQuantity > max) currentQuantity = max;
    
    quantities[key] = currentQuantity;
    
    const inputElement = document.querySelector(`.quantity-input input[data-key="${key}"]`);
    if (inputElement) {
        inputElement.value = currentQuantity;
        
        const minusButton = inputElement.parentElement.querySelector('.quantity-btn:first-child');
        const plusButton = inputElement.parentElement.querySelector('.quantity-btn:last-child');
        
        if (minusButton) minusButton.disabled = currentQuantity <= 0;
        if (plusButton) plusButton.disabled = currentQuantity >= max;
    }
    
    updateTotalProntaEntrega(key);
}

function updateQuantityInputProntaEntrega(key, value, max, event) {
    if (event.key === 'Enter' || event.type === 'blur') {
        let newQuantity = parseInt(value) || 0;
        if (newQuantity < 0) newQuantity = 0;
        if (newQuantity > max) newQuantity = max;
        
        quantities[key] = newQuantity;
        
        const inputElement = document.querySelector(`.quantity-input input[data-key="${key}"]`);
        if (inputElement) {
            const minusButton = inputElement.parentElement.querySelector('.quantity-btn:first-child');
            const plusButton = inputElement.parentElement.querySelector('.quantity-btn:last-child');
            
            if (minusButton) minusButton.disabled = newQuantity <= 0;
            if (plusButton) plusButton.disabled = newQuantity >= max;
        }
        
        updateTotalProntaEntrega(key);
    }
}

function updateTotalProntaEntrega(key) {
    const index = parseInt(key.split('-')[2]);
    const produto = produtos.prontaEntrega[index];
    const currentQuantity = quantities[key] || 0;
    const total = (produto.preco * currentQuantity).toFixed(2);

    const card = document.querySelector(`input[data-key="${key}"]`)?.closest('.product-card');
    if (card) {
        const totalElement = card.querySelector('.total-price');
        if (totalElement) {
            totalElement.textContent = `Total: R$ ${total}`;
        }
        
        const button = card.querySelector('button[onclick*="addProntaEntregaToCart"]');
        if (button) {
            button.disabled = currentQuantity <= 0;
            button.textContent = currentQuantity > 0 ? 'Adicionar ao Carrinho' : 'Selecione a quantidade';
        }
    }
}

function addProntaEntregaToCart(index) {
    const produto = produtos.prontaEntrega[index];
    const key = `pronta-entrega-${index}`;
    const quantidade = quantities[key] || 0;

    if (quantidade <= 0) {
        showAlert('Selecione pelo menos 1 item.', "Quantidade Inválida");
        return;
    }

    if (quantidade > produto.disponivel) {
        showAlert(`Não há itens suficientes. Disponível: ${produto.disponivel}`, "Estoque Insuficiente");
        return;
    }

    const item = {
        id: Date.now(),
        nome: produto.nome,
        preco: produto.preco,
        quantidade: quantidade,
        categoria: 'Pronta Entrega',
        maxQuantidade: produto.disponivel,
        rowIndex: produto.rowIndex,
        pedidoAtual: produto.pedido
    };

    carrinho.push(item);

    const novoPedido = produto.pedido + quantidade;
    const novoDisponivel = produto.quantidade - novoPedido;

    produtos.prontaEntrega[index].pedido = novoPedido;
    produtos.prontaEntrega[index].disponivel = novoDisponivel;

    if (typeof window.updateProntaEntregaPedido === 'function') {
        window.updateProntaEntregaPedido(produto.rowIndex, novoPedido)
            .then(() => {
                console.log('Estoque atualizado na planilha');
                showToast(`${quantidade} unidade(s) de ${produto.nome} adicionada(s) ao carrinho!`);
            })
            .catch(err => {
                console.error('Erro ao atualizar estoque:', err);
                produtos.prontaEntrega[index].pedido = produto.pedido;
                produtos.prontaEntrega[index].disponivel = produto.disponivel;
                showAlert('Erro ao atualizar estoque. Tente novamente.', "Erro");
                return;
            });
    } else {
        showToast(`${quantidade} unidade(s) de ${produto.nome} adicionada(s) ao carrinho!`);
    }

    updateCartCount();
    showAlert(`${quantidade} unidade(s) de ${produto.nome} adicionada(s) ao carrinho!`, "Item Adicionado");
    
    quantities[key] = 0;
    loadProntaEntrega();
    updateProntaEntregaCard(index);
}

function updateProntaEntregaCard(index) {
    const produto = produtos.prontaEntrega[index];
    const key = `pronta-entrega-${index}`;
    const quantidade = quantities[key] || 0;
    
    const card = document.querySelector(`input[data-key="${key}"]`)?.closest('.product-card');
    if (!card) return;

    const descElement = card.querySelector('.product-description');
    if (descElement) {
        descElement.textContent = `Disponível: ${produto.disponivel} unidades`;
    }

    const precoTotal = (produto.preco * quantidade).toFixed(2);
    const totalElement = card.querySelector('.total-price');
    if (totalElement) {
        totalElement.textContent = `Total: R$ ${precoTotal}`;
    }

    const minusButton = card.querySelector('.quantity-btn:first-child');
    const plusButton = card.querySelector('.quantity-btn:last-child');
    const inputElement = card.querySelector('.quantity-value');
    
    if (minusButton) minusButton.disabled = quantidade <= 0;
    if (plusButton) plusButton.disabled = quantidade >= produto.disponivel;
    if (inputElement) inputElement.value = quantidade;

    const addButton = card.querySelector('button[onclick*="addProntaEntregaToCart"]');
    if (addButton) {
        addButton.disabled = quantidade <= 0;
        addButton.textContent = quantidade > 0 ? 'Adicionar ao Carrinho' : 'Selecione a quantidade';
    }

    if (produto.disponivel <= 0) {
        card.style.display = 'none';
    }
}

function loadDoces() {
    loadDoceCategory('tradicionais', 'doces-tradicionais-lista');
    loadDoceCategory('especiais', 'doces-especiais-lista');
    loadDoceCategory('gourmet', 'doces-gourmet-lista');

}

function loadDoceCategory(categoria, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = produtos.doces[categoria].map((doce, index) => {
        const key = `${categoria}-${index}`;
        const quantidade = quantities[key] || doce.minimo;
        const precoTotal = (doce.preco / 100 * quantidade).toFixed(2);
        
        return `
            <div class="card product-card">
                <img class="img-div-doces" src="${doce.imagem}" alt="${doce.nome}">
                <h3 class="product-title">${doce.nome}</h3>
                <p class="product-description">Mínimo: ${doce.minimo} unidades</p>
                <p class="product-price" data-preco-unitario="${doce.preco / 100}">R$ ${doce.preco.toFixed(2)} / cento</p>
                
                <div class="quantity-input">
                    <button class="quantity-btn" onclick="updateQuantity('${key}', -25, ${doce.minimo})" ${quantidade <= doce.minimo ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-value" value="${quantidade}" min="${doce.minimo}" 
                           data-key="${key}" onblur="updateQuantityInput('${key}', this.value, ${doce.minimo}, event)"
                           onkeyup="updateQuantityInput('${key}', this.value, ${doce.minimo}, event)" onkeydown="allowOnlyNumbers(event)">
                    <button class="quantity-btn" onclick="updateQuantity('${key}', 25, ${doce.minimo})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="total-price" style="font-weight: bold; font-size: 1.1rem;">Total: R$ ${precoTotal}</span>
                    </div>
                    <button class="btn" onclick="addDoceToCart('${categoria}', ${index})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
}



function loadBolos() {
    loadBoloTamanhos();
    loadBoloSabores();
    updateBoloResumo();
}

function loadBoloTamanhos() {
    const container = document.getElementById('bolo-tamanhos');
    if (!container) return;
    
    container.innerHTML = produtos.bolos.tamanhos.map(tamanho => `
        <label class="radio-option">
            <input type="radio" name="bolo-tamanho" value="${tamanho.id}" onchange="updateBoloTamanho('${tamanho.id}')">
            <span>
                <div style="font-weight: bold;">${tamanho.nome}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    Tradicional: R$ ${tamanho.tradicional.toFixed(2)} | Premium: R$ ${tamanho.premium.toFixed(2)}
                </div>
            </span>
        </label>
    `).join('');
}

function loadBoloSabores() {
    const container = document.getElementById('bolo-sabores');
    if (!container) return;
    
    const recheios = boloConfig.tipo === 'tradicional' 
        ? produtos.bolos.recheiosTradicionais 
        : produtos.bolos.recheiosPremium;
    
    // Adiciona o checkbox "Apenas 1 sabor" no início
    let html = `
        <label class="checkbox-option apenas-um-sabor-option">
            <input type="checkbox" id="apenas-um-sabor" ${boloConfig.apenasUmSabor ? 'checked' : ''} 
                   onchange="toggleApenasUmSabor()">
            <span>Apenas 1 sabor <p class="letrasmiudas">O bolo terá o mesmo sabor em ambas as camadas.</p>
</span>
        </label>
    `;
    
    html += recheios.map(sabor => {
        const isChecked = boloConfig.sabores.includes(sabor);
        const maxSabores = boloConfig.apenasUmSabor ? 1 : 2;
        const isDisabled = boloConfig.sabores.length >= maxSabores && !isChecked;
        
        return `
            <label class="checkbox-option" ${isDisabled ? 'style="opacity: 0.5;"' : ''}>
                <input type="checkbox" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} 
                       onchange="updateBoloSabor('${sabor}')">
                <span>${sabor}</span>
            </label>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Atualiza o contador
    updateSaboresCount();
updateSaboresTitle();
}

function toggleApenasUmSabor() {
    const checkbox = document.getElementById('apenas-um-sabor');
    boloConfig.apenasUmSabor = checkbox.checked;
    
    // Se ativou "apenas 1 sabor" e tem mais de 1 sabor selecionado, remove os extras
    if (boloConfig.apenasUmSabor && boloConfig.sabores.length > 1) {
        // Mantém apenas o primeiro sabor selecionado
        boloConfig.sabores = [boloConfig.sabores[0]];
    }
    
    // Atualiza o título e recarrega os sabores
    updateSaboresTitle();
    loadBoloSabores();
    updateBoloResumo();
}

// Função atualizada para atualizar contador
function updateSaboresCount() {
    const saboresCount = document.getElementById('sabores-count');
    if (saboresCount) {
        const max = boloConfig.apenasUmSabor ? 1 : 2;
        saboresCount.textContent = `${boloConfig.sabores.length}/${max}`;
    }
}

function updateBoloSabor(sabor) {
    const index = boloConfig.sabores.indexOf(sabor);
    const maxSabores = boloConfig.apenasUmSabor ? 1 : 2;
    
    if (index === -1) {
        // Tentando adicionar um sabor
        if (boloConfig.sabores.length < maxSabores) {
            boloConfig.sabores.push(sabor);
        }
    } else {
        // Removendo um sabor
        boloConfig.sabores.splice(index, 1);
    }
    
    updateSaboresTitle(); // Atualiza o título
    loadBoloSabores();
    updateBoloResumo();
}

function updateBoloTamanho(tamanhoId) {
    boloConfig.tamanho = tamanhoId;
    updateBoloResumo();
}

function updateBoloTipo(tipo) {
    boloConfig.tipo = tipo;
    boloConfig.sabores = [];
    boloConfig.apenasUmSabor = false; // Resetar esta opção também
    document.getElementById('sabores-count').textContent = '0';
    updateSaboresTitle();
    loadBoloSabores();
    updateBoloResumo();
}

function updateBoloSabor(sabor) {
    if (boloConfig.sabores.includes(sabor)) {
        boloConfig.sabores = boloConfig.sabores.filter(s => s !== sabor);
    } else if (boloConfig.sabores.length < 2) {
        boloConfig.sabores.push(sabor);
    }
    
    document.getElementById('sabores-count').textContent = boloConfig.sabores.length;
    loadBoloSabores();
    updateBoloResumo();
}

function updateBoloResumo() {
    const resumoContainer = document.getElementById('bolo-resumo');
    if (!resumoContainer) return;
    
    const maxSabores = boloConfig.apenasUmSabor ? 1 : 2;
    
    if (!boloConfig.tamanho || boloConfig.sabores.length === 0) {
        resumoContainer.innerHTML = '<p style="color: #999;">Selecione o tamanho e os sabores do bolo</p>';
        
        // Desabilitar botão de adicionar ao carrinho
        const addBtn = document.getElementById('add-bolo-btn');
        if (addBtn) addBtn.disabled = true;
        
        return;
    }
    
    const tamanho = produtos.bolos.tamanhos.find(t => t.id === boloConfig.tamanho);
    const preco = boloConfig.tipo === 'tradicional' ? tamanho.tradicional : tamanho.premium;
    
    // Usar resumoContainer em vez de resumo
    resumoContainer.innerHTML = `
        <p><strong>Tamanho:</strong> ${tamanho.nome}</p>
        <p><strong>Tipo:</strong> ${boloConfig.tipo === 'tradicional' ? 'Tradicional' : 'Premium'}</p>
        <p><strong>Sabores:</strong> ${boloConfig.sabores.join(' + ') || 'Nenhum selecionado'}</p>
        <p style="color: var(--primary-pink); font-size: 1.2rem; font-weight: bold; margin-top: 1rem;">
            Total: R$ ${preco.toFixed(2)}
        </p>
    `;
    
    // Atualizar botão de adicionar ao carrinho com a nova lógica
    const addBtn = document.getElementById('add-bolo-btn');
    if (addBtn) {
        const saboresCount = boloConfig.sabores.length;
        const requiredSabores = boloConfig.apenasUmSabor ? 1 : 2;
        addBtn.disabled = !boloConfig.tamanho || saboresCount !== requiredSabores;
    }
}

function addBoloToCart() {
    const requiredSabores = boloConfig.apenasUmSabor ? 1 : 2;
    
    if (!boloConfig.tamanho || boloConfig.sabores.length !== requiredSabores) {
        const message = boloConfig.apenasUmSabor 
            ? 'Por favor, selecione o tamanho e exatamente 1 sabor.' 
            : 'Por favor, selecione o tamanho e exatamente 2 sabores.';
        showAlert(message, "Bolo Incompleto");
        return;
    }
    
    const tamanho = produtos.bolos.tamanhos.find(t => t.id === boloConfig.tamanho);
    const preco = boloConfig.tipo === 'tradicional' ? tamanho.tradicional : tamanho.premium;
    
    const item = {
        id: Date.now(),
        nome: `Bolo ${boloConfig.tipo === 'tradicional' ? 'Tradicional' : 'Premium'}`,
        preco: preco,
        quantidade: 1,
        categoria: 'Bolos',
        detalhes: `Tamanho: ${tamanho.nome} | Tipo: ${boloConfig.tipo} | Sabores: ${boloConfig.sabores.join(' + ')}`
    };
    
    carrinho.push(item);
    updateCartCount();
    
    showAlert(`Bolo ${tamanho.nome} com sabores ${item.detalhes.split('|')[2].split(':')[1].trim()} adicionado ao carrinho!`, "Bolo Adicionado");
    
    // Resetar configuração do bolo
    boloConfig = { 
        tamanho: '', 
        tipo: 'tradicional', 
        sabores: [], 
        apenasUmSabor: false 
    };
    
    // Resetar UI
    document.querySelectorAll('input[name="bolo-tamanho"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="bolo-tipo"]')[0].checked = true;
    loadBoloSabores();
    updateBoloResumo();
    
    const addBtn = document.getElementById('add-bolo-btn');
    if (addBtn) addBtn.disabled = true;
}

function loadSalgados() {
    loadSalgadoCategory();
    loadTortaSalgadaCategory();

}

function loadSalgadoCategory() {
    const container = document.getElementById("salgados-lista");
    if (!container) return;
    
    container.innerHTML = produtos.salgados.map((salgado, index) => {
        const key = `salgado-${index}`;
        const quantidade = quantities[key] || 25;
        const saborSelecionado = quantities[`${key}-sabor`] || salgado.sabores[0].nome;
        const saborObj = salgado.sabores.find(s => s.nome === saborSelecionado);
        const precoUnitario = saborObj ? saborObj.preco : salgado.sabores[0].preco;
        const precoTotal = (precoUnitario / 100 * quantidade).toFixed(2);

        return `
            <div class="card product-card">
                <img class="img-div-doces" src="${salgado.imagem}" alt="${salgado.nome}" >
                <h3 class="product-title">${salgado.nome}</h3>
                <p class="product-price" data-preco-unitario="${precoUnitario / 100}">R$ ${precoUnitario.toFixed(2)} / cento</p>
                <div class="form-group">
                    <label>Sabor:</label>
                    <select class="form-control" onchange="updateSalgadoSabor('${key}', this.value)">
                        ${salgado.sabores.map(sabor => `
                            <option value="${sabor.nome}" ${saborSelecionado === sabor.nome ? 'selected' : ''}>
                                ${sabor.nome} - R$ ${sabor.preco.toFixed(2)} / cento
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="quantity-input">
                    <button class="quantity-btn" onclick="updateQuantity('${key}', -25, 25)" ${quantidade <= 25 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-value" value="${quantidade}" min="25" 
                           data-key="${key}" onblur="updateQuantityInput('${key}', this.value, 25, event)"
                           onkeyup="updateQuantityInput('${key}', this.value, 25, event)" onkeydown="allowOnlyNumbers(event)">
                    <button class="quantity-btn" onclick="updateQuantity('${key}', 25, 25)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="total-price" style="font-weight: bold; font-size: 1.1rem;">Total: R$ ${precoTotal}</span>
                    </div>
                    <button class="btn" onclick="addSalgadoToCart(${index})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadTortaSalgadaCategory() {
    const container = document.getElementById("tortas-salgadas-lista");
    if (!container) return;
    
    container.innerHTML = produtos.tortasSalgadas.map((torta, index) => {
        const key = `torta-salgada-${index}`;
        const quantidade = quantities[key] || 1;
        const precoTotal = (torta.preco * quantidade).toFixed(2);

        return `
            <div class="card product-card">
                <img class="img-div-doces" src="${torta.imagem}" alt="${torta.nome}" >
                <h3 class="product-title">${torta.nome}</h3>
                <p class="product-price" data-preco-unitario="${torta.preco}">R$ ${torta.preco.toFixed(2)}</p>
                
                <div class="quantity-controls">
                    <span>Quantidade:</span>
                    <div class="quantity-input">
                        <button class="quantity-btn" onclick="updateQuantity('${key}', -1, 1)" ${quantidade <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-value" value="${quantidade}" min="1" 
                               data-key="${key}" onblur="updateQuantityInput('${key}', this.value, 1, event)"
                               onkeyup="updateQuantityInput('${key}', this.value, 1, event)" onkeydown="allowOnlyNumbers(event)">
                        <button class="quantity-btn" onclick="updateQuantity('${key}', 1, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="total-price" style="font-weight: bold; font-size: 1.1rem;">Total: R$ ${precoTotal}</span>
                    </div>
                    <button class="btn" onclick="addTortaSalgadaToCart(${index})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
    setTimeout(adjustImagesToContainer, 100);
}

function updateSalgadoSabor(key, sabor) {
    quantities[`${key}-sabor`] = sabor;
    
    const index = parseInt(key.split('-')[1]);
    const salgado = produtos.salgados[index];
    const saborObj = salgado.sabores.find(s => s.nome === sabor);
    const precoUnitario = saborObj ? saborObj.preco : salgado.sabores[0].preco;
    
    const card = document.querySelector(`input[data-key="${key}"]`)?.closest('.product-card');
    if (card) {
        const priceElement = card.querySelector('.product-price');
        priceElement.setAttribute('data-preco-unitario', precoUnitario / 100);
        priceElement.textContent = `R$ ${precoUnitario.toFixed(2)} / cento`;
    }
    
    updateTotal(key, 25);
}

function loadEspeciais() {
    loadEspecialCategory('tortas', 'especiais-tortas-lista');
    loadEspecialCategory('bolosCaseiros', 'especiais-bolos-caseiros-lista');
    loadEspecialCategory('kits', 'especiais-kits-lista');

}

function loadEspecialCategory(categoria, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = produtos.especiais[categoria].map((item, index) => {
        const key = `${categoria}-${index}`;
        const quantidade = quantities[key] || 1;
        const precoTotal = (item.preco * quantidade).toFixed(2);


        return `
            <div class="card product-card">
                <img class="img-div-doces" src="${item.imagem}" alt="${item.nome}" >
                <h3 class="product-title">${item.nome}</h3>
                ${item.fatias ? `<p class="product-description">${item.fatias} fatias</p>` : ''}
                ${item.itens ? `<p class="product-description">${item.itens.join(', ')}</p>` : ''}
                <p class="product-price" data-preco-unitario="${item.preco}">R$ ${item.preco.toFixed(2)}</p>
                
                <div class="quantity-controls">
                    <span>Quantidade:</span>
                    <div class="quantity-input">
                        <button class="quantity-btn" onclick="updateQuantity('${key}', -1, 1)" ${quantidade <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-value" value="${quantidade}" min="1" 
                               data-key="${key}" onblur="updateQuantityInput('${key}', this.value, 1, event)"
                               onkeyup="updateQuantityInput('${key}', this.value, 1, event)" onkeydown="allowOnlyNumbers(event)">
                        <button class="quantity-btn" onclick="updateQuantity('${key}', 1, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="total-price" style="font-weight: bold; font-size: 1.1rem;">Total: R$ ${precoTotal}</span>
                    </div>
                    <button class="btn" onclick="addEspecialToCart('${categoria}', ${index})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== FUNÇÕES DO CARRINHO =====
function addDoceToCart(categoria, index) {
    const doce = produtos.doces[categoria][index];
    const key = `${categoria}-${index}`;
    const quantidade = quantities[key] || doce.minimo;

    if (quantidade < 25) {
        showAlert(`${quantidade} é menor que o mínimo. Será adicionado 25 unidades.`, "Quantidade Mínima");
        quantities[key] = 25;
        loadDoceCategory(categoria, `doces-${categoria}-lista`);
        return;
    }

    carrinho.push({
        id: Date.now(),
        nome: doce.nome,
        preco: doce.preco / 100,
        quantidade: quantidade,
        categoria: 'Doces'
    });

    updateCartCount();
    showAlert(`${quantidade} unidades de ${doce.nome} adicionadas ao carrinho!`, "Item Adicionado");
    
    quantities[key] = doce.minimo;
    loadDoceCategory(categoria, `doces-${categoria}-lista`);
}

function addSalgadoToCart(index) {
    const salgado = produtos.salgados[index];
    const key = `salgado-${index}`;
    const quantidade = quantities[key] || 25;
    const saborNome = quantities[`${key}-sabor`] || salgado.sabores[0].nome;
    const saborObj = salgado.sabores.find(s => s.nome === saborNome);
    const precoUnitario = saborObj ? saborObj.preco : salgado.sabores[0].preco;

    if (quantidade < 25) {
        showAlert(`${quantidade} é menor que o mínimo. Será adicionado 25 unidades.`, "Quantidade Mínima");
        quantities[key] = 25;
        loadSalgadoCategory();
        return;
    }

    carrinho.push({
        id: Date.now(),
        nome: `${salgado.nome} (${saborNome})`,
        preco: precoUnitario / 100,
        quantidade: quantidade,
        categoria: 'Salgados'
    });

    updateCartCount();
    showAlert(`${quantidade} unidades de ${salgado.nome} (${saborNome}) adicionadas ao carrinho!`, "Item Adicionado");
    
    quantities[key] = 25;
    loadSalgadoCategory();
}

function addTortaSalgadaToCart(index) {
    const torta = produtos.tortasSalgadas[index];
    const key = `torta-salgada-${index}`;
    const quantidade = quantities[key] || 1;

    carrinho.push({
        id: Date.now(),
        nome: torta.nome,
        preco: torta.preco,
        quantidade: quantidade,
        categoria: 'Tortas Salgadas'
    });

    updateCartCount();
    showAlert(`${quantidade} unidade(s) de ${torta.nome} adicionada(s) ao carrinho!`, "Item Adicionado");
    
    quantities[key] = 1;
    loadTortaSalgadaCategory();
}

function addEspecialToCart(categoria, index) {
    const itemEspecial = produtos.especiais[categoria][index];
    const key = `${categoria}-${index}`;
    const quantidade = quantities[key] || 1;

    carrinho.push({
        id: Date.now(),
        nome: itemEspecial.nome,
        preco: itemEspecial.preco,
        quantidade: quantidade,
        categoria: 'Especiais'
    });

    updateCartCount();
    showAlert(`${quantidade} unidade(s) de ${itemEspecial.nome} adicionada(s) ao carrinho!`, "Item Adicionado");
    
    quantities[key] = 1;
    loadEspecialCategory(categoria, `especiais-${categoria}-lista`);
}

function updateCartCount() {
    const count = carrinho.reduce((total, item) => total + item.quantidade, 0);
    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartCountMobile").textContent = count;
    document.getElementById("cartCountFloat").textContent = count;
    updateNavigation();
    saveCartToStorage();
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
    if (modal.style.display === "block") showCart();
}

function showCartPedido() {
    const cartContainer = document.getElementById("cart-items-pedido");
    const finalizarBtn = document.getElementById("btn-finalizar-pedido");
    if (!cartContainer) return;
    
    if (carrinho.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Carrinho Vazio</h3>
                <p>Você ainda não adicionou nenhum item ao seu carrinho.</p>
            </div>
        `;
        document.getElementById("cart-total-pedido").textContent = "0.00";
        document.getElementById("cart-sinal-pedido").textContent = "0.00";
        
        if (finalizarBtn) {
            finalizarBtn.disabled = true;
            finalizarBtn.style.opacity = "0.6";
            finalizarBtn.style.cursor = "not-allowed";
        }
        return;
    }

    const { total, sinal, taxa } = calcularTotais();
    
    cartContainer.innerHTML = carrinho.map((item, index) => {
        const itemTotal = item.preco * item.quantidade;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <p>${item.detalhes || ''}</p>
                    <p>Quantidade: ${item.quantidade}</p>
                </div>
                <div class="cart-item-price">
                    R$ ${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById("cart-total-pedido").textContent = total.toFixed(2);
    document.getElementById("cart-sinal-pedido").textContent = sinal.toFixed(2);
    
    const taxaContainer = document.getElementById("taxa-container");
    const taxaValor = document.getElementById("cart-taxa");
    
    if (taxa > 0) {
        taxaContainer.classList.remove("hidden");
        taxaValor.textContent = taxa.toFixed(2);
    } else {
        taxaContainer.classList.add("hidden");
    }
    
    if (finalizarBtn) {
        finalizarBtn.disabled = false;
        finalizarBtn.style.opacity = "1";
        finalizarBtn.style.cursor = "pointer";
    }
}

function showCart() {
    const cartContainer = document.getElementById("cart-items");
    const cartSummary = document.querySelector('#cart-modal .cart-summary');
    const limparBtn = document.getElementById("btn-limpar-carrinho");
    if (!cartContainer || !cartSummary) return;
    
    const existingFinalizarBtn = document.getElementById("btn-finalizar-cart");
    if (existingFinalizarBtn) existingFinalizarBtn.remove();
    
    if (carrinho.length === 0) {
        cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
        document.getElementById("cart-total-modal").textContent = "0.00";
        document.getElementById("cart-sinal-modal").textContent = "0.00";
        if (limparBtn) limparBtn.style.display = 'none';
        return;
    }

    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    
    cartContainer.innerHTML = carrinho.map((item, index) => {
        const itemTotal = item.preco * item.quantidade;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <p>${item.detalhes || ''}</p>
                    <p>Quantidade: ${item.quantidade}</p>
                </div>
                <div class="cart-item-price">
                    R$ ${itemTotal.toFixed(2)}
                    <button class="btn btn-danger" onclick="removeFromCart(${index})">Remover</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById("cart-total-modal").textContent = total.toFixed(2);
    document.getElementById("cart-sinal-modal").textContent = (total * 0.5).toFixed(2);
    
    if (limparBtn) limparBtn.style.display = 'block';
    
    const finalizarBtn = document.createElement("button");
    finalizarBtn.id = "btn-finalizar-cart";
    finalizarBtn.className = "btn btn-primary";
    finalizarBtn.style.cssText = "width: 100%; margin-top: 1rem;";
    finalizarBtn.innerHTML = '<i class="fas fa-check"></i> Ir para Finalização';
    finalizarBtn.onclick = finalizarPedidoFromCart;
    cartSummary.appendChild(finalizarBtn);
}

function removeFromCart(index) {
    showConfirmation(
        "Tem certeza que deseja remover este item do carrinho?",
        function() {
            carrinho.splice(index, 1);
            updateCartCount();
            showCart();
            showCartPedido();
            showToast("Item removido do carrinho!");
        },
        function() {
            // Ação de cancelamento (opcional)
        },
        "Remover Item"
    );
}

function clearCart() {
    showConfirmation(
        'Tem certeza que deseja limpar todo o carrinho? Esta ação não pode ser desfeita.',
        function() {
            carrinho = [];
            quantities = {};
            updateCartCount();
            showCart();
            togglePedidoSection();
            toggleCart();
            showSection('home');
            showToast('Carrinho limpo com sucesso!');
        },
        function() {
            // Ação de cancelamento
        },
        "Limpar Carrinho"
    );
}

//Retirada
function entrega() {
	const retirada = document.getElementById("retirada")?.value || "";

}


// ===== FUNÇÕES DE PEDIDO =====
function calcularTotais() {
    const pagamento = document.getElementById("pagamento")?.value || "";
    let total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    let taxa = 0;
    
    if (pagamento.includes('Cartão')) {
        taxa = total * 0.05;
        total += taxa;
    }
    
    const sinal = total * 0.5;
    
    return { total, sinal, taxa };
}

function atualizarTotaisPedido() {
    const { total, sinal, taxa } = calcularTotais();
    
    document.getElementById("cart-total-pedido").textContent = total.toFixed(2);
    document.getElementById("cart-sinal-pedido").textContent = sinal.toFixed(2);
    
    const taxaContainer = document.getElementById("taxa-container");
    const taxaValor = document.getElementById("cart-taxa");
    
    if (taxa > 0) {
        taxaContainer.classList.remove("hidden");
        taxaValor.textContent = taxa.toFixed(2);
    } else {
        taxaContainer.classList.add("hidden");
    }
}

function atualizarTaxaCartao() {
    const pagamento = document.getElementById("pagamento").value;
    const taxaInfo = document.getElementById("taxa-cartao");
    
    if (pagamento.includes('Cartão')) {
        taxaInfo.classList.remove("hidden");
    } else {
        taxaInfo.classList.add("hidden");
    }
    
    atualizarTotaisPedido();
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        showAlert("Seu carrinho está vazio! Adicione itens antes de finalizar.", "Carrinho Vazio");
        return;
    }
    
    showSection('pedido');
    showCartPedido();
}

function finalizarPedidoFromCart() {
    toggleCart();
    showSection('pedido');
}

function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        showToast("Seu carrinho está vazio!", 'error');
        return;
    }

    if (!validateForm()) return;

    const nome = sanitizeInput(document.getElementById("nome").value);
    const telefone = sanitizeInput(document.getElementById("telefone").value);
    const endereco = sanitizeInput(document.getElementById("endereco").value);
    const pagamento = document.getElementById("pagamento").value;
    const dataEntrega = document.getElementById("data-entrega").value;

    if (!nome || !pagamento || !dataEntrega) {
        showAlert("Por favor, preencha todos os campos obrigatórios.", "Campos Obrigatórios");
        return;
    }

    const dataFormatada = formatarData(dataEntrega);
    const { total, sinal, taxa } = calcularTotais();
    const dataSelecionada = new Date(dataEntrega);
    const agora = new Date();
	const hasProntaEntrega = carrinho.some(item => item.categoria === 'Pronta Entrega');

    if (!hasProntaEntrega && dataSelecionada <= agora) {
        showToast('Por favor, selecione uma data e hora futuras', 'error');
        return;
    }

    showConfirmation(
        "Deseja enviar este pedido para o WhatsApp?",
        function() {
            let mensagem = `Olá, gostaria de fazer um pedido:\n\n`;
            mensagem += `*Nome:* ${nome}\n`;
            if (endereco && endereco.trim() !== "") {
			  mensagem += `*Endereço de Entrega:* ${endereco}\n`;
			} else {
			  mensagem += `*Retirada no local*\n`;
			}
            mensagem += `*Forma de Pagamento:* ${pagamento}\n`;
            mensagem += `*Data e Horário de Entrega:* ${dataFormatada}\n\n`;
            
            if (taxa > 0) mensagem += `*Taxa de cartão (5%):* R$ ${taxa.toFixed(2)}\n`;
            
            mensagem += `*Itens do Pedido:*\n`;
            carrinho.forEach(item => {
                mensagem += `- ${item.nome} ${item.detalhes ? `(${item.detalhes})` : ''} (Qtd: ${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
            });

            mensagem += `\n*Total:* R$ ${total.toFixed(2)}\n`;
            mensagem += `*Sinal (50%):* R$ ${sinal.toFixed(2)}\n`;

            const numeroWhatsApp = "5551993088251";
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsApp, '_blank');
            
            // Limpar carrinho após envio
            carrinho = [];
            quantities = {};
            updateCartCount();
            showCartPedido();
        },
        function() {
            // Ação de cancelamento
        },
        "Enviar Pedido"
    );
}

function formatarData(dataISO) {
    if (!dataISO) return "Data não informada";
    
    const [dataPart, horaPart] = dataISO.split('T');
    const [ano, mes, dia] = dataPart.split('-');
    const [horas, minutos] = horaPart.split(':');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

function validateForm() {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const dataEntrega = document.getElementById("data-entrega").value;
    const pagamento = document.getElementById("pagamento").value;
    
    if (!nome) {
        showToast('Por favor, informe seu nome', 'error');
        return false;
    }
    
    if (!dataEntrega) {
        showToast('Por favor, selecione a data de entrega', 'error');
        return false;
    }
    
    const dataSelecionada = new Date(dataEntrega);
    const agora = new Date();
	const hasProntaEntrega = carrinho.some(item => item.categoria === 'Pronta Entrega');
    
    if (!hasProntaEntrega && dataSelecionada <= agora) {
        showToast('Por favor, selecione uma data e hora futuras', 'error');
        return false;
    }
    
    if (!pagamento) {
        showToast('Por favor, selecione a forma de pagamento', 'error');
        return false;
    }
    
    return true;
}

// ===== FUNÇÕES DE NAVEGAÇÃO MOBILE =====
function toggleMobileMenu() {
    const nav = document.getElementById("main-nav");
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.getElementById('overlay');
    
    if (nav.classList.contains("active")) {
        closeMobileMenu();
    } else {
        nav.classList.add("active");
        hamburger.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeMobileMenu() {
    const nav = document.getElementById("main-nav");
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.getElementById('overlay');
    
    nav.classList.remove("active");
    hamburger.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

function togglePedidoSection() {
    const pedidoSection = document.getElementById("pedido");
    const pedidoLink = document.getElementById("pedido-link");
    
    if (carrinho.length > 0) {
        pedidoLink.style.display = "block";
    } else {
        pedidoSection.classList.remove("active");
        pedidoLink.style.display = "none";
        if (pedidoSection.classList.contains("active")) showSection('home');
    }
}

function updateNavigation() {
    const pedidoLink = document.getElementById("pedido-link");
    const finalizarBtn = document.getElementById("btn-finalizar-pedido");
    const homeLink = document.getElementById("home-link");
    
    if (carrinho.length > 0) {
        if (pedidoLink) pedidoLink.style.display = "block";
        if (finalizarBtn) {
            finalizarBtn.disabled = false;
            finalizarBtn.style.opacity = "1";
        }
    } else {
        if (pedidoLink) pedidoLink.style.display = "none";
        if (finalizarBtn) {
            finalizarBtn.disabled = true;
            finalizarBtn.style.opacity = "0.6";
        }
    }
    
    if (homeLink) homeLink.style.display = "block";
}

// ===== CONTROLES DE QUANTIDADE =====
function updateQuantity(key, change, min = 1) {
    let currentQuantity = quantities[key] || min;
    currentQuantity += change;
    
    if (currentQuantity < min) currentQuantity = min;
    
    quantities[key] = currentQuantity;
    
    const inputElement = document.querySelector(`.quantity-input input[data-key="${key}"]`);
    if (inputElement) {
        inputElement.value = currentQuantity;
        
        const minusButton = inputElement.parentElement.querySelector('.quantity-btn:first-child');
        const plusButton = inputElement.parentElement.querySelector('.quantity-btn:last-child');
        
        if (minusButton) {
            minusButton.disabled = currentQuantity <= min;
        }
        if (plusButton) {
            plusButton.disabled = false;
        }
    }
    
    updateTotal(key, min);
}

function initQuantityButtons() {
    document.querySelectorAll('.quantity-input input').forEach(input => {
        const key = input.getAttribute('data-key');
        const min = parseInt(input.getAttribute('min')) || 1;
        const currentValue = parseInt(input.value) || min;
        
        const minusButton = input.parentElement.querySelector('.quantity-btn:first-child');
        if (minusButton) {
            minusButton.disabled = currentValue <= min;
        }
    });
}

function updateQuantityInput(key, value, min, event) {
    if (event.key === 'Enter' || event.type === 'blur') {
        let newQuantity = parseInt(value) || min;
        if (newQuantity < min) newQuantity = min;
        
        quantities[key] = newQuantity;
        
        const inputElement = document.querySelector(`.quantity-input input[data-key="${key}"]`);
        if (inputElement) {
            const minusButton = inputElement.parentElement.querySelector('.quantity-btn:first-child');
            if (minusButton) {
                minusButton.disabled = newQuantity <= min;
            }
        }
        
        updateTotal(key, min);
    }
}

function updateTotal(key, min) {
    const currentQuantity = quantities[key] || min;
    const card = document.querySelector(`input[data-key="${key}"]`)?.closest('.product-card');
    if (!card) return;
    
    const priceElement = card.querySelector('.product-price');
    const totalElement = card.querySelector('.total-price');
    
    if (priceElement && totalElement) {
        let unitPrice;
        if (priceElement.hasAttribute('data-preco-unitario')) {
            unitPrice = parseFloat(priceElement.getAttribute('data-preco-unitario'));
        } else {
            const priceText = priceElement.textContent;
            if (priceText.includes('/ cento')) {
                unitPrice = parseFloat(priceText.replace('R$', '').replace('/ cento', '').trim()) / 100;
            } else {
                unitPrice = parseFloat(priceText.replace('R$', '').trim());
            }
        }
        
        const total = (unitPrice * currentQuantity).toFixed(2);
        totalElement.textContent = `Total: R$ ${total}`;
    }
}

function allowOnlyNumbers(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 13) {
        event.preventDefault();
        return false;
    }
    return true;
}

// Permite ativar itens de categoria com Enter ou Espaço (acessibilidade)
function handleCategoryKey(event, sectionId) {
    const key = event.key || event.code;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
        event.preventDefault();
        showSection(sectionId);
    }
}

// ===== FUNÇÕES DE UTILIDADE =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function saveCartToStorage() {
    try {
        localStorage.setItem('jojoCart', JSON.stringify(carrinho));
        localStorage.setItem('jojoQuantities', JSON.stringify(quantities));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('jojoCart');
        const savedQuantities = localStorage.getItem('jojoQuantities');
        
        if (savedCart) carrinho = JSON.parse(savedCart);
        if (savedQuantities) quantities = JSON.parse(savedQuantities);
        
        updateCartCount();
    } catch (e) {
        console.error('Error loading cart from localStorage:', e);
    }
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function enhanceMobileExperience() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.classList.add('btn-touch');
        });
        
        btn.addEventListener('touchend', function() {
            this.classList.remove('btn-touch');
        });
        
        let lastTouchEnd = 0;
        btn.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) event.preventDefault();
            lastTouchEnd = now;
        });
    });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    loadCartFromStorage();
    showSection('home');
    updateNavigation();
    enhanceMobileExperience();
    window.scrollTo(0, 0);
    
    initQuantityButtons();

    document.addEventListener('click', (event) => {
        const nav = document.getElementById("main-nav");
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (nav.classList.contains("active") && 
            !nav.contains(event.target) && 
            !event.target.classList.contains('hamburger-menu') &&
            !event.target.closest('.hamburger-menu')) {
            closeMobileMenu();
        }
    });

    document.addEventListener('change', function(event) {
        if (event.target.name === 'bolo-tipo') {
            updateBoloTipo(event.target.value);
        }
    });

    setTimeout(() => showToast('Bem-vindo à Jojo Docinhos! 🍰'), 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    const dataEntregaInput = document.getElementById('data-entrega');
    if (dataEntregaInput) {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        
        dataEntregaInput.min = `${ano}-${mes}-${dia}T${horas}:${minutos}`;
    }
});

// ===== CONTROLE DOS BOTÕES FLUTUANTES =====

let floatingButtonsCollapsed = false;

function toggleFloatingButtons() {
    const toggleButton = document.getElementById('toggleFloatingButtons');
    const toggleIcon = document.getElementById('toggleButtonsIcon');
    const floatActions = Array.from(document.querySelectorAll('.floating-actions .float-action'));
    const floatingCountEl = document.getElementById('floatingButtonsCount');
    
    floatingButtonsCollapsed = !floatingButtonsCollapsed;
    
    if (floatingButtonsCollapsed) {
        // Recolher botões
        toggleButton.classList.add('collapsed');
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-left');

        floatActions.forEach(el => el.classList.add('collapsed'));

        // Atualiza contador (0 quando recolhido)
        if (floatingCountEl) floatingCountEl.textContent = '0';

        // Salvar estado
        try {
            localStorage.setItem('floatingButtonsCollapsed', 'true');
        } catch (e) {
            console.error('Erro ao salvar estado dos botões:', e);
        }
    } else {
        // Expandir botões
        toggleButton.classList.remove('collapsed');
        toggleIcon.classList.remove('fa-chevron-left');
        toggleIcon.classList.add('fa-chevron-up');

        floatActions.forEach(el => el.classList.remove('collapsed'));

        // Atualiza contador para o número de botões visíveis
        const visibleCount = floatActions.length;
        if (floatingCountEl) floatingCountEl.textContent = String(visibleCount);

        // Salvar estado
        try {
            localStorage.setItem('floatingButtonsCollapsed', 'false');
        } catch (e) {
            console.error('Erro ao salvar estado dos botões:', e);
        }
    }
}

// Verificar estado salvo ao carregar a página
function loadFloatingButtonsState() {
    try {
        const savedState = localStorage.getItem('floatingButtonsCollapsed');
        
        if (savedState === 'true') {
            // Se estava recolhido, aplicar estado recolhido
            setTimeout(() => {
                // Força estado recolhido sem alternar duas vezes
                const floatActions = Array.from(document.querySelectorAll('.floating-actions .float-action'));
                const toggleButton = document.getElementById('toggleFloatingButtons');
                const toggleIcon = document.getElementById('toggleButtonsIcon');
                const floatingCountEl = document.getElementById('floatingButtonsCount');

                if (toggleButton) toggleButton.classList.add('collapsed');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-up');
                    toggleIcon.classList.add('fa-chevron-left');
                }

                floatActions.forEach(el => el.classList.add('collapsed'));
                if (floatingCountEl) floatingCountEl.textContent = '0';
                floatingButtonsCollapsed = true;
            }, 1000); // Pequeno delay para a página carregar
        }
    } catch (e) {
        console.error('Erro ao carregar estado dos botões:', e);
    }
}

// Atualiza o contador de botões flutuantes com base em quantos .float-action existem
function updateFloatingButtonsCount() {
    const floatActions = Array.from(document.querySelectorAll('.floating-actions .float-action'));
    const floatingCountEl = document.getElementById('floatingButtonsCount');
    if (!floatingCountEl) return;

    if (floatingButtonsCollapsed) {
        floatingCountEl.textContent = '0';
    } else {
        floatingCountEl.textContent = String(floatActions.length);
    }
}

// Chamar atualização ao carregar DOM
document.addEventListener('DOMContentLoaded', function() {
    updateFloatingButtonsCount();
    loadFloatingButtonsState();
});

/*************** overlay img img-div-doces tela cheia **************/
/// ===== LIGHTBOX / OVERLAY PARA IMAGENS (img-div-doces) =====
document.addEventListener('DOMContentLoaded', function () {
  const imagens = document.querySelectorAll('.img-div-doces'); // suas imagens
  const overlay = document.getElementById('overlay-img-gr-id'); // overlay específico das imagens
  const imgGrande = document.getElementById('imgGrande-img-gr');
  const descricao = document.getElementById('descricao-img-gr');
  const btnFechar = document.getElementById('btnFechar-img-gr');

  // Verificação básica (evita erros se não existir no DOM)
  if (!overlay || !imgGrande || !descricao || !btnFechar) {
    console.warn("⚠️ Elementos do overlay de imagem não encontrados no DOM.");
    return;
  }

  // Ao clicar em uma imagem
  imagens.forEach(img => {
    img.addEventListener('click', () => {
      // Captura src e descrição
      const src = img.tagName.toLowerCase() === 'img'
        ? img.src
        : img.querySelector('img')?.src;
      const desc = img.dataset.descricao || img.alt || '';

      if (!src) return;

      // Atualiza conteúdo do overlay
      imgGrande.src = src;
      descricao.textContent = desc;

      // Mostra overlay com efeito suave
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.add('telacheia'), 10);
    });
  });

  // Função de fechamento
  function fecharOverlay() {
    overlay.classList.remove('telacheia');
    setTimeout(() => overlay.classList.remove('active'), 400);
  }

  // Fechar clicando fora da imagem ou no X
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === btnFechar) {
      fecharOverlay();
    }
  });

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharOverlay();
    }
  });
});

// ==== OVERLAY DE IMAGEM EM TELA CHEIA ====

document.addEventListener('click', function (e) {
    // Se o clique foi em uma imagem com a classe img-div-doces
    if (e.target.classList.contains('img-div-doces')) {
        const src = e.target.getAttribute('src');
        const alt = e.target.getAttribute('alt') || 'Imagem';
        abrirOverlay(src, alt);
    }
});

function abrirOverlay(src, descricao) {
    // Cria o container do overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-img');

    // HTML interno
    overlay.innerHTML = `
        <div class="overlay-content">
            <span class="overlay-close">&times;</span>
            <img src="${src}" alt="${descricao}">
            <p class="overlay-desc">${descricao}</p>
        </div>
    `;

    // Adiciona ao body
    document.body.appendChild(overlay);

    // Fecha ao clicar fora da imagem ou no X
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('overlay-close')) {
            overlay.remove();
        }
    });

    // Fecha com tecla ESC
    document.addEventListener('keydown', function escFechar(ev) {
        if (ev.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escFechar);
        }
    });
}
