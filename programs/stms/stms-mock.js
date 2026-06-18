// stms-mock.js
(function() {
    const originalFetch = window.fetch;
    let historyCache = null;

    // Helper to extract query parameters
    function getQueryParam(url, param) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.searchParams.get(param);
        } catch(e) {
            const match = url.match(new RegExp('[?&]' + param + '=([^&#]*)'));
            return match ? decodeURIComponent(match[1]) : null;
        }
    }

    // Helper to replace MD/MC/SA with TST
    function translatePartNumber(pNo) {
        if (!pNo) return pNo;
        return pNo.replace(/^(MD|MC|SA)/, 'TST');
    }

    // Helper to assign a friendly Korean dummy name based on category
    function translatePartName(pName, idx) {
        if (!pName) return `테스트용 부품 TST-${idx.toString().padStart(3, '0')}`;
        const nameLower = pName.toLowerCase();
        let nameKor = "정밀 가공 부품";
        if (nameLower.includes('adaptor') || nameLower.includes('adapter')) {
            nameKor = "연결용 어댑터";
        } else if (nameLower.includes('bearing') && nameLower.includes('retainer')) {
            nameKor = "베어링 리테이너";
        } else if (nameLower.includes('retainer')) {
            nameKor = "리테이너 플레이트";
        } else if (nameLower.includes('slinger')) {
            nameKor = "샤프트 슬링어";
        } else if (nameLower.includes('cover')) {
            nameKor = "하우징 커버";
        } else if (nameLower.includes('spacer')) {
            nameKor = "조절용 스페이서";
        } else if (nameLower.includes('ring')) {
            nameKor = "밀봉용 오일링";
        } else if (nameLower.includes('block')) {
            nameKor = "고정용 블록";
        } else if (nameLower.includes('gerotor')) {
            nameKor = "제어 로터";
        } else if (nameLower.includes('bolt')) {
            nameKor = "고강도 체결 볼트";
        } else if (nameLower.includes('key')) {
            nameKor = "동력 전달 키";
        } else if (nameLower.includes('plate')) {
            nameKor = "정밀 지지 플레이트";
        } else if (nameLower.includes('jacket')) {
            nameKor = "수냉식 냉각 재킷";
        } else if (nameLower.includes('duct')) {
            nameKor = "배기용 가이드 덕트";
        } else if (nameLower.includes('stopper')) {
            nameKor = "리미트 스토퍼";
        } else if (nameLower.includes('holder')) {
            nameKor = "부품 고정 홀더";
        } else if (nameLower.includes('pusher')) {
            nameKor = "푸셔 블록";
        }
        return `${nameKor} TST-${idx.toString().padStart(3, '0')}`;
    }

    // Initialize local storage from static JSON if empty
    async function initData() {
        if (!localStorage.getItem('stms_inventory_v4')) {
            try {
                const res = await originalFetch('./initial_sales.json');
                const data = await res.json();
                
                const nameMap = {};
                const pNoMap = {};
                let partIndex = 1;
                
                const translatedInventory = [];
                data.inventory.forEach(item => {
                    if (item['신품번']) {
                        const oldPNo = item['신품번'];
                        const oldName = item['품명'];
                        const newPNo = translatePartNumber(oldPNo);
                        const newName = translatePartName(oldName, partIndex++);
                        
                        nameMap[oldPNo] = newName;
                        pNoMap[oldPNo] = newPNo;
                        
                        item['신품번'] = newPNo;
                        item['품명'] = newName;
                    }
                    translatedInventory.push(item);
                });
                
                // Translate daily items
                data.daily_item.forEach(item => {
                    const oldPNo = item['품번'];
                    if (pNoMap[oldPNo]) {
                        item['품번'] = pNoMap[oldPNo];
                        item['품명'] = nameMap[oldPNo];
                    } else {
                        item['품번'] = translatePartNumber(oldPNo);
                    }
                });
                
                localStorage.setItem('stms_sales_data_v4', JSON.stringify(data));
                localStorage.setItem('stms_inventory_v4', JSON.stringify(translatedInventory));
            } catch (e) {
                console.error("Failed to load initial sales data", e);
            }
        }
    }

    // Intercept fetch calls
    window.fetch = async function(resource, options) {
        await initData();
        const urlStr = typeof resource === 'string' ? resource : resource.url;
        
        // 1. GET /inventory - Return part list
        if (urlStr.includes('/inventory') && (!options || options.method === 'GET' || !options.method)) {
            const inv = JSON.parse(localStorage.getItem('stms_inventory_v4') || '[]');
            return new Response(JSON.stringify(inv), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 2. POST /update_inventory - Save changes from edit mode
        if (urlStr.includes('/update_inventory') && options && options.method === 'POST') {
            const body = JSON.parse(options.body);
            localStorage.setItem('stms_inventory_v4', JSON.stringify(body));
            return new Response(JSON.stringify({ status: 'ok' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 3. POST /open_folder - Open delivery note folder simulator
        if (urlStr.includes('/open_folder') && options && options.method === 'POST') {
            alert('명세서 폴더를 열었습니다. (GitHub Pages 가상 시뮬레이션 환경)');
            return new Response(JSON.stringify({ message: 'Success' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 4. POST /open_sales_file - Open sales Excel sheet simulator
        if (urlStr.includes('/open_sales_file') && options && options.method === 'POST') {
            alert('매출 엑셀 파일을 열었습니다. (GitHub Pages 가상 시뮬레이션 환경)');
            return new Response(JSON.stringify({ message: 'Success' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 5. GET /api/sales_data - Return sales statistics data and current inventory
        if (urlStr.includes('/api/sales_data') && (!options || options.method === 'GET' || !options.method)) {
            const sales = JSON.parse(localStorage.getItem('stms_sales_data_v4') || '{}');
            const inv = JSON.parse(localStorage.getItem('stms_inventory_v4') || '[]');
            sales.inventory = inv;
            return new Response(JSON.stringify(sales), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 6. GET /api/inventory_history - Return transaction logs for chart rendering
        if (urlStr.includes('/api/inventory_history')) {
            const p_no = getQueryParam(urlStr, 'p_no');
            if (!p_no) {
                return new Response(JSON.stringify({ error: 'Missing p_no' }), { status: 400 });
            }
            
            if (!historyCache) {
                try {
                    const res = await originalFetch('./부품_재고현황.json');
                    const rawCache = await res.json();
                    
                    // Translate keys on first load
                    historyCache = {};
                    for (const key in rawCache) {
                        const newKey = translatePartNumber(key);
                        historyCache[newKey] = rawCache[key];
                    }
                } catch(e) {
                    console.error("Failed to load history JSON", e);
                    historyCache = {};
                }
            }
            
            let pHistory = historyCache[p_no] || [];
            let history = pHistory.map(item => {
                const dateStr = String(item.날짜);
                const formattedDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
                return {
                    "날짜": formattedDate,
                    "재고수량": item.재고수량
                };
            });
            
            // Add custom history logged during simulations
            const localUploads = JSON.parse(localStorage.getItem('stms_uploaded_history_v4') || '[]');
            localUploads.forEach(log => {
                if (log.p_no === p_no) {
                    history.push({
                        "날짜": log.date,
                        "재고수량": log.qty
                    });
                }
            });
            
            // Sort history by date ascending
            history.sort((a,b) => a.날짜.localeCompare(b.날짜));
            
            return new Response(JSON.stringify(history), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 7. POST /upload - Simulate parsing an Excel slip, update quantities, record transactions, and add sales
        if (urlStr.includes('/upload') && options && options.method === 'POST') {
            const inv = JSON.parse(localStorage.getItem('stms_inventory_v4') || '[]');
            const sales = JSON.parse(localStorage.getItem('stms_sales_data_v4') || '{}');
            const uploadedHistory = JSON.parse(localStorage.getItem('stms_uploaded_history_v4') || '[]');
            
            const partsOnly = inv.filter(item => item['신품번'] && item['순번'] && !item['순번'].includes('납품') && !item['순번'].includes('어댑터'));
            if (partsOnly.length === 0) {
                return new Response(JSON.stringify({ error: 'No parts found in inventory database' }), { status: 500 });
            }
            
            // Pick 3 random parts to simulate delivery receipt
            const count = Math.min(3, partsOnly.length);
            const picked = [];
            while(picked.length < count) {
                const r = partsOnly[Math.floor(Math.random() * partsOnly.length)];
                if (!picked.some(p => p['신품번'] === r['신품번'])) {
                    picked.push(r);
                }
            }
            
            const today = new Date().toISOString().split('T')[0];
            const detailMsg = [];
            
            picked.forEach(part => {
                const addQty = Math.floor(Math.random() * 300) + 100; // 100 to 400
                const oldQty = Number(part['재고수량']) || 0;
                const newQty = oldQty + addQty;
                
                // Update table values
                part['재고수량'] = newQty;
                part['입고수량'] = (Number(part['입고수량']) || 0) + addQty;
                
                // Record in history log
                uploadedHistory.push({
                    p_no: part['신품번'],
                    date: today,
                    qty: newQty
                });
                
                // Add to daily sales metric
                const unitPrice = 12500; // Default dummy price for calculation
                const amount = unitPrice * addQty;
                
                sales.daily_item.push({
                    "날짜": today,
                    "품번": part['신품번'],
                    "품명": part['품명'],
                    "납품수량": addQty,
                    "단가": unitPrice,
                    "매출": amount
                });
                
                detailMsg.push(`- ${part['품명']} (${part['신품번']}): +${addQty}개 입고`);
            });
            
            // Recalculate daily total for today
            let dailyTotalForToday = 0;
            sales.daily_item.forEach(item => {
                if (item['날짜'] === today) {
                    dailyTotalForToday += item['매출'] || 0;
                }
            });
            
            const dTotalIndex = sales.daily_total.findIndex(d => d['날짜'] === today);
            if (dTotalIndex >= 0) {
                sales.daily_total[dTotalIndex]['일일 총 매출'] = dailyTotalForToday;
            } else {
                sales.daily_total.push({
                    "날짜": today,
                    "일일 총 매출": dailyTotalForToday
                });
            }
            
            // Save updated states to localStorage
            localStorage.setItem('stms_inventory_v4', JSON.stringify(inv));
            localStorage.setItem('stms_sales_data_v4', JSON.stringify(sales));
            localStorage.setItem('stms_uploaded_history_v4', JSON.stringify(uploadedHistory));
            
            alert(`[시뮬레이션] 납품명세서 파일 분석 완료!\n\n오늘 날짜(${today}) 기준으로 다음 부품이 입고되었습니다:\n${detailMsg.join('\n')}\n\n재고 현황과 매출 통계 차트가 실시간으로 업데이트되었습니다.`);
            
            return new Response(JSON.stringify({ message: "파일 업로드 완료 (시뮬레이션)" }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Pass through unmodified fetch requests
        return originalFetch.apply(this, arguments);
    };
})();
