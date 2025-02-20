---
repo: while-true/wt-dev-cloudfront-private-access
name: wt-dev-cloudfront-private-access
homepage: NA
url: https://github.com/while-true/wt-dev-cloudfront-private-access
stars: 2
starredAt: 2025-01-13T20:43:00Z
description: |-
    null
---

# Protecting AWS CloudFront site from prying eyes

AWS CloudFront is Amazon's CDN offering that is very often used to host single-page applications (SPAs). SPA files reside in an S3 bucket, and CloudFront serves them to customers. In some cases, you might want to hide these sites. For example, test and sandbox versions of the site that contain not-yet-released features and bugs might be better hidden from the public internet.

There are some ways to prevent access by combining VPN and AWS WAF (Web Application Firewall), but that requires routing all traffic through VPN and makes the site slower than if it was served by CloudFront's edge location.

Explore our [article](https://docs.wt.dev/blog/cf-private-access) to learn about an approach that makes content inaccessible to anyone without specific login credentials or (optionally) access to the internal network.
