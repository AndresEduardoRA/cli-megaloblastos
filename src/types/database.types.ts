export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          student_code: string
          phone: string
          carnet_number: string
          avatar_url: string | null
          role: 'user' | 'admin' | 'super_admin'
          student_code_updated_at: string | null
          phone_updated_at: string | null
          carnet_number_updated_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          student_code: string
          phone: string
          carnet_number: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          student_code_updated_at?: string | null
          phone_updated_at?: string | null
          carnet_number_updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          student_code?: string
          phone?: string
          carnet_number?: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          student_code_updated_at?: string | null
          phone_updated_at?: string | null
          carnet_number_updated_at?: string | null
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          type: string
          year: string
          subject: string
          teacher: string | null
          partial: string | null
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          year: string
          subject: string
          teacher?: string | null
          partial?: string | null
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          year?: string
          subject?: string
          teacher?: string | null
          partial?: string | null
          url?: string
          created_at?: string
        }
      }
      rentals: {
        Row: {
          id: string
          user_id: string
          gown_type: 'quirurgica' | 'clinica'
          status: 'pending' | 'approved' | 'rejected' | 'returned'
          request_date: string
          return_date: string | null
          expected_return_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gown_type: 'quirurgica' | 'clinica'
          status?: 'pending' | 'approved' | 'rejected' | 'returned'
          request_date?: string
          return_date?: string | null
          expected_return_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gown_type?: 'quirurgica' | 'clinica'
          status?: 'pending' | 'approved' | 'rejected' | 'returned'
          request_date?: string
          return_date?: string | null
          expected_return_date?: string
          created_at?: string
        }
      }
      study_room_bookings: {
        Row: {
          id: string
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          attendees: Json
          status: 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          attendees: Json
          status?: 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          attendees?: Json
          status?: 'confirmed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
