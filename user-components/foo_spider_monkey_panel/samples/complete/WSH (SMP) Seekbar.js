window.DefinePanel('WSH (SMP) Seekbar', {author: 'AHAPXICT & Co.', version: '2.6'});
include(fb.ComponentPath + 'docs\\flags.js');
include(fb.ComponentPath + 'docs\\helpers.js');

// NOTE: Mid mouse button down = "Track title: on/off" ;  SHIFT + Right mouse button = Show menu "Configure..." ;

var font_name = window.GetProperty("|01| Font","DarkOne");
var font_size = window.GetProperty("|02| Font size", 19);
var font_style = window.GetProperty("|03| Font style",0);
var g_backcolor = eval(window.GetProperty("|04| Color background","RGB(0,0,0)"));
var g_frame = eval(window.GetProperty("|05| Color frame","RGB(31,31,31)"));
var g_color1 = eval(window.GetProperty("|06| Color seekbar 1","RGB(31,31,31)"));
var g_color2 = eval(window.GetProperty("|07| Color seekbar 2","RGB(0,0,0)"));
var g_alpha = window.GetProperty("|08| Color seekbar alpha",20);
var back_rgb, font_rgb = window.GetProperty("|09| Color text",1);
var swap_col = window.GetProperty("|10| Color swap: on/off", false);
var seek_col = window.GetProperty("|11| Color text & seekbar mix: on/off", true);
var grad_focus = window.GetProperty("|12| Gradient focus center: on/off", false);
var glow_txt = window.GetProperty("|13| Antialiased & Shadows text: on/off", false);
var seek_line = window.GetProperty("|14| Seek line: on/off", false);
var frame = window.GetProperty("|15| Frame: on/off", false);
var clock = window.GetProperty("|17| Standby clock: on/off", false);
var speed = window.GetProperty("|18| Speed scroll", 40);

function timetitle() {
    title = window.GetProperty("|16| Track title: on/off", false);
}
    timetitle();
function switchType() {
    window.SetProperty("|16| Track title: on/off", title ? false : true);
    timetitle();
}

var v_change = false;
var v_timer = null;
var currentTime = new Date();
var clock_time = window.SetInterval(on_timer, 1000);
var seek_timer;
var pos_t = 0;
var g_font;
    get_font();
function get_font(){
    g_font = gdi.Font(font_name, font_size, font_style);
}

var glow = Math.round(font_size/4);
var g_drag = 0;
var g_drag_seek = 0;
var img_to_blur;
var tfo = fb.TitleFormat("%playback_time%[/%length%][/%playback_time_remaining%]  $if(%ispaused%,暂停,     )         '('$max(0,$left($muldiv(%playback_time_seconds%,1000,%length_seconds%),$sub($len($muldiv(%playback_time_seconds%,1000,%length_seconds%)),1)))'.'$right(  $muldiv(%playback_time_seconds%,1000,%length_seconds%),1)'%)'");
var tfo1 = fb.TitleFormat("$upper([%artist% - ][%title%][ - %album%][ - %date%]     %playback_time%[/%length%][/%playback_time_remaining%])");
var days = [];
    days = new Array("  星期日 ", "  星期一 ", "  星期二 ", "  星期三", "  星期四", "  星期五 ", "  星期六");
function TimeFmt(t){
var zpad = function(n){
var str = n.toString();
return (str.length<2) ? "0"+str : str;
}
var h = Math.floor(t/3600); t-=h*3600;
var m = Math.floor(t/60); t-=m*60;
var s = Math.floor(t);
    if(h>0) return h.toString()+":"+zpad(m)+":"+zpad(s);
return m.toString()+":"+zpad(s);
}

