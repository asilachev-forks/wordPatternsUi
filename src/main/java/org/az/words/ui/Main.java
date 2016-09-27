package org.az.words.ui;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {

    private static final Log LOG = LogFactory.getLog(Main.class);

    public static void main(final String[] argss) {
        SpringApplication.run(Main.class, argss);
    }

}
