const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLTEI5pSm4gjnBQHcqCwFMS7vcIzpWt6sfXtdjpEk1QlnndTlSA6nZYlQwfWFY_oLHzA/exec";
const waNomorSekretariat = "6281234567890";

let backPressCount = 0;

setInterval(() => {
    const icon = document.getElementById("churchIconSpin");
    if (icon) {
        icon.classList.add("animate-church-spin");
        setTimeout(() => {
            icon.classList.remove("animate-church-spin");
        }, 1000);
    }
}, 5000);

function setTransitionStyle(style) {
    localStorage.setItem('gmit_transition_style', style);
    const fadeBtn = document.getElementById('transFadeBtn');
    const zoomBtn = document.getElementById('transZoomBtn');
    if (style === 'zoom') {
        if (fadeBtn) fadeBtn.className = "text-left px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-300 border border-slate-800 hover:border-purple-500 transition duration-500";
        if (zoomBtn) zoomBtn.className = "text-left px-3 py-2 rounded-xl text-xs bg-purple-600 text-white border border-purple-500 transition duration-500";
        showToast("Model transisi Scale & Zoom diaktifkan!");
    } else {
        if (fadeBtn) fadeBtn.className = "text-left px-3 py-2 rounded-xl text-xs bg-purple-600 text-white border border-purple-500 transition duration-500";
        if (zoomBtn) zoomBtn.className = "text-left px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-300 border border-slate-800 hover:border-purple-500 transition duration-500";
        showToast("Model transisi Smooth Fade & Slide diaktifkan!");
    }
    toggleSidebar(false);
}

function triggerPageTransition() {
    const main = document.querySelector("main");
    if (!main) return;
    const style = localStorage.getItem('gmit_transition_style') || 'fade';
    const animClass = style === 'zoom' ? 'animate-zoom-in' : 'animate-fade-in';
    
    main.classList.remove("animate-fade-in", "animate-zoom-in");
    void main.offsetWidth; 
    main.classList.add(animClass);

// --- LOGIKA PERUBAHAN TOMBOL MELAYANG ---
// (Pastikan blok ini tetap berada di dalam fungsi pembaruan UI Anda, misalnya di triggerPageTransition)
    const activeHeader = document.getElementById("headerTitle").innerText;
    const floatingBtn = document.getElementById("floatingBackBtn");
    
    if (floatingBtn) {
        // Sembunyikan tombol melayang jika berada di 3 Tab Utama (Beranda, Notifikasi, Akun)
        if (activeHeader.includes("PNIEL Oebobo") || activeHeader.includes("Notifikasi") || activeHeader.includes("Akun")) {
            floatingBtn.classList.add("hidden");
        } else {
            // Munculkan hanya sebagai tombol Kembali di halaman dalam (sub-menu)
            floatingBtn.classList.remove("hidden");
            floatingBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Kembali';
            floatingBtn.className = "absolute pointer-events-auto bg-purple-600/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.5)] border border-purple-400 font-bold text-xs flex items-center gap-2 cursor-move active:scale-95 transition-all duration-300";
        }
    }
}
// <-- Akhir dari fungsi pembaruan UI (sesuaikan dengan tutup kurung kurawal fungsi asli Anda)

// --- MANAJEMEN NAVIGASI (HISTORY API) ---
function pushNavState(funcName, args = []) {
    history.pushState({ func: funcName, args: args }, "", "");
}

function replaceNavState(funcName, args = []) {
    history.replaceState({ func: funcName, args: args }, "", "");
}

window.addEventListener('popstate', function (event) {
    const ktjModal = document.getElementById("ktjModal");
    if (ktjModal && !ktjModal.classList.contains("hidden")) {
        tutupKTJ(true); 
        return;
    }

    const hymnModal = document.getElementById("hymnModal");
    if (hymnModal && !hymnModal.classList.contains("hidden")) {
        closeHymnModal(true); return;
    }

    const lightboxModal = document.getElementById("lightboxModal");
    if (lightboxModal && !lightboxModal.classList.contains("hidden")) {
        closeLightbox(null, true); return;
    }

    const pushNotifOverlay = document.getElementById("pushNotifOverlay");
    if (pushNotifOverlay && !pushNotifOverlay.classList.contains("hidden")) {
        closePushNotif(); return;
    }

    if (event.state && event.state.func) {
        const funcName = event.state.func;
        const args = event.state.args || [];
        if (typeof window[funcName] === 'function') {
            if (['switchTab', 'openExtendedProfileForm', 'openHymnModal', 'openLightbox', 'openPrayerMenu', 'openFormPrayer'].includes(funcName)) {
                window[funcName](args[0], true);
            } else {
                window[funcName](true);
            }
        }
    } else {
        const activeTabHeader = document.getElementById("headerTitle").innerText;
        if (activeTabHeader.includes("PNIEL Oebobo")) {
            backPressCount++;
            if (backPressCount === 1) {
                showToast("Tekan sekali lagi untuk keluar aplikasi");
                setTimeout(() => { backPressCount = 0; }, 2500);
            } else if (backPressCount >= 2) {
                window.close();
            }
        } else {
            switchTab('home', true);
        }
    }
});


// --- SERVICE WORKER & PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => { console.log('SW terdaftar:', registration.scope); })
            .catch((error) => { console.log('SW error:', error); });
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    container.innerHTML = ""; 
    
    const toast = document.createElement("div");
    const bgColor = type === "success" ? "bg-emerald-600 shadow-emerald-900/50" : "bg-rose-600 shadow-rose-900/50";
    
    toast.className = `${bgColor} text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold pointer-events-auto animate-slide-in flex items-center gap-2 max-w-xs w-full text-center border border-white/10`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <span class="flex-1">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "scale(0.9)";
        toast.style.transition = "all 0.5s ease";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

async function checkPushNotification() {
    if (sessionStorage.getItem('notif_seen') === 'true') return;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getNotification`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data.is_active) {
            const msg = result.data.message;
            const msgContainer = document.getElementById('pushNotifMessage');
            
            if (msg.startsWith('http://') || msg.startsWith('https://') || msg.match(/\.(jpeg|jpg|png|webp)$/i)) {
                msgContainer.innerHTML = `<img src="${msg}" class="w-full h-auto rounded-xl shadow-md border border-slate-700 mx-auto" style="max-height: 350px; object-fit: contain;">`;
            } else {
                msgContainer.innerText = msg;
            }

            document.getElementById('pushNotifOverlay').classList.remove('hidden');
            sessionStorage.setItem('notif_seen', 'true');
        }
    } catch (err) {
        console.log("Gagal memuat notifikasi", err);
    }
}
function closePushNotif() {
    const overlay = document.getElementById('pushNotifOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function updateNetworkStatus() {
    const dot = document.getElementById("syncDot");
    const text = document.getElementById("syncText");
    if (!dot) return;
    if (navigator.onLine) {
        dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
        if(text) { text.innerText = "Online"; text.className = "text-[10px] text-slate-300 font-medium hidden sm:inline"; }
    } else {
        dot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
        if(text) { text.innerText = "Offline"; text.className = "text-[10px] text-rose-400 hidden sm:inline"; }
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function toggleSidebar(show) {
    const sidebar = document.getElementById("sidebarMenu");
    const overlay = document.getElementById("sidebarOverlay");
    if (show) {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
    } else {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
    }
}

function setTheme(theme, isInitialLoad = false) {
    const app = document.getElementById("app");
    const body = document.getElementById("appBody");
    const bannerContainer = document.getElementById("seasonalBannerContainer");
    
    // 1. Hapus ornamen ID card lama setiap kali tema berganti agar tidak bocor ke tema lain
    const existingOrnamen = document.getElementById("ornamenIdCard");
    if (existingOrnamen) existingOrnamen.remove();
    
    const baseAppClass = "w-full max-w-md landscape:max-w-3xl md:max-w-md mx-auto min-h-screen flex flex-col shadow-2xl relative transition-all duration-500";
    
    const menuShapeClass = theme === 'easter' ? 'rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]' : (theme === 'christmas' ? 'rounded-2xl transform rotate-45' : 'rounded-full');
    const innerShapeTransform = theme === 'christmas' ? 'transform -rotate-45' : '';

    document.querySelectorAll('.home-menu-icon').forEach(el => {
        el.className = `relative w-14 h-14 flex items-center justify-center mb-1 overflow-hidden border-2 border-white transition-all duration-500 shadow-md ${menuShapeClass}`;
    });
    document.querySelectorAll('.home-menu-inner').forEach(el => {
        el.className = `text-xl ${innerShapeTransform}`;
    });

    if (theme === 'emerald') {
        app.className = `${baseAppClass} bg-emerald-800 text-emerald-50`;
        body.className = "bg-emerald-950 text-emerald-50 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) bannerContainer.innerHTML = '';
    } else if (theme === 'purple') {
        app.className = `${baseAppClass} bg-indigo-900 text-indigo-50`;
        body.className = "bg-slate-950 text-indigo-50 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) bannerContainer.innerHTML = '';
    } else if (theme === 'sunset') {
        app.className = `${baseAppClass} bg-rose-950 text-rose-50`;
        body.className = "bg-neutral-950 text-rose-50 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) bannerContainer.innerHTML = '';
    } else if (theme === 'christmas') {
        app.className = `${baseAppClass} bg-red-950 text-red-50`;
        body.className = "bg-red-900 text-red-50 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="bg-gradient-to-r from-red-900 via-rose-800 to-emerald-900 border-b border-red-500/40 py-1.5 px-3 text-center text-[11px] text-white shadow-inner flex items-center justify-center gap-2">
                    <span>⭐</span> <b>Selamat Menyambut Natal Kristus</b> <span>🎄✨</span>
                </div>
            `;
        }
    } else if (theme === 'easter') {
        app.className = `${baseAppClass} bg-amber-950 text-amber-100`;
        body.className = "bg-amber-900 text-amber-100 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-950 border-b border-amber-500/40 py-1.5 px-3 text-center text-[11px] text-white shadow-inner flex items-center justify-center gap-2">
                    <span>🕊️</span> <b>Selamat Hari Kebangkitan (Paskah)</b> <span>✝️✨</span>
                </div>
            `;
        }
    } else if (theme === 'light') {
        // 2. Gunakan bg-slate-50 agar putihnya lebih lembut dan tidak menyilaukan
        app.className = `${baseAppClass} bg-slate-50 text-slate-900`;
        body.className = "bg-slate-300 text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) bannerContainer.innerHTML = '';
        
        // 3. Suntikkan Ornamen ID Card langsung ke dalam kontainer "app"
        const ornamen = document.createElement("div");
        ornamen.id = "ornamenIdCard";
        ornamen.className = "absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-inherit";
        ornamen.innerHTML = `
            <div class="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-tr-full transition-all duration-700"></div>
            <div class="absolute top-24 right-0 w-28 h-28 bg-amber-500/15 rounded-l-full transition-all duration-700 delay-100"></div>
        `;
        app.insertBefore(ornamen, app.firstChild);
        
    } else {
        app.className = `${baseAppClass} bg-slate-950 text-slate-100`;
        body.className = "bg-slate-900 text-slate-100 font-sans antialiased min-h-screen flex flex-col items-center justify-center m-0 p-0 overflow-x-hidden";
        if(bannerContainer) bannerContainer.innerHTML = '';
    }

    localStorage.setItem('gmit_selected_theme', theme);
    toggleSidebar(false);
    
    if (!isInitialLoad) {
        const activeHeader = document.getElementById("headerTitle").innerText;
        if (activeHeader.includes("PNIEL Oebobo")) {
            switchTab('home', false, true);
        } else if (activeHeader.includes("Notifikasi")) {
            switchTab('notifikasi', false, true);
        } else if (activeHeader.includes("Akun") || activeHeader.includes("Profil")) {
            switchTab('profil', false, true);
        }
    }
}

async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        toggleSidebar(false);
    } else {
        showToast("Gunakan menu 'Tambahkan ke Beranda' / 'Add to Home Screen' di pengaturan browser Anda.");
        toggleSidebar(false);
    }
}

function checkAuthBeforeAction(actionCallback) {
    const savedUser = localStorage.getItem("user_gereja");
    if (savedUser) {
        window.currentUser = JSON.parse(savedUser);
        actionCallback();
    } else {
        showToast("Silakan login atau daftar terlebih dahulu.", "error");
        renderAuthPageForAction(actionCallback);
    }
}

function renderAuthPageForAction(callbackOnSuccess, isBack = false) {
    window.pendingAuthAction = callbackOnSuccess;
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Autentikasi Jemaat";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-6 pt-2">
            
            <div class="text-center">
                <h2 class="text-lg font-bold text-purple-400">Verifikasi Akun Diperlukan</h2>
                <p class="text-xs text-slate-400 mt-1">Masuk atau daftar untuk terhubung ke sistem jemaat.</p>
            </div>

            <div class="flex border-b border-slate-800">
                <button id="tabLoginBtn" onclick="toggleAuthTab('login')" class="flex-1 pb-2 font-semibold text-purple-400 border-b-2 border-purple-400 text-xs">Masuk</button>
                <button id="tabRegBtn" onclick="toggleAuthTab('register')" class="flex-1 pb-2 text-slate-500 text-xs">Daftar Baru</button>
            </div>

            <form id="formLogin" onsubmit="handleLoginForAction(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Username Unik atau Nama Lengkap</label>
                    <input type="text" id="loginNama" required placeholder="Cth: budi.wa899 atau Budi Santoso" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-purple-500">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Password / 4 Digit No. WhatsApp</label>
                    <input type="password" maxlength="4" id="loginPin" required placeholder="Cth: 7899" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-purple-500">
                </div>
                <button type="submit" id="btnLoginSubmit" class="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-purple-700 transition duration-500">Masuk</button>
            </form>

            <form id="formRegister" onsubmit="handleRegisterForAction(event)" class="space-y-4 hidden">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                    <input type="text" id="regNama" required placeholder="Contoh: Budi Santoso" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Nomor WhatsApp</label>
                    <input type="tel" id="regWa" required placeholder="Contoh: 081234567899" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                </div>
                <button type="submit" id="btnRegSubmit" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-700 transition duration-500 mt-2">Daftar Akun Baru</button>
            </form>
        </div>
    `;
}

