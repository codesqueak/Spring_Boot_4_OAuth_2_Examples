package com.codingrodent.pan.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.UUID;

import static com.codingrodent.pan.user.constants.ServiceConstants.*;

@EnableMongoRepositories(basePackages = {"com.codingrodent.pan.user"})
@SpringBootApplication(scanBasePackages = {"com.codingrodent.pan.user"})
public class Application {

    private final Logger logger = LoggerFactory.getLogger(Application.class);
    private final static int ONE_MB = 1024 * 1024;

    static void main(String[] args) {
        // Default system / subsystem names for logging - override with MDC.put();
        System.setProperty(COMPONENT_NAME, "Spring");
        System.setProperty(APP_NAME, "Sensor");
        MDC.put(CID, UUID.randomUUID().toString());
        SpringApplication.run(Application.class, args);
    }

    /**
     * This allows access to the application arguments.
     *
     * @param ctx Spring application context
     * @return Dummy command line runner for demo purposes
     */
    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        var p = System.getProperties();
        var l = new LinkedList<String>();
        p.keys().asIterator().forEachRemaining(k -> l.add(k.toString()));
        var sortedKeys = (l.toArray(new String[0]));
        Arrays.sort(sortedKeys, Comparator.comparing(String::toString));
        Arrays.stream(sortedKeys).forEach(k -> logger.info("{} : {}", k, p.get(k)));
        dumpMemoryStats();
        logger.info("Processors: {}", Runtime.getRuntime().availableProcessors());
        return args -> logger.info("Pan User Module Microservice :: The Machine Starts");
    }

    private void dumpMemoryStats() {
        Runtime rt = Runtime.getRuntime();

        long maxMemBytes = rt.maxMemory();
        long usedMemBytes = rt.totalMemory() - rt.freeMemory();
        long freeMemBytes = rt.maxMemory() - usedMemBytes;

        logger.info("Initial free memory: {}MB", freeMemBytes / ONE_MB);
        logger.info("Max memory: {}MB", maxMemBytes / ONE_MB);
    }

}