function on_paint(gr){
var back_rgb, font_rgb;
var ww = window.Width;
var wh = window.Height;

    if (window.GetProperty("|09| Color text") == 1)  font_rgb = RGB(41,143,204), back_rgb = RGB(0,0,0);  // Blue
    if (window.GetProperty("|09| Color text") == 2)  font_rgb = RGB(6,176,37), back_rgb = RGB(0,0,0);    // Green
    if (window.GetProperty("|09| Color text") == 3)  font_rgb = RGB(205,205,205), back_rgb = RGB(0,0,0); // Grey
    if (window.GetProperty("|09| Color text") == 4)  font_rgb = RGB(191,223,255), back_rgb = RGB(0,0,0); // Light Blue
    if (window.GetProperty("|09| Color text") == 5)  font_rgb = RGB(255,0,0), back_rgb = RGB(0,0,0);     // Red
    if (window.GetProperty("|09| Color text") == 6)  font_rgb = RGB(255,255,255), back_rgb = RGB(0,0,0); // White
    if (window.GetProperty("|09| Color text") == 7)  font_rgb = RGB(255,223,63), back_rgb = RGB(0,0,0);  // Yellow

var g_color =  fb.PlaybackLength <= 0 ? g_backcolor : g_color2;
var g_color3 =  fb.PlaybackLength <= 0 ? g_frame : g_color2;
var g_color4 =  fb.PlaybackLength <= 0 ? g_frame : font_rgb;
var g_color5 =  fb.PlaybackLength <= 0 ? g_backcolor : font_rgb;

    if (swap_col){
var g_swap_col =  RGBA(getRed(g_color4),getGreen(g_color4),getBlue(g_color4),g_alpha);
var g_swap_col1 =  g_color1;
var g_swap_col2 =  RGBA(getRed(g_color5),getGreen(g_color5),getBlue(g_color5),g_alpha);
var g_swap_col3 =  g_color3;
var g_swap_col4 =  RGBA(getRed(g_color1),getGreen(g_color1),getBlue(g_color1),g_alpha);
var g_swap_col5 =  g_color1;
var g_swap_col6 =  RGBA(getRed(g_color),getGreen(g_color),getBlue(g_color),g_alpha);
var g_swap_col7 =  g_color3;
var g_swap_col8 =  RGBA(getRed(g_color5),getGreen(g_color5),getBlue(g_color5),g_alpha);
var g_swap_col9 =  RGBA(getRed(g_color4),getGreen(g_color4),getBlue(g_color4),g_alpha);
}else {
var g_swap_col =  g_color1;
var g_swap_col1 =  RGBA(getRed(g_color4),getGreen(g_color4),getBlue(g_color4),g_alpha);
var g_swap_col2 =  g_color3;
var g_swap_col3 =  RGBA(getRed(g_color5),getGreen(g_color5),getBlue(g_color5),g_alpha);
var g_swap_col4 =  g_color1;
var g_swap_col5 =  RGBA(getRed(g_color1),getGreen(g_color1),getBlue(g_color1),g_alpha);
var g_swap_col6 =  g_color3;
var g_swap_col7 =  RGBA(getRed(g_color),getGreen(g_color),getBlue(g_color),g_alpha);
var g_swap_col8 =  RGBA(getRed(g_color4),getGreen(g_color4),getBlue(g_color4),g_alpha);
var g_swap_col9 =  RGBA(getRed(g_color5),getGreen(g_color5),getBlue(g_color5),g_alpha);
}

    if (grad_focus){
var focus = eval("0.5");
}else {
var focus = eval("1.0");
}

var g_alpha_txt = g_alpha;
    if(g_alpha < 50){g_alpha_txt = 50;}
var currentHours = currentTime.getHours ( );
var currentMinutes = currentTime.getMinutes ( );
var currentSeconds = currentTime.getSeconds ( );
var currentDay = currentTime.getDay ( );
var currentDate = currentTime.getDate ( );
var currentMonth = currentTime.getMonth ( );
var currentYear = currentTime.getFullYear ( );
    currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
    currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;
    currentMonth = ( currentMonth < 10 ? "0" : "" ) + currentMonth;
var txt = "";
var pos = 0;

    if(fb.PlaybackTime > 0){
    if(g_drag){
    pos = Math.round(ww * g_drag_seek);
    txt = "<< " + TimeFmt(g_drag_seek * fb.PlaybackLength) + "/" + TimeFmt(fb.PlaybackLength) + "/" + TimeFmt(fb.PlaybackLength - g_drag_seek * fb.PlaybackLength) + " >> ";
}else{
    pos = Math.round(ww * (fb.PlaybackTime / fb.PlaybackLength));
    if (v_change)
    txt = "音量  " + fb.Volume.toFixed(2) + " dB";
else {
    if (title){
    txt = tfo1.Eval();
}else{
    txt = tfo.Eval();
}
}
}
}else{
    if (v_change)
    txt = "音量  " + fb.Volume.toFixed(2) + " dB";
else{
    if (clock && !fb.IsPlaying){
    txt = currentDate + "." + currentMonth + "." + currentYear + "     " + currentHours + ":" + currentMinutes + ":" + currentSeconds + "     " + days[currentDay];
}else{
    if(!fb.IsPlaying){
    font_rgb = RGB(20,56,78), back_rgb = RGB(0,0,0);  // "STOP" color: change color or delete line //
    txt = "播放停止";
}
}
}
}

var ww1 = gr.CalcTextWidth(txt, g_font);
    if(ww1 > ww - 10) {
    txt = txt + "     " + txt;
    ww2 = gr.CalcTextWidth(txt, g_font);
    if(pos_t <= ww1 - ww2) {
    pos_t = 0;
} else {
    pos_t = pos_t - 1;
}
    pos_t;
    ww2;
}else {
    pos_t = 0;
    ww2 = ww;
}

    gr.FillSolidRect(0, 0, ww, wh, g_backcolor);

    if(fb.PlaybackTime > 0 && wh){
    if (seek_col){
    gr.FillGradRect(0, 0, ww, wh, 90, g_swap_col, g_swap_col1, focus);
    gr.FillGradRect(pos, 0, ww, wh, 90, g_swap_col2, g_swap_col3, focus);
}else {
    gr.FillGradRect(0, 0, ww, wh, 90, g_swap_col4, g_swap_col5, focus);
    gr.FillGradRect(pos, 0, ww, wh, 90, g_swap_col6, g_swap_col7, focus);
}
}else {
}
    if (seek_line && glow_txt && wh){
    gr.SetSmoothingMode(4);
    gr.FillGradRect(pos, 0, 2, wh, 90, g_swap_col8, g_swap_col9, focus);
}else {
    if (seek_line && wh){
    gr.FillGradRect(pos, 0, 1, wh, 90, g_swap_col8, g_swap_col9, focus);
}else {
}
}
    if (glow_txt){
    gr.SetTextRenderingHint(4);
    gr.DrawString(txt, g_font, g_swap_col8, pos_t + 1, 0, ww2, wh, StringFormat(1, 1, 0, 0x00001000 | 0x00004000));
    gr.DrawString(txt, g_font, font_rgb, pos_t, 0, ww2, wh, StringFormat(1, 1, 0, 0x00001000 | 0x00004000));
}else {
    gr.GdiDrawText(txt, g_font, font_rgb, pos_t, 0, ww2, wh, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
}
    if (frame){
    gr.DrawRect(0,0, ww - 1, wh - 1, 1.0, g_frame);
}
}

// ========MENU======== //
var ShiftDown;
function on_mouse_rbtn_down(x, y, vkey){
    ShiftDown = vkey==6 ? true : false;
}

function on_mouse_rbtn_up(x, y) {

var _menu = window.CreatePopupMenu();

    _menu.AppendMenuItem(MF_STRING, 1, "蓝色");
    _menu.AppendMenuItem(MF_STRING, 2, "绿色");
    _menu.AppendMenuItem(MF_STRING, 3, "灰色")
    _menu.AppendMenuItem(MF_STRING, 4, "浅蓝");
    _menu.AppendMenuItem(MF_STRING, 5, "红色");
    _menu.AppendMenuItem(MF_STRING, 6, "白色");
    _menu.AppendMenuItem(MF_STRING, 7, "黄色");
    _menu.CheckMenuRadioItem(1, 7, window.GetProperty("|09| Color text", 1));
    _menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
    _menu.AppendMenuItem(MF_STRING, 8, title == false ? "标题" : "时间");
    _menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
    _menu.AppendMenuItem(MF_STRING, 9, "属性...");
    if (ShiftDown){
    _menu.AppendMenuItem(MF_STRING, 10, "配置...");
}
    idx = _menu.TrackPopupMenu(x, y);
    switch (idx) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
        window.SetProperty("|09| Color text", idx);
        window.Repaint();
        break;

    case 8:
        switchType();
        break;
    case 9:
        window.ShowProperties();
        break;

    case 10:
        window.ShowConfigure();
        break;

}
    _menu;
    return true
}

