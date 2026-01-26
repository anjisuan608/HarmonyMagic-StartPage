/*
 * HarmonyMagic StartPage
 * Copyright (C) 2026 anjisuan608 <anjisuan608@petalmail.com> and contributors
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// 控制台输出
console.log(`
\x1b[32m
Harmony Magic Start Page
欢迎来到和谐魔法起始页!
\x1b[0m
© 2026 anjisuan608
Licensed under GPLv3
`);

// 全局变量
let quickAccessData = [];
let searchEngineData = null;
let searchEngines = {};
let searchEngineSettings = {
    activeEngines: [1, 2, 3, 4, 5, 6, 7],
    disabledPresets: [],
    disabledCustoms: []
};
let searchEngineSettingsWorking = null; // 设置面板的内存副本

// 记录预设搜索引擎数量
let presetEngineCount = 0;

// 搜索按钮SVG图标（硬编码在JS中）
const searchButtonSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// 主应用
document.addEventListener('DOMContentLoaded', async function() {
    const searchIcon = document.querySelector('.search-icon');
    const timeDate = document.querySelector('.time-date');
    const searchBox = document.querySelector('.search-box');
    const contextMenu = document.getElementById('context-menu');
    const searchBoxesContainer = document.querySelector('.search-boxes-container');
    const menuItemsContainer = document.querySelector('.menu-items');
    const settings = document.getElementById('settings');

    // Cookie工具函数
    function setCookie(name, value, days = 365) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + ';expires=' + expires.toUTCString() + ';path=/';
    }

    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(decodeURIComponent(c.substring(nameEQ.length)));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    // 获取原始cookie字符串值（不解码）
    function getCookieRaw(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }

    // localStorage工具函数（用于替代cookie存储自定义快捷访问）
    function getLocalStorageItem(key) {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            }
            return null;
        } catch (e) {
            console.error('读取localStorage失败:', e);
            return null;
        }
    }

    function setLocalStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('写入localStorage失败:', e);
        }
    }

    function removeLocalStorageItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('删除localStorage失败:', e);
        }
    }

    // ==================== 全局设置（global-settings） ====================
    // 默认设置值
    const defaultGlobalSettings = {
        backgroundBlur: true,      // 背景模糊（默认开启）
        backgroundFilter: true     // 背景滤镜（默认开启）
    };

    // 加载全局设置
    function loadGlobalSettings() {
        const cookieValue = getCookieRaw('global-settings') || '';
        let settings = { ...defaultGlobalSettings };
        
        if (cookieValue) {
            try {
                const decoded = decodeURIComponent(cookieValue);
                const parsed = JSON.parse(decoded);
                settings = { ...settings, ...parsed };
            } catch (e) {
                console.error('解析全局设置失败:', e);
            }
        }
        
        return settings;
    }

    // 保存全局设置
    function saveGlobalSettings(settings) {
        const encodedValue = encodeURIComponent(JSON.stringify(settings));
        document.cookie = `global-settings=${encodedValue};path=/;expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}`;
    }

    // 应用全局设置
    function applyGlobalSettings() {
        const settings = loadGlobalSettings();
        
        // 应用背景模糊设置
        setBackgroundBlurEnabled(settings.backgroundBlur);
        
        // 应用背景滤镜设置
        setBackgroundFilterEnabled(settings.backgroundFilter);
        
        // 更新设置面板中的开关状态
        updateSettingsPanelStates();
    }

    // 控制背景模糊功能是否启用
    function setBackgroundBlurEnabled(enabled) {
        const bgBlurOverlay = document.querySelector('.bg-blur-overlay');
        const allInputs = document.querySelectorAll('input[type="text"]');
        
        if (enabled) {
            // 启用背景模糊
            if (bgBlurOverlay) {
                bgBlurOverlay.style.backdropFilter = 'blur(8px)';
                bgBlurOverlay.style.webkitBackdropFilter = 'blur(8px)';
            }
            // 恢复输入框的焦点监听
            allInputs.forEach(input => {
                input.addEventListener('focus', inputBlurHandler);
                input.addEventListener('blur', inputBlurHandler);
            });
        } else {
            // 禁用背景模糊 - 移除blur效果
            if (bgBlurOverlay) {
                bgBlurOverlay.style.backdropFilter = 'none';
                bgBlurOverlay.style.webkitBackdropFilter = 'none';
            }
            // 确保模糊层不显示
            if (bgBlurOverlay) {
                bgBlurOverlay.classList.remove('active');
            }
            // 移除输入框的焦点监听
            allInputs.forEach(input => {
                input.removeEventListener('focus', inputBlurHandler);
                input.removeEventListener('blur', inputBlurHandler);
            });
        }
    }

    // 控制背景滤镜（暗角效果）是否启用
    function setBackgroundFilterEnabled(enabled) {
        if (enabled) {
            // 启用背景滤镜 - 恢复暗角效果
            document.body.removeAttribute('data-filter-disabled');
        } else {
            // 禁用背景滤镜 - 清除暗角滤镜
            document.body.setAttribute('data-filter-disabled', 'true');
        }
    }

    // 更新设置面板中的开关状态显示
    function updateSettingsPanelStates() {
        const settings = loadGlobalSettings();
        
        // 更新背景模糊开关
        const blurSetting = document.querySelector('[data-setting="auto-wallpaper"]');
        if (blurSetting) {
            const indicator = blurSetting.querySelector('.status-indicator');
            const icon = blurSetting.querySelector('.status-icon');
            if (indicator && icon) {
                if (settings.backgroundBlur) {
                    indicator.classList.add('enabled');
                    icon.innerHTML = svgOn;
                } else {
                    indicator.classList.remove('enabled');
                    icon.innerHTML = svgOff;
                }
            }
        }
        
        // 更新背景滤镜开关
        const filterSetting = document.querySelector('[data-setting="dark-mode"]');
        if (filterSetting) {
            const indicator = filterSetting.querySelector('.status-indicator');
            const icon = filterSetting.querySelector('.status-icon');
            if (indicator && icon) {
                if (settings.backgroundFilter) {
                    indicator.classList.add('enabled');
                    icon.innerHTML = svgOn;
                } else {
                    indicator.classList.remove('enabled');
                    icon.innerHTML = svgOff;
                }
            }
        }
    }

    // 处理背景模糊开关的点击事件
    function handleBackgroundBlurToggle(enabled) {
        const settings = loadGlobalSettings();
        settings.backgroundBlur = enabled;
        saveGlobalSettings(settings);
        setBackgroundBlurEnabled(enabled);
    }

    // 处理背景滤镜开关的点击事件
    function handleBackgroundFilterToggle(enabled) {
        const settings = loadGlobalSettings();
        settings.backgroundFilter = enabled;
        saveGlobalSettings(settings);
        setBackgroundFilterEnabled(enabled);
    }

    // 输入框焦点事件处理器（用于背景模糊）
    const inputBlurHandler = function(e) {
        if (e.type === 'focus') {
            const settings = loadGlobalSettings();
            if (settings.backgroundBlur) {
                setBackgroundBlur(true);
            }
        } else if (e.type === 'blur') {
            const addShortcutPanel = document.getElementById('add-shortcut-panel');
            // 如果添加面板是激活状态，不关闭背景模糊
            if (addShortcutPanel && addShortcutPanel.classList.contains('active')) {
                return;
            }

            setTimeout(() => {
                const settings = loadGlobalSettings();
                if (settings.backgroundBlur) {
                    const hasFocusedInput = Array.from(document.querySelectorAll('input[type="text"]')).some(inp =>
                        inp === document.activeElement || inp.contains(document.activeElement)
                    );
                    // 如果有焦点输入框，或者快捷访问菜单是打开的，不关闭背景模糊
                    if (hasFocusedInput || (contextMenu && contextMenu.classList.contains('active'))) {
                        return;
                    }
                    setBackgroundBlur(false);
                }
            }, 100);
        }
    };

    // 默认图标SVG
    const defaultIconSVG = '<svg t="1768974157218" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8714" width="32" height="32"><path d="M512.704787 1022.681895c-6.566636 0-12.885487-0.746767-19.370211-0.997965l223.522968-358.091907c32.011327-42.692008 51.675057-95.154106 51.675057-152.604663 0-88.961536-45.561669-167.195974-114.530461-213.091436l322.88327 0c29.969663 65.017888 47.096842 137.184673 47.096842 213.424546C1023.98157 793.752715 795.095394 1022.681895 512.704787 1022.681895zM512.205805 256.491303c-134.523205 0-243.604451 102.347371-254.246906 233.876682L96.997133 214.338551C189.740287 84.72121 341.184526 0 512.704787 0c189.230383 0 354.100731 103.095504 442.520963 255.992321C955.22575 255.992321 302.108946 256.491303 512.205805 256.491303zM511.416716 298.145073c118.142111 0 213.88189 95.36503 213.88189 213.051163 0 117.68545-95.739779 213.093484-213.88189 213.093484-118.103885 0-213.882572-95.408034-213.882572-213.093484C297.534144 393.510103 393.312831 298.145073 511.416716 298.145073zM269.683279 590.222492c33.504179 102.303002 128.784566 176.716231 242.522526 176.716231 38.828478 0 75.283547-9.269059 108.292157-24.733419L448.229568 1018.192418c-251.87691-31.759447-446.887571-246.346465-446.887571-506.872631 0-94.739084 26.233779-183.159316 71.129911-259.235365L269.683279 590.222492z" fill="#515151" p-id="8715"></path></svg>';

    // 读取快捷访问数据并动态生成菜单
    async function loadQuickAccessMenu() {
        try {
            const response = await fetch('quick-access.json');
            if (!response.ok) {
                throw new Error('Failed to load quick-access.json');
            }
            quickAccessData = await response.json();

            // 按 id 排序
            quickAccessData.sort((a, b) => a.id - b.id);

            // 系统图标的HTML模板（硬编码）
            const addIconHTML = `<div class="menu-item" data-action="add">
                <div class="menu-icon-wrapper">
                    <div class="menu-item-bg"></div>
                    <div class="menu-icon"><svg t="1768967144636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9794" width="32" height="32"><path d="M831.6 639.6h-63.9v127.9H639.9v63.9h127.8v127.9h63.9V831.4h127.9v-63.9H831.6z" p-id="9795" fill="#2c2c2c"></path><path d="M564.3 925.2c0-18.5-15-33.6-33.6-33.6H287.3c-86.2 0-156.4-70.2-156.4-156.4V286.9c0-86.2 70.1-156.4 156.4-156.4h448.4c86.2 0 156.4 70.2 156.4 156.4v238.8c0 18.5 15 33.6 33.6 33.6s33.6-15 33.6-33.6V286.9C959.2 163.6 859 63.3 735.7 63.3H287.3C164 63.3 63.7 163.6 63.7 286.8v448.3c0 123.2 100.3 223.5 223.6 223.5h243.4c18.6 0.1 33.6-14.9 33.6-33.4z" p-id="9796" fill="#2c2c2c"></path></svg></div>
                </div>
                <div class="menu-text">添加</div>
            </div>`;

            const editIconHTML = `<!-- 系统图标：编辑（始终显示在最后） -->
            <div class="menu-item" data-action="edit">
                <div class="menu-icon-wrapper">
                    <div class="menu-item-bg"></div>
                    <div class="menu-icon"><svg t="1768898892387" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4731" width="32" height="32"><path d="M474.58679343 587.16868738c-11.45302241 0-22.90604486-4.37057868-31.6472022-13.11173601-17.48231469-17.48231469-17.48231469-45.83841849 0-63.29440437l487.24053555-487.24053552c17.48231469-17.48231469 45.81208967-17.48231469 63.29440431 0 17.48231469 17.48231469 17.48231469 45.83841849 0 63.29440441L506.23399561 574.05695137a44.61676276 44.61676276 0 0 1-31.64720218 13.11173601z" fill="#2c2c2c" p-id="4732"></path><path d="M904.16728498 1017.19676833h-781.96497912c-62.68884228 0-113.68770304-50.99886074-113.68770305-113.71403181v-781.96497913c0-62.71517108 50.99886074-113.71403182 113.66137425-113.71403185l457.51533479 0.0263288c24.72273117 0 44.75893818 20.03620706 44.75893819 44.7589382s-20.03620706 44.75893818-44.75893819 44.7589382l-457.51533479-0.02632877c-13.2960375 0-24.14349786 10.84746035-24.14349785 24.16982661v781.96497915c0 13.32236631 10.84746035 24.1698266 24.16982665 24.16982664h781.96497912c13.32236631 0 24.1698266-10.84746035 24.16982668-24.16982664V403.42008173c0-24.72273117 20.06253583-44.75893818 44.75893815-44.75893828 24.72273117 0 44.75893818 20.03620706 44.7589382 44.75893828V903.50906532c0 62.68884228-50.99886074 113.68770304-113.68770303 113.68770301z" fill="#2c2c2c" p-id="4733"></path></svg></div>
                </div>
                <div class="menu-text">编辑</div>
            </div>`;

            // 清空现有菜单项
            menuItemsContainer.innerHTML = '';

            // 读取隐藏的预设列表
            const hiddenPresets = getLocalStorageItem('hidden_presets') || [];

            // 读取保存的快捷访问顺序（混合预设和自定义）
            const savedVisibleOrder = getLocalStorageItem('shortcut_visible_order') || [];

            // 创建预设映射
            const presetMap = {};
            quickAccessData.forEach(item => {
                presetMap[item.id] = item;
            });

            // 创建自定义映射
            const customShortcuts = getLocalStorageItem('custom_shortcuts') || [];
            const customMap = {};
            customShortcuts.forEach(item => {
                customMap[item.id] = item;
            });

            // 按保存的顺序渲染显示中的项目（预设 + 自定义混合）
            const renderedPresetIds = new Set();
            const renderedCustomIds = new Set();

            savedVisibleOrder.forEach(id => {
                if (id.startsWith('preset_')) {
                    const presetId = parseInt(id.replace('preset_', ''));
                    if (presetMap[presetId] && !hiddenPresets.includes(presetId)) {
                        const item = presetMap[presetId];
                        const menuItem = document.createElement('div');
                        menuItem.className = 'menu-item preset-item';
                        menuItem.setAttribute('data-url', item.url);
                        menuItem.setAttribute('data-preset-id', presetId);
                        menuItem.innerHTML = `
                            <div class="menu-icon-wrapper">
                                <div class="menu-item-bg"></div>
                                <div class="menu-icon">${item.icon}</div>
                            </div>
                            <div class="menu-text" title="${item.title}">${item.title}</div>
                        `;
                        menuItemsContainer.appendChild(menuItem);
                        renderedPresetIds.add(presetId);
                    }
                } else if (id.startsWith('custom_')) {
                    const customId = parseInt(id.replace('custom_', ''));
                    if (customMap[customId]) {
                        const item = customMap[customId];
                        const menuItem = document.createElement('div');
                        menuItem.className = 'menu-item custom-item';
                        menuItem.setAttribute('data-url', item.url);
                        menuItem.setAttribute('data-custom-id', customId);
                        menuItem.setAttribute('data-position', item.position ?? '');

                        let iconContent;
                        if (item.icon && item.icon.trim()) {
                            const escapedIcon = encodeURI(item.icon.trim());
                            iconContent = '<img src="' + escapedIcon + '" class="favicon-img" width="32" height="32" onerror="this.classList.add(\'favicon-error\')">';
                        } else {
                            iconContent = defaultIconSVG;
                        }

                        menuItem.innerHTML = `
                            <div class="menu-icon-wrapper">
                                <div class="menu-item-bg"></div>
                                <div class="menu-icon">${iconContent}</div>
                            </div>
                            <div class="menu-text" title="${item.title}">${item.title}</div>
                        `;
                        menuItemsContainer.appendChild(menuItem);
                        renderedCustomIds.add(customId);
                    }
                }
            });

            // 添加未保存顺序的预设（新增的）
            quickAccessData.forEach(item => {
                if (!renderedPresetIds.has(item.id) && !hiddenPresets.includes(item.id)) {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item preset-item';
                    menuItem.setAttribute('data-url', item.url);
                    menuItem.setAttribute('data-preset-id', item.id);
                    menuItem.innerHTML = `
                        <div class="menu-icon-wrapper">
                            <div class="menu-item-bg"></div>
                            <div class="menu-icon">${item.icon}</div>
                        </div>
                        <div class="menu-text" title="${item.title}">${item.title}</div>
                    `;
                    menuItemsContainer.appendChild(menuItem);
                }
            });

            // 添加未保存顺序的自定义快捷方式
            customShortcuts.forEach(item => {
                if (!renderedCustomIds.has(item.id)) {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item custom-item';
                    menuItem.setAttribute('data-url', item.url);
                    menuItem.setAttribute('data-custom-id', item.id);
                    menuItem.setAttribute('data-position', item.position ?? '');

                    let iconContent;
                    if (item.icon && item.icon.trim()) {
                        const escapedIcon = encodeURI(item.icon.trim());
                        iconContent = '<img src="' + escapedIcon + '" class="favicon-img" width="32" height="32" onerror="this.classList.add(\'favicon-error\')">';
                    } else {
                        iconContent = defaultIconSVG;
                    }

                    menuItem.innerHTML = `
                        <div class="menu-icon-wrapper">
                            <div class="menu-item-bg"></div>
                            <div class="menu-icon">${iconContent}</div>
                        </div>
                        <div class="menu-text" title="${item.title}">${item.title}</div>
                    `;
                    menuItemsContainer.appendChild(menuItem);
                }
            });

            // 恢复"添加"和"编辑"按钮
            menuItemsContainer.insertAdjacentHTML('beforeend', addIconHTML);
            menuItemsContainer.insertAdjacentHTML('beforeend', editIconHTML);

        } catch (error) {
            console.error('Error loading quick access data:', error);
        }
    }

    // 事件委托 - 在容器上统一处理点击事件（只绑定一次）
    function setupMenuItemDelegation() {
        menuItemsContainer.addEventListener('click', function(e) {
            const menuItem = e.target.closest('.menu-item');
            if (!menuItem) return;
            
            e.preventDefault();
            e.stopPropagation();

            // 处理"添加"按钮
            if (menuItem.dataset.action === 'add') {
                openAddShortcutPanel();
                return;
            }

            // 处理"编辑"按钮
            if (menuItem.dataset.action === 'edit') {
                openEditShortcutPanel();
                return;
            }

            // 获取URL并跳转
            const url = menuItem.dataset.url;
            if (url && url !== '#') {
                window.open(url, '_blank');
            }

            // 点击后关闭菜单
            contextMenu.classList.remove('active');
            document.documentElement.style.removeProperty('--search-box-top');
            setBackgroundBlur(false);
            // 直接恢复搜索框显示（确保立即生效，添加 !important）
            const searchBoxForClose = document.querySelector('.search-boxes-container');
            if (searchBoxForClose) {
                searchBoxForClose.style.setProperty('opacity', '1', 'important');
                searchBoxForClose.style.setProperty('visibility', 'visible', 'important');
            }
            if (settings) settings.style.display = 'none';
            // 恢复通知位置
            const notices = document.getElementById('notices');
            if (notices) notices.style.top = '20px';
        });
    }

    // 初始化快捷访问菜单
    await loadQuickAccessMenu();
    
    // 设置事件委托（只绑定一次）
    setupMenuItemDelegation();

    // 加载搜索引擎数据
    async function loadSearchEngines() {
        try {
            const response = await fetch('search-engine.json');
            if (!response.ok) {
                throw new Error('Failed to load search-engine.json');
            }
            const data = await response.json();
            
            // 如果是重置，先清空现有数据
            if (!searchEngineData) {
                searchEngineData = { engines: [] };
                searchEngines = {};
            }
            
            // 重新填充预设引擎
            searchEngineData.engines = data.engines.slice();
            // 记录预设引擎数量（用于区分预设和自定义）
            presetEngineCount = data.engines.length;
            
            // 创建引擎ID到引擎信息的映射
            data.engines.forEach(engine => {
                searchEngines[engine.id] = engine;
            });
            
            // 从localStorage加载自定义搜索引擎
            loadCustomSearchEngines();
            
            // 从localStorage加载搜索引擎设置
            loadSearchEngineSettings();
            
            // 渲染搜索引擎图标和搜索按钮
            renderSearchEngineIcons();
        } catch (error) {
            console.error('Error loading search engine data:', error);
        }
    }

    // 渲染搜索引擎图标和搜索按钮（根据activeEngines动态渲染）
    function renderSearchEngineIcons() {
        const searchBoxes = document.querySelectorAll('.search-box-circle');
        const activeEngines = searchEngineSettings.activeEngines || [];
        
        searchBoxes.forEach((box, index) => {
            // 根据activeEngines顺序获取对应的引擎ID
            const engineId = activeEngines[index];
            const contentDiv = box.querySelector('.search-circle-content');
            const nameEl = box.querySelector('.search-engine-name');
            const btn = box.querySelector('.circle-search-btn');
            
            if (engineId && searchEngines[engineId]) {
                const engine = searchEngines[engineId];
                
                // 更新data-engine-id
                box.setAttribute('data-engine-id', engineId);
                
                // 渲染图标
                if (contentDiv && engine.icon) {
                    contentDiv.innerHTML = engine.icon;
                }
                
                // 渲染引擎名称
                if (nameEl) {
                    nameEl.textContent = engine.title;
                }
                
                // 渲染搜索按钮（使用JS中定义的SVG）
                if (btn && searchButtonSvg) {
                    btn.innerHTML = searchButtonSvg;
                }
            }
        });
    }

    // 根据引擎ID获取搜索URL
    function getSearchUrl(engineId, query) {
        if (!engineId || !searchEngines[engineId]) {
            return '';
        }
        const engine = searchEngines[engineId];
        if (!engine.url) return '';
        
        if (query) {
            // 同时支持 %s 和 {query} 两种占位符格式
            let url = engine.url.replace('%s', encodeURIComponent(query));
            url = url.replace('{query}', encodeURIComponent(query));
            return url;
        } else {
            // 如果没有查询，返回基础URL
            let url = engine.url.split('%s')[0];
            url = url.split('{query}')[0];
            return url;
        }
    }

    // 等待搜索引擎数据加载完成后渲染
    await loadSearchEngines();

// 获取所有圆形搜索框
    const circleSearchBoxes = document.querySelectorAll('.search-box-circle');
    const centerSearchBox = document.querySelector('.center-0');

    // 所有搜索框按DOM顺序排列
    const allSearchBoxes = [
        ...Array.from(circleSearchBoxes)
    ];

    // 获取背景模糊层
    const bgBlurOverlay = document.querySelector('.bg-blur-overlay');

    // 控制背景模糊
    function setBackgroundBlur(blur) {
        const settings = loadGlobalSettings();
        // 如果背景模糊全局禁用，不执行任何操作
        if (!settings.backgroundBlur) return;
        
        if (bgBlurOverlay) {
            if (blur) {
                bgBlurOverlay.classList.add('active');
            } else {
                bgBlurOverlay.classList.remove('active');
            }
        }
    }

    // 设置所有输入框的焦点监听
    function setupInputFocusListeners() {
        const allInputs = document.querySelectorAll('input[type="text"]');
        const settings = loadGlobalSettings();

        // 只在背景模糊启用时添加监听
        if (settings.backgroundBlur) {
            allInputs.forEach(input => {
                input.addEventListener('focus', inputBlurHandler);
                input.addEventListener('blur', inputBlurHandler);
            });
        }
    }

    // 初始化输入框焦点监听
    setupInputFocusListeners();

    // 设置默认搜索引擎为必应（用于中心搜索框和作为后备）
    let currentEngine = 'bing';

    // 当前展开的搜索框
    let currentExpandedBox = null;

    // 上一次处于输入展开状态的搜索框
    let lastInputActiveBox = document.querySelector('.center-0');

    // 当前处于未输入展开状态的搜索框
    let currentUninputExpandedBox = document.querySelector('.center-0');

    // 检查是否为移动端
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // 检查是否为平板端
    function isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    // 检测并处理遮挡逻辑：时间日期被搜索框遮挡时隐藏
    function handleOcclusion() {
        const timeDisplay = document.querySelector('.time-display');
        const dateDisplay = document.querySelector('.date-display');
        const searchBoxEl = document.querySelector('.search-box');

        if (!timeDisplay || !dateDisplay || !searchBoxEl) return;

        const timeRect = timeDisplay.getBoundingClientRect();
        const dateRect = dateDisplay.getBoundingClientRect();
        const searchRect = searchBoxEl.getBoundingClientRect();

        // 检测日期是否被搜索框遮挡
        const dateHidden = dateRect.bottom > searchRect.top;
        // 检测时间是否被搜索框遮挡
        const timeHidden = timeRect.bottom > searchRect.top;

        if (dateHidden) {
            dateDisplay.style.visibility = 'hidden';
            dateDisplay.style.position = 'absolute';
        } else {
            dateDisplay.style.visibility = '';
            dateDisplay.style.position = '';
        }

        if (timeHidden) {
            timeDisplay.style.visibility = 'hidden';
            timeDisplay.style.position = 'absolute';
        } else {
            timeDisplay.style.visibility = '';
            timeDisplay.style.position = '';
        }
    }

    // 恢复被隐藏的日期和时间
    function restoreDateTime() {
        const timeDisplay = document.querySelector('.time-display');
        const dateDisplay = document.querySelector('.date-display');

        if (timeDisplay) {
            timeDisplay.style.visibility = '';
            timeDisplay.style.position = '';
        }
        if (dateDisplay) {
            dateDisplay.style.visibility = '';
            dateDisplay.style.position = '';
        }
    }

    // 移动端：设置容器位置
    function setMobileContainerPosition() {
        if (isMobile()) {
            // 手机端：需要自适应输入法
            const viewportHeight = window.innerHeight;
            const timeDisplay = document.querySelector('.time-display');
            const dateDisplay = document.querySelector('.date-display');
            const searchBoxesContainer = document.querySelector('.search-boxes-container');

            const timeHeight = timeDisplay.offsetHeight + (dateDisplay ? dateDisplay.offsetHeight : 0);
            const searchHeight = searchBoxesContainer.offsetHeight;

            // 检查是否有输入法键盘弹出
            const isKeyboardOpen = viewportHeight < window.visualViewport?.height || window.innerHeight < screen.height * 0.6;

            if (isKeyboardOpen) {
                // 输入法弹出时，将时间日期上移到顶端
                timeDate.style.position = 'absolute';
                timeDate.style.top = '20px';
                timeDate.style.left = '50%';
                timeDate.style.transform = 'translateX(-50%)';
                timeDate.style.marginBottom = '0';

                searchBox.style.position = 'absolute';
                searchBox.style.top = `${timeHeight + 40}px`;
                searchBox.style.left = '50%';
                searchBox.style.transform = 'translateX(-50%)';

                // 检测遮挡并处理
                setTimeout(() => handleOcclusion(), 100);
            } else {
                // 正常状态，居中显示
                timeDate.style.position = 'relative';
                timeDate.style.top = '';
                timeDate.style.left = '';
                timeDate.style.transform = '';
                timeDate.style.marginBottom = '40px';

                searchBox.style.position = 'relative';
                searchBox.style.top = '';
                searchBox.style.left = '';
                searchBox.style.transform = '';

                // 恢复日期和时间显示
                restoreDateTime();
            }
        } else if (isTablet()) {
            // 平板端：使用更大的布局，不使用绝对定位（输入法情况除外）
            const viewportHeight = window.innerHeight;
            const isKeyboardOpen = viewportHeight < (window.visualViewport?.height || Infinity) || 
                                    viewportHeight < window.screen.height * 0.5;

            if (isKeyboardOpen) {
                // 输入法弹出时上移
                timeDate.style.position = 'absolute';
                timeDate.style.top = '30px';
                timeDate.style.left = '50%';
                timeDate.style.transform = 'translateX(-50%)';
                timeDate.style.marginBottom = '0';

                searchBox.style.position = 'absolute';
                searchBox.style.top = '';
                searchBox.style.bottom = '';
                searchBox.style.left = '50%';
                searchBox.style.transform = 'translateX(-50%)';

                // 检测遮挡并处理
                setTimeout(() => handleOcclusion(), 100);
            } else {
                // 正常状态
                timeDate.style.position = 'relative';
                timeDate.style.top = '';
                timeDate.style.left = '';
                timeDate.style.transform = '';
                timeDate.style.marginBottom = '60px';

                searchBox.style.position = 'relative';
                searchBox.style.top = '';
                searchBox.style.left = '';
                searchBox.style.transform = '';

                // 恢复日期和时间显示
                restoreDateTime();
            }
        } else {
            // 桌面端和大屏平板：使用输入法自适应
            setDesktopInputMethodPosition();
        }
    }

    // 监听输入框焦点事件，处理输入法弹出
    function setupInputMethodHandlers() {
        const allInputs = document.querySelectorAll('input[type="text"]');

        allInputs.forEach(input => {
            // 输入框聚焦时（输入法弹出）
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    if (isMobile()) {
                        setMobileContainerPosition();
                    } else {
                        setDesktopInputMethodPosition();
                    }
                }, 300);
            });

            // 输入框失焦时（输入法收起）
            input.addEventListener('blur', function() {
                setTimeout(() => {
                    if (isMobile()) {
                        setMobileContainerPosition();
                    } else {
                        // 桌面端直接还原页面位置
                        resetPagePosition();
                    }
                }, 100);
            });
        });
    }

    // 监听视口变化（输入法弹出/收起）
    function setupViewportHandler() {
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                if (isMobile()) {
                    setMobileContainerPosition();
                } else {
                    setDesktopInputMethodPosition();
                }
            });
        }

        // 备用方案：监听window resize
        window.addEventListener('resize', function() {
            if (isMobile()) {
                setMobileContainerPosition();
            } else {
                setDesktopInputMethodPosition();
            }
        });
    }

    // 移动端：设置布局类
    function setMobileLayout(expandedBox) {
        if (!isMobile()) return;

        // 移除所有布局类
        searchBoxesContainer.classList.remove('left-expanded', 'center-expanded', 'right-expanded');

        if (!expandedBox) return;

        // 根据展开的搜索框设置布局类
        if (expandedBox.classList.contains('left-circle')) {
            searchBoxesContainer.classList.add('left-expanded');
        } else if (expandedBox.classList.contains('center-0')) {
            searchBoxesContainer.classList.add('center-expanded');
        } else if (expandedBox.classList.contains('right-circle')) {
            searchBoxesContainer.classList.add('right-expanded');
        }
    }

    // 移动端：设置搜索框宽度
    function setMobileSearchWidth() {
        if (!isMobile()) return;

        // 获取实际视口宽度，减去40px（左右各20px边距）
        const viewportWidth = window.innerWidth;
        const searchWidth = Math.min(viewportWidth - 40, 350);

        // 设置CSS变量
        document.documentElement.style.setProperty('--mobile-search-width', `${searchWidth}px`);
    }

    // 桌面端和大屏平板：输入法抬升页面
    function setDesktopInputMethodPosition() {
        // 仅在非手机端执行
        if (isMobile()) return;

        const viewportHeight = window.innerHeight;
        const visualViewportHeight = window.visualViewport?.height || viewportHeight;

        // 检测输入法是否弹出的更准确方法
        // 当输入法弹出时，innerHeight 会小于 visualViewport.height（某些浏览器）
        // 或者 innerHeight 会明显小于屏幕高度的一半
        const isKeyboardOpen = viewportHeight < visualViewportHeight * 0.9 || 
                                viewportHeight < window.screen.height * 0.5;

        if (isKeyboardOpen) {
            // 输入法弹出时，将时间日期上移到顶端
            timeDate.style.position = 'absolute';
            timeDate.style.top = '30px';
            timeDate.style.left = '50%';
            timeDate.style.transform = 'translateX(-50%)';
            timeDate.style.marginBottom = '0';

            // 搜索框跟随移动
            searchBox.style.position = 'absolute';
            searchBox.style.top = '';
            searchBox.style.bottom = '';
            searchBox.style.left = '50%';
            searchBox.style.transform = 'translateX(-50%)';

            // 检测遮挡并处理
            setTimeout(() => handleOcclusion(), 100);
        } else {
            // 正常状态，恢复默认样式
            timeDate.style.position = '';
            timeDate.style.top = '';
            timeDate.style.left = '';
            timeDate.style.transform = '';
            timeDate.style.marginBottom = '';

            searchBox.style.position = '';
            searchBox.style.top = '';
            searchBox.style.bottom = '';
            searchBox.style.left = '';
            searchBox.style.transform = '';

            // 恢复日期和时间显示
            restoreDateTime();
        }
    }

    // 强制还原页面位置到默认状态
    function resetPagePosition() {
        timeDate.style.position = '';
        timeDate.style.top = '';
        timeDate.style.left = '';
        timeDate.style.transform = '';
        timeDate.style.marginBottom = '';

        searchBox.style.position = '';
        searchBox.style.top = '';
        searchBox.style.bottom = '';
        searchBox.style.left = '';
        searchBox.style.transform = '';

        // 恢复日期和时间显示
        restoreDateTime();
    }

    // 窗口大小变化时处理
    window.addEventListener('resize', function() {
        if (isMobile()) {
            // 移动端自适应位置
            setMobileContainerPosition();
            // 重新计算搜索框宽度
            setMobileSearchWidth();
        } else {
            // 桌面端和大屏平板：恢复布局类并设置输入法位置
            searchBoxesContainer.classList.remove('left-expanded', 'center-expanded', 'right-expanded');
            setDesktopInputMethodPosition();
        }
    });
    
    // 圆形搜索框点击展开逻辑
    circleSearchBoxes.forEach(box => {
        const circleInput = box.querySelector('.circle-search-input');
        const circleBtn = box.querySelector('.circle-search-btn');

        // 点击圆形搜索框展开
        box.addEventListener('click', function(e) {
            // 桌面端使用快速切换逻辑
            if (!isMobile()) {
                // 如果是同一个搜索框，直接聚焦
                if (currentExpandedBox === box || currentUninputExpandedBox === box) {
                    circleInput.focus();
                    return;
                }
                // 快速切换到新搜索框
                switchToBoxDesktop(box);
                return;
            }

            // 移动端逻辑保持原样
            // 如果当前已经有展开的搜索框且不是当前点击的，则先关闭它
            if (currentExpandedBox && currentExpandedBox !== box) {
                collapseSearchBox(currentExpandedBox);
                currentExpandedBox = null;
                currentUninputExpandedBox = null;
                setMobileLayout(null);
            }

            // 如果当前有未输入展开状态的搜索框且不是当前点击的，则先关闭它
            if (currentUninputExpandedBox && currentUninputExpandedBox !== box) {
                if (currentUninputExpandedBox.classList.contains('expanded')) {
                    collapseSearchBox(currentUninputExpandedBox);
                }
                currentUninputExpandedBox = null;
            }

            // 切换当前搜索框的展开状态
            if (box.classList.contains('expanded')) {
                // 如果已经有内容，则聚焦到输入框
                if (circleInput.value.trim() !== '') {
                    box.classList.add('input-active');
                    currentExpandedBox = box;
                    currentUninputExpandedBox = box;
                    circleInput.focus(); // 聚焦到输入框，继续输入
                } else {
                    // 如果输入框为空且处于展开状态，保持展开状态不变
                    // 不收缩搜索框，让用户可以继续输入
                    // 只聚焦到输入框
                    circleInput.focus();
                }
            } else {
                // 检查中间搜索框是否展开，如果是则收缩它
                const centerBox = document.querySelector('.center-0');
                if (centerBox.classList.contains('expanded') && centerBox !== box) {
                    collapseSearchBox(centerBox);
                    currentUninputExpandedBox = null;
                    setMobileLayout(null);
                }

                // 展开当前搜索框
                expandSearchBox(box);
                currentExpandedBox = box;
                currentUninputExpandedBox = box;

                // 移动端设置3排布局
                setMobileLayout(box);
            }
        });
        
        // 圆形搜索框输入框聚焦事件
        circleInput.addEventListener('focus', function() {
            // 重新触发动画
            const nameEl = box.querySelector('.search-engine-name');
            if (nameEl) {
                nameEl.style.animation = 'none';
                nameEl.offsetHeight; // 触发重绘
                nameEl.style.animation = '';
            }
            
            // 桌面端使用快速切换逻辑
            if (!isMobile()) {
                // 如果搜索框未展开，快速展开并切换
                if (!box.classList.contains('expanded')) {
                    switchToBoxDesktop(box);
                } else {
                    // 已展开则确保状态正确
                    box.classList.add('input-active');
                    currentExpandedBox = box;
                    currentUninputExpandedBox = box;
                }
                return;
            }

            // 移动端逻辑保持原样
            // 确保当前搜索框处于正确的展开状态和布局中
            if (!box.classList.contains('expanded')) {
                // 如果点击的是输入框且搜索框未展开，则展开它
                if (currentExpandedBox && currentExpandedBox !== box) {
                    collapseSearchBox(currentExpandedBox);
                    currentExpandedBox = null;
                    currentUninputExpandedBox = null;
                    setMobileLayout(null);
                }

                // 检查中间搜索框是否展开，如果是则收缩它
                const centerBox = document.querySelector('.center-0');
                if (centerBox.classList.contains('expanded') && centerBox !== box) {
                    collapseSearchBox(centerBox);
                    currentUninputExpandedBox = null;
                    setMobileLayout(null);
                }

                expandSearchBox(box);
                currentExpandedBox = box;
                currentUninputExpandedBox = box;

                // 移动端设置3排布局
                setMobileLayout(box);
            } else {
                // 如果已经展开，确保移动端布局正确设置
                if (isMobile()) {
                    setMobileLayout(box);
                }
                // 确保状态正确
                currentUninputExpandedBox = box;
                currentExpandedBox = box;
            }

            // 添加输入状态样式
            box.classList.add('input-active');
        });
        
        // 圆形搜索框输入事件
        circleInput.addEventListener('input', function() {
            if (circleInput.value.trim() !== '') {
                box.classList.add('input-active');
            } else {
                // 只有当焦点不在输入框上时，才移除 input-active 状态
                if (document.activeElement !== circleInput) {
                    box.classList.remove('input-active');
                }
            }
        });
        
        // 圆形搜索框输入框失焦事件
        circleInput.addEventListener('blur', function(e) {
            // 记录当前失焦的输入框和相关的按钮
            const blurInput = this;
            const relatedBtn = circleBtn;
            
            setTimeout(() => {
                // 如果当前焦点在同一个搜索框的按钮上，保持状态不变
                if (relatedBtn && (document.activeElement === relatedBtn || relatedBtn.contains(document.activeElement))) {
                    return;
                }
                
                // 如果焦点在同一个输入框上，保持状态不变
                if (document.activeElement === blurInput) {
                    return;
                }
                
                // 如果当前展开的搜索框还是同一个，不重置
                if (currentExpandedBox === box || currentUninputExpandedBox === box) {
                    // 只移除input-active样式，保持expanded状态
                    box.classList.remove('input-active');
                    currentExpandedBox = null;
                    // currentUninputExpandedBox 保持不变，保留展开状态
                }
            }, 150);
        });
        
        // 圆形搜索框按钮点击事件
        circleBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            // 桌面端使用独立方法
            if (!isMobile()) {
                if (!box.classList.contains('expanded')) {
                    expandSearchBoxDesktop(box);
                } else {
                    box.classList.add('input-active');
                    currentExpandedBox = box;
                    currentUninputExpandedBox = box;
                }
            } else {
                // 移动端保持原有逻辑
                // 确保当前搜索框保持展开状态
                if (!box.classList.contains('expanded')) {
                    expandSearchBox(box);
                }
                // 确保状态正确
                box.classList.add('input-active');
                currentExpandedBox = box;
                currentUninputExpandedBox = box;
            }

            // 聚焦到输入框
            const input = box.querySelector('.circle-search-input');
            input.focus();

            // 执行搜索逻辑
            const query = input.value.trim();
            const engineId = box.getAttribute('data-engine-id');
            const searchUrl = getSearchUrl(engineId, query);

            // 搜索后清空输入框，但保持展开状态
            input.value = '';
            box.classList.remove('input-active');

            // 打开搜索页面
            if (searchUrl) {
                window.open(searchUrl, '_blank');
            }
        });
        
        // 圆形搜索框输入框回车事件
        circleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performCircleSearch(box);
            }
        });
    });
    
    // 展开圆形搜索框
    function expandSearchBox(box) {
        box.classList.add('expanded');
        // 移动端直接进入输入展开状态
        if (isMobile()) {
            box.classList.add('input-active');
            // 设置搜索框宽度
            setMobileSearchWidth();
        }
        currentUninputExpandedBox = box;
        // 移动端重新计算位置
        setMobileContainerPosition();
        // 聚焦到输入框并启用背景模糊
        const input = box.querySelector('.circle-search-input');
        setTimeout(() => {
            input.focus();
            setBackgroundBlur(true);
        }, 300);
    }
    
    // 收缩圆形搜索框（保留输入文字）
    function collapseSearchBox(box) {
        box.classList.remove('expanded', 'input-active');
        if (currentUninputExpandedBox === box) {
            currentUninputExpandedBox = null;
        }
        // 移动端重新计算位置
        setMobileContainerPosition();
        // 移除背景模糊
        setBackgroundBlur(false);
        // 不再清空输入框，保留用户输入的文字
    }

    // 桌面端：展开圆形搜索框（不调用移动端位置计算）
    function expandSearchBoxDesktop(box) {
        box.classList.add('expanded');
        box.classList.add('input-active');
        currentUninputExpandedBox = box;
        currentExpandedBox = box;
        // 聚焦到输入框并启用背景模糊
        const input = box.querySelector('.circle-search-input');
        setTimeout(() => {
            input.focus();
            setBackgroundBlur(true);
        }, 100);
    }

    // 桌面端：收缩圆形搜索框（不调用移动端位置计算）
    function collapseSearchBoxDesktop(box) {
        box.classList.remove('expanded', 'input-active');
        if (currentUninputExpandedBox === box) {
            currentUninputExpandedBox = null;
        }
        if (currentExpandedBox === box) {
            currentExpandedBox = null;
        }
        // 移除背景模糊
        setBackgroundBlur(false);
    }

    // 桌面端：快速切换到新的搜索框（直接展开新框，不等待旧框收缩）
    function switchToBoxDesktop(newBox) {
        // 先直接关闭之前展开的搜索框（不等待动画）
        if (currentExpandedBox && currentExpandedBox !== newBox) {
            collapseSearchBoxDesktop(currentExpandedBox);
        }
        if (currentUninputExpandedBox && currentUninputExpandedBox !== newBox) {
            collapseSearchBoxDesktop(currentUninputExpandedBox);
        }
        // 直接展开新搜索框
        expandSearchBoxDesktop(newBox);
    }

    // 执行圆形搜索框的搜索
    function performCircleSearch(box) {
        const input = box.querySelector('.circle-search-input');
        const query = input.value.trim();
        const engineId = box.getAttribute('data-engine-id');
        
        const searchUrl = getSearchUrl(engineId, query);

        if (searchUrl) {
            window.open(searchUrl, '_blank');
        }

        // 搜索发起后清空输入框内容
        input.value = '';
        box.classList.remove('input-active');
    }
    
    // 展开中间搜索框
    function expandCenterSearchBox() {
        centerSearchBox.classList.add('expanded');
        // 移动端重新计算位置
        setMobileContainerPosition();
        // 聚焦到输入框
        setTimeout(() => {
            centerSearchBox.querySelector('.circle-search-input').focus();
        }, 300);
    }

    // 收缩中间搜索框
    function collapseCenterSearchBox() {
        collapseSearchBox(centerSearchBox);
    }
    
    
    
    // 时间日期模块点击事件 - 打开快捷访问菜单
    const timeDisplay = document.querySelector('.time-display');
    const dateDisplay = document.querySelector('.date-display');

    function openContextMenu(e) {
        e.stopPropagation();

        const searchBoxContainer = document.querySelector('.search-boxes-container');
        searchBoxContainer.style.opacity = '0';
        searchBoxContainer.style.visibility = 'hidden';

        // 获取搜索框容器位置
        const searchBoxRect = searchBoxContainer.getBoundingClientRect();

        // 设置菜单项的margin-top与搜索框顶端对齐
        document.documentElement.style.setProperty('--search-box-top', `${searchBoxRect.top}px`);

        // contextMenu覆盖整个页面，menu-items通过margin-top向下偏移
        contextMenu.classList.add('active');
        setBackgroundBlur(true); // 启用背景模糊
        if (settings) {
            settings.style.display = 'block';
            // 调整通知位置，避让settings
            const notices = document.getElementById('notices');
            if (notices && window.innerWidth > 768) {
                const settingsHeight = settings.offsetHeight;
                notices.style.top = (20 + settingsHeight + 10) + 'px'; // 20px + settings高度 + 10px间距
            }
        }
    }

    // timeDate 点击打开/关闭快捷访问
    timeDate.addEventListener('click', function(e) {
        if (contextMenu.classList.contains('active')) {
            // 如果菜单已打开，关闭它
            contextMenu.classList.remove('active');
            document.documentElement.style.removeProperty('--search-box-top');
            setBackgroundBlur(false); // 移除背景模糊
            const searchBox = document.querySelector('.search-boxes-container');
            searchBox.style.opacity = '1';
            searchBox.style.visibility = 'visible';
            if (settings) settings.style.display = 'none';
            // 恢复通知位置
            const notices = document.getElementById('notices');
            if (notices) notices.style.top = '20px';
        } else {
            // 如果菜单未打开，打开它
            openContextMenu(e);
        }
    });

    // 添加时钟功能
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
        
        // 获取年月日
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        // 获取星期
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];
        
        // 计算周数
        const weekNumber = getWeekNumber(now);
        
        // 格式化日期字符串
        const dateString = `${year}年${month}月${day}日 ${weekday} 第${weekNumber}周`;
        
        document.getElementById('time').textContent = timeString;
        document.getElementById('date').textContent = dateString;
    }
    
    // 初始化时钟并设置更新
    updateClock();
    setInterval(updateClock, 1000);
    
    // 计算当前是第几周
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    // 右键菜单功能 - 快捷访问
    
    // 显示右键菜单（快捷访问）- 在搜索框区域显示
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // 隐藏搜索框部分，但保留时间日期
        const searchBox = document.querySelector('.search-boxes-container');
        searchBox.style.opacity = '0';
        searchBox.style.visibility = 'hidden';
        
        // 获取搜索框容器位置
        const searchBoxRect = searchBox.getBoundingClientRect();
        
        // 设置菜单项的margin-top与搜索框顶端对齐
        document.documentElement.style.setProperty('--search-box-top', `${searchBoxRect.top}px`);
        
        // 显示菜单
        contextMenu.classList.add('active');
        setBackgroundBlur(true); // 启用背景模糊
        
        if (settings) {
            settings.style.display = 'block';
            // 调整通知位置，避让settings
            const notices = document.getElementById('notices');
            if (notices && window.innerWidth > 768) {
                const settingsHeight = settings.offsetHeight;
                notices.style.top = (20 + settingsHeight + 10) + 'px';
            }
        }
    });
    
    // 点击快捷访问面板外空白区域关闭菜单
    document.addEventListener('click', function(e) {
        if (contextMenu.classList.contains('active') && 
            !e.target.closest('.menu-items') &&
            !e.target.closest('.settings-modal') &&
            !e.target.closest('.settings-button') &&
            !e.target.closest('.settings-dropdown') &&
            !e.target.closest('#settings-close') &&
            !e.target.closest('#add-shortcut-panel') &&
            !e.target.closest('#search-engine-panel') &&
            !e.target.closest('#add-search-engine-panel') &&
            !e.target.closest('.search-engine-move-up') &&
            !e.target.closest('.search-engine-move-down') &&
            !e.target.closest('.search-engine-disable') &&
            !e.target.closest('.search-engine-enable') &&
            !e.target.closest('.search-engine-delete') &&
            !e.target.closest('.confirm-dialog') &&
            !e.target.closest('.confirm-dialog-overlay') &&
            !e.target.closest('#notices')) {
            // 检查搜索引擎面板是否有未保存的更改
            if (searchEnginePanel && searchEnginePanel.classList.contains('active')) {
                const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
                const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings);
                if (hasChanges) {
                    openConfirmDialog('discard-search-engine-changes');
                    return; // 不执行关闭操作，等待用户确认
                }
            }
            contextMenu.classList.remove('active');
            document.documentElement.style.removeProperty('--search-box-top');
            setBackgroundBlur(false); // 移除背景模糊
            // 重新显示搜索框
            const searchBox = document.querySelector('.search-boxes-container');
            searchBox.style.opacity = '1';
            searchBox.style.visibility = 'visible';
            if (settings) settings.style.display = 'none';
            closeSettingsDropdown();
            // 恢复通知位置
            const notices = document.getElementById('notices');
            if (notices) notices.style.top = '20px';
        }
    });
    
    // 添加自定义书签功能
    function addBookmark(name, url, icon = '🌐') {
        const customBookmarks = JSON.parse(localStorage.getItem('customBookmarks')) || [];
        customBookmarks.push({ name, url, icon });
        localStorage.setItem('customBookmarks', JSON.stringify(customBookmarks));
    }
    
    // 在菜单中添加自定义书签
    function updateContextMenu() {
        const menuItemsContainer = document.querySelector('.menu-items');
        const customBookmarks = JSON.parse(localStorage.getItem('customBookmarks')) || [];
        
        // 清空自定义书签（保留固定的）
        const fixedItems = Array.from(menuItemsContainer.children); // 获取所有现有项目，包括我们新添加的
        menuItemsContainer.innerHTML = '';
        
        // 添加固定书签
        fixedItems.forEach(item => {
            menuItemsContainer.appendChild(item.cloneNode(true));
        });
        
        // 添加自定义书签
        customBookmarks.forEach(bookmark => {
            const customItem = document.createElement('div');
            customItem.className = 'menu-item';
            customItem.setAttribute('data-url', bookmark.url);
            customItem.innerHTML = `
                <div class="menu-item-area">
                    <div class="menu-icon-wrapper">
                        <div class="menu-item-bg"></div>
                    </div>
                    <div class="menu-text">${bookmark.name}</div>
                </div>
            `;
            
            // 获取点击区域元素
            const menuBg = customItem.querySelector('.menu-item-bg');
            const menuText = customItem.querySelector('.menu-text');
            
            // 点击背景板或文字跳转
            function handleCustomItemClick(e) {
                e.preventDefault();
                e.stopPropagation();
                window.open(bookmark.url, '_blank');
                contextMenu.classList.remove('active');
                document.documentElement.style.removeProperty('--search-box-top');
                setBackgroundBlur(false);
                if (settings) settings.style.display = 'none';
                // 恢复通知位置
                const notices = document.getElementById('notices');
                if (notices) notices.style.top = '20px';
            }
            
            menuBg.addEventListener('click', handleCustomItemClick);
            menuText.addEventListener('click', handleCustomItemClick);
            
            menuItemsContainer.appendChild(customItem);
        });
    }
    
    // 更新菜单以包含自定义书签
    updateContextMenu();

    // 初始化移动端位置和搜索框宽度
    setMobileContainerPosition();
    setMobileSearchWidth();

    // 设置输入法自适应处理
    setupInputMethodHandlers();
    setupViewportHandler();

    // 动态加载壁纸
    function loadWallpaper() {
        const wallpaperUrl = 'https://www.bing.com/th?id=OHR.BubblesAbraham_ZH-CN7203734882_1920x1080.jpg';
        const img = new Image();

        img.onload = function() {
            // 使用CSS变量设置背景图片，CSS负责渲染
            document.documentElement.style.setProperty('--wallpaper-url', `url('${wallpaperUrl}')`);
        };

        img.onerror = function() {
            networkTimeoutNotice('壁纸加载失败');
        };

        img.src = wallpaperUrl;
    }
    
    // 启动壁纸加载
    loadWallpaper();

    // 通知呈现器
    const noticesContainer = document.getElementById('notices');

    // 通知等级配置
    const NOTICE_LEVELS = {
        fatal: { color: '#f7a699', duration: 60000 },
        error: { color: '#ffccbb', duration: 50000 },
        warn: { color: '#ffeecc', duration: 40000 },
        info: { color: '#2196F3', duration: 11000 },
        debug: { color: '#eee9e0', duration: 20000 }
    };

    // 移除通知（带淡出动画）
    function removeNotice(notice) {
        notice.classList.add('removing');
        setTimeout(() => {
            notice.remove();
        }, 300);
    }

    // 获取格式化时间
    function getTimeString() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { hour12: false });
    }

    /**
     * 发送通知
     * @param {string} content - 通知内容
     * @param {string} level - 通知等级: fatal, error, warns, info, debug
     * @param {Object} options - 可选配置: customColor(自定义颜色), customDuration(自定义持续时间ms)
     */
    function sendNotice(content, level = 'info', options = {}) {
        const config = NOTICE_LEVELS[level] || NOTICE_LEVELS.info;
        const color = options.customColor || config.color;
        const duration = options.customDuration !== undefined ? options.customDuration : config.duration;

        // 过滤HTML标签用于控制台输出
        const plainText = content.replace(/<[^>]*>/g, '');
        console.log(`[${getTimeString()}][${level.toUpperCase()}]${plainText}`);

        // 创建通知元素
        const notice = document.createElement('div');
        notice.className = 'notice-item';
        notice.style.backgroundColor = color;
        notice.innerHTML = `
            <div class="notice-title">${level.toUpperCase()}</div>
            <div class="notice-content">${content}</div>
        `;

        // 点击移除通知
        notice.addEventListener('click', function() {
            removeNotice(notice);
        });

        // 使用 prepend 让新通知显示在左侧/顶部
        noticesContainer.prepend(notice);

        // 自动移除
        setTimeout(() => {
            if (notice.parentNode) {
                removeNotice(notice);
            }
        }, duration);
    }

    // GPLv3许可证提示
    function gplNotice() {
        sendNotice('检测到按下开发工具热键<br>请遵守<strong>GPLv3</strong>许可协议', 'info', { customDuration: 8000 });
    }

    // 壁纸/网络连接超时通知（error级别）
    function networkTimeoutNotice(message = '网络连接超时') {
        sendNotice(message, 'error');
    }

    // 用户手动停止页面加载通知（warn级别）
    function pageLoadStoppedNotice() {
        sendNotice('页面加载已手动停止', 'warn');
    }

    // JS/CSS资源被阻止加载通知（fatal级别）
    function resourceBlockedNotice(resourceUrl, type) {
        sendNotice(`资源加载被阻止: <em>${resourceUrl}</em> (${type})`, 'fatal');
    }

    // 为资源标签添加onerror检测
    function attachResourceErrorHandler(element) {
        element.onerror = function() {
            const type = element.tagName === 'SCRIPT' ? 'JS' : 'CSS';
            const src = element.src || element.href;
            if (src && !src.includes('chromecookie')) {
                resourceBlockedNotice(src, type);
            }
        };
    }

    // 为已存在的script和link标签添加错误处理
    document.querySelectorAll('script, link[rel="stylesheet"]').forEach(attachResourceErrorHandler);

    // 监听动态添加的script和link标签
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === 'SCRIPT') {
                    attachResourceErrorHandler(node);
                } else if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                    attachResourceErrorHandler(node);
                }
            });
        });
    });

    observer.observe(document.head, { childList: true, subtree: true });

    // 监听页面加载停止事件（用户按ESC或点击停止按钮）
    document.addEventListener('readystatechange', function() {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            // 监听停止加载事件
        }
    });

    // 监听用户停止页面加载（通过performance timing判断）
    window.addEventListener('beforeunload', function(e) {
        // 用户手动停止页面加载时会触发
    });

    // 监听ESC键停止页面加载
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // ESC键通常用于停止页面加载
            setTimeout(() => {
                // 检测页面是否还在加载中
                if (document.readyState === 'loading') {
                    pageLoadStoppedNotice();
                }
            }, 100);
        }
    });

    // 监听F12和Ctrl+Shift+I
    document.addEventListener('keydown', function(e) {
        // F12键
        if (e.key === 'F12') {
            gplNotice();
        }
        // Ctrl+Shift+I 组合键
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            gplNotice();
        }
        // Ctrl+Shift+J 组合键 (Chrome开发者工具另一种打开方式)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            gplNotice();
        }
        // Ctrl+Shift+C 组合键 (Chrome开发者工具Elements面板)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            gplNotice();
        }
    });

    // 暴露通知相关方法到全局，以便其他地方使用
    window.sendNotice = sendNotice;
    window.networkTimeoutNotice = networkTimeoutNotice;
    window.pageLoadStoppedNotice = pageLoadStoppedNotice;
    window.resourceBlockedNotice = resourceBlockedNotice;

    // ==================== 设置菜单功能 ====================
    const settingsButton = document.getElementById('settings-button');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    const settingsModalOverlay = document.querySelector('#settings-modal .settings-modal-overlay');
    const settingItems = document.querySelectorAll('.setting-item');
    const settingsMenuItems = document.querySelectorAll('.settings-menu-item');
    let settingsHoverTimeout = null;

    // 打开设置菜单
    function openSettingsModal() {
        if (settingsModal) {
            settingsModal.classList.add('active');
            setBackgroundBlur(true);
            // 初始化操作项图标
            initActionItems();
        }
    }

    // 关闭设置菜单
    function closeSettingsModal() {
        if (settingsModal) {
            settingsModal.classList.remove('active');
            // 如果快捷访问菜单没有打开，则移除背景模糊
            if (!contextMenu.classList.contains('active')) {
                setBackgroundBlur(false);
            }
        }
    }

    // 切换设置下拉菜单
    function toggleSettingsDropdown() {
        if (settingsDropdown) {
            settingsDropdown.classList.toggle('active');
        }
    }

    // 关闭设置下拉菜单
    function closeSettingsDropdown() {
        if (settingsDropdown) {
            settingsDropdown.classList.remove('active');
        }
    }

    // 点击设置按钮显示下拉菜单
    if (settingsButton) {
        settingsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleSettingsDropdown();
        });

        // 悬停打开下拉菜单（桌面端）
        settingsButton.addEventListener('mouseenter', function() {
            clearTimeout(settingsHoverTimeout);
            if (settingsDropdown && !settingsDropdown.classList.contains('active')) {
                settingsDropdown.classList.add('active');
            }
        });

        settingsButton.addEventListener('mouseleave', function() {
            // 延迟关闭，避免快速移过时闪烁
            settingsHoverTimeout = setTimeout(() => {
                closeSettingsDropdown();
            }, 300);
        });

        // 触摸屏适配：触摸时切换菜单
        settingsButton.addEventListener('touchend', function(e) {
            // 防止触摸时同时触发 mouseenter
            e.preventDefault();
            toggleSettingsDropdown();
        });
    }

    // 下拉菜单本身悬停保持显示
    if (settingsDropdown) {
        settingsDropdown.addEventListener('mouseenter', function() {
            clearTimeout(settingsHoverTimeout);
        });

        settingsDropdown.addEventListener('mouseleave', function() {
            closeSettingsDropdown();
        });
    }

    // 设置菜单项点击事件
    if (settingsMenuItems) {
        settingsMenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.dataset.action;
                closeSettingsDropdown();
                
                if (action === 'general') {
                    // 常规设置 - 打开现有设置面板
                    openSettingsModal();
                } else if (action === 'search-engine') {
                    // 搜索引擎设置 - 打开搜索引擎面板
                    openSearchEnginePanel();
                } else if (action === 'appearance') {
                    // 壁纸设置 - 打开壁纸面板
                    openWallpaperPanel();
                } else if (action === 'about') {
                    // 关于 - 打开关于面板
                    openAboutPanel();
                }
            });
        });
    }

    // 点击关闭按钮关闭菜单
    if (settingsClose) {
        settingsClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeSettingsModal();
        });
    }

    // 点击遮罩层关闭菜单
    if (settingsModalOverlay) {
        settingsModalOverlay.addEventListener('click', function() {
            closeSettingsModal();
        });
    }

    // 获取设置面板内容容器，阻止事件冒泡避免关闭快捷访问菜单
    const settingsModalContent = document.querySelector('.settings-modal-content');
    if (settingsModalContent) {
        settingsModalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // SVG 图标定义
    const svgOff = '<path d="M1536.011446 0H512.011446C229.234257 0 0 229.234257 0 512.011446c0 282.754298 229.234257 511.988554 512.011446 511.988554H1536.011446c282.777189 0 512.011446-229.234257 512.011445-511.988554C2048.022891 229.234257 1818.788635 0 1536.011446 0zM514.460823 921.606867a409.618313 409.618313 0 1 1 409.595422-409.595421A409.595422 409.595422 0 0 1 514.460823 921.606867z" fill="#CCCCCC" p-id="7318"></path>';
    const svgOn = '<path d="M1536.011446 0H512.011446C229.234257 0 0 229.234257 0 512.011446c0 282.754298 229.234257 511.988554 512.011446 511.988554H1536.011446c282.777189 0 512.011446-229.234257 512.011445-511.988554C2048.022891 229.234257 1818.788635 0 1536.011446 0z m0 921.606867a409.618313 409.618313 0 1 1 409.595421-409.595421A409.595422 409.595422 0 0 1 1536.011446 921.606867z" fill="#4CAF50" p-id="7474"></path>';

    // ==================== 初始化全局设置 ====================
    // 在SVG定义后应用全局设置
    applyGlobalSettings();

    // 操作图标（用于需要确认的选项）
    const svgAction = '<svg t="1768966199939" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8663" width="18" height="18"><path d="M892 928.1H134c-19.9 0-36-16.1-36-36v-758c0-19.9 16.1-36 36-36h314.1c19.9 0 36 16.1 36 36s-16.1 36-36 36H170v686h686V579.6c0-19.9 16.1-36 36-36s36 16.1 36 36v312.5c0 19.9-16.1 36-36 36z" fill="#888888" p-id="8664"></path><path d="M927.9 131.6v-0.5c-0.1-1.7-0.4-3.3-0.7-4.9 0-0.1 0-0.2-0.1-0.3-0.4-1.7-0.9-3.3-1.5-4.9v-0.1c-0.6-1.6-1.4-3.1-2.2-4.6 0-0.1-0.1-0.1-0.1-0.2-0.8-1.4-1.7-2.8-2.7-4.1-0.1-0.1-0.2-0.3-0.3-0.4-0.5-0.6-0.9-1.1-1.4-1.7 0-0.1-0.1-0.1-0.1-0.2-0.5-0.6-1-1.1-1.6-1.6l-0.4-0.4c-0.5-0.5-1.1-1-1.6-1.5l-0.1-0.1c-0.6-0.5-1.2-1-1.9-1.4-0.1-0.1-0.3-0.2-0.4-0.3-1.4-1-2.8-1.8-4.3-2.6l-0.1-0.1c-1.6-0.8-3.2-1.5-4.9-2-1.6-0.5-3.3-1-5-1.2-0.1 0-0.2 0-0.3-0.1l-2.4-0.3h-0.3c-0.7-0.1-1.3-0.1-2-0.1H640.1c-19.9 0-36 16.1-36 36s16.1 36 36 36h165L487.6 487.6c-14.1 14.1-14.1 36.9 0 50.9 7 7 16.2 10.5 25.5 10.5 9.2 0 18.4-3.5 25.5-10.5L856 221v162.8c0 19.9 16.1 36 36 36s36-16.1 36-36V134.1c0-0.8 0-1.7-0.1-2.5z" fill="#888888" p-id="8665"></path></svg>';

    // 关闭按钮图标
    const svgClose = '<svg t="1768962858078" class="icon" viewBox="0 0 1070 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5514" width="20" height="20"><path d="M50.368584 96.533526l30.769579 30.77162 82.037931 82.03793 117.900068 117.900068 138.353952 138.353953 143.399585 143.397544 133.036963 133.036963 107.268128 107.268129 66.091042 66.093081 13.582195 13.580155c12.576334 12.576334 33.589257 12.576334 46.165591 0s12.576334-33.589257 0-46.165591l-30.76958-30.769579-82.03793-82.039971-117.900068-117.898028-138.353953-138.353952-143.397544-143.399585-133.036963-133.036963-107.268128-107.268128L110.11433 63.950131l-13.582196-13.580156c-12.576334-12.578374-33.589257-12.578374-46.165591 0-12.576334 12.576334-12.576334 33.587217 0.002041 46.163551z" fill="" p-id="5515"></path><path d="M882.805987 50.369975l-30.76958 30.76958-82.03997 82.03793-117.898028 117.900068-138.353953 138.353953-143.399584 143.399584-133.036963 133.036963-107.268129 107.268129a2018478.867876 2018478.867876 0 0 1-66.093081 66.091041l-13.580156 13.582196c-12.578374 12.576334-12.578374 33.589257 0 46.165591 12.576334 12.576334 33.589257 12.576334 46.165591 0l30.77162-30.76958 82.037931-82.03793 117.900068-117.900068 138.353952-138.353953 143.397545-143.397544 133.036962-133.036963 107.268129-107.268129 66.093081-66.091041 13.580156-13.582196c12.576334-12.576334 12.576334-33.589257 0-46.16559-12.578374-12.580414-33.589257-12.580414-46.165591-0.002041z" fill="" p-id="5516"></path></svg>';

    // 上移下移按钮图标
    const svgArrowUp = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>';
    const svgArrowDown = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>';
    const svgPlus = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    const svgMinus = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>';

    // ==================== 壁纸设置面板功能 ====================
    const wallpaperPanel = document.getElementById('wallpaper-panel');
    const wallpaperClose = document.getElementById('wallpaper-close');
    const wallpaperPanelOverlay = document.querySelector('#wallpaper-panel .settings-modal-overlay');
    const wallpaperPreviewImg = document.getElementById('wallpaper-preview-img');
    const wallpaperTabBtns = document.querySelectorAll('.wallpaper-tab-btn');
    const wallpaperTabContents = document.querySelectorAll('.wallpaper-tab-content');
    const wallpaperLocalFile = document.getElementById('wallpaper-local-file');
    const wallpaperLocalBrowse = document.getElementById('wallpaper-local-browse');
    const wallpaperLocalUrl = document.getElementById('wallpaper-local-url');
    const wallpaperOnlineUrl = document.getElementById('wallpaper-online-url');
    const wallpaperPresetsContainer = document.getElementById('wallpaper-presets-container');

    // 预设壁纸列表（从XML加载）
    let presetWallpapers = {};

    // 从XML加载预设壁纸
    async function loadPresetWallpapersFromXml() {
        try {
            const response = await fetch('wallpaper.xml');
            if (!response.ok) {
                throw new Error('加载壁纸XML失败');
            }
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            const wallpaperElements = xmlDoc.querySelectorAll('wallpaper');
            presetWallpapers = {};
            
            wallpaperElements.forEach(wp => {
                const id = parseInt(wp.getAttribute('id'));
                const url = wp.querySelector('url')?.textContent || '';
                presetWallpapers[id] = url;
            });

            // 渲染预设壁纸项
            renderPresetWallpaperItems(xmlDoc);
            
            // 重新获取元素引用
            window.wallpaperPresetItems = document.querySelectorAll('.wallpaper-preset-item');
        } catch (e) {
            console.error('加载预设壁纸失败:', e);
        }
    }

    // 渲染预设壁纸项
    function renderPresetWallpaperItems(xmlDoc) {
        if (!wallpaperPresetsContainer) return;
        
        wallpaperPresetsContainer.innerHTML = '';
        
        const wallpaperElements = xmlDoc.querySelectorAll('wallpaper');
        wallpaperElements.forEach(wp => {
            const id = wp.getAttribute('id');
            const title = wp.querySelector('title')?.textContent || '';
            const url = wp.querySelector('url')?.textContent || '';
            const comment = wp.querySelector('comment')?.textContent || '';
            
            // 缩略图URL（添加尺寸参数）
            const thumbnailUrl = url + '&width=240&height=135&crop=1';
            
            const item = document.createElement('div');
            item.className = 'wallpaper-preset-item';
            item.dataset.id = id;
            item.title = comment; // 悬停显示 comment
            item.innerHTML = `
                <div class="wallpaper-preset-img" style="background-image: url('${thumbnailUrl}');"></div>
                <div class="wallpaper-preset-name">${title}</div>
                <div class="wallpaper-preset-checkmark">✓</div>
            `;
            wallpaperPresetsContainer.appendChild(item);
        });
    }

    // 打开壁纸面板
    function openWallpaperPanel() {
        if (wallpaperPanel) {
            loadWallpaperSettings();
            loadPresetWallpapersFromXml();
            wallpaperPanel.classList.add('active');
            setBackgroundBlur(true);
        }
    }

    // 关闭壁纸面板
    function closeWallpaperPanel() {
        if (wallpaperPanel) {
            wallpaperPanel.classList.remove('active');
            if (!contextMenu.classList.contains('active')) {
                setBackgroundBlur(false);
            }
            // 关闭时清除自定义预览框背景图
            wallpaperPreviewImg.style.backgroundImage = 'none';
            wallpaperPreviewImg.classList.remove('selected');
        }
    }

    // 加载壁纸设置
    function loadWallpaperSettings() {
        const saved = getLocalStorageItem('wallpaper_settings');
        let settings = { id: 1, customUrl: '', customMode: 'local' };
        
        if (saved) {
            try {
                settings = saved;
            } catch (e) {
                console.error('解析壁纸设置失败:', e);
            }
        }

        // 更新预览图
        updateWallpaperPreview(settings);

        // 更新选中状态
        updateWallpaperSelection(settings.id);

        // 更新自定义选项
        if (settings.customMode === 'local') {
            wallpaperLocalUrl.value = settings.customUrl || '';
            switchTab('local');
        } else {
            wallpaperOnlineUrl.value = settings.customUrl || '';
            switchTab('online');
        }
    }

    // 更新壁纸预览
    function updateWallpaperPreview(settings) {
        if (settings.id === 0 && settings.customUrl) {
            wallpaperPreviewImg.style.backgroundImage = `url('${settings.customUrl}')`;
            wallpaperPreviewImg.classList.add('selected');
        } else {
            wallpaperPreviewImg.style.backgroundImage = 'none';
            wallpaperPreviewImg.classList.remove('selected');
        }
    }

    // 更新壁纸选中状态
    function updateWallpaperSelection(selectedId) {
        const items = window.wallpaperPresetItems || document.querySelectorAll('.wallpaper-preset-item');
        items.forEach(item => {
            const itemId = parseInt(item.dataset.id);
            item.classList.remove('selected');
            if (itemId === selectedId) {
                item.classList.add('selected');
            }
        });
    }

    // ==================== 关于面板功能 ====================
    const aboutPanel = document.getElementById('about-panel');
    const aboutClose = document.getElementById('about-close');
    const aboutPanelOverlay = document.querySelector('#about-panel .settings-modal-overlay');
    const footerCopyright = document.querySelector('.footer-copyright');

    // 初始化关闭按钮图标
    if (aboutClose) {
        aboutClose.innerHTML = svgClose;
    }

    // 打开关于面板
    function openAboutPanel() {
        if (aboutPanel) {
            aboutPanel.classList.add('active');
            setBackgroundBlur(true);
        }
    }

    // 关闭关于面板
    function closeAboutPanel() {
        if (aboutPanel) {
            aboutPanel.classList.remove('active');
            if (!contextMenu.classList.contains('active')) {
                setBackgroundBlur(false);
            }
        }
    }

    // 点击关闭按钮
    if (aboutClose) {
        aboutClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAboutPanel();
        });
    }

    // 点击遮罩层关闭
    if (aboutPanelOverlay) {
        aboutPanelOverlay.addEventListener('click', function() {
            closeAboutPanel();
        });
    }

    // 点击底部版权打开关于面板
    const copyrightText = document.getElementById('copyright-text');
    if (copyrightText) {
        copyrightText.addEventListener('click', function(e) {
            e.stopPropagation();
            openAboutPanel();
        });
    }

    // 切换标签页
    function switchTab(tabName) {
        wallpaperTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        wallpaperTabContents.forEach(content => {
            content.classList.toggle('active', content.id === `wallpaper-tab-${tabName}`);
        });
    }

    // 保存壁纸设置
    function saveWallpaperSettings(id, customUrl, customMode) {
        const settings = { id, customUrl, customMode };
        setLocalStorageItem('wallpaper_settings', settings);
        
        // 应用壁纸
        applyWallpaper(settings);
    }

    // 应用壁纸
    function applyWallpaper(settings) {
        let wallpaperUrl = '';
        
        if (settings.id === 0) {
            // 自定义壁纸
            wallpaperUrl = settings.customUrl;
        } else if (presetWallpapers[settings.id]) {
            // 预设壁纸 - 直接获取URL并保存
            wallpaperUrl = presetWallpapers[settings.id];
        } else {
            // 预设壁纸但URL未加载（异步问题），尝试使用已保存的URL
            const savedUrl = getLocalStorageItem('wallpaper_url');
            if (savedUrl) {
                wallpaperUrl = savedUrl;
            } else {
                // 默认使用 id 1
                wallpaperUrl = presetWallpapers[1];
            }
        }

        if (wallpaperUrl) {
            document.body.style.setProperty('--wallpaper-url', `url('${wallpaperUrl}')`);
            setLocalStorageItem('wallpaper_url', wallpaperUrl);
        }
    }

    // 点击关闭按钮
    if (wallpaperClose) {
        wallpaperClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeWallpaperPanel();
        });
    }

    // 重置壁纸按钮
    const wallpaperReset = document.getElementById('wallpaper-reset');
    if (wallpaperReset) {
        wallpaperReset.addEventListener('click', function(e) {
            e.stopPropagation();
            openConfirmDialog('reset-wallpaper');
        });
    }

    // 点击遮罩层关闭
    if (wallpaperPanelOverlay) {
        wallpaperPanelOverlay.addEventListener('click', function() {
            closeWallpaperPanel();
        });
    }

    // 标签页切换
    wallpaperTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // 浏览按钮点击
    if (wallpaperLocalBrowse) {
        wallpaperLocalBrowse.addEventListener('click', function() {
            wallpaperLocalFile.click();
        });
    }

    // 本地文件选择
    if (wallpaperLocalFile) {
        wallpaperLocalFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const fileUrl = URL.createObjectURL(file);
                wallpaperLocalUrl.value = fileUrl;
                wallpaperPreviewImg.style.backgroundImage = `url('${fileUrl}')`;
                wallpaperPreviewImg.classList.add('selected');
                saveWallpaperSettings(0, fileUrl, 'local');
            }
        });
    }

    // 在线URL输入
    if (wallpaperOnlineUrl) {
        let timeout;
        wallpaperOnlineUrl.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const url = this.value.trim();
                if (url) {
                    wallpaperPreviewImg.style.backgroundImage = `url('${url}')`;
                    wallpaperPreviewImg.classList.add('selected');
                    saveWallpaperSettings(0, url, 'online');
                }
            }, 500);
        });
    }

    // 自定义缩略图点击 - 切换到自定义模式
    if (wallpaperPreviewImg) {
        wallpaperPreviewImg.addEventListener('click', function() {
            // 取消预设的选择
            const items = window.wallpaperPresetItems || document.querySelectorAll('.wallpaper-preset-item');
            items.forEach(i => i.classList.remove('selected'));
            
            // 选中自定义预览并恢复背景图
            this.classList.add('selected');
            
            // 获取当前自定义URL
            const isLocalTab = document.querySelector('.wallpaper-tab-btn[data-tab="local"]').classList.contains('active');
            const customUrl = isLocalTab ? wallpaperLocalUrl.value : wallpaperOnlineUrl.value;
            const customMode = isLocalTab ? 'local' : 'online';
            
            if (customUrl) {
                this.style.backgroundImage = `url('${customUrl}')`;
                saveWallpaperSettings(0, customUrl, customMode);
            }
        });
    }

    // 预设壁纸点击（使用事件委托）
    if (wallpaperPresetsContainer) {
        wallpaperPresetsContainer.addEventListener('click', function(e) {
            const item = e.target.closest('.wallpaper-preset-item');
            if (!item) return;
            
            const id = parseInt(item.dataset.id);
            
            // 取消之前的选择
            const items = window.wallpaperPresetItems || document.querySelectorAll('.wallpaper-preset-item');
            items.forEach(i => i.classList.remove('selected'));
            
            // 选中当前
            item.classList.add('selected');
            
            // 取消自定义预览选中状态，但不清除背景图
            wallpaperPreviewImg.classList.remove('selected');
            
            // 保存设置
            saveWallpaperSettings(id, '', 'local');
        });
    }

    // 初始化关闭按钮图标
    const confirmDialogClose = document.getElementById('confirm-dialog-close');
    if (confirmDialogClose) {
        confirmDialogClose.innerHTML = svgClose;
    }

    // 确认对话框相关元素
    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmDialogTitle = document.getElementById('confirm-dialog-title');
    const confirmDialogMessage = document.getElementById('confirm-dialog-message');
    const confirmDialogOk = document.getElementById('confirm-dialog-ok');
    const confirmDialogCancel = document.getElementById('confirm-dialog-cancel');
    const confirmDialogOverlay = document.querySelector('.confirm-dialog-overlay');

    // 确认操作映射表
    const confirmActions = {
        'reset-wallpaper': {
            title: '重置壁纸',
            message: '确定要重置为默认壁纸吗？',
            onOk: function() {
                // 清除壁纸设置localStorage
                removeLocalStorageItem('wallpaper_settings');
                // 清除壁纸URL localStorage
                removeLocalStorageItem('wallpaper_url');
                // 重置壁纸URL样式
                document.body.style.setProperty('--wallpaper-url', 'none');
                // 清除自定义壁纸缓存
                localStorage.removeItem('custom_wallpaper');
                // 清除自定义壁纸URL缓存
                localStorage.removeItem('custom_wallpaper_url');
                // 应用默认壁纸
                const defaultSettings = { id: 1, customUrl: '', customMode: 'cover' };
                applyWallpaper(defaultSettings);
                // 刷新壁纸设置面板显示
                loadWallpaperSettings();
                sendNotice('壁纸已重置为默认', 'info');
            }
        },
        'clear-site-data': {
            title: '清空网站数据',
            message: '确定要清除所有Cookie和本地存储数据吗？此操作不可撤销，页面将立即刷新。',
            onOk: function() {
                // 清除所有localStorage数据
                localStorage.clear();
                // 清除所有cookie
                document.cookie.split(";").forEach(function(c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                // 刷新页面
                location.reload();
            }
        },
        'reset-shortcuts': {
            title: '重置快捷访问',
            message: '确定要重置快捷访问吗？这将删除所有自定义快捷方式。',
            onOk: function() {
                // 清除localStorage中的自定义快捷访问数据
                removeLocalStorageItem('custom_shortcuts');
                // 清空隐藏预设记录和顺序
                removeLocalStorageItem('hidden_presets');
                removeLocalStorageItem('shortcut_visible_order');
                // 重新加载菜单（保持context-menu打开，搜索框保持隐藏）
                loadQuickAccessMenu();
                // 重新渲染编辑面板列表
                loadAllShortcuts();
                renderEditShortcutList();
                sendNotice('快捷访问已重置', 'info');
            }
        },
        'discard-changes': {
            title: '放弃更改',
            message: '有未保存的更改，确定要放弃吗？',
            onOk: function() {
                // 恢复所有被编辑过的快捷方式数据
                restoreAllEditedShortcuts();
                // 重置更改状态
                editShortcutHasChanges = false;
                // 关闭面板
                closeEditShortcutPanel();
            }
        },
        'hidden-preset-warn-apply': {
            title: '隐藏预设快捷访问',
            message: '已隐藏预设快捷访问，这些预设将在保存后被隐藏。确定要继续吗？',
            onOk: function() {
                // 继续保存（应用）
                saveShortcutOrder();
                editShortcutHasChanges = false;
                editShortcutOriginalVisibleOrder = editShortcutVisibleItems.map(item => item.id);
                editShortcutOriginalHiddenOrder = editShortcutHiddenItems.map(item => item.id);
                loadQuickAccessMenu();
                sendNotice('设置已应用', 'info');
            }
        },
        'hidden-preset-warn-ok': {
            title: '隐藏预设快捷访问',
            message: '已隐藏预设快捷访问，这些预设将在保存后被隐藏。确定要继续吗？',
            onOk: function() {
                // 继续保存（确定）
                saveShortcutOrder();
                loadQuickAccessMenu();
                closeEditShortcutPanel();
                sendNotice('设置已保存', 'info');
            }
        },
        'delete-custom-shortcut': {
            title: '删除快捷访问',
            message: '确定要删除该快捷访问吗？',
            onOk: function() {
                const category = confirmDialog.dataset.category;
                const index = parseInt(confirmDialog.dataset.targetIndex);
                const items = category === 'visible' ? editShortcutVisibleItems : editShortcutHiddenItems;
                items.splice(index, 1);
                editShortcutHasChanges = true;
                renderEditShortcutList();
            }
        },
        'reset-search-engines': {
            title: '重置搜索引擎',
            message: '确定要重置所有搜索引擎设置吗？这将删除所有自定义搜索引擎和排序设置。',
            onOk: function() {
                localStorage.removeItem('search_engine_settings');
                localStorage.removeItem('custom_search_engines');
                // 重置搜索引擎数据并刷新显示
                searchEngineData = null;
                searchEngines = {};
                searchEngineSettings = null;
                searchEngineSettingsWorking = null;
                refreshSearchEngines();
                // 同时刷新主页搜索框
                loadSearchEngines();
                sendNotice('搜索引擎已重置', 'info');
            }
        },
        'restore-search-engines': {
            title: '还原搜索引擎排序',
            message: '确定要恢复默认排序吗？这将把所有预设引擎恢复为默认顺序，自定义搜索引擎将被移至未使用列表。',
            onOk: function() {
                localStorage.removeItem('search_engine_settings');
                // 刷新搜索引擎显示
                searchEngineSettings = null;
                searchEngineSettingsWorking = null;
                refreshSearchEngines();
                // 同时刷新主页搜索框
                loadSearchEngines();
                sendNotice('搜索引擎排序已还原', 'info');
            }
        },
        'discard-search-engine-changes': {
            title: '放弃更改',
            message: '有未保存的更改，确定要放弃吗？',
            onOk: function() {
                searchEngineSettingsWorking = null;
                searchEngineSettingsHasInnerChanges = false; // 重置内层编辑标志
                closeSearchEnginePanel();
            }
        },
        'discard-add-search-engine': {
            title: '放弃添加',
            message: '确定要放弃添加搜索引擎吗？输入的内容将不会保存。',
            onOk: function() {
                clearAddSearchEngineInputs();
                closeAddSearchEnginePanel();
            }
        },
        'discard-add-shortcut': {
            title: '放弃添加',
            message: '确定要放弃添加快捷访问吗？输入的内容将不会保存。',
            onOk: function() {
                clearAddShortcutInputs();
                closeAddShortcutPanel();
            }
        }
    };

    // 刷新搜索引擎数据和显示
    async function refreshSearchEngines() {
        // 如果搜索引擎设置面板已打开，使用 loadSearchEnginesForSettings
        if (searchEnginePanel && searchEnginePanel.classList.contains('active')) {
            await loadSearchEnginesForSettings();
            // 重新渲染设置面板列表
            renderSearchEngineLists();
        } else {
            // 否则重新加载搜索引擎数据并刷新主页显示
            await loadSearchEngines();
        }
    }

    // 打开确认对话框
    function openConfirmDialog(actionId) {
        const action = confirmActions[actionId];
        if (!action) return;

        if (confirmDialogTitle) confirmDialogTitle.textContent = action.title;
        if (confirmDialogMessage) confirmDialogMessage.textContent = action.message;
        
        // 存储当前操作
        confirmDialog.dataset.currentAction = actionId;
        
        if (confirmDialog) {
            confirmDialog.classList.add('active');
            setBackgroundBlur(true);
        }
    }

    // 关闭确认对话框
    function closeConfirmDialog() {
        if (confirmDialog) {
            confirmDialog.classList.remove('active');
            // 如果设置面板没有打开，则移除背景模糊
            if (!settingsModal || !settingsModal.classList.contains('active')) {
                setBackgroundBlur(false);
            }
        }
    }

    // 点击确认按钮
    if (confirmDialogOk) {
        confirmDialogOk.addEventListener('click', function(e) {
            e.stopPropagation();
            const actionId = confirmDialog.dataset.currentAction;
            const action = confirmActions[actionId];
            if (action && action.onOk) {
                action.onOk();
            }
            closeConfirmDialog();
        });
    }

    // 点击取消按钮
    if (confirmDialogCancel) {
        confirmDialogCancel.addEventListener('click', function(e) {
            e.stopPropagation();
            closeConfirmDialog();
        });
    }

    // 点击关闭按钮
    if (confirmDialogClose) {
        confirmDialogClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeConfirmDialog();
        });
    }

    // 点击遮罩层关闭
    if (confirmDialogOverlay) {
        confirmDialogOverlay.addEventListener('click', function() {
            closeConfirmDialog();
        });
    }

    // 统一的ESC键关闭处理器（优先级从高到低）
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;

        // 1. 确认对话框 - 最高优先级
        if (confirmDialog && confirmDialog.classList.contains('active')) {
            closeConfirmDialog();
            return;
        }

        // 2. 添加搜索引擎面板
        if (addSearchEnginePanel && addSearchEnginePanel.classList.contains('active')) {
            closeAddSearchEnginePanel();
            return;
        }

        // 3. 添加快捷方式面板
        if (addShortcutPanel && addShortcutPanel.classList.contains('active')) {
            closeAddShortcutPanel();
            return;
        }

        // 4. 壁纸面板
        if (wallpaperPanel && wallpaperPanel.classList.contains('active')) {
            closeWallpaperPanel();
            return;
        }

        // 5. 编辑搜索引擎面板（在搜索引擎面板之前处理）
        if (editSearchEnginePanel && editSearchEnginePanel.classList.contains('active')) {
            closeEditSearchEnginePanel();
            return;
        }

        // 6. 编辑快捷访问项目面板（在快捷访问编辑面板之前处理）
        if (editShortcutItemPanel && editShortcutItemPanel.classList.contains('active')) {
            closeEditShortcutItemPanel();
            return;
        }

        // 7. 搜索引擎面板
        if (searchEnginePanel && searchEnginePanel.classList.contains('active')) {
            const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
            // 检查是否有实际更改（包括内层编辑面板的更改）
            const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
            if (hasChanges) {
                openConfirmDialog('discard-search-engine-changes');
            } else {
                searchEngineSettingsWorking = null;
                closeSearchEnginePanel();
            }
            return;
        }

        // 8. 快捷访问编辑面板
        if (editShortcutPanel && editShortcutPanel.classList.contains('active')) {
            if (editShortcutHasChanges) {
                openConfirmDialog('discard-changes');
            } else {
                closeEditShortcutPanel();
            }
            return;
        }

        // 9. 常规设置面板
        if (settingsModal && settingsModal.classList.contains('active')) {
            closeSettingsModal();
            return;
        }

        // 10. 关于面板 - 最低优先级
        if (aboutPanel && aboutPanel.classList.contains('active')) {
            closeAboutPanel();
        }
    });

    // ==================== 搜索引擎设置面板 ====================
    
    // 搜索引擎设置面板元素
    const searchEnginePanel = document.getElementById('search-engine-panel');
    const searchEngineClose = document.getElementById('search-engine-close');
    const searchEngineAdd = document.getElementById('search-engine-add');
    const searchEngineReset = document.getElementById('search-engine-reset');
    const searchEngineRestore = document.getElementById('search-engine-restore');
    const searchEngineCancel = document.getElementById('search-engine-cancel');
    const searchEngineApply = document.getElementById('search-engine-apply');
    const searchEngineOk = document.getElementById('search-engine-ok');
    const searchEngineActiveList = document.getElementById('search-engine-active-list');
    const searchEnginePresetList = document.getElementById('search-engine-preset-list');
    const searchEngineCustomList = document.getElementById('search-engine-custom-list');
    
    // 添加搜索引擎面板元素
    const addSearchEnginePanel = document.getElementById('add-search-engine-panel');
    const addSearchEngineClose = document.getElementById('add-search-engine-close');
    const addSearchEngineName = document.getElementById('add-search-engine-name');
    const addSearchEngineUrl = document.getElementById('add-search-engine-url');
    const addSearchEngineUrlError = document.getElementById('add-search-engine-url-error');
    const addSearchEngineCancel = document.getElementById('add-search-engine-cancel');
    const addSearchEngineSave = document.getElementById('add-search-engine-save');

    // 初始化分类折叠功能（使用事件委托）
    initSearchEngineCategoryCollapse();

    // 搜索引擎设置

    // 初始化关闭按钮图标
    if (searchEngineClose) {
        searchEngineClose.innerHTML = svgClose;
    }
    if (addSearchEngineClose) {
        addSearchEngineClose.innerHTML = svgClose;
    }

    // 加载搜索引擎数据（用于设置面板）
    async function loadSearchEnginesForSettings() {
        try {
            const response = await fetch('search-engine.json');
            if (!response.ok) throw new Error('Failed to load search-engine.json');
            const data = await response.json();
            
            // 如果是重置，先清空现有数据
            if (!searchEngineData) {
                searchEngineData = { engines: [] };
                searchEngines = {};
            }
            
            // 重新填充预设引擎
            searchEngineData.engines = data.engines.slice();
            // 记录预设引擎数量（用于区分预设和自定义）
            presetEngineCount = data.engines.length;
            
            // 构建搜索引擎映射
            data.engines.forEach(engine => {
                searchEngines[engine.id] = engine;
            });
            
            // 从localStorage加载自定义搜索引擎（确保设置面板能看到自定义引擎）
            loadCustomSearchEngines();
            
            // 从localStorage加载设置
            loadSearchEngineSettings();
        } catch (e) {
            console.error('加载搜索引擎数据失败:', e);
        }
    }

    // 从localStorage加载自定义搜索引擎
    function loadCustomSearchEngines() {
        try {
            const saved = localStorage.getItem('custom_search_engines');
            if (saved) {
                const customEngines = JSON.parse(saved);
                customEngines.forEach(engine => {
                    searchEngineData.engines.push(engine);
                    searchEngines[engine.id] = engine;
                });
            }
        } catch (e) {
            console.error('加载自定义搜索引擎失败:', e);
        }
    }

    // 保存自定义搜索引擎到localStorage
    function saveCustomSearchEngines() {
        try {
            // 只保存非预设引擎（用户添加的自定义引擎）
            const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
            const customEngines = searchEngineData.engines.filter(e => !presetIds.includes(e.id));
            localStorage.setItem('custom_search_engines', JSON.stringify(customEngines));
        } catch (e) {
            console.error('保存自定义搜索引擎失败:', e);
        }
    }

    // 从localStorage加载搜索引擎设置
    function loadSearchEngineSettings() {
        try {
            const saved = localStorage.getItem('search_engine_settings');
            if (saved) {
                searchEngineSettings = JSON.parse(saved);
            } else {
                // 默认设置：前7个预设引擎激活，多余的预设引擎放入未使用预设列表，自定义引擎放入未使用自定义列表
                const presetEngines = searchEngineData.engines.slice(0, presetEngineCount);
                const customEngines = searchEngineData.engines.slice(presetEngineCount);
                
                // 前7个预设引擎放入使用中，超出的预设引擎放入未使用预设
                const activePresets = presetEngines.slice(0, 7).map(e => e.id);
                const disabledPresets = presetEngines.slice(7).map(e => e.id);
                
                searchEngineSettings = {
                    activeEngines: activePresets,
                    disabledPresets: disabledPresets,
                    disabledCustoms: customEngines.map(e => e.id)
                };
            }
        } catch (e) {
            console.error('加载搜索引擎设置失败:', e);
        }
    }

    // 保存搜索引擎设置到localStorage
    function saveSearchEngineSettings() {
        localStorage.setItem('search_engine_settings', JSON.stringify(searchEngineSettings));
    }

    // 打开搜索引擎设置面板
    function openSearchEnginePanel() {
        if (searchEnginePanel) {
            // 先重置所有分类的折叠状态
            const categories = document.querySelectorAll('.search-engine-category');
            categories.forEach(cat => {
                cat.classList.remove('collapsed');
            });
            // 清空错误提示
            const countError = document.getElementById('search-engine-count-error');
            if (countError) countError.textContent = '';
            // 创建设置的内存副本，用于暂存用户操作
            searchEngineSettingsWorking = JSON.parse(JSON.stringify(searchEngineSettings));
            renderSearchEngineLists();
            initSearchEngineCategoryCollapse();
            searchEnginePanel.classList.add('active');
        }
    }

    // 关闭搜索引擎设置面板
    function closeSearchEnginePanel() {
        if (searchEnginePanel) {
            searchEnginePanel.classList.remove('active');
        }
    }

    // 渲染搜索引擎列表
    function renderSearchEngineLists() {
        if (!searchEngineData) return;
        
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        const activeIds = workingSettings.activeEngines;
        const disabledPresetIds = workingSettings.disabledPresets;
        const disabledCustomIds = workingSettings.disabledCustoms;
        
        // 按activeIds顺序渲染使用中的引擎
        const activeEngines = activeIds.map(id => searchEngines[id]).filter(Boolean);
        renderSearchEngineCategory(searchEngineActiveList, activeEngines, 'active');
        
        // 渲染未使用的预设
        const presetEngines = disabledPresetIds.map(id => searchEngines[id]).filter(Boolean);
        renderSearchEngineCategory(searchEnginePresetList, presetEngines, 'preset');
        
        // 渲染未使用的自定义
        const customEngines = disabledCustomIds.map(id => searchEngines[id]).filter(Boolean);
        renderSearchEngineCategory(searchEngineCustomList, customEngines, 'custom');
    }

    // 渲染单个分类的搜索引擎列表
    function renderSearchEngineCategory(container, engines, category) {
        container.innerHTML = '';
        // 获取预设引擎的id列表
        const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
        
        engines.forEach((engine, index) => {
            const item = document.createElement('div');
            item.className = 'search-engine-item';
            item.dataset.engineId = engine.id;
            const isPreset = presetIds.includes(engine.id); // 判断是否为预设搜索引擎
            const isFirst = index === 0;
            const isLast = index === engines.length - 1;
            
            // 根据分类生成不同的操作按钮
            let actionButtons = '';
            if (category === 'active') {
                // 使用中：显示上移、下移、移至未使用
                actionButtons = `
                    <button class="search-engine-move-up" title="上移" ${isFirst ? 'disabled' : ''}>${svgArrowUp}</button>
                    <button class="search-engine-move-down" title="下移" ${isLast ? 'disabled' : ''}>${svgArrowDown}</button>
                    <button class="search-engine-disable" title="移至未使用" data-engine-id="${engine.id}">${svgMinus}</button>
                `;
            } else if (category === 'preset') {
                // 未使用的预设：显示移至使用中、删除（禁用）
                actionButtons = `
                    <button class="search-engine-enable" title="移至使用中" data-engine-id="${engine.id}">${svgPlus}</button>
                    <button class="search-engine-delete" title="删除" data-engine-id="${engine.id}" disabled>${svgClose}</button>
                `;
            } else {
                // 未使用的自定义：显示移至使用中、删除
                actionButtons = `
                    <button class="search-engine-enable" title="移至使用中" data-engine-id="${engine.id}">${svgPlus}</button>
                    <button class="search-engine-delete" title="删除" data-engine-id="${engine.id}" ${isPreset ? 'disabled' : ''}>${svgClose}</button>
                `;
            }
            
            item.innerHTML = `
                <div class="search-engine-item-icon">${engine.icon}</div>
                <span class="search-engine-item-name">
                    ${isPreset ? '<span class="preset-tag">预设</span>' : ''}${engine.title}
                </span>
                <div class="search-engine-item-actions">
                    ${actionButtons}
                </div>
            `;
            
            // 绑定上移按钮事件
            const moveUp = item.querySelector('.search-engine-move-up');
            if (moveUp) {
                moveUp.addEventListener('click', () => moveSearchEngine(engine.id, -1, category));
            }
            
            // 绑定下移按钮事件
            const moveDown = item.querySelector('.search-engine-move-down');
            if (moveDown) {
                moveDown.addEventListener('click', () => moveSearchEngine(engine.id, 1, category));
            }
            
            // 绑定移至未使用按钮事件
            const disableBtn = item.querySelector('.search-engine-disable');
            if (disableBtn) {
                disableBtn.addEventListener('click', () => disableSearchEngine(engine.id));
            }
            
            // 绑定移至使用中按钮事件
            const enableBtn = item.querySelector('.search-engine-enable');
            if (enableBtn) {
                enableBtn.addEventListener('click', () => enableSearchEngine(engine.id, isPreset ? 'preset' : 'custom'));
            }
            
            // 绑定删除按钮事件
            const deleteBtn = item.querySelector('.search-engine-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteSearchEngine(engine.id));
            }
            
            container.appendChild(item);
        });
    }

    // 初始化分类折叠功能（使用事件委托）
    function initSearchEngineCategoryCollapse() {
        // 使用事件委托，在面板上绑定一次事件
        if (searchEnginePanel && !searchEnginePanel.dataset.collapseInitialized) {
            searchEnginePanel.addEventListener('click', function(e) {
                const header = e.target.closest('.search-engine-category-header');
                if (header) {
                    const category = header.closest('.search-engine-category');
                    if (category) {
                        category.classList.toggle('collapsed');
                    }
                }
            });
            searchEnginePanel.dataset.collapseInitialized = 'true';
        }
    }

    // 移动搜索引擎顺序
    function moveSearchEngine(engineId, direction, category) {
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        let list;
        if (category === 'active') {
            list = workingSettings.activeEngines;
        } else if (category === 'preset') {
            list = workingSettings.disabledPresets;
        } else {
            list = workingSettings.disabledCustoms;
        }
        
        const index = list.indexOf(engineId);
        if (index === -1) return;
        
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= list.length) return;
        
        // 交换位置
        [list[index], list[newIndex]] = [list[newIndex], list[index]];
        // 重新渲染列表
        renderSearchEngineLists();
    }

    // 移至未使用
    function disableSearchEngine(engineId) {
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        // 判断是否为预设引擎：id在前presetEngineCount个预设引擎中
        const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
        const isPreset = presetIds.includes(engineId);
        
        // 从使用中移除
        const activeIndex = workingSettings.activeEngines.indexOf(engineId);
        if (activeIndex === -1) return;
        workingSettings.activeEngines.splice(activeIndex, 1);
        
        // 添加到对应的未使用列表
        if (isPreset) {
            workingSettings.disabledPresets.push(engineId);
        } else {
            workingSettings.disabledCustoms.push(engineId);
        }
        
        renderSearchEngineLists();
    }

    // 移至使用中
    function enableSearchEngine(engineId, sourceCategory) {
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        
        // 从对应的未使用列表移除
        if (sourceCategory === 'preset') {
            const index = workingSettings.disabledPresets.indexOf(engineId);
            if (index !== -1) workingSettings.disabledPresets.splice(index, 1);
        } else {
            const index = workingSettings.disabledCustoms.indexOf(engineId);
            if (index !== -1) workingSettings.disabledCustoms.splice(index, 1);
        }
        
        // 添加到使用中
        workingSettings.activeEngines.push(engineId);
        renderSearchEngineLists();
    }

    // 删除自定义搜索引擎
    function deleteSearchEngine(engineId) {
        // 预设引擎不允许删除
        const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
        if (presetIds.includes(engineId)) return;
        
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        
        // 从所有列表中移除
        const activeIndex = workingSettings.activeEngines.indexOf(engineId);
        if (activeIndex !== -1) workingSettings.activeEngines.splice(activeIndex, 1);
        
        const presetIndex = workingSettings.disabledPresets.indexOf(engineId);
        if (presetIndex !== -1) workingSettings.disabledPresets.splice(presetIndex, 1);
        
        const customIndex = workingSettings.disabledCustoms.indexOf(engineId);
        if (customIndex !== -1) workingSettings.disabledCustoms.splice(customIndex, 1);
        
        // 从searchEngines中移除
        delete searchEngines[engineId];
        
        // 从searchEngineData.engines中移除
        const engineIndex = searchEngineData.engines.findIndex(e => e.id === engineId);
        if (engineIndex !== -1) searchEngineData.engines.splice(engineIndex, 1);
        
        // 同步更新localStorage
        saveCustomSearchEngines();
        
        renderSearchEngineLists();
    }

    // 打开添加搜索引擎面板
    function openAddSearchEnginePanel() {
        if (addSearchEnginePanel) {
            addSearchEngineName.value = '';
            addSearchEngineUrl.value = '';
            addSearchEngineUrlError.textContent = '';
            addSearchEnginePanel.classList.add('active');
        }
    }

    // 关闭添加搜索引擎面板
    function closeAddSearchEnginePanel(checkInput = true) {
        if (checkInput && hasAddSearchEngineInput()) {
            openConfirmDialog('discard-add-search-engine');
            return;
        }
        if (addSearchEnginePanel) {
            addSearchEnginePanel.classList.remove('active');
        }
    }

    // 检查添加搜索引擎面板是否有输入内容
    function hasAddSearchEngineInput() {
        const name = addSearchEngineName?.value.trim();
        const url = addSearchEngineUrl?.value.trim();
        return !!(name || url);
    }

    // 清除添加搜索引擎面板的输入
    function clearAddSearchEngineInputs() {
        if (addSearchEngineName) addSearchEngineName.value = '';
        if (addSearchEngineUrl) addSearchEngineUrl.value = '';
        if (addSearchEngineUrlError) addSearchEngineUrlError.textContent = '';
    }

    // 验证搜索引擎URL格式
    function validateSearchEngineUrl(url) {
        if (!url.trim()) {
            return { valid: false, message: 'URL不能为空' };
        }
        if (!url.includes('%s')) {
            return { valid: false, message: 'URL中必须包含 %s 作为搜索关键词占位符' };
        }
        return { valid: true, message: '' };
    }

    // 验证并添加搜索引擎
    function addSearchEngine() {
        const name = addSearchEngineName.value.trim();
        const url = addSearchEngineUrl.value.trim();
        
        const validation = validateSearchEngineUrl(url);
        if (!validation.valid) {
            addSearchEngineUrlError.textContent = validation.message;
            return false;
        }
        
        // MC百科图标（用于自定义搜索引擎）
        const mcIcon = '<svg t="1766328430081" class="search-icon" viewBox="0 0 1035 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="37846" width="24" height="24"><path d="M1013.852766 1011.332492a42.225028 42.225028 0 0 1-59.70619 0L702.316509 759.502424a428.900723 428.900723 0 1 1 133.958901-196.00858 41.718328 41.718328 0 0 1-4.919216 14.166497c-1.330088 3.61024-2.385714 7.347155-3.800252 10.91517l-2.385714-2.385714a42.225028 42.225028 0 0 1-72.690386-29.13527l-0.380025-3.905815a41.950565 41.950565 0 0 1 11.379645-28.670794l-3.926928-3.905815a336.976836 336.976836 0 1 0-88.123633 150.764463 6.333754 6.333754 0 0 0 0.612262-0.928951l61.120729 1.055626 145.254096 145.232984 0.274463-0.274463 135.12009 135.12009a42.225028 42.225028 0 0 1 0.042225 59.79064z" fill="#515151" p-id="37847"></path></svg>';
        
        // 创建新的搜索引擎
        const newId = Math.max(...searchEngineData.engines.map(e => e.id)) + 1;
        const newEngine = {
            id: newId,
            title: name || '新搜索引擎',
            icon: mcIcon,
            url: url,
            comment: '自定义搜索引擎'
        };
        
        // 添加到列表
        searchEngineData.engines.push(newEngine);
        searchEngines[newId] = newEngine;
        
        // 保存自定义搜索引擎到localStorage
        saveCustomSearchEngines();
        
        // 设置为激活状态（添加到工作副本）
        const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
        
        // 检查是否已存在于使用中列表，避免重复添加
        if (!workingSettings.activeEngines.includes(newId)) {
            workingSettings.activeEngines.push(newId);
        }
        
        // 确保新引擎不在未使用的自定义列表中（如果有的话）
        const disabledCustomIndex = workingSettings.disabledCustoms.indexOf(newId);
        if (disabledCustomIndex !== -1) {
            workingSettings.disabledCustoms.splice(disabledCustomIndex, 1);
        }

        // 先清除输入，再关闭面板（避免保存成功后又弹出警告）
        clearAddSearchEngineInputs();
        closeAddSearchEnginePanel();
        renderSearchEngineLists();
        sendNotice('搜索引擎已添加', 'info');

        return true;
    }

    // 绑定搜索引擎面板事件
    if (searchEngineClose) {
        searchEngineClose.addEventListener('click', () => {
            // 检查是否有未保存的更改（包括内层编辑面板的更改）
            const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
            const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
            if (hasChanges) {
                openConfirmDialog('discard-search-engine-changes');
            } else {
                searchEngineSettingsWorking = null;
                closeSearchEnginePanel();
            }
        });
    }
        if (searchEngineAdd) {
            searchEngineAdd.addEventListener('click', openAddSearchEnginePanel);
        }
        
        // 重置：删除所有自定义引擎和排序设置
        if (searchEngineReset) {
            searchEngineReset.addEventListener('click', () => {
                openConfirmDialog('reset-search-engines');
            });
        }
        
        // 还原：恢复默认排序
        if (searchEngineRestore) {
            searchEngineRestore.addEventListener('click', () => {
                openConfirmDialog('restore-search-engines');
            });
        }
        
        if (searchEngineCancel) {
            searchEngineCancel.addEventListener('click', () => {
                // 检查是否有未保存的更改（包括内层编辑面板的更改）
                const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
                const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
                if (hasChanges) {
                    openConfirmDialog('discard-search-engine-changes');
                } else {
                    searchEngineSettingsWorking = null;
                    closeSearchEnginePanel();
                }
            });
        }
    if (searchEngineApply || searchEngineOk) {
        const applySettings = () => {
            const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
            
            // 检查是否有实际更改
            const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings);
            if (!hasChanges) {
                sendNotice('没有未保存的更改', 'info');
                return;
            }
            
            // 验证使用中的引擎数量必须为7
            const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
            const presetCount = workingSettings.activeEngines.filter(id => presetIds.includes(id)).length;
            const customCount = workingSettings.activeEngines.filter(id => !presetIds.includes(id)).length;
            const totalCount = workingSettings.activeEngines.length;
            const countError = document.getElementById('search-engine-count-error');
            
            if (totalCount !== 7) {
                if (countError) countError.textContent = `使用中的引擎数量必须为7个，当前为${totalCount}个`;
                return;
            }
            if (countError) countError.textContent = '';
            
            // 保存到localStorage
            searchEngineSettings = JSON.parse(JSON.stringify(workingSettings));
            localStorage.setItem('search_engine_settings', JSON.stringify(searchEngineSettings));
            searchEngineSettingsWorking = null;
            searchEngineSettingsHasInnerChanges = false; // 重置内层编辑标志
            
            // 重新渲染主页搜索引擎
            renderSearchEngineIcons();
            sendNotice('搜索引擎设置已保存', 'info');
        };
        
        // 应用：保存设置但不关闭面板
        if (searchEngineApply) {
            searchEngineApply.addEventListener('click', () => {
                const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
                
                // 检查是否有实际更改（包括内层编辑面板的更改）
                const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
                if (!hasChanges) {
                    sendNotice('没有未保存的更改', 'info');
                    return;
                }
                
                // 验证使用中的引擎数量必须为7
                const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
                const presetCount = workingSettings.activeEngines.filter(id => presetIds.includes(id)).length;
                const customCount = workingSettings.activeEngines.filter(id => !presetIds.includes(id)).length;
                const totalCount = workingSettings.activeEngines.length;
                const countError = document.getElementById('search-engine-count-error');
                
                if (totalCount !== 7) {
                    if (countError) countError.textContent = `使用中的引擎数量必须为7个，当前为${totalCount}个`;
                    return; // 不执行保存
                }
                if (countError) countError.textContent = '';
                
                // 验证通过，保存设置
                searchEngineSettings = JSON.parse(JSON.stringify(workingSettings));
                localStorage.setItem('search_engine_settings', JSON.stringify(searchEngineSettings));
                
                // 重新渲染主页搜索引擎
                renderSearchEngineIcons();
                sendNotice('设置已应用', 'info');
            });
        }
        
        // 确定：保存设置并关闭面板
        if (searchEngineOk) {
            searchEngineOk.addEventListener('click', () => {
                // 只有在applySettings成功执行时才关闭面板
                const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
                
                // 检查是否有实际更改（包括内层编辑面板的更改）
                const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
                if (!hasChanges) {
                    sendNotice('没有未保存的更改', 'info');
                    closeSearchEnginePanel();
                    return;
                }
                
                // 验证使用中的引擎数量必须为7
                const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);
                const presetCount = workingSettings.activeEngines.filter(id => presetIds.includes(id)).length;
                const customCount = workingSettings.activeEngines.filter(id => !presetIds.includes(id)).length;
                const totalCount = workingSettings.activeEngines.length;
                const countError = document.getElementById('search-engine-count-error');
                
                if (totalCount !== 7) {
                    if (countError) countError.textContent = `使用中的引擎数量必须为7个，当前为${totalCount}个`;
                    return; // 不关闭面板
                }
                if (countError) countError.textContent = '';
                
                // 验证通过，保存设置
                searchEngineSettings = JSON.parse(JSON.stringify(workingSettings));
                localStorage.setItem('search_engine_settings', JSON.stringify(searchEngineSettings));
                searchEngineSettingsWorking = null;
                searchEngineSettingsHasInnerChanges = false; // 重置内层编辑标志
                
                // 重新渲染主页搜索引擎
                renderSearchEngineIcons();
                sendNotice('搜索引擎设置已保存', 'info');
                
                // 成功保存后关闭面板
                closeSearchEnginePanel();
            });
        }
    }
    
    // 面板遮罩点击关闭
    const searchEngineOverlay = document.querySelector('#search-engine-panel .settings-modal-overlay');
    if (searchEngineOverlay) {
        searchEngineOverlay.addEventListener('click', () => {
            // 检查是否有未保存的更改（包括内层编辑面板的更改）
            const workingSettings = searchEngineSettingsWorking || searchEngineSettings;
            const hasChanges = JSON.stringify(workingSettings) !== JSON.stringify(searchEngineSettings) || searchEngineSettingsHasInnerChanges;
            if (hasChanges) {
                openConfirmDialog('discard-search-engine-changes');
            } else {
                searchEngineSettingsWorking = null;
                closeSearchEnginePanel();
            }
        });
    }

    // 绑定添加搜索引擎面板事件
    if (addSearchEngineClose) {
        addSearchEngineClose.addEventListener('click', closeAddSearchEnginePanel);
    }
    if (addSearchEngineCancel) {
        addSearchEngineCancel.addEventListener('click', closeAddSearchEnginePanel);
    }
    if (addSearchEngineSave) {
        addSearchEngineSave.addEventListener('click', addSearchEngine);
    }
    if (addSearchEngineUrl) {
        // 失焦验证
        addSearchEngineUrl.addEventListener('blur', function() {
            const validation = validateSearchEngineUrl(this.value);
            addSearchEngineUrlError.textContent = validation.message;
        });
        // 输入时清除错误
        addSearchEngineUrl.addEventListener('input', function() {
            addSearchEngineUrlError.textContent = '';
        });
    }

    // 面板遮罩点击关闭
    const addSearchEngineOverlay = document.querySelector('#add-search-engine-panel .settings-modal-overlay');
    if (addSearchEngineOverlay) {
        addSearchEngineOverlay.addEventListener('click', closeAddSearchEnginePanel);
    }

    // ==================== 添加快捷方式面板 ====================
    
    // 添加快捷方式面板元素
    const addShortcutPanel = document.getElementById('add-shortcut-panel');
    const addShortcutClose = document.getElementById('add-shortcut-close');
    const addShortcutUrl = document.getElementById('add-shortcut-url');
    const addShortcutName = document.getElementById('add-shortcut-name');
    const addShortcutIcon = document.getElementById('add-shortcut-icon');
    const addShortcutPreviewIcon = document.getElementById('add-shortcut-preview-icon');
    const addShortcutCancel = document.getElementById('add-shortcut-cancel');
    const addShortcutSave = document.getElementById('add-shortcut-save');
    const addShortcutOverlay = document.querySelector('#add-shortcut-panel .settings-modal-overlay');

    // 用于取消进行中的请求
    let addPanelAbortController = null;

    // 初始化关闭按钮图标
    if (addShortcutClose) {
        addShortcutClose.innerHTML = svgClose;
    }

    // 验证URL格式并补全协议
    function normalizeUrl(url) {
        url = url.trim();
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        return url;
    }

    // 验证图标URL格式（必须是ico/png/jpg）
    function isValidIconUrl(url) {
        if (!url || !url.trim()) return false;
        url = url.trim().toLowerCase();
        return /\.(ico|png|jpg|jpeg)(\?.*)?$/i.test(url);
    }

    // 从URL提取favicon地址
    function getFaviconFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.origin + '/favicon.ico';
        } catch (e) {
            return null;
        }
    }

    // 获取页面标题（使用多个代理服务）
    async function fetchPageTitle(url, signal) {
        const proxyServices = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        for (const service of proxyServices) {
            try {
                const proxyUrl = service + encodeURIComponent(url);
                const response = await fetch(proxyUrl, { signal });
                if (!response.ok) continue;
                const text = await response.text();
                const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) return titleMatch[1].trim();
            } catch (e) {
                if (e.name === 'AbortError') throw e;
                continue;
            }
        }
        return null;
    }

    // 打开添加快捷方式面板
    function openAddShortcutPanel() {
        if (addShortcutPanel) {
            // 取消之前进行中的请求
            if (addPanelAbortController) {
                addPanelAbortController.abort();
                addPanelAbortController = null;
            }
            
            addShortcutPanel.classList.add('active');
            // 不改变背景模糊状态
            // 清空表单
            addShortcutUrl.value = '';
            addShortcutName.value = '';
            addShortcutIcon.value = '';
            addShortcutPreviewIcon.innerHTML = defaultIconSVG;
            addShortcutUrl.focus();
        }
    }

    // 关闭添加快捷方式面板
    function closeAddShortcutPanel(checkInput = true) {
        if (checkInput && hasAddShortcutInput()) {
            openConfirmDialog('discard-add-shortcut');
            return;
        }
        if (addShortcutPanel) {
            addShortcutPanel.classList.remove('active');
            // 取消进行中的请求
            if (addPanelAbortController) {
                addPanelAbortController.abort();
                addPanelAbortController = null;
            }
            // 不关闭背景模糊，保留快捷访问菜单
        }
    }

    // 检查添加快捷访问面板是否有输入内容
    function hasAddShortcutInput() {
        const url = addShortcutUrl?.value.trim();
        const name = addShortcutName?.value.trim();
        const icon = addShortcutIcon?.value.trim();
        return !!(url || name || icon);
    }

    // 清除添加快捷访问面板的输入
    function clearAddShortcutInputs() {
        if (addShortcutUrl) addShortcutUrl.value = '';
        if (addShortcutName) addShortcutName.value = '';
        if (addShortcutIcon) addShortcutIcon.value = '';
        if (addShortcutPreviewIcon) {
            addShortcutPreviewIcon.innerHTML = defaultIconSVG;
        }
    }

    // 更新图标预览
    function updateIconPreview(iconUrl) {
        if (!iconUrl || !iconUrl.trim()) {
            addShortcutPreviewIcon.innerHTML = defaultIconSVG;
            return;
        }
        
        if (isValidIconUrl(iconUrl)) {
            const img = new Image();
            img.onload = function() {
                addShortcutPreviewIcon.innerHTML = '<img src="' + iconUrl + '" style="width:32px;height:32px;">';
            };
            img.onerror = function() {
                sendNotice('图标加载失败，将使用默认图标', 'warn');
                addShortcutPreviewIcon.innerHTML = defaultIconSVG;
            };
            img.src = iconUrl;
        } else {
            sendNotice('图标格式不支持，请使用 ico/png/jpg 格式', 'warn');
            addShortcutPreviewIcon.innerHTML = defaultIconSVG;
        }
    }

    // URL失焦时自动获取信息
    addShortcutUrl.addEventListener('blur', async function() {
        const url = normalizeUrl(this.value);
        if (!url) return;
        
        this.value = url;
        
        // 检查用户是否已手动输入标题或图标，如果是则不自动获取
        const userHasEnteredTitle = addShortcutName.value.trim() !== '';
        const userHasEnteredIcon = addShortcutIcon.value.trim() !== '';
        
        // 创建新的AbortController用于这次请求
        if (addPanelAbortController) {
            addPanelAbortController.abort();
        }
        addPanelAbortController = new AbortController();
        
        // 只有用户未手动输入图标时才获取favicon
        if (!userHasEnteredIcon) {
            const faviconUrl = getFaviconFromUrl(url);
            const img = new Image();
            img.onload = function() {
                addShortcutPreviewIcon.innerHTML = '<img src="' + faviconUrl + '" style="width:32px;height:32px;">';
                // 填充favicon URL到输入框
                addShortcutIcon.value = faviconUrl;
            };
            img.onerror = function() {
                addShortcutPreviewIcon.innerHTML = defaultIconSVG;
                // favicon获取失败时不填充输入框
            };
            img.src = faviconUrl;
        }
        
        // 只有用户未手动输入标题时才获取标题
        if (!userHasEnteredTitle) {
            try {
                const title = await fetchPageTitle(url, addPanelAbortController.signal);
                if (addPanelAbortController.signal.aborted) return;
                if (title) {
                    addShortcutName.value = title;
                }
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.log('获取标题失败:', e);
                }
            }
        }
    });

    // 图标输入失焦时验证
    addShortcutIcon.addEventListener('blur', function() {
        updateIconPreview(this.value);
    });

    // 点击关闭按钮
    if (addShortcutClose) {
        addShortcutClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAddShortcutPanel();
        });
    }

    // 点击取消按钮
    if (addShortcutCancel) {
        addShortcutCancel.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAddShortcutPanel();
        });
    }

    // 点击保存按钮
    if (addShortcutSave) {
        addShortcutSave.addEventListener('click', function(e) {
            e.stopPropagation();
            const url = normalizeUrl(addShortcutUrl.value.trim());
            if (!url) {
                sendNotice('请输入URL', 'warn');
                return;
            }
            
            // 验证URL格式
            try {
                new URL(url);
            } catch (e) {
                sendNotice('URL格式不正确', 'warn');
                return;
            }
            
            const name = addShortcutName.value.trim() || addShortcutName.value.trim();
            let icon = addShortcutIcon.value.trim();
            
            // 如果没有指定图标，使用默认图标（空字符串会显示默认图标）
            if (!icon) {
                icon = '';
            } else if (!isValidIconUrl(icon)) {
                sendNotice('图标格式不支持，将使用默认图标', 'warn');
                icon = '';
            }
            
            // 保存到localStorage
            const customShortcuts = getLocalStorageItem('custom_shortcuts') || [];
            const newShortcut = {
                id: Date.now(),
                url: url,
                title: name || url,
                icon: icon || '',
                position: customShortcuts.length // 使用当前长度作为位置信息
            };
            customShortcuts.push(newShortcut);
            setLocalStorageItem('custom_shortcuts', customShortcuts);

            // 先清除输入，再关闭面板（避免保存成功后又弹出警告）
            clearAddShortcutInputs();
            closeAddShortcutPanel();

            // 重新加载菜单
            loadQuickAccessMenu();
        });
    }

    // 点击遮罩层关闭
    if (addShortcutOverlay) {
        addShortcutOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAddShortcutPanel();
        });
    }

    // 编辑快捷访问面板相关
    const editShortcutPanel = document.getElementById('edit-shortcut-panel');
    const editShortcutClose = document.getElementById('edit-shortcut-close');
    const editShortcutReset = document.getElementById('edit-shortcut-reset');
    const editShortcutList = document.getElementById('edit-shortcut-list');
    const editShortcutCancel = document.getElementById('edit-shortcut-cancel');
    const editShortcutApply = document.getElementById('edit-shortcut-apply');
    const editShortcutOk = document.getElementById('edit-shortcut-ok');
    const editShortcutOverlay = editShortcutPanel ? editShortcutPanel.querySelector('.settings-modal-overlay') : null;
    const editShortcutVisibleList = document.getElementById('edit-shortcut-visible-list');
    const editShortcutHiddenList = document.getElementById('edit-shortcut-hidden-list');

    let editShortcutVisibleItems = []; // 显示中的项目列表
    let editShortcutHiddenItems = []; // 隐藏的项目列表
    let editShortcutOriginalVisibleOrder = []; // 原始显示顺序，用于检测更改
    let editShortcutOriginalHiddenOrder = []; // 原始隐藏顺序，用于检测更改
    let editShortcutHasChanges = false; // 是否有更改

    // 初始化分类折叠功能（使用事件委托）
    initEditShortcutCategoryCollapse();

    // 打开编辑快捷访问面板
    function openEditShortcutPanel() {
        if (editShortcutPanel) {
            // 先重置所有分类的折叠状态
            const categories = document.querySelectorAll('.edit-shortcut-category');
            categories.forEach(cat => {
                cat.classList.remove('collapsed');
            });
            // 加载所有快捷方式
            loadAllShortcuts();
            // 保存原始顺序
            editShortcutOriginalVisibleOrder = editShortcutVisibleItems.map(item => item.id);
            editShortcutOriginalHiddenOrder = editShortcutHiddenItems.map(item => item.id);
            editShortcutHasChanges = false;
            // 渲染列表
            renderEditShortcutList();
            editShortcutPanel.classList.add('active');
        }
    }

    // 关闭编辑快捷访问面板
    function closeEditShortcutPanel() {
        if (editShortcutPanel) {
            editShortcutPanel.classList.remove('active');
        }
    }

    // 恢复所有被编辑过的快捷方式数据
    function restoreAllEditedShortcuts() {
        // 恢复editShortcutVisibleItems中的数据
        editShortcutVisibleItems.forEach(item => {
            if (item.originalData) {
                item.url = item.originalData.url;
                item.title = item.originalData.title;
                item.icon = item.originalData.icon;
            }
        });
        // 恢复editShortcutHiddenItems中的数据
        editShortcutHiddenItems.forEach(item => {
            if (item.originalData) {
                item.url = item.originalData.url;
                item.title = item.originalData.title;
                item.icon = item.originalData.icon;
            }
        });
        // 重新渲染列表
        renderEditShortcutList();
    }

    // 加载所有快捷方式（预设 + 自定义）- 类似搜索引擎的混合排序
    function loadAllShortcuts() {
        // 创建预设映射
        const presetMap = {};
        quickAccessData.forEach(item => {
            presetMap[item.id] = { ...item, isPreset: true };
        });
        
        // 读取保存的快捷访问顺序（混合保存预设和自定义）
        const savedVisibleOrder = getLocalStorageItem('shortcut_visible_order') || [];
        
        // 读取隐藏的预设列表
        const hiddenPresets = getLocalStorageItem('hidden_presets') || [];
        
        // 读取自定义快捷方式
        const customShortcuts = getLocalStorageItem('custom_shortcuts') || [];
        const customMap = {};
        customShortcuts.forEach(item => {
            customMap[item.id] = { ...item, isPreset: false };
        });
        
        // 按保存的顺序加载显示中的项目
        const visibleItems = [];
        const visiblePresetIds = new Set();
        const visibleCustomIds = new Set();
        
        savedVisibleOrder.forEach(id => {
            if (id.startsWith('preset_')) {
                const presetId = parseInt(id.replace('preset_', ''));
                if (presetMap[presetId] && !hiddenPresets.includes(presetId)) {
                    visibleItems.push({
                        id: id,
                        presetId: presetId,
                        url: presetMap[presetId].url,
                        title: presetMap[presetId].title,
                        icon: presetMap[presetId].icon,
                        isPreset: true,
                        isHidden: false
                    });
                    visiblePresetIds.add(presetId);
                }
            } else if (id.startsWith('custom_')) {
                const customId = parseInt(id.replace('custom_', ''));
                if (customMap[customId]) {
                    visibleItems.push({
                        id: id,
                        customId: customId,
                        url: customMap[customId].url,
                        title: customMap[customId].title,
                        icon: customMap[customId].icon,
                        position: customMap[customId].position,
                        isPreset: false,
                        isHidden: false
                    });
                    visibleCustomIds.add(customId);
                }
            }
        });
        
        // 添加未保存顺序的预设（新增的预设）
        quickAccessData.forEach(item => {
            if (!visiblePresetIds.has(item.id) && !hiddenPresets.includes(item.id)) {
                visibleItems.push({
                    id: 'preset_' + item.id,
                    presetId: item.id,
                    url: item.url,
                    title: item.title,
                    icon: item.icon,
                    isPreset: true,
                    isHidden: false
                });
                visiblePresetIds.add(item.id);
            }
        });
        
        // 添加未保存顺序的自定义快捷方式
        customShortcuts.forEach(item => {
            if (!visibleCustomIds.has(item.id)) {
                visibleItems.push({
                    id: 'custom_' + item.id,
                    customId: item.id,
                    url: item.url,
                    title: item.title,
                    icon: item.icon,
                    position: item.position,
                    isPreset: false,
                    isHidden: false
                });
            }
        });
        
        // 加载隐藏的预设
        const hiddenItems = [];
        hiddenPresets.forEach(presetId => {
            if (presetMap[presetId]) {
                hiddenItems.push({
                    id: 'preset_' + presetId,
                    presetId: presetId,
                    url: presetMap[presetId].url,
                    title: presetMap[presetId].title,
                    icon: presetMap[presetId].icon,
                    isPreset: true,
                    isHidden: true
                });
            }
        });
        
        editShortcutVisibleItems = visibleItems;
        editShortcutHiddenItems = hiddenItems;
        
        // 保存原始顺序
        editShortcutOriginalVisibleOrder = editShortcutVisibleItems.map(item => item.id);
        editShortcutOriginalHiddenOrder = editShortcutHiddenItems.map(item => item.id);
    }

    // 渲染编辑列表
    function renderEditShortcutList() {
        if (!editShortcutVisibleList || !editShortcutHiddenList) return;
        
        // 清空列表
        editShortcutVisibleList.innerHTML = '';
        editShortcutHiddenList.innerHTML = '';
        
        // 渲染显示中的项目
        renderEditShortcutCategory(editShortcutVisibleList, editShortcutVisibleItems, 'visible');
        // 渲染隐藏的项目
        renderEditShortcutCategory(editShortcutHiddenList, editShortcutHiddenItems, 'hidden');
    }

    // 渲染单个分类的快捷访问列表
    function renderEditShortcutCategory(container, items, category) {
        container.innerHTML = '';
        
        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'edit-shortcut-item';
            div.dataset.index = index;
            
            // 图标 - 预设项目直接使用图标HTML，自定义项目使用favicon图片
            let iconContent;
            if (item.isPreset) {
                // 预设项目直接渲染SVG图标
                iconContent = item.icon;
            } else if (item.icon && item.icon.trim()) {
                // 自定义项目使用favicon图片
                iconContent = '<img src="' + encodeURI(item.icon.trim()) + '" class="favicon-img" width="32" height="32" onerror="this.classList.add(\'favicon-error\')">';
            } else {
                iconContent = defaultIconSVG;
            }
            
            // 操作按钮
            let actionButton = '';
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            
            if (category === 'visible') {
                // 显示中分类：预设可以隐藏（-），自定义可以删除（x）
                if (item.isPreset) {
                    // 预设：隐藏按钮（-）
                    actionButton = `
                        <button class="edit-shortcut-toggle" data-category="${category}" data-index="${index}" title="隐藏到已隐藏">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"/>
                            </svg>
                        </button>
                    `;
                } else {
                    // 自定义：删除按钮（x）
                    actionButton = `
                        <button class="edit-shortcut-delete" data-category="${category}" data-index="${index}" title="删除">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    `;
                }
            } else {
                // 隐藏分类：预设可以显示（+）
                actionButton = `
                    <button class="edit-shortcut-toggle" data-category="${category}" data-index="${index}" title="显示到显示中">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                `;
            }
            
            // 移动按钮（仅显示中分类有）
            let moveButtons = '';
            if (category === 'visible') {
                const isFirst = index === 0;
                const isLast = index === items.length - 1;
                moveButtons = `
                    <button class="edit-shortcut-move-btn edit-shortcut-move-up" data-category="${category}" data-index="${index}" ${isFirst ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 15L12 9L6 15"/>
                        </svg>
                    </button>
                    <button class="edit-shortcut-move-btn edit-shortcut-move-down" data-category="${category}" data-index="${index}" ${isLast ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9L12 15L18 9"/>
                        </svg>
                    </button>
                `;
            }
            
            div.innerHTML = `
                <div class="edit-shortcut-item-icon">${iconContent}</div>
                <div class="edit-shortcut-item-text" title="${item.title}">
                    ${item.isPreset ? '<span class="preset-tag">预设</span>' : ''}${item.title}
                </div>
                <div class="edit-shortcut-item-actions">
                    ${moveButtons}
                    ${actionButton}
                </div>
            `;
            container.appendChild(div);
        });
        
        // 绑定上移按钮事件
        container.querySelectorAll('.edit-shortcut-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                moveEditShortcutItem(category, index, -1);
            });
        });
        
        // 绑定下移按钮事件
        container.querySelectorAll('.edit-shortcut-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                moveEditShortcutItem(category, index, 1);
            });
        });
        
        // 绑定删除按钮事件（自定义项目）
        container.querySelectorAll('.edit-shortcut-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                confirmDialog.dataset.category = category;
                confirmDialog.dataset.targetIndex = index;
                openConfirmDialog('delete-custom-shortcut');
            });
        });
        
        // 绑定切换分类按钮事件（预设项目）
        container.querySelectorAll('.edit-shortcut-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                toggleEditShortcutCategory(category, index);
            });
        });
    }

    // 移动快捷访问项目
    function moveEditShortcutItem(category, index, direction) {
        const items = category === 'visible' ? editShortcutVisibleItems : editShortcutHiddenItems;
        if (index + direction < 0 || index + direction >= items.length) return;
        
        // 交换位置
        const temp = items[index];
        items[index] = items[index + direction];
        items[index + direction] = temp;
        editShortcutHasChanges = true;
        renderEditShortcutList();
    }

    // 切换快捷访问分类（预设项目在显示中和已隐藏之间移动）
    function toggleEditShortcutCategory(fromCategory, index) {
        const fromItems = fromCategory === 'visible' ? editShortcutVisibleItems : editShortcutHiddenItems;
        const toItems = fromCategory === 'visible' ? editShortcutHiddenItems : editShortcutVisibleItems;
        
        if (index < 0 || index >= fromItems.length) return;
        
        // 移动项目
        const item = fromItems[index];
        fromItems.splice(index, 1);
        toItems.push(item);
        
        editShortcutHasChanges = true;
        renderEditShortcutList();
    }

    // 初始化分类折叠功能（使用事件委托）
    function initEditShortcutCategoryCollapse() {
        // 使用事件委托，在面板上绑定一次事件
        if (editShortcutPanel && !editShortcutPanel.dataset.collapseInitialized) {
            editShortcutPanel.addEventListener('click', function(e) {
                const header = e.target.closest('.edit-shortcut-category-header');
                if (header) {
                    const category = header.closest('.edit-shortcut-category');
                    if (category) {
                        category.classList.toggle('collapsed');
                    }
                }
            });
            editShortcutPanel.dataset.collapseInitialized = 'true';
        }
    }

    // 保存快捷访问顺序 - 使用localStorage
    function saveShortcutOrder() {
        // 保存显示中项目的顺序（混合预设和自定义）
        const visibleOrder = editShortcutVisibleItems.map(item => item.id);
        setLocalStorageItem('shortcut_visible_order', visibleOrder);
        
        // 保存隐藏的预设列表
        const hiddenPresetIds = editShortcutHiddenItems.map(item => item.presetId);
        setLocalStorageItem('hidden_presets', hiddenPresetIds);
        
        // 保存自定义快捷方式（只保存显示中的自定义）
        const visibleCustomItems = editShortcutVisibleItems.filter(item => !item.isPreset);
        const newCustomShortcuts = visibleCustomItems.map((item, index) => ({
            id: parseInt(item.customId) || Date.now(),
            url: item.url,
            title: item.title,
            icon: item.icon,
            position: index
        }));
        setLocalStorageItem('custom_shortcuts', newCustomShortcuts);
    }

    // 点击重置按钮
    if (editShortcutReset) {
        editShortcutReset.addEventListener('click', function(e) {
            e.stopPropagation();
            // 使用确认对话框
            openConfirmDialog('reset-shortcuts');
        });
    }

    // 点击取消按钮
    if (editShortcutCancel) {
        editShortcutCancel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                openConfirmDialog('discard-changes');
            } else {
                // 恢复所有被编辑过的快捷方式数据
                restoreAllEditedShortcuts();
                closeEditShortcutPanel();
            }
        });
    }

    // 点击关闭按钮
    if (editShortcutClose) {
        editShortcutClose.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                openConfirmDialog('discard-changes');
            } else {
                // 恢复所有被编辑过的快捷方式数据
                restoreAllEditedShortcuts();
                closeEditShortcutPanel();
            }
        });
    }

    // 点击应用按钮
    if (editShortcutApply) {
        editShortcutApply.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                saveShortcutOrder();
                editShortcutHasChanges = false;
                editShortcutOriginalVisibleOrder = editShortcutVisibleItems.map(item => item.id);
                editShortcutOriginalHiddenOrder = editShortcutHiddenItems.map(item => item.id);
                loadQuickAccessMenu();
                sendNotice('设置已应用', 'info');
            } else {
                sendNotice('未作任何更改', 'info');
            }
        });
    }

    // 点击确定按钮
    if (editShortcutOk) {
        editShortcutOk.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                saveShortcutOrder();
                loadQuickAccessMenu();
                closeEditShortcutPanel();
                sendNotice('设置已保存', 'info');
            } else {
                closeEditShortcutPanel();
            }
        });
    }

    // 点击遮罩层关闭
    if (editShortcutOverlay) {
        editShortcutOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                openConfirmDialog('discard-changes');
            } else {
                // 恢复所有被编辑过的快捷方式数据
                restoreAllEditedShortcuts();
                closeEditShortcutPanel();
            }
        });
    }

    // 初始化操作项图标
    function initActionItems() {
        const actionItems = document.querySelectorAll('.setting-item-action');
        actionItems.forEach(item => {
            const textSpan = item.querySelector('.setting-item-text');
            if (textSpan && !item.querySelector('.action-icon')) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'action-icon';
                iconSpan.innerHTML = svgAction;
                iconSpan.style.marginLeft = '8px';
                iconSpan.style.display = 'inline-flex';
                iconSpan.style.alignItems = 'center';
                textSpan.parentNode.insertBefore(iconSpan, textSpan.nextSibling);
            }
        });
    }

    // 点击操作项显示确认对话框
    settingItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            // 支持 data-setting 和 data-action
            const actionId = this.dataset.setting || this.dataset.action;
            if (actionId && confirmActions[actionId]) {
                openConfirmDialog(actionId);
            }
        });
    });

    // 初始化设置项状态图标
    function initSettingItems() {
        const settings = loadGlobalSettings();
        
        settingItems.forEach(item => {
            const indicator = item.querySelector('.status-indicator');
            const icon = item.querySelector('.status-icon');
            const settingType = item.dataset.setting;
            
            if (indicator && icon) {
                let isEnabled = false;
                
                // 根据设置类型确定初始状态
                if (settingType === 'auto-wallpaper') {
                    isEnabled = settings.backgroundBlur;
                } else if (settingType === 'dark-mode') {
                    isEnabled = settings.backgroundFilter;
                } else {
                    // 其他设置使用DOM中的状态
                    isEnabled = indicator.classList.contains('enabled');
                }
                
                if (isEnabled) {
                    indicator.classList.add('enabled');
                    icon.innerHTML = svgOn;
                } else {
                    indicator.classList.remove('enabled');
                    icon.innerHTML = svgOff;
                }
            }
        });
    }

    // 点击设置项切换状态
    settingItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const indicator = this.querySelector('.status-indicator');
            const icon = this.querySelector('.status-icon');
            const settingType = this.dataset.setting;
            
            if (indicator && icon) {
                const wasEnabled = indicator.classList.contains('enabled');
                const isEnabled = !wasEnabled;
                
                indicator.classList.toggle('enabled');
                if (isEnabled) {
                    icon.innerHTML = svgOn;
                } else {
                    icon.innerHTML = svgOff;
                }
                
                // 根据设置类型处理对应的功能
                if (settingType === 'auto-wallpaper') {
                    handleBackgroundBlurToggle(isEnabled);
                } else if (settingType === 'dark-mode') {
                    handleBackgroundFilterToggle(isEnabled);
                }
            }
        });
    });

    // 打开设置菜单时初始化图标
    const originalOpenSettingsModal = openSettingsModal;
    openSettingsModal = function() {
        originalOpenSettingsModal();
        initSettingItems();
    }

    // 初始化壁纸设置
    function initWallpaper() {
        const saved = getLocalStorageItem('wallpaper_settings');
        if (saved) {
            try {
                applyWallpaper(saved);
            } catch (e) {
                console.error('初始化壁纸失败:', e);
            }
        }
    }
    initWallpaper();

    // ==================== 编辑功能 ====================
    
    // 编辑按钮图标
    const svgEdit = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

    // 编辑快捷访问面板元素
    const editShortcutItemPanel = document.getElementById('edit-shortcut-item-panel');
    const editShortcutItemClose = document.getElementById('edit-shortcut-item-close');
    const editShortcutItemUrl = document.getElementById('edit-shortcut-item-url');
    const editShortcutItemName = document.getElementById('edit-shortcut-item-name');
    const editShortcutItemIcon = document.getElementById('edit-shortcut-item-icon');
    const editShortcutItemPreviewIcon = document.getElementById('edit-shortcut-item-preview-icon');
    const editShortcutItemCancel = document.getElementById('edit-shortcut-item-cancel');
    const editShortcutItemSave = document.getElementById('edit-shortcut-item-save');
    const editShortcutItemApply = document.getElementById('edit-shortcut-item-apply');
    const editShortcutItemOverlay = editShortcutItemPanel ? editShortcutItemPanel.querySelector('.settings-modal-overlay') : null;

    // 编辑搜索引擎面板元素
    const editSearchEnginePanel = document.getElementById('edit-search-engine-panel');
    const editSearchEngineClose = document.getElementById('edit-search-engine-close');
    const editSearchEngineName = document.getElementById('edit-search-engine-name');
    const editSearchEngineUrl = document.getElementById('edit-search-engine-url');
    const editSearchEngineUrlError = document.getElementById('edit-search-engine-url-error');
    const editSearchEngineCancel = document.getElementById('edit-search-engine-cancel');
    const editSearchEngineSave = document.getElementById('edit-search-engine-save');
    const editSearchEngineApply = document.getElementById('edit-search-engine-apply');
    const editSearchEngineOverlay = editSearchEnginePanel ? editSearchEnginePanel.querySelector('.settings-modal-overlay') : null;

    // 当前编辑的项目信息
    let currentEditShortcut = null;
    let currentEditSearchEngine = null;
    let editShortcutItemHasChanges = false;
    let editSearchEngineHasChanges = false;
    let searchEngineSettingsHasInnerChanges = false; // 跟踪内层编辑面板的更改

    // 初始化关闭按钮图标
    if (editShortcutItemClose) {
        editShortcutItemClose.innerHTML = svgClose;
    }
    if (editSearchEngineClose) {
        editSearchEngineClose.innerHTML = svgClose;
    }

    // ==================== 编辑快捷访问项目 ====================

    // 打开编辑快捷访问项目面板
    function openEditShortcutItemPanel(item, category, index) {
        if (!editShortcutItemPanel) return;

        // 保存原始数据到item对象，用于外层取消时恢复
        item.originalData = {
            url: item.url,
            title: item.title,
            icon: item.icon
        };

        // 初始化临时数据为当前项目数据
        const tempData = {
            url: item.url || '',
            title: item.title || '',
            icon: item.icon || ''
        };

        currentEditShortcut = { item, category, index, tempData };
        editShortcutItemHasChanges = false;

        // 填充表单数据（使用临时数据）
        if (editShortcutItemUrl) editShortcutItemUrl.value = tempData.url;
        if (editShortcutItemName) editShortcutItemName.value = tempData.title;
        if (editShortcutItemIcon) editShortcutItemIcon.value = tempData.icon;

        // 更新图标预览
        updateEditShortcutIconPreview(tempData.icon);

        editShortcutItemPanel.classList.add('active');
    }

    // 关闭编辑快捷访问项目面板
    function closeEditShortcutItemPanel(checkChanges = true, discardChanges = false) {
        if (checkChanges && editShortcutItemHasChanges && !discardChanges) {
            // 有未保存的更改，提示用户
            openConfirmDialog('discard-edit-shortcut');
            return;
        }

        // 如果要丢弃更改，恢复原始数据
        if (discardChanges && currentEditShortcut) {
            const { item } = currentEditShortcut;
            if (item.originalData) {
                item.url = item.originalData.url;
                item.title = item.originalData.title;
                item.icon = item.originalData.icon;
            }
            renderEditShortcutList();
            // 丢弃更改后，重置外层编辑面板的更改状态
            editShortcutHasChanges = false;
        }

        if (editShortcutItemPanel) {
            editShortcutItemPanel.classList.remove('active');
            currentEditShortcut = null;
        }
    }

    // 更新编辑面板的图标预览
    function updateEditShortcutIconPreview(iconUrl) {
        if (!editShortcutItemPreviewIcon) return;

        if (!iconUrl || !iconUrl.trim()) {
            editShortcutItemPreviewIcon.innerHTML = defaultIconSVG;
            return;
        }

        const img = new Image();
        img.onload = function() {
            editShortcutItemPreviewIcon.innerHTML = '<img src="' + iconUrl + '" style="width:32px;height:32px;">';
        };
        img.onerror = function() {
            editShortcutItemPreviewIcon.innerHTML = defaultIconSVG;
        };
        img.src = iconUrl;
    }

    // 检查编辑快捷访问面板是否有更改（比较临时数据与原始数据）
    function hasEditShortcutItemChanges() {
        if (!currentEditShortcut || !currentEditShortcut.item) return false;
        const item = currentEditShortcut.item;
        const originalData = item.originalData || item;
        return (editShortcutItemUrl?.value.trim() || '') !== (originalData.url || '') ||
               (editShortcutItemName?.value.trim() || '') !== (originalData.title || '') ||
               (editShortcutItemIcon?.value.trim() || '') !== (originalData.icon || '');
    }

    // 保存编辑的快捷访问项目（只更新内存，不写入localStorage）
    function saveEditShortcutItem(closePanel = false) {
        if (!currentEditShortcut) return false;

        const { item, tempData } = currentEditShortcut;
        const newUrl = tempData.url;
        const newName = tempData.title;
        const newIcon = tempData.icon;

        // 验证URL
        if (!newUrl) {
            sendNotice('请输入URL', 'warn');
            return false;
        }

        try {
            new URL(newUrl);
        } catch (e) {
            sendNotice('URL格式不正确', 'warn');
            return false;
        }

        // 只更新内存中的项目数据，不写入localStorage
        item.url = newUrl;
        item.title = newName || newUrl;
        item.icon = newIcon || '';

        // 更新列表显示
        renderEditShortcutList();

        // 更新外层编辑面板的更改状态
        editShortcutHasChanges = true;
        editShortcutItemHasChanges = false;

        if (closePanel) {
            closeEditShortcutItemPanel(false);
        } else {
            sendNotice('设置已应用', 'info');
        }

        return true;
    }

    // 绑定编辑快捷访问面板事件
    if (editShortcutItemClose) {
        editShortcutItemClose.addEventListener('click', () => closeEditShortcutItemPanel());
    }

    if (editShortcutItemCancel) {
        editShortcutItemCancel.addEventListener('click', () => closeEditShortcutItemPanel());
    }

    if (editShortcutItemSave) {
        editShortcutItemSave.addEventListener('click', () => saveEditShortcutItem(true));
    }

    if (editShortcutItemApply) {
        editShortcutItemApply.addEventListener('click', () => saveEditShortcutItem(false));
    }

    // URL输入变化检测
    if (editShortcutItemUrl) {
        editShortcutItemUrl.addEventListener('input', function() {
            if (currentEditShortcut && currentEditShortcut.tempData) {
                currentEditShortcut.tempData.url = this.value.trim();
            }
            editShortcutItemHasChanges = hasEditShortcutItemChanges();
        });
    }

    // 名称输入变化检测
    if (editShortcutItemName) {
        editShortcutItemName.addEventListener('input', function() {
            if (currentEditShortcut && currentEditShortcut.tempData) {
                currentEditShortcut.tempData.title = this.value.trim();
            }
            editShortcutItemHasChanges = hasEditShortcutItemChanges();
        });
    }

    // 图标输入变化检测和预览更新
    if (editShortcutItemIcon) {
        editShortcutItemIcon.addEventListener('input', function() {
            if (currentEditShortcut && currentEditShortcut.tempData) {
                currentEditShortcut.tempData.icon = this.value.trim();
            }
            editShortcutItemHasChanges = hasEditShortcutItemChanges();
            updateEditShortcutIconPreview(this.value.trim());
        });

        // 失焦时验证图标格式
        editShortcutItemIcon.addEventListener('blur', function() {
            const url = this.value.trim();
            if (url && !isValidIconUrl(url)) {
                sendNotice('图标格式不支持，请使用 ico/png/jpg 格式', 'warn');
            }
        });
    }

    // 点击遮罩层关闭
    if (editShortcutItemOverlay) {
        editShortcutItemOverlay.addEventListener('click', () => closeEditShortcutItemPanel());
    }

    // ==================== 编辑搜索引擎项目 ====================

    // 打开编辑搜索引擎项目面板
    function openEditSearchEnginePanel(engine, category, index) {
        if (!editSearchEnginePanel) return;

        // 保存原始数据到engine对象，用于外层取消时恢复
        engine.originalData = {
            title: engine.title,
            url: engine.url
        };

        // 初始化临时数据为当前引擎数据
        const tempData = {
            title: engine.title || '',
            url: engine.url || ''
        };

        currentEditSearchEngine = { engine, category, index, tempData };
        editSearchEngineHasChanges = false;

        // 填充表单数据（使用临时数据）
        if (editSearchEngineName) editSearchEngineName.value = tempData.title;
        if (editSearchEngineUrl) editSearchEngineUrl.value = tempData.url;
        if (editSearchEngineUrlError) editSearchEngineUrlError.textContent = '';

        editSearchEnginePanel.classList.add('active');
    }

    // 关闭编辑搜索引擎项目面板
    function closeEditSearchEnginePanel(checkChanges = true, discardChanges = false) {
        if (checkChanges && editSearchEngineHasChanges && !discardChanges) {
            // 有未保存的更改，提示用户
            openConfirmDialog('discard-edit-search-engine');
            return;
        }

        // 如果要丢弃更改，恢复原始数据
        if (discardChanges && currentEditSearchEngine) {
            const { engine } = currentEditSearchEngine;
            if (engine.originalData) {
                engine.title = engine.originalData.title;
                engine.url = engine.originalData.url;
            }
            renderSearchEngineLists();
        }

        if (editSearchEnginePanel) {
            editSearchEnginePanel.classList.remove('active');
            currentEditSearchEngine = null;
            editSearchEngineHasChanges = false;
        }
    }

    // 检查编辑搜索引擎面板是否有更改（比较输入框与原始数据）
    function hasEditSearchEngineChanges() {
        if (!currentEditSearchEngine || !currentEditSearchEngine.engine) return false;
        const engine = currentEditSearchEngine.engine;
        const originalData = engine.originalData || engine;
        return (editSearchEngineName?.value.trim() || '') !== (originalData.title || '') ||
               (editSearchEngineUrl?.value.trim() || '') !== (originalData.url || '');
    }

    // 保存编辑的搜索引擎项目（只更新内存，不写入localStorage）
    function saveEditSearchEngine(closePanel = false) {
        if (!currentEditSearchEngine) return false;

        const { engine, tempData } = currentEditSearchEngine;
        const newName = tempData.title;
        const newUrl = tempData.url;

        // 验证URL
        if (!newUrl) {
            sendNotice('请输入URL', 'warn');
            return false;
        }

        const validation = validateSearchEngineUrl(newUrl);
        if (!validation.valid) {
            if (editSearchEngineUrlError) editSearchEngineUrlError.textContent = validation.message;
            return false;
        }

        // 只更新内存中的引擎数据，不写入localStorage
        engine.title = newName || newUrl;
        engine.url = newUrl;

        // 标记外层设置面板有未保存的更改
        searchEngineSettingsHasInnerChanges = true;

        // 更新列表显示
        renderSearchEngineLists();

        editSearchEngineHasChanges = false;

        if (closePanel) {
            closeEditSearchEnginePanel(false);
        } else {
            sendNotice('设置已应用', 'info');
        }

        return true;
    }

    // 绑定编辑搜索引擎面板事件
    if (editSearchEngineClose) {
        editSearchEngineClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeEditSearchEnginePanel();
        });
    }

    if (editSearchEngineCancel) {
        editSearchEngineCancel.addEventListener('click', () => closeEditSearchEnginePanel());
    }

    if (editSearchEngineSave) {
        editSearchEngineSave.addEventListener('click', () => saveEditSearchEngine(true));
    }

    if (editSearchEngineApply) {
        editSearchEngineApply.addEventListener('click', () => saveEditSearchEngine(false));
    }

    // 名称输入变化检测
    if (editSearchEngineName) {
        editSearchEngineName.addEventListener('input', function() {
            if (currentEditSearchEngine && currentEditSearchEngine.tempData) {
                currentEditSearchEngine.tempData.title = this.value.trim();
            }
            editSearchEngineHasChanges = hasEditSearchEngineChanges();
        });
    }

    // URL输入变化检测和验证
    if (editSearchEngineUrl) {
        editSearchEngineUrl.addEventListener('input', function() {
            if (currentEditSearchEngine && currentEditSearchEngine.tempData) {
                currentEditSearchEngine.tempData.url = this.value.trim();
            }
            editSearchEngineHasChanges = hasEditSearchEngineChanges();
            if (editSearchEngineUrlError) editSearchEngineUrlError.textContent = '';
        });

        // 失焦验证
        editSearchEngineUrl.addEventListener('blur', function() {
            const validation = validateSearchEngineUrl(this.value);
            if (!validation.valid && editSearchEngineUrlError) {
                editSearchEngineUrlError.textContent = validation.message;
            }
        });
    }

    // 点击遮罩层关闭
    if (editSearchEngineOverlay) {
        editSearchEngineOverlay.addEventListener('click', () => closeEditSearchEnginePanel());
    }

    // ==================== 在列表中添加编辑按钮 ====================

    // 修改renderEditShortcutCategory函数，添加编辑按钮
    const originalRenderEditShortcutCategory = renderEditShortcutCategory;
    renderEditShortcutCategory = function(container, items, category) {
        container.innerHTML = '';

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'edit-shortcut-item';
            div.dataset.index = index;

            // 图标
            let iconContent;
            if (item.isPreset) {
                iconContent = item.icon;
            } else if (item.icon && item.icon.trim()) {
                iconContent = '<img src="' + encodeURI(item.icon.trim()) + '" class="favicon-img" width="32" height="32" onerror="this.classList.add(\'favicon-error\')">';
            } else {
                iconContent = defaultIconSVG;
            }

            // 操作按钮
            let actionButton = '';
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            if (category === 'visible') {
                if (item.isPreset) {
                    actionButton = `
                        <button class="edit-shortcut-toggle" data-category="${category}" data-index="${index}" title="隐藏到已隐藏">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"/>
                            </svg>
                        </button>
                    `;
                } else {
                    actionButton = `
                        <button class="edit-shortcut-delete" data-category="${category}" data-index="${index}" title="删除">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    `;
                }
            } else {
                actionButton = `
                    <button class="edit-shortcut-toggle" data-category="${category}" data-index="${index}" title="显示到显示中">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                `;
            }

            // 移动按钮（仅显示中分类有）
            let moveButtons = '';
            if (category === 'visible') {
                moveButtons = `
                    <button class="edit-shortcut-move-btn edit-shortcut-move-up" data-category="${category}" data-index="${index}" ${isFirst ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 15L12 9L6 15"/>
                        </svg>
                    </button>
                    <button class="edit-shortcut-move-btn edit-shortcut-move-down" data-category="${category}" data-index="${index}" ${isLast ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9L12 15L18 9"/>
                        </svg>
                    </button>
                `;
            }

            // 编辑按钮（仅自定义项目有）
            let editButton = '';
            if (!item.isPreset) {
                editButton = `
                    <button class="edit-shortcut-edit" data-category="${category}" data-index="${index}" title="编辑">
                        ${svgEdit}
                    </button>
                `;
            }

            div.innerHTML = `
                <div class="edit-shortcut-item-icon">${iconContent}</div>
                <div class="edit-shortcut-item-text" title="${item.title}">
                    ${item.isPreset ? '<span class="preset-tag">预设</span>' : ''}${item.title}
                </div>
                <div class="edit-shortcut-item-actions">
                    ${moveButtons}
                    ${editButton}
                    ${actionButton}
                </div>
            `;
            container.appendChild(div);
        });

        // 绑定上移按钮事件
        container.querySelectorAll('.edit-shortcut-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                moveEditShortcutItem(category, index, -1);
            });
        });

        // 绑定下移按钮事件
        container.querySelectorAll('.edit-shortcut-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                moveEditShortcutItem(category, index, 1);
            });
        });

        // 绑定删除按钮事件（自定义项目）
        container.querySelectorAll('.edit-shortcut-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                confirmDialog.dataset.category = category;
                confirmDialog.dataset.targetIndex = index;
                openConfirmDialog('delete-custom-shortcut');
            });
        });

        // 绑定切换分类按钮事件（预设项目）
        container.querySelectorAll('.edit-shortcut-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                toggleEditShortcutCategory(category, index);
            });
        });

        // 绑定编辑按钮事件（自定义项目）
        container.querySelectorAll('.edit-shortcut-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                const index = parseInt(btn.dataset.index);
                const items = category === 'visible' ? editShortcutVisibleItems : editShortcutHiddenItems;
                openEditShortcutItemPanel(items[index], category, index);
            });
        });
    };

    // 修改renderSearchEngineCategory函数，添加编辑按钮
    const originalRenderSearchEngineCategory = renderSearchEngineCategory;
    renderSearchEngineCategory = function(container, engines, category) {
        container.innerHTML = '';

        // 获取预设引擎的id列表
        const presetIds = searchEngineData.engines.slice(0, presetEngineCount).map(e => e.id);

        engines.forEach((engine, index) => {
            const item = document.createElement('div');
            item.className = 'search-engine-item';
            item.dataset.engineId = engine.id;
            const isPreset = presetIds.includes(engine.id);
            const isFirst = index === 0;
            const isLast = index === engines.length - 1;

            // 移动按钮（仅使用中分类有）
            let moveButtons = '';
            if (category === 'active') {
                moveButtons = `
                    <button class="search-engine-move-btn search-engine-move-up" title="上移" ${isFirst ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 15L12 9L6 15"/>
                        </svg>
                    </button>
                    <button class="search-engine-move-btn search-engine-move-down" title="下移" ${isLast ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9L12 15L18 9"/>
                        </svg>
                    </button>
                `;
            }

            // 根据分类生成不同的操作按钮
            let actionButtons = '';
            if (category === 'active') {
                actionButtons = `
                    <button class="search-engine-disable" title="移至未使用" data-engine-id="${engine.id}">${svgMinus}</button>
                `;
            } else if (category === 'preset') {
                actionButtons = `
                    <button class="search-engine-enable" title="移至使用中" data-engine-id="${engine.id}">${svgPlus}</button>
                    <button class="search-engine-delete" title="删除" data-engine-id="${engine.id}" disabled>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="search-engine-enable" title="移至使用中" data-engine-id="${engine.id}">${svgPlus}</button>
                    <button class="search-engine-delete" title="删除" data-engine-id="${engine.id}" ${isPreset ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                `;
            }

            // 编辑按钮（仅自定义引擎有）
            let editButton = '';
            if (!isPreset) {
                editButton = `
                    <button class="search-engine-edit" title="编辑" data-engine-id="${engine.id}">${svgEdit}</button>
                `;
            }

            item.innerHTML = `
                <div class="search-engine-item-icon">${engine.icon}</div>
                <span class="search-engine-item-name">
                    ${isPreset ? '<span class="preset-tag">预设</span>' : ''}${engine.title}
                </span>
                <div class="search-engine-item-actions">
                    ${moveButtons}
                    ${editButton}
                    ${actionButtons}
                </div>
            `;

            // 绑定上移按钮事件
            const moveUp = item.querySelector('.search-engine-move-up');
            if (moveUp) {
                moveUp.addEventListener('click', () => moveSearchEngine(engine.id, -1, category));
            }

            // 绑定下移按钮事件
            const moveDown = item.querySelector('.search-engine-move-down');
            if (moveDown) {
                moveDown.addEventListener('click', () => moveSearchEngine(engine.id, 1, category));
            }

            // 绑定移至未使用按钮事件
            const disableBtn = item.querySelector('.search-engine-disable');
            if (disableBtn) {
                disableBtn.addEventListener('click', () => disableSearchEngine(engine.id));
            }

            // 绑定移至使用中按钮事件
            const enableBtn = item.querySelector('.search-engine-enable');
            if (enableBtn) {
                enableBtn.addEventListener('click', () => enableSearchEngine(engine.id, isPreset ? 'preset' : 'custom'));
            }

            // 绑定删除按钮事件
            const deleteBtn = item.querySelector('.search-engine-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteSearchEngine(engine.id));
            }

            // 绑定编辑按钮事件
            const editBtn = item.querySelector('.search-engine-edit');
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditSearchEnginePanel(engine, category, index));
            }

            container.appendChild(item);
        });
    };

    // 添加确认对话框操作
    confirmActions['discard-edit-shortcut'] = {
        title: '放弃更改',
        message: '有未保存的更改，确定要放弃吗？',
        onOk: function() {
            editShortcutItemHasChanges = false;
            closeEditShortcutItemPanel(false, true); // true表示丢弃更改
        }
    };

    confirmActions['discard-edit-search-engine'] = {
        title: '放弃更改',
        message: '有未保存的更改，确定要放弃吗？',
        onOk: function() {
            editSearchEngineHasChanges = false;
            closeEditSearchEnginePanel(false, true);
        }
    };

    // ESC键关闭编辑面板
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;

        // 编辑快捷访问项目面板
        if (editShortcutItemPanel && editShortcutItemPanel.classList.contains('active')) {
            closeEditShortcutItemPanel();
            return;
        }

        // 编辑搜索引擎项目面板
        if (editSearchEnginePanel && editSearchEnginePanel.classList.contains('active')) {
            closeEditSearchEnginePanel();
            return;
        }
    });

    // 初始化搜索引擎设置
    loadSearchEnginesForSettings();
});