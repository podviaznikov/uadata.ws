var db=require('riak-js').getClient();
db.add('cities').map(function(v){
    return [Riak.mapValuesJson(v)[0].localisation.ua];
}).run();