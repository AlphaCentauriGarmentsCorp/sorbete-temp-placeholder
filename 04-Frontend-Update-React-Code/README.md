# frontend-update — ready-to-paste files

Drop these into `sorbetes-frontend` at the paths below, then wire the route.
Full rationale is in `../FRONTEND_UPDATE.md`.

| File here | Copy to |
|-----------|---------|
| `orderConfig.js`   | `src/data/orderConfig.js` |
| `WalkInsInfo.jsx`  | `src/pages/WalkInsInfo.jsx` |
| `WalkInsInfo.css`  | `src/design/WalkInsInfo.css` |
| `QuoteSummary.jsx` | `src/pages/QuoteSummary.jsx` |
| `QuoteSummary.css` | `src/design/QuoteSummary.css` |
| `DirectForm.jsx`   | `src/pages/DirectForm.jsx` (replaces current) |
| `DirectForm.css`   | `src/design/DirectForm.css` (replaces current) |
| `GuidedWalkthrough.jsx` | `src/pages/GuidedWalkthrough.jsx` (replaces current) |
| `GuidedWalkthrough.css` | `src/design/GuidedWalkthrough.css` (replaces current) |

**Path A video asset:** drop a vertical garment clip at `public/scrub-tee.mp4`
(or change `SCRUB_SRC` in `GuidedWalkthrough.jsx`). The clip is seeked by scroll,
never played.

### Wire the route in `src/pages/App.jsx`
```jsx
import WalkInsInfo from './WalkInsInfo.jsx'
// …inside the route switch:
if (page === 'walk-ins') return <WalkInsInfo />
```

### Point the walk-in CTA to the new page
Anywhere the online chooser/nav linked to the QR kiosk, use:
```js
navigate('?page=walk-ins')   // in-person address page (NOT ?page=walk-in)
```
The `?page=walk-in` QR kiosk flow stays untouched for on-site use.

### Use the shared quote in both paths
```jsx
import QuoteSummary from './QuoteSummary.jsx'
<QuoteSummary form={form} qty={qty} onChange={editOrder} onProceed={checkout} />
```

### Next (larger) step
Rework `GuidedWalkthrough.jsx` (Path A scroll-scrub) and `DirectForm.jsx`
(Path B) to read options from `orderConfig.js` — see §3 and §4 of
`FRONTEND_UPDATE.md`.
