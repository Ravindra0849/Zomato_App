# Zomato Clone: Secure Deployment with DevSecOps CI/CD

Hey there! Get ready for an exciting journey as we embark on deploying a React JS Zomato clone.

🚀 Explore the GitHub Repository https://github.com/Ravindra0849/Zomato_App.git for all the code and resources. Happy coding, friends!

Steps:-

Step 1 — Launch an Ubuntu(22.04) T2 Large Instance

Step 2 — Install Jenkins, Docker and Trivy. Create a SonarQube Container using Docker.

Step 3 — Install Plugins like JDK, SonarQube Scanner, Nodejs, and OWASP Dependency Check.

Step 4 — Create a Pipeline Project in Jenkins using a Declarative Pipeline

Step 5 — Docker Image Build and Push

Step 6 — Deploy the image using Docker

Step 7 — Terminate the AWS EC2 Instances.

Now, let’s get started and dig deeper into each of these steps:-

STEP1:Launch an Ubuntu(22.04) T2 Large Instance

Launch an AWS T2 Large Instance. Use the image as Ubuntu. You can create a new key pair or use an existing one. Enable HTTP and HTTPS settings in the Security Group and open all ports (not best case to open all ports but just for learning purposes it’s okay).

Step 2 — Install Jenkins, Docker and Trivy

    sudo apt update -y

    #sudo apt upgrade -y

    sudo apt-get install openjdk-11-jdk -y

    java --version

    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

    sudo apt-get update -y

    sudo apt-get install jenkins -y

    sudo systemctl enable jenkins

    sudo systemctl start jenkins

    sudo systemctl status jenkins

Once Jenkins is installed, you will need to go to your AWS EC2 Security Group and open Inbound Port 8080, since Jenkins works on Port 8080.

Now, grab your Public IP Address

    <EC2 Public IP Address:8080>

    sudo cat /var/lib/jenkins/secrets/initialAdminPassword

Create a user click on save and continue.

Jenkins Getting Started Screen.

# Install Docker

    sudo apt-get update
    sudo apt-get install docker.io -y
    sudo usermod -aG docker $USER   #my case is ubuntu
    newgrp docker
    sudo chmod 777 /var/run/docker.sock

After the docker installation, we create a sonarqube container (Remember to add 9000 ports in the security group).

    docker run --name sonar -d -p 9000:9000 sonarqube:lts-community

Now our sonarQube is up and running

    Username: admin
    password: admin

Update New password, This is Sonar Dashboard.

# Install Trivy

    sudo apt-get install wget apt-transport-https gnupg lsb-release -y
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
    sudo apt-get update
    sudo apt-get install trivy -y

# Install Plugins like JDK, Sonarqube Scanner, NodeJs, OWASP Dependency Check

Install Plugin

Go to Manage Jenkins →Plugins → Available Plugins →

Install below plugins

    1 → Eclipse Temurin Installer (Install without restart)

    2 → SonarQube Scanner (Install without restart)

    3 → Sonar Quality Gates Plugin (Install Without restart)

    4 → NodeJs Plugin (Install Without restart)

    5 → Docker Plugins (Install Without restart)

Configure Java and Nodejs in Global Tool Configuration

Create a Job

Configure Sonar Server in Manage Jenkins

Grab the Public IP Address of your EC2 Instance, Sonarqube works on Port 9000, so <Public IP>:9000. Goto your Sonarqube Server. Click on Administration → Security → Users → Click on Tokens and Update Token → Give it a name → and click on Generate Token

click on create Token

Create a token with a name and generate

copy Token

Goto Jenkins Dashboard → Manage Jenkins → Credentials → Add Secret Text. It should look like this

You will this page once you click on create

Now, go to Dashboard → Manage Jenkins → System and Add like the below image

Click on Apply and Save

The Configure System option is used in Jenkins to configure different server

Global Tool Configuration is used to configure different tools that we install using Plugins

We will install a sonar scanner in the tools.

In the Sonarqube Dashboard add a quality gate also

Administration → Configuration →Webhooks

Click on Create

Add details

<http://jenkins-public-ip:8080>/sonarqube-webhook/>

Create a pipeline

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
                    git branch: 'master', url: 'https://github.com/Ravindra0849/Zomato_App.git'
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
        }
    }

Go to SonarQube Dashboard, we can check the Bugs, Code Smells and Some other

Check the Npm Dependency

    stage('Npm Dependency') {
                steps {
                    sh "npm install"
                }
            }

To scan the all the files using Trivy and take the output logs into .txt file

    stage('Trivy Scan') {
            steps {
                sh "trivy fs . > trivyfs.txt "
            }
        }

Docker Image Build and Push

We need to install the Docker tool in our system, Goto Dashboard → Manage Plugins → Available plugins → Search for Docker and install these plugins

Docker

Docker Commons

Docker Pipeline

Docker API

docker-build-step

and click on install without restart

Now, go to Dashboard → Manage Jenkins → Tools →

Add Docker Hub Username and Password under Global Credentials

To build the docker image and tag the image with the build numbers

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

Scan the docker image using trivy and collect the output in the .txt file

    stage('Scan Docker Image') {
            steps {
                sh "trivy image ravisree900/zomato:'${env.BUILD_NUMBER}' > trivyimage.txt "
            }
        }

Push the docker image into Docker Registry

    stage('Push Docker Image into Docker Registry') {
            steps {
                script{
                    withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker'){   
                        sh " docker push ravisree900/zomato:'${env.BUILD_NUMBER}' "
                    }
                }
            }
        }

Create the docker container with the port number 3000

    stage('Deploy to Docker Container') {
            steps {
                sh " docker run --name zomato -d -p 3300:3000 ravisree900/zomato:'${env.BUILD_NUMBER}' "
            }
        }

Access it form the external browser with <public Ip:3300>

Terminate instances.

Efficiently manage resources by terminating the AWS EC2 Instances to ensure cost-effectiveness and environmental responsibility, completing the deployment lifecycle. Utilize AWS management tools or commands to gracefully shut down and terminate the Ubuntu(22.04) T2 Large Instance, concluding the deployment process while maintaining operational efficiency.

Thanks for Watching this content and Follow my page for more contents.