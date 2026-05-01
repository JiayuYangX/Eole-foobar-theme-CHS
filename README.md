# Eole-foobar-theme-CHS

本仓库为 foobar2000 [Eole](https://github.com/Ottodix/Eole-foobar-theme) 主题的汉化版（仅支持 32 位版本），提取自 [shooterspps/foobar2000](https://github.com/shooterspps/foobar2000) 安装包文件，优化部分汉化文本及界面细节，并依照 Eole 后来更新的内容同步部分更新。另外自行增加了跟随 Columns UI 深浅色自动切换的功能。

### 深浅色自动切换

可在主菜单的 `皮肤设置 > 颜色 > 深浅色跟随 CUI 设置` 选项开启。启用此功能须在 Columns UI 的设置里打开深浅色使用系统设置的选项。

### 安装方法

1. 将压缩包里的所有文件解压到配置文件目录里（标准安装位于 `%AppData%\foobar2000` 或 `%AppData%\foobar2000-v2` ，便携版位于软件根目录下的 `profile` 文件夹里）
2. 启动软件，用户界面选择“分栏用户界面”（即 Columns UI）
3. 在 Columns UI 的设置里导入 `[FOOBAR_PROFILE_DIRECTORY]\themes\eole\columnsUI_eole.fcl`
4. 在 Shpeck 中配置 Winamp 目录以进行可视化（`File` > `Preferences` > `Visualisations` > `Shpeck`）。点击右上角的 `...` 按钮可以浏览并选择目录 `[FOOBAR_PROFILE_DIRECTORY]\plugins\winamp`
