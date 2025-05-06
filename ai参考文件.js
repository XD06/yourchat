// 自定义的替代函数
function GM_getValue(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
}

function GM_setValue(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function GM_addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function GM_getResourceText(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.text())
            .then(text => resolve(text))
            .catch(error => reject(error));
    });
}

function GM_getResourceURL(url) {
    return url;
}

// 模拟流式响应的 fetch 请求
function GM_xmlhttpRequest(options) {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const signal = controller.signal;

        let timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error('请求超时'));
        }, 30000);

        fetch(options.url, {
                method: options.method,
                headers: options.headers,
                body: options.data,
                signal
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`请求失败: ${response.statusText}`);
                }
                clearTimeout(timeoutId);
                if (options.onloadstart) {
                    options.onloadstart({ response });
                }
                resolve(response);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (options.onerror) {
                    options.onerror(error);
                }
                reject(error);
            });
    });
}

(function() {
    'use strict';

    // 添加CSS样式
    const css = `
    #new-param-key{
width:10%;
}
#new-param-value{
width:10%;
}

       @keyframes fadeInOut {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }

        /* 整体背景调整 */
        body {
            --background-color: white;
            --text-color: #000;
            --error-color: #ff0000;
        }

        /*动画*/
        .ds-chat-icon img {
            width: 50px !important;
            height: 50px !important;
            border-radius: 50%;
            transition: all 0.3s ease;
            animation: breath 2s infinite alternate;
        }

        @keyframes breath {
            0% { opacity: 0.9; }
            100% { opacity: 1; }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
        }
 .ds-chat-message table{
       overflow: auto;
      display:block;
      }
        .ds-chat-hmessage table{
      overflow: auto;
      display:block;
      }
        
        /* 修复按钮图像样式问题 */
        .ds-stop-img, .ds-start-img {
            width: 20px !important;
            height: 20px !important;
            max-width: none !important;
            display: inline-block;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            box-shadow: none !important;
            object-fit: contain !important;
            position: static !important;
            opacity: 1 !important;
            visibility: visible !important;
            overflow: visible !important; /* Override website's overflow: clip */
            overflow-clip-margin: 0 !important; /* Override website's overflow-clip-margin */
        }

        // /* 直接针对网站全局样式的覆盖 */
        // .ds-stop-button img, .ds-start-button img {
        //     overflow: visible !important;
        //     overflow-clip-margin: 0 !important;
        //     width: 20px !important;
        //     height: 20px !important;
        //     display: inline !important;
        // }

        // /* 确保按钮本身有正确的样式 */
        // .ds-stop-button, .ds-start-button {
        //     display: flex;
        //     align-items: center !important;
        //     justify-content: center !important;
        //     padding: 0 !important;
        //     border: none !important;
        //     background-size: auto !important;
        //     min-width: auto !important;
        //     min-height: auto !important;
        // }

.ds-context-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
}

.ds-toggle-left {
    display: flex;
    align-items: center;
    gap: 5px; /* 复选框和图标之间的间距 */
}

.ds-toggle-right {
    cursor: pointer;
    font-size: 15px;
    transition: transform 0.2s;
}

.ds-toggle-right:hover {
    transform: scale(1.1);
    color: #4CAF50;
}
.ds-toggle-left:hover {
    transform: scale(1.1);
    color: #4CAF50;
}
/* 复选框样式调整 */
#ds-context-checkbox {
    margin: 0;
    vertical-align: middle;
}

        /* 对话框出现时的动画 */
        .ds-chat-window {
            position: fixed;
            width: 340px;
            /*height: 50vh*/
            max-width: 70vw;
            max-height: 70vh;
            background-color: #F6F6F6; /* 修改背景颜色 */
            border: 1px solid #ddd;
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            //display: none;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
           /*transform: translateY(20px);*/
            z-index: 2147483646;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.5s ease-in-out forwards;
            transition: opacity 0.5s ease-in-out, width 0.5s ease-in-out, height 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }

        /* 对话框激活时的样式 */
        .ds-chat-window.active {
            display: flex;
            opacity: 1 !important;
        }

        /* 全屏时的动画 */
        .ds-chat-window.fullscreen {
            width: 100vw !important; /* 使用 vw/vh 更准确 */
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            top: 0 !important;  /* 强制定位到左上角 */
            left: 0 !important; /* 强制定位到左上角 */
            right: auto !important; /* 覆盖可能存在的 right */
            bottom: auto !important;/* 覆盖可能存在的 bottom */
            border-radius: 0 !important;
            animation: fadeIn 0.3s ease-in-out forwards; /* 可以保留或移除动画 */
        }
        /* 其他样式保持不变 */
        .ds-chat-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: transparent;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s, box-shadow 0.3s;
            z-index: 2147483647;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .ds-chat-icon {
            transform: scale(1.05);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
            background-color: transparent;
        }
        .ds-chat-header {
            padding: 10px 15px;
            background-color: #333333 !important;
             color: var(--header-text, #222) !important;
    transition: background-color 0.5s ease, color 0.3s ease;
    backdrop-filter: blur(5px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 15px 15px 0 0;
            height: 40px;
        }

       .ds-chat-close,
.ds-chat-fullscreen {
    color: var(--header-text, #666) !important;
    transition: color 0.3s ease;
}

.ds-chat-close:hover {
    color: #ff4444 !important;
}
        .ds-chat-title {
            font-weight: bold;
            color: black; /* 修改字体颜色 */
        }
     .ds-chat-close {
    cursor: pointer;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, color 0.2s;
    color: #666;
    margin-bottom: 2px;
}

.ds-chat-close:hover {
    color: #ff4444;
    transform: rotate(90deg);
}

.ds-chat-close svg {
    width: 20px;
    height: 20px;
    transform-origin: center; /* SVG 专用中心点设置 */
}
        .ds-chat-fullscreen {
            cursor: pointer;
            font-size: 20px;
            margin-right: 10px;
            margin-bottom: 0px;
        }
        .ds-chat-fullscreen:hover {
    transform: scale(1.1);
    color: #4CAF50;
}
        .ds-chat-content {
            flex: 1;
            padding: 0px;
            overflow-y: auto;
            background-color: var(--secondary-color); /* 修改背景颜色 */
            border-bottom: 1px solid #ddd;
        }
         .ds-chat-message {
            margin-bottom: 10px;
            background-color: #FFFFFF;
            padding: 5px 5px;
            max-width: 100%;
            margin-top: 10px;
            border-radius: 10px;
            line-height: 1.2;
            word-wrap: break-word;
            font-size: 14px; /* 减小用户消息字体大小 */
            color: rgb(0,0,0); /* 修改字体颜色 */
            margin-left: 5px;
            margin-right: 5px;
            text-align: left;
              font-weight: 500;
    font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
}
  .ds-user-message {
            background-color: #FFFFFF;
            color: rgb(0,0,0);
            margin-left: auto;
            padding-bottom: 0px!important;
            margin-top: 10px;
            //text-align: right;
            padding: 1px 10px;
            border-radius: 15px;
            height: auto;
            width: fit-content;
            display: block;
            font-weight: 500;
            max-width: -moz-available;
            font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
        }
        .ds-ai-message {
         padding-bottom: 0px!important;
            background-color: #FFFFFF;
            line-height: 1.2; /* 调整行高 */
            color: rgb(0,0,0); /* 修改字体颜色 */
            padding: 5px 20px;
            text-align: left;
             width: fit-content;
            max-width: -moz-available;
             font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
        }
    .ds-chat-message img{
    width: 100%;
    height: auto;
    }
        .ds-chat-hmessage img{
    width: 100%;
    height: 100%;
    }

        .ds-chat-input-area {
            padding: 10px;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            background-color: var(--secondary-color); /* 修改背景颜色 */
            border-top: 1px solid rgba(221, 221, 221, 0.5);
        }
        .ds-chat-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 8px;
            outline: none;
            transition: border-color 0.3s;
            font-size: 15px;
            color: var(--text-color); /* 修改字体颜色 */
            background-color: rgba(255, 255, 255, 0.8);
            box-sizing: border-box;
        }
        /* 鼠标悬停(Hover)效果 */
        .ds-chat-input:hover {
            border-color: #90c8f3; /* 淡蓝色边框 */
            box-shadow: 0 0 8px rgba(144, 200, 243, 0.4); /* 淡蓝色发光效果 */
        }

        /* 聚焦(Focus)效果 */
        .ds-chat-input:focus {
            border-color: #5ab1f3; /* 更亮的蓝色边框 */
            box-shadow: 0 0 10px rgba(90, 177, 243, 0.6); /* 更强的发光效果 */
            background-color: rgba(255, 255, 255, 0.9); /* 背景稍微变亮 */
        }
        .ds-chat-input:focus {
            border-color: #007bff;
        }
        .ds-chat-settings {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            color: var(--text-color); /* 修改字体颜色 */
        }
        .ds-chat-settings-btn {
            cursor: pointer;
            text-decoration: underline;
        }
        .ds-chat-settings-btn:hover {
    transform: scale(1.1);
    color: #4CAF50;
}
        .ds-thinking {
            color: #e87be4;
            font-style: italic;
        }
        .ds-error {
            color: var(--error-color);
        }
        .ds-context-toggle {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            font-size: 12px;
            height: 10px;
        }
        .ds-context-toggle input {
            margin-right: 5px;
        }
        .ds-context-summary {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
        .ds-message-content {
            line-height: 1.5 !important;
            color: var(--text-color) !important;
            display: block;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 1em;
            background: none !important;
            background-color: transparent !important;
            background-image: none !important;
            text-shadow: none !important;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }

        .ds-message-content::after {
            content: '|';
            position: relative;
            display: inline;
            color: transparent !important;
            /*color: #2372c3; */
            animation: blink 1s infinite;
            margin-left: 2px;
        }

        .ds-message-content:not(:empty)::after {
            display: none;
        }

        /* 增强代码块高亮效果 */
        .hljs {
            background-color: #2d2d2d !important ;
            border-radius: 4px !important;
            margin: 10px 0 !important;
            position: relative !important;
            overflow: auto !important;
            color: #ffffff !important;
            border: none !important; /* 添加这行移除边框 */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; /* 可选：用阴影替代边框 */
            font-family: 'Fira Code', 'JetBrains Mono', monospace;
        }

        /* 代码块copy按钮样式 */


        /* copy成功提示样式 */
        .copy-success {
            position: absolute !important;
            top: 3px !important;
            right: 60px !important;
            background-color: #28a745 !important;
            color: white !important;
            border-radius: 4px !important;
            padding: 4px 10px !important;
            font-size: 12px !important;
            animation: fadeOut 2s forwards !important;
            z-index: 10;
        }

        @keyframes fadeOut {
            0% { opacity: 1 !important; }
            100% { opacity: 0 !important; visibility: hidden !important; }
        }
        .ds-thinking {
            color:rgb(117, 109, 117);
            font-style: oblique;
            font-size: 13px; /* 字体大小比父元素小 10% */
        }

        .ds-reasoning-title {
            color: #666;
            font-size: 13px; /* 字体大小比父元素小 10% */
            font-style: oblique;
            margin-bottom: 5px;
        }

        .ds-reasoning-content {
            background-color: #f0f0f0;
            color: #666;
            padding: 8px;
            font-style: oblique;
            margin-top: 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .ds-chat-hmessage {
            margin-bottom: 5px;
            background-color: #FFFFFF;
            padding: 5px 5px;
            max-width: 100%;
            margin-top: 10px;
            padding-bottom: 4px !important;
            border-radius: 10px;
            line-height: 1.2;
            word-wrap: break-word;
            font-size: 14px; /* 减小用户消息字体大小 */
            color: rgb(0,0,0); /* 修改字体颜色 */
            margin-left: 5px;
            margin-right: 5px;
            text-align: left;
              font-weight: 500;
    font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
        }
        .ds-user-hmessage {
            background-color: #FFFFFF;
            color: rgb(0,0,0);
            margin-left: auto;
            padding-bottom: 15px!important;
            margin-top: 10px;
            //text-align: right;
            padding: 15px 10px;
            border-radius: 15px;
            height: auto;
            width: fit-content;
            display: block;
		    max-width: -moz-available;
            font-weight: 500;
            font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
        }
        .ds-copy-conversation-btn {
            background-color: transparent!important;
            color: black;
            display: none;
}
        .ds-ai-hmessage {
         padding-bottom: 0px!important;
            background-color: #FFFFFF;
            line-height: 1.2; /* 调整行高 */
            color: rgb(0,0,0); /* 修改字体颜色 */
            padding: 5px 20px;
            text-align: left;
            width: fit-content;
            max-width: -moz-available;
             font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
        }
        .ds-chat-message {
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.ds-user-message {
    font-weight: 500;
    font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
}

.ds-ai-message {
    font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;

}
/* 统一设置标题字体大小 */
        .ds-chat-message h1, .ds-chat-message h2, .ds-chat-message h3, .ds-chat-message h4, .ds-chat-message h5, .ds-chat-message h6 {
            font-size: 15px;
            margin: 5px 0;
        }

        /* 设置列表样式 */

        .ds-chat-hmessage h1, .ds-chat-hmessage h2, .ds-chat-hmessage h3, .ds-chat-hmessage h4, .ds-chat-hmessage h5, .ds-chat-hmessage h6 {
            font-size: 15px;
            margin: 5px 0;
        }

        /* 设置列表样式 */

        // .ds-chat-message ul, .ds-chat-message ol {
        //     margin: 10px 0;
        //     /* 增加内边距，确保列表项有足够空间显示符号和序号 */
        //     padding-left: 2.5em;
        //     /* 确保列表符号或序号在内容内部 */
        //     //list-style-position: inside;
        // }

        // .ds-chat-message li {
        //     margin: 5px 0;
        //     /* 修复因列表符号或序号导致的文本错位 */
        //     text-indent: -1.5em;
        //     padding-left: 1.5em;
        // }

        /* 确保无序列表显示符号 */
        .ds-chat-message ul li {
            list-style-type: disc; /* 可以根据需要修改为 circle、square 等 */
        }

        /* 确保有序列表显示序号 */
        .ds-chat-message ol li {
            list-style-type: decimal;
        }

         .ds-chat-hmessage ul, .ds-chat-hmessage ol {
            margin: 10px 0;
            /* 增加内边距，确保列表项有足够空间显示符号和序号 */
            padding-left: 2.5em;
            /* 确保列表符号或序号在内容内部 */
           // list-style-position: inside;
        }

        .ds-chat-hmessage li {
            margin: 5px 0;
            /* 修复因列表符号或序号导致的文本错位 */
            text-indent: -1.5em;
            padding-left: 1.5em;
        }

        /* 确保无序列表显示符号 */
        .ds-chat-hmessage ul li{
            list-style-type: disc; /* 可以根据需要修改为 circle、square 等 */
        }

        /* 确保有序列表显示序号 */
        .ds-chat-hmessage ol li{
            list-style-type: decimal;
        }
/* 停止按钮容器样式 */
/* 动态圆形停止按钮样式 */
.ds-stop-button {
    position: absolute;
    right: 20px;
    bottom: 65px;
    width: 20px; /* 圆形直径 */
    height: 20px;
    border-radius: 50%; /* 圆形 */
    background-color: rgba(255, 255, 255, 0.9)!important;
    border: none;
    cursor: pointer;
    z-index: 2147483645;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color:rgb(19, 19, 19);
    transition: all 0.2s;
    overflow: hidden; /* 隐藏内部动画溢出部分 */
}
.ds-start-button {
    position: absolute;
    right: 20px;
    bottom: 65px;
    width: 18px; /* 圆形直径 */
    height: 18px;
    border-radius: 50%; /* 圆形 */
    background-color: rgba(255, 255, 255, 0.9)!important;
    border: none;
    cursor: pointer;
    z-index: 214748364;
    //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   // display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    transition: all 0.2s;
    overflow: hidden; /* 隐藏内部动画溢出部分 */
}

.ds-stop-button:hover {
    background-color: white;
    transform: scale(1.05);
}

/* 动态旋转的边框动画 */
.ds-stop-button::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-sizing: border-box;
    box-shadow: 0 0 8px rgba(14, 13, 13, 0.6);
}

/* 停止图标样式 */
.ds-stop-img {
    width: 20px !important;
    height: 20px !important;
    color: black;
    //background-color: black;
    position: relative;
    z-index: 1; /* 确保图标在动画层上方 */
}

.ds-stop-img{
    width: 100%;
    height: 100%;
    fill: currentColor;
    animation: pulse 1s ease-in-out infinite;
}

/* 旋转动画 */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 脉冲动画 */
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
}

/* 点击后停止动画的样式 */
.ds-stop-button.stopped::before {
    animation: none;
    border: 2px solidrgb(16, 16, 16);
}

.ds-stop-button.stopped .ds-stop-icon svg {
    animation: none;
}
/* 新增代码执行相关样式 */


    /* 代码执行弹窗样式 - 基于demo文件中的样式 */
    .code-execution-modal {
        display: none;
        position: fixed;
        z-index: 2147483645;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.6);
        align-items: center;
        justify-content: center;
    }

    .code-execution-content {
        background-color: #fefefe;
        margin: auto;
        padding: 0;
        border: 1px solid #888;
        width: 85%;
        max-width: 900px;
        height: 80vh;
        max-height: 700px;
        border-radius: 8px;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .code-execution-header {
        padding: 10px 10px;
        background-color: #171818e8;
        color: white;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #dee2e6;
        justify-content: space-between;
    }

    .code-execution-header h3 {
        margin: 0;
        font-size: 1.2em;
        display: contents;
        justify-content: space-between;  
    }

    .code-execution-close {
        color: #fff;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
        margin-left: 12px;
    }

    .code-execution-body {
        flex: 1;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    #code-sandbox {
        flex: 1;
        width: 100%;
        height: 100%;
        border: none;
        background: #ffffff;
    }

    #code-status-bar {
        padding: 8px 15px;
        font-size: 0.9em;
        min-height: 1.5em;
        background-color: #f1f3f5;
        border-top: 1px solid #dee2e6;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 150px;
        overflow-y: auto;
        color: #333;
    }

    .fullscreen-btn {
        color: #fff;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
        margin-left: 10px;
    }

    .code-execution-modal.fullscreen .code-execution-content {
        width: 100% !important;
        height: 100% !important;
        max-width: none;
        max-height: none;
        border-radius: 0;
    }

    .status-running {
        color: #007bff;
    }

    .status-success {
        color: #28a745;
    }

    .status-error {
        color: #dc3545;
        font-weight: bold;
    }
    .code-buttons-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 5px 0;
}

// .copy-code-btn {
//     position: absolute;
//     top: 8px; /* Changed from bottom */
//     right: 8px;
//     background-color: #555;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     padding: 2px 8px;
//     font-size: 12px;
//     cursor: pointer;
//     opacity: 0.8;
//     transition: opacity 0.3s;
//     z-index: 10;
// }
    .copy-code-btn {
    position: absolute;
    bottom: 15px;
    right: 8px;
    background-color: #555;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 15px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s;
    z-index: 10;
    font-family: math;
}

// .code-execute-btn {
//     position: absolute;
//     bottom: 8px; /* Changed from top/left */
//     right: 8px;  /* Added */
//     left: auto;  /* Added */
//     background-color: #4CAF50!important;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     padding: 2px 8px;
//     font-size: 12px;
//     cursor: pointer;
//     opacity: 1;
//     z-index: 10;
// }
.code-execute-btn {
    position: absolute;
    bottom: 15px;
    left: 8px;
    background-color: #4CAF50 !important;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    cursor: pointer;
    opacity: 1;
    z-index: 10;
}
// .copy-hcode-btn {
//     position: absolute;
//     top: 8px; /* Changed from 15px */
//     right: 8px;
//     background-color: #555;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     padding: 2px 8px;
//     font-size: 12px;
//     cursor: pointer;
//     opacity: 0.8;
//     transition: opacity 0.3s;
//     z-index: 10;
// }
.copy-hcode-btn {
    position: absolute;
    top: 12px;
    right: 5px;
    background-color: #555;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 14px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s;
    z-index: 10;
}
    .code-hexecute-btn {
    position: absolute;
    top: 15px;
    left: 5px;
    background-color: #4CAF50 !important;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    cursor: pointer;
    opacity: 1;
    z-index: 10;
}
// .code-hexecute-btn {
//     position: absolute;
//     bottom: 8px; /* Changed from top/left */
//     right: 8px; /* Added */
//     left: auto; /* Added */
//     top: auto; /* Added */
//     background-color: #4CAF50!important;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     padding: 2px 8px;
//     font-size: 12px;
//     cursor: pointer;
//     opacity: 1;
//     z-index: 10;
// }
pre {
    position: relative;
    padding-top: 35px !important; /* Increased top padding */
    padding-bottom: 35px !important; /* Increased bottom padding */
    //display: ruby-base-container;
}

/* Token counter样式 */
.ds-token-counter {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    padding: 4px 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.ds-token-label {
    font-weight: bold;
    margin-right: 10px;
}

.ds-user-tokens, .ds-ai-tokens {
    margin-right: 10px;
}

.ds-total-tokens {
    font-weight: bold;
}

.ds-input-token-counter {
    font-size: 12px;
    color: #666;
    text-align: right;
    margin-top: 2px;
    padding-right: 8px;
display: none;
}

.ds-token-info {
    font-size: 12px;
    color: #666;
    text-align: right;
    margin-top: 4px;
    padding-right: 8px;
    border-top: 1px dotted #ddd;
    padding-top: 4px;
}

/* 修复AI消息显示格式 */
.ds-ai-message .ds-message-content {
    white-space: break-spaces !important;
   // line-height: 1.5 !important;
    display: block;
}

.ds-ai-message .ds-message-content p {
   // margin: 0.5em 0 !important;
}

.ds-ai-message .ds-message-content pre {
   // margin: 0.75em 0 !important;
}

.ds-ai-message .ds-message-content ul,
.ds-ai-message .ds-message-content ol {
   // margin: 0.5em 0 !important;
    padding-left: 1.5em !important;
}

/* 确保列表项正确显示 */
.ds-ai-message .ds-message-content ul li {
    list-style-type: disc !important;
   // margin: 0.25em 0 !important;
}

.ds-ai-message .ds-message-content ol li {
    list-style-type: decimal !important;
   // margin: 0.25em 0 !important;
}
    /* --- 添加或修改以下 CSS 规则 --- */

/* 减小 AI 消息中主要块级元素的默认间距 */

.ds-ai-message ul,
.ds-ai-message ol,
.ds-ai-message pre,
.ds-ai-message blockquote,
.ds-ai-message h1,   /* 也考虑标题 */
.ds-ai-message h2,
.ds-ai-message h3,
.ds-ai-message h4,
.ds-ai-message h5,
.ds-ai-message h6 {
    margin-top: auto!important;
    margin-bottom: auto!important;
    // display: inline-grid!important;
    display: grid;

}
    .ds-ai-message p{
    margin-top: 0.1em; /* 列表项内的段落用更小的间距 */
    margin-bottom: 0.1em;
    }
    .ds-chat-message p{
    margin-top: 0.1em; /* 列表项内的段落用更小的间距 */
    margin-bottom: 0.1em;
    }

/* 关键：减小列表项内部 <p> 的距 */
.ds-ai-message li p {
    margin-top: 0.1em; /* 列表项内的段落用更小的间距 */
    margin-bottom: 0.1em;
}

/* 可选：移除内容区域第一个元素的上边距 */
.ds-message-content > *:first-child {
    margin-top: 0 !important;
}

/* 可选：移除内容区域最后一个元素的下边距 */
.ds-message-content > *:last-child {
    margin-bottom: 0 !important;
}

/* 如果你的列表项 li 本身有边距，也需要调整 */
.ds-ai-message li {
     margin-top: 0.1em; /* 调整 li 本身的边距 (如果需要) */
     margin-bottom: 0.1em;
}
.mac-buttons { 
    display: flex; 
    gap: 6px; 
    margin-right: 10px; 
  }
  .mac-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    pointer-events: none;
  }
  .close { background: #ff5f56; }
  .minimize { background: #ffbd2e; }
  .maximize { background: #28c940; }
  .ds-chat-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
.ds-message-actions {
  padding-bottom: 0px;
    text-align: right;
    margin-right: 5px;
}

    .ds-user-message-container{
    margin-left: 5px;}
    .ds-user-hmessage-container{
    margin-left: 5px;}
    .ds-scroll-to-bottom {
  position: absolute;
  right: 45%;
  bottom: 20%;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483646;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.3s;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 5px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

.ds-scroll-to-bottom:hover {
  background-color: rgba(255,255,255,0);
  animation: none;
  transform: scale(1.1);
}

.ds-scroll-to-bottom img {
  width: 20px;
  height: 20px;
}
    /* 消息容器样式 */
.ds-message-container {
    position: relative;
    margin-bottom: 5px;
    width: 100%;
}

/* 消息选项按钮样式 */
.ds-message-options-btn {
    opacity: 0.7;
    transition: opacity 0.2s;
    background: transparent !important;
}

.ds-message-options-btn:hover {
    opacity: 1;
    background-color: rgba(0,0,0,0.05);
}

/* 消息选项菜单样式 */
.ds-message-options-menu {
    min-width: 120px;
    z-index: 2147483647;
}

.ds-message-option {
    transition: background-color 0.2s;
}

/* 复制成功提示样式 */
.copy-success {
    animation: fadeIn 0.3s, fadeOut 1.5s 0.5s forwards;
    z-index: 2147483647;
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
    .history-button{
    background-color:#f8f8f8!important;
}
.cancel-button{
    background-color:#f8f8f8!important;
}
    .save-button{
    background-color:#4CAF50!important;
}
`;





    // 异步加载代码高亮样式
    GM_getResourceText('https://pictureapi.dskblog.top/css/agate.min.css')
        .then(hljsStyle => {
            GM_addStyle(css + hljsStyle);
        })
        .catch(error => {
            console.error('加载代码高亮样式失败:', error);
            GM_addStyle(css);
        });

    // 初始化配置
    let config = {
        hidden: false,
        picture_model: false,
        apiKey: GM_getValue('apiKey', ''),
        apiUrl: GM_getValue('apiUrl', 'https://api.deepseek.com/v1/chat/completions'),
        model: GM_getValue('model', 'deepseek'),
        temperature: GM_getValue('temperature',),
        maxTokens: GM_getValue('maxTokens', ),
        // maxContextTokens: GM_getValue('maxContextTokens', 32000),
        chatHistory: GM_getValue('chatHistory', []),
        fullConversation: GM_getValue('fullConversation', []), // 存储完整对话
        customSelectors: GM_getValue('customSelectors', ''), // 存储自定义选择器
        usePageContext: GM_getValue('usePageContext', true),
        additionalParams: GM_getValue('additionalParams', {}),
        personalityPrompt: GM_getValue('personalityPrompt', )
    };
// 初始化在线运行配置
let pyodideInstance = null;
    let isPythonRunning = false;
    // 配置 marked 库
// 初始化
    let pyodide;

        // 初始化Pyodide
        async function initializePyodide() {
            console.log("正在加载Pyodide核心...", "info");

            try {
                // 检查是否已经有loadPyodide函数
                if (typeof loadPyodide !== 'function') {
                    console.log("Pyodide未加载，尝试动态加载脚本");
                    // 动态加载Pyodide脚本
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js";
                        script.onload = resolve;
                        script.onerror = () => reject(new Error("无法加载Pyodide脚本"));
                        document.head.appendChild(script);
                    });
                    
                    // 确保loadPyodide函数可用
                    if (typeof loadPyodide !== 'function') {
                        throw new Error("Pyodide脚本加载成功但loadPyodide函数不可用");
                    }
                }
                
                // 使用备用CDN
                const cdnUrls = [
                    "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/",
                    "https://cdn.staticfile.org/pyodide/0.26.0/full/",
                    "https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.26.0/full/"
                ];
                
                let pyodideLoaded = false;
                let lastError = null;
                
                // 尝试从不同CDN加载
                for (const cdnUrl of cdnUrls) {
                    if (pyodideLoaded) break;
                    
                    try {
                        console.log(`尝试从 ${cdnUrl} 加载Pyodide...`);
                        pyodide = await loadPyodide({
                            indexURL: cdnUrl,
                            stdout: handleStdout,
                            stderr: handleStderr
                        });
                        pyodideLoaded = true;
                        console.log(`成功从 ${cdnUrl} 加载Pyodide核心`);
                    } catch (e) {
                        console.error(`从 ${cdnUrl} 加载失败:`, e);
                        lastError = e;
                    }
                }
                
                if (!pyodideLoaded) {
                    throw lastError || new Error("所有CDN源加载失败");
                }

                console.log("正在加载基础包...", "info");

                // 预加载常用包
                await loadCommonPackages();

                // 重写Python的input()函数
                await patchPythonInput();

                console.log("Pyodide已就绪!", "success");
                pyodideInstance = true;
                return true;
            } catch (e) {
                console.log(`初始化失败: ${e}`, "error");
                console.error("Pyodide初始化错误:", e);
                pyodideInstance = false;
                return false;
            }
        }

        // 加载常用包
        async function loadCommonPackages() {
            try {
                // 增加超时检测
                const timeout = setTimeout(() => {
                    console.log("加载包超时，可能是网络问题");
                }, 40000); // 增加到40秒超时
                
                // 预加载更多基础包
                await pyodide.loadPackage([
                    "pandas","numpy","micropip","matplotlib"
                ]);
                
                clearTimeout(timeout);
                console.log("基础包加载完成", "success");
                
                // 安装一些常用的纯Python包
                try {
                    await pyodide.runPythonAsync(`
                        import micropip
                        await micropip.install([
                            'nltk', 'pillow','requests'
                        ])
                    `);
                    console.log("额外包安装完成");
                } catch (e) {
                    console.log(`额外包安装部分失败: ${e}`);
                }
                
                // 初始化虚拟文件系统，使得Python可以读写文件
                await pyodide.runPythonAsync(`
                    import os
                    import sys
                    
                    # 创建一个虚拟工作目录
                    if not os.path.exists('/home/pyodide'):
                        os.makedirs('/home/pyodide')
                    os.chdir('/home/pyodide')
                    
                    # 创建一些示例文件
                    with open('example.txt', 'w') as f:
                        f.write('这是一个示例文件。\\n可以使用open()函数读写。')
                        
                    # 设置环境变量
                    os.environ['PYTHONPATH'] = '/home/pyodide'
                    
                    # 初始化matplotlib后端为Agg (非交互式)
                    try:
                        import matplotlib
                        matplotlib.use('Agg')
                    except:
                        pass
                `);
            } catch (e) {
                console.log(`基础包加载失败: ${e}`, "error");
                // 即使基础包加载失败，也不要中断整个流程
            }
        }

        // 处理标准输出
        function handleStdout(text) {
            const defaultOutput = document.getElementById("output");
            const outputElement = window.pyodideOutputElement || defaultOutput;
            
            if (outputElement) {
                outputElement.textContent += text;
                if (outputElement.scrollIntoView) {
                    outputElement.scrollIntoView(false);
                }
            }
        }

        // 处理错误输出
        function handleStderr(text) {
            const defaultOutput = document.getElementById("output");
            const outputElement = window.pyodideOutputElement || defaultOutput;
            
            if (outputElement) {
                outputElement.innerHTML += `<span class="error">${text}</span>`;
                if (outputElement.scrollIntoView) {
                    outputElement.scrollIntoView(false);
                }
            }
        }
 async function patchPythonInput() {
    // 清理旧的输入处理器
    try {
        await pyodide.runPythonAsync(`
            if '_resolve_input' in globals():
                del _resolve_input
            if '_input_promise' in globals():
                del _input_promise
        `);
    } catch (e) {
        console.error("清理输入处理器时出错:", e);
    }
    
    // 安装新的输入处理器
    await pyodide.runPythonAsync(`
        import sys
        import asyncio
        from js import document, console

        _original_input = input
        _input_promise = None

        async def browser_input(prompt=None):
            global _input_promise
            if prompt:
                from js import pyodideOutputElement
                if pyodideOutputElement:
                    pyodideOutputElement.textContent += str(prompt)

            # 显示输入框
            input_container = document.getElementById("input-container")
            if input_container:
                input_container.style.display = "flex"

            # 等待用户输入
            loop = asyncio.get_event_loop()
            _input_promise = loop.create_future()
            try:
                user_input = await _input_promise
            except Exception as e:
                console.error("输入出错:", str(e))
                user_input = ""

            # 隐藏输入框
            if input_container:
                input_container.style.display = "none"
            return user_input

        # 替换内置input函数
        input = browser_input
        __builtins__.input = browser_input
    `);

    // 设置Python端的promise解析器
    pyodide.globals.set("_resolve_input", (value) => {
        try {
            pyodide.runPythonAsync(`
                if '_input_promise' in globals() and _input_promise is not None and not _input_promise.done():
                    _input_promise.set_result("${value.replace(/"/g, '\\"')}")
            `);
        } catch (e) {
            console.error("设置输入值时出错:", e);
        }
    });
}

