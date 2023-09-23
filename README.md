# RepubliK-API
**Disclaimer:** This project provides access to an unofficial API for informational and educational purposes only. 

## Quickstart

### Installation

#### Using NPM
```
npm install republik-api
```

#### Using YARN
```
yarn add republik-api
```

### Quick example of usage

```ts
import { RepubliKAPI } from 'republik-api';

const republikgg = new RepubliKAPI({
    authToken: "ACCESS_TOKEN",
    userId: "USER_ID"
});

// Get posts from an user
const getPostsOpt = {
    location: '',
    limit: 25,
    withOwnReactions: true,
    withReactionCounts: true
}
republikgg.getPosts("USER_ID", getPostsOpt);

// Get profile infor from an user
republikgg.getProfile("USER_ID");
```
#### Send post, like, and post comments example
```ts
// Follow
republikgg.Self.follow("username")

// Like
republikgg.Self.like("activity_id")

// Comment
republikgg.Self.comment("activity_id", "text")
```
#### Update profile
```ts
republikgg.Self.updateProfile.name("display name")
republikgg.Self.updateProfile.bio("bio")
republikgg.Self.updateProfile.email("example@mail.com")
```
###  Access Token
Its property named `authToken` on constructing class. Access Token (Bearer) can be obtained via **Network Tab** on your browser.

## Legal
This source code is intended to facilitate access to certain online services but is not endorsed or supported by the platform provider(s). Please use this code responsibly and respect the terms of service of the platform(s) you interact with.