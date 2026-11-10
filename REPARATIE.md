# Reparatie conexiune si generare AI — 10 noiembrie 2026

## Ce am verificat
- Backendul public raspunde la GET https://friend-in-a-pocket.onrender.com/health cu {"ok":true}.
- Chatul public accepta WebSocket, dar returneaza system:error la generare.
- Modelul configurat anterior, anthropic/claude-3-haiku, nu apare in catalogul curent OpenRouter; endpointul sau de furnizori nu listeaza furnizori disponibili.
- Arhiva nu contine chei API sau fisiere .env. Nu am putut verifica cheia si creditul contului folosit in productie.

## Modificari
- Toate cele sase functii AI folosesc acum o configurare comuna OPENROUTER_MODEL, implicit anthropic/claude-haiku-4.5.
- Erorile pentru cheie lipsa/invalida, credit insuficient, model indisponibil si limitare sunt diferentiate in chat. Solicitarea AI are un timeout de 60 de secunde.
- Toate functiile frontend folosesc acelasi URL de backend. Implicit: localhost:8080 in dezvoltare, backendul Render existent in productie. WebSocket deriva ws/wss din acest URL.
- Inchiderea intentionata a unui socket nu mai declanseaza reconectarea vechii conexiuni. Indicatorul de raspuns se reseteaza la deconectare.

## Aplicarea pe site-ul public
1. Publica modificarile din server si client in repository-ul proiectului.
2. In Render > serviciul backend > Environment, verifica OPENROUTER_API_KEY si seteaza OPENROUTER_MODEL=anthropic/claude-haiku-4.5. Pastreaza cheia privata doar pe server. Modelul nou are tarife proprii; consulta pagina OpenRouter inainte de utilizare extinsa.
3. Redeploy backendul: build npm ci && npm run build; start npm start; root directory server.
4. In serviciul frontend, verifica NEXT_PUBLIC_API_BASE_URL=https://friend-in-a-pocket.onrender.com. Daca NEXT_PUBLIC_WS_URL exista, trebuie sa fie wss://friend-in-a-pocket.onrender.com; poate fi si eliminata pentru derivare automata.
5. Redeploy frontendul (variabilele NEXT_PUBLIC sunt incluse la build). Reincarca pagina si verifica un mesaj scurt in chat.
6. Daca generarea inca esueaza, mesajul nou si logurile Render vor permite distingerea unei probleme de cheie, credit sau furnizor.

Aceste modificari nu au fost publicate pe site-ul live din aceasta sesiune.

## Pornire locala
- server: copiaza .env.example in .env si completeaza OPENROUTER_API_KEY; ruleaza npm ci, apoi npm run dev.
- client: ruleaza npm ci, apoi npm run dev. Pentru backend local nu este necesara configurare suplimentara.
- Nu copia exemplul de configurare locala in mediul de productie.

## Validare
- Build TypeScript backend: trecut.
- Build Next.js productie: trecut. Generarea iconitei a emis un avertisment la descarcarea unui font din mediul de test.
- Verificate cu raspunsuri simulate: cheie lipsa, statusuri 401/402/403/404/429/503 si raspuns AI reusit.
- Verificate: URL-uri productie/dezvoltare, normalizarea URL-ului, inlocuirea si inchiderea intentionata a socketului.
- Un raspuns AI real cu noul model necesita cheia privata a aplicatiei, indisponibila in arhiva.
