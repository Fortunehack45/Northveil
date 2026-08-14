export interface NorthveilConfig {
    baseUrl?: string;
    apiKey?: string;
    walletAddress?: string;
}
export interface BalanceResult {
    chain: string;
    address: string;
    balanceNative: string;
    balanceUsd: number;
    symbol: string;
}
export interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    priceUsd: number;
    valueUsd: number;
    contractAddress?: string;
    icon?: string;
}
export interface NFTItem {
    id: string;
    contractAddress: string;
    tokenId: string;
    name: string;
    collectionName: string;
    imageUrl: string;
    chain: string;
}
export interface SwapParams {
    fromToken: string;
    toToken: string;
    amount: string;
    slippagePercent?: number;
    chain?: string;
}
export interface DeployContractParams {
    contractType: 'erc20' | 'erc721' | 'erc1155' | 'staking' | 'vault';
    contractName: string;
    symbol: string;
    totalSupply?: number;
    network?: string;
    websiteUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
    discordUrl?: string;
}
export interface TransactionResult {
    success: boolean;
    txHash: string;
    explorerUrl: string;
    message: string;
}
export interface TokenPrice {
    symbol: string;
    name: string;
    priceUsd: number;
    change24h?: number;
    change7d?: number;
    change1h?: number;
    marketCap?: number;
    volume24h?: number;
    liquidity?: number;
    chain?: string;
    source: string;
}
export interface TrendingMemecoin {
    symbol: string;
    name: string;
    contractAddress: string;
    chain: string;
    priceUsd: number;
    change5m?: number;
    change1h?: number;
    change6h?: number;
    change24h?: number;
    volume24h: number;
    liquidity: number;
    audit?: TokenAuditResult;
}
export interface TokenAuditResult {
    score: number;
    verdict: string;
    isHoneypot: boolean;
    buyTax?: number;
    sellTax?: number;
    isMintable?: boolean;
    hiddenOwner?: boolean;
    isOpenSource?: boolean;
    canTakeBackOwnership?: boolean;
    ownerChangeBalance?: boolean;
    hasBlacklist?: boolean;
    transferPausable?: boolean;
    holderCount?: number;
    lpLocked?: number;
}
export interface TradeOrderParams {
    token: string;
    orderType: 'stop_loss' | 'take_profit';
    triggerPrice: number;
    amount: number;
    chain?: string;
}
export interface TradeOrder {
    orderId: string;
    token: string;
    orderType: 'stop_loss' | 'take_profit';
    triggerPrice: number;
    currentPrice?: number;
    amount: number;
    chain: string;
    status: 'ACTIVE' | 'TRIGGERED' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
}
export interface WalletHealthResult {
    healthScore: number;
    totalUsd: number;
    activeChains: number;
    balances: {
        chain: string;
        symbol: string;
        balance: number;
        valueUsd: number;
    }[];
    tokenCount: number;
    dustTokens: number;
    gasWarnings: string[];
}
export interface SecurityScanResult {
    securityScore: number;
    verdict: string;
    threats: {
        severity: string;
        type: string;
        detail: string;
    }[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}
export interface SendTransferParams {
    token: string;
    amount: number;
    recipientAddress: string;
    chain?: string;
}
export interface GasEstimate {
    chain: string;
    baseFee: string;
    priorityFee: string;
    gasPrice: string;
}
export interface VerifyContractParams {
    contractAddress: string;
    contractName: string;
    sourceCode?: string;
    network?: string;
    compilerVersion?: string;
    optimizationUsed?: boolean;
    runs?: number;
}
export interface ContractVerificationResult {
    verified: boolean;
    contractAddress: string;
    contractName: string;
    network: string;
    compilerVersion: string;
    optimizationUsed: boolean;
    runs: number;
    explorerVerificationUrl: string;
    guid?: string;
    statusMessage: string;
}
export interface MintTokensParams {
    contractAddress: string;
    amount: string;
    recipientAddress?: string;
    network?: string;
}
export interface MintTokensResult {
    txHash: string;
    tokenName: string;
    tokenSymbol: string;
    amount: string;
    recipientAddress: string;
    contractAddress: string;
    network: string;
    explorerUrl: string;
}
export interface ReserveTokensParams {
    contractAddress: string;
    recipientAddress: string;
    amount: string;
    unlockDate: string;
    label?: string;
    network?: string;
}
export interface ReserveTokensResult {
    reservationId: string;
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    amount: string;
    recipientAddress: string;
    senderAddress: string;
    unlockDate: string;
    label: string;
    network: string;
    status: string;
    daysUntilUnlock: number;
}
export interface MakeReservationParams {
    category: 'flight' | 'movie' | 'hotel' | 'event' | 'dining' | 'rental' | 'custom';
    title: string;
    bookingDate: string;
    bookingTime?: string;
    quantity?: number;
    seatDetails?: string;
    priceAmount: string;
    currency?: string;
    customerName?: string;
    network?: string;
}
export interface MakeReservationResult {
    bookingReference: string;
    reservationId: string;
    category: string;
    title: string;
    customerName: string;
    bookingDate: string;
    bookingTime: string;
    quantity: number;
    seatDetails: string;
    priceAmount: string;
    currency: string;
    network: string;
    status: string;
}
export interface ListReservationsResult {
    formattedMarkdown: string;
    count: number;
    reservations: MakeReservationResult[];
}
export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers?: number;
    cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
    currency?: string;
}
export interface FlightOffer {
    offerId: string;
    airline: string;
    airlineCode: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    cabinClass: string;
    priceUsd: number;
    priceCrypto: string;
    currency: string;
    seatsRemaining: number;
}
export interface FlightSearchResult {
    formattedMarkdown: string;
    route: string;
    departureDate: string;
    totalOffers: number;
    offers: FlightOffer[];
}
export interface HotelSearchParams {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    guests?: number;
    rooms?: number;
    starRating?: number;
    currency?: string;
}
export interface HotelOffer {
    hotelId: string;
    name: string;
    location: string;
    starRating: number;
    roomType: string;
    pricePerNightUsd: number;
    totalPriceUsd: number;
    totalPriceCrypto: string;
    currency: string;
    amenities: string[];
    cancellationPolicy: string;
}
export interface HotelSearchResult {
    formattedMarkdown: string;
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    totalProperties: number;
    hotels: HotelOffer[];
}
export interface EventSearchParams {
    city?: string;
    category?: 'movie' | 'concert' | 'sports' | 'conference' | 'theater';
    query?: string;
    currency?: string;
}
export interface EventOffer {
    eventId: string;
    title: string;
    category: string;
    venue: string;
    city: string;
    eventDate: string;
    eventTime: string;
    priceUsd: number;
    priceCrypto: string;
    currency: string;
    availableSeats: string[];
}
export interface EventSearchResult {
    formattedMarkdown: string;
    totalEvents: number;
    events: EventOffer[];
}
export interface BookingStatusResult {
    formattedMarkdown: string;
    found: boolean;
    bookingReference: string;
    pnr?: string;
    category: string;
    title: string;
    customerName: string;
    status: string;
    details: Record<string, any>;
}
//# sourceMappingURL=types.d.ts.map