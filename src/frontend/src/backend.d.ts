import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    status: TaskStatus;
    title: string;
    sortOrder: bigint;
    createdAt: bigint;
    reminderTime?: string;
}
export interface UserProfile {
    name: string;
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(title: string, reminderTime: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderTask(id: bigint, newSortOrder: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleTask(id: bigint): Promise<void>;
    updateTask(id: bigint, title: string, reminderTime: string | null): Promise<void>;
}
