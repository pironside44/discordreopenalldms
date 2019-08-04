This script will automatically reopen ALL of your discord DM's. I noticed discord autocloses (without warning) old DM's if you're current open DM's are above a certain threshold (~150 from personal experience). This was made if you've ever accidentally closed a DM, and have no idea who you closed the DM with, or simply want to find all your previously closed DM's.

You need 3 simple things.
1) Your discord data package: https://support.discordapp.com/hc/en-us/articles/360004957991-Your-Discord-Data-Package.
2) Your authorization token (which you can get from devtools and inspecting a single request made to discord when you are logged in. Look for the header named "authorization".
3) Your own discordID,which you can get by right clicking your name on discord and clicking "Copy ID". If you don't see the "Copy ID" option: enable "Developer Mode" on discord.