/**
 * ===========================================================
 * GOOGLE SHEETS FETCH (modo leitura) - versão compatível com Netlify
 * ===========================================================
 * Lê as abas públicas do Google Sheets sem usar a API gapi.
 * Apenas leitura — sem autenticação.
 * -----------------------------------------------------------
 * Como publicar:
 * 1️⃣ No Google Sheets → Arquivo → Compartilhar → Publicar na Web
 * 2️⃣ Copie o ID da planilha (parte entre /d/ e /edit)
 * 3️⃣ Substitua o valor em SPREADSHEET_ID abaixo
 * 🚨🚨 IMPORTANTE: Certifique-se de que a planilha está "Publicada na web".
 * ===========================================================
 */

const SPREADSHEET_ID = "1zGnS57nG1cAUi5Y54Z9Job3lyRx3uUUzqs_7Wf2MELM";

// Lista das abas que você quer ler
const PRODUCT_SHEETS = [
  { name: "doces" },
  { name: "salgados" },
  { name: "bolos" },
  { name: "tortas_salgadas" },
  { name: "especiais" },
  { name: "pronta_entrega" },
];

// ===================================
// FUNÇÕES DE PROCESSAMENTO DE DADOS (Manter como estão)
// ===================================

function processDoces(values) {
    const doces = { tradicionais: [], especiais: [], gourmet: [] };
    values.forEach((row) => {
        // Ignora linhas vazias ou incompletas
        if (row.length >= 6) { 
            const [categoria, tipo, nome, precoStr, minimoStr, imagem] = row;
            
            // Valida se os campos essenciais não estão vazios
            if (!tipo || !nome || !precoStr) return;
            
            const preco = parseFloat(String(precoStr).replace(",", "."));
            const minimo = parseInt(String(minimoStr)) || 25;
            
            if (!isNaN(preco)) {
                const doce = {
                    nome: nome.trim(),
                    preco,
                    minimo,
                    imagem: imagem ? imagem.trim() : "img/placeholder.jpg",
                };
                
                // Mapeia tipo para chave do objeto
                let key = tipo.trim().toLowerCase();
                if (key === 'tradicional') key = 'tradicionais';
                else if (key === 'especial') key = 'especiais';
                
                if (doces[key]) {
                    doces[key].push(doce);
                }
            }
        }
    });
    return doces;
}

function processSalgados(values) {
    const arr = [];
    values.forEach((row) => {
        if (row.length >= 5) {
            const [categoria, nome, sabor, precoStr, imagem] = row;
            
            // Valida se os campos essenciais não estão vazios
            if (!nome || !sabor || !precoStr) return;
            
            const preco = parseFloat(String(precoStr).replace(",", "."));
            
            if (!isNaN(preco)) {
                arr.push({
                    nome: nome.trim(),
                    sabor: sabor.trim(),
                    preco,
                    imagem: imagem ? imagem.trim() : "img/placeholder.jpg",
                });
            }
        }
    });
    return arr;
}

function processRecheios(values) {
    const recheios = {};
    values.forEach((row) => {
        if (row.length >= 3) {
            const [categoria, tipo, nome] = row;
            
            // Valida se os campos essenciais não estão vazios
            if (!tipo || !nome) return;
            
            const key = tipo.trim().toLowerCase();
            recheios[key] = recheios[key] || [];
            recheios[key].push({ nome: nome.trim(), precoAdicional: 0 });
        }
    });
    return recheios;
}

function processEspeciais(values) {
    const arr = [];
    values.forEach((row) => {
        if (row.length >= 6) {
            const [categoria, subcat, nome, precoStr, fatias, imagem] = row;
            
            // Valida se os campos essenciais não estão vazios
            if (!subcat || !nome || !precoStr) return;
            
            const preco = parseFloat(String(precoStr).replace(",", "."));
            
            if (!isNaN(preco)) {
                arr.push({
                    nome: `${nome.trim()} (${subcat.trim()})`,
                    preco,
                    fatias: fatias ? fatias.trim() : '',
                    imagem: imagem ? imagem.trim() : "img/placeholder.jpg",
                });
            }
        }
    });
    return arr;
}

function processTortasSalgadas(values) {
    const arr = [];
    values.forEach((row) => {
        if (row.length >= 4) {
            const [categoria, nome, precoStr, imagem] = row;
            
            // Valida se os campos essenciais não estão vazios
            if (!nome || !precoStr) return;
            
            const preco = parseFloat(String(precoStr).replace(",", "."));
            
            if (!isNaN(preco)) {
                arr.push({
                    nome: nome.trim(),
                    preco,
                    imagem: imagem ? imagem.trim() : "img/placeholder.jpg",
                });
            }
        }
    });
    return arr;
}

