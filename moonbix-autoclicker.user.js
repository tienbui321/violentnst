// ==UserScript==
// @name         Moonbix Autoclicker TienBV
// @version      1.4
// @namespace    Violentmonkey Scripts
// @author       TienBV
// @match        https://www.binance.com/*
// @grant        none
// @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
// @updateURL    https://github.com/tienbui321/violentnst/raw/main/moonbix-autoclicker.user.js
// @downloadURL  https://github.com/tienbui321/violentnst/raw/main/moonbix-autoclicker.user.js
// @homepage     https://github.com/tienbui321/violentnst/raw/main/blum.png
// ==/UserScript==

try {

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
    document.body.appendChild(taskButton);

    function simulateClick(element) {
        const event = new MouseEvent('mousedown', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            clientX: 150,
            clientY: 150
        });

        element.dispatchEvent(event);
    }

    function playGame() {
        setTimeout(() => {
            const canvas = document.querySelector('.canvas-wrapper canvas');
            if (canvas) {
                const interval = setInterval(() => {
                    simulateClick(canvas);
                }, getNewGameDelay());
            } else {
                console.log('Canvas not found.');
            }
        }, 2000);
    }

    function clickElement(element) {
        element.onClick(element);
        element.isExplosion = true;
        element.addedAt = performance.now();
    }

    function getNewGameDelay() {
        return Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
    }

    async function checkAndClickPlayButton() {
        await sleep(2000);
        const playButton = document.querySelector('#__APP > div > div > div > div:nth-child(3) > button');
        if (playButton && playButton.textContent.includes('Play')) {
            setTimeout(() => {
                playButton.click();
                playGame();
            }, getNewGameDelay());
        }
    }

    async function checkGameOver() {
        await sleep(2000);
        let continueEl = _$(".Game_game__container__1I7MG > div > div:last-child button");
        if (continueEl.textContent == "Continue") {
            setTaskDone();
            continueEl.click();
        }
    }

    function setTaskDone() {
        taskButton.textContent = "Done";
        taskButton.classList.add("task_done");
    }

    async function regObserve() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    checkAndClickPlayButton();
                    checkGameOver();
                }
            }
        });

        const appElement = await waitAndSelect('#__APP');
        if (appElement) {
            observer.observe(appElement, { childList: true, subtree: true });
        }

    }

    async function _doPlay() {
        await sleep(4000);

        let dailyReward = await waitAndSelect(".DailyLogin_login__button__15aOK");
        if (dailyReward)
            dailyReward.click();

        await sleep(2000);

        if (document.querySelector('.Game_entry__infoRow__3yzzP > div:last-child').textContent == '0/6')
            return setTaskDone();

        let startPlayBtn = document.querySelector(".Game_entry__playBtn__1Gi2c");
        if (startPlayBtn && startPlayBtn.textContent.includes('Play Game')) {
            await sleep(getNewGameDelay());
            startPlayBtn.click();
            playGame();

            regObserve();
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

        return null;
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

    _doPlay();
} catch (e) {
    console.log(e);
}