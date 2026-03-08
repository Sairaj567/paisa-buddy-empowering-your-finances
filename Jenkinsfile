pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
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
        string(name: 'DOCKER_RUN_ARGS', defaultValue: '--restart unless-stopped', description: 'Extra arguments passed to docker run on the server.')
        string(name: 'TRAEFIK_NETWORK', defaultValue: 'n8n-compose_default', description: 'Docker network used by Traefik on the server.')
        string(name: 'TRAEFIK_ROUTER_NAME', defaultValue: 'paisa', description: 'Traefik router/service name prefix.')
        string(name: 'TRAEFIK_HOST', defaultValue: 'paisa.021413.xyz', description: 'Public hostname served by Traefik. Leave empty to disable Traefik labels.')
        string(name: 'TRAEFIK_ENTRYPOINTS', defaultValue: 'web,websecure', description: 'Traefik entrypoints for the router.')
        string(name: 'TRAEFIK_CERTRESOLVER', defaultValue: 'mytlschallenge', description: 'Traefik TLS cert resolver name.')
        string(name: 'TRAEFIK_SERVICE_PORT', defaultValue: '80', description: 'Port exposed by the container to Traefik.')
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

        stage('Package Source') {
            steps {
                sh '''
                    set -eu
                    rm -f source.tar.gz
                    tar \
                      --exclude=.git \
                      --exclude=node_modules \
                      --exclude=dist \
                      --exclude=docker-image.tar.gz \
                      --exclude=source.tar.gz \
                      -czf source.tar.gz .
                '''
            }
        }

        stage('Lint on Remote Host') {
            steps {
                sshagent([params.SSH_CREDENTIALS_ID]) {
                    sh '''
                        set -eu

                        if [ -z "${ORACLE_HOST}" ]; then
                          echo "ORACLE_HOST is required for remote lint/build/deploy."
                          exit 1
                        fi

                        REMOTE_DIR="/tmp/${DOCKER_CONTAINER_NAME}-${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; rm -rf '${REMOTE_DIR}'; mkdir -p '${REMOTE_DIR}'"
                        scp -o StrictHostKeyChecking=no source.tar.gz "${ORACLE_USER}@${ORACLE_HOST}:${REMOTE_DIR}/source.tar.gz"
                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; tar -xzf source.tar.gz; docker run --rm -v '${REMOTE_DIR}:/workspace' -w /workspace node:20-alpine sh -lc 'set -eu; if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi; npm run lint'"
                    '''
                }
            }
        }

        stage('Build Docker Image on Remote Host') {
            steps {
                script {
                    def remoteBuildCommand = '''
                        set -eu

                        if [ -z "${ORACLE_HOST}" ]; then
                          echo "ORACLE_HOST is required for remote lint/build/deploy."
                          exit 1
                        fi

                        REMOTE_DIR="/tmp/${DOCKER_CONTAINER_NAME}-${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; docker build --build-arg VITE_SUPABASE_URL='$VITE_SUPABASE_URL' --build-arg VITE_SUPABASE_ANON_KEY='$VITE_SUPABASE_ANON_KEY' --build-arg VITE_OPENROUTER_API_KEY='$VITE_OPENROUTER_API_KEY' --build-arg VITE_OPENROUTER_API_KEY_2='$VITE_OPENROUTER_API_KEY_2' --build-arg VITE_OPENROUTER_API_KEY_3='$VITE_OPENROUTER_API_KEY_3' -t '${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}' -t '${DOCKER_IMAGE_NAME}:latest' ."
                    '''

                    try {
                        withCredentials([
                            string(credentialsId: 'VITE_SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                            string(credentialsId: 'VITE_SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY', variable: 'VITE_OPENROUTER_API_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_2', variable: 'VITE_OPENROUTER_API_KEY_2'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_3', variable: 'VITE_OPENROUTER_API_KEY_3')
                        ]) {
                            sshagent([params.SSH_CREDENTIALS_ID]) {
                                sh remoteBuildCommand
                            }
                        }
                    } catch (Exception ignored) {
                        echo 'Some optional Vite credentials are not configured in Jenkins. Building remote Docker image without injected secret build args.'
                        sshagent([params.SSH_CREDENTIALS_ID]) {
                            sh '''
                                set -eu

                                if [ -z "${ORACLE_HOST}" ]; then
                                  echo "ORACLE_HOST is required for remote lint/build/deploy."
                                  exit 1
                                fi

                                REMOTE_DIR="/tmp/${DOCKER_CONTAINER_NAME}-${BUILD_NUMBER}"

                                ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; docker build -t '${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}' -t '${DOCKER_IMAGE_NAME}:latest' ."
                            '''
                        }
                    }
                }
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

                        if [ -z "${ORACLE_HOST}" ]; then
                          echo "ORACLE_HOST is required for remote lint/build/deploy."
                          exit 1
                        fi

                        REMOTE_DIR="/tmp/${DOCKER_CONTAINER_NAME}-${BUILD_NUMBER}"

                                                ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "DOCKER_CONTAINER_NAME='${DOCKER_CONTAINER_NAME}' DOCKER_IMAGE_NAME='${DOCKER_IMAGE_NAME}' BUILD_NUMBER='${BUILD_NUMBER}' DOCKER_RUN_ARGS='${DOCKER_RUN_ARGS}' REMOTE_DIR='${REMOTE_DIR}' TRAEFIK_NETWORK='${TRAEFIK_NETWORK}' TRAEFIK_ROUTER_NAME='${TRAEFIK_ROUTER_NAME}' TRAEFIK_HOST='${TRAEFIK_HOST}' TRAEFIK_ENTRYPOINTS='${TRAEFIK_ENTRYPOINTS}' TRAEFIK_CERTRESOLVER='${TRAEFIK_CERTRESOLVER}' TRAEFIK_SERVICE_PORT='${TRAEFIK_SERVICE_PORT}' /bin/sh -s" <<'EOF'
set -eu

docker --version
docker rm -f "$DOCKER_CONTAINER_NAME" || true

if [ -n "$TRAEFIK_HOST" ]; then
    docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1
    docker run -d --name "$DOCKER_CONTAINER_NAME" \
        $DOCKER_RUN_ARGS \
        --network "$TRAEFIK_NETWORK" \
        --label "traefik.enable=true" \
        --label "traefik.docker.network=$TRAEFIK_NETWORK" \
        --label "traefik.http.routers.$TRAEFIK_ROUTER_NAME.rule=Host(\\\"$TRAEFIK_HOST\\\")" \
        --label "traefik.http.routers.$TRAEFIK_ROUTER_NAME.entrypoints=$TRAEFIK_ENTRYPOINTS" \
        --label "traefik.http.routers.$TRAEFIK_ROUTER_NAME.tls=true" \
        --label "traefik.http.routers.$TRAEFIK_ROUTER_NAME.tls.certresolver=$TRAEFIK_CERTRESOLVER" \
        --label "traefik.http.services.$TRAEFIK_ROUTER_NAME.loadbalancer.server.port=$TRAEFIK_SERVICE_PORT" \
        "$DOCKER_IMAGE_NAME:$BUILD_NUMBER"
else
    docker run -d --name "$DOCKER_CONTAINER_NAME" \
        $DOCKER_RUN_ARGS \
        "$DOCKER_IMAGE_NAME:$BUILD_NUMBER"
fi

rm -rf "$REMOTE_DIR"
EOF
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