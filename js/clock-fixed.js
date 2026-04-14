// 电子钟 - PJAX 兼容版
(function() {
    // 防止重复加载
    if (window._clockLoaded) return;
    window._clockLoaded = true;
    
    console.log('电子钟脚本加载中...');
    
    // 星期数组
    var WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    // 全局时钟定时器
    var clockInterval = null;
    
    function padZero(num, len) {
        return ("0".repeat(len) + num).slice(-len);
    }
    
    // 查找时钟容器（兼容各种情况）
    function findClockContainer() {
        // 方法1: 通过 ID
        var container = document.getElementById("hexo_electric_clock");
        if (container) return container;
        
        // 方法2: 通过 class（可能是插件动态生成的）
        container = document.querySelector(".electric_clock");
        if (container) return container;
        
        // 方法3: 在侧边栏中查找
        container = document.querySelector(".sticky_layout [class*='clock']");
        if (container) return container;
        
        // 方法4: 在 card-widget 中查找
        container = document.querySelector(".card-widget [class*='clock']");
        if (container) return container;
        
        return null;
    }
    
    // 停止旧时钟
    function stopClock() {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }
    
    // 更新时钟显示（无天气版本）
    function updateSimpleClockDisplay() {
        var timeEl = document.getElementById("card-clock-time");
        var dateEl = document.getElementById("card-clock-clockdate");
        var ampmEl = document.getElementById("card-clock-dackorlight");
        
        if (!timeEl && !dateEl && !ampmEl) return;
        
        var now = new Date();
        if (timeEl) timeEl.innerHTML = padZero(now.getHours(),2) + ':' + padZero(now.getMinutes(),2) + ':' + padZero(now.getSeconds(),2);
        if (dateEl) dateEl.innerHTML = now.getFullYear() + '-' + padZero(now.getMonth()+1,2) + '-' + padZero(now.getDate(),2) + ' ' + WEEK_DAYS[now.getDay()];
        if (ampmEl) ampmEl.innerHTML = now.getHours() > 12 ? " PM" : " AM";
    }
    
    // 显示简单时钟（无天气，仅时间日期）
    function showSimpleClock() {
        var container = findClockContainer();
        if (!container) {
            console.warn('找不到时钟容器');
            return;
        }
        
        var now = new Date();
        container.innerHTML = '<div class="clock-row">' +
            '<span id="card-clock-clockdate" class="card-clock-clockdate">' + 
            now.getFullYear() + '-' + padZero(now.getMonth()+1,2) + '-' + padZero(now.getDate(),2) + ' ' + WEEK_DAYS[now.getDay()] +
            '</span>' +
            '<span class="card-clock-weather">⏰ 时钟</span>' +
            '</div>' +
            '<div class="clock-row">' +
            '<span id="card-clock-time" class="card-clock-time">' + 
            padZero(now.getHours(),2) + ':' + padZero(now.getMinutes(),2) + ':' + padZero(now.getSeconds(),2) +
            '</span>' +
            '</div>' +
            '<div class="clock-row">' +
            '<span class="card-clock-location">📍 ' + (typeof default_city !== 'undefined' ? default_city : '重庆') + '</span>' +
            '<span id="card-clock-dackorlight" class="card-clock-dackorlight">' + (now.getHours() > 12 ? " PM" : " AM") + '</span>' +
            '</div>';
        
        // 启动时钟更新
        stopClock();
        clockInterval = setInterval(updateSimpleClockDisplay, 1000);
    }
    
    // 显示完整天气时钟
    function showWeatherClock(weatherData, cityName, timezone) {
        var container = findClockContainer();
        if (!container) {
            console.warn('找不到时钟容器');
            return;
        }
        
        var icon = weatherData.now.icon;
        var temp = weatherData.now.temp;
        var text = weatherData.now.text;
        var humidity = weatherData.now.humidity;
        var windDir = weatherData.now.windDir;
        
        container.innerHTML = '<div class="clock-row">' +
            '<span id="card-clock-clockdate" class="card-clock-clockdate"></span>' +
            '<span class="card-clock-weather"><i class="qi-' + icon + '-fill"></i> ' + text + ' <span>' + temp + '</span> ℃</span>' +
            '<span class="card-clock-humidity">💧 ' + humidity + '%</span>' +
            '</div>' +
            '<div class="clock-row">' +
            '<span id="card-clock-time" class="card-clock-time"></span>' +
            '</div>' +
            '<div class="clock-row">' +
            '<span class="card-clock-windDir">🌬️ ' + windDir + '</span>' +
            '<span class="card-clock-location">' + cityName + '</span>' +
            '<span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>' +
            '</div>';
        
        // 启动带时区的时钟更新
        stopClock();
        clockInterval = setInterval(function() {
            var timeEl = document.getElementById("card-clock-time");
            var dateEl = document.getElementById("card-clock-clockdate");
            var ampmEl = document.getElementById("card-clock-dackorlight");
            
            if (!timeEl && !dateEl && !ampmEl) return;
            
            var now = new Date();
            try {
                var options = { timeZone: timezone, hour12: false };
                var localStr = now.toLocaleString("en-US", options);
                var localDate = new Date(localStr);
                
                if (timeEl) timeEl.innerHTML = padZero(localDate.getHours(),2) + ':' + padZero(localDate.getMinutes(),2) + ':' + padZero(localDate.getSeconds(),2);
                if (dateEl) dateEl.innerHTML = localDate.getFullYear() + '-' + padZero(localDate.getMonth()+1,2) + '-' + padZero(localDate.getDate(),2) + ' ' + WEEK_DAYS[localDate.getDay()];
                if (ampmEl) ampmEl.innerHTML = localDate.getHours() > 12 ? " PM" : " AM";
            } catch(e) {
                // 时区转换失败，使用本地时间
                if (timeEl) timeEl.innerHTML = padZero(now.getHours(),2) + ':' + padZero(now.getMinutes(),2) + ':' + padZero(now.getSeconds(),2);
                if (dateEl) dateEl.innerHTML = now.getFullYear() + '-' + padZero(now.getMonth()+1,2) + '-' + padZero(now.getDate(),2) + ' ' + WEEK_DAYS[now.getDay()];
                if (ampmEl) ampmEl.innerHTML = now.getHours() > 12 ? " PM" : " AM";
            }
        }, 1000);
    }
    
    // 获取天气
    function fetchWeather(cityName) {
        if (!cityName || cityName.trim() === "") {
            cityName = typeof default_city !== 'undefined' ? default_city : "重庆";
        }
        
        console.log('获取天气:', cityName);
        
        // 先显示简单时钟
        showSimpleClock();
        
        // 获取 location id
        var geoUrl = qweather_api_host + '/geo/v2/city/lookup?location=' + encodeURIComponent(cityName) + '&key=' + qweather_key;
        
        fetch(geoUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var location = data.location && data.location[0];
                if (!location) throw new Error('未找到城市');
                
                var weatherUrl = qweather_api_host + '/v7/weather/now?location=' + location.id + '&key=' + qweather_key;
                return fetch(weatherUrl).then(function(res) { return res.json(); });
            })
            .then(function(weatherData) {
                if (weatherData.code === '200') {
                    showWeatherClock(weatherData, cityName, "Asia/Shanghai");
                }
            })
            .catch(function(err) {
                console.error('天气获取失败:', err);
                // 保持简单时钟
            });
    }
    
    // IP 定位获取城市
    function locateAndFetchWeather() {
        var ipUrl = 'https://restapi.amap.com/v3/ip?key=' + gaud_map_key;
        
        fetch(ipUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var city = data.city || data.province || default_city;
                fetchWeather(city);
            })
            .catch(function(err) {
                console.error('IP定位失败:', err);
                fetchWeather(default_city);
            });
    }
    
    // 初始化函数（暴露给全局）
    window.initElectricClock = function() {
        console.log('初始化电子钟...');
        
        // 停止旧时钟
        stopClock();
        
        // 查找容器
        var container = findClockContainer();
        if (!container) {
            console.warn('找不到时钟容器，稍后重试...');
            // 延迟重试
            setTimeout(function() {
                window.initElectricClock();
            }, 500);
            return;
        }
        
        // 开始加载天气
        if (typeof gaud_map_key !== 'undefined' && gaud_map_key) {
            locateAndFetchWeather();
        } else {
            fetchWeather(default_city);
        }
    };
    
    // 页面加载时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initElectricClock);
    } else {
        window.initElectricClock();
    }
    
    console.log('电子钟脚本加载完成');
})();