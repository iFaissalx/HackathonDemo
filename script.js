document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("profile-buttons");
    PROFILES.forEach(profile => {
        let btn = document.createElement("div");
        btn.className = "profile-btn";
        btn.textContent = profile.name;

        // Tooltip
        let tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
            العمر: ${profile.age}<br>
            التعليم: ${profile.education}<br>
            آخر دخول: ${profile.lastLogin}
        `;
        btn.appendChild(tooltip);

        btn.onclick = () => handleProfileClick(profile);
        container.appendChild(btn);
    });
});

function handleProfileClick(profile) {
    if (profile.risk === "high") {
        startCall(profile);
    } else {
        showOTP();
    }
}

function showOTP() {
    document.getElementById("otp-value").textContent = generateOTP();
    document.getElementById("otp-window").classList.remove("hidden");
}

function closeOTP() {
    document.getElementById("otp-window").classList.add("hidden");
}

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

/* ------------------ CALL WINDOW + REALTIME API --------------------- */

let realtimeSocket;

function getWebSocketURL() {
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

    // Netlify Local Dev
    if (isLocal) {
        return "ws://localhost:8888/.netlify/functions/realtime";
    }

    // Netlify Production
    return `wss://${location.hostname}/.netlify/functions/realtime`;
}

async function startCall(profile) {
    document.getElementById("call-window").classList.remove("hidden");
    document.getElementById("call-status").innerText = "جاري الاتصال...";

    const wsURL = getWebSocketURL();

    realtimeSocket = new WebSocket(wsURL);

    realtimeSocket.onopen = () => {
        document.getElementById("call-status").innerText = "تم الاتصال. جاري التحقق...";

        realtimeSocket.send(JSON.stringify({
            type: "response.create",
            response: {
                instructions: `
                    أنت مساعد صوتي ذكي هدفك التأكد من أن المستخدم هو من طلب الدخول إلى بوابة أبشر.
                    المستخدم اسمه ${profile.name}.
                    العمر: ${profile.age}.
                    المؤهل: ${profile.education}.

                    المهام:
                    1- التأكد من أن المستخدم هو صاحب الطلب.
                    2- التأكد أنه لا يوجد شخص آخر يطلب منه رمز التحقق.
                    3- تحذيره أن مشاركة الرمز قد يؤدي لسرقة المعلومات والأموال.
                    4- بعد التحقق، قل: "تم التحقق بنجاح." ثم أنهِ المكالمة.
                `,
                modalities: ["audio"],
                instructions_audio:
                    "السلام عليكم. السيد " +
                    profile.name +
                    " هل أنت من طلب الدخول لبوابة أبشر؟"
            }
        }));
    };

    realtimeSocket.onmessage = (event) => {
        let msg = JSON.parse(event.data);

        if (msg.type === "response.completed") {
            endCall(true);
        }
    };

    realtimeSocket.onerror = () => {
        document.getElementById("call-status").innerText = "خطأ في الاتصال.";
    };
}

function endCall(success) {
    document.getElementById("call-window").classList.add("hidden");
    if (success) showOTP();
}
