/**
 * 游戏中的可见对象
 * 所有对象继承基类
 */

/*
* 基本方法：移动
* 传入需要移动的对象obj*/
moveBase = function (obj) {
    if (obj.live === 1){
        obj.x += obj.dx * obj.speed;
        obj.y += obj.dy * obj.speed;
    }
}
/*
基本方法：碰撞检测
* 检测自身是否与检测目标（target）碰撞
* 将各对象视为中心为圆心的圆
* 使用勾股定理实现
* */
collisionBase = function (root,targetList) {
    if(root.live === 0){
        return null;
    }
    if(targetList.length !== 0) {
        let center_x1 = 0.5 * root.width;
        let center_y1 = 0.5 * root.height;
        let r1 = 0.5 * (center_x1 + center_y1);
        for (let i = 0; i < targetList.length; ++i) {
            if(targetList[i].live !== 1){
                continue;
            }
            let center_x2 = 0.5 * targetList[i].width;
            let center_y2 = 0.5 * targetList[i].height;
            let r2 = 0.5 * (center_x2 + center_y2);
            if (Math.pow(((root.x + center_x1) - (targetList[i].x + center_x2)),2)
                + Math.pow(((root.y + center_y1) - (targetList[i].y + center_y2)),2)
                <= Math.pow((r1 + r2),2)){
                root.live = 0;                                   //碰到自身消亡
                return targetList[i];                            //返回碰到的东西
            }
        }
    }
    return null;                                                 //没碰到返回空
}

/*
* 基础类
*/
class Base {
    constructor () {
        this.x = 0;                                                  //位置：x
        this.y = 0;                                                  //位置：y
        this.width = 0;                                              //宽
        this.height = 0;                                             //高
        this.dx = 0;                                                 //方向左右，+1：右；0：不左右移动；-1：左移
        this.dy = 0;                                                 //方向上下，+1：下；0：不上下移动；-1：上移
        this.speed = 0;                                              //速度
        this.live = 0;                                               //对象是否存活,0:不存在或已消失；1：存活；2：死亡
    }
}

/*
* 我方飞机类
*/
class MyPlane extends Base {
    constructor() {
        super();
        this.live = 1;
        this.width = 102;
        this.height = 126;
        this.speed = 2;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;                  //使飞机初始化在屏幕中央下方
        this.y = CANVAS_HEIGHT - this.height;
        this.myplane1 = new Image(this.width,this.height);           //加载图片
        this.myplane1.src = 'img/myplane(1).png';
        this.myplane2 = new Image(this.width,this.height);           //加载图片
        this.myplane2.src = 'img/myplane(2).png';
        this.myplane3 = new Image(this.width,this.height);           //加载图片
        this.myplane3.src = 'img/myplane(3).png';
        this.myplane4 = new Image(this.width,this.height);           //加载图片
        this.myplane4.src = 'img/myplane(4).png';
        this.myplane = new Image(this.width,this.height);            //加载图片
        this.myplane.src = 'img/myplane.png';
        this.img = this.myplane;
        this.frames = 0;                                             //帧数统计，用于代替定时
        this.frames_temp = 0;                                        //帧数临时记录，用于定时
        this.rate = 60;                                              //射速，多少帧发射一发子弹
    }
    /*
    * 己方飞机的移动方法
    * 调用基本移动方法
    * 并实现边界限制*/
    move = function(){
        moveBase(this);
        if(this.x < 0){
            this.x = 0;
        }else if(this.x > CANVAS_WIDTH - this.width){
            this.x =  CANVAS_WIDTH - this.width;
        }
        if (this.y < 0){
            this.y = 0;
        }else if (this.y > CANVAS_HEIGHT - this.height){
            this.y =  CANVAS_HEIGHT - this.height;
        }
    }
    /*
    * 子弹发射方法*/
    shoot = function () {                                            //发射子弹，默认60帧发射一次，升级后最高20帧一次
        if (this.live === 1 && this.frames >= this.rate){
            this.frames = 0;
            sound4.play();
            return new MyBullet(this.x + this.width / 2 -2,this.y - 11);
        }
        return null;                                                 //不应该发射时返回空
    }
    /*爆炸方法*/
    explosion = function () {                                        //自身处于状态2（死亡）时执行，爆炸画面展示后消亡（状态转0）
        if(this.frames_temp + 1 === this.frames){
            this.img = this.myplane1;
        }
        else if(this.frames_temp + 10 === this.frames){
            this.img =  this.myplane2;
        }
        else if(this.frames_temp + 20 === this.frames){
            this.img =  this.myplane3;
        }
        else if(this.frames_temp + 30 === this.frames){
            this.img =  this.myplane4;
        }
        else if(this.frames_temp + 40 === this.frames){
            this.live = 0;
        }
    }
    /*
    * 己方的碰撞检测
    * */
    collision = function (enemyList) {                               //撞到敌人，自身爆炸（状态转2：死亡；播放爆炸音效；爆炸）
        let temp = collisionBase(this,enemyList);
        if (temp){
            this.frames_temp = this.frames;
            this.live = 2;
            sound3.play();
        }
    }
    /*
    * 增强道具
    * */
    update = function (type) {                                       //由增强道具调用，1类道具，增加速度，2类道具，增加射速
        switch (type) {
            case 1:
                if(this.speed < 5){
                    this.speed++;
                }
                break;
            case 2:
                if (this.rate > 20){
                    this.rate -= 20;
                }
                else {
                    this.rate = 10;
                }
                break;
        }
    }
}

