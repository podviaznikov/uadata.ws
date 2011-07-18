var db=require('riak-js').getClient(),
    util=require('util');
//db.getAll('cities');
//db.save('cities', 'Kharkiv',{fleet: 111, country: 'NL'})
//db.remove('cities','Kyiv');
//db.save('cities', 'Дніпропетровськ',{})

//db.save('cities','Kyiv',{
//    ua:'Київ',
//    population:{
//        year:2001,
//        people:2611327
//    },
//    cityStatus:'S'
//},{
//    encodeURI:true
//});
db.get('cities','Kyiv',function(err,city){
    util.log(util.inspect(city));
});