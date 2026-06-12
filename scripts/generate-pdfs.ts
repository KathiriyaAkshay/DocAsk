import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../sample-data/pdfs');

interface Section {
  title: string;
  body: string[];
}

interface DocumentSpec {
  filename: string;
  title: string;
  subtitle: string;
  sections: Section[];
}

const COMPANY = 'Acme Logistics Ltd';
const EFFECTIVE = 'Effective Date: January 1, 2026 (Fictional Demo Document)';

const documents: DocumentSpec[] = [
  {
    filename: 'employee-handbook.pdf',
    title: 'Employee Handbook',
    subtitle: `${COMPANY} — Human Resources`,
    sections: [
      {
        title: '1. Welcome & Company Values',
        body: [
          'Welcome to Acme Logistics Ltd, a fictional freight and warehouse operations company created for portfolio demonstration purposes.',
          'Our values: Safety First, Reliable Delivery, Respect for Colleagues, and Continuous Improvement.',
          'This handbook applies to all full-time, part-time, and contract employees at Acme Logistics facilities.',
        ],
      },
      {
        title: '2. Working Hours & Attendance',
        body: [
          'Standard office hours are 9:00 AM to 5:30 PM, Monday through Friday, with a one-hour lunch break.',
          'Warehouse shifts operate on rotating schedules: Morning (6:00–14:00), Afternoon (14:00–22:00), and Night (22:00–6:00).',
          'Employees must clock in via the Acme TimeTrack system within 5 minutes of shift start. Late arrivals beyond 15 minutes require supervisor notification.',
          'Three unexcused absences in a rolling 90-day period trigger a formal attendance review.',
          'Overtime must be pre-approved by a department manager. Non-exempt employees receive 1.5× hourly rate for hours exceeding 40 per week.',
        ],
      },
      {
        title: '3. Leave Policy',
        body: [
          'Annual Leave: Full-time employees accrue 1.67 days per month (20 days per year). Leave requests require 2 weeks notice for periods exceeding 3 consecutive days.',
          'Sick Leave: 10 paid sick days per calendar year. Medical certificates are required for absences exceeding 3 consecutive days.',
          'Parental Leave: Primary caregivers receive 12 weeks paid leave; secondary caregivers receive 4 weeks. Apply via HR portal at least 30 days before expected start.',
          'Bereavement Leave: Up to 5 paid days for immediate family; 2 days for extended family.',
          'Unpaid Leave: Available after exhausting paid balances, subject to business needs and director approval.',
        ],
      },
      {
        title: '4. Remote & Hybrid Work',
        body: [
          'Eligible roles (office-based, non-warehouse) may request hybrid work after completing 90 days of employment.',
          'Hybrid employees may work remotely up to 3 days per week. Core in-office days are Tuesday and Thursday unless otherwise agreed.',
          'Remote workers must maintain a dedicated workspace, reliable internet (minimum 25 Mbps), and participate in daily stand-ups via video.',
          'Equipment: Acme provides a laptop and monitor. Employees are responsible for ergonomic chair and desk setup at home.',
          'Fully remote arrangements require VP approval and are limited to roles explicitly marked "Remote Eligible" in job descriptions.',
        ],
      },
      {
        title: '5. Code of Conduct',
        body: [
          'Treat colleagues, customers, and partners with respect. Harassment, discrimination, and retaliation are prohibited.',
          'Conflicts of interest must be disclosed to HR. Accepting gifts over $50 from vendors requires manager approval.',
          'Report concerns via the Acme Ethics Line (ethics@acme-logistics-demo.example) or speak with HR directly.',
        ],
      },
    ],
  },
  {
    filename: 'expense-policy.pdf',
    title: 'Expense & Reimbursement Policy',
    subtitle: `${COMPANY} — Finance Department`,
    sections: [
      {
        title: '1. Purpose & Scope',
        body: [
          'This policy governs business expense reimbursement for Acme Logistics Ltd employees. All expenses must be reasonable, necessary, and directly related to company business.',
          'This is a fictional policy document for demonstration purposes only.',
        ],
      },
      {
        title: '2. General Guidelines',
        body: [
          'Submit expenses within 30 days of incurring them via the Acme Expense Portal.',
          'Original receipts are required for all expenses over $25. Credit card statements alone are not sufficient.',
          'Personal expenses mixed with business travel must be separated on receipts before submission.',
          'Employees may not approve their own expenses. All submissions route to the employee\'s direct manager.',
        ],
      },
      {
        title: '3. Spending Limits',
        body: [
          'Meals (individual): Up to $35 per meal domestically; $50 internationally.',
          'Meals (client entertainment): Up to $150 per person with prior manager approval for groups exceeding 4 people.',
          'Domestic airfare: Economy class for flights under 6 hours; premium economy permitted for flights over 6 hours with director approval.',
          'Hotels: Up to $200/night in tier-2 cities; $275/night in tier-1 cities (New York, San Francisco, London).',
          'Ground transport: Rideshare or taxi for business travel; personal vehicle reimbursed at $0.67/mile.',
          'Office supplies under $100: May be purchased directly; items over $100 require purchase order.',
        ],
      },
      {
        title: '4. Approval Workflow',
        body: [
          'Under $500: Direct manager approval within 5 business days.',
          '$500–$2,000: Manager approval plus Finance review within 7 business days.',
          'Over $2,000: Requires director approval and Finance pre-authorization before purchase.',
          'Rejected expenses are returned with comments. Employees may resubmit with corrected documentation within 14 days.',
          'Reimbursements are processed on the 15th and last business day of each month via direct deposit.',
        ],
      },
      {
        title: '5. Non-Reimbursable Items',
        body: [
          'Personal travel upgrades, mini-bar charges, in-room movies, traffic fines, and childcare during business travel.',
          'Alcohol unless specifically approved for client entertainment with documented business purpose.',
          'Gym memberships, personal insurance, and commuting costs for regular office attendance.',
        ],
      },
    ],
  },
  {
    filename: 'it-security-policy.pdf',
    title: 'IT Security Policy',
    subtitle: `${COMPANY} — Information Technology`,
    sections: [
      {
        title: '1. Overview',
        body: [
          'Acme Logistics Ltd is committed to protecting company and customer data. This fictional IT security policy applies to all employees, contractors, and third parties with system access.',
          'Violations may result in access revocation and disciplinary action up to termination.',
        ],
      },
      {
        title: '2. Password Requirements',
        body: [
          'Minimum 14 characters with uppercase, lowercase, number, and special character.',
          'Passwords must be unique to Acme systems — do not reuse personal passwords.',
          'Multi-factor authentication (MFA) is mandatory for all employees. Use the Acme Authenticator app or hardware key.',
          'Passwords expire every 90 days for privileged accounts; standard users use SSO with MFA and no periodic rotation.',
          'Never share passwords, write them on sticky notes, or store them in unencrypted files.',
        ],
      },
      {
        title: '3. Device Management',
        body: [
          'Company-issued laptops must run Acme Endpoint Protection and remain encrypted (BitLocker/FileVault).',
          'Personal devices (BYOD) may access email and calendar only via Acme Mobile Device Management (MDM).',
          'Install operating system updates within 14 days of release. IT may force updates for critical patches.',
          'Lost or stolen devices must be reported to IT Security within 1 hour at security@acme-logistics-demo.example.',
          'USB storage devices are blocked by default. Exceptions require IT Security approval and device registration.',
        ],
      },
      {
        title: '4. Data Handling & Classification',
        body: [
          'Public: Marketing materials, published job postings. No restrictions.',
          'Internal: Employee directories, internal memos. Share within Acme only.',
          'Confidential: Customer shipment data, financial reports, HR records. Encrypted in transit and at rest; need-to-know access.',
          'Restricted: Payment card data, authentication credentials. Encrypted; access logged and reviewed monthly.',
          'Do not email confidential data to personal accounts. Use Acme SecureShare for external file transfers.',
        ],
      },
      {
        title: '5. Incident Reporting',
        body: [
          'Report suspected phishing, malware, or data breaches immediately to IT Security.',
          'Do not forward suspicious emails — use the "Report Phishing" button in Outlook.',
          'Security incidents are triaged within 4 hours. Critical incidents activate the Acme Incident Response Team.',
        ],
      },
    ],
  },
  {
    filename: 'onboarding-checklist.pdf',
    title: 'New Hire Onboarding Checklist',
    subtitle: `${COMPANY} — People Operations`,
    sections: [
      {
        title: '1. Before Day One',
        body: [
          'HR sends welcome email with start date, location, and dress code (business casual for office; safety gear provided for warehouse).',
          'IT provisions laptop, email (firstname.lastname@acme-logistics-demo.example), and badge.',
          'Manager prepares 30-60-90 day plan and assigns onboarding buddy.',
          'Complete background check and I-9 documentation (fictional process for demo purposes).',
        ],
      },
      {
        title: '2. Day One — Welcome',
        body: [
          '9:00 AM: Reception check-in and badge pickup at front desk.',
          '9:30 AM: HR orientation — benefits overview, handbook acknowledgment, emergency contacts.',
          '11:00 AM: IT setup — laptop login, MFA enrollment, password manager, VPN configuration.',
          '12:30 PM: Team lunch with manager and onboarding buddy.',
          '2:00 PM: Facility tour — restrooms, break rooms, emergency exits, warehouse safety zones.',
          '3:30 PM: Complete mandatory compliance training modules in Acme Learning Hub.',
        ],
      },
      {
        title: '3. Week One — Foundations',
        body: [
          'Monday–Tuesday: Role-specific system access requests (ERP, WMS, CRM as applicable).',
          'Wednesday: Meet cross-functional partners — Finance contact, IT helpdesk, HR business partner.',
          'Thursday: Shadow a senior team member on daily workflows.',
          'Friday: Week-one check-in with manager; submit questions via onboarding survey.',
          'Required reading: Employee Handbook, IT Security Policy, Expense Policy (all in Acme Policy Portal).',
        ],
      },
      {
        title: '4. First 30 Days',
        body: [
          'Complete all assigned Acme Learning Hub courses (Safety, Anti-Harassment, Data Privacy).',
          'Set up recurring 1:1 meetings with manager (weekly for first month).',
          'Deliver a small "quick win" project agreed with manager by end of week 3.',
          '30-day review: Discuss progress, clarify expectations, adjust 60-day goals.',
        ],
      },
      {
        title: '5. 60 & 90 Day Milestones',
        body: [
          'Day 60: Mid-probation check-in. Review performance against 30-60-90 plan.',
          'Day 90: Probation review meeting. Confirm permanent employment or discuss improvement plan.',
          'Obtain feedback from onboarding buddy and cross-functional contacts.',
          'New hires may nominate their buddy for the quarterly "Acme Welcome Award" (fictional recognition program).',
        ],
      },
    ],
  },
  {
    filename: 'customer-support-guidelines.pdf',
    title: 'Customer Support Guidelines',
    subtitle: `${COMPANY} — Customer Experience Team`,
    sections: [
      {
        title: '1. Mission & Tone',
        body: [
          'Acme Logistics customer support helps shippers and receivers track shipments, resolve delivery issues, and answer billing questions.',
          'Tone: Professional, empathetic, and solution-oriented. Use clear language; avoid jargon unless the customer uses it first.',
          'Always greet by name when available: "Hello [Name], thank you for contacting Acme Logistics support."',
          'This document is fictional and created solely for portfolio demonstration.',
        ],
      },
      {
        title: '2. Response Time SLAs',
        body: [
          'Live chat: First response within 2 minutes during business hours (8 AM–8 PM local time, Mon–Sat).',
          'Email: Initial acknowledgment within 4 hours; resolution target within 24 hours for standard inquiries.',
          'Phone: Answer within 3 rings. Callback promised within 2 hours if transfer required.',
          'Priority/Escalated: First response within 30 minutes; manager loop-in within 1 hour.',
          'After-hours emergency line (damaged hazardous goods): 24/7, answer within 5 minutes.',
        ],
      },
      {
        title: '3. Common Issue Playbooks',
        body: [
          'Delayed shipment: Verify tracking ID in WMS, check weather/route exceptions, provide revised ETA and compensation eligibility.',
          'Damaged goods: Document with photos, file claim within 48 hours, offer replacement shipment or refund per contract terms.',
          'Billing dispute: Pull invoice from ERP, compare to signed rate card, escalate to Billing if discrepancy exceeds $100.',
          'Address change: Allowed before package reaches destination hub; $15 reroute fee may apply for expedited changes.',
        ],
      },
      {
        title: '4. Escalation Procedures',
        body: [
          'Tier 1 → Tier 2: Complex tracking, repeated failures, customer requests supervisor.',
          'Tier 2 → Manager: Legal threats, social media complaints, claims over $5,000.',
          'Manager → Director: Regulatory inquiries, media contact, VIP accounts (Acme Platinum shippers).',
          'Document every escalation in the CRM with case notes, actions taken, and next steps.',
          'Never promise outcomes outside published policy. Use: "Let me check with our team and follow up by [time]."',
        ],
      },
      {
        title: '5. Quality & Feedback',
        body: [
          'Random call/chat reviews weekly. Target QA score: 90% or above.',
          'CSAT survey sent after ticket closure. Team goal: 4.5/5 average rating.',
          'Negative feedback triggers manager review within 24 hours and customer callback within 48 hours.',
        ],
      },
    ],
  },
];

function renderPdf(spec: DocumentSpec, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(22).font('Helvetica-Bold').text(spec.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#555555').text(spec.subtitle, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).text(EFFECTIVE, { align: 'center' });
    doc.moveDown(1.5);
    doc.fillColor('#000000');

    for (const section of spec.sections) {
      doc.fontSize(14).font('Helvetica-Bold').text(section.title);
      doc.moveDown(0.4);
      doc.fontSize(11).font('Helvetica');
      for (const paragraph of section.body) {
        doc.text(paragraph, { align: 'left', lineGap: 4 });
        doc.moveDown(0.5);
      }
      doc.moveDown(0.8);
    }

    doc.fontSize(9).fillColor('#888888').text(
      `${COMPANY} — Fictional demo document. Not legally binding.`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 },
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const spec of documents) {
    const outputPath = path.join(OUTPUT_DIR, spec.filename);
    await renderPdf(spec, outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  console.log(`\nDone — ${documents.length} PDFs written to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
