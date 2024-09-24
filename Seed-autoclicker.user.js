﻿    // ==UserScript==
    // @name         Seed Autoclicker TienBV
    // @version      1.0
    // @namespace    Violentmonkey Scripts
    // @author       TienBV
    // @match        https://cf.seeddao.org/*
    // @grant        none
    // @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
    // @updateURL    https://github.com/tienbui321/violentnst/raw/main/Seed-autoclicker.user.js
    // @downloadURL  https://github.com/tienbui321/violentnst/raw/main/Seed-autoclicker.user.js
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

        async function _doTask() {
            await sleep(1500);
            taskButton.textContent = "Doing";

            await _doClaim();

            await _doCheckin();

            await _doBoost();

            setTaskDone();
        }

        let contentCss = '#root > div:last-child > div:first-child > div:nth-child(2) ';
        let footerCss = '#root > div:last-child > div:last-child ';

        async function _doClaim() {
            // Check news
            await waitAndClick(contentCss + " > div:last-child button");

            await sleep(1000);

            // 
            let claimBtn = _$(contentCss + "> div:last-child > div > div > div");
            claimBtn && claimBtn.click();

            // catch worm
            let worm = document.querySelector('#root > div:last-child > div:first-child > div:nth-child(2)  > div:nth-child(3) img');
            if (worm) {
                let imgSrc = worm.getAttribute('src');
                if (imgSrc.indexOf('mystery_worm') < 0) {
                    // có sâu
                    worm.click();
                    await sleep(1000);

                    let confirmBtn = await waitAndSelect('.MuiModal-root button');
                    confirmBtn && confirmBtn.click();
                }
            }
        }

        async function _doCheckin() {
            let earnTab = _$(footerCss + " div.grid > div:nth-child(2) > div:nth-child(2)");
            earnTab.click();

            await sleep(1000);

            // Click Start Login checkin
            document.querySelector('#missionToastContainer').parentElement.querySelector("div:nth-child(3) > div:nth-child(2) button").click();
            await sleep(2000);

            // click a day
            await waitAndClick('#root button.btn-hover:not(.pointer-events-none)');

            history.back();
            await sleep(1000);
        }

        async function _doBoost() {
            // Mở tab
            _$("#root > div:nth-child(2) > div:last-child div.grid > div:nth-child(3) .cursor-pointer").click();

            await sleep(getClickDelay(1000))

            let boostItems = _$('#root > div:last-child > div:first-child > div:first-child > div:last-child > div');
            for (let i = 0; i < 2; i++) {
                let boostItem = boostItems[i];
                let level = boostItem.querySelector('.col-span-5 > div:first-child p:last-child').textContent;
                if (level == 'Level 1') {
                    boostItem.click();
                    await sleep(getClickDelay(2000));

                    _$('#root > div:last-child > div:first-child > div:first-child button').click();

                    await sleep(getClickDelay());
                }
            }

            goHome();
        }

        async function _doShortTasks() {
            let taskList = _$('#root > div:last-child > div:first-child > div:first-child > div:nth-child(3) > div:nth-child(4) > div, #root > div:last-child > div:first-child > div:first-child > div:nth-child(3) > div:nth-child(6) > div');
            if (!taskList || taskList.length === 0)
                return;

            for (var i = 0; i < taskList.length; i++) {
                let task = taskList[i];
                await resolveTask(task);
            }

            taskButton.textContent = "Done";
            taskButton.classList.add("task_done");
        }

        async function resolveTask(taskItem) {
            let startBtn = taskItem.querySelector('button');
            startBtn.click();
            await sleep(1000);
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

        async function waitAndSelect(selector) {
            let i = 0;
            while (i < 10) {
                let startClaimBtn = document.querySelector(selector);
                if (startClaimBtn) {
                    return startClaimBtn;
                }

                await sleep(getClickDelay());
                i++;
            }

            return null;
        }

        async function waitAndClick(selector) {
            let i = 0;
            while (i < 3) {
                let startClaimBtn = document.querySelector(selector);
                if (startClaimBtn) {
                    startClaimBtn.click();
                    break
                }

                await sleep(getClickDelay());
                i++;
            }
        }

        function goHome() {
            _$("#root > div:nth-child(2) > div:last-child div.grid > div:nth-child(1) .cursor-pointer").click();
        }

        function setTaskDone() {
            taskButton.textContent = "Done";
            taskButton.classList.add("task_done");
        }

        _doTask();

    } catch (e) {
        console.log(e);
    }