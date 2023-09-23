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
import { RepubliKAPI } from "republik-api"

const republikgg = new RepubliKAPI({
  authToken: "ACCESS_TOKEN",
  userId: "USER_ID"
})

// Get posts from an user
const getPostsOpt = {
  location: "",
  limit: 25,
  withOwnReactions: true,
  withReactionCounts: true
}
republikgg.getPosts("USER_ID", getPostsOpt)

// Get profile infor from an user
republikgg.getProfile("USER_ID")
```

#### Send post, like, and post comments example

```ts
republikgg.Self.follow("USER_ID")
republikgg.Self.like("ACTIVITY_ID")
republikgg.Self.comment("ACTIVITY_ID", "TEXT")
```

#### Update profile

```ts
republikgg.Self.updateProfile.name("DISPLAY NAME")
republikgg.Self.updateProfile.bio("BIO")
republikgg.Self.updateProfile.email("EXAMPLE@MAIL.COM")
```

#### Refreshing Access Token

```ts
import { RepubliKAPI } from "republik-api"

const republikgg = new RepubliKAPI({
  authToken: "ACCESS_TOKEN",
  refreshToken: "REFRESH_TOKEN"
})

republikgg.refreshAccessToken().then((response) => {
  console.log(response.newToken)
})
```

#### Access Token

Its property named `authToken` on constructing class. Access Token (Bearer) can be obtained via **Network Tab** on your browser. Or just generate it using `refreshToken`.

#### Refresh Token

Can be found on `localStorage`. The key named `XXXX.XXXX.XXXX.refreshToken`. New token will be alive for an hour.

## Legal

This source code is intended to facilitate access to certain online services but is not endorsed or supported by the platform provider(s). Please use this code responsibly and respect the terms of service of the platform(s) you interact with.
