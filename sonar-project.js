const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: 'http://3.111.23.2:9000/',
       options : {
	    'sonar.projectDescription': 'This is a Node JS application',
	    'sonar.projectName': 'Node JS Application - Sample',
	    'sonar.projectKey':'NodeJsMSS',
	    'sonar.login': 'squ_8b5bf1e9057b32ea49a542206eadec00089c43cf', // This is Sonar Token
            'sonar.projectVersion':'1.0',
	    'sonar.language':'js',
            'sonar.sourceEncoding':'UTF-8',
            'sonar.sources': '.',
	  //'sonar.tests': 'specs',
          //'sonar.inclusions' : 'src/**'
       },
}, () => {});


// npm install

//node app.js

//(OR)

//npm start

//To Execute the SonarQube Repor, execute the below command.

//npm run sonar

//(OR)

//node sonar-project.js