/*
* 敌方飞机I类
*/
class EnemyPlaneI extends Base {
    constructor(levels) {
        super();
        this.type = 1;
        this.width = 57;
        this.height = 51;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = 0 - this.height;
        this.live = 1;
        this.speed = 3 + 0.4 * levels;
        this.dy = 1;
        this.life = 1;
        this.plane1_1 = new Image(this.width,this.height);           //加载图片
        this.plane1_1.src = 'img/plane1(1).png';
        this.plane1_2 = new Image(this.width,this.height);           //加载图片
        this.plane1_2.src = 'img/plane1(2).png';
        this.plane1_3 = new Image(this.width,this.height);           //加载图片
        this.plane1_3.src = 'img/plane1(3).png';
        this.plane1_4 = new Image(this.width,this.height);           //加载图片
        this.plane1_4.src = 'img/plane1(4).png';
        this.plane1 = new Image(this.width,this.height);             //加载图片
        this.plane1.src = 'img/plane1.png';
        this.img = this.plane1;
        this.frames = 0;                                             //帧数统计，用于代替定时
        this.perish = 0;                                             //消亡倒计时
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
        this.frames_temp = 0;                                        //帧数临时记录，用于定时
    }
    explosion = function () {                                        //自身处于状态2（死亡）时执行，爆炸画面展示后消亡（状态转0）
        if(this.frames_temp +1=== this.frames){
            this.img = this.plane1_1;
        }
        else if(this.frames_temp + 3 === this.frames){
            this.img = this.plane1_2;
        }
        else if(this.frames_temp + 6 === this.frames){
            this.img = this.plane1_3;
        }
        else if(this.frames_temp + 9 === this.frames){
            this.img = this.plane1_4;
        }
        else if(this.frames_temp + 12 === this.frames){
            this.live = 0;
        }
    }
}

/*
* 敌方飞机II类
*/
class EnemyPlaneII extends Base {
    constructor(levels) {
        super();
        this.type = 2;
        this.width = 69;
        this.height = 99;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = 0 - this.height;
        this.live = 1;
        this.speed = 2 + 0.4 * levels;
        this.dy = 1;
        this.life = 5;
        this.plane2_1 = new Image(this.width,this.height);           //加载图片
        this.plane2_1.src = 'img/plane2(1).png';
        this.plane2_2 = new Image(this.width,this.height);           //加载图片
        this.plane2_2.src = 'img/plane2(2).png';
        this.plane2_3 = new Image(this.width,this.height);           //加载图片
        this.plane2_3.src = 'img/plane2(3).png';
        this.plane2_4 = new Image(this.width,this.height);           //加载图片
        this.plane2_4.src = 'img/plane2(4).png';
        this.plane2 = new Image(this.width,this.height);             //加载图片
        this.plane2.src = 'img/plane2.png';
        this.img = this.plane2;
        this.frames = 0;                                             //帧数统计，用于代替定时
        this.perish = 0;                                             //消亡倒计时
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
        this.frames_temp = 0;                                        //帧数临时记录，用于定时
    }
    explosion = function () {                                        //自身处于状态2（死亡）时执行，爆炸画面展示后消亡（状态转0）
        if(this.frames_temp +1=== this.frames){
            this.img = this.plane2_1;
        }
        else if(this.frames_temp + 3 === this.frames){
            this.img = this.plane2_2;
        }
        else if(this.frames_temp + 6 === this.frames){
            this.img = this.plane2_3;
        }
        else if(this.frames_temp + 9 === this.frames){
            this.img = this.plane2_4;
        }
        else if(this.frames_temp + 12 === this.frames){
            this.live = 0;
        }
    }
}

