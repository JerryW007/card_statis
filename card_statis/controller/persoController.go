package controller

import (
	"net/http"

	"github.com/gorilla/mux"
)

//AccountDetailsHandler 账户详情
func (handler *BaseController) statByMinuteHandler(r *http.Request) HTTPResponse {
	var city string
	var ok bool
	if city, ok = mux.Vars(r)["city"]; !ok {
		return handler.ErrorResp("param err").Add("code", 400)
	}

	persoStat := handler.Services.Perso.StatByMinute(city)
	return handler.OkResp().Add("data", persoStat)
}
