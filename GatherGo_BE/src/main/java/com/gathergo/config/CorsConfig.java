package com.gathergo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//Configuration tells Spring Boot that we have special settings that we will describe in this file which needs to be applied ech time when the app starts
@Configuration
public class CorsConfig {

    //controls who can acces your backend from the browser
    //Bean is a way of telling the app to create this thing(a new rule in our case) and use it in the app
    @Bean
    //WebMvcConfigurer is a special object which will let me customize how the backend handles requests
    //inside this object we will define CORS rules for your project
    public WebMvcConfigurer corsConfigurer() {
        //this is the function through which we actually set the rules
        //registry means a set of rules
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                //allow Angular frontend to access the backend
                registry.addMapping("/**") //these rules apply to every API in my project
                        .allowedOrigins("*") // Angular dev server
                        .allowedOriginPatterns("*")
                        //only allow your frontend Angular running on port 4200 to acces the backend from the browser
                        .allowedOrigins("http://localhost:4200")
                        //these are te types of requests that your frontend can send
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        //frontend can send any headers it wants
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
