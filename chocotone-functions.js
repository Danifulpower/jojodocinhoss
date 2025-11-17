// Variável global para a categoria atual dos chocotones
let currentChocotoneCategory = 'todos';

// Inicializar chocotones quando a seção natal for carregada
function initChocotones() {
    showChocotoneCategory('todos');
}

// Mostrar categoria de chocotones
function showChocotoneCategory(category) {
    currentChocotoneCategory = category;
    
    // Atualizar tabs ativos
    document.querySelectorAll('.choco-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Filtrar e mostrar produtos
    const filteredProducts = category === 'todos' 
        ? chocotonesData 
        : chocotonesData.filter(p => p.category === category);
    
    renderChocotones(filteredProducts);
}

// Renderizar chocotones no grid
function renderChocotones(products) {
    const container = document.getElementById('chocotone-grid');
    if (!container) return;
    
    container.innerHTML = products.map(product => {
        const categoryLabel = categoryLabels[product.category];
        const categoryStyle = categoryColors[product.category];
        
        return `
            <div class="card product-card">
                <div class="product-header">
                    <h3 class="product-title">${product.name}
                    <!--<span class="product-badge product-title"  style="${categoryStyle}">${categoryLabel}</span>-->
                    <span class="product-title" >${categoryLabel}</span></h3>
                </div>
                
                <div class="form-group">
                    <h4 style="margin-bottom: 1rem; color: var(--marrom-chocolate);">Escolha o tamanho e embalagem:</h4>
                    
                    <!-- 100g -->
                    <div class="">
                        <h5 style="color: var(--rosa-escuro); margin-bottom: 0.5rem;">100g</h5>
                        <div class="card">
                            <button class="btn btn-primary btn-choco" 
                                    onclick="addChocotoneToCart('${product.id}', '${product.name}', '100g', 'saquinho', ${product.prices['100g'].saquinho})">
                                Saquinho - R$ ${product.prices['100g'].saquinho.toFixed(2)}
                            </button>
						</div>
						<div class="card">
                            <button class="btn btn-primary btn-choco" 
                                    onclick="addChocotoneToCart('${product.id}', '${product.name}', '100g', 'acetato', ${product.prices['100g'].acetato})">
                                Acetato - R$ ${product.prices['100g'].acetato.toFixed(2)}
                            </button>
                        </div>
                    </div>
                    
                    <!-- 500g -->
                    <div class="">
                        <h5 style="color: var(--rosa-escuro); margin-bottom: 0.5rem;">500g</h5>
                        <div class="card">
                            <button class="btn btn-primary btn-choco" 
                                    onclick="addChocotoneToCart('${product.id}', '${product.name}', '500g', 'saquinho', ${product.prices['500g'].saquinho})">
                                Saquinho - R$ ${product.prices['500g'].saquinho.toFixed(2)}
                            </button>
						</div>
						<div class="card">
                            <button class="btn btn-primary btn-choco" 
                                    onclick="addChocotoneToCart('${product.id}', '${product.name}', '500g', 'acetato', ${product.prices['500g'].acetato})">
                                Acetato - R$ ${product.prices['500g'].acetato.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Adicionar chocotone ao carrinho
async function addChocotoneToCart(id, name, size, packaging, price) {
    const packagingLabel = packaging === 'saquinho' ? 'Saquinho' : 'Acetato';
    
    const item = {
        id: Date.now(),
        nome: `Chocotone ${name}`,
        detalhes: `${size} - ${packagingLabel}`,
        preco: price,
        quantidade: 1,
        categoria: 'Natal - Chocotone'
    };
    
    carrinho.push(item);
    updateCartCount();
    
    await showSuccess(
        `Chocotone ${name} ${size} (${packagingLabel}) adicionado ao carrinho!`,
        "Item Adicionado"
    );
}

// Atualizar a função loadNatal original para incluir os chocotones
const originalLoadNatal = window.loadNatal;
window.loadNatal = function() {
    // Carregar produtos de natal tradicionais
    if (originalLoadNatal) {
        originalLoadNatal();
    }
    
    // Inicializar chocotones
    initChocotones();
};