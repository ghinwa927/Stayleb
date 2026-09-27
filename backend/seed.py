"""StayLeb seed for Supabase PostgreSQL.

Install: python -m pip install Faker "psycopg[binary]" python-dotenv
Place this file in backend beside .env. Create the application's public tables
with your existing migrations/schema setup first. This script does not create,
delete, or alter tables, and does not update existing records.

Connection: SEED_DATABASE_URL overrides DATABASE_URL from the environment/.env.
Use a Supabase PostgreSQL connection URL from Connect (Session pooler works on
IPv4). URLs with postgresql+psycopg/psycopg2 prefixes are accepted too.
Use the database password, not a Supabase API key. Percent-encode special
characters in URL passwords. TLS is required; optional SEED_SSL_ROOT_CERT
enables certificate and hostname verification.

Set SEED_PASSWORD_HASH to an encoded hash from the app's password hasher.
All demo accounts use the password corresponding to that hash.
python seed_stayleb.py --dry-run
python seed_stayleb.py
python seed_stayleb.py --seed-key stayleb-demo-v4 --dry-run

A duplicate seed key is rejected. A different key creates NEW accounts and
properties, not updates to an existing dataset. Default key: stayleb-demo-v3.
One transaction; dry-run rolls back all inserts, although sequence IDs can
advance. Existing amenities/rules/settings are reused.

Defaults: 5 owners, 30 clients, 20 properties, 160 bookings, 60 image rows.
Each owner gets 6 pending, 6 confirmed, 6 rejected, 6 cancelled, 8 completed
bookings and 3 visible, 3 flagged, 2 removed reviews. Pending bookings expire
30 minutes after seed execution, so the app may later expire them.
Each property receives 3 distinct URLs from the supplied 17-image pool.
URLs are reused across properties. ImageKit IDs remain NULL.

Cash payments only; no Stripe calls. Cancelled examples are unpaid, with no
refund or cancellation fee. Reviews and settlements use completed paid stays.
Optional auth fixtures are expired dummy hashes, never working sessions.
No connection is opened on import.
"""
from __future__ import annotations
import argparse
from collections import Counter
from dataclasses import dataclass, fields, replace
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import os
import random
import re
from faker import Faker
@dataclass(frozen=True)
class SeedConfig:
    seed_key: str = 'stayleb-demo-v3'
    random_seed: int = 42
    owners: int = 5
    clients: int = 30
    properties_per_owner: int = 4
    bookings_per_property: int = 8
    images_per_property: int = 3
    amenities_per_property: int = 5
    favorites_per_client: int = 3
    expired_auth_rows_per_client: int = 0
# 0 or 1; OTP user_id is unique.
    commission_percentage: Decimal = Decimal('12.00')
CONFIG = SeedConfig()
IMAGE_URLS = (
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/d7dd8f5e-77ee-473e-a249-f3d973003d85_zgTBg2Lsu.jpg?updatedAt=1790325684455',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/036caca2-313f-483d-b386-0531c7f66f0e_wOWzNaEqc.jpg?updatedAt=1790325678070',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/f6f3bf55-44de-4945-a7d2-ecc7baa69a64_WBrfQvSMx.jpg?updatedAt=1790325670217',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/cbddac5f-4848-415e-86c5-01a1b3eb00fb_mqDsykNNmK.jpg?updatedAt=1790325663171',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/f5056729-f456-4e5a-b8e6-75c4a7f84bbb_3Ij3aYpzV.jpg?updatedAt=1790325657807',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/bfd243ad-93bf-4a92-beee-73024377a422_aC-2qPIUm.jpg?updatedAt=1790324874139',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/643c44ce-6f6f-4b5c-b063-4186b0be6ace_f2YWg5Kfd.jpg?updatedAt=1790324864497',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/1d8feed6-2b09-4df6-98ff-28d407b4155f_8xseadNeB.jpg?updatedAt=1790324851311',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/85853367-fcc8-4d52-b05a-c95ad0c76b0a_QCYD7c2he.jpg?updatedAt=1790324841294',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/25101e30-901b-4ab4-93de-36622b87c4f6_byfzYps8ct.jpg?updatedAt=1790321244967',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/a1adb2ab-1559-4e57-9f4e-abc9f6c78e69_3hBYDQ9KS.jpg?updatedAt=1790270340022',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/a1b8d35d-3de3-4241-9e86-a901368db8ef_ghloQtyHq.jpg?updatedAt=1790062750479',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/c45bd7c6-fa81-4cb1-8499-d992e8235c5e_yN44jzI6L.jpg?updatedAt=1789925536411',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/b2d229fd-fbf3-4c00-9566-6163a37b15bb_pI4QFWYx9.jpg?updatedAt=1789925521999',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/3a693442-1eee-4445-b8d6-d992012fdc65_tNkK4IkgP.jpg?updatedAt=1789925510047',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/1ef4199e-944d-4501-9d1d-e1a01b21b111_nfRobIHEw.webp?updatedAt=1789720057042',
    'https://ik.imagekit.io/ela8y9kvt/stayleb/properties/fd73a28b-f9f4-4aee-894f-b001f964d756_Frc2kuvM1.png?updatedAt=1789672313630',
)
AMENITIES = (
    ('Wi-Fi', 'Heating & Comfort'), ('Air Conditioning', 'Heating & Comfort'),
    ('Heating', 'Heating & Comfort'), ('Kitchen', 'Dining & Outdoor'),
    ('Swimming Pool', 'Wellness & Leisure'), ('Sea View', 'Atmosphere & Views'),
    ('Garden', 'Dining & Outdoor'), ('Parking', 'Other'),
    ('Beach Access', 'Coastal Stays'), ('Fireplace', 'Heating & Comfort'), )
