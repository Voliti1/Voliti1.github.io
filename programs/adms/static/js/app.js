// 전역 상태 변수
let config = {
    original_dir: "",
    shape_dir: "",
    modified_dir: ""
};
let excelFile = null;
let pdfFile = null;
let extractedPartNumber = "";

// 이력 페이징 및 검색 상태
let allHistoryList = [];
let filteredHistoryList = [];
let currentPage = 1;
const itemsPerPage = 50;

// 프리셋 상태 변수
let presetsList = [];

// DOM 요소
const originalDirInput = document.getElementById('originalDirInput');
const shapeDirInput = document.getElementById('shapeDirInput');
const modifiedDirInput = document.getElementById('modifiedDirInput');

const btnSelectOriginal = document.getElementById('btnSelectOriginal');
const btnSelectShape = document.getElementById('btnSelectShape');
const btnSelectModified = document.getElementById('btnSelectModified');

// 프리뷰 요소
const excelBox = document.getElementById('excelBox');
const excelName = document.getElementById('excelName');
const excelMeta = document.getElementById('excelMeta');
const excelStatus = document.getElementById('excelStatus');

const pdfBox = document.getElementById('pdfBox');
const pdfName = document.getElementById('pdfName');
const pdfMeta = document.getElementById('pdfMeta');
const pdfStatus = document.getElementById('pdfStatus');

const partNumberValue = document.getElementById('partNumberValue');
const parsingSpinner = document.getElementById('parsingSpinner');

const excelSavePath = document.getElementById('excelSavePath');
const pdfSavePath = document.getElementById('pdfSavePath');
const modifiedSavePath = document.getElementById('modifiedSavePath');

// 버튼 요소
const resetBtn = document.getElementById('resetBtn');
const processBtn = document.getElementById('processBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const deleteSelectedHistoryBtn = document.getElementById('deleteSelectedHistoryBtn');
const checkAllHistory = document.getElementById('checkAllHistory');
const historyBody = document.getElementById('historyBody');

// 검색 및 페이징 요소
const historyDateInput = document.getElementById('historyDateInput');
const historySearchInput = document.getElementById('historySearchInput');
const btnSearchHistory = document.getElementById('btnSearchHistory');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');
const pageInfo = document.getElementById('pageInfo');

// 프리셋 모달 요소 (렌더링 안정성을 위해 함수 내에서 동적 획득하여 사용함)
const btnSetDefaultPaths = document.getElementById('btnSetDefaultPaths');

// 토스트 요소
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMessage = document.getElementById('toastMessage');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadHistory();
    setupDragAndDrop();
    setupEventListeners();
});

// 설정 로드
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.success && data.config) {
            config = data.config;
            originalDirInput.value = config.original_dir || "";
            shapeDirInput.value = config.shape_dir || "";
            modifiedDirInput.value = config.modified_dir || "";
            presetsList = config.presets || [];
            updateSavePathsPreview();
        }
    } catch (error) {
        console.error('설정 로드 중 오류:', error);
        showToast('error', '서버에서 설정 정보를 불러오지 못했습니다.');
    }
}

// 설정 저장 API
async function saveCurrentConfig() {
    config.original_dir = originalDirInput.value.trim();
    config.shape_dir = shapeDirInput.value.trim();
    config.modified_dir = modifiedDirInput.value.trim();
    
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await response.json();
        if (data.success) {
            updateSavePathsPreview();
            checkReadyState();
        } else {
            showToast('error', data.message || '설정 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('설정 저장 중 오류:', error);
        showToast('error', '설정을 저장하는 과정에서 네트워크 오류가 발생했습니다.');
    }
}

// pywebview 폴더 다이얼로그 호출
async function browseFolder(targetInput, initialDir) {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.select_folder) {
        try {
            const selectedPath = await window.pywebview.api.select_folder(initialDir || "");
            if (selectedPath) {
                targetInput.value = selectedPath;
                saveCurrentConfig();
                showToast('success', '폴더 경로가 설정되었습니다.');
            }
        } catch (err) {
            console.error('폴더 대화상자 실행 오류:', err);
            showToast('error', '폴더 선택창을 여는 데 실패했습니다.');
        }
    } else {
        // 브라우저 환경 등 pywebview가 작동하지 않는 경우 알림
        alert('이 기능은 데스크톱 전용 창(app.exe)으로 실행 시에만 폴더 탐색창을 지원합니다.\n경로를 수동으로 지정하려면 관리자에게 문의해 주세요.');
    }
}

