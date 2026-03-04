window.DefinePanel('CoverFlow View (stand alone script version)', {author: 'Br3tt aka Falstaff >> http://br3tt.deviantart.com', version: '1.5.1', features: {drag_n_drop: true} });

// [Change Log]
// * 2015-02-22 : v1.5.0 >> updating repaint system + shading effect + now compliant with latest WSH Panel Mod version 1.5.7.1
// [/Installation]

// [Requirements]
// * foobar2000 v1.1 or better  >> http://foobar2000.org
// * WSH panel Mod v1.5.2 or better  >> http://code.google.com/p/foo-wsh-panel-mod/downloads/list
// * Optional: Font uni 05_53  >> http://www.dafont.com/uni-05-x.font
//    this font is required to display total tracks info on flat display mode
// [/Requirements]

// [Installation]
// * import/paste this jscript into a WSH Panel Mod instance of your foobar2000 layout (DUI or CUI)
// [/Installation]

// [Informations]
// * change colors and fonts in foobar2000 Preferences > DefaultUI or ColumsUI
// * Some Settings (*USER_xxx ones only) can be changed in window Properties
// * middle click on cover > Send album tracks to specific playlist "CoverFlow View"
// * keyboard keys : left/right arrows, Home/End, page up/down, spacebar to set focus on the centered album, Return key to play ...
// * Type as you Search feature : type artist name with keyboard to automatically set the focus on its first album
// * Think about it >> Adjust size/effects of the panel according to your cpu capacities to avoid bad perf
// [/Informations]

//=================================================// General declarations
SM_CXVSCROLL = 2;
SM_CYHSCROLL = 3;
DLGC_WANTARROWS = 0x0001;
DLGC_WANTALLKEYS = 0x0004;
// }}
// Use with MenuManager()
// {{
MF_STRING = 0x00000000;
MF_SEPARATOR = 0x00000800;
MF_GRAYED = 0x00000001;
MF_DISABLED = 0x00000002;
MF_POPUP = 0x00000010;
// }}
// Used in window.SetCursor()
// {{
IDC_ARROW = 32512;
IDC_IBEAM = 32513;
IDC_WAIT = 32514;
IDC_CROSS = 32515;
IDC_UPARROW = 32516;
IDC_SIZE = 32640;
IDC_ICON = 32641;
IDC_SIZENWSE = 32642;
IDC_SIZENESW = 32643;
IDC_SIZEWE = 32644;
IDC_SIZENS = 32645;
IDC_SIZEALL = 32646;
IDC_NO = 32648;
IDC_APPSTARTING = 32650;
IDC_HAND = 32649;
IDC_HELP = 32651;
// }}
// Use with GdiDrawText()
// {{
var DT_LEFT = 0x00000000;
var DT_RIGHT = 0x00000002;
var DT_TOP = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_SINGLELINE = 0x00000020;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_EDITCONTROL = 0x00002000;
var DT_END_ELLIPSIS = 0x00008000;
// }}
// Keyboard Flags & Tools
// {{
var VK_BACK = 0x08;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};
function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};
// }}
// {{
// Used in window.GetColorCUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontCUI()
FontTypeCUI = {
    items: 0,
    labels: 1
};
// Used in window.GetColorDUI()
ColorTypeDUI = {
    text: 0,
    background: 1,
    highlight: 2,
    selection: 3
};
// Used in window.GetFontDUI()
FontTypeDUI = {
    defaults: 0,
    tabs: 1,
    lists: 2,
    playlists: 3,
    statusbar: 4,
    console: 5
};
//}}
// {{
// Used in gr.DrawString()
function StringFormat() {
    var h_align = 0,
    v_align = 0,
    trimming = 0,
    flags = 0;
    switch (arguments.length) {
        case 3:
        trimming = arguments[2];
        case 2:
        v_align = arguments[1];
        case 1:
        h_align = arguments[0];
        break;
        default:
        return 0;
    };
    return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
};
StringAlignment = {
    Near: 0,
    Centre: 1,
    Far: 2
};
var lt_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Near);
var ct_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Near);
var rt_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Near);
var lc_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Centre);
var cc_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Centre);
var rc_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Centre);
var lb_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Far);
var cb_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Far);
var rb_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Far);
//}}
// {{
// Used in utils.GetAlbumArt()
AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4
};
//}}
// {{
// Used everywhere!
function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
};
function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
};
function getAlpha(color) {
    return ((color >> 24) & 0xff);
}

function getRed(color) {
    return ((color >> 16) & 0xff);
}

function getGreen(color) {
    return ((color >> 8) & 0xff);
}

function getBlue(color) {
    return (color & 0xff);
}
function num(strg, nb) {
    var i;
    var str = strg.toString();
    var k = nb - str.length;
    if (k > 0) {
        for (i=0;i<k;i++) {
            str = "0" + str;
        };
    };
    return str.toString();
};
//Time formatting secondes -> 0:00
function TimeFromSeconds(t){
    var zpad = function(n){
    var str = n.toString();
        return (str.length<2) ? "0"+str : str;
    };
    var h = Math.floor(t/3600); t-=h*3600;
    var m = Math.floor(t/60); t-=m*60;
    var s = Math.floor(t);
    if(h>0) return h.toString()+":"+zpad(m)+":"+zpad(s);
    return m.toString()+":"+zpad(s);
};
function TrackType(trkpath) {
    var taggable;
    var type;
    switch (trkpath) {
        case "file":
        taggable = 1;
        type = 0;
        break;
        case "cdda":
        taggable = 1;
        type = 1;
        break;
        case "FOO_":
        taggable = 0;
        type = 2;
        break;
        case "http":
    if (radio_logo){                              //  RADIO LOGOS //
        taggable = 1;
        type = 0;
    }else{
        taggable = 0;
        type = 3;
        }
        break;
        case "mms:":
        taggable = 0;
        type = 3;
        break;
        case "unpa":
        taggable = 0;
        type = 4;
        break;
        default:
        taggable = 0;
        type = 5;
    };
    return type;
};
function replaceAll(str, search, repl) {
    while (str.indexOf(search) != -1) {
        str = str.replace(search, repl);
    };
    return str;
};
function removeAccents(str) {
    var norm = new Array('À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
    'Ì','Í','Î','Ï', 'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý',
    'Þ','ß');
    var spec = new Array('A','A','A','A','A','A','AE','C','E','E','E','E',
    'I','I','I','I', 'D','N','O','O','O','O','O','O','U','U','U','U','Y',
    'b','SS');
    for (var i = 0; i < spec.length; i++) {
        str = replaceAll(str, norm[i], spec[i]);
    };
    return str;
};
//}}

//=================================================// Button object
ButtonStates = {normal: 0, hover: 1, down: 2};
button = function (normal, hover, down) {
    this.img = Array(normal, hover, down);
    this.w = this.img[0].Width;
    this.h = this.img[0].Height;
    this.state = ButtonStates.normal;
    this.update = function (normal, hover, down) {
        this.img = Array(normal, hover, down);
    };
    this.draw = function (gr, x, y, alpha) {
        this.x = x;
        this.y = y;
        this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
    };
    this.display_context_menu = function (x, y, id) {};
    this.repaint = function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    };
    this.checkstate = function (event, x, y) {
        this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
        this.old = this.state;
        switch (event) {
         case "down":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
                break;
            };
            break;
         case "up":
            this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
            break;
         case "right":
             if(this.ishover) this.display_context_menu(x, y, id);
             break;
         case "move":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
                break;
            };
            break;
         case "leave":
            this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
            break;
        };
        if(this.state!=this.old) this.repaint();
        return this.state;
    };
};

//=================================================// Tools (general)
function get_system_scrollbar_width() {
    var tmp = utils.GetSystemMetrics(SM_CXVSCROLL);
    return tmp;
};

function get_system_scrollbar_height() {
    var tmp = utils.GetSystemMetrics(SM_CYHSCROLL);
    return tmp;
};

String.prototype.repeat = function(num) {
    return new Array(num+1).join(this);
};

function getTimestamp() {
    var d, s1, s2, s3, hh, min, sec, timestamp;
    d = new Date();
    s1 = d.getFullYear();
    s2 = (d.getMonth() + 1);
    s3 = d.getDate();
    hh = d.getHours();
    min = d.getMinutes();
    sec = d.getSeconds();
    if(s3.length == 1) s3 = "0" + s3;
    timestamp = s1 + ((s2 < 10) ? "-0" : "-") + s2 + ((s3 < 10) ? "-0" : "-" ) + s3 + ((hh < 10) ? " 0" : " ") + hh + ((min < 10) ? ":0" : ":") + min + ((sec < 10) ? ":0" : ":") + sec;
    return timestamp;
};

//=================================================// Image declarations
var nocover;
var nocover_img;
var streamcover;
var streamcover_img;
var loading;
var loading_img;
var star_img_off;
var star_img_on;
var star_img_hov;
var star_img_kill;
var toggle_scrollbar;
var menu_button;
var glass_reflect_img;

//=================================================// Cover Tools
image_cache = function () {
    this._cachelist = {};
    this.hit = function (metadb) {
        var img = this._cachelist[metadb.Path];
        if (list.drag_stop && typeof img == "undefined") {
            if(!cover.load_timer) {
                cover.load_timer = window.SetTimeout(function() {
                    utils.GetAlbumArtAsync(window.ID, metadb, 0, true, false, false);
                    cover.load_timer && window.ClearTimeout(cover.load_timer);
                    cover.load_timer = false;
                }, 20);
            };
        };
        return img;
    };
    this.getit = function (metadb, track_type, image) {
        var img;
        var quotient = (panel.flat_mode) ? 2 : 12;
        if(cover.keepaspectratio) {
            if(!image) {
                var pw = (cover.w+cover.margin*quotient);
                var ph = (cover.h+cover.margin*quotient);
            } else {
                if(image.Height>=image.Width) {
                    var ratio = image.Width / image.Height;
                    var pw = (cover.w+cover.margin*quotient)*ratio;
                    var ph = (cover.h+cover.margin*quotient);
                } else {
                    var ratio = image.Height / image.Width;
                    var pw = (cover.w+cover.margin*quotient);
                    var ph = (cover.h+cover.margin*quotient)*ratio;
                };
            };
        } else {
            var pw = (cover.w+cover.margin*quotient);
            var ph = (cover.h+cover.margin*quotient);
        };
        // item.cover_type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
        if(track_type!=3) {
            if(metadb) {
                img = FormatCover(image, pw, ph);
                if(!img) {
                    img = nocover_img;
                    //item.cover_type = 0;
                } else {
                    //item.cover_type = 1;
                };
            };
        } else {
            img = streamcover_img;
            //item.cover_type = 3;
        };
        this._cachelist[metadb.Path] = img;
        return img;
    };
};
var g_image_cache = new image_cache;

function FormatCover(image, w, h) {
	if(!image || w<=0 || h<=0) return image;
    if(cover.draw_glass_effect) {
        var new_img = image.Resize(w, h, 2);
        var gb = new_img.GetGraphics();
        if(h>w) {
            gb.DrawImage(glass_reflect_img, Math.floor((h-w)/2)*-1, 0, h, h, 0, 0, glass_reflect_img.Width, glass_reflect_img.Height, 0, 150);
        } else {
            gb.DrawImage(glass_reflect_img, 0, Math.floor((w-h)/2)*-1, w, w, 0, 0, glass_reflect_img.Width, glass_reflect_img.Height, 0, 150);
        };
        new_img.ReleaseGraphics(gb);
        return new_img;
    } else {
        return image.Resize(w, h, 2);
    };
};

function draw_glass_reflect(w, h) {
    // Mask for glass effect
    var Mask_img = gdi.CreateImage(w, h);
    var gb = Mask_img.GetGraphics();
    gb.FillSolidRect(0,0,w,h,0xffffffff);
    gb.FillGradRect(0,0,w-20,h,0,0x99000000,0,1.0);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(-20, 25, w*2+40, h*2, 0xffffffff);
    Mask_img.ReleaseGraphics(gb);
    // drawing the white rect
    var glass_img = gdi.CreateImage(w, h);
    gb = glass_img.GetGraphics();
    gb.FillSolidRect(0, 0, w, h, 0xffffffff);
    glass_img.ReleaseGraphics(gb);
    // resizing and applying the mask
    var Mask = Mask_img.Resize(w, h);
    glass_img.ApplyMask(Mask);
    return glass_img;
};

function reset_cover_timers() {
    cover.load_timer && window.ClearTimeout(cover.load_timer);
    cover.load_timer = false;
    cover.load_timer2 && window.ClearTimeout(cover.load_timer2);
    cover.load_timer2 = false;
};

function on_get_album_art_done(metadb, art_id, image, image_path) {
    var len = list.item.length;
    if(!cover.load_timer2 && !g_mousewheel_timer) {
        cover.load_timer2 = window.SetTimeout(function() {
            cover.load_timer2 && window.ClearTimeout(cover.load_timer2);
            cover.load_timer2 = false;

            for(var i=0;i<len;i++) {
                if(list.item[i].metadb) {
                    if(list.item[i].metadb.Compare(metadb)) {
                        list.item[i].cover_img = g_image_cache.getit(metadb, list.item[i].track_type, image);
                        if(list.item[i].show) {
                            if(panel.vertical_mode) {
                                if(!list.item[i].y) list.item[i].y = 5; else if(list.item[i].y<5) list.item[i].y = 5;
                                try{
                                    full_repaint();
                                    //window.RepaintRect(cover.pad_left_mid-10, list.item[i].y-10, ww-cover.pad_left_mid+20, list.item[i].h+20);
                                } catch(e) {};
                            } else {
                                if(!list.item[i].x) list.item[i].x = 5; else if(list.item[i].x<5) list.item[i].x = 5;
                                try{
                                    full_repaint();
                                    //window.RepaintRect(list.item[i].x-10, cover.pad_top_mid-10, list.item[i].w+20, wh-cover.pad_top_mid+20);
                                } catch(e) {};
                            };
                        } else {
                            list.item[i].show = true;
                        };
                        break;
                    };
                };
            };
        }, 20);
    }
};

function full_repaint() {
    repaint_main1 = repaint_main2;
};

