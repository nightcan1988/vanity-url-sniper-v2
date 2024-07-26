"use strict";



const tls = require("tls");

const WebSocket = require("ws");

const extractJsonFromString = require("extract-json-from-string");



const tlsSocket = tls.connect({

    host: "canary.discord.com",

    port: 443,

	rejectUnauthorized: false,

});



let vanity;

const guilds = {};

const discordToken = "MTI2MzE2ODI0MjY0MjQ1Njc0Ng.GgasaP.E0jeD3Zkr_FCfeW-FX8v2ISxZeBtbL4ZsQlStc";

const guildId = "1263465507840069693";

const channelId = "1265446036122501252";



tlsSocket.on("data", async (data) => {

    const ext = await extractJsonFromString(data.toString());

    const find = ext.find((e) => e.code) || ext.find((e) => e.message);

	

    if (find) {

        console.log(find);

        const requestBody = JSON.stringify({

            content: `@everyone ${vanity}\n\`\`\`json\n${JSON.stringify(find)}\`\`\``,

        });

		

        const contentLength = Buffer.byteLength(requestBody);

        const requestHeader = [

            `POST /api/v7/channels/${channelId }/messages HTTP/1.2`,

            "Host: canary.discord.com",

            `Authorization: ${discordToken}`,

            "Content-Type: application/json",

            `Content-Length: ${contentLength}`,

            "",

            "",

        ].join("\r\n");

        const request = requestHeader + requestBody;

        tlsSocket.write(request);

    }

});





tlsSocket.on("error", (error) => {

    console.log(`tls error`, error);

    process.exit();

});



tlsSocket.on("end", () => {

    console.log("tls connection closed");

    process.exit();

});



tlsSocket.on("secureConnect", () => {

    const websocket = new WebSocket("wss://gateway.discord.gg/");



    websocket.onclose = (event) => {

        console.log(`ws connection closed ${event.reason} ${event.code}`);

        process.exit();

    };



    websocket.onmessage = async (message) => {

        const { d, op, t } = JSON.parse(message.data);



        if (t === "GUILD_UPDATE") {

            const find = gu ilds[d.guild_id];

            if (find && find !== d.vanity_url_code) {

                const requestBody = JSON.stringify({ code: find });

                const requestHeader = [

                    `PATCH /api/v7/guilds/${guildId}/vanity-url HTTP/1.2`,

                    `Host: canary.discord.com`,

                    `Authorization: ${discordToken}`,

                    `Content-Type: application/json`,

                    `Content-Length: ${requestBody.length}`,

                    "",

                    "",

                ].join("\r\n");

                const request = requestHeader + requestBody;

                tlsSocket.write(request);

                vanity = `**guild** ${find}`;

            }

        } else if (t === "READY") {

            d.guilds.forEach((guild) => {

                if (guild.vanity_url_code) {

                    guilds[guild.id] = guild.vanity_url_code;

                } else {

                    console.log(guild.name);

                    
        }

            });

            console.log(guilds);

        }



        if (op === 10) {

            websocket.send(JSON.stringify({

                op: 2,

                d: {

                    token: discordToken,

                    intents: 513 << 0,

                    properties: {

                        os: "Linux",

                        browser: "Firefox",

                        device: "Firefox",

                    },

                },

            }));

            setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);

        } else if (op === 7) {

            process.exit();

        }

    };



    setInterval(() => {

        tlsSocket.write("GET / HTTP/1.2\r\nHost: canary.discord.com\r\n\r\n");

    }, 400);

});

 

         


