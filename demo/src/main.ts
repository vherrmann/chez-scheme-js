import Scheme from 'chez-scheme-js';

const output = document.getElementById('output') as HTMLPreElement;
const input = document.getElementById('input') as HTMLInputElement;

input.addEventListener('keyup', async ev => {
    if (ev.key === 'Enter') {
        if (input.value === '') {
            return;
        }
        output.innerText += input.value + '\n';
        input.disabled = true;
        const result = await scheme.runExpression(input.value);
        output.innerText += result.join('\n');
        output.innerText += `${result.length > 0 ? '\n' : ''}> `;
        input.value = '';
        input.disabled = false;
        input.focus();
    }
});

const scheme = new Scheme({
    error: err => output.innerText += err,
});
output.innerText += await scheme.init() + '\n> ';
input.focus();