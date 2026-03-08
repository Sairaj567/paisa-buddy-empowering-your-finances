pipeline {
    agent any

    // Ensure you have configured a NodeJS installation in Jenkins Global Tool Configuration named 'Node20'
    tools {
        nodejs 'Node20'
    }

    environment {
        // Fetch secrets from Jenkins credentials
        VITE_SUPABASE_URL = credentials('VITE_SUPABASE_URL')
        VITE_SUPABASE_ANON_KEY = credentials('VITE_SUPABASE_ANON_KEY')
        VITE_OPENROUTER_API_KEY = credentials('VITE_OPENROUTER_API_KEY')
        
        // Oracle Server details
        ORACLE_USER = 'ubuntu' // Change this to your Oracle VM user (e.g., opc or ubuntu)
        ORACLE_IP = 'YOUR_ORACLE_IP_ADDRESS'
        DEPLOY_DIR = '/var/www/paisa-buddy'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint & Test') {
            steps {
                // Runs the linting script defined in your package.json
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                // Builds the Vite project using the environment variables
                sh 'npm run build'
            }
        }

        stage('Deploy to Oracle Cloud') {
            steps {
                sshagent(['oracle-vm-ssh-key']) {
                    // Remove old files and securely copy the new dist folder contents to the Nginx directory
                    sh """
                    ssh -o StrictHostKeyChecking=no ${ORACLE_USER}@${ORACLE_IP} 'rm -rf ${DEPLOY_DIR}/*'
                    scp -o StrictHostKeyChecking=no -r dist/* ${ORACLE_USER}@${ORACLE_IP}:${DEPLOY_DIR}/
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully! The app is deployed."
        }
        failure {
            echo "❌ Pipeline failed. Please check the logs."
        }
    }
}