import axios from "axios"
import { API_KEY, BASE_API_URL, CLIENT_ID, SERVICE_PROVIDER_URl, STREAM_API_URL } from "./constants"
import { PostQuery, PostsQuery, Relation, RelationQueryOptions, GetPostOption, Token, User, UserData } from "./republik-types"

const cleanUrl = (url: string): string => {
  url = url.split("?")[0]
  const lastDigit = url[url.length - 1]
  const isURLClean = lastDigit == "?" || lastDigit == "/"
  if (isURLClean) return cleanUrl(url.substring(0, url.length - 1))
  return url
}

export interface getFollowers<T extends any> {
  (userId: string, opt?: RelationQueryOptions): Promise<T>
}

export interface getFollowing<T extends any> {
  (userId: string, opt?: RelationQueryOptions): Promise<T>
}

export interface getPosts<T extends any> {
  (userId: string, options?: GetPostOption): Promise<T>
}

export interface getPost<T extends any> {
  (activityId: string, options?: GetPostOption): Promise<T>
}

export interface getProfile<T extends any> {
  (userId?: string): Promise<T>
}
export interface getAccount<T extends any> {
  (userId?: string): Promise<T>
}

export interface _getRelations<T extends any> {
  (userId: string, followers: boolean, q: string, lastKey: string, startAt: string): Promise<T>
}

export declare namespace RepubliKAPI {
  type Auth = {
    userId: string
    authToken: string
    refreshToken?: string
  }
}

export type ErrorResponse = {
  error: true
  message: string
}

export class RepubliKAPI {
  authToken: string
  userId: string
  refreshToken: string

  constructor(opts: RepubliKAPI.Auth) {
    this.authToken = opts.authToken
    this.userId = opts.userId || ""
    this.refreshToken = opts.refreshToken || ""
  }

  setAuthToken = (authToken: string) => {
    this.authToken = authToken
  }

  setUserId = (userId: string) => {
    this.userId = userId
  }

  setRefreshToken = (refreshToken: string) => {
    this.refreshToken = refreshToken
  }

  getAuthToken = () => {
    return this.authToken
  }

  getUserId = () => {
    return this.userId
  }

  getRefreshToken = () => {
    return this.refreshToken
  }

  _getHeaders = () => ({
    Accept: "*/*",
    "Accept-Language": "en-US",
    Referer: "https://app.republik.gg/",
    "X-Custom-App-Version-Tag": "6.0.2"
  })

  _getStreamHeaders = () => ({
    "Stream-Auth-Type": "jwt",
    "X-Stream-Client": "stream-javascript-client-browser-8.1.0"
  })

  _getServiceProviderHeaders = () => ({
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-User-Agent": "aws-amplify/5.0.4 js",
    "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
  })