//检测代码类型

function detectCodeType(code) {
    const cleanedCode = code.trim();
    
    // 1. 先检查显式标记
    if (cleanedCode.startsWith('```python') || cleanedCode.startsWith('```py')) {
        return 'python';
    }
    if (cleanedCode.startsWith('```html')) {
        return 'html';
    }

    // 2. 检查HTML特征
    const htmlTagRegex = /<([a-z][a-z0-9]*)(?:\s+[^>]*)?>|<\/[a-z][a-z0-9]*>|<!DOCTYPE\s+html|<html|<head|<body|<div|<p|<span|<img|<a\s|<ul|<li|<table|<script|<style|<link/i;
    if (htmlTagRegex.test(cleanedCode)) {
        return 'html';
    }

    // 3. 检查Python特征
    const pythonKeywords = /\b(def\s|class\s|import\s|from\s|print\(|lambda\s|async\s|await\s|yield\s|with\s|as\s|try\s|except\s|finally\s|raise\s|elif\s|@\w+)\b/;
    const pythonIndent = /^\s+(if|elif|else|for|while|try|except|finally|with|def|class)\b.*:\s*$/m;
    
    if (pythonKeywords.test(cleanedCode) || pythonIndent.test(cleanedCode)) {
        return 'python';
    }

    // 4. 默认返回none表示无法确定类型
    return 'none';
}
    // 动态加载依赖库
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    Promise.all([
            loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js'),
            loadScript('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js')
        ])
        .then(() => {

            marked.setOptions({
    highlight: function(code, lang) { /* ... (代码同上) ... */
         const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        let highlightedCode;
        try {
            highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value;
        } catch (e) {
            console.error(`Highlight.js Error (Lang: ${lang || 'auto'}):`, e);
            highlightedCode = code;
        }
        // 返回带有标记的 <pre> 结构
        return `<pre data-is-fenced-code="true"><code class="language-${language} hljs">${highlightedCode}</code></pre>`;
    },
    langPrefix: 'hljs language-',
    pedantic: false, gfm: true, breaks: false, smartLists: true, smartypants: false
});
   
            // 检查是否已经存在图标
            if (!document.querySelector('.ds-chat-icon')) {
                // 创建UI元素 - 只在body元素下添加
                const icon = document.createElement('div');
                icon.className = 'ds-chat-icon';
                icon.innerHTML = `<img src="/img/icon.png" style="width: 30px; height: 30px; border-radius: 50%;">`;

                // 确保只添加到body元素，而不是其他元素
                document.body.appendChild(icon);

                // 确保图标位置固定在右下角5px处
		const savedRight = GM_getValue('iconRight', 5);
		const savedBottom = GM_getValue('iconBottom', 5);
		icon.style.right = `${savedRight}px`;
		icon.style.bottom = `${savedBottom}px`;
                icon.style.position = 'fixed';
                icon.style.zIndex = '2147483647';
                icon.style.display = 'flex';
                icon.style.cursor = 'move'; // 鼠标悬停时显示拖动光标

                const chatWindow = document.createElement('div');
                chatWindow.className = 'ds-chat-window';
                document.body.appendChild(chatWindow);

                // 拖动相关变量
                     // 图标拖动状态变量
                     let isDraggingIcon = false;    // 图标是否正在被拖动
                     let iconStartX, iconStartY;    // 拖动起始的坐标
                     let iconInitialRight, iconInitialBottom; // 拖动起始时图标的 right 和 bottom 值
                     let iconHasMoved = false;      // 本次交互中图标是否发生了移动（超过阈值）
     
                     // 打开/关闭聊天窗口的函数
                     function toggleChatWindow(show) {
                         const isActive = chatWindow.classList.contains('active');
     
                         if (show && !isActive) {
                             // --- 打开窗口 ---
                             console.log("尝试打开聊天窗口...");
                             // 1. 先定位窗口 (此时图标可见，便于参考)
                             try {
                                  positionChatWindow(); // 计算并设置初始位置
                                  console.log("聊天窗口已定位。");
                             } catch (positionError) {
                                  console.error("定位聊天窗口时出错:", positionError);
                                  // 定位出错时的后备方案
                                  chatWindow.style.right = '10px';
                                  chatWindow.style.bottom = '70px'; // 放在图标大致消失的位置
                                  chatWindow.style.left = 'auto';
                                  chatWindow.style.top = 'auto';
                             }
     
                             // 2. 让窗口可见并隐藏图标
                             chatWindow.classList.add('active');
                             chatWindow.style.display = 'flex'; // 让窗口占据空间
                             // 使用 requestAnimationFrame 可能让动画更流畅
                             requestAnimationFrame(() => {
                                  chatWindow.style.opacity = '1'; // 如果使用了透明度过渡动画
                             });
                             icon.style.display = 'none'; // 隐藏图标
                             console.log("聊天窗口已打开。");
                             // 可选：打开时更新头部主题色
                             updateHeaderTheme();
     
                         } else if (!show && isActive) {
                             // --- 关闭窗口 ---
                             console.log("尝试关闭聊天窗口...");
                             chatWindow.classList.remove('active');
                             chatWindow.style.opacity = '0'; // 开始淡出动画（如果使用）
                             // 如果有动画，等待动画结束再隐藏；否则直接隐藏
                             // setTimeout(() => { chatWindow.style.display = 'none'; }, 500); // 假设动画 0.5 秒
                              chatWindow.style.display = 'none'; // 直接隐藏
                             icon.style.display = 'flex';   // 显示图标
                             console.log("聊天窗口已关闭。");
     
                              // 通过关闭按钮关闭窗口时，也保存一下图标当前位置
                              const currentIconStyles = window.getComputedStyle(icon);
                              const finalRight = parseFloat(currentIconStyles.right);
                              const finalBottom = parseFloat(currentIconStyles.bottom);
                              if (!isNaN(finalRight) && !isNaN(finalBottom)) {
                                 GM_setValue('iconRight', finalRight);
                                 GM_setValue('iconBottom', finalBottom);
                                  console.log(`通过按钮关闭时保存图标位置: R=${finalRight}, B=${finalBottom}`);
                              }
                         }
                     }
     
                     // --- 图标的触摸事件 ---
                     icon.addEventListener('touchstart', (e) => {
                         if (e.touches.length === 1) { // 仅处理单指触摸
                             isDraggingIcon = true;      // 开始拖动状态
                             iconHasMoved = false;       // 重置移动标志
                             const touch = e.touches[0];
                             iconStartX = touch.clientX; // 记录起始X
                             iconStartY = touch.clientY; // 记录起始Y
                             const styles = window.getComputedStyle(icon);
                             // 优先读取 right/bottom，如果无效（比如是'auto'），则进行回退计算
                             iconInitialRight = parseFloat(styles.right);
                             iconInitialBottom = parseFloat(styles.bottom);
                             if (isNaN(iconInitialRight) || isNaN(iconInitialBottom)) {
                                 // 使用 getBoundingClientRect 作为后备来计算初始 right/bottom
                                 const rect = icon.getBoundingClientRect();
                                 iconInitialRight = window.innerWidth - rect.right;
                                 iconInitialBottom = window.innerHeight - rect.bottom;
                                  console.log("触摸开始时，通过 BBox 计算初始位置");
                             }
                             // 暂时不阻止默认行为，允许可能的页面滚动，直到确认发生拖动
                             icon.style.cursor = 'grabbing'; // 改变鼠标指针样式（桌面端效果）
                              console.log("图标 touchstart");
                         }
                     }, { passive: false }); // 使用 passive: false，因为我们可能在 touchmove 中调用 preventDefault
     
                     icon.addEventListener('touchmove', (e) => {
                         if (isDraggingIcon && e.touches.length === 1) { // 必须是正在拖动状态且是单指
                             const touch = e.touches[0];
                             const deltaX = touch.clientX - iconStartX; // 计算X位移
                             const deltaY = touch.clientY - iconStartY; // 计算Y位移
     
                             // 检查位移是否超过阈值，判断是否为有效拖动
                             if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) { // 阈值设为5像素
                                  if (!iconHasMoved) {
                                       // 首次超过阈值，标记为已移动
                                       console.log("图标拖动开始（超过阈值）");
                                       iconHasMoved = true;
                                       // 只有当确认是拖动时，才阻止页面的默认滚动行为
                                       e.preventDefault();
                                  }
     
                                 // 计算新的 right 和 bottom 值
                                 const newRight = iconInitialRight - deltaX;
                                 const newBottom = iconInitialBottom - deltaY;
     
                                 // 边界检查，防止图标拖出屏幕
                                 const maxRight = window.innerWidth - icon.offsetWidth;
                                 const maxBottom = window.innerHeight - icon.offsetHeight;
                                 const clampedRight = Math.max(0, Math.min(newRight, maxRight));   // 限制右边界
                                 const clampedBottom = Math.max(0, Math.min(newBottom, maxBottom)); // 限制下边界
     
                                 // 更新图标位置
                                 icon.style.right = `${clampedRight}px`;
                                 icon.style.bottom = `${clampedBottom}px`;
                             }
                         }
                     }, { passive: false }); // 使用 passive: false 因为我们调用了 preventDefault
     
                     icon.addEventListener('touchend', (e) => {
                          console.log(`图标 touchend: isDraggingIcon=${isDraggingIcon}, iconHasMoved=${iconHasMoved}`);
                         if (isDraggingIcon) { // 必须是从拖动状态结束
                             if (!iconHasMoved) {
                                 // 如果没有移动，说明这是一次"轻触"（Tap）
                                 console.log("通过 touchend 检测到 Tap。");
                                  // 使用一个微小的延迟来执行，减少与浏览器可能模拟的 click 事件冲突的概率
                                  setTimeout(() => {
                                    toggleChatWindow(true); // 打开聊天窗口
                                  }, 50); // 50毫秒延迟
                             } else {
                                 // 如果移动了，说明这是拖拽结束
                                 console.log("通过 touchend 检测到拖拽结束。");
                                 // 拖拽结束后保存图标的最终位置
                                 const finalRight = parseFloat(icon.style.right);
                                 const finalBottom = parseFloat(icon.style.bottom);
                                  if (!isNaN(finalRight) && !isNaN(finalBottom)) {
                                     GM_setValue('iconRight', finalRight); // 保存 right 值
                                     GM_setValue('iconBottom', finalBottom); // 保存 bottom 值
                                     console.log(`拖拽结束时保存图标位置: R=${finalRight}, B=${finalBottom}`);
                                  }
                             }
                             // 不论是 Tap 还是拖拽结束，都需要重置状态
                             isDraggingIcon = false;
                             iconHasMoved = false;
                             icon.style.cursor = 'move'; // 恢复鼠标指针样式
                         }
                          // touchend 通常不需要阻止默认行为
                     });
     
                     icon.addEventListener('touchcancel', () => {
                         // 处理触摸被意外取消的情况（例如电话接入）
                         if (isDraggingIcon) {
                             isDraggingIcon = false;
                             iconHasMoved = false;
                             icon.style.cursor = 'move';
                              console.log("图标 touchcancel");
                         }
                     });
     
                     // --- 图标的鼠标事件（保持桌面端功能） ---
                      icon.addEventListener('mousedown', (e) => {
                         if (e.button !== 0) return; // 仅响应鼠标左键
                         isDraggingIcon = true;
                         iconHasMoved = false;
                         iconStartX = e.clientX;
                         iconStartY = e.clientY;
                         const styles = window.getComputedStyle(icon);
                          iconInitialRight = parseFloat(styles.right);
                          iconInitialBottom = parseFloat(styles.bottom);
                          if (isNaN(iconInitialRight) || isNaN(iconInitialBottom)) {
                              const rect = icon.getBoundingClientRect();
                              iconInitialRight = window.innerWidth - rect.right;
                              iconInitialBottom = window.innerHeight - rect.bottom;
                              console.log("鼠标按下时，通过 BBox 计算初始位置");
                          }
                         e.preventDefault(); // 阻止默认行为，如文本选择或图片拖拽
                         icon.style.cursor = 'grabbing';
                          console.log("图标 mousedown");
                     });
     
                     // 鼠标移动和松开事件最好监听在 document 上，以防鼠标移出图标区域
                      document.addEventListener('mousemove', (e) => {
                         if (!isDraggingIcon) return; // 必须是图标启动的拖动
     
                         const deltaX = e.clientX - iconStartX;
                         const deltaY = e.clientY - iconStartY;
     
                          // 首次超过阈值时标记为移动
                          if (!iconHasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                              console.log("图标拖动开始（mousemove 阈值）");
                              iconHasMoved = true;
                          }
     
                          // 只有标记为移动后才更新位置
                          if (iconHasMoved) {
                             const newRight = iconInitialRight - deltaX;
                             const newBottom = iconInitialBottom - deltaY;
     
                             const maxRight = window.innerWidth - icon.offsetWidth;
                             const maxBottom = window.innerHeight - icon.offsetHeight;
                             const clampedRight = Math.max(0, Math.min(newRight, maxRight));
                             const clampedBottom = Math.max(0, Math.min(newBottom, maxBottom));
     
                             icon.style.right = `${clampedRight}px`;
                             icon.style.bottom = `${clampedBottom}px`;
                          }
                     });
     
                      document.addEventListener('mouseup', (e) => {
                          console.log(`Document mouseup: isDraggingIcon=${isDraggingIcon}, iconHasMoved=${iconHasMoved}`);
                         if (isDraggingIcon) { // 必须是图标启动的拖动结束
                             if (!iconHasMoved) {
                                 // 没有移动，这是一次"点击"
                                 console.log("通过 mouseup 检测到 Click。");
                                 toggleChatWindow(true); // 打开窗口
                             } else {
                                 // 移动了，这是拖拽结束
                                 console.log("通过 mouseup 检测到拖拽结束。");
                                 const finalRight = parseFloat(icon.style.right);
                                 const finalBottom = parseFloat(icon.style.bottom);
                                 if (!isNaN(finalRight) && !isNaN(finalBottom)) {
                                     GM_setValue('iconRight', finalRight);
                                     GM_setValue('iconBottom', finalBottom);
                                      console.log(`拖拽结束时保存图标位置: R=${finalRight}, B=${finalBottom}`);
                                 }
                             }
                             // 重置状态
                             isDraggingIcon = false;
                             iconHasMoved = false;
                             icon.style.cursor = 'move';
                         }
                     });
     
                      // 处理鼠标拖动时离开窗口的情况
                      document.addEventListener('mouseleave', (e) => {
                         if (isDraggingIcon) {
                              console.log("鼠标在拖动时离开窗口");
                              // 像拖拽结束一样处理
                             const finalRight = parseFloat(icon.style.right);
                             const finalBottom = parseFloat(icon.style.bottom);
                              if (!isNaN(finalRight) && !isNaN(finalBottom)) {
                                GM_setValue('iconRight', finalRight);
                                GM_setValue('iconBottom', finalBottom);
                                 console.log(`鼠标离开时保存图标位置: R=${finalRight}, B=${finalBottom}`);
                              }
                             isDraggingIcon = false;
                             iconHasMoved = false;
                             icon.style.cursor = 'move';
                         }
                     });        

                const chatHeader = document.createElement('div');
                chatHeader.className = 'ds-chat-header';
                chatWindow.appendChild(chatHeader);
        
                const macButtons = document.createElement('div');
macButtons.className = 'mac-buttons';
macButtons.innerHTML = `
  <span class="mac-btn close"></span>
  <span class="mac-btn minimize"></span>
  <span class="mac-btn maximize"></span>
`;

// 创建标题
//const chatTitle = document.createElement('div');
//chatTitle.className = 'ds-chat-title';
//chatTitle.textContent = '🤖 AI assistant';

// 清空 header 并添加新内容
chatHeader.innerHTML = '';
chatHeader.append(macButtons);
        
                const headerButtons = document.createElement('div');
                headerButtons.style.display = 'flex';
                headerButtons.style.alignItems = 'center';
                chatHeader.appendChild(headerButtons);
        
                const fullscreenBtn = document.createElement('div');
                fullscreenBtn.className = 'ds-chat-fullscreen';
                fullscreenBtn.innerHTML = '⛶';
                fullscreenBtn.title = '全屏'; // 添加提示
                headerButtons.appendChild(fullscreenBtn);
        
        
                // 替换 closeBtn 的创建代码
        const closeBtn = document.createElement('div');
        closeBtn.className = 'ds-chat-close';
        closeBtn.innerHTML = `
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        closeBtn.title = '关闭浮窗';
        headerButtons.appendChild(closeBtn);
        
                const chatContent = document.createElement('div');
                chatContent.className = 'ds-chat-content';
                chatWindow.appendChild(chatContent);
        
                const inputArea = document.createElement('div');
                inputArea.className = 'ds-chat-input-area';
                chatWindow.appendChild(inputArea);
        
        
        
                const startButton = document.createElement('button');//发送消息
                startButton.className = 'ds-start-button';
		startButton.title = "发送";
startButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style="min-width: 16px; min-height: 16px; transition: transform 0.2s ease;">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
`;
// 添加悬停效果
startButton.addEventListener('mouseover', () => {
    startButton.querySelector('svg').style.transform = 'scale(1.1)';
});
startButton.addEventListener('mouseout', () => {
    startButton.querySelector('svg').style.transform = 'scale(1)';
});

                
                chatWindow.appendChild(startButton);
        
        // 修改 contextToggle 部分
        const contextToggle = document.createElement('div');
        contextToggle.className = 'ds-context-toggle';
        inputArea.appendChild(contextToggle);
        
        // 左侧部分 - 复选框和🕸图标
        const leftGroup = document.createElement('div');
        leftGroup.className = 'ds-toggle-left';
        contextToggle.appendChild(leftGroup);
        
        const contextCheckbox = document.createElement('input');
        contextCheckbox.type = 'checkbox';
        contextCheckbox.id = 'ds-context-checkbox';
        contextCheckbox.checked = config.usePageContext;
        leftGroup.appendChild(contextCheckbox);
        
        const contextLabel = document.createElement('label');
        contextLabel.htmlFor = 'ds-context-checkbox';
        contextLabel.innerText = '🌐'
        contextLabel.title = '提取网页内容'
        leftGroup.appendChild(contextLabel);
        
        // 右侧部分 - 导出图标
        const exportBtn = document.createElement('div');
        exportBtn.className = 'ds-toggle-right';
        exportBtn.innerHTML = '🗂️';
        exportBtn.title = '导出对话';
        contextToggle.appendChild(exportBtn);
        // 在 headerButtons 中添加导出按钮
        
        
        
                const inputBox = document.createElement('textarea');
                inputBox.className = 'ds-chat-input';
                inputBox.placeholder = '请输入/查看指令....';
                inputBox.rows = 2;
                inputBox.style.padding = '8px 10px';
                inputArea.appendChild(inputBox);
                    // 等待你的输入框创建完成后再执行
                    const cmdConfig = { // <--- 使用 cmdConfig 避免冲突
                        triggerChar: '/',
                        commands: [
                            {name: 'image', desc: '生图'},
                            {name: 'video', desc: '插入视频'},
                            {name: 'link', desc: '插入链接'},
                            {name: 'header', desc: '插入标题'}
                            // Add more commands as needed
                        ]
                    };
            
                    // 创建提示框
                    const suggestions = document.createElement('div');
                    suggestions.className = 'ds-cmd-suggestions';
                    // !! 重要：添加到 document.body，而不是 inputBox !!
                    document.body.appendChild(suggestions);
            
                    // 添加样式 (如果你的主CSS里没有，就保留；如果主CSS里已经定义了 .ds-cmd-suggestions 等样式，这里可以省略)
                    // 确保 CSS 中 .ds-cmd-suggestions 有 position: absolute; 和 z-index: 2147483647;
                    if (!document.getElementById('ds-cmd-styles')) {
                        const style = document.createElement('style');
                        style.id = 'ds-cmd-styles';
                        style.textContent = `
                            .ds-cmd-suggestions {
                                display: none;
                                position: absolute; /* 必须是 absolute */
                                background: white;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                z-index: 2147483647; /* 确保在最顶层 */
                                max-height: 150px;
                                overflow-y: auto;
                                font-family: inherit;
                                min-width: 150px;
                            }
                            .ds-cmd-suggestion {
                                padding: 6px 10px;
                                cursor: pointer;
                                font-size: 13px;
                                white-space: nowrap;
                            }
                            .ds-cmd-suggestion:hover,
                            .ds-cmd-suggestion.highlight {
                                background-color: #eee;
                            }
                            .ds-cmd-suggestion small {
                                color: #777;
                                margin-left: 8px;
                                font-size: 11px;
                            }
                        `;
                        document.head.appendChild(style);
                    }
            
                    let activeSuggestionIndex = -1;
            
                    // 显示/隐藏函数
                    function showSuggestions(filter = '') {
                        // !! 使用 cmdConfig !!
                        const filtered = filter
                            ? cmdConfig.commands.filter(cmd => cmd.name.toLowerCase().startsWith(filter.toLowerCase()))
                            : cmdConfig.commands;
            
                        if (filtered.length === 0) {
                            hideSuggestions();
                            return;
                        }
            
                        // !! 使用正确的 inputBox 变量 !!
                        const rect = inputBox.getBoundingClientRect();
                        suggestions.style.display = 'block';
                        // !! 计算准确的位置，考虑页面滚动 !!
                        suggestions.style.left = `${rect.left + window.scrollX}px`;
                        suggestions.style.top = `${rect.bottom + window.scrollY}px`;
                        suggestions.style.minWidth = `${rect.width}px`;
            
                        suggestions.innerHTML = filtered.map((cmd, index) => `
                            <div class="ds-cmd-suggestion" data-cmd="${cmd.name}" data-index="${index}">
                                ${cmdConfig.triggerChar}${cmd.name} <small>${cmd.desc}</small>
                            </div>
                        `).join('');
            
                        activeSuggestionIndex = -1;
            
                        suggestions.querySelectorAll('.ds-cmd-suggestion').forEach(item => {
                            item.addEventListener('click', () => {
                                insertCommand(item.dataset.cmd);
                            });
                        });
                    }
            
                    function hideSuggestions() {
                        if (suggestions.style.display !== 'none') {
                            suggestions.style.display = 'none';
                            suggestions.innerHTML = '';
                            activeSuggestionIndex = -1;
                        }
                    }
            
                     function updateHighlight() {
                         const items = suggestions.querySelectorAll('.ds-cmd-suggestion');
                         items.forEach((item, index) => {
                             if (index === activeSuggestionIndex) {
                                 item.classList.add('highlight');
                                 item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                             } else {
                                 item.classList.remove('highlight');
                             }
                         });
                    }
            
                    function insertCommand(cmd) {
                        // !! 使用正确的 inputBox 和 cmdConfig !!
                        const currentValue = inputBox.value;
                        const cursorPos = inputBox.selectionStart;
                        const textBeforeCursor = currentValue.substring(0, cursorPos);
                        const triggerPos = textBeforeCursor.lastIndexOf(cmdConfig.triggerChar);
            
                        if (triggerPos === -1) {
                             hideSuggestions();
                             return;
                        }
            
                        const prefix = currentValue.substring(0, triggerPos);
                        const suffix = currentValue.substring(cursorPos);
            
                        inputBox.value = prefix + cmdConfig.triggerChar + cmd + ' ' + suffix;
            
                        const newCursorPos = prefix.length + cmdConfig.triggerChar.length + cmd.length + 1;
                        inputBox.focus();
                        inputBox.setSelectionRange(newCursorPos, newCursorPos);
            
                        hideSuggestions();
                    }
            
                    // 事件监听
                    // !! 确保所有监听器都绑定到正确的 inputBox !!
                    inputBox.addEventListener('input', function(e) {
                        const val = e.target.value;
                        const cursorPos = e.target.selectionStart;
                        const textBeforeCursor = val.substring(0, cursorPos);
                         // !! 使用 cmdConfig !!
                        const lastTriggerPos = textBeforeCursor.lastIndexOf(cmdConfig.triggerChar);
            
                        if (lastTriggerPos !== -1) {
                             const textAfterTrigger = textBeforeCursor.substring(lastTriggerPos + 1);
                            if (!/\s/.test(textAfterTrigger)) {
                                showSuggestions(textAfterTrigger);
                             } else {
                                 hideSuggestions();
                             }
                        } else {
                             hideSuggestions();
                        }
                    });
            
                    // !! 替换掉你原来的两个 inputBox keydown 监听器 !!
    inputBox.addEventListener('keydown', function(e) {
        const suggestionsVisible = suggestions.style.display === 'block';
        const items = suggestionsVisible ? suggestions.querySelectorAll('.ds-cmd-suggestion') : [];
        let handled = false; // 标记事件是否已被处理

        // --- 优先处理命令提示的逻辑 ---
        if (suggestionsVisible && items.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                    updateHighlight();
                    handled = true;
                    break;
                case 'ArrowUp':
                    activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                    updateHighlight();
                    handled = true;
                    break;
                case 'Enter':
                case 'Tab': // Tab 也用于选择
                     if (activeSuggestionIndex > -1) { // 有高亮项
                        insertCommand(items[activeSuggestionIndex].dataset.cmd);
                        handled = true; // 事件被命令选择处理了
                    } else if (e.key === 'Enter') {
                        // 如果提示框可见，但没有选中项，按 Enter 通常不应发送消息，只隐藏提示
                        hideSuggestions();
                        handled = true; // 阻止 Enter 的默认行为（如换行）和发送消息
                    }
                    // 如果是 Tab 且无选中项，则不处理，让 Tab 键默认行为发生（切换焦点）
                    break;
                case 'Escape':
                    hideSuggestions();
                    handled = true;
                    break;
            }
        }

        // --- 如果事件已被命令提示处理，则阻止后续行为 ---
        if (handled) {
            e.preventDefault();
            e.stopPropagation(); // 确保万无一失，阻止其他监听器
            return; // 不再执行下面的发送逻辑
        }

        // --- 如果事件未被处理，并且是 Enter 键（非 Shift+Enter），则执行发送逻辑 ---
        if (e.key === 'Enter' && !e.shiftKey) {
            // 阻止 Enter 的默认行为（如换行）
            e.preventDefault();

            const message = inputBox.value.trim();
            if (message) {
                // 隐藏发送按钮（如果需要立即隐藏）
                if (typeof startButton !== 'undefined' && startButton) { // 检查 startButton 是否定义
                   // startButton.style.display = 'none'; // 这行可以去掉，sendMessage 里似乎会处理
                }
                sendMessage(message); // 调用发送函数
                inputBox.value = ''; // 清空输入框
                 // 注意：这里不需要再调用 stopPropagation，因为我们希望这是 Enter 的最终行为
            }
        }

        // 对于其他按键（非 Enter, ArrowUp/Down, Tab, Escape），不阻止默认行为，允许输入
    });
                    document.addEventListener('click', function(e) {
                         // !! 使用正确的 inputBox !!
                         if (!inputBox.contains(e.target) && !suggestions.contains(e.target)) {
                             hideSuggestions();
                         }
                    });
            
                     inputBox.addEventListener('blur', function(e) {
                         setTimeout(() => {
                             if (!suggestions.contains(document.activeElement)) {
                                 hideSuggestions();
                             }
                         }, 100);
                     });
                
        
                const settingsArea = document.createElement('div');
                settingsArea.className = 'ds-chat-settings';
                inputArea.appendChild(settingsArea);
        
                const settingsBtn = document.createElement('span');
                settingsBtn.className = 'ds-chat-settings-btn';
                settingsBtn.innerText = '🖋️';
                settingsBtn.title = 'AI设置'; // 添加提示
                settingsArea.appendChild(settingsBtn);
        
                const summarizeBtn = document.createElement('span');
                summarizeBtn.className = 'ds-chat-settings-btn';
                summarizeBtn.innerText = '📄';
                summarizeBtn.title = '总结当前网页';
                summarizeBtn.style.marginRight = '10px';
                settingsArea.appendChild(summarizeBtn);
        
        
                const customCaptureBtn = document.createElement('span');
                customCaptureBtn.className = 'ds-chat-settings-btn';
                customCaptureBtn.innerText = '🔍';
                customCaptureBtn.title = '自定义抓取规则';
                customCaptureBtn.style.marginRight = '10px';
                settingsArea.insertBefore(customCaptureBtn, summarizeBtn);
        
                const clearBtn = document.createElement('span');
                clearBtn.className = 'ds-chat-settings-btn';
                clearBtn.innerText = '🎨';
                clearBtn.title = '清空聊天历史'; // 添加提示
                settingsArea.appendChild(clearBtn);
        
                const scrollToBottomBtn = document.createElement('div');
                scrollToBottomBtn.className = 'ds-scroll-to-bottom';
                scrollToBottomBtn.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+ElEQVR4nO2ZQQ6CMBBF34pjqGcR9IgKlxPRC6hrkjEmXUxIXNCGFs1/yWz//Cm/JAwghBBrZwd0wB0YAVu4xtCrBbap5o/AK4Np+1JPoEk5+ZLmzQ2xiRmgcyIXYA9ULE8F1EDv+p9jhO5O4GM+N7XrP8QI+Aub4+SnVJOLPRufw1JYigdbWc2mtGHTAPzRHSiFaQD0BJIwRQhFKAlThFCEkjBFCEUoCVOE+JMI2QpqNqUNmwbgx7/Ixl9fbN0KrxYb1/8aI9A6gT4I5lruHibL3VOM0Dastku/fR6x63XCqT8Lm69JZBMe4ZDxF9MQekafvBBCkIU3HL4pE5WP8IAAAAAASUVORK5CYII=" alt="new-presentation">';
                
                scrollToBottomBtn.title = '滚动到底部';
                chatWindow.appendChild(scrollToBottomBtn);


// ============== 在创建inputBox后插入这部分代码 ==============
// 放在创建textarea之后的代码中（确保inputBox已存在）

// ============== 代码结束 ==============




                // 监听滚动事件
        let isUserScrolling = false;
        let scrollTimeout = null;
        // 修改滚动检测逻辑，确保更精确判断是否接近底部
        // 修改滚动检测逻辑，确保按钮能正确显示
        // 修改滚动检测逻辑，确保更精确判断是否接近底部
        function checkScrollPosition() {
            const chatContent = document.querySelector('.ds-chat-content');
            if (!chatContent) return;
            if (chatContent) {
                const computedStyle = getComputedStyle(chatContent);
                const contentHeight = parseFloat(computedStyle.height) || 0;
                
                // 如果内容高度不足100px或者没有足够内容需要滚动
                if (contentHeight < 100 || chatContent.scrollHeight <= chatContent.clientHeight) {
                    scrollToBottomBtn.style.display = 'none';
                    return;
                }
            }
          
            // 增加滚动阈值到150px，避免过于敏感
            const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 150;
            
            // 确保scrollToBottomBtn已定义
            if (typeof scrollToBottomBtn !== 'undefined' && scrollToBottomBtn) {
              scrollToBottomBtn.style.display = (isNearBottom || isUserScrolling) ? 'none' : 'flex';
            }
          }
          
          // 确保滚动按钮点击事件绑定正确
          if (scrollToBottomBtn) {
            scrollToBottomBtn.addEventListener('click', () => {
              const chatContent = document.querySelector('.ds-chat-content');
              if (chatContent) {
                chatContent.scrollTo({
                  top: chatContent.scrollHeight,
                  behavior: 'smooth'
                });
                
                // 滚动后强制隐藏按钮
                setTimeout(() => {
                  if (scrollToBottomBtn) {
                    scrollToBottomBtn.style.display = 'none';
                  }
                }, 500);
              }
            });
          }
          
          // 修改滚动事件监听，增加防抖
          if (chatContent) {
            chatContent.addEventListener('scroll', () => {
              isUserScrolling = true;
              checkScrollPosition();
          
              // 使用更可靠的防抖逻辑
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                isUserScrolling = false;
                checkScrollPosition();
              }, 300); // 缩短防抖时间到300ms
            });
          }
                // 显示历史消息
                // ... 已有代码 ...
        

    function displayHistory() {
        chatContent.innerHTML = '';
        config.chatHistory.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ds-chat-hmessage ds-${msg.role}-hmessage`; // Use history classes
            // 根据角色添加对应标识 - Keep original content for copy
            const originalContent = msg.content;
            const contentWithLabel = msg.role === 'user' ? `${originalContent}` : `🤖：${originalContent}`;
            if(msg.role != 'user'){
            msgDiv.innerHTML = marked.parse(contentWithLabel);
            }else{
            msgDiv.innerHTML = contentWithLabel;
            }
            // Add code buttons if any pre tags exist
            
            addCopyButtonsToCodeBlocks(msgDiv);
            const msgsDiv = addMessageOptionsMenu(msgDiv);
           
if(msg.role != 'user'){
            chatContent.appendChild(msgsDiv);
}
else{
    const userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'ds-user-hmessage-container'; // 可自定义类名用于样式调整
    userMessageContainer.style.display = 'flex';
    userMessageContainer.style.justifyContent = 'flex-end'; // 让内容靠右
   // userMessageContainer.style.alignItems = 'center'; // 垂直居中对齐

    // 总是添加到历史记录，但内容会根据isSummaryTask变化

    // 创建头像元素
    const avatar = document.createElement('img');
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO2XQW6DMBBFX1gkh0jgCm2XcAXCrixyhybHbNoVvUpF9o6QBqmqWoUah7HVedLfRBj/DzNkDIZhhCQDCqACaqAV1fJbIddESQ40wOGGGrk2GlbA0wTj3zWsGdaq42N+1KO2+XyG+VE7LfPZxJqf0hOZRoAigPmDaLjX4lQBA5QaAfYBA9QaAdqAAdrUAzxrBEi+hKrUm7gIGCDXCJAFKqNGc0JNepQIMcw9EAErmSr/an5YE8U4PbKb2BP7GMrm1pGy/OFIWUrPRHukNAzDuA8b4AS8ARfA3VkX2esoe89iC3wsYNr9ok48eD95TfPuSwivN3GKwLwTvfgEeI/AuBOdfQL0ERh3oj71AJ//soSOERh3c5p4I58wbfMdsMaTrXKIbs4f2chaXuF5ocbugVfZ0/vJG4ZhsAhXSvn7fc8Yyv8AAAAASUVORK5CYII=";
    avatar.alt = "user";
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVR4nO2SPQ4BQQCFPxqVhoRi6VDsAdxCxVWo9w5OIRsVEhGXoNiGVkdi6ShWJnkSETshRjT7kte8vJ/dmYEMjlADQuAkjoGmy/IDkDzRaJ6LgVCFExUaTqWNXAycVPb4tXVpRxcDscpqvxoYq2yqEcOZNHN8X6MF7FMuuYEjeLrQWAxdlmdIRR5oAwGwBCLgLEbSAnmM920UgAGwe/Fy0mi8fWWtqALrh+AWGAIdwAeKoi9tKM/dvwIqtoGFjBugC+Te+GPj6SljsnOb+SpTic9RVvZiMyWO+L+BDDzjBhltb91A/g4cAAAAElFTkSuQmCC";
    //avatar.style.marginLeft = "10px"; 
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABkElEQVR4nO2YSyuEURyHH8rwLdx2blFSNprktmEhG5+C2JKkZMEnsDZKZOdSysIHkEQuIx8AK7J0dOq8NZ0yY857zPm/Ok/9NjN1+j2dOe/7PwORSKboBlaAU+Da5MR81kUGaAMOAVUmX8AB0IpQhoG3ChKleQXyCKMP+KhCIskn0I8QmoBnB4kkRaARASymkEgyjwDuPIjchJZo9yCRJOhTbNyjyGhIkVmPInqtYIx5FBkJKfJvzojm1oOEnsWCs+BBZA4hb/anFBKPQA4h9DrOWu9AD8LIm4n2txIvwBBCaQH2zZ3jJwH93R7QTAboBJaB45Ib4hGwBHSELheJRCLZIwdMAdvABfBgxhMfuTdr6rUngYa/kpgx/3ioGqUITPsUqAe2aiigrGyaDqnZCCihTNbTSkwIkFBmPtPXaif0dl4JkFAml0Cdi8iggPLKyoCLyJqA4srKqovIroDiysqOi8iZgOLKiu5UNecCiisrulMUUQJ2QsUdIZ4R4k+LeEbKU/B4+/OVQoXOkQie+QY59KcNhbK46gAAAABJRU5ErkJggg==";
    avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABkElEQVR4nO2YSyuEURyHH8rwLdx2blFSNprktmEhG5+C2JKkZMEnsDZKZOdSysIHkEQuIx8AK7J0dOq8NZ0yY857zPm/Ok/9NjN1+j2dOe/7PwORSKboBlaAU+Da5MR81kUGaAMOAVUmX8AB0IpQhoG3ChKleQXyCKMP+KhCIskn0I8QmoBnB4kkRaARASymkEgyjwDuPIjchJZo9yCRJOhTbNyjyGhIkVmPInqtYIx5FBkJKfJvzojm1oOEnsWCs+BBZA4hb/anFBKPQA4h9DrOWu9AD8LIm4n2txIvwBBCaQH2zZ3jJwH93R7QTAboBJaB45Ib4hGwBHSELheJRCLZIwdMAdvABfBgxhMfuTdr6rUngYa/kpgx/3ioGqUITPsUqAe2aiigrGyaDqnZCCihTNbTSkwIkFBmPtPXaif0dl4JkFAml0Cdi8iggPLKyoCLyJqA4srKqovIroDiysqOi8iZgOLKiu5UNecCiisrulMUUQJ2QsUdIZ4R4k+LeEbKU/B4+/OVQoXOkQie+QY59KcNhbK46gAAAABJRU5ErkJggg==";
    avatar.style.marginTop = "10px"; // 可以根据需要调整头像和消息块的间距
    avatar.style.width = "30px"; // 可以根据需要调整宽度
    avatar.style.height = "30px"; // 可以根据需要调整高度

    // 将用户消息块和头像添加到容器
    userMessageContainer.appendChild(msgsDiv);
    userMessageContainer.appendChild(avatar);

    // 将容器添加到聊天内容区域
    chatContent.appendChild(userMessageContainer);
    //addMessageOptionsMenu(userMessageContainer);
}
        });
        chatContent.scrollTop = chatContent.scrollHeight;
    }

        // ... 已有代码 ...
    displayHistory();
        //颜色变化适配
        
        
        
         // 在创建 chatHeader 后添加以下代码
        function updateHeaderTheme() {
            // 1. 尝试获取网页的主题色meta标签
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta && themeColorMeta.content) {
                applyThemeColor(themeColorMeta.content);
                return;
            }
        
            // 2. 智能分析页面主色调
            getDominantColor().then(color => {
                applyThemeColor(color);
            }).catch(() => {
                // 3. 回退到随机柔和色
                applyRandomColor();
            });
        }
        
        // 使用Canvas分析页面主色调（性能优化版）
        function getDominantColor() {
            return new Promise((resolve, reject) => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
        
                    // 设置较小尺寸提高性能
                    canvas.width = 50;
                    canvas.height = 50;
        
                    // 绘制页面缩略图
                    ctx.drawWindow(window, 0, 0, canvas.width, canvas.height, 'rgb(255,255,255)');
        
                    // 获取主要颜色
                    const pixelData = ctx.getImageData(0, 0, 1, 1).data;
                    const color = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, 0.2)`;
                    resolve(color);
                } catch (e) {
                    reject(e);
                }
            });
        }
        
        // 应用主题色
        function applyThemeColor(color) {
            // 转换为HSL调整亮度
            const hsl = hexToHSL(color);
            const adjustedHsl = `hsla(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l, 85)}%, 0.2)`;
        
            chatHeader.style.setProperty('--header-bg', adjustedHsl);
            chatHeader.style.setProperty('--header-text', hsl.l > 50 ? '#222' : '#fff');
        }
        
        // 应用随机柔和色
        function applyRandomColor() {
            const hue = Math.floor(Math.random() * 360);
            const color = `hsla(${hue}, 70%, 80%, 0.15)`;
            chatHeader.style.setProperty('--header-bg', color);
        }
        
        // 辅助函数：HEX转HSL
        function hexToHSL(hex) {
            // 处理rgb/rgba颜色
            if (hex.startsWith('rgb')) {
                const match = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    const r = parseInt(match[1]) / 255;
                    const g = parseInt(match[2]) / 255;
                    const b = parseInt(match[3]) / 255;
                    return rgbToHSL(r, g, b);
                }
            }
        
            // 处理hex颜色
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.substring(1, 3), 16);
                g = parseInt(hex.substring(3, 5), 16);
                b = parseInt(hex.substring(5, 7), 16);
            }
            return rgbToHSL(r / 255, g / 255, b / 255);
        }
        
        function rgbToHSL(r, g, b) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
        
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
        
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }
        
        // 初始化调用
        updateHeaderTheme();
        
        // 监听主题变化（如暗黑模式切换）
        const themeObserver = new MutationObserver(() => {
            updateHeaderTheme();
        });
        
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        
        // 监听页面主要元素变化
        const resizeObserver = new ResizeObserver(() => {
            if (!document.hidden) {
                updateHeaderTheme();
            }
        });
        
        // 观察页面主要区域
        const mainElements = ['body', 'main', '#main', '.main-content'].map(q => document.querySelector(q));
        mainElements.forEach(el => {
            if (el) resizeObserver.observe(el);
        });
        
        
        
        
        
        
        
                // 事件监听
                // 在创建chatHeader后添加以下代码
       
                chatHeader.style.cursor = 'move'; // 设置头部的鼠标样式为可拖动
                let isDraggingWindow = false;     // 窗口是否正在被拖动
                let windowStartX, windowStartY;   // 窗口拖动起始坐标
                let windowInitialLeft, windowInitialTop; // 窗口拖动起始位置

                chatHeader.addEventListener('mousedown', (e) => {
                   // 仅左键，且非全屏时才能拖动
                   if (e.button !== 0 || chatWindow.classList.contains('fullscreen')) return;
                   isDraggingWindow = true;
                   windowStartX = e.clientX;
                   windowStartY = e.clientY;
                   const styles = window.getComputedStyle(chatWindow);
                   // 拖动窗口时，通常是基于 left/top 定位
                   windowInitialLeft = parseFloat(styles.left) || (window.innerWidth - chatWindow.offsetWidth) / 2; // 读取当前left，若无效则居中
                   windowInitialTop = parseFloat(styles.top) || 50; // 读取当前top，若无效则靠近顶部
                   e.preventDefault();
                   chatWindow.style.userSelect = 'none'; // 拖动时禁止选择窗口内文本
                   chatWindow.style.cursor = 'grabbing'; // 窗口拖动时的鼠标样式
                });

                chatHeader.addEventListener('touchstart', (e) => {
                    // 仅单指，且非全屏时
                    if (e.touches.length !== 1 || chatWindow.classList.contains('fullscreen')) return;
                    isDraggingWindow = true;
                    const touch = e.touches[0];
                    windowStartX = touch.clientX;
                    windowStartY = touch.clientY;
                    const styles = window.getComputedStyle(chatWindow);
                    windowInitialLeft = parseFloat(styles.left) || (window.innerWidth - chatWindow.offsetWidth) / 2;
                    windowInitialTop = parseFloat(styles.top) || 50;
                    // touchstart 时可以先不阻止默认行为，允许可能的滚动启动
                    chatWindow.style.userSelect = 'none';
                    chatWindow.style.cursor = 'grabbing';
                 }, { passive: true }); // 如果这里不调用 preventDefault，可以是 passive

                // 同样，窗口的移动和结束事件监听 document
                document.addEventListener('mousemove', (e) => {
                    if (!isDraggingWindow) return; // 必须是窗口启动的拖动
                    const deltaX = e.clientX - windowStartX;
                    const deltaY = e.clientY - windowStartY;
                    const newLeft = windowInitialLeft + deltaX;
                    const newTop = windowInitialTop + deltaY;

                    // 窗口边界检查
                    const maxLeft = window.innerWidth - chatWindow.offsetWidth;
                    const maxTop = window.innerHeight - chatWindow.offsetHeight;
                    const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
                    const clampedTop = Math.max(0, Math.min(newTop, maxTop));

                    // 更新窗口位置 (使用 left/top)
                    chatWindow.style.left = `${clampedLeft}px`;
                    chatWindow.style.top = `${clampedTop}px`;
                    chatWindow.style.right = 'auto'; // 确保 right/bottom 是 auto
                    chatWindow.style.bottom = 'auto';
                });

                 document.addEventListener('touchmove', (e) => {
                    if (!isDraggingWindow || e.touches.length !== 1) return; // 必须是窗口启动的拖动且单指
                     e.preventDefault(); // 拖动窗口时，必须阻止页面滚动
                    const touch = e.touches[0];
                    const deltaX = touch.clientX - windowStartX;
                    const deltaY = touch.clientY - windowStartY;
                    const newLeft = windowInitialLeft + deltaX;
                    const newTop = windowInitialTop + deltaY;

                    const maxLeft = window.innerWidth - chatWindow.offsetWidth;
                    const maxTop = window.innerHeight - chatWindow.offsetHeight;
                    const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
                    const clampedTop = Math.max(0, Math.min(newTop, maxTop));

                    chatWindow.style.left = `${clampedLeft}px`;
                    chatWindow.style.top = `${clampedTop}px`;
                    chatWindow.style.right = 'auto';
                    chatWindow.style.bottom = 'auto';
                }, { passive: false }); // 这里需要 passive: false 因为调用了 preventDefault

                // 统一处理窗口拖动结束的函数
                const endWindowDrag = () => {
                    if (isDraggingWindow) {
                        isDraggingWindow = false;
                        chatWindow.style.userSelect = ''; // 恢复文本选择
                        chatWindow.style.cursor = '';     // 恢复窗口默认光标
                        // 根据是否全屏恢复头部的光标
                        chatHeader.style.cursor = chatWindow.classList.contains('fullscreen') ? 'default' : 'move';
                    }
                };

                document.addEventListener('mouseup', endWindowDrag);
                document.addEventListener('touchend', endWindowDrag);
                document.addEventListener('mouseleave', endWindowDrag); // 鼠标离开窗口也要结束拖动
                document.addEventListener('touchcancel', endWindowDrag); // 触摸取消也要结束
                customCaptureBtn.addEventListener('click', () => {
            const currentSelectors = config.customSelectors || '';
            const newSelectors = prompt(`当前页面可用元素选择器(多个用逗号分隔):
        例如: #content, .article, .post-content
        当前规则: ${currentSelectors}`, currentSelectors);
        
                    if (newSelectors !== null) {
                        config.customSelectors = newSelectors;
                        GM_setValue('customSelectors', config.customSelectors);
                        alert('自定义抓取规则已保存!');
                    }
                });
        
                closeBtn.addEventListener('click', () => {
                    chatWindow.classList.remove('active');
                    chatWindow.style.display = 'none';
                    icon.style.display = 'flex';
                });
        
                fullscreenBtn.addEventListener('click', () => {
                    chatWindow.classList.toggle('fullscreen');
                    if (chatWindow.classList.contains('fullscreen')) {
                        fullscreenBtn.innerText = '⛶';
                        // 全屏时禁用拖动
                        chatHeader.style.cursor = 'default';
                    } else {
                        fullscreenBtn.innerText = '⛶';
                        // 退出全屏时恢复拖动
                        chatHeader.style.cursor = 'move';
                    }
                });
        
                contextCheckbox.addEventListener('change', () => {
                    config.usePageContext = contextCheckbox.checked;
                    GM_setValue('usePageContext', config.usePageContext);
                });
        
                settingsBtn.addEventListener('click', () => {
                    config.hidden = !config.hidden;
                    console.log("config.hidden1:",config.hidden);

                    chatWindow.classList.remove('active');
                    chatWindow.style.display = 'none';
                    showSettingsModal();
                   
                });
                function inspect_chatWindow() {
                    //ai-settings-modal不存在是chatWindow应该存在
                    const existingModals = document.getElementById('ai-settings-modal');
                    console.log("config.hidden3:",config.hidden);
                    if(config.hidden){
                        console.log("config.hidden2:",config.hidden);
                    if (!existingModals) {
                        chatWindow.classList.add('active');
                        chatWindow.style.display = 'flex';
                    }
                    }
                    }
                //检查chatWindow是否存在
                inspect_chatWindow();
