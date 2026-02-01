let isRunning = false, isPaused = false, stopRequested = false;
let promptList = [];
let imageFileList = [];
let currentIndex = 0, flowTabId = null, zoomResetTimerId = null;
let downloadInterval = null, scanIntervalMs = 5000;
let finalScanTimerId = null;
let processedVideoIds = new Set();
let totalExpectedVideos = 0;
let newlyDownloadedCount = 0;
let selectors = {};
let currentLang = 'vi';
let currentMode = 'image';
const MAX_RETRIES = 5;
let mainActionButton, stopButton,
    promptsTextarea, uploadPromptButton, fileInput, progressBar, liveStatus, logDisplay,
    mainInterface, wrongPageInterface, navigateToFlowButton, startFromInput, languageSelector,
    minInitialWaitTimeInput, maxInitialWaitTimeInput,
    autoDownloadCheckbox, openDownloadsSettingsLink,
    wrongPageMessageElement,
    imageModeContainer, imageInput, uploadImageButton,
    imageFileSummary, imageCount, promptListTitle, promptContainer,
    imageSortSelector, clearImagesButton, startFromLabel;

let waitTimes = {
    image: { min: 10, max: 20 },
    text: { min: 15, max: 30 }
};

const naturalSortCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
let fetchedToolsList = [];

const AUTHOR_API_URL = "https://gist.githubusercontent.com/duckmartians/51788b5bc97bc83152b08a9886b834e1/raw/info.json";
const SELECTORS_CONFIG_URL = "https://gist.githubusercontent.com/duckmartians/1681f24e791068ce2efab2af15e59659/raw/meta.json";
const META_MEDIA_URL = "https://www.meta.ai/media";

