// 主应用
document.addEventListener('DOMContentLoaded', function() {
    const searchIcon = document.querySelector('.search-icon');
    const container = document.querySelector('.container');
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

    // 窗口大小变化时处理
    window.addEventListener('resize', function() {
        if (!isMobile()) {
            // 恢复桌面布局
            searchBoxesContainer.classList.remove('left-expanded', 'center-expanded', 'right-expanded');
        }
    });
    
    // 圆形搜索框点击展开逻辑
    circleSearchBoxes.forEach(box => {
        const circleInput = box.querySelector('.circle-search-input');
        const circleBtn = box.querySelector('.circle-search-btn');

        // 点击圆形搜索框展开
        box.addEventListener('click', function(e) {
            // 如果点击的是输入框或按钮，不触发展开/收缩逻辑
            if (e.target === circleInput || e.target === circleBtn || circleBtn.contains(e.target)) {
                return;
            }

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
                // 记录当前搜索框
                const wasCurrentBox = (box === currentUninputExpandedBox);
                
                collapseSearchBox(box);
                currentExpandedBox = null;
                currentUninputExpandedBox = null;
                setMobileLayout(null);
                
                // 如果是在移动端，需要确保其他搜索框也正确处理
                if (isMobile() && wasCurrentBox) {
                    // 强制重新计算布局
                    setTimeout(() => {
                        if (!currentUninputExpandedBox) {
                            searchBoxesContainer.classList.remove('left-expanded', 'center-expanded', 'right-expanded');
                        }
                    }, 50);
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
        circleInput.addEventListener('blur', function() {
            box.classList.remove('input-active');
            setTimeout(() => {
                if (document.activeElement !== circleBtn && document.activeElement !== circleInput) {
                    // 如果输入框为空，则转为未输入展开状态而不是完全收缩
                    if (circleInput.value.trim() === '') {
                        // 记录这个搜索框为上一次输入展开的搜索框
                        lastInputActiveBox = box;

                        // 如果当前没有其他搜索框处于未输入展开状态，则保持当前搜索框为未输入展开状态
                        if (!currentUninputExpandedBox || currentUninputExpandedBox === box) {
                            box.classList.remove('input-active');
                            // 保持展开状态但移除输入激活状态
                            currentUninputExpandedBox = box;
                        } else {
                            // 如果已经有其他搜索框处于未输入展开状态，则完全收缩当前搜索框
                            collapseSearchBox(box);
                            currentExpandedBox = null;
                            currentUninputExpandedBox = null;
                            setMobileLayout(null);
                        }
                    }
                }
            }, 100);
        });
        
        // 圆形搜索框按钮聚焦事件
        circleBtn.addEventListener('focus', function() {
            box.classList.add('input-active');
        });
        
        // 圆形搜索框按钮失焦事件
        circleBtn.addEventListener('blur', function() {
            setTimeout(() => {
                if (document.activeElement !== circleInput) {
                    if (circleInput.value.trim() === '') {
                        // 记录这个搜索框为上一次输入展开的搜索框
                        lastInputActiveBox = box;

                        // 如果当前没有其他搜索框处于未输入展开状态，则保持当前搜索框为未输入展开状态
                        if (!currentUninputExpandedBox || currentUninputExpandedBox === box) {
                            box.classList.remove('input-active');
                            // 保持展开状态但移除输入激活状态
                            currentUninputExpandedBox = box;
                        } else {
                            // 如果已经有其他搜索框处于未输入展开状态，则完全收缩当前搜索框
                            collapseSearchBox(box);
                            currentExpandedBox = null;
                            currentUninputExpandedBox = null;
                            setMobileLayout(null);
                        }
                    }
                }
            }, 100);
        });
        
        // 圆形搜索框按钮点击事件
        circleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            performCircleSearch(box);
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
        currentUninputExpandedBox = box;
        // 聚焦到输入框
        const input = box.querySelector('.circle-search-input');
        setTimeout(() => {
            input.focus();
        }, 300);
    }
    
    // 收缩圆形搜索框
    function collapseSearchBox(box) {
        box.classList.remove('expanded', 'input-active');
        if (currentUninputExpandedBox === box) {
            currentUninputExpandedBox = null;
        }
        const input = box.querySelector('.circle-search-input');
        input.value = '';
    }
    
    // 执行圆形搜索框的搜索
    function performCircleSearch(box) {
        const input = box.querySelector('.circle-search-input');
        const query = input.value.trim();
        if (query) {
            let searchUrl = '';
            
            // 根据搜索框的类名确定搜索引擎
            if (box.classList.contains('left-circle-1')) {
                // 百度
                searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
            } else if (box.classList.contains('left-circle-2')) {
                // 搜狗
                searchUrl = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
            } else if (box.classList.contains('left-circle-3')) {
                // 360搜索
                searchUrl = `https://www.so.com/s?q=${encodeURIComponent(query)}`;
            } else if (box.classList.contains('right-circle-1')) {
                // Google
                searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            } else if (box.classList.contains('right-circle-2')) {
                // duckduckgo
                searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            } else if (box.classList.contains('right-circle-3')) {
                // MC百科
                searchUrl = `https://search.mcmod.cn/s?key=${encodeURIComponent(query)}`;
            } else {
                // 默认使用必应
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            }
            
            window.location.href = searchUrl;
        }
    }
    
    // 展开中间搜索框
    function expandCenterSearchBox() {
        centerSearchBox.classList.add('expanded');
        // 聚焦到输入框
        setTimeout(() => {
            centerSearchBox.querySelector('.circle-search-input').focus();
        }, 300);
    }
    
    // 收缩中间搜索框
    function collapseCenterSearchBox() {
        collapseSearchBox(centerSearchBox);
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
});