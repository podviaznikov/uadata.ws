var csv= require('csv'),
    csvWriter=csv()
		.toPath('../data/zip/transformed.cities.zipcodes.csv')
		.on('end',function(){
			console.log('Writing finished')
		}),
    cities={};

csv().fromPath('../data/zip/initial.cities.zipcodes.csv',{trim:true})
    .on('data',function(data,index){
        var cityName=data[2],
            zipCode=data[0],
            city=cities[cityName];
        if(city){
            city.zipCodes.push(zipCode);
        }
        else{
            city={
                name:cityName,
                zipCodes:[zipCode]
            }
        }
        cities[cityName]=city
    })
    .on('end',function(count){
        for(var i in cities){
            var city=cities[i];
            console.log(city)
            csvWriter.write(city.name+','+city.zipCodes+'\r\n');
        }
        csvWriter.end()
    })
