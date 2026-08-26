"""
Northveil Core Client Implementation for Python.
"""
import os
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

DEFAULT_BASE_URL = os.getenv("NORTHVEIL_API_URL", "https://mcp.northveil.xyz")
DEFAULT_API_KEY = os.getenv("NORTHVEIL_API_KEY", "nv_live_9f82a17b09c82415d8a9")
DEFAULT_WALLET = os.getenv("NORTHVEIL_WALLET_ADDRESS", "")

class NorthveilException(Exception):
    """Base exception for Northveil API errors."""
    pass

class Northveil:
    """Official Python Client for Northveil Autonomous Protocol."""

    def __init__(self, api_key: str = DEFAULT_API_KEY, wallet_address: str = DEFAULT_WALLET, base_url: str = DEFAULT_BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.wallet_address = wallet_address
        self._endpoints_fallback = [
            self.base_url,
            "http://127.0.0.1:3001",
            "http://localhost:3001",
            "https://northveil-mcp.vercel.app"
        ]

    def _request(self, endpoint: str, payload: dict = None, method: str = "POST") -> dict:
        data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Northveil-Python-SDK/1.0.1",
            "Bypass-Tunnel-Reminder": "true"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-API-Key"] = self.api_key
        if self.wallet_address:
            headers["x-wallet-address"] = self.wallet_address

        last_error = None
        for base in self._endpoints_fallback:
            target_url = f"{base}{endpoint}"
            try:
                req = Request(target_url, data=data_bytes, headers=headers, method=method)
                with urlopen(req, timeout=15) as res:
                    resp_body = res.read().decode("utf-8")
                    return json.loads(resp_body)
            except HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                try:
                    err_json = json.loads(err_body)
                    msg = err_json.get("error") or err_json.get("message") or err_body
                except:
                    msg = err_body
                last_error = f"HTTP {e.code}: {msg}"
            except Exception as e:
                last_error = str(e)
                continue

        raise NorthveilException(f"Northveil Request Failed: {last_error}")

    def call_tool(self, tool_name: str, **kwargs) -> dict:
        """Call any of the 38 Northveil MCP tools via the REST Tool Gateway."""
        return self._request(f"/api/v1/tools/{tool_name}", payload=kwargs)

    def whoami(self) -> dict:
        """Inspect authenticated developer account, bound wallets, and tier."""
        return self._request("/api/v1/auth/me", method="GET")

    def search_flights(self, origin: str, destination: str, date: str = "2026-09-20",
                       cabin_class: str = "business", passengers: int = 1, currency: str = "ETH") -> dict:
        """Search international flights with live cryptocurrency pricing."""
        return self.call_tool("search_flights", origin=origin, destination=destination,
                                 departureDate=date, cabinClass=cabin_class, passengers=passengers, currency=currency)

    def search_hotels(self, destination: str, check_in: str = "2026-09-20",
                      check_out: str = "2026-09-25", guests: int = 2, rooms: int = 1, currency: str = "ETH") -> dict:
        """Search luxury hotels and suites with live crypto pricing."""
        return self.call_tool("search_hotels", destination=destination, checkInDate=check_in,
                                 checkOutDate=check_out, guests=guests, rooms=rooms, currency=currency)

    def search_events(self, city: str = "London", category: str = "concert", currency: str = "ETH") -> dict:
        """Search entertainment, concerts, and VIP events."""
        return self.call_tool("search_events_and_movies", city=city, category=category, currency=currency)

    def make_reservation(self, category: str, title: str, provider: str, price_usd: float,
                         currency: str = "ETH", passenger_name: str = "Alex Northveil",
                         contact_email: str = "dev@northveil.xyz") -> dict:
        """Create on-chain reservation and issue verifiable cryptographic airline PNR / Ticket Pass."""
        return self.call_tool("make_reservation", category=category, title=title, provider=provider,
                                 priceUsd=price_usd, currency=currency, passengerName=passenger_name,
                                 contactEmail=contact_email, walletAddress=self.wallet_address)

    def get_booking_status(self, booking_ref_or_pnr: str) -> dict:
        """Verify real-time ticket confirmation status by 6-char IATA PNR code or Reference."""
        return self.call_tool("get_booking_status", bookingReference=booking_ref_or_pnr)

    def get_portfolio(self, hide_zero_balances: bool = False) -> dict:
        """Retrieve multi-chain balances across 36+ networks with live USD valuation."""
        return self.call_tool("get_portfolio", walletAddress=self.wallet_address, hideZeroBalances=hide_zero_balances)

    def get_wallet_info(self, chain: str = "all") -> dict:
        """Get wallet details and multi-chain address mappings."""
        return self.call_tool("get_wallet_info", chain=chain, walletAddress=self.wallet_address)

    def get_token_balance(self, symbol: str = "ETH") -> dict:
        """Get balance for a specific crypto token."""
        return self.call_tool("get_token_balance", symbol=symbol, walletAddress=self.wallet_address)

    def check_health(self, address: str = None) -> dict:
        """Audit wallet gas sufficiency, liquidity health, and diversification."""
        return self.call_tool("check_wallet_health", walletAddress=address or self.wallet_address)

    def send_transfer(self, to: str, amount: float, token: str = "ETH", chain: str = "sepolia") -> dict:
        """Execute on-chain transfer via Northveil Custodial Signing Service."""
        return self.call_tool("send_transfer", to=to, amount=str(amount), token=token, chain=chain,
                                 walletAddress=self.wallet_address)

    def audit_contract(self, code: str) -> dict:
        """Run deep static vulnerability, reentrancy, and backdoor analysis on Solidity code."""
        return self.call_tool("audit_smart_contract", code=code)

    def deploy_contract(self, name: str, symbol: str, initial_supply: int = 1000000,
                        contract_type: str = "ERC20", network: str = "sepolia") -> dict:
        """Deploy ERC-20 / ERC-721 smart contract to blockchain."""
        return self.call_tool("deploy_smart_contract", name=name, symbol=symbol,
                                 initialSupply=initial_supply, contractType=contract_type, network=network)

    def mint_tokens(self, contract_address: str, recipient: str, amount: str) -> dict:
        """Mint new tokens from deployed ERC-20 contract."""
        return self.call_tool("mint_tokens", contractAddress=contract_address, to=recipient, amount=amount)

    def reserve_tokens(self, token_address: str, recipient: str, amount: str, unlock_time: int) -> dict:
        """Create time-locked token vesting reservation."""
        return self.call_tool("reserve_tokens", tokenAddress=token_address, recipient=recipient,
                                 amount=amount, unlockTime=unlock_time)

    def get_prices(self, symbols: str = "ETH,BTC,SOL,USDC") -> dict:
        """Get live cryptocurrency market prices."""
        return self.call_tool("get_realtime_prices", symbols=symbols)

    def get_trending(self) -> dict:
        """Get trending tokens and market movements."""
        return self.call_tool("get_trending_memecoins")

    def get_gas_estimate(self, network: str = "ethereum") -> dict:
        """Get real-time gas prices (slow, standard, fast)."""
        return self.call_tool("get_gas_estimate", network=network)

NorthveilClient = Northveil