//=================================================// Item Object
ItemStates = {normal: 0, hover: 1, selected: 2};
item = function (id, idx, gh_id) {
    var i;
    if (typeof this.id == "undefined") {
        if(id<0) {
            this.id = id;
            this.idx = idx;
            this.gh_id = gh_id;
            this.metadb = false;
            this.albumartist = "";
            this.album = "";
            this.track_type = null;
            this.group_info = "";
        } else {
            this.id = id;
            this.idx = idx;
            this.gh_id = gh_id;
            this.metadb = list.handlelist[this.id];
            if(this.metadb) {
                this.albumartist = tf_albumartist.EvalWithMetadb(this.metadb);
                this.album = tf_album.EvalWithMetadb(this.metadb);
                this.track_type = TrackType(this.metadb.RawPath.substring(0,4));
                this.group_info = tf_group_info.EvalWithMetadb(this.metadb);
                this.group_key = tf_group_key.EvalWithMetadb(this.metadb);
            };
        };
        this.left = 0;
        this.top = 0;
    };

    this.update_infos = function() {
        if(this.metadb) {
            this.albumartist = tf_albumartist.EvalWithMetadb(this.metadb);
            this.track_type = TrackType(this.metadb.RawPath.substring(0,4));
            this.group_info = tf_group_info.EvalWithMetadb(this.metadb);
            this.group_key = tf_group_key.EvalWithMetadb(this.metadb);
        } else {
            this.albumartist = "";
            this.track_type = null;
            this.group_info = "";
        };
    };

    this.draw = function(gr, id, idx, level, show) {
        if(panel.vertical_mode) {
            // --------------
            // VERTICAL MODE
            // --------------
            this.show = show;
            if(panel.flat_mode) {
                this.h = cover.h;
                this.w = cover.h;
                this.x = cover.pad_left_mid;
                this.x += Math.floor(((ww-cover.pad_left_mid-cover.pad_right_mid)-cover.w)/2);
                this.y = Math.floor((wh/2) - (this.h/2) + (cover.margin/2)*0) - (level*this.h);
            } else {
                if(list.mid==idx) {
                    this.h = cover.h;
                    this.w = cover.h;
                    this.x = cover.pad_left_mid;
                    this.x += Math.floor(((ww-cover.pad_left_mid-cover.pad_right_mid)-cover.w)/2);
                    this.y = Math.floor((wh/2) - (cover.h/2));
                } else {
                    this.h = Math.abs(level)==1 ? cover.h - cover.normal_delta*1 : cover.h - cover.normal_delta*2;
                    this.w = this.h;
                    this.y = Math.abs(level)==1 ? Math.floor((wh/2) - (this.h/2)) - (level*(this.h-0010)): Math.floor((wh/2) - (this.h/2)) - (level*this.h);
                    this.x = Math.abs(level)==1 ? cover.pad_left_mid + Math.ceil(cover.normal_delta/2) : cover.pad_left_mid + cover.normal_delta;
                    this.x += Math.floor(((ww-cover.pad_left_mid-cover.pad_right_mid)-cover.w)/2);
                };
            };
            if(panel.scroll_effect) this.y += scroll.delta;
            // cover
            if(this.id>=0) {
                this.cover_img = g_image_cache.hit(this.metadb);
                if(typeof(this.cover_img) != "undefined") {
                    // *** check aspect ratio *** //
                    if(this.cover_img.Height>=this.cover_img.Width) {
                        var ratio = this.cover_img.Width / this.cover_img.Height;
                        var pw = this.w*ratio;
                        var ph = this.h;
                        this.left = Math.floor((ph-pw) / 2);
                        this.top = 0;
                        this.x += this.left;
                        this.y += this.top;
                        this.w = this.w - this.left*2 - cover.margin - 1;
                        this.h = this.h - this.top*2 - cover.margin - 1;
                    } else {
                        var ratio = this.cover_img.Height / this.cover_img.Width;
                        var pw = this.w;
                        var ph = this.h*ratio;
                        this.top = Math.floor((pw-ph) / 2);
                        this.left = 0;
                        this.x += this.left;
                        this.y += this.top;
                        this.w = this.w - this.left*2 - cover.margin - 1;
                        this.h = this.h - this.top*2 - cover.margin - 1;
                    };
                    // Draw true Cover
                    gr.DrawImage(this.cover_img, this.x, Math.floor(cover.margin/2)+this.y, this.w, this.h, 0, 0, this.cover_img.Width, this.cover_img.Height, 0, 255);
                    gr.DrawRect(this.x, Math.floor(cover.margin/2)+this.y, this.w-1, this.h-1, 1.0, RGB(90,90,90));
                    gr.DrawRect(this.x, Math.floor(cover.margin/2)+this.y, this.w-1, this.h-1, 1.0, g_textcolor&0x40ffffff);
                } else {
                    // adjust cover size with margin
                    this.w = this.w - cover.margin - 1;
                    this.h = this.h - cover.margin - 1;
                    // Draw loading Cover
                    gr.DrawImage(loading_img, this.x, Math.floor(cover.margin/2)+this.y, this.w, this.h, 0, 0, loading_img.Width, loading_img.Height, 0, 255);
                    gr.DrawRect(this.x, Math.floor(cover.margin/2)+this.y, this.w-1, this.h-1, 1.0, g_backcolor);
                    gr.DrawRect(this.x, Math.floor(cover.margin/2)+this.y, this.w-1, this.h-1, 1.0, g_textcolor&0x40ffffff);
                };
                // Draw text item info if flat mode activated
                if(panel.flat_mode && panel.show_text) {
                    var text_y = this.y+this.h+this.top+Math.floor(cover.margin/2);
                    var text_x = cover.pad_left_mid;
                    var text_h = cover.margin;
                    var text_w = ww - cover.pad_left_mid*2 - (scrollbar.show?vscrollbar.w:0);
                    if(list.item[list.mid].id>=0) {
                        try {
                            gr.GdiDrawText(this.album, g_font, g_backcolor, text_x, text_y+1, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.GdiDrawText(this.album, g_font, g_textcolor, text_x, text_y, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        } catch(e) {
                            gr.GdiDrawText(this.album, gdi.Font("tahoma", 11), g_backcolor, text_x, text_y+1, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.GdiDrawText(this.album, gdi.Font("tahoma", 11), g_textcolor, text_x, text_y, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        };
                    };
                };
                // focus item border (selection marker)
                if(typeof(this.cover_img) != "undefined" && this.gh_id == list.selected_gh_id) {
                    list.focus_id_item_idx = this.idx;
                    if(cover.draw_focus_border) {
                        gr.SetSmoothingMode(2);
                        gr.DrawRect(this.x-1, Math.floor(cover.margin/2)+this.y-1, this.w-cover.margin*0+1, this.h-cover.margin*0+2, 3.0, g_backcolor_sel);
                        gr.DrawRect(this.x-2, Math.floor(cover.margin/2)+this.y-2, this.w-cover.margin*0+3, this.h-cover.margin*0+4, 1.0, RGBA(255,255,255,60));
                        gr.SetSmoothingMode(0);
                        gr.DrawRect(this.x+1, Math.floor(cover.margin/2)+this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, g_backcolor_sel);
                        gr.DrawRect(this.x+1, Math.floor(cover.margin/2)+this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, RGBA(0,0,0,60));
                    };
                };
                // total tracks counter
                if(panel.flat_mode) {
                    if(panel.tracks_counter_show) {
                        if(typeof(this.cover_img) != "undefined") {
                            gr.SetSmoothingMode(2);
                            gr.FillSolidRect(this.x-7, Math.floor(cover.margin/2)+this.y-6, 28, 16, RGBA(0,0,0,210));
                            gr.DrawRect(this.x-6, Math.floor(cover.margin/2)+this.y-5, 26, 14, 1.0, RGBA(255,255,255,60));
                            gr.DrawRect(this.x-7, Math.floor(cover.margin/2)+this.y-6, 28, 16, 1.0, RGBA(0,0,0,200));
                            gr.GdiDrawText(list.groups[this.gh_id], mini_font, RGB(250,250,250), this.x-6, Math.floor(cover.margin/2)+this.y-6, 29, 16, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.SetSmoothingMode(0);
                        };
                    };
                };
            };
            this.y = this.y + Math.floor(cover.margin/2);
        } else {
            // ----------------
            // HORIZONTAL MODE
            // ----------------
            this.show = show;
            if(panel.flat_mode) {
                this.w = cover.w;
                this.h = cover.w;
                this.y = cover.pad_top_mid;
                this.y += Math.floor(((wh-cover.pad_top_mid-cover.pad_bot_mid)-cover.h)/2);
                this.x = Math.floor((ww/2) - (this.w/2) + (cover.margin/2)*0) - (level*this.w);
            } else {
                if(list.mid==idx) {
                    this.w = cover.w;
                    this.h = cover.w;
                    this.y = cover.pad_top_mid;
                    this.y += Math.floor(((wh-cover.pad_top_mid-cover.pad_bot_mid)-cover.h)/2);
                    this.x = Math.floor((ww/2) - (cover.w/2));
                } else {
                    this.w = Math.abs(level)==1 ? cover.w - cover.normal_delta*1 : cover.w - cover.normal_delta*2;
                    this.h = this.w;
                    this.x = Math.abs(level)==1 ? Math.floor((ww/2) - (this.w/2)) - (level*(this.w-0010)): Math.floor((ww/2) - (this.w/2)) - (level*this.w);
                    this.y = Math.abs(level)==1 ? cover.pad_top_mid + Math.ceil(cover.normal_delta/2) : cover.pad_top_mid + cover.normal_delta;
                    this.y += Math.floor(((wh-cover.pad_top_mid-cover.pad_bot_mid)-cover.h)/2);
                };
            };
            if(panel.scroll_effect) this.x += scroll.delta;
            // cover
            if(this.id>=0) {
                this.cover_img = g_image_cache.hit(this.metadb);
                if(typeof(this.cover_img)!="undefined") {
                    // *** check aspect ratio *** //
                    if(this.cover_img.Height>=this.cover_img.Width) {
                        var ratio = this.cover_img.Width / this.cover_img.Height;
                        var pw = this.w*ratio;
                        var ph = this.h;
                        this.left = Math.floor((ph-pw) / 2);
                        this.top = 0;
                        this.x += this.left;
                        this.y += this.top*2;
                        this.w = this.w - this.left*2 - cover.margin - 1;
                        this.h = this.h - this.top*2 - cover.margin - 1;
                    } else {
                        var ratio = this.cover_img.Height / this.cover_img.Width;
                        var pw = this.w;
                        var ph = this.h*ratio;
                        this.top = Math.floor((pw-ph) / 2);
                        this.left = 0;
                        this.x += this.left;
                        this.y += this.top*2;
                        this.w = this.w - this.left*2 - cover.margin - 1;
                        this.h = this.h - this.top*2 - cover.margin - 1;
                    };
                    // Draw Reflect (true COVER)
                    var reflect_strength = 255-Math.floor(cover.reflect_strength_percent*2.55);
                    if(cover.draw_reflection && reflect_strength>0 && cover.reflect_strength_percent>0) {
                        gr.DrawImage(this.cover_img, Math.floor(cover.margin/2)+this.x+this.w, this.y + this.h, -1*this.w, this.h, 0, 0, this.cover_img.Width, this.cover_img.Height, 180, 255);
                        //gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y + this.h+1, this.w-1, this.h-1, 1.0, g_backcolor);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y + this.h+1, this.w-1, this.h-1, 1.0, RGB(70,70,70));
                        // Overlay
                        if(panel.flat_mode) {
                            gr.FillGradRect(Math.floor(cover.margin/2)+this.x-1, this.y + this.h - 10, this.w+2, this.h + 11, 90, RGBA(g_backcolor_R, g_backcolor_G, g_backcolor_B, reflect_strength), g_backcolor, 1.0);
                        } else {
                            gr.FillGradRect(Math.floor(cover.margin/2)+this.x, this.y + this.h - 10, this.w, this.h + 11, 90, RGBA(g_backcolor_R, g_backcolor_G, g_backcolor_B, reflect_strength), g_backcolor, 1.0);
                        };
                    };
                    // Draw true Cover
                    gr.DrawImage(this.cover_img, Math.floor(cover.margin/2)+this.x, this.y, this.w, this.h, 0, 0, this.cover_img.Width, this.cover_img.Height, 0, 255);
                    //gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y, this.w-1, this.h-1, 1.0, g_backcolor);
                    gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y, this.w-1, this.h-1, 1.0, RGB(70,70,70));
                } else {
                    // adjust cover size with margin
                    this.w = this.w - cover.margin - 1;
                    this.h = this.h - cover.margin - 1;
                    // Draw Reflect (loading COVER)
                    var reflect_strength = 255-Math.floor(cover.reflect_strength_percent*2.55);
                    if(cover.draw_reflection && reflect_strength>0 && cover.reflect_strength_percent>0) {
                        gr.DrawImage(loading_img, Math.floor(cover.margin/2)+this.x+this.w, this.y + this.h, -1*this.w, this.h, 0, 0, loading_img.Width, loading_img.Height, 180, 255);
                        //gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y + this.h+1, this.w-1, this.h-1, 1.0, g_backcolor);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y + this.h+1, this.w-1, this.h-1, 1.0, RGB(70,70,70));
                        // Overlay
                        gr.FillGradRect(Math.floor(cover.margin/2)+this.x, this.y + this.h - 10, this.w, this.h + 11, 90, RGBA(g_backcolor_R, g_backcolor_G, g_backcolor_B, reflect_strength), g_backcolor, 1.0);
                    };
                    // Draw loading Cover
                    gr.DrawImage(loading_img, Math.floor(cover.margin/2)+this.x, this.y, this.w, this.h, 0, 0, loading_img.Width, loading_img.Height, 0, 255);
                    //gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y, this.w-1, this.h-1, 1.0, g_backcolor);
                    gr.DrawRect(Math.floor(cover.margin/2)+this.x, this.y, this.w-1, this.h-1, 1.0, RGB(70,70,70));
                };
                // item info if flat mode activated (tangle effect off)
                if(panel.flat_mode && panel.show_text) {
                    var text_x = this.x + Math.floor(this.w/2) - Math.floor(cover.w/2) + cover.margin;
                    var text_y = wh - cover.pad_bot_mid - cover.margin;
                    var text_w = cover.w - cover.margin;
                    var text_h = (cover.pad_bot_mid + cover.margin) - (scrollbar.show?hscrollbar.h:0);
                    if(list.item[list.mid].id>=0) {
                        try {
                            gr.GdiDrawText(this.album, g_font, g_backcolor, text_x, text_y+1, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.GdiDrawText(this.album, g_font, g_textcolor, text_x, text_y, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        } catch(e) {
                            gr.GdiDrawText(this.album, gdi.Font("tahoma", 11), g_backcolor, text_x, text_y+1, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.GdiDrawText(this.album, gdi.Font("tahoma", 11), g_textcolor, text_x, text_y, text_w, text_h, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        };
                    };
                };
                // focus item border (selection marker) except if the item is the centered one (<>list.item[list.mid])
                /*
                if(this.idx!=list.mid) {
                    if(typeof(this.cover_img) != "undefined" && this.gh_id == list.selected_gh_id) {
                        list.focus_id_item_idx = this.idx;
                        if(cover.draw_focus_border) {
                            gr.SetSmoothingMode(2);
                            gr.DrawRoundRect(Math.floor(cover.margin/2)+this.x-1, this.y-1, this.w-cover.margin*0+1, this.h-cover.margin*0+2, 2, 2, 3.0, g_backcolor_sel);
                            gr.DrawRoundRect(Math.floor(cover.margin/2)+this.x-2, this.y-2, this.w-cover.margin*0+3, this.h-cover.margin*0+4, 3, 3, 1.0, RGBA(255,255,255,60));
                            gr.SetSmoothingMode(0);
                            gr.DrawRect(Math.floor(cover.margin/2)+this.x+1, this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, g_backcolor_sel);
                            gr.DrawRect(Math.floor(cover.margin/2)+this.x+1, this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, RGBA(0,0,0,20));
                        };
                    };
                };
                */
                // focus item border (selection marker)
                if(typeof(this.cover_img) != "undefined" && this.gh_id == list.selected_gh_id) {
                    list.focus_id_item_idx = this.idx;
                    if(cover.draw_focus_border) {
                        gr.SetSmoothingMode(2);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x-1, this.y-1, this.w-cover.margin*0+1, this.h-cover.margin*0+2, 3.0, g_backcolor_sel);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x-2, this.y-2, this.w-cover.margin*0+3, this.h-cover.margin*0+4, 1.0, RGBA(255,255,255,60));
                        gr.SetSmoothingMode(0);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x+1, this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, g_backcolor_sel);
                        gr.DrawRect(Math.floor(cover.margin/2)+this.x+1, this.y+1, this.w-cover.margin*0-3, this.h-cover.margin*0-2, 1.0, RGBA(0,0,0,60));
                    };
                };
                // total tracks counter
                if(panel.flat_mode) {
                    if(panel.tracks_counter_show) {
                        if(typeof(this.cover_img) != "undefined") {
                            gr.SetSmoothingMode(2);
                            gr.FillSolidRect(this.x-1, this.y-6, 28, 16, RGBA(0,0,0,210));
                            gr.DrawRect(this.x-0, this.y-5, 26, 14, 1.0, RGBA(255,255,255,60));
                            gr.DrawRect(this.x-1, this.y-6, 28, 16, 1.0, RGBA(0,0,0,200));
                            gr.GdiDrawText(list.groups[this.gh_id], mini_font, RGB(250,250,250), this.x, this.y-6, 29, 16, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                            gr.SetSmoothingMode(0);
                        };
                    };
                };
            };
            this.x = this.x + Math.floor(cover.margin/2);
        };
    };

    this.checkstate = function (event, x, y, id) {
        if(y<toolbar.delta) return true;
        if(this.id>=0) {
            this.ishover = (x > this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h);
        } else {
            this.ishover = false;
        };
        switch (event) {
        case "down":
            if(this.id>=0) {
                if(plman.IsPlaylistItemSelected(panel.active_playlist, this.id)) {
                    if(this.ishover) {
                        if(panel.lock_playlist) {
                            this.checkstate("mid", x, y, id);
                        } else {
                            SelectGroupItems(this.id, this.gh_id, true);
                        };
                        if(panel.scroll_effect) {
                          if(this.idx<list.mid) {
                              var tmp = list.mid - this.idx;
                              scrollcoverflow(0, tmp, scroll.factor);
                          } else if(this.idx>list.mid) {
                              var tmp = this.idx - list.mid;
                              scrollcoverflow(tmp, 0, scroll.factor);
                          }
                        }
                        g_saved = this;
                        refresh_spv(panel.active_playlist, bool_on_size);
                    };
                } else {
                    if(this.ishover) {
                        if(utils.IsKeyPressed(VK_SHIFT)) {
                            if(list.focus_id != this.id) {
                                if(list.SHIFT_start_id!=null) {
                                    //SelectAtoB(list.SHIFT_start_id, this.id);
                                } else {
                                    //SelectAtoB(list.focus_id, this.id);
                                };
                            };
                        } else if(utils.IsKeyPressed(VK_CONTROL)) {
                            if(panel.lock_playlist) {
                                this.checkstate("mid", x, y, id);
                            } else {
                                SelectGroupItems(this.id, this.gh_id, true);
                                if(panel.scroll_effect) {
                                  if(this.idx<list.mid) {
                                      var tmp = list.mid - this.idx;
                                      scrollcoverflow(0, tmp, scroll.factor);
                                  } else if(this.idx>list.mid) {
                                      var tmp = this.idx - list.mid;
                                      scrollcoverflow(tmp, 0, scroll.factor);
                                  }
                                }
                            };
                        } else {
                            SelectGroupItems(this.id, this.gh_id, true);
                            if(panel.scroll_effect) {
                              if(this.idx<list.mid) {
                                  var tmp = list.mid - this.idx;
                                  scrollcoverflow(0, tmp, scroll.factor);
                              } else if(this.idx>list.mid) {
                                  var tmp = this.idx - list.mid;
                                  scrollcoverflow(tmp, 0, scroll.factor);
                              }
                            }
                            g_saved = this;
                            if(panel.lock_playlist) {
                                g_saved.checkstate("mid", x, y, id);
                            };
                        };
                    };
                };
            } else {
                g_saved = null;
            };
            break;

        case "dblclk":
            if(this.id>=0 && g_saved!=null) {
                if(plman.IsPlaylistItemSelected(panel.active_playlist, this.id)) {
                    if(panel.lock_playlist) {
                        if(this.id==g_saved.id) {
                            plman.ExecutePlaylistDefaultAction(panel.active_playlist, list.hlist[g_saved.gh_id]);
                            g_saved = null;
                        };
                    } else {
                        if(this.id==g_saved.id) {
                            plman.ExecutePlaylistDefaultAction(panel.active_playlist, list.hlist[g_saved.gh_id]);
                            g_saved = null;
                            full_repaint();
                        };
                    };
                };
            };
            break;

        case "mid":
            if(this.ishover) {
                if(plman.GetPlaylistName(panel.active_playlist)!="CoverFlow View") {
                    SelectGroupItems(this.id, this.gh_id, true);
                    var found = false;
                    var playlist_CF_id = 0;
                    var source_pl = panel.active_playlist;
                    var pl_count = plman.PlaylistCount;
                    for(var i=0; i<pl_count; i++) {
                        if(plman.GetPlaylistName(i)=="CoverFlow View") {
                            found = true;
                            playlist_CF_id = i;
                            break;
                        };
                    };
                    if(!found) {
                        bypass.on_playlists_changed = true;
                        playlist_CF_id = plman.PlaylistCount;
                        plman.CreatePlaylist(plman.PlaylistCount, "CoverFlow View");
                    };
                    plman.ActivePlaylist = playlist_CF_id;
                    fb.ClearPlaylist();
                    var insert_index = plman.PlaylistItemCount(playlist_CF_id);
                    plman.InsertPlaylistItems(playlist_CF_id, insert_index, plman.GetPlaylistSelectedItems(source_pl), false);
                    plman.SetPlaylistFocusItem(playlist_CF_id, 0);
                };
            };
            break;

        case "right":
            if(this.ishover) {
                if(panel.lock_playlist) {
                    list.selected_gh_id = this.gh_id;
                    list.focus_id = this.id;
                    bypass.on_item_focus_change = true;
                    this.checkstate("mid", x, y, id);
                } else {
                    list.selected_gh_id = this.gh_id;
                    list.focus_id = this.id;
                    bypass.on_item_focus_change = true;
                    SelectGroupItems(this.id, this.gh_id, true);
                };
            };
            break;

        case "up":

            break;

        case "move":

            break;

        case "leave":

            break;
        };
        return this.ishover;
    };
};

//=================================================// Titleformat field
var radio_logo = window.GetProperty("*USER.Radio Logos: on/off", true);
var tf_path = fb.TitleFormat("$left(%_path_raw%,4)");
if (radio_logo){
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,%title%)");
var tf_album = fb.TitleFormat("$if2(%album%,$if(%length%,'Single(s)',%title%))");
var tf_group_key = fb.TitleFormat(window.GetProperty("*USER.group Key", "$if($or($not(%length%),$stricmp($left(%path%,7),)),%title%$directory(%path%),%album%$directory(%path%))"));
}else{
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,'Stream')");
var tf_album = fb.TitleFormat("$if2(%album%,$if(%length%,'Single(s)','Web Radio'))");
var tf_group_key = fb.TitleFormat(window.GetProperty("*USER.group Key", "$if($or($not(%length%),$stricmp($left(%path%,7),)),%album artist%%album%,%album%$directory(%path%))"));
}
var search_delay = window.GetProperty("*USER.search Delay Time: ms", "400");
var tf_search_key = fb.TitleFormat(window.GetProperty("*USER.search Key", "$if(%length%,%album artist%%album%,%title%)"));
var tf_group_info = fb.TitleFormat(window.GetProperty("*USER.group TF text info", "$if(%album artist%,[%album artist%][ | %album%][ | %date%],$if(%length%,$directory(%path%),%title%))"));

//=================================================// Globals
var g_instancetype = window.InstanceType;
var g_font = null;
var g_font_headers = null;
var mini_font = gdi.Font("uni 05_53", 8, 0);
var ww = 0, wh = 0;
var mouse_x = 0, mouse_y = 0;
var g_textcolor = 0, g_textcolor_sel = 0, g_textcolor_hl = 0, g_backcolor = 0, g_backcolor_sel = 0;
var repaint_main = true, repaint_main1 = true, repaint_main2 = true, g_timer1 = false;
var window_visible = false;
var g_metadb;
var bool_on_size = false;
var g_search_string = "";
var incsearch_font = gdi.Font("segoe ui", 9, 0);
var incsearch_font_big = gdi.Font("segoe ui", 20, 1);
var clear_incsearch_timer = false;
var incsearch_timer = false;
var incsearch_timer_lock = false;
var g_saved = null;
var hand = false;
var g_menu_displayed = false;
var g_drag = false;
var g_mousewheel_timer = false;

PLAYLISTS = {
    mediaLibraryIndex: 0
};

bypass = {
    on_item_focus_change: false,
    on_playlists_changed: false
};

panel = {
    max_width: 250,
    max_height: 250,
    arr_buttons: Array(),
    show_text: window.GetProperty("SYSTEM.panel.album.info", true),
    lock_playlist: window.GetProperty("SYSTEM.panel.lock.playlist", false),
    active_playlist: window.GetProperty("SYSTEM.panel.active.playlist", 0),
    vertical_mode: false,
    scroll_effect: window.GetProperty("SYSTEM.panel.scroll.effect", true),
    flat_mode: window.GetProperty("SYSTEM.panel.flat.mode", false),
    custom_textcolor: window.GetProperty("*USER.custom.text.color.normal", "RGB(155,155,155)"),
    custom_textcolor_selection: window.GetProperty("*USER.custom.text.color.selection", "RGB(155,155,155)"),
    custom_backcolor: window.GetProperty("*USER.custom.background.color", "RGB(0,0,0)"),
    custom_colors: window.GetProperty("SYSTEM.panel.custom.colors", true),
    tracks_counter_show: window.GetProperty("*USER.total.tracks.visible", true),
    side_shadows_show: window.GetProperty("SYSTEM.side.shadows.visible", true),
    properties_separator: window.GetProperty("----------------------------", "----------------------------")
};
list = {
    first_launch: true,
    total: 0,
    total_gh: 0,
    start_id: 0,
    nbvis: 0,
    mid: 0,
    item: Array(),
    hlist: Array(),
    groups: Array(),
    handlelist: null,
    metadblist_selection: plman.GetPlaylistSelectedItems(panel.active_playlist),
    focus_id: 0,
    focus_id_item_idx: 0,
    selected_gh_id: 0,
    marker_id: 0,
    gh_id: 0,
    mousewheel_timer_value: 5,
    key_timer_value: 60,
    nowplaying: 0,
    SHIFT_start_id: null,
    SHIFT_count: 0,
    inc_search_noresult: false,
    nb_cover_to_draw: 0,
    buttonclicked: false,
    drag_stop: true,
    drag_timer: false
};
images = {
    nocover: window.GetProperty("*USER.image.nocover", ".\\themes\\DarkOne4Mod\\Images\\NoFront.png"), //  ".\\images\\nocover.png"
    stream: window.GetProperty("*USER.image.stream", ".\\themes\\DarkOne4Mod\\Images\\Radio.png"),     //  ".\\images\\stream.png"
    loading: window.GetProperty("*USER.image.loading", ".\\themes\\DarkOne4Mod\\Images\\Loading.png"), //  ".\\images\\loading.png"
};
scroll = {
    delta: 0,
    step: 0,
    timerID: false,
    nbcovers: 0,
    direction: 0,
    factor: 3
};
toolbar = {
    h: 0,
    lock: window.GetProperty("SYSTEM.toolbar.lock", false),
    button_total: 3,
    buttons: Array(),
    timerID_on: false,
    timerID_off: false,
    timerID1: false,
    timerID2: false,
    collapsed_y: -24,
    delta: 0,
    step: 3,
    state: false
};
scrollbar = {
    theme: false,
//    themed: window.GetProperty("SYSTEM.scrollbar.themed", false),
    show: window.GetProperty("SYSTEM.scrollbar.visible", true),
    visible: true,
    step: 3,
    letter: null,
    button_total: 2,
    arr_buttons: Array(),
    timerID: false
}
hscrollbar = {
    hover: false,
    x: 0,
    y: 0,
    default_h: get_system_scrollbar_height(),
    h: get_system_scrollbar_height(),
    w: 0
};
vscrollbar = {
    hover: false,
    x: 0,
    y: 0,
    default_w: get_system_scrollbar_width(),
    w: get_system_scrollbar_width(),
    h: 0
};
scrollbarbt = {
    timerID1: false,
    timerID2: false,
    timer1_value: 400,
    timer2_value: 60
};
button_up = {
    img_normal: null,
    img_hover: null,
    img_down: null,
    x: 0,
    y: 0,
    w: hscrollbar.default_h,
    h: hscrollbar.default_h
};
button_down = {
    img_normal: null,
    img_hover: null,
    img_down: null,
    x: 0,
    y: 0,
    w: hscrollbar.default_h,
    h: hscrollbar.default_h
};
cursor = {
    bt: null,
    img_normal: null,
    img_hover: null,
    img_down: null,
    popup: null,
    x: 0,
    y: 0,
    w: hscrollbar.default_h,
    h: hscrollbar.default_h,
    default_w: hscrollbar.default_h+3,
    hover: false,
    drag: false,
    grap_x: 0,
    timerID: false,
    last_x: 0
};
cover = {
    margin_default: 2,
    margin: 2,
    max_size: window.GetProperty("*USER.cover.maximum.size", 600),
    keepaspectratio: window.GetProperty("*USER.cover.keep.ratio.aspect", true),
    w: 0,
    h: 0,
    top_offset: 0,
    default_pad_top_mid: 32,
    default_pad_bot_mid: 36,
    pad_top_mid: 32,
    pad_bot_mid: 36,
    default_pad_left_mid: 15,
    default_pad_right_mid: 12,
    pad_left_mid: 15,
    pad_right_mid: 12,
    normal_delta: 20,
    draw_reflection: window.GetProperty("SYSTEM.cover.draw.reflection", true),
    reflect_strength_percent: window.GetProperty("*USER.floor.reflection.percent", 25),
    draw_focus_border: window.GetProperty("SYSTEM.cover.draw.focus.border", true),
    draw_glass_effect: window.GetProperty("*USER.cover.glass.effect", false),
    load_timer: false,
    load_timer2: false
};

function scrollcoverflow(from, to, step_factor) {
    var diff = to - from;
    var tmp1, tmp2;
    scroll.nbcovers = Math.abs(diff);
    var tval = Math.round(35/scroll.nbcovers);
    if(tval<25) tval = 25;
    if(panel.flat_mode) {
        scroll.step = Math.floor(cover.w/(scroll.nbcovers==1?step_factor+1:scroll.nbcovers>2?1:step_factor));
    } else {
        scroll.step = Math.floor((cover.w - cover.normal_delta*2)/(scroll.nbcovers==1?step_factor+1:scroll.nbcovers>4?1:step_factor));
    };
    if(diff<0) {
        if(list.item[list.mid].gh_id<list.total_gh-1) {
            if(panel.flat_mode) {
                scroll.delta = (cover.w*scroll.nbcovers); // delta > 0
            } else {
                scroll.delta = ((cover.w - cover.normal_delta*2)*scroll.nbcovers); // delta > 0
            };
            tmp1 = scroll.delta;
            for(var j = 0; j < scroll.nbcovers; j++) {
                scrolldown_spv(panel.active_playlist);
            };
            scroll.timerID && window.ClearInterval(scroll.timerID);
            scroll.timerID = window.SetInterval(function() {
                tmp2 = scroll.delta;
                scroll.delta = scroll.delta - scroll.step;
                if(scroll.delta <= 0) {
                   scroll.delta = 0;
                   window.ClearInterval(scroll.timerID);
                   scroll.timerID = false;
                   full_repaint();
                } else {
                    // pas de repaint au 1er cran de scrolling
                    if(tmp2!=tmp1) full_repaint();
                };
            }, tval);
        };
    } else {
        if(list.item[list.mid].gh_id>0 ) {
            if(panel.flat_mode) {
                scroll.delta = (cover.w*scroll.nbcovers) * -1; // delta < 0
            } else {
                scroll.delta = ((cover.w - cover.normal_delta*2)*scroll.nbcovers) * -1; // delta < 0
            };
            tmp1 = scroll.delta;
            for(var j = 0; j < scroll.nbcovers; j++) {
                scrollup_spv(panel.active_playlist);
            };
            scroll.timerID && window.ClearInterval(scroll.timerID);
            scroll.timerID = window.SetInterval(function() {
                tmp2 = scroll.delta;
                scroll.delta = scroll.delta + scroll.step;
                if(scroll.delta >= 0) {
                   scroll.delta = 0;
                   window.ClearInterval(scroll.timerID);
                   scroll.timerID = false;
                   full_repaint();
                } else {
                    // pas de repaint au 1er cran de scrolling
                    if(tmp2!=tmp1) full_repaint();
                };
            }, tval);
        };
    };
};

function refresh_spv_cursor(pls) {
    if(panel.vertical_mode) {
        var ratio = (cursor.y-vscrollbar.y) / (vscrollbar.h-cursor.h);
    } else {
        var ratio = (cursor.x-hscrollbar.x) / (hscrollbar.w-cursor.w);
    };
    if(ratio>1) ratio = 1;
    if(ratio<0) ratio = 0;
    var r = Math.round(ratio * list.total_gh);
    set_gh_id(pls, list.hlist[r-1]);
    full_repaint();
}

function set_gh_id(pls, id) {
    reset_cover_timers();
    // RAZ actual list
    list.item.splice(0, list.item.length);
    if(list.total_gh<=0) return true;
    // rech gh idx of the searched item
    list.gh_id = get_gh_id(id);
    if(list.gh_id==null) {
        list.gh_id = 0;
    };
    var r = list.gh_id - list.mid;
    if(r<0) {
        list.start_id = Math.abs(r);
        r = 0;
    } else {
        list.start_id = 0;
    };
    for(var k = 0; k < list.nbvis; k++) {
        if(k>=list.start_id && r<list.total_gh) {
            list.item.push(new item(list.hlist[r] , k, r));
            r++;
        } else {
            list.item.push(new item(-1 , k, -1));
        };
    };
};

function scrollup_spv(pls) {
    var r = list.item[list.mid].gh_id;
    if(r>0) {
        var s = list.item[0].gh_id;
        if(s>0) {
            list.item.unshift(new item(list.hlist[s-1] , 0, s-1));
        } else {
            list.item.unshift(new item(-1 , 0, -1));
        };
        list.item.pop();
    };
    var len = list.item.length;
    for(var i=0; i<len; i++) {
        list.item[i].idx = i;
    };
    setcursorx();
};

function scrolldown_spv(pls) {
    var r = list.item[list.mid].gh_id;
    if(r<list.total_gh-1) {
        var s = list.item[list.item.length-1].gh_id;
        if(s>0 && s<list.total_gh-1) {
            list.item.push(new item(list.hlist[s+1] , 0, s+1));
        } else {
            list.item.push(new item(-1 , 0, -1));
        };
        list.item.shift();
    };
    var len = list.item.length;
    for(var i=0; i<len; i++) {
        list.item[i].idx = i;
    };
    setcursorx();
};

function refresh_spv(pls, force) {
    reset_cover_timers();
    // RAZ actual list
    list.item.splice(0, list.item.length);
    if(list.total_gh<=0) return true;
    // rech gh idx of the focus item
    list.gh_id = get_gh_id(list.focus_id);
    if(list.gh_id==null) {
        init_active_pls();
        return true;
    };
    list.selected_gh_id = list.gh_id;
    var r = list.gh_id - list.mid;
    if(r<0) {
        list.start_id = Math.abs(r);
        r = 0;
    } else {
        list.start_id = 0;
    };
    for(var k = 0; k < list.nbvis; k++) {
        if(k>=list.start_id && r<list.total_gh) {
            list.item.push(new item(list.hlist[r] , k, r));
            r++;
        } else {
            list.item.push(new item(-1 , k, -1));
        };
    };
    if(scrollbar.show) {
        if(list.total_gh<2) scrollbar.visible = false; else scrollbar.visible=true;
    } else {
        scrollbar.visible = false;
    };
    if(panel.vertical_mode) {
        cursor.h = Math.round(vscrollbar.h / list.total_gh);
        // boundaries for cursor height
        if(cursor.h>vscrollbar.h) cursor.h = vscrollbar.h;
        if(cursor.h<cursor.default_w) cursor.h = cursor.default_w;
    } else {
        cursor.w = Math.round(hscrollbar.w / list.total_gh);
        // boundaries for cursor height
        if(cursor.w>hscrollbar.w) cursor.w = hscrollbar.w;
        if(cursor.w<cursor.default_w) cursor.w = cursor.default_w;
    };
    // redraw cursor image
    set_scroller();
    // set cursor position
    setcursorx();
};

function get_gh_id(focus_id) {
    var mid_id = Math.floor(list.total_gh / 2);
    if(focus_id < list.hlist[mid_id]) {
        var start_id = 0;
    } else {
        var start_id = mid_id;
    };
    for(var i = start_id; i < list.total_gh; i++) {
        if(i<list.total_gh-1) {
            if(focus_id >= list.hlist[i] && focus_id < list.hlist[i+1]) {
                return i;
            };
        } else { // we are on the last item of the array
            if(focus_id >= list.hlist[i]) {
                return i;
            } else {
                //console.log("error: gh_id not found");
                return null;
            };
        };
    };
};

function setcursorx() {
    if(list.item.length>0) {
        var centered_id = Math.floor(list.item.length/2);
        var centered_gh_id = list.item[centered_id].gh_id;
        var ratio = centered_gh_id / (list.total_gh-1);
        if(panel.vertical_mode) {
            cursor.y = vscrollbar.y + Math.round(ratio * (vscrollbar.h-cursor.h));
        } else {
            cursor.x = hscrollbar.x + Math.round(ratio * (hscrollbar.w-cursor.w));
        };
    } else {
        if(panel.vertical_mode) {
            cursor.y = vscrollbar.y;
        } else {
            cursor.x = hscrollbar.x;
        };
    };
};

function init_active_pls() {
    var temp_key1;
    var temp_key2;
    var metadb = null;
    var count = 0;

    //var d1 = new Date();
    //var t1 = d1.getSeconds()*1000 + d1.getMilliseconds();
    //console.log("avant="+t1);

    list.hlist.splice(0, list.hlist.length);
    list.groups.splice(0, list.groups.length);
    if(list.handlelist) list.handlelist;
    list.handlelist = plman.GetPlaylistItems(panel.active_playlist);
    list.total = list.handlelist.Count;
    for (var i = 0; i < list.total; i++) {
        metadb = list.handlelist[i];
        temp_key2 = tf_group_key.EvalWithMetadb(metadb);
        if(temp_key1 != temp_key2){
            if(i>0) {
                list.groups.push(count);
            };
            count = 0;
            list.hlist.push(i);
            temp_key1 = temp_key2;
        };
        count++;
        // on last item
        if(i == list.total - 1) {
            list.groups.push(count);
        };
    };
    list.total_gh = list.hlist.length;

    //var d2 = new Date();
    //var t2 = d2.getSeconds()*1000 + d2.getMilliseconds();
    //console.log("old apres="+t2+" ==> delta = "+Math.round(t2-t1)+" // total_gh="+list.total_gh);
};

//=================================================// Colour & Font Callbacks
function on_font_changed() {
    get_font();
    on_playlist_switch();
};

function on_colors_changed() {
    get_colors();
    init_icons();
    redraw_stub_images();
    init_hscrollbar_buttons();
    set_scroller();
    g_image_cache = new image_cache;
//    CollectGarbage();
    on_playlist_switch();
};

//=================================================// Init
//=================================================// Init
function on_init() {
    if(g_timer1) {
        window.ClearInterval(g_timer1);
        g_timer1 = false;
    };
    g_timer1 = window.SetInterval(function() {
        if(!window.IsVisible) {
            window_visible = false;
            return;
        };

        var repaint_1 = false;

        if(!window_visible){
            window_visible = true;
        };

        if(repaint_main1 == repaint_main2){
            repaint_main2 = !repaint_main1;
            repaint_1 = true;
        };

        if(repaint_1){
            window.Repaint();
        };

    }, 20);
};
on_init();

//=================================================// OnSize
function on_size() {
    if (!window.Width || !window.Height) return;

    window.DlgCode = DLGC_WANTALLKEYS;

    bool_on_size = true;

    if(g_instancetype == 0) { // CUI
        window.MinWidth = 160;
        window.MinHeight = 160;
    } else if(g_instancetype == 1) { // DUI
        window.MinWidth = 160;
        window.MinHeight = 160;
    };
    ww = window.Width;
    wh = window.Height;

    if(ww>wh) {
        panel.vertical_mode = false;
        if(wh<160) wh = 158;
    } else {
        panel.vertical_mode = true;
        if(ww<160) ww = 158;
    };

    // test TF group text, if empty, reset to default
    var temp = window.GetProperty("*USER.group TF text info", "%album artist%[ | %album%][ | %date%]");
    if(temp=="") window.SetProperty("*USER.group TF text info", "%album artist%[ | %album%][ | %date%]");
    tf_group_info = fb.TitleFormat(window.GetProperty("*USER.group TF text info", "%album artist%[ | %album%][ | %date%]"));

    get_font();
    get_colors();
    init_icons();

    recalc_datas();
    redraw_stub_images();

    // only on first launch
    if(list.first_launch) {
        list.first_launch = false;
        on_playlist_switch();
    } else {
        // if just a window resize, refresh list.item and repaint :)
        g_image_cache = new image_cache;
//        CollectGarbage();
        refresh_spv(panel.active_playlist, true);
    };
};

//=================================================// OnPaint
function on_paint(gr) {

    // default background
    gr.FillSolidRect(0, 0, ww, wh, g_backcolor);

    if(panel.vertical_mode) {
      //  gr.FillGradRect(0, 0, Math.floor(ww/4), wh, 0, g_textcolor&0x10ffffff, 0, 1.0);
      //  gr.FillGradRect(ww-Math.floor(ww/4), 0, Math.floor(ww/4), wh, 0, 0, g_textcolor&0x10ffffff, 1.0);
        gr.DrawLine(ww-Math.floor(ww/4), 0, ww-Math.floor(ww/4), wh, 1.0, g_backcolor);
    } else {
        gr.FillGradRect(0, 0, ww, Math.floor(wh/4), 90, g_textcolor&0x10ffffff, 0, 1.0);
    };

    if(list.item.length>0) {
        var cover_show, mid2;
        list.item[list.mid].draw(gr, list.item[list.mid].id, list.mid, 0, true);
        for(var idx = 1; idx < list.mid + 1; idx++) {
            if(idx>1 && idx <= list.mid) {
                cover_show = true;
            } else {
                cover_show = false;
            };
            mid2 = list.mid - idx;
            if(mid2>=0 && mid2<=list.item.length-1) {
                list.item[mid2].draw(gr, list.item[mid2].id, mid2, idx, cover_show);
            };
            mid2 = list.mid + idx;
            if(mid2>=0 && mid2<=list.item.length-1) {
                list.item[mid2].draw(gr, list.item[mid2].id, mid2, idx*-1, cover_show);
            };
        };

        // draw final cover in the right order (stack effect)
        mid2 = list.mid - 1;
        if(mid2>=0 && mid2<=list.item.length-1) {
            list.item[mid2].draw(gr, list.item[mid2].id, mid2, 1, true);
        };
        mid2 = list.mid + 1;
        if(mid2>=0 && mid2<=list.item.length-1) {
            list.item[mid2].draw(gr, list.item[mid2].id, mid2, -1, true);
        };

        // draw left/right shadows (before drawing centered cover)
        if(panel.side_shadows_show) {
            gr.FillGradRect(0, 0, ww, wh, (panel.vertical_mode ? 90 : 0), g_backcolor, 0, 0.5);
        };

        if(!panel.flat_mode) {
            list.item[list.mid].draw(gr, list.item[list.mid].id, list.mid, 0, true);
        };

        // draw text info on the centered album
        if(!panel.vertical_mode) {
            if(!panel.flat_mode && panel.show_text) {
                var text_x = 10;
                var text_w = ww-20;
                if(list.item[list.mid].id>=0) {
                    try {
                        gr.GdiDrawText(list.item[list.mid].group_info, g_font, g_backcolor, text_x, 2, text_w, cover.pad_top_mid, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        gr.GdiDrawText(list.item[list.mid].group_info, g_font, g_textcolor, text_x, 1, text_w, cover.pad_top_mid, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    } catch(e) {
                        gr.GdiDrawText(list.item[list.mid].group_info, gdi.Font("tahoma", 11), g_backcolor, text_x, 2, text_w, cover.pad_top_mid, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        gr.GdiDrawText(list.item[list.mid].group_info, gdi.Font("tahoma", 11), g_textcolor, text_x, 1, text_w, cover.pad_top_mid, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    };
                };
            };
        };
    } else {
        if(plman.PlaylistCount>0) {
            var text_top = plman.GetPlaylistName(plman.ActivePlaylist);
            var text_bot = "This playlist is empty";
        } else {
            var text_top = "Br3tt's WSH CoverFlow";
            var text_bot = "Create a playlist to start!";
        };
        // if empty playlist, display text info
        gr.SetTextRenderingHint(5);
        gr.DrawString(text_top, gdi.Font("Arial", 17, 0), g_textcolor&0x40ffffff, 0, -20, ww, wh, cc_stringformat);
        gr.DrawString(text_bot, gdi.Font("Arial", 13, 0), g_textcolor&0x40ffffff, 0, 20, ww, wh, cc_stringformat);
        gr.FillGradRect(40, Math.floor(wh/2), ww-80, 1, 0, 0, g_textcolor&0x40ffffff, 0.5);
    };


    // draw scrollbar
    if(list.total_gh>0 && scrollbar.visible && scrollbar.show) {
        if(panel.vertical_mode) {
            // draw scrollbar background
            try {
                scrollbar.theme.SetPartAndStateId(6, 1);
                scrollbar.theme.DrawThemeBackground(gr, ww-vscrollbar.w, 0, vscrollbar.w, wh);
            } catch(e) {
                gr.FillSolidRect(ww-vscrollbar.w, 0, vscrollbar.w, wh, g_backcolor&0x77ffffff);
                gr.FillSolidRect(ww-vscrollbar.w, 0, 1, wh, RGBA(0,0,0,20));
            };

            // draw cursor
            cursor.bt.draw(gr, ww-vscrollbar.w, cursor.y, 255);

            try {
                scrollbar.theme.SetPartAndStateId(9, 1);
                scrollbar.theme.DrawThemeBackground(gr, ww-vscrollbar.w, cursor.y, cursor.w, cursor.h);
            } catch(e) {};

            // draw scrollbar buttons (up/down)
            for(i=0;i<scrollbar.arr_buttons.length;i++) {
                switch (i) {
                 case 0:
                    scrollbar.arr_buttons[i].draw(gr, ww-vscrollbar.w, button_up.y, 255);
                    break;
                 case 1:
                    scrollbar.arr_buttons[i].draw(gr, ww-vscrollbar.w, button_down.y, 255);
                    break;
                };
            };

            if(cursor.drag) {
                scrollbar.letter = list.item[Math.floor(list.nbvis/2)].group_key.substring(0,1).toUpperCase();
                cursor.popup && gr.DrawImage(cursor.popup, ww-vscrollbar.w-cursor.popup.Width-00, cursor.y+Math.floor(cursor.h/2)-Math.floor(cursor.popup.Height/2), cursor.popup.Width, cursor.popup.Height, 0, 0, cursor.popup.Width, cursor.popup.Height, 0, 155);
                cursor.popup && gr.GdiDrawText(scrollbar.letter, gdi.Font("segoe ui", 14, 0), g_backcolor, ww-vscrollbar.w-cursor.popup.Width-00, cursor.y+Math.floor(cursor.h/2)-Math.floor(cursor.popup.Height/2), cursor.popup.Width-5, cursor.popup.Height, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            };
        } else {

            // draw scrollbar background
            try {
                scrollbar.theme.SetPartAndStateId(4, 1);
                scrollbar.theme.DrawThemeBackground(gr, 0, wh-hscrollbar.h, ww, hscrollbar.h);
                gr.FillSolidRect(0, wh-hscrollbar.h-1, ww, 1, RGBA(0,0,0,10));
            } catch(e) {
                gr.FillSolidRect(0, wh-hscrollbar.h, ww, hscrollbar.h, g_backcolor&0x77ffffff);
                gr.FillSolidRect(0, wh-hscrollbar.h, ww, 1, RGBA(0,0,0,20));
            };

            // draw cursor
            try {
                cursor.bt.draw(gr, cursor.x, cursor.y, 255);
            } catch(e) {};

            try {
                scrollbar.theme.SetPartAndStateId(8, 1);
                scrollbar.theme.DrawThemeBackground(gr, cursor.x, wh-hscrollbar.h+0, cursor.w, cursor.h);
            } catch(e) {};

            // draw scrollbar buttons (up/down)
            for(i=0;i<scrollbar.arr_buttons.length;i++) {
                switch (i) {
                 case 0:
                    scrollbar.arr_buttons[i].draw(gr, button_up.x, button_up.y, 255);
                    break;
                 case 1:
                    scrollbar.arr_buttons[i].draw(gr, button_down.x, button_down.y, 255);
                    break;
                };
            };

            if(cursor.drag) {
                scrollbar.letter = list.item[Math.floor(list.nbvis/2)].group_key.substring(0,1).toUpperCase();
                cursor.popup && gr.DrawImage(cursor.popup, cursor.x+Math.floor(cursor.w/2)-Math.floor(cursor.popup.Width/2), wh-hscrollbar.h-cursor.popup.Height, cursor.popup.Width, cursor.popup.Height, 0, 0, cursor.popup.Width, cursor.popup.Height, 0, 155);
                cursor.popup && gr.GdiDrawText(scrollbar.letter, gdi.Font("segoe ui", 14, 0), g_backcolor, cursor.x+Math.floor(cursor.w/2)-Math.floor(cursor.popup.Width/2), wh-hscrollbar.h-cursor.popup.Height, cursor.popup.Width, cursor.popup.Height-5, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            };
        };
    };

    // Thin top line (border)
    if(!panel.vertical_mode) {
        //gr.FillGradRect(0, 0, ww, 1, 0, 0, g_textcolor&0x25ffffff, 0.5);
    };

    // Incremental Search Tooltip (bot/left corner)
    if(g_search_string.length>0) {
        gr.SetSmoothingMode(2);
        var tt_x = Math.floor((ww / 2) - ((g_search_string.length*13)+(10*2)) / 2);
        var tt_y = Math.floor(wh/2) - 30;
        var tt_w = ((g_search_string.length*13)+(10*2));
        var tt_h = 60;
        gr.FillSolidRect(tt_x, tt_y, tt_w, tt_h, RGBA(0,0,0,150));
        gr.DrawRect(tt_x, tt_y, tt_w, tt_h, 2.0, RGBA(255,255,255,200));
        gr.DrawRect(tt_x+2, tt_y+2, tt_w-4, tt_h-4, 1.0, RGBA(0,0,0,150));
        gr.GdiDrawText(g_search_string, incsearch_font_big, RGB(0,0,0), tt_x+1, tt_y+1 , tt_w , tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
        gr.GdiDrawText(g_search_string, incsearch_font_big, list.inc_search_noresult?RGB(255,0,0):RGB(250,250,250), tt_x, tt_y , tt_w , tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
    };

    // draw toolbar
    var vscrollbar_w = panel.vertical_mode ? (scrollbar.visible?vscrollbar.w:0) : 0;
    if(!toolbar.state && !toolbar.timerID1) {
        // draw marker to indicate toolbar expandable
        gr.DrawLine(Math.floor((ww-vscrollbar_w)/2)-3, 2, Math.floor((ww-vscrollbar_w)/2)+3, 2, 1.0, g_textcolor&0x44ffffff);
        gr.DrawLine(Math.floor((ww-vscrollbar_w)/2)-2, 3, Math.floor((ww-vscrollbar_w)/2)+0, 5, 1.0, g_textcolor&0x44ffffff);
        gr.DrawLine(Math.floor((ww-vscrollbar_w)/2)+2, 3, Math.floor((ww-vscrollbar_w)/2)+1, 4, 1.0, g_textcolor&0x44ffffff);
    }
    if(toolbar.state || toolbar.timerID1) {
        gr.SetSmoothingMode(2);
        gr.FillSolidRect(09, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar_w-20 + 2, Math.abs(toolbar.collapsed_y) + 10 + 1, RGBA(0,0,0,60));
        gr.FillSolidRect(10, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar_w-20, Math.abs(toolbar.collapsed_y) + 10, RGBA(0,0,0,190));
        gr.DrawRect(11, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar_w-20-2, Math.abs(toolbar.collapsed_y) + 10-1, 1.0, RGBA(250,250,250,40));
        gr.SetSmoothingMode(0);
        // draw toolbar buttons
        for(i=0;i<toolbar.buttons.length;i++) {
            switch (i) {
             case 0:
                if(!panel.lock_playlist) {
                    toolbar.buttons[i].draw(gr, ww-vscrollbar_w-33, (toolbar.collapsed_y + toolbar.delta) + 4, (fb.IsPlaying || list.total_gh>0)?255:80);
                };
                break;
             case 1:
                toolbar.buttons[i].draw(gr, 16, (toolbar.collapsed_y + toolbar.delta) + 3, 255);
                break;
             case 2:
                if(panel.lock_playlist) {
                    toolbar.buttons[i].draw(gr, ww-vscrollbar_w-33, (toolbar.collapsed_y + toolbar.delta) + 4, 255);
                };
                break;
            };
        };
    };

};

//=================================================// Mouse Callbacks
function on_mouse_lbtn_down(x, y) {

    g_drag = true;

    bool_on_size = false;

    var len = list.item.length;
    var mid2 = 0;
    if(list.total_gh>0) {
        if(!list.item[list.mid].checkstate("down", x, y, list.mid)) {
            for(var i = 1; i < list.mid + 1; i++) {
                mid2 = list.mid - i;
                if(mid2>=0 && mid2<=len-1) {
                    if(list.item[mid2].checkstate("down", x, y, mid2)) {
                        break;
                    };
                };
                mid2 = list.mid + i;
                if(mid2>=0 && mid2<=len-1) {
                    if(list.item[mid2].checkstate("down", x, y, mid2)) {
                        break;
                    };
                };
            };
        };
    };

    if(list.total_gh>0 && scrollbar.visible && scrollbar.show) {
        if(panel.vertical_mode) {
            if(cursor.bt.checkstate("down", x, y)==ButtonStates.down) {
                cursor.drag = true;
                cursor.grap_y = y - cursor.y;
                cursor.last_y = cursor.y;
            };
            if(vscrollbar.hover && !cursor.drag) {
                scrollbar.step = Math.floor(list.nb_cover_to_draw/2);
                if(scrollbar.step<1) scrollbar.step = 1;
                if(y<cursor.y) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_scrolling(scrollbar.step, 1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            on_mouse_wheel(scrollbar.step);
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                if(hscrollbar.hover) {
                                    if(mouse_x>ww-vscrollbar.w && cursor.y > mouse_y) {
                                        on_mouse_wheel(scrollbar.step);
                                    };
                                };
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                } else {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_scrolling(-1*scrollbar.step, 1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            on_mouse_wheel(-1*scrollbar.step);
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                if(hscrollbar.hover) {
                                    if(mouse_x>ww-vscrollbar.w && cursor.y+cursor.h < mouse_y) {
                                        on_mouse_wheel(-1*scrollbar.step);
                                    };
                                };
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                };
            };
        } else {
            if(cursor.bt.checkstate("down", x, y)==ButtonStates.down) {
                cursor.drag = true;
                cursor.grap_x = x - cursor.x;
                cursor.last_x = cursor.x;
            };
            if(hscrollbar.hover && !cursor.drag) {
                scrollbar.step = Math.floor(list.nb_cover_to_draw/2);
                if(scrollbar.step<1) scrollbar.step = 1;
                if(x<cursor.x) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_scrolling(scrollbar.step, 1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            on_mouse_wheel(scrollbar.step);
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                if(hscrollbar.hover) {
                                    if(mouse_y>wh-hscrollbar.h && cursor.x > mouse_x) {
                                        on_mouse_wheel(scrollbar.step);
                                    };
                                };
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                } else {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_scrolling(-1*scrollbar.step, 1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            on_mouse_wheel(-1*scrollbar.step);
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                if(hscrollbar.hover) {
                                    if(mouse_y>wh-hscrollbar.h && cursor.x+cursor.w < mouse_x) {
                                        on_mouse_wheel(-1*scrollbar.step);
                                    };
                                };
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                };
            };
        };

        // check scrollbar buttons (UP & DOWN buttons)
        for(i=0;i<scrollbar.arr_buttons.length;i++) {
            switch(i) {
             case 0:
                if(scrollbar.arr_buttons[i].checkstate("down", x, y)==ButtonStates.down) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_mouse_wheel(1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            reset_cover_timers();
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                on_mouse_wheel(1);
                            }, scrollbarbt.timer2_value+10);
                        }, scrollbarbt.timer1_value);
                    };
                };
                break;
             case 1:
                if(scrollbar.arr_buttons[i].checkstate("down", x, y)==ButtonStates.down) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        on_mouse_wheel(-1);
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            reset_cover_timers();
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                on_mouse_wheel(-1);
                            }, scrollbarbt.timer2_value+10);
                        }, scrollbarbt.timer1_value);
                    };
                };
                break;
            };
        };
    };

    // check panel buttons
    for(var i=0;i<toolbar.buttons.length;i++) {
        switch(i) {
            case 0:
                if(!panel.lock_playlist) {
                    if(fb.IsPlaying || list.total_gh>0) {
                        toolbar.buttons[i].checkstate("down", x, y);
                    };
                };
                break;
            default:
                toolbar.buttons[i].checkstate("down", x, y);
        };
    };

};

function on_mouse_lbtn_dblclk(x, y, mask) {
    if(list.total_gh>0) {
        if(panel.vertical_mode) {
            if(x<cover.pad_left_mid) {
                //ShowNowPlaying();
            } else if(x<ww-cover.pad_right_mid) {
                var len = list.item.length;
                for(var i=0;i<len;i++) {
                    list.item[i].checkstate("dblclk", x, y, i);
                };
            } else {
                on_mouse_lbtn_down(x, y);
            };
        } else {
            if(y<cover.pad_top_mid) {
                //ShowNowPlaying();
            } else if(y<wh-cover.pad_bot_mid) {
                var len = list.item.length;
                for(var i=0;i<len;i++) {
                    if(list.item[i].id>=0) {
                        list.item[i].checkstate("dblclk", x, y, i);
                    };
                };
            } else {
                on_mouse_lbtn_down(x, y);
            };
        };
    };
};

function on_mouse_lbtn_up(x, y) {

    // scrollbar button up and down RESET
    list.buttonclicked = false;
    scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
    scrollbar.timerID = false;
    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
    scrollbarbt.timerID1 = false;
    scrollbarbt.timerID2 && window.ClearTimeout(scrollbarbt.timerID2);
    scrollbarbt.timerID2 = false;

    if(list.drag_timer) {
        window.ClearTimeout(list.drag_timer);
        list.drag_timer = false;
        list.drag_stop = true;
    }

    // check panel buttons
    for(i=0;i<toolbar.buttons.length;i++) {
        switch(i) {
            case 0:
                if(!panel.lock_playlist) {
                    if(fb.IsPlaying || list.total_gh>0) {
                        if(toolbar.buttons[i].checkstate("up", x, y)==ButtonStates.hover) {
                            ShowNowPlaying();
                        };
                    };
                };
                break;
            case 1:
                if(toolbar.buttons[i].checkstate("up", x, y)==ButtonStates.hover) {
                    g_menu_displayed = true;
                    settings_menu(x, y);
                };
                break;
            case 2:
                if(panel.lock_playlist) {
                    if(toolbar.buttons[i].checkstate("up", x, y)==ButtonStates.hover) {
                        panel.lock_playlist = false;
                        window.SetProperty("SYSTEM.panel.lock.playlist", panel.lock_playlist);
                        plman.ActivePlaylist = panel.active_playlist;
                    };
                };
                break;
        };
    };

    // toolbar collapse if mouse out after a lbtn up
    if(!toolbar.lock) {
        if(y>30 || x<10 || x>ww-vscrollbar.w-10) {
            if(toolbar.delta==0) {
                toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                toolbar.timerID_on = false;
            };
            if(toolbar.state) {
                if(!toolbar.timerID_off) {
                    if(toolbar.delta == toolbar.collapsed_y*-1) {
                        toolbar.timerID_off = window.SetTimeout(function() {
                            if(!toolbar.timerID2) {
                                toolbar.timerID2 = window.SetInterval(function() {
                                    toolbar.delta -= toolbar.step;
                                    if(toolbar.delta <= 0) {
                                        toolbar.delta = 0;
                                        toolbar.state = false;
                                        window.ClearInterval(toolbar.timerID2);
                                        toolbar.timerID2 = false;
                                    };
                                    window.RepaintRect(0, 0, ww, 30);
                                }, 30);
                            } ;
                            toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                            toolbar.timerID_off = false;
                        }, 400);
                    };
                };
            };
        };
    };

    if(list.total_gh>0) {

        // check scrollbar buttons
        cursor.bt.checkstate("up", x, y);
        for(var i=0;i<scrollbar.arr_buttons.length;i++) {
            scrollbar.arr_buttons[i].checkstate("up", x, y);
        };

        if(cursor.drag) {
            //window.RepaintRect(0, wh-hscrollbar.h, ww, hscrollbar.h);
            cursor.drag = false;
        } else {
            // check items
            var len = list.item.length;
            for(i=0;i<len;i++) {
                list.item[i].checkstate("up", x, y, i);
            };
        };

        setcursorx();

        full_repaint();
    };

    g_drag = false;
};

function on_mouse_mbtn_down(x, y, mask) {
    bool_on_size = false;
    var len = list.item.length;
    if(list.total_gh>0) {
        for(var i=0;i<len;i++) {
            list.item[i].checkstate("mid", x, y, i);
        };
    };
};

function on_mouse_rbtn_down(x, y) {
    bool_on_size = false;
    var len = list.item.length;
    var item_found = false;
    var mid2 = list.mid;

    if(list.total_gh>0) {
        if(list.item[list.mid].checkstate("right", x, y, list.mid)) {
            item_found = true;
        } else {
            for(var i = 1; i < list.mid + 1; i++) {
                mid2 = list.mid - i;
                if(mid2>=0 && mid2<=len-1) {
                    if(list.item[mid2].checkstate("right", x, y, mid2)==true) {
                        item_found = true;
                        break;
                    };
                };
                mid2 = list.mid + i;
                if(mid2>=0 && mid2<=len-1) {
                    if(list.item[mid2].checkstate("right", x, y, mid2)==true) {
                        item_found = true;
                        break;
                    };
                };
            };
        };
        if(item_found) {
            if(y>toolbar.delta) {
                new_context_menu(x, y, list.item[mid2].id, list.item[mid2].idx);
            };
        };
    };
};

function on_mouse_rbtn_up(x, y) {
    if(!utils.IsKeyPressed(VK_SHIFT)) {
        return true;
    };
};

function on_mouse_move(x, y) {

    if(x==mouse_x && y==mouse_y) return true;

    hand = false;

    if(cursor.drag) {
        list.drag_stop = false;
        if(list.drag_timer) {
            window.ClearTimeout(list.drag_timer);
            list.drag_timer = false;
        }
        list.drag_timer = window.SetTimeout(function() {
            list.drag_stop = true;
            window.ClearTimeout(list.drag_timer);
            list.drag_timer = false;
            full_repaint();
        }, 25);
    } else {
        list.drag_stop = true;
    };

    if(list.total_gh>0 && scrollbar.visible && scrollbar.show) {
        if(panel.vertical_mode) {
            vscrollbar.hover = (x>=ww-vscrollbar.w && x<=ww && y>=vscrollbar.y && y<=vscrollbar.y+vscrollbar.h);
            cursor.hover = (x>=cursor.x && x<=cursor.x+cursor.w && y>=cursor.y && y<=cursor.y+cursor.h);
            // check buttons
            cursor.bt.checkstate("move", x, y);

            for(var i=0;i<scrollbar.arr_buttons.length;i++) {
                scrollbar.arr_buttons[i].checkstate("move", x, y);
            };
            if(cursor.drag && mouse_y!=y) {
                reset_cover_timers();
                cursor.y = y - cursor.grap_y;
                // check boundaries
                if(cursor.y<vscrollbar.y) cursor.y = vscrollbar.y;
                if(cursor.y>vscrollbar.y+vscrollbar.h-cursor.h) cursor.y = vscrollbar.y+vscrollbar.h-cursor.h;
                if(!cursor.timerID) {
                    cursor.timerID = window.SetTimeout(function() {
                        refresh_spv_cursor(plman.ActivePlaylist);
                        full_repaint();
                        cursor.timerID = false;
                    }, 30);
                };
            };
        } else {
            hscrollbar.hover = (y>=wh-hscrollbar.h && y<=wh && x>=hscrollbar.x && x<=hscrollbar.x+hscrollbar.w);
            cursor.hover = (x>=cursor.x && x<=cursor.x+cursor.w && y>=cursor.y && y<=cursor.y+cursor.h);
            // check buttons
            cursor.bt.checkstate("move", x, y);

            for(var i=0;i<scrollbar.arr_buttons.length;i++) {
                scrollbar.arr_buttons[i].checkstate("move", x, y);
            };
            if(cursor.drag && mouse_x!=x) {
                reset_cover_timers();
                cursor.x = x - cursor.grap_x;
                // check boundaries
                if(cursor.x<hscrollbar.x) cursor.x = hscrollbar.x;
                if(cursor.x>hscrollbar.x+hscrollbar.w-cursor.w) cursor.x = hscrollbar.x+hscrollbar.w-cursor.w;
                if(!cursor.timerID) {
                    cursor.timerID = window.SetTimeout(function() {
                        refresh_spv_cursor(panel.active_playlist);
                        full_repaint();
                        cursor.timerID && window.ClearTimeout(cursor.timerID);
                        cursor.timerID = false;
                    }, 30);
                };
            };
        };
    };

    // check panel buttons
    for(var j=0;j<toolbar.buttons.length;j++) {
        switch (j) {
            case 0:
                if(!panel.lock_playlist) {
                    if(fb.IsPlaying || list.total_gh>0) {
                        if(toolbar.buttons[j].checkstate("move", x, y)==ButtonStates.hover) {
                            hand = true;
                        };
                    };
                };
                break;
            case 2:
                if(panel.lock_playlist) {
                    if(toolbar.buttons[j].checkstate("move", x, y)==ButtonStates.hover) {
                        hand = true;
                    };
                };
                break;
            default:
                if(toolbar.buttons[j].checkstate("move", x, y)==ButtonStates.hover) {
                    hand = true;
                };
        };
    };

    // hide/show toolbar
    var vscrollbar_w = panel.vertical_mode ? (scrollbar.visible?vscrollbar.w:0) : 0;
    if(!toolbar.lock && !g_drag) {
        if(y>=0 && y<=15 && x>10 && x<ww-vscrollbar_w-10) {
            if(toolbar.delta==toolbar.collapsed_y*-1) {
                toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                toolbar.timerID_off = false;
            };
            if(!toolbar.timerID_on) {
                if(toolbar.delta==0) {
                    toolbar.timerID_on = window.SetTimeout(function() {
                        toolbar.timerID2 && window.ClearInterval(toolbar.timerID2);
                        toolbar.timerID2 = false;
                        if(!toolbar.timerID1) {
                            toolbar.timerID1 = window.SetInterval(function() {
                                toolbar.delta += toolbar.step;
                                if(toolbar.collapsed_y + toolbar.delta >= 0) {
                                    toolbar.delta = toolbar.collapsed_y*-1;
                                    toolbar.state = true;
                                    window.ClearInterval(toolbar.timerID1);
                                    toolbar.timerID1 = false;
                                };
                                window.RepaintRect(0, 0, ww, 30);
                            }, 30);
                        };
                        toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                        toolbar.timerID_on = false;
                    }, 400);
                } else if(toolbar.timerID2) {
                    toolbar.timerID2 && window.ClearInterval(toolbar.timerID2);
                    toolbar.timerID2 = false;
                    if(!toolbar.timerID1) {
                        toolbar.timerID1 = window.SetInterval(function() {
                            toolbar.delta += toolbar.step;
                            if(toolbar.collapsed_y + toolbar.delta >= 0) {
                                toolbar.delta = toolbar.collapsed_y*-1;
                                toolbar.state = true;
                                window.ClearInterval(toolbar.timerID1);
                                toolbar.timerID1 = false;
                            };
                            window.RepaintRect(0, 0, ww, 30);
                        }, 30);
                    };
                };
            };
        } else if(y>30 || x<10 || x>ww-vscrollbar_w-10) {
            if(toolbar.delta==0) {
                toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                toolbar.timerID_on = false;
            };
            if(toolbar.state) {
                if(!toolbar.timerID_off) {
                    if(toolbar.delta == toolbar.collapsed_y*-1) {
                        toolbar.timerID_off = window.SetTimeout(function() {
                            if(!toolbar.timerID2) {
                                toolbar.timerID2 = window.SetInterval(function() {
                                    toolbar.delta -= toolbar.step;
                                    if(toolbar.delta <= 0) {
                                        toolbar.delta = 0;
                                        toolbar.state = false;
                                        window.ClearInterval(toolbar.timerID2);
                                        toolbar.timerID2 = false;
                                    };
                                    window.RepaintRect(0, 0, ww, 30);
                                }, 30);
                            } ;
                            toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                            toolbar.timerID_off = false;
                        }, 400);
                    };
                };
            };
        };
    };

    // Mouse Cursor
    window.SetCursor(hand? IDC_HAND : IDC_ARROW);

    mouse_x = x;
    mouse_y = y;
};

function on_mouse_wheel(delta) {

    var abs_delta = Math.abs(delta);
    reset_cover_timers();

    if(list.total_gh>0) {
        if(!scrollbar.timerID) {
            if(abs_delta>=1) {
                if(delta>0) {
                    if(panel.scroll_effect) {
                        for(var i=0; i<abs_delta-1; i++) {
                            scrollup_spv(panel.active_playlist);
                        };
                        scrollcoverflow(0, 1, scroll.factor);
                    } else {
                        for(var i=0; i<abs_delta; i++) {
                            scrollup_spv(panel.active_playlist);
                        };
                    };
                    scrollbar.timerID = window.SetTimeout(function () {
                        full_repaint();
                        scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
                        scrollbar.timerID = false;
                    }, list.mousewheel_timer_value);
                } else {
                    if(panel.scroll_effect) {
                        for(var i=0; i<abs_delta-1; i++) {
                            scrolldown_spv(panel.active_playlist);
                        };
                        scrollcoverflow(1, 0, scroll.factor);
                    } else {
                        for(var i=0; i<abs_delta; i++) {
                            scrolldown_spv(panel.active_playlist);
                        };
                    };
                    scrollbar.timerID = window.SetTimeout(function () {
                        full_repaint();
                        scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
                        scrollbar.timerID = false;
                    }, list.mousewheel_timer_value);
                };
            };
        };
    };
};

function on_scrolling(delta, factor) {

    var abs_delta = Math.abs(delta);
    reset_cover_timers();

    if(list.total_gh>0) {
        if(!scrollbar.timerID) {
            if(abs_delta>=1) {
                if(delta>0) {
                    if(panel.scroll_effect) {
                        scrollcoverflow(0, abs_delta, factor);
                    } else {
                        for(var i=0; i<abs_delta; i++) {
                            scrollup_spv(panel.active_playlist);
                        };
                        scrollbar.timerID = window.SetTimeout(function () {
                            full_repaint();
                            scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
                            scrollbar.timerID = false;
                        }, list.mousewheel_timer_value);
                    };
                } else {
                    if(panel.scroll_effect) {
                        scrollcoverflow(abs_delta, 0, factor);
                    } else {
                        for(var i=0; i<abs_delta; i++) {
                            scrolldown_spv(panel.active_playlist);
                        }
                        scrollbar.timerID = window.SetTimeout(function () {
                            full_repaint();
                            scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
                            scrollbar.timerID = false;
                        }, list.mousewheel_timer_value);
                    };
                };
            };
        };
    };
};

function on_mouse_leave() {
    var len = list.item.length;
    if(list.total_gh>0) {
        for(var i=0;i<len;i++) {
            list.item[i].checkstate("leave", 0, 0, i);
        };
    };
    for(i=0;i<toolbar.buttons.length;i++) {
        toolbar.buttons[i].checkstate("leave", 0, 0);
    };

    // toolbar is to hide if visible or amorced
    if(toolbar.delta==0) {
        toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
        toolbar.timerID_on = false;
    };
    if(!toolbar.lock && !g_drag) {
        if(!g_menu_displayed) {
            if(!toolbar.timerID_off) {
                toolbar.timerID_off = window.SetTimeout(function() {
                    if(!toolbar.timerID2) {
                        toolbar.timerID2 = window.SetInterval(function() {
                            toolbar.delta -= toolbar.step;
                            if(toolbar.delta <= 0) {
                                toolbar.delta = 0;
                                toolbar.state = false;
                                window.ClearInterval(toolbar.timerID2);
                                toolbar.timerID2 = false;
                            };
                            window.RepaintRect(0, 0, ww, 30);
                        }, 30);
                    } ;
                    toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                    toolbar.timerID_off = false;
                }, 400);
            };
        };
    };
    full_repaint();
};

//=================================================// Callbacks

function on_playlist_switch() {
    // set/check the active playlist for the panel
    if(!panel.lock_playlist) {
        panel.active_playlist = plman.ActivePlaylist;
    };

    // test if there is an active playlist focused (may happen whenyou delete a playlist from pl manager)
    if(plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount) {
        if(plman.PlaylistCount>0) {
            plman.ActivePlaylist = 0;
        };
    };
    init_active_pls();
    list.focus_id = plman.GetPlaylistFocusItemIndex(panel.active_playlist);
    if(list.focus_id<0) {
        list.focus_id = 0;
    }
    refresh_spv(panel.active_playlist, true);
    full_repaint();
};

function on_playlist_items_added(playlist_idx) {
    if(playlist_idx==panel.active_playlist) {
        on_playlist_switch();
    };
    plman.SetActivePlaylistContext();
};

function on_playlist_items_removed(playlist_idx, new_count) {
    if(playlist_idx==panel.active_playlist) {
        on_playlist_switch();
    };
    plman.SetActivePlaylistContext();
};

function on_playlist_items_reordered(playlist_idx) {
    if(playlist_idx==panel.active_playlist) {
        on_playlist_switch();
    };
};

function on_selection_changed(metadb) {
};

function on_playlist_items_selection_change() {
};

function on_playlists_changed() {
    if(bypass.on_playlists_changed) {
        //bypass.on_playlists_changed = false;
        return true;
    } else {
        if(panel.lock_playlist) {
            // unlock on playlist changed because locked playlist may have be moved or deleted
            panel.lock_playlist = !panel.lock_playlist;
            window.SetProperty("SYSTEM.panel.lock.playlist", panel.lock_playlist);
            plman.ActivePlaylist = panel.active_playlist;
            full_repaint();
        };
    };
};

function on_item_focus_change(playlist, from, to) {
    if(bypass.on_item_focus_change || to<0) {
        bypass.on_item_focus_change = false;
        return true;
    };
    if(playlist==panel.active_playlist) {
        list.focus_id = to;
        plman.SetActivePlaylistContext();
        refresh_spv(panel.active_playlist, bool_on_size);
        bool_on_size = false;
        full_repaint();
    };
};

function on_metadb_changed(metadb_or_metadbs, fromhook) {
    var len = list.item.length;
    for(var i=0;i<len;i++) {
        list.item[i].update_infos();
    };
    full_repaint();
};

function on_focus(is_focused) {
    if(is_focused) {
        plman.SetActivePlaylistContext();
    };
};

//=================================================// Keyboard Callbacks
function on_key_up(vkey) {
    // scrollbar button up and down RESET
    list.buttonclicked = false;
    scrollbar.timerID && window.ClearTimeout(scrollbar.timerID);
    scrollbar.timerID = false;
    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
    scrollbarbt.timerID1 = false;
    scrollbarbt.timerID2 && window.ClearTimeout(scrollbarbt.timerID2);
    scrollbarbt.timerID2 = false;
};

function on_key_down(vkey) {
    var mask = GetKeyboardMask();

    if (mask == KMask.none) {
        switch (vkey) {
        case VK_SHIFT:
            list.SHIFT_count = 0;
            break;
        case VK_BACK:
            if(g_search_string.length>0) {
                var tt_x = Math.floor((ww / 2) - ((g_search_string.length*13)+(10*2)) / 2);
                var tt_y = Math.floor(wh/2) - 30;
                var tt_w = ((g_search_string.length*13)+(10*2));
                var tt_h = 60;
                g_search_string = g_search_string.substring(0, g_search_string.length-1);
                window.RepaintRect(0, tt_y-2, ww, tt_h+4);
                clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
                incsearch_timer && window.ClearTimeout(incsearch_timer);
                incsearch_timer = window.SetTimeout(function () {
                    IncrementalSearch();
                    window.ClearTimeout(incsearch_timer);
                    incsearch_timer = false;
                }, search_delay);
            };
            break;
        case VK_ESCAPE:
        case 222:
            var tt_x = Math.floor((ww / 2) - ((g_search_string.length*13)+(10*2)) / 2);
            var tt_y = Math.floor(wh/2) - 30;
            var tt_w = ((g_search_string.length*13)+(10*2));
            var tt_h = 60;
            g_search_string = "";
            window.RepaintRect(0, tt_y-2, ww, tt_h+4);
            break;
        case VK_UP:
        case VK_LEFT:
            if(list.total_gh>0) {
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(1);
                    full_repaint();
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        reset_cover_timers();
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            on_mouse_wheel(1);
                        }, scrollbarbt.timer2_value);
                    }, scrollbarbt.timer1_value);
                };
            };
            break;
        case VK_DOWN:
        case VK_RIGHT:
            if(list.total_gh>0) {
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(-1);
                    full_repaint();
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        reset_cover_timers();
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            on_mouse_wheel(-1);
                        }, scrollbarbt.timer2_value);
                    }, scrollbarbt.timer1_value);
                };
            };
            break;
        case VK_PGUP:
            if(list.total_gh>0) {
                scrollbar.step = Math.floor(list.nb_cover_to_draw/2);
                if(scrollbar.step<1) scrollbar.step = 1;
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(scrollbar.step);
                    full_repaint();
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        reset_cover_timers();
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            on_mouse_wheel(scrollbar.step);
                        }, scrollbarbt.timer2_value);
                    }, scrollbarbt.timer1_value);
                };
            };
            break;
        case VK_PGDN:
            if(list.total_gh>0) {
                scrollbar.step = Math.floor(list.nb_cover_to_draw/2);
                if(scrollbar.step<1) scrollbar.step = 1;
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(scrollbar.step*-1);
                    full_repaint();
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        reset_cover_timers();
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            on_mouse_wheel(scrollbar.step*-1);
                        }, scrollbarbt.timer2_value);
                    }, scrollbarbt.timer1_value);
                };
            };
            break;
        case VK_RETURN:
            // play focus item
            if(list.total_gh>0) {
                plman.ExecutePlaylistDefaultAction(panel.active_playlist, list.focus_id);
            };
            break;
        case VK_END:
            if(list.total_gh>0) {
                plman.SetPlaylistFocusItem(panel.active_playlist, list.total-1);
                plman.ClearPlaylistSelection(panel.active_playlist);
                plman.SetPlaylistSelectionSingle(panel.active_playlist, list.total-1, true);
            };
            break;
        case VK_HOME:
            if(list.total_gh>0) {
                plman.SetPlaylistFocusItem(panel.active_playlist, 0);
                plman.ClearPlaylistSelection(panel.active_playlist);
                plman.SetPlaylistSelectionSingle(panel.active_playlist, 0, true);
            };
            break;
        case VK_DELETE:
            if(list.total_gh>0) {
                if(!plman.IsAutoPlaylist(panel.active_playlist)) {
                    plman.RemovePlaylistSelection(panel.active_playlist, false);
                    plman.SetPlaylistSelectionSingle(panel.active_playlist, plman.GetPlaylistFocusItemIndex(panel.active_playlist), true);
                };
            };
            break;
        case VK_SPACEBAR:
            if(g_search_string.length==0) {
                if(list.total_gh>0) {
                    if(panel.lock_playlist) {
                        plman.SetPlaylistFocusItem(panel.active_playlist, new_focus_id);
                        plman.ClearPlaylistSelection(panel.active_playlist);
                        plman.SetPlaylistSelectionSingle(panel.active_playlist, new_focus_id, true);
                        var mid_idx = Math.floor(list.nbvis/2);
                        list.item[mid_idx].checkstate("mid", list.item[mid_idx].x+5, list.item[mid_idx].y+5, mid_idx);
                    } else {
                        var new_focus_id = list.item[Math.floor(list.nbvis/2)].id;
                        SelectGroupItems(new_focus_id, get_gh_id(new_focus_id), true);
                    };
                };
                break;
            };
        };
    } else {
        switch(mask) {
            case KMask.shift:
                break;
            case KMask.ctrl:
                if(vkey==65) { // CTRL+A
                    fb.RunMainMenuCommand("Edit/Select all");
                    full_repaint();
                };
                if(vkey==70) { // CTRL+F
                    fb.RunMainMenuCommand("Edit/Search");
                };
                if(vkey==78) { // CTRL+N
                    fb.RunMainMenuCommand("File/New playlist");
                };
                if(vkey==79) { // CTRL+O
                    fb.RunMainMenuCommand("File/Open...");
                };
                if(vkey==80) { // CTRL+P
                    fb.RunMainMenuCommand("File/Preferences");
                };
                if(vkey==83) { // CTRL+S
                    fb.RunMainMenuCommand("File/Save playlist...");
                };
                break;
            case KMask.alt:
                if(vkey==65) { // ALT+A
                    fb.RunMainMenuCommand("View/Always on Top");
                };
                break;
        };
    };
};

