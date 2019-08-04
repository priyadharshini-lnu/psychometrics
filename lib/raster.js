//
// Takes a screenshot of the given URL, uses named arguments passed in like so: phantomjs raster.js arg=value arg2=value2
//
// Arguments:
// - url                      - URL to screenshot
// - output                   - page to output (e.g. /tmp/output.png)
// - width         [optional] - default 1024 - viewport width
// - height        [optional] - viewport height (see note below on using height)
// - debug         [optional] - default false - whether to do some extra debugging
// - div           [optional] - a selector to use to screenshot to a specific element
// - resourceWait  [optional] - default 300 - the time to wait after the last resource has loaded in MS before taking the screenshot
// - maxRenderWait [optional] - default 10000 - the maximum time to wait before taking the screenshot, regardless of whether resources are waiting to be loaded
// - cutoffWait    [optional] - default null - the maximum time to wait before cutting everything off and failing...this helps if there is a page taking a long time to load
// - top, left, width, height [optional] - dimensions to use to screenshot a specific area of the screen
// - auth          [optional] - Basic auth (ie. 'username:password') option if required by URL
//
// == Important notice when providing height ==
//
// If you provide a height then we resize the html & body tags otherwise render() renders the entire page
// changing the viewport height does not affect this behaviour of render(), see https://github.com/ariya/phantomjs/issues/10619
//
const puppeteer = require('puppeteer');
const PDF_PAGE_HEIGHT_OVERFLOW_MARGIN = 2;
//
// Functions
//
function pickupNamedArguments() {
    var pair, scriptArgs, args = {};

    scriptArgs = process.argv.slice(2);
    scriptArgs.forEach(function(arg, i) {
        pair = arg.split(/=(.*)/);
        args[pair[0]] = pair[1];
    });
    if(!args.width)        { args.width = 1024; }
    if(!args.pageWidth)    { args.pageWidth = 850; }
    if(!args.pageHeight)   { args.pageHeight = 1100; }
    if(!args.totalTimeout) { args.totalTimeout = 200000; }
    if(args.url)           { args.url = decodeURIComponent(args.url); }
    if(args.auth)          {
      pair = args.auth.split(/:/);
      args.credentials = pair.length === 2 ? {
          username: pair[0],
          password: pair[1]
      } : null;
    }
    return args;
}
async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
(async () => {
    let browser;
    try {
        const args = pickupNamedArguments();
        browser = await puppeteer.launch({ headless:true, args:[
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--hide-scrollbars',
            '--disable-web-security'
        ]});
        const page = await browser.newPage();
        await page.emulateMedia('screen');
        await page.authenticate(args.credentials || null)
        await page.goto(args.url, {
            timeout: args.totalTimeout
        });
        await wait(200);
        page.evaluate(() => {
            window.dispatchEvent(new Event('resize'));
        });
        await wait(200);
        try {
            await page.pdf({
                path: args.output,
                width: `${parseInt(args.pageWidth,10)*0.254}mm`,
                height: `${(parseInt(args.pageHeight,10) + PDF_PAGE_HEIGHT_OVERFLOW_MARGIN)*0.254}mm`,
                printBackground: true
            });
            browser.close();
        } catch(e) {
            browser.close();
            console.error(e);
        }
    } catch (e) {
        if(browser) {
            browser.close();
        }
        console.error(e);
    }
})();