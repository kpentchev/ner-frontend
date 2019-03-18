#!/usr/bin/env groovy

// Label will be set to the Jenkins BUILD_TAG aka ${JOB_NAME}-${BUILD_NUMBER}
// also removes problematic slashes and special characters to avoid problems
// with accessing the containers
// We prepend the "AK_" prefix to avoid special characters as first char.
String label = "AK_" + env.BUILD_TAG.replace("/", "_").replace("%2F", "_").replace("-", "_").replaceAll(" ", "").reverse().take(60).reverse()

// Don't change this two line
String kubernetesVersion = '1.8.3'
String registryUrl = "businessschool.azurecr.io"
String registryRepository = "business-school/service-monitor"

String kubernetesService = "business-school-service-monitor"
String kubernetesDevelopmentNamespace = "business-school-development"

// We define our deployment condition here because we will re-use them
Boolean deployDevelopment = env.BRANCH_NAME == 'master'

properties([
  // adjust thresholds as needed, but try to keep it as low as possible. This is already a good configuration.
  buildDiscarder(logRotator(artifactDaysToKeepStr: '10', artifactNumToKeepStr: '5', daysToKeepStr: '10', numToKeepStr: '10')),
  // disableConcurrentBuilds is mandatory when using Kubernetes or you should risk to broke everything
  disableConcurrentBuilds(),
  // this options force Jenkins to keep in memory build logs until the build is done
  durabilityHint('PERFORMANCE_OPTIMIZED'),
  // limit to 3 builds per hour, allow user to manually start build
  [$class: 'JobPropertyImpl', throttle: [count: 3, durationName: 'hour', userBoost: true]]
])

String imageTag = ''

String slackChannel = '#university-pipelines'
String currentStage = 'Setup'

def buildImageTag() {
  // Building the image tag
  String commitHash = sh(
    script: 'git rev-parse --short HEAD',
    returnStdout: true
  ).trim()
  Date buildTimeDate = new Date()
  String buildTime = buildTimeDate.format("yyyyMMddHHmm")
  String imageTag = "${buildTime}-${commitHash}" as String
  echo "Image tag: ${imageTag}"
  return imageTag
}

def kubeSubst(String placeholder, String value, String file) {
  sh "sed -i \"s|${placeholder}|${value}|\" ${file}"
}

// this function install inside the container with docker the kubectl binary
def setupKubectl(String kubernetesVersion) {
  sh "apk update && apk add curl"
  sh "curl -LO https://storage.googleapis.com/kubernetes-release/release/v${kubernetesVersion}/bin/linux/amd64/kubectl"
  sh "chmod +x ./kubectl"
  sh "mv ./kubectl /usr/local/bin/kubectl"
}

// this function install the kubectl configuration
def setupKubeConfig(kubeConfigPath) {
  sh "mkdir -p ~/.kube"
  sh "cp ${kubeConfigPath} ~/.kube/config"
}

def buildAndPushImage(registryUser, registryPassword, String registryUrl, String registryRepository, imageTag, dockerFilePath) {
  sh "docker build -t ${registryUrl}/${registryRepository}:${imageTag} -f ${dockerFilePath} ."
  sh "docker login ${registryUrl} -u ${registryUser} -p ${registryPassword} "
  retry(3) {
    sh "docker push ${registryUrl}/${registryRepository}:${imageTag} "
  }
}

// this function apply the deployment file to the a namespace
def stageImage(String kubernetesServiceName, String kubernetesTeamNamespacePrefix, String environment, String credentials, String imageTag, String kubernetesVersion) {
  container('docker') {
    withCredentials([[$class       : "FileBinding",
                      credentialsId: credentials,
                      variable     : 'KUBE_CONFIG']]) {
      timeout(time: 5, unit: 'MINUTES') {
        setupKubectl(kubernetesVersion)
        setupKubeConfig(env.KUBE_CONFIG)
        kubeSubst("IMAGE_TAG", imageTag, "deployment/${environment}/deployment.yaml")
        retry(3) {
          sh "kubectl apply -f deployment/${environment}"
        }
        retry(3) {
          sh "kubectl rollout status deployment ${kubernetesServiceName} --namespace ${kubernetesTeamNamespacePrefix}"
        }
      }
    }
  }
}

