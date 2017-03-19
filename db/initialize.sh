node sqlGenerator.js;

unamestr=`uname`;

if [[ "$unamestr" == 'Darwin' ]]; then
    mysql=/usr/local/mysql/bin/mysql
else
    mysql=mysql
fi

$mysql -uroot < initialize.sql;

mongo xuser --eval "db.createCollection('Users')";
mongo xuser --eval "db.createCollection('Tree')";

TOPICS=$(cat ../xample/data/topics.json);
TAGS=$(cat ../xample/data/tags.json);

mongo xuser --eval "db.Tree.insert({_id:'topics',$TOPICS})";
mongo xuser --eval "db.Tree.insert({_id:'tags',$TAGS})";
