package controller

import (
	"cardStatis/model"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

/*addAcmLogRulerHandler 添加日志查询规则
 * File: acmLogController.go
 * File Created: Tuesday, 19th January 2021 12:18:11 pm
 * Author: 王朝 (chao.wang@snowballtech.com)
 * -----
 * Last Modified: Tuesday, 19th January 2021 12:19:15 pm
 * Modified By: 王朝 (chao.wang@snowballtech.com>)
 * -----
 * Copyright 2020 - 2021, 深圳市雪球可以科技有限公司
 */
func (handler *BaseController) addAcmLogRulerHandler(r *http.Request) HTTPResponse {
	body, _ := ioutil.ReadAll(r.Body)
	log.Println(string(body))
	var acmLogRuler model.AcmLogRuler
	if err := json.Unmarshal(body, &acmLogRuler); err != nil {
		log.Println(err.Error())
		return handler.ErrorResp(err.Error())
	}
	handler.AcmLogRuler.AddRuler(acmLogRuler)
	return handler.OkResp()
}
