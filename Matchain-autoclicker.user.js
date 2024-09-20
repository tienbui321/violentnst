// ==UserScript==
// @name         Matchain Autoclicker TienBV
// @version      1.0
// @namespace    Violentmonkey Scripts
// @author       TienBV
// @match        https://tgapp.matchain.io/*
// @grant        none
// @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
// @updateURL    
// @downloadURL  
// @homepage     https://github.com/tienbui321/violentnst/raw/main/blum.png
// ==/UserScript==

try {
    const taskButton = document.createElement('button');
    taskButton.textContent = 'Do Task';
    taskButton.id = 'taskAutoButton';
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
    taskButton.onclick = matchain_doTask;
    document.body.appendChild(taskButton);

    async function matchain_doTask() {
        _$("#root .bar___hi4Iz li:nth-child(2)").click();
        taskButton.textContent = "Doing";
        await sleep(getClickDelay())
        await _doShortTasks();
    }

    async function _doShortTasks() {
        let taskList = _$('.task___yvZDU ul.container_tasks___kxjkI li');
        if (!taskList || taskList.length === 0)
            return;

        for (var i = 0; i < taskList.length; i++) {
            let task = taskList[i];
            await sleep(500);
            await resolveTask(task);
        }

        taskButton.textContent = "Done";
    }

    async function resolveTask(taskItem) {
        let startBtn = taskItem.querySelector('.btn___xz27R');
        if (hasClass(startBtn, "completed___Pa6Yg"))
            return;

        if (hasClass(startBtn, "claim___VQBtK"))
            return startBtn.click();

        startBtn.click();

        let i = 0;
        while (i < 5) {
            let claimBtn = document.querySelector('.btn___xz27R.claim___VQBtK');
            if (claimBtn) {
                claimBtn.click();
                break;
            }
            await sleep(getClickDelay());
            i++;
        }
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

    taskButton.click();

    let gameCount = 1;
    let gameId = 0;

    function playGames() {

    }

    function getPlay() {
        if (gameCount == 0)
            return;

        fetch('https://tgapp-api.matchain.io/api/tgapp/v1/game/play', {
            method: "GET"
        }).then((response) => playTheGame(response.json()))
    }

    function playTheGame(game) {
        if (game.code != 200)
            return;
        gameCount = game.data.game_count;
        gameId = game.data.game_id;

        await sleep(4000);
        claimGame();
    }

    function claimGame() {
        fetch('https://tgapp-api.matchain.io/api/tgapp/v1/game/claim', {
            game_id: gameId,
            point: getScore()
        })
    }

    function getScore() {
        return Math.floor(Math.random() * (150 - 100) + 12);
    }
} catch (e) {
    console.log(e);
}