# Northveil Autonomous Travel & Airline Ticketing Specification

## 1. IATA Airport Routing Matrix
The travel engine maintains verified IATA airport coordinates for instant distance computing:
- `LHR`: London Heathrow (51.4700° N, 0.4543° W)
- `JFK`: New York John F. Kennedy (40.6413° N, 73.7781° W)
- `LAX`: Los Angeles International (33.9416° N, 118.4085° W)
- `HND`: Tokyo Haneda (35.5494° N, 139.7798° E)
- `DXB`: Dubai International (25.2532° N, 55.3657° E)
- `CDG`: Paris Charles de Gaulle (49.0097° N, 2.5479° E)
- `SIN`: Singapore Changi (1.3644° N, 103.9915° E)

## 2. Mathematical Fare Calculation Model

```python
def calculate_fare(origin_code, destination_code, cabin_class, passengers):
    multipliers = {
        'economy': 1.0,
        'premium_economy': 1.5,
        'business': 2.8,
        'first': 4.5
    }
    base_usd = (550 + abs(ord(origin_code[0]) - ord(destination_code[0])) * 45) * multipliers.get(cabin_class, 1.0)
    return round(base_usd * passengers)
```

## 3. Real-Time Crypto Pricing Feed
Live market rates from Coinpaprika convert dynamic fares into cryptocurrency:
$$	ext{Price}_{	ext{ETH}} = rac{	ext{Total USD}}{	ext{Live ETH Price}}$$
$$	ext{Price}_{	ext{SOL}} = rac{	ext{Total USD}}{	ext{Live SOL Price}}$$

## 4. Cryptographic PNR Generation Format
Every confirmed booking produces an immutable 6-character IATA-standard Passenger Name Record (PNR):
- Format: `^[A-Z0-9]{6}$` (e.g. `TXAKQ8`, `HW1YPM`).
- Linked to reference string: `NV-FLT-[TIMESTAMP]-[RANDOM_HEX]`.
