export enum ActionType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    UPLOAD = 'UPLOAD',
    DOWNLOAD = 'DOWNLOAD',
    TRANSLATE = 'TRANSLATE',
}
  
export enum EntityType {
    USER = 'USER',
    TRANSLATION_JOB = 'TRANSLATION_JOB',
    FILE = 'FILE',
    ACTIVITY_LOG = 'ACTIVITY_LOG',
    OTHER = 'OTHER',
    REFRESH_TOKEN = 'REFRESH_TOKEN',
}
  
export enum ActionOutcome {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}
  