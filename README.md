# Multi-Business AI Dashboard

A comprehensive business management dashboard built with Next.js, Supabase, and NextAuth.js. This application supports multiple businesses with role-based access control, product management, billing, and reporting.

## Features

### Phase 1 (Current)
- ✅ **Multi-Business Architecture**: Support for multiple businesses with data isolation
- ✅ **Authentication**: Google OAuth integration with NextAuth.js
- ✅ **Role-Based Access Control**: Owner, Staff, and Accountant roles
- ✅ **Business Management**: Create, select, and switch between businesses
- ✅ **Product Management**: Add, edit, delete products with inventory tracking
- ✅ **Billing System**: Create invoices with line items and automatic calculations
- ✅ **Reports Dashboard**: Basic analytics and business insights
- ✅ **Row Level Security**: Secure data separation using Supabase RLS

### Planned Features
- 🔄 **User Settings**: Theme, currency, and language preferences
- 🔄 **Advanced Analytics**: Charts, trends, and detailed reporting
- 🔄 **AI Integration**: Smart recommendations and insights
- 🔄 **Export Functionality**: PDF invoices and data exports
- 🔄 **Mobile Responsiveness**: Optimized mobile experience

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Row Level Security
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Enable Row Level Security on all tables
   - Configure Google OAuth in Supabase Auth settings

5. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses a multi-business architecture with the following key tables:

- **users**: User profiles and authentication
- **businesses**: Business information and settings
- **business_members**: Many-to-many relationship between users and businesses with roles
- **products**: Product catalog with business isolation
- **bills**: Invoices and billing information
- **bill_items**: Line items for each bill
- **user_settings**: User preferences and settings

## Role-Based Access Control

### Owner
- Full access to all business data
- Can create, edit, and delete products
- Can create, edit, and delete bills
- Can manage business members
- Can view all reports

### Staff
- Can create and edit products
- Can create and edit bills
- Cannot delete products or bills
- Cannot manage business members
- Cannot view reports

### Accountant
- Read-only access to billing and reports
- Cannot create, edit, or delete any data
- Can view financial reports and analytics

## API Routes

- `/api/auth/[...nextauth]` - NextAuth.js authentication endpoints
- All other data operations go through Supabase client-side

## Security

- Row Level Security (RLS) enabled on all tables
- Business data isolation through RLS policies
- Role-based access control at the database level
- Secure authentication with NextAuth.js
- Environment variables for sensitive configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository.
