import os
import sys
import json
import hmac
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = int(os.getenv("PORT", 4000))
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "whsec_northveil_test_secret_998124")

class WebhookHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "ONLINE",
            "service": "Northveil Python Webhook Receiver",
            "port": PORT
        }).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        signature = self.headers.get("X-Northveil-Signature", "")

        # 1. Compute HMAC-SHA256
        expected_sig = "sha256=" + hmac.new(
            WEBHOOK_SECRET.encode("utf-8"),
            body_bytes,
            hashlib.sha256
        ).hexdigest()

        # 2. Constant time compare
        if not hmac.compare_digest(signature, expected_sig):
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid HMAC signature"}).encode("utf-8"))
            print(f"[!] Rejected unsigned webhook from {self.client_address[0]}")
            return

        # 3. Process Event
        try:
            event = json.loads(body_bytes.decode("utf-8"))
            print(f"\n[+] VERIFIED NORTHVEIL EVENT RECEIVED:")
            print(f"    Event ID:   {event.get('id')}")
            print(f"    Event Type: {event.get('type')}")
            print(f"    Payload:    {json.dumps(event.get('data', {}), indent=2)}")
        except Exception as e:
            print(f"[!] JSON Decode error: {e}")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True, "message": "Webhook processed"}).encode("utf-8"))

    def log_message(self, format, *args):
        return  # Suppress standard access logs

def main():
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print("=" * 60)
    print(f"⚡ Northveil Python Webhook Receiver running on port {PORT}")
    print(f"🔗 Endpoint: http://localhost:{PORT}/webhook")
    print(f"🔑 Secret:   {WEBHOOK_SECRET}")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Webhook server stopped.")

if __name__ == "__main__":
    main()
