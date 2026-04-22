# Notification-service SDK

Realtime in-app notification SDK। It will work any kind of frontend.

---

## Install

### npm (React / Vue / Angular)

```bash
npm install @rajoni/notification-service-sdk@latest
```

### CDN (Blade / Django / Rails)

```html
<script src="https://unpkg.com/@rajoni/notification-service-sdk@1.0.5/dist/sdk.min.js"></script>
```

---

## Use it

### React

```jsx
import NotificationService from "@rajoni/notification-service-sdk";
import { useEffect } from "react";
import toast from "react-hot-toast";

function App() {
  useEffect(() => {
    NotificationService.init({
      apiKey: "cust_abc123",
      userId: 6,
      onNotify: (data) => {
        toast(data.short_message);
      },
    });

    // page change disconnect
    return () => NotificationService.disconnect();
  }, []);

  return <div>Your App</div>;
}
```

### Vue

```vue
<script setup>
import NotificationService from "@rajoni/notification-service-sdk";
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  NotificationService.init({
    apiKey: "cust_abc123",
    userId: 6,
    onNotify: (data) => {
      alert(data.short_message);
    },
  });
});

onUnmounted(() => {
  NotificationService.disconnect();
});
</script>
```

### Laravel Blade

```html
@auth
<script src="https://notification-service/notification-service.min.js"></script>
<script>
  NotificationService.init({
      apiKey:   '{{ $customer->api_key }}',
      userId:   {{ auth()->id() }},
      onNotify: function(data) {
          alert(data.short_message)
      }
  })
</script>
@endauth
```

### Django Template

```html
{% if user.is_authenticated %}
<script src="https://unpkg.com/@rajoni/notification-service-sdk@1.0.5/dist/sdk.min.js"></script>
<script>
  NotificationService.init({
      apiKey:   '{{ api_key }}',
      userId:   {{ user.id }},
      onNotify: function(data) {
          alert(data.short_message)
      }
  })
</script>
{% endif %}
```

---

## onNotify

```js
onNotify: (data) => {
  data.short_message;
  data.type;
  data.id;
  data.raw;
};
```

---

## Build It

```bash
npm install
npm run build
```
