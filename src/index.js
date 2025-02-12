document.addEventListener("DOMContentLoaded", () => {
    main();
});

class Canvas {
    constructor (elem) {
        this.elem = elem;
    }

    // 全てpx指定
    set_w (w) {
        this.elem.width = w;
    }
    set_h (h) {
        this.elem.height = h;
    }
    get_w () {
        return this.elem.width;
    }
    get_h () {
        return this.elem.height;
    }

    clear () {

    }
}

// やりたい仕事
// - 入力監視 -> 描画の発火指定
// - canvasの初期化

function main () {
    const canvas = new Canvas(document.getElementById("main_canvas"));
    canvas.set_h(500);
    canvas.set_w(500);

    document.getElementById("graph_input").addEventListener("keyup", (e) => console.log(e.target.value));
}