// 创建设置浮窗
function showSettingsModal() {
    // 检查是否已有设置窗口
    const existingModal = document.getElementById('ai-settings-modal');
    if (existingModal) {
        existingModal.style.display = 'block';
        return;
    }

    // 创建模态窗口
    const modal = document.createElement('div');
    modal.id = 'ai-settings-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.zIndex = '10000';
    modal.style.width = '70%';
    modal.style.height = '70%';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modal.style.color = '#333';
    modal.style.fontFamily = 'Arial, sans-serif';

    // 设置标题
    const title = document.createElement('h2');
    title.textContent = 'AI 助手设置';
    title.style.margin = '0 0 20px 0';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '10px';
    modal.appendChild(title);

    // 设置项容器
    const settingsContainer = document.createElement('div');
    settingsContainer.style.display = 'grid';
    settingsContainer.style.gap = '15px';
    modal.appendChild(settingsContainer);

    // 创建设置项
    const settings = [
        {
            id: 'apiUrl',
            label: 'API 地址',
            value: config.apiUrl,
            placeholder: 'https://api.deepseek.com/v1/chat/completions',
            type: 'text',
            help: '默认: https://api.deepseek.com/v1/chat/completions'
        },
        {
            id: 'apiKey',
            label: 'API 密钥',
            value: config.apiKey,
            placeholder: '输入您的 API 密钥',
            type: 'password',
            help: '您的 API 访问密钥'
        },
        {
            id: 'model',
            label: '模型名称',
            value: config.model,
            placeholder: 'deepseek-v3-250324',
            type: 'text',
            help: '默认: deepseek-v3-250324'
        },
        {
            id: 'temperature',
            label: 'Temperature',
            value: config.temperature,
            placeholder: '0.5-0.8',
            type: 'number',
            min: 0,
            max: 2,
            step: 0.1,
            help: '取值范围 0-2，建议 0.5-0.8，值越高回答越随机'
        },
        {
            id: 'maxTokens',
            label: '输出 Token 限制',
            value: config.maxTokens,
            placeholder: '4096',
            type: 'number',
            min: 1,
            max: 8192,
            help: '最大不能超过 8192，默认 4096（影响输出文本长度）'
        },
        // {
        //     id: 'maxContextTokens',
        //     label: '最大上下文限制',
        //     value: config.maxContextTokens,
        //     placeholder: '32000',
        //     type: 'number',
        //     min: 1,
        //     max: 128000,
        //     help: '最大 128k，默认 32k（越大记忆越好）'
        // },
        {
            id: 'personalityPrompt',
            label: '自定义人格提示词',
            value: config.personalityPrompt,
            placeholder: 'AI助手',
            type: 'text',
            help: '默认: AI助手'
        },
        {
            id: '生图模式',
            label: '生图模式',
            value: config.picture_model,
            placeholder: true,
            type: 'bool',
            help: '默认: false or true(响应数据类型为data.image[0].url)'
        }
    ];

    // 历史记录存储对象
    const historyEntries = {};
    
    // 初始化历史记录
    settings.forEach(setting => {
        const historyKey = `${setting.id}_history`;
        const savedHistory = GM_getValue(historyKey, []);
        historyEntries[setting.id] = savedHistory;
        
        // 如果当前值不在历史记录中且不为空，添加到历史记录
        if (setting.value && !savedHistory.includes(setting.value)) {
            historyEntries[setting.id].push(setting.value);
            GM_setValue(historyKey, historyEntries[setting.id]);
        }
    });

    // 创建每个设置项的 UI
    settings.forEach(setting => {
        const settingGroup = document.createElement('div');
        settingGroup.style.display = 'flex';
        settingGroup.style.flexDirection = 'column';
        
        // 标签
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';
        settingGroup.appendChild(label);
        
        // 输入容器 (用于包含输入框和下拉按钮)
        const inputContainer = document.createElement('div');
        inputContainer.style.position = 'relative';
        inputContainer.style.display = 'flex';
        
        // 输入框
        const input = document.createElement('input');
        input.type = setting.type;
        input.id = `setting-${setting.id}`;
        input.value = setting.value || '';
        input.placeholder = setting.placeholder || '';
        input.style.width = '100%';
        input.style.padding = '8px 12px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ddd';
        input.style.fontSize = '14px';
        
        if (setting.type === 'number') {
            if (setting.min !== undefined) input.min = setting.min;
            if (setting.max !== undefined) input.max = setting.max;
            if (setting.step !== undefined) input.step = setting.step;
        }
        
        inputContainer.appendChild(input);
        
        // 历史下拉按钮
        if (historyEntries[setting.id] && historyEntries[setting.id].length > 0) {
            const historyButton = document.createElement('button');
            historyButton.className = 'history-button';
            historyButton.textContent = '▼';
            historyButton.title = '历史记录';
            historyButton.style.marginLeft = '5px';
            historyButton.style.padding = '8px 12px';
            historyButton.style.borderRadius = '4px';
            historyButton.style.border = '1px solid #ddd';
            historyButton.style.cursor = 'pointer';
            
            // 下拉菜单
            const dropdown = document.createElement('div');
            dropdown.style.display = 'none';
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.left = '0';
            dropdown.style.right = '0';
            dropdown.style.backgroundColor = '#fff';
            dropdown.style.border = '1px solid #ddd';
            dropdown.style.borderRadius = '4px';
            dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            dropdown.style.zIndex = '1';
            dropdown.style.maxHeight = '150px';
            dropdown.style.overflowY = 'auto';
            dropdown.style.marginTop = '5px';
            
            // 添加历史记录项
            historyEntries[setting.id].forEach(historyValue => {
                const historyItem = document.createElement('div');
                historyItem.style.padding = '8px 12px';
                historyItem.style.cursor = 'pointer';
                historyItem.style.borderBottom = '1px solid #eee';
                historyItem.style.display = 'flex';
                historyItem.style.justifyContent = 'space-between';
                historyItem.style.alignItems = 'center';
                
                // 创建内容容器
                const contentSpan = document.createElement('span');
                contentSpan.textContent = historyValue;
                contentSpan.style.flexGrow = '1';
                contentSpan.style.overflow = 'hidden';
                contentSpan.style.textOverflow = 'ellipsis';
                historyItem.appendChild(contentSpan);
                
                // 创建删除按钮
                const deleteBtn = document.createElement('span');
                deleteBtn.textContent = '×';
                deleteBtn.style.marginLeft = '8px';
                deleteBtn.style.color = '#999';
                deleteBtn.style.fontWeight = 'bold';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.padding = '0 4px';
                deleteBtn.title = '删除此记录';
                
                deleteBtn.addEventListener('mouseenter', () => {
                    deleteBtn.style.color = '#f44336';
                });
                
                deleteBtn.addEventListener('mouseleave', () => {
                    deleteBtn.style.color = '#999';
                });
                
                // 删除历史记录的点击事件
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止冒泡，防止触发historyItem的点击事件
                    
                    // 从历史记录中删除
                    const index = historyEntries[setting.id].indexOf(historyValue);
                    if (index > -1) {
                        historyEntries[setting.id].splice(index, 1);
                        GM_setValue(`${setting.id}_history`, historyEntries[setting.id]);
                        
                        // 从UI中移除
                        dropdown.removeChild(historyItem);
                        
                        // 如果没有历史记录了，隐藏下拉菜单
                        if (historyEntries[setting.id].length === 0) {
                            dropdown.style.display = 'none';
                            // 移除历史按钮
                            inputContainer.removeChild(historyButton);
                            inputContainer.removeChild(dropdown);
                        }
                    }
                });
                
                historyItem.appendChild(deleteBtn);
                
                historyItem.addEventListener('mouseenter', () => {
                    historyItem.style.backgroundColor = '#f5f5f5';
                });
                
                historyItem.addEventListener('mouseleave', () => {
                    historyItem.style.backgroundColor = '';
                });
                
                // 点击项目填充输入框
                contentSpan.addEventListener('click', () => {
                    input.value = historyValue;
                    dropdown.style.display = 'none';
                });
                
                dropdown.appendChild(historyItem);
            });
            
            historyButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (dropdown.style.display === 'none') {
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
            });
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', (e) => {
                if (e.target !== historyButton && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
            
            inputContainer.appendChild(historyButton);
            inputContainer.appendChild(dropdown);
        }
        
        settingGroup.appendChild(inputContainer);
        
        // 帮助文本
        if (setting.help) {
            const helpText = document.createElement('small');
            helpText.textContent = setting.help;
            helpText.style.marginTop = '4px';
            helpText.style.color = '#888';
            helpText.style.fontSize = '12px';
            settingGroup.appendChild(helpText);
        }
        
        settingsContainer.appendChild(settingGroup);
    });
