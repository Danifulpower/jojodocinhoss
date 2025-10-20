// ===== ALERTAS PERSONALIZADOS =====

/**
 * Exibe um alerta simples com mensagem
 * @param {string} message - Mensagem a exibir
 * @param {string} title - Título do alerta (opcional)
 * @param {function} callback - Função a executar ao confirmar (opcional)
 */
function showAlert(message, title = "Atenção", callback) {
    const overlay = document.getElementById('customAlertOverlay');
    const titleElement = document.getElementById('alertTitle');
    const messageElement = document.getElementById('alertMessage');
    const confirmBtn = document.getElementById('alertConfirmBtn');
    
    if (!overlay || !titleElement || !messageElement) {
        console.error('Elementos de alerta não encontrados');
        alert(message); // Fallback para alerta nativo
        return;
    }
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    overlay.classList.remove('hidden');
    
    // Configurar callback
    const handleConfirm = function() {
        closeAlert();
        if (typeof callback === 'function') {
            callback(true);
        }
    };
    
    // Atualizar evento do botão
    confirmBtn.onclick = handleConfirm;
    
    // Fechar ao pressionar Enter ou Escape
    const handleKeydown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            handleConfirm();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

/**
 * Fecha o alerta personalizado
 */
function closeAlert() {
    const overlay = document.getElementById('customAlertOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Exibe um alerta de confirmação com opções Sim/Não
 * @param {string} message - Mensagem a exibir
 * @param {function} onConfirm - Função a executar se confirmar
 * @param {function} onCancel - Função a executar se cancelar (opcional)
 * @param {string} title - Título da confirmação (opcional)
 */
function showConfirmation(message, onConfirm, onCancel, title = "Confirmar") {
    const overlay = document.getElementById('customConfirmationOverlay');
    const titleElement = document.getElementById('confirmationTitle');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmationConfirmBtn');
    const cancelBtn = document.getElementById('confirmationCancelBtn');
    
    if (!overlay || !titleElement || !messageElement) {
        console.error('Elementos de confirmação não encontrados');
        const result = confirm(message);
        if (result && typeof onConfirm === 'function') onConfirm();
        else if (!result && typeof onCancel === 'function') onCancel();
        return;
    }
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    overlay.classList.remove('hidden');
    
    // Configurar eventos dos botões
    const handleConfirm = function() {
        closeConfirmation();
        if (typeof onConfirm === 'function') onConfirm();
    };
    
    const handleCancel = function() {
        closeConfirmation();
        if (typeof onCancel === 'function') onCancel();
    };
    
    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;
    
    // Fechar ao pressionar Escape (cancela) ou Enter (confirma)
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'Enter') {
            handleConfirm();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

/**
 * Fecha o alerta de confirmação personalizado
 */
function closeConfirmation() {
    const overlay = document.getElementById('customConfirmationOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ===== TOAST DE NOTIFICAÇÕES =====

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) {
        console.log(message); // Fallback simples
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }, 3000);
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

// ===== UTILITÁRIOS DE TELAS =====

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function formatarData(dataISO) {
    if (!dataISO) return "Data não informada";
    
    const [dataPart, horaPart] = dataISO.split('T');
    const [ano, mes, dia] = dataPart.split('-');
    const [horas, minutos] = horaPart.split(':');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

function allowOnlyNumbers(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 13) {
        event.preventDefault();
        return false;
    }
    return true;
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

function enhanceMobileExperience() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.classList.add('btn-touch');
        });
        
        btn.addEventListener('touchend', function() {
            this.classList.remove('btn-touch');
        });
    });
}

function initializeDateField() {
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
}

function adjustImagesToContainer() {
    // Implementação opcional para ajustes de imagem
}

// ===== INICIALIZAÇÃO DE TELAS =====

document.addEventListener('DOMContentLoaded', function() {
    initializeDateField();
    enhanceMobileExperience();
    
    // Fechar menus ao clicar fora
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
    
    // Fechar alertas ao clicar no overlay
    const alertOverlay = document.getElementById('customAlertOverlay');
    const confirmOverlay = document.getElementById('customConfirmationOverlay');
    
    if (alertOverlay) {
        alertOverlay.addEventListener('click', function(e) {
            if (e.target === this) closeAlert();
        });
    }
    
    if (confirmOverlay) {
        confirmOverlay.addEventListener('click', function(e) {
            if (e.target === this) closeConfirmation();
        });
    }

    // Fechar alertas com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const alertOverlay = document.getElementById('customAlertOverlay');
            const confirmOverlay = document.getElementById('customConfirmationOverlay');
            
            if (alertOverlay && !alertOverlay.classList.contains('hidden')) {
                closeAlert();
            }
            if (confirmOverlay && !confirmOverlay.classList.contains('hidden')) {
                closeConfirmation();
            }
        }
    });
});
//================================
// Alerta da tela de bolos
//================================

/**
 * Exibe o alerta de informações do bolo
 */
function showBoloAlert() {
    const boloAlert = document.getElementById('customAlertBolo');
    const confirmBtn = document.getElementById('boloAlertConfirmBtn');
    
    if (!boloAlert) {
        console.error('Elementos do alerta de bolo não encontrados');
        return;
    }
    
    // Mostra o alerta
    boloAlert.classList.remove('hidden');
    
    // Configura o botão OK
    const handleConfirm = function() {
        closeBoloAlert();
    };
    
    confirmBtn.onclick = handleConfirm;
    
    // Fechar ao pressionar Enter ou Escape
    const handleKeydown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            handleConfirm();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

/**
 * Fecha o alerta de bolo
 */
function closeBoloAlert() {
    const boloAlert = document.getElementById('customAlertBolo');
    if (boloAlert) {
        boloAlert.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Fechar alerta de bolo ao clicar no overlay
    const boloAlert = document.getElementById('customAlertBolo');
    if (boloAlert) {
        boloAlert.addEventListener('click', function(e) {
            if (e.target === this) closeBoloAlert();
        });
    }

    // Fechar alertas com ESC (atualizar para incluir o alerta de bolo)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const alertOverlay = document.getElementById('customAlertOverlay');
            const confirmOverlay = document.getElementById('customConfirmationOverlay');
            const boloAlert = document.getElementById('customAlertBolo');
            
            if (alertOverlay && !alertOverlay.classList.contains('hidden')) {
                closeAlert();
            }
            if (confirmOverlay && !confirmOverlay.classList.contains('hidden')) {
                closeConfirmation();
            }
            if (boloAlert && !boloAlert.classList.contains('hidden')) {
                closeBoloAlert();
            }
        }
    });
});






//**************** bolo 1x ********************

/**
 * Verifica se é a primeira vez que o usuário vê o alerta de bolo
 */
function shouldShowBoloAlert() {
    try {
        // Verifica no localStorage se já foi mostrado
        const alreadySeen = localStorage.getItem('boloAlertSeen');
        if (!alreadySeen) {
            localStorage.setItem('boloAlertSeen', 'true');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao acessar localStorage:', error);
        // Fallback: mostrar o alerta se houver erro
        return true;
    }
}

/**
 * Reseta a preferência do alerta de bolo (para testes)
 */
function resetBoloAlert() {
    try {
        localStorage.removeItem('boloAlertSeen');
    } catch (error) {
        console.error('Erro ao remover item do localStorage:', error);
    }
}