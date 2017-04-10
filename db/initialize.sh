while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -m|--mongo)
    MONGOPASS="$2"
    shift
    ;;
    -s|--sql)
    MYSQLPASS="$2"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift
done

node sqlGenerator.js;

unamestr=`uname`;

if [[ "$unamestr" == 'Darwin' ]]; then
    mysql=/usr/local/mysql/bin/mysql
else
    mysql=mysql
fi

if [[ -z "$MYSQLPASS" ]]; then
    $mysql -uroot < initialize.sql;
else
    $mysql -uroot -p"$MYSQLPASS" < initialize.sql;
fi

TOPICS=$(cat ../xample/data/topics.json | tr '"' "'");
TAGS=$(cat ../xample/data/tags.json | tr '"' "'");

if [[ -z "$MONGOPASS" ]]; then
    mongo xuser --eval "db.createCollection('Users')";
    mongo xuser --eval "db.Users.createIndex({username:1},{unique:true})";
    mongo xuser --eval "db.createCollection('Tree')";

    mongo xuser --eval "db.Tree.insert({_id:'topics',$TOPICS})";
    mongo xuser --eval "db.Tree.insert({_id:'tags',$TAGS})";

    mongo xuser --eval "db.createUser({user:'nodemongo',pwd:'9k}7{iUYJB',roles:[{role:'dbOwner',db:'xuser'}]})";
else
    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.createCollection('Users')";
    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.Users.createIndex({username:1},{unique:true})";
    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.createCollection('Tree')";

    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.Tree.insert({_id:'topics',$TOPICS})";
    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.Tree.insert({_id:'tags',$TAGS})";

    mongo xuser -u "root" -p "$MONGOPASS" --authenticationDatabase "admin" --eval "db.createUser({user:'nodemongo',pwd:'9k}7{iUYJB',roles:[{role:'dbOwner',db:'xuser'}]})";
fi
