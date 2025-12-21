# HarmonyMagic起始页

一个创新的网页起始页，具有独特的搜索框设计和多引擎搜索解决方案。

## 许可证

本项目基于GPLv3许可证开源。您可以自由地使用、修改和分发本项目，但必须保留原始版权说明和许可证声明。完整的许可证文本请参见 [LICENSE](./LICENSE) 文件。

## 功能特色

### 🌟 创新搜索框设计
- **多形态搜索框**：支持圆形、展开和输入三种状态的动态切换
- **环形布局**：中央搜索框配合左右两侧共6个圆形搜索框，形成独特的视觉布局
- **动态交互**：点击展开、输入激活等流畅的动效体验

### 🔍 多引擎搜索解决方案
- **集成多种搜索引擎**：内置百度、搜狗、360搜索、Google、DuckDuckGo、MC百科等多种搜索引擎
- **智能路由**：根据用户选择的搜索框自动跳转到对应搜索引擎
- **主次搜索功能**：中央搜索框为主搜索引擎（默认为必应），圆形搜索框为特定搜索引擎

### ⏰ 实用功能
- **实时时钟**：显示精确的日期和时间，包含年月日、星期和周数
- **快捷访问**：右键呼出快捷访问菜单，提供常用网站的快速入口
- **自定义书签**：支持用户添加自定义快捷方式

## 设计亮点

### 视觉设计
- **毛玻璃效果**：搜索框采用现代化的毛玻璃（backdrop-filter）效果
- **响应式布局**：适配桌面和移动设备，提供一致的用户体验
- **优雅动效**：流畅的过渡动画，提升用户交互体验

### 用户体验
- **便捷操作**：点击搜索框即可展开，输入完成后一键搜索
- **视觉引导**：清晰的状态指示，用户可以直观了解当前操作模式
- **快速访问**：右键菜单提供常用网站的快速入口

## 技术实现

- **纯前端实现**：使用HTML、CSS和JavaScript构建，无需后端支持
- **现代CSS**：采用Flexbox和Grid布局，实现响应式设计
- **JavaScript交互**：实现复杂的搜索框展开/收起逻辑和搜索引擎切换功能

## 使用方法

1. 点击任意圆形搜索框展开输入框
2. 输入搜索内容
3. 点击搜索图标或按回车键进行搜索
4. 不同的圆形搜索框对应不同的搜索引擎
5. 右键页面任意位置可呼出快捷访问菜单

## 搜索引擎映射

- 左1圆形搜索框：百度
- 左2圆形搜索框：搜狗
- 左3圆形搜索框：360搜索
- 右1圆形搜索框：Google
- 右2圆形搜索框：DuckDuckGo
- 右3圆形搜索框：MC百科
- 中央搜索框：必应（默认）

## 项目结构

```
HarmonyMagic/
├── index.html     # 主页面
├── style.css      # 样式文件
├── script.js      # JavaScript逻辑
├── images/        # 图片资源
└── README.md      # 项目说明
```

## 部署指南

本项目为纯前端项目，可以部署在任何支持静态文件服务的Web服务器上。以下是几种常见服务器的部署方法：

### Windows IIS 部署

#### IIS组件添加步骤

##### Windows系统（启用或关闭Windows功能）
1. 打开"控制面板" → "程序" → "启用或关闭Windows功能"
2. 在弹出的窗口中勾选以下组件：
   - Internet Information Services
     - Web管理工具
       - IIS管理控制台
     - 万维网服务
       - 常见HTTP功能
         - 静态内容
         - 默认文档
       - 应用程序开发功能（如需要）
3. 点击"确定"，系统将自动安装所需组件

##### Windows Server系统（服务器管理器添加角色和功能）
1. 打开"服务器管理器"
2. 点击"管理" → "添加角色和功能"
3. 在"添加角色和功能向导"中，点击"下一步"直到"服务器角色"页面
4. 勾选"Web服务器(IIS)"角色
5. 在功能页面中，根据需要添加IIS相关功能
6. 点击"下一步" → "安装"，等待安装完成

