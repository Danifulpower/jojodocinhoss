// Apenas a API Key é necessária para planilhas públicas (somente leitura)
// Chave API do usuário: AIzaSyDelt5ZItoYpxJlXI-4Sz9zHhKp9Bbk-g0
const API_KEY = 'AIzaSyDelt5ZItoYpxJlXI-4Sz9zHhKp9Bbk-g0'; 

// ID da Planilha. Obtido do link: https://docs.google.com/spreadsheets/d/1zGnS57nG1cAUi5Y54Z9Job3lyRx3uUUzqs_7Wf2MELM/ antiga
// ID da Planilha. Obtido do link: https://docs.google.com/spreadsheets/d/e/2PACX-1vRD2gOFMP2l-qFS5Ub4R2Ccf4foM_duQS6jbm6Hs1c99Aw8UXr6BulWURoCf-eZ3QbtSbAQwafUyL61/pubhtml
const SPREADSHEET_ID = '1zGnS57nG1cAUi5Y54Z9Job3lyRx3uUUzqs_7Wf2MELM';

// Nome da aba onde os pedidos serão escritos (para a função writeDataToSheet)
const SHEET_PEDIDOS = 'Pedidos'; 

// VARIÁVEIS DE ESTADO DA API
let gapiInited = false;
let tokenClient; // Variável para o cliente GIS (escrita)
let gisInited = false; // Variável para estado do GIS (escrita)
//
// Escopos de acesso necessários (leitura e escrita na planilha)
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'; 
// ID do Cliente para autenticação (escrita)
const CLIENT_ID = '367126720487-hfklr61id2ker3tuot1ptvs87i2d1u1g.apps.googleusercontent.com'; 

// Lista as abas de produtos a serem lidas e o intervalo de dados (A2 para pular cabeçalho)
// Formato: Categoria,Subcategoria/Tipo,Nome,Preço,Mínimo/Fatias,Imagem
const PRODUCT_SHEETS = [
    { name: 'doces', range: 'doces!A2:F' }, // Categoria,Subcategoria,Nome,Preço,Mínimo,Imagem
    { name: 'salgados', range: 'salgados!A2:E' }, // Categoria,Nome,Sabor,Preço,Imagem
    { name: 'tortas_salgadas', range: 'tortas_salgadas!A2:D' }, // Categoria,Nome,Preço,Imagem
    { name: 'bolos', range: 'bolos!A2:C' }, // Categoria,Tipo de Recheio,Nome do Recheio
    { name: 'especiais', range: 'especiais!A2:F' }, // Categoria,Subcategoria,Nome,Preço,Fatias/Itens,Imagem
];


// ===============================================
// FUNÇÕES DE PROCESSAMENTO DE DADOS
// ===============================================

/**
 * Processa as linhas da aba 'doces' e as estrutura por tipo (Tradicionais, Especiais, Gourmet).
 * Espera a seguinte ordem: Categoria, Subcategoria, Nome, Preço (R$), Mínimo, Imagem
 */
function processDoces(values) {
    const doces = { tradicionais: [], especiais: [], gourmet: [] };

    values.forEach(row => {
        if (row.length >= 6) {
            const [ , subcategoria, nome, precoStr, minimoStr, imagem] = row;
            const preco = parseFloat(precoStr.replace(',', '.'));
            const minimo = parseInt(minimoStr);
            
            const produto = {
                nome: nome,
                preco: preco,
                minimo: isNaN(minimo) ? 1 : minimo,
                imagem: imagem || 'img/placeholder.jpg'
            };

            // Mapear subcategoria da planilha para a chave do objeto
            const subcategoriaLower = subcategoria ? subcategoria.toLowerCase().trim() : '';
            
            // Mapeamento: "tradicional" → "tradicionais", "especial" → "especiais"
            let chave = subcategoriaLower;
            if (subcategoriaLower === 'tradicional') {
                chave = 'tradicionais';
            } else if (subcategoriaLower === 'especial') {
                chave = 'especiais';
            }

            if (doces[chave]) {
                doces[chave].push(produto);
            }
            // Não faz nada se a subcategoria for desconhecida
        }
    });

    return doces;
}

/**
 * Processa as linhas da aba 'salgados' e as estrutura por tipo.
 * Espera a seguinte ordem: Categoria, Nome, Sabor, Preço (R$), Imagem
 */
