package services

import (
	"log"
	"sync"
)

//RefundServer ...
type RefundServer struct {
	*Services
	mutex *sync.Mutex
}

//NewRefundServer 初始化用户表服务结构体
func (service *Services) NewRefundServer() *RefundServer {

	m := &RefundServer{
		Services: service,
		mutex:    &sync.Mutex{},
	}
	return m
}

//GetRefundInfo ...
func (server *RefundServer) GetRefundInfo(city string, params map[string]interface{}) interface{} {

	dbConn, ok := server.cityDbs[city]
	if !ok {
		log.Println("数据库连接失效,请稍后再试...")
		return nil
	}
	where := " where 1=1"
	if bizSerialNo, ok := params["bizSerialNo"]; ok {
		where += " and biz_serial_no = " + bizSerialNo.(string)
	}
	if cardNo, ok := params["cardNo"]; ok {
		where += " and card_no = " + cardNo.(string)
	}
	if cplc, ok := params["cplc"]; ok {
		where += " and cplc = " + cplc.(string)
	}
	info := make([]map[string]interface{}, 0)
	if db := dbConn.Raw("SELECT * FROM cb_refund" + where).Scan(&info); db.Error != nil {
		log.Printf("执行数据库操作失败:%s", db.Error)
		return nil
	}
	return info
}
