# Design System — Tài liệu chuẩn (Single Source of Truth)

> **Đối tượng đọc:** AI/Developer. File này là **nguồn chân lý duy nhất**. Trước khi tạo/sửa BẤT KỲ giao diện nào, đọc file này.
> **Ngôn ngữ:** Token đặt tên tiếng Anh — mô tả/quy cách bằng tiếng Việt.
> **Nguồn giá trị thực thi:** `src/app/constants/design-tokens.ts` + `src/styles/theme.css`. Khi mâu thuẫn, **code là chuẩn**; cập nhật tài liệu theo code, không hard-code hex rời rạc trong component.
>
> **Cách đọc file này:** §0.1 = Quick-Reference (tra nhanh). §1–§7 = Foundation. §8 = Components. §9 = **Foundation → Component Mapping** (AI bắt buộc tra khi dựng component). §10 = Recipes, Decision Trees & Anti-patterns. §11 = Checklist. §12 = Responsive. §13 = Accessibility.

---

## 0. Nguyên tắc bất biến (Non-negotiable)

| # | Nguyên tắc | Ý nghĩa thực thi |
|---|---|---|
| 1 | **Flat Design** | KHÔNG `box-shadow`/`drop-shadow`/gradient giả khối cho card, button, input, table. Phân lớp bằng **stroke + màu nền + spacing**. Shadow CHỈ cho overlay (dropdown/modal/drawer). |
| 2 | **Stroke thay Shadow** | Tách khối bằng `border` (`2px` khối nhấn mạnh, `1px` phân chia nhẹ) dùng token `border.*`. |
| 3 | **4px Base Unit** | Mọi `size`, `spacing`, `padding`, `radius`, `line-height` PHẢI chia hết cho 4. Cấm số lẻ (5, 7, 13…). |
| 4 | **Font Inter** | Toàn bộ text dùng `Inter`. |
| 5 | **Single Source of Truth** | Component chỉ tham chiếu token (`DESIGN_TOKENS.*` / CSS var), KHÔNG viết hex trực tiếp. |
| 6 | **Desktop-first states** | Mọi phần tử tương tác BẮT BUỘC định nghĩa đủ `default / hover / pressed / focus / disabled`. |
| 7 | **Light-only** | Chế độ sáng cố định (`color-scheme: light only`), chống Dark Reader đảo màu. |

---

## 0.1 Quick-Reference — AI tra trước khi sinh code ⚡

> Bảng nén tối thiểu. Tra đây trước, chi tiết xem phần tương ứng bên dưới.

### Màu hay dùng nhất
| Tình huống | Token | Hex |
|---|---|---|
| Nền CTA chính | `primary.main` | `#7FCA27` |
| Hover/Pressed CTA chính | `primary.hover` | `#6BB01F` |
| Text/icon trên nền CTA | `primary.textOn` | `#FFFFFF` |
| Nền badge/highlight nhẹ (primary) | `primary.subtle` | `#EEF8E4` |
| Link / action phụ / focus border | `brand.main` | `#1E74E8` |
| Hover link / action phụ | `brand.hover` | `#185EC0` |
| Nền hover link nhẹ | `brand.subtle` | `#EAF2FD` |
| Text heading / nội dung chính | `text.primary` | `#1F1F1F` |
| Text mô tả / metadata | `text.secondary` | `#6B6B6B` |
| Placeholder input | `text.placeholder` | `#D1D1D1` |
| Text disabled | `text.disabled` | `#D1D1D1` |
| Text trên nền đậm | `text.inverse` | `#FFFFFF` |
| Viền card/input/divider | `border.default` | `#E0E0E0` |
| Viền nhấn mạnh / hover input | `border.strong` | `#D1D1D1` |
| Viền focus | `border.focus` | `#1E74E8` |
| Nền trang / card | `background.page` | `#FFFFFF` |
| Nền sidebar / panel / table header | `background.subtle` | `#F8F8F8` |
| Nền element disabled | `background.disabled` | `#F2F2F2` |

### Khoảng cách theo ngữ cảnh thường gặp
| Ngữ cảnh | Token |
|---|---|
| Icon ↔ label trong button | `space8` |
| Label ↔ input field | `space8` |
| Các field trong form | `space16` |
| Padding trong card thường | `space16` – `space20` |
| Padding cell bảng (dọc × ngang) | `space12` × `space16` |
| Khoảng cách giữa các card | `space24` |
| Padding modal | `space24` |
| Khoảng cách giữa section | `space32` |

### Radius nhanh
| Element | Token | px |
|---|---|---|
| Button / chip / input | `radius-md` | 8px |
| Checkbox / small badge | `radius-sm` | 4px |
| Input / dropdown / tooltip | `radius-md` | 8px |
| Card / panel / alert | `radius-lg` | 12px |
| Modal / drawer | `radius-xl` | 16px |
| Avatar / badge pill | `radius-full` | 9999px |

