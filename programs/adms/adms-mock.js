// adms-mock.js
(function() {
    const originalFetch = window.fetch;
    
    // Inject a virtual pywebview object to mock desktop folder browsing and dialogs in the browser
    window.pywebview = {
        api: {
            select_folder: async function(initialDir) {
                const path = prompt("설정할 가상 폴더 경로를 입력하세요:", initialDir || "C:\\ADMS\\NewFolder");
                return path;
            },
            confirm_dialog: async function(title, message) {
                return confirm(message);
            }
        }
    };

    // Helper to initialize local storage
    const DEFAULT_CONFIG = {
        original_dir: "C:\\ADMS\\Original",
        shape_dir: "C:\\ADMS\\Shape",
        modified_dir: "C:\\ADMS\\Modified",
        presets: [
            "C:\\ADMS\\Original",
            "C:\\ADMS\\Shape",
            "C:\\ADMS\\Modified"
        ]
    };

    const MOCK_HISTORY_INIT = [
        {
            id: "entry_mock_1",
            timestamp: "2026-06-18 10:15:32",
            part_number: "TEST002-A-01",
            excel_original: "TEST002-A-01_설계데이터.xlsm",
            pdf_original: "TEST002-A-01_도면.pdf",
            original_dir: "C:\\ADMS\\Original",
            status: "success",
            corrected_items: [
                {
                    row: 15,
                    char_val: "어댑터 두께 (Adapter Thickness)",
                    type: "상한 초과",
                    nominal: 5.0000,
                    lower_tol: -0.0200,
                    upper_tol: 0.0200,
                    original_actual: 5.0350,
                    corrected_actual: 5.0150,
                    excess_val: 0.0150,
                    correction_val: -0.0200
                },
                {
                    row: 32,
                    char_val: "베어링 하우징 내경 (Housing Bore)",
                    type: "하한 초과",
                    nominal: 45.0000,
                    lower_tol: -0.0100,
                    upper_tol: 0.0100,
                    original_actual: 44.9850,
                    corrected_actual: 44.9950,
                    excess_val: -0.0050,
                    correction_val: 0.0100
                }
            ]
        },
        {
            id: "entry_mock_2",
            timestamp: "2026-06-17 14:20:11",
            part_number: "TEST001-A-01",
            excel_original: "TEST001-A-01_설계데이터.xlsm",
            pdf_original: "TEST001-A-01_도면.pdf",
            original_dir: "C:\\ADMS\\Original",
            status: "success",
            corrected_items: [] // No corrections (all within limits)
        }
    ];

    function initData() {
        if (!localStorage.getItem('adms_config')) {
            localStorage.setItem('adms_config', JSON.stringify(DEFAULT_CONFIG));
        }
        if (!localStorage.getItem('adms_history')) {
            localStorage.setItem('adms_history', JSON.stringify(MOCK_HISTORY_INIT));
        }
        if (!localStorage.getItem('adms_autotest_count')) {
            localStorage.setItem('adms_autotest_count', '2');
        }
    }

    // Intercept fetch calls
    window.fetch = async function(resource, options) {
        initData();
        const urlStr = typeof resource === 'string' ? resource : resource.url;
        
        // 1. GET /api/config
        if (urlStr.includes('/api/config') && (!options || options.method === 'GET' || !options.method)) {
            const config = JSON.parse(localStorage.getItem('adms_config'));
            return new Response(JSON.stringify({
                success: true,
                config: config,
                presets: config.presets || []
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 2. POST /api/config
        if (urlStr.includes('/api/config') && options && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const config = JSON.parse(localStorage.getItem('adms_config'));
            config.original_dir = body.original_dir;
            config.shape_dir = body.shape_dir;
            config.modified_dir = body.modified_dir;
            localStorage.setItem('adms_config', JSON.stringify(config));
            return new Response(JSON.stringify({
                success: true,
                message: "설정이 성공적으로 저장되었습니다."
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 3. POST /api/config/default
        if (urlStr.includes('/api/config/default') && options && options.method === 'POST') {
            const config = JSON.parse(localStorage.getItem('adms_config'));
            config.original_dir = DEFAULT_CONFIG.original_dir;
            config.shape_dir = DEFAULT_CONFIG.shape_dir;
            config.modified_dir = DEFAULT_CONFIG.modified_dir;
            localStorage.setItem('adms_config', JSON.stringify(config));
            return new Response(JSON.stringify({
                success: true,
                message: "기본 경로로 재설정되었습니다."
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 4. POST /api/presets/add
        if (urlStr.includes('/api/presets/add') && options && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const config = JSON.parse(localStorage.getItem('adms_config'));
            if (!config.presets.includes(body.path)) {
                config.presets.push(body.path);
                if (config.presets.length > 10) {
                    config.presets.shift(); // Limit to max 10 presets
                }
            }
            localStorage.setItem('adms_config', JSON.stringify(config));
            return new Response(JSON.stringify({
                success: true,
                message: "프리셋 경로가 추가되었습니다.",
                presets: config.presets
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 5. POST /api/presets/delete
        if (urlStr.includes('/api/presets/delete') && options && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const config = JSON.parse(localStorage.getItem('adms_config'));
            config.presets = config.presets.filter(p => p !== body.path);
            localStorage.setItem('adms_config', JSON.stringify(config));
            return new Response(JSON.stringify({
                success: true,
                message: "프리셋 경로가 삭제되었습니다.",
                presets: config.presets
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 6. POST /api/parse-excel - Simulate D11 part number extraction
        if (urlStr.includes('/api/parse-excel') && options && options.method === 'POST') {
            // Get file name from FormData
            let filename = "MK700-R-01";
            const fileObj = options.body.get('excel_file');
            if (fileObj && fileObj.name) {
                // Try to clean name to get part number
                const cleanName = fileObj.name.replace(/\.[^/.]+$/, ""); // strip extension
                filename = cleanName.split('_')[0] || cleanName;
            }
            
            // Format to a part number style
            if (!filename.includes('-')) {
                filename = `${filename}-R-03`;
            }
            
            // Store temporarily in sessionStorage for process endpoint to fetch
            sessionStorage.setItem('adms_extracted_part', filename);
            sessionStorage.setItem('adms_excel_filename', fileObj ? fileObj.name : "unknown.xlsm");

            return new Response(JSON.stringify({
                success: true,
                part_number: filename
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 7. POST /api/process - Simulate outlier correction run
        if (urlStr.includes('/api/process') && options && options.method === 'POST') {
            const partNumber = sessionStorage.getItem('adms_extracted_part') || "MK700-R-03";
            const excelFilename = sessionStorage.getItem('adms_excel_filename') || "unknown.xlsm";
            const pdfFileObj = options.body.get('pdf_file');
            const pdfFilename = pdfFileObj ? pdfFileObj.name : "unknown.pdf";
            
            const config = JSON.parse(localStorage.getItem('adms_config'));
            const history = JSON.parse(localStorage.getItem('adms_history') || '[]');
            
            // Generate mock corrected outliers
            const correctedItems = [
                {
                    row: 8,
                    char_val: "축 외경 (Shaft Outer Diameter)",
                    type: "상한 초과",
                    nominal: 20.0000,
                    lower_tol: -0.0100,
                    upper_tol: 0.0100,
                    original_actual: 20.0180,
                    corrected_actual: 20.0080,
                    excess_val: 0.0080,
                    correction_val: -0.0100
                },
                {
                    row: 24,
                    char_val: "하우징 깊이 (Housing Depth)",
                    type: "하한 초과",
                    nominal: 12.5000,
                    lower_tol: -0.0500,
                    upper_tol: 0.0500,
                    original_actual: 12.4350,
                    corrected_actual: 12.4850,
                    excess_val: -0.0150,
                    correction_val: 0.0500
                }
            ];
            
            const now = new Date();
            const timestampStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ` +
                                 `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            
            const newEntry = {
                id: "entry_" + Math.random().toString(36).substring(2, 11),
                timestamp: timestampStr,
                part_number: partNumber,
                excel_original: excelFilename,
                pdf_original: pdfFilename,
                original_dir: config.original_dir,
                status: "success",
                corrected_items: correctedItems
            };
            
            history.unshift(newEntry); // Prepend to history
            localStorage.setItem('adms_history', JSON.stringify(history));
            
            // Add to preset list automatically if not present (simulates backend preset caching)
            if (!config.presets.includes(config.original_dir)) {
                config.presets.push(config.original_dir);
                localStorage.setItem('adms_config', JSON.stringify(config));
            }
            
            return new Response(JSON.stringify({
                success: true,
                part_number: partNumber,
                message: "성공적으로 저장되었습니다."
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 8. GET /api/history
        if (urlStr.includes('/api/history') && (!options || options.method === 'GET' || !options.method)) {
            const history = JSON.parse(localStorage.getItem('adms_history') || '[]');
            return new Response(JSON.stringify({
                success: true,
                history: history
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 9. POST /api/history/clear
        if (urlStr.includes('/api/history/clear') && options && options.method === 'POST') {
            localStorage.setItem('adms_history', JSON.stringify([]));
            localStorage.setItem('adms_autotest_count', '0');
            return new Response(JSON.stringify({
                success: true,
                message: "이력이 전체 삭제되었습니다."
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 10. POST /api/history/delete/:id
        if (urlStr.includes('/api/history/delete/') && !urlStr.includes('delete-selected')) {
            const entryId = urlStr.substring(urlStr.lastIndexOf('/') + 1);
            let history = JSON.parse(localStorage.getItem('adms_history') || '[]');
            history = history.filter(item => item.id !== entryId);
            localStorage.setItem('adms_history', JSON.stringify(history));
            return new Response(JSON.stringify({
                success: true,
                message: "이력이 성공적으로 삭제되었습니다."
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 11. POST /api/history/delete-selected
        if (urlStr.includes('/api/history/delete-selected') && options && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const idsToDelete = body.ids || [];
            let history = JSON.parse(localStorage.getItem('adms_history') || '[]');
            history = history.filter(item => !idsToDelete.includes(item.id));
            localStorage.setItem('adms_history', JSON.stringify(history));
            return new Response(JSON.stringify({
                success: true,
                message: `${idsToDelete.length}개의 이력이 삭제되었습니다.`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Pass through unmodified requests
        return originalFetch.apply(this, arguments);
    };
})();
