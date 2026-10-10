"""
HRDocForensics — Evaluation Script.

Runs the pipeline against a dataset of PDFs to generate evaluation metrics
for accuracy, false positive rate, and token usage cost.

Usage:
  python scripts/eval.py --dataset path/to/dataset.json
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from tqdm import tqdm

from app.core.config import get_settings
from app.core.pipeline import analyze_document

logging.basicConfig(level=logging.WARNING)

def run_eval(dataset_path: str):
    dataset_file = Path(dataset_path)
    if not dataset_file.exists():
        print(f"Error: Dataset {dataset_path} not found.")
        sys.exit(1)

    with open(dataset_file, "r") as f:
        dataset = json.load(f)
        
    print(f"Loaded {len(dataset)} evaluation cases.")
    
    results = []
    total_cost = 0.0
    correct_verdicts = 0
    false_positives = 0
    false_negatives = 0

    settings = get_settings()
    
    for case in tqdm(dataset):
        pdf_path = Path(case["pdf_path"])
        if not pdf_path.exists():
            print(f"\nSkipping missing file: {pdf_path}")
            continue
            
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        try:
            t0 = time.time()
            res = analyze_document(
                pdf_bytes, 
                context=case.get("context"), 
                counter_offer_inputs=case.get("counter_offer_inputs")
            )
            elapsed = time.time() - t0
            
            # Extract metrics
            score = res["verdict"]["authenticity_score"]
            predicted_fake = score < 5.0
            actual_fake = case["is_fake"]
            
            if predicted_fake == actual_fake:
                correct_verdicts += 1
            elif predicted_fake and not actual_fake:
                false_positives += 1
            elif not predicted_fake and actual_fake:
                false_negatives += 1
                
            cost = res["usage"].get("estimated_cost_usd", 0.0)
            total_cost += cost
            
            results.append({
                "case_id": case.get("id"),
                "predicted_score": score,
                "actual_fake": actual_fake,
                "predicted_fake": predicted_fake,
                "cost_usd": cost,
                "elapsed_sec": elapsed
            })
            
        except Exception as e:
            print(f"\nError processing {pdf_path.name}: {e}")
            
    print("\n--- Evaluation Results ---")
    print(f"Total Cases: {len(results)}")
    
    if len(results) > 0:
        accuracy = correct_verdicts / len(results) * 100
        print(f"Accuracy: {accuracy:.1f}%")
        print(f"False Positives: {false_positives}")
        print(f"False Negatives: {false_negatives}")
        print(f"Total Cost: ${total_cost:.4f}")
        print(f"Avg Cost per doc: ${total_cost/len(results):.4f}")
        
    # Save output
    out_path = dataset_file.with_name(f"eval_results_{int(time.time())}.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved detailed results to {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate HRDocForensics pipeline")
    parser.add_argument("--dataset", required=True, help="Path to JSON dataset file")
    args = parser.parse_args()
    
    # Needs to be run from the HRDocForensics dir for imports to work
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    run_eval(args.dataset)
