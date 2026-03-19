import eventBus from "./eventBus.js";

eventBus.on("student.created", (student) => {
  console.log("Notification service:");
  console.log("Welcome email sent to", student.email);
});
