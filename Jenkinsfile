pipeline {
    agent {
        node {
            label ''
            customWorkspace "${JENKINS_HOME}/workspace/paisa-buddy"
        }
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    environment {
        CI = 'true'
        DEPLOY_BRANCH = 'main'
        APP_NAME = 'paisa-buddy'
        STATIC_DEPLOY_DIR = '/var/www/paisa-buddy'
        RELOAD_COMMAND = 'sudo systemctl reload nginx'
        NODE_HOME = "${JENKINS_HOME}/tools/node"
        PATH = "${NODE_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Setup Node.js') {
            steps {
                sh '''
                    set -eu
                    if command -v node >/dev/null 2>&1 && node --version >/dev/null 2>&1; then
                        echo "Node.js already installed: $(node --version)"
                    else
                        echo "Installing Node.js 20..."
                        rm -rf "$NODE_HOME"
                        ARCH=$(uname -m)
                        case "$ARCH" in
                            aarch64) NODE_ARCH="arm64" ;;
                            x86_64)  NODE_ARCH="x64" ;;
                            *)       echo "Unsupported architecture: $ARCH"; exit 1 ;;
                        esac
                        NODE_URL="https://nodejs.org/dist/v20.18.3/node-v20.18.3-linux-${NODE_ARCH}.tar.gz"
                        echo "Downloading $NODE_URL"
                        curl -fsSL "$NODE_URL" -o /tmp/node.tar.gz
                        mkdir -p "$NODE_HOME"
                        tar -xzf /tmp/node.tar.gz -C "$NODE_HOME" --strip-components=1
                        rm -f /tmp/node.tar.gz
                        echo "Installed: $(node --version)"
                    fi
                '''
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
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
                sh '''
                    set -eu
                    npm run lint
                '''
            }
        }

        stage('Build') {
            environment {
                NODE_ENV = 'production'
            }
            steps {
                script {
                    try {
                        withCredentials([
                            string(credentialsId: 'VITE_SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                            string(credentialsId: 'VITE_SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY', variable: 'VITE_OPENROUTER_API_KEY'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_2', variable: 'VITE_OPENROUTER_API_KEY_2'),
                            string(credentialsId: 'VITE_OPENROUTER_API_KEY_3', variable: 'VITE_OPENROUTER_API_KEY_3')
                        ]) {
                            sh '''
                                set -eu
                                npm run build
                                test -d dist
                            '''
                        }
                    } catch (Exception ignored) {
                        echo 'Some optional Vite credentials are not configured. Building without injected secret build args.'
                        sh '''
                            set -eu
                            npm run build
                            test -d dist
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu
                    mkdir -p "$STATIC_DEPLOY_DIR"
                    find "$STATIC_DEPLOY_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
                    cp -a dist/. "$STATIC_DEPLOY_DIR/"

                    if [ -n "$RELOAD_COMMAND" ]; then
                        $RELOAD_COMMAND
                    fi
                '''
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