// 저장 예상 경로 업데이트
function updateSavePathsPreview() {
    const partNumText = extractedPartNumber || "[품번]";
    
    if (config.original_dir) {
        excelSavePath.textContent = `${config.original_dir}\\${partNumText}.xlsm`;
    } else {
        excelSavePath.textContent = "경로 미지정";
    }
    
    if (config.shape_dir) {
        pdfSavePath.textContent = `${config.shape_dir}\\${partNumText}.pdf`;
    } else {
        pdfSavePath.textContent = "경로 미지정";
    }

    if (config.modified_dir) {
        modifiedSavePath.textContent = `${config.modified_dir}\\${partNumText}.xlsx`;
    } else {
        modifiedSavePath.textContent = "경로 미지정";
    }
    
    if (extractedPartNumber) {
        excelSavePath.classList.add('highlight');
        pdfSavePath.classList.add('highlight');
        modifiedSavePath.classList.add('highlight');
    } else {
        excelSavePath.classList.remove('highlight');
        pdfSavePath.classList.remove('highlight');
        modifiedSavePath.classList.remove('highlight');
    }
}

// 이벤트 리스너 등록
function setupEventListeners() {
    btnSelectOriginal.addEventListener('click', () => browseFolder(originalDirInput, originalDirInput.value));
    btnSelectShape.addEventListener('click', () => browseFolder(shapeDirInput, shapeDirInput.value));
    btnSelectModified.addEventListener('click', () => browseFolder(modifiedDirInput, modifiedDirInput.value));

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    resetBtn.addEventListener('click', resetApp);
    processBtn.addEventListener('click', processFiles);
    clearHistoryBtn.addEventListener('click', clearHistory);
    deleteSelectedHistoryBtn.addEventListener('click', deleteSelectedHistory);
    
    // 전체 선택/해제 체크박스 이벤트 바인딩
    if (checkAllHistory) {
        checkAllHistory.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.history-item-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
    }

    // 검색 및 페이징 이벤트 바인딩
    if (btnSearchHistory) {
        btnSearchHistory.addEventListener('click', filterHistory);
    }
    if (historyDateInput) {
        historyDateInput.addEventListener('change', filterHistory);
    }
    if (historySearchInput) {
        historySearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterHistory();
            }
        });
    }
    if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderHistoryPage();
            }
        });
    }
    if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredHistoryList.length / itemsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderHistoryPage();
            }
        });
    }

    // 프리셋 이벤트 바인딩
    const openBtn = document.getElementById('btnOpenPresetModal');
    if (openBtn) {
        openBtn.addEventListener('click', async () => {
            const modal = document.getElementById('presetModal');
            if (modal) {
                await loadConfig(); // 모달 오픈 시점에 최신 프리셋 동기화 로드
                modal.classList.add('show');
                renderPresets();
            }
        });
    }
    const closeBtn = document.getElementById('btnClosePresetModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('presetModal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('presetModal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    const addBtn = document.getElementById('btnAddPreset');
    if (addBtn) {
        addBtn.addEventListener('click', addPresetPath);
    }
    const browseBtn = document.getElementById('btnBrowsePreset');
    if (browseBtn) {
        browseBtn.addEventListener('click', browsePresetFolder);
    }
    if (btnSetDefaultPaths) {
        btnSetDefaultPaths.addEventListener('click', setDefaultPaths);
    }
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });
}

