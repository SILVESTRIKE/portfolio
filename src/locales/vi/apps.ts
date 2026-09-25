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
    openGitKraken: 'GitKraken Studio',
    openOdoo: 'Mở Odoo ERP',
    launchSandbox: 'Khởi chạy Sandbox',
    closeSandbox: '[ Đóng Sandbox ]',
    liveSim: 'Mô phỏng Trực tiếp',
    sandboxHeader: 'Không gian Tương tác',
    statusDeployed: 'ĐÃ TRIỂN KHAI',
    statusRunning: 'ĐANG CHẠY',
    statusHostEngine: 'ENGINE MÁY CHỦ',
    forkLabel: 'Forks',
    pushedLabel: 'Cập nhật',
    openNewWindow: 'Mở Trong Cửa Sổ Mới',
    runSentimentBtn: 'Phân tích Cảm xúc',
    generateQuizBtn: 'Tạo Trắc nghiệm'
  },

  // AIAssistantApp
  ai: {
    headerTitle: 'Doru AI Native Engine',
    backendLabel: 'Backend: Hybrid LPU Cục bộ',
    thinkingMsg: 'Doru AI đang suy nghĩ phản hồi...',
    inputPlaceholder: 'Hỏi Doru AI về máy chủ, dự án hoặc lệnh Linux...',
    sendBtn: 'Gửi',
    quickPrompt1: 'Doru AI hoạt động thế nào?',
    quickPrompt2: 'Dự án DogDexx có gì đặc biệt?',
    quickPrompt3: 'Tình trạng server silvestrike.dev hiện tại?',
    quickPrompt4: 'Odoo Sandbox quản lý những gì?',
    initMsg: 'Chào bạn! Tôi là Doru AI Native Assistant trên SILVESTRIKE Portfolio OS. Tôi có thể hỗ trợ giải đáp về các dự án trong portfolio của SILVESTRIKE, lệnh Linux server, hoặc phân tích trạng thái hệ thống.'
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
    activitySysinfo: 'Cấu hình Neofetch',
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
  }
};
