export interface RelationQueryOptions {
    userId?: string,
    q?: string,
    lastKey?: string,
    startAt?: string
}

export interface PostsQuery {
    duration?: string,
    next?: string,
    results: Post[]
}

export interface PostQuery {
    duration?: string,
    next?: string,
    activity: Post,
    results: any
}

export interface Video {
    id: string,
    preview: string,
    source: string,
    thumbnailSmall: string
}

export interface Participant {
    user: UserData,
    video: Video,
    description: String,
    id: string,
    activity_id: string,
    commentsCount: number,
    votesCount: number
}

export interface StartCondition {
    contest: string,
    createdAt: number,
    id: string
}

export interface Creator {
    user: UserData,
    video: Video
}

export interface ChallangeQueryResponse {
    last_key: string,
    results: Challenge,
    startAtCondition: StartCondition
}

export interface Challenge {
    activity_id: string,
    category: string,
    commentsCount: number,
    creator: Participant,
    description: String,
    endDate: number,
    hideVotesCount: boolean,
    id: string,
    name: string,
    participants: Participant[]
    status: string,
}

export interface ReactionCounts {
    like: number
}

export interface LatestReaction {
    like: any
}

export interface LatestReactionExtra {
    like: Activity[]
}

export interface Activity {
    activity_id: string,
    children_counts: any,
    created_at: string,
    data: any,
    id: string,
    kind: string,
    latest_children: any,
    parent: string,
    target_feeds: string[],
    updated_at: string,
    user: User,
    user_id: string
}

export interface PostData {
    avatar: string,
    caption: string,
    created_at: string,
    id: string,
    updated_at: string,
    imageAspectRatio: number,
    imageUrl: string,
    isDiscoverable: boolean,
    mediainterface: string,
    mentions: any[],
    replies: any[],
    tags: string,
    title: string,
    userId: string,
    username: string
}

export interface PostObject {
    collection: string,
    created_at: string,
    foreign_id: string,
    id: string,
    updated_at: string,
    data: PostData
}

export interface Post {
    actor: User,
    foreign_id: string,
    id: string,
    origin: string | null | undefined,
    own_reactions: any,
    reaction_counts: ReactionCounts,
    latest_reactions: LatestReaction,
    latest_reactions_extra: LatestReactionExtra,
    target: string,
    time: string,
    verb: string,
    to?: any[],
    object: PostObject
}

export interface User {
    created_at: string,
    data: UserData,
    id: string,
    updated_at: string
}

export interface UserData {
    ageConsent?: boolean,
    ageConsentTimestamp?: string,
    badge?: string,
    profileImage?: string,
    avatar?: string,
    createdAt?: string,
    deactivated?: boolean,
    displayName?: string,
    email?: string,
    followerCount?: number,
    followingCount?: number,
    id?: string,
    isAmbassador?: boolean,
    isEmailValidated?: boolean,
    isPhoneValidated?: boolean,
    refUsername?: string,
    interface?: string,
    updatedAt?: string,
    username?: string,
    followStatus?: string,
    xp?: number,
    multiplier?: string,
    bio?: string,
}

export interface Relation {
    users: User[],
    lastKey: string,
    startAt?: string
}

export interface Token {
    getStreamToken: string,
    oneSignalUserIdToken: string,
}

export interface StreamConfig {
    location: string,
    limit: number,
    withOwnReactions?: boolean,
    withReactionCounts?: boolean,
    with_activity_data?: boolean,
    id_lt?: string,
    kind?: string
}
