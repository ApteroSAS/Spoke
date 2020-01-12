FROM nginx:1.17.7-alpine

#install node
#RUN apt-get update
#RUN apt-get install -y curl
#RUN apt remove cmdtest
#RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
#RUN apt-get install -y inotify-tools nodejs
#RUN node --version

#install yarn
RUN apk add yarn
#RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add
#RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
#RUN apt-get update
#RUN apt-get install -y apt-transport-https ca-certificates
#RUN apt-get -y install yarn
RUN yarn --version

#install git
#RUN apt-get install -y git
RUN apk add git
RUN git --version

#clean apt
#RUN apt-get clean

#install global yarn dependecies
RUN yarn global add cross-env

# copy and download install
WORKDIR /spoke/
COPY ./package.json /spoke/
COPY ./yarn.lock /spoke/
RUN yarn install

#copy ngingx config
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf

# copy and build spoke
COPY ./ /spoke/
RUN yarn build

#publish build file to http
RUN cp -r /spoke/dist/* /usr/share/nginx/html/
 