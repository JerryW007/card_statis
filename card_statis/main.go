package main

import (
	"cardStatis/controller"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/sirupsen/logrus"
)

var mainLog *logrus.Entry

func init() {
	mainLog = logrus.WithFields(logrus.Fields{"Server": "[Main]"})
}

func main() {

	_env := flag.String("db", "test", "db enviromnment")
	showSQL := flag.Bool("ss", false, "is show sql log?")
	flag.Parse()

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, os.Interrupt)
	signal.Notify(sigchan, syscall.SIGTERM)

	//server
	startTime := time.Now()
	server := controller.NewHTTPServer(true, *showSQL, *_env)
	if server == nil {
		mainLog.Info("服务启动失败...")
		os.Exit(1)
	}
	if !server.Listen(":8081") {
		mainLog.Info("[pcs] failed to listen to http...")
		os.Exit(1)
	}
	server.Infof("[pcs] Server started on Port:8081 Cost-Time:%s", fmt.Sprintf("%0.2f", time.Now().Sub(startTime).Seconds()*1000)+"/ms")

	<-sigchan
	mainLog.Warn("[pcs] Exiting...")
	server.Close()
	mainLog.Warn("[pcs] Done.")
}

func connectDB(dbConn string) (*gorm.DB, bool) {
	//db
	var engine *gorm.DB
	if dbConn == "" {
		return engine, false
	}
	// if util.IsLocal() {
	// 	//测试数据库
	// 	dbConn = "mmyx_app:YEdFJqudsF6ueO@tcp(120.92.45.50:3306)/mmyx_product?charset=utf8"
	// }
	engine, err := gorm.Open("mysql", dbConn)
	// engine.ShowSQL(false)
	// engine.Logger().SetLevel(core.LOG_DEBUG)
	if err != nil {
		fmt.Println(err)
		// mainLog.Warn("Can not open mmApi DB '"+dbConn+"' err:", err)
		return engine, false
	}
	// go func() {
	// 	for true {
	// 		time.Sleep(time.Minute * 30)
	// 		engine.Ping()
	// 	}
	// }()
	// if err := engine.Ping(); err != nil {
	// 	mainLog.WithField("err", err).Panic("Can not ping mmApi DB: " + dbConn)
	// }
	// mainLog.Info("connected to mmApi DB '" + dbConn + "'")
	return engine, true
}