// 드롭된 파일 처리
function handleFiles(files) {
    // 저장 경로 설정 여부 유효성 검사
    if (!originalDirInput.value || !shapeDirInput.value || !modifiedDirInput.value) {
        showToast('error', '먼저 저장 폴더들의 경로를 모두 지정해 주세요.');
        return;
    }

    let xlsmFound = null;
    let pdfFound = null;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (ext === 'xlsm') {
            xlsmFound = file;
        } else if (ext === 'pdf') {
            pdfFound = file;
        }
    }

    if (xlsmFound) {
        excelFile = xlsmFound;
        excelName.textContent = excelFile.name;
        excelMeta.textContent = formatBytes(excelFile.size);
        excelStatus.textContent = '불러옴';
        excelStatus.className = 'file-status-badge loaded';
        excelBox.classList.add('active');
        
        // 엑셀 파싱 시작
        parseExcelD11(excelFile);
    }

    if (pdfFound) {
        pdfFile = pdfFound;
        pdfName.textContent = pdfFile.name;
        pdfMeta.textContent = formatBytes(pdfFile.size);
        pdfStatus.textContent = '불러옴';
        pdfStatus.className = 'file-status-badge loaded';
        pdfBox.classList.add('active');
    }

    if (!xlsmFound && !pdfFound) {
        showToast('error', '적절한 파일 형식이 아닙니다. (.xlsm 또는 .pdf 파일을 드롭해 주세요)');
    } else {
        checkReadyState();
    }
}

// 엑셀 파일 D11 파싱 API 호출
async function parseExcelD11(file) {
    extractedPartNumber = "";
    partNumberValue.textContent = "---";
    parsingSpinner.style.display = 'block';
    updateSavePathsPreview();
    
    const formData = new FormData();
    formData.append('excel_file', file);
    
    try {
        const response = await fetch('/api/parse-excel', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        parsingSpinner.style.display = 'none';
        
        if (data.success) {
            extractedPartNumber = data.part_number;
            partNumberValue.textContent = extractedPartNumber;
            updateSavePathsPreview();
            showToast('success', `품번 추출 성공: ${extractedPartNumber}`);
        } else {
            showToast('error', data.message || '품번 추출에 실패했습니다.');
            partNumberValue.textContent = "오류";
        }
    } catch (error) {
        console.error('엑셀 분석 중 오류:', error);
        parsingSpinner.style.display = 'none';
        partNumberValue.textContent = "연결 실패";
        showToast('error', '엑셀 파싱 서버와의 통신에 실패했습니다.');
    }
    checkReadyState();
}

// 매칭 및 저장 가능 상태 확인
function checkReadyState() {
    const hasPaths = originalDirInput.value && shapeDirInput.value && modifiedDirInput.value;
    const isReady = hasPaths && excelFile && pdfFile && extractedPartNumber;
    processBtn.disabled = !isReady;
}

// 매칭 저장 처리 진행
async function processFiles() {
    if (!excelFile || !pdfFile || !extractedPartNumber) {
        return;
    }
    
    // UI 로딩 처리
    const btnText = processBtn.querySelector('.btn-text');
    const btnSpinner = processBtn.querySelector('.btn-spinner');
    
    btnText.textContent = "처리 중...";
    btnSpinner.style.display = 'inline-block';
    processBtn.disabled = true;
    resetBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('excel_file', excelFile);
    formData.append('pdf_file', pdfFile);
    
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        btnText.textContent = "저장 실행";
        btnSpinner.style.display = 'none';
        resetBtn.disabled = false;
        
        if (data.success) {
            showToast('success', `성공적으로 저장되었습니다! 품번: ${data.part_number}`);
            resetApp();
            loadHistory();
            loadConfig(); // 저장 실행 시 프리셋 동기화 갱신!
        } else {
            showToast('error', data.message || '저장 처리 중 에러가 발생했습니다.');
            processBtn.disabled = false;
        }
    } catch (error) {
        console.error('파일 저장 처리 중 오류:', error);
        btnText.textContent = "저장 실행";
        btnSpinner.style.display = 'none';
        resetBtn.disabled = false;
        processBtn.disabled = false;
        showToast('error', '파일 처리 과정에서 네트워크 오류가 발생했습니다.');
    }
}

