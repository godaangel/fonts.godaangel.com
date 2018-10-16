use font_center;
create table svg
(
  id int auto_increment comment 'svg ID' primary key,
  name varchar(20) default '' not null comment 'svg名称',
  file varchar(255) default '' not null comment '存储路径',
  project_id int not null comment '所属项目组',
  create_time varchar(255) comment '创建时间',
  update_time varchar(255) comment '更新时间'
)
comment 'svg列表';