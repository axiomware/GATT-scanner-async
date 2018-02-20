// Copyright 2017,2018 Axiomware Systems Inc. 
//
// Licensed under the MIT license <LICENSE-MIT or 
// http://opensource.org/licenses/MIT>. This file may not be copied, 
// modified, or distributed except according to those terms.
//

//Add external modules dependencies
var netrunr = require('netrunr-gapi-async');
var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
var Preferences = require("preferences");
var CLI = require('clui');

//Gobal variables
const gapiAsync = new netrunr('');                      //Create at Netrunr gateway instance(one per gateway)
var prefs = new Preferences('myAdvApp_uniqueID123');    //Preferences are stored in system file
var advDeviceList = {};                                 //collect all devices that advertise over a period
var exitFlag = false;                                   //set flag when exiting
var statusList = new CLI.Spinner('Scanning ...');       //UI widget to show busy operation

//User configuration
var userConfig = {           
    'scanPeriod': 1,    // seconds of advertising scan
    'scanMode': 1,      // 1-> active, 0-> passive
    'interval_min': 16, // x1.25ms - Connection intervalk min
    'interval_max': 100,// x1.25ms - Connection interval max
    'latency': 0,       // Salve latency
    'timeout': 200,     // x10ms - Supoervios timout
};

//Used to monitor for ctrl-c and exit program
process.stdin.resume();//so the program will not close instantly
process.on("SIGINT", function () {
    axShutdown(3, "Received Ctrl-C - shutting down.. please wait");
});

//On exit handler
process.on('exit', function () {
    console.log('Goodbye!');
});

// Ensure any unhandled promise rejections get logged.
process.on('unhandledRejection', err => {
    axShutdown(3, "Unhandled promise rejection - shutting down.. " + + JSON.stringify(err, Object.getOwnPropertyNames(err)));
})

//Application start
console.log(chalk.green.bold(figlet.textSync('NETRUNR GATEWAY', { horizontalLayout: 'default' })));
console.log(chalk.green.bold('GATT Table Scanner (Async version)'));
console.log(chalk.red.bold('Press Ctrl-C to exit'));
main(); // Call main function


/**
 * Main program entry point
 * Using Command Line Interface (CLI), get user credentails
 * 
 */
