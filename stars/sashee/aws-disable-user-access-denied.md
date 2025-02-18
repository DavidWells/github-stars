---
repo: sashee/aws-disable-user-access-denied
name: aws-disable-user-access-denied
homepage: NA
url: https://github.com/sashee/aws-disable-user-access-denied
stars: 1
starredAt: 2024-08-13T22:27:44Z
description: |-
    null
---

# Automatically disable an IAM user's access if it makes an invalid request

This is an example stack that creates:
* an IAM user with some permissions
* an alarm that triggers when the user sends a request that is denied
* a Lambda function that attaches the AWSDenyAll policy to the user

## Why is it useful?

If a user is used by a process (and not a person) then all the requests it sends is determined by code. Permissions are granted to the user to be able to carry out its task that means under normal circumstances all requests it sends will be granted.

If there is a security breach, such as the credentials are stolen, an attacker might want to try out the keys to see what is accessible to it. This generates requests that are denied that we can detect.

Using automation we can remove all permissions in the case of a deny. This automatically disables all access when it's suspected the keys are stolen.

