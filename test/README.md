# Separat testmiljö för Skogsrus v0.2

## Aktivering efter godkännande

Denna PR lägger endast till `test/`. Rotens index.html, README och produktionsspel ändras inte. GitHub Pages ska fortsatt använda **Deploy from a branch → main → / (root)**.

1. Granska PR:ens Files changed: samtliga filer ska ligga under `test/`.
2. Godkänn och slå ihop **denna testmiljö-PR** med main när du vill aktivera testadressen. Slå inte ihop v0.2-spelets ursprungliga PR för att aktivera testmiljön.
3. Vänta tills GitHub Pages ordinarie publicering för main är klar i Actions. Ingen ny workflow eller ändring av Pages behövs.
4. Öppna https://jonas-cumselius.github.io/skogsrus/test/ i Safari på iPhone.
5. Kontrollera också att https://jonas-cumselius.github.io/skogsrus/ fortfarande visar originalspelet.

Innan denna PR har slagits ihop publiceras inte testmappen. Ingen automatisk merge eller ny publiceringsautomation har lagts till. Efter en godkänd merge publicerar befintliga Pages-inställningar main inklusive testmappen.

## Innehåll och isolering

Källa: `feature/v0.2-pixel-skateboard`, commit `e6291ba86d634ad02ad8e369a5392238a7d22d59`.

Endast körfilerna index.html, style.css, engine.js och game.js kopieras till test/. HTML laddar CSS och skript från samma mapp med relativa sökvägar. Inga externa bibliotek, backend eller beroenden till rotens spelfiler behövs.

Den enda anpassningen av körfilerna är att game.js använder localStorage-nyckeln `skogsrus-test-best` i stället för `skogsrus-best`. Test och produktion ligger på samma origin och delar annars localStorage. Testrekord ska därför inte läsa eller skriva produktionsrekordet. Testrekord följer med mellan uppdateringar av testmappen.

## Uppdatera testmiljön manuellt

Skapa alltid en ny branch från uppdaterad main och en separat PR. Följande körs i en lokal klon med ren arbetskatalog. Ingen del av kommandona publicerar eller skriver direkt till main.

```sh
git fetch origin
git switch -c test/update-v02 origin/main
mkdir -p test
for file in index.html style.css engine.js game.js; do
  git show "origin/feature/v0.2-pixel-skateboard:$file" > "test/$file" || exit 1
done
python3 - <<'PY'
from pathlib import Path
path = Path("test/game.js")
source = path.read_text()
assert source.count("skogsrus-best") == 2, "Kontrollera lagringen manuellt om källkoden har ändrats"
path.write_text(source.replace("skogsrus-best", "skogsrus-test-best"))
PY
git diff --check
git diff --name-only
git diff -- test/
```

Stoppa om något steg misslyckas. Säkerställ att endast avsedda filer i test/ har ändrats. Granska om nya bilder, ljud eller andra beroenden har tillkommit i utvecklingsversionen; kopiera i så fall även dem under test/ och kontrollera relativa sökvägar. Uppdatera källcommit ovan med resultatet från `git rev-parse origin/feature/v0.2-pixel-skateboard`.

Testa lokalt från repots rot med `python3 -m http.server 8000` och öppna `http://localhost:8000/test/`. Verifiera också rotadressen. Gör därefter commit av endast test/, pusha uppdateringsbranchen och skapa en ny PR mot main. Granska och godkänn PR:en före merge. Använd aldrig merge av hela utvecklingsbranchen för att uppdatera enbart testmiljön.

## Test på iPhone

Efter godkänd merge och klar Pages-publicering:

- Öppna testadressen med avslutande snedstreck. Ladda om sidan; vid gamla filer, stäng fliken och öppna på nytt eller prova privat flik.
- Kontrollera pixelgrafik, touchhopp, paus/återuppta och Game Over/omstart.
- Samla fem mynt i följd: skateboard ska aktiveras i tio sekunder. Ett missat mynt före aktivering ska nollställa sviten.
- Pausa: skateboardens timer ska stå stilla. Mynt under läget ger poäng men bygger ingen ny svit.
- Första stenträffen förbrukar skyddet; nästa efter den korta immuniteten ger Game Over.
- Låt tiden gå ut: vanlig löpanimation, inget skydd och svit 0/5.
- Kontrollera att produktionsspelet på rotadressen fungerar och att dess rekord inte påverkas av testspel.

## Ta bort testmiljön

Skapa en ny branch från aktuell origin/main, ta bort enbart mappen `test/` med `git rm -r -- test`, och skapa en separat PR mot main. Granska att rotfilerna är oförändrade och slå ihop först efter godkännande.

När befintlig Pages-publicering har slutförts ska /skogsrus/test/ ge 404 och /skogsrus/ fungera som tidigare. Ändra inte Pages-inställningarna. Borttagning av filerna raderar inte sparade testrekord i besökarnas webbläsare.

## Verifiering av denna PR

- Alla nytillagda filer ligger under test/.
- Rotfilerna behåller samma Git-blobbar som main.
- Relativa referenser i test/index.html pekar på de tre inkluderade CSS-/JavaScript-filerna.
- engine.js och game.js har syntaxkontrollerats.
- Körfilerna är identiska med källcommit ovan, utom den separata rekordnyckeln.
- Inga workflows eller automatiska skrivningar till main läggs till.
- Verklig GitHub Pages-/Safari-kontroll görs efter godkänd merge; testadressen är inte aktiverad av denna PR ensam.
