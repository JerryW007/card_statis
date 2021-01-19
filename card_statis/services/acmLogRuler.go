package services

import (
	"cardStatis/model"
	"sync"
	"time"
)

/*AcmLogRulerServer ACM日志规则管理类
* File: acmLogRuler.go
* File Created: Tuesday, 19th January 2021 11:56:02 am
* Author: 王朝 (chao.wang@snowballtech.com)
* -----
* Last Modified: Tuesday, 19th January 2021 11:57:22 am
* Modified By: 王朝 (chao.wang@snowballtech.com>)
* -----
* Copyright 2020 - 2021, 深圳市雪球可以科技有限公司
 */
type AcmLogRulerServer struct {
	*Services
	mutex *sync.Mutex
}

//NewAcmRulerServer ...
func (service *Services) NewAcmRulerServer() *AcmLogRulerServer {
	m := &AcmLogRulerServer{
		Services: service,
		mutex:    &sync.Mutex{},
	}
	return m
}

//AddRuler 添加日志规则
func (server *AcmLogRulerServer) AddRuler(acmLogRuler model.AcmLogRuler) {
	acmLogRuler.CreateTime = time.Now()
	acmLogRuler.UpdateTime = time.Now()
	server.selfDb.Create(&acmLogRuler)
}
