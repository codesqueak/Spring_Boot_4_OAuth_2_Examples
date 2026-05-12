
[![License: MIT](https://img.shields.io/badge/license-Apache_2.0-brightgreen.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# OAuth 2 Example with Spring Boot and React

This project was put together to demonstrate how to use OAuth 2 with Spring Boot 4 following a frustrating time trying to get
this to work after rummaging the, at times,  non too clear documentation and examples


This demonstration features:

1. An OAuth 2 server built using the Spring Boot starter library oauth2-authorization-server
2. An alternative Bearer Token generator using username / password
3. A simple React project showing both username/password and SSO logins

The two projects are in the subdirectories ```UserService``` and ```ui```

What you need:

[Java 25 ](https://adoptium.net/en-GB/temurin/releases?version=25&os=any&arch=any)

[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)


## To Build The Java Project

```
./gradle clean build test
java -jar build/libs/UserService-1.0.<version goes here>-SNAPSHOT.jar

```

## To Run The UI Project

```
npm install
npm run dev
```

The passwords for ```alice``` & ```bob``` are ```password1```

# What You Get - Username/Password

![alt text](login.png "Enter Username & Password")

![alt text](welcome.png "Login Result")


# What You Get - SSO

![alt text](ssologin.png "Enter Credential")

![alt text](welcomesso.png "Login Result via OAuth2")



