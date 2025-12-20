// 主应用
document.addEventListener('DOMContentLoaded', function() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchIcon = document.querySelector('.search-icon');
    const container = document.querySelector('.container');
    const contextMenu = document.getElementById('context-menu');
    
    // 设置默认搜索引擎为必应
    let currentEngine = 'bing';
    
    // 搜索功能 - 点击按钮
    searchBtn.addEventListener('click', performSearch);
    
    // 搜索功能 - 按回车键
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 搜索框获得焦点时只显示搜索按钮，搜索图标始终显示
    searchInput.addEventListener('focus', function() {
        searchBtn.style.opacity = '1';
        searchBtn.style.visibility = 'visible';
    });
    
    // 搜索框失去焦点且为空时只隐藏搜索按钮，搜索图标始终显示
    searchInput.addEventListener('blur', function() {
        if (searchInput.value.trim() === '') {
            setTimeout(() => {
                if (document.activeElement !== searchBtn) {
                    searchBtn.style.opacity = '0';
                    searchBtn.style.visibility = 'hidden';
                }
            }, 100);
        }
    });
    
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
    
    // 为搜索按钮添加多种搜索引擎选项（右键菜单或下拉菜单）
    const engines = ['bing', 'google', 'baidu'];
    let engineIndex = 0; // 默认为bing
    
    searchBtn.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        engineIndex = (engineIndex + 1) % engines.length;
        currentEngine = engines[engineIndex];
        // 搜索按钮使用SVG图标，无需修改文本
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
    const menuItems = document.querySelectorAll('.menu-item');
    
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
        
        // 为菜单项添加点击事件
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
        const fixedItems = Array.from(menuItemsContainer.children).slice(0, 24); // 前24个是固定的
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