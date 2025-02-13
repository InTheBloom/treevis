document.addEventListener("DOMContentLoaded", () => {
    main();
});

class Canvas {
    constructor (elem) {
        this.elem = elem;
        this.margin_w = 0;
        this.margin_h = 0;

        this.radius = 10;

        this.rows = 1;
        this.cols = 1;
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

    set_margin_w (w) {
        if (w < 0) throw new Error("set_margin_w: minus margin.");
        this.margin_w = w;
        this.margin_w = Math.min(this.margin_w, this.elem.width / 2);
    }
    set_margin_h (h) {
        if (h < 0) throw new Error("set_margin_h: minus margin.");
        this.margin_h = h;
        this.margin_h = Math.min(this.margin_h, this.elem.height / 2);
    }
    set_radius (r) {
        if (r < 0) throw new Error("set_radius: minus radius.");
        this.radius = r;
    }
    split_canvas (cols, rows) {
        if (cols < 0) throw new Error("split_canvas: minus cols.");
        if (rows < 0) throw new Error("split_canvas: minus rows.");
        this.cols = cols;
        this.rows = rows;
    }

    lattice_to_px (x, y) {
        if (x < 0 || this.cols < x) throw new Error("lattice_to_px: Invalid x.");
        if (y < 0 || this.rows < y) throw new Error("lattice_to_px: Invalid y.");
        const actual_h = this.elem.height - 2 * this.margin_h;
        const actual_w = this.elem.width - 2 * this.margin_w;

        return [
            x * (actual_w / this.cols) + this.margin_w,
            y * (actual_h / this.rows) + this.margin_h,
        ];
    }

    draw_vertex (x, y, label) {
        const cod = this.lattice_to_px(x, y);
        const ctx = this.elem.getContext("2d");
        ctx.beginPath();
        ctx.arc(
            cod[0],
            cod[1],
            this.radius,
            0, 2 * Math.PI
        );
        ctx.stroke();
        ctx.font = `${this.radius}px serif`;
        ctx.fillText(
            `${label}`,
            cod[0] - this.radius / 3.6,
            cod[1] + this.radius / 2.7,
        );
    }

    clear () {
        const ctx = this.elem.getContext("2d");
        ctx.clearRect(0, 0, this.elem.width, this.elem.height);
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
            if (!graph.is_tree()) {
                throw new Error("入力されたグラフが木ではありません。");
            }

            // 画面クリア -> 描画アルゴリズムに渡す
            canvas.clear();
            draw(canvas, graph);
        }
        catch (e) {
            error_output.textContent = e;
        }
    });
}

function draw (canvas, graph) {
    canvas.set_radius(100);
    canvas.split_canvas(10, 10);
    canvas.draw_vertex(2, 2, 0);
}
