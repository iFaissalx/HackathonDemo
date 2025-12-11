document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("profile-buttons");

    PROFILES.forEach(profile => {
        let btn = document.createElement("div");
        btn.className = "profile-btn";
        btn.textContent = profile.name;

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

async function startCall(profile) {
    document.getElementById("call-window").classList.remove("hidden");
    document.getElementById("call-status").innerText = "جاري الاتصال...";

    const url = "/api/realtime";
    

    realtimeSocket = new WebSocket(url, {
        headers: { "Authorization": `Bearer ${apiKey}` }
    });

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
                    
                    يجب عليك:
                    1- التأكد من أن المستخدم هو صاحب الطلب.
                    2- التأكد أنه لا يوجد شخص آخر يطلب منه رمز التحقق.
                    3- تحذيره أن مشاركة الرمز قد يؤدي لسرقة المعلومات والأموال.
                    4- بعد التحقق، قل: "تم التحقق بنجاح." ثم أنهِ المكالمة.
                `,
                modalities: ["audio"],
                instructions_audio: "السلام عليكم. السيد " + profile.name + " هل أنت من طلب الدخول لبوابة أبشر؟"
            }
        }));
    };

    realtimeSocket.onmessage = (event) => {
        let msg = JSON.parse(event.data);

        if (msg.type === "response.completed") {
            endCall(true);
        }
    };
}

function endCall(success) {
    document.getElementById("call-window").classList.add("hidden");

    if (success) showOTP();
}
