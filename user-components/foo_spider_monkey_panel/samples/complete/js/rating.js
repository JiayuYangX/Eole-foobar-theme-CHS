'use strict';

function _rating(x, y, size, colour) {
	this.paint = (gr) => {
		if (panel.metadb) {
			gr.SetTextRenderingHint(4);
			for (let i = 0; i < this.get_max(); i++) {
				gr.DrawString(i + 1 > (this.hover ? this.hrating : this.rating) ? chars.rating_off : chars.rating_on, this.font, this.colour, this.x + (i * this.h), this.y, this.h, this.h, SF_CENTRE);
			}
		}
	}
	
	this.metadb_changed = () => {
		if (panel.metadb) {
			this.hover = false;
			this.rating = this.get_rating();
			this.hrating = this.rating;
			this.tiptext = this.properties.mode.value == 0 ? '先选择模式.' : panel.tf('评级 "%title%" 来自 "%artist%".');
		}
		window.Repaint();
	}
	
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}
	
	this.move = (x, y) => {
		if (this.trace(x, y)) {
			if (panel.metadb) {
				_tt(this.tiptext);
				this.hover = true;
				this.hrating = Math.ceil((x - this.x) / this.h);
				window.RepaintRect(this.x, this.y, this.w, this.h);
			}
			return true;
		} else {
			this.leave();
			return false;
		}
	}
	
	this.leave = () => {
		if (this.hover) {
			_tt('');
			this.hover = false;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
	}
	
	this.lbtn_up = (x, y) => {
		if (this.trace(x, y)) {
			if (panel.metadb) {
				this.set_rating();
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.rbtn_up = (x, y) => {
		_.forEach(this.modes, (item, i) => {
			panel.s10.AppendMenuItem(i == 1 && !this.foo_playcount ? MF_GRAYED : MF_STRING, i + 1000, item);
		});
		panel.s10.CheckMenuRadioItem(1000, 1003, this.properties.mode.value + 1000);
		panel.s10.AppendTo(panel.m, MF_STRING, '模式');
		panel.m.AppendMenuItem(this.properties.mode.value == 2 ? MF_STRING : MF_GRAYED, 1004, '标签名称');
		panel.m.AppendMenuItem(this.properties.mode.value > 1 ? MF_STRING : MF_GRAYED, 1005, '最大值...');
		panel.m.AppendMenuSeparator();
	}
	
	this.rbtn_up_done = (idx) => {
		let tmp;
		switch (true) {
		case idx <= 1003:
			this.properties.mode.value = idx - 1000;
			break;
		case idx == 1004:
			tmp = utils.InputBox(window.ID, '输入自定义标签名. 不要使用 %%. 如果留空，则默认为 "rating".', window.ScriptInfo.Name, this.properties.tag.value);
			this.properties.tag.value = tmp || this.properties.tag.default_;
			break;
		case idx == 1005:
			tmp = utils.InputBox(window.ID, '输入最大值。如果留空，则默认为“5”.', window.ScriptInfo.Name, this.properties.max.value);
			this.properties.max.value = tmp || this.properties.max.default_;
			break;
		}
		this.w = this.h * this.get_max();
		panel.item_focus_change();
	}
	
	this.get_rating = () => {
		switch (this.properties.mode.value) {
		case 1: // foo_playcount
			return panel.tf('$if2(%rating%,0)');
		case 2: // file tag
			let f = panel.metadb.GetFileInfo();
			const idx = f.MetaFind(this.properties.tag.value);
			const ret = idx > -1 ? f.MetaValue(idx, 0) : 0;
			return ret;
		case 3: // Spider Monkey Panel DB
			return panel.tf('$if2(%smp_rating%,0)');
		default:
			return 0;
		}
	}
	
	this.set_rating = () => {
		switch (this.properties.mode.value) {
		case 1: // foo_playcount
			fb.RunContextCommandWithMetadb('播放统计信息/等级/' + (this.hrating == this.rating ? '<未设置>' : this.hrating), panel.metadb, 8);
			break;
		case 2: // file tag
			const tmp = this.hrating == this.rating ? '' : this.hrating;
			let obj = {};
			obj[this.properties.tag.value] = tmp;
			let handles = new FbMetadbHandleList(panel.metadb);
			handles.UpdateFileInfoFromJSON(JSON.stringify(obj));
			break;
		case 3: // Spider Monkey Panel DB
			panel.metadb.SetRating(this.hrating == this.rating ? 0 : this.hrating);
			panel.metadb.RefreshStats();
			break;
		}
	}
	
	this.get_max = () => {
		return this.properties.mode.value < 2 ? 5 : this.properties.max.value;
	}
	
	this.properties = {
		mode : new _p('2K3.评级.模式', 0), // 0 not set 1 foo_playcount 2 file tag 3 Spider Monkey Panel DB
		max : new _p('2K3.评级.最大值', 5), // only use for file tag/Spider Monkey Panel DB
		tag: new _p('2K3.评级.标签', 'rating')
	};
	this.x = x;
	this.y = y;
	this.h = _scale(size);
	this.w = this.h * this.get_max();
	this.colour = colour;
	this.hover = false;
	this.rating = 0;
	this.hrating = 0;
	this.font = gdi.Font('FontAwesome', this.h - 2);
	this.modes = ['未设置', '播放统计信息（foo_playcount）', '文件标签', '蜘蛛猴面板 DB'];
	this.foo_playcount = _cc('foo_playcount');
	window.SetTimeout(() => {
		if (this.properties.mode.value == 1 && !this.foo_playcount) { // if mode is set to 1 (foo_playcount) but component is missing, reset to 0.
			this.properties.mode.value = 0;
		}
		if (this.properties.mode.value == 0) {
			fb.ShowPopupMessage('这个脚本现在已经更新，支持3种不同的模式。\n\n第一个，您可以使用foo_playcount，它限制为5星。\n\n第二个选项是写入文件标签。可以通过右键单击菜单选择标记名和最大值。\n\n最后一个，新的“回放统计”数据库已内置到蜘蛛猴面板中。它只绑定到“%artist%-%title%”。它使用了%smp_rating%，可通过所有其他组件/搜索对话框中的标题格式访问。这也支持自定义最大值。\n\n右键单击菜单上有所有选项。如果右键单击时没有看到新选项，请确保已从“samples\\complete”文件夹导入最新的“rating.txt”', window.ScriptInfo.Name);
		}
	}, 500);
}
