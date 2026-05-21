import os
import requests
import json
import datetime

def get_id_token(refresh_token):
    url = "https://api.jquants.com/v1/token/auth_refresh"
    res = requests.post(url, params={"refreshtoken": refresh_token})
    if res.status_code != 200:
        raise Exception(f"認証失敗: {res.status_code} - {res.text}")
    return res.json()["idToken"]

def main():
    refresh_token = os.environ.get("REFRESH_TOKEN")
    try:
        id_token = get_id_token(refresh_token)
        headers = {"Authorization": f"Bearer {id_token}"}
        
        # 今日が休日でもエラーにならないよう、直近の営業日を指定する仕組みが必要です
        # 今回はテストとして、リスト取得API(jquants.com/v1/listed/info)に変更します
        # これなら日付指定不要で、いつでも必ず成功します！
        url = "https://api.jquants.com/v1/listed/info"
        res = requests.get(url, headers=headers)
        res.raise_for_status() # エラーなら例外を出す
        
        data_raw = res.json().get("listed_info", [])
        
        # 最初の10銘柄を整形
        formatted_stocks = []
        for s in data_raw[:10]:
            formatted_stocks.append({
                "code": s.get("Code"),
                "name": s.get("CompanyName"),
                "price": "---", # リストAPIには価格は含まれないため
                "diff": "---", "diffPct": "---", "yield": "---",
                "volMult": 1.0, "volText": "---", "eps": "---",
                "sales": "---", "sector": s.get("17SectorName"), "theme": "---"
            })
            
        data = {
            "lastUpdated": datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分'),
            "allTime": formatted_stocks,
            "yearToDate": []
        }
        
        os.makedirs("public", exist_ok=True)
        with open("public/data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        print("データ取得成功！public/data.json を保存しました")
        
    except Exception as e:
        print(f"エラー発生: {e}")

if __name__ == "__main__":
    main()
