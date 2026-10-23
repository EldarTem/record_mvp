# Моя очередь

Vue 3 + Vite фронтенд. Поддерживает PWA и локальный HTTPS для теста на телефоне.

## Dev

```bash
npm install
npm run dev
```

## HTTPS на телефоне (PWA)

```bash
npm run dev:https
```

Скрипт создаст самоподписанный сертификат в `.certs/` и поднимет Vite по HTTPS в локальной сети.

1. Телефон и компьютер в одной Wi‑Fi сети.
2. Открой в браузере URL вида `https://<LAN-IP>:5173/` (он появится в терминале).
3. Прими предупреждение о сертификате (Advanced → Proceed / «Продолжить»).
4. Установи приложение / «На экран Домой».

Если сменилась сеть или IP:

```bash
npm run certs -- --force
```

Сертификат для установки на устройство: `https://<LAN-IP>:5173/dev-cert.pem`

**iOS:** установи сертификат, затем включи доверие в  
Settings → General → About → Certificate Trust Settings.

## Другие команды

```bash
npm run certs          # только сгенерировать сертификаты
npm run build          # production-сборка
npm run preview:https  # HTTPS preview собранного билда
```
