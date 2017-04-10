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


mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.createCollection('Users')";
mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.Users.createIndex({username:1},{unique:true})";
mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.createCollection('Tree')";

TOPICS=$(cat ../xample/data/topics.json | tr '"' "'");
TAGS=$(cat ../xample/data/tags.json | tr '"' "'");

mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.Tree.insert({_id:'topics',$TOPICS})";
mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.Tree.insert({_id:'tags',$TAGS})";
