export interface UserProfile {
    id: string;
    username: string;
    student_code: string;
    phone: string;
    carnet_number: string;
    role: "student" | "admin" | "super_admin";
    is_blocked: boolean;
    email?: string;
}
