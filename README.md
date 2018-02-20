# GATT-scanner-async
Print out the GATT table of BLE device using [Axiomware's](http://www.axiomware.com) [netrunr-gapi-async](http://www.axiomware.com/apidocs/index.html) Javascript SDK

Program to illustrate Netrunr API functions. The program will perform the following functions: 1) connect to your account, 2) list all gateways associated with this account and use UI to select one of the gateways, 3) connect to the selected gateway, 4) initiate advertisement scan, 5) connect to a user selected BLE device, 6) collect GATT table informtaion and print it to screen in JSON format and 7) disconnect from BLE device and exit.

**This example uses promises and async/await functionality present in Nodejs version 8.+**.

## SDK, Documentation and examples
- [Netrunr B24C API Documentation](http://www.axiomware.com/apidocs/index.html)
- [Netrunr-gapi SDK](https://github.com/axiomware/netrunr-gapi-js)
  - [List of Netrunr-gapi examples](https://github.com/axiomware/list-of-examples-netrunr-gapi)
- [Netrunr-gapi-async SDK](https://github.com/axiomware/netrunr-gapi-async-js)
  - [List of Netrunr-gapi-async examples](https://github.com/axiomware/list-of-examples-netrunr-gapi-async)

## Requirements

- [Netrunr B24C](http://www.axiomware.com/netrunr-b24c-product.html) gateway
- Axiomware cloud account. See the Netrunr [quick start guide](http://www.axiomware.com/page-netrunr-b24c-qs-guide.html) on creating an account.
- Nodejs (see [https://nodejs.org/en/](https://nodejs.org/en/) for download and installation instructions)
  - Nodejs version 8.x.x is required due to the use of promises/async/await
- NPM (Node package manager - part of Nodejs)   
- Windows, MacOS or Linux computer with access to internet
- One of more BLE peripheral devices that are connectable.

## Installation

Clone the repo

`git clone https://github.com/axiomware/GATT-scanner-async.git`

or download as zip file to a local directory and unzip.

Install all module dependencies by running the following command inside the directory

  `npm install`

## Optional customization before running the program
- If you are not able to locate your device, you can try to scan using the `active` mode. The Bluetooth®️LE name of some devices is located in `advertisement_scan_response`. An `advertisement_scan_response` is obtained only during an `active scan`.
- If you have difficulties in connecting to your device, you may need to change connection parameters. The defaults in `userConfig` will work for most devices..
```javascript
//User configuration
var userConfig = {           
    'scanPeriod': 1,    // seconds of advertising scan
    'scanMode': 1,      // 1-> active, 0-> passive
    'interval_min': 16, // x1.25ms - Connection intervalk min
    'interval_max': 100,// x1.25ms - Connection interval max
    'latency': 0,       // Salve latency
    'timeout': 200,     // x10ms - Supoervios timout
};
```

## Usage

Run the nodejs application:

    node GATTScannerAsync.js

The program will exit by itself at end of its operation. To force exit, use:

    CTRL-C  

Example output for the [CC2650 TI SensorTag](http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User%27s_Guide) (Yep! That thing is packed with goodies!):

```javascript
GATTtable: {
 "did": "8ae07184bec4",
 "dt": 0,
 "name": "CC2650 SensorTag",
 "services": [
    {
       "handle": "0001",
       "uuid": "0018",
       "end": "0007",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0002",
             "vh": "0003",
             "uuid": "002a",
             "end": "0003",
             "properties": "02"
          },
          {
             "handle": "0004",
             "vh": "0005",
             "uuid": "012a",
             "end": "0005",
             "properties": "02"
          },
          {
             "handle": "0006",
             "vh": "0007",
             "uuid": "042a",
             "end": "0007",
             "properties": "02"
          }
       ]
    },
    {
       "handle": "0008",
       "uuid": "0118",
       "end": "0008",
       "primary": 1,
       "characteristics": []
    },
    {
       "handle": "0009",
       "uuid": "0a18",
       "end": "001b",
       "primary": 1,
       "characteristics": [
          {
             "handle": "000a",
             "vh": "000b",
             "uuid": "232a",
             "end": "000b",
             "properties": "02"
          },
          {
             "handle": "000c",
             "vh": "000d",
             "uuid": "242a",
             "end": "000d",
             "properties": "02"
          },
          {
             "handle": "000e",
             "vh": "000f",
             "uuid": "252a",
             "end": "000f",
             "properties": "02"
          },
          {
             "handle": "0010",
             "vh": "0011",
             "uuid": "262a",
             "end": "0011",
             "properties": "02"
          },
          {
             "handle": "0012",
             "vh": "0013",
             "uuid": "272a",
             "end": "0013",
             "properties": "02"
          },
          {
             "handle": "0014",
             "vh": "0015",
             "uuid": "282a",
             "end": "0015",
             "properties": "02"
          },
          {
             "handle": "0016",
             "vh": "0017",
             "uuid": "292a",
             "end": "0017",
             "properties": "02"
          },
          {
             "handle": "0018",
             "vh": "0019",
             "uuid": "2a2a",
             "end": "0019",
             "properties": "02"
          },
          {
             "handle": "001a",
             "vh": "001b",
             "uuid": "502a",
             "end": "001b",
             "properties": "02"
          }
       ]
    },
    {
       "handle": "001c",
       "uuid": "0f18",
       "end": "0021",
       "primary": 1,
       "characteristics": [
          {
             "handle": "001d",
             "vh": "001e",
             "uuid": "192a",
             "end": "0021",
             "properties": "12"
          }
       ]
    },
    {
       "handle": "0022",
       "uuid": "00000000000000b00040510400aa00f0",
       "end": "0029",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0023",
             "vh": "0024",
             "uuid": "00000000000000b00040510401aa00f0",
             "end": "0025",
             "properties": "12"
          },
          {
             "handle": "0026",
             "vh": "0027",
             "uuid": "00000000000000b00040510402aa00f0",
             "end": "0027",
             "properties": "0a"
          },
          {
             "handle": "0028",
             "vh": "0029",
             "uuid": "00000000000000b00040510403aa00f0",
             "end": "0029",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "002a",
       "uuid": "00000000000000b00040510420aa00f0",
       "end": "0031",
       "primary": 1,
       "characteristics": [
          {
             "handle": "002b",
             "vh": "002c",
             "uuid": "00000000000000b00040510421aa00f0",
             "end": "002d",
             "properties": "12"
          },
          {
             "handle": "002e",
             "vh": "002f",
             "uuid": "00000000000000b00040510422aa00f0",
             "end": "002f",
             "properties": "0a"
          },
          {
             "handle": "0030",
             "vh": "0031",
             "uuid": "00000000000000b00040510423aa00f0",
             "end": "0031",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "0032",
       "uuid": "00000000000000b00040510440aa00f0",
       "end": "0039",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0033",
             "vh": "0034",
             "uuid": "00000000000000b00040510441aa00f0",
             "end": "0035",
             "properties": "12"
          },
          {
             "handle": "0036",
             "vh": "0037",
             "uuid": "00000000000000b00040510442aa00f0",
             "end": "0037",
             "properties": "0a"
          },
          {
             "handle": "0038",
             "vh": "0039",
             "uuid": "00000000000000b00040510444aa00f0",
             "end": "0039",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "003a",
       "uuid": "00000000000000b00040510480aa00f0",
       "end": "0041",
       "primary": 1,
       "characteristics": [
          {
             "handle": "003b",
             "vh": "003c",
             "uuid": "00000000000000b00040510481aa00f0",
             "end": "003d",
             "properties": "12"
          },
          {
             "handle": "003e",
             "vh": "003f",
             "uuid": "00000000000000b00040510482aa00f0",
             "end": "003f",
             "properties": "0a"
          },
          {
             "handle": "0040",
             "vh": "0041",
             "uuid": "00000000000000b00040510483aa00f0",
             "end": "0041",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "0042",
       "uuid": "00000000000000b00040510470aa00f0",
       "end": "0049",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0043",
             "vh": "0044",
             "uuid": "00000000000000b00040510471aa00f0",
             "end": "0045",
             "properties": "12"
          },
          {
             "handle": "0046",
             "vh": "0047",
             "uuid": "00000000000000b00040510472aa00f0",
             "end": "0047",
             "properties": "0a"
          },
          {
             "handle": "0048",
             "vh": "0049",
             "uuid": "00000000000000b00040510473aa00f0",
             "end": "0049",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "004a",
       "uuid": "e0ff",
       "end": "004e",
       "primary": 1,
       "characteristics": [
          {
             "handle": "004b",
             "vh": "004c",
             "uuid": "e1ff",
             "end": "004e",
             "properties": "10"
          }
       ]
    },
    {
       "handle": "004f",
       "uuid": "00000000000000b00040510464aa00f0",
       "end": "0053",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0050",
             "vh": "0051",
             "uuid": "00000000000000b00040510465aa00f0",
             "end": "0051",
             "properties": "0a"
          },
          {
             "handle": "0052",
             "vh": "0053",
             "uuid": "00000000000000b00040510466aa00f0",
             "end": "0053",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "0054",
       "uuid": "00000000000000b00040510400ac00f0",
       "end": "005a",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0055",
             "vh": "0056",
             "uuid": "00000000000000b00040510401ac00f0",
             "end": "0056",
             "properties": "0a"
          },
          {
             "handle": "0057",
             "vh": "0058",
             "uuid": "00000000000000b00040510402ac00f0",
             "end": "0058",
             "properties": "0a"
          },
          {
             "handle": "0059",
             "vh": "005a",
             "uuid": "00000000000000b00040510403ac00f0",
             "end": "005a",
             "properties": "0a"
          }
       ]
    },
    {
       "handle": "005b",
       "uuid": "00000000000000b000405104c0cc00f0",
       "end": "0062",
       "primary": 1,
       "characteristics": [
          {
             "handle": "005c",
             "vh": "005d",
             "uuid": "00000000000000b000405104c1cc00f0",
             "end": "005e",
             "properties": "12"
          },
          {
             "handle": "005f",
             "vh": "0060",
             "uuid": "00000000000000b000405104c2cc00f0",
             "end": "0060",
             "properties": "08"
          },
          {
             "handle": "0061",
             "vh": "0062",
             "uuid": "00000000000000b000405104c3cc00f0",
             "end": "0062",
             "properties": "08"
          }
       ]
    },
    {
       "handle": "0063",
       "uuid": "00000000000000b000405104c0ff00f0",
       "end": "ffff",
       "primary": 1,
       "characteristics": [
          {
             "handle": "0064",
             "vh": "0065",
             "uuid": "00000000000000b000405104c1ff00f0",
             "end": "0067",
             "properties": "1c"
          },
          {
             "handle": "0068",
             "vh": "0069",
             "uuid": "00000000000000b000405104c2ff00f0",
             "end": "006b",
             "properties": "1c"
          },
          {
             "handle": "006c",
             "vh": "006d",
             "uuid": "00000000000000b000405104c3ff00f0",
             "end": "006e",
             "properties": "0c"
          },
          {
             "handle": "006f",
             "vh": "0070",
             "uuid": "00000000000000b000405104c4ff00f0",
             "end": "ffff",
             "properties": "12"
          }
       ]
    }
 ]
}
```

## Error conditions

- If the program is not able to login, check your credentials.
- If the gateway is not listed in your account, it may not have been successfully provisioned. See the Netrunr [quick start guide](http://www.axiomware.com/page-netrunr-b24c-qs-guide.html) for provisioning the gateway.
- Not able to get version information of the gateway. Check if gateway is powered ON and has access to internet. Also, check if firewall is blocking internet access.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