RULES = (
    ('Pets', 'Animal & Pet stays', 1, 'Small pets only'),
    ('Smoking', 'Clean Air & Safety', 0, None),
    ('Parties', 'Noise & Community', 0, None),
    ('Quiet Hours', 'Nighttime Serenity', 1, '22:00-08:00'), )
LOCATIONS = ('Batroun', 'Byblos', 'Jounieh', 'Faraya', 'Bcharre', 'Beirut', 'Tyre', 'Deir el Qamar')
TABLES = ('users', 'amenities', 'rules', 'platform_settings', 'properties',
        'property_images', 'property_amenities', 'property_rules',
        'property_blocked_dates', 'property_seasonal_prices', 'bookings',
        'payments', 'commission_settlements', 'reviews', 'favorites',
        'password_reset_otps', 'refresh_tokens')
def money(value):
    return Decimal(value).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
def validate(c):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,31}', c.seed_key):
        raise ValueError('seed_key must be 1-32 lowercase letters, digits or hyphens.')
    for f in fields(c):
        if f.name not in ('seed_key', 'commission_percentage', 'random_seed'):
            if type(getattr(c, f.name)) is not int or getattr(c, f.name) < 0:
                raise ValueError(f'{f.name} must be a nonnegative integer.')
    if min(c.owners, c.clients, c.properties_per_owner) < 1:
        raise ValueError('Need at least one owner, client and property per owner.')
    if c.properties_per_owner * c.bookings_per_property < 11:
        raise ValueError(
            'Need at least 11 bookings per owner: two each pending, confirmed, '
            'rejected and cancelled, plus three completed stays for review statuses.'
        )
    if not 0 <= c.commission_percentage <= 100:
        raise ValueError('Commission must be between 0 and 100.')
    if c.amenities_per_property > len(AMENITIES):
        raise ValueError('amenities_per_property exceeds available amenities.')
    if c.images_per_property < 3:
        raise ValueError('Each property must have at least 3 distinct images.')
    if c.images_per_property > len(set(IMAGE_URLS)):
        raise ValueError('images_per_property exceeds available distinct images.')
    if c.favorites_per_client > c.owners * c.properties_per_owner:
        raise ValueError('favorites_per_client exceeds the number of new properties.')
    if c.expired_auth_rows_per_client not in (0, 1):
        raise ValueError('expired_auth_rows_per_client must be 0 or 1.')
def connect():
    import psycopg
    from psycopg.conninfo import conninfo_to_dict
    url = os.getenv('SEED_DATABASE_URL') or os.getenv('DATABASE_URL', '')
    if not url:
        raise ValueError('Set DATABASE_URL in backend/.env or SEED_DATABASE_URL in PowerShell.')
    url = re.sub(r'^postgresql\+[^:]+://', 'postgresql://', url)
    if not url.startswith(('postgresql://', 'postgres://')):
        raise ValueError('Use a PostgreSQL database URL, not MySQL or the Supabase HTTPS API URL.')
    try:
        options = conninfo_to_dict(url)
    except Exception:
        raise ValueError('Invalid PostgreSQL URL. Percent-encode special characters in its password.') from None
    if options.get('sslmode') not in ('require', 'verify-ca', 'verify-full'):
        options['sslmode'] = 'require'
    if os.getenv('SEED_SSL_ROOT_CERT'):
        options.update(sslmode='verify-full', sslrootcert=os.environ['SEED_SSL_ROOT_CERT'])
    options.setdefault('connect_timeout', '15')
    # Disabling automatic prepared statements also supports transaction poolers.
    return psycopg.connect(**options, autocommit=False, prepare_threshold=None)

