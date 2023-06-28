FROM node:18

#install global yarn dependecies
RUN yarn global add cross-env

# copy and download install
WORKDIR /spoke/
COPY ./package.json /spoke/
COPY ./yarn.lock /spoke/
RUN yarn --install-from-yarn-lock

# copy and build spoke
#COPY ./ /spoke/
COPY ./src/ /spoke/src/
COPY ./test/ /spoke/test/
COPY ./.babelrc /spoke/
COPY ./.env.defaults /spoke/
COPY ./.env.prod /spoke/
COPY ./.env.test /spoke/
COPY ./.eslintignore /spoke/
COPY ./.eslintrc.js /spoke/
COPY ./.prettierignore /spoke/
COPY ./.prettierrc.json /spoke/
COPY ./.stylelintrc /spoke/
#COPY ./package.json /spoke/
COPY ./webpack.config.js /spoke/
#COPY ./yarn.lock /spoke/
RUN yarn build


FROM nginx:1.21.3-alpine
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /spoke/dist/ /usr/share/nginx/html/