// 앱 초기화
function resetApp() {
    excelFile = null;
    pdfFile = null;
    extractedPartNumber = "";
    
    fileInput.value = '';
    
    excelName.textContent = "엑셀 파일이 준비되지 않았습니다.";
    excelMeta.textContent = "파일을 드롭해 주세요 (.xlsm)";
    excelStatus.textContent = "대기 중";
    excelStatus.className = "file-status-badge";
    excelBox.classList.remove('active');
    
    pdfName.textContent = "PDF 파일이 준비되지 않았습니다.";
    pdfMeta.textContent = "파일을 드롭해 주세요 (.pdf)";
    pdfStatus.textContent = "대기 중";
    pdfStatus.className = "file-status-badge";
    pdfBox.classList.remove('active');
    
    partNumberValue.textContent = "---";
    parsingSpinner.style.display = 'none';
    
    updateSavePathsPreview();
    checkReadyState();
}

// 최근 이력 로드
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        if (data.success) {
            allHistoryList = data.history || [];
            filterHistory();
        }
    } catch (error) {
        console.error('이력 로드 실패:', error);
    }
}

// 이력 검색 필터링
function filterHistory() {
    const query = historySearchInput ? historySearchInput.value.trim().toLowerCase() : "";
    const selectedDate = historyDateInput ? historyDateInput.value : "";
    
    let tempHistory = allHistoryList;
    if (selectedDate) {
        tempHistory = tempHistory.filter(item => {
            const itemDate = (item.timestamp || "").substring(0, 10);
            return itemDate === selectedDate;
        });
    }
    
    if (!query) {
        filteredHistoryList = [...tempHistory];
    } else {
        filteredHistoryList = tempHistory.filter(item => {
            const timestamp = (item.timestamp || "").toLowerCase();
            const partNumber = (item.part_number || "").toLowerCase();
            const excelOriginal = (item.excel_original || "").toLowerCase();
            const pdfOriginal = (item.pdf_original || "").toLowerCase();
            const folderPath = (item.original_dir || "").toLowerCase();
            
            return timestamp.includes(query) || 
                   partNumber.includes(query) || 
                   excelOriginal.includes(query) || 
                   pdfOriginal.includes(query) ||
                   folderPath.includes(query);
        });
    }
    
    currentPage = 1;
    renderHistoryPage();
}

// 이력 페이징 렌더링
function renderHistoryPage() {
    const totalPages = Math.ceil(filteredHistoryList.length / itemsPerPage) || 1;
    
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredHistoryList.slice(startIndex, endIndex);
    
    renderHistory(pageData);
    
    if (pageInfo) {
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
    }
    
    if (btnPrevPage) {
        btnPrevPage.disabled = (currentPage === 1);
    }
    if (btnNextPage) {
        btnNextPage.disabled = (currentPage === totalPages);
    }
}

