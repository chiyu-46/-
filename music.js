/**
 * 游戏中的音效对象
 */

/*
* 依次是背景音乐对象，集中音效对象，爆炸音效对象，射击音效对象
*/
var sound1 = new Howl({
    src:['./music/Backgroundmusic.mp3'],
    autoplay: false,                              //自动播放
    loop: true,                                  //循环播放
});

var sound2 = new Howl({
    src:['./music/hit.mp3'],
});

var sound3 = new Howl({
    src:['./music/explosion.mp3'],
});

var sound4 = new Howl({
    src:['./music/shoot.mp3'],
});
