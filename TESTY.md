# TRIKI — poprawki i testy, 6 października 2026

## Zmiany
- Panel pokazuje 50 wpisów na stronę, zachowując pełne statystyki i poprawne miejsca przy remisach między stronami.
- Usunięty błąd przekroczenia stosu przy dużej liczbie wyników.
- Panel i TV korzystają ze strumienia Firebase: po początkowym pobraniu otrzymują zmienione wpisy. Zmiany są grupowane do aktualizacji co 250 ms, aby seria komunikatów nie wymuszała osobnego przeliczenia dla każdego wpisu.
- Odczyty cykliczne pozostają trybem awaryjnym, gdy strumień nie działa. Początkowe pobranie i ponowne połączenie nadal mogą obejmować całą historię wybranej gry.
- Zapis nie czeka na ponowne pobranie całej historii, kiedy działa strumień.
- Zachowane istniejące grafiki, dane, identyfikatory gier.

## Firebase — rzeczywisty test
Test odbył się w osobnej gałęzi __load_tests, bez zapisywania do wyników gier.

| Próby zapisu | Równoległe żądania | Sukcesy | Błędy | Mediana zapisu | 95. percentyl |
|---|---|---|---|---|---|
| 20 | 2 | 20 | 0 | 7177 ms | 8816 ms |
| 100 | 10 | 100 | 0 | 7740 ms | 9900 ms |
| 300 | 30 | 300 | 0 | 7086 ms | 8508 ms |

- Odczyt kontrolny: 420 wpisów, oczekiwano 420.
- Znaczniki czasu nadane przez Firebase: poprawne liczby.
- Pięć ponowień pod tym samym identyfikatorem: bez zwiększenia liczby wpisów.
- Strumień: HTTP 200, 421 komunikatów (początkowy stan i 420 zmian).
- Klient testowy strumienia zakończył oczekiwanie po 20 s bez nowego komunikatu. Aplikacja używa EventSource z ponawianiem połączenia; ponowne połączenie przetestowano lokalnie.
- Usunięto wyłącznie gałąź testową; odczyt po usunięciu potwierdził null.
- Identyfikator próby: run_b02bbd6598774b2eac917eb618fb205d.

Opóźnienia zmierzono z tego środowiska testowego, łącznie z połączeniem sieciowym. Nie rozstrzygają, czy opóźnienie powstaje w sieci czy w usłudze. Nie jest to test maksymalnej przepustowości Firebase. Testowano maksymalnie 30 równoległych żądań. Reguł dostępu Firebase nie zmieniano; zapytanie indeksowane według score zwróciło informację o braku indeksu. Strumień nie wymaga tego indeksu.

## Testy kodu po poprawkach
- 150 000 wyników: panel i TV bez błędu stosu; 50 wierszy panelu, 10 pozycji TV.
- Przy 50 000 wyników przygotowanie HTML tabeli panelu: około 61 ms (wcześniej około 2131 ms); przy 150 000: około 218 ms. To pomiar JavaScript, bez układu i malowania strony przez przeglądarkę.
- 50 000 meczów Snake 1v1: poprawne zliczenie zwycięstw 1000 graczy.
- Symulacja 100 klientów po 100 zapisów: 10 000 unikalnych wpisów.
- 100 jednoczesnych wywołań przycisku zapisu: jedno żądanie.
- Utrata potwierdzenia i ponowienie: ten sam identyfikator wpisu.
- 10 000 komunikatów strumienia w serii: poprawny stan, wspólna aktualizacja widoku.
- Usunięcie lidera, zmiana gry i opóźnione odpowiedzi: poprawny wynik.
- Aktualizacje put, patch (również zagnieżdżone), usuwanie wpisów, reset stanu, zatrzymanie starego strumienia: poprawne.
- Remisy na granicach stron i ostatnia strona przy 150 000 wpisach: poprawne.
- Przy aktywnym strumieniu nie są wykonywane pełne odczyty cykliczne.

Nie wykonano testu renderowania w prawdziwej przeglądarce: lokalny Chromium nie był dostępny, a pobranie go nie powiodło się. Nie wykonano testu na docelowym telewizorze ani w sieci wydarzenia.

## Wgranie
Podmień zawartość strony na GitHubie, w tym nowy plik realtime.js, oraz index.html, app.js, style.css, tv.html, tv.js, tv.css i folder assets. Wgraj również excel.js i zachowaj config.js z tej paczki. Po wdrożeniu odśwież panel i TV. Zmiany w tej paczce nie zostały automatycznie opublikowane na GitHubie.

## Raport Excel — aktualizacja
Eksport XLSX: Podsumowanie + 10 osobnych arkuszy gier (także pustych). Nagłówki z filtrowaniem i zamrożonym pierwszym wierszem, punkty jako liczby. Czas zapisu w Europe/Warsaw z uwzględnieniem czasu letniego i zimowego. Wpisy przypominające formuły zapisane jako tekst.
Sprawdzone niezależnym czytnikiem openpyxl: nazwy i liczba arkuszy, polskie znaki, remisy, typy komórek, puste gry, godziny oraz pełny eksport 150 000 wpisów. Testowany duży plik miał około 58 MB, a przygotowanie zajęło 2,8 s w środowisku Node; nie jest to pomiar na telefonie użytkownika.
