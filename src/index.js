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
        const ctx = this.elem.getContext("2d");
        ctx.fillRect(0, 0, this.elem.width, this.elem.height);
    }
}

class Graph {
    edge_count = 0;
    adj = {};
    add_edge (u, v) {
        if (!this.adj.hasOwnProperty(u)) this.adj[u] = {};
        if (!this.adj.hasOwnProperty(v)) this.adj[v] = {};
        this.edge_count++;

        this.adj[u][v] = true;
        this.adj[v][u] = true;
    }

    is_tree () {
        if (this.edge_count + 1 != Object.keys(this.adj).length) {
            return false;
        }
        let begin = Infinity;
        for (const p in this.adj) begin = Math.min(begin, p);

        const vis = {};
        const dfs = (pos) => {
            for (const p in this.adj[pos]) {
                if (vis.hasOwnProperty(p)) continue;
                vis[p] = true;
                dfs(p);
            }
        }
        dfs(begin);
        console.log(vis);

        return Object.keys(vis).length == Object.keys(this.adj).length;
    }

    debug () {
        console.log(this.adj);
    }
}

// 入力の解析
function parse_graph_input (S) {
    const g = new Graph();
    const lines = S.trim().split('\n');

    const regex = /[0123456789]{1,}/;
    for (const line of lines) {
        const tokens = line.split(' ');
        if (tokens.length != 2) {
            throw new Error("各行\"{数字} {数字}\"の形式に従ってください。");
        }
        for (const token of tokens) {
            if (!regex.test(token)) {
                throw new Error("数字以外を入力しないでください。");
            }
        }

        g.add_edge(tokens[0], tokens[1]);
    }
    return g;
}

// やりたい仕事
// - 入力監視 -> 描画の発火指定
// - canvasの初期化

function main () {
    const canvas = new Canvas(document.getElementById("main_canvas"));
    canvas.set_h(500);
    canvas.set_w(500);
    const error_output = document.getElementById("error_output");

    document.getElementById("graph_input").addEventListener("keyup", (e) => {
        error_output.textContent = "";
        try {
            const graph = parse_graph_input(e.target.value);
            if (!g.is_tree()) {
                throw new Error("入力されたグラフが木ではありません。");
            }

            // 描画アルゴリズムに渡す
            draw(canvas, graph);
        }
        catch (e) {
            error_output.textContent = e;
        }
    });
}

function draw (canvas, graph) {
}