#### 停用默认网站
1. 打开IIS管理器（在开始菜单搜索"Internet Information Services (IIS)管理器"）
2. 在左侧连接面板中展开服务器节点
3. 展开"站点"节点，右键点击"Default Web Site"
4. 选择"管理网站" → "停止"，以停用默认网站

#### 创建新站点
1. 在IIS管理器左侧连接面板中，右键点击"站点"节点
2. 选择"添加网站"
3. 在弹出的对话框中填写：
   - 网站名称：输入自定义网站名称（如"HMMC"）
   - 物理路径：选择项目文件所在目录
   - 绑定信息：
     - 类型：选择"http"
     - IP地址：可选择"全部未分配"或指定IP
     - 端口：默认为80，如与其他服务冲突可修改为8080、8000、8088等端口
     - 主机名：可选，如需域名访问则填写对应域名
4. 点击"确定"完成网站创建

#### 端口冲突解决方案
如果80端口已被其他服务占用，可通过以下方式解决：
- 修改IIS网站绑定端口：在IIS管理器中选择网站 → 右键"编辑绑定" → 修改端口为8080、8000或8088等
- 停用占用80端口的服务：在管理员命令提示符中执行 `net stop was /y` 临时停止其他服务

### Apache 部署

#### Linux 部署
1. 将项目文件复制到Apache文档根目录（通常是 `/var/www/html/` 或 `/srv/www/`）
   ```bash
   sudo cp -r /path/to/hmmc /var/www/html/
   ```
2. 确保Apache配置文件（通常是 `/etc/apache2/apache2.conf` 或 `/etc/httpd/conf/httpd.conf`）允许访问项目目录
3. 重启Apache服务
   ```bash
   sudo systemctl restart apache2  # Ubuntu/Debian
   sudo systemctl restart httpd    # CentOS/RHEL
   ```

#### Windows 部署
1. 安装Apache HTTP Server
2. 将项目文件复制到Apache文档根目录（默认是 `htdocs` 文件夹）
3. 修改 `httpd.conf` 配置文件以确保正确配置网站根目录和权限
4. 重启Apache服务

#### macOS 部署
1. 启用内置Apache（如果未启用）
   ```bash
   sudo apachectl start
   ```
2. 将项目文件复制到文档根目录（通常是 `/Library/WebServer/Documents/`）
   ```bash
   sudo cp -r /path/to/hmmc /Library/WebServer/Documents/
   ```
3. 重启Apache服务
   ```bash
   sudo apachectl restart
   ```

### Nginx 部署

#### Linux 部署
1. 将项目文件复制到Nginx文档根目录（通常是 `/usr/share/nginx/html/` 或 `/var/www/html/`）
   ```bash
   sudo cp -r /path/to/hmmc /usr/share/nginx/html/
   ```
2. 编辑Nginx配置文件（通常是 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/default`）
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;
       
       location / {
           root /usr/share/nginx/html/hmmc;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. 检查配置文件语法
   ```bash
   sudo nginx -t
   ```
4. 重启Nginx服务
   ```bash
   sudo systemctl restart nginx
   ```

#### Windows 部署
1. 下载并安装Nginx for Windows
2. 将项目文件复制到Nginx安装目录下的 `html` 文件夹
3. 修改 `conf/nginx.conf` 配置文件以配置网站
4. 通过 `nginx.exe` 启动服务或使用命令行
   ```cmd
   nginx
   ```

#### macOS 部署
1. 使用Homebrew安装Nginx
   ```bash
   brew install nginx
   ```
2. 将项目文件复制到Nginx文档根目录（通常是 `/usr/local/var/www/`）
   ```bash
   sudo cp -r /path/to/hmmc /usr/local/var/www/
   ```
3. 修改Nginx配置文件（通常是 `/usr/local/etc/nginx/nginx.conf`）
4. 启动Nginx服务
   ```bash
   sudo nginx
   ```

### 通用部署提示
- 由于本项目为纯前端项目，无需后端服务支持
- 所有文件均为静态文件，可部署在任何支持静态文件服务的服务器上
- 确保服务器配置允许访问所有必要的静态资源（HTML、CSS、JS文件）
- 对于现代Web功能，建议服务器启用Gzip压缩以提高加载速度
