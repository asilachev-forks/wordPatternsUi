
sass --watch src/main/sass/az.scss:src/main/resources/public/assets/css/az.css  


#mvn clean sass:update-stylesheets
#mvn org.jacoco:jacoco-maven-plugin:prepare-agent package sonar:sonar -X 