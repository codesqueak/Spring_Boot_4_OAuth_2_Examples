FROM eclipse-temurin:25-jre AS runtime

ARG JAR_FILE=app.jar

WORKDIR /app

COPY ${JAR_FILE} app.jar

RUN addgroup --system panuser && adduser --system --ingroup panuser panuser
USER panuser

EXPOSE 9095

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
