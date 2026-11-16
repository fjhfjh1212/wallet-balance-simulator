# 钱包余额模拟器 v1.1 — iOS 版

Faithful iOS rebuild of the Android app **钱包余额模拟器 v1.1**
(package `com.sun.jyc.fakewallet`), as a static web app wrapped with
Capacitor 7. The APK is a native Android app, so the original file cannot
be converted to an IPA; this project re-implements the same screens with
the original images, fonts, text, colors and sizes extracted from the APK.

## Contents

- `www/` — the static web app (no build step, no CDN, no external URLs)
  - `index.html` — 5 screens: main menu, WeChat pay page, Alipay balance
    page, bank account overview, about page; plus the first-launch warning
    dialog and all 6 edit dialogs
  - `styles.css`, `app.js`, `img-sizes.css`
  - `img/` — 60 PNGs extracted from the APK (xxhdpi set + xxxhdpi menu icons)
  - `fonts/` — the 9 original TTFs (WeChatSans / WeChatNum)
- `assets/` — `icon.png` (1024×1024) and `splash.png` (2732×2732),
  generated from the original Android launcher icon
- `codemagic.yaml` — Codemagic workflow: adds the Capacitor iOS platform
  at build time and produces an **unsigned IPA**
  (`WalletBalanceSimulator-unsigned.ipa`) for the user to sign themselves

## Screens & behaviour (matches the original)

- First launch shows the 警告 dialog (不再提示 checkbox, 拒绝 / 接受).
  拒绝 closes the app; 接受 enters the main menu.
- Main menu (dark `#181F27`): 某信钱包 / 某宝钱包 / 其它银行, ⋮ → 关于.
- 某信钱包: WeChat 支付 page, green card, tap 钱包 to edit the balance.
- 某宝钱包: Alipay 余额 page, tap the big balance / 余额享权益 /
  大家都在用 to edit.
- 其它银行: account overview, tap totals or any of the 3 bank cards to edit.
- About: J.L S-U-N STUDIO, 版本：v1.1.
- All values persist in `localStorage` under the same 19 keys as the
  Android `preferInfo` SharedPreferences, with the same defaults.
- No ads, no analytics, no network calls — fully offline/local.

## Build (Codemagic)

Add this repo as a Codemagic app and run the `iOS (unsigned)` workflow.
It installs Capacitor 7 at build time, generates the iOS platform, and
archives without code signing. The artifact is
`WalletBalanceSimulator-unsigned.ipa`.

## Fidelity notes

- 4 text styles could not be decoded from the APK
  (`TextDialogTitle`, `TextEditTextHint`, `TextWXCardItem`,
  `TextWXCardTitle`); the rebuild uses the closest defaults —
  dialog title 18px bold `#333`, dialog hint 14px gray, WeChat card
  title 15px bold `#333`, service item text 13px `#333`.
- All 7 AdMob ad slots (4 banners, 3 interstitials, app-open ad) are
  removed; the ad close buttons go with them.
- The original's INTERNET / network permissions were only for ads and
  are not needed.