function on_char(code) {
    if(list.total_gh>0) {
        var tt_x = Math.floor((ww / 2) - ((g_search_string.length*13)+(10*2)) / 2);
        var tt_y = Math.floor(wh/2) - 30;
        var tt_w = ((g_search_string.length*13)+(10*2));
        var tt_h = 60;
        if(code==32 && g_search_string.length==0) return true; // SPACE Char not allowed on 1st char
        if(g_search_string.length<=20 && tt_w<=ww-50) {
            if (code > 31) {
                g_search_string = g_search_string + String.fromCharCode(code).toUpperCase();
                window.RepaintRect(0, tt_y-2, ww, tt_h+4);
                clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
                clear_incsearch_timer = false;
                incsearch_timer && window.ClearTimeout(incsearch_timer);
                incsearch_timer = window.SetTimeout(function () {
                    IncrementalSearch();
                    window.ClearTimeout(incsearch_timer);
                    incsearch_timer = false;
                }, search_delay);
            };
        };
    };
};

//=================================================// Playback Callbacks
function on_playback_new_track(info) {
    g_metadb = fb.GetNowPlaying();
    full_repaint();
};

function on_playback_stop(reason) {
    if(reason==0) { // on user Stop
        g_metadb = fb.GetFocusItem();
        on_metadb_changed();
    };
};

