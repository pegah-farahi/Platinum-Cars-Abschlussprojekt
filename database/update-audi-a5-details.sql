USE platinum_cars;

-- Run after schema.sql and seed-vehicles.sql. Source: supplied Audi A5 listing screenshots.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS technical_details JSON NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS financing_example JSON NULL;

UPDATE vehicles
SET price_eur = 13490,
    transmission = 'Automatik',
    exterior_color = 'Blau Metallic',
    description = 'Audi A5 Sportback 2.0 TFSI in Mondscheinblau mit S-Line-Ausstattung und schwarzem Leder. Laut Inserat scheckheftgepflegt und aus Nichtraucherhand. Besichtigung nach vorheriger Absprache.',
    equipment = CONCAT_WS(CHAR(10),
      'Abgedunkelte Scheiben', 'ABS', 'Armlehne', 'Bluetooth', 'Bordcomputer',
      'CD-Spieler', 'Elektrische Fensterheber', 'Elektrische Außenspiegel',
      'Anklappbare Außenspiegel', 'Elektrische Sitzeinstellung mit Memory',
      'Elektronische Wegfahrsperre', 'ESP', 'Freisprecheinrichtung', 'Frontantrieb',
      'Gepäckraumabtrennung', 'Geschwindigkeitsbegrenzer', 'Automatisch abblendender Innenspiegel',
      'Isofix', 'Kurvenlicht', 'Lederlenkrad', 'LED-Tagfahrlicht', 'Leichtmetallfelgen',
      'Lichtsensor', 'Multifunktionslenkrad', 'MMI Navigation Plus', 'Nebelscheinwerfer',
      'Notbremsassistent', 'Raucherpaket', 'Regensensor', 'Reifendruckkontrolle', 'Reserverad',
      'Scheinwerferreinigung', 'Keyless', 'Servolenkung', 'Sitzheizung', 'Soundsystem',
      'Sportpaket', 'Sportsitze', 'Sprachsteuerung', 'Start/Stopp-Automatik',
      'Tempomat', 'Traktionskontrolle', 'Radio', 'USB', 'Winterreifen', 'Xenonscheinwerfer', 'Zentralverriegelung'),
    technical_details = JSON_OBJECT(
      'Fahrzeugzustand', 'Gebrauchtfahrzeug', 'Kategorie', 'Limousine',
      'Baureihe', '8T', 'Ausstattungslinie', 'S-Line', 'Herkunft', 'Deutsche Ausführung',
      'Hubraum', '1.984 cm³', 'Antriebsart', 'Verbrennungsmotor',
      'Verbrauch (kombiniert)', '7,2 l/100 km', 'CO₂-Emissionen (kombiniert)', '169 g/km',
      'Sitzplätze', '4', 'Türen', '4/5', 'Schadstoffklasse', 'Euro 5', 'Umweltplakette', '4 (Grün)',
      'Fahrzeughalter', '2', 'HU', 'Neu laut Inserat', 'Klimatisierung', '2-Zonen-Klimaautomatik',
      'Einparkhilfe', 'Vorne und hinten', 'Airbags', 'Front-, Seiten- und weitere Airbags',
      'Herstellerfarbe', 'Mondscheinblau', 'Innenausstattung', 'Vollleder, Schwarz',
      'Anhängelast gebremst', '1.500 kg', 'Anhängelast ungebremst', '750 kg',
      'Zylinder', '4', 'Tankgröße', '63 l'
    ),
    financing_example = JSON_OBJECT(
      'recordedOn', '04.11.2026',
      'monthlyRate', '144 €',
      'terms', JSON_OBJECT(
        'Fahrzeugpreis im Beispiel', '13.490 €',
        'Bank', 'Openbank Deutschland AG',
        'Darlehensvermittler', 'CHECK24 GmbH',
        'Anzahlung', '2.698,00 €',
        'Schlussrate', '4.451,70 €',
        'Nettodarlehensbetrag', '10.792,00 €',
        'Fester Sollzins p.a.', '5,41 %',
        'Effektiver Jahreszins', '5,55 %',
        'Gesamtbetrag', '12.889,80 €',
        'Laufzeit', '60 Monate'
      )
    )
WHERE id = 4 AND brand = 'Audi' AND model = 'A5 Sportback 2.0 TFSI';
