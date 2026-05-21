import os
import requests
import json
import datetime

# トークン取得
def get_id_token(refresh_token):
    res = requests.post("https://api.jquants.com/v1/token/auth_refresh", params={"refreshtoken": refresh_token})
    return res.json()["idToken"]

def main():
    refresh_token = os.environ.get("REFRESH_TOKEN")
    id_token = get_id_token(refresh_token)
    headers = {"Authorization": f"Bearer {id_token}"}
    
    # 1. 本日の日付を取得（J-Quantsは平日のみデータがあります）
    target_date = datetime.date.today().strftime("%Y-%m-%d")
    
    # 2. 株価データ（プライス）を取得
    # ※今回はシンプルに全市場の価格を取得するAPIを呼び出します
    url = f"https://api.jquants.com/v1/prices/daily_quotes?date={target_date}"
    res = requests.get(url, headers=headers)
    
    if res.status_code != 200:
        print(f"データ取得失敗: {res.status_code}")
        return

    # 3. データを加工（本来はここでCAN SLIMの計算をしますが、まずは全データを取得）
    raw_data = res.json().get("daily_quotes", [])
    
    # アプリで表示しやすい形に整形（上位10件のみ抽出）
    formatted_stocks = []
    for s in raw_data[:10]:
        formatted_stocks.append({
            "code": s["Code"],
            "name": s.get("CompanyName", "不明"),
            "price": f"{s['Close']}円",
            "diff": "---", 
            "diffPct": "---",
            "yield": "---",
            "volMult": 1.0,
            "volText": "---",
            "eps": "---",
            "sales": "---",
            "sector": "---",
            "theme": "---"
        })
    
    data = {
        "lastUpdated": datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分'),
        "allTime": formatted_stocks,
        "yearToDate": []
    }
    
    # 4. 保存
    os.makedirs("public", exist_ok=True)
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print("本番データを保存しました！")

if __name__ == "__main__":
    main()
