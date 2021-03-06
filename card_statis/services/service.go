package services

import (
	"cardStatis/config"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
)

//AsyncService ...
type AsyncService struct {
	StartTime time.Time
	*logrus.Entry
	Env string
	// CurrUsers  map[string]model.Account
	ThreadChan chan string
	sync.Mutex
	cityDbs map[string]*gorm.DB
	selfDb  *gorm.DB
	*config.Helper
}

//Services 服务组合基础结构体
type Services struct {
	*AsyncService
	Perso       *PersoServer
	Refund      *RefundServer
	AcmLogRuler *AcmLogRulerServer
}

//ServicesInit 初始化服务基础结构体
func (server *Services) ServicesInit(helper config.Helper, showSQL bool, env string) {
	server.AsyncService = InitAsyncServie(env, helper)
	//初始化数据库连接
	for key, value := range server.Config.DataBase {
		server.WithFields(logrus.Fields{
			"key": key,
		}).Info("开始连接城市数据库")
		url := value.UserName + ":" + value.Password + "@tcp(" + strings.Split(value.JdbcURL, "/")[0] + ")/" + strings.Split(value.JdbcURL, "/")[1]
		connection, isSucc := connectDB(url)
		if !isSucc {
			server.WithFields(logrus.Fields{
				"key": key,
			}).Info("初始化城市数据库连接失败")
			os.Exit(-1)
		}
		connection.LogMode(showSQL)
		server.WithFields(logrus.Fields{
			"key": key,
		}).Info("初始化城市数据库连接成功")
		if key == "pcs" {
			server.selfDb = connection
			continue
		}
		server.cityDbs[key] = connection
	}
	server.Perso = server.NewPersoServer()
	server.Refund = server.NewRefundServer()
	server.AcmLogRuler = server.NewAcmRulerServer()
}

//InitAsyncServie 初始化服务结构体父级
func InitAsyncServie(env string, helper config.Helper) *AsyncService {

	m := &AsyncService{
		StartTime: time.Now(),
		Env:       env,
		Helper:    &helper,
		cityDbs:   make(map[string]*gorm.DB, 0),
		Entry:     logrus.WithFields(logrus.Fields{"\tLAYER": "Services"}),
	}
	return m
}

func connectDB(dbConn string) (*gorm.DB, bool) {
	//db
	var engine *gorm.DB
	if dbConn == "" {
		return engine, false
	}
	engine, err := gorm.Open("mysql", dbConn)
	if err != nil {
		fmt.Println(err)
		return engine, false
	}
	return engine, true
}
