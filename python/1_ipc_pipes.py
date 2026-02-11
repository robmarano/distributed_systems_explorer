import multiprocessing
import time
import sys
import os

def child_process(conn):
    """
    Function run by the child process.
    It waits for data from the parent, processes it, and sends a response.
    """
    name = f"Child-{os.getpid()}"
    print(f"[{name}] Process started. Waiting for data...", flush=True)
    
    try:
        # Blocking call to receive data
        msg = conn.recv()
        print(f"[{name}] Received: {msg}", flush=True)
        
        # Simulate processing time
        time.sleep(1.5)
        
        response = f"Processed '{msg}' by {name}"
        print(f"[{name}] Sending response: {response}", flush=True)
        conn.send(response)
        
        conn.close()
        print(f"[{name}] Connection closed. Exiting.", flush=True)
    except Exception as e:
        print(f"[{name}] Error: {e}", flush=True)

def parent_process():
    """
    Function run by the parent process.
    It creates a pipe, spawns a child, sends data, and waits for response.
    """
    name = f"Parent-{os.getpid()}"
    print(f"[{name}] Process started.", flush=True)
    
    # Create a pipe. parent_conn is for the parent, child_conn for the child.
    # Duplex=True means data can flow both ways.
    parent_conn, child_conn = multiprocessing.Pipe(duplex=True)
    
    print(f"[{name}] Spawning child process...", flush=True)
    p = multiprocessing.Process(target=child_process, args=(child_conn,))
    p.start()
    
    # We must close the child_conn in the parent so that if the child closes it,
    # we don't hold it open (though less critical in this simple sync example).
    # However, we can't close it yet if we passed it as an arg? 
    # Actually, the Process object pickles the args, so it's safe to close local handle if we wanted,
    # but we'll leave it simple.
    
    time.sleep(1)
    data_to_send = "Hello Distributed World!"
    print(f"[{name}] Sending data via Pipe: {data_to_send}", flush=True)
    parent_conn.send(data_to_send)
    
    print(f"[{name}] Waiting for response...", flush=True)
    if parent_conn.poll(timeout=5):
        response = parent_conn.recv()
        print(f"[{name}] Received response: {response}", flush=True)
    else:
        print(f"[{name}] Timed out waiting for response.", flush=True)
        
    print(f"[{name}] Joining child process...", flush=True)
    p.join()
    print(f"[{name}] Child joined. Exiting.", flush=True)

if __name__ == "__main__":
    # Flush stdout immediately for real-time visualization in the web app
    print("[System] Starting IPC Pipe Demonstration...", flush=True)
    parent_process()
    print("[System] Demonstration Complete.", flush=True)
