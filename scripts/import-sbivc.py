#!/usr/bin/env python3
# coding: utf-8
"""Regenerate the SBI VC Trade document module from the archived official PDFs.

Requires pypdf. Run from any directory: python3 scripts/import-sbivc.py
This checkout contains deployed assets, so the module is wired into the deployed
entry point by scripts/integrate-sbivc.mjs rather than an unavailable source build.
"""
from pathlib import Path
import hashlib
import html
import json
import re
import unicodedata

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "docs/sbivc/2026-11-21"
# Filename, stable document key, official listing title, kind, splitting mode.
DOCUMENTS = [
    ("covenants-ex_tt.pdf", "service-terms", "サービス総合約款", "約款", "articles"),
    ("manual-ex_tt.pdf", "crypto-manual", "暗号資産取引説明書", "説明書", "sections"),
    ("manual-ex_electric-payment-instrument.pdf", "payment-manual", "電子決済手段取引説明書", "説明書", "sections"),
    ("lending_covenants_tt.pdf", "lending-terms", "暗号資産等貸借取引約款", "約款", "articles"),
    ("lending_manual-ex_tt.pdf", "lending-manual", "暗号資産等貸借取引説明書", "説明書", "sections"),
    ("sbiweb3wallet_covenants.pdf", "web3-terms", "SBI Web3 ウォレットサービス約款", "約款", "articles"),
    ("e-consent.pdf", "electronic-consent", "情報の電磁的な方法による提供について", "同意事項", "sections"),
    ("bestexecutionpolicy.pdf", "best-execution", "最良執行方針", "方針", "pages"),
    ("handling-cryptocurrency-overview.pdf", "asset-overview", "取扱暗号資産及び取扱電子決済手段の概要説明書", "説明書", "pages"),
    ("handling-system-risc-overview.pdf", "system-risk", "システムリスク管理方針", "方針", "sections"),
    ("security-policy.pdf", "security", "情報セキュリティポリシー", "方針", "sections"),
    ("cybersecurity_policy.pdf", "cybersecurity", "サイバーセキュリティ基本方針", "方針", "sections"),
    ("privacy-policy.pdf", "privacy-policy", "個人情報保護方針", "方針", "articles"),
    ("privacy.pdf", "privacy-handling", "お客様の個人情報のお取扱いについて", "方針", "sections"),
    ("joint_use_of_personal_information.pdf", "privacy-joint-use", "個人情報の共同利用について", "方針", "sections"),
    ("travel_rule.pdf", "travel-rule", "トラベルルールに関する同意事項", "同意事項", "sections"),
    ("obtaining_historical_information.pdf", "history-information", "履歴情報の取得について", "同意事項", "sections"),
    ("policy_operating_social_media.pdf", "social-media", "ソーシャルメディアの運用方針", "方針", "sections"),
    ("fiduciary_duty.pdf", "fiduciary-duty", "顧客中心主義に基づく業務運営方針", "方針", "sections"),
    ("solicitation_policy.pdf", "solicitation", "勧誘方針", "方針", "sections"),
    ("handling-complaints.pdf", "complaints", "苦情処理措置及び紛争解決措置について", "方針", "sections"),
    ("debtfulfillmentpolicy.pdf", "crypto-debt", "債務履行方針（暗号資産）", "方針", "sections"),
    ("debtfulfillmentpolicy_electric-payment-instrument.pdf", "payment-debt", "債務履行方針（電子決済手段）", "方針", "sections"),
    ("ethics.pdf", "ethics", "倫理コード", "方針", "sections"),
    ("advantagecontrary.pdf", "conflicts", "利益相反管理方針", "方針", "articles"),
    ("basic_policy_of_amlfct.pdf", "aml", "マネー・ローンダリング等防止に関する基本方針", "方針", "sections"),
    ("handling-antisocial.pdf", "antisocial", "反社会的勢力に対する基本方針", "方針", "sections"),
    ("electric-payment-instrument_compensation_policy.pdf", "payment-compensation", "電子決済手段等取引サービスにおける不正利用被害の補償方針", "方針", "sections"),
    ("customerharassment.pdf", "customer-harassment", "カスタマーハラスメントに対する基本方針", "方針", "sections"),
    ("act_on_specified_commercial_transactions.pdf", "commercial-transactions", "特定商取引法に基づく表記", "法定表示", "pages"),
    ("SBINFT_Mits_terms_of_use.pdf", "mits-terms", "SBI Mits利用規約", "規約", "articles"),
]


