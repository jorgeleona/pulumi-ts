import * as pulumi from "@pulumi/pulumi";
import * as awsNative from "@pulumi/aws-native";
import { output } from "@pulumi/aws-native/types";

const config = new pulumi.Config("pulumi-ts");

const beanstalkInstanceProfileName = config.require("application-beanstalk-instance-profile");
const currentStack = pulumi.getStack();


export const createBeanstalkApplication = (applicationRoleName : pulumi.Output<string>, config : pulumi.Config) : any => {

    const appName = config.require("application-name");
    
    const applicationProfile = new awsNative.iam.InstanceProfile(beanstalkInstanceProfileName, {
        roles: [ applicationRoleName ],
    });

    const application = new awsNative.elasticbeanstalk.Application(
        `${appName}-${currentStack}`, 
        {
            description: `demo application ${appName}`
        }
    );

    const environment = new awsNative.elasticbeanstalk.Environment(
        `${appName}-env-${currentStack}`,
        {
            applicationName: pulumi.interpolate `${application.applicationName}`,
            description: `environment for demo application ${appName}`,
            solutionStackName: "64bit Windows Server 2012 R2 v2.11.8 running IIS 8.5",
            tier: { name: "WebServer", type: "Standard" },
             
            optionSettings: [
                {
                    namespace: "aws:elasticbeanstalk:environment",
                    optionName: "EnvironmentType",
                    value: "SingleInstance",
                },
                {
                    namespace: "aws:autoscaling:launchconfiguration",
                    optionName: "InstanceType",
                    value: "t2.micro",
                },
                {            
                namespace: "aws:autoscaling:launchconfiguration",
                optionName: "IamInstanceProfile",
                value: pulumi.interpolate `${applicationProfile.arn}`,
                }
            ]        
        }
    );

    return {
        applicationName : pulumi.interpolate `${application.applicationName}`,
        environmentName : pulumi.interpolate `${environment.applicationName}`
    };
    
};
