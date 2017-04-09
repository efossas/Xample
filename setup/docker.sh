### install docker on ubuntu

apt-get -y install apt-transport-https ca-certificates curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get -y install docker-ce

### creating a docker image

# docker pull ubuntu
# docker images
# docker tag IMAGE_ID ericfossas/wisepool

### remove original ubuntu image

# docker rmi -f (<IMAGE ID>)

### run image (becomes container). install everything on container & exit

# docker run -i -t -d -p 2080:80 -p 2443:443 -p 2306:3306 -p 2379:6379 -p 2017:27017 ericfossas/wisepool
# docker ps -a
# docker exec -i -t CONTAINER_ID /bin/bash
# exit

### save the container as an image

# docker commit -m "message" CONTAINER_ID ericfossas/wisepool:latest

### push to dockerhub

# docker login
# docker push ericfossas/wisepool

### stop & remove a docker container with

# docker stop CONTAINER_ID
# docker rm CONTAINER_ID
