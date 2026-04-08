# Mobile Health Clinic - Database Schema Documentation

## Overview
This database schema is designed for a mobile health clinic application with comprehensive patient management, appointment scheduling, medical records, and real-time chat capabilities.

## Tables Overview

### 1. **profiles**
Extends Supabase Auth users with additional patient information.

**Columns:**
- `id` (UUID, PK) - References auth.users
- `full_name` (TEXT) - Patient's full name
- `phone_number` (TEXT) - Contact number
- `date_of_birth` (DATE) - Patient's DOB
- `address`, `city`, `state`, `zip_code` (TEXT) - Address details
- `emergency_contact_name`, `emergency_contact_phone` (TEXT) - Emergency contact
- `insurance_provider`, `insurance_policy_number` (TEXT) - Insurance details
- `blood_type` (TEXT) - Blood type
- `allergies` (TEXT[]) - Array of known allergies
- `created_at`, `updated_at` (TIMESTAMP)

### 2. **services**
Medical services offered by the clinic.

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT) - Service name
- `description` (TEXT) - Service description
- `icon_name` (TEXT) - Icon identifier for UI
- `category` (TEXT) - Service category
- `duration_minutes` (INTEGER) - Typical appointment duration
- `base_price` (DECIMAL) - Base price for service
- `is_active` (BOOLEAN) - Whether service is currently offered
- `created_at`, `updated_at` (TIMESTAMP)

### 3. **appointments**
Patient appointment bookings.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `service_id` (UUID, FK → services)
- `appointment_date` (DATE)
- `appointment_time` (TIME)
- `status` (ENUM) - pending, confirmed, in_progress, completed, cancelled, no_show
- `location` (TEXT) - Clinic location for this appointment
- `notes` (TEXT) - Additional notes
- `cancellation_reason` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### 4. **medical_records**
Patient medical records and visit history.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `appointment_id` (UUID, FK → appointments)
- `provider_name` (TEXT) - Healthcare provider name
- `diagnosis` (TEXT) - Medical diagnosis
- `treatment` (TEXT) - Treatment provided
- `prescription` (TEXT) - Prescribed medications
- `notes` (TEXT) - Additional clinical notes
- `vital_signs` (JSONB) - Structured vital signs data
- `lab_results` (JSONB) - Laboratory test results
- `record_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

### 5. **chat_conversations**
Chat conversation threads between patients and the health assistant.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `title` (TEXT) - Conversation title
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### 6. **chat_messages**
Individual messages within chat conversations.

**Columns:**
- `id` (UUID, PK)
- `conversation_id` (UUID, FK → chat_conversations)
- `sender` (ENUM) - user, bot, staff
- `message_text` (TEXT)
- `metadata` (JSONB) - Additional message metadata
- `created_at` (TIMESTAMP)

### 7. **prescriptions**
Patient prescriptions and medication records.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `medical_record_id` (UUID, FK → medical_records)
- `medication_name` (TEXT)
- `dosage` (TEXT)
- `frequency` (TEXT)
- `duration` (TEXT)
- `instructions` (TEXT)
- `prescriber_name` (TEXT)
- `prescription_date` (DATE)
- `refills_remaining` (INTEGER)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### 8. **clinic_locations**
Physical locations where the mobile clinic operates.

**Columns:**
- `id` (UUID, PK)
- `location_name` (TEXT)
- `address`, `city`, `state`, `zip_code` (TEXT)
- `coordinates` (POINT) - Geographic coordinates
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 9. **clinic_schedule**
Schedule of when and where the mobile clinic will be available.

**Columns:**
- `id` (UUID, PK)
- `location_id` (UUID, FK → clinic_locations)
- `date` (DATE)
- `start_time`, `end_time` (TIME)
- `available_services` (UUID[]) - Array of service IDs available
- `max_appointments` (INTEGER)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

### 10. **notifications**
User notifications for appointments, results, etc.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `type` (ENUM) - Various notification types
- `title`, `message` (TEXT)
- `is_read` (BOOLEAN)
- `related_id` (UUID) - Reference to related entity
- `created_at` (TIMESTAMP)

### 11. **reviews**
User reviews and feedback for services.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `appointment_id` (UUID, FK → appointments)
- `service_id` (UUID, FK → services)
- `rating` (INTEGER) - 1-5 stars
- `comment` (TEXT)
- `created_at` (TIMESTAMP)

## Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Users** can only access their own data (profiles, appointments, records, etc.)
- **Public data** (services, locations, schedules) is readable by all authenticated users
- **Medical records** are strictly limited to the patient they belong to
- **Chat messages** are only accessible within user's own conversations

### Authentication
- Uses Supabase Auth for user management
- Automatic profile creation on user signup via trigger
- Password reset functionality built-in to Supabase Auth

## Triggers & Functions

1. **update_updated_at_column()** - Automatically updates `updated_at` timestamp on row updates
2. **handle_new_user()** - Creates a profile entry when a new user signs up

## Indexes

Performance indexes are created on:
- Foreign keys (user_id, service_id, etc.)
- Frequently queried fields (dates, status, is_read)
- Fields used in WHERE clauses

## Data Relationships

```
auth.users (Supabase Auth)
  ↓
profiles
  ↓
  ├── appointments → services
  ├── medical_records → appointments
  ├── prescriptions → medical_records
  ├── chat_conversations → chat_messages
  ├── notifications
  └── reviews → services, appointments

clinic_locations
  ↓
clinic_schedule
```

## Setup Instructions

1. **Create Supabase Project**: Sign up at supabase.com and create a new project
2. **Run Schema**: Copy the SQL from `database-schema.sql` and run it in the Supabase SQL Editor
3. **Enable Email Auth**: In Supabase dashboard, enable email authentication
4. **Configure Policies**: Review and adjust RLS policies based on your requirements
5. **Add Environment Variables**: Add Supabase URL and anon key to your frontend app

## Common Queries

### Get User's Upcoming Appointments
```sql
SELECT 
  a.id,
  a.appointment_date,
  a.appointment_time,
  a.status,
  s.name as service_name,
  s.duration_minutes
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.user_id = auth.uid()
AND a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date, a.appointment_time;
```

### Get User's Chat History
```sql
SELECT 
  cm.message_text,
  cm.sender,
  cm.created_at
FROM chat_messages cm
JOIN chat_conversations cc ON cm.conversation_id = cc.id
WHERE cc.user_id = auth.uid()
ORDER BY cm.created_at;
```

### Get Unread Notifications
```sql
SELECT * FROM notifications
WHERE user_id = auth.uid()
AND is_read = FALSE
ORDER BY created_at DESC;
```

## API Endpoints (Supabase Client)

Once schema is set up, you can use Supabase client to:

- **Auth**: `supabase.auth.signUp()`, `signIn()`, `signOut()`
- **Read**: `supabase.from('table').select()`
- **Insert**: `supabase.from('table').insert()`
- **Update**: `supabase.from('table').update()`
- **Delete**: `supabase.from('table').delete()`
- **Realtime**: `supabase.from('table').on('INSERT', callback)`

## Notes

- This schema is designed for PostgreSQL (Supabase's database)
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- JSONB fields allow for flexible, structured data storage
- The schema follows best practices for healthcare data management
- Consider adding audit logs for HIPAA compliance in production
