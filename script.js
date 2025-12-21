// 主应用
document.addEventListener('DOMContentLoaded', function() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchIcon = document.querySelector('.search-icon');
    const container = document.querySelector('.container');
    const contextMenu = document.getElementById('context-menu');
    
    // 获取所有圆形搜索框
    const circleSearchBoxes = document.querySelectorAll('.search-box-circle');
    
    // 设置默认搜索引擎为必应
    let currentEngine = 'bing';
    
    // 当前展开的搜索框
    let currentExpandedBox = null;
    
    // 上一次处于输入展开状态的搜索框
    let lastInputActiveBox = document.querySelector('.search-container-shortened');
    
    // 当前处于未输入展开状态的搜索框
    let currentUninputExpandedBox = document.querySelector('.search-container-shortened');
    
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
                collapseSearchBox(box);
                currentExpandedBox = null;
                currentUninputExpandedBox = null;
            } else {
                // 检查中间搜索框是否展开，如果是则收缩它
                const centerContainer = document.querySelector('.search-container-shortened');
                if (centerContainer.classList.contains('expanded')) {
                    centerContainer.classList.remove('expanded');
                    searchBtn.style.opacity = '0';
                    searchBtn.style.visibility = 'hidden';
                    if (searchInput.value.trim() === '') {
                        searchInput.value = '';
                    }
                    currentUninputExpandedBox = null;
                }
                
                expandSearchBox(box);
                currentExpandedBox = box;
            }
        });
        
        // 圆形搜索框输入框聚焦事件
        circleInput.addEventListener('focus', function() {
            if (!box.classList.contains('expanded')) {
                // 如果点击的是输入框且搜索框未展开，则展开它
                if (currentExpandedBox && currentExpandedBox !== box) {
                    collapseSearchBox(currentExpandedBox);
                }
                
                // 检查中间搜索框是否展开，如果是则收缩它
                const centerContainer = document.querySelector('.search-container-shortened');
                if (centerContainer.classList.contains('expanded')) {
                    centerContainer.classList.remove('expanded');
                    searchBtn.style.opacity = '0';
                    searchBtn.style.visibility = 'hidden';
                    if (searchInput.value.trim() === '') {
                        searchInput.value = '';
                    }
                }
                
                expandSearchBox(box);
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
        // 聚焦到输入框
        const input = box.querySelector('.circle-search-input');
        setTimeout(() => {
            input.focus();
        }, 300);
    }
    
    // 收缩圆形搜索框
    function collapseSearchBox(box) {
        box.classList.remove('expanded', 'input-active');
        const input = box.querySelector('.circle-search-input');
        input.value = '';
    }
    
    // 执行圆形搜索框的搜索
    function performCircleSearch(box) {
        const input = box.querySelector('.circle-search-input');
        const query = input.value.trim();
        if (query) {
            let searchUrl = '';
            switch(currentEngine) {
                case 'google':
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'baidu':
                    searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                    break;
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            }
            
            window.location.href = searchUrl;
        }
    }
    
    // 搜索功能 - 点击按钮
    searchBtn.addEventListener('click', performSearch);
    
    // 搜索功能 - 按回车键
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 获取搜索框容器
    const searchContainer = document.querySelector('.search-container-shortened');
    
    // 点击中间搜索框容器展开/收缩
    searchContainer.addEventListener('click', function(e) {
        // 如果点击的是输入框或按钮，不触发展开/收缩逻辑
        if (e.target === searchInput || e.target === searchBtn || searchBtn.contains(e.target)) {
            return;
        }
        
        // 如果当前已经有展开的搜索框且不是当前点击的，则先关闭它
        if (currentExpandedBox) {
            collapseSearchBox(currentExpandedBox);
            currentExpandedBox = null;
        }
        
        // 如果当前有未输入展开状态的搜索框且不是当前点击的，则先关闭它
        if (currentUninputExpandedBox && currentUninputExpandedBox !== searchContainer) {
            if (currentUninputExpandedBox.classList.contains('expanded')) {
                collapseSearchBox(currentUninputExpandedBox);
            }
            currentUninputExpandedBox = null;
        }
        
        // 切换中间搜索框的展开状态
        if (searchContainer.classList.contains('expanded')) {
            collapseCenterSearchBox();
            currentUninputExpandedBox = null;
        } else {
            expandCenterSearchBox();
        }
    });
    
    // 搜索框获得焦点时展开搜索框
    searchInput.addEventListener('focus', function() {
        // 如果有圆形搜索框展开，则关闭它
        if (currentExpandedBox) {
            collapseSearchBox(currentExpandedBox);
            currentExpandedBox = null;
        }
        
        expandCenterSearchBox();
        searchContainer.classList.add('input-active');
    });
    
    // 搜索框输入事件
    searchInput.addEventListener('input', function() {
        if (searchInput.value.trim() !== '') {
            searchContainer.classList.add('input-active');
        } else {
            searchContainer.classList.remove('input-active');
        }
    });
    
    // 搜索框失去焦点时收缩搜索框（如果输入框为空）
    searchInput.addEventListener('blur', function() {
        searchContainer.classList.remove('input-active');
        // 使用setTimeout确保在点击搜索按钮等元素时不会立即收缩
        setTimeout(() => {
            if (document.activeElement !== searchBtn && document.activeElement !== searchInput) {
                if (searchInput.value.trim() === '') {
                    // 记录这个搜索框为上一次输入展开的搜索框
                    lastInputActiveBox = searchContainer;
                    
                    // 如果当前没有其他搜索框处于未输入展开状态，则保持当前搜索框为未输入展开状态
                    if (!currentUninputExpandedBox || currentUninputExpandedBox === searchContainer) {
                        // 保持展开状态但移除输入激活状态
                        currentUninputExpandedBox = searchContainer;
                    } else {
                        // 如果已经有其他搜索框处于未输入展开状态，则完全收缩当前搜索框
                        collapseCenterSearchBox();
                    }
                }
            }
        }, 100);
    });
    
    // 如果点击了搜索按钮，也要保持搜索框展开状态
    searchBtn.addEventListener('focus', function() {
        searchContainer.classList.add('input-active');
    });
    
    searchBtn.addEventListener('blur', function() {
        setTimeout(() => {
            if (document.activeElement !== searchInput) {
                if (searchInput.value.trim() === '') {
                    // 记录这个搜索框为上一次输入展开的搜索框
                    lastInputActiveBox = searchContainer;
                    
                    // 如果当前没有其他搜索框处于未输入展开状态，则保持当前搜索框为未输入展开状态
                    if (!currentUninputExpandedBox || currentUninputExpandedBox === searchContainer) {
                        // 保持展开状态但移除输入激活状态
                        currentUninputExpandedBox = searchContainer;
                    } else {
                        // 如果已经有其他搜索框处于未输入展开状态，则完全收缩当前搜索框
                        collapseCenterSearchBox();
                    }
                }
            }
        }, 100);
    });
    
    // 展开中间搜索框
    function expandCenterSearchBox() {
        searchContainer.classList.add('expanded');
        // 聚焦到输入框
        setTimeout(() => {
            searchInput.focus();
        }, 300);
    }
    
    // 收缩中间搜索框
    function collapseCenterSearchBox() {
        searchContainer.classList.remove('expanded', 'input-active');
        searchInput.value = '';
    }
    
    // 执行搜索
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            let searchUrl = '';
            switch(currentEngine) {
                case 'google':
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'baidu':
                    searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                    break;
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            }
            
            window.location.href = searchUrl;
        }
    }
    
    // 可选：添加更多搜索引擎
    function performSearchWithEngine(engine = 'bing') {
        const query = searchInput.value.trim();
        if (!query) return;
        
        let searchUrl = '';
        switch(engine) {
            case 'google':
                searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                break;
            case 'baidu':
                searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                break;
            case 'bing':
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                break;
            default:
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        }
        
        window.location.href = searchUrl;
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