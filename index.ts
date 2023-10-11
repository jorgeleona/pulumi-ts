import * as pulumi from "@pulumi/pulumi";

import { createApplicationRole } from "./roles";
import { createBeanstalkApplication } from "./application";
import { createVPC } from "./vpc";

const config = new pulumi.Config("pulumi-ts");

export const vpcId = createVPC(config);
export const applicationRoleName = createApplicationRole(config);
export const applicationDetails = createBeanstalkApplication( applicationRoleName, config);


