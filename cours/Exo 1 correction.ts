export class NotificationFactory {
  public constructor(public readonly type: "sms" | "email" | "console") { }

  public sendRegisterNotification(user: User) {
    switch (this.type) {
      case "email":
        return new EmailService("anairi@esgi.fr", user.email);

      case "sms":
        return new SMSService(user.phone);

      case "console":
        return new ConsoleNotificationService();
    }
  }
}

class ConsoleNotificationService {
  public sendRegistrationEmail(user: User) {
    console.log(`Faux email envoyé à l'utilisateur ${user.email} (${user.phone})`);
  }
}

class EmailService {
  public constructor(
    public readonly from: string,
    public readonly to: string,
  ) { }
}

class SMSService {
  public constructor(
    public readonly phone: string
  ) { }
}

interface User {
  phone: string
  email: string
}

const user: User = { email: "student@esgi.fr", phone: "0102030405" };

const notificationFactory = new NotificationFactory("console");
const smsNotificationFactory = new NotificationFactory("sms");
const emailNotificationFactory = new NotificationFactory("email");

export class RegisterUser {
  public constructor(public readonly notificationFactory: NotificationFactory) { }

  public execute(user: User) {
    if (user.email !== "...") {
      throw new Error(".... pas bien !");
    }
    this.notificationFactory.sendRegisterNotification(user)
  }
}

const usecase = new RegisterUser(emailNotificationFactory);

usecase.execute({
  email: "",
  phone: ""
});