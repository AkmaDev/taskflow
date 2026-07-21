// ===== EXERCICES : BUILDER PATTERN =====

// Exercice : Builder pour une Request HTTP
// Créez un Builder pour construire des requêtes HTTP en utilisant la convention withName/withoutName.

interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
}

// TODO: Le builder doit permettre :
// - Définir la méthode et l'URL avec withMethod(), withUrl()
// - Ajouter des headers avec withHeader()
// - Ajouter un body avec withBody() et withoutBody()
// - Définir un timeout avec withTimeout()
// - Méthodes raccourcies : get(), post(), put(), delete()
// - Construire la requête avec build()

// Exemple d'utilisation attendue :
// const request = new HttpRequestBuilder()
//   .get('https://api.example.com/users')
//   .withHeader('Authorization', 'Bearer token123')
//   .withTimeout(10000)
//   .build();
