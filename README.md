# TreeVis

canvas上で木の可視化を行うプログラム。
WetherellとShannonのアルゴリズムを用いて、頂点数Nに対してO(N)時間で頂点配置を決定し、その情報をcanvasに描画する。
png画像として保存可能。

[参考1](https://www.slideshare.net/slideshow/drawing-tree-algorithms/33708903)
[参考2](https://llimllib.github.io/pymag-trees/)

作者の理解不足により、O(N)時間の方がなぜうまく行くのかよくわかっていない。

## 使い方
1. 木を入力

各行は`{数字} {数字}`のフォーマットに従い、木を入力する。
現状、頂点番号がそのままラベルとなる。
ここで、0を除く整数にleading-zeroをつけてはいけない。

2. 描画設定

canvasのサイズ、頂点半径をスライダーで設定し、根をどの頂点にするか設定する。
