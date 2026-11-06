# Local database setup

Import `schema.sql`, `seed-vehicles.sql`, `service-requests.sql` and `update-audi-a5-details.sql` into the local MariaDB database, in that order. The Audi A5 update adds the JSON columns used by detailed vehicle pages.

Then, from the project root, run:

```powershell
php backend/import-selected-vehicles.php
```

This imports the verified Audi A3, Mercedes CLA and Ford Focus details and the galleries for these vehicles and Audi A5. All image files must exist in `frontend/public/images/vehicles` before import. The importer checks vehicle identities, backs up the affected records to ignored `tmp/vehicle-backups`, and updates records inside a transaction. It preserves vehicle IDs and request records and can be run repeatedly without adding duplicate images.

`selected-vehicle-content.json` contains the dated source snapshot and exact photo URLs. It is demonstration inventory, not a live inventory feed. The Mercedes source is archived. Missing details are omitted rather than inferred; the archived Mercedes listing does not provide a complete financing example.
