# Skogsrus v0.2 — Pixel Art & Skateboard Edition

Ett mobilspel i HTML5 Canvas och vanlig JavaScript. Inga externa bibliotek, byggsteg eller backend. Publiceras som statiska filer via GitHub Pages.

## Spela

Tryck på spelplanen eller knappen för att starta och hoppa. Samla fem mynt i följd för tio sekunder skateboard. Ett missat mynt bryter sviten när det passerar räven. Mynt på brädan ger poäng utan att bygga nästa svit.

Brädan skyddar mot en sten. Träffen tar bort stenen och ger 0,75 sekunders immunitet. Därefter är nästa stenkollision Game Over. När tiden går ut försvinner skyddet och sviten återställs. Pausknappen, P eller Escape pausar. Byte av flik eller app pausar automatiskt; återuppta manuellt.

Originalets hoppfysik, hastighetskurva, slumpmässiga hinderfrekvens och poängformel är bevarade. Rekord använder samma localStorage-nyckel `skogsrus-best`. Blockerad lagring hindrar inte spel. Pixelgrafiken ritas på ett fast 360 × 480-rutnät med heltalskoordinater och CSS `image-rendering: pixelated`, utan utjämning vid skalning på Retina.

## Testa på iPhone före publicering

GitHub Pages på main visar fortfarande den publicerade versionen. Ändra inte Pages-inställningarna för att testa branchen.

1. Hämta branchen på en dator:
   ```sh
   git clone --branch feature/v0.2-pixel-skateboard https://github.com/jonas-cumselius/skogsrus.git
   cd skogsrus
   python3 -m http.server 8000 --bind 0.0.0.0
   ```
2. Anslut dator och iPhone till samma Wi-Fi. Ta reda på datorns lokala IP-adress i nätverksinställningarna.
3. Öppna `http://DATORNS-IP:8000` i Safari på iPhone. Tillåt lokal nätverksåtkomst i datorns brandvägg vid behov. Använd inte datorns `localhost` på telefonen.
4. Kontrollera start, touchhopp, landning och fyra löpsteg. Prova både stående och liggande läge samt smal skärm.
5. Samla några mynt, missa ett: sviten ska bli 0/5. Samla fem i rad: synlig bräda med hjul, timer 10 sekunder och skydd kvar.
6. Hoppa på brädan. Samla fler mynt: poängen ökar men ingen ny svit byggs. Pausa ett par sekunder: återstående tid ska stå stilla. Prova även att byta app och återvända.
7. Träffa en sten: skyddet förbrukas, räven blinkar kort och spelet fortsätter. Träffa nästa sten efter blinkningen: Game Over.
8. Låt brädan löpa ut i en ny runda: vanlig löpanimation, 0/5 och inget skydd. Kontrollera omstart och att rekordet finns kvar efter omladdning. Lokal testadress har separat lagring från GitHub Pages.

## Automatiska kontroller

Node.js behövs endast för utvecklingstester:

```sh
node tests/engine.test.cjs
node tests/ui.test.cjs
node --check engine.js
node --check game.js
```

Tester täcker myntsvit, missat mynt, timer/utgång, paus, skydd, immunitet, andra kollisionen, omstart, ursprunglig hoppfysik och UI/rekordlagring.

Automatiska logik- och UI-tester är körda. UI-testet använder simulerad DOM; en verklig webbläsar-/iPhone-kontroll återstår eftersom arbetsmiljön blockerade Chromiums start och lokal HTTP-server. Pixelutseende och Safari ska därför verifieras med checklistan ovan före merge.

## Publicering

Granska och testa pull requesten. Slå endast ihop med main efter uttryckligt godkännande. Behåll befintlig GitHub Pages-konfiguration. Filerna `index.html`, `style.css`, `engine.js` och `game.js` använder relativa sökvägar och fungerar under `/skogsrus/`.