async function handleRegisterForAction(e) {
    e.preventDefault();
    const btn = document.getElementById("btnRegSubmit");
    const nama = document.getElementById("regNama").value.trim();
    const wa = document.getElementById("regWa").value.trim();

    btn.disabled = true;
    btn.innerHTML = "Membuat Akun...";

    try {
		const response = await fetch(SCRIPT_URL, {
		    method: "POST",
		    redirect: "follow",
		    headers: {
		        "Content-Type": "text/plain;charset=utf-8"
		    },
		    body: JSON.stringify({ action: "register", nama_lengkap: nama, no_whatsapp: wa })
		});
        const result = await response.json();

        if (result.status === "success") {
            const u = result.user;
            Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil! 🎉',
                html: `
                    <div class="text-left bg-slate-900 p-4 rounded-xl text-slate-200 text-xs space-y-2.5 border border-slate-800 mt-2">
                        <p>Syalom <b>${u.nama_lengkap}</b>, akun Anda berhasil dibuat.</p>
                        <hr class="border-slate-800 my-2">
                        <p>👤 <b>Username Unik:</b> <code class="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">${u.username}</code></p>
                        <p>🔑 <b>Password (PIN):</b> <code class="bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">${u.password}</code></p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '📋 Salin Akun',
                cancelButtonText: '🔑 Lanjut ke Login',
                confirmButtonColor: '#9333ea',
                cancelButtonColor: '#334155',
                allowOutsideClick: false
            }).then((clickResult) => {
                if (clickResult.isConfirmed) {
                    navigator.clipboard.writeText(`Username: ${u.username}\nPassword: ${u.password}`).then(() => {
                        showToast("Akun berhasil disalin!");
                    });
                }
                toggleAuthTab('login');
            });
            btn.disabled = false;
            btn.innerHTML = "Daftar Akun Baru";
        } else {
            showToast(result.message, "error");
            btn.disabled = false;
            btn.innerHTML = "Daftar Akun Baru";
        }
    } catch (err) {
        showToast("Kesalahan koneksi.", "error");
        btn.disabled = false;
        btn.innerHTML = "Daftar Akun Baru";
    }
}

function toggleAuthTab(type) {
    const loginForm = document.getElementById("formLogin");
    const regForm = document.getElementById("formRegister");
    const loginBtn = document.getElementById("tabLoginBtn");
    const regBtn = document.getElementById("tabRegBtn");

    if (type === 'login') {
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
        loginBtn.className = "flex-1 pb-2 font-semibold text-purple-400 border-b-2 border-purple-400 text-xs";
        regBtn.className = "flex-1 pb-2 text-slate-500 text-xs";
    } else {
        loginForm.classList.add("hidden");
        regForm.classList.remove("hidden");
        regBtn.className = "flex-1 pb-2 font-semibold text-purple-400 border-b-2 border-purple-400 text-xs";
        loginBtn.className = "flex-1 pb-2 text-slate-500 text-xs";
    }
}

async function handleLoginForAction(e) {
    e.preventDefault();
    const btn = document.getElementById("btnLoginSubmit");
    const nama = document.getElementById("loginNama").value;
    const pin = document.getElementById("loginPin").value;

    btn.disabled = true;
    btn.innerHTML = "Memproses...";

    try {
		const response = await fetch(SCRIPT_URL, {
		    method: "POST",
		    redirect: "follow",
		    headers: {
		        "Content-Type": "text/plain;charset=utf-8"
		    },
		    body: JSON.stringify({ action: "login", nama_lengkap: nama, pin_4_digit: pin })
		});
        const result = await response.json();

        if (result.status === "success") {
            showToast("Login Berhasil!");
            localStorage.setItem("user_gereja", JSON.stringify(result.user));
            updateAuthNavText(); 
            window.currentUser = result.user;
            
            if (typeof window.pendingAuthAction === 'function') {
                window.pendingAuthAction();
                window.pendingAuthAction = null;
            } else {
                switchTab('home');
            }
        } else {
            showToast(result.message, "error");
            btn.disabled = false;
            btn.innerHTML = "Masuk & Lanjutkan";
        }
    } catch (err) {
        showToast("Kesalahan koneksi.", "error");
        btn.disabled = false;
        btn.innerHTML = "Masuk & Lanjutkan";
    }
}

function switchTab(tab, isBack = false, isReplace = false) {
    if (!isBack) {
        if (isReplace) replaceNavState('switchTab', [tab]);
        else pushNavState('switchTab', [tab]);
    }
    
    const main = document.querySelector("main");
    
    // 1. PINDAHKAN LOGIKA JUDUL KE SINI (SEBELUM TRANSISI)
    if (tab === 'home') {
        document.getElementById("headerTitle").innerText = "GMIT Jemaat PNIEL Oebobo";
    } else if (tab === 'notifikasi') {
        document.getElementById("headerTitle").innerText = "Notifikasi & Kotak Masuk";
    } else if (tab === 'profil') {
        document.getElementById("headerTitle").innerText = "Akun & Profil Jemaat";
    }
    
    // 2. SETELAH JUDUL TEPAT, BARU JALANKAN TRANSISI
    triggerPageTransition();

    const savedTheme = localStorage.getItem('gmit_selected_theme') || 'slate';
    const menuShapeClass = savedTheme === 'easter' ? 'rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]' : (savedTheme === 'christmas' ? 'rounded-2xl transform rotate-45' : 'rounded-full');
    const innerShapeTransform = savedTheme === 'christmas' ? 'transform -rotate-45' : '';
    
    if (tab === 'home') {
        main.innerHTML = `
            <div class="space-y-6 pt-2">
                <div class="grid grid-cols-4 gap-4 text-center">
                    <div onclick="openAboutPage()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-500 ${menuShapeClass} flex items-center justify-center mb-1 overflow-hidden border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.7)]">
                            <img src="jpo.ico" alt="Tentang JPO" class="home-menu-inner w-full h-full object-cover ${innerShapeTransform}">
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-cyan-400 transition">Tentang</span>
                    </div>

                    <div onclick="openDownloadCenter()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-400 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">📥</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-amber-400 transition">Download</span>
                    </div>

                    <div onclick="openLibraryMenu()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-purple-500 to-fuchsia-500 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(168,85,247,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">📖</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-purple-300 transition">Alkitab & KJ</span>
                    </div>

                    <div onclick="openEventsList()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-sky-500 to-blue-600 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(14,165,233,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">📅</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-sky-400 transition">Kegiatan</span>
                    </div>

                    <div onclick="openChatRoom()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-600 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(236,72,153,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">💬</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-pink-400 transition">Komunitas</span>
                    </div>

                    <div onclick="openBirthdayList()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-emerald-400 to-teal-600 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">🎂</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-emerald-400 transition">Ulang Tahun</span>
                    </div>

                    <div onclick="openPrayerMenu()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-green-300 to-emerald-500 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(110,231,183,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">🙏</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-green-400 transition">Dukungan Doa</span>
                    </div>

                    <div onclick="openDonationList()" class="cursor-pointer flex flex-col items-center animate-card-hover group active:scale-95 transition-transform duration-100">
                        <div class="home-menu-icon relative w-14 h-14 bg-gradient-to-tr from-blue-400 to-indigo-600 ${menuShapeClass} flex items-center justify-center text-xl mb-1 border-2 border-white transition-all duration-500 shadow-[0_0_12px_rgba(96,165,250,0.7)]">
                            <span class="home-menu-inner ${innerShapeTransform}">🎁</span>
                        </div>
                        <span class="text-[11px] text-slate-300 font-medium group-hover:text-blue-400 transition">Persembahan</span>
                    </div>
                </div>

                <div class="pt-2 space-y-2">
                    <h3 class="font-bold text-xs text-purple-400 uppercase tracking-wider">Media & Pustaka Jemaat</h3>
                    <div class="grid grid-cols-3 landscape:sm:grid-cols-6 gap-3">
                        <div onclick="openCategoriesMenu()" class="bg-slate-900 border border-amber-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-amber-400 transition duration-500 animate-card-hover">
                            <div class="h-16 bg-amber-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">📝</div>
                            <span class="text-xs font-semibold text-slate-200">Sekretariat</span>
                        </div>
                        <div onclick="openVideosMenu()" class="bg-slate-900 border border-sky-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-sky-400 transition duration-500 animate-card-hover">
                            <div class="h-16 bg-sky-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">▶️</div>
                            <span class="text-xs font-semibold text-slate-200">Youtube</span>
                        </div>
                        <div onclick="openGaleryMenu()" class="bg-slate-900 border border-yellow-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-yellow-400 transition duration-500 animate-card-hover">
                            <div class="h-16 bg-yellow-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">🖼️</div>
                            <span class="text-[11px] font-semibold text-slate-200">Galeri</span>
                        </div>
                        <div onclick="openBibleMenu()" class="bg-slate-900 border border-emerald-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-emerald-400 transition duration-500 animate-card-hover">
                            <div class="h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">✝️</div>
                            <span class="text-xs font-semibold text-slate-200">Renungan</span>
                        </div>
                        <div id="livestream-card" onclick="openLivestreamsMenu()" class="bg-slate-900 border border-orange-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-orange-400 transition duration-500 animate-card-hover relative">
                            <div id="livestream-badge" class="absolute -top-2 -right-2 hidden">
                                <span class="bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse shadow-lg shadow-rose-600/50">LIVE</span>
                            </div>
                            <div class="h-16 bg-orange-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">📺</div>
                            <span class="text-[11px] font-semibold text-slate-200">Livestreams</span>
                        </div>
                        <div onclick="openStatistikMenu()" class="bg-slate-900 border border-pink-200/40 rounded-xl p-2.5 text-center cursor-pointer hover:border-pink-400 transition duration-500 animate-card-hover">
                            <div class="h-16 bg-pink-500/10 rounded-lg flex items-center justify-center text-2xl mb-2">📊</div>
                            <span class="text-xs font-semibold text-slate-200">Statistik</span>
                        </div>
                    </div>
                </div>

                <div onclick="window.location.href='games.html'" class="w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 p-5 rounded-2xl shadow-xl cursor-pointer transition duration-500 hover:border-purple-400 flex justify-between items-center group my-4">
                    <div class="space-y-1.5 pr-2">
                        <span class="bg-purple-600/40 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-purple-400/30 inline-block">✨ Fitur Baru & Hiburan</span>
                        <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-purple-200 transition duration-500">Tantangan Kuis Alkitab</h3>
                        <p class="text-xs text-slate-300 leading-relaxed">Seberapa Kristenkah dirimu?</p>
                    </div>
                    <div class="bg-slate-950/60 p-3.5 rounded-xl border border-purple-500/20 text-3xl group-hover:scale-110 transition duration-500 flex-shrink-0 shadow-inner">
                        🏆
                    </div>
                </div>
            </div>
        `;
    } else if (tab === 'notifikasi') {
        checkAuthBeforeAction(async () => {
            document.getElementById("headerTitle").innerText = "Notifikasi & Kotak Masuk";
            const badge = document.getElementById("unreadNotifBadge");
            if(badge) badge.classList.add("hidden");

            const main = document.querySelector("main");
            main.innerHTML = `
                <div class="space-y-3 pt-2">
                    <div class="flex justify-between items-center mb-3">
                        <p class="text-[11px] text-slate-400">Pemberitahuan warta, kegiatan & status Anda.</p>
                        <button onclick="showToast('Semua pesan ditandai telah dibaca.')" class="text-[10px] text-purple-400 font-semibold hover:underline">Tandai Dibaca</button>
                    </div>
                    <div id="notifListContainer" class="space-y-2">
                        <div class="text-center py-10 space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl animate-pulse">
                            <p class="text-xs text-slate-400">Memuat pemberitahuan...</p>
                        </div>
                    </div>
                </div>
            `;

            try {
                const user = window.currentUser;
                const response = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({ action: "getUserNotifications", user_id: user.id })
                });
                const result = await response.json();
                const container = document.getElementById("notifListContainer");

                if (result.status === "success" && result.notifications && result.notifications.length > 0) {
                    const latestNotifId = result.notifications[result.notifications.length - 1].id;
                    localStorage.setItem("last_seen_notif_id", latestNotifId);
                    
                    container.innerHTML = result.notifications.map(n => {
                        let formattedText = n.text;
                        let targetAction = "switchTab('home')";
                        const cat = (n.category || "").toLowerCase();
                        const textLower = (n.text || "").toLowerCase();

                        if (cat.includes('liturgi') || textLower.includes('liturgi')) {
                            targetAction = "openDownloadCenter()";
                        } else if (cat.includes('warta') || textLower.includes('warta')) {
                            targetAction = "openDownloadCenter()";
                        } else if (cat.includes('kegiatan') || cat.includes('agenda') || textLower.includes('kegiatan')) {
                            targetAction = "openEventsList()";
                        } else if (cat.includes('doa') || cat.includes('balasan') || textLower.includes('doa')) {
                            targetAction = "openPublicPrayerWall()";
                        } else if (cat.includes('persembahan') || cat.includes('donasi') || textLower.includes('donasi')) {
                            targetAction = "openDonationList()";
                        } else if (cat.includes('verifikasi') || textLower.includes('akun')) {
                            targetAction = "switchTab('profil')";
                        }

                        formattedText = formattedText.replace(
                            "[Cek disini]", 
                            `<a href="javascript:void(0)" onclick="${targetAction}" class="text-rose-600 font-bold animate-pulse underline ml-1">[Cek disini]</a>`
                        );

                        return `
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-sm animate-card-hover">
                                <div class="flex justify-between items-center">
                                    <span class="bg-purple-900/60 text-purple-300 text-[10px] px-2 py-0.5 rounded font-semibold">${n.category || 'Informasi'}</span>
                                    <span class="text-[10px] text-slate-500">${n.timestamp ? new Date(n.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : ''}</span>
                                </div>
                                <p class="text-xs text-slate-200 leading-relaxed">${formattedText}</p>
                            </div>
                        `;
                    }).join('');
                } else {
                    container.innerHTML = `
                        <div class="text-center py-10 space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                            <div class="text-3xl opacity-50">📭</div>
                            <p class="text-xs text-slate-400">Belum ada pesan global atau notifikasi khusus untuk Anda.</p>
                        </div>
                    `;
                }
            } catch (err) {
                const container = document.getElementById("notifListContainer");
                if(container) {
                    container.innerHTML = `<p class="text-xs text-rose-400 text-center py-6">Gagal memuat daftar notifikasi.</p>`;
                }
            }
        });
    } else if (tab === 'profil') {
        checkAuthBeforeAction(() => {
            const user = window.currentUser;
            const isAdmin = user.isAdmin || false;
            const adminRole = user.adminRole || user.role || '';

			// 1. Tangkap semua kemungkinan nama kolom foto dari database
            const rawFotoUrl = user.foto_profil || user.foto || user.url_foto || "";
            
            // 2. Bersihkan URL (Proxy bypass)
            const safeFotoUrl = rawFotoUrl ? rawFotoUrl.replace("i.ibb.co/", "i.ibb.co.com/") : "";
            
            // 3. Render HTML
            const profileImageHtml = safeFotoUrl 
                ? `<img src="${safeFotoUrl}" class="w-full h-full object-cover relative z-10" crossorigin="anonymous" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${user.nama_lengkap}&background=7e22ce&color=fff&size=150';">`
                : `<div class="w-full h-full bg-slate-200 flex items-center justify-center relative z-10"><span class="text-3xl opacity-50">👤</span></div>`;

            const verifiedBadge = user.is_verified 
                ? `<span class="inline-flex items-center gap-1.5 bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[11px] px-2.5 py-1 rounded-full font-semibold mt-1">
                       <img src="bedge.png" class="w-4 h-4 object-contain inline-block align-middle" alt="Verified"> Jemaat Terverifikasi
                   </span>`
                : `<span class="bg-amber-600/30 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 mt-1">⏳ Menunggu Verifikasi</span>`;

            const verificationBanner = !user.is_verified 
                ? `<div class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-3.5 rounded-2xl text-xs space-y-1 shadow-md mb-2">
                       <p class="font-bold text-purple-200 flex items-center gap-1.5"><span>✨</span> Keanggotaan Pniel Oebobo</p>
                       <p class="text-[11px] text-slate-300 leading-relaxed">Lengkapi data diri dan alamat domisili Anda untuk mendapatkan lencana resmi <b>Centang Biru <img src="bedge.png" class="w-4 h-4 inline-block align-middle" alt="Verified"> (Terverifikasi)</b> dari gereja.</p>
                   </div>`
                : '';

            main.innerHTML = `
                <div class="space-y-6 pt-2">
                    <div class="text-center space-y-2">
                        <div class="w-20 h-20 bg-purple-900 text-purple-200 font-bold text-2xl flex items-center justify-center rounded-full mx-auto shadow-inner border border-purple-800 overflow-hidden">
                            ${profileImageHtml}
                        </div>
                        <h3 class="font-bold text-lg text-white">${user.nama_lengkap}</h3>
                        
                        <div class="space-y-3 flex flex-col items-center">
                            <div>${verifiedBadge}</div>
                            <div class="w-full text-left">${verificationBanner}</div>
                        </div>
                        
                        <p class="text-xs text-purple-400 font-medium">${user.status_pelayanan || 'Jemaat'}</p>
                    </div>

                    <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs shadow-sm">
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Username Unik</span><span class="text-purple-300 font-mono font-bold">${user.username || '-'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Jenis Kelamin</span><span class="text-slate-200 font-medium">${user.jenis_kelamin || '<span class="text-amber-400 italic">Belum diisi</span>'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Lingkungan / Rayon</span><span class="text-slate-200 font-medium">Lingkungan ${user.lingkungan || '-'} - Rayon ${user.rayon || '-'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">No. WhatsApp</span><span class="text-slate-200 font-medium">${user.no_whatsapp || '-'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Alamat Domisili</span><span class="text-slate-200 font-medium">${user.alamat || '<span class="text-amber-400 italic">Belum diisi</span>'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Pekerjaan</span><span class="text-slate-200 font-medium">${user.pekerjaan || '<span class="text-amber-400 italic">Belum diisi</span>'}</span></div>
                        <div class="border-b border-slate-800 pb-2"><span class="text-slate-400 block text-[10px]">Golongan Darah</span><span class="text-slate-200 font-medium">${user.golongan_darah || '-'}</span></div>
                        <div><span class="text-slate-400 block text-[10px]">Minat Pelayanan / Komisi</span><span class="text-slate-200 font-medium">${user.minat_pelayanan || '-'}</span></div>
                    </div>

	<div class="space-y-2">
                        <button onclick="bukaPopupKTJ()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-xs shadow-md transition duration-500 flex items-center justify-center gap-1.5">
                            <span>🪪</span> Tampilkan KTJ (Kartu Tanda Jemaat)
                        </button>
                        <button onclick="openExtendedProfileForm(true)" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold text-xs shadow-md transition duration-500 flex items-center justify-center gap-1.5">
                            <span>✏️</span> Lengkapi / Perbarui Data Diri
                        </button>
                        <button onclick="logout()" class="w-full bg-rose-950/50 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 py-3 rounded-xl font-semibold text-xs transition duration-500">
                            Keluar (Logout)
                        </button>
                        ${isAdmin ? `<button onclick="redirectToRolePanel()" class="w-full text-center text-[11px] text-purple-400 hover:text-purple-300 pt-2 transition duration-500 font-bold bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/50">🔒 Masuk ke Panel ${adminRole || 'Pengurus'}</button>` : ''}
                    </div>
                </div>
            `;
        });
    }
}

