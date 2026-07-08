Product Requirements Document (PRD): DAN - THE MOVING MAN App
1. Product Overview
App Name: DAN - THE MOVING MAN
Purpose: An internal workforce management and compliance application designed for a moving company. It streamlines HR functions such as policy distribution, signature tracking, disciplinary actions (warnings), employee onboarding, and reporting.
Target Platform: Mobile (iOS and Android).

2. Target Audience
Employees/Movers: Need to read, understand, and digitally sign company policies.

Managers/Admins: Need to onboard employees, issue written warnings, track policy signatures, and generate reports.

3. Core Features & Screen Requirements
Screen 1: Home/Dashboard
Goal: Serve as the central hub for quick access to the app's primary modules.

Header/Branding: Prominent display of the "DAN - THE MOVING MAN" logo. (Note: The provided designs show variations of the logo—one with a running mascot and one with a moving truck).

Primary Action Buttons (Vertical Stack):

Written Policies (Red Button): Navigates to the policy list screen. Includes a document/shield icon.

Written Warning (Dark Button): Navigates to a form to issue disciplinary warnings. Includes a hazard/warning icon.

Secondary Action Buttons (Side-by-Side Grid):

Add Employee: Navigates to a form/flow to register a new employee into the system. Includes a "user + " icon.

Generate Report: Navigates to an analytics or export screen to view compliance or operational reports. Includes a bar chart icon.

Visual Divider: A horizontal red line with a small moving truck icon separating primary and secondary actions.

Screen 2: Written Policies (List View)
Goal: Allow users to browse and access standard operating procedures and HR policies.

Top Navigation: Back arrow and "Written Policies" title.

Header Instructions: A section stating: "Read and sign each policy below. Your signature confirms you have read and understand the policy." Includes a clipboard/document icon.

Policy List (Scrollable): Each item must include an icon, a title, a brief description, and a right chevron (indicating it's clickable). The required policies are:

Renting a Uhaul: How to properly rent a Uhaul for company business.

Requesting Times Off: Steps for requesting time off and approval process.

Clocking In and Out: Company policy on clocking in, clocking out, and breaks.

Requesting Reimbursements: How to submit receipts and request reimbursements.

Calling In: Procedure for calling in and reporting an absence.

Handling Damage: Steps to take when damage occurs on a job.

Bottom Navigation Bar: Contains tabs for quick switching between major app sections:

Home

Employees

Reports

Settings

4. Inferred Features (Requires Further Definition)
Based on the provided screens, the following screens and functionalities will need to be developed to complete the user flows:

Policy Detail & Signature Screen: The screen that appears after clicking a specific policy. It needs to display the full text of the policy and provide a digital signature canvas or acknowledgment checkbox.

Written Warning Form: A data entry screen for managers to select an employee, document an infraction, and potentially capture signatures.

Add Employee Flow: Data entry fields for Name, Contact Info, Role, Start Date, and initial login credentials.

Reporting Dashboard: Filters by date, employee, or policy to generate PDF/CSV reports.

Authentication Flow: Login/Forgot Password screens with role-based access control (RBAC) to ensure employees only see their own policies, while managers see "Add Employee" and "Warnings."

5. Design & UI Guidelines
Color Palette:

Primary: Deep Red (Action buttons, highlights).

Secondary: Black/Dark Charcoal (Secondary buttons, text).

Background: White/Off-White (Clean, readable canvas).

Typography: Sans-serif, bold headers for high legibility on the go.

Component Style: Rounded corners on buttons and cards, consistent use of line and solid icons to aid visual navigation.