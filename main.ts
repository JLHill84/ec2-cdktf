import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import {
  AwsProvider,
  Instance,
  Subnet,
  Vpc,
  SecurityGroup,
} from "./.gen/providers/aws";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const myTags = {
      Name: "PyChainNew",
      Owner: "Josh Hill",
      Email: "joshua.hill@slalom.com",
      Manager: "Reed Hanson",
      Market: "Houston",
      Practice: "TE",
      Project: "PyChain",
    };
    // define resources here
    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    const vpc = new Vpc(this, "PyChainNewVPC", {
      cidrBlock: "10.0.0.0/28",
      tags: myTags,
    });

    // security groups are broken
    // it adds 2 for some reason
    const sg = new SecurityGroup(this, "PyChainNewSg", {
      description: "PyChain-sg",
      name: "PyChainNewSg",
      vpcId: `${vpc.id}`,
      tags: myTags,
    });

    const subnet = new Subnet(this, "PyChainNewPubsub", {
      availabilityZone: "us-east-1a",
      cidrBlock: "10.0.0.0/28",
      vpcId: `${vpc.id}`,
      tags: myTags,
    });

    const instance = new Instance(this, "PyChainNewEc2", {
      ami: "ami-08f3d892de259504d",
      instanceType: "t2.micro",
      subnetId: `${subnet.id}`,
      securityGroups: [`${sg.name}`],
      tags: myTags,
    });

    new TerraformOutput(this, "public_ip", {
      value: instance.publicIp,
    });
    new TerraformOutput(this, "VPC", {
      value: vpc.arn,
    });
  }
}

const app = new App();
new MyStack(app, "typscript-aws");
app.synth();