// 이력 테이블 렌더링
function renderHistory(historyList) {
    if (!historyList || historyList.length === 0) {
        historyBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-history">처리 이력이 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    historyBody.innerHTML = '';
    historyList.forEach(item => {
        const tr = document.createElement('tr');
        
        // 대상 폴더 컬럼의 가독성을 위해 폴더명만 추출하거나 말줄임 처리
        const folderPath = item.original_dir || "";
        const folderName = folderPath.substring(folderPath.lastIndexOf('\\') + 1) || folderPath;

        // 수정이력 확인 버튼의 활성화 상태 정의 (보정된 항목이 있는 성공 건만 활성화)
        const hasCorrections = item.status === 'success' && item.corrected_items && item.corrected_items.length > 0;
        const viewBtnHtml = hasCorrections
            ? `<button class="btn-action btn-view-action" onclick="viewCorrectionDetail('${item.id}', '${item.part_number || ''}')">확인</button>`
            : `<button class="btn-action btn-view-action" disabled title="수정된 이상치가 없습니다.">확인</button>`;

        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="history-item-checkbox" data-id="${item.id}" style="cursor: pointer;">
            </td>
            <td>${item.timestamp}</td>
            <td><strong>${item.part_number || '미추출'}</strong></td>
            <td title="${item.excel_original}">${item.excel_original}</td>
            <td title="${item.pdf_original}">${item.pdf_original}</td>
            <td title="${folderPath}">${folderName}</td>
            <td>
                <button class="btn-action btn-delete-action" onclick="deleteHistoryEntry('${item.id}', '${item.part_number || ''}')">삭제</button>
            </td>
            <td>${viewBtnHtml}</td>
        `;
        historyBody.appendChild(tr);
    });
    
    // 전체 선택 체크박스 상태 초기화
    if (checkAllHistory) {
        checkAllHistory.checked = false;
    }
}

// 이력 전체 삭제
async function clearHistory() {
    let confirmed = false;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.confirm_dialog) {
        confirmed = await window.pywebview.api.confirm_dialog('이력 전체 삭제', '이력 전체를 삭제하시겠습니까?');
    } else {
        confirmed = confirm('이력 전체를 삭제하시겠습니까?');
    }
    
    if (!confirmed) return;
    
    try {
        const response = await fetch('/api/history/clear', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            showToast('success', '이력이 초기화되었습니다.');
            loadHistory();
        }
    } catch (error) {
        console.error('이력 삭제 중 오류:', error);
        showToast('error', '이력 삭제 처리에 실패했습니다.');
    }
}

// 개별 이력 및 실제 연동 파일 삭제
async function deleteHistoryEntry(entryId, partNumber) {
    let confirmed = false;
    const msg = `품번 [${partNumber || '미추출'}]의 이력과 저장된 파일(원본, 도면형상, 수정본)을 모두 삭제하시겠습니까?`;
    
    if (window.pywebview && window.pywebview.api && window.pywebview.api.confirm_dialog) {
        confirmed = await window.pywebview.api.confirm_dialog('이력 및 파일 삭제', msg);
    } else {
        confirmed = confirm(msg);
    }
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`/api/history/delete/${entryId}`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            showToast('success', data.message);
            loadHistory();
        } else {
            showToast('error', data.message || '삭제 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('이력 개별 삭제 중 오류:', error);
        showToast('error', '삭제 처리 과정에서 네트워크 오류가 발생했습니다.');
    }
}

// 이상치 수정 항목 새 창으로 확인
function viewCorrectionDetail(entryId, partNumber) {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.open_detail_window) {
        window.pywebview.api.open_detail_window(entryId, partNumber);
    } else {
        // 브라우저 환경 디버깅을 위한 fallback
        window.open(`./detail.html?id=${entryId}`, '_blank', 'width=900,height=600,resizable=yes');
    }
}

// 선택한 이력 삭제 (실제 파일은 미삭제)
async function deleteSelectedHistory() {
    const checkedBoxes = document.querySelectorAll('.history-item-checkbox:checked');
    if (checkedBoxes.length === 0) {
        showToast('error', '선택된 이력이 없습니다.');
        return;
    }
    
    const ids = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
    
    let confirmed = false;
    const msg = `선택한 ${ids.length}개의 이력을 목록에서 삭제하시겠습니까?\n(저장된 실제 파일은 삭제되지 않습니다.)`;
    
    if (window.pywebview && window.pywebview.api && window.pywebview.api.confirm_dialog) {
        confirmed = await window.pywebview.api.confirm_dialog('선택 이력 삭제', msg);
    } else {
        confirmed = confirm(msg);
    }
    
    if (!confirmed) return;
    
    try {
        const response = await fetch('/api/history/delete-selected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', data.message);
            loadHistory();
        } else {
            showToast('error', data.message || '이력 선택 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('선택 이력 삭제 중 오류:', error);
        showToast('error', '이력 삭제 처리 중 네트워크 오류가 발생했습니다.');
    }
}

// 토스트 메시지 띄우기
let toastTimeout;
function showToast(type, message) {
    clearTimeout(toastTimeout);
    
    toastMessage.textContent = message;
    
    // 아이콘 및 클래스 바인딩
    if (type === 'success') {
        toastIcon.className = 'toast-icon success';
        toastIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    } else {
        toastIcon.className = 'toast-icon error';
        toastIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }
    
    toast.className = 'toast show';
    
    toastTimeout = setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

// 바이트 수 포맷팅
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 폴더 프리셋 렌더링
function renderPresets() {
    const container = document.getElementById('presetListContainer');
    if (!container) return;
    if (!presetsList || presetsList.length === 0) {
        container.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--text-dark); text-align: center; padding: 20px;">등록된 프리셋 경로가 없습니다.</div>
        `;
        return;
    }
    
    container.innerHTML = '';
    presetsList.forEach(path => {
        const div = document.createElement('div');
        div.className = 'preset-list-item';
        div.innerHTML = `
            <span class="preset-path-text" title="${path}">${path}</span>
            <div class="preset-actions">
                <button class="btn-preset-apply" onclick="applyPresetPath('${path.replace(/\\/g, '\\\\')}', 'original')">원본</button>
                <button class="btn-preset-apply" onclick="applyPresetPath('${path.replace(/\\/g, '\\\\')}', 'shape')">형상</button>
                <button class="btn-preset-apply" onclick="applyPresetPath('${path.replace(/\\/g, '\\\\')}', 'modified')">수정본</button>
                <button class="btn-preset-delete" onclick="deletePresetPath('${path.replace(/\\/g, '\\\\')}')">삭제</button>
            </div>
        `;
        presetListContainer.appendChild(div);
    });
}

// 프리셋 경로 적용 및 서버 자동 저장
async function applyPresetPath(path, targetType) {
    if (targetType === 'original') {
        originalDirInput.value = path;
    } else if (targetType === 'shape') {
        shapeDirInput.value = path;
    } else if (targetType === 'modified') {
        modifiedDirInput.value = path;
    }
    
    // UI에 반영되었으므로 설정을 즉각 백엔드에 자동 세이브
    await saveCurrentConfig();
    showToast('success', '선택한 경로가 설정에 즉시 적용되었습니다.');
}

// 프리셋 수동 추가
async function addPresetPath() {
    const inputEl = document.getElementById('newPresetPathInput');
    if (!inputEl) return;
    const pathVal = inputEl.value.trim();
    if (!pathVal) {
        showToast('error', '추가할 경로를 입력해 주세요.');
        return;
    }
    
    try {
        const response = await fetch('/api/presets/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathVal })
        });
        const data = await response.json();
        if (data.success) {
            presetsList = data.presets || [];
            inputEl.value = '';
            renderPresets();
            showToast('success', data.message);
        } else {
            showToast('error', data.message || '프리셋 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('프리셋 추가 오류:', error);
        showToast('error', '프리셋 추가 처리 중 오류가 발생했습니다.');
    }
}

// 기본 경로 설정 API 호출
async function setDefaultPaths() {
    try {
        const response = await fetch('/api/config/default', {
            method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', data.message || '기본 경로로 설정되었습니다.');
            await loadConfig();
        } else {
            showToast('error', data.message || '기본 경로 설정에 실패했습니다.');
        }
    } catch (error) {
        console.error('기본 경로 설정 중 오류:', error);
        showToast('error', '기본 경로를 설정하는 과정에서 오류가 발생했습니다.');
    }
}

// 프리셋 수동 삭제
async function deletePresetPath(pathVal) {
    try {
        const response = await fetch('/api/presets/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathVal })
        });
        const data = await response.json();
        if (data.success) {
            presetsList = data.presets || [];
            renderPresets();
            showToast('success', data.message);
        } else {
            showToast('error', data.message || '프리셋 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('프리셋 삭제 오류:', error);
        showToast('error', '프리셋 삭제 처리 중 오류가 발생했습니다.');
    }
}

// 프리셋 폴더 선택창 실행
async function browsePresetFolder() {
    const inputEl = document.getElementById('newPresetPathInput');
    if (!inputEl) {
        showToast('error', '경로 입력창 요소를 찾지 못했습니다.');
        return;
    }
    
    if (window.pywebview && window.pywebview.api && window.pywebview.api.select_folder) {
        try {
            const selectedPath = await window.pywebview.api.select_folder("");
            if (selectedPath) {
                inputEl.value = selectedPath;
            }
        } catch (err) {
            console.error('프리셋 폴더 대화상자 실행 오류:', err);
            showToast('error', '폴더 선택 중 에러가 발생했습니다.');
        }
    } else {
        alert('이 기능은 데스크톱 전용 창(ADMS.exe)으로 실행 시에만 폴더 탐색창을 지원합니다.');
    }
}

// 전역 함수로 바인딩 (HTML 인라인 호출용)
window.browsePresetFolder = browsePresetFolder;
window.applyPresetPath = applyPresetPath;
window.deletePresetPath = deletePresetPath;
