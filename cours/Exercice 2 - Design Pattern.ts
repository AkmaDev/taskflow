interface HttpRequestInterface {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
}

type Method = "GET" | "POST" | "PUT" | "DELETE"

class HttpRequest implements HttpRequestInterface {
  public constructor(
    public readonly method: Method,
    public readonly url: string,
    public readonly headers: Record<string, string>,
    public readonly body?: any,
    public readonly timeout?: number | undefined,
  ) { }

  public request() {
    const abortController = new AbortController();

    setTimeout(() => {
      abortController.abort();
    }, this.timeout ?? 0 * 1000);

    return fetch(
      this.url,
      {
        method: this.method,
        headers: this.headers,
        body: JSON.stringify(this.body),
        signal: abortController.signal
      }
    );
  }
}

class HttpRequestBuilder {
  public constructor(
    private readonly httpRequest: HttpRequest = new HttpRequest(
      "GET",
      "api.esgi.fr",
      {}
    )
  ) { }

  public static get(): HttpRequestBuilder {
    return new HttpRequestBuilder();
  }

  public static post(): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        "POST",
        "api.esgi.fr",
        {}
      )
    );
  }

  public static delete(): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        "DELETE",
        "api.esgi.fr",
        {}
      )
    );
  }

  public static patch(): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        "PUT",
        "api.esgi.fr",
        {}
      )
    );
  }

  public withMethod(method: Method): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        method,
        this.httpRequest.url,
        this.httpRequest.headers,
      ),
    );
  }

  public withHeader(name: string, value: string): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.method,
        this.httpRequest.url,
        {
          ...this.httpRequest.headers,
          [name]: value
        }
      ),
    );
  }

  public withBody(body: any): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.method,
        this.httpRequest.url,
        this.httpRequest.headers,
        body
      )
    );
  }

  public withoutBody(): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.method,
        this.httpRequest.url,
        this.httpRequest.headers,
        null
      )
    );
  }

  public withTimeout(timeout: number): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.method,
        this.httpRequest.url,
        this.httpRequest.headers,
        this.httpRequest.body,
        timeout,
      )
    )
  }

  public withoutTimeout(): HttpRequestBuilder {
    return new HttpRequestBuilder(
      new HttpRequest(
        this.httpRequest.method,
        this.httpRequest.url,
        this.httpRequest.headers,
        this.httpRequest.body,
        undefined,
      )
    )
  }

  public build() {
    return this.httpRequest;
  }
}

// TODO: Le builder doit permettre :
// [x] Définir la méthode et l'URL avec withMethod(), withUrl()
// [x] Ajouter des headers avec withHeader()
// [x] Ajouter un body avec withBody() et withoutBody()
// [x] Définir un timeout avec withTimeout()
// [x] Méthodes raccourcies : get(), post(), put(), delete()
// - Construire la requête avec build()

// Exemple d'utilisation attendue :
// const request = new HttpRequestBuilder()
//   .get('https://api.example.com/users')
//   .withHeader('Authorization', 'Bearer token123')
//   .withTimeout(10000)
//   .build();

const createUser = HttpRequestBuilder
  .post()
  .withBody({ email: "email@domain.com" })

const replaceUser = createUser.withMethod("PUT")

const getUserDetail = replaceUser.withMethod("GET").withoutBody();

replaceUser.build().request()
createUser.build().request().then().catch().finally();