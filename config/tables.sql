# 创建acm日志规则表
create table acm_log_ruler(
	id int(11) primary key AUTO_INCREMENT comment "id",
	name varchar(20) comment "规则名称",
	city varchar(10) comment "所属城市",
	link_table_name varchar(20) comment "关联表名称",
	contain_req bool comment "是否包含请求",
	contain_resp bool comment "是否包含响应",
	and_keys varchar(64) comment "包含的关键字",
	not_keys varchar(64) comment "排除的关键字",
	params varchar(64) comment "查询的关键字",
	create_time timestamp comment "创建时间",
	update_time timestamp comment "更新时间"
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='acm日志规则表'