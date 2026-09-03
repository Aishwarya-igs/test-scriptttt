pipeline {

    agent any

    stages {

        stage('Checkout Repo B') {
            steps {
                echo "Repo B checkout handled by Pipeline from SCM"
            }
        }

        stage('Check Environment') {
            steps {
                echo "Checking Windows environment"

                bat 'node -v'
                bat 'npm -v'
                bat 'npx playwright --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing npm dependencies"

                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo "Installing Playwright browsers"

                bat 'npx playwright install'
            }
        }

        stage('Run Selected Playwright Test') {
            steps {
                echo "Building and starting frontend application"

                dir('./dashboard/frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                    bat 'start /B npm start'
                }

                echo "Running Playwright tests"

                bat 'npx playwright test'
            }
        }
    }

    post {
        always {
            echo "Publishing Playwright HTML Report"

            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
        }

        success {
            echo "Playwright execution completed successfully"
        }

        failure {
            echo "Playwright execution failed"
        }
    }
}
