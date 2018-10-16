use user_center;
create table user
(
  id int auto_increment comment '用户ID' primary key,
  username varchar(20) default '' not null comment '用户名',
  password varchar(255) default '' not null comment '密码',
  create_time varchar(255) comment '创建时间',
  update_time varchar(255) comment '更新时间'
)
comment '用户列表';