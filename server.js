var express=require('express'),
    querystring=require('querystring'),
    app=express.createServer(),
    httpProxy=require('http-proxy'),
    db=require('riak-js').getClient();

app.get('/cities',function(req,res){
    var proxy=new httpProxy.HttpProxy(req,res),
        params={
            keys:true,
            props:false
        };
    req.url='/riak/cities?'+querystring.stringify(params);
    console.log(req.url);
    proxy.proxyRequest(req, res,{port:8098,host:'127.0.0.1'});
});
app.get('/cities/:city',function(req,res){
    var proxy=new httpProxy.HttpProxy(req,res);
    req.url='/riak/cities/'+req.params.city;
    console.log(req.url);
    proxy.proxyRequest(req,res,{port:8098,host:'127.0.0.1'});
});
app.get('/ua/cities',function(req,res){
    console.log("ua cities")
    db.add('cities').map(function(v){
        var city=Riak.mapValuesJson(v)[0],
            record={};
        record[city.key]=city.localisation.ua;
        return [record];
    }).run(function(err,cities){
        if(err){
            res.end();
        }
        else{
            //console.log(cities)
            res.contentType('application/json');
            res.write(JSON.stringify(cities));
            res.end();
        }
    });
});
app.get('/ua/regions/cities',function(req,res){
    console.log("ua regional capitals")
    db.add('cities').map(function(v){
        var city=Riak.mapValuesJson(v)[0],
            record={};
        if(city.regionCapital===true){
            record[city.key]=city.localisation.ua;
            return [record];
        }
        else{
            return [];
        }
    })
    .reduce(function(values){
        values.sort(function(a,b));
        return values;
    })
    .run(function(err,cities){
        if(err){
            res.end();
        }
        else{
            //console.log(cities)
            res.contentType('application/json');
            res.write(JSON.stringify(cities));
            res.end();
        }
    });
});
app.listen(80);
//http://drewwells.net/blog/188-nodejs-proxy-to-simplify-iws-api/