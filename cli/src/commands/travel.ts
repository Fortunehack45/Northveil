import { postApi } from '../utils';

export function registerTravelCommands(program: any) {
  // FLIGHTS
  program
    .command('flights')
    .description('Search live airline flights with real crypto pricing (ETH/USDC/SOL)')
    .requiredOption('-f, --from <origin>', 'Origin airport IATA code (e.g. LHR, JFK, HND, DXB)')
    .requiredOption('-t, --to <destination>', 'Destination airport IATA code (e.g. JFK, LHR, CDG, SFO)')
    .option('-d, --date <departureDate>', 'Departure date (YYYY-MM-DD)', '2026-09-20')
    .option('-c, --class <cabinClass>', 'Cabin class: economy, premium_economy, business, first', 'economy')
    .option('-p, --passengers <count>', 'Number of passengers', '1')
    .option('--currency <currency>', 'Price currency: ETH, USDC, SOL, USD', 'ETH')
    .action(async (options: any) => {
      console.log(`\n🛫 Searching live flights from ${options.from.toUpperCase()} to ${options.to.toUpperCase()}...`);
      try {
        const data = await postApi('/api/v1/tools/search_flights', {
          origin: options.from.toUpperCase(),
          destination: options.to.toUpperCase(),
          departureDate: options.date,
          cabinClass: options.class,
          passengers: parseInt(options.passengers, 10),
          currency: options.currency,
        });

        if (data.offers && data.offers.length > 0) {
          console.log(`\nFound ${data.offers.length} flight routes (${data.originAirport || options.from} -> ${data.destinationAirport || options.to}):\n`);
          data.offers.forEach((offer: any, i: number) => {
            console.log(`[${i + 1}] ${offer.airline} (${offer.flightNumber})`);
            console.log(`    Departure: ${offer.departureTime} | Arrival: ${offer.arrivalTime}`);
            console.log(`    Duration: ${offer.duration} | Stops: ${offer.stops === 0 ? 'Direct (Non-stop)' : `${offer.stops} Stop`}`);
            console.log(`    Price: ${offer.priceCrypto} ${offer.cryptoCurrency || 'ETH'} ($${offer.priceUsd} USD)`);
            console.log(`    Available Seats: ${offer.seatsAvailable || 9}`);
            console.log('    -----------------------------------------------------');
          });
        } else {
          console.log('No flight offers found for given criteria.');
        }
      } catch (err: any) {
        console.error('\n❌ Flight Search Error:', err.message);
      }
    });

  // HOTELS
  program
    .command('hotels')
    .description('Search global luxury hotels and resorts with live crypto rates')
    .requiredOption('--city <city>', 'Destination city (e.g. Tokyo, London, Paris, New York, Dubai)')
    .option('--checkin <date>', 'Check-in date (YYYY-MM-DD)', '2026-10-05')
    .option('--checkout <date>', 'Check-out date (YYYY-MM-DD)', '2026-10-08')
    .option('--guests <count>', 'Number of guests', '2')
    .option('--currency <currency>', 'Currency: ETH, USDC, SOL', 'ETH')
    .action(async (options: any) => {
      console.log(`\n🏨 Searching 4-star & 5-star hotels in ${options.city}...`);
      try {
        const data = await postApi('/api/v1/tools/search_hotels', {
          destination: options.city,
          checkInDate: options.checkin,
          checkOutDate: options.checkout,
          guests: parseInt(options.guests, 10),
          currency: options.currency,
        });

        if (data.hotels && data.hotels.length > 0) {
          console.log(`\nFound ${data.hotels.length} luxury properties in ${options.city} (${data.nights || 3} Nights):\n`);
          data.hotels.forEach((hotel: any, i: number) => {
            console.log(`[${i + 1}] ${hotel.name} (${hotel.starRating} Stars)`);
            console.log(`    Room Tier:    ${hotel.roomType}`);
            console.log(`    Location:     ${hotel.location}`);
            console.log(`    Nightly Rate: $${hotel.pricePerNightUsd} USD/night`);
            console.log(`    Total Price:  ${hotel.totalPriceCrypto} ${hotel.currency || 'ETH'} ($${hotel.totalPriceUsd} USD)`);
            console.log(`    Amenities:    ${hotel.amenities?.join(', ')}`);
            console.log('    -----------------------------------------------------');
          });
        } else {
          console.log('No hotel properties found.');
        }
      } catch (err: any) {
        console.error('\n❌ Hotel Search Error:', err.message);
      }
    });

  // PNR STATUS
  program
    .command('status <bookingReference>')
    .description('Verify real-time ticket confirmation status by 6-char IATA PNR code or Northveil Reference')
    .action(async (bookingReference: string) => {
      console.log(`\n🔍 Verifying booking status for: ${bookingReference.toUpperCase()}...`);
      try {
        const data = await postApi('/api/v1/tools/get_booking_status', {
          bookingReference: bookingReference.toUpperCase(),
        });

        if (data.found) {
          console.log(`\n✅ BOOKING CONFIRMED & ACTIVE`);
          console.log(`  PNR Code:           ${data.pnr}`);
          console.log(`  e-Ticket No:        ${data.eTicketNo}`);
          console.log(`  Reference:          ${data.bookingReference}`);
          console.log(`  Title:              ${data.title}`);
          console.log(`  Status:             [${data.status}]`);
          console.log(`  Customer:           ${data.customerName}`);
          console.log(`  Seat / Room:        ${data.seatDetails}`);
          console.log(`  Total Paid:         ${data.priceAmount} ${data.currency}`);
          console.log(`  Issuance Date:      ${data.bookingDate}`);
        } else {
          console.log(`\n⚠️  No booking record found for reference: ${bookingReference}`);
        }
      } catch (err: any) {
        console.error('\n❌ Booking Status Error:', err.message);
      }
    });
}
