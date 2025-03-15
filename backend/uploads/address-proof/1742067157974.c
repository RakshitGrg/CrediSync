#include <stdio.h>
#include <stdbool.h>

#define MAX_BLOCKS 10
#define MAX_PROCESSES 10

void firstFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    for (int i = 0; i < n; i++) allocation[i] = -1;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                allocation[i] = j;
                blockSize[j] -= processSize[i];
                break;
            }
        }
    }
    printf("First Fit Allocation:\n");
    for (int i = 0; i < n; i++) {
        printf("Process %d -> Block %d\n", i + 1, allocation[i] + 1);
    }
}

void bestFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    for (int i = 0; i < n; i++) allocation[i] = -1;

    for (int i = 0; i < n; i++) {
        int bestIdx = -1;
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                if (bestIdx == -1 || blockSize[j] < blockSize[bestIdx]) {
                    bestIdx = j;
                }
            }
        }
        if (bestIdx != -1) {
            allocation[i] = bestIdx;
            blockSize[bestIdx] -= processSize[i];
        }
    }
    printf("Best Fit Allocation:\n");
    for (int i = 0; i < n; i++) {
        printf("Process %d -> Block %d\n", i + 1, allocation[i] + 1);
    }
}

void worstFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    for (int i = 0; i < n; i++) allocation[i] = -1;

    for (int i = 0; i < n; i++) {
        int worstIdx = -1;
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                if (worstIdx == -1 || blockSize[j] > blockSize[worstIdx]) {
                    worstIdx = j;
                }
            }
        }
        if (worstIdx != -1) {
            allocation[i] = worstIdx;
            blockSize[worstIdx] -= processSize[i];
        }
    }
    printf("Worst Fit Allocation:\n");
    for (int i = 0; i < n; i++) {
        printf("Process %d -> Block %d\n", i + 1, allocation[i] + 1);
    }
}

void nextFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    for (int i = 0; i < n; i++) allocation[i] = -1;
    int lastAllocated = 0;

    for (int i = 0; i < n; i++) {
        int j = lastAllocated;
        bool allocated = false;
        do {
            if (blockSize[j] >= processSize[i]) {
                allocation[i] = j;
                blockSize[j] -= processSize[i];
                lastAllocated = j;
                allocated = true;
                break;
            }
            j = (j + 1) % m;
        } while (j != lastAllocated);
    }
    printf("Next Fit Allocation:\n");
    for (int i = 0; i < n; i++) {
        printf("Process %d -> Block %d\n", i + 1, allocation[i] + 1);
    }
}

int main() {
    int blockSize[MAX_BLOCKS] = {100, 500, 200, 300, 600};
    int processSize[MAX_PROCESSES] = {212, 417, 112, 426};
    int m = 5, n = 4;

    int blockCopy[MAX_BLOCKS];
    
    for (int i = 0; i < m; i++) blockCopy[i] = blockSize[i];
    firstFit(blockCopy, m, processSize, n);

    for (int i = 0; i < m; i++) blockCopy[i] = blockSize[i];
    bestFit(blockCopy, m, processSize, n);

    for (int i = 0; i < m; i++) blockCopy[i] = blockSize[i];
    worstFit(blockCopy, m, processSize, n);

    for (int i = 0; i < m; i++) blockCopy[i] = blockSize[i];
    nextFit(blockCopy, m, processSize, n);

    return 0;
}