function processProntaEntrega(values) {
    const arr = [];
    console.log('🔍 processProntaEntrega - Total de linhas recebidas:', values.length);
   
    values.forEach((row, i) => {
        console.log(`📋 Linha ${i + 1} (índice ${i}):`, row);
        
        if (row.length >= 5) {
            const [produto, precoStr, quantidadeStr, pedidoStr, imagem, OBSp] = row;
            
            console.log(`  ├─ Produto: "${produto}"`);
            console.log(`  ├─ Preço: "${precoStr}"`);
            console.log(`  ├─ Quantidade: "${quantidadeStr}"`);
            console.log(`  ├─ Pedido: "${pedidoStr}"`);
            console.log(`  └─ Imagem: "${imagem}"`);
            
            // Valida se os campos essenciais não estão vazios
            if (!produto || !precoStr) {
                console.log(`  ❌ REJEITADO: Produto ou preço vazio`);
                return;
            }
            
            const preco = parseFloat(String(precoStr).replace(",", "."));
            const quantidade = parseInt(String(quantidadeStr)) || 0;
            const pedido = parseInt(String(pedidoStr)) || 0;
            const disponivel = quantidade - pedido;
            const OBS = OBSp;
            
            console.log(`  ├─ Preço parseado: ${preco}`);
            console.log(`  ├─ Quantidade parseada: ${quantidade}`);
            console.log(`  ├─ Pedido parseado: ${pedido}`);
            console.log(`  └─ Disponível: ${disponivel}`);
            
            if (!isNaN(preco) && disponivel > 0) {
                console.log(`  ✅ ADICIONADO ao array`);
                arr.push({
                    nome: produto.trim(),
                    preco,
                    quantidade,
                    pedido,
                    disponivel,
                    imagem: imagem ? imagem.trim() : "img/placeholder.jpg",
					OBS,
                    rowIndex: i + 1 // +2 porque linha 1 é cabeçalho e array começa em 0
                });
            } else {
                console.log(`  ❌ REJEITADO: Preço inválido (${isNaN(preco)}) ou disponível <= 0 (${disponivel})`);
            }
        } else {
            console.log(`  ❌ REJEITADO: Linha tem apenas ${row.length} colunas (mínimo 4)`);
        }
    });
    
    console.log(`✅ Total de produtos processados: ${arr.length}`);
    return arr;
}

function processSheetData(sheetName, values) {
    // A primeira linha (cabeçalho) é ignorada
    const dataRows = values.slice(0);
    
    switch (sheetName) {
        case "doces":
            return processDoces(dataRows);
        case "salgados":
            return processSalgados(dataRows);
        case "bolos":
            // Recheios tradicionais e premium, que estão na mesma aba
            const recheios = processRecheios(dataRows);
            return {
                recheiosTradicionais: recheios.tradicional || [],
                recheiosPremium: recheios.premium || [],
            };
        case "tortas_salgadas":
            return processTortasSalgadas(dataRows);
        case "especiais":
            return processEspeciais(dataRows);
        case "pronta_entrega":
            return processProntaEntrega(dataRows);
        default:
            return {};
    }
}


// ===================================
// FUNÇÃO PRINCIPAL DE FETCH
// ===================================

async function readAllSheetsData() {
  const productData = {};

  for (const sheet of PRODUCT_SHEETS) {
    try {
      // URL de leitura pública (padrão para Netlify)
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet.name}`;
      const res = await fetch(url);
      const text = await res.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.substring(jsonStart, jsonEnd);
      
      const data = JSON.parse(jsonText);
      // FIM DA CORREÇÃO
      
      const values = data.table.rows.map((row) =>
        row.c.map((cell) => (cell && cell.v !== null ? String(cell.v) : ""))
      );

      // Processar e armazenar os dados
      productData[sheet.name] = processSheetData(sheet.name, values);

    } catch (error) {
      console.error(
        `Erro ao ler a aba '${sheet.name}' da planilha:`,
        error
      );
    }
  }

  // Mapeamento final para a estrutura do objeto 'produtos' em scripts.js
  return {
    doces: productData.doces,
    // Mapeia recheios para o formato que scripts.js espera
    bolos: { 
        tradicional: productData.bolos?.recheiosTradicionais || [],
        premium: productData.bolos?.recheiosPremium || [],
    },
    salgados: productData.salgados,
    tortas_salgadas: productData.tortas_salgadas,
    especiais: productData.especiais,
    pronta_entrega: productData.pronta_entrega,
  };
}


// ----------------------------------------------------
// Execução e integração com scripts.js
// ----------------------------------------------------

// Função auto-executável para iniciar o carregamento de dados
(async () => {
    try {
        console.log("Iniciando carregamento de dados do Google Sheets...");
        const productData = await readAllSheetsData();
        
        // Chama a função global em scripts.js
        if (typeof window.loadProducts === 'function') {
            window.loadProducts(productData);
            console.log("Dados carregados e passados para scripts.js.");
        } else {
            console.error("ERRO: Função window.loadProducts não encontrada em scripts.js. Verifique se o arquivo scripts.js está sendo carregado corretamente.");
        }
    } catch (error) {
        console.error("ERRO CRÍTICO ao carregar dados da planilha:", error);
        // Exibe um toast amigável se a função showToast existir em scripts.js
        if (typeof window.showToast === 'function') {
            window.showToast("Erro ao carregar cardápio. Verifique a configuração da planilha ou o console.", 'error');
        }
    }
})();