var csv= require('csv'),
    transliteration=require('transliteration.ua'),
    cities={},
    db=require('riak-js').getClient();


csv().fromPath('../data/zip/transformed.cities.zipcodes.csv')
    .on('data',function(data,index){
        var cityUaName=data[0],
            cityEnName=transliteration.ua.transliterate(cityUaName),
            zipCodes=data.slice(2).map(function(zipCode){return parseInt(zipCode,10);}),
            city={
                key:cityEnName,
                localisation:{
                    en:cityEnName,
                    ua:cityUaName
                },
                zipCodes:zipCodes,
            };
        cities[cityEnName]=city;
    })
    .on('end',function(){
        csv().fromPath('../data/general/cities.csv')
            .on('data',function(data,index){
                var cityUaName=data[0],
                    cityEnName=transliteration.ua.transliterate(cityUaName),
                    regionUaName=data[1],
                    regionEnName=transliteration.ua.transliterate(regionUaName),
                    region={
                        key:regionEnName,
                        localisation:{
                            ua:regionUaName,
                            en:regionEnName
                        },
                        link:'http://uadata.ws/regions/'+regionEnName
                    },
                    peoplePopulation=data[2].replace(/ /g,'');
                    population={year:2001,people:parseInt(peoplePopulation,10)},
                    city=cities[cityEnName];
                if(city){
                    city.population=population;
                    city.region=region;
                }
                else{
                    city={
                        key:cityEnName,
                        localisation:{
                            en:cityEnName,
                            ua:cityUaName
                        },
                        population:population,
                        region:region
                    };
                }
                cities[cityEnName]=city;
                (function(city){
                    var meta={
                        encodeUri:true,
                        links:[{bucket:'regions',key:region.key,tag:'city' }]
                    };

                    db.save('cities',cityEnName,city,meta
                    ,function(er,data){
                        if(er){
                            console.log("Error for city",city);
                        }
                    });
                })(city);

            })
            .on('end',function(count){
                console.log(count);
            })
    });
