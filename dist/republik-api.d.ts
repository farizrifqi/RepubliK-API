import { PostQuery, PostsQuery, Relation, RelationQueryOptions, GetPostOption, UserData, RelationshipResponse } from "./republik-types";
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
export declare namespace RepubliKAPI {
    type Auth = {
        userId: string;
        authToken: string;
        refreshToken?: string;
        verbose?: boolean;
    };
}
export interface PostMedia {
    mediaData: any;
    mimeType: string;
    commonType: string;
    fileExtension: string;
}
export type ErrorResponse = {
    error: true;
    message: string;
};
export declare class RepubliKAPI {
    authToken: string;
    userId: string;
    refreshToken: string;
    verbose: boolean;
    constructor(opts: RepubliKAPI.Auth);
    setAuthToken: (authToken: string) => void;
    setUserId: (userId: string) => void;
    setRefreshToken: (refreshToken: string) => void;
    getAuthToken: () => string;
    getUserId: () => string;
    getRefreshToken: () => string;
    private _getHeaders;
    private _getStreamHeaders;
    private _getServiceProviderHeaders;
    private _getRelations;
    private _getToken;
    private _getVotes;
    private _searchUserByUsername;
    private _updateProfile;
    private _getFileFromURL;
    private _getFileExtension;
    private _isMIMEUploadable;
    private _prepareMedia;
    private _signMediaUpload;
    private _uploadMedia;
    private _requestOptionsMethod;
    Self: {
        updateProfile: {
            name: (newValue: string) => Promise<any>;
            bio: (newValue: string) => Promise<any>;
            email: (newValue: string) => Promise<any>;
            photo: (mediaSource: string) => Promise<boolean>;
        };
        getProfile: () => Promise<UserData | ErrorResponse | undefined>;
        getVotes: () => Promise<any>;
        getFollowers: (opt?: RelationQueryOptions) => Promise<Relation | ErrorResponse | undefined>;
        getFollowing: (opt?: RelationQueryOptions) => Promise<Relation | ErrorResponse | undefined>;
        getPosts: (opt?: GetPostOption) => Promise<PostsQuery | undefined>;
        getTimeline: (opt?: GetPostOption) => Promise<PostsQuery | undefined>;
        follow: (userId: string) => Promise<RelationshipResponse | undefined>;
        unfollow: (userId: string) => Promise<RelationshipResponse | undefined>;
        block: (userId: string) => Promise<RelationshipResponse | undefined>;
        unblock: (userId: string) => Promise<RelationshipResponse | undefined>;
        like: (postId: string) => Promise<void>;
        dislike: (postId: string) => Promise<any>;
        comment: (commentText: string, postId: string, mentions?: string[]) => Promise<void>;
        uncomment: (postId: string, commentId: string) => Promise<any>;
        post: (caption: string, mediaSources: string[]) => Promise<boolean>;
        delete: (postId: string) => Promise<boolean>;
    };
    getUserIDFromURL: (url: string) => string;
    getUserIDFromUsername: (username: string) => Promise<{
        message: string;
        id?: undefined;
    } | {
        id: string;
        message?: undefined;
    }>;
    getActivityIDFromURL: (url: string) => String | undefined;
    getAccount: (userId: string) => Promise<UserData | ErrorResponse>;
    getProfile: getProfile<UserData | ErrorResponse | undefined>;
    getFollowers: getFollowers<Relation | ErrorResponse | undefined>;
    getFollowing: getFollowing<Relation | ErrorResponse | undefined>;
    getPosts: getPosts<PostsQuery | undefined>;
    getPost: getPost<PostQuery | undefined>;
    refreshAccessToken: () => Promise<ErrorResponse | any>;
}
export default RepubliKAPI;
