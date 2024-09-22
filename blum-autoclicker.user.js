// ==UserScript==
// @name         Blum Autoclicker TienBV
// @version      1.9
// @namespace    Violentmonkey Scripts
// @author       TienBV
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
// @updateURL    https://github.com/tienbui321/violentnst/raw/main/blum-autoclicker.user.js
// @downloadURL  https://github.com/tienbui321/violentnst/raw/main/blum-autoclicker.user.js
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

    continuousPlayButtonCheck();

    const taskButton = document.createElement('button');
    taskButton.textContent = 'Do Task';
    taskButton.id = 'taskAutoButton';
    taskButton.style.position = 'fixed';
    taskButton.style.bottom = '20px';
    taskButton.style.right = '20px';
    taskButton.style.zIndex = '9999';
    taskButton.style.padding = '4px 8px';
    taskButton.style.backgroundColor = '#5d5abd';
    taskButton.style.color = 'white';
    taskButton.style.border = 'none';
    taskButton.style.borderRadius = '10px';
    taskButton.style.cursor = 'pointer';
    taskButton.onclick = _doAuto;
    document.body.appendChild(taskButton);

    let isPlayingGame = 0;

    async function _doAuto() {
        await sleep(2000);

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    checkOutGame();
                    checkGameOver();
                    if (isPlayingGame == 0) {
                        checkClaimTicket();

                        checkClaim();

                        checkStartClaim();
                    }
                }
            }
        });

        const appElement = await waitAndSelect('#app');
        if (appElement) {
            observer.observe(appElement, { childList: true, subtree: true });
        }

        taskButton.textContent = "Doing";

        await _doClaims();

        await _doTasks();

        await _playGames();
    }

    async function _doClaims() {
        let claimTicketSelector = "#app > div.daily-reward-page.page.no-padding > div > div.pages-daily-reward-reward > div.footer > div.kit-fixed-wrapper.no-layout-tabs > button";
        await waitAndClick(claimTicketSelector);

        let claimSelector = "#app > div.index-page.page > div > div.kit-fixed-wrapper.has-layout-tabs .index-farming-button button.is-done";
        await waitAndClick(claimSelector);

        let startClaimSelector = "#app > div.index-page.page > div > div.kit-fixed-wrapper.has-layout-tabs > div > button.is-primary";
        await waitAndClick(startClaimSelector);

    }
    async function _playGames() {
        // Click tab Home
        _$(".layout-tabs.tabs a[href='/']").click();

        await sleep(1500);
        if (hasClass(_$(".play-btn"), "secondary"))
            return setTaskDone();

        await waitAndClick('.play-btn:not(.secondary)');
        isPlayingGame = 1;
    }

    function checkOutGame() {
        waitAndClick('.play-btn:not(.secondary)');
    }

    function checkClaimTicket() {
        let claimTicketEl = _$("#app > div.daily-reward-page.page.no-padding > div > div.pages-daily-reward-reward > div.footer > div.kit-fixed-wrapper.no-layout-tabs > button");
        claimTicketEl && claimTicketEl.click();
    }

    function checkClaim() {
        let claimTicketEl = _$("#app > div.index-page.page > div > div.kit-fixed-wrapper.has-layout-tabs .index-farming-button button.is-done");
        claimTicketEl && claimTicketEl.click();
    }

    function checkStartClaim() {
        let claimTicketEl = _$("#app > div.index-page.page > div > div.kit-fixed-wrapper.has-layout-tabs > div > button.is-primary");
        claimTicketEl && claimTicketEl.click();
    }

    function checkGameOver() {
        let continueEl = _$(".pages-game-end .buttons > button:last-child .label");
        if (continueEl.textContent == "Continue"); {
            continueEl.click();
            setTaskDone();
        }

    }

    let playtime = 0;

    async function _doTasks() {
        playtime++;
        if (playtime > 2) {
            return;
        }

        // Click tab Tasks
        _$(".layout-tabs.tabs a[href='/tasks']").click();

        await sleep(getClickDelay(2000))

        //_$('.pages-tasks-card.is-short button.is-status-not-started').click();
        // await _doShortTasks();

        //_$(".kit-bottom-sheet dialog .header button.close-btn").click();

        await _clickToTab();
    }

    async function _doShortTasks() {
        await sleep(getClickDelay(2000));

        let taskList = _$('.pages-tasks-subtasks-modal > .nested-tasks button.is-status-not-started, .pages-tasks-subtasks-modal > .nested-tasks button.is-status-ready-for-claim');
        if (!taskList || taskList.length === 0)
            return;

        for (var i = 0; i < taskList.length; i++) {
            let task = taskList[i];
            await sleep(getClickDelay());

            if (hasClass(task, "is-status-not-started"))
                task.click();

            if (hasClass(task, 'is-status-ready-for-claim'))
                task.click();
        }
    }

    async function _clickToTab(idx) {
        idx = idx || 4;
        if (idx > 5)
            return _doTasks();

        await sleep(getClickDelay());

        let tab = _$('.pages-tasks-sub-sections .kit-tabs .list > label.show-dot:nth-child(' + idx + ') > span');
        if (!tab || tab.length == 0) {
            // chay het thi vong lai claim
            idx == 4 ? await _clickToTab(5) : _doTasks();
            return;
        }

        tab.click();
        await sleep(getClickDelay());

        await _doTasksInTab();

        await _clickToTab(++idx);
    }

    async function _doTasksInTab() {
        let hasStartOrClaim = _$('.tasks-list > div button.pill-btn.is-status-not-started, .tasks-list > div button.pill-btn.is-status-ready-for-claim');
        if (hasStartOrClaim.length == 0)
            return;

        let taskList = _$('.tasks-list > div');
        if (!taskList || taskList.length === 0)
            return;

        for (var i = 0; i < taskList.length; i++) {
            let task = taskList[i];
            await sleep(getClickDelay());
            await clickTask(task);
        }
    }

    async function clickTask(task) {
        let taskBtn = _$('button.pill-btn', task);
        let text = task.querySelector(".title").innerText.trim();
        let is_not_started = hasClass(taskBtn, "is-status-not-started");
        let is_claim = hasClass(taskBtn, "is-status-ready-for-claim");
        let is_Verify = hasClass(taskBtn, 'is-status-ready-for-verify');

        if (is_not_started && !hasIgnoreTask(text))
            taskBtn.click();

        if (is_claim == true) {
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

    function getClickDelay(offset) {
        offset = offset | 1000;
        return Math.floor(Math.random() * (2000 - 1000 + 1) + offset);
    }

    async function waitAndClick(selector) {
        let i = 0;
        while (i < 4) {
            let startClaimBtn = document.querySelector(selector);
            if (startClaimBtn) {
                startClaimBtn.click();
                break
            }

            await sleep(getClickDelay());
            i++;
        }
    }

    async function waitAndSelect(selector) {
        let i = 0;
        while (i < 4) {
            let startClaimBtn = document.querySelector(selector);
            if (startClaimBtn) {
                return startClaimBtn;
            }

            await sleep(getClickDelay());
            i++;
        }
    }

    function setTaskDone() {
        taskButton.textContent = "Done";
        taskButton.classList.add("task_done");
    }

    _doAuto();

} catch (e) {
    console.log(e);
}