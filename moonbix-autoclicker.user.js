// ==UserScript==
// @name         Moonbix Autoclicker TienBV
// @version      1.0
// @namespace    Violentmonkey Scripts
// @author       TienBV
// @match        https://www.binance.com/*
// @grant        none
// @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
// @updateURL    https://github.com/tienbui321/violentnst/raw/main/moonbix-autoclicker.user.js
// @downloadURL  https://github.com/tienbui321/violentnst/blob/main/moonbix-autoclicker.user.js
// @homepage     https://github.com/tienbui321/violentnst/raw/main/blum.png
// ==/UserScript==

try {

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

    function checkAndClickPlayButton() {
        const playButton = document.querySelector('#__APP > div > div > div > div:nth-child(3) > button, .Game_entry__playBtn__1Gi2c');
        if (playButton && playButton.textContent.includes('Play')) {
            setTimeout(() => {
                playButton.click();
                playGame();
            }, getNewGameDelay());
        }
    }

    function continuousPlayButtonCheck() {
        checkAndClickPlayButton();
        setTimeout(continuousPlayButtonCheck, 1000);
    }

    continuousPlayButtonCheck();

    function clickTaskTab() {
        const taskTab = Array.from(document.querySelectorAll('.components_container__tab__1mbN9')).find(tab => {
            return tab.innerText.includes('Nhiệm vụ');
        });

        if (taskTab) {
            console.log('Tab Nhiệm vụ được tìm thấy, đang click...');
            taskTab.click();
            return true;
        } else {
            console.log('Không tìm thấy tab Nhiệm vụ.');
            return false;
        }
    }

    function clickIncompleteTask() {
        const tasks = document.querySelectorAll('.Tasks_taskItem__16PwK');
        let foundIncompleteTask = false;
        for (const task of tasks) {
            const checkIcon = task.querySelector('img[src*="check.png"]');
            if (!checkIcon) {
                console.log('Nhiệm vụ chưa hoàn thành được tìm thấy, đang click...');
                task.click(); // Thực hiện click vào nhiệm vụ chưa hoàn thành
                foundIncompleteTask = true;
                break;
            }
        }
        return foundIncompleteTask;
    }

    function clickContinueButton() {
        const continueButton = document.querySelector('.DailyLogin_login__button__15aOK');
        if (continueButton) {
            console.log('Nút "Tiếp tục" được tìm thấy, đang click...');
            continueButton.click(); // Thực hiện click vào nút "Tiếp tục"
            return true;
        } else {
            console.log('Không tìm thấy nút "Tiếp tục".');
            return false;
        }
    }

    window.addEventListener('load', function() {
        if (document.readyState === 'complete') {
            // Thực hiện hàm click
            let clicked = false;
            const interval = setInterval(() => {
                clicked = clickTaskTab();
                if (clicked) {
                    clearInterval(interval);
                    const taskInterval = setInterval(() => {
                        const found = clickIncompleteTask();
                        if (!found) {
                            clearInterval(taskInterval);
                            console.log('Không tìm thấy nhiệm vụ chưa hoàn thành nào nữa.');
                        }
                    }, 1000);
                }
            }, 1000);

            const continueInterval = setInterval(() => {
                const clickedContinue = clickContinueButton();
                if (clickedContinue) {
                    clearInterval(continueInterval);
                }
            }, 1000);
        }
    });

} catch (e) {
    console.log(e);
}