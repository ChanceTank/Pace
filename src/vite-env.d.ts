/// <reference types="vite/client" />

interface AppData {
    people: Person[];
    circles: Circle[];
    groups: Group[];
    checkins: Checkin[];
    actionItems: ActionItem[];
    tags: Tag[];
    covenantTypes: CovenantType[];
    personTags: PersonTag[];
    personGroups: PersonGroup[];
    personCircles: PersonCircle[];
    personCovenantTypes: PersonCovenantType[];
    checkinTags: CheckinTag[];
    actionItemTags: ActionItemTag[];
    checkinCovenantTypes: CheckinCovenantType[];
}

interface Person {
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

interface Circle {
    id: string;
    name: string;
    description: string;
    meetingFrequency: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface Group {
    id: string;
    name: string;
    description: string;
    meetingFrequency: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface Checkin {
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

interface ActionItem {
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

interface Tag {
    id: string;
    tag: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface CovenantType {
    id: string;
    name: string;
    description: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface PersonTag {
    personId: string;
    tagId: string;
}

interface PersonGroup {
    personId: string;
    groupId: string;
    roleInGroup?: string;
    joinDate?: string;
    leaveDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface PersonCircle {
    personId: string;
    circleId: string;
    roleInCircle?: string;
    joinDate?: string;
    leaveDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface PersonCovenantType {
    personId: string;
    covenantTypeId: string;
    startDate?: string;
    endDate?: string;
    creationDate: string;
    lastModifiedDate: string;
}

interface CheckinTag {
    checkinId: string;
    tagId: string;
}

interface ActionItemTag {
    actionItemId: string;
    tagId: string;
}

interface CheckinCovenantType {
    checkinId: string;
    covenantTypeId: string;
}

interface Window {
    ipcRenderer: {
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        off: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        send: (channel: string, ...args: unknown[]) => void;
        invoke: (channel: string, ...args: unknown[]) => void;
        saveData: (data: AppData) => Promise<{ success: boolean; error?: string }>;
        loadData: () => Promise<AppData>;
    };
    isElectron: boolean;
}
