import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import {
  Architecture,
  FunctionUrlAuthType,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { AccessKey, User } from "aws-cdk-lib/aws-iam";

export class EchoLambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFn = new NodejsFunction(this, "echo-lambda-fn", {
      functionName: "echo-fn",
      entry: "./lib/echo-fn.ts",
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        format: OutputFormat.ESM,
      },
      architecture: Architecture.ARM_64,
      reservedConcurrentExecutions: 2,
    });

    // create user with permission to invoke lambda and access key
    const echoLambdaUser = new User(this, "echo-fn-invoker-user");

    lambdaFn.grantInvoke(echoLambdaUser);

    const accessKey = new AccessKey(this, "echo-fn-invoker-user-access-key", {
      user: echoLambdaUser,
    });

    new CfnOutput(this, "AccessKeyId", { value: accessKey.accessKeyId });
    new CfnOutput(this, "AccessKeySecret", {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
    });
  }
}
