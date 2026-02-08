export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    timestamp: string;
}

export interface Person {
    id: string;
    name: string;
    contactInfo: string;
    lastCheckInDate: string;
    notes: string;
    birthday: string;
    anniversary: string;
    preferredCommunicationMethod: string;
    profilePicture: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface Circle {
    id: string;
    name: string;
    description: string;
    meetingFrequency: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    meetingFrequency: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface Checkin {
    id: string;
    personId: string;
    date: string;
    duration: string;
    type: string;
    notes: string;
    summaryFeeling: string;
    topicsDiscussed: string;
    nextFollowUpDate: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface ActionItem {
    id: string;
    checkinId?: string;
    personId: string;
    description: string;
    dueDate: string;
    completedDate?: string;
    status: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface Tag {
    id: string;
    tag: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface CovenantType {
    id: string;
    name: string;
    description: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface PersonTags {
    personId: string;
    tagId: string;
}

export interface PersonGroups {
    personId: string;
    groupId: string;
    roleInGroup?: string;
    joinDate?: string;
    leaveDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface PersonCircles {
    personId: string;
    circleId: string;
    roleInCircle?: string;
    joinDate?: string;
    leaveDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface PersonCovenantTypes {
    personId: string;
    covenantTypeId: string;
    startDate?: string;
    endDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

export interface CheckinTags {
    checkinId: string;
    tagId: string;
}

export interface ActionItemTags {
    actionItemId: string;
    tagId: string;
}

export interface CheckinCovenantTypes {
    checkinId: string;
    covenantTypeId: string;
}

