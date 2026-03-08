pipeline {
    agent any

    tools {
        // Configure this tool in Jenkins Global Tool Configuration.
        nodejs 'Node20'
    }

    options {
        ansiColor('xterm')
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    parameters {
        booleanParam(name: 'DEPLOY_ENABLED', defaultValue: true, description: 'Deploy the built app after a successful build.')
        string(name: 'DEPLOY_BRANCH', defaultValue: 'main', description: 'Only deploy when this branch is built.')
        string(name: 'ORACLE_HOST', defaultValue: '', description: 'Oracle VM host or public IP address.')
        string(name: 'ORACLE_USER', defaultValue: 'ubuntu', description: 'SSH user for the Oracle VM.')
        string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'oracle-vm-ssh-key', description: 'Jenkins SSH credentials ID used for deployment.')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'paisa-buddy', description: 'Docker image repository/name to build.')
        string(name: 'DOCKER_CONTAINER_NAME', defaultValue: 'paisa-buddy', description: 'Container name to replace on the server.')
        string(name: 'DOCKER_RUN_ARGS', defaultValue: '--restart unless-stopped -p 80:80', description: 'Extra arguments passed to docker run on the server.')
    }

    environment {
        CI = 'true'
        NODE_ENV = 'production'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Info') {
            steps {
                sh '''
                    set -eu
                    node --version
                    npm --version
                    docker --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eu

                    if [ -f package-lock.json ]; then
                      echo "Using npm ci (package-lock.json detected)"
                      npm ci --no-audit --no-fund
                    else
                      echo "package-lock.json not found; falling back to npm install"
                      npm install --no-audit --no-fund
                    fi
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    set -eu
                    npm run lint
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def dockerBuildCommand = '''
                        set -eu
                        docker build \
                          --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
                          --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
                          --build-arg VITE_OPENROUTER_API_KEY="$VITE_OPENROUTER_API_KEY" \
                          --build-arg VITE_OPENROUTER_API_KEY_2="$VITE_OPENROUTER_API_KEY_2" \
                          --build-arg VITE_OPENROUTER_API_KEY_3="$VITE_OPENROUTER_API_KEY_3" \
                          -t "$DOCKER_IMAGE_NAME:$BUILD_NUMBER" \
                          -t "$DOCKER_IMAGE_NAME:latest" \
                          .
                        docker save "$DOCKER_IMAGE_NAME:$BUILD_NUMBER" | gzip > docker-image.tar.gz
                    '''

                    try {
                        withCredentials([
                            string(credentialsId: 'VITE_SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                            string(credentialsId: 'VITE_SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY', variable: 'VITE_OPENROUTER_API_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_2', variable: 'VITE_OPENROUTER_API_KEY_2'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_3', variable: 'VITE_OPENROUTER_API_KEY_3')
                        ]) {
                            sh dockerBuildCommand
                        }
                    } catch (Exception ignored) {
                        echo 'Some optional Vite credentials are not configured in Jenkins. Building Docker image without injected secret build args.'
                        sh '''
                            set -eu
                            docker build \
                              -t "$DOCKER_IMAGE_NAME:$BUILD_NUMBER" \
                              -t "$DOCKER_IMAGE_NAME:latest" \
                              .
                            docker save "$DOCKER_IMAGE_NAME:$BUILD_NUMBER" | gzip > docker-image.tar.gz
                        '''
                    }
                }
            }
        }

        stage('Archive Docker Image') {
            steps {
                archiveArtifacts artifacts: 'docker-image.tar.gz', fingerprint: true
            }
        }

        stage('Deploy Docker Container') {
            when {
                allOf {
                    expression { params.DEPLOY_ENABLED }
                    expression { params.ORACLE_HOST?.trim() }
                    expression {
                        def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
                        return branch == params.DEPLOY_BRANCH || branch.endsWith("/${params.DEPLOY_BRANCH}")
                    }
                }
            }
            steps {
                sshagent([params.SSH_CREDENTIALS_ID]) {
                    sh '''
                        set -eu

                        REMOTE_ARCHIVE="/tmp/${DOCKER_CONTAINER_NAME}-${BUILD_NUMBER}.tar.gz"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "docker --version"
                        scp -o StrictHostKeyChecking=no docker-image.tar.gz "${ORACLE_USER}@${ORACLE_HOST}:${REMOTE_ARCHIVE}"
                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; gzip -dc '${REMOTE_ARCHIVE}' | docker load; rm -f '${REMOTE_ARCHIVE}'; docker rm -f '${DOCKER_CONTAINER_NAME}' || true; docker run -d --name '${DOCKER_CONTAINER_NAME}' ${DOCKER_RUN_ARGS} '${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}'"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check the stage logs for details.'
        }
        always {
            deleteDir()
        }
    }
}