function processSalgados(values) {
    const salgados = [];

    values.forEach(row => {
        if (row.length >= 5) {
            const [ , nome, sabor, precoStr, imagem] = row;
            const preco = parseFloat(precoStr.replace(',', '.'));

            const produto = {
                nome: nome,
                sabor: sabor,
                preco: preco,
                minimo: 25, // Salgados têm mínimo fixo de 25
                imagem: imagem || 'img/placeholder.jpg'
            };
            salgados.push(produto);
        }
    });

    return salgados;
}

/**
 * Processa as linhas da aba 'tortas_salgadas'
 * Espera a seguinte ordem: Categoria, Nome do Produto, Preço (R$), Imagem
 */
function processTortasSalgadas(values) {
    const tortas = [];

    values.forEach(row => {
        if (row.length >= 4) {
            const [ , nome, precoStr, imagem] = row;
            const preco = parseFloat(precoStr.replace(',', '.'));

            const produto = {
                nome: nome,
                preco: preco,
                minimo: 1,
                imagem: imagem || 'img/placeholder.jpg'
            };
            tortas.push(produto);
        }
    });

    return tortas;
}

/**
 * Processa a aba 'bolos' (apenas recheios).
 * Espera a seguinte ordem: Categoria, Tipo de Recheio, Nome do Recheio
 * Esta função deve retornar um objeto onde a chave é o Tipo (ex: 'Tradicional') e o valor é um array de {nome, precoAdicional}.
 */
function processBolos(values) {
    const recheios = {};

    values.forEach(row => {
        if (row.length >= 3) {
            const [, tipoRecheio, nomeRecheio] = row;
            const tipoLower = tipoRecheio.trim().toLowerCase();
            
            if (!recheios[tipoLower]) {
                recheios[tipoLower] = [];
            }
            
            // Adiciona o recheio sem preço adicional por enquanto (a lógica de preço está no scripts.js)
            recheios[tipoLower].push({ nome: nomeRecheio.trim(), precoAdicional: 0 }); 
        }
    });

    return recheios;
}

/**
 * Processa a aba 'especiais' (Outros bolos, tortas doces, etc.)
 * Espera a seguinte ordem: Categoria, Subcategoria, Nome, Preço (R$), Fatias / Itens, Imagem
 */
function processEspeciais(values) {
    const especiais = [];

    values.forEach(row => {
        if (row.length >= 6) {
            const [ , subcategoria, nome, precoStr, fatiasStr, imagem] = row;
            const preco = parseFloat(precoStr.replace(',', '.'));

            const produto = {
                nome: `${nome} (${subcategoria})`, // Junta nome e subcategoria para o display
                preco: preco,
                minimo: 1, // Assumindo 1 para bolo caseiro/torta inteira
                fatias: fatiasStr,
                imagem: imagem || 'img/placeholder.jpg'
            };
            especiais.push(produto);
        }
    });

    return especiais;
}
/**
 * pronta entrega
 * 
 */
function processProntaEntrega(values) {
    const prontaEntrega = [];

    values.forEach(row => {
        if (row.length >= 4) {
            const [nome, imagem, precoStr, quantidadeStr] = row;
            const preco = parseFloat(precoStr.replace(',', '.'));
            const quantidade = parseInt(quantidadeStr);

            // Só adiciona se a quantidade for maior que 0
            if (quantidade > 0) {
                const produto = {
                    nome: nome,
                    imagem: imagem || 'img/placeholder.jpg',
                    preco: preco,
                    quantidade: quantidade
                };
                prontaEntrega.push(produto);
            }
        }
    });

    return prontaEntrega;
}

// ===============================================
// FUNÇÕES DE LEITURA (API)
// ===============================================

/**
 * LÊ TODAS AS ABAS DE PRODUTOS DA PLANILHA.
 * @returns {Object} Objeto contendo todos os dados de produtos.
 */
