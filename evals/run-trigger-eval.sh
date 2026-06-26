#!/usr/bin/env bash
# Trigger eval 多数投票版：每个 query 跑 N 次（默认 3），取多数结果
# 用法:
#   bash evals/run-trigger-eval-majority.sh <iter-tag> [runs-per-query]
#   EVAL_LLM_CMD="claude -p" bash evals/run-trigger-eval-majority.sh iter-x

set -uo pipefail

ITER_TAG="${1:-current}"
RUNS_PER_QUERY="${2:-3}"
SKILL_DIR="${SKILL_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
EVAL_SET="${EVAL_SET:-$SKILL_DIR/evals/trigger-eval.json}"
OUT_DIR="$SKILL_DIR/evals/results/$ITER_TAG"
EVAL_LLM_CMD="${EVAL_LLM_CMD:-pi -p --mode text --no-session}"

mkdir -p "$OUT_DIR"

echo "=== iter: $ITER_TAG | runs/query: $RUNS_PER_QUERY | llm: $EVAL_LLM_CMD ==="
echo ""

# 读 description
DESC=$(python3 -c "
import re
with open('$SKILL_DIR/SKILL.md', 'r') as f:
    content = f.read()
m = re.search(r'description:\s*>\s*\n((?:[ \t]+.*\n)+)', content)
print(m.group(1).strip() if m else 'NO MATCH')
")

TOTAL=$(python3 -c "import json; print(len(json.load(open('$EVAL_SET'))))")

for i in $(seq 0 $((TOTAL-1))); do
    QUERY=$(python3 -c "import json; print(json.load(open('$EVAL_SET'))[$i]['query'])")
    EXPECTED=$(python3 -c "import json; print(json.load(open('$EVAL_SET'))[$i]['should_trigger'])")

    PROMPT="IMPORTANT: You are a yes/no classifier. Do NOT call any tools. Do NOT read or write any files. Do NOT run any commands. Just answer with one word.

You are simulating a Claude Code agent deciding whether to invoke a skill.
The skill 'xhs-image-gen' has this description:

---
$DESC
---

User query: $QUERY

Would you invoke this skill to handle the query? Answer with exactly one word: 'yes' or 'no' (lowercase, no other text)."

    eval "CMD_ARGS=( $EVAL_LLM_CMD )"

    yes_count=0
    no_count=0
    unclear_count=0

    for r in $(seq 1 $RUNS_PER_QUERY); do
        LLM_OUTPUT=$("${CMD_ARGS[@]}" "$PROMPT" 2>/dev/null) || LLM_OUTPUT=""
        RESULT=$(echo "$LLM_OUTPUT" | grep -oiE '^(yes|no)[\.\s]*$' | head -1 | tr -d '[:space:].' | tr '[:upper:]' '[:lower:]')
        if [[ -z "$RESULT" ]]; then
            RESULT=$(echo "$LLM_OUTPUT" | grep -oiE '(yes|no)' | head -1 | tr '[:upper:]' '[:lower:]')
        fi
        if [[ "$RESULT" == "yes" ]]; then
            yes_count=$((yes_count+1))
        elif [[ "$RESULT" == "no" ]]; then
            no_count=$((no_count+1))
        else
            unclear_count=$((unclear_count+1))
        fi
    done

    # 多数投票（UNCLEAR 票不参与多数）
    if [[ $yes_count -gt $no_count ]]; then
        TRIGGERED="yes"
    elif [[ $no_count -gt $yes_count ]]; then
        TRIGGERED="no"
    else
        TRIGGERED="UNCLEAR"
    fi

    # 写最终结果
    echo "$TRIGGERED" > "$OUT_DIR/query-${i}-result.txt"
    echo "$yes_count,$no_count,$unclear_count" > "$OUT_DIR/query-${i}-votes.txt"

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

    printf "  %s [%s→%s] y=%d n=%d u=%d  q%-2d  %s\n" \
        "$STATUS" "$EXPECTED_LABEL" "$ACTUAL_LABEL" "$yes_count" "$no_count" "$unclear_count" \
        "$i" "${QUERY:0:50}"
done

echo ""
echo "=== 汇总（多数投票）==="
python3 << EOF
import json, os
results_dir = "${OUT_DIR}"
with open('${EVAL_SET}') as f:
    items = json.load(f)
total = len(items)
correct = 0
true_pos, false_pos, true_neg, false_neg, unclear_total = 0, 0, 0, 0, 0
for i, item in enumerate(items):
    rfile = f"{results_dir}/query-{i}-result.txt"
    if os.path.exists(rfile):
        actual = open(rfile).read().strip()
    else:
        actual = "?"
    vfile = f"{results_dir}/query-{i}-votes.txt"
    votes = open(vfile).read().strip() if os.path.exists(vfile) else "0,0,0"
    expected_trigger = item['should_trigger']
    actual_trigger = (actual == "yes")
    if expected_trigger and actual_trigger: true_pos += 1; correct += 1
    elif not expected_trigger and actual_trigger: false_pos += 1
    elif expected_trigger and not actual_trigger: false_neg += 1
    elif not expected_trigger and not actual_trigger: true_neg += 1; correct += 1
    if actual == "UNCLEAR": unclear_total += 1
print(f"  准确率: {correct}/{total} = {correct*100//total}%")
print(f"  TP={true_pos}  FP={false_pos}  FN={false_neg}  TN={true_neg}  UNCLEAR={unclear_total}")
print(f"  漏触发 (FN): {false_neg} 条")
print(f"  误触发 (FP): {false_pos} 条")
EOF
