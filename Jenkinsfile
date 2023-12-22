pipeline {
    agent any
    
    tools {
        jdk "jdk17"
        nodejs "node16"
    }
    
    environment {
        SCANNER_HOME=tool 'sonar-scanner'
    }
    
    stages {
        stage ("Clean Workspace") {
            steps {
                cleanWs()
            }
        }
        
        stage ("Git Checkout Code") {
            steps {
                git branch: 'main', url: 'https://github.com/mudit097/Zomato-Clone.git'
            }
        }
        
        stage ("Sonar Scan") {
            steps {
                withSonarQubeEnv('sonar') {
                    sh " $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=zomato -Dsonar.projectKey=zomato "
                }
            }
        }
        
        stage('Quality Gates Checking') {
            steps {
                waitForQualityGate abortPipeline: false, credentialsId: 'sonar'
            }
        }
        
        stage('Npm Dependency') {
            steps {
                sh "npm install"
            }
        }
        
        stage('Trivy Scan') {
            steps {
                sh "trivy fs . > trivyfs.txt "
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script{
                    withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker'){   
                        sh "docker build -t zomato ."
                        sh "docker tag zomato ravisree900/zomato:'${env.BUILD_NUMBER}'"
                    }
                }
            }
        }
        
        stage('Scan Docker Image') {
            steps {
                sh "trivy image ravisree900/zomato:'${env.BUILD_NUMBER}' > trivyimage.txt "
            }
        }
        
        stage('Push Docker Image into Docker Registry') {
            steps {
                script{
                    withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker'){   
                        sh " docker push ravisree900/zomato:'${env.BUILD_NUMBER}' "
                    }
                }
            }
        }
        
        stage('Deploy to Docker Container') {
            steps {
                sh " docker run --name zomato -d -p 3300:3000 ravisree900/zomato:'${env.BUILD_NUMBER}' "
            }
        }
        
    }
}