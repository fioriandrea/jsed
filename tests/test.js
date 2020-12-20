const print = (str) => document.querySelector("body").innerHTML += `<p>${str}</p>`;

const it = (message, f) => {
    try {
        f();
        print(`Passed: '${message}'`);
    } catch (e) {
        print(`Failed: '${message}'`);
    }
};

const assert = (condition) => {
    if (!condition)
        throw new Error();
};

const arraysEqual = (arr0, arr1) => {
    if (arr0.length !== arr1.length)
        return false;
    for (let i = 0; i < arr0.length; i++) {
        if (arr0[i] !== arr1[i])
            return false;
    }
    return true;
};