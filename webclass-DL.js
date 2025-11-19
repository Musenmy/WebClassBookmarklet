javascript: (async function () {
    const delay = () => new Promise((r) => setTimeout(r, 1000));
    const seen = new Set();
    let i = 1;
    let lastErrIndex = 0;

    while (true) {
        const chapterFrame = Array.from(window.frames ?? "").find((f) => f.location.href.includes("txtbk_show_chapter.php"));
        if (!chapterFrame) {
            alert("WebClassで資料ページを開いてください。");
            break;
        }

        if (typeof chapterFrame.gopage !== "function") {
            alert("E: gopage is not a function");
            break;
        }
        chapterFrame.gopage(i);

        let fileName = chapterFrame.document.querySelector(`table#TOCLayout tr[data-page="${i}"] td:nth-child(3) span`)?.innerText.replace(/_/g, "") || `Unnamed File No${i}`;

        await delay();

        const textFrameParent = Array.from(window.frames).find((f) => f.location.href.includes("loadit.php"));

        if (!textFrameParent) {
            if (lastErrIndex == i) {
                alert(`${i - 1}個のファイルをダウンロードしました。`);
                break;
            }
            alert(`${i}個目のファイルはダウンロード可能な形式ではありません。`);
            lastErrIndex = i;
            continue;
        }

        const textFrame = Array.from(textFrameParent.frames).find((f) => f.location.href.includes("loadit.php"));

        if (!textFrame) {
            if (lastErrIndex == i) {
                alert(`${i - 1}個のファイルをダウンロードしました。`);
                break;
            }
            alert(`${i}個目のファイルはダウンロード可能な形式ではありません。`);
            lastErrIndex = i;
            continue;
        }

        const link = textFrame.document.querySelector("a");

        if (!link) {
            if (lastErrIndex == i) {
                alert(`${i - 1}個のファイルをダウンロードしました。`);
                break;
            }
            alert(`${i}個目のファイルはダウンロード可能に設定されていません。`);
            lastErrIndex = i;
            continue;
        }

        if (seen.has(link.href)) {
            alert(`${i - 1}個のファイルをダウンロードしました。`);
            break;
        }

        seen.add(link.href);

        const res = await fetch(link.href);
        const blob = await res.blob();

        fileName = prompt(`${i}個目のファイル名を入力`, fileName);
        if (!fileName) return;

        const dlBtn = document.createElement("a");
        dlBtn.href = URL.createObjectURL(blob);
        dlBtn.download = fileName;
        dlBtn.click();
        URL.revokeObjectURL(dlBtn.href);

        i++;
    }
})();
