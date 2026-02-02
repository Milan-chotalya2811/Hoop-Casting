export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserProfile {
    id: string;
    name: string;
    mobile: string;
    email: string | null;
    role: UserRole;
    created_at: string;
}

export interface TalentProfile {
    id: string;
    user_id: string;
    gender: string | null;
    dob: string | null;
    city: string | null;
    state: string | null;
    country: string;
    height_cm: number | null;
    weight_kg: number | null;
    chest_in: number | null;
    waist_in: number | null;
    hips_in: number | null;
    skin_tone: string | null;
    hair_color: string | null;
    eye_color: string | null;
    category: string;
    years_experience: number;
    languages: string[] | null;
    skills: string[] | null;
    past_work: string | null;
    portfolio_links: string[] | null;
    interested_in: string[] | null;
    willing_to_travel: boolean;
    profile_photo_url: string | null;
    gallery_urls: string[] | null;
    intro_video_url: string | null;
    created_at: string;
    updated_at: string;
    // Admin fields
    is_hidden: boolean;
    deleted_at: string | null;
}

export type FormFieldType = 'text' | 'number' | 'dropdown' | 'checkbox' | 'file';

export interface FormField {
    id: string;
    label: string;
    name: string;
    type: FormFieldType;
    required: boolean;
    options: string[] | null;
    order_index: number;
    created_at: string;
}
