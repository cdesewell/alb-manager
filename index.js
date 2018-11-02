/*
This script assumes the following:
An VPC already exists with ID: vpc-c72a5da0
An ALB (ELBv2) + listener already exists with ARN: arn:aws:elasticloadbalancing:eu-west-1:588173369983:listener/app/blog-alb/620b9555c84607d7/7fe455be9cc45eb2
An EC2 instance already exists with Id: i-07d3af233f0edb46a
A Route53 subdomain configured to direct trafic from *.alb.bigavocado.digital to our ALB
*/
const _vpcId = "vpc-c72a5da0";
const _serverName = "chris-game-server";
const _tld = ".alb.bigavocado.digital"
const _ec2Id = "i-07d3af233f0edb46a";
const _albArn = "arn:aws:elasticloadbalancing:eu-west-1:588173369983:listener/app/blog-alb/620b9555c84607d7/7fe455be9cc45eb2";

const _accessKey = "";
const _secretKey = "";

const AWS = require("aws-sdk");

var elbv2 = new AWS.ELBv2({
    accessKeyId: _accessKey,
    secretAccessKey: _secretKey,
    region: "eu-west-1"});

/* This request creates a target group that you can use to route traffic to targets using HTTP on port 80. This target group uses the default health check configuration. */
const createTargetGroupPromise = new Promise(function(resolve,reject){
    var params = {
        Name: _serverName, 
        Port: 80, 
        Protocol: "HTTP", 
        VpcId: _vpcId
       };

    elbv2.createTargetGroup(params, function(err, data) {
        if (err){
            reject(err);
        } 
        else {
            resolve(data);
        }    
    });
});

createTargetGroupPromise.then(function(data){
    const targetGroupArn =  data.TargetGroups[0].TargetGroupArn;

    /* This request registers the specified instances with the specified target group. */
    return new Promise(function(resolve,reject){
        var params = {
            TargetGroupArn: targetGroupArn, 
            Targets: [
               {
              Id: _ec2Id
             }
            ]
           };
           elbv2.registerTargets(params, function(err, data) {
            if (err){
                reject(err);
            } 
            else {
                resolve(targetGroupArn);
            }    
           });
    });
})
.then(function(targetGroupArn){
    /* This request creates a rule that forwards requests to the specified target group if the URL contains the specified pattern (for example, /img/*). */
    return new Promise(function(resolve,reject){
    var params = {
        Actions: [
           {
          TargetGroupArn: targetGroupArn, 
          Type: "forward"
         }
        ], 
        Conditions: [
           {
          Field: "host-header", 
          Values: [
             "*." + _serverName + _tld
          ]
         }
        ], 
        ListenerArn: _albArn, 
        Priority: 10
       };
       elbv2.createRule(params, function(err, data) {
        if (err){
            reject(err);
        } 
        else {
            resolve(data);
        }    
       });
    });
}).then(function(data){
    console.log(data);
});








