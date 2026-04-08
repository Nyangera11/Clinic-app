
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
import notificationService from "./app/notification-service";

console.log("Starting React app...");

const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, creating React root...");
  const root = createRoot(container);
  root.render(<App />);
  console.log("React app rendered!");
}

// Initialize notification service
notificationService.init().then((granted) => {
  if (granted) {
    console.log('Notifications enabled');
  } else {    console.log('Notifications not enabled');
  }
});  