class DeadlockDetector:
    def __init__(self, processes, resources, allocation, request):
        self.processes = processes  # List of processes
        self.resources = resources  # List of available resources
        self.allocation = allocation  # Current allocation matrix
        self.request = request  # Request matrix
        self.work = self.resources[:]  # Work vector
        self.finish = [False] * len(processes)  # Finish vector
    
    def is_safe(self):
        safe_sequence = []
        while True:
            found = False
            for i in range(len(self.processes)):
                if not self.finish[i] and all(self.request[i][j] <= self.work[j] for j in range(len(self.resources))):
                    safe_sequence.append(self.processes[i])
                    self.work = [self.work[j] + self.allocation[i][j] for j in range(len(self.resources))]
                    self.finish[i] = True
                    found = True
                    break
            if not found:
                break
        return all(self.finish), safe_sequence

    def detect_deadlock(self):
        safe, sequence = self.is_safe()
        if not safe:
            print("Deadlock detected! The system is in an unsafe state.")
        else:
            print(f"No deadlock detected. Safe sequence: {' -> '.join(sequence)}")