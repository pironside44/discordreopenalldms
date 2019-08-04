var fs = require('fs');
var path = require('path');
let channeljsonpaths = []; // leave empty

// --- CONFIG ---
let authorizationtoken = 'mfa.longrandomstringherethatyougetfromdevtoolsinspection'; // where the authtoken starts with mfa.longstringhere. You can get this by opening devtools and looking for the request header "Authorization" when making discord requests
let datapackagemessagefolder = 'D:\\discordDataPackage7-29-19\\messages'; // the location to the messages folder that is found in a discord data package export
let myDiscordid = '000000000000000000'; // put your own discordID here. you can get this by right clicking your name on discord and clicking "Copy ID". if you dont see the "Copy ID" option enable "Developer Mode" on discord.
// --- CONFIG ---

(async ()=>{
    traverseDataPackage(datapackagemessagefolder); // get all folders for each message
    let alldmids = getrecipients(channeljsonpaths, myDiscordid); // go through each folders json to get each DM users id

    let openDMrequest = await getcurrentopendms(authorizationtoken); // get currently openedDMs
    let openDMresponsejson = JSON.parse(openDMrequest);
    let opendmids = [];
    for (var i = 0; i < openDMresponsejson.length; i++){
        if (openDMresponsejson[i].type == 1) // make sure its a DM, not a group chat, since DM's are type 1
        {
            try {
                opendmids.push(openDMresponsejson[i].recipients[0].id)
            } catch (error) {
                console.log(error);
            }
        }
    }

    console.log(alldmids.length + ' dm recipients from discord data package (DMs only, not including group chats).');
    console.log(opendmids.length + ' current open dms. (DMs only, not including group chats)');

    for (var i = 0; i < alldmids.length; i++){
        if (opendmids.includes(alldmids[i]))
        {
            console.log("DM already opened with: " + alldmids[i]);
        }
        else
        {
            console.log("Found closed dm: " + alldmids[i] + ', opening...');
            reopendm(authorizationtoken, alldmids[i]);
            await delay(1000); // delay so we dont get API limited
        }
    }
})();

// ex usage: traverseDataPackage('D:\\discord-data-package\\messages')
function traverseDataPackage(packagepath)
{
    let files = fs.readdirSync(packagepath);
    files.forEach(function (file, index) {
        var currpath = path.join(packagepath, file);
        let filestat = fs.statSync(currpath);
        if (filestat.isFile())
        {
            if (currpath.includes("channel.json"))
            {
                channeljsonpaths.push(currpath);
            }
        }
        else if (filestat.isDirectory())
        {
            traverseDataPackage(currpath);
        } 
    });
}

// ex usage:  getrecipients(channeljsonpaths, '000000000000000000')
function getrecipients(channeljsonpaths, mydiscordID)
{
    let recipientsids = [];
    for (var i = 0; i < channeljsonpaths.length; i++){
        var data = fs.readFileSync(channeljsonpaths[i]);
        let channeljson = JSON.parse(data);
        // when channeljson.type == 1 then its a DM, since we don't want groupchats, etc
        if (channeljson.type == 1)
        {
            channeljson.recipients.forEach(function(value){
                if (value != mydiscordID) // remove your own id from the recipients (since DM's include both recipients ID's)
                {
                    recipientsids.push(value);
                }
            });
        }
    }
    return recipientsids;
}

// this isnt necessary, since opening a DM with an already opened user isn't an issue, but in this case, we will do this so we don't send requests for DM's already opened
// ex usage: getcurrentopendms('authtoken here')    where the authtoken starts with mfa.longstringhere. You can get this by opening devtools and looking for the request header "Authorization" when making discord requests
async function getcurrentopendms(authorizationtoken)
{
    return new Promise(function (resolve, reject) {
        const request = require('request');
        request({
            method: 'get',
            url: 'https://discordapp.com/api/users/@me/channels',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationtoken
            }
        }, (err, resp, body) => {
            if (err)
            {
                console.log(err);
            }
            return resolve(body);
        })
        .on('error', function (e) {
            console.log(e);
        })
        .on('timeout', function(e) {
            console.log(e);
        })
        .on('uncaughtException', function(e) {
            console.log(e);
        });
    });
}

// ex uage: opendm("mfa.longstringherethatyougetfromdevtoolsetc", "000000000000000000");
function reopendm(authorizationtoken, userid)
{
    const request = require('request');

    var options = { method: 'POST',
    url: 'https://discordapp.com/api/users/@me/channels',
    headers: 
     { 'cache-control': 'no-cache',
       Host: 'discordapp.com',
       'Cache-Control': 'no-cache',
       Accept: '*/*',
       Authorization: authorizationtoken,
       'Content-Type': 'application/json' },
    body: { recipients: [ userid ] },
    json: true };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
