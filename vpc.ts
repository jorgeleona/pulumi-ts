import * as pulumi from "@pulumi/pulumi";
import * as awsNative from "@pulumi/aws-native";
import * as aws from "@pulumi/aws";


export const createVPC = (config : pulumi.Config) : any => {

    const vpcName = config.require("vpc-name");
    const vpcSubnetName = config.require("vpc-subnet-name");
    const vpcSecurityGroupName = config.require("vpc-security-group-name");
    const redisCacheName = config.require("cache-cluster-name");
    const currentStack = pulumi.getStack();

    const vpc = new awsNative.ec2.Vpc(`${vpcName}-${currentStack}`,
        {
            cidrBlock : "10.0.0.0/24",
            instanceTenancy: "default",
            tags: [ { key: "project", value: "test-project" },
                    { key: "env", value: currentStack },
                ]
        }
    );

    const subnet = new awsNative.ec2.Subnet(`${vpcSubnetName}-${currentStack}`,
         {
            vpcId: pulumi.interpolate `${vpc.id}`,
            cidrBlock: "10.0.0.0/28"
         }
     );

     const securityGroup = new aws.ec2.SecurityGroup(`${vpcSecurityGroupName}-${currentStack}`, 
        {
            vpcId: pulumi.interpolate `${vpc.id}`,
        }
    );
    
    const subnetGroup = new aws.elasticache.SubnetGroup("cache-subnet", {subnetIds: [  pulumi.interpolate `${subnet.id}`]});


    const redisCache = new aws.elasticache.Cluster(`${redisCacheName}-${currentStack}`,
        {
            engine: "redis",
            engineVersion: "6.0",
            nodeType: "cache.t2.micro",
            numCacheNodes: 1,
            port: 6379,
            subnetGroupName: pulumi.interpolate `${subnetGroup.name}`,
            securityGroupIds: [pulumi.interpolate `${securityGroup.id}`,],
            tags: {  
                project: "test-project",
                env: currentStack
            }            
        }
    );

    return {
        vpcId: pulumi.interpolate `${vpc.id}`,
        subnetId : pulumi.interpolate `${subnet.id}`,
        redisCacheId: pulumi.interpolate `${redisCache.id}`,
    };
};
