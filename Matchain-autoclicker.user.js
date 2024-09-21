    // ==UserScript==
    // @name         Matchain Autoclicker TienBV
    // @version      1.1
    // @namespace    Violentmonkey Scripts
    // @author       TienBV
    // @match        https://tgapp.matchain.io/*
    // @grant        none
    // @icon         https://github.com/tienbui321/violentnst/raw/main/blum.png
    // @updateURL    https://github.com/tienbui321/violentnst/raw/main/Matchain-autoclicker.user.js
    // @downloadURL  https://github.com/tienbui321/violentnst/raw/main/Matchain-autoclicker.user.js
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
            await sleep(1500);
            await _doClaim();

            _$("#root .bar___hi4Iz li:nth-child(2)").click();
            taskButton.textContent = "Doing";

            await sleep(getClickDelay())
            await _doShortTasks();

            await sleep(getClickDelay(1000));
            // await process_play_game();
        }

        async function _doClaim() {
            let claimBtn = document.querySelector(".btn_claim___AC3ka:not(.farming____9oEZ)");
            if (claimBtn) {
                claimBtn.click();
            }

            let i = 0;
            while (i < 5) {
                let startClaimBtn = document.querySelector(".btn_claim___AC3ka.farming____9oEZ");
                if (startClaimBtn) {
                    startClaimBtn.click();
                    break
                }

                await sleep(getClickDelay());
                i++;
            }
        }

        async function _doShortTasks() {
            let taskList = _$('.task___yvZDU ul.container_tasks___kxjkI li');
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
            let startBtn = taskItem.querySelector('.btn___xz27R');
            if (hasClass(startBtn, "completed___Pa6Yg"))
                return;

            if (hasClass(startBtn, "claim___VQBtK"))
                return startBtn.click();

            await sleep(500);

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

        // Game Play

        async function start_game(success) {
            let url = "https://tgapp-api.matchain.io/api/tgapp/v1/game/play";

            let response = await fetch(url, {
                method: "GET"
            });

            await success(await response.json());
        }

        async function claim_game(token, game_id, point, proxies = None) {
            let url = "https://tgapp-api.matchain.io/api/tgapp/v1/game/claim";
            let payload = { "game_id": game_id, "point": point };

            let res = await fetch(url, {
                method: "POST",
                data: payload
            });

            console.log(res.json());
        }

        async function process_play_game() {
            start_game(async(game) => {
                try {
                    let game_id = game["data"]["game_id"]
                    let ticket_left = game["data"]["game_count"]
                    if (game_id == "") {
                        return
                    }

                    await sleep(30 * 1000);

                    let point = Math.floor(Math.random() * (150 - 130 + 10) + 5);

                    await claim_game(
                        game_id = game_id, point = point
                    )

                    if (ticket_left == 0)
                        return

                    await sleep(getClickDelay(1000));
                    await process_play_game();
                } catch {

                }
            });
        }

        matchain_doTask();

    } catch (e) {
        console.log(e);
    }