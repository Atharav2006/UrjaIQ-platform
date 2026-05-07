from database import SessionLocal
from models import Tariff

def seed_tariffs():
    db = SessionLocal()
    
    # Check if tariffs already exist to avoid duplicates
    if db.query(Tariff).first():
        print("Tariffs already exist. Skipping seeding.")
        db.close()
        return

    tariffs = [
        # Gujarat - Default
        Tariff(state="Gujarat", provider="default", year=2026, slab_limit="50", rate=3.0, fixed_charge=50, tax_percent=5),
        Tariff(state="Gujarat", provider="default", year=2026, slab_limit="100", rate=4.0, fixed_charge=50, tax_percent=5),
        Tariff(state="Gujarat", provider="default", year=2026, slab_limit="200", rate=5.2, fixed_charge=50, tax_percent=5),
        Tariff(state="Gujarat", provider="default", year=2026, slab_limit="rest", rate=6.0, fixed_charge=50, tax_percent=5),
        
        # Gujarat - Torrent Power
        Tariff(state="Gujarat", provider="Torrent", year=2026, slab_limit="50", rate=3.2, fixed_charge=60, tax_percent=5),
        Tariff(state="Gujarat", provider="Torrent", year=2026, slab_limit="100", rate=4.2, fixed_charge=60, tax_percent=5),
        Tariff(state="Gujarat", provider="Torrent", year=2026, slab_limit="200", rate=5.5, fixed_charge=60, tax_percent=5),
        Tariff(state="Gujarat", provider="Torrent", year=2026, slab_limit="rest", rate=6.5, fixed_charge=60, tax_percent=5),

        # Maharashtra - MSEDCL
        Tariff(state="Maharashtra", provider="MSEDCL", year=2026, slab_limit="100", rate=4.0, fixed_charge=80, tax_percent=7),
        Tariff(state="Maharashtra", provider="MSEDCL", year=2026, slab_limit="300", rate=6.0, fixed_charge=80, tax_percent=7),
        Tariff(state="Maharashtra", provider="MSEDCL", year=2026, slab_limit="500", rate=8.0, fixed_charge=80, tax_percent=7),
        Tariff(state="Maharashtra", provider="MSEDCL", year=2026, slab_limit="rest", rate=10.0, fixed_charge=80, tax_percent=7),

        # Maharashtra - Adani
        Tariff(state="Maharashtra", provider="Adani", year=2026, slab_limit="100", rate=5.0, fixed_charge=100, tax_percent=7),
        Tariff(state="Maharashtra", provider="Adani", year=2026, slab_limit="300", rate=7.0, fixed_charge=100, tax_percent=7),
        Tariff(state="Maharashtra", provider="Adani", year=2026, slab_limit="500", rate=9.0, fixed_charge=100, tax_percent=7),
        Tariff(state="Maharashtra", provider="Adani", year=2026, slab_limit="rest", rate=11.0, fixed_charge=100, tax_percent=7),

        # Delhi - BYPL
        Tariff(state="Delhi", provider="BYPL", year=2026, slab_limit="200", rate=3.1, fixed_charge=40, tax_percent=5),
        Tariff(state="Delhi", provider="BYPL", year=2026, slab_limit="400", rate=4.6, fixed_charge=40, tax_percent=5),
        Tariff(state="Delhi", provider="BYPL", year=2026, slab_limit="800", rate=6.6, fixed_charge=40, tax_percent=5),
        Tariff(state="Delhi", provider="BYPL", year=2026, slab_limit="rest", rate=8.1, fixed_charge=40, tax_percent=5),

        # Himachal Pradesh - HPSEB
        Tariff(state="Himachal", provider="HPSEB", year=2026, slab_limit="125", rate=4.0, fixed_charge=30, tax_percent=2),
        Tariff(state="Himachal", provider="HPSEB", year=2026, slab_limit="300", rate=5.5, fixed_charge=30, tax_percent=2),
        Tariff(state="Himachal", provider="HPSEB", year=2026, slab_limit="500", rate=6.5, fixed_charge=30, tax_percent=2),
        Tariff(state="Himachal", provider="HPSEB", year=2026, slab_limit="rest", rate=7.0, fixed_charge=30, tax_percent=2),

        # Uttarakhand - UPCL
        Tariff(state="Uttarakhand", provider="UPCL", year=2026, slab_limit="100", rate=3.5, fixed_charge=35, tax_percent=3),
        Tariff(state="Uttarakhand", provider="UPCL", year=2026, slab_limit="200", rate=5.0, fixed_charge=35, tax_percent=3),
        Tariff(state="Uttarakhand", provider="UPCL", year=2026, slab_limit="400", rate=6.5, fixed_charge=35, tax_percent=3),
        Tariff(state="Uttarakhand", provider="UPCL", year=2026, slab_limit="rest", rate=7.5, fixed_charge=35, tax_percent=3),
    ]

    db.add_all(tariffs)
    db.commit()
    print(f"Seeded {len(tariffs)} tariff slabs.")
    db.close()

if __name__ == "__main__":
    seed_tariffs()
