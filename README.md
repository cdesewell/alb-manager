# ALB (ELBv2) rules manager

The script makes three requests to add an instance to the ALB and configure subdomain routing to that instance. See comments for more detail.

## Running
As usual run
```bash
npm install
```
Configure the variables at the top of the script then execute
```bash
node index.js
```
in the root directory

## Refrences:
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html

## Notes:
Application Load Balancer is referred to as elbv2 in the sdk & docs
