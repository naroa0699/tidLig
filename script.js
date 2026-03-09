// La app se inicia desde firebase-app.js tras el login,
// o directamente si ya hay sesión activa.
window._iniciarApp = function() {

    const CATEGORIAS_TAREAS_PREDETERMINADAS = [
        { id: 'personal', nombre: 'Personal', color: '#EDAFB8', icono: 'flower' },
        { id: 'trabajo', nombre: 'Trabajo', color: '#DEDBD2', icono: 'briefcase' },
        { id: 'urgente', nombre: 'Urgente', color: '#4A5759', icono: 'flame' },
        { id: 'ideas', nombre: 'Ideas', color: '#B0C4B1', icono: 'lightbulb' }
    ];
    const COLORES_CATEGORIA_TAREAS = ['#EDAFB8', '#F7E1D7', '#DEDBD2', '#B0C4B1', '#4A5759'];
    const ICONOS_CATEGORIA_TAREAS = ['tag', 'flower', 'laptop', 'flame', 'lightbulb', 'book-open', 'brain', 'house', 'briefcase'];
    const ICONOS_CATEGORIA_CLASES = {
        tag: 'tag',
        flower: 'flower-lotus',
        laptop: 'laptop',
        flame: 'flame',
        lightbulb: 'lightbulb-filament',
        'book-open': 'book-open',
        brain: 'brain',
        house: 'house',
        briefcase: 'briefcase'
    };
    const ICONOS_CATEGORIA_NOMBRES = {
        tag: 'Etiqueta',
        flower: 'Flor',
        laptop: 'Portátil',
        flame: 'Urgente',
        lightbulb: 'Idea',
        'book-open': 'Estudio',
        brain: 'Pensar',
        house: 'Casa',
        briefcase: 'Trabajo'
    };
    const ESTADOS_VALIDOS = ['sin-empezar', 'en-ejecucion', 'finalizado'];
    const COLORES_VALIDOS = ['rosa', 'azul', 'verde', 'amarillo'];
    const ORDENES_VALIDOS = ['creacion-reciente', 'creacion-antigua', 'limite-cercana', 'limite-lejana', 'alfabetico'];
    const STORAGE_ORDEN_TAREAS = 'ordenTareas';
    const STORAGE_AVISOS = 'avisosConfig';
    const STORAGE_AVISOS_ENVIADOS = 'avisosEnviados';
    const STORAGE_TEMA_UI = 'temaUI';
    const TEMAS_UI = [
        { id: 'oliva', nombre: 'Oliva', colores: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'] },
        { id: 'salvia', nombre: 'Salvia', colores: ['#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41'] },
        { id: 'campo', nombre: 'Campo', colores: ['#386641', '#6a994e', '#a7c957', '#f2e8cf', '#bc4749'] },
        { id: 'arena', nombre: 'Arena', colores: ['#ccd5ae', '#e9edc9', '#fefae0', '#faedcd', '#d4a373'] },
        { id: 'carbon', nombre: 'Carbón', colores: ['#171614', '#3a2618', '#754043', '#9a8873', '#37423d'] },
        { id: 'lago', nombre: 'Lago', colores: ['#cad2c5', '#84a98c', '#52796f', '#354f52', '#2f3e46'] },
        { id: 'vino', nombre: 'Vino', colores: ['#461220', '#8c2f39', '#b23a48', '#fcb9b2', '#fed0bb'] },
        { id: 'malva', nombre: 'Malva', colores: ['#f7d1cd', '#e8c2ca', '#d1b3c4', '#b392ac', '#735d78'] }
    ];
    const EXPORTABLE_KEYS = ['tareas', 'tareasCategorias', 'eventos', 'eventosV2', 'habitos', 'aguaTracker', 'habitosDetalle', 'notas', 'pomodorosHoy', 'ordenTareas', 'avisosConfig', 'temaUI', 'tareasHistorial', 'preferenciaLimpieza'];
    const STORAGE_TAREAS_HISTORIAL = 'tareasHistorial';
    const STORAGE_PREFERENCIA_LIMPIEZA = 'preferenciaLimpieza';
    const STORAGE_AUTO_AGENDA_PREFS = 'autoAgendaPrefs';
    const HABITOS_PREDETERMINADOS = [
        { id: 'beber-agua', nombre: 'Beber agua', descripcion: 'Hidratación diaria con objetivo en litros.' },
        { id: 'ejercicio-30', nombre: 'Ejercicio', descripcion: 'Tiempo diario configurable para entrenar.' },
        { id: 'sueno-8h', nombre: 'Sueño', descripcion: 'Horas de descanso configurables cada día.' },
        { id: 'skincare-am-pm', nombre: 'Skincare AM/PM', descripcion: 'Rutina de mañana y noche.' },
        { id: 'lectura-20', nombre: 'Lectura', descripcion: 'Minutos diarios de lectura configurables.' },
        { id: 'estiramientos-10', nombre: 'Estiramientos', descripcion: 'Tiempo diario configurable de movilidad.' }
    ];
    const HABITOS_DETALLE_CONFIG = {
        'ejercicio-30': { objetivoDefecto: 30, minObjetivo: 5, maxObjetivo: 240, tipo: 'numero' },
        'sueno-8h': { objetivoDefecto: 8, minObjetivo: 4, maxObjetivo: 12, tipo: 'numero' },
        'lectura-20': { objetivoDefecto: 20, minObjetivo: 5, maxObjetivo: 180, tipo: 'numero' },
        'estiramientos-10': { objetivoDefecto: 10, minObjetivo: 5, maxObjetivo: 120, tipo: 'numero' },
        'skincare-am-pm': { tipo: 'checklist' }
    };

    function escaparHTML(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function storageGetJSON(clave, fallback) {
        try {
            const raw = localStorage.getItem(clave);
            if (raw === null) return fallback;
            const parsed = JSON.parse(raw);
            return parsed ?? fallback;
        } catch {
            try {
                localStorage.removeItem(clave);
            } catch {
                // no-op
            }
            return fallback;
        }
    }

    function storageSetJSON(clave, valor) {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
            return true;
        } catch {
            return false;
        }
    }

    function asegurarArray(valor) {
        return Array.isArray(valor) ? valor : [];
    }

    function crearIdTarea() {
        return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    function crearIdHabito() {
        return `hab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    function normalizarAvisosConfig(config) {
        const activo = Boolean(config?.activo);
        const anticipacion = [5, 10, 15].includes(Number(config?.anticipacionMinutos))
            ? Number(config.anticipacionMinutos)
            : 10;
        return { activo, anticipacionMinutos: anticipacion };
    }

    function cargarAvisosConfig() {
        return normalizarAvisosConfig(storageGetJSON(STORAGE_AVISOS, {}));
    }

    function guardarAvisosConfig() {
        localStorage.setItem(STORAGE_AVISOS, JSON.stringify(avisosConfig));
    }

    function cargarAvisosEnviados() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_AVISOS_ENVIADOS) || '{}');
        } catch {
            return {};
        }
    }

    function guardarAvisosEnviados() {
        sessionStorage.setItem(STORAGE_AVISOS_ENVIADOS, JSON.stringify(avisosEnviados));
    }

    function temaUIValido(temaId) {
        return TEMAS_UI.some(tema => tema.id === temaId);
    }

    function cargarTemaUI() {
        const guardado = localStorage.getItem(STORAGE_TEMA_UI);
        return temaUIValido(guardado) ? guardado : 'salvia';
    }

    function nombreTemaUI(temaId) {
        return TEMAS_UI.find(tema => tema.id === temaId)?.nombre || 'Salvia';
    }

    function aplicarTemaUI(temaId) {
        const tema = temaUIValido(temaId) ? temaId : 'salvia';
        document.body.dataset.tema = tema;
        localStorage.setItem(STORAGE_TEMA_UI, tema);

        const btn = document.getElementById('btn-cambiar-tema');
        if (btn) {
            btn.innerHTML = `<span class="icono-texto"><i class="ph ph-palette" aria-hidden="true"></i><span>Tema: ${escaparHTML(nombreTemaUI(tema))}</span></span>`;
        }

        actualizarSelectorTemasActivo();
    }

    function renderSelectorTemas() {
        const contenedor = document.getElementById('tema-opciones');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        TEMAS_UI.forEach(tema => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tema-opcion';
            btn.dataset.temaId = tema.id;

            const muestras = (tema.colores || [])
                .map(color => `<span class="tema-muestra" style="background:${escaparHTML(color)}"></span>`)
                .join('');

            btn.innerHTML = `
                <span>${escaparHTML(tema.nombre)}</span>
                <span class="tema-muestras">${muestras}</span>
            `;

            btn.addEventListener('click', () => {
                aplicarTemaUI(tema.id);
                cerrarPanelTemas();
            });

            contenedor.appendChild(btn);
        });

        actualizarSelectorTemasActivo();
    }

    function actualizarSelectorTemasActivo() {
        const temaActual = document.body.dataset.tema || cargarTemaUI();
        document.querySelectorAll('.tema-opcion').forEach(btn => {
            btn.classList.toggle('activo', btn.dataset.temaId === temaActual);
        });
    }

    function inicializarSeguro(nombre, fn) {
        try {
            fn();
        } catch (error) {
            console.error(`[init] ${nombre}`, error);
        }
    }

    function abrirPanelTemas() {
        const panel = document.getElementById('panel-temas');
        if (!panel) return;
        panel.style.display = 'block';
    }

    function cerrarPanelTemas() {
        const panel = document.getElementById('panel-temas');
        if (!panel) return;
        panel.style.display = 'none';
    }

    function togglePanelTemas() {
        const panel = document.getElementById('panel-temas');
        if (!panel) return;
        if (panel.style.display === 'block') {
            cerrarPanelTemas();
        } else {
            abrirPanelTemas();
        }
    }

    function mostrarToast(mensaje, tipo = 'ok') {
        let zona = document.getElementById('toast-zone');
        if (!zona) {
            zona = document.createElement('div');
            zona.id = 'toast-zone';
            zona.className = 'toast-zone';
            document.body.appendChild(zona);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item${tipo === 'error' ? ' error' : ''}`;
        toast.textContent = mensaje;
        zona.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2800);
    }

    function exportarDatos() {
        const payload = {
            version: 1,
            exportadoEn: new Date().toISOString(),
            data: {}
        };

        EXPORTABLE_KEYS.forEach(key => {
            const valor = localStorage.getItem(key);
            if (valor === null) return;
            payload.data[key] = valor;
        });

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fecha = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `mi-organizador-backup-${fecha}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        mostrarToast('Backup exportado correctamente.');
    }

    function importarDatosDesdeTexto(texto) {
        let parsed;
        try {
            parsed = JSON.parse(texto);
        } catch {
            mostrarToast('Archivo JSON no válido.', 'error');
            return;
        }

        if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object') {
            mostrarToast('Formato de backup no reconocido.', 'error');
            return;
        }

        EXPORTABLE_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(parsed.data, key)) {
                const valor = parsed.data[key];
                if (valor === null || valor === undefined) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, typeof valor === 'string' ? valor : JSON.stringify(valor));
                }
            }
        });

        mostrarToast('Backup importado. Recargando...');
        location.reload();
    }

    function crearIdCategoriaTarea() {
        return `cat-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    }

    function normalizarColorCategoriaTarea(color) {
        return COLORES_CATEGORIA_TAREAS.includes(color) ? color : COLORES_CATEGORIA_TAREAS[0];
    }

    function normalizarIconoCategoriaTarea(icono) {
        return ICONOS_CATEGORIA_TAREAS.includes(icono) ? icono : 'tag';
    }

    function clasePhosphorIcono(icono) {
        const clave = normalizarIconoCategoriaTarea(icono);
        return `ph ph-${ICONOS_CATEGORIA_CLASES[clave] || 'tag'}`;
    }

    function nombreIconoCategoria(icono) {
        const clave = normalizarIconoCategoriaTarea(icono);
        return ICONOS_CATEGORIA_NOMBRES[clave] || 'Etiqueta';
    }

    function cargarCategoriasTareas() {
        const guardadas = storageGetJSON('tareasCategorias', []);
        if (!Array.isArray(guardadas) || guardadas.length === 0) {
            return [...CATEGORIAS_TAREAS_PREDETERMINADAS];
        }

        return guardadas
            .map(c => ({
                id: String(c.id || '').trim() || crearIdCategoriaTarea(),
                nombre: String(c.nombre || '').trim(),
                color: normalizarColorCategoriaTarea(c.color),
                icono: normalizarIconoCategoriaTarea(c.icono)
            }))
            .filter(c => c.nombre);
    }

    function guardarCategoriasTareas() {
        localStorage.setItem('tareasCategorias', JSON.stringify(categoriasTareas));
    }

    function obtenerCategoriaTarea(categoriaId) {
        return categoriasTareas.find(c => c.id === categoriaId) || null;
    }

    function colorHexARgb(colorHex) {
        if (!colorHex || !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) return '0, 0, 0';
        const limpio = colorHex.replace('#', '');
        const bigint = parseInt(limpio, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    }

    function idCategoriaDesdeNombre(nombre) {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    }

    function normalizarCategoria(categoria) {
        if (obtenerCategoriaTarea(categoria)) return categoria;
        return categoriasTareas[0]?.id || 'personal';
    }

    function normalizarEstado(estado) {
        return ESTADOS_VALIDOS.includes(estado) ? estado : 'sin-empezar';
    }

    function estadoATexto(estado) {
        const estadoNormalizado = normalizarEstado(estado);
        if (estadoNormalizado === 'en-ejecucion') return 'En ejecución';
        if (estadoNormalizado === 'finalizado') return 'Finalizado';
        return 'Sin empezar';
    }

    function categoriaATexto(categoria) {
        const categoriaNormalizada = normalizarCategoria(categoria);
        return obtenerCategoriaTarea(categoriaNormalizada)?.nombre || 'Sin categoría';
    }

    function iconoCategoriaTarea(categoria) {
        const categoriaNormalizada = normalizarCategoria(categoria);
        return obtenerCategoriaTarea(categoriaNormalizada)?.icono || 'tag';
    }

    function categoriaAEtiqueta(categoria) {
        const icono = iconoCategoriaTarea(categoria);
        return `<span class="categoria-etiqueta"><i class="${clasePhosphorIcono(icono)}" aria-hidden="true"></i><span>${escaparHTML(categoriaATexto(categoria))}</span></span>`;
    }

    function colorCategoriaTarea(categoria) {
        const categoriaNormalizada = normalizarCategoria(categoria);
        return obtenerCategoriaTarea(categoriaNormalizada)?.color || '#EDAFB8';
    }

    function normalizarColor(color) {
        return COLORES_VALIDOS.includes(color) ? color : 'rosa';
    }

    function fechaAClaveISO(fecha) {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, '0');
        const d = String(fecha.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function claveISOAFechaCorta(claveISO) {
        if (!claveISO || !/^\d{4}-\d{2}-\d{2}$/.test(claveISO)) return '';
        const [y, m, d] = claveISO.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    function obtenerClaveTareaPorFecha(tarea, fecha) {
        const claveFecha = fechaAClaveISO(fecha);
        const coincideNueva = tarea.fechaClave === claveFecha || tarea.fechaLimiteClave === claveFecha;
        if (coincideNueva) return true;

        // Compatibilidad con tareas antiguas guardadas solo con dia/mes.
        const fechaStrAntigua = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        return tarea.fecha === fechaStrAntigua || tarea.fechaLimite === fechaStrAntigua;
    }

    function renderVistaCalendarioActiva() {
        const vistaActiva = document.querySelector('.vista-btn.activo');
        if (vistaActiva && vistaActiva.dataset.vista === 'semana') {
            renderSemana();
            renderResumenHoy();
            return;
        }
        renderCalendario();
        renderResumenHoy();
    }

    function obtenerFiltroCategoria() {
        return document.getElementById('filtro-categoria')?.value || 'todas';
    }

    function obtenerFiltroEstado() {
        return document.getElementById('filtro-estado')?.value || 'todos';
    }

    function obtenerFiltroOrden() {
        const valor = document.getElementById('filtro-orden')?.value || 'creacion-reciente';
        return ORDENES_VALIDOS.includes(valor) ? valor : 'creacion-reciente';
    }

    function cargarOrdenGuardado() {
        const ordenGuardado = localStorage.getItem(STORAGE_ORDEN_TAREAS);
        const orden = ORDENES_VALIDOS.includes(ordenGuardado) ? ordenGuardado : 'creacion-reciente';
        const select = document.getElementById('filtro-orden');
        if (select) {
            select.value = orden;
        }
    }

    function guardarOrdenSeleccionado() {
        localStorage.setItem(STORAGE_ORDEN_TAREAS, obtenerFiltroOrden());
    }

    function timestampDeClaveISO(claveISO) {
        if (!claveISO || !/^\d{4}-\d{2}-\d{2}$/.test(claveISO)) return null;
        const [y, m, d] = claveISO.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
    }

    function minDesdeHora(hora) {
        if (!hora || !/^\d{2}:\d{2}$/.test(hora)) return null;
        const [h, m] = hora.split(':').map(Number);
        if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
        return (h * 60) + m;
    }

    function horaDesdeMin(totalMin) {
        const h = String(Math.floor(totalMin / 60)).padStart(2, '0');
        const m = String(totalMin % 60).padStart(2, '0');
        return `${h}:${m}`;
    }

    function normalizarAutoAgendaPrefs(prefs) {
        const inicio = /^\d{2}:\d{2}$/.test(String(prefs?.inicio || '')) ? prefs.inicio : '09:00';
        const fin = /^\d{2}:\d{2}$/.test(String(prefs?.fin || '')) ? prefs.fin : '20:00';
        const descansoMin = [0, 5, 10, 15].includes(Number(prefs?.descansoMin)) ? Number(prefs.descansoMin) : 5;
        const incluirFinSemana = Boolean(prefs?.incluirFinSemana);
        return { inicio, fin, descansoMin, incluirFinSemana };
    }

    function cargarAutoAgendaPrefs() {
        return normalizarAutoAgendaPrefs(storageGetJSON(STORAGE_AUTO_AGENDA_PREFS, {}));
    }

    function guardarAutoAgendaPrefs(prefs) {
        storageSetJSON(STORAGE_AUTO_AGENDA_PREFS, normalizarAutoAgendaPrefs(prefs));
    }

    function aplicarAutoAgendaPrefsEnUI() {
        const prefs = cargarAutoAgendaPrefs();
        const inicio = document.getElementById('auto-agenda-inicio');
        const fin = document.getElementById('auto-agenda-fin');
        const descanso = document.getElementById('auto-agenda-descanso');
        const finSemana = document.getElementById('auto-agenda-fin-semana');
        if (inicio) inicio.value = prefs.inicio;
        if (fin) fin.value = prefs.fin;
        if (descanso) descanso.value = String(prefs.descansoMin);
        if (finSemana) finSemana.checked = prefs.incluirFinSemana;
    }

    function leerAutoAgendaPrefsDesdeUI() {
        return normalizarAutoAgendaPrefs({
            inicio: document.getElementById('auto-agenda-inicio')?.value,
            fin: document.getElementById('auto-agenda-fin')?.value,
            descansoMin: Number(document.getElementById('auto-agenda-descanso')?.value),
            incluirFinSemana: document.getElementById('auto-agenda-fin-semana')?.checked
        });
    }

    function puntajePrioridadTarea(tarea) {
        let score = 1;
        const estado = normalizarEstado(tarea.estado);
        if (estado === 'en-ejecucion') score += 3;

        const categoria = String(tarea.categoria || '').toLowerCase();
        const texto = String(tarea.texto || '').toLowerCase();
        if (categoria.includes('urgente') || texto.includes('urgente')) score += 4;

        if (tarea.fechaLimiteClave) {
            const hoy = new Date();
            const hoyClave = fechaAClaveISO(hoy);
            const tsHoy = timestampDeClaveISO(hoyClave);
            const tsLimite = timestampDeClaveISO(tarea.fechaLimiteClave);
            if (tsHoy !== null && tsLimite !== null) {
                const dias = Math.round((tsLimite - tsHoy) / (24 * 60 * 60 * 1000));
                if (dias <= 0) score += 5;
                else if (dias <= 2) score += 4;
                else if (dias <= 5) score += 2;
            }
        }

        return score;
    }

    function normalizarDuracionTarea(valor) {
        const minutos = Number(valor);
        return [30, 45, 60, 90].includes(minutos) ? minutos : null;
    }

    function duracionEstimadaTareaMin(tarea) {
        const definidaPorUsuario = normalizarDuracionTarea(tarea?.duracionEstimadaMin);
        if (definidaPorUsuario) return definidaPorUsuario;

        const prioridad = puntajePrioridadTarea(tarea);
        if (prioridad >= 9) return 90;
        if (prioridad >= 6) return 60;
        return 45;
    }

    function bloquesOcupadosDia(fecha) {
        const bloques = [];
        const delDia = eventosDelDia(fecha);

        delDia.forEach(ev => {
            const inicio = minDesdeHora(ev.horaInicio);
            const fin = minDesdeHora(ev.horaFin);
            if (inicio === null && fin === null) return;
            if (inicio !== null && fin !== null && fin > inicio) {
                bloques.push([inicio, fin]);
                return;
            }
            if (inicio !== null) {
                bloques.push([inicio, Math.min(inicio + 45, 23 * 60 + 59)]);
            }
        });

        bloques.sort((a, b) => a[0] - b[0]);
        const combinados = [];
        bloques.forEach(([a, b]) => {
            if (combinados.length === 0 || a > combinados[combinados.length - 1][1]) {
                combinados.push([a, b]);
                return;
            }
            combinados[combinados.length - 1][1] = Math.max(combinados[combinados.length - 1][1], b);
        });
        return combinados;
    }

    function encontrarHuecoLibre(fecha, duracionMin, prefs) {
        const inicioJornada = minDesdeHora(prefs.inicio) ?? (9 * 60);
        const finJornada = minDesdeHora(prefs.fin) ?? (20 * 60);
        const descanso = Math.max(0, Number(prefs.descansoMin) || 0);
        const bloques = bloquesOcupadosDia(fecha);
        let cursor = inicioJornada;

        for (const [inicio, fin] of bloques) {
            if (inicio - cursor >= duracionMin) {
                return { inicioMin: cursor, finMin: cursor + duracionMin };
            }
            cursor = Math.max(cursor, fin + descanso);
        }

        if (finJornada - cursor >= duracionMin) {
            return { inicioMin: cursor, finMin: cursor + duracionMin };
        }

        return null;
    }

    function autoAgendarTareasPendientes() {
        const prefs = leerAutoAgendaPrefsDesdeUI();
        guardarAutoAgendaPrefs(prefs);

        const pendientes = tareas
            .filter(t => normalizarEstado(t.estado) !== 'finalizado')
            .filter(t => !eventos.some(ev => ev.autoTaskId === t.id))
            .sort((a, b) => puntajePrioridadTarea(b) - puntajePrioridadTarea(a));

        if (pendientes.length === 0) {
            mostrarToast('No hay tareas pendientes sin agendar.');
            return;
        }

        const hoy = new Date();
        let creados = 0;
        const maxDiasBusqueda = 21;

        pendientes.forEach(tarea => {
            const duracion = duracionEstimadaTareaMin(tarea);

            for (let offset = 0; offset < maxDiasBusqueda; offset++) {
                const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset);
                const dow = fecha.getDay();
                if (!prefs.incluirFinSemana && (dow === 0 || dow === 6)) continue;

                const hueco = encontrarHuecoLibre(fecha, duracion, prefs);
                if (!hueco) continue;

                const score = puntajePrioridadTarea(tarea);
                const color = score >= 9 ? 'amarillo' : (score >= 6 ? 'rosa' : 'verde');
                eventos.push({
                    id: crearIdEvento(),
                    nombre: `Tarea: ${tarea.texto}`,
                    color,
                    fechaClave: claveDelDia(fecha),
                    horaInicio: horaDesdeMin(hueco.inicioMin),
                    horaFin: horaDesdeMin(hueco.finMin),
                    repeticionUnidad: 'ninguna',
                    repeticionCada: 1,
                    autoTaskId: tarea.id
                });
                creados++;
                break;
            }
        });

        if (creados === 0) {
            mostrarToast('No encontré huecos libres para auto-agendar.', 'error');
            return;
        }

        guardarEventos();
        renderVistaCalendarioActiva();
        if (diaSeleccionado) mostrarPanel(diaSeleccionado);
        mostrarToast(`${creados} ${creados === 1 ? 'tarea agendada' : 'tareas agendadas'} automáticamente.`);
    }

    function tareasDelDiaClave(claveISO) {
        return tareas.filter(t => t.fechaClave === claveISO || t.fechaLimiteClave === claveISO);
    }

    function objetivoCumplidoEnDia(claveISO) {
        const delDia = tareasDelDiaClave(claveISO);
        if (delDia.length === 0) return false;
        return delDia.every(t => normalizarEstado(t.estado) === 'finalizado');
    }

    function rachaObjetivosConsecutivos() {
        let cursor = fechaAClaveISO(new Date());
        if (!objetivoCumplidoEnDia(cursor)) {
            cursor = sumarDiasAClaveISO(cursor, -1);
        }

        let racha = 0;
        while (cursor && objetivoCumplidoEnDia(cursor)) {
            racha++;
            cursor = sumarDiasAClaveISO(cursor, -1);
        }
        return racha;
    }

    function lunesConquistados() {
        const tareasConFecha = tareas.filter(t => /^\d{4}-\d{2}-\d{2}$/.test(t.fechaClave || ''));
        const lunesMap = new Map();

        tareasConFecha.forEach(t => {
            const fecha = fechaDesdeClaveISO(t.fechaClave);
            if (!fecha || fecha.getDay() !== 1) return;
            if (!lunesMap.has(t.fechaClave)) lunesMap.set(t.fechaClave, []);
            lunesMap.get(t.fechaClave).push(t);
        });

        let total = 0;
        lunesMap.forEach(lista => {
            if (lista.length === 0) return;
            if (lista.every(t => normalizarEstado(t.estado) === 'finalizado')) {
                total++;
            }
        });

        return total;
    }

    function pomodorosHoyGuardados() {
        const hoyClave = fechaAClaveISO(new Date());
        const data = storageGetJSON('pomodorosHoy', null);
        return data?.clave === hoyClave ? (Number(data.cantidad) || 0) : 0;
    }

    function totalTareasFinalizadasHistoricas() {
        const activas = tareas.filter(t => normalizarEstado(t.estado) === 'finalizado').length;
        const historial = storageGetJSON(STORAGE_TAREAS_HISTORIAL, []);
        const archivadas = Array.isArray(historial) ? historial.length : 0;
        return activas + archivadas;
    }

    function autoAgendadasTotales() {
        const guardados = storageGetJSON('eventosV2', []);
        if (!Array.isArray(guardados)) return 0;
        return guardados.filter(ev => ev && ev.autoTaskId).length;
    }

    function diaPerfectoHoy() {
        const hoy = fechaAClaveISO(new Date());
        const delDia = tareasDelDiaClave(hoy);
        if (delDia.length < 5) return false;
        return delDia.every(t => normalizarEstado(t.estado) === 'finalizado');
    }

    function obtenerLogrosEnfoque() {
        const racha = rachaObjetivosConsecutivos();
        const lunes = lunesConquistados();
        const finalizadas = totalTareasFinalizadasHistoricas();
        const autoSlots = autoAgendadasTotales();
        const pomodoros = pomodorosHoyGuardados();

        return [
            {
                id: 'racha5',
                titulo: 'Constancia de Bronce',
                desc: '5 dias seguidos cumpliendo tus objetivos.',
                desbloqueado: racha >= 5,
                progreso: `${Math.min(racha, 5)}/5 dias`
            },
            {
                id: 'racha10',
                titulo: 'Constancia de Oro',
                desc: '10 dias seguidos sin romper la racha.',
                desbloqueado: racha >= 10,
                progreso: `${Math.min(racha, 10)}/10 dias`
            },
            {
                id: 'lunes1',
                titulo: 'Rey del Lunes',
                desc: 'Completa todas tus tareas de un lunes.',
                desbloqueado: lunes >= 1,
                progreso: `${lunes}/1 lunes`
            },
            {
                id: 'lunes4',
                titulo: 'Emperador del Lunes',
                desc: 'Conquista 4 lunes completos.',
                desbloqueado: lunes >= 4,
                progreso: `${Math.min(lunes, 4)}/4 lunes`
            },
            {
                id: 'auto5',
                titulo: 'Arquitecta del Tiempo',
                desc: 'Auto-agenda 5 bloques de trabajo.',
                desbloqueado: autoSlots >= 5,
                progreso: `${Math.min(autoSlots, 5)}/5 bloques`
            },
            {
                id: 'auto20',
                titulo: 'Time Boxer Pro',
                desc: 'Auto-agenda 20 bloques en total.',
                desbloqueado: autoSlots >= 20,
                progreso: `${Math.min(autoSlots, 20)}/20 bloques`
            },
            {
                id: 'focus8',
                titulo: 'Maraton de Enfoque',
                desc: 'Haz 8 pomodoros en un mismo dia.',
                desbloqueado: pomodoros >= 8,
                progreso: `${Math.min(pomodoros, 8)}/8 pomodoros hoy`
            },
            {
                id: 'finalizadas25',
                titulo: 'Cierre Maestro',
                desc: 'Finaliza 25 tareas entre activas e historial.',
                desbloqueado: finalizadas >= 25,
                progreso: `${Math.min(finalizadas, 25)}/25 tareas`
            },
            {
                id: 'diaPerfecto',
                titulo: 'Dia Perfecto',
                desc: 'Completa todas las tareas de hoy (min. 5).',
                desbloqueado: diaPerfectoHoy(),
                progreso: diaPerfectoHoy() ? 'Completado' : 'Pendiente'
            }
        ];
    }

    function renderModalLogros() {
        const lista = document.getElementById('lista-logros');
        const resumen = document.getElementById('logros-resumen');
        if (!lista || !resumen) return;

        const logros = obtenerLogrosEnfoque();
        const desbloqueados = logros.filter(l => l.desbloqueado).length;
        resumen.textContent = `${desbloqueados}/${logros.length} logros desbloqueados`;

        lista.innerHTML = '';
        logros.forEach(logro => {
            const item = document.createElement('li');
            item.className = `logro-item ${logro.desbloqueado ? 'desbloqueado' : 'bloqueado'}`;
            item.innerHTML = `
                <i class="ph ${logro.desbloqueado ? 'ph-trophy' : 'ph-lock'}" aria-hidden="true"></i>
                <span class="titulo">${escaparHTML(logro.titulo)}</span>
                <span class="estado">${logro.desbloqueado ? 'Desbloqueado' : escaparHTML(logro.progreso)}</span>
                <span class="desc">${escaparHTML(logro.desc)}</span>
            `;
            lista.appendChild(item);
        });
    }

    function renderLogrosEnfoque() {
        const contenedor = document.getElementById('logros-enfoque');
        if (!contenedor) return;

        const racha = rachaObjetivosConsecutivos();
        const lunesGanados = lunesConquistados();
        const autoSlots = autoAgendadasTotales();
        const foco = pomodorosHoyGuardados();
        const logroRacha = racha >= 5;
        const logroLunes = lunesGanados > 0;

        contenedor.innerHTML = `
            <span class="logro-chip ${logroRacha ? 'activo' : ''}">5 dias seguidos: ${logroRacha ? 'Medalla desbloqueada' : `${racha}/5`}</span>
            <span class="logro-chip ${logroLunes ? 'activo' : ''}">Rey del Lunes: ${logroLunes ? `${lunesGanados} lunes conquistados` : 'Pendiente'}</span>
            <span class="logro-chip ${autoSlots >= 5 ? 'activo' : ''}">Auto-agendar: ${Math.min(autoSlots, 5)}/5</span>
            <span class="logro-chip ${foco >= 8 ? 'activo' : ''}">Pomodoro hoy: ${Math.min(foco, 8)}/8</span>
        `;

        renderModalLogros();
    }

    function sumarDiasAClaveISO(claveISO, dias) {
        const fecha = fechaDesdeClaveISO(claveISO);
        if (!fecha) return null;
        fecha.setDate(fecha.getDate() + dias);
        return fechaAClaveISO(fecha);
    }

    function comparadorTareas(a, b) {
        if (!a || typeof a !== 'object') return 1;
        if (!b || typeof b !== 'object') return -1;
        const orden = obtenerFiltroOrden();

        if (orden === 'alfabetico') {
            return (a.texto || '').localeCompare(b.texto || '', 'es', { sensitivity: 'base' });
        }

        if (orden === 'limite-cercana' || orden === 'limite-lejana') {
            const tsA = timestampDeClaveISO(a.fechaLimiteClave);
            const tsB = timestampDeClaveISO(b.fechaLimiteClave);

            if (tsA === null && tsB === null) return 0;
            if (tsA === null) return 1;
            if (tsB === null) return -1;
            return orden === 'limite-cercana' ? tsA - tsB : tsB - tsA;
        }

        const creacionA = timestampDeClaveISO(a.fechaClave) ?? 0;
        const creacionB = timestampDeClaveISO(b.fechaClave) ?? 0;
        return orden === 'creacion-antigua' ? creacionA - creacionB : creacionB - creacionA;
    }

    function filtraTarea(tarea) {
        if (!tarea || typeof tarea !== 'object') return false;
        const filtroCategoria = obtenerFiltroCategoria();
        const filtroEstado = obtenerFiltroEstado();
        const categoria = normalizarCategoria(tarea.categoria);
        const estado = normalizarEstado(tarea.estado);

        const coincideCategoria = filtroCategoria === 'todas' || categoria === filtroCategoria;
        const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;
        return coincideCategoria && coincideEstado;
    }

    function actualizarToggleDescripcionSemana() {
        const btn = document.getElementById('toggle-descripciones-semana');
        if (!btn) return;
        const vistaActiva = document.querySelector('.vista-btn.activo');
        const enSemana = vistaActiva && vistaActiva.dataset.vista === 'semana';
        btn.classList.toggle('oculto', !enSemana);
        btn.textContent = mostrarDescripcionSemana ? 'Ocultar descripciones' : 'Mostrar descripciones';
    }

    function idListaPorEstado(estado) {
        if (estado === 'en-ejecucion') return 'lista-en-ejecucion';
        if (estado === 'finalizado') return 'lista-finalizado';
        return 'lista-sin-empezar';
    }

    function actualizarColumnasPorFiltroEstado() {
        const filtro = obtenerFiltroEstado();
        const columnas = [
            { id: 'columna-sin-empezar', estado: 'sin-empezar' },
            { id: 'columna-en-ejecucion', estado: 'en-ejecucion' },
            { id: 'columna-finalizado', estado: 'finalizado' }
        ];

        columnas.forEach(({ id, estado }) => {
            const columna = document.getElementById(id);
            if (!columna) return;
            columna.style.display = filtro === 'todos' || filtro === estado ? 'block' : 'none';
        });
    }

    function configurarDropColumnas() {
        const zonas = [
            { listaId: 'lista-sin-empezar', estado: 'sin-empezar' },
            { listaId: 'lista-en-ejecucion', estado: 'en-ejecucion' },
            { listaId: 'lista-finalizado', estado: 'finalizado' }
        ];

        zonas.forEach(({ listaId, estado }) => {
            const lista = document.getElementById(listaId);
            if (!lista || lista.dataset.dropReady === 'true') return;

            lista.addEventListener('dragover', (e) => {
                e.preventDefault();
                lista.classList.add('drop-activo');
            });

            lista.addEventListener('dragleave', () => {
                lista.classList.remove('drop-activo');
            });

            lista.addEventListener('drop', (e) => {
                e.preventDefault();
                lista.classList.remove('drop-activo');

                const tareaId = e.dataTransfer.getData('text/tarea-id');
                const index = tareas.findIndex(t => t.id === tareaId);
                if (index === -1 || !tareas[index]) return;

                const nuevoEstado = normalizarEstado(estado);
                if (tareas[index].estado === nuevoEstado) return;

                tareas[index].estado = nuevoEstado;
                if (nuevoEstado === 'finalizado') {
                    tareas[index].finalizadaEn = Date.now();
                } else {
                    delete tareas[index].finalizadaEn;
                }
                guardarTareas();
                if (nuevoEstado === 'finalizado') procesarLimpiezaTareas();
                refrescarListaTareas();
                renderVistaCalendarioActiva();
            });

            lista.dataset.dropReady = 'true';
        });
    }

    // ---- NAVEGACIÓN ----
    const botones = document.querySelectorAll('.nav-btn');
    const secciones = document.querySelectorAll('.seccion');

    renderSelectorTemas();
    aplicarTemaUI(cargarTemaUI());

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // Ignoramos fallos de registro para no bloquear la app.
        });
    }
    document.getElementById('btn-cambiar-tema').addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanelTemas();
    });
    document.getElementById('panel-temas').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    document.addEventListener('click', cerrarPanelTemas);

    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            activarSeccion(btn.dataset.seccion);
        });
    });

    function activarSeccion(seccionId) {
        botones.forEach(b => b.classList.remove('activo'));
        secciones.forEach(s => s.classList.remove('activo'));
        const boton = document.querySelector(`.nav-btn[data-seccion="${seccionId}"]`);
        if (boton) boton.classList.add('activo');
        const seccion = document.getElementById(seccionId);
        if (seccion) seccion.classList.add('activo');
    }

    let avisosConfig = cargarAvisosConfig();
    let avisosEnviados = cargarAvisosEnviados();



    // ---- TAREAS ---- (declaradas antes del calendario para que el calendario pueda usarlas)
    let tareas = asegurarArray(storageGetJSON('tareas', []))
        .filter(t => t && typeof t === 'object');
    let categoriasTareas = cargarCategoriasTareas();
    let colorCategoriaTareaSeleccionado = COLORES_CATEGORIA_TAREAS[0];
    let categoriaTareaEnEdicionId = null;
    let mostrarDescripcionSemana = false;
    let eventos = [];
    let habitos = [];

    function actualizarContador() {
        const pendientes = tareas.filter(t => t.estado !== 'finalizado').length;
        document.querySelector('.contador').innerHTML = `<span>${pendientes}</span> tareas pendientes`;
    }

    function guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    function aplicarEstiloCategoriaEnElemento(elemento, color, opacidad = 0.12) {
        const rgb = colorHexARgb(color);
        elemento.style.background = `rgba(${rgb}, ${opacidad})`;
        elemento.style.color = 'var(--texto-oscuro)';
    }

    function aplicarEstiloTarjetaTarea(tarjeta, categoriaId) {
        const color = colorCategoriaTarea(categoriaId);
        const rgb = colorHexARgb(color);
        // Muted left border: mix color with grey to desaturate it visually
        tarjeta.style.borderLeftColor = `rgba(${rgb}, 0.45)`;
        tarjeta.style.background = '';  // let CSS handle the flat bg
    }

    function poblarSelectCategoriasTareas() {
        const selectCrear = document.getElementById('categoria');
        const selectEditar = document.getElementById('tarea-detalle-categoria');
        const selectFiltro = document.getElementById('filtro-categoria');

        const valorCrear = selectCrear?.value || '';
        const valorEditar = selectEditar?.value || '';
        const valorFiltro = selectFiltro?.value || 'todas';

        if (selectCrear) {
            selectCrear.innerHTML = '';
            categoriasTareas.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = `${nombreIconoCategoria(categoria.icono)} - ${categoria.nombre}`;
                selectCrear.appendChild(option);
            });
            selectCrear.value = obtenerCategoriaTarea(valorCrear) ? valorCrear : (categoriasTareas[0]?.id || '');
        }

        if (selectEditar) {
            selectEditar.innerHTML = '';
            categoriasTareas.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = `${nombreIconoCategoria(categoria.icono)} - ${categoria.nombre}`;
                selectEditar.appendChild(option);
            });
            selectEditar.value = obtenerCategoriaTarea(valorEditar) ? valorEditar : (categoriasTareas[0]?.id || '');
        }

        if (selectFiltro) {
            selectFiltro.innerHTML = '<option value="todas">Todas las categorías</option>';
            categoriasTareas.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = `${nombreIconoCategoria(categoria.icono)} - ${categoria.nombre}`;
                selectFiltro.appendChild(option);
            });
            selectFiltro.value = valorFiltro === 'todas' || obtenerCategoriaTarea(valorFiltro)
                ? valorFiltro
                : 'todas';
        }
    }

    function renderCategoriasTareas() {
        const lista = document.getElementById('categorias-tarea-lista');
        if (!lista) return;

        lista.innerHTML = '';
        categoriasTareas.forEach(categoria => {
            const chip = document.createElement('span');
            chip.className = 'categoria-tarea-chip';
            aplicarEstiloCategoriaEnElemento(chip, categoria.color, 0.12);
            chip.innerHTML = `
                <span class="categoria-etiqueta"><i class="${clasePhosphorIcono(categoria.icono)}" aria-hidden="true"></i><span>${escaparHTML(categoria.nombre)}</span></span>
                <button type="button" class="btn-editar-categoria-tarea" aria-label="Editar categoría"><i class="ph ph-pencil" aria-hidden="true"></i></button>
                <button type="button" aria-label="Eliminar categoría"><i class="ph ph-x" aria-hidden="true"></i></button>
            `;

            chip.querySelector('.btn-editar-categoria-tarea').addEventListener('click', () => {
                document.getElementById('input-categoria-tarea').value = categoria.nombre;
                document.getElementById('icono-categoria-tarea').value = categoria.icono;
                colorCategoriaTareaSeleccionado = categoria.color;
                document.querySelectorAll('.categoria-tarea-color').forEach(b => b.classList.remove('activo'));
                document.querySelector(`.categoria-tarea-color[data-color="${categoria.color}"]`)?.classList.add('activo');
                categoriaTareaEnEdicionId = categoria.id;
                document.getElementById('btn-crear-categoria-tarea').innerHTML = '<span class="icono-texto"><i class="ph ph-floppy-disk" aria-hidden="true"></i><span>Guardar categoría</span></span>';
                document.getElementById('btn-cancelar-edicion-categoria-tarea').style.display = 'inline-flex';
            });

            chip.querySelector('button[aria-label="Eliminar categoría"]').addEventListener('click', () => {
                if (categoriasTareas.length <= 1) return;
                const categoriaReemplazo = categoriasTareas.find(c => c.id !== categoria.id)?.id || categoriasTareas[0].id;
                categoriasTareas = categoriasTareas.filter(c => c.id !== categoria.id);
                tareas.forEach(tarea => {
                    if (tarea.categoria === categoria.id) {
                        tarea.categoria = categoriaReemplazo;
                    }
                });
                guardarCategoriasTareas();
                guardarTareas();
                poblarSelectCategoriasTareas();
                renderCategoriasTareas();
                refrescarListaTareas();
                renderVistaCalendarioActiva();

                if (categoriaTareaEnEdicionId === categoria.id) {
                    resetFormularioCategoriaTarea();
                }
            });

            lista.appendChild(chip);
        });
    }

    function resetFormularioCategoriaTarea() {
        categoriaTareaEnEdicionId = null;
        document.getElementById('input-categoria-tarea').value = '';
        document.getElementById('icono-categoria-tarea').value = 'tag';
        colorCategoriaTareaSeleccionado = COLORES_CATEGORIA_TAREAS[0];
        document.querySelectorAll('.categoria-tarea-color').forEach(b => b.classList.remove('activo'));
        document.querySelector('.categoria-tarea-color[data-color="#EDAFB8"]')?.classList.add('activo');
        document.getElementById('btn-crear-categoria-tarea').innerHTML = '<span class="icono-texto"><i class="ph ph-plus" aria-hidden="true"></i><span>Crear categoría</span></span>';
        document.getElementById('btn-cancelar-edicion-categoria-tarea').style.display = 'none';
    }

    function crearCategoriaTarea() {
        const input = document.getElementById('input-categoria-tarea');
        const nombre = input.value.trim();
        if (!nombre) return;

        const iconoSeleccionado = normalizarIconoCategoriaTarea(document.getElementById('icono-categoria-tarea').value);

        if (categoriaTareaEnEdicionId) {
            const categoriaEditada = categoriasTareas.find(c => c.id === categoriaTareaEnEdicionId);
            if (!categoriaEditada) {
                resetFormularioCategoriaTarea();
                return;
            }

            const yaExiste = categoriasTareas.some(c => c.id !== categoriaTareaEnEdicionId && c.nombre.toLowerCase() === nombre.toLowerCase());
            if (yaExiste) return;

            categoriaEditada.nombre = nombre;
            categoriaEditada.icono = iconoSeleccionado;
            categoriaEditada.color = normalizarColorCategoriaTarea(colorCategoriaTareaSeleccionado);

            guardarCategoriasTareas();
            poblarSelectCategoriasTareas();
            renderCategoriasTareas();
            refrescarListaTareas();
            renderVistaCalendarioActiva();
            resetFormularioCategoriaTarea();
            return;
        }

        const nombreExiste = categoriasTareas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
        if (nombreExiste) return;

        let id = idCategoriaDesdeNombre(nombre);
        while (obtenerCategoriaTarea(id)) {
            id = `${id}-${Math.floor(Math.random() * 99) + 1}`;
        }

        categoriasTareas.push({
            id,
            nombre,
            color: normalizarColorCategoriaTarea(colorCategoriaTareaSeleccionado),
            icono: iconoSeleccionado
        });

        guardarCategoriasTareas();
        poblarSelectCategoriasTareas();
        renderCategoriasTareas();
        refrescarListaTareas();
        resetFormularioCategoriaTarea();
    }

    function refrescarListaTareas() {
        tareas = asegurarArray(tareas).filter(t => t && typeof t === 'object');

        let huboCambios = false;
        tareas.forEach(tarea => {
            if (!tarea.id) {
                tarea.id = crearIdTarea();
                huboCambios = true;
            }
            const categoriaNormalizada = normalizarCategoria(tarea.categoria);
            if (categoriaNormalizada !== tarea.categoria) {
                tarea.categoria = categoriaNormalizada;
                huboCambios = true;
            }
            const duracionNormalizada = normalizarDuracionTarea(tarea.duracionEstimadaMin);
            if (duracionNormalizada !== tarea.duracionEstimadaMin) {
                tarea.duracionEstimadaMin = duracionNormalizada;
                huboCambios = true;
            }
        });
        if (huboCambios) guardarTareas();

        const listas = ['lista-sin-empezar', 'lista-en-ejecucion', 'lista-finalizado'];
        listas.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        const tareasFiltradas = tareas.filter(filtraTarea).sort(comparadorTareas);
        tareasFiltradas.forEach(t => crearTareaHTML(t));
        actualizarContador();
        renderLogrosEnfoque();
        renderResumenHoy();
        actualizarColumnasPorFiltroEstado();

        const tareasPorEstado = {
            'sin-empezar': 0,
            'en-ejecucion': 0,
            'finalizado': 0
        };

        tareasFiltradas.forEach(t => {
            const estado = normalizarEstado(t.estado);
            tareasPorEstado[estado] = (tareasPorEstado[estado] || 0) + 1;
        });

        Object.entries(tareasPorEstado).forEach(([estado, cantidad]) => {
            if (cantidad > 0) return;
            const lista = document.getElementById(idListaPorEstado(estado));
            if (!lista) return;
            const vacio = document.createElement('li');
            vacio.className = 'tareas-vacio';
            vacio.textContent = 'Sin tareas';
            lista.appendChild(vacio);
        });

        configurarDropColumnas();
    }

    function crearTareaHTML(tarea) {
        if (!tarea.id) tarea.id = crearIdTarea();
        tarea.categoria = normalizarCategoria(tarea.categoria);
        tarea.estado = normalizarEstado(tarea.estado);
        tarea.descripcion = (tarea.descripcion || '').trim();

        const li = document.createElement('li');
        li.classList.add('tarea');
        if (tarea.estado === 'finalizado') li.classList.add('completada');
        li.draggable = true;
        li.dataset.tareaId = tarea.id;
        aplicarEstiloTarjetaTarea(li, tarea.categoria);

        const fechaCreacion = tarea.fechaClave ? claveISOAFechaCorta(tarea.fechaClave) : (tarea.fecha || '');
        const fechaLimiteTexto = tarea.fechaLimiteClave ? claveISOAFechaCorta(tarea.fechaLimiteClave) : (tarea.fechaLimite || '');

        li.innerHTML = `
            <div class="tarea-contenido">
                <span class="tarea-texto">${escaparHTML(tarea.texto)}</span>
                ${tarea.descripcion ? `<span class="tarea-descripcion">${escaparHTML(tarea.descripcion)}</span>` : ''}
                <div class="tarea-meta">
                    ${fechaLimiteTexto ? `<span class="tarea-fecha-limite"><i class="ph ph-calendar-blank" aria-hidden="true"></i> ${escaparHTML(fechaLimiteTexto)}</span>` : ''}
                    <span class="tarea-fecha">${escaparHTML(fechaCreacion)}</span> 
                </div>
            </div>
            <div class="tarea-acciones">
                <select class="tarea-estado">
                    <option value="sin-empezar" ${tarea.estado === 'sin-empezar' ? 'selected' : ''}>Sin empezar</option>
                    <option value="en-ejecucion" ${tarea.estado === 'en-ejecucion' ? 'selected' : ''}>En ejecución</option>
                    <option value="finalizado" ${tarea.estado === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                </select>
                <button class="btn-borrar" aria-label="Borrar tarea"><i class="ph ph-trash" aria-hidden="true"></i></button>
            </div>
        `;

        li.querySelector('.tarea-estado').addEventListener('change', (e) => {
            const nuevoEstado = e.target.value;
            tarea.estado = nuevoEstado;

            if (nuevoEstado === 'finalizado') {
                tarea.finalizadaEn = Date.now();
            } else {
                delete tarea.finalizadaEn;
            }

            guardarTareas();
            if (nuevoEstado === 'finalizado') procesarLimpiezaTareas();
            refrescarListaTareas();
            renderVistaCalendarioActiva();
        });

        li.querySelector('.btn-borrar').addEventListener('click', () => {
            tareas = tareas.filter(t => t !== tarea);
            guardarTareas();
            refrescarListaTareas();
            renderVistaCalendarioActiva();
        });

        li.addEventListener('dragstart', (e) => {
            const tareaId = li.dataset.tareaId;
            if (!tareaId) return;
            e.dataTransfer.setData('text/tarea-id', tareaId);
            e.dataTransfer.effectAllowed = 'move';
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            document.querySelectorAll('.lista-estado').forEach(lista => lista.classList.remove('drop-activo'));
        });

        const listaDestino = document.getElementById(idListaPorEstado(tarea.estado));
        if (listaDestino) {
            listaDestino.appendChild(li);
        }
    }

    function añadirTarea() {
        const input = document.getElementById('input-tarea');
        const inputDescripcion = document.getElementById('input-descripcion-tarea');
        const texto = input.value.trim();
        const descripcion = inputDescripcion.value.trim();
        if (texto === '') return;

        const categoria = normalizarCategoria(document.getElementById('categoria').value);
        const fechaLimiteInput = document.getElementById('fecha-limite').value;
        const hoy = new Date();
        const fechaClave = fechaAClaveISO(hoy);
        const fecha = claveISOAFechaCorta(fechaClave);
        const fechaLimiteClave = fechaLimiteInput || null;
        const fechaLimite = fechaLimiteClave ? claveISOAFechaCorta(fechaLimiteClave) : null;
        const duracionEstimadaMin = normalizarDuracionTarea(document.getElementById('duracion-tarea')?.value);

        const tarea = { id: crearIdTarea(), texto, descripcion, estado: 'sin-empezar', categoria, fecha, fechaClave, fechaLimite, fechaLimiteClave, duracionEstimadaMin };
        tareas.push(tarea);
        guardarTareas();
        refrescarListaTareas();
        renderVistaCalendarioActiva();
        input.value = '';
        inputDescripcion.value = '';
        document.getElementById('fecha-limite').value = '';
        document.getElementById('duracion-tarea').value = 'auto';
    }

    inicializarSeguro('poblarSelectCategoriasTareas', poblarSelectCategoriasTareas);
    inicializarSeguro('renderCategoriasTareas', renderCategoriasTareas);

    document.getElementById('icono-categoria-tarea').value = 'tag';
    document.querySelectorAll('.categoria-tarea-color').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.categoria-tarea-color').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            colorCategoriaTareaSeleccionado = btn.dataset.color;
        });
    });

    // Toggle panel limpieza
    document.getElementById('btn-toggle-limpieza').addEventListener('click', () => {
        const panel = document.getElementById('panel-limpieza');
        const btn = document.getElementById('btn-toggle-limpieza');
        const visible = panel.style.display !== 'none';
        panel.style.display = visible ? 'none' : 'block';
        btn.classList.toggle('activo', !visible);
    });

    // Toggle panel categorías
    document.getElementById('btn-toggle-categorias').addEventListener('click', () => {
        const panel = document.getElementById('panel-categorias');
        const btn = document.getElementById('btn-toggle-categorias');
        const visible = panel.style.display !== 'none';
        panel.style.display = visible ? 'none' : 'block';
        btn.classList.toggle('activo', !visible);
    });

    document.getElementById('btn-crear-categoria-tarea').addEventListener('click', crearCategoriaTarea);
    document.getElementById('btn-cancelar-edicion-categoria-tarea').addEventListener('click', resetFormularioCategoriaTarea);
    document.getElementById('input-categoria-tarea').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') crearCategoriaTarea();
    });
    resetFormularioCategoriaTarea();

    // Cargar datos reales antes de renderizar vistas
    eventos = cargarEventos();
    habitos = cargarHabitos();

    inicializarSeguro('cargarOrdenGuardado', cargarOrdenGuardado);
    inicializarSeguro('refrescarListaTareas', refrescarListaTareas);

    document.getElementById('btn-anadir').addEventListener('click', añadirTarea);
    document.getElementById('btn-auto-agendar')?.addEventListener('click', autoAgendarTareasPendientes);
    aplicarAutoAgendaPrefsEnUI();
    ['auto-agenda-inicio', 'auto-agenda-fin', 'auto-agenda-descanso', 'auto-agenda-fin-semana'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            guardarAutoAgendaPrefs(leerAutoAgendaPrefsDesdeUI());
        });
    });
    document.getElementById('btn-auto-agendar-ahora')?.addEventListener('click', () => {
        autoAgendarTareasPendientes();
        const panel = document.getElementById('auto-agenda-preferencias');
        if (panel) panel.style.display = 'none';
    });
    document.getElementById('btn-auto-agendar-ajustes')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const panel = document.getElementById('auto-agenda-preferencias');
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('auto-agenda-preferencias')?.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    document.addEventListener('click', () => {
        const panel = document.getElementById('auto-agenda-preferencias');
        if (!panel) return;
        panel.style.display = 'none';
    });
    document.getElementById('input-tarea').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') añadirTarea();
    });
    document.getElementById('input-descripcion-tarea').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') añadirTarea();
    });
    document.getElementById('filtro-categoria').addEventListener('change', refrescarListaTareas);
    document.getElementById('filtro-estado').addEventListener('change', refrescarListaTareas);
    document.getElementById('filtro-orden').addEventListener('change', () => {
        guardarOrdenSeleccionado();
        refrescarListaTareas();
    });
    document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
        document.getElementById('filtro-categoria').value = 'todas';
        document.getElementById('filtro-estado').value = 'todos';
        document.getElementById('filtro-orden').value = 'creacion-reciente';
        guardarOrdenSeleccionado();
        refrescarListaTareas();
    });

    // ---- HABITOS ----

    function normalizarHabito(habito) {
        const nombre = String(habito?.nombre || '').trim();
        if (!nombre) return null;

        const historial = Array.isArray(habito?.historial)
            ? habito.historial.filter(clave => /^\d{4}-\d{2}-\d{2}$/.test(clave))
            : [];

        const sinDuplicados = [...new Set(historial)].sort();

        return {
            id: habito?.id || crearIdHabito(),
            nombre,
            creadoEn: /^\d{4}-\d{2}-\d{2}$/.test(habito?.creadoEn || '') ? habito.creadoEn : fechaAClaveISO(new Date()),
            historial: sinDuplicados,
            presetId: habito?.presetId || null
        };
    }

    function cargarHabitos() {
        const guardados = storageGetJSON('habitos', []);
        if (!Array.isArray(guardados)) return [];
        return guardados.map(normalizarHabito).filter(Boolean);
    }

    function sincronizarNombresPresetsGuardados() {
        const nombrePorPresetId = Object.fromEntries(HABITOS_PREDETERMINADOS.map(p => [p.id, p.nombre]));
        let huboCambios = false;

        habitos.forEach(habito => {
            if (!habito.presetId) return;
            const nombreEsperado = nombrePorPresetId[habito.presetId];
            if (!nombreEsperado || habito.nombre === nombreEsperado) return;
            habito.nombre = nombreEsperado;
            huboCambios = true;
        });

        if (huboCambios) {
            guardarHabitos();
        }
    }

    function guardarHabitos() {
        localStorage.setItem('habitos', JSON.stringify(habitos));
    }

    sincronizarNombresPresetsGuardados();

    function habitoCompletadoHoy(habito) {
        const hoy = fechaAClaveISO(new Date());
        return habito.historial.includes(hoy);
    }

    function rachaHabito(habito) {
        const historialSet = new Set(habito.historial);
        if (historialSet.size === 0) return 0;

        let cursor = fechaAClaveISO(new Date());
        if (!historialSet.has(cursor)) {
            cursor = sumarDiasAClaveISO(cursor, -1);
        }

        let racha = 0;
        while (cursor && historialSet.has(cursor)) {
            racha++;
            cursor = sumarDiasAClaveISO(cursor, -1);
        }
        return racha;
    }

    function diasMantenidosHabito(habito) {
        return Array.isArray(habito.historial) ? habito.historial.length : 0;
    }

    function normalizarAguaTracker(tracker) {
        const objetivoRaw = Number(tracker?.objetivoMl);
        const objetivoMl = Number.isFinite(objetivoRaw)
            ? Math.min(10000, Math.max(500, Math.round(objetivoRaw)))
            : 2000;

        const historialInput = tracker?.historial && typeof tracker.historial === 'object'
            ? tracker.historial
            : {};

        const historial = {};
        Object.entries(historialInput).forEach(([clave, valor]) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(clave)) return;
            const cantidad = Number(valor);
            if (!Number.isFinite(cantidad) || cantidad < 0) return;
            historial[clave] = Math.round(cantidad);
        });

        return { objetivoMl, historial };
    }

    function cargarAguaTracker() {
        const guardado = storageGetJSON('aguaTracker', null);
        return normalizarAguaTracker(guardado || {});
    }

    let aguaTracker = cargarAguaTracker();
    let habitosDetalle = cargarHabitosDetalle();

    function guardarAguaTracker() {
        localStorage.setItem('aguaTracker', JSON.stringify(aguaTracker));
    }

    function normalizarHabitosDetalle(data) {
        const entrada = data && typeof data === 'object' ? data : {};
        const salida = {};

        Object.entries(HABITOS_DETALLE_CONFIG).forEach(([presetId, config]) => {
            if (config.tipo === 'checklist') {
                const historialRaw = entrada[presetId]?.historial;
                const historial = {};

                if (historialRaw && typeof historialRaw === 'object') {
                    Object.entries(historialRaw).forEach(([clave, valor]) => {
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(clave)) return;
                        historial[clave] = {
                            am: Boolean(valor?.am),
                            pm: Boolean(valor?.pm)
                        };
                    });
                }

                salida[presetId] = { historial };
                return;
            }

            const objetivoRaw = Number(entrada[presetId]?.objetivo);
            const objetivo = Number.isFinite(objetivoRaw)
                ? Math.min(config.maxObjetivo, Math.max(config.minObjetivo, objetivoRaw))
                : config.objetivoDefecto;

            const historialRaw = entrada[presetId]?.historial;
            const historial = {};

            if (historialRaw && typeof historialRaw === 'object') {
                Object.entries(historialRaw).forEach(([clave, valor]) => {
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(clave)) return;
                    const cantidad = Number(valor);
                    if (!Number.isFinite(cantidad) || cantidad < 0) return;
                    historial[clave] = cantidad;
                });
            }

            salida[presetId] = { objetivo, historial };
        });

        return salida;
    }

    function cargarHabitosDetalle() {
        const guardado = storageGetJSON('habitosDetalle', null);
        return normalizarHabitosDetalle(guardado || {});
    }

    function guardarHabitosDetalle() {
        localStorage.setItem('habitosDetalle', JSON.stringify(habitosDetalle));
    }

    function habitoPresetPorId(presetId) {
        return habitos.find(h => h.presetId === presetId) || null;
    }

    function actualizarCompletadoPreset(presetId, completado) {
        const habito = habitoPresetPorId(presetId);
        if (!habito) return false;

        const hoy = claveHoyISO();
        const estaMarcado = habito.historial.includes(hoy);

        if (completado && !estaMarcado) {
            habito.historial.push(hoy);
            habito.historial.sort();
            return true;
        }

        if (!completado && estaMarcado) {
            habito.historial = habito.historial.filter(clave => clave !== hoy);
            return true;
        }

        return false;
    }

    function claveHoyISO() {
        return fechaAClaveISO(new Date());
    }

    function consumoAguaHoyMl() {
        return aguaTracker.historial[claveHoyISO()] || 0;
    }

    function valorPresetHoy(presetId) {
        return Number(habitosDetalle[presetId]?.historial?.[claveHoyISO()] || 0);
    }

    function setValorPresetHoy(presetId, valor) {
        if (!habitosDetalle[presetId]) return;
        habitosDetalle[presetId].historial[claveHoyISO()] = Math.max(0, valor);
    }

    function valorChecklistSkincareHoy() {
        const entrada = habitosDetalle['skincare-am-pm']?.historial?.[claveHoyISO()] || { am: false, pm: false };
        return { am: Boolean(entrada.am), pm: Boolean(entrada.pm) };
    }

    function setChecklistSkincareHoy(am, pm) {
        if (!habitosDetalle['skincare-am-pm']) return;
        habitosDetalle['skincare-am-pm'].historial[claveHoyISO()] = { am: Boolean(am), pm: Boolean(pm) };
    }

    function actualizarVisibilidadDetallesPresets() {
        const mapa = {
            'beber-agua': 'agua-card',
            'ejercicio-30': 'ejercicio-card',
            'sueno-8h': 'sueno-card',
            'lectura-20': 'lectura-card',
            'estiramientos-10': 'estiramientos-card',
            'skincare-am-pm': 'skincare-card'
        };

        Object.entries(mapa).forEach(([presetId, cardId]) => {
            const card = document.getElementById(cardId);
            if (!card) return;
            card.classList.toggle('activo', presetActivo(presetId));
        });
    }

    function litrosConDosDecimales(ml) {
        return (ml / 1000).toFixed(2);
    }

    function actualizarUIAgua() {
        const consumo = consumoAguaHoyMl();
        const objetivo = aguaTracker.objetivoMl;

        const consumoTexto = document.getElementById('agua-consumida-litros');
        const objetivoTexto = document.getElementById('agua-objetivo-litros-texto');
        const inputObjetivo = document.getElementById('agua-objetivo-litros');
        const barra = document.getElementById('agua-progreso-barra');

        if (!consumoTexto || !objetivoTexto || !inputObjetivo || !barra) return;

        consumoTexto.textContent = litrosConDosDecimales(consumo);
        objetivoTexto.textContent = litrosConDosDecimales(objetivo);
        inputObjetivo.value = (objetivo / 1000).toFixed(1);

        const progreso = Math.min(100, (consumo / objetivo) * 100);
        barra.style.width = `${progreso}%`;

        sincronizarHabitoAguaConObjetivo();
    }

    function sincronizarHabitoAguaConObjetivo() {
        const cumplido = consumoAguaHoyMl() >= aguaTracker.objetivoMl;
        if (actualizarCompletadoPreset('beber-agua', cumplido)) {
            guardarHabitos();
            renderHabitos();
        }
    }

    function actualizarUINumericoPreset(presetId, ids, decimales = 0) {
        const actualEl = document.getElementById(ids.actual);
        const objetivoEl = document.getElementById(ids.objetivoTexto);
        const inputEl = document.getElementById(ids.objetivoInput);
        const barra = document.getElementById(ids.progreso);
        if (!actualEl || !objetivoEl || !inputEl || !barra) return;

        const objetivo = Number(habitosDetalle[presetId]?.objetivo || 0);
        const actual = valorPresetHoy(presetId);
        actualEl.textContent = Number(actual).toFixed(decimales);
        objetivoEl.textContent = Number(objetivo).toFixed(decimales);
        inputEl.value = String(Number(objetivo).toFixed(decimales));
        const progreso = objetivo > 0 ? Math.min(100, (actual / objetivo) * 100) : 0;
        barra.style.width = `${progreso}%`;

        if (actualizarCompletadoPreset(presetId, actual >= objetivo && objetivo > 0)) {
            guardarHabitos();
            renderHabitos();
        }
    }

    function sumarPresetNumerico(presetId, cantidad) {
        const valor = Number(cantidad);
        if (!Number.isFinite(valor) || valor <= 0 || !habitosDetalle[presetId]) return;
        const actual = valorPresetHoy(presetId);
        setValorPresetHoy(presetId, actual + valor);
        guardarHabitosDetalle();
        actualizarUIDetallesPresets();
    }

    function reiniciarPresetNumerico(presetId) {
        if (!habitosDetalle[presetId]) return;
        setValorPresetHoy(presetId, 0);
        guardarHabitosDetalle();
        actualizarUIDetallesPresets();
    }

    function actualizarObjetivoPresetNumerico(presetId, valor) {
        const config = HABITOS_DETALLE_CONFIG[presetId];
        if (!config || config.tipo !== 'numero') return;
        const objetivo = Number(valor);
        if (!Number.isFinite(objetivo) || objetivo <= 0) {
            actualizarUIDetallesPresets();
            return;
        }
        habitosDetalle[presetId].objetivo = Math.min(config.maxObjetivo, Math.max(config.minObjetivo, objetivo));
        guardarHabitosDetalle();
        actualizarUIDetallesPresets();
    }

    function actualizarUISkincare() {
        const checks = valorChecklistSkincareHoy();
        const actual = Number(checks.am) + Number(checks.pm);
        const actualEl = document.getElementById('skincare-actual');
        const barra = document.getElementById('skincare-progreso');
        const am = document.getElementById('skincare-am');
        const pm = document.getElementById('skincare-pm');
        if (!actualEl || !barra || !am || !pm) return;

        actualEl.textContent = String(actual);
        am.checked = checks.am;
        pm.checked = checks.pm;
        barra.style.width = `${Math.min(100, (actual / 2) * 100)}%`;

        if (actualizarCompletadoPreset('skincare-am-pm', actual >= 2)) {
            guardarHabitos();
            renderHabitos();
        }
    }

    function actualizarUIDetallesPresets() {
        actualizarUINumericoPreset('ejercicio-30', {
            actual: 'ejercicio-actual-min',
            objetivoTexto: 'ejercicio-objetivo-min-texto',
            objetivoInput: 'ejercicio-objetivo-min',
            progreso: 'ejercicio-progreso'
        });

        actualizarUINumericoPreset('sueno-8h', {
            actual: 'sueno-actual-horas',
            objetivoTexto: 'sueno-objetivo-horas-texto',
            objetivoInput: 'sueno-objetivo-horas',
            progreso: 'sueno-progreso'
        }, 1);

        actualizarUINumericoPreset('lectura-20', {
            actual: 'lectura-actual-min',
            objetivoTexto: 'lectura-objetivo-min-texto',
            objetivoInput: 'lectura-objetivo-min',
            progreso: 'lectura-progreso'
        });

        actualizarUINumericoPreset('estiramientos-10', {
            actual: 'estiramientos-actual-min',
            objetivoTexto: 'estiramientos-objetivo-min-texto',
            objetivoInput: 'estiramientos-objetivo-min',
            progreso: 'estiramientos-progreso'
        });

        actualizarUISkincare();
    }

    function sumarAguaMl(cantidadMl) {
        const ml = Math.round(Number(cantidadMl));
        if (!Number.isFinite(ml) || ml <= 0) return;

        const hoy = claveHoyISO();
        const actual = aguaTracker.historial[hoy] || 0;
        aguaTracker.historial[hoy] = actual + ml;
        guardarAguaTracker();
        actualizarUIAgua();
    }

    function reiniciarAguaHoy() {
        const hoy = claveHoyISO();
        aguaTracker.historial[hoy] = 0;
        guardarAguaTracker();
        actualizarUIAgua();
    }

    function actualizarResumenHabitos() {
        const resumen = document.getElementById('habitos-resumen');
        if (!resumen) return;

        const total = habitos.length;
        const completados = habitos.filter(habitoCompletadoHoy).length;
        resumen.textContent = `${completados}/${total} hábitos completados hoy`;
    }

    function presetActivo(presetId) {
        return habitos.some(h => h.presetId === presetId);
    }

    function activarPresetHabito(preset) {
        const existentePorPreset = habitos.find(h => h.presetId === preset.id);
        if (existentePorPreset) return;

        const existentePorNombre = habitos.find(h => h.nombre.toLowerCase() === preset.nombre.toLowerCase());
        if (existentePorNombre) {
            existentePorNombre.presetId = preset.id;
        } else {
            habitos.push({
                id: crearIdHabito(),
                nombre: preset.nombre,
                creadoEn: fechaAClaveISO(new Date()),
                historial: [],
                presetId: preset.id
            });
        }
    }

    function desactivarPresetHabito(presetId) {
        habitos = habitos.filter(h => h.presetId !== presetId);
    }

    function alternarPresetHabito(preset) {
        if (presetActivo(preset.id)) {
            desactivarPresetHabito(preset.id);
        } else {
            activarPresetHabito(preset);
        }

        guardarHabitos();
        renderHabitos();
        renderHabitosPredeterminados();
        actualizarVisibilidadDetallesPresets();
        actualizarUIDetallesPresets();
        actualizarUIAgua();
    }

    function renderHabitosPredeterminados() {
        const grid = document.getElementById('habitos-presets-grid');
        if (!grid) return;

        grid.innerHTML = '';

        HABITOS_PREDETERMINADOS.forEach(preset => {
            const activo = presetActivo(preset.id);
            const card = document.createElement('article');
            card.className = 'habito-preset-card';
            card.innerHTML = `
                <span class="habito-preset-titulo">${escaparHTML(preset.nombre)}</span>
                <span class="habito-preset-desc">${escaparHTML(preset.descripcion)}</span>
                <button type="button" class="btn-toggle-preset ${activo ? 'activo' : ''}">${activo ? 'Activo' : 'Activar'}</button>
            `;

            card.querySelector('.btn-toggle-preset').addEventListener('click', () => {
                alternarPresetHabito(preset);
            });

            grid.appendChild(card);
        });

        actualizarVisibilidadDetallesPresets();
    }

    function renderHabitos() {
        const lista = document.getElementById('habitos-lista');
        if (!lista) return;

        lista.innerHTML = '';
        actualizarResumenHabitos();
        renderResumenHoy();

        if (habitos.length === 0) {
            const vacio = document.createElement('li');
            vacio.className = 'habitos-vacio';
            vacio.textContent = 'Aún no tienes hábitos. Crea el primero para empezar.';
            lista.appendChild(vacio);
            return;
        }

        habitos.forEach(habito => {
            const li = document.createElement('li');
            li.className = 'habito-item';

            const marcadoHoy = habitoCompletadoHoy(habito);
            if (marcadoHoy) li.classList.add('completado');

            li.innerHTML = `
                <input type="checkbox" class="habito-check" ${marcadoHoy ? 'checked' : ''} aria-label="Marcar hábito">
                <span class="habito-nombre">${escaparHTML(habito.nombre)}</span>
                <span class="habito-racha">Racha: ${rachaHabito(habito)} días</span>
                <span class="habito-mantenido">Mantenido: ${diasMantenidosHabito(habito)} días</span>
                <button class="btn-borrar-habito" aria-label="Borrar hábito"><i class="ph ph-trash" aria-hidden="true"></i></button>
            `;

            li.querySelector('.habito-check').addEventListener('change', (e) => {
                const hoy = fechaAClaveISO(new Date());
                if (e.target.checked) {
                    if (!habito.historial.includes(hoy)) {
                        habito.historial.push(hoy);
                        habito.historial.sort();
                    }
                } else {
                    habito.historial = habito.historial.filter(clave => clave !== hoy);
                }

                guardarHabitos();
                renderHabitos();
            });

            li.querySelector('.btn-borrar-habito').addEventListener('click', () => {
                habitos = habitos.filter(h => h.id !== habito.id);
                guardarHabitos();
                renderHabitos();
                renderHabitosPredeterminados();
            });

            lista.appendChild(li);
        });
    }

    function anadirHabito() {
        const input = document.getElementById('input-habito');
        const nombre = input.value.trim();
        if (!nombre) return;

        const yaExiste = habitos.some(h => h.nombre.toLowerCase() === nombre.toLowerCase());
        if (yaExiste) return;

        habitos.push({
            id: crearIdHabito(),
            nombre,
            creadoEn: fechaAClaveISO(new Date()),
            historial: [],
            presetId: null
        });

        guardarHabitos();
        renderHabitos();
        renderHabitosPredeterminados();
        input.value = '';
    }

    inicializarSeguro('renderHabitos', renderHabitos);
    inicializarSeguro('renderHabitosPredeterminados', renderHabitosPredeterminados);
    inicializarSeguro('actualizarVisibilidadDetallesPresets', actualizarVisibilidadDetallesPresets);
    document.getElementById('btn-anadir-habito').addEventListener('click', anadirHabito);
    document.getElementById('input-habito').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') anadirHabito();
    });

    document.querySelectorAll('.btn-agua-sumar').forEach(btn => {
        btn.addEventListener('click', () => {
            sumarAguaMl(btn.dataset.ml);
        });
    });

    document.getElementById('btn-agua-custom').addEventListener('click', () => {
        const input = document.getElementById('agua-ml-custom');
        const cantidad = Number(input.value);
        if (!Number.isFinite(cantidad) || cantidad <= 0) return;
        sumarAguaMl(cantidad);
        input.value = '';
    });

    document.getElementById('agua-ml-custom').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('btn-agua-custom').click();
        }
    });

    document.getElementById('agua-objetivo-litros').addEventListener('change', (e) => {
        const litros = Number(e.target.value);
        if (!Number.isFinite(litros) || litros <= 0) {
            actualizarUIAgua();
            return;
        }
        const nuevoObjetivoMl = Math.min(10000, Math.max(500, Math.round(litros * 1000)));
        aguaTracker.objetivoMl = nuevoObjetivoMl;
        guardarAguaTracker();
        actualizarUIAgua();
    });

    document.getElementById('btn-agua-reset').addEventListener('click', reiniciarAguaHoy);

    document.querySelectorAll('.btn-preset-sumar').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = String(btn.dataset.preset || '');
            const amount = Number(btn.dataset.amount || '0');
            sumarPresetNumerico(presetId, amount);
        });
    });

    document.getElementById('btn-ejercicio-custom').addEventListener('click', () => {
        const input = document.getElementById('ejercicio-custom-min');
        sumarPresetNumerico('ejercicio-30', Number(input.value));
        input.value = '';
    });
    document.getElementById('btn-sueno-custom').addEventListener('click', () => {
        const input = document.getElementById('sueno-custom-horas');
        sumarPresetNumerico('sueno-8h', Number(input.value));
        input.value = '';
    });
    document.getElementById('btn-lectura-custom').addEventListener('click', () => {
        const input = document.getElementById('lectura-custom-min');
        sumarPresetNumerico('lectura-20', Number(input.value));
        input.value = '';
    });
    document.getElementById('btn-estiramientos-custom').addEventListener('click', () => {
        const input = document.getElementById('estiramientos-custom-min');
        sumarPresetNumerico('estiramientos-10', Number(input.value));
        input.value = '';
    });

    document.getElementById('btn-ejercicio-reset').addEventListener('click', () => reiniciarPresetNumerico('ejercicio-30'));
    document.getElementById('btn-sueno-reset').addEventListener('click', () => reiniciarPresetNumerico('sueno-8h'));
    document.getElementById('btn-lectura-reset').addEventListener('click', () => reiniciarPresetNumerico('lectura-20'));
    document.getElementById('btn-estiramientos-reset').addEventListener('click', () => reiniciarPresetNumerico('estiramientos-10'));

    document.getElementById('ejercicio-objetivo-min').addEventListener('change', (e) => {
        actualizarObjetivoPresetNumerico('ejercicio-30', Number(e.target.value));
    });
    document.getElementById('sueno-objetivo-horas').addEventListener('change', (e) => {
        actualizarObjetivoPresetNumerico('sueno-8h', Number(e.target.value));
    });
    document.getElementById('lectura-objetivo-min').addEventListener('change', (e) => {
        actualizarObjetivoPresetNumerico('lectura-20', Number(e.target.value));
    });
    document.getElementById('estiramientos-objetivo-min').addEventListener('change', (e) => {
        actualizarObjetivoPresetNumerico('estiramientos-10', Number(e.target.value));
    });

    ['ejercicio-custom-min', 'sueno-custom-horas', 'lectura-custom-min', 'estiramientos-custom-min'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const botonId = {
                    'ejercicio-custom-min': 'btn-ejercicio-custom',
                    'sueno-custom-horas': 'btn-sueno-custom',
                    'lectura-custom-min': 'btn-lectura-custom',
                    'estiramientos-custom-min': 'btn-estiramientos-custom'
                }[id];
                if (botonId) document.getElementById(botonId).click();
            }
        });
    });

    function actualizarSkincareDesdeChecks() {
        const am = document.getElementById('skincare-am').checked;
        const pm = document.getElementById('skincare-pm').checked;
        setChecklistSkincareHoy(am, pm);
        guardarHabitosDetalle();
        actualizarUIDetallesPresets();
    }

    document.getElementById('skincare-am').addEventListener('change', actualizarSkincareDesdeChecks);
    document.getElementById('skincare-pm').addEventListener('change', actualizarSkincareDesdeChecks);
    document.getElementById('btn-skincare-reset').addEventListener('click', () => {
        setChecklistSkincareHoy(false, false);
        guardarHabitosDetalle();
        actualizarUIDetallesPresets();
    });

    inicializarSeguro('actualizarUIDetallesPresets', actualizarUIDetallesPresets);
    inicializarSeguro('actualizarUIAgua', actualizarUIAgua);

    // ---- PANEL EDICIÓN DE TAREA ----
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const detalle = document.getElementById('tarea-detalle');
            if (detalle && detalle.style.display !== 'none') {
                detalle.style.display = 'none';
            }
        }
    });

    function mostrarDetalleTarea(tarea) {
        const detalle = document.getElementById('tarea-detalle');
        detalle.style.display = 'flex';

        document.getElementById('tarea-detalle-texto').value = tarea.texto;
        document.getElementById('tarea-detalle-descripcion').value = tarea.descripcion || '';
        document.getElementById('tarea-detalle-estado').value = tarea.estado;
        document.getElementById('tarea-detalle-categoria').value = normalizarCategoria(tarea.categoria);
        document.getElementById('tarea-detalle-duracion').value = tarea.duracionEstimadaMin ? String(tarea.duracionEstimadaMin) : 'auto';

        document.getElementById('btn-guardar-tarea').onclick = () => {
            tarea.texto = document.getElementById('tarea-detalle-texto').value.trim() || tarea.texto;
            tarea.descripcion = document.getElementById('tarea-detalle-descripcion').value.trim();
            const estadoAnterior = tarea.estado;
            tarea.estado = normalizarEstado(document.getElementById('tarea-detalle-estado').value);
            tarea.categoria = normalizarCategoria(document.getElementById('tarea-detalle-categoria').value);
            tarea.duracionEstimadaMin = normalizarDuracionTarea(document.getElementById('tarea-detalle-duracion').value);
            if (tarea.estado === 'finalizado' && estadoAnterior !== 'finalizado') {
                tarea.finalizadaEn = Date.now();
            } else if (tarea.estado !== 'finalizado') {
                delete tarea.finalizadaEn;
            }
            guardarTareas();
            if (tarea.estado === 'finalizado') procesarLimpiezaTareas();
            refrescarListaTareas();
            detalle.style.display = 'none';
            renderVistaCalendarioActiva();
        };

        document.getElementById('btn-borrar-tarea').onclick = () => {
            tareas = tareas.filter(t => t !== tarea);
            guardarTareas();
            refrescarListaTareas();
            detalle.style.display = 'none';
            renderVistaCalendarioActiva();
        };
    }

    // ---- CALENDARIO ----
    let fechaActual = new Date();
    let diaSeleccionado = null;
    let colorSeleccionado = 'rosa';

    function crearIdEvento() {
        return `ev-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    function fechaDesdeClaveISO(clave) {
        if (!clave || !/^\d{4}-\d{2}-\d{2}$/.test(clave)) return null;
        const [y, m, d] = clave.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function claveLegacyAISO(claveLegacy) {
        const partes = String(claveLegacy).split('-').map(Number);
        if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
        const [y, mIndice, d] = partes;
        return fechaAClaveISO(new Date(y, mIndice, d));
    }

    function normalizarEvento(evento, fechaClaveFallback = null) {
        const fechaClave = /^\d{4}-\d{2}-\d{2}$/.test(evento?.fechaClave || '')
            ? evento.fechaClave
            : fechaClaveFallback;

        if (!fechaClave) return null;

        const unidad = ['ninguna', 'dia', 'semana', 'mes', 'anio'].includes(evento?.repeticionUnidad)
            ? evento.repeticionUnidad
            : 'ninguna';

        const cadaNum = parseInt(evento?.repeticionCada, 10);
        const repeticionCada = Number.isFinite(cadaNum) && cadaNum > 0 ? cadaNum : 1;

        return {
            id: evento?.id || crearIdEvento(),
            nombre: String(evento?.nombre || '').trim(),
            color: normalizarColor(evento?.color),
            fechaClave,
            horaInicio: evento?.horaInicio || '',
            horaFin: evento?.horaFin || '',
            repeticionUnidad: unidad,
            repeticionCada: unidad === 'ninguna' ? 1 : repeticionCada,
            autoTaskId: evento?.autoTaskId || null
        };
    }

    function obtenerDetalleCargaTrabajoDia(fecha) {
        const clave = claveDelDia(fecha);
        const eventosDiaLista = eventosDelDia(fecha);
        const tareasDia = tareas.filter(t => obtenerClaveTareaPorFecha(t, fecha));
        const tareasPendientes = tareasDia.filter(t => normalizarEstado(t.estado) !== 'finalizado');

        let horasEventos = 0;
        eventosDiaLista.forEach(ev => {
            const inicio = minDesdeHora(ev.horaInicio);
            const fin = minDesdeHora(ev.horaFin);
            if (inicio !== null && fin !== null && fin > inicio) {
                horasEventos += (fin - inicio) / 60;
                return;
            }
            if (inicio !== null) horasEventos += 0.75;
        });

        // Carga por tareas pendientes no agendadas automáticamente ese mismo día.
        let horasTareas = 0;
        let urgentes = 0;
        let vencidas = 0;
        tareasPendientes.forEach(t => {
            const yaAgendadaEseDia = eventosDiaLista.some(ev => ev.autoTaskId && ev.autoTaskId === t.id && ev.fechaClave === clave);
            if (!yaAgendadaEseDia) {
                horasTareas += duracionEstimadaTareaMin(t) / 60;
            }

            const prioridad = puntajePrioridadTarea(t);
            if (prioridad >= 8) urgentes++;
            if (t.fechaLimiteClave) {
                const tsDia = timestampDeClaveISO(clave);
                const tsLim = timestampDeClaveISO(t.fechaLimiteClave);
                if (tsDia !== null && tsLim !== null && tsLim < tsDia) vencidas++;
            }
        });

        const presionCantidad = tareasPendientes.length >= 8 ? 2.2 : (tareasPendientes.length >= 5 ? 1.2 : (tareasPendientes.length >= 3 ? 0.6 : 0));
        const penalizacionUrgencia = (urgentes * 0.6) + (vencidas * 1.1);
        const score = horasEventos + horasTareas + presionCantidad + penalizacionUrgencia;

        let nivel = null;
        if (score >= 8.5) nivel = 'alta';
        else if (score >= 4.5) nivel = 'media';
        else if (score > 0.8) nivel = 'baja';

        return {
            nivel,
            score,
            horasEventos,
            horasTareas,
            tareasPendientes: tareasPendientes.length,
            urgentes,
            vencidas
        };
    }

    function cargaTrabajoDia(fecha) {
        return obtenerDetalleCargaTrabajoDia(fecha).nivel;
    }

    function cargarEventos() {
        const eventosV2 = storageGetJSON('eventosV2', null);
        if (Array.isArray(eventosV2)) {
            return eventosV2
                .map(ev => normalizarEvento(ev))
                .filter(ev => ev && ev.nombre);
        }

        const legacy = storageGetJSON('eventos', {});
        const migrados = [];

        Object.entries(legacy).forEach(([clave, lista]) => {
            const fechaClave = claveLegacyAISO(clave);
            if (!fechaClave || !Array.isArray(lista)) return;

            lista.forEach(ev => {
                const normalizado = normalizarEvento(ev, fechaClave);
                if (normalizado && normalizado.nombre) migrados.push(normalizado);
            });
        });

        return migrados;
    }

    function guardarEventos() {
        localStorage.setItem('eventosV2', JSON.stringify(eventos));
    }

    function claveDelDia(fecha) {
        return fechaAClaveISO(fecha);
    }

    function mismoDiaDelMes(a, b) {
        return a.getDate() === b.getDate();
    }

    function mismoMesYDia(a, b) {
        return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function diferenciaMeses(inicio, fin) {
        return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
    }

    function eventoOcurreEnFecha(evento, fecha) {
        const inicio = fechaDesdeClaveISO(evento.fechaClave);
        if (!inicio) return false;

        const diaInicio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
        const diaObjetivo = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        if (diaObjetivo < diaInicio) return false;

        if (evento.repeticionUnidad === 'ninguna') {
            return claveDelDia(diaObjetivo) === evento.fechaClave;
        }

        const cada = Math.max(1, parseInt(evento.repeticionCada, 10) || 1);
        const msDia = 24 * 60 * 60 * 1000;
        const diffDias = Math.floor((diaObjetivo.getTime() - diaInicio.getTime()) / msDia);

        if (evento.repeticionUnidad === 'dia') {
            return diffDias % cada === 0;
        }

        if (evento.repeticionUnidad === 'semana') {
            return diffDias % (cada * 7) === 0;
        }

        if (evento.repeticionUnidad === 'mes') {
            const meses = diferenciaMeses(diaInicio, diaObjetivo);
            return meses >= 0 && meses % cada === 0 && mismoDiaDelMes(diaInicio, diaObjetivo);
        }

        if (evento.repeticionUnidad === 'anio') {
            const years = diaObjetivo.getFullYear() - diaInicio.getFullYear();
            return years >= 0 && years % cada === 0 && mismoMesYDia(diaInicio, diaObjetivo);
        }

        return false;
    }

    function eventosDelDia(fecha) {
        if (!Array.isArray(eventos)) return [];
        const lista = eventos.filter(ev => eventoOcurreEnFecha(ev, fecha));

        return lista.sort((a, b) => {
            const minA = a.horaInicio ? Number(a.horaInicio.slice(0, 2)) * 60 + Number(a.horaInicio.slice(3, 5)) : 24 * 60;
            const minB = b.horaInicio ? Number(b.horaInicio.slice(0, 2)) * 60 + Number(b.horaInicio.slice(3, 5)) : 24 * 60;
            return minA - minB;
        });
    }

    function pomodorosHoyDesdeStorage() {
        const hoy = fechaAClaveISO(new Date());
        const data = storageGetJSON('pomodorosHoy', null);
        return data?.clave === hoy ? (Number(data.cantidad) || 0) : 0;
    }

    function renderResumenHoy() {
        try {
            const hoy = new Date();
            const claveHoy = fechaAClaveISO(hoy);
            const tareasHoy = tareas.filter(t => t.fechaClave === claveHoy || t.fechaLimiteClave === claveHoy);
            const pendientes = tareasHoy.filter(t => normalizarEstado(t.estado) !== 'finalizado');
            const completadas = tareasHoy.length - pendientes.length;

            const tareasResumen = document.getElementById('hoy-tareas-resumen');
            const tareasLista = document.getElementById('hoy-tareas-lista');
            const eventosLista = document.getElementById('hoy-eventos-lista');
            const habitosResumen = document.getElementById('hoy-habitos-resumen');
            const pomodoroResumen = document.getElementById('hoy-pomodoro-resumen');
            if (!tareasResumen || !tareasLista || !eventosLista || !habitosResumen || !pomodoroResumen) return;

            tareasResumen.textContent = `${pendientes.length} pendientes · ${completadas} completadas`;
            tareasLista.innerHTML = '';
            (pendientes.length ? pendientes : tareasHoy).slice(0, 5).forEach(t => {
                const li = document.createElement('li');
                li.textContent = `${normalizarEstado(t.estado) === 'finalizado' ? '✓' : '•'} ${t.texto}`;
                tareasLista.appendChild(li);
            });
            if (tareasLista.children.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Sin tareas para hoy';
                tareasLista.appendChild(li);
            }

            const proximos = [];
            for (let i = 0; i <= 1; i++) {
                const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
                eventosDelDia(fecha).forEach(ev => {
                    proximos.push({
                        fecha,
                        texto: `${ev.horaInicio || 'Sin hora'} · ${ev.nombre}`
                    });
                });
            }
            eventosLista.innerHTML = '';
            proximos.slice(0, 5).forEach(ev => {
                const li = document.createElement('li');
                li.textContent = `${ev.fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${ev.texto}`;
                eventosLista.appendChild(li);
            });
            if (eventosLista.children.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Sin eventos proximos';
                eventosLista.appendChild(li);
            }

            const habitosActuales = Array.isArray(habitos) ? habitos : [];
            const totalHabitos = habitosActuales.length;
            const habitosCompletos = habitosActuales.filter(habitoCompletadoHoy).length;
            habitosResumen.textContent = `${habitosCompletos}/${totalHabitos} habitos completados`;
            pomodoroResumen.textContent = `Pomodoros hoy: ${pomodorosHoyDesdeStorage()}`;
        } catch {
            // No dejamos que el panel Hoy bloquee el resto de la app.
        }
    }

    function resultadosBusquedaGlobal(query) {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return [];
        const notasGuardadas = storageGetJSON('notas', []);
        const res = [];

        tareas.forEach(t => {
            const base = `${t.texto || ''} ${t.descripcion || ''}`.toLowerCase();
            if (base.includes(q)) res.push({ tipo: 'Tarea', texto: t.texto, seccion: 'tareas' });
        });
        eventos.forEach(ev => {
            const base = `${ev.nombre || ''}`.toLowerCase();
            if (base.includes(q)) res.push({ tipo: 'Evento', texto: ev.nombre, seccion: 'calendario' });
        });
        if (Array.isArray(notasGuardadas)) {
            notasGuardadas.forEach(n => {
                const base = `${n?.titulo || ''} ${n?.texto || ''}`.toLowerCase();
                if (base.includes(q)) res.push({ tipo: 'Nota', texto: n.titulo || '(sin titulo)', seccion: 'notas' });
            });
        }

        return res.slice(0, 30);
    }

    function renderBusquedaGlobal() {
        const input = document.getElementById('input-busqueda-global');
        const lista = document.getElementById('resultados-busqueda');
        if (!input || !lista) return;

        const resultados = resultadosBusquedaGlobal(input.value);
        lista.innerHTML = '';
        resultados.forEach(item => {
            const li = document.createElement('li');
            li.className = 'logro-item desbloqueado';
            li.style.cursor = 'pointer';
            li.innerHTML = `
                <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
                <span class="titulo">${escaparHTML(item.texto || '')}</span>
                <span class="estado">${escaparHTML(item.tipo)}</span>
                <span class="desc">Abrir en ${escaparHTML(item.seccion)}</span>
            `;
            li.addEventListener('click', () => {
                activarSeccion(item.seccion);
                document.getElementById('modal-busqueda').style.display = 'none';
            });
            lista.appendChild(li);
        });

        if (lista.children.length === 0 && String(input.value || '').trim()) {
            const li = document.createElement('li');
            li.className = 'logro-item bloqueado';
            li.innerHTML = '<span class="titulo">Sin resultados</span>';
            lista.appendChild(li);
        }
    }

    function textoHorarioEvento(evento) {
        if (evento.horaInicio && evento.horaFin) return `${evento.horaInicio}-${evento.horaFin}`;
        if (evento.horaInicio) return `${evento.horaInicio}`;
        return 'Todo el día';
    }

    function textoRepeticionEvento(evento) {
        if (evento.repeticionUnidad === 'ninguna') return '';
        const cada = Math.max(1, parseInt(evento.repeticionCada, 10) || 1);
        if (evento.repeticionUnidad === 'dia') return cada === 1 ? 'Repite diario' : `Cada ${cada} días`;
        if (evento.repeticionUnidad === 'semana') return cada === 1 ? 'Cada semana' : `Cada ${cada} semanas`;
        if (evento.repeticionUnidad === 'mes') return cada === 1 ? 'Cada mes' : `Cada ${cada} meses`;
        if (evento.repeticionUnidad === 'anio') return cada === 1 ? 'Cada año' : `Cada ${cada} años`;
        return '';
    }

    function limpiarCamposEvento() {
        document.getElementById('evento-input').value = '';
        document.getElementById('evento-hora-inicio').value = '';
        document.getElementById('evento-hora-fin').value = '';
        document.getElementById('evento-repetir-unidad').value = 'ninguna';
        document.getElementById('evento-repetir-unidad-personalizada').value = 'dia';
        document.getElementById('evento-repeticion-personalizada').style.display = 'none';
        document.getElementById('evento-repetir-cada').value = '1';
        document.getElementById('evento-repetir-cada').disabled = true;
    }

    function poblarSelectHoras(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';

        const opcionVacia = document.createElement('option');
        opcionVacia.value = '';
        opcionVacia.textContent = 'Sin hora';
        select.appendChild(opcionVacia);

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hh = String(h).padStart(2, '0');
                const mm = String(m).padStart(2, '0');
                const valor = `${hh}:${mm}`;
                const option = document.createElement('option');
                option.value = valor;
                option.textContent = valor;
                select.appendChild(option);
            }
        }
    }

    function leerConfiguracionRepeticion() {
        const modo = document.getElementById('evento-repetir-unidad').value;
        const cadaInput = document.getElementById('evento-repetir-cada').value;
        const cada = Math.max(1, parseInt(cadaInput, 10) || 1);

        if (modo === 'ninguna') {
            return { repeticionUnidad: 'ninguna', repeticionCada: 1 };
        }

        if (modo === 'personalizado') {
            const unidad = document.getElementById('evento-repetir-unidad-personalizada').value;
            return { repeticionUnidad: unidad, repeticionCada: cada };
        }

        return { repeticionUnidad: modo, repeticionCada: 1 };
    }

    function parseFechaHora(fecha, hora) {
        const [h, m] = hora.split(':').map(Number);
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m, 0, 0);
    }

    function actualizarUIAvisos() {
        const btn = document.getElementById('btn-avisos');
        const select = document.getElementById('avisos-anticipacion');
        select.value = String(avisosConfig.anticipacionMinutos);
        btn.classList.toggle('activo', avisosConfig.activo);
        btn.innerHTML = avisosConfig.activo
            ? '<span class="icono-texto"><i class="ph ph-bell-ringing" aria-hidden="true"></i><span>Avisos activos</span></span>'
            : '<span class="icono-texto"><i class="ph ph-bell" aria-hidden="true"></i><span>Activar avisos</span></span>';
    }

    async function activarAvisos() {
        if (!('Notification' in window)) {
            mostrarToast('Este navegador no soporta notificaciones.', 'error');
            return;
        }
        if (Notification.permission === 'denied') {
            mostrarToast('Notificaciones bloqueadas en el navegador.', 'error');
            return;
        }
        if (Notification.permission !== 'granted') {
            const permiso = await Notification.requestPermission();
            if (permiso !== 'granted') {
                mostrarToast('No se concedieron permisos de aviso.', 'error');
                return;
            }
        }

        avisosConfig.activo = !avisosConfig.activo;
        guardarAvisosConfig();
        actualizarUIAvisos();
        mostrarToast(avisosConfig.activo ? 'Avisos activados.' : 'Avisos desactivados.');
    }

    function registrarAvisoEnviado(id) {
        avisosEnviados[id] = Date.now();
        guardarAvisosEnviados();
    }

    function yaAvisado(id) {
        return Boolean(avisosEnviados[id]);
    }

    function dispararAviso(id, titulo, cuerpo) {
        if (!avisosConfig.activo) return;
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        if (yaAvisado(id)) return;
        new Notification(titulo, { body: cuerpo });
        registrarAvisoEnviado(id);
    }

    function revisarAvisos() {
        if (!avisosConfig.activo) return;
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const ahora = new Date();
        const anticipacionMs = avisosConfig.anticipacionMinutos * 60 * 1000;
        const limite = new Date(ahora.getTime() + anticipacionMs);

        // Eventos con hora: aviso antes de que empiecen.
        for (let i = 0; i <= 1; i++) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
            const clave = claveDelDia(fecha);
            const delDia = eventosDelDia(fecha);

            delDia.forEach(ev => {
                if (!ev.horaInicio) return;
                const inicio = parseFechaHora(fecha, ev.horaInicio);
                if (inicio < ahora || inicio > limite) return;

                const avisoId = `ev-${ev.id}-${clave}-${ev.horaInicio}`;
                const deltaMin = Math.max(1, Math.round((inicio.getTime() - ahora.getTime()) / 60000));
                dispararAviso(avisoId, `Evento en ${deltaMin} min`, `${ev.nombre} · ${ev.horaInicio}`);
            });
        }

        // Tareas con fecha límite: aviso cuando se acerca el vencimiento del día.
        tareas.forEach(tarea => {
            if (normalizarEstado(tarea.estado) === 'finalizado') return;
            if (!tarea.fechaLimiteClave) return;

            const fechaLimite = fechaDesdeClaveISO(tarea.fechaLimiteClave);
            if (!fechaLimite) return;

            const vencimiento = new Date(fechaLimite.getFullYear(), fechaLimite.getMonth(), fechaLimite.getDate(), 9, 0, 0, 0);
            const inicioVentana = new Date(vencimiento.getTime() - anticipacionMs);
            const finVentana = new Date(vencimiento.getTime() + anticipacionMs);
            if (ahora < inicioVentana || ahora > finVentana) return;

            const avisoId = `task-${tarea.id}-${tarea.fechaLimiteClave}`;
            dispararAviso(avisoId, 'Tarea próxima a vencer', `${tarea.texto} · vence hoy`);
        });
    }

    poblarSelectHoras('evento-hora-inicio');
    poblarSelectHoras('evento-hora-fin');

    function renderCalendario() {
        const grid = document.getElementById('calendario-grid');
        const titulo = document.getElementById('mes-actual');
        grid.innerHTML = '';

        titulo.textContent = fechaActual.toLocaleDateString('es-ES', {
            month: 'long', year: 'numeric'
        });

        const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        let diaSemana = primerDia.getDay();
        diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;

        for (let i = 0; i < diaSemana; i++) {
            const vacio = document.createElement('div');
            vacio.classList.add('dia', 'vacio');
            grid.appendChild(vacio);
        }

        const diasEnMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
        const hoy = new Date();

        for (let d = 1; d <= diasEnMes; d++) {
            const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), d);
            const clave = claveDelDia(fecha);
            const dia = document.createElement('div');
            dia.classList.add('dia');

            const numero = document.createElement('span');
            numero.textContent = d;
            dia.appendChild(numero);

            if (d === hoy.getDate() &&
                fechaActual.getMonth() === hoy.getMonth() &&
                fechaActual.getFullYear() === hoy.getFullYear()) {
                dia.classList.add('hoy');
            }

            if (diaSeleccionado && claveDelDia(diaSeleccionado) === clave) {
                dia.classList.add('seleccionado');
            }

            const detalleCarga = obtenerDetalleCargaTrabajoDia(fecha);
            if (detalleCarga.nivel) {
                dia.classList.add(`carga-${detalleCarga.nivel}`);
                dia.title = `Carga ${detalleCarga.nivel} | Eventos: ${detalleCarga.horasEventos.toFixed(1)}h | Tareas: ${detalleCarga.horasTareas.toFixed(1)}h | Pendientes: ${detalleCarga.tareasPendientes} | Urgentes: ${detalleCarga.urgentes}`;
            }

            const eventosDiaLista = eventosDelDia(fecha);
            if (eventosDiaLista.length > 0) {
                const puntos = document.createElement('div');
                puntos.classList.add('dia-puntos');
                eventosDiaLista.slice(0, 3).forEach(ev => {
                    const punto = document.createElement('span');
                    punto.classList.add('dia-punto', normalizarColor(ev.color));
                    puntos.appendChild(punto);
                });
                dia.appendChild(puntos);
            }

            dia.addEventListener('click', () => {
                if (diaSeleccionado && claveDelDia(diaSeleccionado) === clave) {
                    diaSeleccionado = null;
                    document.getElementById('evento-form').style.display = 'none';
                    document.getElementById('eventos-lista').innerHTML = '';
                    document.getElementById('panel-tareas').innerHTML = '';
                    document.getElementById('tarea-detalle').style.display = 'none';
                    document.getElementById('dia-panel-titulo').textContent = 'Selecciona un día';
                    renderCalendario();
                } else {
                    diaSeleccionado = fecha;
                    renderCalendario();
                    mostrarPanel(fecha);
                }
            });

            grid.appendChild(dia);
        }
    }

    function renderSemana() {
        const vistasMes = document.getElementById('vista-mes');
        const vistaSemana = document.getElementById('vista-semana');
        const panelDia = document.getElementById('dia-panel');
        const grid = document.getElementById('semana-grid');
        const titulo = document.getElementById('mes-actual');

        vistasMes.style.display = 'none';
        vistaSemana.style.display = 'block';
        panelDia.style.display = 'flex';

        grid.innerHTML = '';

        const hoy = new Date();
        const base = diaSeleccionado || hoy;
        const lunes = new Date(base);
        const dia = lunes.getDay();
        const diff = dia === 0 ? -6 : 1 - dia;
        lunes.setDate(lunes.getDate() + diff);

        titulo.textContent = `Semana del ${lunes.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;

        for (let i = 0; i < 7; i++) {
            const fecha = new Date(lunes);
            fecha.setDate(lunes.getDate() + i);
            const clave = claveDelDia(fecha);
            const esHoy = claveDelDia(fecha) === claveDelDia(hoy);
            const esSeleccionado = diaSeleccionado && claveDelDia(diaSeleccionado) === clave;

            const columna = document.createElement('div');
            columna.classList.add('semana-columna');

            // Cabecera del día
            const header = document.createElement('div');
            header.classList.add('semana-dia-header');
            if (esHoy) header.classList.add('hoy');
            if (esSeleccionado) header.classList.add('seleccionado');
            header.innerHTML = `
                <span class="semana-dia-nombre">${fecha.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span class="semana-dia-numero">${fecha.getDate()}</span>
            `;

            header.addEventListener('click', () => {
                if (diaSeleccionado && claveDelDia(diaSeleccionado) === clave) {
                    diaSeleccionado = null;
                    document.getElementById('evento-form').style.display = 'none';
                    document.getElementById('eventos-lista').innerHTML = '';
                    document.getElementById('panel-tareas').innerHTML = '';
                    document.getElementById('tarea-detalle').style.display = 'none';
                    document.getElementById('dia-panel-titulo').textContent = 'Selecciona un día';
                } else {
                    diaSeleccionado = fecha;
                    mostrarPanel(fecha);
                }
                renderSemana();
            });

            columna.appendChild(header);

            // Eventos del día
            const eventosDiaLista = eventosDelDia(fecha);
            eventosDiaLista.forEach(ev => {
                const card = document.createElement('div');
                card.classList.add('semana-evento', normalizarColor(ev.color));
                card.innerHTML = `
                    <span class="semana-evento-nombre">${escaparHTML(ev.nombre)}</span>
                    <span class="evento-detalle">${escaparHTML(textoHorarioEvento(ev))}</span>
                `;
                columna.appendChild(card);
            });

            // Tareas del día
            const tareasDelDia = tareas.filter(t => obtenerClaveTareaPorFecha(t, fecha));
            tareasDelDia.forEach(t => {
                const card = document.createElement('div');
                const categoria = normalizarCategoria(t.categoria);
                card.classList.add('semana-tarea');
                if (t.estado === 'finalizado') card.classList.add('completada');
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <span class="semana-tarea-categoria">${categoriaAEtiqueta(categoria)}</span>
                    <span class="semana-tarea-nombre">${escaparHTML(t.texto)}</span>
                    ${mostrarDescripcionSemana && t.descripcion ? `<span class="semana-tarea-descripcion">${escaparHTML(t.descripcion)}</span>` : ''}
                    <span class="semana-tarea-estado">${estadoATexto(t.estado)}</span>
                `;
                const badgeCategoria = card.querySelector('.semana-tarea-categoria');
                const colorCategoria = colorCategoriaTarea(categoria);
                aplicarEstiloCategoriaEnElemento(badgeCategoria, colorCategoria, 0.12);
                aplicarEstiloTarjetaTarea(card, categoria);
                card.addEventListener('click', () => {
                    // Aseguramos que el panel lateral esté visible
                    document.getElementById('dia-panel-titulo').textContent = 'Editar tarea';
                    document.getElementById('evento-form').style.display = 'none';
                    document.getElementById('eventos-lista').innerHTML = '';
                    document.getElementById('panel-tareas').innerHTML = '';
                    mostrarDetalleTarea(t);
                });
                columna.appendChild(card);
            });

            grid.appendChild(columna);
        }
    }

    function mostrarPanel(fecha) {
        const clave = claveDelDia(fecha);
        const tituloDia = document.getElementById('dia-panel-titulo');
        const eventoForm = document.getElementById('evento-form');
        const eventosList = document.getElementById('eventos-lista');
        const panelTareas = document.getElementById('panel-tareas');

        document.getElementById('tarea-detalle').style.display = 'none';

        tituloDia.textContent = fecha.toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long'
        });

        eventoForm.style.display = 'flex';
        eventosList.innerHTML = '';

        const eventosDiaLista = eventosDelDia(fecha);
        eventosDiaLista.forEach((ev) => {
            const li = document.createElement('li');
            li.classList.add('evento-item');
            const repite = textoRepeticionEvento(ev);
            li.innerHTML = `
                <span class="evento-bola ${normalizarColor(ev.color)}"></span>
                <span class="evento-nombre">${escaparHTML(ev.nombre)}</span>
                <span class="evento-detalle">${escaparHTML(textoHorarioEvento(ev))}${repite ? ` · ${escaparHTML(repite)}` : ''}</span>
                <button class="btn-borrar-evento" aria-label="Borrar evento"><i class="ph ph-x" aria-hidden="true"></i></button>
            `;
            li.querySelector('.btn-borrar-evento').addEventListener('click', () => {
                eventos = eventos.filter(item => item.id !== ev.id);
                guardarEventos();
                mostrarPanel(fecha);
                const vistaActiva = document.querySelector('.vista-btn.activo');
                vistaActiva.dataset.vista === 'semana' ? renderSemana() : renderCalendario();
            });
            eventosList.appendChild(li);
        });

        const tareasDelDia = tareas.filter(t => obtenerClaveTareaPorFecha(t, fecha));

        panelTareas.innerHTML = '';
        if (tareasDelDia.length > 0) {
            const h4 = document.createElement('h4');
            h4.textContent = 'Tareas';
            panelTareas.appendChild(h4);

            tareasDelDia.forEach(t => {
                const item = document.createElement('div');
                item.classList.add('tarea-panel-item');
                if (t.estado === 'finalizado') item.classList.add('completada');
                item.style.cursor = 'pointer';
                const categoria = normalizarCategoria(t.categoria);
                item.innerHTML = `
                    <span class="tarea-panel-categoria">${categoriaAEtiqueta(categoria)}</span>
                    <span class="tarea-panel-texto">${escaparHTML(t.texto)}</span>
                    ${t.descripcion ? `<span class="tarea-panel-descripcion">${escaparHTML(t.descripcion)}</span>` : ''}
                    <span class="tarea-panel-estado">${estadoATexto(t.estado)}</span>
                `;
                const colorCategoria = colorCategoriaTarea(categoria);
                aplicarEstiloCategoriaEnElemento(item.querySelector('.tarea-panel-categoria'), colorCategoria, 0.12);
                item.addEventListener('click', () => mostrarDetalleTarea(t));
                panelTareas.appendChild(item);
            });
        }
    }

    document.getElementById('btn-anadir-evento').addEventListener('click', () => {
        if (!diaSeleccionado) return;
        const input = document.getElementById('evento-input');
        const horaInicio = document.getElementById('evento-hora-inicio').value;
        const horaFin = document.getElementById('evento-hora-fin').value;
        const { repeticionUnidad, repeticionCada } = leerConfiguracionRepeticion();
        const nombre = input.value.trim();
        if (nombre === '') return;

        if (horaInicio && horaFin && horaFin <= horaInicio) {
            return;
        }

        const nuevoEvento = normalizarEvento({
            id: crearIdEvento(),
            nombre,
            color: normalizarColor(colorSeleccionado),
            fechaClave: claveDelDia(diaSeleccionado),
            horaInicio,
            horaFin,
            repeticionUnidad,
            repeticionCada
        });

        if (!nuevoEvento) return;

        eventos.push(nuevoEvento);
        guardarEventos();
        limpiarCamposEvento();
        mostrarPanel(diaSeleccionado);
        renderVistaCalendarioActiva();
    });

    document.getElementById('evento-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('btn-anadir-evento').click();
    });

    document.getElementById('evento-repetir-unidad').addEventListener('change', (e) => {
        const inputCada = document.getElementById('evento-repetir-cada');
        const contenedorPersonalizado = document.getElementById('evento-repeticion-personalizada');
        const modo = e.target.value;

        if (modo === 'ninguna') {
            inputCada.disabled = true;
            inputCada.value = '1';
            contenedorPersonalizado.style.display = 'none';
            return;
        }

        if (modo === 'personalizado') {
            inputCada.disabled = false;
            if (Number(inputCada.value) < 1) inputCada.value = '1';
            contenedorPersonalizado.style.display = 'grid';
            return;
        }

        inputCada.disabled = true;
        inputCada.value = '1';
        contenedorPersonalizado.style.display = 'none';
    });

    document.querySelectorAll('.color-opcion').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-opcion').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            colorSeleccionado = btn.dataset.color;
        });
    });

    document.getElementById('mes-anterior').addEventListener('click', () => {
        const vistaActiva = document.querySelector('.vista-btn.activo');
        if (vistaActiva && vistaActiva.dataset.vista === 'semana') {
            const base = diaSeleccionado ? new Date(diaSeleccionado) : new Date();
            base.setDate(base.getDate() - 7);
            diaSeleccionado = base;
            mostrarPanel(base);
            renderSemana();
            return;
        }

        fechaActual.setMonth(fechaActual.getMonth() - 1);
        renderCalendario();
    });

    document.getElementById('mes-siguiente').addEventListener('click', () => {
        const vistaActiva = document.querySelector('.vista-btn.activo');
        if (vistaActiva && vistaActiva.dataset.vista === 'semana') {
            const base = diaSeleccionado ? new Date(diaSeleccionado) : new Date();
            base.setDate(base.getDate() + 7);
            diaSeleccionado = base;
            mostrarPanel(base);
            renderSemana();
            return;
        }

        fechaActual.setMonth(fechaActual.getMonth() + 1);
        renderCalendario();
    });

    document.querySelectorAll('.vista-btn[data-vista]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vista-btn[data-vista]').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');

            if (btn.dataset.vista === 'semana') {
                renderSemana();
            } else {
                document.getElementById('vista-mes').style.display = 'block';
                document.getElementById('vista-semana').style.display = 'none';
                document.getElementById('dia-panel').style.display = 'flex';
                renderCalendario();
            }

            actualizarToggleDescripcionSemana();
        });
    });

    document.getElementById('toggle-descripciones-semana').addEventListener('click', () => {
        mostrarDescripcionSemana = !mostrarDescripcionSemana;
        actualizarToggleDescripcionSemana();
        const vistaActiva = document.querySelector('.vista-btn.activo');
        if (vistaActiva && vistaActiva.dataset.vista === 'semana') {
            renderSemana();
        }
    });

    document.getElementById('btn-avisos').addEventListener('click', activarAvisos);
    document.getElementById('avisos-anticipacion').addEventListener('change', (e) => {
        avisosConfig.anticipacionMinutos = [5, 10, 15].includes(Number(e.target.value))
            ? Number(e.target.value)
            : 10;
        guardarAvisosConfig();
        revisarAvisos();
    });

    inicializarSeguro('renderCalendario', renderCalendario);
    inicializarSeguro('renderResumenHoy', renderResumenHoy);
    inicializarSeguro('actualizarToggleDescripcionSemana', actualizarToggleDescripcionSemana);
    inicializarSeguro('actualizarUIAvisos', actualizarUIAvisos);
    inicializarSeguro('revisarAvisos', revisarAvisos);
    setInterval(revisarAvisos, 30000);

    // ---- NOTAS ----
    let notas = asegurarArray(storageGetJSON('notas', []))
        .filter(n => n && typeof n === 'object');

    function guardarNotas() {
        localStorage.setItem('notas', JSON.stringify(notas));
    }

    function crearNotaHTML(nota) {
        const card = document.createElement('div');
        card.classList.add('nota-card');

        card.innerHTML = `
            <input class="nota-titulo" placeholder="Título..." value="${escaparHTML(nota.titulo)}">
            <textarea class="nota-texto" placeholder="Escribe aquí...">${escaparHTML(nota.texto)}</textarea>
            <div class="nota-footer">
                <span class="nota-fecha">${escaparHTML(nota.fecha)}</span>
                <button class="btn-borrar-nota" aria-label="Borrar nota"><i class="ph ph-trash" aria-hidden="true"></i></button>
            </div>
        `;

        card.querySelector('.nota-titulo').addEventListener('input', (e) => {
            nota.titulo = e.target.value;
            guardarNotas();
        });

        card.querySelector('.nota-texto').addEventListener('input', (e) => {
            nota.texto = e.target.value;
            guardarNotas();
        });

        card.querySelector('.btn-borrar-nota').addEventListener('click', () => {
            notas = notas.filter(n => n !== nota);
            guardarNotas();
            card.remove();
        });

        document.getElementById('notas-grid').appendChild(card);
    }

    function nuevaNota() {
        const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        const nota = { titulo: '', texto: '', fecha };
        notas.push(nota);
        guardarNotas();
        crearNotaHTML(nota);
    }

    notas.forEach(nota => crearNotaHTML(nota));

    document.getElementById('btn-nueva-nota').onclick = nuevaNota;

    // ---- POMODORO ----
    let minutos = 25;
    let segundos = 0;
    let intervalo = null;
    let corriendo = false;
    const _claveHoyPom = fechaAClaveISO(new Date());
    const _datoPom = storageGetJSON('pomodorosHoy', null);
    let pomodorosHoy = (_datoPom?.clave === _claveHoyPom) ? (Number(_datoPom?.cantidad) || 0) : 0;

    function guardarPomodorosHoy() {
        localStorage.setItem('pomodorosHoy', JSON.stringify({ clave: _claveHoyPom, cantidad: pomodorosHoy }));
    }

    document.getElementById('contador-pomodoros').textContent = pomodorosHoy;
    renderResumenHoy();

    function actualizarTextoBotonPomodoro() {
        const btn = document.getElementById('btn-iniciar');
        if (!btn) return;
        btn.innerHTML = corriendo
            ? '<span class="icono-texto"><i class="ph ph-pause" aria-hidden="true"></i><span>Pausar</span></span>'
            : '<span class="icono-texto"><i class="ph ph-play" aria-hidden="true"></i><span>Iniciar</span></span>';
    }

    function actualizarDisplay() {
        document.getElementById('timer-minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('timer-segundos').textContent = String(segundos).padStart(2, '0');
    }

    function seleccionarModoPomodoro(minutosModo) {
        const modoObjetivo = Array.from(document.querySelectorAll('.modo-btn'))
            .find(btn => Number(btn.dataset.tiempo) === Number(minutosModo));
        if (!modoObjetivo) return;

        document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('activo'));
        modoObjetivo.classList.add('activo');
        minutos = Number(modoObjetivo.dataset.tiempo);
        segundos = 0;
        actualizarDisplay();
    }

    function sugerirDescansoLargo() {
        mostrarToast('Llevas 4 Pomodoros. Te sugiero un descanso largo de 15-30 min.');
        seleccionarModoPomodoro(15);
    }

    function iniciarPausar() {
        if (corriendo) {
            clearInterval(intervalo);
            corriendo = false;
            actualizarTextoBotonPomodoro();
        } else {
            intervalo = setInterval(() => {
                if (segundos === 0) {
                    if (minutos === 0) {
                        clearInterval(intervalo);
                        corriendo = false;
                        actualizarTextoBotonPomodoro();
                        const modoActivo = document.querySelector('.modo-btn.activo');
                        if (modoActivo.dataset.tiempo === '25') {
                            pomodorosHoy++;
                            guardarPomodorosHoy();
                            document.getElementById('contador-pomodoros').textContent = pomodorosHoy;
                            renderResumenHoy();
                            renderLogrosEnfoque();
                            if (pomodorosHoy > 0 && pomodorosHoy % 4 === 0) {
                                sugerirDescansoLargo();
                            }
                        }
                        return;
                    }
                    minutos--;
                    segundos = 59;
                } else {
                    segundos--;
                }
                actualizarDisplay();
            }, 1000);

            corriendo = true;
            actualizarTextoBotonPomodoro();
        }
    }

    function reiniciar() {
        clearInterval(intervalo);
        corriendo = false;
        actualizarTextoBotonPomodoro();
        const modoActivo = document.querySelector('.modo-btn.activo');
        minutos = parseInt(modoActivo.dataset.tiempo);
        segundos = 0;
        actualizarDisplay();
    }

    document.querySelectorAll('.modo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            clearInterval(intervalo);
            corriendo = false;
            actualizarTextoBotonPomodoro();
            seleccionarModoPomodoro(parseInt(btn.dataset.tiempo));
        });
    });

    document.getElementById('btn-iniciar').addEventListener('click', iniciarPausar);
    document.getElementById('btn-reiniciar').addEventListener('click', reiniciar);
    actualizarTextoBotonPomodoro();
    actualizarDisplay();


    function procesarLimpiezaTareas() {
        const tiempoHoras = parseInt(document.getElementById('tiempo-limpieza').value);
        const msLimite = tiempoHoras * 60 * 60 * 1000;
        const ahora = Date.now();

        let tareasHistorial = asegurarArray(storageGetJSON(STORAGE_TAREAS_HISTORIAL, []));
        let huboCambios = false;
        let nuevasArchivadas = 0;

        // Filtramos las tareas que deben ir al historial
        tareas = tareas.filter(tarea => {
            if (tarea.estado === 'finalizado' && tarea.finalizadaEn) {
                const transcurrido = ahora - tarea.finalizadaEn;
                if (transcurrido >= msLimite) {
                    tareasHistorial.push({ ...tarea, archivadaEn: ahora });
                    huboCambios = true;
                    nuevasArchivadas++;
                    return false; // Se elimina de la lista activa
                }
            }
            return true;
        });

        if (huboCambios) {
            localStorage.setItem('tareas', JSON.stringify(tareas));
            localStorage.setItem(STORAGE_TAREAS_HISTORIAL, JSON.stringify(tareasHistorial));
            refrescarListaTareas();
            mostrarToast(`${nuevasArchivadas} ${nuevasArchivadas === 1 ? 'tarea movida' : 'tareas movidas'} al historial.`);
        }
    }

    // Cargar preferencia al inicio ANTES de la primera limpieza
    const prefGuardada = localStorage.getItem(STORAGE_PREFERENCIA_LIMPIEZA);
    if (prefGuardada) document.getElementById('tiempo-limpieza').value = prefGuardada;

    // Ejecutar limpieza al cargar y cada 5 minutos
    procesarLimpiezaTareas();
    setInterval(procesarLimpiezaTareas, 5 * 60 * 1000);

    // Guardar preferencia del usuario
    document.getElementById('tiempo-limpieza').addEventListener('change', (e) => {
        localStorage.setItem(STORAGE_PREFERENCIA_LIMPIEZA, e.target.value);
        procesarLimpiezaTareas();
    });

    // Función para mostrar las tareas guardadas en el historial
    function renderHistorial() {
        const lista = document.getElementById('lista-historial');
        const mensajeVacio = document.getElementById('lista-historial-vacia');
        const historial = asegurarArray(storageGetJSON(STORAGE_TAREAS_HISTORIAL, []));

        lista.innerHTML = '';

        if (historial.length === 0) {
            mensajeVacio.style.display = 'block';
            return;
        }

        mensajeVacio.style.display = 'none';
        historial.slice().reverse().forEach(tarea => {
            const li = document.createElement('li');
            li.className = 'historial-item';
            const fechaArchivado = new Date(tarea.archivadaEn).toLocaleDateString();

            li.innerHTML = `
                <span class="tarea-texto"><strong>${escaparHTML(tarea.texto)}</strong></span>
                <span class="historial-fecha">Finalizada el: ${fechaArchivado}</span>
                <span class="tarea-panel-categoria" style="background:${colorCategoriaTarea(tarea.categoria)}33">
                    ${categoriaATexto(tarea.categoria)}
                </span>
            `;
            lista.appendChild(li);
        });
    }

    // Eventos para el Modal
    document.getElementById('btn-ver-historial').addEventListener('click', () => {
        renderHistorial();
        document.getElementById('modal-historial').style.display = 'flex';
    });

    document.getElementById('btn-ver-logros')?.addEventListener('click', () => {
        renderLogrosEnfoque();
        document.getElementById('modal-logros').style.display = 'flex';
    });

    document.getElementById('cerrar-historial').addEventListener('click', () => {
        document.getElementById('modal-historial').style.display = 'none';
    });

    document.getElementById('cerrar-logros')?.addEventListener('click', () => {
        document.getElementById('modal-logros').style.display = 'none';
    });

    document.getElementById('btn-vaciar-historial').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar permanentemente todos tus logros pasados?')) {
            localStorage.removeItem(STORAGE_TAREAS_HISTORIAL);
            renderHistorial();
            renderLogrosEnfoque();
        }
    });

    function abrirBusquedaRapida() {
        const modal = document.getElementById('modal-busqueda');
        const input = document.getElementById('input-busqueda-global');
        if (!modal || !input) return;
        modal.style.display = 'flex';
        input.value = '';
        renderBusquedaGlobal();
        setTimeout(() => input.focus(), 0);
    }

    function cerrarBusquedaRapida() {
        const modal = document.getElementById('modal-busqueda');
        if (modal) modal.style.display = 'none';
    }

    document.getElementById('cerrar-busqueda')?.addEventListener('click', cerrarBusquedaRapida);
    document.getElementById('input-busqueda-global')?.addEventListener('input', renderBusquedaGlobal);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            abrirBusquedaRapida();
        }
        if (e.key === 'Escape') {
            cerrarBusquedaRapida();
        }
    });
};