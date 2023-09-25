"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FollowStatus;
(function (FollowStatus) {
    FollowStatus[FollowStatus["FOLLOWING"] = 0] = "FOLLOWING";
    FollowStatus[FollowStatus["FOLLOW_BACK"] = 1] = "FOLLOW_BACK";
    FollowStatus[FollowStatus["FRIENDS"] = 2] = "FRIENDS";
    FollowStatus[FollowStatus["BLOCKING"] = 3] = "BLOCKING";
    FollowStatus[FollowStatus["BLOCKED"] = 4] = "BLOCKED";
    FollowStatus[FollowStatus["ERROR"] = 5] = "ERROR";
    FollowStatus[FollowStatus["NOT_FOLLOWING"] = 6] = "NOT_FOLLOWING";
    FollowStatus[FollowStatus["LOADING"] = 7] = "LOADING";
    FollowStatus[FollowStatus["NONE"] = 8] = "NONE";
})(FollowStatus || (FollowStatus = {}));
var ReactionType;
(function (ReactionType) {
    ReactionType[ReactionType["like"] = 0] = "like";
    ReactionType[ReactionType["COMMENT"] = 1] = "COMMENT";
})(ReactionType || (ReactionType = {}));