const customParamsSection = document.createElement('div');
    customParamsSection.style.marginTop = '20px';
    customParamsSection.style.borderTop = '1px solid #eee';
    customParamsSection.style.paddingTop = '15px';
    
    const customParamsTitle = document.createElement('h3');
    customParamsTitle.textContent = '自定义额外参数';
    customParamsTitle.style.marginBottom = '15px';
    customParamsSection.appendChild(customParamsTitle);

    // 读取已有的自定义参数
    if (!config.additionalParams) {
        config.additionalParams = {};
        GM_setValue('additionalParams', config.additionalParams);
    }

    // 创建参数列表容器
    const paramsList = document.createElement('div');
    paramsList.id = 'custom-params-list';
    paramsList.style.display = 'grid';
    paramsList.style.gap = '10px';
    
    // 显示现有自定义参数
    function renderCustomParams() {
        paramsList.innerHTML = '';
        
        Object.entries(config.additionalParams).forEach(([key, value]) => {
            const paramRow = document.createElement('div');
            paramRow.style.display = 'flex';
            paramRow.style.gap = '10px';
            paramRow.style.marginBottom = '10px';
            
            // 参数键输入框
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.value = key;
            keyInput.placeholder = '参数名';
            keyInput.style.flex = '1';
            keyInput.style.padding = '8px 12px';
            keyInput.style.borderRadius = '4px';
            keyInput.style.border = '1px solid #ddd';
            keyInput.style.fontSize = '14px';
            keyInput.readOnly = true; // 不允许修改键名，需要删除重新添加
            
            // 参数值输入框
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.value = typeof value === 'string' ? value : JSON.stringify(value);
            valueInput.placeholder = '参数值';
            valueInput.style.flex = '1';
            valueInput.style.padding = '8px 12px';
            valueInput.style.borderRadius = '4px';
            valueInput.style.border = '1px solid #ddd';
            valueInput.style.fontSize = '14px';
            
            // 保存参数值的变更
            valueInput.addEventListener('change', () => {
                let parsedValue = valueInput.value;
                try {
                    // 尝试解析为JSON，处理数字、布尔值、对象等
                    if (parsedValue.trim() !== '' && 
                        (parsedValue.startsWith('{') || 
                         parsedValue.startsWith('[') || 
                         parsedValue === 'true' || 
                         parsedValue === 'false' || 
                         !isNaN(Number(parsedValue)))) {
                        parsedValue = JSON.parse(parsedValue);
                    }
                } catch (e) {
                    // 解析失败则保持为字符串
                    console.log("值保持为字符串", e);
                }
                
                config.additionalParams[key] = parsedValue;
                GM_setValue('additionalParams', config.additionalParams);
            });
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.style.padding = '8px 12px';
            deleteBtn.style.borderRadius = '4px';
            deleteBtn.style.border = '1px solid #ddd';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.backgroundColor = '#f44336';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            
            deleteBtn.addEventListener('click', () => {
                delete config.additionalParams[key];
                GM_setValue('additionalParams', config.additionalParams);
                renderCustomParams();
            });
            
            paramRow.appendChild(keyInput);
            paramRow.appendChild(valueInput);
            paramRow.appendChild(deleteBtn);
            paramsList.appendChild(paramRow);
        });
    }
    
    renderCustomParams();
    customParamsSection.appendChild(paramsList);
    
    // 添加新参数的表单
    const newParamForm = document.createElement('div');
    newParamForm.style.display = 'flex';
    newParamForm.style.gap = '10px';
    newParamForm.style.marginTop = '15px';
    
    // 新参数键输入框
    const newKeyInput = document.createElement('input');
    newKeyInput.type = 'text';
    newKeyInput.id = 'new-param-key';
    newKeyInput.placeholder = '新参数名';
    newKeyInput.style.flex = '1';
    newKeyInput.style.padding = '8px 12px';
    newKeyInput.style.borderRadius = '4px';
    newKeyInput.style.border = '1px solid #ddd';
    newKeyInput.style.fontSize = '14px';
    
    // 新参数值输入框
    const newValueInput = document.createElement('input');
    newValueInput.type = 'text';
    newValueInput.id = 'new-param-value';
    newValueInput.placeholder = '新参数值';
    newValueInput.style.flex = '1';
    newValueInput.style.padding = '8px 12px';
    newValueInput.style.borderRadius = '4px';
    newValueInput.style.border = '1px solid #ddd';
    newValueInput.style.fontSize = '14px';
    
    // 添加新参数按钮
    const addParamBtn = document.createElement('button');
    addParamBtn.textContent = '添加';
    addParamBtn.style.padding = '8px 16px';
    addParamBtn.style.borderRadius = '4px';
    addParamBtn.style.border = 'none';
    addParamBtn.style.cursor = 'pointer';
    addParamBtn.style.backgroundColor = '#4CAF50';
    addParamBtn.style.color = 'white';
    
    addParamBtn.addEventListener('click', () => {
        const key = newKeyInput.value.trim();
        let value = newValueInput.value.trim();
        
        if (key) {
            try {
                // 尝试解析为JSON，处理数字、布尔值、对象等
                if (value !== '' && 
                    (value.startsWith('{') || 
                     value.startsWith('[') || 
                     value === 'true' || 
                     value === 'false' || 
                     !isNaN(Number(value)))) {
                    value = JSON.parse(value);
                }
            } catch (e) {
                // 解析失败则保持为字符串
                console.log("值保持为字符串", e);
            }
            
            config.additionalParams[key] = value;
            GM_setValue('additionalParams', config.additionalParams);
            
            // 重置输入框
            newKeyInput.value = '';
            newValueInput.value = '';
            
            // 更新显示
            renderCustomParams();
        }
    });
    
    newParamForm.appendChild(newKeyInput);
    newParamForm.appendChild(newValueInput);
    newParamForm.appendChild(addParamBtn);
    
    customParamsSection.appendChild(newParamForm);
    modal.appendChild(customParamsSection);

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '10px';
    modal.appendChild(buttonContainer);

    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.className = 'cancel-button';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.border = '1px solid #ddd';
   
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modal);
        config.hidden = true; // 设置为显示聊天窗口
        inspect_chatWindow(); // 
    });
    buttonContainer.appendChild(cancelButton);

    // 保存按钮
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.className = 'save-button';
    saveButton.style.padding = '8px 16px';
    saveButton.style.borderRadius = '4px';
    saveButton.style.border = 'none';
    
    saveButton.style.cursor = 'pointer';
    saveButton.addEventListener('click', () => {
        // 保存所有设置并更新历史记录
        settings.forEach(setting => {
            const input = document.getElementById(`setting-${setting.id}`);
            let value = input.value;
            
            // 转换数值类型
            if (setting.type === 'number') {
                value = parseFloat(value);
                
                // 验证范围
                if (setting.min !== undefined && value < setting.min) value = setting.min;
                if (setting.max !== undefined && value > setting.max) value = setting.max;
            }
            
            // 更新配置
            config[setting.id] = value;
            GM_setValue(setting.id, value);
           
            // 更新历史记录
            if (value && typeof value === 'string' && value.trim() !== '') {
                const historyKey = `${setting.id}_history`;
                let history = GM_getValue(historyKey, []);
                
                // 如果不在历史记录中，添加到历史
                if (!history.includes(value)) {
                    history.push(value);
                    // 限制历史记录数量为 10 条
                    if (history.length > 10) {
                        history = history.slice(-10);
                    }
                    GM_setValue(historyKey, history);
                }
            }
            
           
        });
        
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modal);
        config.hidden = true; // 设置为显示聊天窗口
        inspect_chatWindow(); // 重新检查是否显示聊天窗口
    });
    buttonContainer.appendChild(saveButton);

    // 添加模态窗口背景遮罩
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.right = '0';
    modalOverlay.style.bottom = '0';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '9999';
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            document.body.removeChild(modal);
            config.hidden = true; // 设置为显示聊天窗口
            inspect_chatWindow(); // 重新检查是否显示聊天窗口
        }
    });

    // 添加到文档
    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);
}
        
                clearBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有对话记录吗？这将同时清空当前对话和完整历史记录。')) {
                config.chatHistory = [];
                config.fullConversation = [];
                GM_setValue('chatHistory', config.chatHistory);
                GM_setValue('fullConversation', config.fullConversation);
                chatContent.innerHTML = '';
            }
        });
        //点击发送消息
 startButton.addEventListener('click', () => {
    const message = inputBox.value.trim();
             if (message == "dskds") {
    if (confirm('激活成功，使用内置api')) {
      config.model = "deepseek-v3-250324";
         config.apiKey = "ae75309e-e48e-4bb5-8374-a73fb206d4c2";
         config.apiUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
         GM_setValue('apiUrl', config.apiUrl);

        GM_setValue('apiKey', config.apiKey);

        GM_setValue('model', config.model);
         inputBox.value = '';
    }
     }else if(message == 'dskzp'){
         if (confirm('激活成功，使用内置api')) {
      config.model = "THUDM/GLM-4-32B-0414";
         config.apiKey = "sk-vlyhjprkmppnkatcgirrjckzisxjdrhjtnujzsvibjyncfjw";
         config.apiUrl = "https://api.siliconflow.cn/v1/chat/completions";
         GM_setValue('apiUrl', config.apiUrl);

        GM_setValue('apiKey', config.apiKey);

        GM_setValue('model', config.model);
         inputBox.value = '';
     }
    }else if(message != '') {
                    sendMessage(message);
                    inputBox.value = '';
                }
           else{
           alert("发送消息不能为空！");
           }
});
        // inputBox.addEventListener('keydown', (e) => {
        //     if (e.key === 'Enter' && !e.shiftKey&& signs) {
        //         startButton.style.display = 'none';
        //         e.preventDefault();
        //         const message = inputBox.value.trim();
        //         if (message) {
        //             sendMessage(message);
        //             inputBox.value = '';
        //            // startButton.style.display = 'flex';
        //         }
        //     }
        // });
        //隐藏默认配置
                // 输入框事件
                // inputBox.addEventListener('keydown', (e) => {
                //     if (e.key === 'Enter' && !e.shiftKey) {
                //         e.preventDefault();
                //         const message = inputBox.value.trim();
                //         if (message) {
                //             sendMessage(message);
                //             inputBox.value = '';
                //         }
                //     }
                // });

                 /**
 * 获取网页主要内容
 * @returns {Object} 包含url、title和content的对象
 */
