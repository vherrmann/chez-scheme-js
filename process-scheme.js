const fs = require('fs');
const path = require('path');

const SCHEME_JS_FILE_PATH = path.join(__dirname, 'src/chez/scheme.js');

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
    const INJECTION = 'Module["$internal"]=name=>eval(name);';
    if (!data.includes(INJECTION)) {
        data = data.replace(SEARCH_STRING, INJECTION + SEARCH_STRING);
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