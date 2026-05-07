import os
import sys
# Add current dir to path
sys.path.append(os.path.abspath("."))

from report_generator import generate_user_report

def test_report():
    user_id = 5
    print(f"Testing report generation for User ID: {user_id}...")
    filename = generate_user_report(user_id)
    if filename:
        print(f"SUCCESS! Report generated: {filename}")
        report_path = os.path.join("reports", filename)
        if os.path.exists(report_path):
            print(f"File exists at: {os.path.abspath(report_path)}")
        else:
            print("ERROR: Filename returned but file NOT found in reports directory!")
    else:
        print("FAILURE: generate_user_report returned None.")

if __name__ == "__main__":
    test_report()
