import axios, { RawAxiosRequestHeaders } from "axios"
import { API_KEY, BASE_API_URL, CLIENT_ID, SERVICE_PROVIDER_URl, STREAM_API_URL } from "./constants"
import {
  PostQuery,
  PostsQuery,
  Relation,
  RelationQueryOptions,
  GetPostOption,
  Token,
  User,
  UserData,
  RelationshipResponse,
  Votes
} from "./republik-types"
import fs from "fs"
import mime from "mime"
import { RepublikAPIError } from "./error"

const cleanUrl = (url: string): string => {
  url = url.split("?")[0]
  const lastDigit = url[url.length - 1]
  const isURLClean = lastDigit == "?" || lastDigit == "/"
  if (isURLClean) return cleanUrl(url.substring(0, url.length - 1))
  return url
}

export declare namespace RepubliKAPI {
  type Options = {
    verbose?: boolean
  }

  type Auth = {
    userId?: string
    refreshToken?: string
    authToken?: string
    accessToken?: string
  }
}

export interface PostMedia {
  mediaData: any
  mimeType: string
  commonType: string
  fileExtension: string
}

//todo ErrorResponse
export type ErrorResponse = {
  error: true
  message: string
}

export class RepubliKAPI {
  authToken: string
  accessToken: string
  refreshToken: string
  streamToken: string
  userId: string

  verbose: boolean

  isAuthenticated: boolean

  constructor(options?: RepubliKAPI.Options & RepubliKAPI.Auth) {
    this.authToken = options?.authToken || ""
    this.userId = options?.userId || ""
    this.refreshToken = options?.refreshToken || ""

    this.verbose = options?.verbose || false
    this.isAuthenticated = false
  }

  authenticate = async (authOptions?: RepubliKAPI.Auth) => {
    this.refreshToken = authOptions?.refreshToken ?? this.refreshToken
    this.authToken = authOptions?.authToken ?? this.authToken
    this.userId = authOptions?.userId ?? this.userId

    try {
      if (!this.refreshToken) {
        if (!this.authToken) throw new RepublikAPIError("Impossible auth", "No auth data provided.")

        if (this.verbose) console.log(`refreshToken is not set, better to set it`)

        if (!this.userId) throw new RepublikAPIError("Impossible auth", "userId must be set with authToken")

        const testAuth = (await this.Self.getProfile()) as any
        if (!testAuth || testAuth?.id == undefined) throw new RepublikAPIError("Auth failed", testAuth?.message || "userId or authToken invalid.")
      } else {
        const tokens = await this._updateToken()

        if (tokens?.message || !(tokens?.AuthenticationResult?.AccessToken && tokens?.AuthenticationResult?.IdToken)) {
          throw new RepublikAPIError("Error on authentication", tokens)
        }

        this.authToken = tokens.AuthenticationResult.IdToken
        this.accessToken = tokens.AuthenticationResult.AccessToken

        const getAuthInfo = await this._getUserId()
        const realUserId = getAuthInfo?.Username

        if ((!realUserId && !this.userId) || realUserId.message) {
          throw new RepublikAPIError("Something error", realUserId.message || "Could not get userId")
        }

        const newStreamToken = await this._getStreamToken()
        this.streamToken = newStreamToken.getStreamToken
        this.userId = realUserId
      }
      this.isAuthenticated = true
      if (this.verbose) console.log(`Authentication success`)
    } catch (err: any) {
      console.log(err)
      process.exit()
    }
  }

  getAuthToken = () => this.authToken
  getAccessToken = () => this.accessToken
  getUserId = () => this.userId
  getRefreshToken = () => this.refreshToken

  _getAuthData = () => ({
    authToken: this.authToken,
    userId: this.userId,
    refreshToken: this.refreshToken,
    accessToken: this.accessToken
  })

  private _getHeaders = () => ({
    Accept: "*/*",
    "Accept-Language": "en-US",
    Referer: "https://app.republik.gg/",
    "X-Custom-App-Version-Tag": "6.0.2"
  })

  private _getStreamHeaders = () => ({
    "Stream-Auth-Type": "jwt",
    "X-Stream-Client": "stream-javascript-client-browser-8.1.0"
  })

  private _getServiceProviderHeaders = () => ({
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-User-Agent": "aws-amplify/5.0.4 js"
  })

