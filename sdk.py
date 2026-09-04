import os
import sys
import json
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure local python-sdk is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "python-sdk"))

import northveil
from northveil import Northveil, NorthveilException

def print_header(title: str):
    print("\n" + "=" * 70)
    print(f"  [+] {title.upper()}")
    print("=" * 70)

def main():
    print("""
+---------------------------------------------------------------+
|                   NORTHVEIL PYTHON HUB                        |
|         Non-Custodial Agent Wallet & MCP Protocol             |
+---------------------------------------------------------------+
    """)

    # Initialize the Northveil Non-Custodial Client
    api_key = os.getenv("NORTHVEIL_API_KEY", "nv_live_sample_key")
    wallet_address = os.getenv("NORTHVEIL_WALLET_ADDRESS", "0x0000000000000000000000000000000000000000")
    client = Northveil(
        api_key=api_key,
        wallet_address=wallet_address
    )

    print(f"[*] Northveil SDK Version: {northveil.__version__}")
    print(f"[*] Gateway Connected:     {client.base_url}")

    # -----------------------------------------------------------------
    # MODULE 1: AUTHENTICATION & IDENTITY VERIFICATION
    # -----------------------------------------------------------------
    print_header("Module 1: Authenticated Identity & Permissions")
    try:
        identity = client.whoami()
        print(f"[*] Account User ID:   {identity.get('userId')}")
        print(f"[*] Key Identifier:    {identity.get('keyName')}")
        print(f"[*] Access Tier:       {str(identity.get('tier', 'Developer')).upper()}")
        print(f"[*] Bound Wallet:      {identity.get('walletAddress')}")
        print(f"[*] Allowed Wallets:   {', '.join(identity.get('allowedWallets', []))}")
    except NorthveilException as e:
        print(f"[!] Auth Notice: {e}")

    # -----------------------------------------------------------------
    # MODULE 2: DISCOVER AVAILABLE MCP TOOLS
    # -----------------------------------------------------------------
    print_header("Module 2: MCP Tools Discovery")
    try:
        tools = client.list_tools()
        print(f"[+] Found {len(tools)} Available MCP Tools:")
        for t in tools[:5]:
            print(f"  * {t.get('name'):<25}: {t.get('description', '')[:60]}...")
    except Exception as e:
        print(f"[!] Tools Notice: {e}")

    # -----------------------------------------------------------------
    # MODULE 3: MULTI-CHAIN PORTFOLIO VALUATION
    # -----------------------------------------------------------------
    print_header("Module 3: Multi-Chain Portfolio Valuation")
    try:
        portfolio = client.get_portfolio()
        print(f"[+] Portfolio Result:")
        print(json.dumps(portfolio, indent=2))
    except Exception as e:
        print(f"[!] Portfolio Notice: {e}")

    # -----------------------------------------------------------------
    # MODULE 4: STAGING NON-CUSTODIAL TRANSFER INTENT
    # -----------------------------------------------------------------
    print_header("Module 4: Staging Non-Custodial Transfer Intent")
    try:
        staged = client.prepare_transfer(
            to="0x000000000000000000000000000000000000dead",
            amount="0.01",
            chain="eip155:8453",
            asset="ETH"
        )
        print(f"[*] Status:       {staged.get('status')}")
        print(f"[*] Request ID:   {staged.get('requestId')}")
        if staged.get("approveUrl"):
            print(f"[!] Passkey Confirmation Required: {staged.get('approveUrl')}")
        elif staged.get("txHash"):
            print(f"[+] Executed autonomously! TxHash: {staged.get('txHash')}")
    except Exception as e:
        print(f"[!] Stage Notice: {e}")

    print("\n[+] NORTHVEIL NON-CUSTODIAL MCP CLIENT DEMO COMPLETE!\n")

if __name__ == "__main__":
    main()