def normalized(text):
    return unicodedata.normalize("NFKC", text)


def compact(text):
    return re.sub(r"\s+", "", text)


def clean_page(text, page_number):
    """Remove only the VCTRADE running header and edge page numbers.

    All other extracted text, including covers, appendices and revision dates,
    is retained. Never strip numeric-only table cells in the page body.
    """
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if re.fullmatch(r"本書面は、VCTRADE\s*サービスの.+です", line.strip()):
            lines[i] = ""
    nonempty = [i for i, line in enumerate(lines) if line.strip()]
    for i in set(nonempty[:1] + nonempty[-1:]):
        if lines[i].strip() == str(page_number):
            lines[i] = ""
    return "\n".join(lines).strip()


def article_start(line):
    # Includes headings preceding the article number on the same PDF line.
    m = re.match(r"^(?:[（(][^）)0-9]+[）)]\s*)?第\s*(\d+)\s*条(?:\s*の\s*(\d+))?(.*)$", normalized(line).strip())
    if m and re.match(r"^(?:後段|前段|第\s*\d|に|及び|から|まで|を|、)", m[3].strip()):
        return None  # Wrapped cross-reference, not an article heading.
    return (int(m[1]), int(m[2]) if m[2] else None) if m else None


def section_start(line):
    line = normalized(line).strip()
    return bool(re.match(r"^(?:\d+\s*[.、]\s*\S|[■【《●⚫])", line))


def body_html(lines, page_mode=False):
    if page_mode:
        # Preserve line boundaries in tabular pages; the PDF link retains layout.
        return "<br>".join(html.escape(line.strip()) for _, line in lines)
    paragraphs, current = [], ""
    for _, raw in lines:
        line = raw.strip()
        if not line:
            if current:
                paragraphs.append(current)
                current = ""
            continue
        # PDF wrapping is not a semantic paragraph. Keep list markers distinct.
        if re.match(r"^(?:[（(]\d+[）)]|\d+[.．]|[①-⑳●■⚫➢])", normalized(line)) and current:
            paragraphs.append(current)
            current = ""
        separator = " " if current and current[-1].isascii() and line[0].isascii() else ""
        current += separator + line
    if current:
        paragraphs.append(current)
    return "<br><br>".join(html.escape(p) for p in paragraphs)


def split_document(pages, mode):
    if mode == "pages":
        return [(f"p{page:03}", f"{page}ページ", [(page, line) for line in text.splitlines()])
                for page, text in enumerate(pages, 1) if text.strip()]
    chunks, current, label, key = [], [], "表紙・前文", "intro"
    seen_articles, section = [], 0
    all_lines = [(page, line) for page, text in enumerate(pages, 1) for line in [*text.splitlines(), ""]]
    for page, line in all_lines:
        article = article_start(line) if mode == "articles" else None
        start = article is not None or (mode == "sections" and section_start(line))
        # Also keep attachments/history separate from the final article.
        appendix = mode == "articles" and bool(re.match(r"^(?:[（(]別[表紙][）)]|【(?:制定|改定)】)", line.strip()))
        if start or (appendix and key != "appendix"):
            # A preceding standalone parenthesized caption belongs to this article.
            caption = []
            if article is not None and not re.search(r"条(?:\s*の\s*\d+)?\s*\(", normalized(line)):
                while current and not current[-1][1].strip():
                    caption.insert(0, current.pop())
                if current and re.fullmatch(r"[（(][^）)]+[）)]", current[-1][1].strip()) and "VCTRADE" not in current[-1][1]:
                    caption.insert(0, current.pop())
            if any(text.strip() for _, text in current):
                chunks.append((key, label, current))
            current = caption
            if article is not None:
                assert article not in seen_articles, f"Duplicate article {article}"
                seen_articles.append(article)
                article_label = str(article[0]) + (f"の{article[1]}" if article[1] else "")
                key = f"a{article[0]}" + (f"-{article[1]}" if article[1] else "")
                label = re.sub(r"第\s*(\d+)\s*条", r"第\1条", normalized(line).strip())
                label = re.sub(r"の\s+(\d+)", r"の\1", label)
                if caption and caption[0][1].strip():
                    label = f"第{article_label}条 {caption[0][1].strip()}"
                # Avoid using the entire first sentence as an oversized title.
                if len(label) > 65:
                    label = f"第{article_label}条"
            elif appendix:
                key, label = "appendix", "別表・制定改定履歴"
            else:
                section += 1
                key, label = f"s{section:03}", line.strip()
                if len(label) > 65:
                    label = f"項目 {section}（{label[:35]}…）"
        current.append((page, line))
    if any(text.strip() for _, text in current):
        chunks.append((key, label, current))
    if seen_articles:
        main_articles = [number for number, branch in seen_articles if branch is None]
        assert main_articles == list(range(1, max(main_articles) + 1)), seen_articles
    return chunks