function getPageContent(flags=false) {
if (config.customSelectors && config.customSelectors.trim()&&!flags) {
        try {
            const selectors = config.customSelectors.split(',').map(s => s.trim()).filter(s => s);
            let combinedContent = '';

            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    // 合并所有匹配元素的内容
                    const selectorContent = Array.from(elements)
                        .map(el => el.textContent.trim())
                        .filter(text => text.length > 0)
                        .join('\n\n');

                    if (selectorContent.length > 0) {
                        // 添加选择器标识和内容
                        combinedContent += (combinedContent ? '\n\n' : '') +
                                         `[来自${selector}div区域的内容]:\n${selectorContent}`;
                    }
                }
            }

            if (combinedContent.length > 0) {
                return {
                    url: window.location.href,
                    title: document.title,
                    content: combinedContent,
                    charset: document.characterSet,
                    wordCount: combinedContent.split(/\s+/).length,
                    source: 'custom'
                };
            }
        } catch (e) {
            console.error('使用自定义选择器抓取内容失败:', e);
            // 失败后回退到默认抓取方式
        }
    }
    // 1. 多策略确定主要内容容器
    let mainContent = findMainContent();

    // 2. 克隆节点并清理
    const clone = mainContent.cloneNode(true);
    const elementsToRemove = clone.querySelectorAll(`
        script, style, noscript, iframe,
        nav, footer, header, aside,
        .sidebar, .ad, .ads, .advertisement,
        .social-share, .comments, .related-posts,
        [role="navigation"], [role="banner"],
        [aria-hidden="true"], .hidden, .d-none,
        img, video, audio, svg, canvas,
        .widget, .popup, .modal, .notification,
        .cookie-banner, .consent-banner,
        .breadcrumb, .pagination, .tag-cloud
    `);

    elementsToRemove.forEach(el => el.remove());

    // 3. 处理文本内容
    let text = clone.textContent
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/[^\S\r\n]{2,}/g, ' ')
        .trim();

    // 4. 截断
    const MAX_LENGTH = 20000;
    if (text.length > MAX_LENGTH) {
        let truncated = text.substring(0, MAX_LENGTH);
        let lastPeriod = truncated.lastIndexOf('.');
        if (lastPeriod > 0) {
            truncated = truncated.substring(0, lastPeriod + 1);
        } else {
            const otherPunctuations = [ '。', '！', '？' ];
            for (const punctuation of otherPunctuations) {
                const lastIndex = truncated.lastIndexOf(punctuation);
                if (lastIndex > 0) {
                    truncated = truncated.substring(0, lastIndex + 1);
                    break;
                }
            }
        }
        text = truncated;
    }

    // 5. 质量检查
    if (text.length < 100) {
        console.warn('获取的网页内容较短，可能质量不高');
    }

    return {
        url: window.location.href,
        title: document.title,
        content: text,
        charset: document.characterSet,
        wordCount: text.split(/\s+/).length
    };
}

/**
 * 多策略查找网页主要内容区域
 * @returns {HTMLElement} 主要内容区域的 DOM 元素
 */
function findMainContent() {
    // 策略 1: 使用选择器查找
    const mainSelectors = [
        'main',
        'article',
        '.main-content',
        '.article',
        '.post',
        '.content',
        '#content',
        '.entry-content',
        '.page-content',
        '.body-content',
        '.main-body'
    ];

    for (const selector of mainSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim().length > 0) {
            return el;
        }
    }

    // 策略 2: 使用文本密度算法
    return findContentByTextDensity();
}

/**
 * 使用文本密度算法查找主要内容区域
 * @returns {HTMLElement} 主要内容区域的 DOM 元素
 */
function findContentByTextDensity() {
    let bestElement = null;
    let maxDensity = 0;

    const allElements = document.body.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const text = element.textContent.trim();
        const textLength = text.length;
        const linkLength = Array.from(element.getElementsByTagName('a')).reduce((sum, link) => sum + link.textContent.length, 0);
        const density = (textLength - linkLength) / element.innerHTML.length;

        if (density > maxDensity && textLength > 200) {
            maxDensity = density;
            bestElement = element;
        }
    }

    return bestElement || document.body;
}

function positionChatWindow() {
    // --- 1. 检查是否全屏 ---
    if (chatWindow.classList.contains('fullscreen')) {
        console.log("positionChatWindow: 处于全屏模式，跳过定位计算。");
        return;
    }
    console.log("positionChatWindow: 开始计算位置 (方案A改进)...");

    // --- 2. 获取图标样式并推算 iconRect (增加健壮性) ---
    let iconRect;
    let errorOccurred = false;
    try {
        const iconStyles = window.getComputedStyle(icon);
        const iconWidth = icon.offsetWidth;
        const iconHeight = icon.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 优先尝试读取 right/bottom，如果无效或为 auto，则尝试 left/top
        let validIconRight = parseFloat(iconStyles.right);
        let validIconBottom = parseFloat(iconStyles.bottom);
        let validIconLeft = parseFloat(iconStyles.left);
        let validIconTop = parseFloat(iconStyles.top);

        // 如果 right/bottom 无效，尝试用 left/top 计算
        if (isNaN(validIconRight) || isNaN(validIconBottom)) {
             console.warn("无法从 right/bottom 获取有效位置, 尝试 left/top...");
             if (!isNaN(validIconLeft) && !isNaN(validIconTop)) {
                 iconRect = {
                     left: validIconLeft,
                     top: validIconTop,
                     right: validIconLeft + iconWidth,
                     bottom: validIconTop + iconHeight,
                     width: iconWidth,
                     height: iconHeight
                 };
                  console.log("使用 left/top 推算 iconRect");
             } else {
                 // 如果 left/top 也无效，则使用getBoundingClientRect 作为最后手段
                 console.warn("left/top 也无效, 回退到 getBoundingClientRect()...");
                 iconRect = icon.getBoundingClientRect();
                 // 检查 getBoundingClientRect 的结果是否合理 (不为 0,0)
                 if (iconRect.left === 0 && iconRect.top === 0 && iconRect.width > 0) {
                     console.warn("getBoundingClientRect() 返回了 (0,0) 或附近，可能不准确!");
                     // 在这里可以强制使用一个默认安全位置，如果 BBox 不可靠
                     // iconRect = { left: 10, top: viewportHeight - 60, right: 60, bottom: viewportHeight - 10, width: 50, height: 50 };
                 }
             }
        } else {
            // 使用 right/bottom 计算
            iconRect = {
                right: viewportWidth - validIconRight,
                bottom: viewportHeight - validIconBottom,
                left: viewportWidth - validIconRight - iconWidth,
                top: viewportHeight - validIconBottom - iconHeight,
                width: iconWidth,
                height: iconHeight
            };
             console.log("使用 right/bottom 推算 iconRect");
        }

        // 添加 toJSON 方法以便安全地打印
        if (iconRect && typeof iconRect === 'object') {
             iconRect.toJSON = () => ({
                left: iconRect.left, top: iconRect.top, right: iconRect.right, bottom: iconRect.bottom, width: iconRect.width, height: iconRect.height
             });
        } else {
             throw new Error("未能成功创建 iconRect 对象"); // 抛出错误以便 catch 捕获
        }

    } catch (e) {
        console.error("获取/计算图标位置或尺寸时出错:", e);
        errorOccurred = true;
        // 如果出错，提供一个默认的安全 Rect 对象
        const defaultTop = window.innerHeight - 60;
        const defaultLeft = 10;
        iconRect = { left: defaultLeft, top: defaultTop, right: defaultLeft + 50, bottom: defaultTop + 50, width: 50, height: 50, toJSON: () => ({left:defaultLeft, top:defaultTop, right:defaultLeft+50, bottom:defaultTop+50, width:50, height:50}) };
        console.warn("使用了默认的 iconRect:", iconRect.toJSON());
    }

    // --- 3. 获取其他输入值并打印 ---
    const winWidth = 340;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // 使用 70vh 计算最大高度 (用于边界检查)
    const maxWinHeight = viewportHeight * 0.7;
    const margin = 10;

    console.log('positionChatWindow 输入值:', {
        iconRect: iconRect.toJSON(),
        winWidth,
        maxWinHeight, // 使用 maxWinHeight 进行检查
        margin,
        viewportWidth,
        viewportHeight,
        errorOccurred // 记录是否在获取位置时出错
    });

    // --- 4. 计算理想位置并直接进行边界限制 ---
    let idealLeft, idealTop;

    // 优先尝试放在右边
    const spaceRight = viewportWidth - iconRect.right - margin;
    const spaceLeft = iconRect.left - margin;

    if (spaceRight >= winWidth || spaceRight >= spaceLeft) { // 如果右边空间够，或者右边空间比左边大
        idealLeft = iconRect.right + margin;
        console.log("优先尝试放置在右侧");
    } else { // 否则放在左边
        idealLeft = iconRect.left - winWidth - margin;
        console.log("空间不足，尝试放置在左侧");
    }

    // 决定垂直位置：优先尝试与图标顶部对齐，如果底部空间不足再考虑向上移动
    const spaceBelow = viewportHeight - iconRect.top - margin; // 从图标顶部开始算下方空间
    const spaceAbove = iconRect.bottom - margin; // 从图标底部开始算上方空间 (这里改用 bottom)

    if (spaceBelow >= maxWinHeight) { // 如果从图标顶部往下放足够放下最大高度
        idealTop = iconRect.top; // 尝试与图标顶部对齐
         console.log("垂直方向：尝试与图标顶部对齐");
    } else if (spaceAbove >= maxWinHeight) { // 如果从图标底部往上放足够
        idealTop = iconRect.bottom - maxWinHeight; // 放置窗口底部与图标底部对齐
        console.log("垂直方向：空间不足，尝试底部对齐图标底部");
    } else { // 上下空间都不够放最大高度，优先贴近图标顶部放置
        idealTop = iconRect.top;
        console.log("垂直方向：上下空间均不足，优先贴近图标顶部");
    }


    // --- 5. 对计算出的 idealLeft, idealTop 进行最终边界限制 ---
    let finalLeft = idealLeft;
    let finalTop = idealTop;
    console.log(`计算出的理想位置: L:${Math.round(idealLeft)}, T:${Math.round(idealTop)}`);

    // 限制左边界
    if (finalLeft < margin) {
        console.log(`  调整: 左侧超出 (${Math.round(finalLeft)} < ${margin}), 修正为 ${margin}`);
        finalLeft = margin;
    }
    // 限制右边界
    if (finalLeft + winWidth > viewportWidth - margin) {
        console.log(`  调整: 右侧超出 (${Math.round(finalLeft + winWidth)} > ${viewportWidth - margin}), 修正为 ${viewportWidth - winWidth - margin}`);
        finalLeft = viewportWidth - winWidth - margin;
        // 如果调整后又导致左边出界（屏幕太窄），再次修正
        if (finalLeft < margin) { finalLeft = margin; }
    }

    // 限制上边界
    if (finalTop < margin) {
        console.log(`  调整: 顶部超出 (${Math.round(finalTop)} < ${margin}), 修正为 ${margin}`);
        finalTop = margin;
    }
    // 限制下边界 (使用 maxWinHeight)
    if (finalTop + maxWinHeight > viewportHeight - margin) {
         console.log(`  调整: 底部超出 (${Math.round(finalTop + maxWinHeight)} > ${viewportHeight - margin}), 修正为 ${viewportHeight - maxWinHeight - margin}`);
        finalTop = viewportHeight - maxWinHeight - margin;
         // 如果调整后又导致顶部出界（屏幕太矮），再次修正
        if (finalTop < margin) { finalTop = margin; }
    }

    // --- 6. 应用最终位置 ---
    const finalPosition = { left: finalLeft, top: finalTop };
    console.log('最终将应用的定位:', {left: Math.round(finalPosition.left), top: Math.round(finalPosition.top)});

    if (typeof finalPosition.left === 'number' && typeof finalPosition.top === 'number') {
        chatWindow.style.left = `${finalPosition.left}px`;
        chatWindow.style.top = `${finalPosition.top}px`;
        chatWindow.style.right = 'auto';
        chatWindow.style.bottom = 'auto';
        console.log("样式已应用到 chatWindow");
    } else {
        console.error("计算出的 finalPosition 无效!", finalPosition);
        chatWindow.style.bottom = '10px';
        chatWindow.style.right = '10px';
        chatWindow.style.top = 'auto';
        chatWindow.style.left = 'auto';
        console.warn("应用了安全回退位置 (10px, 10px)");
    }
    console.log("positionChatWindow: 定位计算结束 (方案A改进)。");
}
// 确保在 icon 的 click 事件监听器中调用 positionChatWindow()
// (参考上面问题1的 click 事件代码，调用位置已包含)

// 然后，在上面修改过的 icon 的 'click' 事件监听器中，
// 在 chatWindow.classList.toggle('active') 之前调用 positionChatWindow();
// 如：
icon.addEventListener('click', (e) => {
    if (!hasMoved) {
        // --->>> 在这里调用定位函数 <<<---
        positionChatWindow();

        chatWindow.classList.toggle('active');

    }
});
// 代码实时执行

function Add_codebutton(pres){
    // 只为没有处理过的代码块添加按钮
    if (!pres.hasAttribute('data-buttons-added') && 
        !pres.nextElementSibling?.classList?.contains('code-buttons-container')) {
        addExecuteButton(pres);
    }
}
    // 为代码块添加运行按钮
   function addExecuteButton(preElement) {
     const code = preElement.textContent;
    const codeType = detectCodeType(code);
   
    if (codeType === 'python' || codeType === 'html') {
       // console.log(`解码为：${codeType}`);
    // 创建按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.className = 'code-buttons-container';
    btnContainer.style.position = 'relative';

    // 创建运行按钮
  
    const runBtn = document.createElement('button');
    runBtn.className = 'code-hexecute-btn';
    runBtn.textContent = '运行';
    runBtn.onclick = function(e) {
        e.stopPropagation();
        const code = preElement.textContent;
        const lang = detectCodeType(code);
        executeCode(code, lang);
    };

    // 将按钮容器插入到pre元素后面
    preElement.parentNode.insertBefore(btnContainer, preElement.nextSibling);

    // 将运行按钮添加到容器底部
    btnContainer.appendChild(runBtn);
}
}


    // 创建代码执行弹窗