def notifyOnSlack(String message, String channel, String color) {
  slackSend(message: message, channel: channel, color: color, token: "dm2VVI1A01G6iwYrfD5kBM5u")
}

timeout(time: 30, unit: 'MINUTES') {
  timestamps {
    podTemplate(
      label: label,
      containers: [
        containerTemplate(
          name: 'node',
          image: 'mhart/alpine-node:10.1.0',
          ttyEnabled: true,
          command: 'cat',
          resourceRequestCpu: '500m',
          resourceLimitCpu: '1000m',
          resourceRequestMemory: '1500Mi',
          resourceLimitMemory: '3072Mi',
          envVars: [
            envVar(key: 'CHROME_BIN', value: '/usr/bin/chromium-browser')
          ]),
        containerTemplate(
          name: 'docker',
          image: 'docker',
          ttyEnabled: true,
          command: 'cat'),
      ],
      envVars: [
        envVar(key: 'BRANCH_NAME', value: env.BRANCH_NAME)
      ],
      volumes: [
        hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
      ]) {

      node(label) {
        try {
          stage('Checkout') {
            timeout(time: 1, unit: 'MINUTES') {
              currentStage = 'Checkout'
              checkout scm
              imageTag = buildImageTag()
            }
          }
          stage('Install') {
            timeout(time: 7, unit: 'MINUTES') {
              currentStage = 'Install'
              container('node') {
                withCredentials([
                  string(credentialsId: 'NPM_LPF_AUTH_TOKEN_READER', variable: 'ARTIFACTORY_LPF_TOKEN')
                ]) {
                  sh 'apk add --no-cache gcc g++ make python chromium'
                  sh 'npm i -g node-gyp'
                  sh 'NPM_LPF_AUTH_TOKEN_READER=${ARTIFACTORY_LPF_TOKEN} npm install'
                }
              }
            }
          }
          stage('Unit Tests & Build in parallel') {
            timeout(time: 7, unit: 'MINUTES') {
              currentStage = 'Unit Tests & Build in parallel'
              parallel(
                failFast: true,
                //'Unit Tests': {
                //  container('node') {
                //    sh 'NPM_LPF_AUTH_TOKEN_READER=${ARTIFACTORY_LPF_TOKEN} npm run test:ci'
                //  }
                //},
                'Build': {
                  container('node') {
                    sh 'NPM_LPF_AUTH_TOKEN_READER=${ARTIFACTORY_LPF_TOKEN} npm run-script build'
                  }
                }
              )
            }
          }

          stage('Build and Push Docker Image | 2 minutes') {
            timeout(time: 2, unit: 'MINUTES') {
            currentStage = 'Build and Push Docker Image'
            container('docker') {
                withCredentials([[$class          : 'UsernamePasswordMultiBinding',
                                credentialsId   : 'businessschool.azurecr.io',
                                usernameVariable: 'registryUser',
                                passwordVariable: 'registryPassword']]) {
                buildAndPushImage(env.registryUser, env.registryPassword, registryUrl, registryRepository, imageTag, "Dockerfile")
                }
            }
            }
        }

        stage('Deploy Dev') {
            currentStage = 'Deploy Dev'
            stageImage(kubernetesService, kubernetesDevelopmentNamespace, 'development', 'config_business-school-development', imageTag, kubernetesVersion)
        }

        String message = "Build <${env.BUILD_URL}|*${currentBuild.displayName}*> for *service-monitor ${env.BRANCH_NAME}* successfuly deployed :beer:"
        notifyOnSlack(message, slackChannel, 'good')  

        }
        catch (Throwable e) {
          String message = "@here Build <${env.BUILD_URL}|*${currentBuild.displayName}*> failed for *service-monitor ${env.BRANCH_NAME}* at stage *${currentStage}* :scream_cat: \n${e.toString()}"
          notifyOnSlack(message, slackChannel, 'bad')

          throw e
        }
      }
    }
  }
}