/*
* 敌方飞机III类
*/
class EnemyPlaneIII extends Base {
    constructor(levels) {
        super();
        this.type = 3;
        this.width = 169;
        this.height = 261;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = 0 - this.height;
        this.live = 1;
        this.speed = 1 + 0.4 * levels;
        this.dy = 1;
        this.life = 9;
        this.plane3_1 = new Image(this.width,this.height);           //加载图片
        this.plane3_1.src = 'img/plane3(1).png';
        this.plane3_2 = new Image(this.width,this.height);           //加载图片
        this.plane3_2.src = 'img/plane3(2).png';
        this.plane3_3 = new Image(this.width,this.height);           //加载图片
        this.plane3_3.src = 'img/plane3(3).png';
        this.plane3_4 = new Image(this.width,this.height);           //加载图片
        this.plane3_4.src = 'img/plane3(4).png';
        this.plane3_5 = new Image(this.width,this.height);           //加载图片
        this.plane3_5.src = 'img/plane3(5).png';
        this.plane3_6 = new Image(this.width,this.height);           //加载图片
        this.plane3_6.src = 'img/plane3(6).png';
        this.plane3 = new Image(this.width,this.height);             //加载图片
        this.plane3.src = 'img/plane3.png';
        this.img = this.plane3;
        this.frames = 0;                                             //帧数统计，用于代替定时
        this.perish = 0;                                             //消亡倒计时
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
        this.frames_temp = 0;                                        //帧数临时记录，用于定时
    }
    explosion = function () {                                        //自身处于状态2（死亡）时执行，爆炸画面展示后消亡（状态转0）
        if(this.frames_temp + 1=== this.frames){
            this.img = this.plane3_1;
        }
        else if(this.frames_temp + 3 === this.frames){
            this.img = this.plane3_2;
        }
        else if(this.frames_temp + 6 === this.frames){
            this.img = this.plane3_3;
        }
        else if(this.frames_temp + 9 === this.frames){
            this.img = this.plane3_4;
        }
        else if(this.frames_temp + 12 === this.frames){
            this.img = this.plane3_5;
        }
        else if(this.frames_temp + 15 === this.frames){
            this.img = this.plane3_6;
        }
        else if(this.frames_temp + 18 === this.frames){
            this.live = 0;
        }
    }
}

/*
* 子弹增强类
*/
class BulletUpgrade extends Base {
    constructor(x,y) {
        super();
        this.live = 1
        this.speed = 1;
        this.width = 60;
        this.height = 107;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = 0 - this.height;
        this.dx = 0;
        this.dy = 1;
        this.img = new Image(this.width,this.height);                //加载图片
        this.img.src = 'img/bulletup.png';
        this.perish = 0;                                             //消亡倒计时，以帧数计算，道具固定时间后自动消失
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
    }
    collision = function (myPlane) {
        let temp = collisionBase(this,myPlane);
        if(temp){
            this.live = 0;
            temp.update(2);
        }
    }
}

/*
* 速度增加类
*/
class SpeedUp extends Base {
    constructor(x,y) {
        super();
        this.dx = 0;
        this.dy = 1;
        this.live = 1;
        this.speed = 3;
        this.width = 58;
        this.height = 88;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = 0 - this.height;
        this.img = new Image(this.width,this.height);                //加载图片
        this.img.src = 'img/speedup.png';
        this.perish = 0;                                             //消亡倒计时，以帧数计算，道具固定时间后自动消失
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
    }
    collision = function (myPlane) {
        let temp = collisionBase(this,myPlane);
        if(temp){
            this.live = 0;
            temp.update(1);
        }
    }
}

/*
* 我方子弹类
*/
class MyBullet extends Base {
    constructor(x,y) {
        super();
        this.live = 1;
        this.x = x;
        this.y = y;
        this.dy = -1;
        this.width = 5;
        this.height = 11;
        this.speed = 6;
        this.img = new Image(this.width,this.height);                //加载图片
        this.img.src = 'img/bullet.png';
        this.perish = 0;                                             //消亡倒计时，以帧数计算
        this.deadLine = CANVAS_HEIGHT / this.speed;                  //此时间（帧数）后消亡
    }
    collision = function (enemyList) {
        let temp = collisionBase(this,enemyList);
        if(temp){
            sound2.play();
            temp.life--;
            if(temp.life <= 0){
                temp.frames_temp = temp.frames;
                temp.live = 2;
            }
        }
    }
}

/*
* 背景类
*/
class Background extends Base {
    constructor() {
        super();
        this.width = 480;
        this.height = 700;
        this.img = new Image(this.width,this.height);                //加载图片
        this.img.src = 'img/background.png';
    }
}