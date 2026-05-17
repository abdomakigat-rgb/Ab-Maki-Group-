/**
 * Ab Maki Empire - Service Worker (v2.1)
 * تم تحسين المسارات لضمان التوافق مع GitHub Pages
 */

const CACHE_NAME = 'AbMaki-Empire-v2';

// القائمة الأساسية للملفات المطلوب تخزينها ليعمل الموقع بدون إنترنت
const ASSETS = [
  './',                  // الصفحة الرئيسية
  './index.html',        // ملف HTML
  './manifest.json',     // ملف المانيفست
  'https://i.ibb.co/pBTrM2QM/image.png', // أيقونة التطبيق
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // الأيقونات الخارجية
];

// 1. مرحلة التثبيت (Install): سحب وتخزين الملفات في الكاش
self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل السيرفس وركر الجديد فوراً دون انتظار إغلاق الصفحات المفتوحة
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Ab Maki Cache: جاري تأمين ملفات الإمبراطورية...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. مرحلة التفعيل (Activate): تنظيف الملفات القديمة من الإصدارات السابقة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  // السيطرة على العميل فوراً بمجرد التفعيل
  self.clients.claim();
  console.log('Ab Maki: السيرفس وركر جاهز للسيطرة على النظام!');
});

// 3. استراتيجية جلب البيانات (Network First): الشبكة أولاً ثم الكاش
// هذه الطريقة تضمن حذف الكاش القديم واستبداله بالجديد عند كل ريفريش
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // إذا نجح جلب الملف من الشبكة، قم بتخزين نسخة محدثة في الكاش
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // في حال فشل الشبكة (أوفلاين)، استخدم الكاش
        return caches.match(event.request);
      })
  );
});