def main():
    manifest = json.loads((ARCHIVE / "manifest.json").read_text())
    originals = {row["file"]: row for row in manifest["documents"]}
    assert set(originals) == {row[0] for row in DOCUMENTS}
    documents, report = {}, []
    for order, (filename, slug, title, kind, mode) in enumerate(DOCUMENTS, 100):
        raw = (ARCHIVE / filename).read_bytes()
        source = originals[filename]
        assert hashlib.sha256(raw).hexdigest() == source["sha256"], filename
        pages = [clean_page(p.extract_text() or "", n) for n, p in enumerate(PdfReader(ARCHIVE / filename).pages, 1)]
        assert all(page.strip() for page in pages), f"Empty PDF page: {filename}"
        doc_id = "sbivc-" + slug
        local_url = f"/docs/sbivc/2026-11-21/{filename}"
        chunks = split_document(pages, mode)
        tweets, retained = [], []
        for key, label, lines in chunks:
            body = body_html(lines, mode == "pages")
            # Prove that line joining and splitting did not discard source text.
            plain = html.unescape(re.sub(r"<br>", "", body))
            expected = "".join(line for _, line in lines)
            assert compact(plain) == compact(expected), (filename, key)
            retained.append(expected)
            first = next(page for page, text in lines if text.strip())
            last = next(page for page, text in reversed(lines) if text.strip())
            page_label = f"{first}ページ" if first == last else f"{first}–{last}ページ"
            link = f'<a href="{local_url}#page={first}" target="_blank" rel="noopener noreferrer">原本PDF（{page_label}）</a>'
            tweets.append({"id": f"{doc_id}-{key}", "index": label, "content": body + "<br><br>" + link,
                           "sourcePages": [first, last]})
        assert compact("".join(retained)) == compact("".join(pages)), filename
        assert len({t["id"] for t in tweets}) == len(tweets)
        documents[doc_id] = {
            "displayName": "SBI VCトレード " + title, "accountId": doc_id,
            "description": "SBI VCトレード株式会社の公表資料（" + kind + "）。2026-11-21取得の公式PDFから収録。取得日は施行日・改定日を意味しません。" +
                ("表を含む書面はページ単位の抽出テキストです。表の配置・対応関係は各項目の原本PDFで確認できます。" if mode == "pages" else "") +
                "最新の内容は公式原文を確認してください。",
            "url": source["url"],
            "company": {"name": "SBI VCトレード", "kind": kind, "order": order, "fetchedAt": "2026-11-21"},
            "source": {"localUrl": local_url, "sha256": source["sha256"], "pages": len(pages), "splitMode": mode},
            "tweets": tweets,
        }
        report.append({"id": doc_id, "title": title, "file": filename, "pages": len(pages),
                       "items": len(tweets), "articles": sum(bool(re.search(r"-a\d+(?:-\d+)?$", t["id"])) for t in tweets),
                       "sha256": source["sha256"]})
    content = "// Generated by scripts/import-sbivc.py from archived official PDFs. Do not edit.\nexport default " + json.dumps(documents, ensure_ascii=False, separators=(",", ":")) + ";\n"
    digest = hashlib.sha256(content.encode()).hexdigest()[:12]
    asset = ROOT / "assets" / f"sbivc-documents-{digest}.js"
    asset.write_text(content, encoding="utf-8")
    (ARCHIVE / "import-report.json").write_text(json.dumps({"asset": asset.name, "documents": report}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {asset.name}: {len(documents)} documents, {sum(r['items'] for r in report)} items, {sum(r['pages'] for r in report)} pages")


if __name__ == "__main__":
    main()
