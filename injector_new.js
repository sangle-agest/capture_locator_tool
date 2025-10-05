// Smart Locator Inspector - Injected Browser Script
// This script runs in the browser context to provide real-time element inspection

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.SmartLocatorInspector) {
        console.log('[SLI] Already injected, refreshing...');
        window.SmartLocatorInspector.cleanup();
    }

    // Global state
    let isActive = true;
    let isFrozen = false;
    let currentElement = null;
    let modal = null;
    let highlightBox = null;
    let lastHoveredElement = null;

    // Configuration
    const config = {
        modalId: 'sli-modal',
        highlightId: 'sli-highlight',
        zIndex: 2147483647, // Maximum z-index
        excludeElements: ['sli-modal', 'sli-highlight'],
        ignoreTags: ['HTML', 'BODY']
    };

    // Initialize the inspector
    function init() {
        console.log('[SLI] Smart Locator Inspector initialized');
        
        // Clean up any existing instances
        cleanup();
        
        // Create UI elements
        createModal();
        createHighlightBox();
        
        // Attach event listeners
        attachEventListeners();
        
        // Show initial message
        updateModal({
            message: 'Hover over elements to inspect them!',
            instructions: [
                'CTRL - Freeze current element',
                'ESC - Toggle inspector on/off', 
                'Click any locator to copy it'
            ]
        });

        // Setup navigation persistence
        setupNavigationPersistence();
    }

    // Create the floating modal with robust CSS
    function createModal() {
        modal = document.createElement('div');
        modal.id = config.modalId;
        modal.className = 'sli-modal';
        
        modal.innerHTML = `
            <div class="sli-header">
                <span class="sli-title">🎯 Smart Locator Inspector</span>
                <button class="sli-close" onclick="window.SLI.toggle()" title="Hide (ESC)">×</button>
            </div>
            <div class="sli-content">
                <div class="sli-loading">Hover over an element...</div>
            </div>
        `;

        // Inject comprehensive styles
        injectStyles();
        
        // Add to page
        document.documentElement.appendChild(modal);
        
        // Make draggable
        makeDraggable(modal);
    }

    // Inject comprehensive CSS styles
    function injectStyles() {
        let styleSheet = document.getElementById('sli-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
        
        styleSheet = document.createElement('style');
        styleSheet.id = 'sli-styles';
        styleSheet.textContent = `
            .sli-modal {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                width: 380px !important;
                max-height: 80vh !important;
                background: rgba(28, 28, 30, 0.95) !important;
                border: 2px solid #007acc !important;
                border-radius: 12px !important;
                color: white !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                font-size: 13px !important;
                z-index: ${config.zIndex} !important;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(20px) !important;
                overflow: hidden !important;
                pointer-events: auto !important;
                user-select: none !important;
                transform: translateZ(0) !important;
            }
            
            .sli-header {
                background: linear-gradient(135deg, #007acc 0%, #005a9e 100%) !important;
                padding: 12px 16px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                font-weight: 600 !important;
                cursor: move !important;
                border-radius: 10px 10px 0 0 !important;
            }
            
            .sli-title {
                color: white !important;
                font-size: 15px !important;
                font-weight: 600 !important;
            }
            
            .sli-close {
                background: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                font-size: 16px !important;
                cursor: pointer !important;
                padding: 4px 8px !important;
                width: 28px !important;
                height: 28px !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
            }
            
            .sli-close:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                border-color: rgba(255, 255, 255, 0.4) !important;
                transform: scale(1.1) !important;
            }
            
            .sli-content {
                padding: 16px !important;
                max-height: calc(80vh - 60px) !important;
                overflow-y: auto !important;
            }
            
            .sli-content::-webkit-scrollbar {
                width: 6px !important;
            }
            
            .sli-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1) !important;
                border-radius: 3px !important;
            }
            
            .sli-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3) !important;
                border-radius: 3px !important;
            }
            
            .sli-field {
                margin-bottom: 10px !important;
                padding: 10px 12px !important;
                background: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                position: relative !important;
            }
            
            .sli-field:hover {
                background: rgba(0, 122, 204, 0.2) !important;
                border-color: #007acc !important;
                transform: translateY(-1px) !important;
            }
            
            .sli-field-label {
                color: #61dafb !important;
                font-weight: 600 !important;
                margin-bottom: 4px !important;
                font-size: 12px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            .sli-field-value {
                color: #f8f8f2 !important;
                word-break: break-all !important;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                background: rgba(0, 0, 0, 0.2) !important;
                padding: 6px 8px !important;
                border-radius: 4px !important;
                margin-top: 4px !important;
            }
            
            .sli-instruction {
                color: #98c379 !important;
                font-size: 11px !important;
                margin-bottom: 6px !important;
                padding: 4px 8px !important;
                background: rgba(152, 195, 121, 0.1) !important;
                border-radius: 4px !important;
                border-left: 3px solid #98c379 !important;
            }
            
            .sli-message {
                color: #61dafb !important;
                font-weight: 600 !important;
                text-align: center !important;
                padding: 16px !important;
                font-size: 14px !important;
            }
            
            .sli-loading {
                color: #98c379 !important;
                text-align: center !important;
                padding: 24px !important;
                font-style: italic !important;
                font-size: 14px !important;
            }
            
            .sli-frozen {
                border-color: #e06c75 !important;
                box-shadow: 0 0 20px rgba(224, 108, 117, 0.4) !important;
            }
            
            .sli-frozen .sli-header {
                background: linear-gradient(135deg, #e06c75 0%, #c94a4a 100%) !important;
            }
            
            .sli-highlight {
                position: absolute !important;
                pointer-events: none !important;
                z-index: ${config.zIndex - 1} !important;
                border: 2px solid #007acc !important;
                background: rgba(0, 122, 204, 0.1) !important;
                box-shadow: 0 0 12px rgba(0, 122, 204, 0.4) !important;
                transition: all 0.15s ease !important;
                display: none !important;
                border-radius: 4px !important;
            }
            
            .sli-highlight.frozen {
                border-color: #e06c75 !important;
                background: rgba(224, 108, 117, 0.15) !important;
                box-shadow: 0 0 12px rgba(224, 108, 117, 0.4) !important;
            }
        `;

        document.head.appendChild(styleSheet);
    }

    // Create the highlight box
    function createHighlightBox() {
        highlightBox = document.createElement('div');
        highlightBox.id = config.highlightId;
        highlightBox.className = 'sli-highlight';
        document.documentElement.appendChild(highlightBox);
    }

    // Make modal draggable
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const header = element.querySelector('.sli-header');
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = (initialX + deltaX) + 'px';
            element.style.top = (initialY + deltaY) + 'px';
            element.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'default';
            }
        });
    }

    // Setup navigation persistence
    function setupNavigationPersistence() {
        // Monitor for page changes and re-inject
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if our modal was removed
                    if (!document.getElementById(config.modalId)) {
                        console.log('[SLI] Modal removed, re-injecting...');
                        setTimeout(init, 100);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Listen for page navigation events
        let lastUrl = location.href;
        const checkForUrlChange = () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                console.log('[SLI] Navigation detected, ensuring inspector persistence...');
                setTimeout(() => {
                    if (!document.getElementById(config.modalId)) {
                        init();
                    }
                }, 500);
            }
        };

        // Check for URL changes periodically
        setInterval(checkForUrlChange, 1000);

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                if (!document.getElementById(config.modalId)) {
                    init();
                }
            }, 500);
        });
    }

    // Attach event listeners
    function attachEventListeners() {
        // Mouse move for hover detection
        document.addEventListener('mousemove', handleMouseMove, true);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyDown, true);
        
        // Prevent accidental interactions with our UI
        if (modal) {
            modal.addEventListener('click', handleModalClick, true);
            modal.addEventListener('mousemove', (e) => e.stopPropagation(), true);
        }
    }

    // Handle mouse movement
    function handleMouseMove(event) {
        if (!isActive || isFrozen) return;

        const element = event.target;
        
        // Skip our own elements
        if (isExcludedElement(element)) return;
        
        // Skip certain elements
        if (config.ignoreTags.includes(element.tagName)) return;

        if (element !== lastHoveredElement) {
            lastHoveredElement = element;
            currentElement = element;
            highlightElement(element);
            updateModalWithElement(element);
        }
    }

    // Handle keyboard shortcuts
    function handleKeyDown(event) {
        switch(event.key) {
            case 'Control':
                event.preventDefault();
                toggleFreeze();
                break;
            case 'Escape':
                event.preventDefault();
                toggle();
                break;
        }
    }

    // Handle modal clicks
    function handleModalClick(event) {
        event.stopPropagation();
        
        const field = event.target.closest('.sli-field');
        if (field) {
            const value = field.querySelector('.sli-field-value').textContent;
            copyToClipboard(value);
        }
    }

    // Check if element should be excluded
    function isExcludedElement(element) {
        if (!element) return true;
        
        // Check element itself
        if (config.excludeElements.some(cls => element.id === cls || element.classList.contains(cls))) {
            return true;
        }
        
        // Check parents
        let parent = element.parentElement;
        while (parent) {
            if (config.excludeElements.some(cls => parent.id === cls || parent.classList.contains(cls))) {
                return true;
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    // Highlight an element
    function highlightElement(element) {
        if (!element || !highlightBox) return;

        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        highlightBox.style.display = 'block';
        highlightBox.style.left = (rect.left + scrollX) + 'px';
        highlightBox.style.top = (rect.top + scrollY) + 'px';
        highlightBox.style.width = rect.width + 'px';
        highlightBox.style.height = rect.height + 'px';
        
        // Update frozen state styling
        if (isFrozen) {
            highlightBox.classList.add('frozen');
            modal.classList.add('sli-frozen');
        } else {
            highlightBox.classList.remove('frozen');
            modal.classList.remove('sli-frozen');
        }
    }

    // Update modal with element information
    function updateModalWithElement(element) {
        if (!element) return;

        const locators = generateLocators(element);
        updateModal(locators);
    }

    // Generate locators for an element
    function generateLocators(element) {
        const locators = {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            name: element.name || '',
            className: element.className || '',
            text: getElementText(element),
            css: generateCSSSelector(element),
            xpath: generateXPath(element),
            attributes: getRelevantAttributes(element)
        };

        return locators;
    }

    // Get element text content
    function getElementText(element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return element.value || element.placeholder || '';
        }
        
        // Get direct text content (not from children)
        let text = '';
        for (let node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent.trim();
            }
        }
        
        if (text.length > 50) {
            text = text.substring(0, 47) + '...';
        }
        
        return text;
    }

    // Generate CSS selector
    function generateCSSSelector(element) {
        // Prefer ID if available and not dynamic
        if (element.id && !isDynamicValue(element.id)) {
            return '#' + element.id;
        }

        // Try name attribute
        if (element.name && !isDynamicValue(element.name)) {
            return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
        }

        // Try stable classes
        const stableClasses = getStableClasses(element);
        if (stableClasses.length > 0) {
            return element.tagName.toLowerCase() + '.' + stableClasses.join('.');
        }

        // Try data attributes
        const dataAttrs = getDataAttributes(element);
        if (dataAttrs.length > 0) {
            const attr = dataAttrs[0];
            return `${element.tagName.toLowerCase()}[${attr.name}="${attr.value}"]`;
        }

        // Fallback to nth-child
        return getNthChildSelector(element);
    }

    // Generate XPath
    function generateXPath(element) {
        // Prefer ID if available and stable
        if (element.id && !isDynamicValue(element.id)) {
            return `//*[@id="${element.id}"]`;
        }

        // Try name attribute
        if (element.name && !isDynamicValue(element.name)) {
            return `//${element.tagName.toLowerCase()}[@name="${element.name}"]`;
        }

        // Try text-based XPath for buttons, links, etc.
        const text = getElementText(element);
        if (text && ['BUTTON', 'A', 'SPAN', 'DIV'].includes(element.tagName)) {
            return `//${element.tagName.toLowerCase()}[contains(text(),"${text}")]`;
        }

        // Try data attributes
        const dataAttrs = getDataAttributes(element);
        if (dataAttrs.length > 0) {
            const attr = dataAttrs[0];
            return `//${element.tagName.toLowerCase()}[@${attr.name}="${attr.value}"]`;
        }

        // Build hierarchical XPath
        return getHierarchicalXPath(element);
    }

    // Check if a value looks dynamic
    function isDynamicValue(value) {
        return /\d{3,}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(value);
    }

    // Get stable CSS classes
    function getStableClasses(element) {
        if (!element.className) return [];
        
        return element.className.split(/\s+/)
            .filter(cls => cls && !isDynamicValue(cls))
            .slice(0, 3);
    }

    // Get data attributes
    function getDataAttributes(element) {
        const dataAttrs = [];
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-') && !isDynamicValue(attr.value)) {
                dataAttrs.push({ name: attr.name, value: attr.value });
            }
        }
        return dataAttrs;
    }

    // Get relevant attributes for display
    function getRelevantAttributes(element) {
        const relevantAttrs = ['data-testid', 'data-test', 'aria-label', 'title', 'role', 'type'];
        const attrs = {};
        
        for (let attrName of relevantAttrs) {
            const value = element.getAttribute(attrName);
            if (value) {
                attrs[attrName] = value;
            }
        }
        
        return attrs;
    }

    // Generate nth-child selector
    function getNthChildSelector(element) {
        const parent = element.parentElement;
        if (!parent) return element.tagName.toLowerCase();

        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        const index = siblings.indexOf(element) + 1;
        
        return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }

    // Generate hierarchical XPath
    function getHierarchicalXPath(element) {
        const parts = [];
        let current = element;

        while (current && current.tagName !== 'HTML') {
            let part = current.tagName.toLowerCase();
            
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(el => el.tagName === current.tagName);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    part += `[${index}]`;
                }
            }
            
            parts.unshift(part);
            current = current.parentElement;
        }

        return '//' + parts.join('/');
    }

    // Update modal content
    function updateModal(data) {
        if (!modal) return;

        const content = modal.querySelector('.sli-content');
        if (!content) return;

        if (data.message) {
            content.innerHTML = `
                <div class="sli-message">${data.message}</div>
                ${data.instructions ? data.instructions.map(inst => `<div class="sli-instruction">💡 ${inst}</div>`).join('') : ''}
            `;
            return;
        }

        const fields = [];

        // Element info
        fields.push(createField('Tag', data.tag.toUpperCase()));
        
        if (data.id) fields.push(createField('ID', data.id));
        if (data.name) fields.push(createField('Name', data.name));
        if (data.className) fields.push(createField('Class', data.className));
        if (data.text) fields.push(createField('Text', data.text));

        // Locators
        fields.push(createField('CSS Selector', data.css));
        fields.push(createField('XPath', data.xpath));

        // Attributes
        if (data.attributes && Object.keys(data.attributes).length > 0) {
            for (let [key, value] of Object.entries(data.attributes)) {
                fields.push(createField(key, value));
            }
        }

        content.innerHTML = fields.join('');
    }

    // Create a field HTML
    function createField(label, value) {
        const escapedValue = value.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return `
            <div class="sli-field" onclick="window.SLI.copyToClipboard('${escapedValue}')">
                <div class="sli-field-label">${label}</div>
                <div class="sli-field-value">${value}</div>
            </div>
        `;
    }

    // Copy to clipboard with visual feedback
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log(`[SLI] Copied to clipboard: ${text}`);
                showCopyFeedback();
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log(`[SLI] Copied to clipboard: ${text}`);
            showCopyFeedback();
        }
    }

    // Show copy feedback
    function showCopyFeedback() {
        const header = modal.querySelector('.sli-title');
        const originalText = header.textContent;
        header.textContent = '📋 Copied!';
        header.style.color = '#98c379';
        
        setTimeout(() => {
            header.textContent = originalText;
            header.style.color = '';
        }, 1000);
    }

    // Toggle freeze state
    function toggleFreeze() {
        isFrozen = !isFrozen;
        
        if (isFrozen && currentElement) {
            highlightElement(currentElement);
            console.log('[SLI] Element frozen');
        } else {
            console.log('[SLI] Element unfrozen');
        }
    }

    // Toggle inspector on/off
    function toggle() {
        isActive = !isActive;
        
        if (isActive) {
            modal.style.display = 'block';
            console.log('[SLI] Inspector activated');
        } else {
            modal.style.display = 'none';
            highlightBox.style.display = 'none';
            console.log('[SLI] Inspector deactivated');
        }
    }

    // Cleanup function
    function cleanup() {
        // Remove existing elements
        const existingModal = document.getElementById(config.modalId);
        const existingHighlight = document.getElementById(config.highlightId);
        const existingStyles = document.getElementById('sli-styles');
        
        if (existingModal) existingModal.remove();
        if (existingHighlight) existingHighlight.remove();
        if (existingStyles) existingStyles.remove();
    }

    // Expose public API
    window.SLI = {
        toggle,
        toggleFreeze,
        copyToClipboard,
        cleanup,
        isActive: () => isActive,
        isFrozen: () => isFrozen
    };

    // Initialize the inspector
    window.SmartLocatorInspector = {
        init,
        toggle,
        cleanup,
        isActive: () => isActive
    };

    // Auto-initialize
    init();

})();