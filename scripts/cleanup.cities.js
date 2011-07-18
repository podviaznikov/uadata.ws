var db=require('riak-js').getClient();

db.getAll('cities',function(err,cities){
    console.log(cities.length)
    cities.forEach(function(city){
       db.remove('cities',city.data.key);
    });
});