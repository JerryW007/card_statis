package model

import (
	"time"
)

/*AcmLogRuler 日志查询规则类
* File: acmLogRuler.go
* File Created: Tuesday, 19th January 2021 11:02:04 am
* Author: 王朝 (chao.wang@snowballtech.com)
* -----
* Last Modified: Tuesday, 19th January 2021 11:43:41 am
* Modified By: 王朝 (chao.wang@snowballtech.com>)
* -----
* Copyright 2020 - 2021, 深圳市雪球可以科技有限公司
 */
type AcmLogRuler struct {
	ID            int       `gorm:"primary_key AUTO_INCREMENT"`
	Name          string    `json:"name"`
	City          string    `json:"city"`
	LinkTableName string    `gorm:"column:link_table_name" json:"linkTableName"`
	ContainReq    bool      `gorm:"column:contain_req" json:"containReq"`
	ContainResp   bool      `gorm:"column:contain_resp" json:"containResp"`
	AndKeys       string    `gorm:"column:and_keys" json:"andKeys"`
	NotKeys       string    `gorm:"column:not_keys" json:"notKeys"`
	Params        string    `json:"params"`
	CreateTime    time.Time `gorm:"column:create_time" json:"createTime"`
	UpdateTime    time.Time `gorm:"dcolumn:update_time" json:"updateTime"`
}

//TableName 设置AcmLogRuler的表名为`acm_log_ruler`
func (AcmLogRuler) TableName() string {
	return "acm_log_ruler"
}
