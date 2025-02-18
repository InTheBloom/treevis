document.addEventListener("DOMContentLoaded", () => {
    main();
});

function strlen (str) {
  const segmenter = new Intl.Segmenter("ja-JP", { granularity: "grapheme" });
  return [...segmenter.segment(str)].length;
}

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
        // 領域の消去
        ctx.arc(
            cod[0],
            cod[1],
            this.radius,
            0, 2 * Math.PI
        );
        ctx.fillStyle = "rgba(255 255 255 / 100%)";
        ctx.fill();

        ctx.stroke();
        ctx.font = `${this.radius}px serif`;

        ctx.fillStyle = "rgba(0 0 0 / 100%)";
        const len = strlen(`${label}`);

        ctx.fillText(
            `${label}`,
            cod[0] - len * this.radius / 3.6,
            cod[1] + this.radius / 2.7,
        );
    }

    draw_edge (x1, y1, x2, y2) {
        const cod1 = this.lattice_to_px(x1, y1);
        const cod2 = this.lattice_to_px(x2, y2);

        const ctx = this.elem.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(cod1[0], cod1[1]);
        ctx.lineTo(cod2[0], cod2[1]);
        ctx.stroke();
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
        if (!this.adj.hasOwnProperty(u)) this.adj[u] = [];
        if (!this.adj.hasOwnProperty(v)) this.adj[v] = [];
        this.edge_count++;

        this.adj[u].push(v);
        this.adj[v].push(u);
    }

    is_tree () {
        // 空グラフは木とみなす定義を採用。
        if (this.edge_count == 0) return true;

        if (this.edge_count + 1 != Object.keys(this.adj).length) {
            return false;
        }
        let begin = Infinity;
        for (const p in this.adj) begin = Math.min(begin, p);

        const vis = {};
        const dfs = (pos) => {
            for (const p of this.adj[pos]) {
                if (vis.hasOwnProperty(p)) continue;
                vis[p] = true;
                dfs(p);
            }
        }
        dfs(begin);

        return Object.keys(vis).length == Object.keys(this.adj).length;
    }

    // 本当は別の人に仕事させた方がいいと思うけど、ここでレイアウトを作ってしまうよ。
    // まずはシンプルなやつから
    get_filled_layout (root) {
        // 木であることを仮定していい。
        const res = {};
        if (this.edge_count == 0) return res;
        if (!this.adj.hasOwnProperty(root)) {
            throw new Error("指定された根がグラフに存在しません");
        }

        const left = {};
        const dfs = (pos, par, h) => {
            if (!left.hasOwnProperty(h)) left[h] = 0;
            // 登録
            const idx = res.length;
            res[pos] = {label: `${pos}`, cod: [left[h], h], neibors: []};
            left[h]++;

            for (const nex of this.adj[pos]) {
                if (nex == par) continue;
                const nidx = res.length;
                dfs(nex, pos, h + 1);
                res[pos].neibors.push(nex);
            }
        }

        dfs(root, Infinity, 0);
        return res;
    }

    // 少し複雑なやつ
    get_balanced_layout (root) {
        const res = {};

        if (this.edge_count == 0) return res;
        if (!this.adj.hasOwnProperty(root)) {
            throw new Error("指定された根がグラフに存在しません");
        }

        const padding = {};
        const mod = {};
        const left = {};
        const dfs = (pos, par, h) => {
            if (!left.hasOwnProperty(h)) left[h] = 0;
            res[pos] = {label: `${pos}`, cod: [], neibors: []};

            // 葉
            if (this.adj[pos].length == 1 && this.adj[pos][0] == par) {
                res[pos].cod = [left[h], h];
                left[h]++;
                return;
            }

            for (const nex of this.adj[pos]) {
                if (nex == par) continue;
                res[pos].neibors.push(nex);
                dfs(nex, pos, h + 1);
            }

            let fi = -1, la = -1;
            // 逆辺があることに注意。
            for (const nex of this.adj[pos]) {
                if (nex == par) continue;
                fi = nex;
                break;
            }
            for (const nex of this.adj[pos]) {
                if (nex == par) continue;
                la = nex;
            }

            let cod_x = (res[fi].cod[0] + res[la].cod[0]) / 2;
            // もし被るならパディングを設定

            if (!padding.hasOwnProperty(h)) {
                padding[h] = 0;
            }
            padding[h] = Math.max(padding[h], left[h] - cod_x);
            mod[pos] = padding[h];
            cod_x += padding[h];

            left[h] = cod_x + 1;
            res[pos].cod = [cod_x, h];
        }

        dfs(root, Infinity, 0);

        // modを精算
        const dfs2 = (pos, par, acc) => {
            res[pos].cod[0] += acc;
            if (mod.hasOwnProperty(pos)) acc += mod[pos];

            for (const nex of this.adj[pos]) {
                if (nex == par) continue;
                dfs2(nex, pos, acc);
            }
        }
        dfs2(root, Infinity, 0);

        return res;
    }

    debug () {
        console.log(this.adj);
    }
}

// 入力の解析
function parse_graph_input (S) {
    const g = new Graph();
    const lines = S.trim().split('\n');

    const regex = /^0|([123456789][0123456789]{0,})$/;
    for (const line of lines) {
        if (line == "") continue;
        const tokens = line.split(' ');
        if (tokens.length != 2) {
            throw new Error("各行\"{数字} {数字}\"の形式に従ってください。");
        }
        for (const token of tokens) {
            if (!regex.test(token)) {
                throw new Error("数字以外を入力しないでください。または、先頭の余分な0は許容されません。");
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

    const graph_input = document.getElementById("graph_input");
    const root_input = document.getElementById("root_input");
    const draw_graph = (graph_string, root_string) => {
        error_output.textContent = "";
        try {
            const graph = parse_graph_input(graph_string);
            const root = (() => {
                const res = parseInt(root_string);
                if (!isNaN(res)) return res;
                let mi = Infinity;
                for (const v in graph.adj) mi = Math.min(mi, v);
                return mi;
            })();

            if (!graph.is_tree()) {
                throw new Error("入力されたグラフが木ではありません。");
            }

            // 画面クリア -> 描画アルゴリズムに渡す
            canvas.clear();
            draw(canvas, graph, root);
        }
        catch (e) {
            error_output.textContent = e;
        }
    }

    // 最初に実行 + イベントハンドラに登録
    draw_graph(graph_input.value, root_input.value);
    graph_input.addEventListener("keyup", (e) => draw_graph(graph_input.value, root_input.value));
    root_input.addEventListener("input", (e) => draw_graph(graph_input.value, root_input.value));
}

function draw (canvas, graph, root) {
    canvas.set_radius(10);
    canvas.set_margin_w(50);
    canvas.set_margin_h(50);

    const layout = graph.get_balanced_layout(root);
    {
        let max_x = 1, max_y = 1;
        for (const v in layout) {
            max_x = Math.max(max_x, layout[v].cod[0]);
            max_y = Math.max(max_y, layout[v].cod[1]);
        }
        canvas.split_canvas(max_x, max_y);
    }

    // 辺の描画
    for (const v in layout) {
        const cod1 = layout[v].cod;
        for (const neibor of layout[v].neibors) {
            const cod2 = layout[neibor].cod;
            canvas.draw_edge(cod1[0], cod1[1], cod2[0], cod2[1]);
        }
    }

    // 頂点の描画
    for (const v in layout) {
        const label = layout[v].label;
        const cod = layout[v].cod;

        canvas.draw_vertex(cod[0], cod[1], label);
    }
}