function on_notify_data(name, info) {
    if (name == "color_panel") {
    window.SetProperty("|09| Color text", info == 0 ? 1 : info == 1 ? 2 : info == 2 ? 3 : info == 3 ? 4 : info == 4 ? 5 : info == 5 ? 6 : 7);
    font_rgb = window.GetProperty("|09| Color text", 1);
    window.Repaint();
    }
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
}

function on_mouse_lbtn_down(x,y){
    g_drag = 1;
}

function on_mouse_lbtn_up(x,y){
    if(g_drag){
    g_drag = 0;
    g_drag_seek = x / window.Width;
    g_drag_seek = (g_drag_seek<0) ? 0 : (g_drag_seek<1) ? g_drag_seek : 1;
    fb.PlaybackTime = fb.PlaybackLength * g_drag_seek;
}
}

function on_mouse_mbtn_up(x,y) {
    switchType();
}

function on_mouse_move(x,y){
    if(g_drag){
    g_drag_seek = x / window.Width;
    g_drag_seek = (g_drag_seek<0) ? 0 : (g_drag_seek<1) ? g_drag_seek : 1;
    window.Repaint();
}
}

function on_mouse_wheel(step) {
    fb.PlaybackTime += step;
}

function on_playback_seek(time) {
    window.Repaint();
}

function on_playback_time(time){
    seek_timer && window.ClearInterval(seek_timer);
    if (pos_t < 0){
    seek_timer = window.SetInterval(function() {
    window.Repaint();
}, speed)
}else {
    seek_timer = window.SetInterval(function() {
    window.Repaint();
}, speed + 260)
}
}

function on_playback_stop() {
    if (clock){
    window.Repaint();
}else{
    window.ClearInterval(seek_timer);
    window.Repaint();
}
}

function on_playback_starting(cmd, paused){
    window.Repaint();
}

function on_playback_new_track(info){
    window.Repaint();
}

function on_timer(id){
    currentTime = new Date();
    window.Repaint();
}

function on_volume_change(val) {
    if (v_timer) {
    window.ClearTimeout(v_timer);
    v_timer = null;
}
    v_timer = window.SetTimeout( function () {
    window.ClearTimeout(v_timer);
    v_timer = null;
    v_change = false;
    window.Repaint();
}, 2000);

    v_change = true;
    window.Repaint();
}