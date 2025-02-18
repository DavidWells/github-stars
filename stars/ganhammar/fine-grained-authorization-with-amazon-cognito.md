---
repo: ganhammar/fine-grained-authorization-with-amazon-cognito
name: fine-grained-authorization-with-amazon-cognito
homepage: NA
url: https://github.com/ganhammar/fine-grained-authorization-with-amazon-cognito
stars: 1
starredAt: 2024-02-11T22:42:49Z
description: |-
    Proof-of-concept project which implements fine-grained authorization using Amazon Cognito
---

# Fine-Grained Authorization with Amazon Cognito

[As of a week ago](https://aws.amazon.com/about-aws/whats-new/2023/12/amazon-cognito-user-pools-customize-access-tokens/), you can now modify the contents of the access token, making it possible to add fine-grained authorization decisions to your application that is leveraging Amazon Cognito for user authentication. Previously it has only been possible to modify the contents of the id token, which should solely be used to authenticate the user, not to authorize operations. This is what the access token is for. Modifying the properties of the access token requires that the User Pool is configured to enforce Advanced Security.

A complete blog post explaining how the solutuon works can be found [here](https://www.ganhammar.se/posts/fine-grained-authorization-with-amazon-cognito).