function on_playback_pause(state){
};

function on_playback_time(time) {
};

//=================================================// Font & Colors
function get_font() {
    if (g_instancetype == 0) { // CUI
        g_font = window.GetFontCUI(FontTypeCUI.items);
        g_font_headers = window.GetFontCUI(FontTypeCUI.labels);
    } else if (g_instancetype == 1) { // DUI
        g_font = window.GetFontDUI(FontTypeDUI.playlists);
        g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
    };
};

function get_colors() {
    if(g_instancetype == 0) { // CUI
        g_textcolor = window.GetColourCUI(ColorTypeCUI.text);
        g_textcolor_sel = window.GetColourCUI(ColorTypeCUI.selection_text);
        g_textcolor_hl = window.GetColourCUI(ColorTypeCUI.active_item_frame);
        g_backcolor = window.GetColourCUI(ColorTypeCUI.background);
        g_backcolor_sel = window.GetColourCUI(ColorTypeCUI.selection_background);
    } else if(g_instancetype == 1) { // DUI
        g_textcolor = window.GetColourDUI(ColorTypeDUI.text);
        g_textcolor_sel = window.GetColourDUI(ColorTypeDUI.selection);
        g_textcolor_hl = window.GetColourDUI(ColorTypeDUI.highlight);
        g_backcolor = window.GetColourDUI(ColorTypeDUI.background);
        g_backcolor_sel = g_textcolor_sel;
    };

    // Custom colors set in Properties of the panel
    if(panel.custom_colors) {
        try{
            if(panel.custom_textcolor.length>0) g_textcolor = eval(panel.custom_textcolor);
            if(panel.custom_textcolor_selection.length>0) {
                g_textcolor_sel = eval(panel.custom_textcolor_selection);
                g_backcolor_sel = g_textcolor_sel;
            };
            if(panel.custom_backcolor.length>0) g_backcolor = eval(panel.custom_backcolor);
        } catch(e) {};
    };

    g_backcolor_R = getRed(g_backcolor);
    g_backcolor_G = getGreen(g_backcolor);
    g_backcolor_B = getBlue(g_backcolor);
};

