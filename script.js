/* Sementara: pindahkan token ini ke backend sebelum situs dipublikasikan. */
const FONNTE_TOKEN = "ZcRVNrhZ9A9q5i9NjqtG";
const FONNTE_TARGET = "6283166230510";

const $ = id => document.getElementById(id);
const f = {nama:$('nama'), wa:$('wa'), pesan:$('pesan'), alamat:$('alamat')};

function normalizePhone(raw){
  let d = raw.replace(/\D/g,'');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d;
}
const rules = {
  nama: v => v.trim().length < 2 ? 'Tulis nama lengkapmu ya (minimal 2 huruf).' : '',
  wa: v => {
    if (!v.trim()) return 'Nomor WhatsApp wajib diisi.';
    const d = normalizePhone(v);
    return (d.length < 10 || d.length > 15) ? 'Nomor belum valid. Coba lagi, contoh: 0812 3456 7890.' : '';
  },
  pesan: v => v.trim().length < 10 ? 'Pesannya terlalu singkat. Tulis minimal 10 karakter ya.' : ''
};
function check(key){
  const msg = rules[key](f[key].value);
  const field = f[key].closest('.field');
  field.classList.toggle('invalid', !!msg);
  $('e-'+key).textContent = msg;
  f[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}
Object.keys(rules).forEach(k => {
  f[k].addEventListener('blur', () => check(k));
  f[k].addEventListener('input', () => { if (f[k].closest('.field').classList.contains('invalid')) check(k); });
});
f.pesan.addEventListener('input', () => $('count').textContent = f.pesan.value.length + ' / 1000');

$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const results = Object.keys(rules).map(check);
  if (results.includes(false)) {
    const firstBad = Object.keys(rules).find(k => !!rules[k](f[k].value));
    if (firstBad) f[firstBad].focus();
    return;
  }
  const submitButton = $('form').querySelector('button[type="submit"]');
  const toast = $('toast');
  const message = [
    '*Feedback Pelanggan Bojabhumi*', '',
    'Nama: ' + f.nama.value.trim(),
    'WhatsApp: ' + normalizePhone(f.wa.value),
    f.alamat.value.trim() ? 'Alamat: ' + f.alamat.value.trim() : '',
    '', 'Pesan:', f.pesan.value.trim()
  ].filter(Boolean).join('\n');

  submitButton.disabled = true;
  submitButton.textContent = 'Mengirim…';
  toast.textContent = 'Sedang mengirim pesan…';
  toast.classList.add('show');

  try {
    const payload = new FormData();
    payload.append('target', FONNTE_TARGET);
    payload.append('message', message);
    payload.append('countryCode', '0');
    payload.append('connectOnly', 'true');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: FONNTE_TOKEN },
      body: payload
    });
    const result = await response.json();
    if (!response.ok || !result.status) throw new Error(result.reason || 'Pesan belum dapat dikirim.');

    $('success-screen').hidden = false;
  } catch (error) {
    toast.textContent = error.message || 'Koneksi bermasalah. Silakan coba lagi.';
    toast.classList.add('show');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Kirim pesan <span aria-hidden="true">↗</span>';
    if (!$('success-screen').hidden) toast.classList.remove('show');
  }
});

$('again').addEventListener('click', () => {
  $('form').reset();
  $('count').textContent = '0 / 1000';
  Object.values(f).forEach(input => input.closest('.field')?.classList.remove('invalid'));
  $('success-screen').hidden = true;
  f.nama.focus();
});
