"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionOutcome = exports.EntityType = exports.ActionType = void 0;
var ActionType;
(function (ActionType) {
    ActionType["LOGIN"] = "LOGIN";
    ActionType["LOGOUT"] = "LOGOUT";
    ActionType["CREATE"] = "CREATE";
    ActionType["UPDATE"] = "UPDATE";
    ActionType["DELETE"] = "DELETE";
    ActionType["UPLOAD"] = "UPLOAD";
    ActionType["DOWNLOAD"] = "DOWNLOAD";
    ActionType["TRANSLATE"] = "TRANSLATE";
})(ActionType || (exports.ActionType = ActionType = {}));
var EntityType;
(function (EntityType) {
    EntityType["USER"] = "USER";
    EntityType["TRANSLATION_JOB"] = "TRANSLATION_JOB";
    EntityType["FILE"] = "FILE";
    EntityType["ACTIVITY_LOG"] = "ACTIVITY_LOG";
    EntityType["OTHER"] = "OTHER";
    EntityType["REFRESH_TOKEN"] = "REFRESH_TOKEN";
})(EntityType || (exports.EntityType = EntityType = {}));
var ActionOutcome;
(function (ActionOutcome) {
    ActionOutcome["SUCCESS"] = "SUCCESS";
    ActionOutcome["FAILED"] = "FAILED";
})(ActionOutcome || (exports.ActionOutcome = ActionOutcome = {}));
