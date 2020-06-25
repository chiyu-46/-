/**
* 小型游戏主逻辑部分
 * 由于游戏会创建大量对象，为方便管理分类设为数组，并且数组内的成员不需要后将被清除
*/

const CANVAS_WIDTH = 480;                                            //画布宽度
const CANVAS_HEIGHT = 700;                                           //画布高度

(function(){
    let canvas = document.getElementById("canvas");        //获取画布
    let ctx = canvas.getContext("2d");                      //获取上下文

    let status = 0;                                                  //游戏状态,0开始，1游戏中，2游戏结束，3暂停，4：关卡结束
    let life = 0;                                                    //生命数
    let levels = 0;                                                  //关卡数
    let music_id = 0;                                                //背景音乐id
    let scores = 0;                                                  //得分
    let num_i = 0;                                                   //每关敌方I型飞机数量
    let num_ii = 0;                                                  //每关敌方I型飞机数量
    let num_iii = 0;                                                 //每关敌方I型飞机数量
    let stopMain;                                                    //主循环id
    let last =  window.performance.now();                            //用于控制帧率，前一帧绘制时的时间
    let now =  window.performance.now();                             //用于控制帧率，当前时间
    let frames = 0;                                                  //帧数记录
    let frames1 = 0;                                                 //用于道具生成的帧数记录

    let background = new Background();                               //背景
    let myPlane = [];                                                //己方飞机数组
    let enemyPlaneI = [];                                            //敌方I型飞机数组
    let enemyPlaneII = [];                                           //敌方II型飞机数组
    let enemyPlaneIII = [];                                          //敌方III型飞机数组
    let bulletUpgrade = [];                                          //子弹增强道具数组
    let speedUp = [];                                                //速度增加道具数组
    let myBullet = [];                                               //己方子弹数组
    let temp1 = null;                                                //己方子弹的配套临时变量

    /*
    * 增强道具生成方法
    * */
    function propProducer() {
        frames1++;
        if(frames1 < 90){
            return;
        }
        frames1 = 0;
        let temp = Math.random();
        if(temp < 0.1){
            temp = 1;
        }else if (temp < 0.2){
            temp = 2;
        }else {
            temp = 0;
        }
        switch (temp) {
            case 0:
                return;
            case 1:
                bulletUpgrade.push(new BulletUpgrade());
                return;
            case 2:
                speedUp.push(new SpeedUp());
                return;
        }
    }

    /*
    * 随机生成敌人的方法
    * 首先确保敌方还有飞机可用
    * 生成随机数012对应生成敌方飞机型号
    * 如果此型号飞机已经没有更多
    * 则进行判断，如果随机数为0，则随机数+1尝试；
    * 如果随机1，2，则随机数-1尝试*/
    function producer(){
        frames++;
        if(frames < 90 - 5 * levels){
            return;
        }
        if (num_i + num_ii + num_iii === 0){
            return;
        }
        let temp = Math.floor(Math.random() * 3);
        while (true){
            if (temp === 0){
                if (num_i > 0){
                    enemyPlaneI.push(new EnemyPlaneI(levels));
                    num_i--;
                    frames = 0;
                    return;
                }
                temp++;
            }else if (temp === 1){
                if (num_ii > 0){
                    enemyPlaneII.push(new EnemyPlaneII(levels));
                    num_ii--;
                    frames = 0;
                    return;
                }
                temp++;
            }else if (temp === 2){
                if (num_iii > 0){
                    enemyPlaneIII.push(new EnemyPlaneIII(levels));
                    num_iii--;
                    frames = 0;
                    return;
                }
                temp++;
            }
            temp = temp === 3 ? 0 : temp;
        }
    }
    /*
    * 敌方的update
    * */
    function enemyUpdate(o) {
        if(o.length !== 0) {
            if ((o[0].perish >= o[0].deadLine && o[0].live !== 2) || o[0].live === 0){
                if(o[0].live === 0){
                    switch (o[0].type) {
                        case 1:
                            scores += 100;
                            break;
                        case 2:
                            scores += 500;
                            break;
                        case 3:
                            scores += 900;
                    }
                }else {
                    switch (o[0].type) {
                        case 1:
                            scores -= 50;
                            break;
                        case 2:
                            scores -= 150;
                            break;
                        case 3:
                            scores -= 250;
                    }
                }
                o.shift();
            }
            for (let i = 0; i < o.length; ++i) {
                o[i].frames++;
                o[i].perish++;
                if(o[i].live ===2){
                    o[i].explosion();
                }
                moveBase(o[i]);
            }
        }
    }
    /*
    * 道具的update
    * */
    function Props(o) {
        if(o.length !== 0) {
            if (o[0].perish >= o[0].deadLine || o[0].live === 0){
                o.shift();
            }
            for (let i = 0; i < o.length; ++i) {
                o[i].perish++;
                moveBase(o[i]);
                o[i].collision(myPlane);
            }
        }
    }
    /*
    * 主update
    * 包含一切游戏中需要更新数据的方法
    * */
    function update(){
        //己方帧数计数器+1
        myPlane[0].frames++;
        //己方飞机碰撞检测
        myPlane[0].collision(enemyPlaneI);
        myPlane[0].collision(enemyPlaneII);
        myPlane[0].collision(enemyPlaneIII);
        //己方飞机死亡后爆炸
        if(myPlane[0].live ===2){
            myPlane[0].explosion();
        }
        //若还有生命值，则重生；如果生命值为零，游戏结束
        if(myPlane[0].live ===0){
            myPlane.shift();
            if (life > 0){
                myPlane.push(new MyPlane());
                life--;
            }else {
                status = 2;
                bind(3);
            }
        }
        //过关与游戏结束
        if(num_i + num_ii + num_iii === 0
            && enemyPlaneI.length + enemyPlaneII.length + enemyPlaneIII.length === 0){
            levels++;
            status = 4;
            bind(1);
            if(levels > 10){
                status = 2;
                bind(3);
            }
        }
        //己方飞机移动
        myPlane[0].move();
        //己方飞机开火
        temp1 = myPlane[0].shoot();
        if (temp1 !== null){
            myBullet.push(temp1);
        }
        //己方子弹的update，实现移动和消亡
        if(myBullet.length !== 0) {
            if ((myBullet[0].perish >= myBullet[0].deadLine && myBullet[0].live !== 2) || myBullet[0].live === 0){
                myBullet.shift();
            }
            for (let i = 0; i < myBullet.length; ++i) {
                myBullet[i].perish++;
                moveBase(myBullet[i]);
                myBullet[i].collision(enemyPlaneI);
                myBullet[i].collision(enemyPlaneII);
                myBullet[i].collision(enemyPlaneIII);
            }
        }
        //敌方飞机的update，实现移动和消亡
        enemyUpdate(enemyPlaneI);
        enemyUpdate(enemyPlaneII);
        enemyUpdate(enemyPlaneIII);
        //道具的update，实现移动和碰撞检测，消亡
        Props(bulletUpgrade);
        Props(speedUp);
    }
    /*
    * 渲染方法
    * 用于画可见对象
    * */
    function render(target) {
        if(target.length !== 0) {
            for (let i = 0; i < target.length; ++i) {
                if(target[i].live !== 0){
                    ctx.drawImage(target[i].img, target[i].x, target[i].y);
                }

            }
        }
    }
    /*
    * 主draw
    * 包含一切绘制方法
    * */
    function draw(){
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);      //清除前面一帧
        ctx.drawImage(background.img,background.x,background.y);     //背景不变
        switch (status) {
            case 0:
            {
                ctx.font = "48px 'YouYuan',sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("马里奥大逃亡", CANVAS_WIDTH * 0.5, 200);
                ctx.font = "24px 'YouYuan',sans-serif";
                ctx.fillText("按回车开始游戏", CANVAS_WIDTH * 0.5, 500);
            }
            break;
            case 1:
            {
                render(enemyPlaneI);
                render(enemyPlaneII);
                render(enemyPlaneIII);
                render(myBullet);
                render(bulletUpgrade);
                render(speedUp);
                render(myPlane);
                ctx.font = "12px 'YouYuan',sans-serif";
                ctx.textAlign = "right";
                ctx.fillText("分数：" + scores, CANVAS_WIDTH, CANVAS_HEIGHT - 12);
            }
            break;
            case 2:
            {
                ctx.font = "48px 'YouYuan',sans-serif";
                ctx.textAlign = "center";
                if(life === 0){
                    ctx.fillText("也许", CANVAS_WIDTH * 0.5, 200);
                    ctx.fillText("我", CANVAS_WIDTH * 0.5, 300);
                    ctx.fillText("什么都拯救不了吧", CANVAS_WIDTH * 0.5, 400);
                }else {
                    ctx.fillText("最终", CANVAS_WIDTH * 0.5, 100);
                    ctx.fillText("你还是属于我的公主", CANVAS_WIDTH * 0.5, 200);
                    let img = new Image(1191,791);
                    img.src = 'img/victory.png';
                    ctx.drawImage(img, 0, 300,CANVAS_WIDTH,318);
                }
            }
            break;
            case 3:
            {
                ctx.font = "48px 'YouYuan',sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("暂停中", CANVAS_WIDTH * 0.5, 300);
            }
            break;
            case 4:
            {
                ctx.font = "48px 'YouYuan',sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("第" + levels + "关", CANVAS_WIDTH * 0.5, 300);
                ctx.font = "24px 'YouYuan',sans-serif";
                ctx.fillText("按回车键继续", CANVAS_WIDTH * 0.5, 500);
            }
            break;
        }
    }


    /*
     * 键盘监听事件的回调函数群
     * 主要功能是通过键盘方向键控制自己的飞机移动
     * 但为防止用户按下新键但旧键还未抬起，设置了flag标志，记录旧键，在抬起前不响应旧键请求
     * 抬起后flag回零
     * flag1:0相应上下；1不响应上；2不响应下
     * flag2:0相应左右；1不响应左；2不响应右
     * 次要功能是响应其他状态游戏需要
     */
    let flag1 = 0;                                             //键盘事件所需标志（上下）
    let flag2 = 0;                                             //键盘事件所需标志（左右）
    function k_down_gaming(event){
        if(event.key === "ArrowDown"){
            if ((flag1 !== 2) && (myPlane[0].dy !== 1)) {
                if (myPlane[0].dy === -1){
                    flag1 = 1;
                }
                myPlane[0].dy = 1;
            }
        }else if (event.key === "ArrowLeft"){
            if ((flag2 !== 1) && (myPlane[0].dx !== -1)) {
                if (myPlane[0].dx === 1){
                    flag1 = 2;
                }
                myPlane[0].dx = -1;
            }
        }else if (event.key === "ArrowRight"){
            if ((flag2 !== 2) && (myPlane[0].dx !== 1)) {
                if (myPlane[0].dx === -1){
                    flag1 = 1;
                }
                myPlane[0].dx = 1;
            }
        }else if (event.key === "ArrowUp"){
            if ((flag1 !== 1) && (myPlane[0].dy !== -1)) {
                if (myPlane[0].dy === 1){
                    flag1 = 2;
                }
                myPlane[0].dy = -1;
            }
        }
    }
    function k_up_gaming(event){
        if(event.key === "ArrowDown"){
            myPlane[0].dy = myPlane[0].dy === -1 ? -1 : 0;
            flag1 = 0;
        }else if (event.key === "ArrowLeft"){
            myPlane[0].dx = myPlane[0].dx === 1 ? 1 : 0;
            flag2 = 0;
        }else if (event.key === "ArrowRight"){
            myPlane[0].dx = myPlane[0].dx === -1 ? -1 : 0;
            flag2 = 0;
        }else if (event.key === "ArrowUp"){
            myPlane[0].dy = myPlane[0].dy === 1 ? 1 : 0;
            flag1 = 0;
        }
    }
    function k_up_start(event){
        if(event.key === "Enter"){
            levels++;
            music_id = sound1.play();
            num_i = levels * 7;
            num_ii = levels * 5;
            num_iii = levels * 3;
            status = 1;
            life = 3;
            myPlane.push(new MyPlane());
            bind(0);
        }
    }
    function k_up_pause(event){
        if(event.key === "p"){
            if (status === 1){
                status = 3;
            }else if (status === 3){
                status = 1;
            }
        }
    }
    function k_up_over(event){
        if(event.key === "r"){
            status = 0;
            life = 0;
            levels = 0;
            scores = 0;
            num_i = 0;
            num_ii = 0;
            num_iii = 0;
            myPlane = [];
            enemyPlaneI = [];
            enemyPlaneII = [];
            enemyPlaneIII = [];
            bulletUpgrade = [];
            speedUp = [];
            myBullet = [];
            sound1.stop(music_id);
            addEventListener("keyup",k_up_start);
            bind(4);
        }
    }
    function k_up_pass(event){
        if(event.key === "Enter"){
            status = 1;
            levels++;
            num_i = levels * 7;
            num_ii = levels * 5;
            num_iii = levels * 3;
            bind(2);
        }
    }


    /*
    * 用于根据状态改变绑定监视事件，传入改变状态的起因
    * 第一次开始游戏时，按回车开始游戏的事件自动绑定
    * 0：进入游戏
    * 1：关卡结束
    * 2：下一关开始
    * 3：游戏结束
    * 4.重新开始后不再次响应重新开始
    * */
    addEventListener("keyup",k_up_start);
    function bind(cause){
        switch (cause) {
            case 0:
                removeEventListener("keyup",k_up_start);
                addEventListener("keydown",k_down_gaming);
                addEventListener("keyup",k_up_gaming);
                addEventListener("keyup",k_up_pause);
                break;
            case 1:
                addEventListener("keyup",k_up_pass);
                break;
            case 2:
                removeEventListener("keyup",k_up_pass);
                break;
            case 3:
                removeEventListener("keydown",k_down_gaming);
                removeEventListener("keyup",k_up_gaming);
                removeEventListener("keyup",k_up_pause);
                addEventListener("keyup",k_up_over);
                break;
            case 4:
                removeEventListener("keyup",k_up_over);
                break;
        }
    }

    function main(){
        stopMain = window.requestAnimationFrame(main);               //以下为主循环内容
        now = window.performance.now();
        if (now - last > 16.67){                                     //控制帧率大致60Hz
            last = now;
            if(status === 1){                                        //响应暂停
                update();
                producer();
                propProducer();
            }
            draw();
        }
    }

    main(); //开始循环
})();
/*
* 外部调用的分数获取方法
* */
function getScores() {
    return scores;
}
//强制取消主函数
//window.cancelAnimationFrame(stopMain);