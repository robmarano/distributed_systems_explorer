import socket
import threading
import time
import sys

HOST = '127.0.0.1'
PORT = 65432

def run_server():
    name = "Server"
    print(f"[{name}] Starting TCP Server on {HOST}:{PORT}...", flush=True)
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Allow address reuse to avoid "Address already in use" errors on restart
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOST, PORT))
        s.listen()
        print(f"[{name}] Listening for connections...", flush=True)
        
        # Accept one client for this demo
        conn, addr = s.accept()
        with conn:
            print(f"[{name}] Connected by {addr}", flush=True)
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                decoded = data.decode()
                print(f"[{name}] Received: {decoded}", flush=True)
                
                # Process data
                response = f"ACK: {decoded}"
                time.sleep(1) # Simulate network/processing delay
                
                print(f"[{name}] Sending response: {response}", flush=True)
                conn.sendall(response.encode())
    
    print(f"[{name}] Server shutting down.", flush=True)

def run_client():
    # Give server a moment to start
    time.sleep(1)
    name = "Client"
    print(f"[{name}] Connecting to {HOST}:{PORT}...", flush=True)
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((HOST, PORT))
            
            messages = ["Hello", "Distributed", "Systems"]
            
            for msg in messages:
                print(f"[{name}] Sending: {msg}", flush=True)
                s.sendall(msg.encode())
                
                data = s.recv(1024)
                print(f"[{name}] Received: {data.decode()}", flush=True)
                time.sleep(1)
                
    except ConnectionRefusedError:
        print(f"[{name}] Connection refused. Is server running?", flush=True)
    except Exception as e:
        print(f"[{name}] Error: {e}", flush=True)

if __name__ == "__main__":
    print("[System] Starting TCP Socket Demonstration...", flush=True)
    
    # We will run server and client in threads to simulate separate nodes 
    # within this single script for demonstration purposes.
    # In a real scenario, these would be on separate machines.
    
    server_thread = threading.Thread(target=run_server)
    server_thread.start()
    
    client_thread = threading.Thread(target=run_client)
    client_thread.start()
    
    server_thread.join()
    client_thread.join()
    
    print("[System] Demonstration Complete.", flush=True)