### Decision nhanh (Primary vs Brand, border 1px vs 2px)
- **Primary (lá #7FCA27)** → hành động thay đổi dữ liệu: Submit, Save, Create, Publish. Mỗi màn **1** CTA.
- **Brand (dương #1E74E8)** → điều hướng, link nội tuyến, action phụ, focus ring, thông tin.
- **border 1px** → phân chia nhẹ (card, table row, input default).
- **border 2px** → nhấn mạnh (card highlight, input focus, button focus ring).
- **background.subtle** → dùng cho sidebar, table header, panel nền — không phải content chính.

---

## 1. Color Tokens (Foundation)

Giá trị dưới đây khớp `design-tokens.ts`. Nhóm màu xanh dương chuẩn là **`brand`** (alias cũ: `secondary` — dùng `brand`).

### 1.1 Primary — xanh lá (hành động chính, success)
| Token | Value | Dùng cho | Ghi chú |
|---|---|---|---|
| `primary.main` | `#7FCA27` | Nền CTA chính, trạng thái active | Mỗi màn chỉ **1** CTA primary |
| `primary.hover` | `#6BB01F` | Hover CTA primary | |
| `primary.pressed` | `#6BB01F` | Pressed/active CTA primary | |
| `primary.subtle` | `#EEF8E4` | Nền badge/highlight nhẹ | Chỉ dùng làm background |
| `primary.textOn` | `#FFFFFF` | Text/icon trên nền primary | Bắt buộc khi nền primary |

### 1.2 Brand — xanh dương (link, thông tin, action phụ)
| Token | Value | Dùng cho | Ghi chú |
|---|---|---|---|
| `brand.main` | `#1E74E8` | Link, action phụ, điểm nhấn info, border focus | Không thay CTA primary |
| `brand.hover` | `#185EC0` | Hover link/action phụ | |
| `brand.pressed` | `#185EC0` | Pressed/active link/action phụ | |
| `brand.subtle` | `#EAF2FD` | Nền hover link, info nhẹ | Chỉ background |

### 1.3 Semantic — trạng thái (main + subtle)
| Token | Main | Subtle | Dùng cho |
|---|---|---|---|
| `semantic.success` | `#7FCA27` | `#EEF8E4` | Status/alert thành công |
| `semantic.info` | `#1E74E8` | `#EAF2FD` | Status/alert thông tin |
| `semantic.warning` | `#FF8832` | `#FFF6EC` | Status/alert cảnh báo |
| `semantic.error` | `#D32F2F` | `#FDECEC` | Status/alert lỗi |
| `semantic.neutral` | `#6B6B6B` | `#F2F2F2` | Status trung tính |

> Semantic `main` chỉ cho **text/icon/viền trạng thái**, KHÔNG dùng làm nền CTA. Badge = nền `*.subtle` + chữ `*.main` **cùng nhóm**.

### 1.4 Text
| Token | Value | Dùng cho |
|---|---|---|
| `text.primary` | `#1F1F1F` | Heading, nội dung chính, text chính table |
| `text.secondary` | `#6B6B6B` | Mô tả phụ, metadata |
| `text.placeholder` | `#D1D1D1` | Placeholder input/search |
| `text.disabled` | `#D1D1D1` | Text vô hiệu (không tự giảm opacity) |
| `text.inverse` | `#FFFFFF` | Text trên nền đậm (primary/brand/semantic) |
| `text.link` | `#1E74E8` | Inline link (hover → `brand.hover`) |

### 1.5 Border (thay thế shadow để phân lớp)
| Token | Value | Dùng cho |
|---|---|---|
| `border.default` | `#E0E0E0` | Viền card/input/table, divider |
| `border.strong` | `#D1D1D1` | Viền nhấn mạnh, ranh giới rõ |
| `border.focus` | `#1E74E8` | Viền khi focus (= brand) |

### 1.6 Background
| Token | Value | Dùng cho |
|---|---|---|
| `background.page` | `#FFFFFF` | Nền trang, nền card |
| `background.subtle` | `#F8F8F8` | Nền sidebar/panel/table header |
| `background.disabled` | `#F2F2F2` | Nền phần tử vô hiệu |

**Rules:** chỉ dùng palette đã duyệt, không tự sinh màu; component tham chiếu token, không hex trực tiếp; không trộn primary (lá) và brand (dương) cho cùng một loại hành động.

### 1.7 Token Naming Convention — khi cần tạo token mới
Pattern: `[nhóm].[role]` hoặc `[nhóm].[category].[role]`

| Ví dụ đúng | Ví dụ sai | Lý do |
|---|---|---|
| `semantic.warning.subtle` | `orangeLight` | Không dùng tên màu vật lý |
| `background.disabled` | `color-gray-bg` | Không dùng tiền tố `color-` |
| `border.focus` | `focusBorderBlue` | Không nhúng màu vào tên |
| `text.secondary` | `textGray` | Role thay cho màu |

**Nhóm hợp lệ:** `color` · `text` · `border` · `background` · `semantic` · `spacing` · `radius` · `shadow` · `motion`  
**Role hợp lệ:** `main` · `hover` · `pressed` · `subtle` · `disabled` · `inverse` · `focus` · `textOn`  
Không đặt tên token theo component cụ thể (ví dụ `buttonBg`) — token là Foundation, không phải Component.

---

## 2. Typography (Foundation)

**Font:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. **Weights:** `medium 500`, `bold 700`.

| Token | Size | Line-height | Weight | Dùng cho |
|---|---|---|---|---|
| `h1` | 32px | 40px | 700 | Tiêu đề trang chính |
| `h2` | 28px | 36px | 700 | Tiêu đề module lớn |
| `h3` | 24px | 32px | 700 | Tiêu đề section/card lớn |
| `h4` | 20px | 28px | 700 | Tiêu đề card/bảng |
| `h5` | 16px | 24px | 700 | Tiêu đề nhóm nhỏ |
| `h6` | 14px | 20px | 700 | Tiêu đề phụ rất nhỏ |
| `subtitle1` | 16px | 24px | 500 | Mô tả dưới tiêu đề |
| `subtitle2` | 14px | 20px | 500 | Mô tả phụ |
| `body1` | 16px | 24px | 500 | Nội dung chính, text button large |
| `body2` | 14px | 20px | 500 | Text UI phổ biến, text button md/sm |
| `body3` | 12px | 16px | 500 | Text table, metadata |
| `caption` | 12px | 16px | 500 | Helper text, chú thích |
| `overline` | 12px | 16px | 500 | Label phân loại (uppercase) |

**Rules:** mọi size & line-height chia hết cho 4; line-height ≥ size + 4px. Không override tùy tiện `font-size`/`weight`/`line-height` ngoài thang trên.

---

## 3. Spacing & Padding (Foundation) — Base 4px

`spacing` = khoảng cách **giữa** các element (gap/margin). `padding` = khoảng cách **bên trong** element.

| Token | Value | Spacing (giữa) | Padding (trong) |
|---|---|---|---|
| `space0` | 0px | Reset gap/margin | Reset padding |
| `space4` | 4px | icon–text inline, badge nội tuyến | Chip cực nhỏ |
| `space8` | 8px | icon ↔ label trong button, label ↔ field | Button nhỏ, input dense, dropdown item |
| `space12` | 12px | field–label, giữa các item list | Input mặc định, cell bảng dọc |
| `space16` | 16px | giữa các field trong form, padding card | Card mặc định, padding ngang cell |
| `space20` | 20px | section nhỏ | Card lớn, container thoáng |
| `space24` | 24px | giữa các card, giữa section | Modal content, section lớn |
| `space32` | 32px | giữa các vùng layout lớn | Empty state, layout lớn |

**Rules:** chỉ chọn trong thang 0–32; không giá trị lẻ ngoài scale.

### 3.1 Spacing Context — ngữ cảnh áp dụng cụ thể

| Ngữ cảnh | Gap/Margin | Padding |
|---|---|---|
| Icon ↔ label trong button | `space8` | — |
| Label ↔ input field (vertical) | `space8` | — |
| Helper text ↔ input (below) | `space4` | — |
| Các field trong form | `space16` | — |
| Các card trong grid | `space24` | — |
| Các section trong trang | `space32` | — |
| Button: size small | — | `space8` dọc · `space16` ngang |
| Button: size medium | — | `space12` dọc · `space20` ngang |
| Button: size large | — | `space16` dọc · `space24` ngang |
| Input / Select / Textarea | — | `space12` đều 4 phía |
| Card thường | — | `space16`–`space20` |
| Modal / Dialog content | — | `space24` |
| Table cell | — | `space12` dọc · `space16` ngang |
| Dropdown item | — | `space8` dọc · `space12` ngang |
| Tooltip | — | `space8` dọc · `space12` ngang |
| Empty state block | — | `space32` |
| Sidebar item | — | `space8` dọc · `space12` ngang |

---

## 4. Border Radius (Foundation) — Bội số 4px

| Token | Value | Dùng cho |
|---|---|---|
| `radius-none` | 0px | Góc vuông, reset |
| `radius-sm` | 4px | Button, chip, checkbox, tag |
| `radius-md` | 8px | Input, select, dropdown, tooltip, popover |
| `radius-lg` | 12px | Card, panel, alert banner |
| `radius-xl` | 16px | Modal, drawer |
| `radius-full` | 9999px | Avatar, badge pill, status dot, toggle thumb |

**Rules:** mặc định `radius-sm` (button) / `radius-md` (input) / `radius-lg` (card); `radius-full` chỉ cho pill/avatar/badge tròn; không tự chọn giá trị ngoài thang.

---

## 5. Shadow (Foundation) — hạn chế tối đa

| Token | Value | CHỈ dùng cho |
|---|---|---|
| `shadow-none` | `none` | **Mặc định**: card, button, input, table, list → dùng border |
| `shadow-sm` | `0 2px 4px 0 rgba(0,0,0,0.08)` | Overlay nhỏ: dropdown, popover, tooltip |
| `shadow-md` | `0 4px 8px 0 rgba(0,0,0,0.10)` | Overlay lớn: modal, dialog, drawer |

**Rules:** KHÔNG shadow cho card/button/input/table (dùng border). Shadow CHỈ cho lớp nổi trên nền (overlay). Ưu tiên border + divider trước.

### 5.1 Motion / Transition Tokens

> Flat design không có nghĩa là tĩnh. Transition nhẹ giúp phản hồi tương tác rõ ràng mà không phá vỡ tính phẳng.

| Token | Value | Dùng cho |
|---|---|---|
| `motion.fast` | `150ms ease-out` | Hover button, badge, icon button |
| `motion.base` | `200ms ease-out` | Focus input, dropdown open/close, tooltip |
| `motion.slow` | `300ms ease-out` | Modal open/close, drawer slide, tab switch |
| `motion.none` | `0ms` | Khi `prefers-reduced-motion: reduce` |

**Thuộc tính được phép animate:** `opacity`, `transform` (translate/scale), `background-color`, `border-color`, `color`.  
**Không animate:** `width`/`height` tự do (dùng `max-height` nếu cần accordion), `box-shadow` (không dùng shadow), `font-size`.  
**Bắt buộc:** kiểm tra `prefers-reduced-motion` và tắt animation khi người dùng yêu cầu.

---

## 6. Icons (Foundation)

**Library:** `lucide-react` (outline, độ dày 1.5–2px). **Sizes (bội 4):** `16` (inline/menu), `20` (trong button/input, tiêu đề), `24` (standalone/heading), `32` (nhấn mạnh/empty state).

**Màu icon theo ngữ cảnh:**
| Ngữ cảnh | Màu icon |
|---|---|
| Mặc định standalone | `text.secondary` |
| Đi kèm text heading | `text.primary` |
| Icon click được (action) | `brand.main` |
| Icon trên nền đậm (CTA button) | `text.inverse` |
| Disabled | `text.disabled` |
| Trạng thái semantic (alert) | `semantic.*.main` cùng nhóm |

Icon không rõ nghĩa phải có `aria-label` hoặc tooltip.

---

## 7. Elevation & Layering nguyên tắc

Thứ tự ưu tiên khi cần tách lớp thị giác: **(1) khoảng cách (spacing) → (2) màu nền (`background.subtle`/`*.subtle`) → (3) đường viền (`border.*`) → (4) shadow (chỉ overlay)**. Không nhảy thẳng lên shadow.

### 7.1 Z-index Scale

> Không tự đặt z-index tùy tiện. Chỉ dùng các bậc đã định nghĩa.

| Tên bậc | z-index | Gồm những gì |
|---|---|---|
| `z-base` | 0 | Nội dung trang thông thường |
| `z-raised` | 10 | Phần tử nổi nhẹ trong flow (sticky table header) |
| `z-sticky` | 100 | App header cố định, sidebar |
| `z-dropdown` | 200 | Dropdown, select menu, popover, datepicker |
| `z-backdrop` | 300 | Overlay mờ phía sau modal/drawer |
| `z-modal` | 400 | Modal dialog, drawer panel |
| `z-toast` | 500 | Toast notification (luôn trên cùng) |

**Rules:** không dùng giá trị trung gian (ví dụ z-index 350); nếu cần tách 2 overlay cùng cấp, tăng 10 đơn vị trong bậc đó.

---

## 8. Components — Quy cách

### 8.1 Button

| Size | Height | Padding | Text token | Radius |
|---|---|---|---|---|
| Small | 32px | `space8` × `space16` | body2 (14px/500) | `radius-sm` |
| Medium (default) | 40px | `space12` × `space20` | body2 (14px/500) | `radius-sm` |
| Large | 48px | `space16` × `space24` | body1 (16px/500) | `radius-sm` |

**Variants:** `primary`, `secondary` (nền trắng + border), `outline` (brand), `ghost`.  
**States bắt buộc:** default / hover / pressed / focus / disabled.  
**Icon trong button:** tối đa 1 icon (trái hoặc phải), kích thước 20px, gap `space8` với label. Không 2 icon cùng lúc.  
**Không shadow** trên bất kỳ variant nào.

### 8.2 Input / Select / Textarea

- Height md 40px; padding `space12` đều 4 phía; `radius-md`; viền 1px (default) / 2px (focus/error).
- Nền `background.page`; placeholder `text.placeholder`.
- Label: body2 bold, cách input `space8`; Helper text: caption `text.secondary`, cách input `space4`.
- Textarea: min-height 80px (= 2 dòng); resize dọc (vertical) hoặc none.

### 8.3 Controls

- **Checkbox** 20×20px, border 2px, `radius-sm`. Checked: nền `primary.main`, dấu tick `text.inverse`.
- **Radio** 20×20px tròn (`radius-full`), border 2px. Selected: dot 10×10px `primary.main` ở giữa.
- **Toggle** track 44×24px `radius-full`; thumb 20×20px `radius-full`. On: track `primary.main`; Off: track `border.strong`.
- **Slider** track cao 4px `radius-full`; thumb 20×20px `radius-full`; filled track `primary.main`.

### 8.4 Tag / Badge

- Height 24px; padding `0 space12`; body3 (12px/500); `radius-full`.
- Variants: default / primary / success / warning / error / info (theo §9.3).
- Không dùng icon trong badge trừ status dot (8×8px, `radius-full`, cùng màu `*.main`).

### 8.5 Card / Panel

- Nền `background.page`; viền `1–2px border.default`; `radius-lg`; padding `space16`–`space24`; **không shadow**.
- Cấu trúc slot: **CardHeader** (H4 + optional subtitle2 + optional action button phải) → **CardBody** → optional **CardFooter** (action buttons, right-aligned).
- Khoảng cách giữa Header và Body: `space16`. Giữa các card trong grid: `space24`.

### 8.6 Table

- Header: nền `background.subtle`, border-bottom `1px border.default`, text `text.secondary` (overline/body3).
- Row: height 48px, padding `space12` × `space16`, divider `1px border.default`, text `text.primary` (body3).
- Hover row: nền `rgba(0,0,0,0.04)`.
- Cell có thể chứa: text, Badge (§8.4), Avatar + text (avatar 24px), icon action (16px, `brand.main`).
- Sắp xếp column: icon ChevronUp/Down 16px `text.secondary`, active → `text.primary`.

### 8.7 Overlay (Dropdown / Modal / Drawer)

- **Dropdown / Popover / Tooltip:** `shadow-sm`, `radius-md`, z-index `z-dropdown`. Item height 36px, padding `space8` × `space12`.
- **Modal / Dialog:** `shadow-md`, `radius-xl`, z-index `z-modal`, backdrop `rgba(0,0,0,0.54)` tại `z-backdrop`. Padding nội dung `space24`. Max-width 560px (sm) / 760px (md) / 1024px (lg).
- **Drawer:** `shadow-md`, `radius-xl` (góc trái nếu từ phải), z-index `z-modal`. Width 360px (sm) / 480px (md).
- **Toast:** `shadow-sm`, `radius-md`, z-index `z-toast`. Width max 360px. Vị trí bottom-right, gap `space8` giữa các toast. Auto-dismiss 4000ms.

### 8.8 Alert / Banner

- Cấu trúc: icon 20px + `space12` + nội dung text + optional nút close (X 16px) góc phải.
- Variants: success / info / warning / error (theo token §9.8).
- Border: 1px `semantic.*.main` cùng nhóm. Nền `semantic.*.subtle`. Không shadow.
- `radius-lg`. Padding `space12` × `space16`.

### 8.9 Tabs

- Tab item: padding `space12` × `space16`, height 44px, body2 (14px/500).
- **Active:** border-bottom 2px `primary.main`, text `text.primary` weight 700.
- **Default:** text `text.secondary`, không border.
- **Hover:** text `text.primary`, border-bottom 1px `border.strong`.
- **Disabled:** text `text.disabled`, không border.
- Tab bar border-bottom tổng thể: 1px `border.default`.
- Transition: `motion.base` cho border-bottom và color.

### 8.10 Pagination

- Nút số: 32×32px, `radius-sm`, text body2.
- **Default:** nền `background.page`, border 1px `border.default`, text `text.primary`.
- **Active:** nền `primary.main`, text `primary.textOn`, không border.
- **Hover:** nền `background.subtle`, border 1px `border.strong`.
- Nút Prev / Next: ghost style với icon ChevronLeft/Right 16px.
- Gap giữa các nút: `space4`.

### 8.11 Breadcrumb

- Separator: `/` hoặc icon ChevronRight 16px, màu `text.placeholder`.
- **Link:** text `text.link`, hover `brand.hover` + underline.
- **Current page:** text `text.primary`, không underline, không click được.
- Gap quanh separator: `space8`.
- Font: body2 (14px/500).

### 8.12 Empty State

- Icon: 32px, màu `text.placeholder`.
- Cấu trúc từ trên xuống: icon → H4 (`text.primary`) → body2 (`text.secondary`) → optional CTA button.
- Căn giữa ngang và dọc. Padding `space32` toàn block.
- Gap giữa icon và H4: `space16`. Gap giữa text và CTA: `space24`.

### 8.13 Divider

- Ngang: height 1px, màu `border.default`, margin `space16` dọc.
- Dọc: width 1px, màu `border.default`, margin `space16` ngang.
- Divider có label: text `text.secondary` body3, padding `space8` hai bên text, nền `background.page`.

---

## 9. Foundation → Component Mapping (mối liên hệ chặt chẽ) ⭐

Đây là bảng tra bắt buộc khi dựng component: mỗi thuộc tính component **phải** ánh xạ về một token Foundation. Không có ô nào được điền bằng hex/số rời.

### 9.1 Button — token theo variant × state
| Variant | State | Background | Text/Icon | Border |
|---|---|---|---|---|
| Primary | default | `primary.main` | `primary.textOn` | none |
| Primary | hover | `primary.hover` | `primary.textOn` | none |
| Primary | pressed | `primary.pressed` | `primary.textOn` | none |
| Primary | focus | `primary.main` | `primary.textOn` | 2px `border.focus` (outline offset) |
| Primary | disabled | `background.disabled` | `text.disabled` | none |
| Secondary | default | `background.page` | `text.primary` | 1px `border.default` |
| Secondary | hover | `background.subtle` | `text.primary` | 1px `border.strong` |
| Secondary | pressed | `background.subtle` | `text.primary` | 1px `border.strong` |
| Secondary | focus | `background.page` | `text.primary` | 2px `border.focus` |
| Secondary | disabled | `background.disabled` | `text.disabled` | 1px `border.default` |
| Outline/Brand | default | `background.page` | `brand.main` | 1px `brand.main` |
| Outline/Brand | hover | `brand.subtle` | `brand.hover` | 1px `brand.hover` |
| Outline/Brand | focus | `background.page` | `brand.main` | 2px `border.focus` |
| Ghost | default | transparent | `brand.main` | none |
| Ghost | hover | `brand.subtle` | `brand.hover` | none |
| Ghost | focus | `brand.subtle` | `brand.main` | 2px `border.focus` |
| *(mọi variant)* | — | radius = `radius-sm` · padding theo size §8.1 · font theo size §8.1 · transition `motion.fast` | | |

### 9.2 Input — token theo state
| State | Background | Border | Text | Placeholder |
|---|---|---|---|---|
| default | `background.page` | 1px `border.default` | `text.primary` | `text.placeholder` |
| hover | `background.page` | 1px `border.strong` | `text.primary` | `text.placeholder` |
| focus | `background.page` | 2px `border.focus` | `text.primary` | `text.placeholder` |
| error | `background.page` | 2px `semantic.error.main` | `text.primary` | `text.placeholder` |
| disabled | `background.disabled` | 1px `border.default` | `text.disabled` | `text.disabled` |
| *(chung)* | radius = `radius-md` · padding = `space12` · font = body2 · transition border `motion.base` | | | |

### 9.3 Badge/Tag — token theo variant
| Variant | Background | Text | Border |
|---|---|---|---|
| primary | `primary.subtle` | `primary.main` | none |
| success | `semantic.success.subtle` | `semantic.success.main` | none |
| info | `semantic.info.subtle` | `semantic.info.main` | none |
| warning | `semantic.warning.subtle` | `semantic.warning.main` | none |
| error | `semantic.error.subtle` | `semantic.error.main` | none |
| neutral/default | `semantic.neutral.subtle` | `semantic.neutral.main` | none |
| *(chung)* | radius = `radius-full` · padding = `0 space12` · height 24px · font = body3 | | |

### 9.4 Card — token
| Thuộc tính | Token |
|---|---|
| Background | `background.page` |
| Border | 1–2px `border.default` |
| Radius | `radius-lg` |
| Padding | `space16`–`space24` |
| Khoảng cách giữa card | `space24` |
| Shadow | `shadow-none` |
| Header–Body gap | `space16` |

### 9.5 Table — token
| Vùng | Background | Border/Divider | Text |
|---|---|---|---|
| Header | `background.subtle` | bottom 1px `border.default` | `text.secondary` (overline/body3) |
| Cell | `background.page` | row divider 1px `border.default` | `text.primary` (body3) |
| Row hover | `rgba(0,0,0,0.04)` | — | `text.primary` |
| Padding cell | `space12` dọc · `space16` ngang · row height 48px | | |

### 9.6 Overlay — token
| Loại | Shadow | Radius | Background | Backdrop | Z-index |
|---|---|---|---|---|---|
| Dropdown/Popover/Tooltip | `shadow-sm` | `radius-md` | `background.page` | — | `z-dropdown` |
| Modal/Dialog | `shadow-md` | `radius-xl` | `background.page` | `rgba(0,0,0,0.54)` | `z-modal` |
| Drawer | `shadow-md` | `radius-xl` | `background.page` | `rgba(0,0,0,0.54)` | `z-modal` |
| Toast | `shadow-sm` | `radius-md` | `background.page` | — | `z-toast` |

### 9.7 Sidebar item
| State | Background | Text/Icon |
|---|---|---|
| default | transparent | `text.secondary` |
| hover | `background.subtle` | `text.primary` |
| active | `primary.subtle` | `primary.main` (font 700) |
| focus | `background.subtle` | `text.primary` + 2px `border.focus` (outline) |
| Padding | `space8` dọc · `space12` ngang | |
| Icon size | 20px · gap `space8` với label | |

### 9.8 Alert / Banner — token theo variant
| Variant | Background | Border | Icon/Text |
|---|---|---|---|
| success | `semantic.success.subtle` | 1px `semantic.success.main` | `semantic.success.main` |
| info | `semantic.info.subtle` | 1px `semantic.info.main` | `semantic.info.main` |
| warning | `semantic.warning.subtle` | 1px `semantic.warning.main` | `semantic.warning.main` |
| error | `semantic.error.subtle` | 1px `semantic.error.main` | `semantic.error.main` |
| *(chung)* | radius = `radius-lg` · padding = `space12 space16` · body-text = `text.primary` · shadow-none | | |

### 9.9 Tabs — token theo state
| State | Background | Border-bottom | Text |
|---|---|---|---|
| default | transparent | none | `text.secondary` |
| hover | transparent | 1px `border.strong` | `text.primary` |
| active | transparent | 2px `primary.main` | `text.primary` (weight 700) |
| disabled | transparent | none | `text.disabled` |
| Tab bar | — | 1px `border.default` (toàn thanh) | — |
| *(chung)* | height 44px · padding `space12 space16` · font body2 · transition `motion.base` | | |

### 9.10 Pagination — token theo state
| State | Background | Border | Text |
|---|---|---|---|
| default | `background.page` | 1px `border.default` | `text.primary` |
| hover | `background.subtle` | 1px `border.strong` | `text.primary` |
| active | `primary.main` | none | `primary.textOn` |
| disabled | `background.disabled` | 1px `border.default` | `text.disabled` |
| *(chung)* | size 32×32px · radius = `radius-sm` · font body2 · gap `space4` | | |

> **Quy tắc vàng:** Nếu một thuộc tính component không tìm được token tương ứng ở §1–§7, thì thiếu token — bổ sung vào `design-tokens.ts` trước theo convention §1.7, KHÔNG hard-code trong component.

---

## 10. Recipes & Anti-patterns

### 10.1 Decision Trees — AI tra nhanh khi phân vân

**Dùng Primary hay Brand?**
```
Hành động thay đổi/tạo dữ liệu (Submit, Save, Create, Publish, Delete)?
  → PRIMARY (#7FCA27)
  → Mỗi màn chỉ 1 CTA primary
Điều hướng, link, thông tin, action phụ, focus indicator?
  → BRAND (#1E74E8)
```

**Border 1px hay 2px?**
```
Phân chia nhẹ — card thường, table row, input default, divider?
  → 1px border.default / border.strong
Nhấn mạnh — input focus, button focus ring, card được chọn, alert?
  → 2px border.focus / semantic.*.main
```

**Background.page hay background.subtle?**
```
Vùng là content chính (card body, form, modal content)?
  → background.page (#FFF)
Vùng là container/frame (sidebar, table header, panel nền, input disabled)?
  → background.subtle (#F8F8F8)
```

**radius-sm / radius-md / radius-lg?**
```
Button, chip, checkbox, tag, pagination item?
  → radius-sm (4px)
Input, select, dropdown, tooltip, popover?
  → radius-md (8px)
Card, panel, alert, toast?
  → radius-lg (12px)
Modal, drawer?
  → radius-xl (16px)
Avatar, badge pill, toggle, status dot?
  → radius-full (9999px)
```

**Khi nào dùng shadow?**
```
Element nổi trên nền trang (dropdown, tooltip, popover, modal, drawer, toast)?
  → shadow-sm (small overlay) / shadow-md (large overlay)
Card, button, input, table, list, badge, tab, alert?
  → KHÔNG shadow — dùng border
```

**Spacing giữa 2 element?**
```
Icon ↔ label trong 1 row? → space8
Label ↔ input? → space8
Field ↔ field trong form? → space16
Card ↔ card trong grid? → space24
Section ↔ section trong trang? → space32
```

### 10.2 Recipes — Công thức đúng

- **Tách card:** `border: 1px solid border.default` + `radius-lg` + `background.page`, không shadow.
- **Card được chọn/active:** `border: 2px solid primary.main` + nền `primary.subtle`.
- **Nhấn khối active:** nền `*.subtle` + chữ `*.main` cùng nhóm semantic.
- **CTA chính:** `primary.main` + `primary.textOn`, mỗi màn 1 cái, `radius-sm`.
- **Link/action phụ:** `brand.main`, hover `brand.hover`, transition `motion.fast`.
- **Trạng thái badge:** nền `*.subtle` + chữ `*.main` theo §9.3.
- **Alert thành công:** nền `semantic.success.subtle` + border 1px `semantic.success.main` + icon `semantic.success.main`.
- **Form field lỗi:** border 2px `semantic.error.main` + helper text `semantic.error.main` body-caption bên dưới.
- **Row bảng hover:** `rgba(0,0,0,0.04)` — không dùng token `background.subtle` cho hover (quá đậm).
- **Page header layout:** H1 (`text.primary`) + subtitle1 (`text.secondary`) bên trái + CTA primary bên phải, cùng row.

### 10.3 Anti-patterns — Không bao giờ làm

- `box-shadow`/`drop-shadow` trên card/button/input/table/alert.
- Hex rời rạc trong JSX/CSS thay vì token (`DESIGN_TOKENS.*` hoặc CSS var).
- Spacing/size/radius lẻ: 5px, 10px, 13px, 14px radius, 18px gap…
- Dùng `semantic.*.main` làm nền CTA (chỉ dùng cho text/icon/border trạng thái).
- Trộn primary (lá) và brand (dương) cho cùng loại hành động trong 1 màn.
- Giảm `opacity: 0.5` tự chế thay cho token `text.disabled` / `background.disabled`.
- 2 icon trong 1 button.
- Tự đặt z-index tùy tiện ngoài thang §7.1.
- Tạo token mới với tên màu vật lý (xem §1.7).
- Dùng `background.subtle` làm hover color cho table row (dùng `rgba(0,0,0,0.04)` thay).

---

## 11. Checklist trước khi commit UI

- [ ] Không có `shadow-*`/`box-shadow`/`drop-shadow` trên card/button/input/table/alert (shadow chỉ ở overlay).
- [ ] Mọi `size`/`spacing`/`padding`/`radius`/`line-height` chia hết cho 4px.
- [ ] Mọi màu lấy từ `DESIGN_TOKENS`/CSS var — không hex rời rạc.
- [ ] Font Inter được áp dụng toàn bộ.
- [ ] Phân lớp bằng spacing → nền → border (shadow sau cùng).
- [ ] Mỗi component tương tác có đủ `default/hover/pressed/focus/disabled` ánh xạ đúng token theo §9.
- [ ] CTA primary duy nhất mỗi màn; link/action phụ dùng brand.
- [ ] Z-index chỉ dùng bậc đã định nghĩa trong §7.1.
- [ ] Transition dùng `motion.*` token; có fallback `motion.none` cho `prefers-reduced-motion`.
- [ ] Icon trong button tối đa 1, kích thước 20px, gap `space8`.
- [ ] Token mới (nếu có) đặt tên theo convention §1.7 và thêm vào `design-tokens.ts`.
- [ ] Responsive: layout không vỡ tại breakpoint `md` (768px) và `lg` (1024px) theo §12.

---

## 12. Responsive — Breakpoints & Adaptive Behavior

> Desktop-first: thiết kế mặc định cho ≥ 1024px, thu hẹp xuống tablet rồi mobile.

### 12.1 Breakpoints

| Tên | px | Mô tả |
|---|---|---|
| `sm` | 640px | Mobile landscape / tablet nhỏ |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop / desktop nhỏ (baseline thiết kế) |
| `xl` | 1280px | Desktop rộng |
| `2xl` | 1536px | Màn hình lớn |

Max-width content: **1200px** (căn giữa trang tại xl trở lên).

### 12.2 Layout thích ứng

| Element | ≥ lg (default) | md | sm |
|---|---|---|---|
| Sidebar | Fixed 240px, luôn hiển thị | Collapsible (icon-only 56px) | Ẩn, mở bằng hamburger |
| Grid card | 3 cột (`grid-cols-3`) | 2 cột (`grid-cols-2`) | 1 cột (`grid-cols-1`) |
| Form layout | Label trên, field chiếm 50% width | Field chiếm 100% width | Full width |
| Table | Hiện đầy đủ cột | Ẩn cột thứ yếu | Horizontal scroll |
| Modal | Max-width 560px/760px | Max-width 90vw | Full screen (100vw × 100vh) |
| Page header | H1 + subtitle + CTA cùng row | H1 + subtitle (CTA xuống dòng) | Stack dọc |

### 12.3 Rules

- **Không hard-code chiều rộng pixel** cho grid item — dùng Tailwind responsive prefix (`md:grid-cols-2`).
- Minimum touch target: 44×44px cho mọi phần tử tương tác trên mobile.
- Sidebar collapse tại < `lg`; ẩn hoàn toàn tại < `md` (dùng drawer overlay thay thế).
- Font scale không thay đổi theo breakpoint — typography token cố định.

---

## 13. Accessibility Baseline

> Không cần WCAG đầy đủ, nhưng những điểm sau là bắt buộc để sản phẩm dùng được.

### 13.1 Contrast tối thiểu

| Cặp màu | Tỉ lệ contrast | Đạt |
|---|---|---|
| `text.primary` (#1F1F1F) trên `background.page` (#FFF) | ~19:1 | ✅ AAA |
| `text.secondary` (#6B6B6B) trên `background.page` (#FFF) | ~5.9:1 | ✅ AA |
| `primary.textOn` (#FFF) trên `primary.main` (#7FCA27) | ~2.9:1 | ⚠️ Chỉ dùng bold/large text (≥18px hoặc ≥14px bold) |
| `text.inverse` (#FFF) trên `brand.main` (#1E74E8) | ~4.6:1 | ✅ AA |
| `text.placeholder` (#D1D1D1) trên `background.page` | ~1.6:1 | Chấp nhận (placeholder không phải content) |

> `primary.textOn` trên nền `primary.main` chỉ đủ contrast khi text đủ lớn (button height ≥ 40px). Không dùng small text trên nền primary.

### 13.2 Focus & Keyboard

- **Không ẩn focus outline.** Mọi element tương tác phải có visible focus indicator: `outline: 2px solid border.focus` với `outline-offset: 2px`.
- Tab order theo flow tự nhiên (DOM order). Không dùng `tabIndex > 0`.
- Modal/Dialog phải trap focus bên trong khi mở. Đóng bằng `Escape`.
- Dropdown/Select đóng bằng `Escape`, điều hướng bằng Arrow Up/Down, chọn bằng Enter/Space.
- Button kích hoạt bằng `Enter` và `Space`.

### 13.3 ARIA & Semantic HTML

- Dùng element HTML đúng ngữ nghĩa trước khi thêm ARIA (`<button>` thay `<div onClick>`).
- Icon-only button: bắt buộc `aria-label="Tên hành động"`.
- Alert/status động: dùng `role="alert"` hoặc `aria-live="polite"`.
- Form field: `<label>` liên kết với input bằng `htmlFor` / `id`. Không thay bằng `placeholder`.
- Modal: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` trỏ đến tiêu đề.
- Badge/Tag không tương tác: `aria-label` nếu màu là thông tin duy nhất (hỗ trợ color-blind).
- Table: `<th scope="col">` cho header cột; `<caption>` nếu table độc lập.

### 13.4 Motion & Giảm động

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Áp dụng globally. Không dùng animation để truyền thông tin quan trọng (dùng text/icon song song).
