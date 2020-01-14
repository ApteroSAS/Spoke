FROM nginx:1.17.7-alpine

#install yarn
RUN apk add yarn
RUN yarn --version

#install git
RUN apk add git
RUN git --version

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
 