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

## Samodzielny test w przeglądarce
Po wgraniu całej paczki otwórz test.html. Wybierz 100/500/1000/5000 nowych wpisów, 1/5/10/20 równoległych żądań oraz jedną grę lub wszystkie gry. Otwórz TV testowe i uruchom test. Panel testowy ma tę samą paginację i eksport Excel co wersja wydarzenia. Każda karta testu korzysta z identyfikatora browser_UUID w __load_tests; wpisy nie są dodawane do gier produkcyjnych. Nowe uruchomienie dopisuje partię. Limit sesji: 10 000 wpisów. Przycisk zatrzymania kończy nowe wysyłki i czeka na już wysłane. Po 10 błędach test zatrzymuje dalsze wysyłanie. Odczyt kontrolny porównuje identyfikatory i wartości wpisów. Usuwanie dotyczy wyłącznie bieżącej sesji.
Testy automatyczne strony testowej z transportem symulowanym: wszystkie 10 gier, 100 zapisów, maksymalna równoległość 10, utracone potwierdzenia, odczyt kontrolny, izolacja ścieżek i sprzątanie — zaliczone. Nie uruchamiano kolejnego obciążenia prawdziwego Firebase podczas dodawania tej strony.

## Najlepszy wynik i edycja — 8 października 2026
Panel i TV pokazują najlepszą próbę każdego gracza w obrębie danej gry. Tożsamość według ksywki: Unicode NFC, ignorowanie wielkości liter i zbędnych spacji. Wyższy wynik zastępuje poprzedni wyłącznie w widoku rankingu. Niższe i równe próby pozostają w bazie oraz Excelu. Przy równych najlepszych próbach wybierana jest wcześniejsza, a następnie stabilny identyfikator. Snake 1v1 nadal zlicza zwycięstwa z meczów.
Przycisk Historia prób pozwala zobaczyć i edytować także próby nieobecne w rankingu. Edycja poprawia wybrany wpis (nie wszystkie wpisy o tej ksywce). Obniżenie rekordu może spowodować powrót innej, wyższej próby. Zmiana ksywki przelicza grupy graczy. Czas oryginalnej próby pozostaje zachowany. Korekta jest zapisywana atomowo z informacją przed/po; Excel zawiera dodatkowy arkusz Historia korekt, gdy korekty istnieją.
Zapis używa wersji ETag i If-Match: równoczesna zmiana lub usunięcie wpisu nie jest cicho nadpisywane. Ponowienie korekty po utracie potwierdzenia rozpoznaje identyfikator już zapisanej korekty.
Testy kodu z symulowanym transportem: duplikaty, normalizacja ksywek, niższe i równe wyniki, obniżanie rekordu, zmiana ksywki, zachowanie wszystkich prób w raporcie, zliczanie meczów, konflikt przed zapisem i HTTP 412, utrata odpowiedzi i ponowienie bez duplikatu korekty — zaliczone. Nie modyfikowano prawdziwych wyników podczas tej aktualizacji.
Do wdrożenia wgraj pełną paczkę, w tym nowy ranking.js; odśwież zarówno panel, jak i TV. Nie ma migracji ani usuwania historycznych prób.