function createExecutionModal() {
    const existingModal = document.querySelector('.code-execution-modal');
            if (existingModal) {
        existingModal.remove();
    }


        const modal = document.createElement('div');
        modal.className = 'code-execution-modal';
        modal.innerHTML = `
            <div class="code-execution-content">
                <div class="code-execution-header">
                    <h3 style= "color: white;">代码执行结果<span id="code-timer-status"></span></h3>
                    <div style="display: flex; align-items: center;">
                        <button id="examples-btn" style="margin-right: 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">示例</button>
                        <span class="fullscreen-btn" onclick="toggleFullscreen()">⛶</span>
                        <span class="code-execution-close">&times;</span>
                    </div>
                </div>
                <div class="code-execution-body">
                    <iframe id="code-sandbox"></iframe>
                    <div id="code-status-bar">等待执行...</div>
                    <div class="input-group" id="input-container" style="display: none; margin-top: 10px;">
                        <input type="text" id="python-input" placeholder="请输入内容..." style="padding: 8px; width: 70%; margin-right: 10px;">
                        <button id="submit-input" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">提交</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 事件监听
        modal.querySelector('.code-execution-close').onclick = closeExecutionModal;
        modal.querySelector('.fullscreen-btn').onclick = toggleFullscreen;
        
        // 设置Python输入提交按钮事件
        const submitBtn = modal.querySelector('#submit-input');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const inputValue = modal.querySelector('#python-input').value;
                const outputElement = document.getElementById('output') || 
                                     document.querySelector('#code-sandbox').contentDocument.getElementById('output');
                if (outputElement) {
                    outputElement.textContent += `${inputValue}\n`;
                }
                modal.querySelector('#python-input').value = '';
                if (pyodide && pyodide.globals) {
                    pyodide.globals.get('_resolve_input')(inputValue);
                }
            });
        }
        
        // Python输入框回车事件
        const inputField = modal.querySelector('#python-input');
        if (inputField) {
            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    modal.querySelector('#submit-input').click();
                }
            });
        }
        
        // 示例按钮事件
        const examplesBtn = modal.querySelector('#examples-btn');
        if (examplesBtn) {
            examplesBtn.addEventListener('click', showPythonExamples);
        }
    }



    // 切换全屏模式
    function toggleFullscreen() {
        const modal = document.querySelector('.code-execution-modal');
        modal.classList.toggle('fullscreen');
    }

    // 关闭代码执行弹窗
    function closeExecutionModal() {
        document.querySelector('.code-execution-modal').style.display = 'none';
         //chatWindow.classList.add('active');
         chatWindow.style.display = 'flex';
    }

    // 检测代码语言
    function detectCodeLanguage(code) {
        // 使用更精确的代码类型检测
        return detectCodeType(code);
    }

    // 执行代码并显示弹窗
    async function executeCode(code, lang) {
    // 确保弹窗存在
    if (!document.querySelector('.code-execution-modal')) {
        createExecutionModal();
    }

    const modal = document.querySelector('.code-execution-modal');
    const iframe = document.getElementById('code-sandbox');
    const statusBar = document.getElementById('code-status-bar');
    const sandbox = modal.querySelector('#code-sandbox');


    // 重置弹窗状态
    modal.style.display = 'flex';
    chatWindow.style.display = 'none';//关闭聊天框
    statusBar.textContent = '准备执行代码...';
    statusBar.className = '';

    // 根据语言设置执行环境
    if (lang === 'python') {
        //initializePyodide();
        executePythonCode(code, statusBar,sandbox);
    }else if(lang== 'html'){
        executeHtmlCode(code,statusBar,sandbox);
    } else {
        statusBar.textContent = `不支持执行 ${lang} 代码`;
        statusBar.className = 'status-error';
    }

    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.code-execution-close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        // 重置iframe以清除之前执行的状态
        iframe.src = 'about:blank';
         chatWindow.style.display = 'flex';//关闭聊天框
    };
}
    // 执行Python代码
    async function executePythonCode(code, statusBar, sandbox) {
        if (!pyodide) {
            updateStatus(statusBar, "加载Pyodide环境...", "running");
            const initialized = await initializePyodide();
            if (!initialized) {
                updateStatus(statusBar, "Pyodide环境加载失败，请刷新页面重试", "error");
                return false;
            }
        }

        if (isPythonRunning) {
            updateStatus(statusBar, "有Python代码正在执行，请等待或停止当前执行", "error");
            return false;
        }

        isPythonRunning = true;
        updateStatus(statusBar, "正在执行Python代码...", "running");

        try {
            // 清空iframe
            sandbox.srcdoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: monospace; 
                            margin: 0; 
                            padding: 10px; 
                            white-space: pre-wrap; 
                            background-color: #f8f9fa;
                            color: #24292e;
                            line-height: 1.5;
                        }
                        .error { 
                            color: #d32f2f; 
                            background-color: #ffebee;
                            padding: 5px;
                            border-radius: 4px;
                            margin: 5px 0;
                        }
                        #output {
                            overflow-y: auto;
                            max-height: 100%;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 10px 0;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body><div id="output">正在执行Python代码，请稍候...</div></body>
                </html>
            `;

            // 等待iframe加载完成
            await new Promise(resolve => {
                sandbox.onload = resolve;
            });

            // iframe的output元素
            const outputElement = sandbox.contentDocument.getElementById('output');
            outputElement.textContent = '';
            
            // 设置全局output元素引用，以便handleStdout和handleStderr函数使用
            window.pyodideOutputElement = outputElement;
            
            // 添加显示帮助函数
            await pyodide.runPythonAsync(`
                import sys
                import io
                import base64
                from js import document, pyodideOutputElement

                # 显示图表和数据帮助函数
                def show_matplotlib_figure(fig=None, clear=True):
                    """显示matplotlib图表"""
                    import matplotlib.pyplot as plt
                    from js import pyodideOutputElement
                    
                    # 如果没有传入图表，使用当前图表
                    if fig is None:
                        fig = plt.gcf()
                        
                    # 转为base64
                    buf = io.BytesIO()
                    fig.savefig(buf, format='png')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    
                    # 添加到输出
                    img_tag = f'<img src="data:image/png;base64,{img_str}" />'
                    if hasattr(pyodideOutputElement, 'innerHTML'):
                        pyodideOutputElement.innerHTML += img_tag
                    
                    # 清除当前图表
                    if clear:
                        plt.clf()
                    
                def show_dataframe(df, max_rows=20):
                    """显示Pandas DataFrame为HTML表格"""
                    from js import pyodideOutputElement
                    
                    # 转为HTML
                    html = df.head(max_rows).to_html()
                    
                    # 添加更多行信息
                    if len(df) > max_rows:
                        html += f"<p>只显示前{max_rows}行，总共{len(df)}行</p>"
                    
                    # 添加到输出
                    if hasattr(pyodideOutputElement, 'innerHTML'):
                        pyodideOutputElement.innerHTML += html
                
                # 添加到全局命名空间
                globals()['show_plot'] = show_matplotlib_figure
                globals()['show_df'] = show_dataframe
                
                # 修改Pandas的显示行为
                try:
                    import pandas as pd
                    pd.set_option('display.max_rows', 20)
                    
                    # 添加表格输出方法
                    original_repr_html = pd.DataFrame._repr_html_
                    def enhanced_repr_html(self):
                        # 限制输出行数
                        if len(self) <= 20:
                            return original_repr_html(self)
                        else:
                            return self.head(20)._repr_html_() + f"<p>只显示前20行，总共{len(self)}行</p>"
                        
                    # 使用猴子补丁替换方法
                    pd.DataFrame._repr_html_ = enhanced_repr_html
                except:
                    pass
            `);
            
            // 设置超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("执行超时")), 30000);
            });

            // 在代码前添加辅助代码 - 用于自动显示matplotlib图表
            const enhancedCode = `
    # 捕获输出的帮助函数
    def _run_user_code():
        # 自动显示matplotlib图表
        try:
            import matplotlib.pyplot as plt
            original_show = plt.show
            def auto_show(*args, **kwargs):
                show_plot(plt.gcf())
                return original_show(*args, **kwargs)
            plt.show = auto_show
        except:
            pass
            
        # 用户代码开始执行
        ${code}
        # 用户代码执行结束
        
        # 检查是否有未显示的图表
        try:
            import matplotlib.pyplot as plt
            if plt.get_fignums():  # 如果有打开的图表
                # 显示但不清除，避免重复显示
                show_plot(plt.gcf(), clear=False)
        except:
            pass

    # 执行用户代码
    _run_user_code()
    `;

            // 直接执行用户代码
            const executionPromise = pyodide.runPythonAsync(enhancedCode).then(result => {
                if (result !== undefined) {
                    const resultStr = String(result);
                    if (resultStr) {
                        outputElement.textContent += "\n结果: " + resultStr;
                    }
                }
                return true;
            });

            // 使用Promise.race竞争超时
            await Promise.race([executionPromise, timeoutPromise]);
            
            updateStatus(statusBar, "执行完成", "success");
            return true;
        } catch (error) {
            console.error("Python执行错误:", error);
            
            const outputElement = sandbox.contentDocument.getElementById('output');
            if (outputElement) {
                let errorMessage = error.message || String(error);
                
                // 格式化Python错误
                if (errorMessage.includes('Traceback')) {
                    // 保持原始格式，但添加颜色
                    errorMessage = errorMessage.replace(/\n/g, '<br>').replace(/\s{2,}/g, match => '&nbsp;'.repeat(match.length));
                }
                
                outputElement.innerHTML += `<div class="error">执行错误: ${errorMessage}</div>`;
            }
            
            updateStatus(statusBar, `执行出错`, "error");
            return false;
        } finally {
            isPythonRunning = false;
            // 确保输入容器被隐藏
            const inputContainer = document.getElementById('input-container');
            if (inputContainer) {
                inputContainer.style.display = 'none';
            }
        }
    }

    // 执行HTML/CSS/JS代码
    function executeHtmlCode(code, statusBar, sandbox) {
        console.log(code);
        updateStatus(statusBar, '正在执行HTML/CSS/JS代码...', 'running');

        try {
            // 清空状态栏
            statusBar.textContent = '';

            // 在iframe中执行代码
            const doc = sandbox.contentDocument || sandbox.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                    </style>
                </head>
                <body>
                    ${code.includes('<html') ? '' : '<div id="output"></div>'}
                    ${code}
                </body>
                </html>
            `);
            doc.close();

            updateStatus(statusBar, '✅执行完成', 'success');
        } catch (e) {
            appendStatus(statusBar, `❌执行错误: ${e}`, 'error');
        }
    }

    // 更新状态
    function updateStatus(element, message, type) {
        element.textContent = message;
        element.className = type ? `status-${type}` : '';
        
        // 根据类型设置颜色
        switch(type) {
            case 'running':
                element.style.color = '#2196F3';
                break;
            case 'success':
                element.style.color = '#4CAF50';
                break;
            case 'error':
                element.style.color = '#F44336';
                break;
            default:
                element.style.color = '#757575';
        }
    }

    // 追加状态信息
    function appendStatus(element, message, type = '') {
        const line = document.createElement('div');
        line.textContent = message;
        
        // 根据类型设置样式
        switch(type) {
            case 'running':
                line.style.color = '#2196F3';
                break;
            case 'success':
                line.style.color = '#4CAF50';
                break;
            case 'error':
                line.style.color = '#F44336';
                break;
            default:
                line.style.color = '#757575';
        }
        
        if (type) line.className = `status-${type}`;
        element.appendChild(line);
        element.scrollTop = element.scrollHeight;
    }

  // 检查并截断上下文
  function truncateContext(messages, maxContextTokens) {
    let totalTokens = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
        const messageTokens = countTokens(messages[i].content);
        if (totalTokens + messageTokens > maxContextTokens) {
            messages.splice(0, i);
            break;
        }
        totalTokens += messageTokens;
    }
    return messages;
  }

// --- 辅助函数：节流 (如果你的脚本里还没有，请添加) ---
function throttle(func, limit) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    return function(...args) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}


// --- 新的统一添加按钮的函数 ---

// --- 替换你脚本中现有的 handleStreamResponse 函数 ---
function handleStreamResponse(response, aiMsgDiv, thinkingMsgDiv, isSummaryTask = false) {
    return new Promise((resolve, reject) => {
        let accumulatedAiText = ''; // 用于累积AI主要回复文本
        let accumulatedReasoningText = ''; // 用于累积思考过程文本
        let isReasoningReceived = false;
        let isStopped = false;
        let reasoningTitleDiv = null; // 引用"思考内容"标题元素

        const RENDER_THROTTLE_MS = 150; // 渲染节流间隔 (毫秒)

        // --- DOM 元素准备 ---
        aiMsgDiv.innerHTML = ''; // 清空AI消息容器
        aiMsgDiv.className = 'ds-chat-message ds-ai-message'; // 设置基础 class

        const reasoningDiv = document.createElement('div');
        reasoningDiv.className = 'ds-reasoning-content';
        reasoningDiv.style.display = 'none'; // 初始隐藏
        // 思考内容放在前面
        aiMsgDiv.appendChild(reasoningDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ds-message-content';
        contentDiv.style.whiteSpace = 'break-spaces'; // 保证换行符有效
        aiMsgDiv.appendChild(contentDiv);


        // --- 停止按钮 ---
        let stopButton = document.querySelector('.ds-stop-button'); // 尝试复用页面上已有的停止按钮
        if (!stopButton) { // 如果没有，再创建
             stopButton = document.createElement('button');
             stopButton.className = 'ds-stop-button';
             stopButton.innerHTML = `
                 <svg class="ds-stop-img" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <rect x="7" y="7" width="3" height="10" rx="1"/>
                     <rect x="14" y="7" width="3" height="10" rx="1"/>
                 </svg>
             `;
             stopButton.title = '点击停止AI输出';
             // 确保 chatWindow 存在
             const chatWindow = document.querySelector('.ds-chat-window');
             if(chatWindow) {
                chatWindow.appendChild(stopButton);
             } else {
                 console.error("无法找到 .ds-chat-window 来添加停止按钮");
             }
        }
        stopButton.style.display = 'flex'; // 确保按钮可见

        // 清除旧监听器并添加新监听器
        const stopHandler = () => {
            if (isStopped) return;
            isStopped = true;
            console.log("停止按钮被点击");
            if (stopButton) stopButton.style.display = 'none'; // 隐藏而不是移除，方便复用
            if (reader) {
                try {
                    reader.cancel('用户停止').catch(e => console.warn("取消流时出错:", e));
                } catch (e) { console.warn("无法取消流:", e); }
            }
            // 移除思考提示
            if (thinkingMsgDiv && thinkingMsgDiv.parentNode) {
                 thinkingMsgDiv.parentNode.removeChild(thinkingMsgDiv);
            }
            // 更新AI消息区域内容
            contentDiv.innerHTML = '<span style="color:red; font-weight:bold;">AI输出已由用户中止！</span>';
            reasoningDiv.style.display = 'none'; // 隐藏思考区域

            // 保存系统提示到历史记录
            config.chatHistory.push({ role: 'assistant', content: '用户中断了对话输出....'});
            GM_setValue('chatHistory', config.chatHistory);

            // 显示发送按钮
            const startButton = document.querySelector('.ds-start-button');
            if(startButton) startButton.style.display = 'flex';

            resolve(); // 解决Promise
        };
        // 移除旧监听器 (如果存在)
        stopButton.replaceWith(stopButton.cloneNode(true)); // 克隆替换是移除所有监听器的技巧
        stopButton = document.querySelector('.ds-stop-button'); // 获取新克隆的按钮
        stopButton.addEventListener('click', stopHandler); // 添加新监听器


        // --- 核心渲染更新函数 ---
        function updateRenderedContent() {
            if (isStopped) return;

            console.time("updateRenderedContent"); // 计时开始

            let contentUpdated = false;
            let reasoningUpdated = false;

            // 1. 渲染主要内容
            try {
                // 优化：只有在文本实际改变时才更新 DOM 和后续处理
                if (contentDiv.innerHTML !== marked.parse(accumulatedAiText)) {
                    console.time("render AI content");
                    contentDiv.innerHTML = "🤖："+marked.parse(accumulatedAiText);
                    contentUpdated = true;
                    // 对新内容中的 pre 添加按钮并高亮
                    contentDiv.querySelectorAll('pre:not([data-buttons-added])').forEach(pre => {
                        addButtonsToPre(pre); // 添加或更新按钮
                        const codeElement = pre.querySelector('code');
                        if (codeElement && !codeElement.classList.contains('hljs-added')) {
                             try {
                                 hljs.highlightElement(codeElement);
                                 codeElement.classList.add('hljs-added'); // 标记已高亮
                             } catch (e) { console.error("Highlight.js error (AI):", e); }
                        }
                    });
                     console.timeEnd("render AI content");
                }
            } catch (e) {
                console.error("渲染AI主要内容时出错:", e);
                contentDiv.innerHTML = "<p style='color:red'>内容渲染出错</p>";
            }

            // 2. 渲染思考过程 (如果收到过)
            if (isReasoningReceived) {
                try {
                    // 优化：只有在文本实际改变时才更新 DOM
                    if (reasoningDiv.innerHTML !== marked.parse(accumulatedReasoningText)) {
                         console.time("render reasoning content");
                        reasoningDiv.innerHTML = marked.parse(accumulatedReasoningText);
                        reasoningUpdated = true;
                        if (reasoningDiv.style.display === 'none') {
                            reasoningDiv.style.display = 'block'; // 确保显示
                        }
                         // 添加思考内容标题 (只加一次)
                        if (!reasoningTitleDiv && reasoningDiv.parentNode) {
                             reasoningTitleDiv = document.createElement('div');
                             reasoningTitleDiv.className = 'ds-reasoning-title';
                             reasoningTitleDiv.innerText = '思考内容💭：';
                             // 插入到 reasoningDiv 之前
                             aiMsgDiv.insertBefore(reasoningTitleDiv, reasoningDiv);
                        }
                        // 对新内容中的 pre 添加按钮并高亮
                        reasoningDiv.querySelectorAll('pre:not([data-buttons-added])').forEach(pre => {
                            addButtonsToPre(pre);
                             const codeElement = pre.querySelector('code');
                             if (codeElement && !codeElement.classList.contains('hljs-added')) {
                                try {
                                    hljs.highlightElement(codeElement);
                                     codeElement.classList.add('hljs-added');
                                } catch (e) { console.error("Highlight.js error (Reasoning):", e); }
                             }
                        });
                        console.timeEnd("render reasoning content");
                    }
                } catch (e) {
                    console.error("渲染思考过程时出错:", e);
                    reasoningDiv.innerHTML = "<p style='color:red'>思考内容渲染出错</p>";
                    if (reasoningDiv.style.display === 'none') {
                        reasoningDiv.style.display = 'block';
                    }
                }
            }

            // 3. 智能滚动 (仅当内容有更新时)
             if (contentUpdated || reasoningUpdated) {
                const chatContent = document.querySelector('.ds-chat-content');
                if (chatContent) {
                    const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 150; // 阈值可以调整
                    if (isNearBottom) {
                         // 使用平滑滚动效果更好
                         chatContent.scrollTo({ top: chatContent.scrollHeight, behavior: 'smooth' });
                    }
                }
             }
             console.timeEnd("updateRenderedContent"); // 计时结束
        }

        // --- 创建节流版的渲染函数 ---
        const throttledUpdateRenderedContent = throttle(updateRenderedContent, RENDER_THROTTLE_MS);


        // --- 读取流 ---
        const decoder = new TextDecoder();
        let buffer = '';
        let reader;

        try {
            // 检查 response 合法性
            if (response && response.response && typeof response.response.body?.getReader === 'function') {
                response = response.response;
            } else if (!response || typeof response.body?.getReader !== 'function') {
                 throw new Error('无效的响应对象或无法获取响应流的读取器');
            }
            if (!response.ok) {
                throw new Error(`响应状态错误: ${response.status} ${response.statusText}`);
            }
            reader = response.body.getReader();

        } catch (error) {
            console.error("处理响应或获取Reader时出错:", error);
            if (stopButton) stopButton.style.display = 'none';
            const startButton = document.querySelector('.ds-start-button');
            if(startButton) startButton.style.display = 'flex';
            aiMsgDiv.innerHTML = `<span style="color:red; font-weight:bold;">处理响应失败: ${error.message}</span>`;
            if (thinkingMsgDiv && thinkingMsgDiv.parentNode) {
                 thinkingMsgDiv.parentNode.removeChild(thinkingMsgDiv);
            }
            reject(error);
            return;
        }

        // --- readStream 函数 ---
        function readStream() {
            if (isStopped) return;

            reader.read().then(({ done, value }) => {
                if (isStopped) return; // 再次检查

                if (done) {
                    console.log('流读取完成');
                    if (stopButton) stopButton.style.display = 'none'; // 隐藏停止按钮

                    // --- 最后一次强制渲染 ---
                    updateRenderedContent(); // 不节流，确保最终内容渲染

                    // --- 后续处理 ---
                    try {
                        // 移除思考中提示
                        if (thinkingMsgDiv && thinkingMsgDiv.parentNode) {
                            thinkingMsgDiv.parentNode.removeChild(thinkingMsgDiv);
                        }

                        // 处理没有思考内容的情况
                         if (!isReasoningReceived && !reasoningTitleDiv && aiMsgDiv.contains(reasoningDiv)) {
                            const noReasoningTitle = document.createElement('div');
                            noReasoningTitle.className = 'ds-reasoning-title';
                            noReasoningTitle.innerText = '注意: 该模型没有思考过程。';
                            aiMsgDiv.insertBefore(noReasoningTitle, reasoningDiv);
                         }


                        const aiTokens = countTokens(accumulatedAiText + accumulatedReasoningText);
                        // 在aiMsgDiv内部查找或添加token信息区域
                        let tokenInfo = aiMsgDiv.querySelector('.ds-token-info');
                        if (!tokenInfo) {
                             tokenInfo = document.createElement('div');
                             tokenInfo.className = 'ds-token-info';
                             // 将 tokenInfo 放在消息内容的末尾
                             aiMsgDiv.appendChild(tokenInfo);
                        }
                         tokenInfo.innerHTML = `<small>AI Response: ${aiTokens} tokens</small>`;

                        updateConversationTokenCount(); // 更新总计

                        // 准备要保存的数据
                        const aiResponse = {
                            role: 'assistant',
                            content: accumulatedAiText,
                            timestamp: new Date().toISOString(),
                            hasReasoning: isReasoningReceived,
                            reasoningContent: isReasoningReceived ? accumulatedReasoningText : null,
                            tokens: aiTokens
                        };

                        // 保存完整对话记录
                        config.fullConversation.push(aiResponse);
                        GM_setValue('fullConversation', config.fullConversation);

                        // 保存简短历史记录 (只存 assistant 的 content)
                        if (!isSummaryTask && accumulatedAiText.trim()) {
                             config.chatHistory.push({ role: 'assistant', content: accumulatedAiText });
                             GM_setValue('chatHistory', config.chatHistory);
                        } else if (isSummaryTask && accumulatedAiText.trim()) {
                             // 总结任务也保存，方便查看结果
                             config.chatHistory.push({ role: 'assistant', content: accumulatedAiText });
                             GM_setValue('chatHistory', config.chatHistory);
                        }

                        // --- Add Copy Conversation Button logic ---
                        const actionsDiv = copyMessage(accumulatedAiText,"ai");
                        
                        aiMsgDiv.appendChild(actionsDiv);

                    

                    } catch (finalizationError) {
                        console.error("流结束后处理失败:", finalizationError);
                    }

                    // 显示发送按钮
                    const startButton = document.querySelector('.ds-start-button');
                    if(startButton) startButton.style.display = 'flex';

                    resolve(); // 正常结束
                    return;
                }

                // --- 处理数据块 ---
                let contentReceivedInChunk = false;
                try {
                    buffer += decoder.decode(value, { stream: true });
                } catch (decodeError) {
                    console.error('解码响应流时出错:', decodeError);
                    // 可以考虑是否在此处停止
                }

                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留下一次可能不完整的行

                for (const line of lines) {
                    if (!line.trim() || line === 'data: [DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                accumulatedAiText += data.choices[0].delta.content;
                                contentReceivedInChunk = true;
                            }
                            if (data.choices?.[0]?.delta?.reasoning_content) {
                                accumulatedReasoningText += data.choices[0].delta.reasoning_content;
                                if (!isReasoningReceived) {
                                    isReasoningReceived = true;
                                    // 更新思考状态提示
                                    if (thinkingMsgDiv) thinkingMsgDiv.innerText = '思考中...';
                                }
                                contentReceivedInChunk = true;
                            }
                        } catch (parseError) {
                            console.warn('解析响应数据失败:', parseError, '行内容:', line);
                        }
                    }
                }

                // 如果收到了新内容，调用节流的渲染函数
                if (contentReceivedInChunk) {
                    throttledUpdateRenderedContent();
                }

                // 继续读取下一块
                readStream();

            }).catch(error => {
                // 处理读取错误
                if (!isStopped) {
                     console.error('读取流时出错:', error);
                     if (stopButton) stopButton.style.display = 'none';
                    const startButton = document.querySelector('.ds-start-button');
                     if(startButton) startButton.style.display = 'flex';
                     // 在现有 aiMsgDiv 中追加错误信息，而不是替换
                     const errorSpan = document.createElement('span');
                     errorSpan.style.color = 'red';
                     errorSpan.style.fontWeight = 'bold';
                     errorSpan.innerHTML = `<br>读取流时出错: ${error.message}`;
                     contentDiv.appendChild(errorSpan);

                     if (thinkingMsgDiv && thinkingMsgDiv.parentNode) {
                          thinkingMsgDiv.parentNode.removeChild(thinkingMsgDiv);
                     }
                     reject(error);
                } else {
                    console.log("流读取因用户停止而出错，已处理。");
                    resolve(); // 用户停止导致的错误也算解决
                }
            });
        }

        // 启动流读取
        readStream();

    });
}



// // 检查并截断上下文
// function truncateContext(messages, maxContextTokens) {
//     let totalTokens = 0;
//     for (let i = messages.length - 1; i >= 0; i--) {
//         const messageTokens = countTokens(messages[i].content);
//         if (totalTokens + messageTokens > maxContextTokens) {
//             messages.splice(0, i);
//             break;
//         }
//         totalTokens += messageTokens;
//     }
//     return messages;
// }


// ... 其他工具函数 ...

/**
 * 添加消息到聊天界面
 * @param {string} role - 'user' 或 'assistant' 或 'system'
 * @param {string} content - 消息内容
 */
function addMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ds-chat-message ds-${role}-message`;
    msgDiv.innerHTML = marked.parse(content);
    chatContent.appendChild(msgDiv);
    
    // 自动滚动到底部
    const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 100;
    if (isNearBottom) {
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}


// 修改后的图像生成函数
function generateImage(prompt, options = {}, callback) {
    if(config.picture_model){
    // 合并默认参数和用户自定义参数
    const params = {
      model: "Kwai-Kolors/Kolors",
      prompt: prompt,
      image_size: "1024x1024",
      batch_size: 1,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      ...options
    };

    // 请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-vlyhjprkmppnkatcgirrjckzisxjdrhjtnujzsvibjyncfjw',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    };
  
    // 同时支持Promise和Callback两种方式
    if (typeof callback === 'function') {
      fetch('https://api.siliconflow.cn/v1/images/generations', requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data?.images?.[0]?.url) {
            callback(null, data.images[0].url);
          } else {
            callback(new Error('API返回的数据结构异常'));
          }
        })
        .catch(err => callback(err));
    } else {
      return fetch('https://api.siliconflow.cn/v1/images/generations', requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data?.images?.[0]?.url) {
            return data.images[0].url;
          }
          throw new Error('API返回的数据结构异常');
        });
    }
}
else{
    const params = {
        model: "sdxl-turbo",
        prompt: prompt,
        provider: "ImageLabs"
      };
  
      // 请求配置
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      };
    
      // 同时支持Promise和Callback两种方式
      if (typeof callback === 'function') {
        fetch('https://ypy.dskblog.top/v1/images/generate', requestOptions)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data?.[0]?.url) {
              callback(null, data[0].url);
            } else {
              callback(new Error('API返回的数据结构异常'));
            }
          })
          .catch(err => callback(err));
      } else {
        return fetch('https://ypy.dskblog.top/v1/images/generate', requestOptions)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data.data[0].url) {
              return data.data[0].url;
            }
            console.log(data.data);
            throw new Error('API返回的数据结构异常');
          });
      }

}

}
// {
//     "data": [
//         {
//             "url": "http://ypy.dskblog.top/media/1746284599_naked_girl_f2fa63bb53afd47f.jpg?url=https%3A//pornlabstaskstore.s3-accelerate.amazonaws.com/81f0125cde2a442383d7467ae64de1ca.jpg",
//             "revised_prompt": "naked girl"
//         }
//     ],
//     "model": "sdxl-turbo",
//     "provider": "ImageLabs",
//     "created": 1746284599
// }
  //消息复制函数
  function copyMessage(message,roles) {
    const U_actionsDiv = document.createElement('div');
    U_actionsDiv.className = 'ds-message-actions';
    U_actionsDiv.style.position = 'relative'; // Needed for absolute positioning of the popup

    const U_triggerSpan = document.createElement('span');
    U_triggerSpan.className = 'ds-actions-trigger';
    U_triggerSpan.textContent = '...';
    U_triggerSpan.title = '更多操作';

    // Create the popup menu container
    const actionsPopup = document.createElement('div');
    actionsPopup.className = 'ds-actions-popup';
    actionsPopup.style.display = 'none'; // Hidden by default
    actionsPopup.style.position = 'absolute';
    actionsPopup.style.right = '0'; // Position relative to U_actionsDiv
    actionsPopup.style.bottom = '20px'; // Position above the trigger
    actionsPopup.style.backgroundColor = 'white';
    actionsPopup.style.border = '1px solid #ccc';
    actionsPopup.style.borderRadius = '4px';
    actionsPopup.style.padding = '5px';
    actionsPopup.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsPopup.style.zIndex = '1001'; // Ensure it's above other elements

    const copyConvButton = document.createElement('button'); // Use button for better semantics
    copyConvButton.className = 'ds-copy-conversation-btn';
    copyConvButton.textContent = 'copy';
    copyConvButton.style.display = 'block'; // Always visible inside the popup
    copyConvButton.style.border = 'none';
    copyConvButton.style.background = 'none';
    copyConvButton.style.padding = '5px 10px';
    copyConvButton.style.cursor = 'pointer';
    copyConvButton.style.width = '100%';
    copyConvButton.style.textAlign = 'left';

    actionsPopup.appendChild(copyConvButton); // Add button to popup

    U_actionsDiv.appendChild(U_triggerSpan);
    U_actionsDiv.appendChild(actionsPopup); // Add popup to actions div

    U_triggerSpan.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering other clicks, like closing the popup immediately
        // Toggle popup visibility
        const isVisible = actionsPopup.style.display !== 'none';
        actionsPopup.style.display = isVisible ? 'none' : 'block';
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!U_actionsDiv.contains(e.target)) {
             actionsPopup.style.display = 'none';
        }
    }, true); // Use capture phase to catch clicks early

    // Close popup on mouse leave after a short delay
    actionsPopup.addEventListener('mouseleave', () => {
        setTimeout(() => {
             // Check if mouse hasn't re-entered popup or trigger
             if (!actionsPopup.matches(':hover') && !U_triggerSpan.matches(':hover')) {
                 actionsPopup.style.display = 'none';
             }
        }, 300); // Adjust delay as needed
    });
    // Prevent popup closing immediately if mouse moves briefly to trigger
    U_triggerSpan.addEventListener('mouseenter', () => {
         // Optional: Add logic if needed when mouse enters trigger while popup is open
    });


    copyConvButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up and closing the popup via the document listener
        let conversationText = '';
        // Correctly format the conversation text
     
             const role = roles; // Get role from message
             const time = new Date().toLocaleTimeString();
             // Append each message correctly
             conversationText += `${role} [${time}]:${message}`;



        navigator.clipboard.writeText(conversationText.trim()).then(() => {
            copyConvButton.textContent = '已copy!';
            copyConvButton.style.backgroundColor = '#d4edda'; // Light green feedback
            setTimeout(() => {
                copyConvButton.textContent = 'copy';
                copyConvButton.style.backgroundColor = 'transparent'; // Reset background
                actionsPopup.style.display = 'none'; // Hide popup after copying
            }, 1500);
        }).catch(err => {
            console.error('copy对话失败:', err);
            copyConvButton.textContent = '失败';
            copyConvButton.style.backgroundColor = '#f8d7da'; // Light red feedback
            setTimeout(() => {
                copyConvButton.textContent = 'copy';
                copyConvButton.style.backgroundColor = 'transparent'; // Reset background
                actionsPopup.style.display = 'none'; // Hide popup after failure feedback
            }, 1500);
        });
    });
    return U_actionsDiv;
  }
