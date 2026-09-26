/*
Reason for existence: Vietnamese localization dictionary for all in-app UI strings across every application component.
System impact if absent: App components will display hardcoded English strings when user selects Vietnamese locale.
*/

export const viApps = {
  // MonitorApp
  monitor: {
    cpuTitle: 'MỨC SỬ DỤNG CPU',
    memoryTitle: 'PHÂN BỔ BỘ NHỚ',
    swapLabel: 'Bộ nhớ Hoán đổi (Swap)',
    telemetryTitle: 'ĐO ĐẠC TẢI THỜI GIAN THỰC (CPU & BỘ NHỚ)',
    intervalLabel: 'Tần suất',
    filterPlaceholder: 'Lọc tiến trình theo tên, người dùng hoặc PID...',
    activeLabel: 'Đang chạy',
    killBtn: 'SIGTERM',
    colPid: 'PID',
    colUser: 'NGƯỜI DÙNG',
    colCpu: '%CPU',
    colMem: '%MEM',
    colVirt: 'VIRT',
    colRes: 'RES',
    colTime: 'THỜI GIAN+',
    colCommand: 'LỆNH',
    colAction: 'THAO TÁC'
  },

  // LogsApp
  logs: {
    filterPlaceholder: 'Lọc thông điệp hoặc dịch vụ...',
    levelAll: 'TẤT CẢ MỨC',
    levelInfo: 'THÔNG TIN',
    levelWarn: 'CẢNH BÁO',
    levelError: 'LỖI',
    pauseBtn: 'Tạm dừng',
    resumeBtn: 'Tiếp tục',
    clearBtn: 'Xóa nhật ký',
    pauseToast: 'Đã tạm dừng luồng nhật ký',
    resumeToast: 'Đã tiếp tục luồng nhật ký',
    emptyMsg: 'Không có nhật ký nào phù hợp với bộ lọc.'
  },

  // NetworkApp
  network: {
    interfaceLabel: 'GIAO DIỆN MẠNG (eth0)',
    firewallLabel: 'TƯỜNG LỬA (UFW)',
    gatewayLabel: 'CỔNG VÀ MÁY CHỦ DNS',
    statusActive: 'Đang bật',
    statusDisabled: 'Đã tắt',
    disableUfw: 'Tắt UFW',
    enableUfw: 'Bật UFW',
    socketsTitle: 'SOCKETS ĐANG LẮNG NGHE (netstat -tuln)',
    openSockets: 'Sockets Đang Mở',
    diagTitle: 'CHẨN ĐOÁN ĐỘ TRỄ MẠNG (ping)',
    pingPlaceholder: 'Máy chủ hoặc IP (vd: 1.1.1.1)',
    startPing: 'Bắt đầu Ping',
    stopPing: 'Dừng Ping',
    pingReady: 'Sẵn sàng chẩn đoán kết nối mạng.',
    ufwEnabledToast: 'Đã kích hoạt tường lửa UFW',
    ufwDisabledToast: 'Đã vô hiệu hóa tường lửa UFW',
    colProto: 'Giao thức',
    colLocal: 'Địa chỉ Cục bộ',
    colForeign: 'Địa chỉ Ngoài',
    colState: 'Trạng thái',
    colService: 'Dịch vụ',
    colPid: 'PID'
  },

  // FilesApp
  files: {
    upBtn: '.. (Lên)',
    homeBtn: 'Thư mục Gốc',
    newFileBtn: '+ Tệp mới',
    newFolderBtn: '+ Thư mục',
    refreshBtn: 'Làm mới',
    placesLabel: 'Vị trí',
    emptyDir: 'Thư mục trống',
    editBtn: 'Sửa',
    deleteBtn: 'Xóa',
    colName: 'Tên tệp',
    colPermissions: 'Quyền hạn',
    colOwner: 'Chủ sở hữu',
    colSize: 'Dung lượng',
    colActions: 'Thao tác',
    saveBtn: 'Lưu',
    closeBtn: 'Đóng',
    savedToast: 'Đã lưu thay đổi vào',
    createdFileToast: 'Đã tạo tệp',
    createdDirToast: 'Đã tạo thư mục',
    deletedToast: 'Đã xóa',
    newFilePrompt: 'Nhập tên tệp mới:',
    newFolderPrompt: 'Nhập tên thư mục mới:',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa'
  },

  // ServicesApp
  services: {
    searchPlaceholder: 'Tìm kiếm dịch vụ SILVESTRIKE...',
    categoryAll: 'TẤT CẢ',
    filterAi: 'TRÍ TUỆ NHÂN TẠO',
    filterSystem: 'HỆ THỐNG',
    filterBusiness: 'DOANH NGHIỆP',
    filterWeb: 'WEB',
    openLiveSite: 'Mở Trang Trực Tiếp',
    openGitKraken: 'Git Studio',
    openOdoo: 'Mở Odoo ERP',
    launchSandbox: 'Khởi chạy Sandbox',
    closeSandbox: '[ Đóng Sandbox ]',
    liveSim: 'Mô phỏng Trực tiếp',
    sandboxHeader: 'Không gian Tương tác',
    statusDeployed: 'ĐÃ TRIỂN KHAI',
    statusRunning: 'ĐANG CHẠY',
    statusHostEngine: 'ENGINE MÁY CHỦ',
    containerSummary: 'Docker Containers',
    imageLabel: 'IMAGE',
    portsLabel: 'CỔNG (PORTS)',
    dependsOnLabel: 'KIẾN TRÚC (DEPENDS ON)',
    envLabel: 'MÔI TRƯỜNG (ENV)',
    healthLabel: 'CHỈ SỐ (HEALTHCHECK)',
    forkLabel: 'Forks',
    pushedLabel: 'Cập nhật',
    openNewWindow: 'Mở Trong Cửa Sổ Mới',
    runSentimentBtn: 'Phân tích Cảm xúc',
    generateQuizBtn: 'Tạo Trắc nghiệm'
  },

  // AIAssistantApp
  ai: {
    headerTitle: 'Doru AI Assistant',
    backendLabel: 'Động cơ suy luận Doru AI',
    thinkingMsg: 'Doru AI đang suy nghĩ...',
    inputPlaceholder: 'Hỏi Doru AI về dự án, kỹ năng, khóa luận tốt nghiệp...',
    sendBtn: 'Gửi',
    quickPrompt1: 'Các dự án nổi bật của Dương trên GitHub?',
    quickPrompt2: 'Khóa luận Veritas AI giải quyết bài toán gì?',
    quickPrompt3: 'Dương có những kỹ năng Full-Stack & AI nào?',
    quickPrompt4: 'Nền tảng xe điện Samco Bình Tân hoạt động ra sao?',
    initMsg: 'Chào bạn! Tôi là Doru AI - Trợ lý ảo hướng dẫn WebOS Portfolio của Văn Trọng Dương (SILVESTRIKE). Tôi có thể giới thiệu chi tiết về các dự án thực tế trên GitHub, kỹ năng lập trình, kinh nghiệm và thông tin liên hệ của Dương!'
  },

  // TilingPane / WM
  pane: {
    maximizeTooltip: 'Phóng to toàn khung / thu nhỏ',
    restoreTooltip: 'Khôi phục bố cục tiling',
    closeTooltip: 'Đóng khung',
    swapTooltip: 'Kéo thanh tiêu đề để hoán đổi vị trí cửa sổ'
  },

  // Toast messages from page.tsx
  toast: {
    switchedLayout: 'Đã đổi bố cục sang',
    toggledAudio: 'Đã bật/tắt âm thanh',
    terminatedPid: 'Đã kết thúc tiến trình PID'
  },

  // AboutMeTerminalApp (IDE Dossier)
  about: {
    activityExplorer: 'Trình duyệt Tệp',
    activitySearch: 'Tìm kiếm Hồ sơ',
    activityGit: 'Quản lý Git',
    activitySysinfo: 'Cấu hình Fetch',
    sidebarTitle: 'TRÌNH DUYỆT: SILVESTRIKE',
    searchTitle: 'TÌM KIẾM: GREP HỒ SƠ',
    searchPlaceholder: 'Tìm trong các tệp (vd: PyTorch, Next.js, Veritas)...',
    gitTitle: 'QUẢN LÝ PHIÊN BẢN: GIT',
    gitClean: 'Cây làm việc sạch sẽ. Nhánh main đã đồng bộ với GitHub.',
    terminalTitle: 'TERMINAL TÍCH HỢP',
    sendEmail: 'Gửi Email',
    copyEmail: 'Sao chép',
    copiedToast: 'Đã sao chép vào bộ nhớ tạm',
    openRepo: 'Xem Repository',
    openLive: 'Truy cập Ứng dụng',
    noResults: 'Không tìm thấy kết quả phù hợp.',
    statusBranch: 'main',
    statusEncoding: 'UTF-8',
    statusSpaces: 'Cách: 2'
  },

  // ContactApp
  contact: {
    title: 'Liên hệ',
    headerTitle: 'VĂN TRỌNG DƯƠNG (SILVESTRIKE)',
    headerSub: 'Kỹ sư Phần mềm (Full-Stack / Backend) | Kỹ sư Hệ thống AI/ML',
    headerEdu: 'HUIT CNTT (Năm cuối) | GPA: 3.2 / 4.0 | IELTS: 6.5 Academic | TP. Hồ Chí Minh',
    openForHire: 'SẴN SÀNG NHẬN VIỆC',
    downloadCvBtn: 'Tải xuống CV',
    downloadingCvToast: 'Đang tải xuống CV_VanTrongDuong.docx...',

    // Direct Gmail action
    openGmailBtn: 'Mở Gmail',

    // Leave Contact Info
    leaveInfoTitle: 'ĐỂ LẠI THÔNG TIN LIÊN HỆ',
    leaveInfoSubtitle: 'Để lại thông tin liên hệ, vị trí hoặc lời nhắn bên dưới. Dương sẽ chủ động liên hệ lại trong vòng 24 giờ.',
    inputPlaceholder: 'Nhập bất kỳ thông tin nào bạn muốn (Họ tên, Email/SĐT, lời nhắn, vị trí công việc)...',
    submitBtn: 'Gửi thông tin',
    submittingBtn: 'Đang gửi...',
    submitSuccess: 'Đã ghi nhận thông tin! Dương sẽ liên hệ lại với bạn sớm nhất.',
    submitAnotherBtn: 'Gửi thông tin khác',
    errorRequired: 'Vui lòng nhập nội dung hoặc thông tin liên hệ.',
    errorGeneral: 'Không thể gửi thông tin. Vui lòng gửi email trực tiếp.',

    copiedToast: 'Đã sao chép vào bộ nhớ tạm'
  },

  // AdminDashboardApp
  admin: {
    authTitle: '[XÁC THỰC QUẢN TRỊ VIÊN]',
    authSubtitle: 'Hệ Thống Theo Dõi Khách & Nhà Tuyển Dụng',
    tokenLabel: 'Master Access Token:',
    tokenPlaceholder: 'Nhập master access token...',
    unlockBtn: 'Mở Khóa Bảng Theo Dõi',
    authDesc: 'Hệ thống theo dõi chuyên biệt dành riêng cho Văn Trọng Dương để nhận diện các tổ chức / nhà tuyển dụng truy cập portfolio.',
    headerTitle: 'THEO DÕI NHÀ TUYỂN DỤNG & KHÁCH TRUY CẬP',
    headerSubtitle: 'Theo dõi tổ chức và nhà tuyển dụng để chủ động liên hệ ứng tuyển',
    liveBadge: 'LIVE TELEMETRY',
    refreshBtn: 'Làm mới',
    refreshingBtn: 'Đang đồng bộ...',
    lockBtn: 'Khóa lại',
    leadsCardTitle: 'NHÀ TUYỂN DỤNG TIỀM NĂNG',
    leadsCardDesc: 'Từ mạng tổ chức hoặc link LinkedIn/CV',
    visitorsCardTitle: 'TỔNG KHÁCH TRUY CẬP',
    visitorsCardDesc: 'Định danh qua Fingerprint duy nhất',
    pageviewsCardTitle: 'TỔNG LƯỢT XEM TRANG',
    pageviewsCardDesc: 'Theo dõi toàn bộ sub-routes WebOS',
    sessionsCardTitle: 'PHIÊN HOẠT ĐỘNG',
    sessionsCardDesc: 'Trong 10 phút vừa qua',
    searchPlaceholder: 'Lọc theo tổ chức, thành phố, IP, nguồn vào, ghi chú...',
    filterAll: 'Tất cả',
    filterLeads: 'Nhà tuyển dụng',
    filterContacted: 'Đã liên hệ',
    filterInterviewing: 'Đang phỏng vấn',
    tableTitle: 'DANH SÁCH KHÁCH TRUY CẬP',
    tableTip: 'Click "Sửa ghi chú" để cập nhật tiến độ ứng tuyển',
    colOrg: 'TỔ CHỨC / MẠNG ISP',
    colLocation: 'VỊ TRÍ',
    colReferrer: 'NGUỒN VÀO',
    colDevice: 'THIẾT BỊ & OS',
    colVisits: 'PHIÊN / LƯỢT XEM',
    colPages: 'TRANG ĐÃ XEM',
    colNotes: 'GHI CHÚ & TRẠNG THÁI',
    colActions: 'THAO TÁC',
    editNotesBtn: 'Sửa ghi chú',
    copyLeadBtn: 'Sao chép lead',
    saveBtn: 'Lưu',
    cancelBtn: 'Hủy',
    noData: 'Không tìm thấy dữ liệu khách truy cập phù hợp với bộ lọc.'
  }
};
