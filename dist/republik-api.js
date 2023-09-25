"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepubliKAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const fs_1 = __importDefault(require("fs"));
const mime_1 = __importDefault(require("mime"));
const cleanUrl = (url) => {
    url = url.split("?")[0];
    const lastDigit = url[url.length - 1];
    const isURLClean = lastDigit == "?" || lastDigit == "/";
    if (isURLClean)
        return cleanUrl(url.substring(0, url.length - 1));
    return url;
};
class RepubliKAPI {
    constructor(opts) {
        this.setAuthToken = (authToken) => {
            this.authToken = authToken;
        };
        this.setUserId = (userId) => {
            this.userId = userId;
        };
        this.setRefreshToken = (refreshToken) => {
            this.refreshToken = refreshToken;
        };
        this.getAuthToken = () => {
            return this.authToken;
        };
        this.getUserId = () => {
            return this.userId;
        };
        this.getRefreshToken = () => {
            return this.refreshToken;
        };
        this._getHeaders = () => ({
            Accept: "*/*",
            "Accept-Language": "en-US",
            Referer: "https://app.republik.gg/",
            "X-Custom-App-Version-Tag": "6.0.2"
        });
        this._getStreamHeaders = () => ({
            "Stream-Auth-Type": "jwt",
            "X-Stream-Client": "stream-javascript-client-browser-8.1.0"
        });
        this._getServiceProviderHeaders = () => ({
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-User-Agent": "aws-amplify/5.0.4 js",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
        });
        this._getRelations = (userId, followers = false, q = "", lastKey = "", startAt = "") => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let data = undefined;
            try {
                const params = `q=${q}&lastKey=${lastKey}&followers=${followers}&startAt=${startAt}`;
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/${userId}/relations?${params}`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data;
            }
            return data;
        });
        this._getToken = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            let data = undefined;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/${userId}/tokens`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data;
            }
            return data;
        });
        this._getVotes = () => __awaiter(this, void 0, void 0, function* () {
            var _c;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/remaining-votes/${this.userId}`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                return (_c = err === null || err === void 0 ? void 0 : err.response) === null || _c === void 0 ? void 0 : _c.data;
            }
        });
        this._searchUserByUsername = (username) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            let data = [];
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/mentions-autocomplete?q=${username.toLowerCase()}`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_d = err === null || err === void 0 ? void 0 : err.response) === null || _d === void 0 ? void 0 : _d.data;
            }
            return data;
        });
        this._updateProfile = (newValue, type) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            let current = (yield this.Self.getProfile());
            const defaultPayload = {
                displayName: type == "name" ? newValue : current === null || current === void 0 ? void 0 : current.displayName,
                email: type == "email" ? newValue : current === null || current === void 0 ? void 0 : current.email,
                bio: type == "bio" ? newValue : current === null || current === void 0 ? void 0 : current.bio,
                username: current === null || current === void 0 ? void 0 : current.username
            };
            try {
                const response = yield axios_1.default.put(`${constants_1.BASE_API_URL}/production/profile/${this.userId}/`, defaultPayload, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                return (_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.data;
            }
        });
        this._getFileFromURL = (url) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
                return response;
            }
            catch (err) {
                return undefined;
            }
        });
        this._getFileExtension = (fileSource) => {
            fileSource = fileSource.toLowerCase();
            if (fileSource.includes(".jpg"))
                return "jpg";
            if (fileSource.includes(".jpeg"))
                return "jpeg";
            if (fileSource.includes(".png"))
                return "png";
            return undefined;
        };
        this._isMIMEUploadable = (mimeType) => mimeType.includes("image") || mimeType.includes("video");
        this._prepareMedia = (fileSource) => __awaiter(this, void 0, void 0, function* () {
            let mimeType;
            let mediaData;
            let fileExtension = this._getFileExtension(fileSource);
            if (!fileExtension) {
                if (this.verbose) {
                    console.log(`Unknown file extension. Currently supports JPG, JPEG, PNG`);
                }
                return undefined;
            }
            const fileLocation = fileSource.toLowerCase().includes("http") ? "url" : "local";
            if (fileLocation == "url") {
                const getImage = yield this._getFileFromURL(fileSource);
                if (getImage === null || getImage === void 0 ? void 0 : getImage.headers["content-type"]) {
                    mimeType = getImage === null || getImage === void 0 ? void 0 : getImage.headers["content-type"];
                    if (!this._isMIMEUploadable(mimeType)) {
                        if (this.verbose) {
                            console.log(`File type is not supported. ${fileSource}`);
                        }
                        return undefined;
                    }
                    mediaData = Buffer.from(getImage.data, "binary");
                }
                else {
                    if (this.verbose) {
                        console.log(`Cannot get MIME type. ${fileSource}`);
                    }
                    return undefined;
                }
            }
            else {
                mediaData = fs_1.default.readFileSync(fileSource);
                mimeType = mime_1.default.getType(fileSource);
                if (!this._isMIMEUploadable(mimeType)) {
                    if (this.verbose) {
                        console.log(`Cannot get MIME type. ${fileSource}`);
                    }
                    return undefined;
                }
            }
            let commonType = mimeType.includes("image") ? "image" : "video";
            return { mediaData, mimeType, commonType, fileExtension };
        });
        this._signMediaUpload = (action, path, contentType) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            let data = undefined;
            try {
                const requestOptions = yield this._requestOptionsMethod(`${constants_1.BASE_API_URL}/production/storage/sign`, {
                    Authorization: `Bearer ${this.authToken}`,
                    "Access-Control-Request-Headers": "access-control-allow-origin,content-type",
                    "Access-Control-Request-Method": "PUT"
                });
                if (!requestOptions)
                    return undefined;
                const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/storage/sign`, { action, contentType, filePath: path }, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_f = err === null || err === void 0 ? void 0 : err.response) === null || _f === void 0 ? void 0 : _f.data;
            }
            return data;
        });
        this._uploadMedia = (method, path, contentType, mediaData) => __awaiter(this, void 0, void 0, function* () {
            try {
                const signUrl = yield this._signMediaUpload(method, path, contentType);
                yield axios_1.default.request({
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
                });
                yield axios_1.default.request({
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
                });
                return true;
            }
            catch (err) {
                if (this.verbose) {
                    console.log(err);
                }
                return false;
            }
        });
        this._requestOptionsMethod = (url, headers) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield axios_1.default.options(url, { headers });
                return true;
            }
            catch (err) {
                if (this.verbose) {
                    console.log("Error request OPTIONS to " + url);
                    console.log(err);
                }
                return null;
            }
        });
        this.Self = {
            updateProfile: {
                name: (newValue) => __awaiter(this, void 0, void 0, function* () { return this._updateProfile(newValue, "name"); }),
                bio: (newValue) => __awaiter(this, void 0, void 0, function* () { return this._updateProfile(newValue, "bio"); }),
                email: (newValue) => __awaiter(this, void 0, void 0, function* () { return this._updateProfile(newValue, "email"); }),
                photo: (mediaSource) => __awaiter(this, void 0, void 0, function* () {
                    const media = yield this._prepareMedia(mediaSource);
                    if (!media)
                        return false;
                    if (media.commonType != "image") {
                        if (this.verbose) {
                            console.log(`Media file not supported. IMAGE only.`);
                        }
                        return false;
                    }
                    return yield this._uploadMedia("PUT", `avatar/avatar.${media.fileExtension}`, media.mimeType, media.mediaData);
                })
            },
            getProfile: () => __awaiter(this, void 0, void 0, function* () { return yield this.getProfile(this.userId); }),
            getVotes: () => __awaiter(this, void 0, void 0, function* () { return yield this._getVotes(); }),
            getFollowers: (opt) => __awaiter(this, void 0, void 0, function* () { return yield this.getFollowers(this.userId, opt); }),
            getFollowing: (opt) => __awaiter(this, void 0, void 0, function* () { return yield this.getFollowing(this.userId, opt); }),
            getPosts: (opt) => __awaiter(this, void 0, void 0, function* () { return yield this.getPosts(this.userId, opt); }),
            getTimeline: (opt) => __awaiter(this, void 0, void 0, function* () {
                var _g;
                let data = undefined;
                let streamToken = undefined;
                const token = yield this._getToken(this.userId);
                streamToken = (token === null || token === void 0 ? void 0 : token.getStreamToken) || undefined;
                if (!streamToken)
                    return undefined;
                const location = (opt === null || opt === void 0 ? void 0 : opt.location) || "unspecified";
                const limit = (opt === null || opt === void 0 ? void 0 : opt.limit) || 25;
                const id_lt = (opt === null || opt === void 0 ? void 0 : opt.id_lt) || "";
                const with_activity_data = (opt === null || opt === void 0 ? void 0 : opt.with_activity_data) || true;
                const kind = (opt === null || opt === void 0 ? void 0 : opt.kind) || "COMMENT";
                try {
                    const params = `api_key=${constants_1.API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`;
                    const response = yield axios_1.default.get(`${constants_1.STREAM_API_URL}/enrich/feed/timeline/${this.userId}/?${params}`, {
                        headers: Object.assign(Object.assign({ Authorization: streamToken }, this._getStreamHeaders()), this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_g = err === null || err === void 0 ? void 0 : err.response) === null || _g === void 0 ? void 0 : _g.data;
                }
                return data;
            }),
            follow: (userId) => __awaiter(this, void 0, void 0, function* () {
                var _h;
                let data = undefined;
                try {
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/profile/${userId}/followers`, {}, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_h = err === null || err === void 0 ? void 0 : err.response) === null || _h === void 0 ? void 0 : _h.data;
                }
                return data;
            }),
            unfollow: (userId) => __awaiter(this, void 0, void 0, function* () {
                var _j;
                let data = undefined;
                try {
                    const response = yield axios_1.default.delete(`${constants_1.BASE_API_URL}/production/profile/${userId}/followers`, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_j = err === null || err === void 0 ? void 0 : err.response) === null || _j === void 0 ? void 0 : _j.data;
                }
                return data;
            }),
            block: (userId) => __awaiter(this, void 0, void 0, function* () {
                var _k;
                const requestURL = `${constants_1.BASE_API_URL}/production/profile/${userId}/block`;
                let data = undefined;
                const requestOptions = yield this._requestOptionsMethod(requestURL, {
                    "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
                    "Access-Control-Request-Method": "POST"
                });
                if (!requestOptions)
                    return undefined;
                try {
                    const response = yield axios_1.default.post(requestURL, {}, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_k = err === null || err === void 0 ? void 0 : err.response) === null || _k === void 0 ? void 0 : _k.data;
                }
                return data;
            }),
            unblock: (userId) => __awaiter(this, void 0, void 0, function* () {
                var _l;
                let data = undefined;
                try {
                    const response = yield axios_1.default.delete(`${constants_1.BASE_API_URL}/production/profile/${userId}/unblock`, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_l = err === null || err === void 0 ? void 0 : err.response) === null || _l === void 0 ? void 0 : _l.data;
                }
                return data;
            }),
            like: (postId) => __awaiter(this, void 0, void 0, function* () {
                var _m;
                let data = undefined;
                try {
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/activity-likes`, { postId }, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_m = err === null || err === void 0 ? void 0 : err.response) === null || _m === void 0 ? void 0 : _m.data;
                }
                return data;
            }),
            dislike: (postId) => __awaiter(this, void 0, void 0, function* () {
                var _o, _p;
                const postData = yield this.getPost(postId);
                const reactionList = (_o = postData === null || postData === void 0 ? void 0 : postData.activity.latest_reactions) === null || _o === void 0 ? void 0 : _o.like;
                if (!reactionList)
                    return undefined;
                const selectedReaction = reactionList.filter((reaction) => reaction.user_id == this.userId);
                if (selectedReaction.length != 1)
                    return undefined;
                const reactionId = selectedReaction[0].id;
                let data = undefined;
                let streamToken = undefined;
                const token = yield this._getToken(this.userId);
                streamToken = (token === null || token === void 0 ? void 0 : token.getStreamToken) || undefined;
                if (!streamToken)
                    return undefined;
                try {
                    const params = `api_key=${constants_1.API_KEY}&location=unspecified`;
                    const fullUrl = `${constants_1.STREAM_API_URL}/reaction/${reactionId}/?${params}`;
                    const requestOptions = yield this._requestOptionsMethod(fullUrl, Object.assign(Object.assign({ Authorization: streamToken }, this._getStreamHeaders()), this._getHeaders()));
                    if (!requestOptions)
                        return undefined;
                    const response = yield axios_1.default.delete(fullUrl, {
                        headers: Object.assign(Object.assign({ Authorization: streamToken }, this._getStreamHeaders()), this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_p = err === null || err === void 0 ? void 0 : err.response) === null || _p === void 0 ? void 0 : _p.data;
                }
                return data;
            }),
            comment: (commentText, postId, mentions = []) => __awaiter(this, void 0, void 0, function* () {
                var _q;
                let data = undefined;
                try {
                    const requestData = {
                        comment: commentText,
                        mentions: mentions,
                        reactionTargetId: postId
                    };
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/activity-comments/${postId}`, requestData, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_q = err === null || err === void 0 ? void 0 : err.response) === null || _q === void 0 ? void 0 : _q.data;
                }
                return data;
            }),
            uncomment: (postId, commentId) => __awaiter(this, void 0, void 0, function* () {
                var _r;
                let data = undefined;
                try {
                    const requestUrl = `${constants_1.BASE_API_URL}/production/activity-comments/${postId}/comments/${commentId}`;
                    const requestOptions = yield this._requestOptionsMethod(requestUrl, {
                        Authorization: `Bearer ${this.authToken}`,
                        "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
                        "Access-Control-Request-Method": "DELETE"
                    });
                    if (!requestOptions)
                        return undefined;
                    const response = yield axios_1.default.delete(requestUrl, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    console.log(response);
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_r = err === null || err === void 0 ? void 0 : err.response) === null || _r === void 0 ? void 0 : _r.data;
                }
                return data;
            }),
            post: (caption, mediaSources) => { var _a, mediaSources_1, mediaSources_1_1; return __awaiter(this, void 0, void 0, function* () {
                var _b, e_1, _c, _d;
                var _e;
                if (mediaSources.length == 0 || mediaSources.length > 3) {
                    if (this.verbose) {
                        if (mediaSources.length == 0)
                            console.log(`Media required`);
                        if (mediaSources.length > 3)
                            console.log(`Media maximum is 3`);
                    }
                    return undefined;
                }
                let data = undefined;
                let preparedMedia = [];
                try {
                    for (_a = true, mediaSources_1 = __asyncValues(mediaSources); mediaSources_1_1 = yield mediaSources_1.next(), _b = mediaSources_1_1.done, !_b; _a = true) {
                        _d = mediaSources_1_1.value;
                        _a = false;
                        const source = _d;
                        const prePrepareMedia = yield this._prepareMedia(source);
                        if (prePrepareMedia) {
                            preparedMedia.push(prePrepareMedia);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_a && !_b && (_c = mediaSources_1.return)) yield _c.call(mediaSources_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (preparedMedia.length != mediaSources.length) {
                    if (this.verbose) {
                        console.log("One of inserted media doesn't pass requirements. Operation aborted.");
                    }
                    return undefined;
                }
                try {
                    const requestOptions = yield this._requestOptionsMethod(`${constants_1.BASE_API_URL}/production/posts`, {
                        Authorization: `Bearer ${this.authToken}`,
                        "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
                        "Access-Control-Request-Method": "POST"
                    });
                    if (!requestOptions)
                        return undefined;
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/posts`, { caption, mentions: [], media: preparedMedia.map((media) => ({ type: media.commonType })) }, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.data;
                }
                const postId = data === null || data === void 0 ? void 0 : data.id;
                if (postId) {
                    yield Promise.all(preparedMedia.map((media, i) => this._uploadMedia("PUT", `post/${postId}_${i}.${media.fileExtension}`, media.mimeType, media.mediaData)));
                    return true;
                }
                if (this.verbose) {
                    console.log("Post failed. Reason:", data);
                }
                return false;
            }); },
            delete: (postId) => __awaiter(this, void 0, void 0, function* () {
                var _s;
                const postData = yield this.getPost(postId);
                const objectId = (_s = postData === null || postData === void 0 ? void 0 : postData.activity.object) === null || _s === void 0 ? void 0 : _s.id;
                if (!objectId)
                    return undefined;
                let data = undefined;
                try {
                    const requestUrl = `${constants_1.BASE_API_URL}/production/posts/${objectId}`;
                    const requestOptions = yield this._requestOptionsMethod(requestUrl, {
                        Authorization: `Bearer ${this.authToken}`,
                        "Access-Control-Request-Headers": "authorization,content-type,x-custom-app-version-tag",
                        "Access-Control-Request-Method": "DELETE"
                    });
                    if (!requestOptions)
                        return undefined;
                    const response = yield axios_1.default.delete(requestUrl, {
                        headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    console.log(response);
                    return true;
                }
                catch (err) {
                    return false;
                }
            })
        };
        this.getUserIDFromURL = (url) => {
            url = cleanUrl(url);
            const splitUrl = `${url}/`.match(/\/profile\/(.*?)\//);
            if (splitUrl && splitUrl[1])
                return splitUrl[1];
            return null;
        };
        this.getUserIDFromUsername = (username) => __awaiter(this, void 0, void 0, function* () {
            var _t;
            let listUser = [];
            const search = yield this._searchUserByUsername(username);
            listUser = ((_t = search === null || search === void 0 ? void 0 : search.users) === null || _t === void 0 ? void 0 : _t.filter((user) => user.username && user.username.toLowerCase() == username.toLowerCase())) || [];
            if (listUser.length != 1)
                return { message: "User not found" };
            return { id: listUser[0].id };
        });
        this.getActivityIDFromURL = (url) => {
            url = cleanUrl(url);
            const splitUrl = `${url}/`.match(/\/comments\/(.*?)\//);
            if (splitUrl && splitUrl[1])
                return splitUrl[1];
            return undefined;
        };
        this.getAccount = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _u;
            let data = undefined;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/accounts/${userId}`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_u = err === null || err === void 0 ? void 0 : err.response) === null || _u === void 0 ? void 0 : _u.data;
            }
            return data;
        });
        this.getProfile = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _v;
            let data = undefined;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/${userId}`, {
                    headers: Object.assign({ Authorization: `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_v = err === null || err === void 0 ? void 0 : err.response) === null || _v === void 0 ? void 0 : _v.data;
            }
            return data;
        });
        this.getFollowers = (userId, opt) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._getRelations(userId, true, opt === null || opt === void 0 ? void 0 : opt.q, opt === null || opt === void 0 ? void 0 : opt.lastKey, opt === null || opt === void 0 ? void 0 : opt.startAt);
            return response;
        });
        this.getFollowing = (userId, opt) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._getRelations(userId, true, opt === null || opt === void 0 ? void 0 : opt.q, opt === null || opt === void 0 ? void 0 : opt.lastKey, opt === null || opt === void 0 ? void 0 : opt.startAt);
            return response;
        });
        this.getPosts = (userId, options) => __awaiter(this, void 0, void 0, function* () {
            var _w;
            let data = undefined;
            let streamToken = undefined;
            const token = yield this._getToken(this.userId);
            streamToken = (token === null || token === void 0 ? void 0 : token.getStreamToken) || undefined;
            if (!streamToken)
                return undefined;
            const location = (options === null || options === void 0 ? void 0 : options.location) || "unspecified";
            const limit = (options === null || options === void 0 ? void 0 : options.limit) || 25;
            const withOwnReactions = (options === null || options === void 0 ? void 0 : options.withOwnReactions) || true;
            const withReactionCounts = (options === null || options === void 0 ? void 0 : options.withReactionCounts) || true;
            try {
                const params = `api_key=${constants_1.API_KEY}&location=${location}&limit=${limit}&withOwnReactions=${withOwnReactions}&withReactionCounts=${withReactionCounts}`;
                const response = yield axios_1.default.get(`${constants_1.STREAM_API_URL}/enrich/feed/user/${userId}/?${params}`, {
                    headers: Object.assign(Object.assign({ Authorization: streamToken }, this._getStreamHeaders()), this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_w = err === null || err === void 0 ? void 0 : err.response) === null || _w === void 0 ? void 0 : _w.data;
            }
            return data;
        });
        this.getPost = (postId, options) => __awaiter(this, void 0, void 0, function* () {
            var _x;
            let data = undefined;
            let streamToken = undefined;
            const token = yield this._getToken(this.userId);
            streamToken = (token === null || token === void 0 ? void 0 : token.getStreamToken) || undefined;
            if (!streamToken)
                return undefined;
            const location = (options === null || options === void 0 ? void 0 : options.location) || "unspecified";
            const limit = (options === null || options === void 0 ? void 0 : options.limit) || 25;
            const id_lt = (options === null || options === void 0 ? void 0 : options.id_lt) || "";
            const with_activity_data = (options === null || options === void 0 ? void 0 : options.with_activity_data) || true;
            const kind = (options === null || options === void 0 ? void 0 : options.kind) || "COMMENT";
            try {
                const params = `api_key=${constants_1.API_KEY}&location=${location}&limit=${limit}&with_activity_data=${with_activity_data}&id_lt=${id_lt}&kind=${kind}`;
                const response = yield axios_1.default.get(`${constants_1.STREAM_API_URL}/reaction/activity_id/${postId}/COMMENT/?${params}`, {
                    headers: Object.assign(Object.assign({ Authorization: streamToken }, this._getStreamHeaders()), this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_x = err === null || err === void 0 ? void 0 : err.response) === null || _x === void 0 ? void 0 : _x.data;
            }
            return data;
        });
        this.refreshAccessToken = () => __awaiter(this, void 0, void 0, function* () {
            var _y, _z, _0;
            if (!this.refreshToken)
                return { error: true, message: "refreshToken not set" };
            try {
                const response = yield axios_1.default.post(`${constants_1.SERVICE_PROVIDER_URl}`, {
                    AuthFlow: "REFRESH_TOKEN_AUTH",
                    ClientId: constants_1.CLIENT_ID,
                    AuthParameters: {
                        DEVICE_KEY: null,
                        REFRESH_TOKEN: this.refreshToken
                    }
                }, {
                    headers: Object.assign({}, this._getServiceProviderHeaders())
                });
                if ((_z = (_y = response === null || response === void 0 ? void 0 : response.data) === null || _y === void 0 ? void 0 : _y.AuthenticationResult) === null || _z === void 0 ? void 0 : _z.IdToken) {
                    return { newToken: response.data.AuthenticationResult.IdToken };
                }
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                return (_0 = err === null || err === void 0 ? void 0 : err.response) === null || _0 === void 0 ? void 0 : _0.data;
            }
        });
        this.authToken = opts.authToken;
        this.userId = opts.userId || "";
        this.refreshToken = opts.refreshToken || "";
        this.verbose = opts.verbose || false;
    }
}
exports.RepubliKAPI = RepubliKAPI;
exports.default = RepubliKAPI;
