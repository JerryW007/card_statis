package controller

import (
	"cardStatis/config"
	"cardStatis/services"
	"cardStatis/utils"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/jcuga/golongpoll"
	"github.com/mgutz/ansi"
	"github.com/sirupsen/logrus"
)

//HTTPResponse Api 返回
type HTTPResponse map[string]interface{}

//BaseController ...
type BaseController struct {
	services.Services

	router    *mux.Router
	startTime time.Time
	ready     *sync.Cond
	staging   bool
	waiting   bool
	listener  net.Listener
	pubsub    *golongpoll.LongpollManager //保存请求,异步处理
	*logrus.Entry
	mutex *sync.Mutex
}

//NewHTTPServer ...
func NewHTTPServer(staging bool, showSQL bool, env string) *BaseController {

	server := new(BaseController)
	server.startTime = time.Now()
	server.staging = staging
	server.mutex = new(sync.Mutex)
	server.ready = sync.NewCond(&sync.Mutex{})
	server.waiting = true
	server.Entry = logrus.WithFields(logrus.Fields{"Server": "HTTPServer"})
	manager, _ := golongpoll.StartLongpoll(golongpoll.Options{
		MaxLongpollTimeoutSeconds:      60,
		MaxEventBufferSize:             200,
		EventTimeToLiveSeconds:         60 * 60,
		DeleteEventAfterFirstRetrieval: false,
	})
	//初始化配置
	helper := new(config.Helper)
	if err := helper.Load("./config/config.yaml"); err != nil {
		log.Println("配置初始化失败:", err)
		return nil
	}

	server.pubsub = manager
	server.ServicesInit(*helper, showSQL, env)
	server.start()

	return server
}

//Close 关闭监听服务
func (server *BaseController) Close() {
	server.Info("[server] Closing HTTP server")
	server.listener.Close()
}

//ErrorResp 返回错误的响应
func (server *BaseController) ErrorResp(err string) HTTPResponse {
	return HTTPResponse{
		"status": "error",
		"data":   err,
	}
}

//OkResp 返回正常响应
func (server *BaseController) OkResp() HTTPResponse {
	return HTTPResponse{
		"status": "ok",
	}
}

//Add ...
func (resp HTTPResponse) Add(key string, value interface{}) HTTPResponse {
	resp[key] = value
	return resp
}

//writeResponse 拼装请求响应
func writeResponse(w http.ResponseWriter, body []byte, startTime time.Time) {

	l := len(body)
	w.Header().Set("Server", "pcs")
	w.Header().Set("X-Powered-By", "") //X start by X means defined by author,not important
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("Content-Length", fmt.Sprint(l))
	w.Header().Set("X-Time", fmt.Sprintf("%s", time.Now().Sub(startTime)))
	w.Write(body)
}

//statusHandler 服务状态接口
func (server *BaseController) statusHandler(w http.ResponseWriter, r *http.Request) {

	startTime := time.Now()

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	hostname, _ := os.Hostname()
	response := map[string]interface{}{
		"version":   "1.0",
		"aliveTime": fmt.Sprintf("%v", time.Now().Sub(server.startTime)),
		"startTime": server.startTime,
		"staging":   server.staging,
		"hostname":  hostname,
	}
	// server.Infof("[status] %+v\n", response)

	rbody, _ := json.Marshal(response)
	writeResponse(w, rbody, startTime)
}

//notFound 404请求处理
func notFound(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	response := map[string]interface{}{
		"status":  "error",
		"message": "404",
	}
	body, _ := json.Marshal(response)
	writeResponse(w, body, startTime)
}

//start 服务开始
func (server *BaseController) start() {
	server.ready.L.Lock()
	server.ready.Broadcast()
	server.waiting = false
	server.ready.L.Unlock()
}

//Wait 等待处理
func (server *BaseController) Wait() {
	server.ready.L.Lock()
	if server.waiting {
		server.ready.Wait()
	}
	server.ready.L.Unlock()
}

//Listen 监听端口
func (server *BaseController) Listen(port string) bool {

	router := mux.NewRouter()
	server.router = router
	router.NotFoundHandler = http.HandlerFunc(notFound)

	apirouter := router.PathPrefix("/pcs/v1/platform").Subrouter()
	apirouter.HandleFunc("/status", server.statusHandler)
	apirouter.HandleFunc("/{city}/perso", server.addResponseHeaders(server.statByMinuteHandler))

	server.WithField("port", port).Info("start listen")
	listener, err := net.Listen("tcp", port)
	if err != nil {
		server.WithField("err", err).Error("[server] listen port")
	}

	go func() {
		if err := http.Serve(listener, router); err != nil {
			server.Warn("Error while listening", "err", err)
			time.Sleep(time.Second * 5)
			os.Exit(1)
		}
	}()
	server.listener = listener
	return true
}

// func getRequestStatusCode(resp HTTPResponse) int {
// 	if resp["status"] == "ok" {
// 		return 200
// 	}
// 	codesSection := global.GetSection("ERRORCODE")
// 	for _, kv := range codesSection.Keys() {
// 		if kv.Value() == resp["data"] {
// 			code, _ := strconv.Atoi(kv.Name())
// 			return code
// 		}
// 	}
// 	return 500
// }

//addResponseHeaders 包装请求返回
func (server *BaseController) addResponseHeaders(fn func(r *http.Request) HTTPResponse) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		origin := "*"
		allowHeader := "*"
		if r.Header["Origin"] != nil {
			origin = r.Header["Origin"][0]
		}
		server.WithFields(logrus.Fields{
			"ip":     utils.RemoteIP(r),
			"path":   r.URL.Path,
			"host":   r.URL.Host,
			"method": r.Method,
			"origin": origin,
			// "body":   bb,
		}).Info("API CONNECTION")

		if r.Header["Access-Control-Request-Headers"] != nil {
			allowHeader = r.Header["Access-Control-Request-Headers"][0]
		}
		w.Header().Set("Server", "hmgo-mmyx")
		w.Header().Set("X-Powered-By", "hmgo-mmyx/1.0")
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		w.Header().Set("Access-Control-Allow-Headers", allowHeader)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8,text/html")

		defer func() {
			if err := recover(); err != nil {
				resp := server.ErrorResp(fmt.Sprint(err))
				body, _ := json.Marshal(resp)
				l := len(body)
				w.WriteHeader(500)
				w.Header().Set("Content-Length", fmt.Sprint(l))
				w.Header().Set("X-Time", "0s")
				w.Write(body)
				server.WithField("err", err).Error("system error")
			}
		}()

		startTime := time.Now()
		//TODO: 增加接口权限控制
		if r.Method == "OPTIONS" {
			return
		}
		// pass, code := server.PermissionFilter(r)
		response := HTTPResponse{
			"status": "error",
			"data":   "error",
		}
		response = fn(r)
		var code = 200
		if response["status"] == "error" {
			code = 500
			if response["code"] != nil {
				code = response["code"].(int)
			}
		}

		w.WriteHeader(code)
		dt := time.Now().Sub(startTime)
		response["reqtime"] = fmt.Sprintf("%s", dt)
		body, _ := json.Marshal(response)

		l := len(body)
		w.Header().Set("Content-Length", fmt.Sprint(l))
		w.Header().Set("X-Time", fmt.Sprintf("%s", time.Now().Sub(startTime)))
		w.Write(body)
		if dt > time.Millisecond*500 {
			log.Printf("[HTTP] Request %s is too slow: %v\n", ansi.Color(r.URL.String(), "blue"), dt)

		}

	}
}
