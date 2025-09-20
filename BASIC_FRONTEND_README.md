# 🎨 Basic Frontend - Business Dashboard

A clean, minimal frontend implementation for the Business Dashboard application.

## ✨ Features

### **Core Pages**
- **Dashboard** (`/`) - Overview with stats cards and quick actions
- **Products** (`/products`) - Product management with add/edit forms
- **Billing** (`/billing`) - Invoice creation and management
- **Reports** (`/reports`) - Analytics and reporting dashboard
- **Settings** (`/settings`) - User preferences and configuration
- **Login** (`/auth/login`) - Google OAuth authentication

### **Key Components**
- **SimpleNavbar** - Clean navigation with user info and sign out
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Loading States** - Skeleton loaders for better UX
- **Form Handling** - Basic form validation and submission
- **Authentication** - Google OAuth integration with NextAuth.js

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Google OAuth credentials
- Supabase account (optional for full functionality)

### **Installation**

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # Supabase Configuration (optional)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 File Structure

```
src/
├── app/
│   ├── auth/
│   │   └── login/
│   │       └── page.js          # Login page
│   ├── billing/
│   │   └── page.js              # Billing management
│   ├── products/
│   │   └── page.js              # Product management
│   ├── reports/
│   │   └── page.js              # Reports dashboard
│   ├── settings/
│   │   └── page.js              # Settings page
│   ├── layout.js                # Root layout
│   └── page.js                  # Dashboard home
├── components/
│   └── SimpleNavbar.js          # Navigation component
└── styles/
    └── globals.css              # Global styles and Tailwind
```

## 🎨 Design System

### **Colors**
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray Scale**: 50-900 range

### **Components**
- **Cards**: White background with subtle shadow
- **Buttons**: Primary (blue) and secondary (gray) variants
- **Forms**: Clean input fields with focus states
- **Navigation**: Simple horizontal layout

### **Typography**
- **Headings**: Bold, various sizes (text-3xl, text-2xl, text-lg)
- **Body**: Regular weight, gray-600 for secondary text
- **Labels**: Medium weight, gray-700

## 🔧 Customization

### **Adding New Pages**
1. Create a new folder in `src/app/`
2. Add a `page.js` file
3. Import and use `SimpleNavbar`
4. Follow the existing page structure

### **Styling**
- Uses Tailwind CSS utility classes
- Custom components defined in `globals.css`
- Responsive design with mobile-first approach

### **Authentication**
- Google OAuth via NextAuth.js
- Session management handled automatically
- Protected routes redirect to login

## 📱 Responsive Design

- **Mobile**: Single column layout, stacked cards
- **Tablet**: 2-column grid for stats cards
- **Desktop**: 4-column grid for stats, full navigation

## 🚀 Next Steps

1. **Connect to Backend**: Integrate with Supabase for data persistence
2. **Add Charts**: Implement Recharts for data visualization
3. **Enhance Forms**: Add form validation and error handling
4. **Add Animations**: Implement smooth transitions
5. **Dark Mode**: Add theme switching capability

## 🐛 Troubleshooting

### **Common Issues**

1. **Authentication Not Working**
   - Check Google OAuth credentials
   - Verify NEXTAUTH_URL matches your domain
   - Ensure NEXTAUTH_SECRET is set

2. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check if PostCSS is installed
   - Restart the development server

3. **Page Not Loading**
   - Check console for errors
   - Verify all imports are correct
   - Ensure file structure matches Next.js requirements

## 📄 License

This project is part of the Business Dashboard application.

---

**Ready to build your business dashboard!** 🚀
