import { PostQuery, PostsQuery, Relation, RelationQueryOptions, GetPostOption, Token, UserData } from "./republikgg-types";
export interface getFollowers<T extends any> {
    (userId: string, opt?: RelationQueryOptions): Promise<T>;
}
export interface getFollowing<T extends any> {
    (userId: string, opt?: RelationQueryOptions): Promise<T>;
}
export interface getPosts<T extends any> {
    (userId: string, options?: GetPostOption): Promise<T>;
}
export interface getPost<T extends any> {
    (activityId: string, options?: GetPostOption): Promise<T>;
}
export interface getProfile<T extends any> {
    (userId?: string): Promise<T>;
}
export interface getAccount<T extends any> {
    (userId?: string): Promise<T>;
}
export interface _getRelations<T extends any> {
    (userId: string, followers: boolean, q: string, lastKey: string, startAt: string): Promise<T>;
}
export declare namespace RepublikGGAPI {
    type Auth = {
        userId: string;
        authToken: string;
    };
}
export type ErrorResponse = {
    error: true;
    message: string;
};
export declare class RepublikGGAPI {
    authToken: string;
    userId: string;
    constructor(opts: RepublikGGAPI.Auth);
    _getHeaders: () => {
        Accept: string;
        "Accept-Language": string;
        Referer: string;
        "X-Custom-App-Version-Tag": string;
    };
    _getStreamHeaders: () => {
        "Stream-Auth-Type": string;
        "X-Stream-Client": string;
    };
    _getRelations: _getRelations<Relation | ErrorResponse | undefined>;
    _getToken: (userId: string) => Promise<Token | ErrorResponse>;
    _getVotes: () => Promise<any>;
    _searchUserByUsername: (username: string) => Promise<any>;
    _updateProfile: (newValue: string, type: string) => Promise<any>;
    getUserIDFromURL: (url: string) => string;
    getUserIDFromUsername: (username: string) => Promise<{
        message: string;
        id?: undefined;
    } | {
        id: string;
        message?: undefined;
    }>;
    getActivityIDFromURL: (url: string) => String | undefined;
    Self: {
        getProfile: () => Promise<UserData | ErrorResponse | undefined>;
        getVotes: () => Promise<any>;
        getFolowers: (opt?: RelationQueryOptions) => Promise<Relation | ErrorResponse | undefined>;
        getFollowing: (opt?: RelationQueryOptions) => Promise<Relation | ErrorResponse | undefined>;
        getPosts: (opt?: GetPostOption) => Promise<PostsQuery | undefined>;
        getTimeline: (opt?: GetPostOption) => Promise<PostsQuery | undefined>;
        follow: (userId: string) => Promise<void>;
        unfollow: (userId: string) => Promise<void>;
        like: (activityId: string) => Promise<void>;
        comment: (activityId: string, commentText: string, mentions?: string[]) => Promise<void>;
        updateProfile: {
            name: (newValue: string) => Promise<any>;
            bio: (newValue: string) => Promise<any>;
            email: (newValue: string) => Promise<any>;
        };
    };
    getAccount: (userId: string) => Promise<UserData | ErrorResponse>;
    getProfile: getProfile<UserData | ErrorResponse | undefined>;
    getFollowers: getFollowers<Relation | ErrorResponse | undefined>;
    getFollowing: getFollowing<Relation | ErrorResponse | undefined>;
    getPosts: getPosts<PostsQuery | undefined>;
    getPost: getPost<PostQuery | undefined>;
}
export default RepublikGGAPI;