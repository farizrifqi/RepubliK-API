# RepublikGG-API
**Disclaimer:** This project provides access to an unofficial API for informational and educational purposes only. 

## Quickstart

### Installation

#### Using NPM
```
npm install republikgg-api
```

#### Using YARN
```
yarn add republikgg-api
```

### Quick example of usage

```ts
import { RepublikGGAPI } from 'unofficial-republikgg-api';

const republikgg = new RepublikGGAPI({
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
republikgg.getPosts("USER_ID", getPostsOpt)

// Get profile infor from an user
republikgg.getProfile("USER_ID")
```

###  Access Token
Access Token (Bearer) can be obtained via **Network Tab** on your browser.

## Legal
This source code is intended to facilitate access to certain online services but is not endorsed or supported by the platform provider(s). Please use this code responsibly and respect the terms of service of the platform(s) you interact with.