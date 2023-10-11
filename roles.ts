import * as pulumi from "@pulumi/pulumi";
import * as awsNative from "@pulumi/aws-native";

export const createApplicationRole = (config : pulumi.Config) : pulumi.Output<string> => {

    const beanstalkRoleName = config.require("application-beanstalk-role-name");
    const currentStack = pulumi.getStack();
    const applicationRole = new awsNative.iam.Role(
        `${beanstalkRoleName}-${currentStack}`,
        {
            assumeRolePolicyDocument: JSON.stringify({
                "Version": "2012-10-17",
                "Statement": [{
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {"Service": "elasticbeanstalk.amazonaws.com"},
                }],
            }),
        } 
    );

    return pulumi.interpolate `${applicationRole.roleName}`;
};
