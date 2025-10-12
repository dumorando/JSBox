import { basicSetup } from 'https://esm.sh/codemirror';
import { EditorView, keymap } from 'https://esm.sh/@codemirror/view';
import { javascript } from 'https://esm.sh/@codemirror/lang-javascript';
import { indentWithTab } from "https://esm.sh/@codemirror/commands";
// import { materialDark } from 'https://esm.sh/cm6-theme-material-dark';

const iframe = document.getElementById('iframe');
const cnsole = document.getElementById('console');
const colors = { log: 'white', warn: 'yellow', error: 'red' };

function addToConsole(text, type) {
    const newel = document.createElement('pre');
    
    if (typeof text === "string") {
        newel.innerText = text;
    } else {
        try {
            newel.innerText = JSON.stringify(text, null, 2);
        } catch (error) {
            newel.innerText = text.toString();
        }
    }

    newel.style.color = colors[type];

    cnsole.appendChild(newel);
    cnsole.scrollTop = cnsole.scrollHeight;
}

window.addEventListener('message', (e) => {
    if (["log", "warn", "error"].includes(e.data.type)) {
        addToConsole(e.data.text, e.data.type);
    }
});

const view = new EditorView({
    doc: localStorage.getItem('jsbox-code') ?? 'console.log("Hello world!");',
    parent: document.getElementById('editor'),
    extensions: [
        basicSetup,
        javascript({ typescript: false }),
        keymap.of([ indentWithTab ]),
        // materialDark
    ]
});

// window.view = view;

function runJS() {
    localStorage.setItem("jsbox-code", view.state.doc.toString());
    iframe.srcdoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSBox Sandbox</title>
</head>
<body>
    <script>
window.console = {
    log(...args) {
        for(const arg of args) {
            window.parent.postMessage({ type: 'log', text: arg });
        }
    },

    warn(...args) {
        for(const arg of args) {
            window.parent.postMessage({ type: 'warn', text: arg });
        }
    },

    error(...args) {
        for(const arg of args) {
            window.parent.postMessage({ type: 'error', text: arg });
        }
    }  
};

window.addEventListener('error', (err) => {
    window.parent.postMessage({ type: 'error', text: err.message });
});

eval(atob("${btoa(view.state.doc.toString())}"));
    </script>
</body>
</html>
    `;
}

document.getElementById('run').addEventListener("click", () => runJS());
document.getElementById('clear').addEventListener("click", () => cnsole.innerHTML = '');