  private _updateToken = async () => {
    try {
      const response = await axios.post(
        `${SERVICE_PROVIDER_URl}`,
        {
          AuthFlow: "REFRESH_TOKEN_AUTH",
          ClientId: CLIENT_ID,
          AuthParameters: {
            DEVICE_KEY: null,
            REFRESH_TOKEN: this.refreshToken
          }
        },
        {
          headers: {
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
            ...this._getServiceProviderHeaders()
          }
        }
      )
      return response?.data
    } catch (err: any) {
      return err?.response?.data
    }
  }

  private _getStreamToken = async (): Promise<Token> => {
    if (this.verbose) {
      console.log(`Getting streamToken...`)
    }
    let data: any = []
    try {
      const response = await axios.get(`${BASE_API_URL}/production/profile/${this.userId}/tokens`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _getVotes = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/production/remaining-votes/${this.userId}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      return response?.data
    } catch (err: any) {
      return err?.response?.data
    }
  }

  private _searchUserByUsername = async (username: string) => {
    let data: any = []
    try {
      const response = await axios.get(`${BASE_API_URL}/production/profile/mentions-autocomplete?q=${username.toLowerCase()}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _updateProfile = async (newValue: string, type: string): Promise<any> => {
    let current = (await this.Self.getProfile()) as UserData
    const defaultPayload: UserData = {
      displayName: type == "name" ? newValue : current?.displayName,
      email: type == "email" ? newValue : current?.email,
      bio: type == "bio" ? newValue : current?.bio,
      username: current?.username
    }
    try {
      const response = await axios.put(`${BASE_API_URL}/production/profile/${this.userId}/`, defaultPayload, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      return response?.data
    } catch (err: any) {
      return err?.response?.data
    }
  }

  private _getFileFromURL = async (url: string) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" })
      return response
    } catch (err) {
      return undefined
    }
  }

  private _getFileExtension = (fileSource: string) => {
    fileSource = fileSource.toLowerCase()
    if (fileSource.includes(".jpg")) return "jpg"
    if (fileSource.includes(".jpeg")) return "jpeg"
    if (fileSource.includes(".png")) return "png"
    if (this.verbose) {
      console.log(`Unknown file extension. Override to set as JPG. Currently supports JPG, JPEG, PNG`)
    }
    return "jpg"
  }

  private _isMIMEUploadable = (mimeType: string) => mimeType.includes("image") || mimeType.includes("video")

  private _prepareMedia = async (fileSource: string): Promise<PostMedia | undefined> => {
    let mimeType: string
    let mediaData: any
    let fileExtension = this._getFileExtension(fileSource)
    const fileLocation = fileSource.toLowerCase().includes("http") ? "url" : "local"

    if (fileLocation == "url") {
      const getImage = await this._getFileFromURL(fileSource)
      if (getImage?.headers["content-type"]) {
        mimeType = getImage?.headers["content-type"]
        if (!this._isMIMEUploadable(mimeType)) {
          if (this.verbose) {
            console.log(`File type is not supported. ${fileSource}`)
          }
          return undefined
        }

        mediaData = Buffer.from(getImage.data, "binary")
      } else {
        if (this.verbose) {
          console.log(`Cannot get MIME type. ${fileSource}`)
        }
        return undefined
      }
    } else {
      mediaData = fs.readFileSync(fileSource)
      mimeType = mime.getType(fileSource)
      if (!this._isMIMEUploadable(mimeType)) {
        if (this.verbose) {
          console.log(`Cannot get MIME type. ${fileSource}`)
        }
        return undefined
      }
    }
    let commonType = mimeType.includes("image") ? "image" : "video"

    return { mediaData, mimeType, commonType, fileExtension }
  }

  private _signMediaUpload = async (action: string, path: string, contentType: string) => {
    let data: any | undefined = undefined
    try {
      const requestOptions = await this._requestOptionsMethod(`${BASE_API_URL}/production/storage/sign`, {
        Authorization: `Bearer ${this.authToken}`,
        "Access-Control-Request-Headers": "access-control-allow-origin,content-type",
        "Access-Control-Request-Method": "PUT"
      })
      if (!requestOptions) return undefined
      const response = await axios.post(
        `${BASE_API_URL}/production/storage/sign`,
        { action, contentType, filePath: path },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        }
      )

      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _uploadMedia = async (method: string, path: string, contentType: string, mediaData: any) => {
    try {
      const signUrl = await this._signMediaUpload(method, path, contentType)
      await axios.request({
        url: signUrl.url,
        method: "OPTIONS",
        headers: {
          Host: "production-sharedresources-userbucket9d85efed-n4ysz26kfcdl.s3.ap-southeast-1.amazonaws.com",
          Accept: "*/*",
          "Access-Control-Request-Headers": "access-control-allow-origin,content-type",
          "Access-Control-Request-Method": "PUT",
          Origin: "https://app.republik.gg",
          Referer: "https://app.republik.gg/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        }
      })
      await axios.request({
        url: signUrl.url,
        method: "PUT",
        data: mediaData,
        headers: {
          "Content-Type": contentType,
          Host: "production-sharedresources-userbucket9d85efed-n4ysz26kfcdl.s3.ap-southeast-1.amazonaws.com",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Access-Control-Allow-Origin": "*",
          Origin: "https://app.republik.gg",
          Referer: "https://app.republik.gg/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "Sec-GPC": 1,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        }
      })
      return true
    } catch (err) {
      if (this.verbose) {
        console.log(err)
      }
      return false
    }
  }

  private _requestOptionsMethod = async (url: string, headers?: RawAxiosRequestHeaders) => {
    try {
      await axios.options(url, { headers })
      return true
    } catch (err) {
      if (this.verbose) {
        console.log("Error request OPTIONS to " + url)
        console.log(err)
      }
      return null
    }
  }

  private _getUserId = async () => {
    if (!this.refreshToken) return { error: true, message: "refreshToken not set" } as ErrorResponse
    try {
      const response = await axios.post(
        `${SERVICE_PROVIDER_URl}`,
        {
          AccessToken: this.accessToken
        },
        {
          headers: {
            "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
            ...this._getServiceProviderHeaders()
          }
        }
      )
      return response?.data
    } catch (err: any) {
      return err?.response?.data
    }
  }

  private _getProfile = async (userId: string) => {
    if (!this.isAuthenticated) throw new Error("Not authenticated")
    let data = undefined
    try {
      const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _getRelations = async (userId: string, followers: boolean, options?: RelationQueryOptions) => {
    let data: Relation | undefined = undefined
    try {
      const params = `q=${options.q}&lastKey=${options.lastKey}&followers=${followers}&startAt=${options.startAt}`
      const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}/relations?${params}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _createRelationship = async (userId: string, type: "block" | "followers" = "followers") => {
    if (!this.isAuthenticated) throw new Error("Not authenticated")
    if (userId == this.userId) throw new RepublikAPIError("Cannot do to self", { target: userId, self: this.userId })
    let data: any | undefined = undefined
    try {
      const response = await axios.post(
        `${BASE_API_URL}/production/profile/${userId}/${type}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        }
      )
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  private _destroyRelationship = async (userId: string, type: "block" | "followers" = "followers") => {
    if (!this.isAuthenticated) throw new Error("Not authenticated")
    if (userId == this.userId) throw new RepublikAPIError("Cannot do to self", { target: userId, self: this.userId })
    let data: any | undefined = undefined
    try {
      const response = await axios.delete(`${BASE_API_URL}/production/profile/${userId}/followers`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  Self = {
    updateProfile: {
      name: async (newValue: string): Promise<any> => this._updateProfile(newValue, "name"),
      bio: async (newValue: string): Promise<any> => this._updateProfile(newValue, "bio"),
      email: async (newValue: string): Promise<any> => this._updateProfile(newValue, "email"),
      photo: async (mediaSource: string) => {
        const media = await this._prepareMedia(mediaSource)
        if (!media) return false
        if (media.commonType != "image") {
          if (this.verbose) {
            console.log(`Media file not supported. IMAGE only.`)
          }
          return false // ! Only IMAGE supported on photo profile
        }
        return await this._uploadMedia("PUT", `avatar/avatar.${media.fileExtension}`, media.mimeType, media.mediaData)
      }
    },
    getProfile: async (): Promise<UserData | ErrorResponse | undefined> => await this._getProfile(this.userId),
    getVotes: async (): Promise<Votes> => await this._getVotes(),
    getFollowers: async (options?: RelationQueryOptions): Promise<Relation | any> => {
      return await this._getRelations(this.userId, true, options)
    },
    getFollowing: async (options?: RelationQueryOptions): Promise<Relation | any> => {
      return await this._getRelations(this.userId, false, options)
    },
    getPosts: async (opt?: GetPostOption): Promise<PostsQuery | undefined> => await this.getPosts(this.userId, opt),
    getTimeline: async (opt?: GetPostOption): Promise<PostsQuery | undefined> => {
      let data: PostsQuery | undefined = undefined
      const location = opt?.location || "unspecified"
      const limit = opt?.limit || 25
      const id_lt = opt?.id_lt || ""
      const with_activity_data = opt?.with_activity_data || true
      const kind = opt?.kind || "COMMENT"

      try {
        const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`
        const response = await axios.get(`${STREAM_API_URL}/enrich/feed/timeline/${this.userId}/?${params}`, {
          headers: {
            Authorization: this.streamToken,
            ...this._getStreamHeaders(),
            ...this._getHeaders()
          }
        })
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }
      return data
    },
    refreshToken: async (): Promise<void> => {
      if (!this.refreshToken) throw new Error("refreshToken is not set")
      try {
        const newToken = await this._updateToken()

        if (!newToken?.AuthenticationResult?.IdToken) throw new RepublikAPIError("Cannot get authToken", newToken)

        this.accessToken = newToken.AuthenticationResult.accessToken
        this.authToken = newToken.AuthenticationResult.IdToken

        if (this.verbose) {
          console.log(`accessToken and authToken refreshed.`)
        }

        const newStreamToken = await this._getStreamToken()
        if (newStreamToken?.getStreamToken) {
          this.streamToken = newStreamToken.getStreamToken
          if (this.verbose) {
            console.log(`streamToken refreshed.`)
          }
        }
      } catch (err: any) {
        console.log(err)
      }
    },
    follow: async (userId: string): Promise<RelationshipResponse | any> => await this._createRelationship(userId),
    block: async (userId: string): Promise<RelationshipResponse | any> => await this._createRelationship(userId, "block"),
    unfollow: async (userId: string): Promise<RelationshipResponse | any> => await this._destroyRelationship(userId),
    unblock: async (userId: string): Promise<RelationshipResponse | any> => await this._destroyRelationship(userId, "block"),
    like: async (postId: string): Promise<void> => {
      let data: any | undefined = undefined
      try {
        const response = await axios.post(
          `${BASE_API_URL}/production/activity-likes`,
          { postId },
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
              ...this._getHeaders()
            }
          }
        )
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }
      return data
    },
    dislike: async (postId: string) => {
      const postData = await this.getPost(postId)
      const reactionList = postData?.activity.latest_reactions?.like
      if (!reactionList) return undefined //! No latest reaction or failed

      const selectedReaction = reactionList.filter((reaction) => reaction.user_id == this.userId)
      if (selectedReaction.length != 1) return undefined //! Like not performed

      const reactionId = selectedReaction[0].id
      let data: any | undefined = undefined
      let streamToken: string | undefined = undefined

      const token = await this._getStreamToken()
      streamToken = (token as Token)?.getStreamToken || undefined
      if (!streamToken) return undefined

      try {
        const params = `api_key=${API_KEY}&location=unspecified`
        const fullUrl = `${STREAM_API_URL}/reaction/${reactionId}/?${params}`

        const requestOptions = await this._requestOptionsMethod(fullUrl, {
          Authorization: streamToken,
          ...this._getStreamHeaders(),
          ...this._getHeaders()
        })

        if (!requestOptions) return undefined

        const response = await axios.delete(fullUrl, {
          headers: {
            Authorization: streamToken,
            ...this._getStreamHeaders(),
            ...this._getHeaders()
          }
        })
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }
      return data
    },
    comment: async (commentText: string, postId: string, mentions: string[] = []): Promise<void> => {
      let data: any | undefined = undefined
      try {
        const requestData = {
          comment: commentText,
          mentions: mentions,
          reactionTargetId: postId
        }

        const response = await axios.post(`${BASE_API_URL}/production/activity-comments/${postId}`, requestData, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        })
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }
      return data
    },
    uncomment: async (postId: string, commentId: string) => {
      let data: any | undefined = undefined
      try {
        const requestUrl = `${BASE_API_URL}/production/activity-comments/${postId}/comments/${commentId}`
        const requestOptions = await this._requestOptionsMethod(requestUrl, {
          Authorization: `Bearer ${this.authToken}`,
          "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
          "Access-Control-Request-Method": "DELETE"
        })

        if (!requestOptions) return undefined

        const response = await axios.delete(requestUrl, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        })
        console.log(response)
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }

      return data
    },
    createPost: async (caption: string, mediaSources: string[]) => {
      if (mediaSources.length == 0 || mediaSources.length > 3) {
        if (this.verbose) {
          if (mediaSources.length == 0) console.log(`Media required`)
          if (mediaSources.length > 3) console.log(`Media maximum is 3`)
        }
        return undefined // ! Media required, Maximum 3
      }

      let data: any | undefined = undefined
      let preparedMedia: PostMedia[] = []

      for await (const source of mediaSources) {
        const prePrepareMedia = await this._prepareMedia(source)
        if (prePrepareMedia) {
          preparedMedia.push(prePrepareMedia)
        }
      }

      if (preparedMedia.length != mediaSources.length) {
        if (this.verbose) {
          console.log("One of inserted media doesn't pass requirements. Operation aborted.")
        }
        return undefined // ! One fail = aborted
      }

      try {
        const requestOptions = await this._requestOptionsMethod(`${BASE_API_URL}/production/posts`, {
          Authorization: `Bearer ${this.authToken}`,
          "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
          "Access-Control-Request-Method": "POST"
        })

        if (!requestOptions) return undefined

        const response = await axios.post(
          `${BASE_API_URL}/production/posts`,
          { text: caption, mentions: [], media: preparedMedia.map((media) => ({ type: media.commonType })) },
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
              ...this._getHeaders()
            }
          }
        )
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
      }
      const postId = data?.id
      if (postId) {
        await Promise.all(
          preparedMedia.map((media, i) => this._uploadMedia("PUT", `post/${postId}_${i}.${media.fileExtension}`, media.mimeType, media.mediaData))
        )
        return true
      }
      if (this.verbose) {
        console.log("Post failed. Reason:", data)
      }
      return false // ! Cannot get postId
    },
    createConversation: async (title: string, caption: string, mediaSources: string) => {
      let data: any | undefined = undefined
      let preparedMedia: PostMedia

      const prePrepareMedia = await this._prepareMedia(mediaSources)
      if (prePrepareMedia) {
        preparedMedia = prePrepareMedia
      }

      if (preparedMedia) {
        if (this.verbose) {
          console.log("Inserted media doesn't pass requirements. Operation aborted.")
        }
        throw new Error("Failed getting media data")
      }

      try {
        const requestOptions = await this._requestOptionsMethod(`${BASE_API_URL}/production/conversations`, {
          Authorization: `Bearer ${this.authToken}`,
          "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
          "Access-Control-Request-Method": "POST"
        })

        if (!requestOptions) return undefined

        const response = await axios.post(
          `${BASE_API_URL}/production/posts`,
          { text: caption, title, mentions: [], media: { type: preparedMedia.commonType } },
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
              ...this._getHeaders()
            }
          }
        )
        data = response?.data
      } catch (err: any) {
        data = err?.response?.data
        if (this.verbose) {
          console.log("Post failed. Reason:", data)
        }
        return false // ! Cannot get postId
      }
      const postId = data?.id
      if (postId) {
        await this._uploadMedia("PUT", `conversation/${postId}.${preparedMedia.fileExtension}`, preparedMedia.mimeType, preparedMedia.mediaData)
        return true
      }
    },
    deletePost: async (postId: string) => {
      const postData = await this.getPost(postId)
      const objectId = postData?.activity.object?.id
      if (!objectId) return undefined //! Post not found
      let data: any | undefined = undefined
      try {
        const requestUrl = `${BASE_API_URL}/production/posts/${objectId}`
        const requestOptions = await this._requestOptionsMethod(requestUrl, {
          Authorization: `Bearer ${this.authToken}`,
          "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
          "Access-Control-Request-Method": "DELETE"
        })

        if (!requestOptions) return undefined

        const response = await axios.delete(requestUrl, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        })
        return true
      } catch (err: any) {
        return false
      }
    },
    deleteConversation: async (postId: string) => {
      const postData = await this.getPost(postId)
      const objectId = postData?.activity.object?.id
      if (!objectId) return undefined //! Post not found
      try {
        const requestUrl = `${BASE_API_URL}/production/conversations/${objectId}`
        const requestOptions = await this._requestOptionsMethod(requestUrl, {
          Authorization: `Bearer ${this.authToken}`,
          "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
          "Access-Control-Request-Method": "DELETE"
        })

        if (!requestOptions) return undefined

        const response = await axios.delete(requestUrl, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...this._getHeaders()
          }
        })
        if (response) return true
        return false
      } catch (err: any) {
        return false
      }
    }
  }

  getUserIDFromURL = (url: string) => {
    url = cleanUrl(url)
    const splitUrl = `${url}/`.match(/\/profile\/(.*?)\//)
    if (splitUrl && splitUrl[1]) return splitUrl[1]
    return null
  }

  getUserIDFromUsername = async (username: string) => {
    let listUser: User[] = []
    const search = await this._searchUserByUsername(username)
    listUser = search?.users?.filter((user: UserData) => user.username && user.username.toLowerCase() == username.toLowerCase()) || []
    if (listUser.length != 1) return { message: "User not found" }
    return { id: listUser[0].id }
  }

  getActivityIDFromURL = (url: string): String | undefined => {
    url = cleanUrl(url)
    const splitUrl = `${url}/`.match(/\/comments\/(.*?)\//)
    if (splitUrl && splitUrl[1]) return splitUrl[1]
    return undefined
  }

  getAccount = async (userId: string) => {
    let data: UserData | ErrorResponse | undefined = undefined
    try {
      const response = await axios.get(`${BASE_API_URL}/production/accounts/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  getProfile = async (userId: string): Promise<UserData | ErrorResponse | undefined> => await this._getProfile(userId)

  getFollowers = async (userId: string, options?: RelationQueryOptions): Promise<Relation | any> => {
    return await this._getRelations(userId, true, options)
  }

  getFollowing = async (userId: string, options?: RelationQueryOptions): Promise<Relation | any> => {
    return await this._getRelations(userId, false, options)
  }

  getPosts = async (userId: string, options?: GetPostOption): Promise<PostQuery | any> => {
    let data: PostsQuery | undefined = undefined
    let streamToken: string | undefined = undefined

    const token = await this._getStreamToken()
    streamToken = (token as Token)?.getStreamToken || undefined
    if (!streamToken) return undefined // ! Cannot get streamToken

    const location = options?.location || "unspecified"
    const limit = options?.limit || 25
    const withOwnReactions = options?.withOwnReactions || true
    const withReactionCounts = options?.withReactionCounts || true

    try {
      const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&withOwnReactions=${withOwnReactions}&withReactionCounts=${withReactionCounts}`
      const response = await axios.get(`${STREAM_API_URL}/enrich/feed/user/${userId}/?${params}`, {
        headers: {
          Authorization: streamToken,
          ...this._getStreamHeaders(),
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  getPost = async (postId: string, options?: GetPostOption): Promise<PostQuery | any> => {
    let data: PostQuery | undefined = undefined
    let streamToken: string | undefined = undefined

    const token = await this._getStreamToken()
    streamToken = (token as Token)?.getStreamToken || undefined
    if (!streamToken) return undefined

    // Set config
    const location = options?.location || "unspecified"
    const limit = options?.limit || 25
    const id_lt = options?.id_lt || ""
    const with_activity_data = options?.with_activity_data || true
    const kind = options?.kind || "COMMENT"

    try {
      const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`
      const response = await axios.get(`${STREAM_API_URL}/reaction/activity_id/${postId}/COMMENT/?${params}`, {
        headers: {
          Authorization: streamToken,
          ...this._getStreamHeaders(),
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }

  /** Not important **/
  getRandomUser = async (limit: number | string = "10") => {
    let data: UserData | ErrorResponse | undefined = undefined
    try {
      const response = await axios.get(`${BASE_API_URL}/production/profile?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...this._getHeaders()
        }
      })
      data = response?.data
    } catch (err: any) {
      data = err?.response?.data
    }
    return data
  }
}

export default RepubliKAPI
