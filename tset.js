const CANVAS_WIDTH = 480;                                            //画布宽度
const CANVAS_HEIGHT = 700;                                           //画布高度
let canvas = document.getElementById("canvas");        //获取画布
let ctx = canvas.getContext("2d");                      //获取上下文
let scores = 123456;

ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);      //清除前面一帧
ctx.fillStyle = "white";
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
ctx.fillStyle = "black";




ctx.font = "48px 'YouYuan',sans-serif";
ctx.textAlign = "center";
ctx.fillText("最终", CANVAS_WIDTH * 0.5, 100);
ctx.fillText("你还是属于我的公主", CANVAS_WIDTH * 0.5, 200);
let img = new Image(1191,791);
img.src = 'img/victory.png';
ctx.drawImage(img, 0, 300,CANVAS_WIDTH,318);