# run parse_log.py simualtaneously on all user ids
# Usage: ./run_parse_log.sh
conda activate robosuite

for i in {01..42};
do
    echo "U$i"
    nohup python parse_log.py --user_id "U$i" > "log/U$i.log" 2>&1 &
done
