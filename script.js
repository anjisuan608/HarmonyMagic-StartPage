// 主应用
document.addEventListener('DOMContentLoaded', function() {
    const searchIcon = document.querySelector('.search-icon');
    const timeDate = document.querySelector('.time-date');
    const searchBox = document.querySelector('.search-box');
    const contextMenu = document.getElementById('context-menu');
    const searchBoxesContainer = document.querySelector('.search-boxes-container');

    // 获取所有圆形搜索框
    const circleSearchBoxes = document.querySelectorAll('.search-box-circle');
    const centerSearchBox = document.querySelector('.center-0');

    // 所有搜索框按DOM顺序排列
    const allSearchBoxes = [
        ...Array.from(circleSearchBoxes)
    ];

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
                box.classList.remove('input-active');
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
            
            // 确保当前搜索框保持展开状态
            if (!box.classList.contains('expanded')) {
                expandSearchBox(box);
            }
            
            // 确保状态正确
            box.classList.add('input-active');
            currentExpandedBox = box;
            currentUninputExpandedBox = box;
            
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
        // 聚焦到输入框
        const input = box.querySelector('.circle-search-input');
        setTimeout(() => {
            input.focus();
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
        // 不再清空输入框，保留用户输入的文字
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

        contextMenu.style.top = '0';
        contextMenu.style.left = '0';
        contextMenu.style.width = '100%';
        contextMenu.style.height = '100%';

        contextMenu.classList.add('active');

        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const url = item.getAttribute('data-url');
            item.onclick = function() {
                window.open(url, '_blank');
                contextMenu.classList.remove('active');
                searchBoxContainer.style.opacity = '1';
                searchBoxContainer.style.visibility = 'visible';
            };
        });
    }

    timeDisplay.addEventListener('click', openContextMenu);
    if (dateDisplay) {
        dateDisplay.addEventListener('click', openContextMenu);
    }

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
    
    // 显示右键菜单（快捷访问）
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // 隐藏搜索框部分，但保留时间日期
        const searchBox = document.querySelector('.search-boxes-container');
        searchBox.style.opacity = '0';
        searchBox.style.visibility = 'hidden';
        
        // 设置菜单位置
        contextMenu.style.top = '0';
        contextMenu.style.left = '0';
        contextMenu.style.width = '100%';
        contextMenu.style.height = '100%';
        
        // 显示菜单
        contextMenu.classList.add('active');
        
        // 为菜单项添加点击事件（重新获取菜单项以确保包含所有动态添加的项）
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const url = item.getAttribute('data-url');
            item.onclick = function() {
                window.open(url, '_blank');
                contextMenu.classList.remove('active');
                // 重新显示搜索框
                searchBox.style.opacity = '1';
                searchBox.style.visibility = 'visible';
            };
        });
    });
    
    // 点击模糊背景关闭菜单并显示搜索框
    contextMenu.addEventListener('click', function() {
        contextMenu.classList.remove('active');
        // 重新显示搜索框
        const searchBox = document.querySelector('.search-boxes-container');
        searchBox.style.opacity = '1';
        searchBox.style.visibility = 'visible';
    });
    
    // 阻止菜单内的点击事件冒泡
    document.querySelector('.menu-items').addEventListener('click', function(e) {
        e.stopPropagation();
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
                <img src="${bookmark.url}/favicon.ico" alt="${bookmark.name}" onerror="this.style.display='none';">
                <span>${bookmark.name}</span>
            `;
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
});