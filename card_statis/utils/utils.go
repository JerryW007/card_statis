package utils

/*
 * @Author: wangchao
 * @Date: 2019-01-09 11:10:16
 * @Last Modified by: wangchao
 * @Last Modified time: 2019-05-07 16:47:29
 */

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	uuid "github.com/nu7hatch/gouuid"
)

//IsLocal 判断是否是本地
func IsLocal() bool {
	hostname, _ := os.Hostname()
	isLocal := false
	if strings.Contains(hostname, "local") {
		isLocal = true
	}
	if strings.Contains(hostname, "bogon") {
		isLocal = true
	}
	if strings.Contains(hostname, "MacBook") {
		isLocal = true
	}
	if strings.Contains(hostname, "MBP") {
		isLocal = true
	}
	if strings.Contains(hostname, "coolboy") {
		isLocal = true
	}
	return isLocal
}

//CreateCode 生成短信验证码
func CreateCode() string {
	code := ""
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < 6; i++ {
		code += fmt.Sprint(r.Intn(10))
	}
	return code
}

const (
	//MsgModel 短信模板
	MsgModel = ""
	//MsgURL 短信接口
	MsgURL = ""
)

//SendMsgCode 发送短信验证码
func SendMsgCode(phone, code string) error {
	// client := http.
	// type body struct {
	// }
	return nil
}

//GetHash 获取hash值
func GetHash(data string) string {
	hash := sha1.New()
	if _, err := hash.Write([]byte(data)); err != nil {
		log.Println("hash write err", err)
		return ""
	}
	return string(hash.Sum(nil))
}

//GetUUID 获取UUID
func GetUUID() string {
	id, err := uuid.NewV4()
	if err != nil {
		return ""
	}
	// idStr := ""
	// for v := range uuid {
	// 	idStr += fmt.Sprintf("%x", v)
	// }
	return strings.Replace(id.String(), "-", "", -1)
}

//PostJSON 发送Post请求
func PostJSON(url, body string) []byte {
	client := &http.Client{
		Timeout: time.Minute,
	}
	resp, err := client.Post(url, "application/json", strings.NewReader(body))
	if err != nil {
		log.Println("post url err: ", err)
	}
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("read body err:", err)
	}
	return respBody
}

//RequestGet 发送get请求
func RequestGet(url string) ([]byte, error) {
	client := &http.Client{
		Timeout: time.Minute,
	}
	resp, err := client.Get(url)
	if err != nil {
		log.Println("post url err: ", err)
		return nil, err
	}
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("read body err:", err)
		return nil, err
	}
	return respBody, nil
}

//PostJSONWithTimeOut ...
func PostJSONWithTimeOut(url, body string, timeout time.Duration) (resp []byte, err error) {
	client := &http.Client{
		Timeout: timeout,
	}
	response, err := client.Post(url, "application/json", strings.NewReader(body))
	if err != nil {
		log.Println("post url err: ", err)
		return resp, err
	}
	resp, err = ioutil.ReadAll(response.Body)
	if err != nil {
		log.Println("read body err:", err)
		return resp, err
	}
	return resp, err
}

//RemoteIP 获取ip
func RemoteIP(req *http.Request) string {
	remoteAddr := req.RemoteAddr
	if ip := req.Header.Get("Remote_addr"); ip != "" {
		remoteAddr = ip
	} else {
		remoteAddr, _, _ = net.SplitHostPort(remoteAddr)
	}

	if remoteAddr == "::1" {
		remoteAddr = "127.0.0.1"
	}

	return remoteAddr
}

//GetBody 获取请求body
func GetBody(r *http.Request) map[string]interface{} {
	bodyMap := make(map[string]interface{}, 0)
	if body, err := ioutil.ReadAll(r.Body); err == nil {
		log.Println(string(body))
		if err = json.Unmarshal(body, &bodyMap); err != nil {
			log.Println(err)
		}

	} else {
		log.Println(err)
	}
	return bodyMap
}

//GetPwdHash 获取加密的密码
func GetPwdHash(pwd, salt string) string {
	return base64.StdEncoding.EncodeToString([]byte(GetHash(pwd + salt)))
}

//IsPhone 验证是否是手机号
func IsPhone(phone string) bool {
	reg := "^[1][3,4,5,7,8][0-9]{9}$"
	match, _ := regexp.MatchString(reg, phone)
	return match
}

//ParseJSONFromReader ...
func ParseJSONFromReader(data io.Reader) (map[string]interface{}, error) {
	body, err := ioutil.ReadAll(data)
	if err != nil {
		return nil, err
	}
	var bodyMap map[string]interface{}
	if err := json.Unmarshal(body, &bodyMap); err != nil {
		return nil, err
	}
	return bodyMap, nil
}
