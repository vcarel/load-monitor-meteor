#!/bin/bash
# From MirceaKitsune, http://stackoverflow.com/a/22237340/1202385

# Simple CPU stress test script

# Read the user's input
echo -n "Number of CPU threads to test: "
read cpu_threads
echo -n "Duration of the test (in seconds): "
read cpu_time

# Run an endless loop on each thread to generate 100% CPU
echo -e "\E[32mStressing ${cpu_threads} threads for ${cpu_time} seconds...\E[37m"
for i in $(seq ${cpu_threads}); do
    let thread=${i}-1
    (taskset -cp ${thread} $BASHPID; while true; do true; done) &
done

# Once the time runs out, kill all of the loops
sleep ${cpu_time}
echo -e "\E[32mStressing complete.\E[37m"
kill 0
