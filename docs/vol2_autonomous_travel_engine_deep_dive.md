# Northveil Technical Encyclopedia — Volume II: Autonomous Travel Engine Deep Dive

## 1. Algorithmic Routing Matrix
The travel engine maintains high-precision GPS coordinates for global aviation hubs:
- `LHR`: London Heathrow Airport (51.4700° N, 0.4543° W)
- `JFK`: New York John F. Kennedy (40.6413° N, 73.7781° W)
- `LAX`: Los Angeles International (33.9416° N, 118.4085° W)
- `HND`: Tokyo Haneda International (35.5494° N, 139.7798° E)
- `DXB`: Dubai International Airport (25.2532° N, 55.3657° E)
- `CDG`: Paris Charles de Gaulle (49.0097° N, 2.5479° E)
- `SIN`: Singapore Changi Airport (1.3644° N, 103.9915° E)
- `FRA`: Frankfurt Airport (50.0379° N, 8.5622° E)
- `AMS`: Amsterdam Schiphol (52.3105° N, 4.7683° E)
- `SYD`: Sydney Kingsford Smith (33.9399° S, 151.1753° E)

## 2. Great-Circle Distance & Fare Calculation Formula

The distance between any two global airports is computed using the Great-Circle Haversine equation:
$$a = \sin^2\left(rac{\Delta\phi}{2}ight) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(rac{\Delta\lambda}{2}ight)$$
$$d = 2R \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}ight)$$

Where $R = 6371	ext{ km}$. The base fare in USD is derived via:
$$	ext{BaseUSD} = \left(550 + |	ext{code}(O_0) - 	ext{code}(D_0)| 	imes 45ight) 	imes 	ext{Multiplier}_{	ext{Cabin}}$$

- **Economy Class**: `1.0x`
- **Premium Economy**: `1.5x`
- **Business Class**: `2.8x`
- **First Class**: `4.5x`

## 3. Real-Time Dynamic Crypto Pricing Pipeline
1. Connects to live Coinpaprika Tickers stream (`https://api.coinpaprika.com/v1/tickers`).
2. Extracts live rate benchmarks:
   $$	ext{Price}_{	ext{ETH}} = rac{	ext{Total USD}}{	ext{ETH Rate}}$$
   $$	ext{Price}_{	ext{SOL}} = rac{	ext{Total USD}}{	ext{SOL Rate}}$$
   $$	ext{Price}_{	ext{USDC}} = 	ext{Total USD}$$
