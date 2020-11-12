# myloon
loon配置文件
文件包含loon配置文件详细信息，转自：https://github.com/nzw9314/Loon


#### 喜马拉雅专用

| Name                    |   归属   | 属性   | 说明                                                         |
| ----------------------- | :------: | ------ | ------------------------------------------------------------ |
| `XMLY_SPEED_COOKIE`     | 喜马拉雅 | 必须 | [Cookie获取请参考](https://github.com/Zero-S1/xmly_speed/blob/master/xmly_speed.md),仅支持git actions执行,多个Cookie用换行即可 |
| `XMLY_ANDROID_AGENT`     | 喜马拉雅 | 非必须 | 仅安卓用的Agent配置，不填的话也会默认用红米8的 |
| `XMLY_ACCUMULATE_TIME`     | 喜马拉雅 | 非必须 | 需要刷时长任务的话，填入`zero_s1`；可能会黑号，请知悉 |
| `XMLY_ACCUMULATE_INDEX`     | 喜马拉雅 | 非必须 | 需配合`XMLY_ACCUMULATE_TIME`使用，用于限定某个索引的账号不进行刷时长 |
| `XMLY_ACCUMULATE_HOURS`     | 喜马拉雅 | 非必须 | 需配合`XMLY_ACCUMULATE_TIME`使用，用于限定每天收听的小时数,尽量避免黑号 |

