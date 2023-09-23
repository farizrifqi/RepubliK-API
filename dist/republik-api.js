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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepubliKAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
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
        this._getHeaders = () => ({
            "Accept": "*/*",
            "Accept-Language": "en-US",
            "Referer": "https://app.republik.gg/",
            "X-Custom-App-Version-Tag": "6.0.2",
        });
        this._getStreamHeaders = () => ({
            "Stream-Auth-Type": "jwt",
            "X-Stream-Client": "stream-javascript-client-browser-8.1.0",
        });
        this._getRelations = (userId, followers = false, q = "", lastKey = "", startAt = "") => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let data = undefined;
            try {
                const params = `q=${q}&lastKey=${lastKey}&followers=${followers}&startAt=${startAt}`;
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/${userId}/relations?${params}`, {
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
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
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
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
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
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
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
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
            let current = yield this.Self.getProfile();
            const defaultPayload = {
                displayName: type == "name" ? newValue : current === null || current === void 0 ? void 0 : current.displayName,
                email: type == "email" ? newValue : current === null || current === void 0 ? void 0 : current.email,
                bio: type == "bio" ? newValue : current === null || current === void 0 ? void 0 : current.bio,
                username: current === null || current === void 0 ? void 0 : current.username,
            };
            try {
                const response = yield axios_1.default.put(`${constants_1.BASE_API_URL}/production/profile/${this.userId}/`, defaultPayload, {
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                });
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                return (_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.data;
            }
        });
        this.getUserIDFromURL = (url) => {
            url = cleanUrl(url);
            const splitUrl = `${url}/`.match(/\/profile\/(.*?)\//);
            if (splitUrl && splitUrl[1])
                return splitUrl[1];
            return null;
        };
        this.getUserIDFromUsername = (username) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            let listUser = [];
            const search = yield this._searchUserByUsername(username);
            listUser = ((_f = search === null || search === void 0 ? void 0 : search.users) === null || _f === void 0 ? void 0 : _f.filter((user) => (user.username && user.username.toLowerCase() == username.toLowerCase()))) || [];
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
        this.Self = {
            getProfile: () => __awaiter(this, void 0, void 0, function* () { return (yield this.getProfile(this.userId)); }),
            getVotes: () => __awaiter(this, void 0, void 0, function* () { return (yield this._getVotes()); }),
            getFolowers: (opt) => __awaiter(this, void 0, void 0, function* () { return (yield this.getFollowers(this.userId, opt)); }),
            getFollowing: (opt) => __awaiter(this, void 0, void 0, function* () { return (yield this.getFollowing(this.userId, opt)); }),
            getPosts: (opt) => __awaiter(this, void 0, void 0, function* () { return (yield this.getPosts(this.userId, opt)); }),
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
                        headers: Object.assign(Object.assign({ "Authorization": streamToken }, this._getStreamHeaders()), this._getHeaders())
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
                        headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
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
                        headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_j = err === null || err === void 0 ? void 0 : err.response) === null || _j === void 0 ? void 0 : _j.data;
                }
                return data;
            }),
            like: (activityId) => __awaiter(this, void 0, void 0, function* () {
                var _k;
                let data = undefined;
                try {
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/activity-likes`, { activityId }, {
                        headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_k = err === null || err === void 0 ? void 0 : err.response) === null || _k === void 0 ? void 0 : _k.data;
                }
                return data;
            }),
            comment: (activityId, commentText, mentions = []) => __awaiter(this, void 0, void 0, function* () {
                var _l;
                let data = undefined;
                try {
                    const requestData = {
                        comment: commentText,
                        mentions: mentions,
                        reactionTargetId: activityId
                    };
                    const response = yield axios_1.default.post(`${constants_1.BASE_API_URL}/production/activity-comments/${activityId}`, requestData, {
                        headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                    });
                    data = response === null || response === void 0 ? void 0 : response.data;
                }
                catch (err) {
                    data = (_l = err === null || err === void 0 ? void 0 : err.response) === null || _l === void 0 ? void 0 : _l.data;
                }
                return data;
            }),
            updateProfile: {
                name: (newValue) => __awaiter(this, void 0, void 0, function* () { return (this._updateProfile(newValue, "name")); }),
                bio: (newValue) => __awaiter(this, void 0, void 0, function* () { return (this._updateProfile(newValue, "bio")); }),
                email: (newValue) => __awaiter(this, void 0, void 0, function* () { return (this._updateProfile(newValue, "email")); })
            }
        };
        this.getAccount = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _m;
            let data = undefined;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/accounts/${userId}`, {
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_m = err === null || err === void 0 ? void 0 : err.response) === null || _m === void 0 ? void 0 : _m.data;
            }
            return data;
        });
        this.getProfile = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _o;
            let data = undefined;
            try {
                const response = yield axios_1.default.get(`${constants_1.BASE_API_URL}/production/profile/${userId}`, {
                    headers: Object.assign({ "Authorization": `Bearer ${this.authToken}` }, this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_o = err === null || err === void 0 ? void 0 : err.response) === null || _o === void 0 ? void 0 : _o.data;
            }
            return data;
        });
        this.getFollowers = (userId, opt) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._getRelations(userId, true, opt.q, opt.lastKey, opt.startAt);
            return response;
        });
        this.getFollowing = (userId, opt) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._getRelations(userId, false, opt.q, opt.lastKey, opt.startAt);
            return response;
        });
        this.getPosts = (userId, options) => __awaiter(this, void 0, void 0, function* () {
            var _p;
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
                    headers: Object.assign(Object.assign({ "Authorization": streamToken }, this._getStreamHeaders()), this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_p = err === null || err === void 0 ? void 0 : err.response) === null || _p === void 0 ? void 0 : _p.data;
            }
            return data;
        });
        this.getPost = (activityId, options) => __awaiter(this, void 0, void 0, function* () {
            var _q;
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
                const response = yield axios_1.default.get(`${constants_1.STREAM_API_URL}/reaction/activity_id/${activityId}/COMMENT/?${params}`, {
                    headers: Object.assign(Object.assign({ "Authorization": streamToken }, this._getStreamHeaders()), this._getHeaders())
                });
                data = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                data = (_q = err === null || err === void 0 ? void 0 : err.response) === null || _q === void 0 ? void 0 : _q.data;
            }
            return data;
        });
        this.authToken = opts.authToken;
        this.userId = opts.userId;
    }
}
exports.RepubliKAPI = RepubliKAPI;
exports.default = RepubliKAPI;
