#!/usr/bin/env bash
# Trigger eval：用 pi -p 当评分员，测当前 description 的触发率
# 用法: bash evals/run-trigger-eval.sh [iter-tag]
#   iter-tag: 跑哪轮的描述，tag 跟 results 目录名挂钩（默认 "current"）

set -uo pipefail

ITER_TAG="${1:-current}"
EVAL_SET="/Users/henry/dev/2_skills/xhs-image-gen/evals/trigger-eval.json"
SKILL_DIR="/Users/henry/dev/2_skills/xhs-image-gen"
OUT_DIR="$SKILL_DIR/evals/results/$ITER_TAG"
mkdir -p "$OUT_DIR"

# 读当前 description
DESC=$(python3 -c "
import re
with open('$SKILL_DIR/SKILL.md', 'r') as f:
    content = f.read()
m = re.search(r'description:\s*>\s*\n((?:[ \t]+.*\n)+)', content)
if m:
    print(m.group(1).strip())
")
echo "=== 当前 description ==="
echo "$DESC"
echo ""
echo "=== 跑 trigger eval，输出到 $OUT_DIR ==="
echo ""

# 读所有 query
TOTAL=$(python3 -c "import json; print(len(json.load(open('$EVAL_SET'))))")

for i in $(seq 0 $((TOTAL-1))); do
    QUERY=$(python3 -c "import json; print(json.load(open('$EVAL_SET'))[$i]['query'])")
    EXPECTED=$(python3 -c "import json; print(json.load(open('$EVAL_SET'))[$i]['should_trigger'])")
    QUERY_FILE="$OUT_DIR/query-${i}-raw.txt"
    RESULT_FILE="$OUT_DIR/query-${i}-result.txt"

    # 构造 prompt：让 pi 模拟 Claude Code agent，看到这个 description + query，
    # 决定是否触发 skill。回答 yes/no。
    PROMPT="You are simulating a Claude Code agent deciding whether to invoke a skill.
The skill 'xhs-image-gen' has this description:

---
$DESC
---

User query: $QUERY

Would you invoke this skill to handle the query? Answer with exactly one word: 'yes' or 'no' (lowercase, no other text)."

    # 跑 pi -p；用 grep -o 抓第一个 yes/no
    PI_OUTPUT=$(pi -p --mode text --no-session "$PROMPT" 2>/dev/null)
    TRIGGERED=$(echo "$PI_OUTPUT" | grep -oiE '\b(yes|no)\b' | head -1 | tr '[:upper:]' '[:lower:]')
    if [[ -z "$TRIGGERED" ]]; then
        TRIGGERED="UNCLEAR"
    fi

    # 判断对错
    if [[ "$EXPECTED" == "True" ]]; then
        EXPECTED_LABEL="T"
    else
        EXPECTED_LABEL="F"
    fi

    if [[ "$TRIGGERED" == "yes" ]]; then
        ACTUAL_LABEL="T"
    elif [[ "$TRIGGERED" == "no" ]]; then
        ACTUAL_LABEL="F"
    else
        ACTUAL_LABEL="?"
    fi

    if [[ "$EXPECTED_LABEL" == "$ACTUAL_LABEL" ]]; then
        STATUS="✓"
    else
        STATUS="✗"
    fi

    printf "  %s [%s→%s] q%-2d  %s\n" "$STATUS" "$EXPECTED_LABEL" "$ACTUAL_LABEL" "$i" "${QUERY:0:60}"
    echo "$TRIGGERED" > "$RESULT_FILE"
done

# 汇总
echo ""
echo "=== 汇总 ==="
python3 << EOF
import json, os
results_dir = "${OUT_DIR}"
with open('${EVAL_SET}') as f:
    items = json.load(f)
total = len(items)
correct = 0
true_pos, false_pos, true_neg, false_neg = 0, 0, 0, 0
print(f"  query    expected  actual   query-text")
print(f"  -------  --------  -------  --------")
for i, item in enumerate(items):
    rfile = f"{results_dir}/query-{i}-result.txt"
    actual = open(rfile).read().strip() if os.path.exists(rfile) else "?"
    expected_trigger = item['should_trigger']
    actual_trigger = (actual == "yes")
    ok = (expected_trigger == actual_trigger)
    if ok: correct += 1
    if expected_trigger and actual_trigger: true_pos += 1
    elif not expected_trigger and actual_trigger: false_pos += 1
    elif expected_trigger and not actual_trigger: false_neg += 1
    else: true_neg += 1
    e = "T" if expected_trigger else "F"
    a = "T" if actual_trigger else "F"
    s = "✓" if ok else "✗"
    print(f"  {s} q{i:<5}  {e:^8}  {a:^7}  {item['query'][:55]}")
print()
print(f"  准确率: {correct}/{total} = {correct*100//total}%")
print(f"  TP={true_pos}  FP={false_pos}  FN={false_neg}  TN={true_neg}")
print(f"  漏触发 (FN): {false_neg} 条")
print(f"  误触发 (FP): {false_pos} 条")
EOF
