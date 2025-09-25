# **App Name**: Chauffeur Pro

## Core Features:

- Role-Based Authentication: Secure authentication system with Email/Password login and distinct roles (Admin, Partner, Driver) each having restricted access and privileges.
- Booking Management: Comprehensive booking management with different status transitions and role based views. Partner Bookings must be approved by the Admin
- Driver Status Updates: Drivers can send booking status updates (accept/decline, in-progress, completed) for the bookings they are assigned to. Admins must approve the status change before the final status is saved.
- Admin Notifications: Real-time notifications for critical actions. For example, send a notification to the admin when a partner requests a booking.
- Driver Assignment AI: Suggest a relevant available driver to assign to a partner's requested job. The LLM will use real-time information to improve its response using a tool.
- Reporting & Analytics: Generate key insights based on historical data and show in PDF/Excel reports that admins can download. This includes information such as driver commissions and partner commissions.
- Document Storage: Secure storage of sensitive documents, such as driver licenses, insurance policies, and generated reports, with role-based access control.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for trust and professionalism.
- Background color: Light blue (#E8EAF6), almost white, for a clean and spacious feel.
- Accent color: Purple (#7E57C2), analogous to the primary blue, used sparingly for interactive elements to draw the user's eye.
- Body text: 'PT Sans', a humanist sans-serif font for readability and modern feel.
- Headlines: 'Playfair', a modern sans-serif font, similar to Didot with an elegant and fashionable feel, to make titles and section headers stand out. 
- Consistent use of simple, modern icons to represent different functionalities and booking statuses.
- Clean, intuitive layout with clear hierarchy to facilitate easy navigation for all user roles.