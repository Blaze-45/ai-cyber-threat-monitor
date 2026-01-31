import pandas as pd
import os

# 1. Load the Data
file_path = 'traffic_dataset.csv'

if not os.path.exists(file_path):
    print("❌ Error: traffic_dataset.csv not found in this folder.")
    exit()

df = pd.read_csv(file_path)

# 2. General Stats
total_rows = len(df)
print(f"📊 DATASET AUDIT REPORT")
print(f"=======================")
print(f"Total Entries: {total_rows}")
print(f"Columns: {list(df.columns)}")
print("-" * 30)

# 3. Check Balance (The most important part)
print("\n⚖️  THREAT LEVEL BALANCE (Target: ~25% each)")
distribution = df['threat_level'].value_counts()
percentages = df['threat_level'].value_counts(normalize=True) * 100

for level in distribution.index:
    count = distribution[level]
    pct = percentages[level]
    print(f"   - {level.upper():<10}: {count} rows ({pct:.2f}%)")

# 4. Check Website Distribution
print("\n🌐  WEBSITE COVERAGE (Target: ~20% each)")
site_dist = df['website_id'].value_counts(normalize=True) * 100
for site_id in sorted(site_dist.index):
    print(f"   - Site ID {site_id}: {site_dist[site_id]:.2f}%")

# 5. Check Feature Integrity
print("\n🔍  FEATURE CHECKS")
print(f"   - Max Requests: {df['requests'].max()}")
print(f"   - Max Error Rate: {df['error_rate'].max()}")
print(f"   - Null Values: {df.isnull().sum().sum()}")

print("\n✅ Audit Complete.")