async function readAllSheetsData() {
    if (!gapiInited) {
        throw new Error('O cliente da API Google não foi inicializado.');
    }
    
    const productData = {};

    for (const sheet of PRODUCT_SHEETS) {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: sheet.range,
            });

            if (response.result.values) {
                switch (sheet.name) {
                    case 'doces':
                        productData.doces = processDoces(response.result.values);
                        break;
                    case 'salgados':
                        productData.salgados = processSalgados(response.result.values);
                        break;
                    case 'bolos':
                        productData.bolos = processBolos(response.result.values);
                        break;
                    case 'tortas_salgadas':
                        productData.tortas_salgadas = processTortasSalgadas(response.result.values);
                        break;
                    case 'especiais':
                        productData.especiais = processEspeciais(response.result.values);
                        break;
					 case 'pronta_entrega':
						productData.pronta_entrega = processProntaEntrega(response.result.values);
						break;
                    default:
                        console.warn(`Aba desconhecida: ${sheet.name}`);
                }
            } else {
                console.log(`A aba ${sheet.name} está vazia.`);
            }

        } catch (err) {
            console.error('Erro ao ler a aba:', sheet.name, err);
            // Lança um erro detalhado para ser capturado pela função readSheetData
            throw new Error(`Falha ao ler dados da Planilha: ${sheet.name}. Detalhes: ${err.result?.error?.message || err.message}`);
        }
    }
    
    // CHAMA A FUNÇÃO GLOBAL NO SCRIPTS.JS PARA POPULAR A UI
    if (typeof window.loadProducts === 'function') {
        window.loadProducts(productData);
    } else {
        console.error('Função window.loadProducts não definida em scripts.js. A UI não será atualizada.');
    }
    
    return productData; 
}


// ===============================================
// FUNÇÕES DE INICIALIZAÇÃO E AUTENTICAÇÃO
// ===============================================

/**
 * Função chamada quando a biblioteca gapi estiver carregada (definida no index.html)
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Inicializa o cliente da API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  });
  gapiInited = true;
  // Tenta carregar os dados imediatamente se o gapi estiver pronto
  readSheetData(); 
  maybeEnableButtons();
}

/**
 * Função chamada quando a biblioteca de Identidade (GIS) estiver carregada (definida no index.html)
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // O callback será definido no momento da chamada
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Habilita o botão de login após o carregamento de ambas as bibliotecas.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        // Lógica de UI para habilitar o login (se houver um botão)
        // Ex: document.getElementById('authorize_button').disabled = false;
        // Para a leitura, se já estiver pronto, não precisa de botão de login.
    }
}

/**
 * Função wrapper para readAllSheetsData. Usada no clique do botão ou após autenticação.
 */
function readSheetData() {
    // Tenta ler diretamente. Se der erro de autenticação, o gapi.client.sheets.spreadsheets.values.get falha.
    // Como a API Key é usada, a leitura para planilhas públicas geralmente funciona sem token.
    readAllSheetsData().catch(error => {
        // Exibe um erro genérico se a leitura falhar (ex: planilha privada ou ID errado)
        if (typeof showToast !== 'undefined') {
            showToast(`Erro ao carregar catálogo: ${error.message}`, 'error');
        } else {
             alert(`Erro ao ler a planilha: ${error.message}`);
        }
    });
}


// ===============================================
// FUNÇÕES DE ESCRITA (PEDIDOS)
// ===============================================

/**
 * Função de alto nível para escrever dados na Planilha.
 * Requer autenticação do usuário.
 * @param {Array} values - A linha de dados a ser escrita (Array de strings).
 * @returns {Promise<boolean>} Retorna true se a escrita foi bem-sucedida.
 */
async function writeDataToSheet(values) {
    return new Promise(async (resolve, reject) => {
        if (!gapiInited || !gisInited) {
            reject(new Error('Serviços do Google não inicializados. Tente novamente.'));
            return;
        }

        // Função interna que executa a escrita após a obtenção/verificação do token
        const performWrite = async () => {
            try {
                const result = await performWriteOperation(values);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };

        if (gapi.client.getToken() === null) {
            // Se não houver token, solicita a autenticação
            tokenClient.callback = async (resp) => {
                if (resp.error !== undefined) {
                    reject(new Error('Erro de autenticação do Google (para escrita): ' + resp.error));
                    return;
                }
                await performWrite();
            };
            // Prompt o usuário para consentimento apenas quando ele clicar em "Finalizar Pedido"
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Se o token já existe, escreve diretamente.
            performWrite();
        }
    });
}

/**
 * Executa a operação de escrita na API do Sheets.
 */
async function performWriteOperation(values) {
    const range = `${SHEET_PEDIDOS}!A:A`; // Define o intervalo de escrita na aba Pedidos
    
    const request = {
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [values],
        },
    };

    try {
        await gapi.client.sheets.spreadsheets.values.append(request);
        return true;
    } catch (err) {
        console.error('Erro ao escrever na API do Sheets:', err);
        throw new Error('Falha ao registrar pedido na Planilha Google. Detalhes: ' + err.result.error.message);
    }
}


// Torna as funções globais (para serem chamadas a partir do index.html e scripts.js)
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
window.writeDataToSheet = writeDataToSheet;
// A função readSheetData() é chamada internamente após a inicialização da API