const translations = {
    vi: {
        log_loading_selectors: "Đang tải selectors...",
        log_using_fallback_selectors: "Sử dụng selectors dự phòng.",
        log_auto_scan_off: "Quét video tự động đang tắt.",
        log_open_settings_fail: "Không thể mở cài đặt tải xuống.",
        log_initial_scan_found: "   Đã tìm thấy và bỏ qua {count} video đã tồn tại trên trang.",
        log_final_scan_started: "✅ ĐÃ GỬI XONG TÁC VỤ! (Quét tải video cuối cùng trong 3 phút)",
        log_final_scan_stopped: "Đã hết 3 phút quét cuối cùng. Dừng quét.",
        log_independent_scan_started: "Đã bắt đầu quét video độc lập.",
        log_independent_scan_stopped: "Đã dừng quét video độc lập.",
        log_scan_found_videos: "   Tìm thấy {count} video mới. Bắt đầu xử lý tải...",
        log_scan_error: "   Lỗi trong quá trình quét video: {error}",
        log_scan_inject_failed: "   Lỗi inject script quét video: {error}",
        tab_tools: "Tools Khác",
        other_tools_header: "Khám phá Tools Khác",
        subheader_download_settings: "Cài đặt Tải xuống",
        auto_download_label: "Tự động tải video:",
        downloads_settings_link: "Cấu hình thư mục",
        downloads_settings_hint: "Mẹo: Tắt 'Hỏi vị trí lưu...' trong cài đặt tải xuống của trình duyệt để tải tự động không bị gián đoạn.",
        log_download_request_sent: "   Đã tải về video mới!",
        log_download_request_failed: "   Lỗi tải: {error}",
        log_selectors_failed: "Lỗi tải Selectors config, sử dụng XPath mặc định (có thể không hoạt động!).",
        wrong_page_message: "Tool chỉ hoạt động trên trang Meta AI Media.<br>Vui lòng điều hướng đến trang đó.",
        go_to_meta: "Chuyển đến Meta AI",
        donate_title: "Mời tác giả một ly cà phê!",
        buy_me_a_coffee: "Mời tôi ly cà phê",
        tab_control: "Điều Khiển",
        tab_settings: "Cài Đặt",
        tab_history: "Lịch Sử",
        prompt_list: "Danh sách prompt",
        import_from_file: "Nhập từ file (.txt)",
        sample_file_link: "(File mẫu .txt)",
        start_button: "Bắt đầu",
        start_button_title: "Bắt đầu chạy",
        stop_button: "Dừng",
        stop_button_title: "Dừng tác vụ",
        status_ready: "Sẵn sàng",
        subheader_general_settings: "Cài đặt Chung",
        unit_number: "số",
        start_from_label_image: "Bắt đầu từ Ảnh số:",
        start_from_label_prompt: "Bắt đầu từ Prompt số:",
        initial_wait_time_label: "Thời gian chờ tạo video (giây):",
        to_label: "đến",
        language_label: "Ngôn ngữ (Language):",
        log_title: "Log chi tiết",
        continue_button: "Tiếp tục",
        continue_button_title: "Tiếp tục chạy",
        pause_button: "Tạm dừng",
        pause_button_title: "Tạm dừng tác vụ",
        status_paused: "Đã tạm dừng ở tác vụ {index}",
        log_paused: "Đã tạm dừng!",
        log_resumed: "Tiếp tục chạy...",
        status_no_prompts: "Vui lòng nhập prompt.",
        status_no_images_or_prompts: "Vui lòng CHỌN ẢNH hoặc NHẬP PROMPT.",
        status_preparing: "Đang chuẩn bị môi trường...",
        log_session_ready: "SẴN SÀNG BẮT ĐẦU PHIÊN MỚI.",
        status_invalid_start_pos: "Vị trí bắt đầu ({start}) lớn hơn tổng số tác vụ ({total}).",
        status_start_error: "Lỗi khi bắt đầu: {error}",
        reset_error: "Dừng do lỗi khởi tạo.",
        log_stop_request: "Yêu cầu dừng...",
        log_prompt_completed: "Hoàn tất gửi tác vụ {index}.",
        reset_user_stop: "Đã dừng bởi người dùng!",
        log_critical_error: "Lỗi nghiêm trọng: Mất ID của tab làm việc.",
        log_scripting_error: "Lỗi scripting: {error}",
        error_tab_closed: "LỖI: Tab làm việc đã bị đóng!",
        log_processing_image: "Đang xử lý Ảnh {index}/{total} (Thử lại {retry}/{maxRetry})...",
        log_processing_prompt: "Đang xử lý Prompt {index}/{total} (Thử lại {retry}/{maxRetry})...",
        log_submit_success: "Đã gửi thành công tác vụ #{index}.",
        log_submit_fail: "Lỗi: Không tìm thấy ô nhập hoặc nút gửi.",
        log_wait_for_video: "Đã gửi tác vụ. Bắt đầu chờ tạo video trong {seconds} giây...",
        log_prompt_failed: "Tác vụ {index} thất bại: {reason}",
        reason_unknown: "Không rõ lý do",
        image_list: "Danh sách ảnh",
        select_images_button: "Chọn nhiều ảnh",
        images_selected: "Đã chọn:",
        clear_images_title: "Xóa danh sách ảnh",
        status_no_images: "Vui lòng chọn ảnh",
        log_file_read_error: "Lỗi đọc file ảnh: {filename}",
        log_image_inject_fail: "Lỗi: Không thể tiêm ảnh hoặc prompt vào trang.",
        log_policy_error_prompt: "Lỗi chính sách với prompt. Bỏ qua.",
        log_retry_task: "Lỗi tác vụ #{index} (lần {retry}). Đang chờ và thử lại...",
        log_skip_task: "Bỏ qua tác vụ #{index} sau {maxRetry} lần thử thất bại.",
        logo_alt_text: "Logo Auto Meta",
        sort_order_label: "Sắp xếp ảnh",
        sort_az: "A-Z",
        sort_za: "Z-A",
        sort_newest: "Mới nhất",
        sort_oldest: "Cũ nhất",
        log_images_sorted: "Đã sắp xếp {count} ảnh theo: {order}",
        subheader_help: "Trợ giúp & Hướng dẫn",
        alert_init_fail: "Lỗi khởi tạo giao diện! Vui lòng tải lại extension.",
        log_event_listener_error: "Lỗi khi gán event listener: {error}",
        log_txt_read_error: "Lỗi đọc file TXT: {error}",
        log_nav_error_or_unexpected_page: "Navigation error or unexpected page. Landed on: {url}",
        log_timeout_nav_homepage: "Timeout waiting for Meta AI navigation.",
        log_load_selectors_fail: "Không thể tải selectors config.",
        log_no_active_tab: "Không tìm thấy tab hoạt động.",
        log_download_full_stop: "Đã tải đủ {downloaded}/{total} video. Dừng ngay lập tức.",
        log_download_full_stop_early: "Đã tải đủ {downloaded}/{total} video. Dừng quét sớm.",
        log_nav_to_meta_error: "Lỗi khi điều hướng đến Meta AI.",
        log_runtime_error: "Runtime Error: {error}",
        log_injected_script_error: "Injected Script Error: {error}",
        log_unknown_runtime_error: "Unknown runtime error",
        log_connection_error: "Could not establish connection",
        log_no_tab_error: "No tab with id",
        log_receiving_end_error: "Receiving end does not exist",
        log_target_page_error: "Target page",
        log_download_runtime_error: "Unknown runtime error",
        log_download_unknown_error: "Unknown error",
        log_check_mode: "Đang kiểm tra chế độ (Video/Ảnh)...",
        log_check_mode_fail: "Lỗi nghiêm trọng: Không thể chuyển sang chế độ video.",
        log_check_view_mode: "Đang kiểm tra chế độ xem (Lưới/Danh sách)...",
        log_check_view_mode_fail: "Lỗi: Không thể chuyển sang chế độ xem lưới.",
        prompt_placeholder_image: "Nhập prompt cho ảnh (sẽ được dùng lặp lại).",
        prompt_placeholder_text: "Nhập prompt (mỗi prompt 1 video, cách nhau bằng dòng trống)."
    },
    en: {
        log_loading_selectors: "Loading selectors...",
        log_using_fallback_selectors: "Using fallback selectors.",
        log_auto_scan_off: "Auto-scan for videos is off.",
        log_open_settings_fail: "Could not open download settings.",
        log_initial_scan_found: "   Found and skipped {count} existing videos on the page.",
        log_final_scan_started: "✅ FINISHED SENDING TASKS! (Final video scan running for 3 minutes)",
        log_final_scan_stopped: "3 minutes of final scanning finished. Stopping scan.",
        log_independent_scan_started: "Started independent video scanning.",
        log_independent_scan_stopped: "Stopped independent video scanning.",
        log_scan_found_videos: "   Found {count} new videos. Starting download process...",
        log_scan_error: "   Error during video scan: {error}",
        log_scan_inject_failed: "   Error injecting video scan script: {error}",
        tab_tools: "More Tools",
        other_tools_header: "Discover Other Tools",
        subheader_download_settings: "Download Settings",
        auto_download_label: "Auto-download videos:",
        downloads_settings_link: "Configure folder",
        downloads_settings_hint: "Tip: Turn off 'Ask where to save...' in your browser's download settings for seamless auto-downloading.",
        log_download_request_sent: "   New video downloaded!",
        log_download_request_failed: "   Error downloading: {error}",
        log_selectors_failed: "Failed to load Selectors config, using default XPaths (may not work!).",
        wrong_page_message: "The tool only works on the Meta AI Media page.<br>Please navigate to that page.",
        go_to_meta: "Go to Meta AI",
        donate_title: "Buy the author a coffee!",
        buy_me_a_coffee: "Buy Me a Coffee",
        tab_control: "Control",
        tab_settings: "Settings",
        tab_history: "History",
        prompt_list: "Prompt List",
        import_from_file: "Import from file (.txt)",
        sample_file_link: "(Sample .txt file)",
        start_button: "Start",
        start_button_title: "Start process",
        stop_button: "Stop",
        stop_button_title: "Stop process",
        status_ready: "Ready",
        subheader_general_settings: "General Settings",
        unit_number: "#",
        start_from_label_image: "Start from Image #:",
        start_from_label_prompt: "Start from Prompt #:",
        initial_wait_time_label: "Video creation wait time (sec):",
        to_label: "to",
        language_label: "Language:",
        log_title: "Detailed Log",
        continue_button: "Continue",
        continue_button_title: "Continue process",
        pause_button: "Pause",
        pause_button_title: "Pause process",
        status_paused: "Paused at task {index}",
        log_paused: "Execution paused!",
        log_resumed: "Resuming execution...",
        status_no_prompts: "Please enter prompts.",
        status_no_images_or_prompts: "Please SELECT IMAGES or ENTER PROMPTS.",
        status_preparing: "Preparing environment...",
        log_session_ready: "READY TO START NEW SESSION.",
        status_invalid_start_pos: "Start position ({start}) is greater than total tasks ({total}).",
        status_start_error: "Error starting: {error}",
        reset_error: "Stopped due to initialization error.",
        log_stop_request: "Stop requested...",
        log_prompt_completed: "Finished submitting task {index}.",
        reset_user_stop: "Stopped by user!",
        log_critical_error: "Critical Error: Lost the working tab ID.",
        log_scripting_error: "Scripting error: {error}",
        error_tab_closed: "ERROR: The working tab was closed!",
        log_processing_image: "Processing Image {index}/{total} (Retry {retry}/{maxRetry})...",
        log_processing_prompt: "Processing Prompt {index}/{total} (Retry {retry}/{maxRetry})...",
        log_submit_success: "Successfully submitted task #{index}.",
        log_submit_fail: "Error: Could not find the prompt input or submit button.",
        log_wait_for_video: "Task submitted. Waiting for {seconds} seconds for video generation...",
        log_prompt_failed: "Task {index} failed: {reason}",
        reason_unknown: "Unknown reason",
        image_list: "Image List",
        select_images_button: "Select multiple images",
        images_selected: "Selected:",
        clear_images_title: "Clear image list",
        status_no_images: "Please select images",
        log_file_read_error: "Error reading file: {filename}",
        log_image_inject_fail: "Error: Could not inject image or prompt.",
        log_policy_error_prompt: "Policy error with prompt. Skipping.",
        log_retry_task: "Task #{index} failed (attempt {retry}). Waiting and retrying...",
        log_skip_task: "Skipping task #{index} after {maxRetry} failed attempts.",
        logo_alt_text: "Auto Meta Logo",
        sort_order_label: "Sort images",
        sort_az: "A-Z",
        sort_za: "Z-A",
        sort_newest: "Newest",
        sort_oldest: "Oldest",
        log_images_sorted: "Sorted {count} images by: {order}",
        subheader_help: "Help & User Guide",
        alert_init_fail: "Interface initialization failed! Please reload the extension.",
        log_event_listener_error: "Error assigning event listener: {error}",
        log_txt_read_error: "Error reading TXT file: {error}",
        log_nav_error_or_unexpected_page: "Navigation error or unexpected page. Landed on: {url}",
        log_timeout_nav_homepage: "Timeout waiting for Meta AI navigation.",
        log_load_selectors_fail: "Could not load selectors config.",
        log_no_active_tab: "Could not find active tab.",
        log_download_full_stop: "Downloaded {downloaded}/{total} videos. Stopping immediately.",
        log_download_full_stop_early: "Downloaded {downloaded}/{total} videos. Stopping scan early.",
        log_nav_to_meta_error: "Error navigating to Meta AI.",
        log_runtime_error: "Runtime Error: {error}",
        log_injected_script_error: "Injected Script Error: {error}",
        log_unknown_runtime_error: "Unknown runtime error",
        log_connection_error: "Could not establish connection",
        log_no_tab_error: "No tab with id",
        log_receiving_end_error: "Receiving end does not exist",
        log_target_page_error: "Target page",
        log_download_runtime_error: "Unknown runtime error",
        log_download_unknown_error: "Unknown error",
        log_check_mode: "Checking mode (Video/Image)...",
        log_check_mode_fail: "Critical Error: Could not switch to video mode.",
        log_check_view_mode: "Checking view mode (Grid/List)...",
        log_check_view_mode_fail: "Error: Could not switch to grid view.",
        prompt_placeholder_image: "Enter prompts for images (will be used cyclically).",
        prompt_placeholder_text: "Enter prompts (1 video per prompt, separated by blank lines)."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    async function fetchSelectors() {
        logMessage(i18n('log_loading_selectors'), "info");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(SELECTORS_CONFIG_URL, {
                signal: controller.signal,
                cache: "no-store"
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const config = await response.json();

            logMessage(config.gist_version ? `Version loaded: ${config.gist_version}` : "Loaded but version key not found.", "success");

            selectors = config.selectors && typeof config.selectors === 'object' ? config.selectors : {};

            if (!selectors.IMAGE_INPUT_SELECTOR) selectors.IMAGE_INPUT_SELECTOR = "input[type='file'][accept*='image']";
            if (!selectors.IMAGE_THUMBNAIL_SELECTOR) selectors.IMAGE_THUMBNAIL_SELECTOR = "img[src^='blob:'][width='100%'][height='100%']";
            if (!selectors.PROMPT_TEXTBOX_SELECTOR) selectors.PROMPT_TEXTBOX_SELECTOR = "div[contenteditable='true'][data-lexical-editor='true'][role='textbox'], div[contenteditable='true'][data-lexical-editor='true'][role='searchbox']";
            if (!selectors.GENERATE_BUTTON_SELECTOR) selectors.GENERATE_BUTTON_SELECTOR = "div[role='button']:has(svg path[d^='M16.0279 6.125']), div[role='button']:has(svg path[d^='M5 5.14'])";
            if (!selectors.PROMPT_POLICY_ERROR_SELECTOR) selectors.PROMPT_POLICY_ERROR_SELECTOR = "div.placeholder-for-policy-error";
            if (!selectors.IMAGE_MODE_BUTTON_SELECTOR) selectors.IMAGE_MODE_BUTTON_SELECTOR = "div[role='button'][tabindex='0']:has(svg path[d^='M9.75 10.25'])";
            if (!selectors.VIDEO_MODE_OPTION_SELECTOR) selectors.VIDEO_MODE_OPTION_SELECTOR = "div[role='menuitem']:has(svg path[fill-rule='evenodd'][d^='M20.5996 6.125']:only-of-type)";
            if (!selectors.VIEW_GRID_ACTIVE_SELECTOR) selectors.VIEW_GRID_ACTIVE_SELECTOR = "div[role=button]:has(svg path[d^='M2 20a2 2'])";
            if (!selectors.VIEW_MENU_BUTTON_SELECTOR) selectors.VIEW_MENU_BUTTON_SELECTOR = "div[role='button'][aria-haspopup='menu'][tabindex='0']:has(svg path[d^='M4 8a2 2'])";
            if (!selectors.VIEW_GRID_OPTION_SELECTOR) selectors.VIEW_GRID_OPTION_SELECTOR = "div[role=menuitem]:has(svg path[d^='M2 20a2 2'])";
            if (!selectors.VIDEO_ITEM_XPATH) selectors.VIDEO_ITEM_XPATH = "//a[starts-with(@href, '/create/')][.//video[@src]]";
            if (!selectors.VIDEO_TAG_IN_ITEM_XPATH) selectors.VIDEO_TAG_IN_ITEM_XPATH = ".//video[@src]";
            if (!selectors.DOWNLOAD_BUTTON_IN_ITEM_SELECTOR) selectors.DOWNLOAD_BUTTON_IN_ITEM_SELECTOR = "div[role='button']:has(svg path[d^='M12 19'])";
            if (!selectors.ALL_VIDEOS_XPATH) selectors.ALL_VIDEOS_XPATH = "//video[@src]";

        } catch (error) {
            clearTimeout(timeoutId);
            logMessage(i18n('log_selectors_failed') + ` Error: ${error.name === 'AbortError' ? 'Timeout' : error.message}`, 'error');
            logMessage(i18n('log_using_fallback_selectors'), "warn");
            selectors = {
                IMAGE_INPUT_SELECTOR: "input[type='file'][accept*='image']",
                IMAGE_THUMBNAIL_SELECTOR: "img[src^='blob:'][width='100%'][height='100%']",
                PROMPT_TEXTBOX_SELECTOR: "div[contenteditable='true'][data-lexical-editor='true'][role='textbox'], div[contenteditable='true'][data-lexical-editor='true'][role='searchbox']",
                GENERATE_BUTTON_SELECTOR: "div[role='button']:has(svg path[d^='M16.0279 6.125']), div[role='button']:has(svg path[d^='M5 5.14'])",
                PROMPT_POLICY_ERROR_SELECTOR: "div.placeholder-for-policy-error",
                IMAGE_MODE_BUTTON_SELECTOR: "div[role='button'][tabindex='0']:has(svg path[d^='M9.75 10.25'])",
                VIDEO_MODE_OPTION_SELECTOR: "div[role='menuitem']:has(svg path[fill-rule='evenodd'][d^='M20.5996 6.125']:only-of-type)",
                VIEW_GRID_ACTIVE_SELECTOR: "div[role=button]:has(svg path[d^='M2 20a2 2'])",
                VIEW_MENU_BUTTON_SELECTOR: "div[role='button'][aria-haspopup='menu'][tabindex='0']:has(svg path[d^='M4 8a2 2'])",
                VIEW_GRID_OPTION_SELECTOR: "div[role=menuitem]:has(svg path[d^='M2 20a2 2'])",
                VIDEO_ITEM_XPATH: "//a[starts-with(@href, '/create/')][.//video[@src]]",
                VIDEO_TAG_IN_ITEM_XPATH: ".//video[@src]",
                DOWNLOAD_BUTTON_IN_ITEM_SELECTOR: "div[role='button']:has(svg path[d^='M12 19'])",
                ALL_VIDEOS_XPATH: "//video[@src]"
            };
        }
    }

    function renderToolsList() {
        if (!fetchedToolsList || fetchedToolsList.length === 0 || !currentLang) return;
        const toolListContainer = document.querySelector('#content-tools .tool-list');
        if (!toolListContainer) return;
        let toolsHTML = '';
        for (const tool of fetchedToolsList) {
            const title = (tool.title && tool.title[currentLang]) || (tool.title && tool.title['en']) || 'No Title';
            const desc = (tool.description && tool.description[currentLang]) || (tool.description && tool.description['en']) || '';
            toolsHTML += `
              <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="tool-card">
                <span class="material-symbols-outlined tool-card-icon">${tool.icon || 'extension'}</span>
                <div class="tool-card-content">
                  <h4 class="tool-card-title">${title}</h4>
                  <p class="tool-card-desc">${desc}</p>
                </div>
              </a>
            `;
        }
        toolListContainer.innerHTML = toolsHTML;
    }

    async function fetchAndInjectAuthorInfo() {
        try {
            const response = await fetch(AUTHOR_API_URL, { cache: "no-store" });
            if (!response.ok) throw new Error(`API request failed`);
            const info = await response.json();
            const authorContainer = document.getElementById('author-info');
            const donateLinkAnchor = document.getElementById('donate-link-anchor');
            if (authorContainer && info.name && info.handle) {
                authorContainer.innerHTML = `<a href="${info.website || '#'}" target="_blank" rel="noopener noreferrer">by ${info.name}<br>${info.handle}</a>`;
            }
            if (donateLinkAnchor && info.donateLink) {
                donateLinkAnchor.href = info.donateLink;
            }
            fetchedToolsList = info.otherTools || [];
            renderToolsList();
        } catch (error) {
            const authorContainer = document.getElementById('author-info');
            if (authorContainer) authorContainer.innerHTML = `by @duckmartians`;
        }
    }

    async function initializeTool() {
        mainActionButton = document.getElementById('mainActionButton');
        stopButton = document.getElementById('stopButton');
        promptsTextarea = document.getElementById('prompts');
        uploadPromptButton = document.getElementById('uploadPromptButton');
        fileInput = document.getElementById('fileInput');
        progressBar = document.getElementById('progressBar');
        liveStatus = document.getElementById('liveStatus');
        logDisplay = document.getElementById('logDisplay');
        mainInterface = document.getElementById('main-interface');
        wrongPageInterface = document.getElementById('wrong-page-interface');
        navigateToFlowButton = document.getElementById('navigateToFlowButton');
        startFromInput = document.getElementById('startFromInput');
        startFromLabel = document.querySelector('label[for="startFromInput"]');
        languageSelector = document.getElementById('languageSelector');
        minInitialWaitTimeInput = document.getElementById('minInitialWaitTime');
        maxInitialWaitTimeInput = document.getElementById('maxInitialWaitTime');
        autoDownloadCheckbox = document.getElementById('autoDownloadCheckbox');
        openDownloadsSettingsLink = document.getElementById('openDownloadsSettingsLink');
        wrongPageMessageElement = document.getElementById('wrong-page-message');
        imageModeContainer = document.getElementById('imageModeContainer');
        imageInput = document.getElementById('imageInput');
        uploadImageButton = document.getElementById('uploadImageButton');
        imageFileSummary = document.getElementById('imageFileSummary');
        imageCount = document.getElementById('imageCount');
        promptListTitle = document.getElementById('promptListTitle');
        promptContainer = document.getElementById('promptContainer');
        imageSortSelector = document.getElementById('imageSortSelector');
        clearImagesButton = document.getElementById('clearImagesButton');

        if (!mainActionButton || !stopButton || !logDisplay || !liveStatus || !uploadPromptButton || !wrongPageMessageElement || !autoDownloadCheckbox || !openDownloadsSettingsLink || !imageInput || !uploadImageButton || !imageSortSelector || !clearImagesButton || !startFromLabel) {
            alert(i18n('alert_init_fail'));
            return;
        }

        await fetchSelectors();

        await fetchAndInjectAuthorInfo();
        loadSettings();
        attachEventListeners();
        updateButtonStates();
        updateInterfaceVisibility();
        chrome.tabs.onActivated.addListener(updateInterfaceVisibility);
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs?.length > 0 && tabId === tabs[0].id && (changeInfo.status || changeInfo.url)) {
                    updateInterfaceVisibility();
                }
            });
        });
    }

    function loadSettings() {
        const browserLang = chrome.i18n.getUILanguage().split('-')[0];
        const initialLang = browserLang === 'vi' ? 'vi' : 'en';
        const defaults = {
            prompts: '',
            startFrom: 1,
            language: initialLang,
            minInitialWait_image: 10,
            maxInitialWait_image: 20,
            minInitialWait_text: 15,
            maxInitialWait_text: 30,
            autoDownload: true,
            imageSort: 'az'
        };
        chrome.storage.local.get(defaults, (result) => {
            promptsTextarea.value = result.prompts;
            startFromInput.value = result.startFrom;

            waitTimes.image.min = result.minInitialWait_image;
            waitTimes.image.max = result.maxInitialWait_image;
            waitTimes.text.min = result.minInitialWait_text;
            waitTimes.text.max = result.maxInitialWait_text;

            languageSelector.value = result.language;
            autoDownloadCheckbox.checked = result.autoDownload;
            imageSortSelector.value = result.imageSort;
            setLanguage(result.language);
        });
    }

    function saveDownloadSettings() {
        chrome.storage.local.set({
            autoDownload: autoDownloadCheckbox.checked,
        });
        if (autoDownloadCheckbox.checked && !downloadInterval) {
            downloadInterval = setInterval(scanAndDownloadVideos, scanIntervalMs);
            if (!isRunning && !finalScanTimerId) { logMessage(i18n('log_independent_scan_started'), "info"); }
        } else if (!autoDownloadCheckbox.checked && downloadInterval) {
            clearInterval(downloadInterval); downloadInterval = null;
            if (!isRunning && !finalScanTimerId) { logMessage(i18n('log_independent_scan_stopped'), "info"); }
            if (finalScanTimerId) { clearTimeout(finalScanTimerId); finalScanTimerId = null; resetState(null, false); }
        }
        updateButtonStates();
    }

    function attachEventListeners() {
        try {
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.getAttribute('data-tab');
                    document.querySelectorAll('.tab-button.active').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-pane.active').forEach(pane => pane.classList.remove('active'));
                    button.classList.add('active');
                    document.getElementById(`content-${tabId}`)?.classList.add('active');
                });
            });

            mainActionButton.addEventListener('click', handleMainActionClick);
            stopButton.addEventListener('click', handleStopClick);

            promptsTextarea.addEventListener('input', () => chrome.storage.local.set({ prompts: promptsTextarea.value }));
            startFromInput.addEventListener('input', () => chrome.storage.local.set({ startFrom: startFromInput.value }));

            minInitialWaitTimeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (imageFileList.length > 0) {
                    waitTimes.image.min = value;
                    chrome.storage.local.set({ minInitialWait_image: value });
                } else {
                    waitTimes.text.min = value;
                    chrome.storage.local.set({ minInitialWait_text: value });
                }
            });
            maxInitialWaitTimeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (imageFileList.length > 0) {
                    waitTimes.image.max = value;
                    chrome.storage.local.set({ maxInitialWait_image: value });
                } else {
                    waitTimes.text.max = value;
                    chrome.storage.local.set({ maxInitialWait_text: value });
                }
            });

            languageSelector.addEventListener('change', (e) => setLanguage(e.target.value));

            autoDownloadCheckbox.addEventListener('change', saveDownloadSettings);

            uploadImageButton.addEventListener('click', () => imageInput.click());
            imageInput.addEventListener('change', handleImageFileSelect);
            imageSortSelector.addEventListener('change', handleImageSortChange);
            clearImagesButton.addEventListener('click', handleClearImages);

            uploadPromptButton.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleTxtImport);

            navigateToFlowButton.addEventListener('click', handleNavigateToMeta);

            openDownloadsSettingsLink.addEventListener('click', (event) => {
                event.preventDefault();
                try { chrome.runtime.sendMessage({ type: 'openDownloadsSettings' }); }
                catch (e) { logMessage(i18n('log_open_settings_fail'), "error"); }
            });

        } catch (error) {
            logMessage(i18n('log_event_listener_error', { error: error.message }), 'error');
        }
    }

    function sortImageFiles(sortOrder) {
        if (!imageFileList || imageFileList.length === 0) return;
        switch (sortOrder) {
            case 'az':
                imageFileList.sort((a, b) => naturalSortCollator.compare(a.name, b.name));
                break;
            case 'za':
                imageFileList.sort((a, b) => naturalSortCollator.compare(b.name, a.name));
                break;
            case 'newest':
                imageFileList.sort((a, b) => b.lastModified - a.lastModified);
                break;
            case 'oldest':
                imageFileList.sort((a, b) => a.lastModified - b.lastModified);
                break;
        }

        const sortOrderText = imageSortSelector.options[imageSortSelector.selectedIndex].text;
        logMessage(i18n('log_images_sorted', { count: imageFileList.length, order: sortOrderText }), 'info');
    }

    function handleImageSortChange(event) {
        const newSortOrder = event.target.value;
        chrome.storage.local.set({ imageSort: newSortOrder });
        sortImageFiles(newSortOrder);
    }

    function updateDynamicLabels() {
        if (imageFileList.length > 0) {
            startFromLabel.textContent = i18n('start_from_label_image');
            promptsTextarea.placeholder = i18n('prompt_placeholder_image');
            minInitialWaitTimeInput.value = waitTimes.image.min;
            maxInitialWaitTimeInput.value = waitTimes.image.max;
        } else {
            startFromLabel.textContent = i18n('start_from_label_prompt');
            promptsTextarea.placeholder = i18n('prompt_placeholder_text');
            minInitialWaitTimeInput.value = waitTimes.text.min;
            maxInitialWaitTimeInput.value = waitTimes.text.max;
        }
    }

    function handleImageFileSelect(event) {
        imageFileList = Array.from(event.target.files);
        const sortOrder = imageSortSelector.value;
        sortImageFiles(sortOrder);
        imageCount.textContent = imageFileList.length;
        imageFileSummary.style.display = 'block';
        updateDynamicLabels();
    }

    function handleClearImages() {
        imageFileList = [];
        if (imageInput) {
            imageInput.value = null;
        }
        if (imageCount) {
            imageCount.textContent = '0';
        }
        if (imageFileSummary) {
            imageFileSummary.style.display = 'none';
        }
        logMessage("Đã xóa danh sách ảnh.", "info");
        updateDynamicLabels();
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => {
                logMessage(i18n('log_file_read_error', { filename: file.name }), 'error');
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    }

    function handleTxtImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (promptsTextarea) {
                    const existingPrompts = promptsTextarea.value.trim();
                    const newPromptsString = e.target.result.trim();
                    promptsTextarea.value = existingPrompts ? `${existingPrompts}\n\n${newPromptsString}` : newPromptsString;
                    chrome.storage.local.set({ prompts: promptsTextarea.value });
                }
            };
            reader.onerror = (e) => logMessage(i18n('log_txt_read_error', { error: e.target.error }), 'error');
            reader.readAsText(file);
        }
        event.target.value = null;
    }

    function handleMainActionClick() {
        if (!mainActionButton) return;
        if (isRunning) {
            isPaused = !isPaused;
            updateMainButton();
            if (isPaused) { updateLiveStatus(i18n('status_paused', { index: currentIndex + 1 }), 'warn'); logMessage(i18n('log_paused'), 'warn'); }
            else { logMessage(i18n('log_resumed'), 'info'); }
        } else {
            startAutomation();
        }
    }

    async function startAutomation() {
        if (zoomResetTimerId) { clearTimeout(zoomResetTimerId); zoomResetTimerId = null; }
        if (finalScanTimerId) { clearTimeout(finalScanTimerId); finalScanTimerId = null; }

        const prompts = promptsTextarea.value.trim().split(/[\r\n]{2,}/).filter(p => p.trim());

        if (imageFileList.length > 0) {
            currentMode = 'image';
            promptList = imageFileList;
            if (prompts.length === 0) {
                updateLiveStatus(i18n('status_no_prompts'), 'error');
                resetState(null, false);
                return;
            }
        } else if (prompts.length > 0) {
            currentMode = 'text';
            promptList = prompts;
        } else {
            updateLiveStatus(i18n('status_no_images_or_prompts'), 'error');
            resetState(null, false);
            return;
        }

        updateLiveStatus(i18n('status_preparing'), 'info');

        try {
            if (Object.keys(selectors).length === 0) {
                logMessage(i18n('log_load_selectors_fail'), "error");
                return;
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.id) throw new Error(i18n('log_no_active_tab'));
            flowTabId = tab.id;

            try {
                await chrome.tabs.setZoom(flowTabId, 0.5);
            } catch (zoomError) {
                logMessage(`Không thể đặt zoom cho tab: ${zoomError.message}`, 'warn');
            }

            isRunning = true; stopRequested = false; isPaused = false;
            updateButtonStates();

            if (!tab.url || !tab.url.startsWith(META_MEDIA_URL)) {
                processedVideoIds.clear();
                updateLiveStatus(i18n('status_preparing'), 'info');
                await chrome.tabs.update(flowTabId, { url: META_MEDIA_URL });

                await new Promise((resolve, reject) => {
                    const listener = (tabId, changeInfo, updatedTab) => {
                        if (tabId === flowTabId && updatedTab.url?.startsWith(META_MEDIA_URL) && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                        else if (tabId === flowTabId && changeInfo.status === 'complete' && !updatedTab.url?.startsWith(META_MEDIA_URL)) {
                            if (!updatedTab.url?.includes("accounts.google.com") && !updatedTab.url?.includes("facebook.com")) {
                                chrome.tabs.onUpdated.removeListener(listener);
                                reject(new Error(i18n('log_nav_error_or_unexpected_page', { url: updatedTab.url })));
                            }
                        }
                    };
                    chrome.tabs.onUpdated.addListener(listener);
                    setTimeout(() => {
                        chrome.tabs.onUpdated.removeListener(listener);
                        reject(new Error(i18n('log_timeout_nav_homepage')));
                    }, 60000);
                });

                const finalUrl = (await chrome.tabs.get(flowTabId)).url;
                logMessage(i18n('log_nav_to_meta_error', { id: finalUrl }), "info");
            } else {
                logMessage(i18n('status_ready'), "info");

                logMessage(i18n('log_check_view_mode'), "info");
                const gridViewSuccess = await injectScript(checkAndSwitchToGridView);
                if (!gridViewSuccess) {
                    logMessage(i18n('log_check_view_mode_fail'), "warn");
                }

                try {
                    await interruptibleSleep(2000);
                    const existingHrefs = await injectScript(scanExistingVideosRobust);
                    if (Array.isArray(existingHrefs) && existingHrefs.length > 0) {
                        existingHrefs.forEach(href => processedVideoIds.add(href));
                        logMessage(i18n('log_initial_scan_found', { count: existingHrefs.length }), 'info');
                    }
                } catch (scanError) {
                    logMessage(i18n('log_scan_error', { error: scanError.message }), 'warn');
                }
            }

            logMessage(i18n('log_check_mode'), "info");
            const modeCheckSuccess = await injectScript(checkAndSwitchToVideoMode);
            if (!modeCheckSuccess) {
                logMessage(i18n('log_check_mode_fail'), "error");
                resetState(i18n('reset_error'), false);
                return;
            }

            if (stopRequested) { resetState(i18n('reset_user_stop'), false); return; }

            chrome.tabs.onRemoved.addListener(handleTabRemoval);
            logDisplay.innerHTML = '';
            logMessage(i18n('log_session_ready'), 'system');
            updateLiveStatus(i18n('status_ready'), 'info');

            const startFrom = parseInt(startFromInput.value, 10) || 1;
            currentIndex = Math.max(0, startFrom - 1);
            if (currentIndex >= promptList.length) {
                updateLiveStatus(i18n('status_invalid_start_pos', { start: startFrom, total: promptList.length }), 'error');
                resetState(null, false); return;
            }

            if (downloadInterval) clearInterval(downloadInterval);
            if (autoDownloadCheckbox.checked) {
                downloadInterval = setInterval(scanAndDownloadVideos, scanIntervalMs);
                logMessage(i18n('log_independent_scan_started'), "info");
            } else {
                logMessage(i18n('log_auto_scan_off'), "info");
            }

            newlyDownloadedCount = 0;
            mainLoop(prompts);

        } catch (error) {
            logMessage(`Lỗi nghiêm trọng khi khởi động: ${error.message}`, "CRITICAL");
            updateLiveStatus(i18n('status_start_error', { error: error.message }), 'error');
            resetState(i18n('reset_error'), false);
        }
    }

    async function mainLoop(promptStrings) {
        const totalTasks = promptList.length;
        totalExpectedVideos = totalTasks * 4; // Meta AI generates 4 videos per prompt

        while (currentIndex < totalTasks && isRunning && !stopRequested) {
            await pauseIfNeeded(); if (stopRequested) break;

            const taskItem = promptList[currentIndex];
            let taskHasFailed = false;

            for (let retry = 0; retry <= MAX_RETRIES; retry++) {
                await pauseIfNeeded(); if (stopRequested) break;

                if (retry > 0) {
                    logMessage(i18n('log_retry_task', { index: currentIndex + 1, retry: retry }), "warn");
                    await interruptibleSleep(5000);
                }

                let statusMessage, success;
                updateProgressBar(currentIndex, totalTasks);

                if (currentMode === 'image') {
                    const imageFile = taskItem;
                    const prompt = promptStrings[currentIndex % promptStrings.length];

                    statusMessage = i18n('log_processing_image', { index: currentIndex + 1, total: totalTasks, retry: retry, maxRetry: MAX_RETRIES });
                    logMessage(statusMessage, 'info');
                    updateLiveStatus(statusMessage, 'info');

                    const dataUrl = await readFileAsDataURL(imageFile);
                    if (!dataUrl) {
                        success = 'FILE_READ_ERROR';
                    } else {
                        success = await injectScript(processMetaTask, [
                            dataUrl, imageFile.name, imageFile.type, prompt
                        ]);
                    }
                } else { // currentMode === 'text'
                    const prompt = taskItem;
                    statusMessage = i18n('log_processing_prompt', { index: currentIndex + 1, total: totalTasks, retry: retry, maxRetry: MAX_RETRIES });
                    logMessage(statusMessage, 'info');
                    updateLiveStatus(statusMessage, 'info');

                    success = await injectScript(processMetaTaskTextOnly, [prompt]);
                }


                if (success === true) {
                    logMessage(i18n('log_submit_success', { index: currentIndex + 1 }), 'success');
                    taskHasFailed = false;
                    break;
                } else {
                    taskHasFailed = true;
                    let reason = i18n('reason_unknown');
                    if (success === 'POLICY_PROMPT') reason = i18n('log_policy_error_prompt');
                    else if (success === 'FILE_READ_ERROR' && currentMode === 'image') reason = i18n('log_file_read_error', { filename: taskItem.name });
                    else if (success === false) reason = i18n('log_image_inject_fail');

                    logMessage(reason, 'error');

                    if (retry === MAX_RETRIES) {
                        logMessage(i18n('log_skip_task', { index: currentIndex + 1, maxRetry: MAX_RETRIES }), 'error');
                    }
                }
            }
            if (stopRequested) break;

            if (!taskHasFailed) {
                const waitTime = getRandomWait(minInitialWaitTimeInput.value, maxInitialWaitTimeInput.value);
                logMessage(i18n('log_wait_for_video', { seconds: Math.round(waitTime / 1000) }), 'info');

                const waitResult = await interruptibleSleep(waitTime);
                if (waitResult === 'STOPPED') {
                    break;
                }
            }
            if (stopRequested) break;
            if (!taskHasFailed) logMessage(i18n('log_prompt_completed', { index: currentIndex + 1 }), 'system');
            currentIndex++;
        }

        if (stopRequested) {
            resetState(i18n('reset_user_stop'), false);
        }
        else if (isRunning) {
            isRunning = false;
            const finalScanMessage = i18n('log_final_scan_started');
            updateLiveStatus(finalScanMessage, 'success'); logMessage(finalScanMessage, 'system');

            if (downloadInterval && totalExpectedVideos > 0 && newlyDownloadedCount >= totalExpectedVideos) {
                logMessage(i18n('log_download_full_stop', { downloaded: newlyDownloadedCount, total: totalExpectedVideos }), 'success');
                resetState(null, false);
            }
            else if (finalScanTimerId) clearTimeout(finalScanTimerId);

            if (downloadInterval) {
                finalScanTimerId = setTimeout(() => {
                    logMessage(i18n('log_final_scan_stopped'), 'warn');
                    resetState(null, false);
                    finalScanTimerId = null;
                }, 180000);
            } else {
                resetState(null, false);
            }
            updateButtonStates();
        }
    }

    function i18n(key, replacements = {}) {
        const langDict = translations[currentLang] || translations['en'] || {};
        let translation = langDict[key] || `[${key}]`;
        for (const placeholder in replacements) translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
        return translation;
    }

    function handleStopClick() {
        if (isRunning || downloadInterval || finalScanTimerId) {
            stopRequested = true; isPaused = false;
            logMessage(i18n('log_stop_request'), "warn");
            if (finalScanTimerId) { clearTimeout(finalScanTimerId); finalScanTimerId = null; }
            if (!isRunning) {
                resetState(i18n('reset_user_stop'), false);
            }
        }
    }

    async function handleNavigateToMeta() {
        try {
            const tabs = await chrome.tabs.query({ url: "*://*.meta.ai/*" });
            let flowTabFound = tabs.find(tab => tab.url?.startsWith(META_MEDIA_URL));
            if (flowTabFound) { await chrome.tabs.update(flowTabFound.id, { active: true }); await chrome.windows.update(flowTabFound.windowId, { focused: true }); }
            else { await chrome.tabs.create({ url: META_MEDIA_URL }); }
        } catch (e) { logMessage(i18n('log_nav_to_meta_error'), "error"); }
    }

    async function updateInterfaceVisibility() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isOnFlow = tab?.url?.startsWith(META_MEDIA_URL);
            mainInterface.style.display = isOnFlow ? 'flex' : 'none';
            wrongPageInterface.style.display = isOnFlow ? 'none' : 'flex';
            if (wrongPageMessageElement && !isOnFlow) { wrongPageMessageElement.innerHTML = i18n('wrong_page_message'); }
        } catch (e) {
            mainInterface.style.display = 'none'; wrongPageInterface.style.display = 'flex';
            if (wrongPageMessageElement) { wrongPageMessageElement.innerHTML = i18n('wrong_page_message'); }
        }
    }

    function updateButtonStates() {
        const isAnyActivityRunning = isRunning || !!downloadInterval || !!finalScanTimerId;
        mainActionButton.disabled = !isRunning && isAnyActivityRunning;
        updateMainButton();
        stopButton.disabled = !isAnyActivityRunning;
        const disableInputs = isRunning;

        [promptsTextarea, uploadPromptButton, startFromInput, languageSelector,
            minInitialWaitTimeInput, maxInitialWaitTimeInput, autoDownloadCheckbox,
            openDownloadsSettingsLink,
            uploadImageButton, imageSortSelector, clearImagesButton]
            .forEach(el => { if (el) el.disabled = disableInputs });

        if (!isRunning) {
            if (uploadImageButton) uploadImageButton.disabled = false;
            if (imageInput) imageInput.disabled = false;
            if (uploadPromptButton) uploadPromptButton.disabled = false;
            if (fileInput) fileInput.disabled = false;
            if (clearImagesButton) clearImagesButton.disabled = false;
            if (autoDownloadCheckbox) autoDownloadCheckbox.disabled = false;
        }
    }

    function updateMainButton() {
        const icon = mainActionButton.querySelector('.material-symbols-outlined');
        const text = mainActionButton.querySelector('span:last-child');
        if (!icon || !text) return;

        if (!isRunning) {
            icon.textContent = 'play_arrow'; text.textContent = i18n('start_button'); mainActionButton.title = i18n('start_button_title');
        } else if (isPaused) {
            icon.textContent = 'play_arrow'; text.textContent = i18n('continue_button'); mainActionButton.title = i18n('continue_button_title');
        } else {
            icon.textContent = 'pause'; text.textContent = i18n('pause_button'); mainActionButton.title = i18n('pause_button_title');
        }
    }

    function setLanguage(lang) {
        currentLang = translations[lang] ? lang : 'en';
        chrome.storage.local.set({ language: currentLang });
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (translations[currentLang]?.[key]) {
                if (el.id === 'wrong-page-message') { el.innerHTML = i18n(key); }
                else {
                    let target = el;
                    if (el.tagName === 'BUTTON' && el.querySelector('.material-symbols-outlined')) {
                        const spans = el.querySelectorAll('span:not(.material-symbols-outlined)');
                        if (spans.length > 0) target = spans[spans.length - 1];
                    }
                    else if (el.classList.contains('tab-button') && el.querySelector('span')) {
                        target = el.querySelector('span:last-of-type');
                    }
                    else if (el.matches('a.sample-link') || el.matches('a#openDownloadsSettingsLink')) {
                        target = el;
                    }
                    else if (el.tagName === 'LABEL' || el.classList.contains('section-title') || el.classList.contains('donate-text') || el.tagName === 'OPTION' || el.classList.contains('mode-toggle-button')) {
                        target = el;
                    }

                    if (target && target.textContent !== i18n(key)) {
                        if (target.classList.contains('mode-toggle-button')) {
                            const icon = target.querySelector('.material-symbols-outlined');
                            target.textContent = i18n(key);
                            target.prepend(icon);
                        } else {
                            target.textContent = i18n(key);
                        }
                    }
                }
            }
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
            if (key) {
                if (key === 'prompt_placeholder') {
                    updateDynamicLabels();
                } else if (translations[currentLang]?.[key]) {
                    el.placeholder = i18n(key);
                }
            }
        });
        document.querySelectorAll('[data-lang-title]').forEach(el => { const key = el.getAttribute('data-lang-title'); if (translations[currentLang]?.[key]) el.title = i18n(key); });

        updateDynamicLabels();
        updateMainButton();
        if (!isRunning && !downloadInterval && !finalScanTimerId) updateLiveStatus(i18n('status_ready'));
        renderToolsList();
    }

    function resetState(message, keepScanning = false) {
        if (!keepScanning && downloadInterval) {
            clearInterval(downloadInterval); downloadInterval = null;
            if (message !== i18n('reset_user_stop')) { logMessage(i18n('log_independent_scan_stopped'), "info"); }
        }
        if (finalScanTimerId) { clearTimeout(finalScanTimerId); finalScanTimerId = null; }
        if (!keepScanning && flowTabId) {
            const finalTabId = flowTabId;
            if (zoomResetTimerId) clearTimeout(zoomResetTimerId);
            zoomResetTimerId = setTimeout(() => {
                try { chrome.tabs.get(finalTabId, (tab) => { if (tab && tab.id === finalTabId) { chrome.tabs.setZoom(finalTabId, 1.0).catch(e => { }); } }); }
                catch (e) { }
                zoomResetTimerId = null;
            }, 500);
        }
        chrome.tabs.onRemoved.removeListener(handleTabRemoval);

        if (!keepScanning) {
            isRunning = false;
            stopRequested = false;
            flowTabId = null;
            totalExpectedVideos = 0;
            newlyDownloadedCount = 0;
        }

        isPaused = false;

        if (!keepScanning) {
            currentIndex = 0;
        }

        updateButtonStates();
        if (!isRunning && !downloadInterval && !finalScanTimerId) {
            if (mainActionButton) mainActionButton.style.display = 'flex';
            if (progressBar) progressBar.value = 0;
        }
        if (message) {
            const type = message.includes('✅') || message === i18n('log_final_scan_started') ? 'success' : (message.includes('Lỗi') || message.includes('Error') || message.includes('Stopped') || message.includes('Dừng') ? 'error' : 'warn');
            updateLiveStatus(message, type);
            logMessage(message, type === 'success' ? 'system' : type);
        } else if (!keepScanning) {
            updateLiveStatus(i18n('status_ready'));
        }
    }

    function getRandomWait(minStr, maxStr) {
        const min = parseInt(minStr || '10', 10) || 10, max = parseInt(maxStr || '20', 10) || 20;
        const actualMin = Math.min(min, max), actualMax = Math.max(min, max);
        return Math.max(1000, (Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin) * 1000);
    }

    async function pauseIfNeeded() { while (isPaused && !stopRequested) await new Promise(r => setTimeout(r, 500)); }

    async function interruptibleSleep(ms) {
        const checkInterval = 250, endTime = Date.now() + ms;
        while (Date.now() < endTime) {
            if (stopRequested) return 'STOPPED';
            const remaining = endTime - Date.now();
            await new Promise(r => setTimeout(r, Math.min(checkInterval, remaining > 0 ? remaining : 0)));
        }
        return 'COMPLETED';
    }

    function handleTabRemoval(tabId) { if (tabId === flowTabId && (isRunning || downloadInterval || finalScanTimerId)) resetState(i18n("error_tab_closed"), false); }
    function updateProgressBar(completed, total) { if (progressBar) progressBar.value = total > 0 ? (completed / total) * 100 : 0; }
    function updateLiveStatus(message, type = 'info') { if (!liveStatus) return; const colorMap = { 'info': 'var(--text-color)', 'success': 'var(--success-color)', 'warn': 'var(--warning-color)', 'error': 'var(--error-color)' }; liveStatus.textContent = message; liveStatus.style.color = colorMap[type]; }
    function logMessage(message, type = 'info') { if (!logDisplay) return; const iconMap = { system: '🔵', success: '🟢', warn: '🟡', error: '🔴', info: '⚪️' }; const entry = document.createElement('div'); const safeMessage = String(message).replace(/<|>/g, "&lt;"); entry.innerHTML = `<span style="color: #9aa0a6; margin-right: 5px;">${new Date().toLocaleTimeString('vi-VN')}</span> ${iconMap[type] || '⚪️'} ${safeMessage}`; logDisplay.appendChild(entry); logDisplay.scrollTop = logDisplay.scrollHeight; }

    async function injectScript(func, args = []) {
        let currentTabId = flowTabId;
        if (!currentTabId) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.url?.startsWith(META_MEDIA_URL)) { currentTabId = tab.id; flowTabId = tab.id; }
                else { logMessage(i18n('log_critical_error'), 'error'); resetState(i18n('log_critical_error'), false); return undefined; }
            } catch (e) {
                logMessage(i18n('log_critical_error'), 'error'); resetState(i18n('log_critical_error'), false); return undefined;
            }
        }

        try {
            await chrome.tabs.get(currentTabId);
        }
        catch (tabError) {
            if (isRunning || downloadInterval || finalScanTimerId) resetState(i18n("error_tab_closed"), false);
            return undefined;
        }
        try {
            const results = await chrome.scripting.executeScript({ target: { tabId: currentTabId }, func: func, args: [...args, selectors], world: 'MAIN' });

            if (chrome.runtime.lastError) {
                const errorMessage = chrome.runtime.lastError.message || i18n('log_unknown_runtime_error');
                if (!stopRequested && !errorMessage.includes(i18n('log_connection_error')) && !errorMessage.includes(i18n('log_no_tab_error')) && !errorMessage.includes(i18n('log_receiving_end_error')) && !errorMessage.includes(i18n('log_target_page_error'))) {
                    logMessage(i18n('log_scripting_error', { error: i18n('log_runtime_error', { error: errorMessage }) }), 'error');
                }
                else if (isRunning || downloadInterval || finalScanTimerId) {
                    if (!errorMessage.includes(i18n('log_no_tab_error')) && !errorMessage.includes(i18n('log_target_page_error'))) {
                        resetState(i18n("error_tab_closed"), false);
                    }
                }
                return undefined;
            }
            if (results?.[0]?.error) { logMessage(i18n('log_scripting_error', { error: i18n('log_injected_script_error', { error: results[0].error.message || results[0].error }) }), 'error'); return undefined; }

            if (results?.[0]?.result !== undefined) {
                return results[0].result;
            }
            return undefined;
        } catch (e) {
            const errorMessage = e.message || String(e);
            if (!stopRequested && !errorMessage.includes(i18n('log_connection_error')) && !errorMessage.includes(i18n('log_no_tab_error'))) {
                logMessage(i18n('log_scan_inject_failed', { error: errorMessage }), 'error');
            }
            return undefined;
        }
    }

    async function checkAndSwitchToGridView(injectedSelectors) {
        function dispatchClick(element) {
            try {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                return true;
            } catch (e) {
                try { element.click(); return true; }
                catch (e2) { return false; }
            }
        }

        async function waitForElement(selector, timeout = 10000) {
            let elapsed = 0;
            const interval = 500;
            while (elapsed < timeout) {
                let element = document.querySelector(selector);
                if (element) {
                    return element;
                }
                await new Promise(r => setTimeout(r, interval));
                elapsed += interval;
            }
            return null;
        }

        try {
            const gridButtonActive = document.querySelector(injectedSelectors.VIEW_GRID_ACTIVE_SELECTOR);

            if (gridButtonActive) {
                return true;
            }

            const menuButton = document.querySelector(injectedSelectors.VIEW_MENU_BUTTON_SELECTOR);
            if (!menuButton) {
                return false;
            }

            if (!dispatchClick(menuButton)) return false;
            await new Promise(r => setTimeout(r, 1000));

            const gridOption = await waitForElement(injectedSelectors.VIEW_GRID_OPTION_SELECTOR, 5000);
            if (!gridOption) {
                return false;
            }

            if (!dispatchClick(gridOption)) return false;
            await new Promise(r => setTimeout(r, 1000));

            return true;
        } catch (e) {
            return false;
        }
    }

    async function checkAndSwitchToVideoMode(injectedSelectors) {

        function dispatchClick(element) {
            try {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                return true;
            } catch (e) {
                try { element.click(); return true; }
                catch (e2) { return false; }
            }
        }

        async function waitForElement(selector, timeout = 10000) {
            let elapsed = 0;
            const interval = 500;
            while (elapsed < timeout) {
                let element = document.querySelector(selector);
                if (element) {
                    return element;
                }
                await new Promise(r => setTimeout(r, interval));
                elapsed += interval;
            }
            return null;
        }

        try {
            const imageModeButton = document.querySelector(injectedSelectors.IMAGE_MODE_BUTTON_SELECTOR);

            if (imageModeButton) {
                if (!dispatchClick(imageModeButton)) return false;

                await new Promise(r => setTimeout(r, 1000));

                const videoModeOption = await waitForElement(injectedSelectors.VIDEO_MODE_OPTION_SELECTOR, 5000);
                if (!videoModeOption) {
                    return false;
                }

                if (!dispatchClick(videoModeOption)) return false;

                await new Promise(r => setTimeout(r, 1000));
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    async function processMetaTask(dataUrl, fileName, fileType, prompt, injectedSelectors) {
        function dataURLtoBlob(dataurl) {
            try {
                var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            } catch (e) {
                return null;
            }
        }

        function dispatchInput(element, data) {
            try {
                element.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, data);
                element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                element.blur();
            } catch (e) {
            }
        }

        function dispatchClick(element) {
            try {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                return true;
            } catch (e) {
                try {
                    element.click();
                    return true;
                } catch (e2) {
                    return false;
                }
            }
        }

        async function waitForElement(selector, timeout = 10000) {
            let elapsed = 0;
            const interval = 500;
            while (elapsed < timeout) {
                let element = document.querySelector(selector);
                if (element) {
                    return element;
                }
                await new Promise(r => setTimeout(r, interval));
                elapsed += interval;
            }
            return null;
        }

        try {
            const inputElement = await waitForElement(injectedSelectors.IMAGE_INPUT_SELECTOR, 10000);
            if (!inputElement) {
                return false;
            }

            const blob = dataURLtoBlob(dataUrl);
            if (!blob) return false;

            const file = new File([blob], fileName, { type: fileType });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            inputElement.files = dataTransfer.files;
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));

            const promptInput = await waitForElement(injectedSelectors.PROMPT_TEXTBOX_SELECTOR, 5000);
            if (!promptInput) {
                return false;
            }
            dispatchInput(promptInput, prompt);

            const imageThumbnail = await waitForElement(injectedSelectors.IMAGE_THUMBNAIL_SELECTOR, 20000);
            if (!imageThumbnail) {
                return false;
            }

            // Wait for image upload to fully complete before clicking generate button
            await new Promise(r => setTimeout(r, 3000));

            let generateButton = null;
            let timeout = 10000;
            const interval = 500;

            while (timeout > 0) {
                generateButton = document.querySelector(injectedSelectors.GENERATE_BUTTON_SELECTOR);

                if (generateButton && !generateButton.disabled && generateButton.getAttribute("aria-disabled") !== "true") {

                    if (!dispatchClick(generateButton)) return false;

                    await new Promise(r => setTimeout(r, 3000));
                    const policyErrorPrompt = document.querySelector(injectedSelectors.PROMPT_POLICY_ERROR_SELECTOR);
                    if (policyErrorPrompt) {
                        return 'POLICY_PROMPT';
                    }
                    return true;
                }

                await new Promise(r => setTimeout(r, interval));
                timeout -= interval;
            }

            return false;

        } catch (e) {
            return false;
        }
    }

    async function processMetaTaskTextOnly(prompt, injectedSelectors) {
        function dispatchInput(element, data) {
            try {
                element.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, data);
                element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                element.blur();
            } catch (e) {
            }
        }

        function dispatchClick(element) {
            try {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                return true;
            } catch (e) {
                try {
                    element.click();
                    return true;
                } catch (e2) {
                    return false;
                }
            }
        }

        async function waitForElement(selector, timeout = 10000) {
            let elapsed = 0;
            const interval = 500;
            while (elapsed < timeout) {
                let element = document.querySelector(selector);
                if (element) {
                    return element;
                }
                await new Promise(r => setTimeout(r, interval));
                elapsed += interval;
            }
            return null;
        }

        try {
            const promptInput = await waitForElement(injectedSelectors.PROMPT_TEXTBOX_SELECTOR, 5000);
            if (!promptInput) {
                return false;
            }
            dispatchInput(promptInput, prompt);

            await new Promise(r => setTimeout(r, 500));

            let generateButton = null;
            let timeout = 10000;
            const interval = 500;

            while (timeout > 0) {
                generateButton = document.querySelector(injectedSelectors.GENERATE_BUTTON_SELECTOR);

                if (generateButton && !generateButton.disabled && generateButton.getAttribute("aria-disabled") !== "true") {

                    if (!dispatchClick(generateButton)) return false;

                    await new Promise(r => setTimeout(r, 3000));
                    const policyErrorPrompt = document.querySelector(injectedSelectors.PROMPT_POLICY_ERROR_SELECTOR);
                    if (policyErrorPrompt) {
                        return 'POLICY_PROMPT';
                    }
                    return true;
                }

                await new Promise(r => setTimeout(r, interval));
                timeout -= interval;
            }

            return false;

        } catch (e) {
            return false;
        }
    }

    async function scanAndDownloadVideos() {
        if (!autoDownloadCheckbox.checked || !flowTabId) return;

        let downloadResults;
        try {
            downloadResults = await injectScript(findNewVideosAndClick, [Array.from(processedVideoIds)]);
        } catch (injectError) {
            logMessage(i18n('log_scan_error', { error: injectError.message }), 'error'); return;
        }

        if (!Array.isArray(downloadResults) || downloadResults.length === 0) {
            return;
        }

        logMessage(i18n('log_scan_found_videos', { count: downloadResults.length }), 'info');

        for (const result of downloadResults) {
            if (result.href && result.clicked && !processedVideoIds.has(result.href)) {
                processedVideoIds.add(result.href);
                newlyDownloadedCount++;
                logMessage(i18n('log_download_request_sent'), 'success');

                if (finalScanTimerId && totalExpectedVideos > 0 && newlyDownloadedCount >= totalExpectedVideos) {
                    logMessage(i18n('log_download_full_stop_early', { downloaded: newlyDownloadedCount, total: totalExpectedVideos }), 'success');
                    clearTimeout(finalScanTimerId);
                    finalScanTimerId = null;
                    if (downloadInterval) {
                        clearInterval(downloadInterval);
                        downloadInterval = null;
                    }
                    resetState(null, false);
                    break;
                }
            }
        }
    }

    function findNewVideosAndClick(processedHrefsOnSidepanel, injectedSelectors) {
        const newDownloads = [];

        function dispatchClick(element) {
            try {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                return true;
            } catch (e) {
                try {
                    element.click();
                    return true;
                } catch (e2) {
                    return false;
                }
            }
        }

        try {
            const itemIterator = document.evaluate(
                injectedSelectors.VIDEO_ITEM_XPATH,
                document,
                null,
                XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                null
            );

            const itemsToProcess = [];
            let itemNode;
            while (itemNode = itemIterator.iterateNext()) {
                itemsToProcess.push(itemNode);
            }

            for (const item of itemsToProcess) {
                const itemHref = item.getAttribute('href');
                if (itemHref && !processedHrefsOnSidepanel.includes(itemHref)) {

                    const downloadButton = item.querySelector(injectedSelectors.DOWNLOAD_BUTTON_IN_ITEM_SELECTOR);

                    if (downloadButton) {
                        if (dispatchClick(downloadButton)) {
                            newDownloads.push({ href: itemHref, clicked: true });
                            // Removed break - continue to download all new videos 
                        }
                    }
                }
            }

        } catch (e) {
        }

        return newDownloads;
    }

    async function scanExistingVideosRobust(injectedSelectors) {

        async function waitForGrid(timeout = 15000) {
            let elapsed = 0;
            const interval = 500;
            while (elapsed < timeout) {
                const firstVideo = document.evaluate(injectedSelectors.ALL_VIDEOS_XPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                if (firstVideo) {
                    return true;
                }

                await new Promise(r => setTimeout(r, interval));
                elapsed += interval;
            }
            return false;
        }

        const existingHrefs = new Set();
        try {
            const gridReady = await waitForGrid();
            if (!gridReady) {
                return Array.from(existingHrefs);
            }

            const itemIterator = document.evaluate(
                injectedSelectors.VIDEO_ITEM_XPATH,
                document,
                null,
                XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                null
            );

            let itemNode;
            while (itemNode = itemIterator.iterateNext()) {
                const itemHref = itemNode.getAttribute('href');
                if (itemHref) {
                    existingHrefs.add(itemHref);
                }
            }
        } catch (e) {
        }
        return Array.from(existingHrefs);
    }

    initializeTool();
});