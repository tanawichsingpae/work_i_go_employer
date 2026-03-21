import type { TranslationKeys } from "./en";

export const th: Record<TranslationKeys, string> = {
  // Common
  loading: "กำลังโหลด...",
  loadError: "ไม่สามารถโหลดข้อมูลได้",
  noData: "ไม่มีข้อมูล",

  // Sidebar
  mainMenu: "เมนูหลัก",
  dashboard: "แดชบอร์ด",
  logout: "ออกจากระบบ",

  // Index / Header
  employerOverview: "ภาพรวมนายจ้าง",

  // Tabs
  jobpost: "ประกาศงาน",
  employments: "การจ้างงาน",

  // SummaryCards
  activeJobs: "งานที่เปิดรับ",
  liveJobPosts: "ประกาศงานที่เปิดอยู่",
  totalApplications: "ใบสมัครทั้งหมด",
  allRecentApplications: "ใบสมัครล่าสุดทั้งหมด",
  workersHired: "พนักงานที่จ้าง",
  confirmedHires: "ยืนยันการจ้างแล้ว",
  completedJobs: "งานที่เสร็จสิ้น",
  finishedPlacements: "การจัดวางที่เสร็จแล้ว",
  openPositions: "ตำแหน่งว่าง",
  rolesStillAvailable: "ตำแหน่งที่ยังเปิดรับ",

  // JobpostTab
  jobpostInsights: "ภาพรวมประกาศงาน",
  jobpostInsightsDesc: "สลับดูระหว่างจำนวนผู้สมัครและค่าจ้างที่ตกลงได้ในแผงเดียว",
  applicantsByJobpost: "ผู้สมัครตามประกาศงาน",
  agreedWageByJobpost: "ค่าจ้างที่ตกลงตามประกาศงาน",
  jobposts: "ประกาศงาน",
  applicants: "ผู้สมัคร",
  totalWage: "ค่าจ้างรวม",
  resetFilter: "รีเซ็ตตัวกรอง",
  showingAllJobposts: "แสดงทุกประกาศงาน",
  selected: "เลือก",
  clickBarToFilter: "คลิกแท่งกราฟเพื่อกรองตารางผู้สมัครด้านล่าง",
  clickSliceToFocus: "คลิกส่วนของกราฟหรือรายการเพื่อกรองตารางผู้สมัคร",
  loadApplicantsChartError: "ไม่สามารถโหลดกราฟผู้สมัครได้",
  loadChartDataError: "ไม่สามารถโหลดข้อมูลกราฟได้",
  allJobposts: "ทุกประกาศงาน",
  searchApplicantOrJob: "ค้นหาผู้สมัครหรืองาน...",
  applicantsAll: "ผู้สมัคร",
  all: "ทั้งหมด",
  applicantName: "ชื่อผู้สมัคร",
  appliedFor: "สมัครงาน",
  province: "จังหวัด",
  applied: "วันที่สมัคร",
  loadApplicantsError: "ไม่สามารถโหลดข้อมูลผู้สมัครได้",
  noApplicantsFound: "ไม่พบผู้สมัคร",

  // EmploymentsTab
  dateRange: "ช่วงเวลา",
  totalAgreedWage: "ค่าจ้างตกลงรวม",
  totalEmployments: "การจ้างงานทั้งหมด",
  employmentQuartileTimeline: "ไทม์ไลน์การจ้างงาน",
  employmentQuartileDesc: "แต่ละประกาศงานจะแสดงเป็นแท่งช่วงวันที่ แกน X คือไทม์ไลน์ และแกน Y คือค่าจ้างที่ตกลง",
  focus: "โฟกัส",
  noEmploymentsData: "ไม่มีข้อมูลการจ้างงาน",
  employmentDetails: "รายละเอียดการจ้างงาน",
  selectedRange: "ช่วงที่เลือก",
  jobTitle: "ชื่องาน",
  type: "ประเภท",
  employmentsCount: "การจ้างงาน",
  start: "เริ่ม",
  end: "สิ้นสุด",
  agreedWage: "ค่าจ้างตกลง",
  hires: "คน",

  // EmploymentsQuartileChart
  selectedJob: "งานที่เลือก",
  range: "ช่วงเวลา",
  wageEmployments: "ค่าจ้าง / จำนวนจ้าง",
  agreedWageAxis: "ค่าจ้างตกลง",
  dateAxis: "วันที่",

  // ApplicantsChart
  applicationsTrend: "แนวโน้มใบสมัคร (14 วัน)",

  // ApplicantsTable
  seekerId: "รหัสผู้หางาน",
  actions: "ดำเนินการ",
  viewProfile: "ดูโปรไฟล์",
  accept: "รับ",
  reject: "ปฏิเสธ",
  view: "ดู",
  searchSeekerOrJob: "ค้นหารหัสผู้หางานหรืองาน...",

  // CompletedJobs
  records: "รายการ",
  hired: "จ้างงาน",

  // EmployerProfile
  companySummary: "สรุปข้อมูลบริษัท",
  verified: "ยืนยันแล้ว",
  totalJobs: "งานทั้งหมด",
  completed: "เสร็จสิ้น",
  activeWorkers: "พนักงานปัจจุบัน",
  companyInfo: "ข้อมูลบริษัท",
  businessNameType: "ชื่อและประเภทธุรกิจ",
  contact: "ติดต่อ",
  location: "ที่อยู่",
  profileLoadError: "ไม่สามารถโหลดโปรไฟล์บริษัทได้ กรุณาตรวจสอบรหัสนายจ้าง",

  // JobPostsTable
  jobPosts: "ประกาศงาน",
  newJobPost: "ประกาศงานใหม่",
  searchJobTitle: "ค้นหาชื่องาน...",
  allStatus: "ทุกสถานะ",
  allProvinces: "ทุกจังหวัด",
  allTypes: "ทุกประเภท",
  salary: "เงินเดือน",
  status: "สถานะ",
  posted: "วันที่ลง",
  edit: "แก้ไข",
  close: "ปิด",
  noJobsFound: "ไม่พบประกาศงาน",

  // NotificationsCard
  notifications: "การแจ้งเตือน",
  noPendingItems: "ไม่มีรายการที่รอดำเนินการ",

  // OngoingJobs
  jobStatus: "สถานะงาน",

  // ReportsView
  hiringFunnel: "กระบวนการจ้างงาน",
  applications: "ใบสมัคร",
  approved: "อนุมัติ",

  // NotFound
  pageNotFound: "ไม่พบหน้าที่ต้องการ",
  returnToHome: "กลับหน้าหลัก",
};
