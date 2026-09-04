"""
Northveil Core Client Implementation for Python.
Strictly non-custodial MCP client. Communicates with Northveil Control Plane via JSON-RPC 2.0.
"""
import os
import json
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

DEFAULT_BASE_URL = os.getenv("NORTHVEIL_API_URL", "https://mcp.northveil.xyz")
DEFAULT_API_KEY = os.getenv("NORTHVEIL_API_KEY", "")
DEFAULT_WALLET = os.getenv("NORTHVEIL_WALLET_ADDRESS", "")

class NorthveilException(Exception):
    """Base exception for Northveil API errors."""
    pass

class Northveil:
    """Official Python Client for Northveil Non-Custodial Agent Control Plane."""

    def __init__(self, api_key: str = DEFAULT_API_KEY, wallet_address: str = DEFAULT_WALLET, base_url: str = DEFAULT_BASE_URL, **kwargs):
        if "private_key" in kwargs or "mnemonic" in kwargs:
            raise NorthveilException("NON_CUSTODIAL_VIOLATION: Northveil strictly forbids private keys or mnemonics in client applications.")
        if not api_key:
            raise ValueError("Northveil API key is required. Pass api_key or set NORTHVEIL_API_KEY env var.")
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.wallet_address = wallet_address

    def call_tool(self, tool_name: str, **kwargs) -> dict:
        """Execute an MCP tool via JSON-RPC 2.0 tools/call."""
        return self.call(tool_name, kwargs)

    def call(self, tool_name: str, arguments: dict = None) -> dict:
        """Call an MCP tool via JSON-RPC 2.0."""
        args = dict(arguments or {})
        if self.wallet_address and "walletAddress" not in args:
            args["walletAddress"] = self.wallet_address

        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time() * 1000),
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": args
            }
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Northveil-Python-SDK/2.0.0",
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
        }

        target_url = f"{self.base_url}/mcp"
        try:
            req = Request(target_url, data=data_bytes, headers=headers, method="POST")
            with urlopen(req, timeout=20) as res:
                resp_body = res.read().decode("utf-8")
                data = json.loads(resp_body)
        except HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise NorthveilException(f"HTTP {e.code}: {err_body}")
        except Exception as e:
            raise NorthveilException(f"Failed to communicate with Northveil MCP: {e}")

        if "error" in data:
            err = data["error"]
            raise NorthveilException(f"MCP Error ({err.get('code')}): {err.get('message')}")

        result = data.get("result", {})
        content = result.get("content", [])
        if content and isinstance(content, list) and len(content) > 0:
            text = content[0].get("text", "")
            try:
                return json.loads(text)
            except Exception:
                return {"result": text}
        return result

    def list_tools(self) -> list:
        """List available MCP tools from the control plane."""
        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time() * 1000),
            "method": "tools/list",
            "params": {}
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
        }
        target_url = f"{self.base_url}/mcp"
        try:
            req = Request(target_url, data=data_bytes, headers=headers, method="POST")
            with urlopen(req, timeout=15) as res:
                data = json.loads(res.read().decode("utf-8"))
                return data.get("result", {}).get("tools", [])
        except Exception as e:
            raise NorthveilException(f"Failed to list tools: {e}")

    def get_request(self, request_id: str) -> dict:
        """Inspect request lifecycle record by ID."""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
        }
        target_url = f"{self.base_url}/wallet/requests/{request_id}"
        try:
            req = Request(target_url, headers=headers, method="GET")
            with urlopen(req, timeout=15) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as e:
            raise NorthveilException(f"Failed to inspect request {request_id}: {e}")

    def whoami(self) -> dict:
        """Inspect authenticated developer identity and scoped permissions."""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
        }
        target_url = f"{self.base_url}/api/v1/auth/me"
        try:
            req = Request(target_url, headers=headers, method="GET")
            with urlopen(req, timeout=15) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as e:
            raise NorthveilException(f"Failed to fetch identity: {e}")

    def get_portfolio(self, wallet_address: str = None) -> dict:
        """Retrieve multi-chain balances and USD valuation."""
        target = wallet_address or self.wallet_address
        args = {"walletAddress": target} if target else {}
        return self.call("get_portfolio", args)

    def prepare_transfer(self, to: str, amount: str, chain: str = "eip155:8453", asset: str = "ETH", **kwargs) -> dict:
        """
        Stage an on-chain transfer.
        Returns APPROVAL_REQUIRED (with approveUrl for human passkey approval)
        or executes immediately if autonomous grant limits are satisfied.
        """
        args = {
            "to": to,
            "amount": str(amount),
            "chain": chain,
            "asset": asset,
            **kwargs
        }
        return self.call("prepare_transfer", args)

    def get_transaction_status(self, tx_hash: str, chain: str = None) -> dict:
        """Check confirmation status of a transaction on-chain."""
        args = {"txHash": tx_hash}
        if chain:
            args["chain"] = chain
        return self.call("get_transaction_status", args)

NorthveilClient = Northveil