const BIBLE_BOOKS = [
    {code: "GEN", name: "Kejadian", chapters: 50}, {code: "EXO", name: "Keluaran", chapters: 40},
    {code: "LEV", name: "Imamat", chapters: 27}, {code: "NUM", name: "Bilangan", chapters: 36},
    {code: "DEU", name: "Ulangan", chapters: 34}, {code: "JOS", name: "Yosua", chapters: 24},
    {code: "JDG", name: "Hakim-hakim", chapters: 21}, {code: "RUT", name: "Rut", chapters: 4},
    {code: "1SA", name: "1 Samuel", chapters: 31}, {code: "2SA", name: "2 Samuel", chapters: 24},
    {code: "1KI", name: "1 Raja-raja", chapters: 22}, {code: "2KI", name: "2 Raja-raja", chapters: 25},
    {code: "1CH", name: "1 Tawarikh", chapters: 29}, {code: "2CH", name: "2 Tawarikh", chapters: 36},
    {code: "EZR", name: "Ezra", chapters: 10}, {code: "NEH", name: "Nehemia", chapters: 13},
    {code: "EST", name: "Ester", chapters: 10}, {code: "JOB", name: "Ayub", chapters: 42},
    {code: "PSA", name: "Mazmur", chapters: 150}, {code: "PRO", name: "Amsal", chapters: 31},
    {code: "ECC", name: "Pengkhotbah", chapters: 12}, {code: "SNG", name: "Kidung Agung", chapters: 8},
    {code: "ISA", name: "Yesaya", chapters: 66}, {code: "JER", name: "Yeremia", chapters: 52},
    {code: "LAM", name: "Ratapan", chapters: 5}, {code: "EZK", name: "Yehezkiel", chapters: 48},
    {code: "DAN", name: "Daniel", chapters: 12}, {code: "HOS", name: "Hosea", chapters: 14},
    {code: "JOL", name: "Yoel", chapters: 3}, {code: "AMO", name: "Amos", chapters: 9},
    {code: "OBA", name: "Obaja", chapters: 1}, {code: "JON", name: "Yunus", chapters: 4},
    {code: "MIC", name: "Mikha", chapters: 7}, {code: "NAM", name: "Nahum", chapters: 3},
    {code: "HAB", name: "Habakuk", chapters: 3}, {code: "ZEP", name: "Zefanya", chapters: 3},
    {code: "HAG", name: "Hagai", chapters: 2}, {code: "ZEC", name: "Zakharia", chapters: 14},
    {code: "MAL", name: "Maleakhi", chapters: 4}, {code: "MAT", name: "Matius", chapters: 28},
    {code: "MRK", name: "Markus", chapters: 16}, {code: "LUK", name: "Lukas", chapters: 24},
    {code: "JHN", name: "Yohanes", chapters: 21}, {code: "ACT", name: "Kisah Para Rasul", chapters: 28},
    {code: "ROM", name: "Roma", chapters: 16}, {code: "1CO", name: "1 Korintus", chapters: 16},
    {code: "2CO", name: "2 Korintus", chapters: 13}, {code: "GAL", name: "Galatia", chapters: 6},
    {code: "EPH", name: "Efesus", chapters: 6}, {code: "PHP", name: "Filipi", chapters: 4},
    {code: "COL", name: "Kolose", chapters: 4}, {code: "1TH", name: "1 Tesalonika", chapters: 5},
    {code: "2TH", name: "2 Tesalonika", chapters: 3}, {code: "1TI", name: "1 Timotius", chapters: 6},
    {code: "2TI", name: "2 Timotius", chapters: 4}, {code: "TIT", name: "Titus", chapters: 3},
    {code: "PHM", name: "Filemon", chapters: 1}, {code: "HEB", name: "Ibrani", chapters: 13},
    {code: "JAS", name: "Yakobus", chapters: 5}, {code: "1PE", name: "1 Petrus", chapters: 5},
    {code: "2PE", name: "2 Petrus", chapters: 3}, {code: "1JN", name: "1 Yohanes", chapters: 5},
    {code: "2JN", name: "2 Yohanes", chapters: 1}, {code: "3JN", name: "3 Yohanes", chapters: 1},
    {code: "JUD", name: "Yudas", chapters: 1}, {code: "REV", name: "Wahyu", chapters: 22}
];

function openBibleSearch(isBack = false) {
    if (!isBack) pushNavState('openBibleSearch');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Alkitab Digital";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 shadow-sm">
                <select id="bibleBook" class="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none">
                    ${BIBLE_BOOKS.map(b => `<option value="${b.code}">${b.name}</option>`).join('')}
                </select>
                <input type="number" id="bibleChapter" value="1" min="1" max="150" class="w-16 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none text-center" placeholder="Pasal">
                <button onclick="fetchBibleVerse()" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition duration-500 whitespace-nowrap">Muat</button>
            </div>

            <div id="bibleResult" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed min-h-[250px] shadow-sm">
                Silakan pilih kitab dan pasal di atas lalu tekan tombol Muat.
            </div>
        </div>
    `;
}

async function fetchBibleVerse() {
    const bookCode = document.getElementById("bibleBook").value;
    const chapter = document.getElementById("bibleChapter").value;
    const bookObj = BIBLE_BOOKS.find(b => b.code === bookCode);
    const resultArea = document.getElementById("bibleResult");
    
    resultArea.innerHTML = `<p class="text-center text-purple-400 py-10 animate-pulse">Memuat ${bookObj.name} Pasal ${chapter}...</p>`;
    
    try {
        const response = await fetch(`https://api-alkitab.herokuapp.com/v2/passage/${bookCode}/${chapter}?ver=tb`);
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        const result = await response.json();
        
        if (result && result.data && result.data.verses && result.data.verses.length > 0) {
            let htmlContent = `<h5 class="font-bold text-purple-400 mb-3 text-sm border-b border-slate-800 pb-1">${bookObj.name} Pasal ${chapter}</h5>`;
            result.data.verses.forEach(v => {
                htmlContent += `<p class="text-[11px] leading-relaxed mb-1.5"><strong class="text-purple-300">${v.verse}.</strong> ${v.text}</p>`;
            });
            resultArea.innerHTML = htmlContent;
        } else {
            throw new Error("Ayat tidak ditemukan");
        }
    } catch (err) {
        resultArea.innerHTML = `
            <div class="space-y-3">
                <div class="bg-amber-950/40 border border-amber-900/40 p-3 rounded-xl">
                    <p class="text-[11px] text-amber-300">ℹ️ Server Alkitab online sedang dalam pemeliharaan.</p>
                </div>
                <h5 class="font-bold text-purple-400 mb-2">${bookObj.name} Pasal ${chapter}</h5>
                <p class="text-[11px] leading-relaxed text-slate-400 italic">Silakan coba beberapa saat lagi atau hubungi admin.</p>
            </div>
        `;
    }
}

