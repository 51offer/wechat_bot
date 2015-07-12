var router = require('express').Router();
var AV = require('leanengine');
var xml2js = require('xml2js');
var xml = require('xml');


// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
var Contents = AV.Object.extend('Contents');

router.get('/', function(req, res, next) {
  res.send(req.query.echostr);
});

router.post('/', function(req, res, next) {

  var nameText = req.body.xml.Content[0];
  var toUserName = req.body.xml.FromUserName[0];

  var query = new AV.Query(Contents);
  query.equalTo("cnname", nameText);
  query.first({
    success: function(obj) {

      var msgText = "找不到你呀，输错了吧~";
      if (obj) {
        msgText = "我抓住你了：" + obj.get("enname") +
        "\n部门:" + obj.get("sector") +
        // "\n邮箱:" + obj.get("mail") +
        // "\n手机号:" + obj.get("mobile") +
        "\nQQ:" + obj.get("qq") + "\n安全考虑，暂时只显示 QQ 哦";
      }


      var xmlStr = xml( [{
        "xml" : [
          { "ToUserName" : { _cdata: toUserName } },
          { "FromUserName" : { _cdata: "gh_d832680c1932" } },
          { CreateTime : 12312341 },
          { MsgType : { _cdata: "text" } },
          { "Content" : { _cdata: msgText } }
        ]
      }]);

      res.send(xmlStr);
    },
    error: function(err) {
      res.send("err" + err);
    }
  });

})

module.exports = router;
