/**
 * accessibility.js
 * Sistema de accesibilidad reutilizable con modo claro/oscuro y control de texto
 * Guarda preferencias en localStorage para persistencia entre sesiones y páginas
 *
 * Uso: Incluir al final del <body> en cualquier página HTML
 * <script src="js/accessibility.js"></script>
 */

class AccessibilityManager {
  constructor() {
    // Configuración por defecto
    this.settings = {
      theme: "light",
      fontSize: "medium",
    };

    // Multiplicadores de tamaño de fuente
    this.fontSizes = {
      small: 0.875,
      medium: 1,
      large: 1.125,
      xlarge: 1.25,
    };

    this.init();
  }

  /**
   * Inicializar el sistema de accesibilidad
   */
  init() {
    this.loadSettings();
    // Aplica las preferencias aunque todavía no exista el widget
    this.applyTheme(this.settings.theme);
    this.applyFontSize(this.settings.fontSize);
  }

  /**
   * Cargar configuraciones guardadas desde localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem("accessibilitySettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // merge simple por si en el futuro agregas más campos
        this.settings = {
          ...this.settings,
          ...parsed,
        };
      }
    } catch (error) {
      console.warn(
        "Error cargando configuración de accesibilidad:",
        error
      );
    }
  }

  /**
   * Guardar configuraciones en localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        "accessibilitySettings",
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.warn(
        "Error guardando configuración de accesibilidad:",
        error
      );
    }
  }

  /**
   * Alternar entre tema claro y oscuro
   */
  toggleTheme() {
    this.settings.theme =
      this.settings.theme === "light" ? "dark" : "light";
    this.applyTheme(this.settings.theme);
    this.saveSettings();
  }

  /**
   * Aplicar tema (claro u oscuro)
   * @param {string} theme - 'light' o 'dark'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.settings.theme = theme;

    // Actualizar ícono del botón de tema si el widget ya existe
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.textContent = theme === "light" ? "🌙" : "☀️";
    }
  }

  /**
   * Cambiar tamaño de fuente
   * @param {string} action - 'increase', 'decrease', o 'reset'
   */
  changeFontSize(action) {
    const sizes = Object.keys(this.fontSizes);
    const currentIndex = sizes.indexOf(this.settings.fontSize);

    let newIndex = currentIndex;
    if (action === "increase" && currentIndex < sizes.length - 1) {
      newIndex = currentIndex + 1;
    } else if (action === "decrease" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (action === "reset") {
      newIndex = sizes.indexOf("medium");
    }

    if (newIndex === currentIndex || newIndex === -1) {
      return; // No hay cambio
    }

    this.settings.fontSize = sizes[newIndex];
    this.applyFontSize(this.settings.fontSize);
    this.saveSettings();
  }

  /**
   * Aplicar tamaño de fuente
   * @param {string} size - 'small', 'medium', 'large', o 'xlarge'
   */
  applyFontSize(size) {
    const multiplier = this.fontSizes[size] || this.fontSizes.medium;
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      multiplier
    );
    this.settings.fontSize = size;

    // Actualizar indicador visual si existe
    const fontSizeIndicator = document.getElementById(
      "font-size-indicator"
    );
    if (fontSizeIndicator) {
      fontSizeIndicator.textContent = size.toUpperCase();
    }
  }

  /**
   * Crear el widget flotante de accesibilidad
   */
  createAccessibilityWidget() {
    const widget = document.createElement("div");
    widget.id = "accessibility-widget";
    widget.className = "accessibility-widget";

    widget.innerHTML = `
      <button id="accessibility-toggle" class="widget-toggle" aria-label="Abrir menú de accesibilidad" aria-expanded="false">
        <span class="icon">◀</span>
      </button>
      
      <div id="accessibility-panel" class="widget-panel" role="dialog" aria-label="Panel de accesibilidad">
        <div class="panel-header">
          <h3>Accesibilidad</h3>
          <button id="close-panel" class="close-btn" aria-label="Cerrar panel">✕</button>
        </div>
        
        <div class="widget-section">
          <label>Tema</label>
          <button id="theme-toggle" class="widget-button" aria-label="Cambiar entre modo claro y oscuro">
            <span id="theme-icon">🌙</span>
            <span>Cambiar tema</span>
          </button>
        </div>
        
        <div class="widget-section">
          <label>Tamaño de texto</label>
          <div class="font-controls">
            <button id="font-decrease" class="widget-button small" aria-label="Reducir tamaño de texto">A-</button>
            <span id="font-size-indicator" class="font-indicator" aria-live="polite">MEDIUM</span>
            <button id="font-increase" class="widget-button small" aria-label="Aumentar tamaño de texto">A+</button>
          </div>
          <button id="font-reset" class="widget-button-secondary">Restablecer</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Una vez creado el widget, volvemos a aplicar tema y tamaño
    // para que el icono y el indicador queden sincronizados con la preferencia
    this.applyTheme(this.settings.theme);
    this.applyFontSize(this.settings.fontSize);

    this.attachEventListeners();
  }

  /**
   * Adjuntar eventos a los botones del widget
   */
  attachEventListeners() {
    const toggle = document.getElementById("accessibility-toggle");
    const panel = document.getElementById("accessibility-panel");
    const closeBtn = document.getElementById("close-panel");
    const themeToggle = document.getElementById("theme-toggle");
    const fontIncrease = document.getElementById("font-increase");
    const fontDecrease = document.getElementById("font-decrease");
    const fontReset = document.getElementById("font-reset");
    const widget = document.getElementById("accessibility-widget");

    // Toggle del panel
    if (toggle && panel && widget) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = widget.classList.contains("open");

        if (isOpen) {
          widget.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.querySelector(".icon").textContent = "◀";
        } else {
          widget.classList.add("open");
          toggle.setAttribute("aria-expanded", "true");
          toggle.querySelector(".icon").textContent = "▶";
        }
      });
    }

    // Botón cerrar
    if (closeBtn && widget && toggle) {
      closeBtn.addEventListener("click", () => {
        widget.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".icon").textContent = "◀";
      });
    }

    // Botón de tema
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Botones de tamaño de fuente
    if (fontIncrease) {
      fontIncrease.addEventListener("click", () =>
        this.changeFontSize("increase")
      );
    }

    if (fontDecrease) {
      fontDecrease.addEventListener("click", () =>
        this.changeFontSize("decrease")
      );
    }

    if (fontReset) {
      fontReset.addEventListener("click", () =>
        this.changeFontSize("reset")
      );
    }

    // Cerrar panel al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (widget && toggle && !e.target.closest("#accessibility-widget")) {
        widget.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".icon").textContent = "◀";
      }
    });

    // Cerrar panel con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        widget &&
        widget.classList.contains("open") &&
        toggle
      ) {
        widget.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".icon").textContent = "◀";
        toggle.focus();
      }
    });
  }
}

// Instancia global del sistema de accesibilidad
let accessibilityManager;

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  accessibilityManager = new AccessibilityManager();
  accessibilityManager.createAccessibilityWidget();
});

// Exportar para uso en módulos ES6 (opcional)
if (typeof module !== "undefined" && module.exports) {
  module.exports = AccessibilityManager;
}
