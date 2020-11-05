package services

import (
	"fmt"
	"log"
	"sync"
	"time"
)

//PersoServer ...
type PersoServer struct {
	*Services
	mutex *sync.Mutex
}

//NewPersoServer 初始化用户表服务结构体
func (service *Services) NewPersoServer() *PersoServer {

	m := &PersoServer{
		Services: service,
		mutex:    &sync.Mutex{},
	}
	return m
}

//StatByMinute ...
func (server *PersoServer) StatByMinute(city string) interface{} {

	dbConn, ok := server.cityDbs[city]
	if !ok {
		log.Println("数据库连接失效,请稍后再试...")
		return nil
	}
	onMonthBefore := time.Now().AddDate(-1, 0, 0).Unix() * 1000
	// oneMinute := 60 * 60 * 1000
	type Result struct {
		Count      int   `gorm:"column:count"`
		CreateTime int64 `gorm:"column:createDate"`
	}
	info := make([]Result, 0)
	sql := fmt.Sprintf("SELECT count(1) as count, floor(`create_time`/3600000) * 3600000 as `createDate` FROM `perso`  WHERE (`create_time` > %d) GROUP BY createDate order by createDate desc", onMonthBefore)
	// if db := dbConn.Table("perso").Select("count(1) as count, floor(`create_time`/?) * ? as `createDate`,create_time", oneMinute, oneMinute).Where("`create_time` > ?", onMonthBefore).Group("createDate").Find(&info); db.Error != nil {
	// 	log.Printf("执行数据库操作失败:%s", db.Error)
	// 	return nil
	// }
	if db := dbConn.Raw(sql).Scan(&info); db.Error != nil {
		log.Printf("执行数据库操作失败:%s", db.Error)
		return nil
	}
	return info
}