//=================================================// Images (general)
function set_scroller() {
    var gb;

    if(panel.vertical_mode) {
        try {
            cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
        } catch(e) {
            cursor.h = cursor.default_h;
            cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
        };

        gb = cursor.img_normal.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
        try {
            scrollbar.theme.SetPartAndStateId(3, 1);
            scrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
        } catch(e) {
            gb.FillSolidRect(3, 0, cursor.w-6, cursor.h, g_textcolor&0x44ffffff);
        };
        cursor.img_normal.ReleaseGraphics(gb);

        cursor.img_hover = gdi.CreateImage(cursor.w, cursor.h);
        gb = cursor.img_hover.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
        try {
            scrollbar.theme.SetPartAndStateId(3, 2);
            scrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
        } catch(e) {
            gb.FillSolidRect(3, 0, cursor.w-6, cursor.h, g_textcolor&0x88ffffff);
        };
        cursor.img_hover.ReleaseGraphics(gb);
        cursor.bt = new button(cursor.img_normal, cursor.img_hover, cursor.img_hover);
    } else {
        try {
            cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
        } catch(e) {
            cursor.h = cursor.default_h;
            cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
        };

        gb = cursor.img_normal.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
        try {
            scrollbar.theme.SetPartAndStateId(2, 1);
            scrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
        } catch(e) {
            gb.FillSolidRect(0, 3, cursor.w, cursor.h-5, g_textcolor&0x44ffffff);
        };
        cursor.img_normal.ReleaseGraphics(gb);

        cursor.img_hover = gdi.CreateImage(cursor.w, cursor.h);
        gb = cursor.img_hover.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
        try {
            scrollbar.theme.SetPartAndStateId(2, 2);
            scrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
        } catch(e) {
            gb.FillSolidRect(0, 3, cursor.w, cursor.h-5, g_textcolor&0x88ffffff);
        };
        cursor.img_hover.ReleaseGraphics(gb);
        cursor.bt = new button(cursor.img_normal, cursor.img_hover, cursor.img_hover);
    };
};

