describe("httpbin tests", () => {
  const request = {
    method: "POST",
    url: "https://httpbin.org/post",
    failOnStatusCode: false,
  };

  it("response code should be 200", () => {
    cy.request(request).then((response) => {
      assert.equal(200, response.status);
    });
  });
  it("GET request with query parameters", () => {
    // zapytanie GET z parametrami
    const queryParams = {
      //tworzę zmienną -obiekt z parameytrami, które wyślę w zapytaniu GET
      name: "Ania",
      age: "25",
    };
    cy.request({
      method: "GET",
      url: "https://httpbin.org/get", //endpoint API
      qs: queryParams,
    }).then((response) => {
      expect(response.status).to.eq(200); //spr, czy status odpowiedzi to 200 czyli OK
      expect(response.body.args).to.deep.equal(queryParams); //sprawdzam, czy w odpowiedzi w polu args są parametry i czy równają się tym moim wysłanym
    });
  });
  it("POST request with body data", () => {
    //tu chcę się upewnić , ze API poprawnie przyjmuje i interpretujedane wysyłane metodą POST
    const postData = {
      name: "Natalia",
      job: "tester",
    };
    cy.request({
      method: "POST",
      url: "https://httpbin.org/post",
      body: postData, //ciałem zapytania będzie obiekt JSON
    }).then((response) => {
      expect(response.status).to.eq(200); //upewniamy się, że status to 200 czyli OK
      expect(response.body.json).to.deep.equal(postData); //w odpowiedzi serwer ma zwrócić w polu json to co my wysłaliśmy-equal
    });
  });
  //kolejny test to POST z nagłówkiem User-Agent, ze sprawdzeniem czy serwer go "odbił"
  it("POST request with USer-Agent header", () => {
    const userAgentValue = "MyTestAgent/1.0"; //niestandardowy nagłówek User-Agent, który zostanie wysłany do serwera
    cy.request({
      //wykonuje komende cypress z zapytaniem HTTP
      method: "POST", //przez metodę POST wysyłam dane do serwera
      url: "https://httpbin.org/post", //podaje adres pod który wysyłam zapytanie
      headers: {
        //tworzę obiekt headers z jedną parą klucz-wartość --> przez co w nagłówku HTTP znajdzie się ten właśnie User-Agent
        "User-Agent": userAgentValue,
      },
      body: {
        test: "header-check",
      },
    }).then((response) => {
      //w momencie kiedy przyjdzie odpowiedź ma się wykonać poniższa funkcja
      expect(response.status).to.eq(200);
      expect(response.body.headers["User-Agent"]).to.eq(userAgentValue); //sprawdzam, czy w odpowiedzi w polu body.headers["User-Agent"] jest dokładnie ten sam nagłówek, który był wysłany
    });
  });
  //test do wysłania niestandardowego nagłówka(inny niż User-Agent), aby sprawdzić czy w odpowiedzi serwer zwróci ten nagłówek
  it("GET request with custom header", () => {
    const customHeaderValue = "My value"; //wartość naszego niestandardowego nagłówka, który zostanie wysłany
    cy.request({
      //komenda wykonująca zapytanie cypress
      method: "GET", //metoda do pobierania danych z serwera
      url: "https://httpbin.org/headers", //Endpoint /headers zwróci nagłówek, który otrzyma serwer
      headers: {
        "X-Custom-Headers": customHeaderValue, //wysyłamy nagłówek HTTP o nazwie X-Custom-Header z wartością "My value"
      },
    }).then((response) => {
      //kiedy dostaniemy odpowiedź ma być zrobione to co w funkcji
      expect(response.status).to.eq(200);
      expect(response.body.headers["X-Custom-Headers"]).to.eq(
        customHeaderValue
      );
    });
  });
  //test sprawdzający czas trwania zapytania (request time)--> jak długo trwało zapytanie HTTP
  it("should measure request duration", () => {
    const start = Date.now(); //czas rozpoczęcia, Date.now() zwróci aktualny czas trwania w milisekundach, przed wysłaniem zapytania zostanie zapisany czas w momencie rozpoczęcia etstu
    cy.request("https://httpbin.org/delay/1").then((response) => {
      //endpoint czeka 1 s przed wysłaniem odpowiedzi
      const duration = Date.now() - start; // obliczanie czasu trwania zapytania; gdy dostaniemy odpowiedź wywołujemy znowu Date.now() i odejmujemy czas początkowy to da nam czas trwania w milisekundach
      expect(response.status).to.eq(200);
      expect(duration).to.be.greaterThan(1000); //sprawdzamy, czy trwało to więcej niż 1 sekundę
    });
  });
  //test z GET z jednym losowym parametrem
  it("GET with one random query parameter-name", () => {
    const randomNumber = Math.floor(Math.random() * 1000); //tworzona jest losowa liczba od 0 do 999
    const randomName = "User" + randomNumber; // do naszego User będzie dodana losowa liczba
    cy.request({
      method: "GET", //przez GET pobieramy z serwera
      url: "https://httpbin.org/get",
      qs: {
        name: randomName,
      }, //gdy serwer odpowie, przechodzimy do funkcji poniżej -then
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.args.name).to.eq(randomName);
    });
  });
  //test na przetestowanie metody HTTP DELETE - symulacja usunięcia czegoś
  it("DELETE should return status 200 -ok and echo data", () => {
    const dataToDelete = {
      //symulujemy dane do usunięcia (ID record jak i powód)
      id: "123",
      reason: "test-case",
    };
    cy.request({
      //wysyłamy żądanie DELETE z danymi
      method: "DELETE",
      url: "https://httpbin.org/delete",
      body: dataToDelete,
      headers: {
        "Content-Type": "application/JSON", //informujemy serwer, że dane w body są w formacie JSON
      },
    }).then((response) => {
      //odbieramy odpowiedź i sprawdzamy
      expect(response.status).to.eq(200); // oczekujemy kodu HTTP 200 jako ok
      expect(response.body.json).to.deep.equal(dataToDelete); //sprawdzamy, czy serwer odeśle nam nasze dane z body, czyli potwierdzi to co dostał
    });
  });
  //Test HTTP PUT (aktualizacja danych)
  it("PUT request should return updated data", () => {
    const updatedData = {
      // tworzymy dane, które wysyłamy jako zaktualizowane; zmieniamu dane 'użytkownika' na Natalia a wiek na 100
      name: "Natalia",
      age: 100,
    };
    cy.request({
      //wysyłamy zapytanie do API
      method: "PUT", //informujemy, że jest to zapytanie PUT
      url: "https://httpbin.org/put", //mówimy gdzie wysyłamy zapytanie
      body: updatedData, //to są nase dane do aktualizacji
      headers: {
        "Content-Type": "application/json", //mówimy serwerowi, ze wysyłamy dane jako JSON
      },
    }).then((response) => {
      //oczekujemy na odpowiedź a następnie sprwadzmy
      expect(response.status).to.eq(200); //sprawdzamy, czy status odpowiedzi to 200(ok)
      expect(response.body.json).to.deep.eq(updatedData); //sprawdzamy, czy odpowiedź zawiera nasze dane (echo z body)
    });
  });
  //Ostatni testz metodą HEAD (jak GET ale bez treści odpowiedzi body), powinien zwrócić status odpwoeidzi 200 oraz nagłówki
  it("HEAD should return status 200 and headers", () => {
    cy.request({
      method: "HEAD", //HEAD ma podobne działanie jak GET ale nie pobiera treści czyli body; serwer odpowiada tylko nagłówkami
      url: "https://httpbin.org/get",
    }).then((response) => {
      //gdy otrzymamy odpowiedź wykonujemy sprawdzenie
      expect(response.status).to.eq(200); //czy status odpowiedzi jest 200, ok-tzn., ze wszystko działą poprawnie
      expect(response.headers).to.have.property("content-type"); //sprawdzamy, czy w nagłówkach odpowiedzi znajduje się pole "content-type"
    });
  });
});
