type Role = "accountant" | "user" | "moderator"

class User {
  public constructor(
    public readonly identifier: string,
    public readonly email: string,
    public readonly administrator: boolean,
    public readonly role: Role,
    public readonly firstname: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) { }
}

class UserBuilder {
  public constructor(private readonly user: User = new User(
    crypto.randomUUID(),
    "",
    false,
    "user",
    "",
    new Date(),
    new Date()
  )) { }

  public withEmail(email: string) {
    return new UserBuilder(
      new User(
        this.user.identifier,
        email,
        this.user.administrator,
        this.user.role,
        this.user.firstname,
        this.user.createdAt,
        this.user.updatedAt
      )
    )
  }

  public isAdministrator() {
    return new UserBuilder(
      new User(
        this.user.identifier,
        this.user.email,
        true,
        this.user.role,
        this.user.firstname,
        this.user.createdAt,
        this.user.updatedAt
      )
    );
  }

  public build() {
    return this.user;
  }
}

const administrator = new UserBuilder()
  .withEmail("admin@esgi.fr")
  .isAdministrator();

const administrator2 = administrator
  .withEmail("administrator2@esgi.fr");

const administrator3 = administrator.withEmail("administrator3@esgi.fr");

console.log(administrator.build().email);
console.log(administrator2.build().email);
console.log(administrator3.build().email);

class HttpRequest {
  public constructor(
    public readonly domain: string,
    public readonly path: string,
    public readonly headers: Map<string, string>
  ) { }

  public request() {
    return fetch(this.domain + this.path, {
      headers: [...this.headers.entries()]
    })
  }
}

class HttpRequestBuilder {
  public constructor(private readonly httpRequest: HttpRequest = new HttpRequest(
    "",
    "",
    new Map(),
  )) { }

  public withHeader(name: string, value: string) {
    const newHeaders = new Map<string, string>()

    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.domain,
        this.httpRequest.path,
        this.httpRequest.headers,
      )
    )
  }

  public withPath(path: string) {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.domain,
        path,
        this.httpRequest.headers,
      )
    );
  }

  public build() {
    return this.httpRequest
  }
}

const baseRequest = new HttpRequestBuilder(new HttpRequest(
  "api.esgi.fr",
  "",
  new Map([["Authorization", "Bearer ....."]])
))

const firstRequest = baseRequest.withPath("/users").build();
const secondRequest = baseRequest.withPath("/invoices").build();

firstRequest.request();