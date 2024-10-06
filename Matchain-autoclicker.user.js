    // ==UserScript==
    // @name         Matchain Autoclicker TienBV
    // @version      1.8
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
            taskButton.textContent = "Doing";
            await _doClaim();

            await sleep(2000);

            let token = await login();
            await start_game(token);

            //_$("#root .bar___hi4Iz li:nth-child(2)").click();
            // await sleep(getClickDelay())
            // await _doShortTasks();

            setTaskDone();
            // await sleep(getClickDelay(1000));
            // await process_play_game();
        }

        async function _doClaim() {

            await waitAndClick(".btn_claim___AC3ka:not(.farming____9oEZ)");
            await sleep(getClickDelay());

            await waitAndClick(".btn_claim___AC3ka.farming____9oEZ");
            await sleep(getClickDelay());

            // boost game
            if (document.querySelector('#root > div > div > div.content___jvMX0.home___efXf1 > div.container___Joeqw > div.item___aAzf7.right_item___U63Ge').textContent.indexOf('Points (0/1)') > 0) {
                await waitAndClick("#root > div > div > div.content___jvMX0.home___efXf1 > div.container___Joeqw > div.item___aAzf7.item___aAzf7.right_item___U63Ge");
                await sleep(getClickDelay());
                await waitAndClick("#root > div > div.container___tYOO7 > div.content___xItdF > div.btn___FttFE");
                await sleep(getClickDelay());
            }

            // boost point
            await waitAndClick("#root > div > div > div.content___jvMX0.home___efXf1 > div.container___Joeqw > div.item___aAzf7.left_item___po1MT");
            await sleep(getClickDelay());
            await waitAndClick("#root > div > div.container___tYOO7 > div.content___xItdF > div.btn___FttFE");
            await sleep(getClickDelay());
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
            await waitAndClick('.btn___xz27R.claim___VQBtK');
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

        async function login() {
            let userLogin = unescape(window.Telegram.WebApp.initData);
            let userArr = userLogin.split('$')[0].split(',');
            let uId = userArr[0].split(':')[1].replace("'", "");
            let firstName = userArr[1].split(":")[1].replaceAll('"', "");
            let userName = userArr[3].split(":")[1].replaceAll('"', "");
            let loginPayload = {
                "first_name": firstName,
                "last_name": "🌱SEED",
                "tg_login_params": window.Telegram.WebApp.initData,
                "uid": parseInt(uId),
                "username": userName
            };

            let response = await fetch('https://tgapp-api.matchain.io/api/tgapp/v1/user/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginPayload)
            });

            let json = await response.json();
            if (json.code == 200)
                return json.data.token;

            return "";
        }

        async function start_game(token) {
            if (token == "")
                return;

            let url = "https://tgapp-api.matchain.io/api/tgapp/v1/game/play";
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                }
            });

            let play = await response.json();
            if (play.code == 200) {
                let point = Math.floor(Math.random() * (155 - 130) + 130);
                await sleep(30 * 1000);
                await claim_game(token, play.data.game_id, point);

                if (play.data.game_count > 0)
                    await start_game(token)
            }
        }

        async function claim_game(token, game_id, point) {
            let url = "https://tgapp-api.matchain.io/api/tgapp/v1/game/claim";
            let payload = { "game_id": game_id, "point": point };

            let res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                },
                body: JSON.stringify(payload)
            });
        }

        async function waitAndClick(selector) {
            let i = 0;
            while (i < 5) {
                let startClaimBtn = document.querySelector(selector);
                if (startClaimBtn) {
                    startClaimBtn.click();
                    break
                }

                await sleep(getClickDelay());
                i++;
            }
        }

        function setTaskDone() {
            taskButton.textContent = "Done";
            taskButton.classList.add("task_done");
        }

        matchain_doTask();

    } catch (e) {
        console.log(e);
    }