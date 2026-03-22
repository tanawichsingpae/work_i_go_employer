export const en = {
  // Common
  loading: "Loading...",
  loadError: "Unable to load data",
  noData: "No data",

  // Sidebar
  mainMenu: "Main Menu",
  dashboard: "Dashboard",
  logout: "Logout",
  backToEmployerHome: "Back to Employer Home",

  // Index / Header
  employerOverview: "Employer overview",

  // Tabs
  jobpost: "Jobpost",
  employments: "Employments",

  // SummaryCards
  activeJobs: "Active Jobs",
  liveJobPosts: "Live job posts",
  totalApplications: "Total Applications",
  allRecentApplications: "All recent applications",
  workersHired: "Workers Hired",
  confirmedHires: "Confirmed hires",
  completedJobs: "Completed Jobs",
  finishedPlacements: "Finished placements",
  openPositions: "Open Positions",
  rolesStillAvailable: "Roles still available",

  // JobpostTab
  jobpostInsights: "Jobpost Insights",
  jobpostInsightsDesc: "Switch between applicants volume and agreed wage without leaving the same panel.",
  applicantsByJobpost: "Applicants by Jobpost",
  agreedWageByJobpost: "Agreed Wage by Jobpost",
  hiredApplications: "hired applications",
  jobposts: "jobposts",
  applicants: "applicants",
  totalWage: "total wage",
  resetFilter: "Reset filter",
  showingAllJobposts: "Showing all jobposts",
  selected: "Selected",
  clickBarToFilter: "Click a bar to filter the applicants table below.",
  tapToShowJobpostWage: "Tap to show wage from the job post",
  wageAmountFromJobpost: "wage amount from the job post",
  wageSlicesFromHires: "Wage slices are summed from agreed wages on employments linked to hired job applications.",
  clickSliceToFocus: "Click a slice or list item to focus the applicants table on one jobpost.",
  loadApplicantsChartError: "Unable to load applicants chart",
  loadChartDataError: "Unable to load chart data",
  allJobposts: "All Jobposts",
  searchApplicantOrJob: "Search applicant or job...",
  applicantsAll: "Applicants",
  all: "All",
  applicantName: "Applicant Name",
  appliedFor: "Applied For",
  province: "Province",
  applied: "Applied",
  loadApplicantsError: "Unable to load applicants",
  noApplicantsFound: "No applicants found",
  hiredStatus: "Hired",
  notHiredStatus: "Not hired",

  // EmploymentsTab
  dateRange: "Date Range",
  totalAgreedWage: "Total Agreed Wage",
  totalEmployments: "Total Employments",
  employmentQuartileTimeline: "Employment Quartile Timeline",
  employmentQuartileDesc: "Each jobpost is drawn as a date-range bar. The X-axis tracks the employment timeline and the Y-axis tracks total agreed wage.",
  focus: "Focus",
  noEmploymentsData: "No employments data",
  employmentDetails: "Employment Details",
  selectedRange: "Selected range",
  jobTitle: "Job Title",
  type: "Type",
  employmentsCount: "Employments",
  start: "Start",
  end: "End",
  agreedWage: "Agreed Wage",
  hires: "hires",

  // EmploymentsQuartileChart
  selectedJob: "Selected Job",
  range: "Range",
  wageEmployments: "Wage / Employments",
  agreedWageAxis: "Agreed Wage",
  dateAxis: "Date",

  // ApplicantsChart
  applicationsTrend: "Applications Trend (14 days)",

  // ApplicantsTable
  seekerId: "Seeker ID",
  actions: "Actions",
  viewProfile: "View Profile",
  accept: "Accept",
  reject: "Reject",
  view: "View",
  searchSeekerOrJob: "Search seeker ID or job...",

  // CompletedJobs
  records: "records",
  hired: "Hired",

  // EmployerProfile
  companySummary: "Company Summary",
  verified: "Verified",
  totalJobs: "Total Jobs",
  completed: "Completed",
  activeWorkers: "Active Workers",
  companyInfo: "Company Info",
  businessNameType: "Business Name & Type",
  contact: "Contact",
  location: "Location",
  profileLoadError: "Failed to load company profile. Please check if the employer ID is valid.",

  // JobPostsTable
  jobPosts: "Job Posts",
  newJobPost: "New Job Post",
  searchJobTitle: "Search job title...",
  allStatus: "All Status",
  allProvinces: "All Provinces",
  allTypes: "All Types",
  salary: "Salary",
  status: "Status",
  posted: "Posted",
  edit: "Edit",
  close: "Close",
  noJobsFound: "No jobs found",

  // NotificationsCard
  notifications: "Notifications",
  noPendingItems: "No pending items",

  // OngoingJobs
  jobStatus: "Job Status",

  // ReportsView
  hiringFunnel: "Hiring Funnel",
  applications: "Applications",
  approved: "Approved",

  // NotFound
  pageNotFound: "Oops! Page not found",
  returnToHome: "Return to Home",
} as const;

export type TranslationKeys = keyof typeof en;