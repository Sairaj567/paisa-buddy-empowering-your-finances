pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                sh '''
                    set -eu
                    if command -v node >/dev/null 2>&1; then
                        echo "Node.js found: $(node --version)"
                    else
                        echo "ERROR: Node.js is not installed on this agent."
                        echo "Install the NodeJS plugin in Jenkins and configure Node 20,"
                        echo "or install Node.js directly on the agent."
                        exit 1
                    fi
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eu
                    if [ -f package-lock.json ]; then
                        npm ci --no-audit --no-fund
                    else
                        npm install --no-audit --no-fund
                    fi
                '''
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                script {
                    def credentialBindings = []
                    def credentialIds = [
                        'VITE_SUPABASE_URL',
                        'VITE_SUPABASE_ANON_KEY',
                        'VITE_OPENROUTER_API_KEY',
                        'VITE_OPENROUTER_API_KEY_2',
                        'VITE_OPENROUTER_API_KEY_3'
                    ]

                    credentialIds.each { id ->
                        try {
                            credentialBindings.add(string(credentialsId: id, variable: id))
                        } catch (Exception ignored) {
                            echo "Credential '${id}' not found — skipping."
                        }
                    }

                    if (credentialBindings.size() > 0) {
                        withCredentials(credentialBindings) {
                            sh '''
                                set -eu
                                npm run build
                                test -d dist
                            '''
                        }
                    } else {
                        echo 'No optional credentials configured. Building without injected secrets.'
                        sh '''
                            set -eu
                            npm run build
                            test -d dist
                        '''
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs for details.'
        }
        always {
            cleanWs()
        }
    }
}