function init_hscrollbar_buttons() {
    var i, gb;

    cursor.popup = gdi.CreateImage(22, 27);
    gb = cursor.popup.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillRoundRect(0,0,22-1,22-1,3,3,g_textcolor);
    gb.DrawRoundRect(0,0,22-1,22-1,3,3,1.0,RGBA(0,0,0,150));
    var points = Array(7,22-2, 11,22-2+6, 22-7,22-2);
    gb.FillPolygon(g_textcolor, 0, points);
    gb.DrawPolygon(RGBA(0,0,0,150), 1.0, points);
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6,22-4,22-10,3,g_textcolor);
    cursor.popup.ReleaseGraphics(gb);

    button_up.img_normal = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 9);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(10, mid_y-4, 6, mid_y+0, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(7, mid_y+0, 10, mid_y+3, 2.0, g_textcolor&0x44ffffff);
    };
    button_up.img_normal.ReleaseGraphics(gb);

    button_up.img_hover = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 10);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(10, mid_y-4, 6, mid_y+0, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(7, mid_y+0, 10, mid_y+3, 2.0, g_textcolor&0x88ffffff);
    };
    button_up.img_hover.ReleaseGraphics(gb);

    button_up.img_down = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 11);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(10, mid_y-4, 6, mid_y+0, 2.0, g_textcolor);
        gb.DrawLine(7, mid_y+0, 10, mid_y+3, 2.0, g_textcolor);
    };
    button_up.img_down.ReleaseGraphics(gb);

    button_down.img_normal = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 13);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(button_down.w-11, mid_y-4, button_down.w-7, mid_y+0, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(button_down.w-8, mid_y+0, button_down.w-11, mid_y+3, 2.0, g_textcolor&0x44ffffff);
    };
    button_down.img_normal.ReleaseGraphics(gb);

    button_down.img_hover = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 14);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(button_down.w-11, mid_y-4, button_down.w-7, mid_y+0, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(button_down.w-8, mid_y+0, button_down.w-11, mid_y+3, 2.0, g_textcolor&0x88ffffff);
    };
    button_down.img_hover.ReleaseGraphics(gb);

    button_down.img_down = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 15);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_y = Math.round(button_up.h/2);
        gb.DrawLine(button_down.w-11, mid_y-4, button_down.w-7, mid_y+0, 2.0, g_textcolor);
        gb.DrawLine(button_down.w-8, mid_y+0, button_down.w-11, mid_y+3, 2.0, g_textcolor);
    };
    button_down.img_down.ReleaseGraphics(gb);

    scrollbar.arr_buttons.splice(0, scrollbar.arr_buttons.length);
    for(i=0;i<scrollbar.button_total;i++) {
        switch(i) {
         case 0:
            scrollbar.arr_buttons.push(new button(button_up.img_normal, button_up.img_hover, button_up.img_down));
            break;
         case 1:
            scrollbar.arr_buttons.push(new button(button_down.img_normal, button_down.img_hover, button_down.img_down));
            break;
        };
    };
};

