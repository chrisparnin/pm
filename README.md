pm
==

Prospective memory helps us remember to perform an action in the future.  We often use physical locations and cues, 
to remember daily activities like taking pills, or walk the dog.  In digital spaces, there is often no equivalent device.

![Alt](https://raw.github.com/chrisparnin/pm/master/img/github.png)

`PM` is a chrome extension that allows reminders to be contextually placed in a browser location.  
You could use a reminder to send a message to someone in gmail, make notes on a web app you are developing, 
github project page, or leave "guilty" notes in places we go when not working (reddit, hacker news, etc).

![Alt](https://raw.github.com/chrisparnin/pm/master/img/twitter.png)

The reminder messages are stored online with the following services, meaning you can access from all your devices:

- [Remember the milk](http://www.rememberthemilk.com/)
- ...
- [Create an issue to request new service intergration](https://github.com/chrisparnin/pm/issues)

A future feature will support providing an instance id, so you add more context: `work`, `study computer`, `laptop`, etc.

### Attaching a reminder

Just click the "PM" icon or hit "Ctrl+M" or "Command+M", type a reminder, and attach it to the page.

![Alt](https://raw.github.com/chrisparnin/pm/master/img/addreminder.png)

### Installing

I have not released this to the chrome app store at the moment.

#### To install from packed extension.

* Right click [packed chrome extension](https://github.com/chrisparnin/pm/blob/master/release/pm.crx?raw=true) and Save link as. 
* In chrome, type in url: `chrome://extensions/` or click Tools > Extensions
* Locate file on disk and drag file onto extensions page.
* Confirm install

#### To install from source:

- [Download](https://github.com/chrisparnin/pm/archive/master.zip) and unzip
- In chrome, visit: `chrome://extensions/`. 
- Check `developer mode`.  
- Click load unpacked extension and visit directory of unzipped file.
- Should be installed!  Follow instructions on setting up authenication with service.