class Writer:
    def __init__(self, cursor):
        self.cursor = cursor
        self.counts = Counter()
    def add(self, table, **values):
        # Identifiers come only from this script; all values are bound parameters.
        assert table in TABLES
        from psycopg import sql
        # PostgreSQL booleans must be sent as bool, not MySQL-style integers.
        for key in ('is_active', 'is_primary', 'allowed'):
            if key in values:
                values[key] = bool(values[key])
        query = sql.SQL('INSERT INTO {} ({}) VALUES ({})').format(
            sql.Identifier('public', table),
            sql.SQL(',').join(map(sql.Identifier, values)),
            sql.SQL(',').join(sql.Placeholder() for _ in values),
        )
        has_id = table not in ('property_amenities', 'favorites')
        if has_id:
            query += sql.SQL(' RETURNING id')
        self.cursor.execute(query, tuple(values.values()))
        self.counts[table] += 1
        return self.cursor.fetchone()[0] if has_id else None

    def lookup(self, table, name, category):
        self.cursor.execute(f'SELECT id FROM "public"."{table}" WHERE name=%s', (name,))
        found = self.cursor.fetchone()
        return found[0] if found else self.add(table, name=name, category=category,
                                            description=f'{name} available for guests', is_active=1)
def populate(cursor, c, encoded_hash, now=None):
    validate(c)
    now = now or datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
    today = now.date()
    rng = random.Random(c.random_seed)
    fake = Faker('en_US')
    fake.seed_instance(c.random_seed)
    w = Writer(cursor)
    marker = f'{c.seed_key}-admin@example.test'
    cursor.execute('SELECT id FROM users WHERE email=%s', (marker,))
    if cursor.fetchone():
        raise ValueError('This seed_key already exists. Use a new seed_key for a separate dataset.')
    # Unique email is also a concurrency guard: competing identical runs roll back.
    def user(role, number):
        return w.add('users', full_name=fake.name(),
                    email=marker if role == 'admin' else f'{c.seed_key}-{role}-{number}@example.test',
                    password_hash=encoded_hash, role=role, is_active=1,
                    phone='+961' + str(rng.randint(70000000, 81999999)))
    user('admin', 1)
    owners = [user('owner', i+1) for i in range(c.owners)]
    clients = [user('client', i+1) for i in range(c.clients)]
    amenity_ids = [w.lookup('amenities', name, cat) for name, cat in AMENITIES]
    rule_ids = [w.lookup('rules', name, cat) for name, cat, _, _ in RULES]
    cursor.execute('SELECT commission_percentage, currency FROM platform_settings ORDER BY id')
    settings = cursor.fetchall()
    if len(settings) > 1:
        raise ValueError('Multiple platform_settings rows exist; resolve which row the app uses first.')
    if settings:
        commission = Decimal(str(settings[0][0]))
    else:
        commission = c.commission_percentage
        w.add('platform_settings', commission_percentage=commission, currency='USD')
    if not 0 <= commission <= 100:
        raise ValueError('Existing commission_percentage must be between 0 and 100.')
    properties = []
    # Cycle across ALL properties of each owner, so smaller property counts
    # still satisfy the guaranteed minimum for every generated owner.
    statuses = (
        'pending', 'confirmed', 'rejected', 'cancelled',
        'pending', 'confirmed', 'rejected', 'cancelled',
        'completed', 'completed', 'completed',
    )
    review_statuses = ('visible', 'flagged', 'removed')
    for oi, owner_id in enumerate(owners):
        owner_booking_counts = Counter()
        owner_review_counts = Counter()
        review_index = 0
        for pi in range(c.properties_per_owner):
            bedrooms = rng.randint(1, 4)
            capacity = bedrooms * 2
            price = money(rng.randint(75, 350))
            location = rng.choice(LOCATIONS)
            property_id = w.add('properties', owner_id=owner_id,
                title=f'{location} Retreat {oi+1}-{pi+1}',
                description=f'Comfortable {bedrooms}-bedroom holiday home in {location}, '
                            'with a fully equipped kitchen and space to relax.',
                property_type=rng.choice(('chalet', 'furnished_house')),
                location=location, address=f'{rng.randint(1, 150)} Cedar Lane, {location}, Lebanon',
                price_per_night=price, bedrooms=bedrooms, beds=bedrooms+1,
                bathrooms=max(1, bedrooms-1), max_guests=capacity, min_nights=2,
                status='approved', created_at=now-timedelta(days=c.bookings_per_property*10+180))
            properties.append(property_id)
            for index, url in enumerate(rng.sample(IMAGE_URLS, c.images_per_property)):
                w.add('property_images', property_id=property_id, image_url=url,
                    imagekit_file_id=None, is_primary=int(index == 0), display_order=index)
            for aid in rng.sample(amenity_ids, c.amenities_per_property):
                w.add('property_amenities', property_id=property_id, amenity_id=aid)
            for rid, (_, _, allowed, value) in zip(rule_ids, RULES):
                w.add('property_rules', property_id=property_id, rule_id=rid, allowed=allowed, value=value)
            for bi in range(c.bookings_per_property):
                owner_booking_index = pi * c.bookings_per_property + bi
                status = statuses[owner_booking_index % len(statuses)]
                owner_booking_counts[status] += 1
                # Completed stays are strictly in the past; all others in the future.
                check_in = today + timedelta(days=-(c.bookings_per_property-bi)*10-10
                                            if status == 'completed' else (bi+1)*10)
                nights = rng.randint(2, 5)
                check_out = check_in + timedelta(days=nights)
                created = datetime.combine(check_in, time(10))-timedelta(days=30)
                created = min(created, now-timedelta(days=2))
                total = money(price*nights)
                fee = money(total*commission/100)
                booking_id = w.add('bookings', client_id=rng.choice(clients), property_id=property_id,
                    check_in=check_in, check_out=check_out, guests=rng.randint(1, capacity),
                    price_per_night=price, number_of_nights=nights, total_price=total, status=status,
                    expires_at=now+timedelta(minutes=30) if status == 'pending' else None,
                    cancelled_at=now-timedelta(days=1) if status == 'cancelled' else None,
                    cancellation_percentage=Decimal('0') if status == 'cancelled' else None,
                    cancellation_fee=Decimal('0') if status == 'cancelled' else None,
                    cancellation_commission_amount=Decimal('0'), owner_cancellation_earnings=Decimal('0'),
                    refund_amount=Decimal('0') if status == 'cancelled' else None,
                    commission_percentage=commission, commission_amount=fee, owner_earnings=total-fee,
                    created_at=created)
                if status != 'rejected':
                    w.add('payments', booking_id=booking_id, amount=total, payment_method='cash',
                        payment_status='paid' if status == 'completed' else 'cancelled' if status == 'cancelled' else 'pending',
                        refunded_amount=Decimal('0'), created_at=created,
                        paid_at=datetime.combine(check_in, time(15)) if status == 'completed' else None)
                if status == 'completed':
                    after_stay = datetime.combine(check_out, time(15))
                    paid = bi % 2 == 0
                    w.add('commission_settlements', booking_id=booking_id, owner_id=owner_id,
                        commission_amount=fee, status='paid' if paid else 'unpaid',
                        paid_at=after_stay+timedelta(days=1) if paid else None, created_at=after_stay)
                    moderation_status = review_statuses[review_index % len(review_statuses)]
                    review_index += 1
                    owner_review_counts[moderation_status] += 1
                    ratings = [rng.randint(3, 5) for _ in range(6)]
                    w.add('reviews', booking_id=booking_id, overall_rating=round(sum(ratings)/6),
                        cleanliness_rating=ratings[0], privacy_rating=ratings[1], wifi_rating=ratings[2],
                        hot_water_rating=ratings[3], location_rating=ratings[4], value_rating=ratings[5],
                        comment=rng.choice(('A comfortable stay with a welcoming host.',
                                            'Clean rooms and a convenient location.',
                                            'Great for a quiet weekend with family.')),
                        moderation_status=moderation_status, created_at=after_stay+timedelta(days=2))
            end = today+timedelta(days=(c.bookings_per_property+2)*10)
            w.add('property_blocked_dates', property_id=property_id, start_date=end,
                end_date=end+timedelta(days=3), reason='Scheduled maintenance')
            w.add('property_seasonal_prices', property_id=property_id, season_name='Peak season',
                start_date=end+timedelta(days=10), end_date=end+timedelta(days=40),
                price_per_night=money(price*Decimal('1.25')))
        if any(owner_booking_counts[status] < 2
               for status in ('pending', 'confirmed', 'rejected', 'cancelled')):
            raise ValueError('Owner booking status minimum was not met.')
        if any(owner_review_counts[status] < 1 for status in review_statuses):
            raise ValueError('Owner review moderation status coverage was not met.')
        print(f'  Booking statuses: {dict(owner_booking_counts)}', flush=True)
        print(f'  Review statuses: {dict(owner_review_counts)}', flush=True)
        print(f'Prepared owner {oi+1}/{len(owners)}; {sum(w.counts.values()):,} rows so far.', flush=True)
    for index, client_id in enumerate(clients):
        for property_id in rng.sample(properties, c.favorites_per_client):
            w.add('favorites', client_id=client_id, property_id=property_id)
        if c.expired_auth_rows_per_client:
            token_hash = hashlib.sha256(f'{c.seed_key}/expired/{index}'.encode()).hexdigest()
            w.add('password_reset_otps', user_id=client_id, otp_hash=token_hash, attempts=0,
                created_at=now-timedelta(days=2), expires_at=now-timedelta(days=1))
            w.add('refresh_tokens', user_id=client_id, token_hash=token_hash,
                created_at=now-timedelta(days=2), expires_at=now-timedelta(days=1), revoked_at=now)
    return w.counts
