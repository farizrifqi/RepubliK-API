import axios from "axios";
import { API_KEY, BASE_API_URL, STREAM_API_URL } from "./constants";
import {
    PostQuery,
    PostsQuery,
    Relation,
    StreamConfig,
    Token,
    User,
    UserData
} from "./republikgg-types";

const cleanUrl = (url: string): string => {
    url = url.split("?")[0]
    const lastDigit = url[url.length - 1]
    const isURLClean = lastDigit == "?" || lastDigit == "/"
    if (isURLClean) return cleanUrl(url.substring(0, url.length - 1))
    return url
}

export type ErrorResponse = {
    error: true;
    message: string;
};

class RepublikGG {

    authToken: string;
    userId: string;

    constructor(authToken: string, userId: string) {
        this.authToken = authToken;
        this.userId = userId;
    }

    _getHeaders = () => ({
        "Accept": "*/*",
        "Accept-Language": "en-US",
        "Referer": "https://app.republik.gg/",
        "X-Custom-App-Version-Tag": "6.0.2",
    })

    _getStreamHeaders = () => ({
        "Stream-Auth-Type": "jwt",
        "X-Stream-Client": "stream-javascript-client-browser-8.1.0",
    })

    _getRelations = async (userId: string, followers: boolean = false, q: string = "", lastKey: string = "", startAt: string = "") => {
        let data: Relation | ErrorResponse | undefined = undefined;
        try {
            const params = `q=${q}&lastKey=${lastKey}&followers=${followers}&startAt=${startAt}`
            const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}/relations?${params}`, {
                headers: {
                    "Authorization": `Bearer ${this.authToken}`,
                    ...this._getHeaders()
                }
            });
            data = response?.data;
        } catch (err: any) {
            data = err?.response?.data;
        }
        return data;
    }
    _getToken = async (userId: string) => {
        let data: Token | ErrorResponse | undefined = undefined;
        try {
            const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}/tokens`, {
                headers: {
                    "Authorization": `Bearer ${this.authToken}`,
                    ...this._getHeaders()
                }
            });
            data = response?.data;
        } catch (err: any) {
            data = err?.response?.data;
        }
        return data;
    }
    getUserIDFromURL = (url: string) => {
        url = cleanUrl(url);
        const splitUrl = `${url}/`.match(/\/profile\/(.*?)\//);
        if (splitUrl && splitUrl[1]) return splitUrl[1];
        return null;
    }

    getPostIDFromURL = (url: string) => {
        url = cleanUrl(url);
        const splitUrl = `${url}/`.match(/\/comments\/(.*?)\//);
        if (splitUrl && splitUrl[1]) return splitUrl[1];
        return null;
    }

    getAccount = async (userId: string) => {
        let data: UserData | ErrorResponse | undefined = undefined;
        try {
            const response = await axios.get(`${BASE_API_URL}/production/accounts/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${this.authToken}`,
                    ...this._getHeaders()
                }
            });
            data = response?.data;
        } catch (err: any) {
            data = err?.response?.data;
        }
        return data;
    }

    getProfile = async (userId: string) => {
        let data: UserData | ErrorResponse | undefined = undefined;
        try {
            const response = await axios.get(`${BASE_API_URL}/production/profile/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${this.authToken}`,
                    ...this._getHeaders()
                }
            });
            data = response?.data;
        } catch (err: any) {
            data = err?.response?.data;
        }
        return data;
    }

    getFollowers = async (userId: string, q: string = "", lastKey: string = "", startAt: string = "") => {
        const response = await this._getRelations(userId, true, q, lastKey, startAt);
        return response;
    }

    getFollowing = async (userId: string, q: string = "", lastKey: string = "", startAt: string = "") => {
        const response = await this._getRelations(userId, false, q, lastKey, startAt);
        return response;
    }

    getPosts = async (userId: string, options?: StreamConfig) => {

        let data: PostsQuery | undefined = undefined;
        let streamToken: string | undefined = undefined;

        const token = await this._getToken(this.userId);
        streamToken = (token as Token)?.getStreamToken || undefined;
        if (!streamToken) return false;

        // Set config
        const location = options?.location || "unspecified";
        const limit = options?.limit || 25;
        const withOwnReactions = options?.withOwnReactions || true;
        const withReactionCounts = options?.withReactionCounts || true;

        try {
            const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&withOwnReactions=${withOwnReactions}&withReactionCounts=${withReactionCounts}`;
            const response = await axios.get(`${STREAM_API_URL}/enrich/feed/user/${userId}/?${params}`, {
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

    getPost = async (postId: string, options?: StreamConfig) => {

        let data: PostQuery | undefined = undefined;
        let streamToken: string | undefined = undefined;

        const token = await this._getToken(this.userId);
        streamToken = (token as Token)?.getStreamToken || undefined;
        if (!streamToken) return false;

        // Set config
        const location = options?.location || "unspecified";
        const limit = options?.limit || 25;
        const id_lt = options?.id_lt || "";
        const with_activity_data = options?.with_activity_data || true;
        const kind = options?.kind || "COMMENT";

        try {
            const params = `api_key=${API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`;
            const response = await axios.get(`${STREAM_API_URL}/reaction/activity_id/${postId}/COMMENT/?${params}`, {
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

}

export default RepublikGG;