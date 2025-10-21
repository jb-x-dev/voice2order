#!/usr/bin/env python3
"""
Import Platzl order history from jb-x Excel export into Voice2Order database
"""
import sys
import os
import json
from datetime import datetime
import openpyxl
from collections import defaultdict

def parse_excel(file_path):
    """Parse Excel file and extract order data"""
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    
    articles = {}
    
    # Column mapping based on actual Excel structure:
    # 0: Lieferant (e.g., "801798 PURO Hotelkosmetik GmbH")
    # 1: Artikelnr
    # 2: Artikelbezeichnung
    # 3: Kernsortiment
    # 4: Warengruppe
    # 5: Bestellnummer
    # 6: Bestelldatum
    # 7: Währung
    # 8: Menge
    # 9: Einheit
    # 10: Ø Einzelpreis
    # 11: Bestellvolumen
    
    # Skip header row
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:  # Skip empty rows
            continue
            
        try:
            # Extract supplier info (format: "ID Name")
            supplier_full = str(row[0]) if row[0] else "Unbekannt"
            supplier_parts = supplier_full.split(" ", 1)
            supplier_id = supplier_parts[0] if len(supplier_parts) > 0 else ""
            supplier_name = supplier_parts[1] if len(supplier_parts) > 1 else supplier_full
            
            article_id = str(row[1]) if row[1] else ""
            article_name = str(row[2]) if row[2] else ""
            kernsortiment = str(row[3]) if row[3] else ""
            warengruppe = str(row[4]) if row[4] else ""
            order_number = str(row[5]) if row[5] else ""
            order_date = row[6] if row[6] else None
            currency = str(row[7]) if row[7] else "EUR"
            quantity = float(row[8]) if row[8] else 0
            unit = str(row[9]) if row[9] else "STK"
            unit_price = float(row[10]) if row[10] else 0
            total_price = float(row[11]) if row[11] else 0
            
            # Skip if no valid date
            if not order_date or not isinstance(order_date, datetime):
                continue
            
            # Convert price to cents
            unit_price_cents = int(unit_price * 100)
            
            # Create unique article key
            article_key = f"{supplier_id}_{article_id}"
            
            if article_key not in articles:
                articles[article_key] = {
                    "articleId": article_id,
                    "articleName": article_name,
                    "supplier": supplier_name,
                    "supplierId": supplier_id,
                    "unit": unit,
                    "warengruppe": warengruppe,
                    "kernsortiment": kernsortiment,
                    "orders": [],
                    "total_quantity": 0,
                    "prices": []
                }
            
            articles[article_key]["orders"].append({
                "date": order_date.isoformat(),
                "quantity": quantity,
                "price": unit_price_cents,
                "order_number": order_number
            })
            articles[article_key]["total_quantity"] += quantity
            if unit_price_cents > 0:
                articles[article_key]["prices"].append(unit_price_cents)
                
        except Exception as e:
            print(f"Error processing row: {e}", file=sys.stderr)
            continue
    
    # Calculate statistics for each article
    result = []
    for article_key, data in articles.items():
        if not data["orders"]:
            continue
            
        # Sort orders by date
        data["orders"].sort(key=lambda x: x["date"])
        
        # Calculate average price
        if data["prices"]:
            avg_price = int(sum(data["prices"]) / len(data["prices"]))
        else:
            avg_price = 0
        
        result.append({
            "articleId": data["articleId"],
            "articleName": data["articleName"],
            "supplier": data["supplier"],
            "supplierId": data["supplierId"],
            "unit": data["unit"],
            "warengruppe": data["warengruppe"],
            "kernsortiment": data["kernsortiment"],
            "orderCount": len(data["orders"]),
            "totalQuantity": data["total_quantity"],
            "lastOrderDate": data["orders"][-1]["date"],
            "firstOrderDate": data["orders"][0]["date"],
            "avgPrice": avg_price,
            "lastPrice": data["orders"][-1]["price"] if data["orders"] else 0,
            "orders": data["orders"]
        })
    
    # Sort by order count (most ordered first)
    result.sort(key=lambda x: x["orderCount"], reverse=True)
    
    return result

def main():
    excel_file = "/home/ubuntu/Downloads/platzl_bestellungen_24m.xlsx"
    output_file = "/home/ubuntu/voice2order/scripts/platzl_orders_processed.json"
    
    print(f"Parsing Excel file: {excel_file}")
    articles = parse_excel(excel_file)
    
    print(f"Found {len(articles)} unique articles")
    print(f"Total orders: {sum(a['orderCount'] for a in articles)}")
    
    # Save to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    
    print(f"Saved processed data to: {output_file}")
    
    # Print top 10 articles
    print("\nTop 10 most ordered articles:")
    for i, article in enumerate(articles[:10], 1):
        print(f"{i}. {article['articleName']} ({article['supplier']})")
        print(f"   Orders: {article['orderCount']}, Total Qty: {article['totalQuantity']:.2f} {article['unit']}")
        print(f"   Last price: {article['lastPrice']/100:.2f} EUR")

if __name__ == "__main__":
    main()

