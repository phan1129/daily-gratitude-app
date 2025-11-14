# Daily Gratitude App

A simple, beautiful web application for tracking daily gratitude notes with user authentication and cloud storage.

![Daily Gratitude App](https://img.shields.io/badge/version-2.0-green.svg)

## 🌐 Live Demo

**[View Live Application](https://phan1129-daily-gratitude-app.netlify.app/)**

Try out the app without setting up your own instance! The live demo is fully functional with user authentication and database storage.

## Overview

Daily Gratitude is a minimalist web app that helps users cultivate a gratitude practice by writing and saving daily notes about things they're grateful for. All notes are securely stored in the cloud and protected with user authentication.

## Features

- **User Authentication**
  - Secure email/password sign-up and login
  - Email confirmation for new accounts
  - Session persistence across page refreshes
  - Secure logout functionality

- **Note Management**
  - Create gratitude notes with a clean, distraction-free interface
  - View all your notes in chronological order (newest first)
  - Delete notes with confirmation dialog
  - Each user can only see their own notes (Row Level Security)

- **User Experience**
  - Responsive design that works on desktop and mobile
  - Clean, modern UI with smooth animations
  - Keyboard shortcuts (Ctrl/Cmd + Enter to save)
  - Loading states and error handling
  - XSS protection for safe content display

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: [Supabase](https://supabase.com)
  - Authentication (email/password)
  - PostgreSQL database
  - Row Level Security (RLS) policies
- **Hosting**: Can be hosted on any static site host (Vercel, Netlify, GitHub Pages, etc.)

## Project Structure

```
daily-gratitude-app/
├── index.html          # Main HTML file with auth and app UI
├── style.css           # All styles including auth forms and app
├── script.js           # JavaScript with auth logic and DB operations
└── README.md           # Project documentation
```

## 📸 Screenshots

### Authentication Screen
![Authentication Screen](/Users/Personal/Desktop/Screenshot%202025-11-13%20at%204.27.23%20PM.png)

### Main Application
![Main Application - Placeholder](./screenshots/app-main.png)
*Screenshot placeholder - to be replaced*

> Note: Additional screenshots showing the gratitude note interface and features will be added soon.

## Database Schema

### Table: `gratitude_notes`

| Column       | Type         | Description                          |
|-------------|--------------|--------------------------------------|
| id          | uuid         | Primary key (auto-generated)         |
| user_id     | uuid         | Foreign key to auth.users            |
| text        | text         | The gratitude note content           |
| created_at  | timestamptz  | Timestamp (default: now())           |

### Row Level Security (RLS) Policies

- **SELECT**: Users can only view their own notes (`user_id = auth.uid()`)
- **INSERT**: Users can only insert notes with their own user_id
- **DELETE**: Users can only delete their own notes

## 🏗️ Architecture Overview

This application follows a simple but robust three-tier architecture:

### Frontend Layer
- **HTML5/CSS3/JavaScript**: Pure vanilla JavaScript with no frameworks, keeping the app lightweight and fast
- **Responsive Design**: Mobile-first approach with flexbox and CSS Grid
- **Client-side Validation**: Email format, password strength, and input sanitization

### Authentication Layer (Supabase Auth)
- **Email/Password Authentication**: Secure user registration and login
- **Session Management**: JWT-based sessions stored in browser localStorage
- **Token Refresh**: Automatic token refresh for seamless user experience
- **Email Verification**: Optional email confirmation for new accounts

### Database Layer (Supabase PostgreSQL)
- **PostgreSQL Database**: Fully managed by Supabase
- **Row Level Security (RLS)**: Database-level security policies ensure users only access their own data
- **Real-time Capabilities**: Built on PostgreSQL with real-time subscriptions (not currently used but available)
- **API Gateway**: Supabase provides auto-generated REST and GraphQL APIs

### Data Flow
1. User authenticates via Supabase Auth → receives JWT token
2. Frontend stores token and uses it for all API requests
3. User creates/views/deletes notes → requests sent to Supabase with JWT
4. Supabase validates JWT and applies RLS policies
5. Only authorized data is returned to the user
6. UI updates reactively based on database responses

### Security Model
- **Authentication**: Handled entirely by Supabase Auth (industry-standard security)
- **Authorization**: RLS policies at database level (user_id = auth.uid())
- **Data Protection**: All API calls over HTTPS, XSS prevention via HTML escaping
- **No Backend Server**: Serverless architecture reduces attack surface

## 🚀 Setup & Development

### Prerequisites

- A [Supabase](https://supabase.com) account (free tier available)
- A modern web browser
- A text editor (VS Code, Sublime Text, etc.)

### Step 1: Set Up Supabase

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose an organization and fill in project details
   - Wait for the project to be provisioned

2. **Create the database table**
   - Go to the SQL Editor in your Supabase dashboard
   - Run the following SQL:

   ```sql
   -- Create the gratitude_notes table
   CREATE TABLE gratitude_notes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     text TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE gratitude_notes ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   -- Users can view only their own notes
   CREATE POLICY "Users can view their own notes"
     ON gratitude_notes FOR SELECT
     USING (auth.uid() = user_id);

   -- Users can insert only their own notes
   CREATE POLICY "Users can insert their own notes"
     ON gratitude_notes FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Users can delete only their own notes
   CREATE POLICY "Users can delete their own notes"
     ON gratitude_notes FOR DELETE
     USING (auth.uid() = user_id);
   ```

3. **Configure email authentication** (optional)
   - Go to Authentication → Settings
   - Configure email templates if desired
   - For development, you can disable email confirmation in Settings → Auth → Email Auth

4. **Get your API credentials**
   - Go to Project Settings → API
   - Copy your Project URL
   - Copy your anon/public key

### Step 2: Configure the App

1. **Clone or download this repository**

2. **Update the Supabase credentials in `script.js`**
   - Open `script.js`
   - Find lines 5-6:
   ```javascript
   const SUPABASE_URL = 'https://znrbanstgnolsatpednp.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGci...';
   ```
   - Replace with your own Supabase URL and anon key

3. **Open the app**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js (install http-server globally first)
     npx http-server
     ```

## Usage

### Creating an Account

1. Open the app in your browser
2. Fill in the sign-up form with your email and password
3. Click "Sign Up"
4. Check your email for a confirmation link (if email confirmation is enabled)
5. Click the confirmation link
6. Return to the app and log in with your credentials

### Writing Gratitude Notes

1. Log in to your account
2. Type your gratitude note in the text area
3. Click "Save" or press Ctrl/Cmd + Enter
4. Your note will appear below with a timestamp

### Managing Notes

- **View Notes**: All your notes are displayed below the input area, newest first
- **Delete a Note**: Click the "Delete" button on any note and confirm
- **Logout**: Click the "Log Out" button in the top-right corner

## Security Features

- **Authentication**: Secure email/password authentication via Supabase Auth
- **Row Level Security**: Database-level security ensures users can only access their own data
- **XSS Protection**: All user input is escaped before rendering to prevent XSS attacks
- **HTTPS**: Supabase uses HTTPS for all API calls
- **Password Requirements**: Minimum 8 characters enforced

## Customization

### Changing Colors

The app uses a green color scheme. To change the primary color, update these CSS variables in `style.css`:

```css
/* Find and replace these color values */
#10b981  /* Primary green */
#059669  /* Darker green for hover states */
```

### Modifying the Database

If you want to add fields (e.g., categories, tags, mood), update:
1. The database schema in Supabase
2. The `saveNote()` function in `script.js`
3. The `displayNotes()` function to show the new fields
4. The HTML/CSS as needed

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Deploy!

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select your branch and click Save
4. Your site will be live at `https://yourusername.github.io/daily-gratitude-app`

## Troubleshooting

### "Invalid email or password" error when logging in

- Make sure you've confirmed your email (check your inbox/spam)
- Verify your password is correct
- Check that email confirmation is not required in Supabase settings if you want to skip that step

### Notes not saving or loading

- Open browser console (F12) and check for errors
- Verify your Supabase credentials in `script.js` are correct
- Check that the `gratitude_notes` table exists in your Supabase database
- Verify RLS policies are set up correctly

### "Session expired" or constant logouts

- Check if your browser is blocking cookies
- Try clearing your browser cache
- Verify your Supabase project is active

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Future Enhancements

Ideas for future development:
- [ ] Add categories or tags for notes
- [ ] Export notes to PDF or CSV
- [ ] Add mood tracking
- [ ] Weekly/monthly gratitude summaries
- [ ] Search and filter functionality
- [ ] Dark mode toggle
- [ ] Social sharing features
- [ ] Streak tracking and reminders
- [ ] Password reset functionality

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Open an issue on GitHub

## Acknowledgments

- Built with [Supabase](https://supabase.com) for backend and authentication
- Inspired by gratitude journaling practices
- Design influenced by modern minimalist UI principles

---

**Made with gratitude** ✨
