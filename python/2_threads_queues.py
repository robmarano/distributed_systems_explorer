import threading
import queue
import time
import random

# A thread-safe queue for communication between producer and consumer
work_queue = queue.Queue()

def producer(thread_id):
    name = f"Producer-{thread_id}"
    print(f"[{name}] Started.", flush=True)
    
    for i in range(3):
        item = f"Task-{thread_id}-{i}"
        print(f"[{name}] Producing {item}...", flush=True)
        
        # Simulate work to produce item
        time.sleep(random.uniform(0.5, 1.0))
        
        work_queue.put(item)
        print(f"[{name}] Put {item} into queue. Queue size: {work_queue.qsize()}", flush=True)
    
    print(f"[{name}] Finished producing.", flush=True)

def consumer(thread_id):
    name = f"Consumer-{thread_id}"
    print(f"[{name}] Started. Waiting for work...", flush=True)
    
    while True:
        try:
            # Get item with a timeout so we can exit if finished
            item = work_queue.get(timeout=3)
            print(f"[{name}] Got {item} from queue.", flush=True)
            
            # Simulate processing time
            time.sleep(random.uniform(0.8, 1.5))
            
            print(f"[{name}] Finished {item}.", flush=True)
            work_queue.task_done()
        except queue.Empty:
            print(f"[{name}] Queue empty for 3s. Exiting.", flush=True)
            break

if __name__ == "__main__":
    print("[System] Starting Multi-threaded Queue Demonstration...", flush=True)
    
    threads = []
    
    # Start Consumers
    for i in range(2):
        t = threading.Thread(target=consumer, args=(i+1,))
        threads.append(t)
        t.start()
        
    # Start Producers
    for i in range(2):
        t = threading.Thread(target=producer, args=(i+1,))
        threads.append(t)
        t.start()
        
    # Wait for all threads
    for t in threads:
        t.join()
        
    print("[System] Demonstration Complete.", flush=True)
