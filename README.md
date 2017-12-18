[![FaktNews](public/images/logo-header.png "Logo")](http://faktnews.org)

For Aston University's 2017 Hackathon we <a href="https://devpost.com/software/faktnews">submitted</a> a browser extension called <a href="http://faktnews.org/">FaktNews</a>.

FaktNews grades the trustworthiness of the website you're currently viewing. For each website you visit, we average [Majestic's](https://majestic.com) trustworthiness value, our own measure, and the community's vote to give you an overall grade.

![Example](public/images/devmode.png "Example data")

## Support

We currently support any browser that uses the [WebExtensions API](https://browserext.github.io). This includes Chrome, Firefox, and Edge among others. Internet Explorer does **not** have support, and we do not plan to add it. Ensure your browser is up-to-date, as there are many known issues with older builds.


#### Chrome

To install on Chrome do the following:
1. Go to `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked extension...`
4. Navigate to the `Extension` folder, and click `Open` on the folder


#### Firefox

To install on FireFox do the following:
1. Go to `about:debugging`
2. Tick `Enable add-on debugging`
3. Click `Load Temporary Add-on`
4. Navigate to the `Extension` folder, and click `Open` on any item inside the folder


#### Opera

To install on Opera do the following:
1. Press `Ctrl-Shift-E` or naviagte to: `Menu > Extensions > Extensions`
2. Click `Developer Mode`
3. Click `Load unpacked extension...`
4. Navigate to the `Extension` folder, and click `OK` on the folder


#### Edge

While our extension is compatible with Edge, you have to publish it to the Windows Store which we are not going to do.


## Libraries used

### Backend

- [Nodejs](https://nodejs.org/en/about/)
