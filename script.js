// 控制台ASCII字符画输出
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

            // 保存系统图标（编辑）的HTML
            const systemIconHTML = menuItemsContainer.innerHTML;

            // 系统图标的HTML模板（硬编码，避免提取错误）
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

            // 动态生成菜单项（过滤掉已删除的预设）
            const deletedPresets = JSON.parse(getCookie('deleted_presets') || '[]');
            quickAccessData.forEach(item => {
                if (deletedPresets.includes(item.id)) return;
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.setAttribute('data-url', item.url);
                                    menuItem.innerHTML = `
                                        <div class="menu-icon-wrapper">
                                            <div class="menu-item-bg"></div>
                                            <div class="menu-icon">${item.icon}</div>
                                        </div>
                                        <div class="menu-text" title="${item.title}">${item.title}</div>
                                    `;
                // 获取点击区域元素
                const menuBg = menuItem.querySelector('.menu-item-bg');
                const menuText = menuItem.querySelector('.menu-text');
                
                // 点击背景板或文字跳转
                function handleItemClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // 如果url是占位符"#"，则不打开新标签页
                    if (item.url && item.url !== '#') {
                        window.open(item.url, '_blank');
                    }
                    // 点击后关闭菜单
                    contextMenu.classList.remove('active');
                    document.documentElement.style.removeProperty('--search-box-top');
                    setBackgroundBlur(false);
                    if (settings) settings.style.display = 'none';
                    // 恢复通知位置
                    const notices = document.getElementById('notices');
                    if (notices) notices.style.top = '20px';
                }
                
                menuBg.addEventListener('click', handleItemClick);
                menuText.addEventListener('click', handleItemClick);

                menuItemsContainer.appendChild(menuItem);
            });

            // 从Cookie加载自定义快捷方式
            const customShortcuts = getCookie('custom_shortcuts') || [];
            if (customShortcuts.length > 0) {
                customShortcuts.forEach(item => {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item';
                    menuItem.setAttribute('data-url', item.url);
                    
                    // 确定图标HTML
                    let iconContent;
                    if (item.icon && item.icon.trim()) {
                        // 使用 encodeURI 避免 URL 中的特殊字符问题
                        const escapedIcon = encodeURI(item.icon.trim());
                        iconContent = '<img src="' + escapedIcon + '" style="width:32px;height:32px;" onerror="this.outerHTML=\'&lt;svg t=\\\'1768974157218\\\' class=\\\'icon\\\' viewBox=\\\'0 0 1024 1024\\\' version=\\\'1.1\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' p-id=\\\'8714\\\' width=\\\'32\\\' height=\\\'32\\\'&gt;&lt;path d=\\\'M512.704787 1022.681895c-6.566636 0-12.885487-0.746767-19.370211-0.997965l223.522968-358.091907c32.011327-42.692008 51.675057-95.154106 51.675057-152.604663 0-88.961536-45.561669-167.195974-114.530461-213.091436l322.88327 0c29.969663 65.017888 47.096842 137.184673 47.096842 213.424546C1023.98157 793.752715 795.095394 1022.681895 512.704787 1022.681895zM512.205805 256.491303c-134.523205 0-243.604451 102.347371-254.246906 233.876682L96.997133 214.338551C189.740287 84.72121 341.184526 0 512.704787 0c189.230383 0 354.100731 103.095504 442.520963 255.992321C955.22575 255.992321 302.108946 256.491303 512.205805 256.491303zM511.416716 298.145073c118.142111 0 213.88189 95.36503 213.88189 213.051163 0 117.68545-95.739779 213.093484-213.88189 213.093484-118.103885 0-213.882572-95.408034-213.882572-213.093484C297.534144 393.510103 393.312831 298.145073 511.416716 298.145073zM269.683279 590.222492c33.504179 102.303002 128.784566 176.716231 242.522526 176.716231 38.828478 0 75.283547-9.269059 108.292157-24.733419L448.229568 1018.192418c-251.87691-31.759447-446.887571-246.346465-446.887571-506.872631 0-94.739084 26.233779-183.159316 71.129911-259.235365L269.683279 590.222492z\\\' fill=\\\'#515151\\\' p-id=\\\'8715\\\'&gt;&lt;/path&gt;&lt;/svg>\'">';
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

                    // 获取点击区域元素
                    const menuBg = menuItem.querySelector('.menu-item-bg');
                    const menuText = menuItem.querySelector('.menu-text');
                    
                    // 点击背景板或文字跳转
                    function handleCustomItemClick(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (item.url && item.url !== '#') {
                            window.open(item.url, '_blank');
                        }
                        // 点击后关闭菜单
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

                    menuItemsContainer.appendChild(menuItem);
                });
            }

            // 恢复"添加"按钮
            if (addIconHTML) {
                menuItemsContainer.innerHTML += addIconHTML;
            }

            // 恢复"编辑"系统图标
            if (editIconHTML) {
                menuItemsContainer.innerHTML += editIconHTML;
            }

            // 绑定"添加"按钮点击事件
            const addIcons = menuItemsContainer.querySelectorAll('.menu-item[data-action="add"]');
            addIcons.forEach(item => {
                function handleAddClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    openAddShortcutPanel();
                }
                item.addEventListener('click', handleAddClick, true);
            });
        } catch (error) {
            console.error('Error loading quick access data:', error);
        }
    }

    // 初始化快捷访问菜单
    await loadQuickAccessMenu();

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

        allInputs.forEach(input => {
            input.addEventListener('focus', function() {
                // 如果添加面板是激活状态，不改变背景模糊
                if (!addShortcutPanel || !addShortcutPanel.classList.contains('active')) {
                    setBackgroundBlur(true);
                }
            });

            input.addEventListener('blur', function() {
                // 如果添加面板是激活状态，不关闭背景模糊
                if (addShortcutPanel && addShortcutPanel.classList.contains('active')) {
                    return;
                }

                setTimeout(() => {
                    // 检查是否还有其他输入框有焦点
                    const hasFocusedInput = Array.from(allInputs).some(inp =>
                        inp === document.activeElement || inp.contains(document.activeElement)
                    );
                    if (!hasFocusedInput) {
                        setBackgroundBlur(false);
                    }
                }, 100);
            });
        });
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
            let searchUrl = '';

            // 根据搜索框的类名确定搜索引擎
            if (box.classList.contains('left-circle-1')) {
                searchUrl = query ? `https://www.baidu.com/s?wd=${encodeURIComponent(query)}` : 'https://www.baidu.com';
            } else if (box.classList.contains('left-circle-2')) {
                searchUrl = query ? `https://www.sogou.com/web?query=${encodeURIComponent(query)}` : 'https://www.sogou.com';
            } else if (box.classList.contains('left-circle-3')) {
                searchUrl = query ? `https://www.so.com/s?q=${encodeURIComponent(query)}` : 'https://www.so.com';
            } else if (box.classList.contains('right-circle-1')) {
                searchUrl = query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : 'https://www.google.com';
            } else if (box.classList.contains('right-circle-2')) {
                searchUrl = query ? `https://duckduckgo.com/?q=${encodeURIComponent(query)}` : 'https://duckduckgo.com';
            } else if (box.classList.contains('right-circle-3')) {
                searchUrl = query ? `https://search.mcmod.cn/s?key=${encodeURIComponent(query)}` : 'https://search.mcmod.cn';
            } else {
                searchUrl = query ? `https://www.bing.com/search?q=${encodeURIComponent(query)}` : 'https://www.bing.com';
            }

            // 搜索后清空输入框，但保持展开状态
            input.value = '';
            box.classList.remove('input-active');

            // 打开搜索页面
            window.open(searchUrl, '_blank');
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
        let searchUrl = '';

        // 根据搜索框的类名确定搜索引擎
        if (box.classList.contains('left-circle-1')) {
            // 百度
            searchUrl = query ? `https://www.baidu.com/s?wd=${encodeURIComponent(query)}` : 'https://www.baidu.com';
        } else if (box.classList.contains('left-circle-2')) {
            // 搜狗
            searchUrl = query ? `https://www.sogou.com/web?query=${encodeURIComponent(query)}` : 'https://www.sogou.com';
        } else if (box.classList.contains('left-circle-3')) {
            // 360搜索
            searchUrl = query ? `https://www.so.com/s?q=${encodeURIComponent(query)}` : 'https://www.so.com';
        } else if (box.classList.contains('right-circle-1')) {
            // Google
            searchUrl = query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : 'https://www.google.com';
        } else if (box.classList.contains('right-circle-2')) {
            // duckduckgo
            searchUrl = query ? `https://duckduckgo.com/?q=${encodeURIComponent(query)}` : 'https://duckduckgo.com';
        } else if (box.classList.contains('right-circle-3')) {
            // MC百科
            searchUrl = query ? `https://search.mcmod.cn/s?key=${encodeURIComponent(query)}` : 'https://search.mcmod.cn';
        } else {
            // 默认使用必应
            searchUrl = query ? `https://www.bing.com/search?q=${encodeURIComponent(query)}` : 'https://www.bing.com';
        }

        window.open(searchUrl, '_blank');

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
        
        // 为菜单项添加点击事件（重新获取菜单项以确保包含所有动态添加的项）
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            // 处理"添加"和"编辑"按钮
            if (item.hasAttribute('data-action')) {
                const action = item.getAttribute('data-action');
                item.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (action === 'add') {
                        // 打开添加快捷方式面板
                        openAddShortcutPanel();
                    } else if (action === 'edit') {
                        // 打开编辑快捷访问面板
                        openEditShortcutPanel();
                    }
                };
                return;
            }

            const url = item.getAttribute('data-url');
            item.onclick = function() {
                window.open(url, '_blank');
                contextMenu.classList.remove('active');
                document.documentElement.style.removeProperty('--search-box-top');
                setBackgroundBlur(false); // 移除背景模糊
                // 重新显示搜索框
                searchBox.style.opacity = '1';
                searchBox.style.visibility = 'visible';
                if (settings) settings.style.display = 'none';
                // 恢复通知位置
                const notices = document.getElementById('notices');
                if (notices) notices.style.top = '20px';
            };
        });
    });
    
    // 点击快捷访问面板外空白区域关闭菜单
    document.addEventListener('click', function(e) {
        if (contextMenu.classList.contains('active') && 
            !e.target.closest('.menu-items') &&
            !e.target.closest('.settings-modal') &&
            !e.target.closest('.setting-button') &&
            !e.target.closest('#settings-close') &&
            !e.target.closest('#add-shortcut-panel')) {
            contextMenu.classList.remove('active');
            document.documentElement.style.removeProperty('--search-box-top');
            setBackgroundBlur(false); // 移除背景模糊
            // 重新显示搜索框
            const searchBox = document.querySelector('.search-boxes-container');
            searchBox.style.opacity = '1';
            searchBox.style.visibility = 'visible';
            if (settings) settings.style.display = 'none';
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
        // const wallpaperUrl = 'https://www.bing.com/th?id=OHR.SunbeamsForest_ZH-CN5358008117_1920x1080.jpg';
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

        noticesContainer.appendChild(notice);

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
    const settingButton = document.getElementById('setting-button');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    const settingsModalOverlay = document.querySelector('.settings-modal-overlay');
    const settingItems = document.querySelectorAll('.setting-item');

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

    // 点击设置按钮打开菜单
    if (settingButton) {
        settingButton.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            openSettingsModal();
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

    // 操作图标（用于需要确认的选项）
    const svgAction = '<svg t="1768966199939" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8663" width="18" height="18"><path d="M892 928.1H134c-19.9 0-36-16.1-36-36v-758c0-19.9 16.1-36 36-36h314.1c19.9 0 36 16.1 36 36s-16.1 36-36 36H170v686h686V579.6c0-19.9 16.1-36 36-36s36 16.1 36 36v312.5c0 19.9-16.1 36-36 36z" fill="#888888" p-id="8664"></path><path d="M927.9 131.6v-0.5c-0.1-1.7-0.4-3.3-0.7-4.9 0-0.1 0-0.2-0.1-0.3-0.4-1.7-0.9-3.3-1.5-4.9v-0.1c-0.6-1.6-1.4-3.1-2.2-4.6 0-0.1-0.1-0.1-0.1-0.2-0.8-1.4-1.7-2.8-2.7-4.1-0.1-0.1-0.2-0.3-0.3-0.4-0.5-0.6-0.9-1.1-1.4-1.7 0-0.1-0.1-0.1-0.1-0.2-0.5-0.6-1-1.1-1.6-1.6l-0.4-0.4c-0.5-0.5-1.1-1-1.6-1.5l-0.1-0.1c-0.6-0.5-1.2-1-1.9-1.4-0.1-0.1-0.3-0.2-0.4-0.3-1.4-1-2.8-1.8-4.3-2.6l-0.1-0.1c-1.6-0.8-3.2-1.5-4.9-2-1.6-0.5-3.3-1-5-1.2-0.1 0-0.2 0-0.3-0.1l-2.4-0.3h-0.3c-0.7-0.1-1.3-0.1-2-0.1H640.1c-19.9 0-36 16.1-36 36s16.1 36 36 36h165L487.6 487.6c-14.1 14.1-14.1 36.9 0 50.9 7 7 16.2 10.5 25.5 10.5 9.2 0 18.4-3.5 25.5-10.5L856 221v162.8c0 19.9 16.1 36 36 36s36-16.1 36-36V134.1c0-0.8 0-1.7-0.1-2.5z" fill="#888888" p-id="8665"></path></svg>';

    // 关闭按钮图标
    const svgClose = '<svg t="1768962858078" class="icon" viewBox="0 0 1070 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5514" width="20" height="20"><path d="M50.368584 96.533526l30.769579 30.77162 82.037931 82.03793 117.900068 117.900068 138.353952 138.353953 143.399585 143.397544 133.036963 133.036963 107.268128 107.268129 66.091042 66.093081 13.582195 13.580155c12.576334 12.576334 33.589257 12.576334 46.165591 0s12.576334-33.589257 0-46.165591l-30.76958-30.769579-82.03793-82.039971-117.900068-117.898028-138.353953-138.353952-143.397544-143.399585-133.036963-133.036963-107.268128-107.268128L110.11433 63.950131l-13.582196-13.580156c-12.576334-12.578374-33.589257-12.578374-46.165591 0-12.576334 12.576334-12.576334 33.587217 0.002041 46.163551z" fill="" p-id="5515"></path><path d="M882.805987 50.369975l-30.76958 30.76958-82.03997 82.03793-117.898028 117.900068-138.353953 138.353953-143.399584 143.399584-133.036963 133.036963-107.268129 107.268129a2018478.867876 2018478.867876 0 0 1-66.093081 66.091041l-13.580156 13.582196c-12.578374 12.576334-12.578374 33.589257 0 46.165591 12.576334 12.576334 33.589257 12.576334 46.165591 0l30.77162-30.76958 82.037931-82.03793 117.900068-117.900068 138.353952-138.353953 143.397545-143.397544 133.036962-133.036963 107.268129-107.268129 66.093081-66.091041 13.580156-13.582196c12.576334-12.576334 12.576334-33.589257 0-46.16559-12.578374-12.580414-33.589257-12.580414-46.165591-0.002041z" fill="" p-id="5516"></path></svg>';

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
                // 执行重置壁纸逻辑
                sendNotice('壁纸已重置为默认', 'info');
            }
        },
        'reset-shortcuts': {
            title: '重置快捷访问',
            message: '确定要重置快捷访问吗？这将删除所有自定义快捷方式。',
            onOk: function() {
                // 删除快捷访问cookie
                setCookie('custom_shortcuts', []);
                // 关闭编辑面板
                closeEditShortcutPanel();
                // 重新加载菜单
                loadQuickAccessMenu();
                sendNotice('快捷访问已重置', 'info');
            }
        },
        'discard-changes': {
            title: '放弃更改',
            message: '有未保存的更改，确定要放弃吗？',
            onOk: function() {
                closeEditShortcutPanel();
            }
        },
        'delete-preset-shortcut': {
            title: '删除预制快捷访问',
            message: '这是预制快捷访问，确定要删除吗？删除后可通过还原按钮恢复。',
            onOk: function() {
                const index = parseInt(confirmDialog.dataset.targetIndex);
                const item = editShortcutItems[index];
                // 记录被删除的预设
                const deletedPresets = JSON.parse(getCookie('deleted_presets') || '[]');
                if (!deletedPresets.includes(item.presetId)) {
                    deletedPresets.push(item.presetId);
                    setCookie('deleted_presets', deletedPresets);
                }
                // 从列表中移除
                editShortcutItems.splice(index, 1);
                editShortcutHasChanges = true;
                renderEditShortcutList();
            }
        },
        'delete-custom-shortcut': {
            title: '删除快捷访问',
            message: '确定要删除该快捷访问吗？',
            onOk: function() {
                const index = parseInt(confirmDialog.dataset.targetIndex);
                editShortcutItems.splice(index, 1);
                editShortcutHasChanges = true;
                renderEditShortcutList();
            }
        },
        'restore-deleted-presets': {
            title: '还原预制快捷访问',
            message: '确定要还原所有被删除的预制快捷访问吗？',
            onOk: function() {
                const deletedPresets = JSON.parse(getCookie('deleted_presets') || '[]');
                if (deletedPresets.length === 0) {
                    sendNotice('没有需要还原的预制快捷访问', 'info');
                    return;
                }
                // 重新加载预设并过滤掉被删除的
                const allPresets = loadPresetShortcuts();
                const presetsToRestore = allPresets.filter(p => deletedPresets.includes(p.presetId));
                // 按id正序排序
                presetsToRestore.sort((a, b) => a.presetId.localeCompare(b.presetId, undefined, {numeric: true}));
                // 添加到列表最下面
                presetsToRestore.forEach(preset => {
                    editShortcutItems.push(preset);
                });
                // 清空已删除记录
                setCookie('deleted_presets', []);
                editShortcutHasChanges = true;
                renderEditShortcutList();
                sendNotice(`已还原 ${presetsToRestore.length} 个预制快捷访问`, 'info');
            }
        }
    };

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

    // ESC键关闭确认对话框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmDialog && confirmDialog.classList.contains('active')) {
            closeConfirmDialog();
        }
    });

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
    function closeAddShortcutPanel() {
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
            
            // 保存到Cookie
            const customShortcuts = getCookie('custom_shortcuts') || [];
            const newShortcut = {
                id: Date.now(),
                url: url,
                title: name || url,
                icon: icon || ''
            };
            customShortcuts.push(newShortcut);
            setCookie('custom_shortcuts', customShortcuts);
            
            sendNotice('快捷方式已保存', 'info');
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

    // ESC键关闭添加面板
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && addShortcutPanel && addShortcutPanel.classList.contains('active')) {
            closeAddShortcutPanel();
        }
    });

    // 编辑快捷访问面板相关
    const editShortcutPanel = document.getElementById('edit-shortcut-panel');
    const editShortcutClose = document.getElementById('edit-shortcut-close');
    const editShortcutReset = document.getElementById('edit-shortcut-reset');
    const editShortcutRestore = document.getElementById('edit-shortcut-restore');
    const editShortcutList = document.getElementById('edit-shortcut-list');
    const editShortcutCancel = document.getElementById('edit-shortcut-cancel');
    const editShortcutApply = document.getElementById('edit-shortcut-apply');
    const editShortcutOk = document.getElementById('edit-shortcut-ok');
    const editShortcutOverlay = editShortcutPanel ? editShortcutPanel.querySelector('.settings-modal-overlay') : null;

    let editShortcutItems = []; // 当前编辑的项目列表
    let editShortcutOriginalOrder = []; // 原始顺序，用于检测更改
    let editShortcutHasChanges = false; // 是否有更改

    // 打开编辑快捷访问面板
    function openEditShortcutPanel() {
        if (editShortcutPanel) {
            // 加载所有快捷方式
            editShortcutItems = loadAllShortcuts();
            // 保存原始顺序
            editShortcutOriginalOrder = editShortcutItems.map(item => item.id);
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

    // 加载所有快捷方式（预设 + 自定义）
    function loadAllShortcuts() {
        const items = [];
        const deletedPresets = JSON.parse(getCookie('deleted_presets') || '[]');
        // 加载预设快捷方式（过滤掉已删除的）
        quickAccessData.forEach(item => {
            if (deletedPresets.includes(item.id)) return;
            items.push({
                id: 'preset_' + item.id,
                presetId: item.id,
                url: item.url,
                title: item.title,
                icon: item.icon,
                isPreset: true
            });
        });
        // 加载自定义快捷方式
        const customShortcuts = getCookie('custom_shortcuts') || [];
        customShortcuts.forEach(item => {
            items.push({
                id: 'custom_' + item.id,
                customId: item.id,
                url: item.url,
                title: item.title,
                icon: item.icon,
                isPreset: false
            });
        });
        return items;
    }

    // 渲染编辑列表
    function renderEditShortcutList() {
        if (!editShortcutList) return;
        editShortcutList.innerHTML = '';
        
        editShortcutItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'edit-shortcut-item';
            div.dataset.index = index;
            
            // 图标
            let iconContent;
            if (item.icon && item.icon.trim()) {
                iconContent = '<img src="' + encodeURI(item.icon.trim()) + '" style="width:32px;height:32px;" onerror="this.outerHTML=\'&lt;svg t=\\\'1768974157218\\\' class=\\\'icon\\\' viewBox=\\\'0 0 1024 1024\\\' version=\\\'1.1\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' p-id=\\\'8714\\\' width=\\\'32\\\' height=\\\'32\\\'&gt;&lt;path d=\\\'M512.704787 1022.681895c-6.566636 0-12.885487-0.746767-19.370211-0.997965l223.522968-358.091907c32.011327-42.692008 51.675057-95.154106 51.675057-152.604663 0-88.961536-45.561669-167.195974-114.530461-213.091436l322.88327 0c29.969663 65.017888 47.096842 137.184673 47.096842 213.424546C1023.98157 793.752715 795.095394 1022.681895 512.704787 1022.681895zM512.205805 256.491303c-134.523205 0-243.604451 102.347371-254.246906 233.876682L96.997133 214.338551C189.740287 84.72121 341.184526 0 512.704787 0c189.230383 0 354.100731 103.095504 442.520963 255.992321C955.22575 255.992321 302.108946 256.491303 512.205805 256.491303zM511.416716 298.145073c118.142111 0 213.88189 95.36503 213.88189 213.051163 0 117.68545-95.739779 213.093484-213.88189 213.093484-118.103885 0-213.882572-95.408034-213.882572-213.093484C297.534144 393.510103 393.312831 298.145073 511.416716 298.145073zM269.683279 590.222492c33.504179 102.303002 128.784566 176.716231 242.522526 176.716231 38.828478 0 75.283547-9.269059 108.292157-24.733419L448.229568 1018.192418c-251.87691-31.759447-446.887571-246.346465-446.887571-506.872631 0-94.739084 26.233779-183.159316 71.129911-259.235365L269.683279 590.222492z\\\' fill=\\\'#515151\\\' p-id=\\\'8715\\\'&gt;&lt;/path&gt;&lt;/svg>\'">';
            } else {
                iconContent = defaultIconSVG;
            }
            
            div.innerHTML = `
                <div class="edit-shortcut-item-icon">${iconContent}</div>
                <div class="edit-shortcut-item-text" title="${item.title}">
                    ${item.isPreset ? '<span class="preset-tag">预制</span>' : ''}${item.title}
                </div>
                <div class="edit-shortcut-item-actions">
                    <button class="edit-shortcut-move-btn edit-shortcut-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 15L12 9L6 15"/>
                        </svg>
                    </button>
                    <button class="edit-shortcut-move-btn edit-shortcut-move-down" data-index="${index}" ${index === editShortcutItems.length - 1 ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9L12 15L18 9"/>
                        </svg>
                    </button>
                    <button class="edit-shortcut-move-btn edit-shortcut-delete" data-index="${index}" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            `;
            editShortcutList.appendChild(div);
        });
        
        // 绑定移动按钮事件
        document.querySelectorAll('.edit-shortcut-move-up').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                if (index > 0) {
                    const temp = editShortcutItems[index];
                    editShortcutItems[index] = editShortcutItems[index - 1];
                    editShortcutItems[index - 1] = temp;
                    editShortcutHasChanges = true;
                    renderEditShortcutList();
                }
            });
        });
        
        document.querySelectorAll('.edit-shortcut-move-down').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                if (index < editShortcutItems.length - 1) {
                    const temp = editShortcutItems[index];
                    editShortcutItems[index] = editShortcutItems[index + 1];
                    editShortcutItems[index + 1] = temp;
                    editShortcutHasChanges = true;
                    renderEditShortcutList();
                }
            });
        });
        
        document.querySelectorAll('.edit-shortcut-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                const item = editShortcutItems[index];
                confirmDialog.dataset.targetIndex = index;
                if (item.isPreset) {
                    openConfirmDialog('delete-preset-shortcut');
                } else {
                    openConfirmDialog('delete-custom-shortcut');
                }
            });
        });
        
        // 阻止编辑面板内的点击事件冒泡
        editShortcutList.querySelectorAll('.edit-shortcut-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }

    // 保存快捷访问顺序
    function saveShortcutOrder() {
        // 获取预设项目（保持相对顺序）
        const presetItems = editShortcutItems.filter(item => item.isPreset);
        const customItems = editShortcutItems.filter(item => !item.isPreset);
        
        // 保存预设顺序到新cookie
        const presetOrder = presetItems.map(item => item.presetId);
        setCookie('quick_access_order', presetOrder);
        
        // 保存自定义快捷方式（按新顺序）
        const newCustomShortcuts = customItems.map(item => ({
            id: item.customId,
            url: item.url,
            title: item.title,
            icon: item.icon
        }));
        setCookie('custom_shortcuts', newCustomShortcuts);
    }

    // 点击关闭按钮
    if (editShortcutClose) {
        editShortcutClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeEditShortcutPanel();
        });
    }

    // 点击重置按钮
    if (editShortcutReset) {
        editShortcutReset.addEventListener('click', function(e) {
            e.stopPropagation();
            // 使用确认对话框
            openConfirmDialog('reset-shortcuts');
        });
    }

    // 点击还原按钮
    if (editShortcutRestore) {
        editShortcutRestore.addEventListener('click', function(e) {
            e.stopPropagation();
            const deletedPresets = JSON.parse(getCookie('deleted_presets') || '[]');
            if (deletedPresets.length === 0) {
                sendNotice('没有需要还原的预制快捷访问', 'info');
                return;
            }
            openConfirmDialog('restore-deleted-presets');
        });
    }

    // 点击取消按钮
    if (editShortcutCancel) {
        editShortcutCancel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                openConfirmDialog('discard-changes');
            } else {
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
                closeEditShortcutPanel();
            }
        });
    }

    // 点击应用按钮
    if (editShortcutApply) {
        editShortcutApply.addEventListener('click', function(e) {
            e.stopPropagation();
            saveShortcutOrder();
            editShortcutHasChanges = false;
            editShortcutOriginalOrder = editShortcutItems.map(item => item.id);
            loadQuickAccessMenu();
            sendNotice('设置已应用', 'info');
        });
    }

    // 点击确定按钮
    if (editShortcutOk) {
        editShortcutOk.addEventListener('click', function(e) {
            e.stopPropagation();
            saveShortcutOrder();
            loadQuickAccessMenu();
            closeEditShortcutPanel();
            sendNotice('设置已保存', 'info');
        });
    }

    // 点击遮罩层关闭
    if (editShortcutOverlay) {
        editShortcutOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            if (editShortcutHasChanges) {
                if (confirm('有未保存的更改，确定要放弃吗？')) {
                    closeEditShortcutPanel();
                }
            } else {
                closeEditShortcutPanel();
            }
        });
    }

    // ESC键关闭编辑面板
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editShortcutPanel && editShortcutPanel.classList.contains('active')) {
            if (editShortcutHasChanges) {
                if (confirm('有未保存的更改，确定要放弃吗？')) {
                    closeEditShortcutPanel();
                }
            } else {
                closeEditShortcutPanel();
            }
        }
    });

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
        settingItems.forEach(item => {
            const indicator = item.querySelector('.status-indicator');
            const icon = item.querySelector('.status-icon');
            if (indicator && icon) {
                if (indicator.classList.contains('enabled')) {
                    icon.innerHTML = svgOn;
                } else {
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
            if (indicator && icon) {
                indicator.classList.toggle('enabled');
                if (indicator.classList.contains('enabled')) {
                    icon.innerHTML = svgOn;
                } else {
                    icon.innerHTML = svgOff;
                }
            }
        });
    });

    // ESC键关闭设置菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('active')) {
            closeSettingsModal();
        }
    });

    // 打开设置菜单时初始化图标
    const originalOpenSettingsModal = openSettingsModal;
    openSettingsModal = function() {
        originalOpenSettingsModal();
        initSettingItems();
    }
});