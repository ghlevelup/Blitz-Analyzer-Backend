// Realistic sample resumeData used only to render preview screenshots at
// seed time - matches the shared sections schema in sections.ts.
export const sampleResumeData = {
  header: {
    name: "Jordan Blake",
    jobTitle: "Senior Product Designer",
    email: "jordan.blake@example.com",
    phone: "+1 (415) 555-0182",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/jordanblake",
    github: "https://github.com/jordanblake",
    portfolio: "https://jordanblake.design",
    photo: "",
  },
  summary: {
    bio: "Product designer with 7+ years shipping design systems and consumer web products for high-growth startups. Led a 5-person design team through a Series B, cut onboarding time 40% through UX research, and shipped accessibility improvements adopted company-wide.",
  },
  skills: [
    { category: "Design", items: "Figma, Design Systems, Prototyping, Accessibility (WCAG 2.1)" },
    { category: "Research", items: "User Interviews, Usability Testing, A/B Testing" },
    { category: "Tools", items: "Notion, Linear, Storybook, Webflow" },
  ],
  experience: [
    {
      company: "Northwind Labs", role: "Senior Product Designer", location: "Remote",
      startDate: "2022-03", endDate: "",
      description: "Led design for the core onboarding flow, reducing time-to-activation by 40%. Built and maintained the company design system used across 6 product teams. Mentored 2 junior designers.",
    },
    {
      company: "Brightpath", role: "Product Designer", location: "San Francisco, CA",
      startDate: "2019-06", endDate: "2022-02",
      description: "Owned end-to-end design for the mobile checkout experience, increasing conversion 12%. Partnered with engineering to ship a WCAG 2.1 AA accessibility pass across the product.",
    },
  ],
  projects: [
    {
      name: "OpenSystem UI Kit", link: "https://github.com/jordanblake/opensystem",
      techStack: "Figma, Storybook, React", description: "Open-source design system with 40+ accessible components, used by 300+ GitHub stars worth of downstream projects.",
    },
  ],
  education: [
    { institution: "Rhode Island School of Design", degree: "B.F.A. in Graphic Design", field: "Graphic Design", startYear: 2015, endYear: 2019, details: "Dean's List, 2017-2019" },
  ],
  certifications: [
    { name: "Certified Usability Analyst", issuer: "Human Factors International", date: "2021-05", link: "" },
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Conversational" },
  ],
  achievements: [
    { title: "Best in Show, Design Systems Conf 2023", date: "2023", description: "Awarded for the OpenSystem UI Kit case study." },
  ],
  volunteering: [
    { organization: "Code for America", role: "Volunteer UX Designer", startDate: "2020", endDate: "Present", description: "Redesigned intake forms for a benefits-access nonprofit, improving completion rate 18%." },
  ],
  publications: [
    { title: "Accessible Design Systems at Scale", venue: "UX Collective", date: "2023-09", link: "https://example.com/article" },
  ],
  licensure: [
    { licenseName: "Registered Nurse (RN)", state: "California", licenseNumber: "RN123456", expiryDate: "2027-01" },
  ],
};
