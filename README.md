# RepubliK API

[![NPM](https://img.shields.io/npm/v/republik-api.svg?style=flat-circle&labelColor=black)](https://www.npmjs.com/package/republik-api)

**Disclaimer:** This TypeScript/Node.js project provides access to an unofficial RepubliK API, kind a implementation for informational and educational purposes only. RepubliK API could change at any moment but I will try my best to maintain and keep it up-to-date.

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

republikgg.authenticate()

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

Read more about [authentication](#authentication).

### 📝 Post

```ts
republikgg.Self.createPost("CAPTION", ["MEDIA_URL", "MEDIA_FILEPATH"]) // Maximum 3 media, createPost, deletePost
republikgg.Self.createConversation("CAPTION", "MEDIA_URL") // createConversation, deleteConversation
```

### 💖 Relationship

```ts
republikgg.Self.follow("USER_ID") // follow, unfollow
republikgg.Self.block("USER_ID") // block, unblock
```

### 👍 Reaction

**Note**: postId and activityId kind a same thing.

```ts
republikgg.Self.like("ACTIVITY_ID") // like, dislike
republikgg.Self.comment("ACTIVITY_ID", "TEXT") // comment, uncomment
```

### ⚙️ Update profile

```ts
republikgg.Self.updateProfile.name("DISPLAY NAME")
republikgg.Self.updateProfile.bio("BIO")
republikgg.Self.updateProfile.email("EXAMPLE@MAIL.COM")

// Photo
republikgg.Self.updateProfile.photo("FILE_PATH") // from local file
// or
republikgg.Self.updateProfile.photo("URL") // from url
```

### 🔃 Refreshing Token

```ts
republikgg.Self.updateToken()
```

## 🔒 Authentication

#### Auth options

```ts
const AuthOptions = {
  refreshToken?: string,
  authToken?: string,
  userId?: string
}
```

**There are two ways to do authentication**

```ts
const republikgg = new RepublikAPI(AuthOptions)
republikgg.authenticate()

// or

const republikgg = new RepublikAPI()
republikgg.authenticate(AuthOptions)
```

And there are two kind of authentication.

```ts
const republikgg = new RepublikAPI()
republikgg.authenticate({ refreshToken })

// or

const republikgg = new RepublikAPI()
republikgg.authenticate({ userId, authToken })
```

Authentication with `refreshToken` would be best since `authToken` only alive for an hour and required `userId`.
For now, it's **only tested** using Google SSO authentication, not yet tried Facebook signin method.

#### Auth Token

Its property named `authToken` on constructing class. Access Token (Bearer) can be obtained via **Network Tab** on your browser. `authToken` will expired in 3600s (an hour).

#### Refresh Token

Used to refresh `authToken`. Can be found on `localStorage`. The key named `XXXX.XXXX.XXXX.refreshToken`. New token will be live for an hour. Refresh token will change while the session closed (logout) from the device.

## ✏️ Some changes

<details>
  <summary><strong>1.3.x</strong> > <strong>1.4.x</strong></summary>
  
Changes:
- Remove the `Postman/Runtine` User Agent
- Allow use to user their own User Agent

This version updated because [#4 Issue](https://github.com/farizrifqi/RepubliK-API/issues/4)

</details>
<details>
  <summary><strong>1.0.x</strong> > <strong>1.1.x</strong></summary>

Functions:

- `Self.post()` to `Self.createPost()`
- `refreshAccessToken()` to `Self.updateToken()` No longer return value, new token automatically set.
- `authenticate()` Now needed after constructing class.
</details>

> Feel free to open issue or opening pull request. A star (⭐) would be very amazing!

## Legal

This source code is intended to facilitate access to certain online services but is not endorsed or supported by the platform provider(s). Please use this code responsibly and respect the terms of service of the platform(s) you interact with.