def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--dry-run', action='store_true', help='Insert and validate, then roll back.')
    parser.add_argument('--seed-key', default=CONFIG.seed_key,
                        help='Unique dataset key. A new key adds a separate dataset.')
    args = parser.parse_args()
    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv(Path(__file__).resolve().with_name('.env'), override=False)
    config = replace(CONFIG, seed_key=args.seed_key)
    validate(config)
    encoded = os.getenv('SEED_PASSWORD_HASH', '')
    if not encoded or len(encoded) > 255 or encoded == 'encoded-hash-from-your-app-password-hasher':
        parser.error('Set SEED_PASSWORD_HASH to a real encoded hash from your app (max 255 characters).')
    db = connect()
    try:
        with db.cursor() as cursor:
            cursor.execute("SET LOCAL TIME ZONE 'UTC'")
            cursor.execute("SET LOCAL search_path TO public")
            cursor.execute("SELECT pg_try_advisory_xact_lock(734218906)")
            if not cursor.fetchone()[0]:
                raise ValueError('Another seed is running. Try again after it finishes.')
            cursor.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema='public' AND table_type='BASE TABLE'"
            )
            existing = {row[0] for row in cursor.fetchall()}
            missing = sorted(set(TABLES) - existing)
            if missing:
                raise ValueError('Create the app tables in Supabase first. Missing: ' + ', '.join(missing))
            counts = populate(cursor, config, encoded)
            db.rollback() if args.dry_run else db.commit()
            print('Dry run passed; inserts rolled back.' if args.dry_run else 'Seed committed.')
            for table, count in sorted(counts.items()):
                print(f'  {table}: {count:,}')
            print(f'TOTAL NEW ROWS: {sum(counts.values()):,}')
            print(f'Admin email: {config.seed_key}-admin@example.test')
            print('Owner/client emails: <seed_key>-owner-1@example.test / <seed_key>-client-1@example.test')
    except BaseException:
        db.rollback()
        raise
    finally:
        db.close()
if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Do not print query parameters or connection credentials.
        print(f'Seed failed ({type(exc).__name__}). No seed transaction was committed.')
        if getattr(exc, 'sqlstate', None):
            print(f'PostgreSQL SQLSTATE: {exc.sqlstate}')
            diag = getattr(exc, 'diag', None)
            if diag:
                print(f'Table: {diag.table_name or "-"}; column: {diag.column_name or "-"}; constraint: {diag.constraint_name or "-"}')
        if isinstance(exc, ValueError):
            print(str(exc))
        print('Check connection settings, schema, duplicate seed_key and password hash setup.')
        raise SystemExit(1)