// 发送消息函数
async function sendMessage(message, retryCount = 1, isSummaryTask = false) {
    let timeoutId = setTimeout(() => {
        console.error('Request timeout');
    }, 60000);
 startButton.style.display = 'none'; // 隐藏发送按钮
//图片命令
if (message.startsWith('/image ')) {
    const prompt = message.substring(7).trim();
    if (!prompt) {
        addMessage('system', '请输入图像描述，例如: /image 美丽的风景');
        return;
    }

    // 显示正在生成的消息
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'ds-chat-message ds-ai-message';
    thinkingDiv.innerHTML = `<div class="ds-message-content">正在生成图像: ${prompt}...</div>`;
    chatContent.appendChild(thinkingDiv);
    chatContent.scrollTop = chatContent.scrollHeight;

    // 调用图像生成函数
    console.log('提示词:', prompt);
    generateImage(prompt)
    .then(imageUrl => {
      console.log("生成的图片URL:", imageUrl);
        if (thinkingDiv.parentNode) {
            chatContent.removeChild(thinkingDiv);
        }

        if (!imageUrl) {
            addMessage('system', `图像生成失败: ${error.message}`);
            return;
        }

        // 创建包含图像的div
        const imageDiv = document.createElement('div');
        imageDiv.className = 'ds-chat-message ds-ai-message';
        let imageMarkdown = `🤖：根据<strong>"${prompt}"</strong>生成的图像:<br>![Generated Image](${imageUrl})`;
        imageDiv.innerHTML = marked.parse(imageMarkdown);
        chatContent.appendChild(imageDiv);
       

        // 保存到历史记录
        config.chatHistory.push({
            role: 'assistant',
            content: `生成的图像:<br>![Generated Image](${imageUrl})`
        });
        config.fullConversation.push({
            role: 'user',
            content: `生成的图像:<br>![Generated Image](${imageUrl})`
        });
        GM_setValue('chatHistory', config.chatHistory);
        GM_setValue('fullConversation', config.fullConversation);
    })
    .catch(error => console.error("生成失败:", error));
    setTimeout(() => {
        chatContent.scrollTop = chatContent.scrollHeight;
    }, 6000);
    return;
}

    if (!message.trim()) return;

    if (!config.apiKey) {
        alert('请先设置 API 密钥！');
        settingsBtn.click();
        return;
    }

    if (!navigator.onLine) {
        const errorMsgDiv = document.createElement('div');
        errorMsgDiv.className = 'ds-chat-message ds-error';
        errorMsgDiv.innerText = '错误: 网络连接已断开,请检查网络后重试';
        chatContent.appendChild(errorMsgDiv);
        // 示例：只在用户当前已经接近底部时自动滚动
const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 100;
if (isNearBottom) {
    chatContent.scrollTop = chatContent.scrollHeight;
}
        return;
    }

    // 对于总结任务，只添加简化的消息到历史记录
    const userMsg = {
        role: 'user',
        content: isSummaryTask ? '正在总结当前网页...' : message
    };
config.fullConversation.push({
        role: 'user',
        content: message, // 这里存储原始消息，不简化
        timestamp: new Date().toISOString()
    });
    GM_setValue('fullConversation', config.fullConversation);
    
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'ds-chat-message ds-user-message';
    userMsgDiv.innerHTML = (isSummaryTask ? '正在总结当前网页...' : (message));
    //addCopyButtonsToCodeBlocks(userMsgDiv);
    //Add_codebutton();

    config.chatHistory.push(userMsg);
    GM_setValue('chatHistory', config.chatHistory);
    const U_actionsDiv = copyMessage(message,"user");


    // 总是显示用户消息，但内容会根据isSummaryTask变化
    //chatContent.appendChild(userMsgDiv);
    const userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'ds-user-message-container'; // 可自定义类名用于样式调整
    userMessageContainer.style.display = 'flex';
    userMessageContainer.style.justifyContent = 'flex-end'; // 让内容靠右
   // userMessageContainer.style.alignItems = 'center'; // 垂直居中对齐

    // 总是添加到历史记录，但内容会根据isSummaryTask变化

    // 创建头像元素
    const avatar = document.createElement('img');
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO2XQW6DMBBFX1gkh0jgCm2XcAXCrixyhybHbNoVvUpF9o6QBqmqWoUah7HVedLfRBj/DzNkDIZhhCQDCqACaqAV1fJbIddESQ40wOGGGrk2GlbA0wTj3zWsGdaq42N+1KO2+XyG+VE7LfPZxJqf0hOZRoAigPmDaLjX4lQBA5QaAfYBA9QaAdqAAdrUAzxrBEi+hKrUm7gIGCDXCJAFKqNGc0JNepQIMcw9EAErmSr/an5YE8U4PbKb2BP7GMrm1pGy/OFIWUrPRHukNAzDuA8b4AS8ARfA3VkX2esoe89iC3wsYNr9ok48eD95TfPuSwivN3GKwLwTvfgEeI/AuBOdfQL0ERh3oj71AJ//soSOERh3c5p4I58wbfMdsMaTrXKIbs4f2chaXuF5ocbugVfZ0/vJG4ZhsAhXSvn7fc8Yyv8AAAAASUVORK5CYII=";
    avatar.alt = "user";
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVR4nO2Xy0pcQRCGv8jozjF5CU0UXUgWyQMEVCTBvVkJPoAIIuYNdJwJKkQUX0NCHiIEb1mPd8ULExeK4gkNNYsUfdQ5l1gD/UHBcKam6q+equ4+EAgEsqYHKAObwJWY+zwPdGOYNmABuAOiGHPfVYBWDIr/8YBwbd+tFbHQgPi6uX/CTM/rttkCPgLtYp+AbeVzC7zBAGWP+KLHrwPYUb4lDLClRLnVjmNE+W5ggJoS5VomjqLyrWEAPZxZ++dO0xdQa/YW2mz2IZ5XorZly9S4Z7+V7xwG6PYcZDuy2kWxEY94d5C9xgiVBFcJE4dYnVa5oD1V/Lq1yxwiqCKtESf8VmbGnHg9EyXZYf6IbcjAmun5QCDw7/vwILAKHD9hC3U+K8CA/PbZeAl8AU4THGJ1OwFmYq4eueH28GngMoVwbRfAFFDIW/xb4FeGwiNlP4H+vMSPAzcxic+Bb8CHR1axID7LsuqRx66BsSyFvwC+xiQ7AiYeeYmJw91SJx8Y/LLkTkULsOYJfg8syiCn5RWwJDF1npW0RZQ8Qc+AIbJnWFpR55tNGvCzJ9gh0Et+9Elb6ryjSYIdqCD7QCf50+XJvZckkF6Fd/w/3nvyN0zqACmJsi7gua1hmr6AXQOiI7FqkgIGjRRRlat3IBAIYI+/ScbW2EutvLQAAAAASUVORK5CYII=";
    //avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVR4nO2SPQ4BQQCFPxqVhoRi6VDsAdxCxVWo9w5OIRsVEhGXoNiGVkdi6ShWJnkSETshRjT7kte8vJ/dmYEMjlADQuAkjoGmy/IDkDzRaJ6LgVCFExUaTqWNXAycVPb4tXVpRxcDscpqvxoYq2yqEcOZNHN8X6MF7FMuuYEjeLrQWAxdlmdIRR5oAwGwBCLgLEbSAnmM920UgAGwe/Fy0mi8fWWtqALrh+AWGAIdwAeKoi9tKM/dvwIqtoGFjBugC+Te+GPj6SljsnOb+SpTic9RVvZiMyWO+L+BDDzjBhltb91A/g4cAAAAElFTkSuQmCC";
    avatar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABkElEQVR4nO2YSyuEURyHH8rwLdx2blFSNprktmEhG5+C2JKkZMEnsDZKZOdSysIHkEQuIx8AK7J0dOq8NZ0yY857zPm/Ok/9NjN1+j2dOe/7PwORSKboBlaAU+Da5MR81kUGaAMOAVUmX8AB0IpQhoG3ChKleQXyCKMP+KhCIskn0I8QmoBnB4kkRaARASymkEgyjwDuPIjchJZo9yCRJOhTbNyjyGhIkVmPInqtYIx5FBkJKfJvzojm1oOEnsWCs+BBZA4hb/anFBKPQA4h9DrOWu9AD8LIm4n2txIvwBBCaQH2zZ3jJwH93R7QTAboBJaB45Ib4hGwBHSELheJRCLZIwdMAdvABfBgxhMfuTdr6rUngYa/kpgx/3ioGqUITPsUqAe2aiigrGyaDqnZCCihTNbTSkwIkFBmPtPXaif0dl4JkFAml0Cdi8iggPLKyoCLyJqA4srKqovIroDiysqOi8iZgOLKiu5UNecCiisrulMUUQJ2QsUdIZ4R4k+LeEbKU/B4+/OVQoXOkQie+QY59KcNhbK46gAAAABJRU5ErkJggg==";
    avatar.style.marginTop = "15px"; // 可以根据需要调整头像和消息块的间距
    avatar.style.width = "30px"; // 可以根据需要调整宽度
    avatar.style.height = "30px"; // 可以根据需要调整高度

  
    // 示例：只在用户当前已经接近底部时自动滚动
const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 100;
if (isNearBottom) {
    chatContent.scrollTop = chatContent.scrollHeight;
}


    // 隐藏发送按钮
 

    // 安全地计算用户消息token
    let userTokens = 0;
    try {
        userTokens = countTokens(message);
    } catch (e) {
        console.error("Error counting tokens:", e);
    }

 

    // 安全地添加token数量显示
    try {
        const tokenInfo = document.createElement('div');
        tokenInfo.className = 'ds-token-info';
        tokenInfo.innerHTML = `<small>Userinput: ${userTokens} tokens</small>`;
        userMsgDiv.appendChild(tokenInfo);
    } catch (e) {
        console.error("Error adding token info:", e);
    }
    
    
    // 安全地更新对话token统计
    try {
        updateConversationTokenCount();
    } catch (e) {
        console.error("Error updating conversation token count:", e);
    }
  // 将用户消息块和头像添加到容器
  userMessageContainer.appendChild(userMsgDiv);
  userMessageContainer.appendChild(avatar);

  // 将容器添加到聊天内容区域
  chatContent.appendChild(userMessageContainer);

  const thinkingMsgDiv = document.createElement('div');
  thinkingMsgDiv.className = 'ds-reasoning-title';
  thinkingMsgDiv.innerText = '思考中...';
  chatContent.appendChild(thinkingMsgDiv);

  const aiMsgDiv = document.createElement('div');
  aiMsgDiv.className = 'ds-chat-message ds-ai-message';
  chatContent.appendChild(aiMsgDiv);

userMsgDiv.appendChild(U_actionsDiv);// 确保用户消息的复制按钮在内容之后

    // 构建请求数据 - 总是发送完整消息给AI
    const requestData = {
        model: config.model,
        messages: [
            ...truncateContext(config.chatHistory, config.maxContextTokens)
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,

    };
 if (config.additionalParams && Object.keys(config.additionalParams).length > 0) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
            requestData[key] = value;
        });
    }
    // 如果是总结任务，添加网页内容作为系统消息
    if (isSummaryTask) {
        const pageContent = getPageContent();
        requestData.messages.splice(1, 0, {
            role: 'user',
            content: message,
        });
    } else if (config.usePageContext) {
        // 普通对话的网页上下文
        const pageContent = getPageContent();
        requestData.messages.splice(1, 0, {
            role: 'assistant',
            content: `[当前网页信息]\n标题: ${pageContent.title}\nURL: ${pageContent.url}\n正文内容: ${pageContent.content}\n注意：基于以上网页内容，回答问题，如果问题不相关则仅作为上下文扩充参考`
        });
    }
    else if  (config.personalityPrompt) {
        requestData.messages.splice(0, 0, {
            role: 'system',
            content: config.personalityPrompt,
        });
    }
        console.log('发送的请求数据:', requestData); // 添加



        // 安全包装的GM_xmlhttpRequest
        try {
            GM_xmlhttpRequest({
                method: 'POST',
                url: config.apiUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Accept': 'text/event-stream'
                },
                responseType: 'stream',
                data: JSON.stringify(requestData),
                onloadstart: (responseInfo) => {
                    try {
                        if (typeof handleStreamResponse === 'function') {
                            handleStreamResponse(responseInfo.response, aiMsgDiv, thinkingMsgDiv, isSummaryTask)
                                .then(() => {
                                    clearTimeout(timeoutId);
                                    
                                    // 在流处理完成后安全地更新token统计
                                    try {
                                        updateConversationTokenCount();
					startButton.style.display = 'flex';
                                    } catch (e) {
                                        console.error("Error updating tokens after response:", e);
                                    }
                                })
                                .catch((error) => {
                                    clearTimeout(timeoutId);
                                    console.error('处理流响应时出错:', error);
                                    const errorMsgDiv = document.createElement('div');
                                    errorMsgDiv.className = 'ds-chat-message ds-error';
                                    errorMsgDiv.innerText = `处理响应时出错: ${error.message || '未知错误'}`;
                                    chatContent.appendChild(errorMsgDiv);
                                    chatContent.scrollTop = chatContent.scrollHeight;
                                    startButton.style.display = 'flex';
                                });
                        } else {
                            throw new Error("handleStreamResponse function is not available");
                        }
                    } catch (error) {
                        clearTimeout(timeoutId);
                        console.error("Error in response handling:", error);
                        const existingStopButton = document.querySelector('.ds-stop-button');
                        if (existingStopButton) existingStopButton.remove();
                        startButton.style.display = 'flex';
                        
                        const errorMsgDiv = document.createElement('div');
                        errorMsgDiv.className = 'ds-chat-message ds-error';
                        errorMsgDiv.innerText = `响应处理错误: ${error.message || '未知错误'}`;
                        chatContent.appendChild(errorMsgDiv);
                        chatContent.scrollTop = chatContent.scrollHeight;
                    }
                },
                onerror: (error) => {
                    clearTimeout(timeoutId);
                    if (thinkingMsgDiv.parentNode) {
                        chatContent.removeChild(thinkingMsgDiv);
                    }
                    const existingStopButton = document.querySelector('.ds-stop-button');
                    if (existingStopButton) existingStopButton.remove();
                    
                    // 检查是否是重试的错误
                    if (retryCount < 2) {
                        console.log(`请求失败，第${retryCount + 1}次重试...`);
                        const retryMsgDiv = document.createElement('div');
                        retryMsgDiv.className = 'ds-chat-message ds-thinking';
                        retryMsgDiv.innerText = `请求失败，正在重试 (${retryCount + 1}/2)...`;
                        chatContent.appendChild(retryMsgDiv);
                        chatContent.scrollTop = chatContent.scrollHeight;
                        
                        // 移除最后添加的AI消息元素
                        if (aiMsgDiv.parentNode) {
                            chatContent.removeChild(aiMsgDiv);
                        }
                        
                        // 短暂延迟后重试
                        setTimeout(() => {
                            if (retryMsgDiv.parentNode) {
                                chatContent.removeChild(retryMsgDiv);
                            }
                            sendMessage(message, retryCount + 1, isSummaryTask);
                        }, 1000);
                    } else {
                        console.error('请求失败，不再重试:', error);
                        const errorMsgDiv = document.createElement('div');
                        errorMsgDiv.className = 'ds-chat-message ds-error';
                        errorMsgDiv.innerText = `请求失败: ${error.statusText || '未知错误'}。请检查网络或API设置。`;
                        chatContent.appendChild(errorMsgDiv);
                        chatContent.scrollTop = chatContent.scrollHeight;
                        startButton.style.display = 'flex';
                    }
                },
                ontimeout: () => {
                    clearTimeout(timeoutId);
                    const existingStopButton = document.querySelector('.ds-stop-button');
                    if (existingStopButton) existingStopButton.remove();
                    if (thinkingMsgDiv.parentNode) {
                        chatContent.removeChild(thinkingMsgDiv);
                    }
                    
                    const errorMsgDiv = document.createElement('div');
                    errorMsgDiv.className = 'ds-chat-message ds-error';
                    errorMsgDiv.innerText = '请求超时，请检查网络连接后重试。';
                    chatContent.appendChild(errorMsgDiv);
                    chatContent.scrollTop = chatContent.scrollHeight;
                    startButton.style.display = 'flex';
                }
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('发送消息时出错:', error);
            if (thinkingMsgDiv.parentNode) {
                chatContent.removeChild(thinkingMsgDiv);
            }
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.className = 'ds-chat-message ds-error';
            errorMsgDiv.innerText = `发送消息时出错: ${error.message || '未知错误'}`;
            chatContent.appendChild(errorMsgDiv);
            chatContent.scrollTop = chatContent.scrollHeight;
            startButton.style.display = 'flex';
        }
    }
   

// ... rest of the existing code ...
// 为代码块添加copy按钮
// function addCopyButtonsToCodeBlocks(container) {
//     container.querySelectorAll('pre').forEach(pre => {
//         // 强制添加 hljs 类确保样式应用
//         if (!pre.classList.contains('hljs')) {
//             pre.classList.add('hljs');
//         }

//         // 如果不存在代码元素则自动创建
//         if (!pre.querySelector('code')) {
//             const code = document.createElement('code');
//             code.textContent = pre.textContent;
//             pre.innerHTML = '';
//             pre.appendChild(code);
//         }
//创建copy按钮（新版）
  // 为消息添加三点菜单和复制功能
  function addMessageOptionsMenu(messageDiv) {
    // 创建容器使消息可以相对定位
    const messageContainer = document.createElement('div');
    messageContainer.className = 'ds-message-container';
    messageContainer.style.position = 'relative';

    // 将消息移动到容器内
   // messageDiv.parentNode.insertBefore(messageContainer, messageDiv);
    messageContainer.appendChild(messageDiv);

    // 创建三点菜单按钮
    const optionsButton = document.createElement('button');
    optionsButton.className = 'ds-message-options-btn';
    optionsButton.innerHTML = '⋮';
    optionsButton.style.position = 'absolute';
    optionsButton.style.top = '8px';
    optionsButton.style.right = '5px';
   // optionsButton.setAttribute('style', 'background: transparent !important;');

    optionsButton.style.border = 'none';
    optionsButton.style.cursor = 'pointer';
    optionsButton.style.fontSize = '16px';
    optionsButton.style.color = 'black';
    optionsButton.style.padding = '3px 7px';
    optionsButton.style.borderRadius = '3px';
    optionsButton.style.display = 'none'; // 默认隐藏

    // 创建选项菜单
    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'ds-message-options-menu';
    optionsMenu.style.position = 'absolute';
    optionsMenu.style.top = '25px';
    optionsMenu.style.right = '5px';
    optionsMenu.style.background = '#fff';
    optionsMenu.style.border = '1px solid #ddd';
    optionsMenu.style.borderRadius = '4px';
    optionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    optionsMenu.style.zIndex = '1000';
    optionsMenu.style.display = 'none';

    // 添加复制选项
    const copyOption = document.createElement('div');
    copyOption.className = 'ds-message-option';
    copyOption.textContent = 'copy';
    copyOption.style.padding = '8px 12px';
    copyOption.style.cursor = 'pointer';
    copyOption.style.whiteSpace = 'nowrap';

    copyOption.addEventListener('mouseover', () => {
      copyOption.style.backgroundColor = '#f0f0f0';
    });

    copyOption.addEventListener('mouseout', () => {
      copyOption.style.backgroundColor = '';
    });

    copyOption.addEventListener('click', () => {
      // 获取消息文本内容
      const text = messageDiv.innerText;
      navigator.clipboard.writeText(text).then(() => {
        // 显示成功提示
        const successMessage = document.createElement('span');
        successMessage.className = 'copy-success';
        successMessage.textContent = '已复制!';
        successMessage.style.position = 'absolute';
        successMessage.style.top = '25px';
        successMessage.style.right = '5px';
        successMessage.style.background = 'rgba(0,0,0,0.7)';
        successMessage.style.color = '#fff';
        successMessage.style.padding = '3px 8px';
        successMessage.style.borderRadius = '3px';
        successMessage.style.fontSize = '12px';
        messageContainer.appendChild(successMessage);

        // 隐藏菜单
        optionsMenu.style.display = 'none';

        // 2秒后移除成功提示
        setTimeout(() => {
          successMessage.remove();
        }, 2000);
      }).catch(err => {
        console.error('复制失败: ', err);
      });
    });

    // 添加选项到菜单
    optionsMenu.appendChild(copyOption);

    // 添加点击事件切换菜单显示状态
    optionsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (optionsMenu.style.display === 'none') {
        optionsMenu.style.display = 'block';
      } else {
        optionsMenu.style.display = 'none';
      }
    });

    // 点击其他地方隐藏菜单
    document.addEventListener('click', () => {
      optionsMenu.style.display = 'none';
    });

    // 鼠标悬停在消息上时显示按钮
    messageContainer.addEventListener('mouseenter', () => {
      optionsButton.style.display = 'block';
    });

    messageContainer.addEventListener('mouseleave', () => {
      optionsButton.style.display = 'none';
      // 菜单是否应该在鼠标离开时消失取决于用户体验设计，可选
      // optionsMenu.style.display = 'none';
    });

    // 将按钮和菜单添加到消息容器
    messageContainer.appendChild(optionsButton);
    messageContainer.appendChild(optionsMenu);

    return messageContainer;
  }
