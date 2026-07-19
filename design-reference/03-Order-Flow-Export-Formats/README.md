# Order Flow — Export Formats

**`Sorbetes Order Flow (v8 - CURRENT).html` is the current build — use this as the visual/UX reference.** Fully self-contained (open anywhere, no dependencies). This is the same "v8" revision confirmed against `Sorbetes_Flowchart_v8.pdf` in `05-Reference-Uploads` (60/40 payment split, sample-defect handling, Google OAuth). Only available in this bundled format — the editable `.dc.html` source was not re-exported at v8.

Everything else here predates v8 — different export **formats** of the same earlier prototype (not duplicates of each other, just different packaging):

| File | Needs sibling files? | Use for |
|---|---|---|
| `Sorbetes Order Flow.dc.html` | Yes — `support.js`, `Dashboard.dc.html`, `uploads/` | Pre-v8 editable source, if you need to see the underlying structure |
| `Sorbetes Order Flow.standalone.dc.html` | Yes — same siblings | Same pre-v8 source, packaged without the tool wrapper |
| `Sorbetes Order Flow - standalone.html` | Yes — same siblings | Plain HTML version of the above |
| `_superseded-pre-v8/Sorbetes Order Flow (Standalone).html` (19MB) | No — self-contained | Pre-v8 fully bundled version — kept for history only, don't build from this |
| `_superseded-pre-v8/Sorbetes Order Flow (offline).html` (16MB) | No — self-contained | Same, offline-packaged variant — also pre-v8, don't build from this |

`Dashboard.dc.html` here is identical to the one in `02-ScrollCine-Demo-Build/` — kept in both places since each folder's files reference it as a relative sibling.