function openCategoriesMenu(isBack = false) {
    if (!isBack) pushNavState('openCategoriesMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Layanan & Info Sekretariat";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="bg-amber-950/40 border border-amber-900/40 p-4 rounded-xl shadow-inner">
                <p class="text-xs text-amber-200 leading-relaxed text-center">Pilih layanan administrasi atau lihat informasi jadwal pelayanan gereja.</p>
            </div>

            <div class="grid grid-cols-1 gap-3 mt-4">
                <!-- Tombol ke Layanan Surat -->
                <div onclick="openSuratSubMenu()" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-amber-500 transition duration-500 shadow-sm animate-card-hover group">
                    <div class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-amber-500/20 transition">
                        ✉️
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white mb-1">Layanan Surat Menyurat</h4>
                        <p class="text-[10px] text-slate-400">Pengajuan surat keterangan, pindah, atau pengantar sakramen.</p>
                    </div>
                </div>

                <!-- Tombol ke Jadwal Pelayanan -->
                <div onclick="openDutyRoster()" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition duration-500 shadow-sm animate-card-hover group">
                    <div class="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-indigo-500/20 transition">
                        📋
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white mb-1">Jadwal Pelayanan</h4>
                        <p class="text-[10px] text-slate-400">Cek jadwal tugas Presbiter, Kantoria, Organis, dan lainnya.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openSuratSubMenu(isBack = false) {
    if (!isBack) pushNavState('openSuratSubMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Layanan Surat";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-4">
            
			<div class="bg-amber-950/40 border border-amber-900/40 p-3 rounded-xl">
                <p class="text-xs text-amber-200">Pilih jenis layanan surat menyurat yang Anda butuhkan di bawah ini, atau cek menu <a href="javascript:void(0)" onclick="openDownloadCenter()" class="font-bold text-amber-400 underline hover:text-amber-300 transition">Download</a> secara berkala.</p>
            </div>

            <div class="space-y-3">
                <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h4 class="text-xs font-bold text-white">✉️ Surat Keterangan Jemaat / Pindah</h4>
                        <p class="text-[10px] text-slate-400">Pengajuan surat aktif, pindah gereja, dll.</p>
                    </div>
                    <button onclick="checkAuthBeforeAction(() => openSuratForm('Surat Keterangan / Pindah'))" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-500 shrink-0 ml-2">Buat Pengajuan</button>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h4 class="text-xs font-bold text-white">⛪ Pengantar Sakramen & Nikah</h4>
                        <p class="text-[10px] text-slate-400">Pendaftaran Baptis, Sidi, atau Pemberkatan.</p>
                    </div>
                    <button onclick="checkAuthBeforeAction(() => openSuratForm('Pengantar Sakramen / Nikah'))" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-500 shrink-0 ml-2">Buat Pengajuan</button>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h4 class="text-xs font-bold text-white">📄 Surat Rekomendasi Umum</h4>
                        <p class="text-[10px] text-slate-400">Keperluan beasiswa, urusan kampus, dll.</p>
                    </div>
                    <button onclick="checkAuthBeforeAction(() => openSuratForm('Surat Rekomendasi Umum'))" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-500 shrink-0 ml-2">Buat Pengajuan</button>
                </div>

				<div class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h4 class="text-xs font-bold text-white">📄 Izin Penggunaan Fasilitas / Inventaris</h4>
                        <p class="text-[10px] text-slate-400">Keperluan penggunaan fasilitas dan inventaris Gereja.</p>
                    </div>
                    <button onclick="checkAuthBeforeAction(() => openSuratForm('Izin Penggunaan Fasilitas / Inventaris'))" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-500 shrink-0 ml-2">Buat Pengajuan</button>
                </div>
            </div>
        </div>
    `;
}

async function openDutyRoster(isBack = false) {
    if (!isBack) pushNavState('openDutyRoster');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Jadwal Pelayanan";
    triggerPageTransition();

    main.innerHTML = `
        <div class="space-y-4">
            <button onclick="openCategoriesMenu(true)" class="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-1">
                <i class="fa-solid fa-arrow-left"></i> Kembali ke Menu Sekretariat
            </button>
            
            <div id="myDutyBanner"></div>

            <div class="bg-indigo-950/40 border border-indigo-900/40 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                <span class="text-2xl">📋</span>
                <p class="text-xs text-indigo-200 leading-relaxed">Jadwal pelayanan jemaat berdasarkan sesi ibadah.</p>
            </div>

            <!-- Wadah Tanggal Update (Muncul jika ada data) -->
            <div id="lastUpdateInfo" class="text-center hidden pt-1"></div>

            <div id="dutyContainer" class="space-y-4 pb-10">
                <p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat jadwal pelayanan...</p>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getDutyRoster`);
        const result = await response.json();
        const container = document.getElementById("dutyContainer");
        const banner = document.getElementById("myDutyBanner");
        const duties = result.data || [];
        
        if (duties.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Belum ada jadwal pelayanan diterbitkan.</p>`;
            return;
        }

        // LOGIKA PENCARIAN TIMESTAMP TERAKHIR DARI DATABASE
        let latestTimeMs = 0;
        const groupedRoster = {};
        
        duties.forEach(d => {
            // Mengecek kolom timestamp di database
            if (d.timestamp) {
                const ms = new Date(d.timestamp).getTime();
                if (ms > latestTimeMs) latestTimeMs = ms;
            }

            const eventKey = `${d.tanggal}|${d.jenis_ibadah}`;
            if (!groupedRoster[eventKey]) {
                groupedRoster[eventKey] = { tanggal: d.tanggal, jenis_ibadah: d.jenis_ibadah, kategori: {} };
            }
            if (!groupedRoster[eventKey].kategori[d.kategori_tugas]) {
                groupedRoster[eventKey].kategori[d.kategori_tugas] = [];
            }
            groupedRoster[eventKey].kategori[d.kategori_tugas].push({ nama: d.nama_petugas, jam: d.waktu });
        });

        // TAMPILKAN TANGGAL UPDATE KE LAYAR JEMAAT
        if (latestTimeMs > 0) {
            const dateObj = new Date(latestTimeMs);
            const formatWaktu = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA';
            const updateDiv = document.getElementById("lastUpdateInfo");
            updateDiv.innerHTML = `<span class="bg-slate-900 border border-slate-800 text-purple-400 text-[10px] px-3 py-1.5 rounded-full font-bold inline-block shadow-sm">🔄 Terakhir Diperbarui: ${formatWaktu}</span>`;
            updateDiv.classList.remove("hidden");
        }

        container.innerHTML = Object.values(groupedRoster).map(event => {
            const dateObj = new Date(event.tanggal);
            const formatTgl = !isNaN(dateObj) ? dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : event.tanggal;

            return `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm animate-card-hover">
                    <div class="border-b border-slate-800 pb-3 mb-3">
                        <h4 class="text-sm font-bold text-purple-400">${event.jenis_ibadah}</h4>
                        <p class="text-[11px] text-slate-400 mt-0.5">📅 ${formatTgl}</p>
                    </div>
                    
                    <div class="space-y-4">
                        ${Object.keys(event.kategori).map(kat => {
                            const petugasSorted = event.kategori[kat].sort((a, b) => a.jam.localeCompare(b.jam));
                            return `
                            <div>
                                <span class="bg-indigo-900 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-bold inline-block mb-2">${kat}</span>
                                <div class="text-[11px] text-slate-300 pl-1 space-y-1.5">
									${petugasSorted.map(petugas => {
                                        // LOGIKA BARU: Memecah nama menjadi list ke bawah
                                        const daftarNama = petugas.nama.split(',').map(n => n.trim()).filter(n => n !== "");
                                        
                                        return daftarNama.map(namaIndividu => `
                                            <div class="flex items-start gap-1.5">
                                                <span class="text-slate-500 font-bold">-</span>
                                                <span>${namaIndividu} <span class="text-slate-500 text-[9px] font-normal ml-0.5">(${petugas.jam})</span></span>
                                            </div>
                                        `).join('');
                                    }).join('')}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Banner Tugas Pribadi...
        const user = window.currentUser || JSON.parse(localStorage.getItem("user_gereja"));
        if (user) {
            const myDuties = duties.filter(d => d.nama_petugas.toLowerCase().includes(user.nama_lengkap.toLowerCase()));
            if (myDuties.length > 0) {
                const nextDuty = myDuties[0];
                const dateObj = new Date(nextDuty.tanggal);
                const formatTgl = !isNaN(dateObj) ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : nextDuty.tanggal;
                
                banner.innerHTML = `
                    <div class="bg-gradient-to-r from-amber-600 to-orange-500 p-4 rounded-2xl shadow-lg border border-amber-400 text-white animate-slide-in mb-4">
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="text-lg">🔔</span>
                            <h4 class="text-xs font-bold uppercase tracking-wider">Pengingat Tugas!</h4>
                        </div>
                        <p class="text-[11px] leading-relaxed">Syalom <b>${user.nama_lengkap}</b>, Anda terjadwal untuk tugas <b>${nextDuty.kategori_tugas}</b> pada <b>${nextDuty.jenis_ibadah}</b> (${formatTgl}). Persiapkan diri Anda.</p>
                    </div>
                `;
            }
        }
    } catch (err) {
        document.getElementById("dutyContainer").innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat jadwal pelayanan.</p>`;
    }
}

function openSuratForm(jenisSurat, isBack = false) {
    if (!isBack) pushNavState('openSuratForm', [jenisSurat]);
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Form " + jenisSurat;
    triggerPageTransition();

    let user = {};
    try {
        const savedUser = localStorage.getItem("user_gereja") || localStorage.getItem("currentUser");
        if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {}

    main.innerHTML = `
        <div class="space-y-4">
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-2">Formulir ${jenisSurat}</h3>
                <input type="hidden" id="jenisSuratVal" value="${jenisSurat}">
                
                <div>
                    <label class="text-[10px] text-slate-400 block mb-1">Nama Lengkap</label>
                    <input type="text" id="inputNama" value="${user.nama_lengkap || ''}" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" readonly>
                </div>

                <div>
                    <label class="text-[10px] text-slate-400 block mb-1">Nomor WhatsApp Aktif</label>
                    <input type="text" id="inputWa" value="${user.no_whatsapp || ''}" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" placeholder="Contoh: 08123456789">
                </div>

                <div>
                    <label class="text-[10px] text-slate-400 block mb-1">Keterangan / Keperluan Detail</label>
                    <textarea id="inputKeterangan" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" placeholder="Tuliskan detail atau tujuan pengajuan surat ini..."></textarea>
                </div>

                <button onclick="submitAndRedirectWA()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition duration-500">
                    Simpan & Kirim Konfirmasi ke WA Sekretariat
                </button>
            </div>
        </div>
    `;
}

function submitAndRedirectWA() {
    const jenisSurat = document.getElementById("jenisSuratVal").value;
    const nama = document.getElementById("inputNama").value;
    const wa = document.getElementById("inputWa").value;
    const keterangan = document.getElementById("inputKeterangan").value;
    
    let user = {};
    try {
        const savedUser = localStorage.getItem("user_gereja") || localStorage.getItem("currentUser");
        if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {}

    if (!wa || !keterangan) {
        showToast("Mohon lengkapi nomor WhatsApp dan keterangan keperluan Anda.", "error");
        return;
    }

    showToast("Menyimpan data pengajuan...");

    const payload = {
        action: "submitSuratRequest",
        id_user: user.id || "Tamu",
        nama_lengkap: nama,
        jenis_surat: jenisSurat,
        keterangan: keterangan,
        no_whatsapp: wa
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(response => {
        let pesanWa = `Shalom Sekretariat Gereja,%0A%0ASaya ingin mengajukan permohonan surat:%0A` +
                      `- *Jenis*: ${encodeURIComponent(jenisSurat)}%0A` +
                      `- *Nama*: ${encodeURIComponent(nama)}%0A` +
                      `- *No WA*: ${encodeURIComponent(wa)}%0A` +
                      `- *Keterangan*: ${encodeURIComponent(keterangan)}%0A%0AMohon bantuannya untuk diproses. Terima kasih.`;
        
        window.open(`https://wa.me/${waNomorSekretariat}?text=${pesanWa}`, '_blank');
        switchTab('home');
    })
    .catch(error => {
        showToast("Gagal mengirim data.", "error");
    });
}

function openVideosMenu(isBack = false) {
    if (!isBack) pushNavState('openVideosMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Kanal Youtube JPO";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            
            <div class="bg-sky-950/40 border border-sky-900/40 p-3 rounded-xl mb-4 flex items-center justify-between gap-3">
                <p class="text-xs text-sky-200">Selengkapnya kunjungi channel JPO</p>
                <a href="https://www.youtube.com/@GMITPNIELOebobo" target="_blank" class="shrink-0 hover:scale-105 transition-transform duration-200">
                    <img src="button.ico" alt="Buka YouTube" class="h-14 w-auto object-contain animate-bounce">
                </a>
            </div>

            <div class="grid grid-cols-1 landscape:sm:grid-cols-2 gap-4">
                <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2 shadow-sm">
                    <h4 class="text-xs font-bold text-white">Ekspresif</h4>
                    <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe class="w-full h-full" src="https://www.youtube.com/embed/KyYWzaNAZxY?list=PLAxMCJ5BwwFSroLQBQBgRUrrH0GkvU4v6" title="Live Stream" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2 shadow-sm">
                    <h4 class="text-xs font-bold text-white">Cuplikan Video - Pniel Oebobo</h4>
                    <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe class="w-full h-full" src="https://www.youtube.com/embed/crC4ssoP9SI" title="YouTube video" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2 flex flex-col items-center shadow-sm landscape:sm:col-span-2">
                    <h4 class="text-xs font-bold text-white w-full">📱 Cuplikan Singkat (Shorts)</h4>
                    <div class="relative w-[250px] aspect-[9/16] rounded-lg overflow-hidden bg-black">
                        <iframe class="w-full h-full" src="https://www.youtube.com/embed/zFOv9Gy7Q7w" title="YouTube Shorts" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function openGaleryMenu(isBack = false) { 
    if (!isBack) pushNavState('openGaleryMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Galeri Foto Jemaat";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-4">
            
            
            <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2 text-xs shadow-sm">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">Filter Kategorial</label>
                        <select id="filterKategorial" onchange="filterGallery()" class="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                            <option value="">Semua Kategorial</option>
                            <option value="Lansia">Lansia</option>
                            <option value="PKB">PKB (Kaum Bapak)</option>
                            <option value="PW">PW (Kaum Wanita)</option>
                            <option value="Pemuda">Pemuda</option>
                            <option value="Remaja">Remaja</option>
                            <option value="Anak">Anak / SM</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">Filter Momen</label>
                        <select id="filterMoment" onchange="filterGallery()" class="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                            <option value="">Semua Momen</option>
                            <option value="Natal">Natal</option>
                            <option value="Tahun Baru">Tahun Baru</option>
                            <option value="Paskah">Paskah</option>
                            <option value="Ultah Gereja">Ultah Gereja</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Filter Berdasarkan Tanggal</label>
                    <input type="date" id="filterDate" onchange="filterGallery()" class="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                </div>
            </div>

            <div id="galleryGrid" class="grid grid-cols-4 landscape:sm:grid-cols-6 gap-2">
                <p class="col-span-full text-xs text-slate-400 text-center py-10 animate-pulse">Memuat galeri foto...</p>
            </div>
        </div>

        <div id="lightboxModal" class="fixed inset-0 bg-black/95 z-[99999] hidden flex items-center justify-center p-4" onclick="closeLightbox(event)">
            <div class="relative max-w-lg landscape:max-w-3xl w-full flex flex-col items-center justify-center" onclick="event.stopPropagation()">
                <button onclick="closeLightbox()" class="absolute -top-6 right-0 bg-rose-600 hover:bg-rose-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-2xl border-2 border-white z-50 transition duration-500 active:scale-95">
                    ✕
                </button>
                <button onclick="slidePhoto(-1)" class="absolute -left-3 sm:-left-12 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xl border border-slate-600 z-40 transition duration-500 active:scale-95">
                    ❮
                </button>
                <img id="lightboxImg" src="" onclick="slidePhoto(1)" class="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800 bg-black cursor-pointer">
                <button onclick="slidePhoto(1)" class="absolute -right-3 sm:-right-12 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xl border border-slate-600 z-40 transition duration-500 active:scale-95">
                    ❯
                </button>
                <p id="lightboxCaption" class="text-xs text-slate-300 mt-3 text-center font-medium px-2 truncate w-full"></p>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getGallery`);
        const result = await response.json();
        window.allGalleryData = result.gallery || [];
        renderGallery(window.allGalleryData);
    } catch (err) {
        document.getElementById("galleryGrid").innerHTML = `<p class="col-span-full text-xs text-rose-400 text-center">Gagal memuat galeri.</p>`;
    }
}

let currentActiveGallery = [];
let currentPhotoIndex = 0;

function renderGallery(photos) {
    currentActiveGallery = photos; 
    const grid = document.getElementById("galleryGrid");
    
    if (photos.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-xs text-slate-400 text-center py-10">Tidak ada foto yang sesuai dengan filter.</p>`;
        return;
    }

    grid.innerHTML = photos.map((p, index) => {
        const r = p.reactions || {}; 
        let safeUrl = p.url ? `https://wsrv.nl/?url=${encodeURIComponent(p.url)}&w=600&fit=cover` : '';
        
        return `
        <div class="bg-white p-1.5 pb-2 rounded shadow-md cursor-pointer transform animate-card-hover border border-slate-200 flex flex-col justify-between">
            <div onclick="openLightbox(${index})" class="aspect-square bg-slate-100 overflow-hidden rounded-sm">
                <img src="${safeUrl}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <p class="text-[9px] text-slate-800 font-serif text-center truncate mt-1 px-0.5">${p.judul}</p>
            <div class="mt-1 pt-1 border-t border-slate-100 flex justify-center">
                <button onclick="handleReactionAndRefresh('galeri', '${p.id}', '❤️')" class="text-[10px] bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-2 py-1 rounded-lg transition duration-500 flex items-center justify-center border border-slate-200 hover:border-rose-200 w-full">
                    ❤️ ${r["❤️"] ? `<span class="text-[10px] font-bold text-rose-500 ml-1">${r["❤️"]}</span>` : '<span class="ml-1">Suka</span>'}
                </button>
            </div>
        </div>
    `}).join('');
}

function filterGallery() {
    const kategorialVal = document.getElementById("filterKategorial").value;
    const momentVal = document.getElementById("filterMoment").value;
    const dateVal = document.getElementById("filterDate").value;

    let filtered = window.allGalleryData || [];

    if (kategorialVal) filtered = filtered.filter(p => p.kategorial === kategorialVal);
    if (momentVal) filtered = filtered.filter(p => p.moment === momentVal);
    if (dateVal) filtered = filtered.filter(p => p.tanggal === dateVal);

    renderGallery(filtered);
}

function openLightbox(index, isBack = false) {
    if (!isBack) pushNavState('openLightbox', [index]);
    currentPhotoIndex = index;
    const photo = currentActiveGallery[currentPhotoIndex];
    
    let safeLargeUrl = photo.url ? `https://wsrv.nl/?url=${encodeURIComponent(photo.url)}&w=1200` : '';
    
    document.getElementById("lightboxImg").src = safeLargeUrl;
    document.getElementById("lightboxCaption").innerText = `${photo.judul} (${photo.tanggal || '-'})`;
    document.getElementById("lightboxModal").classList.remove("hidden");
}

function closeLightbox(event, fromPopState = false) {
    if (!event || event.target.id === "lightboxModal" || event.target.tagName === "BUTTON") {
        document.getElementById("lightboxModal").classList.add("hidden");
        if (fromPopState !== true) {
            history.back(); 
        }
    }
}

function slidePhoto(direction) {
    currentPhotoIndex += direction;
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = currentActiveGallery.length - 1;
    } else if (currentPhotoIndex >= currentActiveGallery.length) {
        currentPhotoIndex = 0;
    }
    const photo = currentActiveGallery[currentPhotoIndex];
    let safeLargeUrl = photo.url ? `https://wsrv.nl/?url=${encodeURIComponent(photo.url)}&w=1200` : '';
    document.getElementById("lightboxImg").src = safeLargeUrl;
    document.getElementById("lightboxCaption").innerText = `${photo.judul} (${photo.tanggal || '-'})`;
}

async function openBibleMenu(isBack = false) {
    if (!isBack) pushNavState('openBibleMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Renungan & Ayat Emas";
    triggerPageTransition();
    
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="text-center py-10 text-slate-400 text-sm animate-pulse">Memuat renungan hari ini...</div>
        </div>
    `;
    
    try {
        let res = await fetch(SCRIPT_URL + "?action=getLatestRenungan");
        let json = await res.json();
        
        if (json.status === "success" && json.data) {
            let item = json.data;
            let rawText = item.renungan || "";
            let lines = rawText.split("\n").filter(l => l.trim() !== "");
            
            let formattedHtml = "";
            if (lines.length > 0) {
                let judul = `<h4 class="font-bold text-white text-base mb-3">${lines[0]}</h4>`;
                let isiTengah = "";
                let quote = "";
                
                if (lines.length > 2) {
                    let lastLine = lines[lines.length - 1];
                    quote = `<blockquote class="border-l-2 border-purple-500 pl-3 italic text-purple-200/90 my-3 text-xs">"${lastLine}"</blockquote>`;
                    let middleLines = lines.slice(1, lines.length - 1);
                    isiTengah = middleLines.join("<br><br>");
                } else if (lines.length === 2) {
                    isiTengah = lines[1];
                }
                
                formattedHtml = `${judul}<div class="space-y-2 text-slate-300">${isiTengah}</div>${quote}`;
            } else {
                formattedHtml = "Belum ada isi renungan.";
            }

            main.innerHTML = `
                <div class="space-y-4">
                    
                    
                    <div class="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-3 shadow-lg">
                        <span class="bg-emerald-900/80 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-semibold">✨ Ayat Emas Harian (${item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) : ''})</span>
                        <blockquote class="text-sm text-slate-100 italic leading-relaxed font-serif">
                            "${item.isi_ayat}"
                        </blockquote>
                        <p class="text-xs font-bold text-emerald-400">— ${item.ayat_harian} —</p>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                        <div class="flex items-center space-x-2">
                            <span class="bg-purple-900/80 text-purple-300 text-[10px] px-2.5 py-1 rounded-full font-semibold">✝️ Renungan Harian</span>
                        </div>
                        <div class="text-sm text-slate-300 leading-relaxed space-y-2 font-sans">
                            ${formattedHtml}
                        </div>
                    </div>
                </div>
            `;
        } else {
            main.innerHTML = `
                <div class="space-y-4">
                    
                    <div class="text-center py-10 text-slate-400 text-sm">Belum ada renungan yang dipublikasikan hari ini.</div>
                </div>
            `;
        }
    } catch (err) {
        main.innerHTML = `
            <div class="space-y-4">
                
                <div class="text-center py-10 text-rose-400 text-sm">Gagal memuat data renungan.</div>
            </div>
        `;
    }
}

function openLivestreamsMenu(isBack = false) {
    if (!isBack) pushNavState('openLivestreamsMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Siaran Langsung Ibadah";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="bg-orange-950/40 border border-orange-900/40 p-3 rounded-xl flex justify-between items-center shadow-sm">
                <p class="text-xs text-orange-200">Video siaran langsung Ibadah Minggu akan mulai secara otomatis dan real-time pada setiap Ibadah Utama ke-2 Pukul 08:00 WITA.</p>
                <span class="bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse shadow-lg shadow-rose-600/50">LIVE</span>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 shadow-lg">
                <h4 class="text-xs font-bold text-white">Live Streaming Ibadah Minggu Pniel Oebobo</h4>
                <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe class="w-full h-full" src="https://www.youtube.com/embed/live_stream?channel=UCZ3-3qhAyR8mDb6VTeJOXtA" title="Live Stream" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `;
}

function openStatistikMenu(isBack = false) {
    if (!isBack) pushNavState('openStatistikMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Statistik & Demografi";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            <div id="statsContainer" class="space-y-4">
                <div class="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div class="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p class="text-xs text-slate-400">Memuat data demografi gereja...</p>
                </div>
            </div>
        </div>
    `;
    loadStatisticsData();
}

async function loadStatisticsData() {
    const container = document.getElementById("statsContainer");
    if (!container) return;
    
    try {
        const res = await fetch(`${SCRIPT_URL}?action=getAllUsers`);
        const result = await res.json();
        let rawData = result.users || result.data || [];
        
        if (rawData.length === 0) {
            container.innerHTML = `<div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">Belum ada data jemaat.</div>`;
            return;
        }

        let dataList = [];
        if (Array.isArray(rawData[0])) {
            let headers = rawData[0].map(h => String(h).trim().toLowerCase());
            let idxVerified = headers.findIndex(h => h.includes('verif') || h.includes('status'));
            let idxGender = headers.findIndex(h => h.includes('gender') || h.includes('kelamin'));
            let idxLing = headers.findIndex(h => h.includes('lingkungan') || h.includes('ling'));
            let idxRayon = headers.findIndex(h => h.includes('rayon'));
            let idxMinat = headers.findIndex(h => h.includes('minat') || h.includes('komisi') || h.includes('pelayanan'));

            for (let i = 1; i < rawData.length; i++) {
                let row = rawData[i];
                dataList.push({
                    is_verified: idxVerified !== -1 ? String(row[idxVerified]) : "",
                    jenis_kelamin: idxGender !== -1 ? String(row[idxGender]) : "",
                    lingkungan: idxLing !== -1 ? String(row[idxLing]) : "",
                    rayon: idxRayon !== -1 ? String(row[idxRayon]) : "",
                    minat_pelayanan: idxMinat !== -1 ? String(row[idxMinat]) : ""
                });
            }
        } else {
            dataList = rawData.map(item => ({
                is_verified: item.is_verified || item[13] || "",
                jenis_kelamin: item.jenis_kelamin || item[16] || "",
                lingkungan: item.lingkungan || item[5] || "",
                rayon: item.rayon || item[6] || "",
                minat_pelayanan: item.minat_pelayanan || item[12] || ""
            }));
        }

        const totalJemaat = dataList.length;
        let verifiedCount = dataList.filter(item => {
            let v = String(item.is_verified || "").trim().toLowerCase();
            return v === "verified" || v === "true" || v === "terverifikasi";
        }).length;
        
        let pendingCount = totalJemaat - verifiedCount;
        let verifiedPercent = totalJemaat > 0 ? Math.round((verifiedCount / totalJemaat) * 100) : 0;

        let genderMap = { "Laki-laki": 0, "Perempuan": 0, "Belum Diisi": 0 };
        dataList.forEach(item => {
            let g = String(item.jenis_kelamin || "").trim().toLowerCase();
            if (g.startsWith("l") || g.includes("pria") || g.includes("laki")) {
                genderMap["Laki-laki"]++;
            } else if (g.startsWith("p") || g.includes("wanita") || g.includes("perempuan")) {
                genderMap["Perempuan"]++;
            } else {
                genderMap["Belum Diisi"]++;
            }
        });

        let lingkunganMap = {};
        for (let i = 1; i <= 16; i++) { lingkunganMap["Lingkungan " + i] = 0; }
        lingkunganMap["Belum Ditentukan"] = 0;

        dataList.forEach(item => {
            let lingStr = String(item.lingkungan || "").trim();
            if (/^\d+$/.test(lingStr)) lingStr = "Lingkungan " + lingStr;
            let lingKey = "Belum Ditentukan";
            if (lingStr && lingStr !== "-") {
                let match = lingStr.match(/(?:lingkungan\s*)?(\d+)/i);
                if (match && parseInt(match[1]) >= 1 && parseInt(match[1]) <= 16) {
                    lingKey = "Lingkungan " + parseInt(match[1]);
                } else {
                    lingKey = lingStr;
                }
            }
            if (lingkunganMap[lingKey] !== undefined) lingkunganMap[lingKey]++;
            else lingkunganMap[lingKey] = 1;
        });

        let minatMap = {};
        dataList.forEach(item => {
            let minatRaw = String(item.minat_pelayanan || "").trim();
            if (!minatRaw || minatRaw === "-") {
                minatMap["Belum Memilih"] = (minatMap["Belum Memilih"] || 0) + 1;
            } else {
                minatRaw.split(",").forEach(m => {
                    let cleanM = m.trim();
                    if (cleanM) minatMap[cleanM] = (minatMap[cleanM] || 0) + 1;
                });
            }
        });

        function renderBar(label, count, total, colorClass = "bg-purple-600") {
            let percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return `
                <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                        <span class="font-medium text-slate-700">${label}</span>
                        <span class="font-bold text-slate-900">${count} <span class="text-[10px] text-slate-400 font-normal">(${percent}%)</span></span>
                    </div>
                    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div class="${colorClass} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }

        const warnaLingkungan = [
            "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
            "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
            "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
            "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-slate-400"
        ];

        let entriesLingkungan = Object.entries(lingkunganMap);
        let multiBarHtml = `
            <div class="space-y-2">
                <div class="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Distribusi XVI Lingkungan</span>
                    <span>Total: ${totalJemaat} Jiwa</span>
                </div>
                <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner">
        `;

        entriesLingkungan.forEach(([ling, count], index) => {
            let percent = totalJemaat > 0 ? (count / totalJemaat) * 100 : 0;
            if (percent > 0) {
                let colorClass = warnaLingkungan[index % warnaLingkungan.length];
                multiBarHtml += `<div class="${colorClass} h-full transition-all duration-500" style="width: ${percent}%" title="${ling}: ${count} (${Math.round(percent)}%)"></div>`;
            }
        });

        multiBarHtml += `</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 text-[10px]">`;
        entriesLingkungan.forEach(([ling, count], index) => {
            let percent = totalJemaat > 0 ? Math.round((count / totalJemaat) * 100) : 0;
            let colorClass = warnaLingkungan[index % warnaLingkungan.length];
            multiBarHtml += `
                <div class="flex items-center gap-1.5 bg-slate-50 p-1 rounded border border-slate-100">
                    <span class="w-2.5 h-2.5 rounded-full ${colorClass} shrink-0"></span>
                    <span class="truncate text-slate-600 font-medium">${ling}: <b class="text-slate-900">${count}</b> (${percent}%)</span>
                </div>
            `;
        });
        multiBarHtml += `</div></div>`;

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-card-hover">
                    <p class="text-[11px] text-slate-500 font-medium">Total Jemaat</p>
                    <h3 class="text-2xl font-black text-slate-900 mt-1">${totalJemaat}</h3>
                    <p class="text-[10px] text-purple-600 mt-1 font-semibold">Terdaftar di Database</p>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-card-hover">
                    <p class="text-[11px] text-slate-500 font-medium">Status Verifikasi</p>
                    <h3 class="text-2xl font-black text-emerald-600 mt-1">${verifiedPercent}%</h3>
                    <p class="text-[10px] text-slate-400 mt-1">${verifiedCount} Terverifikasi, ${pendingCount} Pending</p>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 class="font-bold text-xs text-slate-900 border-b pb-2">👥 Demografi Jenis Kelamin</h3>
                <div class="space-y-3">
                    ${renderBar("Laki-laki", genderMap["Laki-laki"], totalJemaat, "bg-blue-500")}
                    ${renderBar("Perempuan", genderMap["Perempuan"], totalJemaat, "bg-pink-500")}
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 class="font-bold text-xs text-slate-900 border-b pb-2">📍 Sebaran Per Lingkungan (XVI Lingkungan)</h3>
                ${multiBarHtml}
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 class="font-bold text-xs text-slate-900 border-b pb-2">✨ Minat Pelayanan Jemaat</h3>
                <div class="space-y-3">
                    ${Object.entries(minatMap).map(([minat, count]) => renderBar(minat, count, totalJemaat, "bg-amber-500")).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-rose-500">Terjadi kesalahan koneksi server.</div>`;
    }
}
function openAboutPage(isBack = false) {
    if (!isBack) pushNavState('openAboutPage');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Tentang Gereja";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <div class="text-center pb-2 border-b border-slate-800">
                    <h3 class="font-bold text-sm text-purple-300">GMIT Jemaat Pniel Oebobo</h3>
                    <p class="text-slate-400 text-[11px] mt-1">📍 Jl. WJ Lalamentik No.15, Oebobo, Kota Kupang, NTT</p>
                </div>
                <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
                    <div>
                        <span class="text-slate-400 text-[10px] block">No. Telepon</span>
                        <span class="font-medium text-slate-200">(0380) 8084020 / 834130</span>
                    </div>
                    <div>
                        <span class="text-slate-400 text-[10px] block">Email Resmi</span>
                        <span class="font-medium text-slate-200">gerejapnieloebobo@gmail.com</span>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Pendeta</h4>
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="pdttyas.png" alt="Pendeta" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">Pdt. Tentremingtyas Messakh, S.Si</p>
                        <p class="text-[11px] text-slate-400">Ketua Majelis Jemaat Pniel Oebobo</p>
                    </div>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Pendeta</h4>
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="pdtmaria.png" alt="Pendeta" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">Pdt. Maria A. Litelnoni-Johannes</p>
                        <p class="text-[11px] text-slate-400">Pendeta Jemaat Pniel Oebobo</p>
                    </div>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Pendeta</h4>
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="pdtselvy.png" alt="Pendeta" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">Pdt. Selviany A. Pollo-Milla, S.Si-Teol</p>
                        <p class="text-[11px] text-slate-400">Pendeta Jemaat Pniel Oebobo</p>
                    </div>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Pendeta</h4>
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="pdtwempi.png" alt="Pendeta" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">Pdt. Wempi M. Rini, S.Th</p>
                        <p class="text-[11px] text-slate-400">Pendeta Jemaat Pniel Oebobo</p>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Jadwal & Jam Kebaktian Minggu</h4>
                <ul class="space-y-1.5 text-slate-300 text-[11px] pt-1">
                    <li class="flex justify-between"><span>Ibadah I (Pagi):</span> <strong class="text-white">06:00 WITA</strong></li>
                    <li class="flex justify-between"><span>Ibadah II (Utama):</span> <strong class="text-white">08:00 WITA</strong></li>
                    <li class="flex justify-between"><span>Ibadah Sore / Pemuda:</span> <strong class="text-white">17:00 WITA</strong></li>
                </ul>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
                <h4 class="font-bold text-purple-400 border-b border-slate-800 pb-1">Daftar Koordinator Lingkungan / Rayon</h4>
                <div class="space-y-2 text-[11px]">
                    <div>
                        <span class="text-slate-400 font-semibold block">Lingkungan 1 - 4</span>
                        <p class="text-slate-200">Pdt. Selviany A. Pollo-Milla, S.Si-Teol</p>
                    </div>
                    <div class="pt-1 border-t border-slate-800/60">
                        <span class="text-slate-400 font-semibold block">Lingkungan 5 - 8</span>
                        <p class="text-slate-200">Pdt. Tentremingtyas Messakh, S.Si</p>
                    </div>
                    <div class="pt-1 border-t border-slate-800/60">
                        <span class="text-slate-400 font-semibold block">Lingkungan 9 - 12</span>
                        <p class="text-slate-200">Pdt. Maria A. Litelnoni-Johannes</p>
                    </div>
                    <div class="pt-1 border-t border-slate-800/60">
                        <span class="text-slate-400 font-semibold block">Lingkungan 13 - 16</span>
                        <p class="text-slate-200">Pdt. Wempi M. Rini, S.Th</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
async function openDownloadCenter(isBack = false) {
    if (!isBack) pushNavState('openDownloadCenter');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Pusat Dokumen PDF";
    triggerPageTransition();

    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="bg-purple-950/40 border border-purple-900/40 p-3 rounded-xl">
                <p class="text-xs text-purple-200">Lihat warta mingguan, lembar liturgi, dan dokumen penting gereja.</p>
            </div>
            <div class="text-center py-8 text-xs text-slate-400 animate-pulse">Memuat data dokumen terbaru...</div>
        </div>
    `;

    try {
        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDaftarDokumen" })
        });
        const result = await res.json();
        const list = (result.status === "success") ? result.data : [];
        
        const wartaDok = list.find(d => (d.judul && d.judul.toLowerCase().includes("warta")) || (d.kategori && d.kategori.toLowerCase().includes("warta")));
        const liturgiDok = list.find(d => (d.judul && d.judul.toLowerCase().includes("liturgi")) || (d.kategori && d.kategori.toLowerCase().includes("liturgi")));
        const dokumenLainnya = list.filter(d => d !== wartaDok && d !== liturgiDok);

        let htmlContent = `
            <div class="space-y-4">
                
                <div class="bg-purple-950/40 border border-purple-900/40 p-3 rounded-xl">
                    <p class="text-xs text-purple-200">Lihat warta mingguan, lembar liturgi, dan dokumen penting gereja.</p>
                </div>
                <div class="space-y-3">
        `;

        if (wartaDok) {
            htmlContent += `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-card-hover">
                    <div class="space-y-1">
                        <span class="bg-purple-900/60 text-purple-300 text-[10px] px-2 py-0.5 rounded font-semibold">Warta Jemaat</span>
                        <h4 class="text-xs font-bold text-white">${wartaDok.judul || 'Warta Jemaat'}</h4>
                    </div>
                    <a href="${wartaDok.url}" target="_blank" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition duration-500">Lihat / Unduh</a>
                </div>
            `;
        }

        if (liturgiDok) {
            htmlContent += `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-card-hover">
                    <div class="space-y-1">
                        <span class="bg-emerald-900/60 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-semibold">Lembar Liturgi</span>
                        <h4 class="text-xs font-bold text-white">${liturgiDok.judul || 'Lembar Liturgi'}</h4>
                    </div>
                    <a href="${liturgiDok.url}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition duration-500">Lihat / Unduh</a>
                </div>
            `;
        }

        dokumenLainnya.forEach(doc => {
            htmlContent += `
                <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-sm animate-card-hover">
                    <div>
                        <span class="bg-emerald-900/60 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-semibold">${doc.kategori || 'Dokumen'}</span>
                        <h5 class="text-xs font-bold text-white">${doc.judul || 'Tanpa Judul'}</h5>
                    </div>
                    <a href="${doc.url}" target="_blank" class="bg-slate-800 hover:bg-slate-700 text-purple-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition duration-500">Unduh</a>
                </div>
            `;
        });

        htmlContent += `</div></div>`;
        main.innerHTML = htmlContent;
    } catch (err) {
        main.innerHTML = `<p class="text-xs text-rose-400 text-center py-10">Gagal memuat dokumen.</p>`;
    }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            const MAX_WIDTH = 200, MAX_HEIGHT = 200;
            let width = img.width, height = img.height;
            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            const imgPreview = document.getElementById('previewFoto');
            imgPreview.src = compressedBase64;
            imgPreview.classList.remove('hidden');
            imgPreview.nextElementSibling.classList.add('hidden');
            document.getElementById('fotoBase64').value = compressedBase64;
        };
    };
    reader.readAsDataURL(file);
}

function openExtendedProfileForm(isEditing = false, isBack = false) {
    if (!isBack) pushNavState('openExtendedProfileForm', [isEditing]);
    const main = document.querySelector("main");
    const user = window.currentUser || {};
    document.getElementById("headerTitle").innerText = isEditing ? "Perbarui Data Diri" : "Lengkapi Data Diri";
    triggerPageTransition();

    main.innerHTML = `
        <div class="space-y-4">
            ${isEditing ? '<button onclick="switchTab(\'profil\')" class="text-xs text-purple-400 font-semibold mb-2">← Batal</button>' : ''}
            <form onsubmit="handleSaveExtendedProfile(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-2">Foto Profil</label>
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-14 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner">
                            <img id="previewFoto" src="${user.foto_profil || ''}" class="w-full h-full object-cover ${user.foto_profil ? '' : 'hidden'}">
                            <span class="text-2xl text-slate-500 ${user.foto_profil ? 'hidden' : ''}">👤</span>
                        </div>
                        <input type="file" id="extFoto" accept="image/*" onchange="previewImage(event)" class="text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-purple-900/50 file:text-purple-300">
                    </div>
                    <input type="hidden" id="fotoBase64" value="${user.foto_profil || ''}">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Jenis Kelamin</label>
                    <select id="extGender" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                        <option value="-" ${user.jenis_kelamin === '-' ? 'selected' : ''}>Pilih</option>
                        <option value="Laki-laki" ${user.jenis_kelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                        <option value="Perempuan" ${user.jenis_kelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Alamat Domisili</label>
                    <textarea id="extAlamat" rows="2" required class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">${user.alamat || ''}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Pekerjaan</label>
                    <input type="text" id="extPekerjaan" required value="${user.pekerjaan || ''}" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                </div>
                <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-purple-700 transition duration-500">Simpan Data</button>
            </form>
        </div>
    `;
}

async function handleSaveExtendedProfile(e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.innerText = "Menyiapkan Data...";

    let fotoData = document.getElementById("fotoBase64").value;
    let fotoUrlFinal = window.currentUser.foto_profil || "";

    // 1. Cek apakah ada foto baru yang diunggah (format Base64)
    if (fotoData && fotoData.startsWith("data:image")) {
        try {
            btn.innerText = "Mengunggah Foto...";
            
            // Hilangkan prefix 'data:image/...;base64,' agar diterima ImgBB
            const base64Murni = fotoData.split(',')[1]; 
            
            // GANTI DENGAN API KEY IMGBB ANDA
            const imgbbApiKey = "1a837d888693ad38769e982062e82d88"; 
            
            const formData = new FormData();
            formData.append("image", base64Murni);
            
            // Format penamaan otomatis: Profil_Nama_Jemaat
            const safeName = window.currentUser.nama_lengkap.replace(/\s+/g, '_');
            formData.append("name", "Profil_" + safeName);

            // Upload ke ImgBB
            const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                method: "POST",
                body: formData
            });
            const uploadResult = await uploadRes.json();

			if (uploadResult.success) {
                // Terapkan logika Anda: langsung ubah domain URL sebelum dikirim ke database
                fotoUrlFinal = uploadResult.data.url.replace("i.ibb.co/", "i.ibb.co.com/");
            } else {
                throw new Error("Gagal dari server gambar.");
            }
        } catch (err) {
            showToast("Gagal mengunggah foto profil.", "error");
            btn.disabled = false;
            btn.innerText = "Simpan Data";
            return; // Hentikan proses jika gagal upload
        }
    } else if (fotoData) {
        // Jika fotoData bukan Base64 (misal sudah berupa URL lama)
        fotoUrlFinal = fotoData;
    }

    // 2. Kirim URL gambar beserta data lainnya ke Google Sheets
    btn.innerText = "Menyimpan Profil...";
    const updatedData = {
        action: "updateExtendedProfile",
        user_id: window.currentUser.id,
        jenis_kelamin: document.getElementById("extGender").value,
        alamat: document.getElementById("extAlamat").value,
        pekerjaan: document.getElementById("extPekerjaan").value,
        golongan_darah: "-",
        minat_pelayanan: "Umum",
        foto_profil: fotoUrlFinal // Mengirim URL ImgBB, BUKAN teks panjang Base64
    };

    try {
        const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(updatedData) });
        const result = await response.json();
        if (result.status === "success") {
            window.currentUser.jenis_kelamin = updatedData.jenis_kelamin;
            window.currentUser.alamat = updatedData.alamat;
            window.currentUser.pekerjaan = updatedData.pekerjaan;
            window.currentUser.foto_profil = updatedData.foto_profil;
            localStorage.setItem("user_gereja", JSON.stringify(window.currentUser));
            showToast("Data diri berhasil disimpan!");
            setTimeout(() => switchTab('profil'), 800);
        } else {
            showToast(result.message, "error");
            btn.disabled = false; btn.innerText = "Simpan Data";
        }
    } catch (err) {
        showToast("Kesalahan koneksi server.", "error");
        btn.disabled = false; btn.innerText = "Simpan Data";
    }
}

function openFormPrayer(isBack = false) {
    if (!isBack) pushNavState('openFormPrayer');
    checkAuthBeforeAction(() => {
        const user = window.currentUser;
        const main = document.querySelector("main");
        document.getElementById("headerTitle").innerText = "Kirim Kotak Doa";
        triggerPageTransition();
        main.innerHTML = `
            <div class="space-y-4">
                <form onsubmit="handleSendPrayer(event)" class="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1">Kategori Doa</label>
                        <select id="prayerCategory" class="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none">
                            <option value="Doa Syukur">Doa Syukur</option>
                            <option value="Doa Pergumulan">Doa Pergumulan</option>
                            <option value="Doa Khusus">Doa Khusus</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1">Pokok Doa</label>
                        <textarea id="prayerContent" rows="4" required placeholder="Tuliskan pokok doa..." class="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none"></textarea>
                    </div>
                    <button type="submit" id="btnPrayerSubmit" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-700 transition duration-500">Kirim Doa</button>
                </form>
            </div>
        `;
    });
}

async function handleSendPrayer(e) {
    e.preventDefault();
    const btn = document.getElementById("btnPrayerSubmit");
    btn.disabled = true; btn.innerText = "Mengirim...";
    const data = {
        action: "addPrayer",
        user_id: window.currentUser.id,
        nama_pengirim: window.currentUser.nama_lengkap,
        kategori_doa: document.getElementById("prayerCategory").value,
        isi_doa: document.getElementById("prayerContent").value,
        status_privasi: "Publik"
    };
    try {
        const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
        const result = await response.json();
        showToast(result.message);
        if (result.status === "success") openPrayerMenu();
    } catch (err) {
        showToast("Gagal mengirim doa.", "error");
        btn.disabled = false; btn.innerText = "Kirim Doa";
    }
}

function logout() {
    localStorage.removeItem("user_gereja");
    showToast("Anda telah keluar.");
    updateAuthNavText(); 
    setTimeout(() => switchTab('home'), 500);
}

async function openLibraryMenu(isBack = false) {
    if (!isBack) pushNavState('openLibraryMenu');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Alkitab & Kidung Jemaat";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="grid grid-cols-2 gap-3">
                <div onclick="openBibleSearch()" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition duration-500 shadow-sm animate-card-hover">
                    <div class="text-3xl mb-2">✝️</div>
                    <h4 class="font-bold text-xs text-white">Pustaka Alkitab</h4>
                    <p class="text-[10px] text-slate-400 mt-1">Lengkap 66 Kitab</p>
                </div>
                <div onclick="openHymnsList()" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition duration-500 shadow-sm animate-card-hover">
                    <div class="text-3xl mb-2">📖</div>
                    <h4 class="font-bold text-xs text-white">Kidung Jemaat</h4>
                    <p class="text-[10px] text-slate-400 mt-1">Cari lirik lagu pujian</p>
                </div>
            </div>
        </div>
    `;
}

async function openHymnsList(isBack = false) {
    if (!isBack) pushNavState('openHymnsList');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Kidung Jemaat";
    triggerPageTransition();
    main.innerHTML = `
        <div class="flex flex-col h-[calc(100vh-140px)] relative">
            <div class="sticky top-0 bg-slate-950 pt-1 pb-3 z-30 border-b border-slate-800 space-y-3 shrink-0">
                 <input type="text" id="hymnSearchInput" oninput="filterHymns()" placeholder="Cari nomor atau judul lagu..." class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 shadow-md">
            </div>
            <div id="hymnsContainer" class="space-y-2 pt-3 pb-20 overflow-y-auto flex-1">
                <p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat daftar kidung...</p>
            </div>
        </div>
    `;
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getHymns`);
        const result = await response.json();
        window.allHymns = result.hymns || [];
        renderHymnsList(window.allHymns);
    } catch (err) {
        document.getElementById("hymnsContainer").innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat data kidung.</p>`;
    }
}

function renderHymnsList(hymns) {
    const container = document.getElementById("hymnsContainer");
    if (hymns.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Lagu tidak ditemukan.</p>`;
        return;
    }
    container.innerHTML = hymns.map((h, idx) => `
        <div onclick="openHymnModal(${idx})" class="bg-slate-900 border border-slate-800 hover:border-purple-500 p-3.5 rounded-xl cursor-pointer transition duration-500 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-purple-400">KJ No. ${h.nomor}</span>
            </div>
            <h5 class="text-xs font-semibold text-white mb-1">${h.judul}</h5>
        </div>
    `).join('');
}

function filterHymns() {
    const keyword = document.getElementById("hymnSearchInput").value.toLowerCase();
    const filtered = window.allHymns.filter(h => String(h.nomor).toLowerCase().includes(keyword) || h.judul.toLowerCase().includes(keyword));
    renderHymnsList(filtered);
}

function openHymnModal(index, isBack = false) {
    if (!isBack) pushNavState('openHymnModal', [index]);
    const h = window.allHymns[index];
    if (!h) return;
    document.getElementById("modalHymnNo").innerText = `KJ No. ${h.nomor}`;
    document.getElementById("modalHymnTitle").innerText = h.judul;
    document.getElementById("modalHymnContent").innerText = h.lirik;
    document.getElementById("hymnModal").classList.remove("hidden");
}

function closeHymnModal(fromPopState = false) {
    document.getElementById("hymnModal").classList.add("hidden");
    if (fromPopState !== true) history.back(); 
}

async function openEventsList(isBack = false) {
    if (!isBack) pushNavState('openEventsList');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Agenda & Kegiatan";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div id="eventsContainer" class="space-y-3"><p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat agenda kegiatan...</p></div>
        </div>
    `;
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getEvents`);
        const result = await response.json();
        const container = document.getElementById("eventsContainer");
        const events = result.events || [];
        if (events.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Belum ada agenda kegiatan.</p>`;
            return;
        }
        container.innerHTML = events.map(ev => {
            const formattedDate = ev.tanggal ? new Date(ev.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
            return `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h4 class="text-xs font-bold text-white">${ev.nama_kegiatan}</h4>
                    <p class="text-[11px] text-slate-400">📅 ${formattedDate} ${ev.waktu ? '&bull; ⏰ ' + ev.waktu : ''} &bull; 📍 ${ev.lokasi || 'Gereja'}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        document.getElementById("eventsContainer").innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat kegiatan.</p>`;
    }
}

function openChatRoom(isBack = false) {
    if (!isBack) pushNavState('openChatRoom');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Ruang Persekutuan";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col items-center justify-center min-h-[500px]">
                <span style="display: none;" class="minnit-chat-sembed" data-chatname="https://organizations.minnit.chat/880184913737266/c/Main?embed" data-style="width:100%; height:500px;" data-version="1.55">Chat</span>
            </div>
        </div>
    `;
    if (!document.getElementById("minnitScript")) {
        const script = document.createElement("script");
        script.id = "minnitScript";
        script.src = "https://minnit.chat/js/embed.js?c=1772345192";
        script.defer = true;
        document.body.appendChild(script);
    }
}

async function openBirthdayList(isBack = false) {
    if (!isBack) pushNavState('openBirthdayList');
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Ulang Tahun Hari Ini";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div id="birthdayContainer" class="space-y-3"><p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat data ulang tahun...</p></div>
        </div>
    `;
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getBirthdayUsers`);
        const result = await response.json();
        const container = document.getElementById("birthdayContainer");
        const list = result.birthdays || [];
        if (list.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Tidak ada jemaat yang berulang tahun hari ini.</p>`;
            return;
        }
        container.innerHTML = list.map(b => `
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                    <h4 class="text-xs font-bold text-white">${b.nama_lengkap}</h4>
                    <p class="text-[11px] text-slate-400">Lingkungan ${b.lingkungan} &bull; Rayon ${b.rayon}</p>
                </div>
                <a href="https://api.whatsapp.com/send?phone=${b.no_whatsapp}&text=Syalom%20${encodeURIComponent(b.nama_lengkap)},%20Selamat%20Ulang%20Tahun!" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition duration-500">💬 Ucapan</a>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById("birthdayContainer").innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat data ulang tahun.</p>`;
    }
}

function openPrayerMenu(isBack = false) {
    if (!isBack) pushNavState('openPrayerMenu');
    const savedUser = localStorage.getItem("user_gereja");
    if (!savedUser) {
        renderAuthPageForAction(openPrayerMenu);
        return;
    }
    window.currentUser = JSON.parse(savedUser);
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Dukungan Doa Jemaat";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <div onclick="openFormPrayer()" class="bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between shadow-md cursor-pointer">
                <div>
                    <h4 class="text-xs font-bold text-white">✍️ Kirim Pokok Doa</h4>
                    <p class="text-[10px] text-slate-300 mt-0.5">Bagikan doa syukur atau pergumulan Anda.</p>
                </div>
                <span class="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-semibold">Kirim ➕</span>
            </div>
            <div id="publicPrayerContainer" class="space-y-3">
                <p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat dinding doa...</p>
            </div>
        </div>
    `;
    loadPublicPrayerListContent(window.currentUser);
}

async function loadPublicPrayerListContent(user) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPrayers`);
        const result = await response.json();
        const container = document.getElementById("publicPrayerContainer");
        if (!container) return;
        const prayers = result.prayers || [];
        if (prayers.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Belum ada pokok doa publik.</p>`;
            return;
        }
        container.innerHTML = prayers.map(p => `
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-sm">
                <span class="bg-purple-900/60 text-purple-300 text-[10px] px-2 py-0.5 rounded-md font-semibold">${p.kategori_doa}</span>
                <p class="text-xs text-slate-200 italic mt-1">"${p.isi_doa}"</p>
                <p class="text-[10px] text-slate-400">Oleh: ${p.nama_pengirim}</p>
            </div>
        `).join('');
    } catch (err) {
        const container = document.getElementById("publicPrayerContainer");
        if (container) container.innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat dinding doa.</p>`;
    }
}

async function openDonationList(isBack = false) {
    if (!isBack) pushNavState('openDonationList');
    const savedUser = localStorage.getItem("user_gereja");
    if (!savedUser) { renderAuthPageForAction(openDonationList); return; }
    window.currentUser = JSON.parse(savedUser);
    const main = document.querySelector("main");
    document.getElementById("headerTitle").innerText = "Persembahan / Donasi";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            
            <button onclick="openFormDonation()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md transition duration-500">➕ Konfirmasi Donasi Baru</button>
            <div id="donationContainer" class="space-y-3"><p class="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat data donasi...</p></div>
        </div>
    `;
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getDonations`);
        const result = await response.json();
        const container = document.getElementById("donationContainer");
        const list = result.donations || [];
        if (list.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Belum ada riwayat donasi.</p>`;
            return;
        }
        container.innerHTML = list.map(d => `
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <h4 class="text-xs font-bold text-white">${d.nama_donatur}</h4>
                        <p class="text-[11px] text-slate-400">${d.keterangan}</p>
                    </div>
                    <span class="text-xs font-bold text-emerald-400">Rp ${Number(d.nominal).toLocaleString('id-ID')}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById("donationContainer").innerHTML = `<p class="text-xs text-rose-400 text-center">Gagal memuat donasi.</p>`;
    }
}

function openFormDonation(isBack = false) {
    if (!isBack) pushNavState('openFormDonation');
    const main = document.querySelector("main");
    const user = window.currentUser || {};
    document.getElementById("headerTitle").innerText = "Form Kirim Donasi";
    triggerPageTransition();
    main.innerHTML = `
        <div class="space-y-4">
            <form onsubmit="handleSendDonation(event)" class="space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Peruntukan</label>
                    <input type="text" id="donKet" required placeholder="Cth: Pembangunan Gedung" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Nominal (Rp)</label>
                    <input type="number" id="donNominal" required placeholder="Cth: 100000" class="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                </div>
                <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md transition duration-500">Kirim Konfirmasi</button>
            </form>
        </div>
    `;
}

async function handleSendDonation(e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    btn.disabled = true; btn.innerText = "Memproses...";
    const user = window.currentUser;
    const data = {
        action: "addDonation",
        user_id: user.id,
        nama_donatur: user.nama_lengkap,
        jenis_donasi: "Transfer",
        keterangan: document.getElementById("donKet").value,
        nominal: document.getElementById("donNominal").value,
        tanggal: new Date()
    };
    try {
        const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
        const result = await response.json();
        showToast(result.message);
        if (result.status === "success") openDonationList();
        else { btn.disabled = false; btn.innerText = "Kirim Konfirmasi"; }
    } catch (err) {
        showToast("Gagal mengirim donasi.", "error");
        btn.disabled = false; btn.innerText = "Kirim Konfirmasi";
    }
}

function toggleSeniorMode(isInitialLoad = false) {
    const app = document.getElementById("app");
    if (!app) return;

    let isSenior;
    
    // Cek apakah ini muat awal atau klik tombol
    if (isInitialLoad) {
        isSenior = localStorage.getItem('gmit_senior_mode') === 'true';
    } else {
        isSenior = localStorage.getItem('gmit_senior_mode') !== 'true'; // Balikkan status
        localStorage.setItem('gmit_senior_mode', isSenior.toString());
    }

    if (isSenior) {
        // Menggunakan scale Tailwind yang sangat aman untuk semua browser HP
        app.classList.add('scale-[1.05]', 'origin-top', 'pb-10');
        if (!isInitialLoad) showToast("Mode Lansia (Teks Besar) Diaktifkan");
    } else {
        app.classList.remove('scale-[1.05]', 'origin-top', 'pb-10');
        if (!isInitialLoad) showToast("Mode Normal Diaktifkan");
    }
}

function updateAuthNavText() {
    const navText = document.getElementById("accountNavText");
    if (!navText) return;
    navText.innerText = localStorage.getItem("user_gereja") ? "Akun" : "Login";
}

function redirectToRolePanel() {
    const sessionData = sessionStorage.getItem("user_gereja") || localStorage.getItem("user_gereja");
    if (!sessionData) { alert("Sesi tidak ditemukan."); return; }
    let userData = JSON.parse(sessionData);
    const role = (userData.role || userData.status_pelayanan || "").toLowerCase().trim();
    if (role.includes("super") || role.includes("admin")) window.location.href = "admin.html";
    else if (role.includes("sekretariat") || role.includes("pendeta")) window.location.href = "sekretariat.html";
    else window.location.href = "sensus.html";
}

document.addEventListener("DOMContentLoaded", () => {
    updateNetworkStatus();
    const savedTheme = localStorage.getItem('gmit_selected_theme') || 'slate';
    setTheme(savedTheme, true);
    toggleSeniorMode(true);
    switchTab('home', false, true); 
    checkPushNotification();
	cekAbsensiMinggu();
    updateAuthNavText();
});
// --- LOGIKA TOMBOL MELAYANG RESPONSIVE (PERBAIKAN HP & PC) ---
const fab = document.getElementById('floatingBackBtn');
const fabContainer = document.getElementById('fabContainer');
let isDraggingFab = false;
let isMoved = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

if (fab && fabContainer) {
    fab.addEventListener('mousedown', startDrag);
    fab.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if (e.target === fab || fab.contains(e.target)) {
        isDraggingFab = true;
        isMoved = false;
        
        // Perbaikan: Deteksi apakah input dari sentuhan (touch) atau mouse
        const isTouch = e.type.includes('touch');
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;
        
        const fabRect = fab.getBoundingClientRect();
        
        dragOffsetX = clientX - fabRect.left;
        dragOffsetY = clientY - fabRect.top;
        
        const containerRect = fabContainer.getBoundingClientRect();
        const currentLeft = fabRect.left - containerRect.left;
        const currentTop = fabRect.top - containerRect.top;
        
        // Hapus transisi sementara agar tombol langsung menempel pada jari (tidak delay)
        fab.style.transition = 'none';
        
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
        fab.style.left = currentLeft + 'px';
        fab.style.top = currentTop + 'px';
    }
}

function onDrag(e) {
    if (!isDraggingFab) return;
    isMoved = true;
    e.preventDefault(); // Mencegah layar ikut tergulung (scrolling)
    
    // Perbaikan Krusial: Membaca titik koordinat sentuhan HP saat sedang digeser
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    const containerRect = fabContainer.getBoundingClientRect();
    
    let pointerViewportX = clientX - dragOffsetX;
    let pointerViewportY = clientY - dragOffsetY;
    
    let newLeft = pointerViewportX - containerRect.left;
    let newTop = pointerViewportY - containerRect.top;
    
    const maxLeft = containerRect.width - fab.offsetWidth;
    const maxTop = containerRect.height - fab.offsetHeight;
    
    fab.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
    fab.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
}

function endDrag() {
    isDraggingFab = false;
    // Kembalikan efek transisi agar pergerakan halaman kembali halus
    if (fab) fab.style.transition = 'all 0.3s ease';
}
function goBackOrHome(e) {
    // Jika tombol hanya digeser, jangan lakukan aksi klik
    if (isMoved) {
        e.preventDefault();
        isMoved = false;
        return;
    }

    const activeHeader = document.getElementById("headerTitle").innerText;

    // Cek apakah saat ini berada di halaman Beranda
    if (activeHeader.includes("PNIEL Oebobo")) {
        // Tampilkan konfirmasi Keluar
        Swal.fire({
            title: 'Tutup Aplikasi?',
            text: "Apakah Anda yakin ingin keluar dari JPO Digital?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // Warna Rose-600
            cancelButtonColor: '#334155',  // Warna Slate-700
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Menutup aplikasi (Bekerja dengan baik jika diinstal sebagai PWA)
                window.close();
            }
        });
    } else {
        // Jika di menu lain, kembali ke halaman sebelumnya
        history.back();
    }
}

function bukaPopupKTJ(isBack = false) {
    // Daftarkan aksi ini ke riwayat HP agar tombol back berfungsi
    if (!isBack) pushNavState('bukaPopupKTJ');

    const user = window.currentUser;
    if (!user) return showToast("Sesi jemaat tidak ditemukan.", "error");

    document.getElementById("ktjModal").classList.remove("hidden");
    
    document.getElementById("idCardNama").innerText = user.nama_lengkap || "-";
    document.getElementById("idCardGender").innerText = user.jenis_kelamin || "-";
    document.getElementById("idCardLingRayon").innerText = `: Ling. ${user.lingkungan || '-'} / Rayon ${user.rayon || '-'}`;
    document.getElementById("idCardAlamat").innerText = `: ${user.alamat || '-'}`;
    
    const fotoImg = document.getElementById("idCardFoto");
    const placeholder = document.getElementById("idCardFotoPlaceholder");
    const labelFoto = document.getElementById("idCardLabelFoto");
    
    const fotoUrlDatabase = user.foto_profil || user.foto || user.url_foto;
    
    if (fotoUrlDatabase && fotoUrlDatabase.trim() !== "") {
        const safeUrl = `https://wsrv.nl/?url=${encodeURIComponent(fotoUrlDatabase)}&w=200&fit=cover`;
        
        fotoImg.crossOrigin = "anonymous";
        fotoImg.src = safeUrl;
        
        fotoImg.classList.remove("hidden");
        if(placeholder) placeholder.classList.add("hidden");
        if(labelFoto) labelFoto.classList.add("hidden");
    } else {
        fotoImg.src = "";
        fotoImg.classList.add("hidden");
        if(placeholder) placeholder.classList.remove("hidden");
        if(labelFoto) labelFoto.classList.remove("hidden");
    }

    const qrImg = document.getElementById("idCardQR");
    if (qrImg) {
        qrImg.crossOrigin = "anonymous";
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(user.id)}&margin=0`;
    }
}

function tutupKTJ(fromPopState = false) {
    document.getElementById("ktjModal").classList.add("hidden");
    // Jika ditutup manual via tombol "Tutup", mundurkan riwayat HP
    // Jika ditutup via tombol back HP (fromPopState), abaikan history.back agar tidak mundur dua kali
    if (fromPopState !== true) {
        history.back(); 
    }
}

function unduhKTJ() {
    showToast("Memproses gambar, mohon tunggu sebentar...");
    const cardElement = document.getElementById("idCardTemplate");
    
    // Pastikan library html2canvas sudah terbaca oleh browser
    if (typeof html2canvas === 'function' && cardElement) {
        
        html2canvas(cardElement, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: true, // Mengizinkan elemen lintas-domain
            backgroundColor: "#ffffff" 
        }).then(canvas => {
            try {
                // Mengubah kanvas menjadi data gambar lokal
                const dataUrl = canvas.toDataURL("image/png");
                
                // Membuat elemen tautan untuk unduhan
                const link = document.createElement('a');
                const namaUser = window.currentUser ? window.currentUser.nama_lengkap.replace(/\s+/g, '_') : 'Jemaat';
                
                link.download = `KTJ_${namaUser}.png`;
                link.href = dataUrl;
                
                // KUNCI PERBAIKAN: Elemen link harus dipasang ke dalam body agar diizinkan oleh browser HP
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Bersihkan kembali setelah diklik
                
                showToast("KTJ berhasil diunduh ke perangkat Anda!");
                
            } catch (error) {
                console.error("Canvas Tainted Error:", error);
                alert("Gagal mengunduh: Browser memblokir gambar karena alasan keamanan (CORS).");
            }
        }).catch(err => {
            alert("Terjadi kesalahan saat mencetak gambar: " + err);
        });
        
    } else {
        alert("Sistem pencetak belum termuat. Silakan muat ulang (refresh) aplikasi.");
    }
}

// =====================================================================
// FITUR ABSENSI MANDIRI (OFFLINE/ONLINE)
// =====================================================================

// Ganti koordinat ini dengan titik pasti Gereja Pniel Oebobo
const CHURCH_LAT = -10.1601; // Ubah dengan koordinat gereja Anda
const CHURCH_LON = 123.6057; // Ubah dengan koordinat gereja Anda

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

function cekAbsensiMinggu() {
    const user = window.currentUser || JSON.parse(localStorage.getItem("user_gereja"));
    if (!user) return; 

    const now = new Date();
    if (now.getDay() !== 0) return; 

    const absensiHariIni = localStorage.getItem("absen_minggu_terakhir");
    if (absensiHariIni === now.toLocaleDateString('id-ID')) return; 

    const hour = now.getHours();
    let ibadahAktif = "";
    
    if (hour >= 5 && hour < 8) ibadahAktif = "Ibadah I (06:00)";
    else if (hour >= 8 && hour < 11) ibadahAktif = "Ibadah II (08:00)";
    else if (hour >= 15 && hour < 19) ibadahAktif = "Ibadah Sore (17:00)";
    else return; 

    // Cek Lokasi Jemaat
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const distance = getDistanceFromLatLonInM(
                position.coords.latitude, 
                position.coords.longitude, 
                CHURCH_LAT, 
                CHURCH_LON
            );
            
            // Jarak <= 100 meter = Offline, lebih dari 100 meter = Online
            const tipeKehadiran = distance <= 100 ? "Offline (Di Gereja)" : "Online (Di Rumah)";
            munculkanToastAbsen(ibadahAktif, user, tipeKehadiran);
            
        }, (error) => {
            // Jika jemaat menolak izin GPS, catat sebagai Online
            munculkanToastAbsen(ibadahAktif, user, "Online (Tanpa GPS)");
        });
    } else {
        munculkanToastAbsen(ibadahAktif, user, "Online (Perangkat Lawas)");
    }
}

function munculkanToastAbsen(ibadah, user, tipeKehadiran) {
    let existing = document.getElementById("realtimeToastBanner");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "realtimeToastBanner";
    toast.className = "fixed bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-[340px] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-emerald-500 z-[9999] text-xs flex items-center gap-3 animate-bounce cursor-pointer";
    
    // Ganti ikon berdasarkan status kehadiran
    const ikon = tipeKehadiran.includes("Offline") ? "📍" : "📺";

    toast.innerHTML = `
        <span class="text-2xl drop-shadow-md">${ikon}</span>
        <div class="flex-1 pointer-events-none">
            <p class="font-bold text-emerald-400">Syalom, Absen Yuk!</p>
            <p class="text-[10px] text-slate-300 mt-0.5">Kehadiran <b>${ibadah}</b> tercatat via <b>${tipeKehadiran}</b>. Klik untuk konfirmasi.</p>
        </div>
    `;
    
    toast.onclick = () => kirimDataAbsen(ibadah, user, tipeKehadiran, toast);
    document.body.appendChild(toast);
}

async function kirimDataAbsen(ibadah, user, tipeKehadiran, toastEl) {
    toastEl.onclick = null; 
    toastEl.classList.remove("animate-bounce");
    toastEl.innerHTML = `<p class="text-xs text-center w-full py-2 text-slate-300 font-semibold animate-pulse">Memproses kehadiran...</p>`;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "absenMinggu",
                user_id: user.id,
                nama_lengkap: user.nama_lengkap,
                lingkungan: user.lingkungan || "-",
                ibadah: ibadah,
                tipe_kehadiran: tipeKehadiran // Data ini akan masuk ke kolom baru di Sheets
            })
        });
        
        const res = await response.json();
        if (res.status === "success") {
            localStorage.setItem("absen_minggu_terakhir", new Date().toLocaleDateString('id-ID'));
            toastEl.innerHTML = `<p class="text-xs text-center w-full py-2 font-bold text-emerald-400">✅ Kehadiran Berhasil Tercatat!</p>`;
            setTimeout(() => toastEl.remove(), 4000);
        } else {
            toastEl.remove();
            showToast("Gagal absen: " + res.message, "error");
        }
    } catch (err) {
        toastEl.remove();
        showToast("Kesalahan koneksi saat mengirim absen.", "error");
    }
}
