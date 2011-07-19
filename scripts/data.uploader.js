var csv= require('csv'),
    transliteration=require('transliteration.ua'),
    db=require('riak-js').getClient(),
    cloudmade=require('./geocoder.cloudmade'),
    cities={};



csv().fromPath('../data/zip/transformed.cities.zipcodes.csv')
    .on('data',function(data,index){
        var cityUaName=data[0],
            cityEnName=transliteration.ua.transliterate(cityUaName),
            postcodes=data.slice(2).map(function(postcode){return parseInt(postcode,10);}),
            city={
                key:cityEnName,
                localisation:{
                    en:cityEnName,
                    ua:cityUaName
                },
                postcodes:postcodes,
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

                (function(city){
                    cloudmade.findUaCityData(city.key,function(data){
                        console.log("Geocoded "+city.key,data);

                        city.localisation.de=data.localisation.de;
                        city.localisation.ru=data.localisation.ru;
                        city.localisation.pl=data.localisation.pl;
                        city.geo=data.geo;
                        cities[cityEnName]=city;
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

                    });
                })(city);


            })
            .on('end',function(count){
                console.log(count);
            })
    });