  _getRelations: _getRelations<Relation | ErrorResponse | undefined> = async (userId, followers = false, q = "", lastKey = "", startAt = "") => {
    let data: Relation | ErrorResponse | undefined = undefined
    try {
      const params = `q=${q}&lastKey=${lastKey}&followers=${followers}&startAt=${startAt}`
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

  _getToken = async (userId: string) => {
    let data: Token | ErrorResponse | undefined = undefined
    try {
      const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}/tokens`, {
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

  _getVotes = async () => {
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

  _searchUserByUsername = async (username: string) => {
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
  _updateProfile = async (newValue: string, type: string): Promise<any> => {
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

  Self = {
    getProfile: async (): Promise<UserData | ErrorResponse | undefined> => await this.getProfile(this.userId),
    getVotes: async (): Promise<any> => await this._getVotes(),
    getFollowers: async (opt?: RelationQueryOptions): Promise<Relation | ErrorResponse | undefined> => await this.getFollowers(this.userId, opt),
    getFollowing: async (opt?: RelationQueryOptions): Promise<Relation | ErrorResponse | undefined> => await this.getFollowing(this.userId, opt),
    getPosts: async (opt?: GetPostOption): Promise<PostsQuery | undefined> => await this.getPosts(this.userId, opt),
    getTimeline: async (opt?: GetPostOption): Promise<PostsQuery | undefined> => {
      let data: PostsQuery | undefined = undefined
      let streamToken: string | undefined = undefined

      const token = await this._getToken(this.userId)
      streamToken = (token as Token)?.getStreamToken || undefined
      if (!streamToken) return undefined

      const location = opt?.location || "unspecified"
      const limit = opt?.limit || 25
      const id_lt = opt?.id_lt || ""
      const with_activity_data = opt?.with_activity_data || true
      const kind = opt?.kind || "COMMENT"

      try {
        const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`
        const response = await axios.get(`${STREAM_API_URL}/enrich/feed/timeline/${this.userId}/?${params}`, {
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
    follow: async (userId: string): Promise<void> => {
      let data: any | undefined = undefined
      try {
        const response = await axios.post(
          `${BASE_API_URL}/production/profile/${userId}/followers`,
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
    },
    unfollow: async (userId: string): Promise<void> => {
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
    },
    like: async (activityId: string): Promise<void> => {
      let data: any | undefined = undefined
      try {
        const response = await axios.post(
          `${BASE_API_URL}/production/activity-likes`,
          { activityId },
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
    comment: async (activityId: string, commentText: string, mentions: string[] = []): Promise<void> => {
      let data: any | undefined = undefined
      try {
        const requestData = {
          comment: commentText,
          mentions: mentions,
          reactionTargetId: activityId
        }

        const response = await axios.post(`${BASE_API_URL}/production/activity-comments/${activityId}`, requestData, {
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
    updateProfile: {
      name: async (newValue: string): Promise<any> => this._updateProfile(newValue, "name"),
      bio: async (newValue: string): Promise<any> => this._updateProfile(newValue, "bio"),
      email: async (newValue: string): Promise<any> => this._updateProfile(newValue, "email")
    }
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

  getProfile: getProfile<UserData | ErrorResponse | undefined> = async (userId) => {
    let data: UserData | ErrorResponse | undefined = undefined
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

  getFollowers: getFollowers<Relation | ErrorResponse | undefined> = async (userId, opt) => {
    const response = await this._getRelations(userId, true, opt?.q, opt?.lastKey, opt?.startAt)
    return response
  }

  getFollowing: getFollowing<Relation | ErrorResponse | undefined> = async (userId, opt) => {
    const response = await this._getRelations(userId, true, opt?.q, opt?.lastKey, opt?.startAt)
    return response
  }

  getPosts: getPosts<PostsQuery | undefined> = async (userId, options) => {
    let data: PostsQuery | undefined = undefined
    let streamToken: string | undefined = undefined

    const token = await this._getToken(this.userId)
    streamToken = (token as Token)?.getStreamToken || undefined
    if (!streamToken) return undefined

    // Set config
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

  getPost: getPost<PostQuery | undefined> = async (activityId, options) => {
    let data: PostQuery | undefined = undefined
    let streamToken: string | undefined = undefined

    const token = await this._getToken(this.userId)
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
      const response = await axios.get(`${STREAM_API_URL}/reaction/activity_id/${activityId}/COMMENT/?${params}`, {
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
  refreshAccessToken = async (): Promise<ErrorResponse | any> => {
    if (!this.refreshToken) return { error: true, message: "refreshToken not set" } as ErrorResponse
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
          headers: { ...this._getServiceProviderHeaders() }
        }
      )
      if (response?.data?.AuthenticationResult?.IdToken) {
        return { newToken: response.data.AuthenticationResult.IdToken }
      }
      return response?.data
    } catch (err: any) {
      return err?.response?.data
    }
  }

  /*
    dislike = async (postId: string) => {
    
        let data: any | undefined = undefined;
        let streamToken: string | undefined = undefined;
    
        const token = await this._getToken(this.userId);
        streamToken = (token as Token)?.getStreamToken || undefined;
        if (!streamToken) return false;
    
        try {
            const params = `api_key=${API_KEY}&location=unspecified`;
            const response = await axios.delete(`${STREAM_API_URL}/reaction/${postId}/?${params}`, {
                headers: {
                    "Authorization": streamToken,
                    ...this._getStreamHeaders(),
                    ...this._getHeaders()
                }
            });
            data = response?.data;
        } catch (err: any) {
            data = err?.response?.data;
        }
        return data;
    }
    */
}

export default RepubliKAPI
