use font_center;
create table project
(
  id int auto_increment comment 'project ID' primary key,
  name varchar(20) default '' not null comment '项目组名称',
  create_time varchar(255) comment '创建时间',
  update_time varchar(255) comment '更新时间'
)
comment '项目组列表';