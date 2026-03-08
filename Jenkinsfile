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
        string(name: 'APP_NAME', defaultValue: 'paisa-buddy', description: 'App name used for temporary remote build paths.')
        string(name: 'STATIC_DEPLOY_DIR', defaultValue: '/var/www/paisa-buddy', description: 'Directory from which Nginx serves the built static files.')
        string(name: 'RELOAD_COMMAND', defaultValue: 'sudo systemctl reload nginx', description: 'Command run after deployment to reload the web server. Leave empty to skip.')
    }

    environment {
        CI = 'true'
        NODE_ENV = 'production'
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

                        REMOTE_DIR="/tmp/${APP_NAME}-${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; rm -rf '${REMOTE_DIR}'; mkdir -p '${REMOTE_DIR}'"
                        scp -o StrictHostKeyChecking=no source.tar.gz "${ORACLE_USER}@${ORACLE_HOST}:${REMOTE_DIR}/source.tar.gz"
                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; tar -xzf source.tar.gz; docker run --rm -v '${REMOTE_DIR}:/workspace' -w /workspace node:20-alpine sh -lc 'set -eu; if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi; npm run lint'"
                    '''
                }
            }
        }

        stage('Build Static Files on Remote Host') {
            steps {
                script {
                    def remoteBuildCommand = '''
                        set -eu

                        if [ -z "${ORACLE_HOST}" ]; then
                          echo "ORACLE_HOST is required for remote lint/build/deploy."
                          exit 1
                        fi

                        REMOTE_DIR="/tmp/${APP_NAME}-${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; docker run --rm -e VITE_SUPABASE_URL='$VITE_SUPABASE_URL' -e VITE_SUPABASE_ANON_KEY='$VITE_SUPABASE_ANON_KEY' -e VITE_OPENROUTER_API_KEY='$VITE_OPENROUTER_API_KEY' -e VITE_OPENROUTER_API_KEY_2='$VITE_OPENROUTER_API_KEY_2' -e VITE_OPENROUTER_API_KEY_3='$VITE_OPENROUTER_API_KEY_3' -v '${REMOTE_DIR}:/workspace' -w /workspace node:20-alpine sh -lc 'set -eu; if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi; npm run build'; test -d dist"
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
                        echo 'Some optional Vite credentials are not configured in Jenkins. Building static files without injected secret build args.'
                        sshagent([params.SSH_CREDENTIALS_ID]) {
                            sh '''
                                set -eu

                                if [ -z "${ORACLE_HOST}" ]; then
                                  echo "ORACLE_HOST is required for remote lint/build/deploy."
                                  exit 1
                                fi

                                REMOTE_DIR="/tmp/${APP_NAME}-${BUILD_NUMBER}"

                                ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "set -eu; cd '${REMOTE_DIR}'; docker run --rm -v '${REMOTE_DIR}:/workspace' -w /workspace node:20-alpine sh -lc 'set -eu; if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi; npm run build'; test -d dist"
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy Static Files') {
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

                        REMOTE_DIR="/tmp/${APP_NAME}-${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no "${ORACLE_USER}@${ORACLE_HOST}" "STATIC_DEPLOY_DIR='${STATIC_DEPLOY_DIR}' REMOTE_DIR='${REMOTE_DIR}' RELOAD_COMMAND='${RELOAD_COMMAND}' /bin/sh -s" <<'EOF'
set -eu

mkdir -p "$STATIC_DEPLOY_DIR"
find "$STATIC_DEPLOY_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a "$REMOTE_DIR/dist/." "$STATIC_DEPLOY_DIR/"

if [ -n "$RELOAD_COMMAND" ]; then
    sh -lc "$RELOAD_COMMAND"
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