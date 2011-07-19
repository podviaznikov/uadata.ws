var util=require('util'),
    querystring=require('querystring'),
    rest=require('restler'),
    cloudmade=exports;

cloudmade.findUaCityData=function(cityName,callback)
{
    var params={
        query:"city:"+cityName+";country:Ukraine"
    },
    empty={
        localisation:{},
        geo:{}
    };

    jsonRequest(params,function(data){
        var feature=data.features[0],
            properties=feature.properties,
            coordinates=feature.centroid.coordinates,
            result={
                localisation:{
                    de:properties['name:de'],
                    ru:properties['name:ru'],
                    pl:properties['name:pl']
                },
                geo:{
                    latitude:coordinates[0],
                    longitude:coordinates[1]
                }
            };
        if(result.localisation.de==='Ukraine'){
            callback(empty);
        }
        else{
            callback(result);
        }
    },function(er){
        callback(empty);
    });
};

var jsonRequest=function(params,successCallback,errorCallback){
    rest.get('http://geocoding.cloudmade.com/2b88d1a4bdf64a79b755bd56492b3302/geocoding/v2/find.js?'+querystring.stringify(params))
        .on('complete',successCallback)
        .on('error',errorCallback);
};