async function main() {
    try {
        let cred = await axmUIgetAxiomwareCredentials();                        //get user credentials (CLI)
        let ret = await gapiAsync.login({ 'user': cred.user, 'pwd': cred.pwd });//login
        let gwid = await axmUIgetGatewaySelection(ret.gwid);                    //get gateway Selection (CLI)
        if (!gwid)
            await axShutdown(3, 'No Gateways Selected! Shutting down...');                            //Exit program 

        gapiAsync.config({ 'gwid': gwid });                                     //select gateway (CLI)
        await gapiAsync.open({});                                               //open connection to gateway
        gapiAsync.event({ 'did': '*' }, myGatewayEventHandler, null);           //Attach event handlers
        gapiAsync.report({ 'did': '*' }, myGatewayReportHandler, null);         //Attach report handlers

        let ver = await gapiAsync.version(5000);                              //Check gateway version - if gateway is not online(err), exit 
        
        let scanParams = await axmUIgetScanPeriodType();                        //get scan parameters
        userConfig.scanPeriod = scanParams.period;                        //store var in global for other function calls 
        userConfig.scanMode = scanParams.active;                          //store var in global for other function calls 
        await axScanForBLEdev(userConfig.scanMode, userConfig.scanPeriod );//scan for BLE devices
    } catch (err) {
        await axShutdown(3, 'Error! Exiting... ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));//Error - exit
    }
}

/**
 * Scan for BLE devices and generate "scan complete" event at the end of scan
 * 
 * @param {number} scanMode - Scan mode  1-> active, 0-> passive
 * @param {number} scanPeriod - Scan period in seconds
 */
async function axScanForBLEdev(scanMode, scanPeriod) {
    statusList.start();
    statusList.message('Scanning ...');
    advDeviceList = {};//Clear list
    try {
        let ret = await gapiAsync.list({ 'active': scanMode, 'period': scanPeriod });
    } catch (err) {
        console.log('List failed' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
};


/**
 * Connect to selected device and read list of services/characteristics
 * 
 * @param {string} did -  BLE device ID
 * @param {number} dType - Advertisement type
 * @param {string} name - Device name (or null)
 */
async function axConnectToBLEdevice(did, dType, name) {
    var iobjc = {
        'did': did,
        'dtype': dType,                                 /*1-> random, 0-> public*/
        'interval_min': userConfig.interval_min,  /* x1.25ms */
        'interval_max': userConfig.interval_max,  /* x1.25ms */
        'latency': userConfig.latency,
        'timeout': userConfig.timeout             /* x10ms */
    };

    var GATTlist = { 'did': did, 'dt': dType, 'name': name };//Data structure to collect GATT data
    var statusScan = new CLI.Spinner('Connecting ...'); //Show user spinning widget
    statusScan.start();
    try {
        let devBLE = await gapiAsync.connect(iobjc);//Connect to device
        statusScan.message('Connected! Scanning for services ...')
        let srvList = await gapiAsync.services({ 'did': did, 'primary': 1 });//Get serice list
        GATTlist['services'] = srvList.services;
        for (let i = 0; i < GATTlist.services.length; i++) {
            statusScan.message('Connected! Found ' + GATTlist.services.length + ' services. Scanning service[' + (i + 1) + '] ...')
            let charList = await gapiAsync.characteristics({ 'did': did, 'sh': GATTlist.services[i].handle, 'eh': GATTlist.services[i].end });
            GATTlist.services[i]['characteristics'] = charList.characteristics;
        }
        statusScan.stop();
        console.log('\nGATTtable: ' + JSON.stringify(GATTlist, null, 3) + '\n');
        await axShutdown(3, 'Finished Scan! Shutting down.. please wait ');
    } catch (err) {
        console.log('BLE Error' + JSON.stringify(err));
    }
}

/**
 * Event handler (for scan complete, disconnection, etc events)
 * 
 * @param {Object} iobj - Event handler object - see API docs
 */
async function myGatewayEventHandler(iobj) {
    switch (iobj.event) {
        case 1: //disconnect event
            console.log('Device disconnect event' + JSON.stringify(iobj, null, 0));
            break;
        case 39://Scan complete event
            statusList.stop();
            if (!exitFlag) {//Do not process events when in exit mode
                let dev = await axmUIgetAdvBLEdevice();
                if (dev.type == 2)
                    await axShutdown(3, 'Shutting down.. please wait ');
                else if (dev.type == 1)
                    await axScanForBLEdev(userConfig.scanMode, userConfig.scanPeriod);
                else
                    await axConnectToBLEdevice(dev.did, dev.dtype, dev.name);
            }
            break;
        default:
            console.log('Other unhandled event [' + iobj.event + ']');
    }
}

/**
 * Report handler (for advertisement data, notification and indication events)
 * 
 * @param {Object} iobj - Report handler object - see API docs 
 */
function myGatewayReportHandler(iobj) {
    switch (iobj.report) {
        case 1://adv report
            var advPrnArray = axParseAdv(iobj.nodes);
            axUpdateAdvNodeList(advPrnArray);
            statusList.message('Scanning ...  Found ' + Object.keys(advDeviceList).length + ' Devices');
            break;
        case 27://Notification report
            console.log('Notification received: ' + JSON.stringify(iobj, null, 0))
            break;
        default:
            console.log('(Other report) ' + JSON.stringify(iobj, null, 0))
    }
}

/**
 * Call this function to gracefully shutdown all connections
 * 
 * @param {number} retryCount - Number of retry attempts 
 * @param {string} prnStr - String to print before exit  
 */
async function axShutdown(retryCount, prnStr) {
    console.log(prnStr);
    exitFlag = true;
    let statusExit = new CLI.Spinner('Exiting ...');
    statusExit.start();
    if (gapiAsync.isOpen) {//stop scanning
        if (gapiAsync.isGWlive) {//only if gw is alive
            try {
                let ret = await gapiAsync.list({ 'active': userConfig.scanMode, 'period': 0 });//stop scan
                let cdev = await gapiAsync.show({});
                if (cdev.nodes.length > 0) {
                    await gapiAsync.disconnect({ did: '*' });
                }
            } catch (err) {
                console.log("Error: " + JSON.stringify(err));
                if (retryCount > 0)
                    setTimeout(async () => { await axShutdown(retryCount--, retryCount + ' Shutdown...') }, 100);
            }
        }
        await gapiAsync.close({});
    }
    if (gapiAsync.isLogin) {
        await gapiAsync.logout({});//logout
    }
    statusExit.stop();
    process.exit()
};


/**
 * Get user credentails from command line interface (CLI)
 * 
 * @returns {Object} username and password
 */
async function axmUIgetAxiomwareCredentials() {
    var questions = [
        {
            name: 'user',
            type: 'input',
            message: 'Enter your Axiomware account username(e-mail):',
            default: () => { return prefs.user ? prefs.user : null; },//Use previously stored username
            validate: (email) => { return validateEmail(email) ? true : 'Please enter valid e-mail address'; }
        },
        {
            name: 'pwd',
            type: 'password',
            message: 'Enter your password:',
            default: () => { return prefs.pwd ? prefs.pwd : null; },//Use previously stored password(see comment below)
            validate: (value) => { return (value.length > 0) ? true : 'Please enter your password'; }
        }
    ];

    let answer = await inquirer.prompt(questions);
    prefs.user = answer.user;
    //prefs.pwd = answer.pwd; //Don't store password for security reasons. Enable this during development for convenience
    return { user: answer.user, pwd: answer.pwd };
}

/**
 * Get user choice of gateway selection (CLI)
 * 
 * @param {string []} gwidList - List of gateways
 * @returns {string} selected gateway
 */
async function axmUIgetGatewaySelection(gwidList) {
    var choice_ext = gwidList;//gwidList;
    choice_ext.push('Exit');
    var questions = [
        {
            type: 'list',
            name: 'gwid',
            message: 'Login success! Select the Netrunr gateway for connection:',
            choices: choice_ext,
        }
    ];
    let answers = await inquirer.prompt(questions);
    if (answers.gwid == 'Exit')
        return null;
    else
        return answers.gwid;
}

 
/**
 * get user choice of scan type period (CLI)
 * 
 * @returns {Object} type and scan period in seconds 
 */
async function axmUIgetScanPeriodType() {
    var questions = [
        {
            name: 'type',
            type: 'list',
            message: 'Connection open success! Enter scan type:',
            choices: [{ name: 'Active', value: 1 }, { name: 'Passive', value: 0 }]
        },
        {
            name: 'period',
            type: 'input',
            message: 'Enter scan period (seconds):',
            default: 5,
            validate: (value) => { return ((parseInt(value) != NaN) && (parseInt(value) >= 0)) ? true : 'Please enter scan period in seconds'; },
        }
    ];

    let answers = await inquirer.prompt(questions);
    return { 'active': answers.type, 'period': parseInt(answers.period) }
}

/**
 * get user choice of BLE device to connect and read GATT table (CLI)
 * 
 * @returns {Object} Device address, Address type and Name (null if not present)
 */
async function axmUIgetAdvBLEdevice() {
    var N = Object.keys(advDeviceList).length;
    var choiceList = [];
    var i = 0;

    for (var key in advDeviceList) {
        if (advDeviceList.hasOwnProperty(key)) {
            choiceList[i] = {
                name: (i + 1).toString() + ') [' + addrDisplaySwapEndianness(advDeviceList[key].did) + '] ' + advDeviceList[key].rssi + 'dBm ' + advDeviceList[key].name,
                value: { type: 0, did: advDeviceList[key].did, dtype: advDeviceList[key].dt, name: advDeviceList[key].name }
            }
            i++;
        }
    }
    choiceList.push(new inquirer.Separator());
    choiceList.push({ name: 'Scan again', value: { type: 1 } });
    choiceList.push({ name: 'Exit', value: { type: 2 } });

    var question = [
        {
            name: 'device',
            type: 'list',
            message: 'Found ' + Object.keys(advDeviceList).length + ' Device(s). Select Device to connect',
            choices: choiceList,
            paginated: true,
            pageSize: 30
        },
    ];

    let answer = await inquirer.prompt(question);
    if (answer.device.type == 2)
        return { type: 2 };//exit
    else if (answer.device.type == 1)
        return { type: 1 };//rescan
    else
        return { type: 0, did: answer.device.did, dtype: answer.device.dtype, name: answer.device.name };//connect to device
}

// Utitlity Functions

/**
 * Format adv packets to print using console.log
 * 
 * @param {Object[]} advArray - Array of advertsisement objects from report callback
 */
function axPrintAdvArray(advArray) {
    for (var i = 0; i < advArray.length; i++) {
        console.log(JSON.stringify(advArray[i], null, 0));
    }
}

/**
 * Parse advertisement packets
 * 
 * @param {Object[]} advArray - Array of advertsisement objects from report callback
 * @returns 
 */
function axParseAdv(advArray) {
    var advArrayMap = advArray.map(axAdvExtractData);//Extract data
    var advArrayFilter = advArrayMap.filter(axAdvMatchAll);//Filter adv
    return advArrayFilter;
}

/**
 * Function to extract advertisement data
 * 
 * @param {Object} advItem - Single advertisement object
 * @returns {Object} advObj - Single parsed advertisement data object
 */
function axAdvExtractData(advItem) {
    advObj = {
        ts: dateTime(advItem.tss + 1e-6 * advItem.tsus),    //Time stamp
        //did: addrDisplaySwapEndianness(advItem.did),      //BLE address
        did: advItem.did,                                   //BLE address - only raw address can be used by API
        dt: advItem.dtype,                                  // Adress type
        ev: advItem.ev,                                     //adv packet type
        rssi: advItem.rssi,                                 //adv packet RSSI in dBm
        adv: advItem.adv.length,                            //payload length of adv packet
        rsp: advItem.rsp.length,                            //payload length of rsp packet
        name: axParseAdvGetName(advItem.adv, advItem.rsp),  //BLE device name
        //adv1: JSON.stringify(advItem.adv, null, 0),       //payload of adv packet
        //rsp1: JSON.stringify(advItem.rsp, null, 0),       //payload of rsp packet
    };
    return advObj;
}

/**
 * Function to match all devices(dummy)
 * 
 * @param {any} advItem 
 * @returns {boolean} - true if advertsiment has to be retained
 */
function axAdvMatchAll(advItem) {
    return (true);
}


/**
 * Function to match TI sensorTag, see http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User%27s_Guide
 * 
 * @param {any} advItem 
 * @returns {boolean} - true if advertsiment has to be retained
 */
function axAdvMatchSensorTag(advItem) {
    return (advItem.name == "CC2650 SensorTag");
}


/**
 * Get device name from advertisement packet
 * 
 * @param {Object} adv - Advertisement payload
 * @param {Object} rsp - Scan response payload
 * @returns {string} - Name of the device or null if not present
 */
function axParseAdvGetName(adv, rsp) {
    var didName = '';
    for (var i = 0; i < adv.length; i++) {
        if ((adv[i].t == 8) || (adv[i].t == 9)) {
            didName = adv[i].v;
            return didName;
        }
    }
    for (var i = 0; i < rsp.length; i++) {
        if ((rsp[i].t == 8) || (rsp[i].t == 9)) {
            didName = rsp[i].v;
            return didName;
        }
    }
    return didName;
}

/**
 * Add ADV data to gloabl list
 * 
 * @param {Object[]} advArray - Array of advertsisement objects from report callback
 */
function axUpdateAdvNodeList(advArray) {
    for (var i = 0; i < advArray.length; i++) {
        advDeviceList[advArray[i].did] = advArray[i];
    }
}

/**
 * Convert unix seconds to time string - local time (yyyy-mm-ddThh:mm:ss.sss).
 * 
 * @param {Number} s - Number is Unix time format
 * @returns {string} - in local time format
 */
function dateTime(s) {
    var d = new Date(s*1000);
    var localISOTime = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, -1);
    return localISOTime;
}

/**
 * Validate email
 * 
 * @param {string} email - string in valid email format
 * @returns boolean - true if valid email address based on RegEx match
 */
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Swap endianness of a hex-string 
 * 
 * @param {string} hexStr - Hex string(make sure length is even)
 * @returns {string} 
 */
function swapEndianness(hexStr) {
    if (hexStr.length > 2)
        return hexStr.replace(/^(.(..)*)$/, "0$1").match(/../g).reverse().join("");
    else
        return hexStr
}

/**
 * Swap endianness of a hex-string. Format it to standard BLE address style
 * 
 * @param {string} hexStr - Hex string(make sure length is even) 
 * @returns {string}
 */
function addrDisplaySwapEndianness(hexStr) {
    if (hexStr.length > 2)
        return hexStr.replace(/^(.(..)*)$/, "0$1").match(/../g).reverse().join(":").toUpperCase();
    else
        return hexStr
}