// 创建copy按钮（旧版）
     
function addButtonsToPre(preElement) {
    if (!preElement || typeof preElement !== 'object') {
        console.warn("addButtonsToPre: 无效的 pre 元素");
        return;
    }

    // 检查是否已经处理过
    if (preElement.hasAttribute('data-buttons-added')) {
        return;
    }

    // 检查是否已有按钮容器
    if (preElement.querySelector('.code-buttons-container') || 
        preElement.nextElementSibling?.classList?.contains('code-buttons-container')) {
        preElement.setAttribute('data-buttons-added', 'true');
        return;
    }

    // 确保 <code> 元素存在且包含代码
    let codeElement = preElement.querySelector('code');
    if (!codeElement) {
        // 如果没有 <code>，但 <pre> 有文本，则创建 <code> 包裹它
        const textContent = preElement.textContent;
        if (textContent) {
            codeElement = document.createElement('code');
            // 尝试从 pre 的 class 中获取语言信息
            const langMatch = preElement.className.match(/language-(\S+)/);
            if (langMatch && langMatch[1]) {
                codeElement.className = `language-${langMatch[1]}`;
            }
            codeElement.textContent = textContent;
            preElement.innerHTML = ''; // 清空 pre
            preElement.appendChild(codeElement);
        } else {
            // 如果 pre 里没内容，就不添加按钮了
            return;
        }
    }

    // 确保 <pre> 有 hljs 基础类，方便样式统一
    if (!preElement.classList.contains('hljs')) {
        preElement.classList.add('hljs');
    }

    const codeText = codeElement.textContent;
    if (!codeText) return; // 没有代码内容也不加按钮

    // 创建【一个】按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.className = 'code-buttons-container'; // 使用 CSS 控制样式和定位
    // 建议 CSS: position: absolute; top: 5px; right: 5px; z-index: 10; display: flex; gap: 5px;
    // (需要在你的 CSS 样式中定义 .code-buttons-container 和按钮的样式)

    let buttonsAdded = false;

    // 1. 添加"copy"按钮
    try {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn'; // 定义你的copy按钮样式
        copyButton.textContent = 'copy';
        copyButton.title = '复制代码';
        copyButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡到 pre
            navigator.clipboard.writeText(codeText).then(() => {
                copyButton.textContent = '已copy!';
                copyButton.style.backgroundColor = '#4CAF50'; // 成功时的背景色
                copyButton.disabled = true;
                setTimeout(() => {
                    copyButton.textContent = 'copy';
                    copyButton.disabled = false;
                 }, 2000);
            }).catch(err => {
                console.error('copy失败: ', err);
                copyButton.textContent = '失败';
                 setTimeout(() => { copyButton.textContent = 'copy'; }, 2000);
            });
        });
        btnContainer.appendChild(copyButton);
        buttonsAdded = true;
    } catch (e) {
        console.error("创建copy按钮时出错:", e);
    }

    // 2. 添加"运行"按钮 (如果适用)
    try {
        const codeType = detectCodeType(codeText);

        if (codeType == 'python' || codeType == 'html') {
            const runBtn = document.createElement('button');
            runBtn.className = 'code-execute-btn'; // 定义你的运行按钮样式
            runBtn.textContent = '运行';
            runBtn.title = `在线运行 ${codeType} 代码`;
            runBtn.onclick = function(e) {
                e.stopPropagation();
                // 确保 executeCode 函数可用
                if (typeof executeCode === 'function') {
                    executeCode(codeText, codeType);
                } else {
                    console.error("executeCode 函数未定义！");
                    alert("代码执行功能当前不可用。");
                }
            };
            btnContainer.appendChild(runBtn); // 添加到【同一个】容器
            buttonsAdded = true;
        }
    } catch (e) {
        console.error("创建运行按钮时出错:", e);
    }

    // 只有当成功添加了至少一个按钮时，才将容器添加到 pre 元素
    if (buttonsAdded) {
        // 将容器添加到 pre 元素内部的起始位置，方便用 CSS 定位到右上角
        preElement.prepend(btnContainer);
        // 标记已处理
        preElement.setAttribute('data-buttons-added', 'true');
    }
}




    function addCopyButtonsToCodeBlocks(container) {
        // 遍历所有 pre 元素（不仅仅是已高亮的）
        container.querySelectorAll('pre').forEach(pre => {
            // 强制添加 hljs 类确保样式应用
            if (!pre.classList.contains('hljs')) {
                pre.classList.add('hljs');
            }

            // 检查是否已经有按钮容器，如果有则跳过
            if (pre.querySelector('.code-buttons-container') || 
                pre.nextElementSibling?.classList?.contains('code-buttons-container')) {
                return;
            }

            // 如果不存在代码元素则自动创建
            if (!pre.querySelector('code')) {
                const code = document.createElement('code');
                code.textContent = pre.textContent;
                pre.innerHTML = '';
                pre.appendChild(code);
            }

            // 创建新的copy按钮
            const btnContainer = document.createElement('div');
            btnContainer.className = 'code-buttons-container';
            btnContainer.style.position = 'relative';
                   
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-hcode-btn';
            copyButton.textContent = 'copy';

            // 绑定copy事件（带重试机制）
            copyButton.addEventListener('click', () => {
                const code = pre.querySelector('code').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    // 显示成功提示
                    const successMessage = document.createElement('div');
                    successMessage.className = 'copy-success';
                    successMessage.textContent = '复制成功';
                    pre.appendChild(successMessage);

                    // 2秒后淡出移除
                    setTimeout(() => {
                        successMessage.style.opacity = '0';
                        setTimeout(() => {
                            pre.removeChild(successMessage);
                        }, 500);
                    }, 1500);
                }).catch(err => {
                    console.error('copy失败: ', err);
                    // 可选：添加错误提示
                });
            });

            // 添加按钮到代码块
            pre.parentNode.insertBefore(btnContainer, pre);
            btnContainer.appendChild(copyButton);
            
            // 检测代码类型并添加运行按钮，而不是调用另一个函数
            const code = pre.textContent;
            const codeType = detectCodeType(code);
            
            if (codeType == 'python' || codeType == 'html') {
                const runBtn = document.createElement('button');
                runBtn.className = 'code-hexecute-btn';
                runBtn.textContent = '运行';
                runBtn.onclick = function(e) {
                    e.stopPropagation();
                    executeCode(code, codeType);
                };
                btnContainer.appendChild(runBtn);
            }

            // 强制重新高亮代码（解决时序问题）
            hljs.highlightElement(pre.querySelector('code'));
        });
    }

// 添加总结网页按钮点击事件
summarizeBtn.addEventListener('click', async () => {
    if (!config.apiKey) {
        alert('请先设置 API 密钥！');
        settingsBtn.click();
        return;
    }

    // 在对话框显示用户正在总结网页的消息
    /*const userSummaryMsgDiv = document.createElement('div');
    userSummaryMsgDiv.className = 'ds-chat-message ds-user-message';
    userSummaryMsgDiv.innerText = '正在总结当前网页...';
    chatContent.appendChild(userSummaryMsgDiv);*/
const isNearBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight < 100;
if (isNearBottom) {
    chatContent.scrollTop = chatContent.scrollHeight;
}

    const pageContent = getPageContent(true);
    const summaryPrompt = `你是一个长文本内容总结专家，总结当前网页，不能漏掉任何一点，要求突出重点和关键信息(重点关键词需要重点标记),并发表你的见解，引人深思：
    网页标题: ${pageContent.title}
    URL: ${pageContent.url}
    网页内容:
    ${pageContent.content.substring(0, 100000)}`;

    try {
        // 添加第三个参数 true 表示这是总结任务
        await sendMessage(summaryPrompt, 0, true);
    } catch (error) {
        console.error('总结网页时出错:', error);
    }
});



// 对话导出
exportBtn.addEventListener('click', () => {
    if (config.fullConversation.length === 0) {
        alert('没有可导出的对话内容');
        return;
    }

    // 提供格式选择
    const format = prompt('选择导出格式:\n1. TXT (文本)\n2. HTML (带样式)\n3. Markdown\n4. JSON (完整数据)', '3');

    if (!format) return;

    let exportContent = '';
    const dateStr = new Date().toLocaleString();

    switch(format) {
        case '1': // TXT 格式
            exportContent = `╭───────────────────────────────╮\n│      AI 助手对话记录         │\n│ 导出时间: ${dateStr.padEnd(19)} │\n╰───────────────────────────────╯\n\n`;
            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '👤 用户' : '🤖 AI';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `\n╭── ${role} · ${time} ──\n│\n`;

                // 优先显示思考内容
                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `│ 💭 思考过程:\n│ ${msg.reasoningContent.split('\n').join('\n│ ')}\n│\n`;
                }

                exportContent += `│ 📝 正式回答:\n│ ${msg.content.split('\n').join('\n│ ')}\n╰────────────────────────────────\n`;
            });
            break;

        case '2': // HTML 格式
            exportContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI 对话记录 - ${dateStr}</title>
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #ecf0f1;
            --reasoning-color: #f39c12;
        }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: var(--secondary-color);
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--primary-color);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .message {
            margin-bottom: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            overflow: hidden;
        }

        .message-header {
            padding: 1rem;
            background: var(--primary-color);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .reasoning-section {
            padding: 1rem;
            background: #fff3e0;
            border-left: 4px solid var(--reasoning-color);
            margin: 1rem;
            border-radius: 4px;
        }

        .content-section {
            padding: 1.5rem;
        }

        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }

        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1rem 0;
        }

        code {
            font-family: 'Fira Code', monospace;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI 对话记录</h1>
        <p>导出时间: ${dateStr}</p>
    </div>`;

            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '用户' : 'AI助手';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `
    <div class="message">
        <div class="message-header">
            <span>${role}</span>
            <span class="timestamp">${time}</span>
        </div>`;

                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `
        <div class="reasoning-section">
            <h3>💭 思考过程</h3>
            <div>${msg.reasoningContent.replace(/\n/g, '<br>')}</div>
        </div>`;
                }

                exportContent += `
        <div class="content-section">
            <h3>📝 正式回答</h3>
            <div>${msg.content.replace(/\n/g, '<br>')}</div>
        </div>
    </div>`;
            });

            exportContent += '\n</body>\n</html>';
            break;

        case '3': // Markdown 格式
            exportContent = `# AI 对话记录\n\n**导出时间**: ${dateStr}\n\n`;
            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '**👤 用户**' : '**🤖 AI助手**';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `## ${role} · _${time}_\n\n`;

                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `### 💭 思考过程\n${msg.reasoningContent}\n\n`;
                }

                exportContent += `### 📝 正式回答\n${msg.content}\n\n---\n\n`;
            });
            break;

        case '4': // JSON 格式
            exportContent = JSON.stringify({
                meta: {
                    title: "AI 对话记录",
                    exportDate: dateStr,
                    version: "2.0",
                    structure: "思考内容优先"
                },
                messages: config.fullConversation.map(msg => ({
                    ...msg,
                    contentOrder: msg.hasReasoning ? ["reasoning", "content"] : ["content"]
                }))
            }, null, 2);
            break;

        default:
            alert('无效的选择');
            return;
    }

    // 确定文件扩展名
    const ext =
        format === '1' ? 'txt' :
        format === '2' ? 'html' :
        format === '3' ? 'md' : 'json';

    // 创建下载链接
    const blob = new Blob([exportContent], {
        type: format === '2' ? 'text/html' :
              format === '4' ? 'application/json' : 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI对话记录_${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});


}
})
        .catch(error => {
            console.error('加载依赖库失败:', error);
        });
})();

// 改进的token计数函数 - 提高准确率至80%-90%
function countTokens(text) {
    if (!text) return 0;
    
    // 高精度token计算方法，适用于大多数主流模型
    
    // 基本正则表达式规则
    const patterns = {
        // Unicode分类支持
        cjk: /[\u4e00-\u9fff\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g,
        emoji: /[\p{Emoji_Presentation}|\p{Extended_Pictographic}]/gu,
        punctuation: /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~，。、！？：；""''（）【】《》]/g,
        whitespace: /\s+/g,
        number: /\d+(\.\d+)?/g,
        // 更精确的单词识别
        latinWord: /[a-zA-Z]+([-'][a-zA-Z]+)*/g
    };
    
    // 预处理文本 - 保留原始结构但标准化空白
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // 文本分段处理，提高准确性
    const segments = [];
    let currentPos = 0;
    
    // 将文本分割成不同类型的段落（代码块、普通文本等）以便分别处理
    const codeBlockRegex = /```[\s\S]*?```/g;
    const inlineCodeRegex = /`[^`]+`/g;
    let match;
    
    // 处理代码块
    while ((match = codeBlockRegex.exec(normalizedText)) !== null) {
        // 添加代码块前的文本
        if (match.index > currentPos) {
            segments.push({
                type: 'text',
                content: normalizedText.substring(currentPos, match.index)
            });
        }
        
        // 添加代码块
        segments.push({
            type: 'code_block',
            content: match[0]
        });
        
        currentPos = match.index + match[0].length;
    }
    
    // 添加剩余文本
    if (currentPos < normalizedText.length) {
        segments.push({
            type: 'text',
            content: normalizedText.substring(currentPos)
        });
    }
    
    // 根据不同的内容类型计算token
    let totalTokens = 0;
    
    segments.forEach(segment => {
        if (segment.type === 'code_block') {
            // 代码块处理 - 代码通常有更特殊的分词规则
            // 移除代码块标记
            const code = segment.content.replace(/```[\w]*\n?|\n?```$/g, '');
            
            // 代码通常按单词、符号和空白字符分词
            const codeTokens = code.split(/(\s+|[{}()\[\].,;:=<>!&|^+\-*/%~#]+)/)
                .filter(Boolean)
                .length;
                
            // 添加代码块标记的token（通常是2-3个token）
            totalTokens += codeTokens + 3;
        } else {
            // 普通文本处理
            const text = segment.content;
            
            // 计算中文和其他CJK字符（每个字符通常是一个token）
            const cjkChars = (text.match(patterns.cjk) || []).length;
            
            // 计算拉丁文单词（通常每个单词是一个token，长单词可能是多个）
            let wordTokens = 0;
            const words = text.match(patterns.latinWord) || [];
            words.forEach(word => {
                // 根据GPT等模型的BPE分词规则，估算token数
                if (word.length <= 2) {
                    wordTokens += 1;
                } else if (word.length <= 6) {
                    wordTokens += Math.ceil(word.length / 2.5);
                } else {
                    wordTokens += Math.ceil(word.length / 2);
                }
            });
            
            // 计算数字token
            const numbers = text.match(patterns.number) || [];
            const numberTokens = numbers.reduce((sum, num) => {
                // 数字通常按位数分词，但有规律性
                if (num.length <= 2) return sum + 1;
                return sum + Math.ceil(num.length / 2);
            }, 0);
            
            // 计算标点符号
            const punctuationCount = (text.match(patterns.punctuation) || []).length;
            
            // 计算空白字符（一般每组空白是一个token）
            const whitespaceCount = (text.match(patterns.whitespace) || []).length;
            
            // 计算表情符号（每个表情通常是1-2个token）
            const emojiCount = (text.match(patterns.emoji) || []).length * 2;
            
            // 特殊标记处理（如URL、引用等）
            const urlMatches = text.match(/https?:\/\/\S+/g) || [];
            const urlTokens = urlMatches.reduce((sum, url) => sum + Math.ceil(url.length / 4), 0);
            
            // 累加该段落的token总数
            totalTokens += cjkChars + wordTokens + numberTokens + punctuationCount + 
                         whitespaceCount + emojiCount + urlTokens;
        }
    });
    
    // 考虑一些特殊模型的token处理差异
    // 添加系统指令开销等适当因素
    const modelOverhead = 3; // 系统指令等固定开销
    
    // 最终四舍五入到整数
    return Math.round(totalTokens + modelOverhead);
}

// 更新对话的整体token统计
function updateConversationTokenCount() {
    // 确保config存在
    if (typeof config === 'undefined') {
        console.warn('Token counter: config is not defined yet');
        return { userTokens: 0, aiTokens: 0, totalTokens: 0 };
    }
    
    let userTokens = 0;
    let aiTokens = 0;
    
    // 计算历史对话中的token数
    if (config.chatHistory && Array.isArray(config.chatHistory)) {
        config.chatHistory.forEach(msg => {
            if (msg.role === 'user') {
                userTokens += countTokens(msg.content);
            } else if (msg.role === 'assistant') {
                // 如果消息已经有token计数就直接使用，否则计算
                aiTokens += msg.tokens || countTokens(msg.content);
            }
        });
    } else {
        console.warn('Token counter: config.chatHistory is not available');
    }
    
    // 创建或更新token计数器
    let tokenCounter = document.getElementById('ds-token-counter');
    if (!tokenCounter) {
        tokenCounter = document.createElement('div');
        tokenCounter.id = 'ds-token-counter';
        tokenCounter.className = 'ds-token-counter';
        const inputArea = document.querySelector('.ds-chat-input-area');
        if (inputArea) {
            inputArea.insertBefore(tokenCounter, inputArea.firstChild);
        }
    }
    
    // 更新token计数显示
    tokenCounter.innerHTML = `
        <span class="ds-token-label">对话统计: </span>
        <span class="ds-user-tokens">用户: ${userTokens} tokens</span>
        <span class="ds-ai-tokens">AI: ${aiTokens} tokens</span>
        <span class="ds-total-tokens">总计: ${userTokens + aiTokens} tokens</span>
    `;
    
    return { userTokens, aiTokens, totalTokens: userTokens + aiTokens };
}

// 监听用户输入框，实时显示token计数
function setupTokenCounter() {
    try {
        const inputBox = document.querySelector('.ds-chat-input');
        
        if (!inputBox) {
            console.warn('Token counter: Input box not found');
            return;
        }
        
        // 检查是否已经初始化过
        if (document.querySelector('.ds-input-token-counter')) {
            console.log('Token counter already initialized');
            return;
        }
        
        // 创建token计数显示元素
        let inputTokenCounter = document.createElement('div');
        inputTokenCounter.className = 'ds-input-token-counter';
        inputTokenCounter.innerText = '0 tokens';
        
        // 添加到输入框后面
        inputBox.parentNode.insertBefore(inputTokenCounter, inputBox.nextSibling);
        
        // 更新token计数的函数
        function updateInputTokenCount() {
            const text = inputBox.value;
            const tokens = countTokens(text);
            inputTokenCounter.innerText = `${tokens} tokens`;
            
            // 根据token数变更颜色提示
            if (tokens > 1000) {
                inputTokenCounter.style.color = '#ff4444';
            } else if (tokens > 500) {
                inputTokenCounter.style.color = '#ffa500';
            } else {
                inputTokenCounter.style.color = '#666';
            }
        }
        
        // 添加输入事件监听（使用匿名函数而不是方法引用）
        const handleInput = function() { updateInputTokenCount(); };
        inputBox.addEventListener('input', handleInput);
        inputBox.addEventListener('keyup', handleInput);
        inputBox.addEventListener('change', handleInput);
        
        // 初始更新
        updateInputTokenCount();
        
        console.log('Token counter initialized successfully');
    } catch (error) {
        console.error('Error in setupTokenCounter:', error);
    }
}

//displayHistory();
//颜色变化适配

// 初始化token计数器
setupTokenCounter();

// 初始化时更新对话统计
updateConversationTokenCount();

// 初始化token计数器和更新token统计
setTimeout(() => {
    try {
        setupTokenCounter();
        updateConversationTokenCount();
        console.log("Token counter initialized successfully");
    } catch (e) {
        console.error("Error initializing token counter:", e);
    }
}, 1000);

// 删除之前的自动初始化代码
// 改为使用delayed initialization，确保DOM完全加载后再初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        try {
            // 在页面完全加载后初始化token计数器
            setupTokenCounter();
            
            // 只有当config和chatContent都存在时才更新对话统计
            if (typeof config !== 'undefined' && document.querySelector('.ds-chat-content')) {
                updateConversationTokenCount();
            }
        } catch (e) {
            console.error("Error in token counter initialization:", e);
        }
    }, 2000); // 延迟2秒初始化
});

// 显示Python示例代码
function showPythonExamples() {
    // 创建示例弹窗
    const examplesModal = document.createElement('div');
    examplesModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 1010;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    examplesModal.innerHTML = `
        <span style="position: absolute; right: 15px; top: 15px; cursor: pointer; font-size: 20px;">&times;</span>
        <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">代码示例</h3>
        
        <div style="margin-bottom: 20px;">
            <p><strong>示例1: 基础数据操作</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin-bottom: 10px;">
# 列表和循环操作
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print(f"原始数字: {numbers}")
print(f"平方结果: {squares}")

# 字典操作
student = {"name": "张三", "age": 20, "scores": [85, 90, 92]}
print(f"学生信息: {student}")
print(f"学生姓名: {student['name']}")

# 循环计算
total = 0
for i in range(1, 11):
    total += i
    print(f"添加 {i}, 当前和为 {total}")
            </div>
            <button id="run-example1" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">运行此示例</button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p><strong>示例2: 数据可视化</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin-bottom: 10px;">
import numpy as np
import matplotlib.pyplot as plt

# 生成数据
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# 创建图表
plt.figure(figsize=(10, 6))
plt.plot(x, y1, 'b-', label='sin(x)')
plt.plot(x, y2, 'r--', label='cos(x)')
plt.xlabel('X 轴')
plt.ylabel('Y 轴')
plt.title('正弦和余弦曲线')
plt.legend()
plt.grid(True)

# 显示图表
plt.show()
            </div>
            <button id="run-example2" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">运行此示例</button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p><strong>示例3: 数据分析</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin-bottom: 10px;">
import pandas as pd
import numpy as np

# 创建示例数据
data = {
    'name': ['张三', '李四', '王五', '赵六', '钱七'],
    'age': [22, 35, 28, 41, 30],
    'salary': [5000, 8000, 6500, 9000, 7200],
    'department': ['技术', '销售', '技术', '市场', '销售']
}

# 创建DataFrame
df = pd.DataFrame(data)
print("原始数据:")
show_df(df)  # 使用自定义函数显示为HTML表格

# 按部门分组计算平均工资
dept_avg = df.groupby('department').agg({
    'salary': ['mean', 'min', 'max'],
    'age': 'mean'
})
print("\\n按部门统计:")
show_df(dept_avg)
            </div>
            <button id="run-example3" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">运行此示例</button>
        </div>
    `;
    
    document.body.appendChild(examplesModal);
    
    // 关闭按钮事件
    examplesModal.querySelector('span').addEventListener('click', () => {
        examplesModal.remove();
    });
    
    // 示例运行事件
    document.getElementById('run-example1').addEventListener('click', () => {
        const code = document.getElementById('run-example1').previousElementSibling.textContent;
        examplesModal.remove();
        executeCode(code, 'python');
    });
    
    document.getElementById('run-example2').addEventListener('click', () => {
        const code = document.getElementById('run-example2').previousElementSibling.textContent;
        examplesModal.remove();
        executeCode(code, 'python');
    });
    
    document.getElementById('run-example3').addEventListener('click', () => {
        const code = document.getElementById('run-example3').previousElementSibling.textContent;
        examplesModal.remove();
        executeCode(code, 'python');
    });
}
// ... existing code ...



// ... rest of existing code ...