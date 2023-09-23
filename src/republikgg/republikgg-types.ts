export type PostsQuery = {
    duration?: string,
    next?: string,
    results: Post[]
}
export type PostQuery = {
    duration?: string,
    next?: string,
    activity: Post,
    results: any
}

export type ReactionCounts = {
    like: number
}

export type LatestReaction = {
    like: any
}

export type LatestReactionExtra = {
    like: Activity[]
}

export type Activity = {
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

export type PostData = {
    avatar: string,
    caption: string,
    created_at: string,
    id: string,
    updated_at: string,
    imageAspectRatio: number,
    imageUrl: string,
    isDiscoverable: boolean,
    mediaType: string,
    mentions: any[],
    replies: any[],
    tags: string,
    title: string,
    userId: string,
    username: string
}

export type PostObject = {
    collection: string,
    created_at: string,
    foreign_id: string,
    id: string,
    updated_at: string,
    data: PostData
}

export type Post = {
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

export type User = {
    created_at: string,
    data: UserData,
    id: string,
    updated_at: string
}

export type UserData = {
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
    type?: string,
    updatedAt?: string,
    username?: string,
    followStatus?: string,
    xp?: number,
    multiplier?: string,
}

export type Relation = {
    users: User[],
    lastKey: string,
    startAt?: string
}

export type Token = {
    getStreamToken: string,
    oneSignalUserIdToken: string,
}

export type StreamConfig = {
    location: string,
    limit: number,
    withOwnReactions?: boolean,
    withReactionCounts?: boolean,
    with_activity_data?: boolean,
    id_lt?: string,
    kind?: string
}