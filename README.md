# datahub-middleware
proxy-datahub-middleware



- 配置
> 配置项可以是：对象，hub名字的数组，或者单个hub名字

- 完整的配置项  

```js
{
  datahub: {
    proxy: '', // 对象，数组，或者字符串
    store: 'path/to/data', // 数据存储位置，默认为当前项目根目录的data目录下
    hostname: 'localhost', // 代理目标地址的host，默认是localhost
    protocol: 'http', // 代理目标地址的协议，默认是http
    prefix: '', // 代理前缀，访问path的前缀，默认为空字符串
    port: 7981, // daathub-server的启动端口，如果被占用会重新分配
    view: {
      assetsUrl: 'https://unpkg.alipay.com/datahub-view@2', // datahub的view配置
    }
  }
}
```

- 配置单个hub

```js  
// hub名字的数组, 单个hub名字
{
  datahub: 'hubname'
}
// 等价于
{
  datahub: {
    proxy: 'hubname'
  }
}
// 等价于
{
  datahub: {
    proxy: {
      '^/hubname': {
        hub: hubname
      }
    }
  }
}
```

- 配置多个hub

```js
{
  datahub: [hubname1, hubname2, hubname3],
},
// 等价于
{
  datahub: {
    proxy: [hubname1, hubname2, hubname3]
  }
}
// 等价于
{
  datahub: {
    proxy: {
      '^/hubname1': {
        hub: hubname1
      },
      '^/hubname2': {
        hub: hubname2
      },
      '^/hubname2': {
        hub: hubname3
      }
    }
  }
}
```
- 带其他配置

```js
{
  plugins: [
    '@alipay/umi-plugins',
    {
      datahub: {
        port: 8888,
        proxy: proxyOptions,
      },
    },
  ],
}
```

- proxy的其他配置

```js
{
  plugins: [
    '@alipay/umi-plugins',
    {
      datahub: {
        port: 8888,
        proxy: {
          '^/api/xxx': {
            hub: 'hubname'
            changeOrigin: false,
            //... 更多配置可以参考 https://github.com/chimurai/http-proxy-middleware
          }
        },
      },
    },
  ],
}
```

- 更多配置请参考`macaca-datahub`
