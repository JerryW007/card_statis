package config

import (
	"errors"
	"io/ioutil"
	"log"
	"time"

	"gopkg.in/yaml.v2"
)

/*Config 配置
 *
 */
type Config struct {
	DataBase map[string]struct {
		Type     string `yaml:"type"`
		JdbcURL  string `yaml:"jdbc-url"`
		UserName string `yaml:"username"`
		Password string `yaml:"password"`
	} `yaml:"datasource"`
}

/*Helper 配置管理
 *
 */
type Helper struct {
	Config       Config
	LastLoadTime int64
}

//Load ...
func (helper *Helper) Load(path string) error {
	yamlInfo, readErr := ioutil.ReadFile(path)
	if readErr != nil {
		return readErr
	}
	err := yaml.Unmarshal(yamlInfo, &helper.Config)
	if err != nil {
		return errors.New("解析配置文件失败...")
	}
	helper.LastLoadTime = time.Now().Unix()
	log.Println("加载配置完成...")
	return nil
}
