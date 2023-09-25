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

## Quick example of usage

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

### Post

```ts
republikgg.Self.post("CAPTION", ["MEDIA_URL", "MEDIA_FILEPATH"]) // Maximum 3
republikgg.Self.delete("POST_ID")
```

### Relationship

```ts
republikgg.Self.follow("USER_ID") // follow, unfollow
republikgg.Self.block("USER_ID") // block, unblock
```

### Reaction

**Note**: postId and activityId kind a same thing.

```ts
republikgg.Self.like("ACTIVITY_ID") // like, dislike
republikgg.Self.comment("ACTIVITY_ID", "TEXT") // comment, uncomment
```

### Update profile

```ts
republikgg.Self.updateProfile.name("DISPLAY NAME")
republikgg.Self.updateProfile.bio("BIO")
republikgg.Self.updateProfile.email("EXAMPLE@MAIL.COM")

// Photo
republikgg.Self.updateProfile.photo("FILE_PATH") // from local file
// or
republikgg.Self.updateProfile.photo("URL") // from url
```

### Refreshing Access Token

```ts
import { RepubliKAPI } from "republik-api"

const republikgg = new RepubliKAPI({
  authToken: "ACCESS_TOKEN",
  userId: "USER_ID",
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
