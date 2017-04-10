
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

unamestr=`uname`;

if [[ "$unamestr" == 'Darwin' ]]; then
    mysql=/usr/local/mysql/bin/mysql
else
   mysql=mysql
fi

if [[ -z "$MYSQLPASS" ]]; then
    $mysql -uroot < initialize.sql;
else
    $mysql -uroot -p"$MYSQLPASS" < destroy.sql;
fi

mongo xuser -u "root" -p $MONGOPASS --authenticationDatabase "admin" --eval "db.dropDatabase()";

redis-cli -a a1bc60f3ee230db84e6e584700ac277f0aab5f6b3f4c7dec2173371c32ef00d4 flushall;
