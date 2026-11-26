# Spritfinder

App öffnen, offene Tankstelle mit aktuellem Preis antippen, in Google Maps losfahren.

- Findet dich per GPS, als Rückfall per PLZ oder Ort
- Zeigt nur geöffnete Tankstellen mit aktuellem Preis
- Sucht erst im Umkreis von 5 km und erweitert automatisch bis 25 km
- Sortiert nach Entfernung oder Preis, die günstigste ist markiert
- Ein Tipp startet die Route in Google Maps
- Keine Werbung, kein Konto, kein Tracking

## Einrichtung

Die Preise kommen über einen kleinen Cloudflare Worker (Ordner `proxy`). Er hält den [Tankerkönig](https://creativecommons.tankerkoenig.de) Schlüssel als Secret `TK_KEY` geheim und speichert Antworten fünf Minuten zwischen. Seine Adresse steht in `config.js`.

Alternativ lässt sich in der App unter „API Schlüssel“ ein eigener Schlüssel eintragen. Er bleibt nur auf dem Gerät, und die App fragt dann direkt bei Tankerkönig.

## Daten

Preise: [Tankerkönig](https://www.tankerkoenig.de), Daten der Markttransparenzstelle für Kraftstoffe (MTS-K), CC BY 4.0. Ortssuche: © OpenStreetMap Mitwirkende.