function init_vscrollbar_buttons() {
    var i, gb;

    cursor.popup = gdi.CreateImage(27, 22);
    gb = cursor.popup.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillRoundRect(0,0,22-1,22-1,3,3,g_textcolor);
    gb.DrawRoundRect(0,0,22-1,22-1,3,3,1.0,RGBA(0,0,0,150));
    var points = Array(22-2,7, 22-2+6,11, 22-2,22-7);
    gb.FillPolygon(g_textcolor, 0, points);
    gb.DrawPolygon(RGBA(0,0,0,150), 1.0, points);
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(22-4,6,3,22-10,g_textcolor);
    cursor.popup.ReleaseGraphics(gb);

    button_up.img_normal = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 1);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor&0x44ffffff);
    };
    button_up.img_normal.ReleaseGraphics(gb);

    button_up.img_hover = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 2);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor&0x88ffffff);
    };
    button_up.img_hover.ReleaseGraphics(gb);

    button_up.img_down = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 3);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor);
    };
    button_up.img_down.ReleaseGraphics(gb);

    button_down.img_normal = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 5);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor&0x44ffffff);
    };
    button_down.img_normal.ReleaseGraphics(gb);

    button_down.img_hover = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 6);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor&0x88ffffff);
    };
    button_down.img_hover.ReleaseGraphics(gb);

    button_down.img_down = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        scrollbar.theme.SetPartAndStateId(1, 7);
        scrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor);
    };
    button_down.img_down.ReleaseGraphics(gb);

    scrollbar.arr_buttons.splice(0, scrollbar.arr_buttons.length);
    for(i=0;i<scrollbar.button_total;i++) {
        switch(i) {
         case 0:
            scrollbar.arr_buttons.push(new button(button_up.img_normal, button_up.img_hover, button_up.img_down));
            break;
         case 1:
            scrollbar.arr_buttons.push(new button(button_down.img_normal, button_down.img_hover, button_down.img_down));
            break;
        };
    };
};

//=================================================// Init Icons and Images (no_cover ...)
function init_icons() {
    var gb;
    var gui_font;

    glass_reflect_img = draw_glass_reflect(200, 200);

    nocover = gdi.CreateImage(200, 200);
    gb = nocover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gb.SetTextRenderingHint(3);
    gui_font = gdi.Font("Impact", 108, 1);
    gb.DrawString("NO", gui_font, g_textcolor&0x25ffffff, 0, 0, 200, 110, cc_stringformat);
    gui_font = gdi.Font("Impact", 48, 1);
    gb.DrawString("COVER", gui_font, g_textcolor&0x20ffffff, 1, 70, 200, 110, cc_stringformat);
    gb.FillSolidRect(24, 155, 152, 20, g_textcolor&0x15ffffff);
    nocover.ReleaseGraphics(gb);

    streamcover = gdi.CreateImage(200, 200);
    gb = streamcover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gb.SetTextRenderingHint(3);
    gui_font = gdi.Font("Impact", 42, 0);
    gb.DrawString("stream", gui_font, g_backcolor, 1, 2, 200, 190, cc_stringformat);
    gb.DrawString("stream", gui_font, g_textcolor&0x99ffffff, 1, 0, 200, 190, cc_stringformat);
    streamcover.ReleaseGraphics(gb);

    loading = gdi.CreateImage(200, 200);
    gb = loading.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gb.SetTextRenderingHint(3);
    gui_font = gdi.Font("Impact", 40, 0);
    gb.DrawString("loading...", gui_font, g_backcolor, 1, 2, 200, 190, cc_stringformat);
    gb.DrawString("loading...", gui_font, g_textcolor&0x99ffffff, 1, 0, 200, 190, cc_stringformat);
    loading.ReleaseGraphics(gb);

    // Show Now Playing button
    nowplaying_button_normal = gdi.CreateImage(20, 20);
    gb = nowplaying_button_normal.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillEllipse(6, 8, 8, 6, RGB(140,140,140));
    gb.DrawLine(10, 1, 13, 9, 1.0, RGB(140,140,140));
    gb.DrawLine(11, 2, 14, 3, 2.0, RGB(140,140,140));
    gb.DrawLine(14, 3, 15, 5, 1.0, RGB(140,140,140));
    gb.SetSmoothingMode(0);
    nowplaying_button_normal.ReleaseGraphics(gb);

    nowplaying_button_hover = gdi.CreateImage(20, 20);
    gb = nowplaying_button_hover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillEllipse(6, 8, 8, 6, RGB(180,180,180));
    gb.DrawLine(10, 1, 13, 9, 1.0, RGB(180,180,180));
    gb.DrawLine(11, 2, 14, 3, 2.0, RGB(180,180,180));
    gb.DrawLine(14, 3, 15, 5, 1.0, RGB(180,180,180));
    gb.SetSmoothingMode(0);
    nowplaying_button_hover.ReleaseGraphics(gb);

    nowplaying_button_down = gdi.CreateImage(20, 20);
    gb = nowplaying_button_down.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillEllipse(6, 8, 8, 6, RGB(220,220,220));
    gb.DrawLine(10, 1, 13, 9, 1.0, RGB(220,220,220));
    gb.DrawLine(11, 2, 14, 3, 2.0, RGB(220,220,220));
    gb.DrawLine(14, 3, 15, 5, 1.0, RGB(220,220,220));
    gb.SetSmoothingMode(0);
    nowplaying_button_down.ReleaseGraphics(gb);

    // Settings Menu button
    bt_settings_off = gdi.CreateImage(30, 20);
    gb = bt_settings_off.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(150,150,150), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(140,140,140));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,200));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,80));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(140,140,140));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(140,140,140));
    bt_settings_off.ReleaseGraphics(gb);

    bt_settings_ov = gdi.CreateImage(30, 20);
    gb = bt_settings_ov.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(190,190,190), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(180,180,180));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,220));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,140));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(180,180,180));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(180,180,180));
    bt_settings_ov.ReleaseGraphics(gb);

    bt_settings_on = gdi.CreateImage(30, 20);
    gb = bt_settings_on.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(230,230,230), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(180,180,180));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,240));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,160));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(220,220,220));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(220,220,220));
    bt_settings_on.ReleaseGraphics(gb);

    // Lock Playlist button
    lock_button_normal = gdi.CreateImage(20, 20);
    gb = lock_button_normal.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.DrawEllipse(7, 2, 6, 6, 1.0, RGB(140,140,140));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6, 7, 9, 6, RGB(140,140,140));
    gb.FillSolidRect(10, 9, 1, 2, RGB(20,20,20));
    lock_button_normal.ReleaseGraphics(gb);

    lock_button_hover = gdi.CreateImage(20, 20);
    gb = lock_button_hover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.DrawEllipse(7, 2, 6, 6, 1.0, RGB(180,180,180));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6, 7, 9, 6, RGB(180,180,180));
    gb.FillSolidRect(10, 9, 1, 2, RGB(20,20,20));
    lock_button_hover.ReleaseGraphics(gb);

    lock_button_down = gdi.CreateImage(20, 20);
    gb = lock_button_down.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.DrawEllipse(7, 2, 6, 6, 1.0, RGB(220,220,220));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6, 7, 9, 6, RGB(220,220,220));
    gb.FillSolidRect(10, 9, 1, 2, RGB(20,20,20));
    lock_button_down.ReleaseGraphics(gb);

    toolbar.buttons.splice(0, toolbar.buttons.length);
    for(var i=0;i<toolbar.button_total;i++) {
        switch(i) {
         case 0:
            toolbar.buttons.push(new button(nowplaying_button_normal, nowplaying_button_hover, nowplaying_button_down));
            break;
         case 1:
            toolbar.buttons.push(new button(bt_settings_off, bt_settings_ov, bt_settings_on));
            break;
         case 2:
            toolbar.buttons.push(new button(lock_button_normal, lock_button_hover, lock_button_down));
            break;
        };
    };
};

function recalc_datas() {

    if(toolbar.lock) {
        toolbar.delta = toolbar.collapsed_y*-1;
        toolbar.state = true;
    };

    if(panel.vertical_mode) {

        if(panel.flat_mode) {
            cover.margin = panel.show_text ? 28 : 12;
            if(scrollbar.show) {
                cover.pad_right_mid = cover.default_pad_right_mid - 26 + vscrollbar.default_w;
            } else {
                cover.pad_right_mid = cover.default_pad_right_mid - 26;
            }
        } else {
            cover.margin = cover.margin_default;
            if(scrollbar.show) {
                cover.pad_right_mid = cover.default_pad_right_mid + vscrollbar.default_w;
            } else {
                cover.pad_right_mid = cover.default_pad_right_mid;
            }
        };
        cover.h = ww - cover.pad_left_mid - cover.pad_right_mid;
        if(cover.h>cover.max_size) cover.h = cover.max_size;
        cover.w = cover.h;

        if(panel.flat_mode) {
            list.nbvis = Math.floor(wh/(cover.h+cover.margin*0)) + 2 + 20;
            if(list.nbvis/2==Math.floor(list.nbvis/2)) {
                list.nbvis--;
            }
            list.mid = Math.floor(list.nbvis/2);
            list.nb_cover_to_draw = Math.floor(wh/(cover.h+cover.margin*0)) + 2;
        } else {
            list.nbvis = Math.floor(wh/(cover.h-cover.normal_delta*2)) + 2 + 20;
            if(list.nbvis/2==Math.floor(list.nbvis/2)) {
                list.nbvis--;
            }
            list.mid = Math.floor(list.nbvis/2);
            list.nb_cover_to_draw = Math.floor(wh/(cover.h-cover.normal_delta*2)) + 2;
        };

        if(scrollbar.themed) {
            scrollbar.theme = window.CreateThemeManager("scrollbar");
        } else {
            scrollbar.theme = false;
        };
        init_vscrollbar_buttons();

        button_up.x = ww - button_up.w;
        button_up.y = 0;
        button_down.x = ww - button_down.w;
        button_down.y = wh - button_down.h;
        vscrollbar.y = button_up.h;
        vscrollbar.h = wh - button_up.h - button_down.h;
        cursor.x = ww-vscrollbar.w;
        cursor.y = vscrollbar.y;
        cursor.w = vscrollbar.w;

    } else {

        if(panel.flat_mode) {
            cover.margin = 10;
        } else {
            cover.margin = cover.margin_default;
        };

        // mid cover (max size)
        if(scrollbar.show) {
            cover.pad_bot_mid = cover.default_pad_bot_mid - (panel.flat_mode?0:5);
        } else {
            cover.pad_bot_mid = cover.default_pad_bot_mid - hscrollbar.default_h - (panel.flat_mode?0:5);
        }
        if(panel.show_text) {
            cover.pad_top_mid = cover.default_pad_top_mid - (panel.flat_mode?16:0);
        } else {
            cover.pad_top_mid = cover.default_pad_top_mid - 16;
            cover.pad_bot_mid -= (panel.flat_mode?10:0);
        };
        cover.w = wh - cover.pad_top_mid - cover.pad_bot_mid;
        if(cover.w>cover.max_size) cover.w = cover.max_size;
        cover.h = cover.w;

        if(panel.flat_mode) {
            list.nbvis = Math.floor(ww/(cover.w+cover.margin*0)) + 2 + 20;
            if(list.nbvis/2==Math.floor(list.nbvis/2)) {
                list.nbvis--;
            }
            list.mid = Math.floor(list.nbvis/2);
            list.nb_cover_to_draw = Math.floor(ww/(cover.w+cover.margin*0)) + 2;
        } else {
            list.nbvis = Math.floor(ww/(cover.w-cover.normal_delta*2)) + 2 + 20;
            if(list.nbvis/2==Math.floor(list.nbvis/2)) {
                list.nbvis--;
            }
            list.mid = Math.floor(list.nbvis/2);
            list.nb_cover_to_draw = Math.floor(ww/(cover.w-cover.normal_delta*2)) + 2;
        };

        if(scrollbar.themed) {
            scrollbar.theme = window.CreateThemeManager("scrollbar");
        } else {
            scrollbar.theme = false;
        };
        init_hscrollbar_buttons();

        button_up.x = 0;
        button_up.y = wh - hscrollbar.h;
        button_down.x = ww - button_down.w;
        button_down.y = wh - hscrollbar.h;
        hscrollbar.x = button_up.w;
        hscrollbar.w = ww - button_up.w - button_down.w;
        cursor.y = wh - hscrollbar.h;
        cursor.x = hscrollbar.x;
        cursor.h = hscrollbar.h;
    };
};

