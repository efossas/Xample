
unamestr=`uname`;

if [[ "$unamestr" == 'Darwin' ]]; then
    mysql=/usr/local/mysql/bin/mysql
else
   mysql=mysql
fi

$mysql -uroot < destroy.sql;

mongo xuser --eval "db.dropDatabase()";

redis-cli -a a1bc60f3ee230db84e6e584700ac277f0aab5f6b3f4c7dec2173371c32ef00d4 flushall;
