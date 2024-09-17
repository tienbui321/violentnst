// ==UserScript==
// @name         Blum Autoclicker
// @version      1.3
// @namespace    Violentmonkey Scripts
// @author       TienBV
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
// @updateURL    https://github.com/tienbui321/violentnst/raw/main/blum-autoclicker.user.js
// @homepage     https://github.com/tienbui321/violentnst/raw/main/blum.png
// ==/UserScript==

let GAME_SETTINGS = {
    minBombHits: 0, // Math.floor(Math.random() * 2), // Minimum number of bomb clicks in percentage
    minIceHits: Math.floor(Math.random() * 2) + 2, // Minimum number of freeze clicks
    flowerSkipPercentage: Math.floor(Math.random() * 11) + 15, // Probability of clicking on a flower in percentage
    minDelayMs: 2000, // Minimum delay between actions in milliseconds
    maxDelayMs: 5000, // Maximum delay between actions in milliseconds
};

let isGamePaused = false;

try {
    let gameStats = {
        score: 0,
        bombHits: 0,
        iceHits: 0,
        flowersSkipped: 0,
        isGameOver: false,
    };

    const originalPush = Array.prototype.push;
    Array.prototype.push = function(...items) {
        if (!isGamePaused) {
            items.forEach(item => handleGameElement(item));
        }
        return originalPush.apply(this, items);
    };

    function handleGameElement(element) {
        if (!element || !element.item) return;

        const { type } = element.item;
        switch (type) {
            case "CLOVER":
                processFlower(element);
                break;
            case "BOMB":
                processBomb(element);
                break;
            case "FREEZE":
                processIce(element);
                break;
        }
    }

    function processFlower(element) {
        const shouldSkip = Math.random() < (GAME_SETTINGS.flowerSkipPercentage / 100);
        if (shouldSkip) {
            gameStats.flowersSkipped++;
        } else {
            gameStats.score++;
            clickElement(element);
        }
    }

    function processBomb(element) {
        if (gameStats.bombHits < GAME_SETTINGS.minBombHits) {
            gameStats.score = 0;
            clickElement(element);
            gameStats.bombHits++;
        }
    }

    function processIce(element) {
        if (gameStats.iceHits < GAME_SETTINGS.minIceHits) {
            clickElement(element);
            gameStats.iceHits++;
        }
    }

    function clickElement(element) {
        element.onClick(element);
        element.isExplosion = true;
        element.addedAt = performance.now();
    }

    function checkGameCompletion() {
        const rewardElement = document.querySelector('#app > div > div > div.content > div.reward');
        if (rewardElement && !gameStats.isGameOver) {
            gameStats.isGameOver = true;
            resetGameStats();
            resetGameSettings();
        }
    }

    function resetGameStats() {
        gameStats = {
            score: 0,
            bombHits: 0,
            iceHits: 0,
            flowersSkipped: 0,
            isGameOver: false,
        };
    }

    function resetGameSettings() {
        GAME_SETTINGS = {
            minBombHits: 0, // Minimum number of bomb clicks in percentage
            minIceHits: 5, //Math.floor(Math.random() * 2) + 2, // Minimum number of freeze clicks
            flowerSkipPercentage: Math.floor(Math.random() * 11) + 15, // Probability of clicking on a flower in percentage
            minDelayMs: 2000, // Minimum delay between actions in milliseconds
            maxDelayMs: 5000, // Maximum delay between actions in milliseconds
        };
    }

    function getNewGameDelay() {
        return Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
    }

    function checkAndClickPlayButton() {
        const playButton = document.querySelector('button.kit-button.is-large.is-primary');
        if (!isGamePaused && playButton && playButton.textContent.includes('Play')) {
            setTimeout(() => {
                playButton.click();
                gameStats.isGameOver = false;
            }, getNewGameDelay());
        }
    }

    function continuousPlayButtonCheck() {
        checkAndClickPlayButton();
        setTimeout(continuousPlayButtonCheck, 1000);
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                checkGameCompletion();
            }
        }
    });

    const appElement = document.querySelector('#app');
    if (appElement) {
        observer.observe(appElement, { childList: true, subtree: true });
    }

    continuousPlayButtonCheck();

    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause';
    pauseButton.style.position = 'fixed';
    pauseButton.style.bottom = '20px';
    pauseButton.style.right = '20px';
    pauseButton.style.zIndex = '9999';
    pauseButton.style.padding = '4px 8px';
    pauseButton.style.backgroundColor = '#5d5abd';
    pauseButton.style.color = 'white';
    pauseButton.style.border = 'none';
    pauseButton.style.borderRadius = '10px';
    pauseButton.style.cursor = 'pointer';
    pauseButton.onclick = toggleGamePause;
    document.body.appendChild(pauseButton);

    function toggleGamePause() {
        isGamePaused = !isGamePaused;
        pauseButton.textContent = isGamePaused ? 'Resume' : 'Pause';
    }

    const taskButton = document.createElement('button');
    taskButton.textContent = 'Do Task';
    taskButton.style.position = 'fixed';
    taskButton.style.bottom = '20px';
    taskButton.style.right = '90px';
    taskButton.style.zIndex = '9999';
    taskButton.style.padding = '4px 8px';
    taskButton.style.backgroundColor = '#5d5abd';
    taskButton.style.color = 'white';
    taskButton.style.border = 'none';
    taskButton.style.borderRadius = '10px';
    taskButton.style.cursor = 'pointer';
    taskButton.onclick = blum_doTask;
    document.body.appendChild(taskButton);

    let playtime = 0;

    function blum_doTask() {
        playtime++;
        if (playtime > 2)
            return;

        _$(".layout-tabs.tabs a[href='/tasks']").click();
        _clickToTab();
    }

    async function _clickToTab(idx) {
        await sleep(3000);
        idx = idx || 2;
        if (idx == 3)
            idx++;

        let tab = _$('.pages-tasks-sub-sections .kit-tabs .list > label.show-dot:nth-child(' + idx + ') > span');
        if (!tab || tab.length == 0) {
            // chay het thi vong lai claim
            blum_doTask();
            return;
        }

        tab.click();
        await sleep(3000);

        _doTasksInTab();

        await sleep(2000);
        _clickToTab(++idx);
    }

    async function _doTasksInTab() {
        let taskList = _$('.tasks-list > div');
        if (!taskList || taskList.length === 0)
            return;

        for (var i = 0; i < taskList.length; i++) {
            let task = taskList[i];
            await sleep(1500);
            clickTask(task);
        }
    }

    async function clickTask(task) {
        let taskBtn = _$('button.pill-btn', task);
        let text = taskBtn.innerText.trim();
        let is_not_started = hasClass(taskBtn, "is-status-not-started");
        let is_claim = hasClass(taskBtn, "is-status-ready-for-claim");

        if (is_not_started && !hasIgnoreTask(text))
            taskBtn.click();
        else if (is_claim == true) {
            taskBtn.click();
        }
    }

    function hasIgnoreTask(text) {
        let ignoreText = ["Boost Blum"];
        if (ignoreText.includes(text))
            return true;
        return false;
    }

    function _$(selector, parent) {
        let result = parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector);
        if (result.length === 1)
            return result[0];
        return result;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
    }
} catch (e) {
    console.log(e);
}