/* 钱包余额模拟器 v1.1 — iOS web rebuild.
   Local only: values persist in localStorage, same 19 keys as the
   Android SharedPreferences file "preferInfo". No network, no ads. */
(function () {
  'use strict';

  var PREFIX = 'preferInfo:';

  /* First-display values (layout initials from the decoded layouts;
     djd4 uses the code default, which wins at runtime). */
  var DEFAULTS = {
    key_wx_amount: '',
    key_zfb_amount: '89953846.29',
    key_zfb_dlq: '5000000',
    key_zfb_ylq: '0.00',
    key_zfb_djd1: '41,084,282人',
    key_zfb_djd2: '漳州市王***妹',
    key_zfb_djd3: '参与钓鱼夺宝中奖18.8元',
    key_zfb_djd4: '上海市i***8',
    key_zfb_djd5: '使用充享惠进行天猫购物金充值',
    key_bank_amount: '￥ 249,021,613.52',
    key_bank_fz: '￥ 1,739,748.55',
    key_bank_card1_no: '6285 **** **** 5492',
    key_bank_card1_amount: '￥18,542,524.44',
    key_bank_card2_no: '4960 **** **** 3699',
    key_bank_card2_amount: '$ 5,431,954.28',
    key_bank_card3_no: '6225 **** **** 1225',
    key_bank_card3_amount: '￥1,000,000.00',
    key_bank_card3_fz: '- ￥50,000.00'
  };

  function get(key) {
    var v = null;
    try { v = window.localStorage.getItem(PREFIX + key); } catch (e) { /* private mode */ }
    return v === null ? DEFAULTS[key] : v;
  }
  function getRaw(key) {
    var v = null;
    try { v = window.localStorage.getItem(PREFIX + key); } catch (e) {}
    return v === null ? '' : v;
  }
  function set(key, value) {
    try { window.localStorage.setItem(PREFIX + key, value); } catch (e) {}
  }
  function hasWarning() {
    try { return window.localStorage.getItem(PREFIX + 'key_show_main_waring') !== null; }
    catch (e) { return false; }
  }

  function $(id) { return document.getElementById(id); }
  function text(id, value) { var el = $(id); if (el) el.textContent = value; }

  /* ---------- render all screens from stored values ---------- */
  function render() {
    var wx = getRaw('key_wx_amount');
    text('wx-amount', wx === '' ? '0.00(点击即可设置金额)' : wx);
    text('zfb-amount', get('key_zfb_amount'));
    text('zfb-dlq', get('key_zfb_dlq'));
    text('zfb-ylq', get('key_zfb_ylq'));
    text('zfb-djd1', get('key_zfb_djd1'));
    text('zfb-djd2', get('key_zfb_djd2'));
    text('zfb-djd3', get('key_zfb_djd3'));
    text('zfb-djd4', get('key_zfb_djd4'));
    text('zfb-djd5', get('key_zfb_djd5'));
    text('bank-amount-val', get('key_bank_amount'));
    text('bank-fz-val', get('key_bank_fz'));
    text('bank-card1-no', get('key_bank_card1_no'));
    text('bank-card1-amount', get('key_bank_card1_amount'));
    text('bank-card2-no', get('key_bank_card2_no'));
    text('bank-card2-amount', get('key_bank_card2_amount'));
    text('bank-card3-no', get('key_bank_card3_no'));
    text('bank-card3-amount', get('key_bank_card3_amount'));
    text('bank-card3-fz', get('key_bank_card3_fz'));
  }

  /* ---------- navigation ---------- */
  var SCREENS = ['screen-main', 'screen-wx', 'screen-zfb', 'screen-bank', 'screen-about', 'closed-screen'];
  function showScreen(id) {
    SCREENS.forEach(function (s) { var el = $(s); if (el) el.hidden = (s !== id); });
    var sc = $(id) && $(id).querySelector('.scroll');
    if (sc) sc.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { showScreen(el.getAttribute('data-go')); });
  });

  /* ---------- main menu popup ---------- */
  var mainMenu = $('main-menu');
  $('main-more').addEventListener('click', function (e) {
    e.stopPropagation();
    mainMenu.hidden = !mainMenu.hidden;
  });
  document.addEventListener('click', function (e) {
    if (!mainMenu.hidden && !mainMenu.contains(e.target)) mainMenu.hidden = true;
  });
  $('menu-about').addEventListener('click', function () {
    mainMenu.hidden = true;
    showScreen('screen-about');
  });

  /* ---------- generic edit dialog ---------- */
  var dlgOverlay = $('dlg-overlay');
  var dlgCard = $('dlg-card');

  /* fields: [{label, key, hint, max, numeric, prefill}] */
  function openDialog(title, fields) {
    dlgCard.innerHTML = '';
    var t = document.createElement('div');
    t.className = 'dlg-title';
    t.textContent = title;
    dlgCard.appendChild(t);

    var inputs = [];
    fields.forEach(function (f) {
      var lab = document.createElement('div');
      lab.className = 'dlg-label';
      lab.textContent = f.label;
      dlgCard.appendChild(lab);
      var inp = document.createElement('input');
      inp.className = 'dlg-input';
      inp.type = 'text';
      if (f.hint) inp.placeholder = f.hint;
      if (f.max) inp.maxLength = f.max;
      if (f.numeric) inp.inputMode = 'decimal';
      inp.value = f.prefill !== undefined ? f.prefill : '';
      dlgCard.appendChild(inp);
      inputs.push({ key: f.key, el: inp });
    });

    var btns = document.createElement('div');
    btns.className = 'dlg-btns';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '取消';
    cancel.addEventListener('click', closeDialog);
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = '确认';
    ok.addEventListener('click', function () {
      inputs.forEach(function (it) { set(it.key, it.el.value); });
      closeDialog();
      render();
    });
    btns.appendChild(cancel);
    btns.appendChild(ok);
    dlgCard.appendChild(btns);

    dlgOverlay.hidden = false;
    var first = dlgCard.querySelector('input');
    if (first) first.focus();
  }
  function closeDialog() { dlgOverlay.hidden = true; }
  dlgOverlay.addEventListener('click', function (e) {
    if (e.target === dlgOverlay) closeDialog();
  });

  /* ---------- the 6 edit dialogs (layouts dlg_* in the original) ---------- */
  $('wx-wallet').addEventListener('click', function () {
    openDialog('设置余额', [
      { label: '请输入数字', key: 'key_wx_amount',
        hint: '别忘了逗号，如198,000,000.98', max: 20,
        prefill: getRaw('key_wx_amount') }
    ]);
  });
  $('zfb-amount').addEventListener('click', function () {
    openDialog('设置余额', [
      { label: '请输入数字', key: 'key_zfb_amount',
        hint: '别忘了逗号，如198,000,000.98', max: 20,
        prefill: getRaw('key_zfb_amount') }
    ]);
  });
  $('zfb-djd').addEventListener('click', function () {
    openDialog('大家都在用', [
      { label: '蓝色字体人数(数字别忘了加,逗号如10，000)', key: 'key_zfb_djd1', prefill: get('key_zfb_djd1') },
      { label: '“钓鱼夺宝”灰色文字', key: 'key_zfb_djd2', prefill: get('key_zfb_djd2') },
      { label: '“钓鱼夺宝”黑色文字', key: 'key_zfb_djd3', prefill: get('key_zfb_djd3') },
      { label: '“充享惠”灰色文字', key: 'key_zfb_djd4', prefill: get('key_zfb_djd4') },
      { label: '“充享惠”黑色文字', key: 'key_zfb_djd5', prefill: get('key_zfb_djd5') }
    ]);
  });
  $('zfb-dlq-card').addEventListener('click', function () {
    openDialog('余额享权益', [
      { label: '请输入待领取金额', key: 'key_zfb_dlq', max: 12, numeric: true, prefill: get('key_zfb_dlq') },
      { label: '请输入已领取金额', key: 'key_zfb_ylq', max: 12, numeric: true, prefill: get('key_zfb_ylq') }
    ]);
  });
  $('bank-amount').addEventListener('click', function () {
    openDialog('账户总览', [
      { label: '请输入总资产', key: 'key_bank_amount', max: 20, prefill: get('key_bank_amount') },
      { label: '请输入负债金额', key: 'key_bank_fz', max: 20, prefill: get('key_bank_fz') }
    ]);
  });
  function openCardDialog() {
    openDialog('卡片信息', [
      { label: '卡1卡号(别忘了*号)', key: 'key_bank_card1_no', prefill: get('key_bank_card1_no') },
      { label: '卡1余额', key: 'key_bank_card1_amount', prefill: get('key_bank_card1_amount') },
      { label: '卡2卡号', key: 'key_bank_card2_no', prefill: get('key_bank_card2_no') },
      { label: '卡2余额', key: 'key_bank_card2_amount', prefill: get('key_bank_card2_amount') },
      { label: '卡3卡号', key: 'key_bank_card3_no', prefill: get('key_bank_card3_no') },
      { label: '卡3余额', key: 'key_bank_card3_amount', prefill: get('key_bank_card3_amount') },
      { label: '卡3负债', key: 'key_bank_card3_fz', prefill: get('key_bank_card3_fz') }
    ]);
  }
  ['bank-card1', 'bank-card2', 'bank-card3'].forEach(function (id) {
    $(id).addEventListener('click', openCardDialog);
  });

  /* ---------- first-launch warning dialog ---------- */
  var warnOverlay = $('warn-overlay');
  $('warn-accept').addEventListener('click', function () {
    if ($('warn-nomore').checked) set('key_show_main_waring', '1');
    warnOverlay.hidden = true;
    showScreen('screen-main');
  });
  $('warn-reject').addEventListener('click', function () {
    warnOverlay.hidden = true;
    showScreen('closed-screen');
  });
  $('reopen-btn').addEventListener('click', function () {
    showScreen('screen-main');
    if (!hasWarning()) warnOverlay.hidden = false;
  });

  /* ---------- boot ---------- */
  render();
  /* Deep-link for testing: #wx / #zfb / #bank / #about opens that screen
     directly (warning dialog suppressed). Normal launch shows the warning. */
  var hash = (window.location.hash || '').replace('#', '');
  var deep = { wx: 'screen-wx', zfb: 'screen-zfb', bank: 'screen-bank', about: 'screen-about' }[hash];
  if (deep) {
    showScreen(deep);
  } else {
    showScreen('screen-main');
    if (!hasWarning()) warnOverlay.hidden = false;
  }
})();