function redraw_stub_images() {
    if(gdi.Image(images.nocover)) {
        nocover_img = FormatCover(gdi.Image(images.nocover), cover.w, cover.h);
    } else {
        nocover_img = FormatCover(nocover, cover.w, cover.h);
    };
    if(gdi.Image(images.stream)) {
        streamcover_img = FormatCover(gdi.Image(images.stream), cover.w, cover.h);
    } else {
        streamcover_img = FormatCover(streamcover, cover.w, cover.h);
    };
    if(gdi.Image(images.loading)) {
        loading_img = FormatCover(gdi.Image(images.loading), cover.w, cover.h);
    } else {
        loading_img = FormatCover(loading, cover.w, cover.h);
    };
};

function SelectGroupItems(start_id, start_gh_id, setfocus) {
    var count = 0;
    var affectedItems = Array();

    if(!utils.IsKeyPressed(VK_CONTROL)) plman.ClearPlaylistSelection(panel.active_playlist);

    if(start_gh_id<list.total_gh-1) {
        var last_id = list.hlist[start_gh_id+1];
    } else {
        var last_id = list.total;
    };
    for(var i = start_id; i < last_id; i++) {
        affectedItems.push(i);
        if(++count>9999) break;
    };
    plman.SetPlaylistSelection(panel.active_playlist, affectedItems, true);
    if(setfocus) {
        plman.SetPlaylistFocusItem(panel.active_playlist, start_id);
    };
//    CollectGarbage();
};

function ShowSelected() {
    if(panel.lock_playlist) return true;

    if(plman.PlaylistItemCount(plman.ActivePlaylist)==0 || !fb.GetFocusItem()) return true;
    plman.ClearPlaylistSelection(plman.ActivePlaylist);
    var pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
    plman.SetPlaylistFocusItem(plman.ActivePlaylist, pid);
    plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, pid, true);
    if(pid>=0 && pid<list.total) {
        refresh_spv(plman.ActivePlaylist, true);
    };
};

function ShowNowPlaying() {
    if(panel.lock_playlist) return true;
    if(fb.IsPlaying) {
        if(plman.PlaylistItemCount(plman.PlayingPlaylist)==0) {
            return true;
        };
        plman.ClearPlaylistSelection(plman.PlayingPlaylist);
        list.nowplaying = plman.GetPlayingItemLocation();
        var pid = list.nowplaying.PlaylistItemIndex;
        if(pid>=0 && pid<plman.PlaylistItemCount(plman.PlayingPlaylist)) {
            plman.SetPlaylistFocusItem(plman.PlayingPlaylist, pid);
            plman.SetPlaylistSelectionSingle(plman.PlayingPlaylist, pid, true);
            plman.ActivePlaylist = plman.PlayingPlaylist;
            refresh_spv(plman.PlayingPlaylist, true);
        };
    } else {
        if(plman.PlaylistItemCount(plman.ActivePlaylist)==0 || !fb.GetFocusItem()) return true;
        plman.ClearPlaylistSelection(plman.ActivePlaylist);
        var pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
        plman.SetPlaylistFocusItem(plman.ActivePlaylist, pid);
        plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, pid, true);
        if(pid>=0 && pid<list.total) {
            refresh_spv(plman.ActivePlaylist, true);
        };
    };
};

function ShowSearchedItem(pls, pid) {
    if(list.total==0 || !fb.GetFocusItem()) return true;
    if(pid<0) {
        pid = plman.GetPlaylistFocusItemIndex(pls);
    };

    plman.SetPlaylistFocusItem(pls, pid);
    plman.ClearPlaylistSelection(pls);
    plman.SetPlaylistSelectionSingle(pls, pid, true);
    refresh_spv(pls, true);

    if(panel.lock_playlist) {
        incsearch_timer_lock = window.SetTimeout(function() {
            var mid_idx = Math.floor(list.nbvis/2);
            list.item[mid_idx].checkstate("mid", list.item[mid_idx].x+5, list.item[mid_idx].y+5, mid_idx);
            incsearch_timer_lock && window.ClearTimeout(incsearch_timer_lock);
            incsearch_timer_lock = false;
        }, 100);
    };
};

function IncrementalSearch() {
    var count=0;
    var groupkey;
    var chr;
    var gstart;
    var pid = -1;
    var grp_first_item_id;

    // exit if no search string in cache
    if(g_search_string.length<=0) return true;

    // 1st char of the search string
    var first_chr = g_search_string.substring(0,1);
    var len = g_search_string.length;

    // which start point for the search
    if(list.total_gh>500) {
        grp_first_item_id = list.hlist[Math.floor(list.total_gh/2)];
        groupkey = tf_search_key.EvalWithMetadb(list.handlelist[grp_first_item_id]);
        chr = groupkey.substring(0,1);
        if(first_chr.charCodeAt(first_chr) > chr.charCodeAt(chr)) {
            gstart = Math.floor(list.total_gh/2);
        } else {
            gstart = 0;
        };
    } else {
        gstart = 0;
    };

    var format_str = "";
    for(var i=gstart;i<list.total_gh;i++) {
        grp_first_item_id = list.hlist[i];
        groupkey = tf_search_key.EvalWithMetadb(list.handlelist[grp_first_item_id]);
        format_str = groupkey.substring(0,len).toUpperCase();
        if(format_str==g_search_string) {
            pid = list.hlist[i];
            break;
        };
    };

    if(pid>=0) { // found!
        plman.ClearPlaylistSelection(panel.active_playlist);
        ShowSearchedItem(panel.active_playlist, pid);
    } else {
        list.inc_search_noresult = true;
        full_repaint();
    };

    clear_incsearch_timer && window.ClearTimeout(clear_incsearch_timer);
    clear_incsearch_timer = window.SetTimeout(function () {
        // reset incremental search string after 2 seconds without any key pressed
        var tt_x = Math.floor((ww / 2) - ((g_search_string.length*13)+(10*2)) / 2);
        var tt_y = Math.floor(wh/2) - 30;
        var tt_w = ((g_search_string.length*13)+(10*2));
        var tt_h = 60;
        g_search_string = "";
        window.RepaintRect(0, tt_y-2, ww, tt_h+4);
        clear_incsearch_timer && window.ClearTimeout(clear_incsearch_timer);
        clear_incsearch_timer = false;
        list.inc_search_noresult = false;
    }, 1000);
};

//=================================================// Item Context Menu
function new_context_menu(x, y, id, array_id) {

    var _menu = window.CreatePopupMenu();
    var Context = fb.CreateContextMenuManager();

    var _child01 = window.CreatePopupMenu();
    var _child02 = window.CreatePopupMenu();

    list.metadblist_selection = plman.GetPlaylistSelectedItems(panel.active_playlist);
    Context.InitContext(list.metadblist_selection);
    Context.BuildMenu(_menu, 1);

    _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
    _child01.AppendTo(_menu, MF_STRING, "选择...");

    _child01.AppendMenuItem((plman.IsAutoPlaylist(panel.active_playlist))?MF_DISABLED|MF_GRAYED:MF_STRING, 1000, "移除");
    _child02.AppendTo(_child01, MF_STRING, "添加到...");

    _child02.AppendMenuItem(MF_STRING, 2000, "新的播放列表...");
    _child02.AppendMenuItem(MF_SEPARATOR, 0, "");
    var pl_count = plman.PlaylistCount;
    for(var i=0;i<pl_count;i++) {
        if(i!=panel.active_playlist && !plman.IsAutoPlaylist(i)) {
            _child02.AppendMenuItem(MF_STRING, 2001+i, plman.GetPlaylistName(i));
        };
    };

    var ret = _menu.TrackPopupMenu(x, y);
    if(ret<800) {
        Context.ExecuteByID(ret - 1);
    } else if(ret<1000) {
        switch (ret) {
           case 880:

                break;
            case 890:

                break;
        };
    } else {
        switch (ret) {
            case 1000:
                plman.RemovePlaylistSelection(panel.active_playlist, false);
                break;
            case 2000:
                fb.RunMainMenuCommand("文件/新建播放列表");
                plman.InsertPlaylistItems(plman.PlaylistCount-1, 0, list.metadblist_selection, false);
                break;
            default:
                var insert_index = plman.PlaylistItemCount(ret-2001);
                plman.InsertPlaylistItems((ret-2001), insert_index, list.metadblist_selection, false);
        };
    };
};

function settings_menu(x, y) {
    var idx;
    var _menu = window.CreatePopupMenu();
    var _appearance = window.CreatePopupMenu();

    var current_pl_name = plman.GetPlaylistName(plman.ActivePlaylist);
    var lock_enabled = (current_pl_name!="CoverFlow 视图" && list.total_gh>0);

    _menu.AppendMenuItem(MF_STRING, 99, "锁定工具栏");
    _menu.CheckMenuItem(99, toolbar.lock?1:0);
    _menu.AppendMenuItem((lock_enabled || panel.lock_playlist)?MF_STRING:MF_DISABLED|MF_GRAYED, 1, "锁定当前播放列表");
    _menu.CheckMenuItem(1, panel.lock_playlist?1:0);
    _menu.AppendMenuItem(MF_STRING, 100, "电台 Logos");
    _menu.CheckMenuItem(100, radio_logo?1:0);
    _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
    _menu.AppendMenuItem(MF_STRING, 5, "CoverFlow 模式");
    _menu.AppendMenuItem(MF_STRING, 6, "平坦模式");
    _menu.CheckMenuRadioItem(5, 6, panel.flat_mode?6:5);
    _menu.AppendMenuItem(MF_SEPARATOR, 0, "");

    _appearance.AppendTo(_menu, MF_STRING, "显示");
    _appearance.AppendMenuItem(MF_STRING, 2, "显示滚动条");
    _appearance.CheckMenuItem(2, scrollbar.show?1:0);
//    _appearance.AppendMenuItem(MF_STRING, 3, "Themed Scrollbar Style");
//    _appearance.CheckMenuItem(3, scrollbar.themed?1:0);
    _appearance.AppendMenuItem(MF_STRING, 4, "使用滚动效果");
    _appearance.CheckMenuItem(4, panel.scroll_effect?1:0);
    _appearance.AppendMenuItem(MF_STRING, 7, "使用自定义颜色");
    _appearance.CheckMenuItem(7, panel.custom_colors?1:0);
    if(!panel.vertical_mode) {
        _appearance.AppendMenuItem(MF_STRING, 8, "显示专辑信息");
        _appearance.CheckMenuItem(8, panel.show_text?1:0);
        _appearance.AppendMenuItem(MF_STRING, 9, "显示倒影");
        _appearance.CheckMenuItem(9, cover.draw_reflection?1:0);
    };
    if(panel.flat_mode) {
        // tracks_counter_show: window.GetProperty("*USER.total.tracks.visible", true),
        _appearance.AppendMenuItem(MF_STRING, 10, "显示音轨数量");
        _appearance.CheckMenuItem(10, panel.tracks_counter_show?1:0);
    };

    _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
    _menu.AppendMenuItem((list.total>0)?MF_STRING:MF_DISABLED|MF_GRAYED, 22, "刷新CoverFlow");
    _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
    _menu.AppendMenuItem(MF_STRING, 20, "属性");
    _menu.AppendMenuItem(MF_STRING, 21, "配置...");
    idx = _menu.TrackPopupMenu(x, y);

    switch(idx) {
        case 1:
            if(panel.lock_playlist) {
                // unlock, set ActivePlaylist with locked playlist
                panel.lock_playlist = false;
                window.SetProperty("SYSTEM.panel.lock.playlist", panel.lock_playlist);
                plman.ActivePlaylist = panel.active_playlist;
            } else {
                //ShowSelected();
                //window.Repaint();
                // lock current playlist
                panel.lock_playlist = true;
                window.SetProperty("SYSTEM.panel.lock.playlist", panel.lock_playlist);
                panel.active_playlist = plman.ActivePlaylist;
                window.SetProperty("SYSTEM.panel.active.playlist", panel.active_playlist);
                //
                var mid_idx = Math.floor(list.nbvis/2);
                mid_idx = list.focus_id_item_idx;
                //mid_idx = list.marker_id;
                list.item[mid_idx].checkstate("mid", list.item[mid_idx].x+5, list.item[mid_idx].y+5, mid_idx);
            };
            break;
        case 2:
            if(list.total_gh>=2) {
                scrollbar.show = !scrollbar.show;
                if(scrollbar.show) {
                    scrollbar.visible = true;
                } else {
                    scrollbar.visible = false;
                };
            } else {
                scrollbar.visible = false;
            };
            window.SetProperty("SYSTEM.scrollbar.visible", scrollbar.show);
            //
            recalc_datas();
            redraw_stub_images();
            g_image_cache = new image_cache;
//            CollectGarbage();
            on_playlist_switch();
            break;
        case 3:
            scrollbar.themed = !scrollbar.themed;
            window.SetProperty("SYSTEM.scrollbar.themed", scrollbar.themed);
            if(scrollbar.themed) {
                scrollbar.theme = window.CreateThemeManager("scrollbar");
            } else {
                scrollbar.theme = false;
            };
            if(panel.vertical_mode) {
                init_vscrollbar_buttons();
            } else {
                init_hscrollbar_buttons();
            };
            set_scroller();
            full_repaint();
            break;
        case 4:
            panel.scroll_effect = !panel.scroll_effect;
            window.SetProperty("SYSTEM.panel.scroll.effect", panel.scroll_effect);
            full_repaint();
            break;
        case 5:
        case 6:
            panel.flat_mode = !panel.flat_mode;
            window.SetProperty("SYSTEM.panel.flat.mode", panel.flat_mode);
            //
            recalc_datas();
            redraw_stub_images();
            g_image_cache = new image_cache;
//            CollectGarbage();
            on_playlist_switch();
            break;
        case 7:
            panel.custom_colors = !panel.custom_colors;
            window.SetProperty("SYSTEM.panel.custom.colors", panel.custom_colors);
            on_colors_changed();
            break;
        case 8:
            panel.show_text = !panel.show_text;
            window.SetProperty("SYSTEM.panel.album.info", panel.show_text);
            //
            recalc_datas();
            redraw_stub_images();
            g_image_cache = new image_cache;
//            CollectGarbage();
            on_playlist_switch();
            break;
        case 9:
            cover.draw_reflection = !cover.draw_reflection;
            window.SetProperty("SYSTEM.cover.draw.reflection", cover.draw_reflection);
            full_repaint();
            break;
        case 10:
            panel.tracks_counter_show = !panel.tracks_counter_show;
            window.SetProperty("*USER.total.tracks.visible", panel.tracks_counter_show),
            full_repaint();
            break;
        case 20:
            window.ShowProperties();
            break;
        case 21:
            window.ShowConfigure();
            break;
        case 22:
            redraw_stub_images();
            g_image_cache = new image_cache;
//            CollectGarbage();
            on_playlist_switch();
            break;
        case 99:
            toolbar.lock = !toolbar.lock;
            window.SetProperty("SYSTEM.toolbar.lock", toolbar.lock);
            break;
        case 100:
            window.SetProperty("*USER.Radio Logos: on/off", radio_logo ? false : true);
            radio_logo = window.GetProperty("*USER.Radio Logos: on/off");
            window.SetProperty("*USER.group Key", radio_logo ? '$if($or($not(%length%),$stricmp($left(%path%,7),)),%title%$directory(%path%),%album%$directory(%path%))' : '$if($or($not(%length%),$stricmp($left(%path%,7),)),%album artist%%album%,%album%$directory(%path%))');
            window.GetProperty("*USER.group Key", radio_logo);
            recalc_datas();
            redraw_stub_images();
            g_image_cache = new image_cache;
//            CollectGarbage();
            on_playlist_switch();
            window.Reload();
            break;
        default:

    };
    g_menu_displayed = false;
    // toolbar collapse
    if(!toolbar.lock) {
        if(toolbar.delta==0) {
            toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
            toolbar.timerID_on = false;
        };
        if(toolbar.state) {
            if(!toolbar.timerID_off) {
                if(toolbar.delta == toolbar.collapsed_y*-1) {
                    toolbar.timerID_off = window.SetTimeout(function() {
                        if(!toolbar.timerID2) {
                            toolbar.timerID2 = window.SetInterval(function() {
                                toolbar.delta -= toolbar.step;
                                if(toolbar.delta <= 0) {
                                    toolbar.delta = 0;
                                    toolbar.state = false;
                                    window.ClearInterval(toolbar.timerID2);
                                    toolbar.timerID2 = false;
                                };
                                window.RepaintRect(0, 0, ww, 30);
                            }, 30);
                        } ;
                        toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                        toolbar.timerID_off = false;
                    }, 400);
                };
            };
        };
    };
    return true;
}

//=================================================// Drag'n'Drop Callbacks
/*var wsh_dragging = false;

function on_drag_enter() {
    wsh_dragging = true;
};

function on_drag_leave() {
    wsh_dragging = false;
};

function on_drag_over(action, x, y, mask) {
    on_mouse_move(x, y);
};

function on_drag_drop(action, x, y, mask) {
    wsh_dragging = false;
    // We are going to process the dropped items to a playlist
//    action.ToPlaylist();
    action.Playlist = plman.ActivePlaylist;
    action.ToSelect = false;
}*/