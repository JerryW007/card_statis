package controller

import (
	"net/http"

	"github.com/gorilla/mux"
)

//AccountDetailsHandler 账户详情
func (handler *BaseController) getRefundInfoHandler(r *http.Request) HTTPResponse {
	var city string
	var ok bool
	if city, ok = mux.Vars(r)["city"]; !ok {
		return handler.ErrorResp("param err").Add("code", 400)
	}
	params := make(map[string]interface{}, 0)
	params["bizSerialNo"] = "6222159292021011211594214978599"
	refundInfo := handler.Services.Refund.GetRefundInfo(city, params)
	return handler.OkResp().Add("data", refundInfo)
}
