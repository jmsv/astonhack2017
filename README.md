[![FaktNews](public/images/logo-header.svg "Logo")](http://faktnews.org)

For Aston University's 2017 Hackathon we <a href="https://devpost.com/software/faktnews">submitted</a> a browser extension called <a href="http://faktnews.org/">FaktNews</a>. FaktNews grades the trustworthiness of the website you're currently viewing. For each website you visit, we average [Majestic's](https://majestic.com) trustworthiness and citation values, our own measure, and the community's vote to give you an overall grade.

This repository is a refinement of our work: it's ~325% faster, the GUI has been revamped, and has [a website](http://jonmarsh.tech:8083/) where you can run queries outside the extension. Another benefit is that you can run this in parallel with other [Nodejs apps](https://nodejs.org/en/about/) as it only listens to 1 specific port on the server.

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

While the extension is compatible with Edge, it is not going to be implemented as Edge Extensions must be published on the Windows Store.
