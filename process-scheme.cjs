const fs = require('fs');
const path = require('path');

const SCHEME_JS_FILE_PATH = path.join(__dirname, 'src/chez/scheme.js');

/** @type {string} */
let data;

try {
    data = fs.readFileSync(SCHEME_JS_FILE_PATH, { encoding: 'utf8' });
}
catch (e) {
    console.error(`Failed to read ${SCHEME_JS_FILE_PATH}`);
    process.exit(1);
}

const SEARCH_STRING = 'return Module.ready'
if (data.includes(SEARCH_STRING)) {
    const INJECTION = `
    Module.addRunDependency=addRunDependency;
    Module.removeRunDependency=removeRunDependency;
    Module.FS=FS;
    `;
    if (!data.includes(INJECTION)) {
        data = data.replace(SEARCH_STRING, INJECTION + SEARCH_STRING);
        // Remove unnecessary code about searching for file on the real FS
        // (we only use the virtual FS)
        data = data.replace(/Module\["locateFile"]/g, 'undefined');
        data = data.replace(/(?:var )?scriptDirectory=/g, '');
        data = data.replace(/scriptDirectory/g, '""');
        // Override feature detection to eliminate unnecessary code
        data = data.replace(/typeof window/g, '"undefined"');
        data = data.replace(/typeof importScripts/g, '"undefined"');
        data = data.replace(/typeof process/g, '"undefined"');
    }
    else {
        console.error(`The scheme binary has already been processed`);
        process.exit(1);
    }
}
else {
    console.error(`The scheme binary is in an unexpected format`);
    process.exit(1);
}

try {
    data = fs.writeFileSync(SCHEME_JS_FILE_PATH, data, { encoding: 'utf8' });
}
catch (e) {
    console.error(`Failed to write at ${SCHEME_JS_FILE_PATH}`);
    process.exit(1);
}

console.log('Successfully processed scheme binary');