IF [%1] == [] GOTO error

docker login
call build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-spoke:latest registry.aptero.co/aptero-spoke:latest
docker push registry.aptero.co/aptero-spoke:latest

docker tag aptero-spoke:latest registry.aptero.co/aptero-spoke:%1
docker push registry.aptero.co/aptero-spoke:%1

GOTO :EOF
:error
ECHO incorrect_parameters