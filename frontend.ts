async function uploadText() {
  const content = (document.getElementById("textContent") as HTMLTextAreaElement).value;
  if (!content) return alert("請輸入內容");
  const btn = document.getElementById("uploadTextBtn") as HTMLButtonElement;
  const el = document.getElementById("textResult")!;
  btn.disabled = true;
  el.style.display = "block";
  el.innerHTML = "⏳ 上傳中...";
  try {
    const res = await fetch("/api/upload-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    el.innerHTML = `✅ 上傳成功！<br><span class="blob-id">Blob ID: ${data.blobId}</span>`;
  } catch (e: any) {
    el.innerHTML = `<span class="error">❌ ${e.message}</span>`;
  } finally {
    btn.disabled = false;
  }
}

async function uploadFile() {
  const input = document.getElementById("fileInput") as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return alert("請選擇檔案");
  const btn = document.getElementById("uploadFileBtn") as HTMLButtonElement;
  const el = document.getElementById("fileResult")!;
  btn.disabled = true;
  el.style.display = "block";
  el.innerHTML = "⏳ 上傳中...";
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-file", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    el.innerHTML = `✅ 上傳成功！<br><span class="blob-id">Blob ID: ${data.blobId}</span><br>讀取: <a href="/api/read/${data.blobId}" target="_blank">/api/read/${data.blobId}</a>`;
  } catch (e: any) {
    el.innerHTML = `<span class="error">❌ ${e.message}</span>`;
  } finally {
    btn.disabled = false;
  }
}

async function readBlob() {
  const blobId = (document.getElementById("blobId") as HTMLInputElement).value.trim();
  if (!blobId) return alert("請輸入 Blob ID");
  const el = document.getElementById("readResult")!;
  el.style.display = "block";
  el.innerHTML = "⏳ 讀取中...";
  try {
    const res = await fetch(`/api/read/${blobId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      el.innerHTML = `✅ 圖片：<br><img src="${url}">`;
    } else {
      const text = await res.text();
      el.innerHTML = `✅ 內容：<br><pre>${text.slice(0, 2000)}</pre>`;
    }
  } catch (e: any) {
    el.innerHTML = `<span class="error">❌ ${e.message}</span>`;
  }
}

// expose to global scope for onclick handlers
(window as any).uploadText = uploadText;
(window as any).uploadFile = uploadFile;
(window as any).readBlob = readBlob;
