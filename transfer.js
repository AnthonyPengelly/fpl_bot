fetch("https://fantasy.premierleague.com/api/transfers/", {
  headers: {
    accept: "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrftoken":
      "RpTTUs41UVByGWjcn33P5kf8iEWfZGFayailMpnRtqQlSrMqTAOyBrVyoJ6s19mj",
    cookie:
      '_fbp=fb.1.1592409038469.1799744665; _ga=GA1.2.1816335084.1592409039; __gads=ID=7b774612a4db87c1:T=1592409057:S=ALNI_MaIlR1rxVFmnMpMQskIS3GZ-DNdvA; _gid=GA1.2.423422577.1592904423; pl_profile="eyJzIjogIld6SXNOVEF4TnpNNU56SmQ6MWpuaW1vOm5ZTVlUVnJYcWptRW0xNktFRFpQM3pGV2hmMCIsICJ1IjogeyJpZCI6IDUwMTczOTcyLCAiZm4iOiAiQW50aG9ueSIsICJsbiI6ICJQZW5nZWxseSIsICJmYyI6IG51bGx9fQ=="; csrftoken=RpTTUs41UVByGWjcn33P5kf8iEWfZGFayailMpnRtqQlSrMqTAOyBrVyoJ6s19mj; sessionid=.eJyrVopPLC3JiC8tTi2Kz0xRslIyNTA0N7Y0N1LSQZZKSkzOTs0DyRfkpBXk6IFk9AJ8QoFyxcHB_o5ALqqGjMTiDKBqA5PEtDSDZAtzC1NjQzMLczNLE7NEY_NUcwuTZEOzJOMUA5M040RjU6VaAHBNK7s:1jnimp:P44TXOGmbr-Cpl91H5VNSY6SnVw',
  },
  referrer: "https://fantasy.premierleague.com/transfers",
  referrerPolicy: "no-referrer-when-downgrade",
  body:
    '{"chip":null,"entry":7541880,"event":40,"transfers":[{"element_in":183,"element_out":401,"purchase_price":65,"selling_price":63},{"element_in":410,"element_out":233,"purchase_price":64,"selling_price":89}]}',
  method: "POST",
  mode: "cors",
});
